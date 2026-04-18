// Utilidades para exportación de datos

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function prepareEmpleadosForExport(empleados: any[]) {
  return empleados.map(emp => ({
    'Número Afiliado': emp.esAfiliado ? emp.numeroAfiliado : 'N/A',
    'Nombre': emp.nombre,
    'Apellido': emp.apellido,
    'DNI': emp.dni,
    'CUIL': emp.cuil,
    'Legajo': emp.legajo,
    'Empresa': emp.empresa,
    'Es Afiliado': emp.esAfiliado ? 'Sí' : 'No',
    'Estado Laboral': emp.estadoLaboral,
    'Domicilio': emp.domicilio,
    'Teléfono Fijo': emp.telefonoFijo || '',
    'Teléfono Celular': emp.telefonoCelular || '',
    'Email': emp.email || '',
    'Fecha Ingreso': emp.fechaIngreso,
    'Cantidad Familiares': emp.grupoFamiliar?.length || 0,
    'Fecha Creación': new Date(emp.createdAt).toLocaleDateString('es-AR')
  }));
}

export function prepareBeneficiosForExport(beneficios: any[], empleados: any[]) {
  return beneficios.map(ben => {
    const empleado = empleados.find(emp => emp.id === ben.empleadoId);
    return {
      'Empleado': empleado ? `${empleado.nombre} ${empleado.apellido}` : 'N/A',
      'Legajo': empleado?.legajo || '',
      'Tipo': ben.tipo.replace('_', ' '),
      'Descripción': ben.descripcion,
      'Monto': ben.monto,
      'Fecha': new Date(ben.fecha).toLocaleDateString('es-AR'),
      'Estado': ben.estado,
      'Beneficiario': ben.beneficiario || '',
      'Observaciones': ben.observaciones || '',
      'Cantidad Facturas': ben.facturas?.length || 0
    };
  });
}

export function preparePrestamosForExport(prestamos: any[], empleados: any[]) {
  return prestamos.map(pres => {
    const empleado = empleados.find(emp => emp.id === pres.empleadoId);
    return {
      'Empleado': empleado ? `${empleado.nombre} ${empleado.apellido}` : 'N/A',
      'Legajo': empleado?.legajo || '',
      'Monto Total': pres.monto,
      'Cuotas Totales': pres.cuotas,
      'Cuotas Pagadas': pres.cuotasPagadas,
      'Cuotas Restantes': pres.cuotasRestantes,
      'Monto por Cuota': pres.montoCuota,
      'Fecha Otorgamiento': new Date(pres.fechaOtorgamiento).toLocaleDateString('es-AR'),
      'Estado': pres.estado,
      'Monto Pendiente': (pres.cuotasRestantes * pres.montoCuota)
    };
  });
}