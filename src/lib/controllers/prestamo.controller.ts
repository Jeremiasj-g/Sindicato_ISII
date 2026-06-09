import type { Prestamo } from '../../types'
import {
  calcularEstadoPrestamo,
  calcularMontoCuota,
  calcularTotalConInteres,
  validarPrestamo
} from '../../utils/prestamoUtils'
import { supabase } from '../config/supabase'
import type {
  PrestamoDB,
  PrestamoInsert,
  PrestamoUpdate,
  CuotaPrestamoDB,
  CuotaPrestamoInsert,
  CreatePrestamoInput,
  UpdatePrestamoInput
} from '../types/prestamos.types'

export const getCuotasByPrestamoId = async (prestamoId: number) => {
  const { data, error } = await supabase
    .from('cuotas_prestamo')
    .select('*')
    .eq('prestamo_id', prestamoId)
    .order('numero_cuota', { ascending: true })

  if (error) throw error

  return (data ?? []) as CuotaPrestamoDB[]
}

export const mapPrestamoDBToPrestamo = (
  prestamo: PrestamoDB,
  cuotas: CuotaPrestamoDB[] = []
): Prestamo => {
  const cuotasTotales = cuotas.length
  const cuotasPagadas = cuotas.filter((cuota) => cuota.pagada).length
  const cuotasRestantes = Math.max(cuotasTotales - cuotasPagadas, 0)
  const interes = Number(prestamo.interes_porcentaje ?? 0)
  const total = Number(
    prestamo.total_con_interes ??
    calcularTotalConInteres(Number(prestamo.monto), interes)
  )

  return {
    id: String(prestamo.id),
    empleadoId: prestamo.empleado_id ? String(prestamo.empleado_id) : '',
    monto: Number(prestamo.monto),
    interesPorcentaje: interes,
    totalConInteres: total,
    cuotas: cuotasTotales,
    cuotasPagadas,
    cuotasRestantes,
    montoCuota: cuotasTotales > 0 ? Number((total / cuotasTotales).toFixed(2)) : 0,
    fechaOtorgamiento: prestamo.fecha_inicio,
    fechaFin: prestamo.fecha_fin,
    activo: prestamo.activo ?? true,
    estado: calcularEstadoPrestamo(prestamo.activo ?? true, cuotasPagadas, cuotasTotales),
    observaciones: ''
  }
}

export const mapPrestamoToPrestamoInsert = (
  prestamo: CreatePrestamoInput
): PrestamoInsert => {
  const monto = Number(prestamo.monto ?? 0)
  const interes = Number(prestamo.interesPorcentaje ?? 5)

  return {
    empleado_id: prestamo.empleadoId ? Number(prestamo.empleadoId) : null,
    monto,
    interes_porcentaje: interes,
    fecha_inicio: prestamo.fechaOtorgamiento || new Date().toISOString().split('T')[0],
    fecha_fin: prestamo.fechaFin || new Date().toISOString().split('T')[0],
    total_con_interes: calcularTotalConInteres(monto, interes),
    activo: prestamo.activo ?? true
  }
}

export const mapPrestamoToPrestamoUpdate = (
  prestamo: UpdatePrestamoInput
): PrestamoUpdate => {
  const updateData: PrestamoUpdate = {}

  if (prestamo.empleadoId !== undefined) {
    updateData.empleado_id = prestamo.empleadoId ? Number(prestamo.empleadoId) : null
  }

  if (prestamo.monto !== undefined) {
    updateData.monto = Number(prestamo.monto)
  }

  if (prestamo.interesPorcentaje !== undefined) {
    updateData.interes_porcentaje = Number(prestamo.interesPorcentaje)
  }

  if (prestamo.fechaOtorgamiento !== undefined) {
    updateData.fecha_inicio = prestamo.fechaOtorgamiento
  }

  if (prestamo.fechaFin !== undefined) {
    updateData.fecha_fin = prestamo.fechaFin
  }

  if (prestamo.activo !== undefined) {
    updateData.activo = prestamo.activo
  }

  if (
    prestamo.monto !== undefined ||
    prestamo.interesPorcentaje !== undefined
  ) {
    updateData.total_con_interes = calcularTotalConInteres(
      Number(prestamo.monto ?? 0),
      Number(prestamo.interesPorcentaje ?? 5)
    )
  }

  return updateData
}

const buildCuotasInsert = (
  prestamoId: number,
  monto: number,
  interesPorcentaje: number,
  cuotas: number
): CuotaPrestamoInsert[] => {
  const montoCuota = calcularMontoCuota(monto, interesPorcentaje, cuotas)

  return Array.from({ length: cuotas }, (_, index) => ({
    prestamo_id: prestamoId,
    numero_cuota: index + 1,
    monto: montoCuota,
    pagada: false,
    fecha_pago: null
  }))
}

export const replaceCuotasByPrestamoId = async (
  prestamoId: number,
  monto: number,
  interesPorcentaje: number,
  cuotas: number
) => {
  const { error: deleteError } = await supabase
    .from('cuotas_prestamo')
    .delete()
    .eq('prestamo_id', prestamoId)

  if (deleteError) throw deleteError

  const insertData = buildCuotasInsert(prestamoId, monto, interesPorcentaje, cuotas)

  if (!insertData.length) return

  const { error: insertError } = await supabase
    .from('cuotas_prestamo')
    .insert(insertData)

  if (insertError) throw insertError
}

export const createPrestamo = async (prestamoData: CreatePrestamoInput) => {
  try {
    const validationError = validarPrestamo(prestamoData)

    if (validationError) throw new Error(validationError)

    const insertData = mapPrestamoToPrestamoInsert(prestamoData)

    const { data, error } = await supabase
      .from('prestamos')
      .insert(insertData)
      .select('*')
      .single()

    if (error) throw error

    await replaceCuotasByPrestamoId(
      data.id,
      Number(prestamoData.monto),
      Number(prestamoData.interesPorcentaje ?? 5),
      Number(prestamoData.cuotas)
    )

    const cuotas = await getCuotasByPrestamoId(data.id)

    return {
      data: mapPrestamoDBToPrestamo(data, cuotas),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear el préstamo'
    console.error('Error creating prestamo:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const getAllPrestamos = async () => {
  try {
    const { data, error } = await supabase
      .from('prestamos')
      .select('*')
      .order('fecha_inicio', { ascending: false })

    if (error) throw error

    const prestamos = await Promise.all(
      (data ?? []).map(async (prestamo) => {
        const cuotas = await getCuotasByPrestamoId(prestamo.id)
        return mapPrestamoDBToPrestamo(prestamo, cuotas)
      })
    )

    return {
      data: prestamos,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener préstamos'
    console.error('Error fetching prestamos:', error)

    return {
      data: [] as Prestamo[],
      error: message
    }
  }
}

export const updatePrestamo = async (
  id: number,
  prestamoData: UpdatePrestamoInput
) => {
  try {
    const updateData = mapPrestamoToPrestamoUpdate(prestamoData)

    const { data, error } = await supabase
      .from('prestamos')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    if (
      prestamoData.monto !== undefined ||
      prestamoData.interesPorcentaje !== undefined ||
      prestamoData.cuotas !== undefined
    ) {
      await replaceCuotasByPrestamoId(
        id,
        Number(prestamoData.monto ?? data.monto),
        Number(prestamoData.interesPorcentaje ?? data.interes_porcentaje ?? 5),
        Number(prestamoData.cuotas ?? 1)
      )
    }

    const cuotas = await getCuotasByPrestamoId(id)

    return {
      data: mapPrestamoDBToPrestamo(data, cuotas),
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el préstamo'
    console.error('Error updating prestamo:', error)

    return {
      data: null,
      error: message
    }
  }
}

export const deletePrestamo = async (id: number) => {
  try {
    const { error } = await supabase
      .from('prestamos')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar el préstamo'
    console.error('Error deleting prestamo:', error)

    return {
      success: false,
      error: message
    }
  }
}

export const pagarCuotaPrestamo = async (prestamoId: number) => {
  try {
    const cuotas = await getCuotasByPrestamoId(prestamoId)
    const cuotaPendiente = cuotas.find((cuota) => !cuota.pagada)

    if (!cuotaPendiente) {
      throw new Error('El préstamo no tiene cuotas pendientes.')
    }

    const { error } = await supabase
      .from('cuotas_prestamo')
      .update({
        pagada: true,
        fecha_pago: new Date().toISOString().split('T')[0]
      })
      .eq('id', cuotaPendiente.id)

    if (error) throw error

    const cuotasActualizadas = await getCuotasByPrestamoId(prestamoId)

    if (cuotasActualizadas.every((cuota) => cuota.pagada)) {
      await supabase
        .from('prestamos')
        .update({ activo: false })
        .eq('id', prestamoId)
    }

    return {
      success: true,
      error: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al pagar cuota'
    console.error('Error paying cuota:', error)

    return {
      success: false,
      error: message
    }
  }
}

export const revertirUltimaCuotaPrestamo = async (
  prestamoId: number
) => {
  try {
    const cuotas = await getCuotasByPrestamoId(prestamoId)

    const ultimaPagada = [...cuotas]
      .filter((c) => c.pagada)
      .sort(
        (a, b) =>
          (b.numero_cuota ?? 0) -
          (a.numero_cuota ?? 0)
      )[0]

    if (!ultimaPagada) {
      throw new Error(
        'No existen cuotas pagadas para revertir.'
      )
    }

    const { error } = await supabase
      .from('cuotas_prestamo')
      .update({
        pagada: false,
        fecha_pago: null
      })
      .eq('id', ultimaPagada.id)

    if (error) throw error

    await supabase
      .from('prestamos')
      .update({
        activo: true
      })
      .eq('id', prestamoId)

    return {
      success: true,
      error: null
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al revertir pago'

    return {
      success: false,
      error: message
    }
  }
}