import { useEffect, useMemo, useState } from 'react'
import { Building2, Edit, Plus, Search, Trash2 } from 'lucide-react'
import type { Empresa } from '../../types'
import {
  createEmpresa,
  deleteEmpresa,
  getAllEmpresas,
  updateEmpresa
} from '../../lib/controllers/empresa.controller'
import { EmpresaModal } from '../modals/EmpresaModal'

export function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)

  const filteredEmpresas = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    if (!term) return empresas

    return empresas.filter((empresa) =>
      empresa.nombre.toLowerCase().includes(term)
    )
  }, [empresas, searchQuery])

  const refreshEmpresas = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await getAllEmpresas()

    if (error) {
      setError(error)
      setEmpresas([])
    } else {
      setEmpresas(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    void refreshEmpresas()
  }, [])

  const handleAddEmpresa = () => {
    setSelectedEmpresa(null)
    setShowModal(true)
  }

  const handleEditEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa)
    setShowModal(true)
  }

  const handleSaveEmpresa = async (empresaData: Partial<Empresa>) => {
    const result = selectedEmpresa
      ? await updateEmpresa(Number(selectedEmpresa.id), empresaData)
      : await createEmpresa({ nombre: empresaData.nombre ?? '' })

    if (result.error) {
      window.alert(result.error)
      return
    }

    await refreshEmpresas()
    setShowModal(false)
    setSelectedEmpresa(null)
  }

  const handleDeleteEmpresa = async (empresa: Empresa) => {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la empresa "${empresa.nombre}"?`
    )

    if (!confirmar) return

    const { success, error } = await deleteEmpresa(Number(empresa.id))

    if (!success) {
      window.alert(error ?? 'No se pudo eliminar la empresa.')
      return
    }

    await refreshEmpresas()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h2>
          <p className="text-gray-600">
            Administra las empresas vinculadas a empleados y afiliados
          </p>
        </div>

        <button
          onClick={handleAddEmpresa}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Empresa</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresa por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Empresa
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredEmpresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      #{empresa.id}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {empresa.nombre}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditEmpresa(empresa)}
                        className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => void handleDeleteEmpresa(empresa)}
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

        {!loading && filteredEmpresas.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron empresas</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-500">
            Cargando empresas...
          </div>
        )}
      </div>

      {showModal && (
        <EmpresaModal
          empresa={selectedEmpresa}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEmpresa}
        />
      )}
    </div>
  )
}