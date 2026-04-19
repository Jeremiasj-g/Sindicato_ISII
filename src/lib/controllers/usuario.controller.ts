import { supabase } from '../config/supabase'
import type { CreateUsuarioPayload, UpdateUsuarioPayload } from '../../types'
import {
  mapCreateUsuarioPayloadToInsert,
  mapUpdateUsuarioPayloadToUpdate,
  mapUsuarioDBToUsuarioSistema
} from '../../utils/usuario.utils'

/**
 * Usuario Controller
 * CRUD para tabla usuarios (con relación a roles)
 */

export const createUsuario = async (usuarioData: CreateUsuarioPayload) => {
  try {
    const insertData = mapCreateUsuarioPayloadToInsert(usuarioData)

    const { data, error } = await supabase
      .from('usuarios')
      .insert(insertData)
      .select('*, roles(id, nombre)')
      .single()

    if (error) throw error

    return {
      data: mapUsuarioDBToUsuarioSistema(data),
      error: null
    }
  } catch (error: any) {
    console.error('Error creating usuario:', error)
    return {
      data: null,
      error: error.message || 'Error al crear el usuario'
    }
  }
}

export const getUsuarioById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(id, nombre)')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      data: data ? mapUsuarioDBToUsuarioSistema(data) : null,
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching usuario:', error)
    return {
      data: null,
      error: error.message || 'Error al obtener el usuario'
    }
  }
}

export const getAllUsuarios = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(id, nombre)')
      .order('id', { ascending: true })

    if (error) throw error

    return {
      data: data ? data.map(mapUsuarioDBToUsuarioSistema) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching usuarios:', error)
    return {
      data: [],
      error: error.message || 'Error al obtener los usuarios'
    }
  }
}

export const updateUsuario = async (id: number, usuarioData: UpdateUsuarioPayload) => {
  try {
    const updateData = mapUpdateUsuarioPayloadToUpdate(usuarioData)

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select('*, roles(id, nombre)')
      .single()

    if (error) throw error

    return {
      data: mapUsuarioDBToUsuarioSistema(data),
      error: null
    }
  } catch (error: any) {
    console.error('Error updating usuario:', error)
    return {
      data: null,
      error: error.message || 'Error al actualizar el usuario'
    }
  }
}

export const deleteUsuario = async (id: number) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      error: null
    }
  } catch (error: any) {
    console.error('Error deleting usuario:', error)
    return {
      success: false,
      error: error.message || 'Error al desactivar el usuario'
    }
  }
}

export const searchUsuarios = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(id, nombre)')
      .or(`username.ilike.%${query}%`)
      .order('id', { ascending: true })

    if (error) throw error

    return {
      data: data ? data.map(mapUsuarioDBToUsuarioSistema) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error searching usuarios:', error)
    return {
      data: [],
      error: error.message || 'Error al buscar usuarios'
    }
  }
}

export const getUsuariosByRol = async (rolId: number) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(id, nombre)')
      .eq('rol_id', rolId)
      .order('id', { ascending: true })

    if (error) throw error

    return {
      data: data ? data.map(mapUsuarioDBToUsuarioSistema) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching usuarios by rol:', error)
    return {
      data: [],
      error: error.message || 'Error al obtener usuarios por rol'
    }
  }
}
