import type { Empresa } from '../../types'
import { normalizarNombreEmpresa, validarNombreEmpresa } from '../../utils/empresaUtils'
import { supabase } from '../config/supabase'
import type {
  EmpresaDB,
  EmpresaInsert,
  EmpresaUpdate,
  CreateEmpresaInput,
  UpdateEmpresaInput
} from '../types/empresas.types'

export const mapEmpresaDBToEmpresa = (empresa: EmpresaDB): Empresa => {
  return {
    id: String(empresa.id),
    nombre: empresa.nombre
  }
}

export const mapEmpresaToEmpresaInsert = (empresa: CreateEmpresaInput): EmpresaInsert => {
  return {
    nombre: normalizarNombreEmpresa(empresa.nombre)
  }
}

export const mapEmpresaToEmpresaUpdate = (empresa: UpdateEmpresaInput): EmpresaUpdate => {
  return {
    nombre: empresa.nombre !== undefined
      ? normalizarNombreEmpresa(empresa.nombre)
      : undefined
  }
}

/**
 * CRUD Empresas
 * Actualmente usa queries directas con Supabase.
 * Más adelante podés reemplazar estas operaciones por supabase.rpc(...)
 * sin cambiar la interfaz pública del controller.
 */

export const createEmpresa = async (empresaData: CreateEmpresaInput) => {
  try {
    const validationError = validarNombreEmpresa(empresaData.nombre)

    if (validationError) {
      throw new Error(validationError)
    }

    const insertData = mapEmpresaToEmpresaInsert(empresaData)

    const { data, error } = await supabase
      .from('empresas')
      .insert(insertData)
      .select('*')
      .single()

    if (error) throw error

    return {
      data: mapEmpresaDBToEmpresa(data),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear la empresa'
    console.error('Error creating empresa:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const getEmpresaById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      data: mapEmpresaDBToEmpresa(data),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener la empresa'
    console.error('Error fetching empresa:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const getAllEmpresas = async () => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapEmpresaDBToEmpresa),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener las empresas'
    console.error('Error fetching empresas:', error)

    return {
      data: [] as Empresa[],
      error: message
    }
  }
}

export const updateEmpresa = async (id: number, empresaData: UpdateEmpresaInput) => {
  try {
    if (empresaData.nombre !== undefined) {
      const validationError = validarNombreEmpresa(empresaData.nombre)

      if (validationError) {
        throw new Error(validationError)
      }
    }

    const updateData = mapEmpresaToEmpresaUpdate(empresaData)

    const { data, error } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return {
      data: mapEmpresaDBToEmpresa(data),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar la empresa'
    console.error('Error updating empresa:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const deleteEmpresa = async (id: number) => {
  try {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Error al eliminar la empresa'

    console.error('Error deleting empresa:', error)

    return {
      success: false,
      error: message
    }
  }
}

export const searchEmpresas = async (query: string) => {
  try {
    const termino = normalizarNombreEmpresa(query)

    if (!termino) {
      return getAllEmpresas()
    }

    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .ilike('nombre', `%${termino}%`)
      .order('nombre', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapEmpresaDBToEmpresa),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al buscar empresas'
    console.error('Error searching empresas:', error)

    return {
      data: [] as Empresa[],
      error: message
    }
  }
}