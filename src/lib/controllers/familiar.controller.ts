import { Familiar } from '../../types'
import { supabase } from '../config/supabase'
import type { Database } from '../types/database.types'

type ConyugeRow = Database['public']['Tables']['conyuges']['Row']
type HijoRow = Database['public']['Tables']['hijos']['Row']
type PadresEmpleadoRow = Database['public']['Tables']['padres_empleado']['Row']

type EscolaridadApp = Familiar['escolaridad']

type ResultadoFamiliares = {
  data: Familiar[]
  error: string | null
}

const normalizarTexto = (valor?: string | null) => (valor ?? '').trim()

const dividirNombreCompleto = (nombreCompleto?: string | null) => {
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

const toAppEscolaridad = (value?: string | null): EscolaridadApp => {
  switch (value) {
    case 'Inicial':
      return 'inicial'
    case 'Primaria':
      return 'primaria'
    case 'Secundaria':
      return 'secundaria'
    case 'Terciaria':
      return 'terciaria'
    case 'Universitaria':
      return 'universitaria'
    default:
      return 'ninguna'
  }
}

const toDbEscolaridad = (value?: EscolaridadApp) => {
  switch (value) {
    case 'inicial':
      return 'Inicial'
    case 'primaria':
      return 'Primaria'
    case 'secundaria':
      return 'Secundaria'
    case 'terciaria':
      return 'Terciaria'
    case 'universitaria':
      return 'Universitaria'
    default:
      return null
  }
}

const calcularEdad = (fechaNacimiento?: string) => {
  if (!fechaNacimiento) return undefined

  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)

  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1
  }

  return edad
}

const mapConyugeToFamiliar = (conyuge: ConyugeRow): Familiar => {
  const { nombre, apellido } = dividirNombreCompleto(conyuge.nombre_completo)

  return {
    id: `conyuge-${conyuge.id}`,
    empleadoId: String(conyuge.empleado_id ?? ''),
    nombre,
    apellido,
    cuil: conyuge.cuil ?? undefined,
    parentesco: 'conyuge',
    esEstudiante: false
  }
}

const mapHijoToFamiliar = (hijo: HijoRow): Familiar => {
  const { nombre, apellido } = dividirNombreCompleto(hijo.nombre_completo)
  const escolaridad = toAppEscolaridad(hijo.escolaridad)

  return {
    id: `hijo-${hijo.id}`,
    empleadoId: String(hijo.empleado_id ?? ''),
    nombre,
    apellido,
    cuil: hijo.cuil ?? undefined,
    parentesco: 'hijo',
    fechaNacimiento: hijo.fecha_nacimiento,
    edad: calcularEdad(hijo.fecha_nacimiento),
    escolaridad,
    esEstudiante: escolaridad !== 'ninguna'
  }
}

const mapPadresToFamiliares = (padres: PadresEmpleadoRow): Familiar[] => {
  const familiares: Familiar[] = []

  if (padres.nombre_padre) {
    const { nombre, apellido } = dividirNombreCompleto(padres.nombre_padre)
    familiares.push({
      id: `padre-${padres.id}`,
      empleadoId: String(padres.empleado_id ?? ''),
      nombre,
      apellido,
      parentesco: 'padre',
      esEstudiante: false
    })
  }

  if (padres.nombre_madre) {
    const { nombre, apellido } = dividirNombreCompleto(padres.nombre_madre)
    familiares.push({
      id: `madre-${padres.id}`,
      empleadoId: String(padres.empleado_id ?? ''),
      nombre,
      apellido,
      parentesco: 'madre',
      esEstudiante: false
    })
  }

  return familiares
}

export const getFamiliaresByEmpleadoId = async (empleadoId: number): Promise<ResultadoFamiliares> => {
  try {
    const [conyugesRes, hijosRes, padresRes] = await Promise.all([
      supabase
        .from('conyuges')
        .select('*')
        .eq('empleado_id', empleadoId),
      supabase
        .from('hijos')
        .select('*')
        .eq('empleado_id', empleadoId)
        .order('fecha_nacimiento', { ascending: true }),
      supabase
        .from('padres_empleado')
        .select('*')
        .eq('empleado_id', empleadoId)
        .maybeSingle()
    ])

    if (conyugesRes.error) throw conyugesRes.error
    if (hijosRes.error) throw hijosRes.error
    if (padresRes.error) throw padresRes.error

    const familiares: Familiar[] = [
      ...(conyugesRes.data ?? []).map(mapConyugeToFamiliar),
      ...(hijosRes.data ?? []).map(mapHijoToFamiliar),
      ...(padresRes.data ? mapPadresToFamiliares(padresRes.data) : [])
    ]

    return {
      data: familiares,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener los familiares'
    console.error('Error fetching familiares:', error)
    return {
      data: [],
      error: message
    }
  }
}

export const replaceGrupoFamiliar = async (empleadoId: number, familiares: Familiar[]) => {
  try {
    const conyuge = familiares.find((familiar) => familiar.parentesco === 'conyuge')
    const hijos = familiares.filter((familiar) => familiar.parentesco === 'hijo')
    const padre = familiares.find((familiar) => familiar.parentesco === 'padre')
    const madre = familiares.find((familiar) => familiar.parentesco === 'madre')

    const hijosSinFecha = hijos.filter((hijo) => !hijo.fechaNacimiento)
    if (hijosSinFecha.length > 0) {
      throw new Error('Cada hijo debe tener fecha de nacimiento para poder guardarse.')
    }

    await Promise.all([
      supabase.from('conyuges').delete().eq('empleado_id', empleadoId),
      supabase.from('hijos').delete().eq('empleado_id', empleadoId),
      supabase.from('padres_empleado').delete().eq('empleado_id', empleadoId)
    ])

    if (conyuge) {
      const { error } = await supabase
        .from('conyuges')
        .insert({
          empleado_id: empleadoId,
          nombre_completo: construirNombreCompleto(conyuge.nombre, conyuge.apellido) || null,
          cuil: normalizarTexto(conyuge.cuil) || null
        })

      if (error) throw error
    }

    if (hijos.length > 0) {
      const { error } = await supabase
        .from('hijos')
        .insert(
          hijos.map((hijo) => ({
            empleado_id: empleadoId,
            nombre_completo: construirNombreCompleto(hijo.nombre, hijo.apellido),
            cuil: normalizarTexto(hijo.cuil) || null,
            fecha_nacimiento: hijo.fechaNacimiento!,
            escolaridad: toDbEscolaridad(hijo.escolaridad)
          }))
        )

      if (error) throw error
    }

    if (padre || madre) {
      const { error } = await supabase
        .from('padres_empleado')
        .insert({
          empleado_id: empleadoId,
          nombre_padre: padre ? construirNombreCompleto(padre.nombre, padre.apellido) : null,
          nombre_madre: madre ? construirNombreCompleto(madre.nombre, madre.apellido) : null
        })

      if (error) throw error
    }

    return {
      success: true,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al guardar el grupo familiar'
    console.error('Error replacing grupo familiar:', error)
    return {
      success: false,
      error: message
    }
  }
}