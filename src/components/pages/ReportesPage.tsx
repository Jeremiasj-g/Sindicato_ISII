import { useState } from 'react';
import { FileText, Download, Calendar, Users, DollarSign, BarChart3 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function ReportesPage() {
  const { empleados, beneficios, prestamos } = useData();
  const [reportType, setReportType] = useState('empleados');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [empresa, setEmpresa] = useState('todas');
  const [estadoAfiliacion, setEstadoAfiliacion] = useState('todos');

  const generateReport = () => {
    // Implementar lógica de generación de reportes
    console.log('Generando reporte:', {
      type: reportType,
      dateRange: { from: dateFrom, to: dateTo },
      filters: { empresa, estadoAfiliacion }
    });
  };

  const exportToExcel = () => {
    // Implementar exportación a Excel
    console.log('Exportando a Excel...');
  };

  const reportTypes = [
    { id: 'empleados', label: 'Listado de Empleados', description: 'Reporte completo de empleados y afiliados' },
    { id: 'beneficios', label: 'Beneficios Otorgados', description: 'Asistencias y vouchers por período' },
    { id: 'prestamos', label: 'Préstamos Vigentes', description: 'Estado de préstamos y cuotas pendientes' },
    { id: 'estadisticas', label: 'Estadísticas Generales', description: 'Resumen ejecutivo con métricas clave' },
    { id: 'auditoria', label: 'Reporte de Auditoría', description: 'Información para AFIP con facturas' }
  ];

  const quickReports = [
    { name: 'Empleados por Localidad', description: 'Agrupado por zona geográfica' },
    { name: 'Afiliados vs No Afiliados', description: 'Comparativa de afiliación' },
    { name: 'Beneficios por Tipo', description: 'Distribución de asistencias' },
    { name: 'Préstamos Vencidos', description: 'Cuotas en mora' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
          <p className="text-gray-600">Genera reportes personalizados y exporta datos para auditorías</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-blue-600">{empleados.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Afiliados</p>
              <p className="text-2xl font-bold text-green-600">
                {empleados.filter(e => e.esAfiliado).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Beneficios</p>
              <p className="text-2xl font-bold text-purple-600">{beneficios.length}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Préstamos</p>
              <p className="text-2xl font-bold text-amber-600">{prestamos.length}</p>
            </div>
            <DollarSign className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generador de reportes personalizados */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Generar Reporte Personalizado
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {reportTypes.find(t => t.id === reportType)?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <select
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todas">Todas</option>
                  <option value="Aguas de Corrientes">Aguas de Corrientes</option>
                  <option value="Urbatec">Urbatec</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de Afiliación
                </label>
                <select
                  value={estadoAfiliacion}
                  onChange={(e) => setEstadoAfiliacion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="afiliados">Solo Afiliados</option>
                  <option value="no_afiliados">No Afiliados</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={generateReport}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Generar Reporte</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reportes rápidos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Reportes Rápidos
          </h3>

          <div className="space-y-3">
            {quickReports.map((report, index) => (
              <button
                key={index}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                      {report.name}
                    </h4>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vista previa del reporte */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa del Reporte</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona un tipo de reporte y haz clic en "Generar" para ver la vista previa</p>
        </div>
      </div>
    </div>
  );
}