
import { UserPlus, FileText, Search, Upload } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Nuevo Empleado',
      description: 'Registrar nuevo empleado o afiliado',
      icon: UserPlus,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Consulta Rápida',
      description: 'Buscar por CUIL o legajo',
      icon: Search,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Generar Reporte',
      description: 'Crear reporte personalizado',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Carga Masiva',
      description: 'Importar datos desde Excel',
      icon: Upload,
      color: 'bg-amber-600 hover:bg-amber-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-lg transition-colors text-left group`}
            >
              <Icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-sm">{action.title}</h4>
              <p className="text-xs opacity-90 mt-1">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}