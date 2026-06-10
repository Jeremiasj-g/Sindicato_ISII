import type { Database } from './database.types'
import type { User } from '../../types'

export type UsuarioDB = Database['public']['Tables']['usuarios']['Row'] & {
  nombre?: string | null
  email?: string | null
  auth_user_id?: string | null
}

export type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert'] & {
  nombre?: string | null
  email?: string | null
  auth_user_id?: string | null
}

export type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update'] & {
  nombre?: string | null
  email?: string | null
  auth_user_id?: string | null
}

export type RolDB = Database['public']['Tables']['roles']['Row']

export type UsuarioWithRolDB = UsuarioDB & {
  roles?: RolDB | null
}

export interface CreateUsuarioInput {
  username: string
  nombre: string
  email: string
  password: string
  role: User['role']
  isActive?: boolean
}

export interface UpdateUsuarioInput {
  username?: string
  nombre?: string
  email?: string
  role?: User['role']
  isActive?: boolean
}