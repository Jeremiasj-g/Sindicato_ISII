import { Empleado } from '../../types'
import { supabase } from '../config/supabase'
import type { Database } from '../types/database.types'

// Extract empleados table types
type EmpleadoDB = Database['public']['Tables']['empleados']['Row']
type EmpleadoInsert = Database['public']['Tables']['empleados']['Insert']
type EmpleadoUpdate = Database['public']['Tables']['empleados']['Update']

/**
 * Empleado Controller
 * Handles all database operations for empleados
 */

/**
 * Convert database row to application Empleado type
 */
export const mapEmpleadoDBToEmpleado = (empleado: EmpleadoDB): Empleado => {
  const [nombre, ...apellidoParts] = empleado.nombre_completo.split(' ');
  const apellido = apellidoParts.join(' ')

  return {
    id: empleado.id.toString(),
    numeroAfiliado: empleado.numero_afiliado || 0,
    nombre: nombre,
    apellido: apellido,
    dni: empleado.dni,
    cuil: empleado.cuil,
    legajo: empleado.legajo || '',
    empresa: empleado.empresa_id === 1 ? 'Aguas de Corrientes' : 'Urbatec',
    esAfiliado: empleado.afiliado,
    domicilio: empleado.domicilio || '',
    telefonoFijo: empleado.telefono_fijo || undefined,
    telefonoCelular: empleado.telefono_celular || undefined,
    email: empleado.email || undefined,
    fechaIngreso: empleado.fecha_alta,
    estadoLaboral: empleado.activo ? 'activo' : 'inactivo',
    grupoFamiliar: [],
    beneficios: [],
    prestamos: [],
    createdAt: empleado.fecha_alta,
    updatedAt: empleado.fecha_alta
  }
}

/**
 * Convert application Empleado type to database insert type
 */
export const mapEmpleadoToEmpleadoInsert = (empleado: Partial<Empleado>): EmpleadoInsert => {
  const nombreCompleto = `${empleado.nombre || ''} ${empleado.apellido || ''}`.trim()
  
  return {
    nombre_completo: nombreCompleto,
    dni: empleado.dni || '',
    cuil: empleado.cuil || '',
    legajo: empleado.legajo || null,
    domicilio: empleado.domicilio || null,
    telefono_fijo: empleado.telefonoFijo || null,
    telefono_celular: empleado.telefonoCelular || null,
    email: empleado.email || null,
    empresa_id: empleado.empresa === 'Aguas de Corrientes' ? 1 : 2,
    numero_afiliado: empleado.esAfiliado ? empleado.numeroAfiliado : null,
    afiliado: empleado.esAfiliado || false,
    activo: empleado.estadoLaboral === 'activo',
    fecha_alta: empleado.fechaIngreso || new Date().toISOString().split('T')[0],
    fecha_baja: empleado.estadoLaboral === 'inactivo' ? new Date().toISOString().split('T')[0] : null
  }
}

/**
 * Create a new empleado in the database
 */
export const createEmpleado = async (empleadoData: Partial<Empleado>) => {
  try {
    // First, get or create the next numero_afiliado if needed
    let numeroAfiliado = empleadoData.numeroAfiliado
    
    if (empleadoData.esAfiliado && !numeroAfiliado) {
      const { data: maxAfiliadoData, error: maxError } = await supabase
        .from('empleados')
        .select('numero_afiliado')
        .order('numero_afiliado', { ascending: false })
        .limit(1)
        .single()

      if (maxError && maxError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw maxError
      }

      numeroAfiliado = (maxAfiliadoData?.numero_afiliado || 1000) + 1
    }

    const insertData = mapEmpleadoToEmpleadoInsert({
      ...empleadoData,
      numeroAfiliado
    })

    const { data, error } = await supabase
      .from('empleados')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return {
      data: mapEmpleadoDBToEmpleado(data),
      error: null
    }
  } catch (error: any) {
    console.error('Error creating empleado:', error)
    return {
      data: null,
      error: error.message || 'Error al crear el empleado'
    }
  }
}

/**
 * Get empleado by ID
 */
export const getEmpleadoById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      data: data ? mapEmpleadoDBToEmpleado(data) : null,
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching empleado:', error)
    return {
      data: null,
      error: error.message || 'Error al obtener el empleado'
    }
  }
}

/**
 * Get all empleados
 */
export const getAllEmpleados = async () => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .order('numero_afiliado', { ascending: true })

    if (error) throw error

    return {
      data: data ? data.map(mapEmpleadoDBToEmpleado) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching empleados:', error)
    return {
      data: [],
      error: error.message || 'Error al obtener los empleados'
    }
  }
}

/**
 * Update empleado by ID
 */
export const updateEmpleado = async (id: number, empleadoData: Partial<Empleado>) => {
  try {
    const updateData: EmpleadoUpdate = {
      nombre_completo: empleadoData.nombre && empleadoData.apellido 
        ? `${empleadoData.nombre} ${empleadoData.apellido}`.trim()
        : undefined,
      dni: empleadoData.dni,
      cuil: empleadoData.cuil,
      legajo: empleadoData.legajo || null,
      domicilio: empleadoData.domicilio || null,
      telefono_fijo: empleadoData.telefonoFijo || null,
      telefono_celular: empleadoData.telefonoCelular || null,
      email: empleadoData.email || null,
      empresa_id: empleadoData.empresa === 'Aguas de Corrientes' ? 1 : 2,
      numero_afiliado: empleadoData.esAfiliado ? empleadoData.numeroAfiliado : null,
      afiliado: empleadoData.esAfiliado,
      activo: empleadoData.estadoLaboral === 'activo',
      fecha_alta: empleadoData.fechaIngreso,
      fecha_baja: empleadoData.estadoLaboral === 'inactivo' 
        ? new Date().toISOString().split('T')[0] 
        : null
    }

    const { data, error } = await supabase
      .from('empleados')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      data: mapEmpleadoDBToEmpleado(data),
      error: null
    }
  } catch (error: any) {
    console.error('Error updating empleado:', error)
    return {
      data: null,
      error: error.message || 'Error al actualizar el empleado'
    }
  }
}

/**
 * Delete empleado by ID (soft delete)
 */
export const deleteEmpleado = async (id: number) => {
  try {
    const { error } = await supabase
      .from('empleados')
      .update({ 
        activo: false,
        fecha_baja: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      error: null
    }
  } catch (error: any) {
    console.error('Error deleting empleado:', error)
    return {
      success: false,
      error: error.message || 'Error al eliminar el empleado'
    }
  }
}

/**
 * Search empleados by query
 */
export const searchEmpleados = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .or(`nombre_completo.ilike.%${query}%,dni.ilike.%${query}%,cuil.ilike.%${query}%,legajo.ilike.%${query}%`)
      .order('numero_afiliado', { ascending: true })

    if (error) throw error

    return {
      data: data ? data.map(mapEmpleadoDBToEmpleado) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error searching empleados:', error)
    return {
      data: [],
      error: error.message || 'Error al buscar empleados'
    }
  }
}

/**
 * Get empleados by empresa
 */
export const getEmpleadosByEmpresa = async (empresa: 'Aguas de Corrientes' | 'Urbatec') => {
  try {
    const empresaId = empresa === 'Aguas de Corrientes' ? 1 : 2

    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('numero_afiliado', { ascending: true })

    if (error) throw error

    return {
      data: data ? data.map(mapEmpleadoDBToEmpleado) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching empleados by empresa:', error)
    return {
      data: [],
      error: error.message || 'Error al obtener los empleados'
    }
  }
}

/**
 * Get empleados by afiliado status
 */
export const getEmpleadosByAfiliadoStatus = async (afiliado: boolean) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('afiliado', afiliado)
      .order('numero_afiliado', { ascending: true })

    if (error) throw error

    return {
      data: data ? data.map(mapEmpleadoDBToEmpleado) : [],
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching empleados by afiliado status:', error)
    return {
      data: [],
      error: error.message || 'Error al obtener los empleados'
    }
  }
}
