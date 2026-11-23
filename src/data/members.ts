import type { Department, Member, MemberStatus } from '@/types/member'
import type { Role } from '@/types/auth'

interface SeedRow {
  name: string
  email: string
  role: Role
  status: MemberStatus
  department: Department
  title: string
  /** Days since the last sign-in; `null` for accounts that never signed in. */
  activeDaysAgo: number | null
  /** Days since the account was created. */
  createdDaysAgo: number
}

/**
 * Zero-config demo data: 24 members covering every role, status and department so
 * the table's filters, pagination and role rules all have something to act on.
 * Dates are relative to "now" at seed time, which keeps the demo from looking
 * stale; ids are stable so tests and deep links can address a specific row.
 */
const SEED_ROWS: SeedRow[] = [
  {
    name: '陈思远',
    email: 'chen.siyuan@aurora.dev',
    role: 'owner',
    status: 'active',
    department: 'engineering',
    title: '技术负责人',
    activeDaysAgo: 0,
    createdDaysAgo: 420,
  },
  {
    name: '林浅',
    email: 'lin.qian@aurora.dev',
    role: 'admin',
    status: 'active',
    department: 'design',
    title: '设计主管',
    activeDaysAgo: 0,
    createdDaysAgo: 365,
  },
  {
    name: '赵一鸣',
    email: 'zhao.yiming@aurora.dev',
    role: 'admin',
    status: 'active',
    department: 'growth',
    title: '增长负责人',
    activeDaysAgo: 1,
    createdDaysAgo: 310,
  },
  {
    name: '周珂',
    email: 'zhou.ke@aurora.dev',
    role: 'admin',
    status: 'active',
    department: 'engineering',
    title: '平台工程师',
    activeDaysAgo: 2,
    createdDaysAgo: 280,
  },
  {
    name: '吴迪',
    email: 'wu.di@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'engineering',
    title: '前端工程师',
    activeDaysAgo: 0,
    createdDaysAgo: 240,
  },
  {
    name: '沈亦然',
    email: 'shen.yiran@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'engineering',
    title: '后端工程师',
    activeDaysAgo: 3,
    createdDaysAgo: 232,
  },
  {
    name: '韩雪',
    email: 'han.xue@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'design',
    title: '交互设计师',
    activeDaysAgo: 1,
    createdDaysAgo: 210,
  },
  {
    name: '程野',
    email: 'cheng.ye@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'engineering',
    title: '测试工程师',
    activeDaysAgo: 4,
    createdDaysAgo: 205,
  },
  {
    name: '罗嘉',
    email: 'luo.jia@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'growth',
    title: '内容运营',
    activeDaysAgo: 0,
    createdDaysAgo: 190,
  },
  {
    name: '许安',
    email: 'xu.an@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'support',
    title: '客户成功',
    activeDaysAgo: 2,
    createdDaysAgo: 182,
  },
  {
    name: '唐屿',
    email: 'tang.yu@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'finance',
    title: '财务专员',
    activeDaysAgo: 5,
    createdDaysAgo: 175,
  },
  {
    name: '白露',
    email: 'bai.lu@aurora.dev',
    role: 'viewer',
    status: 'suspended',
    department: 'growth',
    title: '渠道运营',
    activeDaysAgo: 46,
    createdDaysAgo: 168,
  },
  {
    name: '孟琢',
    email: 'meng.zhuo@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'engineering',
    title: '基础设施工程师',
    activeDaysAgo: 1,
    createdDaysAgo: 160,
  },
  {
    name: '顾清',
    email: 'gu.qing@aurora.dev',
    role: 'viewer',
    status: 'invited',
    department: 'design',
    title: '视觉设计师',
    activeDaysAgo: null,
    createdDaysAgo: 148,
  },
  {
    name: '范舟',
    email: 'fan.zhou@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'support',
    title: '技术支持',
    activeDaysAgo: 6,
    createdDaysAgo: 140,
  },
  {
    name: '严牧',
    email: 'yan.mu@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'finance',
    title: '结算经理',
    activeDaysAgo: 8,
    createdDaysAgo: 132,
  },
  {
    name: '苏晚',
    email: 'su.wan@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'design',
    title: '品牌设计师',
    activeDaysAgo: 3,
    createdDaysAgo: 120,
  },
  {
    name: '秦钊',
    email: 'qin.zhao@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'engineering',
    title: '数据工程师',
    activeDaysAgo: 0,
    createdDaysAgo: 112,
  },
  {
    name: '袁朗',
    email: 'yuan.lang@aurora.dev',
    role: 'viewer',
    status: 'suspended',
    department: 'support',
    title: '客户顾问',
    activeDaysAgo: 62,
    createdDaysAgo: 104,
  },
  {
    name: '杜若',
    email: 'du.ruo@aurora.dev',
    role: 'viewer',
    status: 'invited',
    department: 'growth',
    title: '活动策划',
    activeDaysAgo: null,
    createdDaysAgo: 92,
  },
  {
    name: '钟桓',
    email: 'zhong.huan@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'engineering',
    title: '安全工程师',
    activeDaysAgo: 1,
    createdDaysAgo: 84,
  },
  {
    name: '曹沐',
    email: 'cao.mu@aurora.dev',
    role: 'viewer',
    status: 'active',
    department: 'finance',
    title: '风控分析师',
    activeDaysAgo: 9,
    createdDaysAgo: 70,
  },
  {
    name: '谢冉',
    email: 'xie.ran@aurora.dev',
    role: 'viewer',
    status: 'invited',
    department: 'support',
    title: '服务运营',
    activeDaysAgo: null,
    createdDaysAgo: 54,
  },
  {
    name: '米乐',
    email: 'mi.le@aurora.dev',
    role: 'viewer',
    status: 'suspended',
    department: 'finance',
    title: '出纳',
    activeDaysAgo: 75,
    createdDaysAgo: 40,
  },
]

const DAY_MS = 86_400_000

export function createSeedMembers(now = new Date()): Member[] {
  return SEED_ROWS.map((row, index) => {
    const createdAt = new Date(now.getTime() - row.createdDaysAgo * DAY_MS).toISOString()
    const lastActiveAt =
      row.activeDaysAgo === null
        ? null
        : new Date(now.getTime() - row.activeDaysAgo * DAY_MS).toISOString()

    return {
      id: `mem_${String(index + 1).padStart(3, '0')}`,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      department: row.department,
      title: row.title,
      lastActiveAt,
      createdAt,
      updatedAt: createdAt,
    }
  })
}
