import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dirname, resolve } from 'node:path'
import process from 'node:process'

import type { Plugin } from 'vite'

type NextFunction = (error?: unknown) => void

type Role = 'owner' | 'admin' | 'viewer'

interface StoredUser {
  id: string
  name: string
  email: string
  role: Role
  salt: string
  passwordHash: string
  createdAt: string
}

interface PublicUser {
  id: string
  name: string
  email: string
  role: Role
}

interface Session {
  userId: string
  expiresAt: number
}

interface ErrorWithStatus extends Error {
  status?: number
}

/**
 * Local authentication service for development, preview and E2E.
 *
 * It exists so the template boots with a real HTTP auth flow (token, `/auth/me`,
 * profile and password endpoints) instead of a mocked Axios module — the same code
 * path a production backend takes. It is NOT a production auth server: see the
 * security notes in `docs/architecture.md` §7.
 */
const DATA_FILE = resolve(process.cwd(), '.data', 'auth-users.json')
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Demo accounts, one per role. Keep in sync with `src/constants/demoAccounts.ts`
 * (the login page renders them as one-click fill buttons).
 */
const DEMO_USERS: { name: string; email: string; password: string; role: Role }[] = [
  { name: '陈思远', email: 'owner@aurora.dev', password: 'AuroraOwner123!', role: 'owner' },
  { name: '林浅', email: 'admin@aurora.dev', password: 'AuroraAdmin123!', role: 'admin' },
  { name: '吴迪', email: 'viewer@aurora.dev', password: 'AuroraViewer123!', role: 'viewer' },
]

const sessions = new Map<string, Session>()

let users: StoredUser[] | undefined

function loadUsers(): StoredUser[] {
  if (users) return users

  if (!existsSync(DATA_FILE)) {
    users = []
    return users
  }

  try {
    const parsed: unknown = JSON.parse(readFileSync(DATA_FILE, 'utf8'))
    users = Array.isArray(parsed) ? (parsed as StoredUser[]) : []
  } catch (error) {
    console.error('[aurora-admin-mock] Failed to read .data/auth-users.json', error)
    users = []
  }

  return users
}

function saveUsers(): void {
  mkdirSync(dirname(DATA_FILE), { recursive: true })
  writeFileSync(DATA_FILE, `${JSON.stringify(loadUsers(), null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  })
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return { salt, passwordHash: scryptSync(password, salt, 64).toString('hex') }
}

function verifyPassword(password: string, user: StoredUser): boolean {
  const expected = Buffer.from(user.passwordHash, 'hex')
  const actual = scryptSync(password, user.salt, 64)

  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function assertValidName(value: string): string {
  const name = value.trim()
  if (name.length < 2 || name.length > 40) {
    throw Object.assign(new Error('Name must be between 2 and 40 characters.'), { status: 400 })
  }
  return name
}

function assertValidPassword(value: string): string {
  if (value.length < 8 || value.length > 128) {
    throw Object.assign(new Error('Password must be between 8 and 128 characters.'), {
      status: 400,
    })
  }
  return value
}

function ensureDemoUsers(): void {
  const list = loadUsers()
  let changed = false

  for (const demo of DEMO_USERS) {
    if (list.some((user) => user.email === demo.email)) continue

    const { salt, passwordHash } = hashPassword(demo.password)
    list.push({
      id: `usr_${randomBytes(8).toString('hex')}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    })
    changed = true
  }

  if (changed) saveUsers()
}

function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS })
  return token
}

function getSession(token: string): { token: string; userId: string } | null {
  const session = sessions.get(token)
  if (!session) return null

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token)
    return null
  }

  return { token, userId: session.userId }
}

function revokeUserSessions(userId: string): void {
  for (const [token, session] of sessions) {
    if (session.userId === userId) sessions.delete(token)
  }
}

function getBearerToken(request: IncomingMessage): string | null {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) return null

  return header.slice('Bearer '.length).trim() || null
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload)
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(body)
}

function sendNoContent(response: ServerResponse): void {
  response.statusCode = 204
  response.setHeader('Cache-Control', 'no-store')
  response.end()
}

function sendError(response: ServerResponse, status: number, message: string): void {
  sendJson(response, status, { message })
}

function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolveBody, rejectBody) => {
    const chunks: Buffer[] = []
    let size = 0

    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 1_000_000) {
        rejectBody(Object.assign(new Error('Request body too large.'), { status: 413 }))
        return
      }
      chunks.push(chunk)
    })

    request.on('end', () => {
      if (chunks.length === 0) {
        rejectBody(Object.assign(new Error('Request body is required.'), { status: 400 }))
        return
      }

      try {
        const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Request body must be a JSON object.')
        }
        resolveBody(parsed as Record<string, unknown>)
      } catch (error) {
        rejectBody(
          Object.assign(error instanceof Error ? error : new Error('Invalid JSON body.'), {
            status: 400,
          }),
        )
      }
    })

    request.on('error', rejectBody)
  })
}

function requireString(body: Record<string, unknown>, key: string): string {
  const value = body[key]
  if (typeof value !== 'string') {
    throw Object.assign(new Error(`${key} must be a string.`), { status: 400 })
  }
  return value
}

function findCurrentUser(request: IncomingMessage): { user: StoredUser; token: string } | null {
  const token = getBearerToken(request)
  if (!token) return null

  const session = getSession(token)
  if (!session) return null

  const user = loadUsers().find((candidate) => candidate.id === session.userId)
  return user ? { user, token } : null
}

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  const url = new URL(request.url ?? '/', 'http://localhost')
  const path = url.pathname

  if (path === '/api/health') {
    sendJson(response, 200, {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    })
    return true
  }

  if (!path.startsWith('/api/auth/')) return false

  if (request.method === 'POST' && path === '/api/auth/login') {
    const body = await readJsonBody(request)
    const email = normalizeEmail(requireString(body, 'email'))
    const password = requireString(body, 'password')
    const user = loadUsers().find((candidate) => candidate.email === email)

    if (!user || !verifyPassword(password, user)) {
      sendError(response, 401, 'Email or password is incorrect.')
      return true
    }

    sendJson(response, 200, { token: createSession(user.id), user: toPublicUser(user) })
    return true
  }

  if (request.method === 'GET' && path === '/api/auth/me') {
    const current = findCurrentUser(request)
    if (!current) {
      sendError(response, 401, 'Authentication required.')
      return true
    }

    sendJson(response, 200, { user: toPublicUser(current.user) })
    return true
  }

  if (request.method === 'PATCH' && path === '/api/auth/profile') {
    const current = findCurrentUser(request)
    if (!current) {
      sendError(response, 401, 'Authentication required.')
      return true
    }

    const body = await readJsonBody(request)
    current.user.name = assertValidName(requireString(body, 'name'))
    saveUsers()
    sendJson(response, 200, { user: toPublicUser(current.user) })
    return true
  }

  if (request.method === 'PUT' && path === '/api/auth/password') {
    const current = findCurrentUser(request)
    if (!current) {
      sendError(response, 401, 'Authentication required.')
      return true
    }

    const body = await readJsonBody(request)
    const currentPassword = requireString(body, 'currentPassword')
    const newPassword = assertValidPassword(requireString(body, 'newPassword'))

    if (!verifyPassword(currentPassword, current.user)) {
      sendError(response, 400, 'Current password is incorrect.')
      return true
    }

    const { salt, passwordHash } = hashPassword(newPassword)
    current.user.salt = salt
    current.user.passwordHash = passwordHash
    saveUsers()
    revokeUserSessions(current.user.id)
    sendNoContent(response)
    return true
  }

  if (request.method === 'POST' && path === '/api/auth/logout') {
    const token = getBearerToken(request)
    if (token) sessions.delete(token)
    sendNoContent(response)
    return true
  }

  sendError(response, 404, 'Auth endpoint not found.')
  return true
}

function handleError(response: ServerResponse, error: unknown, next: NextFunction): void {
  const status = error && typeof error === 'object' ? (error as ErrorWithStatus).status : undefined
  if (typeof status === 'number') {
    sendError(response, status, error instanceof Error ? error.message : 'Request failed.')
    return
  }

  console.error('[aurora-admin-mock] Unhandled error', error)
  if (!response.headersSent) sendError(response, 500, 'Authentication service failed.')
  else next(error)
}

export function adminApiMockPlugin(): Plugin {
  const middleware = (request: IncomingMessage, response: ServerResponse, next: NextFunction) => {
    void handleRequest(request, response)
      .then((handled) => {
        if (!handled) next()
      })
      .catch((error: unknown) => handleError(response, error, next))
  }

  return {
    name: 'aurora-admin-api-mock',
    configureServer(server) {
      ensureDemoUsers()
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      ensureDemoUsers()
      server.middlewares.use(middleware)
    },
  }
}
