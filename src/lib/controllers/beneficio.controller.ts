import type { Beneficio, Factura, TipoBeneficio } from '../../types'
import {
  normalizarTextoBeneficio,
  validarBeneficio,
  validarFactura
} from '../../utils/beneficioUtils'
import { supabase } from '../config/supabase'
import { getAllTiposBeneficio } from './tipo-beneficio.controller'
import type {
  BeneficioDB,
  BeneficioInsert,
  BeneficioUpdate,
  FacturaDB,
  FacturaInsert,
  CreateBeneficioInput,
  UpdateBeneficioInput
} from '../types/beneficios.types'

const getTiposBeneficioMap = async () => {
  const { data } = await getAllTiposBeneficio()
  return new Map(data.map((tipo) => [Number(tipo.id), tipo]))
}

export const mapFacturaDBToFactura = (factura: FacturaDB): Factura => ({
  id: String(factura.id),
  beneficioId: factura.beneficio_id ? String(factura.beneficio_id) : '',
  numero: factura.numero_factura ?? '',
  proveedor: factura.proveedor ?? '',
  monto: Number(factura.monto ?? 0),
  fecha: factura.fecha ?? '',
  archivo: factura.archivo_id ? String(factura.archivo_id) : undefined
})

export const mapFacturaToFacturaInsert = (
  factura: Partial<Factura>,
  beneficioId: number
): FacturaInsert => ({
  beneficio_id: beneficioId,
  numero_factura: normalizarTextoBeneficio(factura.numero) || null,
  proveedor: normalizarTextoBeneficio(factura.proveedor) || null,
  monto: factura.monto ?? null,
  fecha: factura.fecha || null,
  archivo_id: factura.archivo ? Number(factura.archivo) : null
})

export const mapBeneficioDBToBeneficio = (
  beneficio: BeneficioDB,
  _tiposMap: Map<number, TipoBeneficio>,
  facturas: Factura[] = []
): Beneficio => {
  const row = beneficio as BeneficioDB & {
    estado?: Beneficio['estado']
    observaciones?: string | null
    beneficiario?: string | null
  }

  return {
    id: String(row.id),
    empleadoId: row.empleado_id ? String(row.empleado_id) : '',
    tipo: row.tipo_beneficio_id ? String(row.tipo_beneficio_id) : '',
    descripcion: row.descripcion ?? '',
    monto: Number(row.monto ?? 0),
    fecha: row.fecha_otorgado,
    estado: row.estado ?? 'pendiente',
    observaciones: row.observaciones ?? '',
    beneficiario: row.beneficiario ?? '',
    facturas
  }
}

export const mapBeneficioToBeneficioInsert = (
  beneficio: CreateBeneficioInput
): BeneficioInsert => ({
  empleado_id: beneficio.empleadoId ? Number(beneficio.empleadoId) : null,
  tipo_beneficio_id: beneficio.tipo ? Number(beneficio.tipo) : null,
  descripcion: normalizarTextoBeneficio(beneficio.descripcion) || null,
  monto: beneficio.monto ?? null,
  fecha_otorgado: beneficio.fecha || new Date().toISOString().split('T')[0],
  estado: beneficio.estado ?? 'pendiente',
  observaciones: normalizarTextoBeneficio(beneficio.observaciones) || null,
  beneficiario: normalizarTextoBeneficio(beneficio.beneficiario) || null
} as BeneficioInsert)

export const mapBeneficioToBeneficioUpdate = (
  beneficio: UpdateBeneficioInput
): BeneficioUpdate => {
  const updateData: Record<string, unknown> = {}

  if (beneficio.empleadoId !== undefined) {
    updateData.empleado_id = beneficio.empleadoId ? Number(beneficio.empleadoId) : null
  }

  if (beneficio.tipo !== undefined) {
    updateData.tipo_beneficio_id = beneficio.tipo ? Number(beneficio.tipo) : null
  }

  if (beneficio.descripcion !== undefined) {
    updateData.descripcion = normalizarTextoBeneficio(beneficio.descripcion) || null
  }

  if (beneficio.monto !== undefined) {
    updateData.monto = beneficio.monto
  }

  if (beneficio.fecha !== undefined) {
    updateData.fecha_otorgado = beneficio.fecha
  }

  if (beneficio.estado !== undefined) {
    updateData.estado = beneficio.estado
  }

  if (beneficio.observaciones !== undefined) {
    updateData.observaciones = normalizarTextoBeneficio(beneficio.observaciones) || null
  }

  if (beneficio.beneficiario !== undefined) {
    updateData.beneficiario = normalizarTextoBeneficio(beneficio.beneficiario) || null
  }

  return updateData as BeneficioUpdate
}

export const getFacturasByBeneficioId = async (beneficioId: number) => {
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .eq('beneficio_id', beneficioId)
    .order('fecha', { ascending: false })

  if (error) throw error

  return (data ?? []).map(mapFacturaDBToFactura)
}

export const replaceFacturasByBeneficioId = async (
  beneficioId: number,
  facturas: Factura[]
) => {
  const { error: deleteError } = await supabase
    .from('facturas')
    .delete()
    .eq('beneficio_id', beneficioId)

  if (deleteError) throw deleteError

  if (!facturas.length) return

  for (const factura of facturas) {
    const validationError = validarFactura(factura)
    if (validationError) throw new Error(validationError)
  }

  const insertData = facturas.map((factura) =>
    mapFacturaToFacturaInsert(factura, beneficioId)
  )

  const { error: insertError } = await supabase
    .from('facturas')
    .insert(insertData)

  if (insertError) throw insertError
}

export const createBeneficio = async (beneficioData: CreateBeneficioInput) => {
  try {
    const validationError = validarBeneficio(beneficioData)

    if (validationError) throw new Error(validationError)

    const { data, error } = await supabase
      .rpc('sp_crear_beneficio', {
        p_empleado_id: Number(beneficioData.empleadoId),
        p_tipo_beneficio_id: Number(beneficioData.tipo),
        p_monto: Number(beneficioData.monto),
        p_descripcion: beneficioData.descripcion,
        p_fecha_otorgado: beneficioData.fechaOtorgamiento,
        p_estado: beneficioData.estado ?? 'pendiente',
        p_beneficiario: beneficioData.beneficiario ?? null,
        p_observaciones: beneficioData.observaciones ?? null
      })

    if (error) throw error

    return {
      data: mapBeneficioDBToBeneficio(data as BeneficioDB),
      error: null
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al crear beneficio'

    console.error('Error creating beneficio:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const getAllBeneficios = async () => {
  try {
    const [{ data, error }, tiposMap] = await Promise.all([
      supabase
        .from('beneficios')
        .select('*')
        .order('fecha_otorgado', { ascending: false }),
      getTiposBeneficioMap()
    ])

    if (error) throw error

    const beneficios = await Promise.all(
      (data ?? []).map(async (beneficio) => {
        const facturas = await getFacturasByBeneficioId(beneficio.id)
        return mapBeneficioDBToBeneficio(beneficio, tiposMap, facturas)
      })
    )

    return { data: beneficios, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener beneficios'
    console.error('Error fetching beneficios:', error)
    return { data: [] as Beneficio[], error: message }
  }
}

export const updateBeneficio = async (
  id: string,
  beneficioData: UpdateBeneficioInput
) => {
  try {
    const { data, error } = await supabase
      .rpc('sp_actualizar_beneficio', {
        p_id: Number(id),
        p_empleado_id: beneficioData.empleadoId !== undefined
          ? Number(beneficioData.empleadoId)
          : null,
        p_tipo_beneficio_id: beneficioData.tipo !== undefined
          ? Number(beneficioData.tipo)
          : null,
        p_monto: beneficioData.monto !== undefined
          ? Number(beneficioData.monto)
          : null,
        p_descripcion: beneficioData.descripcion ?? null,
        p_fecha_otorgado: beneficioData.fechaOtorgamiento ?? null,
        p_estado: beneficioData.estado ?? null,
        p_beneficiario: beneficioData.beneficiario ?? null,
        p_observaciones: beneficioData.observaciones ?? null
      })

    if (error) throw error

    return {
      data: mapBeneficioDBToBeneficio(data as BeneficioDB),
      error: null
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al actualizar beneficio'

    console.error('Error updating beneficio:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const cambiarEstadoBeneficio = async (
  id: string,
  estado: Beneficio['estado']
) => {
  try {
    const { data, error } = await supabase
      .rpc('sp_cambiar_estado_beneficio', {
        p_id: Number(id),
        p_estado: estado
      })

    if (error) throw error

    return {
      data: mapBeneficioDBToBeneficio(data as BeneficioDB),
      error: null
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al cambiar estado del beneficio'

    return {
      data: null,
      error: message
    }
  }
}

export const deleteBeneficio = async (id: string) => {
  try {
    const { data, error } = await supabase
      .rpc('sp_eliminar_beneficio', {
        p_id: Number(id)
      })

    if (error) throw error

    return {
      success: Boolean(data),
      error: null
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al eliminar beneficio'

    console.error('Error deleting beneficio:', error)

    return {
      success: false,
      error: message
    }
  }
}