import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  type Failure = {
    table: string
    operation: string
    message: string
  }

  const createBaseState = () => ({
    tables: {
      empresas: [
        { id: 1, nombre: 'Aguas de Corrientes' }
      ],
      empleados: [
        {
          id: 1,
          numero_afiliado: 1000,
          nombre_completo: 'Empleado Base',
          dni: '30000000',
          cuil: '20-30000000-3',
          legajo: 'BASE-001',
          domicilio: 'Base 123',
          email: 'base@test.com',
          empresa_id: 1,
          localidad_id: null,
          cargo_sindicato_id: null,
          afiliado: true,
          activo: true,
          fecha_alta: '2026-01-01',
          fecha_baja: null
        }
      ],
      beneficios: [],
      prestamos: [],
      cuotas_prestamo: []
    } as Record<string, any[]>,
    nextIds: {
      empresas: 2,
      empleados: 2,
      beneficios: 1,
      prestamos: 1,
      cuotas_prestamo: 1
    } as Record<string, number>,
    failures: [] as Failure[]
  })

  let state = createBaseState()

  const insertCalls: Array<{ table: string; payload: any }> = []
  const rpcCalls: Array<{ functionName: string; params: any }> = []

  const resetState = () => {
    state = createBaseState()
    insertCalls.length = 0
    rpcCalls.length = 0
  }

  const setFailure = (failure: Failure) => {
    state.failures.push(failure)
  }

  const findFailure = (table: string, operation: string) => {
    const index = state.failures.findIndex(
      (failure) => failure.table === table && failure.operation === operation
    )

    if (index === -1) return null

    const [failure] = state.failures.splice(index, 1)

    return {
      message: failure.message,
      details: failure.message,
      code: 'MOCK_ERROR'
    }
  }

  const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

  const applyFilters = (rows: any[], filters: Array<{ column: string; value: any }>) => {
    return rows.filter((row) =>
      filters.every((filter) => row[filter.column] === filter.value)
    )
  }

  const enforceInsertConstraints = (table: string, row: any) => {
    const rows = state.tables[table] ?? []

    if (table === 'empleados') {
      if (rows.some((item) => item.dni === row.dni)) {
        throw new Error('duplicate key value violates unique constraint empleados_dni_key')
      }

      if (rows.some((item) => item.cuil === row.cuil)) {
        throw new Error('duplicate key value violates unique constraint empleados_cuil_key')
      }

      if (
        row.numero_afiliado !== null &&
        row.numero_afiliado !== undefined &&
        rows.some((item) => item.numero_afiliado === row.numero_afiliado)
      ) {
        throw new Error('duplicate key value violates unique constraint empleados_numero_afiliado_key')
      }
    }
  }

  class SupabaseQueryMock {
    private table: string
    private operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
    private filters: Array<{ column: string; value: any }> = []
    private payload: any = null
    private orderBy: { column: string; ascending: boolean } | null = null
    private limitCount: number | null = null
    private returning = false

    constructor(table: string) {
      this.table = table
    }

    select() {
      if (this.operation !== 'select') {
        this.returning = true
      }

      return this
    }

    insert(payload: any) {
      this.operation = 'insert'
      this.payload = Array.isArray(payload) ? payload : [payload]

      insertCalls.push({
        table: this.table,
        payload
      })

      return this
    }

    update(payload: any) {
      this.operation = 'update'
      this.payload = payload
      return this
    }

    delete() {
      this.operation = 'delete'
      return this
    }

    eq(column: string, value: any) {
      this.filters.push({ column, value })
      return this
    }

    order(column: string, options: { ascending?: boolean } = {}) {
      this.orderBy = {
        column,
        ascending: options.ascending !== false
      }

      return this
    }

    limit(value: number) {
      this.limitCount = value
      return this
    }

    maybeSingle() {
      return this.executeSingle(false)
    }

    single() {
      return this.executeSingle(true)
    }

    then(resolve: any, reject: any) {
      return this.execute().then(resolve, reject)
    }

    private getRows() {
      return state.tables[this.table] ?? []
    }

    private getSelectedRows() {
      let rows = clone(this.getRows())

      rows = applyFilters(rows, this.filters)

      if (this.orderBy) {
        rows.sort((a, b) => {
          const av = a[this.orderBy!.column]
          const bv = b[this.orderBy!.column]

          if (av === bv) return 0

          if (av > bv) return this.orderBy!.ascending ? 1 : -1
          return this.orderBy!.ascending ? -1 : 1
        })
      }

      if (this.limitCount !== null) {
        rows = rows.slice(0, this.limitCount)
      }

      return rows
    }

    private async executeSingle(required: boolean) {
      const result = await this.execute()
      const data = Array.isArray(result.data) ? result.data[0] : result.data

      if (required && !data) {
        return {
          data: null,
          error: {
            message: 'No rows found',
            details: 'No rows found',
            code: 'MOCK_EMPTY'
          }
        }
      }

      return {
        data: data ?? null,
        error: result.error
      }
    }

    private async execute() {
      const forcedError = findFailure(this.table, this.operation)

      if (forcedError) {
        return {
          data: null,
          error: forcedError
        }
      }

      try {
        if (this.operation === 'select') {
          return {
            data: this.getSelectedRows(),
            error: null
          }
        }

        if (this.operation === 'insert') {
          const inserted = this.payload.map((item: any) => {
            const row = clone(item)

            if (!row.id) {
              row.id = state.nextIds[this.table] ?? 1
              state.nextIds[this.table] = row.id + 1
            }

            enforceInsertConstraints(this.table, row)

            state.tables[this.table] = state.tables[this.table] ?? []
            state.tables[this.table].push(row)

            return clone(row)
          })

          return {
            data: this.returning ? inserted : null,
            error: null
          }
        }

        if (this.operation === 'update') {
          const rows = state.tables[this.table] ?? []
          const updated: any[] = []

          state.tables[this.table] = rows.map((row) => {
            const matches = applyFilters([row], this.filters).length > 0

            if (!matches) return row

            const newRow = {
              ...row,
              ...clone(this.payload)
            }

            updated.push(newRow)

            return newRow
          })

          return {
            data: this.returning ? updated : null,
            error: null
          }
        }

        if (this.operation === 'delete') {
          const rows = state.tables[this.table] ?? []

          state.tables[this.table] = rows.filter(
            (row) => applyFilters([row], this.filters).length === 0
          )

          return {
            data: null,
            error: null
          }
        }

        return {
          data: null,
          error: null
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error mock'

        return {
          data: null,
          error: {
            message,
            details: message,
            code: 'MOCK_ERROR'
          }
        }
      }
    }
  }

  const supabaseMock = {
    from: vi.fn((table: string) => new SupabaseQueryMock(table)),

    rpc: vi.fn((functionName: string, params: any) => {
      rpcCalls.push({
        functionName,
        params
      })

      const forcedError = findFailure(functionName, 'rpc')

      if (forcedError) {
        return Promise.resolve({
          data: null,
          error: forcedError
        })
      }

      if (functionName === 'sp_crear_beneficio') {
        const row = {
          id: state.nextIds.beneficios++,
          empleado_id: params.p_empleado_id,
          tipo_beneficio_id: params.p_tipo_beneficio_id,
          monto: params.p_monto,
          descripcion: params.p_descripcion,
          fecha_otorgado: params.p_fecha_otorgado,
          estado: params.p_estado ?? 'pendiente',
          beneficiario: params.p_beneficiario ?? null,
          observaciones: params.p_observaciones ?? null
        }

        state.tables.beneficios.push(row)

        return Promise.resolve({
          data: clone(row),
          error: null
        })
      }

      return Promise.resolve({
        data: null,
        error: null
      })
    })
  }

  return {
    resetState,
    setFailure,
    insertCalls,
    rpcCalls,
    supabaseMock
  }
})

vi.mock('../lib/config/supabase', () => ({
  supabase: mocks.supabaseMock
}))

import { createEmpleado } from '../lib/controllers/empleado.controller'
import { createBeneficio } from '../lib/controllers/beneficio.controller'
import { PrestamoFacade } from '../lib/facades/prestamo.facade'

describe('Operaciones críticas - Empleados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.resetState()
  })

  it('debe crear un empleado válido', async () => {
    const result = await createEmpleado({
      id: '',
      numeroAfiliado: 1001,
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '42111222',
      cuil: '20-42111222-3',
      legajo: 'ACO-001',
      domicilio: 'San Martín 123',
      telefono: '',
      email: 'juan@test.com',
      empresaId: '1',
      localidadId: '',
      cargoSindicatoId: '',
      afiliado: true,
      activo: true,
      fechaAlta: '2026-06-10'
    } as any)

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(mocks.supabaseMock.from).toHaveBeenCalledWith('empleados')
  })

  it('debe rechazar DNI duplicado', async () => {
    const result = await createEmpleado({
      id: '',
      numeroAfiliado: 1002,
      nombre: 'Pedro',
      apellido: 'Duplicado',
      dni: '30000000',
      cuil: '20-42111222-4',
      legajo: 'ACO-002',
      domicilio: 'Casa 123',
      empresaId: '1',
      afiliado: true,
      activo: true,
      fechaAlta: '2026-06-10'
    } as any)

    expect(result.error).toBe('Error al crear el empleado')
    expect(result.data).toBeNull()
  })

  it('debe rechazar CUIL duplicado', async () => {
    const result = await createEmpleado({
      id: '',
      numeroAfiliado: 1003,
      nombre: 'Carlos',
      apellido: 'Duplicado',
      dni: '42111223',
      cuil: '20-30000000-3',
      legajo: 'ACO-003',
      domicilio: 'Casa 456',
      empresaId: '1',
      afiliado: true,
      activo: true,
      fechaAlta: '2026-06-10'
    } as any)

    expect(result.error).toBe('Error al crear el empleado')
    expect(result.data).toBeNull()
  })

  it('debe propagar error de base al crear empleado', async () => {
    mocks.setFailure({
      table: 'empleados',
      operation: 'insert',
      message: 'Error al crear empleado'
    })

    const result = await createEmpleado({
      id: '',
      numeroAfiliado: 1004,
      nombre: 'Error',
      apellido: 'Base',
      dni: '42111224',
      cuil: '20-42111224-3',
      legajo: 'ACO-004',
      domicilio: 'Casa 789',
      empresaId: '1',
      afiliado: true,
      activo: true,
      fechaAlta: '2026-06-10'
    } as any)

    expect(result.error).toBe('Error al crear el empleado')
    expect(result.data).toBeNull()
  })
})

describe('Operaciones críticas - Beneficios con procedimiento almacenado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.resetState()
  })

  const beneficioValido = {
    id: '',
    empleadoId: '1',
    tipo: '1',
    monto: 50000,
    descripcion: 'Beneficio de prueba',
    fecha: '2026-06-10',
    estado: 'pendiente',
    beneficiario: 'Empleado Test',
    observaciones: ''
  }

  it('debe crear un beneficio válido usando RPC', async () => {
    const result = await createBeneficio(beneficioValido as any)

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()

    expect(mocks.supabaseMock.rpc).toHaveBeenCalledWith(
      'sp_crear_beneficio',
      expect.objectContaining({
        p_empleado_id: 1,
        p_tipo_beneficio_id: 1,
        p_monto: 50000,
        p_descripcion: 'Beneficio de prueba',
        p_estado: 'pendiente'
      })
    )
  })

  it('debe rechazar beneficio sin empleado', async () => {
    const result = await createBeneficio({
      ...beneficioValido,
      empleadoId: ''
    } as any)

    expect(result.error).toBe('Debe seleccionar un empleado.')
    expect(result.data).toBeNull()
  })

  it('debe rechazar beneficio sin tipo', async () => {
    const result = await createBeneficio({
      ...beneficioValido,
      tipo: ''
    } as any)

    expect(result.error).toBe('Debe seleccionar un tipo de beneficio.')
    expect(result.data).toBeNull()
  })

  it('debe rechazar monto inválido', async () => {
    const result = await createBeneficio({
      ...beneficioValido,
      monto: 0
    } as any)

    expect(result.error).toBe('El monto debe ser mayor a 0.')
    expect(result.data).toBeNull()
  })

  it('debe rechazar fecha vacía', async () => {
    const result = await createBeneficio({
      ...beneficioValido,
      fecha: ''
    } as any)

    expect(result.error).toBe('Debe seleccionar una fecha.')
    expect(result.data).toBeNull()
  })

  it('debe propagar error del procedimiento almacenado', async () => {
    mocks.setFailure({
      table: 'sp_crear_beneficio',
      operation: 'rpc',
      message: 'Error RPC al crear beneficio'
    })

    const result = await createBeneficio(beneficioValido as any)

    expect(result.error).toBe('Error al crear beneficio')
    expect(result.data).toBeNull()
  })
})

describe('Operaciones críticas - Préstamos con fachada', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.resetState()
  })

  const prestamoValido = {
    id: '',
    empleadoId: '1',
    monto: 100000,
    interesPorcentaje: 5,
    cuotas: 5,
    fechaOtorgamiento: '2026-06-10',
    fechaFin: '2026-11-10',
    activo: true,
    estado: 'activo',
    observaciones: ''
  }

  it('debe crear un préstamo válido y generar cuotas', async () => {
    const result = await PrestamoFacade.crear(prestamoValido as any)

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data?.totalConInteres).toBe(105000)
    expect(result.data?.montoCuota).toBe(21000)
    expect(result.data?.cuotas).toBe(5)

    const cuotasInsert = mocks.insertCalls.find(
      (call) => call.table === 'cuotas_prestamo'
    )

    expect(cuotasInsert).toBeDefined()
    expect(cuotasInsert?.payload).toHaveLength(5)
  })

  it('debe rechazar préstamo sin empleado', async () => {
    const result = await PrestamoFacade.crear({
      ...prestamoValido,
      empleadoId: ''
    } as any)

    expect(result.error).toBe('Debe seleccionar un empleado.')
    expect(result.data).toBeNull()
  })

  it('debe rechazar monto inválido', async () => {
    const result = await PrestamoFacade.crear({
      ...prestamoValido,
      monto: 0
    } as any)

    expect(result.error).toBe('El monto del préstamo debe ser mayor a 0.')
    expect(result.data).toBeNull()
  })

  it('debe rechazar cantidad de cuotas inválida', async () => {
    const result = await PrestamoFacade.crear({
      ...prestamoValido,
      cuotas: 0
    } as any)

    expect(result.error).toBe('La cantidad de cuotas debe ser mayor a 0.')
    expect(result.data).toBeNull()
  })

  it('debe rechazar fecha final anterior a la fecha de otorgamiento', async () => {
    const result = await PrestamoFacade.crear({
      ...prestamoValido,
      fechaFin: '2026-01-01'
    } as any)

    expect(result.error).toBe(
      'La fecha de finalización no puede ser anterior a la fecha de otorgamiento.'
    )
    expect(result.data).toBeNull()
  })

  it('debe calcular correctamente préstamo con interés personalizado', async () => {
    const result = await PrestamoFacade.crear({
      ...prestamoValido,
      monto: 200000,
      interesPorcentaje: 10,
      cuotas: 4,
      fechaFin: '2026-10-10'
    } as any)

    expect(result.error).toBeNull()
    expect(result.data?.totalConInteres).toBe(220000)
    expect(result.data?.montoCuota).toBe(55000)
    expect(result.data?.cuotas).toBe(4)
  })

  it('debe propagar error al generar cuotas', async () => {
    mocks.setFailure({
      table: 'cuotas_prestamo',
      operation: 'insert',
      message: 'Error al generar cuotas'
    })

    const result = await PrestamoFacade.crear(prestamoValido as any)

    expect(result.error).toBe('Error al crear el préstamo')
    expect(result.data).toBeNull()
  })
})