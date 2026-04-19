export interface Empleado {
  id: string;
  numeroAfiliado: number;
  nombre: string;
  apellido: string;
  dni: string;
  cuil: string;
  legajo: string;
  empresa: 'Aguas de Corrientes' | 'Urbatec';
  esAfiliado: boolean;
  domicilio: string;
  telefonoFijo?: string;
  telefonoCelular?: string;
  email?: string;
  fechaIngreso: string;
  estadoLaboral: 'activo' | 'inactivo' | 'jubilado';
  grupoFamiliar: Familiar[];
  beneficios: Beneficio[];
  prestamos: Prestamo[];
  createdAt: string;
  updatedAt: string;
}

export interface Familiar {
  id: string;
  empleadoId: string;
  nombre: string;
  apellido: string;
  cuil?: string;
  parentesco: 'conyuge' | 'hijo' | 'padre' | 'madre' | 'otro';
  fechaNacimiento?: string;
  edad?: number;
  escolaridad?: 'inicial' | 'primaria' | 'secundaria' | 'terciaria' | 'universitaria' | 'ninguna';
  esEstudiante: boolean;
}

export interface Beneficio {
  id: string;
  empleadoId: string;
  tipo: 'voucher_escolar' | 'ayuda_universitaria' | 'premio_evento' | 'asistencia_salud';
  descripcion: string;
  monto: number;
  fecha: string;
  estado: 'pendiente' | 'aprobado' | 'entregado' | 'rechazado';
  observaciones?: string;
  facturas: Factura[];
  beneficiario?: string; // Para casos donde el beneficio es para un familiar
}

export interface Prestamo {
  id: string;
  empleadoId: string;
  monto: number;
  cuotas: number;
  cuotasPagadas: number;
  cuotasRestantes: number;
  montoCuota: number;
  fechaOtorgamiento: string;
  estado: 'activo' | 'finalizado' | 'moroso';
  observaciones?: string;
}

export interface Factura {
  id: string;
  beneficioId: string;
  numero: string;
  proveedor: string;
  monto: number;
  fecha: string;
  archivo?: string; // Para almacenar el path del archivo escaneado
}

export interface User {
  id: string;
  username: string;
  nombre: string;
  role: 'administrador' | 'secretario_hacienda' | 'secretaria' | 'desarrollador';
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission {
  module: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

export interface Reporte {
  id: string;
  nombre: string;
  descripcion: string;
  filtros: ReporteFiltro[];
  fechaGeneracion: string;
  generadoPor: string;
}

export interface ReporteFiltro {
  campo: string;
  operador: 'igual' | 'contiene' | 'mayor_que' | 'menor_que' | 'entre';
  valor: string | number | Date;
}

export interface UsuarioSistema {
  id: string;
  username: string;
  passwordHash: string;
  rolId: number | null;
  rolNombre: string | null;
  activo: boolean;
  fechaAlta: string;
}

export interface CreateUsuarioPayload {
  username: string;
  passwordHash: string;
  rolId?: number | null;
  activo?: boolean;
}

export interface UpdateUsuarioPayload {
  username?: string;
  passwordHash?: string;
  rolId?: number | null;
  activo?: boolean;
}
