import { createSeedMembers } from '@/data/members'
import type { Member, MemberDraft } from '@/types/member'
import { memberListSchema } from '@/types/member'
import { localRepository } from './repository'

/**
 * Versioned storage key. A changed shape means a new key (and dropping the old
 * one), never an in-place migration layer — see `docs/engineering.md` §6.3.
 */
export const MEMBERS_STORAGE_KEY = 'aurora.members.v1'

function toEntity(draft: MemberDraft): Member {
  const timestamp = new Date().toISOString()

  return {
    ...draft,
    id: `mem_${crypto.randomUUID().slice(0, 8)}`,
    lastActiveAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function merge(current: Member, draft: MemberDraft): Member {
  return { ...current, ...draft, updatedAt: new Date().toISOString() }
}

/**
 * The single data source for the member slice.
 *
 * Bound to `localRepository` because the demo runs without a backend. Connecting
 * a real API is an adapter swap in this one line — the store does not change:
 *
 * ```ts
 * export const memberRepository = restRepository<Member, MemberDraft>({
 *   basePath: '/members',
 *   listSchema: memberListSchema,
 *   itemSchema: memberSchema,
 * })
 * ```
 *
 * Two consequences of that swap, both caught by the compiler rather than by
 * production: `replaceAll` (used by the demo reset) does not exist on a REST
 * adapter, and `read()` does not either, so the store starts empty until
 * `hydrate()` resolves. See `docs/data-adapters.md` §4.
 */
export const memberRepository = localRepository<Member, MemberDraft>({
  storageKey: MEMBERS_STORAGE_KEY,
  schema: memberListSchema,
  seed: () => createSeedMembers(),
  toEntity,
  merge,
})
