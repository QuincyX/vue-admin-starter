import { computed } from 'vue'

import { permissionsForRole, roleCan } from '@/constants/permissions'
import { useAuthStore } from '@/stores/auth'
import type { Permission } from '@/types/auth'

/**
 * The only authorization API components need.
 *
 * `can()` reads the store inside the call, so using it in a template or computed
 * tracks the role reactively — a role change re-renders buttons without a reload.
 */
export function usePermission() {
  const auth = useAuthStore()

  const role = computed(() => auth.user?.role ?? null)
  const permissions = computed(() => permissionsForRole(role.value))

  function can(permission: Permission): boolean {
    return roleCan(role.value, permission)
  }

  function canAny(required: readonly Permission[]): boolean {
    return required.some(can)
  }

  return { role, permissions, can, canAny }
}
