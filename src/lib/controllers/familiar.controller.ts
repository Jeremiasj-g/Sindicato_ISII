import { supabase } from '../config/supabase'
import { FamiliarInsert, FamiliarUpdate, FamiliarDB } from '../types/familiares.types'
import { Familiar } from '../../types'

/**
 * Familiar Controller
 * Handles all database operations for familiares (family group members)
 */

/**
 * Convert database row to application Familiar type
 */
export const mapFamiliarDBToFamiliar = (familiarDB: FamiliarDB): Familiar => {
  return {
    id: familiarDB.id.toString(),
    empleadoId: familiarDB.empleado_id.toString(),
    nombre: familiarDB.nombre,
    apellido: familiarDB.apellido,
    cuil: familiarDB.cuil || undefined,
    parentesco: familiarDB.parentesco as 'conyuge' | 'hijo' | 'padre' | 'madre' | 'otro',
    fechaNacimiento: familiarDB.fecha_nacimiento || undefined,
    escolaridad: familiarDB.escolaridad as 'inicial' | 'primaria' | 'secundaria' | 'terciaria' | 'universitaria' | 'ninguna' || undefined,
    esEstudiante: familiarDB.es_estudiante
  }
}

/**
 * Convert application Familiar type to database insert type
 */
export const mapFamiliarToFamiliarInsert = (familiar: Partial<Familiar>, empleadoId: number): FamiliarInsert => {
  return {
    empleado_id: empleadoId,
    nombre: familiar.nombre || '',
    apellido: familiar.apellido || '',
    cuil: familiar.cuil || null,
    parentesco: familiar.parentesco || 'hijo',
    fecha_nacimiento: familiar.fechaNacimiento || null,
    escolaridad: familiar.escolaridad || null,
    es_estudiante: familiar.esEstudiante || false
  }
}

/**
 * Create a new familiar for an empleado
 */
export const createFamiliar = async (empleadoId: number, familiarData: Partial<Familiar>) => {
  try {
    const insertData = mapFamiliarToFamiliarInsert(familiarData, empleadoId)

    const { data, error } = await supabase
      .from('familiares')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return {
      data: mapFamiliarDBToFamiliar(data),
      error: null
    }
  } catch (error: any) {
    console.error('Error creating familiar:', error)
    return {
      data: null,
      error: error.message || 'Error al crear el familiar'
    }
  }
}

/**
 * Get all familiares for an empleado
 */
export const getFamiliaresByEmpleadoId = async (empleadoId: number) => {
  try {
    const { data, error } = await supabase
      .from('familiares')
      .select('*')
      .eq('empleado_id', empleadoId)

    if (error) throw error

    return {
      data: data ? data.map(mapFamiliarDBToFamiliar) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching familiares:', error)
    return {
      data: [],
      error: error.message || 'Error al obtener los familiares'
    }
  }
}

/**
 * Get familiar by ID
 */
export const getFamiliarById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('familiares')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      data: data ? mapFamiliarDBToFamiliar(data) : null,
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching familiar:', error)
    return {
      data: null,
      error: error.message || 'Error al obtener el familiar'
    }
  }
}

/**
 * Update familiar by ID
 */
export const updateFamiliar = async (id: number, familiarData: Partial<Familiar>) => {
  try {
    const updateData: FamiliarUpdate = {
      nombre: familiarData.nombre,
      apellido: familiarData.apellido,
      cuil: familiarData.cuil || null,
      parentesco: familiarData.parentesco,
      fecha_nacimiento: familiarData.fechaNacimiento || null,
      escolaridad: familiarData.escolaridad || null,
      es_estudiante: familiarData.esEstudiante
    }

    const { data, error } = await supabase
      .from('familiares')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      data: mapFamiliarDBToFamiliar(data),
      error: null
    }
  } catch (error: any) {
    console.error('Error updating familiar:', error)
    return {
      data: null,
      error: error.message || 'Error al actualizar el familiar'
    }
  }
}

/**
 * Delete familiar by ID
 */
export const deleteFamiliar = async (id: number) => {
  try {
    const { error } = await supabase
      .from('familiares')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      error: null
    }
  } catch (error: any) {
    console.error('Error deleting familiar:', error)
    return {
      success: false,
      error: error.message || 'Error al eliminar el familiar'
    }
  }
}

/**
 * Create or update multiple familiares for an empleado
 */
export const syncFamiliares = async (empleadoId: number, familiares: Partial<Familiar>[]) => {
  try {
    // Get existing familiares
    const { data: existingFamiliares } = await getFamiliaresByEmpleadoId(empleadoId)
    const existingIds = existingFamiliares?.map(f => parseInt(f.id)) || []

    const results = {
      created: [] as Familiar[],
      updated: [] as Familiar[],
      deleted: [] as number[],
      errors: [] as string[]
    }

    // Process familiares
    for (const familiar of familiares) {
      if (familiar.id && existingIds.includes(parseInt(familiar.id))) {
        // Update existing
        const { data, error } = await updateFamiliar(parseInt(familiar.id), familiar)
        if (error) {
          results.errors.push(error)
        } else if (data) {
          results.updated.push(data)
        }
      } else {
        // Create new
        const { data, error } = await createFamiliar(empleadoId, familiar)
        if (error) {
          results.errors.push(error)
        } else if (data) {
          results.created.push(data)
        }
      }
    }

    // Delete removed familiares
    const currentIds = familiares
      .filter(f => f.id)
      .map(f => parseInt(f.id!))
    
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id))
    
    for (const id of idsToDelete) {
      const { error } = await deleteFamiliar(id)
      if (error) {
        results.errors.push(error)
      } else {
        results.deleted.push(id)
      }
    }

    return {
      data: results,
      error: results.errors.length > 0 ? results.errors.join(', ') : null
    }
  } catch (error: any) {
    console.error('Error syncing familiares:', error)
    return {
      data: null,
      error: error.message || 'Error al sincronizar los familiares'
    }
  }
}
