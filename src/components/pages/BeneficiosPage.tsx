import React, { useState } from 'react';
import { Plus, Filter, Download, Calendar, DollarSign, FileText, Eye, Edit, Check, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Beneficio } from '../../types';
import { BeneficioModal } from '../modals/BeneficioModal';

export function BeneficiosPage() {
  const { beneficios, empleados, updateBeneficio } = useData();
  const [showModal, setShowModal] = useState(false);
  const [selectedBeneficio, setSelectedBeneficio] = useState<Beneficio | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const filteredBeneficios = React.useMemo(() => {
    return beneficios.filter(beneficio => {
      const matchesTipo = filterTipo === 'todos' || beneficio.tipo === filterTipo;
      const matchesEstado = filterEstado === 'todos' || beneficio.estado === filterEstado;
      return matchesTipo && matchesEstado;
    });
  }, [beneficios, filterTipo, filterEstado]);

  const getEmpleadoName = (empleadoId: string) => {
    const empleado = empleados.find(emp => emp.id === empleadoId);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no encontrado';
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      voucher_escolar: 'Voucher Escolar',
      ayuda_universitaria: 'Ayuda Universitaria',
      premio_evento: 'Premio por Evento',
      asistencia_salud: 'Asistencia por Salud'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      entregado: 'bg-blue-100 text-blue-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleAddBeneficio = () => {
    setSelectedBeneficio(null);
    setShowModal(true);
  };

  const handleEditBeneficio = (beneficio: Beneficio) => {
    setSelectedBeneficio(beneficio);
    setShowModal(true);
  };

  const handleApprovedBeneficio = (beneficioId: string) => {
    updateBeneficio(beneficioId, { estado: 'aprobado' });
  };

  const handleRejectBeneficio = (beneficioId: string) => {
    updateBeneficio(beneficioId, { estado: 'rechazado' });
  };

  const stats = {
    total: beneficios.length,
    pendientes: beneficios.filter(b => b.estado === 'pendiente').length,
    aprobados: beneficios.filter(b => b.estado === 'aprobado').length,
    montoTotal: beneficios
      .filter(b => b.estado === 'aprobado' || b.estado === 'entregado')
      .reduce((sum, b) => sum + b.monto, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Beneficios y Asistencias</h2>
          <p className="text-gray-600">Gestiona vouchers, ayudas económicas y asistencias por salud</p>
        </div>
        <button
          onClick={handleAddBeneficio}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Beneficio</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Beneficios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">{stats.aprobados}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-purple-600">
                ${stats.montoTotal.toLocaleString('es-AR')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="voucher_escolar">Voucher Escolar</option>
              <option value="ayuda_universitaria">Ayuda Universitaria</option>
              <option value="premio_evento">Premio por Evento</option>
              <option value="asistencia_salud">Asistencia por Salud</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="entregado">Entregado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ml-auto">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Tabla de beneficios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Empleado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Tipo</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Descripción</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Monto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fecha</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBeneficios.map((beneficio) => (
                <tr key={beneficio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getEmpleadoName(beneficio.empleadoId)}
                      </p>
                      {beneficio.beneficiario && (
                        <p className="text-xs text-gray-500">Para: {beneficio.beneficiario}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {getTipoLabel(beneficio.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 max-w-xs truncate" title={beneficio.descripcion}>
                      {beneficio.descripcion}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      ${beneficio.monto.toLocaleString('es-AR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(beneficio.fecha).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(beneficio.estado)}`}>
                      {beneficio.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditBeneficio(beneficio)}
                        className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {beneficio.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleApprovedBeneficio(beneficio.id)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Aprobar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectBeneficio(beneficio.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Rechazar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBeneficios.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron beneficios</p>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar beneficio */}
      {showModal && (
        <BeneficioModal
          beneficio={selectedBeneficio}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}