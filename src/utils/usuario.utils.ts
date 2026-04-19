import type { Database } from '../lib/types/database.types'
import type { CreateUsuarioPayload, UpdateUsuarioPayload, UsuarioSistema } from '../types'

type UsuarioDB = Database['public']['Tables']['usuarios']['Row']
type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert']
type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update']

type RolDB = Database['public']['Tables']['roles']['Row']

type UsuarioDBWithRol = UsuarioDB & {
  roles?: RolDB | RolDB[] | null
}

const normalizeRol = (rol: UsuarioDBWithRol['roles']): RolDB | null => {
  if (!rol) return null
  if (Array.isArray(rol)) return rol[0] ?? null
  return rol
}

export const mapUsuarioDBToUsuarioSistema = (usuario: UsuarioDBWithRol): UsuarioSistema => {
  const rol = normalizeRol(usuario.roles)

  return {
    id: usuario.id.toString(),
    username: usuario.username,
    passwordHash: usuario.password_hash,
    rolId: usuario.rol_id,
    rolNombre: rol?.nombre ?? null,
    activo: usuario.activo ?? true,
    fechaAlta: usuario.fecha_alta
  }
}

export const mapCreateUsuarioPayloadToInsert = (
  payload: CreateUsuarioPayload
): UsuarioInsert => {
  return {
    username: payload.username,
    password_hash: payload.passwordHash,
    rol_id: payload.rolId ?? null,
    activo: payload.activo ?? true
  }
}

export const mapUpdateUsuarioPayloadToUpdate = (
  payload: UpdateUsuarioPayload
): UsuarioUpdate => {
  const update: UsuarioUpdate = {}

  if (payload.username !== undefined) update.username = payload.username
  if (payload.passwordHash !== undefined) update.password_hash = payload.passwordHash
  if (payload.rolId !== undefined) update.rol_id = payload.rolId
  if (payload.activo !== undefined) update.activo = payload.activo

  return update
}
