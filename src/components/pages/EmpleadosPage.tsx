import { useMemo, useState } from 'react'
import { Search, Plus, Filter, Download, Edit, Eye, Trash2, Users } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Empleado } from '../../types'
import { EmpleadoModal } from '../modals/EmpleadoModal'

export function EmpleadosPage() {
  const {
    empleados,
    searchEmpleados,
    deleteEmpleado,
    loadingEmpleados,
    errorEmpleados
  } = useData()

  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [filterAfiliado, setFilterAfiliado] = useState<'todos' | 'afiliados' | 'no_afiliados'>('todos')

  const filteredEmpleados = useMemo(() => {
    let result = searchQuery ? searchEmpleados(searchQuery) : empleados

    if (filterAfiliado !== 'todos') {
      result = result.filter((emp) => (
        filterAfiliado === 'afiliados' ? emp.esAfiliado : !emp.esAfiliado
      ))
    }

    return result
  }, [empleados, filterAfiliado, searchEmpleados, searchQuery])

  const handleAddEmpleado = () => {
    setSelectedEmpleado(null)
    setShowModal(true)
  }

  const handleEditEmpleado = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setShowModal(true)
  }

  const handleViewEmpleado = (empleado: Empleado) => {
    console.log('Ver empleado:', empleado)
  }

  const handleDeleteEmpleado = async (empleado: Empleado) => {
    const confirmar = window.confirm(
      `¿Seguro que querés dar de baja a ${empleado.nombre} ${empleado.apellido}?`
    )

    if (!confirmar) return

    const { success, error } = await deleteEmpleado(empleado.id)

    if (!success) {
      window.alert(error ?? 'No se pudo dar de baja al empleado.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
          <p className="text-gray-600">Administra empleados, afiliados y sus datos familiares</p>
        </div>
        <button
          onClick={handleAddEmpleado}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, CUIL o legajo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterAfiliado}
              onChange={(e) => setFilterAfiliado(e.target.value as 'todos' | 'afiliados' | 'no_afiliados')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="afiliados">Solo Afiliados</option>
              <option value="no_afiliados">No Afiliados</option>
            </select>
          </div>

          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {errorEmpleados && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {errorEmpleados}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">N° Afiliado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Empleado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">DNI/CUIL</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Legajo</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Empresa</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmpleados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {empleado.esAfiliado ? empleado.numeroAfiliado : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {empleado.nombre} {empleado.apellido}
                      </p>
                      <p className="text-xs text-gray-500">{empleado.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{empleado.dni}</p>
                      <p className="text-xs text-gray-500">{empleado.cuil}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{empleado.legajo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{empleado.empresa}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        empleado.esAfiliado
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {empleado.esAfiliado ? 'Afiliado' : 'No Afiliado'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        empleado.estadoLaboral === 'activo'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {empleado.estadoLaboral}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewEmpleado(empleado)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditEmpleado(empleado)}
                        className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDeleteEmpleado(empleado)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loadingEmpleados && filteredEmpleados.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron empleados</p>
          </div>
        )}

        {loadingEmpleados && (
          <div className="text-center py-12 text-gray-500">Cargando empleados...</div>
        )}
      </div>

      {showModal && (
        <EmpleadoModal
          empleado={selectedEmpleado}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}