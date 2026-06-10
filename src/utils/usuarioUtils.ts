import type { User } from '../types'

export const PASSWORD_PLACEHOLDER = 'SUPABASE_AUTH_MANAGED'

export const normalizarTextoUsuario = (value?: string | null) => {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}

export const validarUsuario = (user: Partial<User>) => {
  if (!normalizarTextoUsuario(user.username)) {
    return 'El nombre de usuario es obligatorio.'
  }

  if (!normalizarTextoUsuario(user.nombre)) {
    return 'El nombre completo es obligatorio.'
  }

  if (!user.role) {
    return 'Debe seleccionar un rol.'
  }

  return null
}