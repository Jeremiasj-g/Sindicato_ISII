import { useMemo, useState } from 'react'
import {
    CheckCircle,
    DollarSign,
    Download,
    Edit,
    Plus,
    Search,
    RotateCcw
} from 'lucide-react'
import type { Prestamo } from '../../types'
import { useData } from '../../context/DataContext'
import { PrestamoModal } from '../modals/PrestamoModal'
import { exportToCSV, preparePrestamosForExport } from '../../utils/exportUtils'

export function PrestamosPage() {
    const {
        prestamos,
        empleados,
        loadingPrestamos,
        errorPrestamos,
        pagarCuotaPrestamo,
        revertirUltimaCuotaPrestamo
    } = useData()

    const [searchQuery, setSearchQuery] = useState('')
    const [filterEstado, setFilterEstado] = useState('todos')
    const [showModal, setShowModal] = useState(false)
    const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null)

    const getEmpleadoName = (empleadoId: string) => {
        const empleado = empleados.find((emp) => emp.id === empleadoId)
        return empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no encontrado'
    }

    const filteredPrestamos = useMemo(() => {
        const term = searchQuery.trim().toLowerCase()

        return prestamos.filter((prestamo) => {
            const empleadoName = getEmpleadoName(prestamo.empleadoId).toLowerCase()
            const matchesSearch = !term || empleadoName.includes(term)
            const matchesEstado = filterEstado === 'todos' || prestamo.estado === filterEstado

            return matchesSearch && matchesEstado
        })
    }, [prestamos, searchQuery, filterEstado])

    const stats = {
        total: prestamos.length,
        activos: prestamos.filter((p) => p.estado === 'activo').length,
        finalizados: prestamos.filter((p) => p.estado === 'finalizado').length,
        montoActivo: prestamos
            .filter((p) => p.estado === 'activo')
            .reduce((sum, p) => sum + (p.cuotasRestantes * p.montoCuota), 0)
    }

    const handleAddPrestamo = () => {
        setSelectedPrestamo(null)
        setShowModal(true)
    }

    const handleEditPrestamo = (prestamo: Prestamo) => {
        setSelectedPrestamo(prestamo)
        setShowModal(true)
    }

    const handlePagarCuota = async (prestamo: Prestamo) => {
        const confirmar = window.confirm(
            `¿Confirmás el pago de una cuota del préstamo de "${getEmpleadoName(prestamo.empleadoId)}"?`
        )

        if (!confirmar) return

        const result = await pagarCuotaPrestamo(prestamo.id)

        if (!result.success) {
            window.alert(result.error ?? 'No se pudo pagar la cuota.')
        }
    }

    const handleExport = () => {
        const data = preparePrestamosForExport(filteredPrestamos, empleados)
        exportToCSV(data, `prestamos_${new Date().toISOString().split('T')[0]}`)
    }

    const getEstadoColor = (estado: Prestamo['estado']) => {
        const colors = {
            activo: 'bg-green-100 text-green-800',
            finalizado: 'bg-blue-100 text-blue-800',
            moroso: 'bg-red-100 text-red-800'
        }

        return colors[estado] || 'bg-gray-100 text-gray-800'
    }

    const handleRevertirPago = async (
        prestamo: Prestamo
    ) => {
        const confirmar = window.confirm(
            `¿Desea revertir el último pago del préstamo de "${getEmpleadoName(prestamo.empleadoId)}"?`
        )

        if (!confirmar) return

        const result =
            await revertirUltimaCuotaPrestamo(
                prestamo.id
            )

        if (!result.success) {
            window.alert(
                result.error ??
                'No se pudo revertir el pago.'
            )
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Préstamos</h2>
                    <p className="text-gray-600">
                        Administra préstamos, cuotas y pagos de empleados afiliados
                    </p>
                </div>

                <button
                    onClick={handleAddPrestamo}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Préstamo</span>
                </button>
            </div>

            {errorPrestamos && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                    {errorPrestamos}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-600">Total Préstamos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-600">Finalizados</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.finalizados}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-600">Monto Pendiente</p>
                    <p className="text-2xl font-bold text-purple-600">
                        ${stats.montoActivo.toLocaleString('es-AR')}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por empleado..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="moroso">Moroso</option>
                    </select>

                    <button
                        onClick={handleExport}
                        disabled={filteredPrestamos.length === 0}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        <span>Exportar</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Empleado</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Monto</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Total</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Cuotas</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Monto Cuota</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fecha</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {filteredPrestamos.map((prestamo) => (
                                <tr key={prestamo.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {getEmpleadoName(prestamo.empleadoId)}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        ${prestamo.monto.toLocaleString('es-AR')}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        ${prestamo.totalConInteres.toLocaleString('es-AR')}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
                                        {prestamo.cuotasPagadas}/{prestamo.cuotas}
                                        {prestamo.cuotasPagadas > 0 && (
                                            <button
                                                onClick={() =>
                                                    void handleRevertirPago(prestamo)
                                                }
                                                className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                                                title="Revertir último pago"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        ${prestamo.montoCuota.toLocaleString('es-AR')}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(`${prestamo.fechaOtorgamiento}T00:00:00`).toLocaleDateString('es-AR')}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(prestamo.estado)}`}>
                                            {prestamo.estado}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {prestamo.estado === 'activo' && (
                                                <button
                                                    onClick={() => void handlePagarCuota(prestamo)}
                                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                                    title="Pagar cuota"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleEditPrestamo(prestamo)}
                                                className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {loadingPrestamos && (
                    <div className="text-center py-12 text-gray-500">
                        Cargando préstamos...
                    </div>
                )}

                {!loadingPrestamos && filteredPrestamos.length === 0 && (
                    <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No se encontraron préstamos</p>
                    </div>
                )}


            </div>

            {showModal && (
                <PrestamoModal
                    prestamo={selectedPrestamo}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}