export const normalizarNombreEmpresa = (nombre?: string | null) => {
  return (nombre ?? '').trim().replace(/\s+/g, ' ')
}

export const validarNombreEmpresa = (nombre?: string | null) => {
  const nombreNormalizado = normalizarNombreEmpresa(nombre)

  if (!nombreNormalizado) {
    return 'El nombre de la empresa es obligatorio.'
  }

  if (nombreNormalizado.length < 2) {
    return 'El nombre de la empresa debe tener al menos 2 caracteres.'
  }

  if (nombreNormalizado.length > 100) {
    return 'El nombre de la empresa no puede superar los 100 caracteres.'
  }

  return null
}