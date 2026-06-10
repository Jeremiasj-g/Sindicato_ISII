import type { Permission, User } from '../types'

export type PermissionAction = Permission['actions'][number]

const fullActions: PermissionAction[] = ['read', 'write', 'delete', 'admin']
const readOnlyActions: PermissionAction[] = ['read']

const protectedModules = [
  'dashboard',
  'empleados',
  'empresas',
  'beneficios',
  'prestamos',
  'reportes',
  'configuracion',
  'perfil'
]

export const normalizeRole = (role?: string | null): User['role'] => {
  const normalized = String(role ?? '').trim().toLowerCase()

  if (normalized === 'administrador' || normalized === 'admin') return 'administrador'
  if (normalized === 'secretario_hacienda' || normalized === 'secretario de hacienda') return 'secretario_hacienda'
  if (normalized === 'secretaria' || normalized === 'secretario' || normalized === 'secretaria/o') return 'secretaria'
  if (normalized === 'desarrollador' || normalized === 'developer') return 'desarrollador'

  return 'secretaria'
}

export const getPermissionsByRole = (role: User['role']): Permission[] => {
  const actions = role === 'secretaria' ? readOnlyActions : fullActions

  return protectedModules.map((module) => ({
    module,
    actions: [...actions]
  }))
}

export const hasUserPermission = (
  user: User | null,
  module: string,
  action: PermissionAction
): boolean => {
  if (!user || !user.isActive) return false

  const permission = user.permissions.find((item) => item.module === module)
  if (!permission) return false

  return permission.actions.includes(action) || permission.actions.includes('admin')
}
