
import { Users, UserCheck, Gift, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatsCard } from '../ui/StatsCard';
import { QuickActions } from '../ui/QuickActions';
import { RecentActivity } from '../ui/RecentActivity';

export function Dashboard() {
  const { empleados, beneficios, prestamos } = useData();

  const stats = {
    totalEmpleados: empleados.length,
    afiliados: empleados.filter(emp => emp.esAfiliado).length,
    noAfiliados: empleados.filter(emp => !emp.esAfiliado).length,
    beneficiosActivos: beneficios.filter(ben => ben.estado === 'aprobado').length,
    prestamosActivos: prestamos.filter(pres => pres.estado === 'activo').length,
    montoTotalPrestamos: prestamos
      .filter(pres => pres.estado === 'activo')
      .reduce((total, pres) => total + (pres.monto - (pres.cuotasPagadas * pres.montoCuota)), 0)
  };

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bienvenido al Sistema de Gestión Sindical</h1>
        <p className="text-blue-100">
          Gestiona eficientemente empleados, afiliados, beneficios y asistencias económicas
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Empleados"
          value={stats.totalEmpleados}
          icon={Users}
          color="blue"
          subtitle="En el sistema"
        />
        <StatsCard
          title="Afiliados"
          value={stats.afiliados}
          icon={UserCheck}
          color="green"
          subtitle={`${stats.noAfiliados} no afiliados`}
        />
        <StatsCard
          title="Beneficios Activos"
          value={stats.beneficiosActivos}
          icon={Gift}
          color="purple"
          subtitle="Aprobados este mes"
        />
        <StatsCard
          title="Préstamos Vigentes"
          value={stats.prestamosActivos}
          icon={DollarSign}
          color="amber"
          subtitle="En proceso de pago"
        />
        <StatsCard
          title="Monto Pendiente"
          value={`$${stats.montoTotalPrestamos.toLocaleString('es-AR')}`}
          icon={TrendingUp}
          color="red"
          subtitle="Total por cobrar"
        />
        <StatsCard
          title="Mes Actual"
          value={new Date().toLocaleDateString('es-AR', { month: 'long' })}
          icon={Calendar}
          color="indigo"
          subtitle="Período de gestión"
        />
      </div>

      {/* Acciones rápidas y actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}