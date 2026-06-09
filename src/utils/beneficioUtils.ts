import type { Beneficio, Factura } from '../types'

export const normalizarTextoBeneficio = (value?: string | null) => {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}

export const validarBeneficio = (beneficio: Partial<Beneficio>) => {
  if (!beneficio.empleadoId) {
    return 'Debe seleccionar un empleado.'
  }

  if (!beneficio.tipo) {
    return 'Debe seleccionar un tipo de beneficio.'
  }

  if (!beneficio.descripcion || normalizarTextoBeneficio(beneficio.descripcion).length < 3) {
    return 'La descripción debe tener al menos 3 caracteres.'
  }

  if (!beneficio.monto || beneficio.monto <= 0) {
    return 'El monto debe ser mayor a 0.'
  }

  if (!beneficio.fecha) {
    return 'Debe seleccionar una fecha.'
  }

  return null
}

export const validarFactura = (factura: Partial<Factura>) => {
  if (!factura.numero || normalizarTextoBeneficio(factura.numero).length < 2) {
    return 'El número de factura es obligatorio.'
  }

  if (!factura.proveedor || normalizarTextoBeneficio(factura.proveedor).length < 2) {
    return 'El proveedor es obligatorio.'
  }

  if (!factura.monto || factura.monto <= 0) {
    return 'El monto de la factura debe ser mayor a 0.'
  }

  if (!factura.fecha) {
    return 'La fecha de la factura es obligatoria.'
  }

  return null
}