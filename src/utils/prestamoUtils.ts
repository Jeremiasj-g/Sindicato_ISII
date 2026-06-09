import type { Prestamo } from '../types'

export const calcularTotalConInteres = (monto: number, interesPorcentaje: number) => {
  return Number((monto + (monto * interesPorcentaje / 100)).toFixed(2))
}

export const calcularMontoCuota = (
  monto: number,
  interesPorcentaje: number,
  cuotas: number
) => {
  if (!cuotas || cuotas <= 0) return 0

  const total = calcularTotalConInteres(monto, interesPorcentaje)
  return Number((total / cuotas).toFixed(2))
}

export const calcularEstadoPrestamo = (
  activo: boolean,
  cuotasPagadas: number,
  cuotas: number
): Prestamo['estado'] => {
  if (!activo || cuotasPagadas >= cuotas) return 'finalizado'
  return 'activo'
}

export const validarPrestamo = (prestamo: Partial<Prestamo>) => {
  if (!prestamo.empleadoId) return 'Debe seleccionar un empleado.'

  if (!prestamo.monto || prestamo.monto <= 0) {
    return 'El monto del préstamo debe ser mayor a 0.'
  }

  if (!prestamo.cuotas || prestamo.cuotas <= 0) {
    return 'La cantidad de cuotas debe ser mayor a 0.'
  }

  if (!prestamo.fechaOtorgamiento) {
    return 'Debe seleccionar la fecha de otorgamiento.'
  }

  if (!prestamo.fechaFin) {
    return 'Debe seleccionar la fecha de finalización.'
  }

  if (prestamo.fechaFin < prestamo.fechaOtorgamiento) {
    return 'La fecha de finalización no puede ser anterior a la fecha de otorgamiento.'
  }

  return null
}