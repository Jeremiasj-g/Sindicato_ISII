import { Empleado } from '../../types'
import { supabase } from '../config/supabase'
import type { Database } from '../types/database.types'

type EmpleadoDB = Database['public']['Tables']['empleados']['Row']
type EmpleadoInsert = Database['public']['Tables']['empleados']['Insert']
type EmpleadoUpdate = Database['public']['Tables']['empleados']['Update']
type EmpresaDB = Database['public']['Tables']['empresas']['Row']

type EmpresaNombre = Empleado['empresa']

const EMPRESA_DEFAULT: EmpresaNombre = 'Aguas de Corrientes'

const normalizarTexto = (valor?: string | null) => (valor ?? '').trim()

const dividirNombreCompleto = (nombreCompleto: string) => {
  const limpio = normalizarTexto(nombreCompleto)

  if (!limpio) {
    return { nombre: '', apellido: '' }
  }

  const partes = limpio.split(/\s+/)

  if (partes.length === 1) {
    return { nombre: partes[0], apellido: '' }
  }

  return {
    nombre: partes.slice(0, -1).join(' '),
    apellido: partes.slice(-1).join(' ')
  }
}

const construirNombreCompleto = (nombre?: string, apellido?: string) => {
  return [normalizarTexto(nombre), normalizarTexto(apellido)]
    .filter(Boolean)
    .join(' ')
}

const mapEmpresaIdToNombre = (
  empresaId: number | null,
  empresasMap: Map<number, string>
): EmpresaNombre => {
  if (!empresaId) return EMPRESA_DEFAULT

  const nombre = empresasMap.get(empresaId)
  return nombre === 'Urbatec' ? 'Urbatec' : 'Aguas de Corrientes'
}

const getEmpresasMap = async () => {
  const { data, error } = await supabase
    .from('empresas')
    .select('id, nombre')

  if (error) throw error

  return new Map<number, string>((data ?? []).map((empresa: EmpresaDB) => [empresa.id, empresa.nombre]))
}

const ensureEmpresaId = async (empresa: EmpresaNombre) => {
  const { data: existente, error: selectError } = await supabase
    .from('empresas')
    .select('id, nombre')
    .eq('nombre', empresa)
    .maybeSingle()

  if (selectError) throw selectError

  if (existente?.id) return existente.id

  const { data: creada, error: insertError } = await supabase
    .from('empresas')
    .insert({ nombre: empresa })
    .select('id')
    .single()

  if (insertError) throw insertError

  return creada.id
}

export const mapEmpleadoDBToEmpleado = (
  empleado: EmpleadoDB,
  empresasMap: Map<number, string>
): Empleado => {
  const { nombre, apellido } = dividirNombreCompleto(empleado.nombre_completo)

  return {
    id: String(empleado.id),
    numeroAfiliado: empleado.numero_afiliado ?? 0,
    nombre,
    apellido,
    dni: empleado.dni,
    cuil: empleado.cuil,
    legajo: empleado.legajo ?? '',
    empresa: mapEmpresaIdToNombre(empleado.empresa_id, empresasMap),
    esAfiliado: empleado.afiliado,
    domicilio: empleado.domicilio ?? '',
    telefonoFijo: empleado.telefono_fijo ?? undefined,
    telefonoCelular: empleado.telefono_celular ?? undefined,
    email: empleado.email ?? undefined,
    fechaIngreso: empleado.fecha_alta,
    estadoLaboral: empleado.activo ? 'activo' : 'inactivo',
    grupoFamiliar: [],
    beneficios: [],
    prestamos: [],
    createdAt: empleado.fecha_alta,
    updatedAt: empleado.fecha_baja ?? empleado.fecha_alta
  }
}

export const mapEmpleadoToEmpleadoInsert = async (
  empleado: Partial<Empleado>
): Promise<EmpleadoInsert> => {
  const empresa = empleado.empresa ?? EMPRESA_DEFAULT
  const empresaId = await ensureEmpresaId(empresa)

  return {
    nombre_completo: construirNombreCompleto(empleado.nombre, empleado.apellido),
    dni: normalizarTexto(empleado.dni),
    cuil: normalizarTexto(empleado.cuil),
    legajo: normalizarTexto(empleado.legajo) || null,
    domicilio: normalizarTexto(empleado.domicilio) || null,
    telefono_fijo: normalizarTexto(empleado.telefonoFijo) || null,
    telefono_celular: normalizarTexto(empleado.telefonoCelular) || null,
    email: normalizarTexto(empleado.email) || null,
    empresa_id: empresaId,
    localidad_id: null,
    cargo_sindicato_id: null,
    numero_afiliado: empleado.esAfiliado ? (empleado.numeroAfiliado ?? null) : null,
    afiliado: empleado.esAfiliado ?? false,
    activo: empleado.estadoLaboral !== 'inactivo',
    fecha_alta: empleado.fechaIngreso || new Date().toISOString().split('T')[0],
    fecha_baja: empleado.estadoLaboral === 'inactivo'
      ? new Date().toISOString().split('T')[0]
      : null
  }
}

const getNextNumeroAfiliado = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select('numero_afiliado')
    .not('numero_afiliado', 'is', null)
    .order('numero_afiliado', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error

  return (data?.numero_afiliado ?? 1000) + 1
}

export const createEmpleado = async (empleadoData: Partial<Empleado>) => {
  try {
    const numeroAfiliado = empleadoData.esAfiliado
      ? (empleadoData.numeroAfiliado ?? await getNextNumeroAfiliado())
      : 0

    const insertData = await mapEmpleadoToEmpleadoInsert({
      ...empleadoData,
      numeroAfiliado
    })

    const { data, error } = await supabase
      .from('empleados')
      .insert(insertData)
      .select('*')
      .single()

    if (error) throw error

    const empresasMap = await getEmpresasMap()

    return {
      data: mapEmpleadoDBToEmpleado(data, empresasMap),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear el empleado'
    console.error('Error creating empleado:', error)
    return {
      data: null,
      error: message
    }
  }
}

export const getEmpleadoById = async (id: number) => {
  try {
    const [{ data, error }, empresasMap] = await Promise.all([
      supabase
        .from('empleados')
        .select('*')
        .eq('id', id)
        .single(),
      getEmpresasMap()
    ])

    if (error) throw error

    return {
      data: mapEmpleadoDBToEmpleado(data, empresasMap),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener el empleado'
    console.error('Error fetching empleado:', error)
    return {
      data: null,
      error: message
    }
  }
}

export const getAllEmpleados = async () => {
  try {
    const [{ data, error }, empresasMap] = await Promise.all([
      supabase
        .from('empleados')
        .select('*')
        .order('numero_afiliado', { ascending: true, nullsFirst: false })
        .order('nombre_completo', { ascending: true }),
      getEmpresasMap()
    ])

    if (error) throw error

    return {
      data: (data ?? []).map((empleado) => mapEmpleadoDBToEmpleado(empleado, empresasMap)),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener los empleados'
    console.error('Error fetching empleados:', error)
    return {
      data: [] as Empleado[],
      error: message
    }
  }
}

export const updateEmpleado = async (id: number, empleadoData: Partial<Empleado>) => {
  try {
    const empresaId = empleadoData.empresa
      ? await ensureEmpresaId(empleadoData.empresa)
      : null

    const updateData: EmpleadoUpdate = {
      nombre_completo: empleadoData.nombre !== undefined || empleadoData.apellido !== undefined
        ? construirNombreCompleto(empleadoData.nombre, empleadoData.apellido)
        : undefined,
      dni: empleadoData.dni,
      cuil: empleadoData.cuil,
      legajo: empleadoData.legajo !== undefined ? (normalizarTexto(empleadoData.legajo) || null) : undefined,
      domicilio: empleadoData.domicilio !== undefined ? (normalizarTexto(empleadoData.domicilio) || null) : undefined,
      telefono_fijo: empleadoData.telefonoFijo !== undefined ? (normalizarTexto(empleadoData.telefonoFijo) || null) : undefined,
      telefono_celular: empleadoData.telefonoCelular !== undefined ? (normalizarTexto(empleadoData.telefonoCelular) || null) : undefined,
      email: empleadoData.email !== undefined ? (normalizarTexto(empleadoData.email) || null) : undefined,
      empresa_id: empresaId ?? undefined,
      numero_afiliado: empleadoData.esAfiliado === false
        ? null
        : empleadoData.numeroAfiliado,
      afiliado: empleadoData.esAfiliado,
      activo: empleadoData.estadoLaboral === undefined
        ? undefined
        : empleadoData.estadoLaboral !== 'inactivo',
      fecha_alta: empleadoData.fechaIngreso,
      fecha_baja: empleadoData.estadoLaboral === 'inactivo'
        ? new Date().toISOString().split('T')[0]
        : empleadoData.estadoLaboral
          ? null
          : undefined
    }

    const { data, error } = await supabase
      .from('empleados')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    const empresasMap = await getEmpresasMap()

    return {
      data: mapEmpleadoDBToEmpleado(data, empresasMap),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el empleado'
    console.error('Error updating empleado:', error)
    return {
      data: null,
      error: message
    }
  }
}

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar el empleado'
    console.error('Error deleting empleado:', error)
    return {
      success: false,
      error: message
    }
  }
}

export const searchEmpleados = async (query: string) => {
  try {
    const termino = normalizarTexto(query)

    if (!termino) {
      return getAllEmpleados()
    }

    const [{ data, error }, empresasMap] = await Promise.all([
      supabase
        .from('empleados')
        .select('*')
        .or(`nombre_completo.ilike.%${termino}%,dni.ilike.%${termino}%,cuil.ilike.%${termino}%,legajo.ilike.%${termino}%`)
        .order('numero_afiliado', { ascending: true, nullsFirst: false }),
      getEmpresasMap()
    ])

    if (error) throw error

    return {
      data: (data ?? []).map((empleado) => mapEmpleadoDBToEmpleado(empleado, empresasMap)),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al buscar empleados'
    console.error('Error searching empleados:', error)
    return {
      data: [] as Empleado[],
      error: message
    }
  }
}