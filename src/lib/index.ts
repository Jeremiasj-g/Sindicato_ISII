// Main library exports
// Import from here for cleaner imports throughout the application

// Config exports
export * from './config/supabase'

// Controller exports
export * from './controllers/empleado.controller'
export * from './controllers/familiar.controller'
export * from './controllers/empresa.controller'
export * from './controllers/beneficio.controller'
export * from './controllers/tipo-beneficio.controller'
export * from './controllers/prestamo.controller'
export * from './controllers/usuario.controller'

// Type exports
export * from './types/database.types'
export * from './types/empresas.types'
export * from './types/beneficios.types'
export * from './types/prestamos.types'
export * from './types/usuarios.types'

// Facade export
export * from './facades/prestamo.facade'