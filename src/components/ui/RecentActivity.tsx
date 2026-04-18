
import { Clock, UserPlus, Gift, DollarSign } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'empleado',
      message: 'Nuevo empleado registrado: Juan Carlos Pérez',
      time: 'Hace 2 horas',
      icon: UserPlus,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'beneficio',
      message: 'Voucher escolar aprobado para Ana Rodríguez',
      time: 'Hace 4 horas',
      icon: Gift,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'prestamo',
      message: 'Préstamo otorgado: $150.000 - Roberto Martínez',
      time: 'Hace 1 día',
      icon: DollarSign,
      color: 'text-amber-600'
    },
    {
      id: 4,
      type: 'beneficio',
      message: 'Asistencia económica por salud procesada',
      time: 'Hace 2 días',
      icon: Gift,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}