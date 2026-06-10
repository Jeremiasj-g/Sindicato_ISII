import type { User } from '../../types'
import {
    normalizarTextoUsuario,
    PASSWORD_PLACEHOLDER,
    validarUsuario
} from '../../utils/usuarioUtils'
import { supabase } from '../config/supabase'
import { getPermissionsByRole, normalizeRole } from '../../utils/permissions'
import type {
    CreateUsuarioInput,
    RolDB,
    UpdateUsuarioInput,
    UsuarioDB,
    UsuarioInsert,
    UsuarioUpdate,
    UsuarioWithRolDB
} from '../types/usuarios.types'

export const mapUsuarioDBToUser = (usuario: UsuarioWithRolDB): User => {
    const role = normalizeRole(usuario.roles?.nombre)

    return {
        id: String(usuario.id),
        username: usuario.username,
        nombre: usuario.nombre || usuario.username,
        email: usuario.email ?? '',
        role,
        permissions: getPermissionsByRole(role),
        isActive: usuario.activo ?? true
    }
}

export const getAllRoles = async () => {
    try {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('nombre', { ascending: true })

        if (error) throw error

        return {
            data: (data ?? []) as RolDB[],
            error: null
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al obtener roles'
        return { data: [] as RolDB[], error: message }
    }
}

export const getRoleIdByName = async (role: User['role']) => {
    const { data, error } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', role)
        .single()

    if (error) throw error

    return data.id
}

export const createUsuario = async (userData: CreateUsuarioInput) => {
  try {
    const validationError = validarUsuario(userData)

    if (validationError) throw new Error(validationError)

    if (!userData.email) {
      throw new Error('El correo electrónico es obligatorio.')
    }

    const {
      data: { session }
    } = await supabase.auth.getSession()

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        username: normalizarTextoUsuario(userData.username),
        nombre: normalizarTextoUsuario(userData.nombre),
        email: normalizarTextoUsuario(userData.email),
        role: userData.role,
        isActive: userData.isActive ?? true
      })
    })

    const result = await response.json()

    console.log('CREATE USER STATUS:', response.status)
    console.log('CREATE USER RESPONSE:', result)

    if (!response.ok) {
      throw new Error(result.error || 'Error al crear usuario')
    }

    return {
      data: mapUsuarioDBToUser(result.data as UsuarioWithRolDB),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear usuario'
    return { data: null, error: message }
  }
}

export const getAllUsuarios = async () => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
        *,
        roles (
          id,
          nombre
        )
      `)
            .order('id', { ascending: true })

        if (error) throw error

        return {
            data: ((data ?? []) as UsuarioWithRolDB[]).map(mapUsuarioDBToUser),
            error: null
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al obtener usuarios'
        return { data: [] as User[], error: message }
    }
}

export const updateUsuario = async (id: number, userData: UpdateUsuarioInput) => {
    try {
        const updateData: UsuarioUpdate = {}

        if (userData.username !== undefined) {
            updateData.username = normalizarTextoUsuario(userData.username)
        }

        if (userData.nombre !== undefined) {
            updateData.nombre = normalizarTextoUsuario(userData.nombre)
        }

        if (userData.isActive !== undefined) {
            updateData.activo = userData.isActive
        }

        if (userData.role !== undefined) {
            updateData.rol_id = await getRoleIdByName(userData.role)
        }

        const { data, error } = await supabase
            .from('usuarios')
            .update(updateData as any)
            .eq('id', id)
            .select(`
        *,
        roles (
          id,
          nombre
        )
      `)
            .single()

        if (error) throw error

        return {
            data: mapUsuarioDBToUser(data as UsuarioWithRolDB),
            error: null
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al actualizar usuario'
        return { data: null, error: message }
    }
}

export const deleteUsuario = async (id: number) => {
    try {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)

        if (error) throw error

        return { success: true, error: null }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al eliminar usuario'
        return { success: false, error: message }
    }
}

export const toggleUsuarioActivo = async (id: number, activo: boolean) => {
    return updateUsuario(id, { isActive: activo })
}