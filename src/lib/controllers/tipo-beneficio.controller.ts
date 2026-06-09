import type { TipoBeneficio } from '../../types'
import { normalizarTextoBeneficio } from '../../utils/beneficioUtils'
import { supabase } from '../config/supabase'
import type {
  TipoBeneficioDB,
  TipoBeneficioInsert,
  TipoBeneficioUpdate,
  CreateTipoBeneficioInput,
  UpdateTipoBeneficioInput
} from '../types/beneficios.types'

export const mapTipoBeneficioDBToTipoBeneficio = (
  tipo: TipoBeneficioDB
): TipoBeneficio => {
  return {
    id: String(tipo.id),
    nombre: tipo.nombre,
    categoria: tipo.categoria ?? ''
  }
}

export const getAllTiposBeneficio = async () => {
  try {
    const { data, error } = await supabase
      .from('tipos_beneficio')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapTipoBeneficioDBToTipoBeneficio),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener tipos de beneficio'
    console.error('Error fetching tipos_beneficio:', error)

    return {
      data: [] as TipoBeneficio[],
      error: message
    }
  }
}

export const createTipoBeneficio = async (tipoData: CreateTipoBeneficioInput) => {
  try {
    const nombre = normalizarTextoBeneficio(tipoData.nombre)

    if (!nombre) {
      throw new Error('El nombre del tipo de beneficio es obligatorio.')
    }

    const insertData: TipoBeneficioInsert = {
      nombre,
      categoria: normalizarTextoBeneficio(tipoData.categoria) || null
    }

    const { data, error } = await supabase
      .from('tipos_beneficio')
      .insert(insertData)
      .select('*')
      .single()

    if (error) throw error

    return {
      data: mapTipoBeneficioDBToTipoBeneficio(data),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear el tipo de beneficio'
    console.error('Error creating tipo_beneficio:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const updateTipoBeneficio = async (
  id: number,
  tipoData: UpdateTipoBeneficioInput
) => {
  try {
    const updateData: TipoBeneficioUpdate = {}

    if (tipoData.nombre !== undefined) {
      const nombre = normalizarTextoBeneficio(tipoData.nombre)

      if (!nombre) {
        throw new Error('El nombre del tipo de beneficio es obligatorio.')
      }

      updateData.nombre = nombre
    }

    if (tipoData.categoria !== undefined) {
      updateData.categoria = normalizarTextoBeneficio(tipoData.categoria) || null
    }

    const { data, error } = await supabase
      .from('tipos_beneficio')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return {
      data: mapTipoBeneficioDBToTipoBeneficio(data),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el tipo de beneficio'
    console.error('Error updating tipo_beneficio:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const deleteTipoBeneficio = async (id: number) => {
  try {
    const { error } = await supabase
      .from('tipos_beneficio')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar el tipo de beneficio'
    console.error('Error deleting tipo_beneficio:', error)

    return {
      success: false,
      error: message
    }
  }
}