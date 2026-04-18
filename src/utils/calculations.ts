// Utilidades para cálculos del sistema sindical

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function isEligibleForVoucherEscolar(age: number): boolean {
  // Elegible si está en edad escolar (3-18 años)
  return age >= 3 && age <= 18;
}

export function isEligibleForAyudaUniversitaria(age: number, escolaridad?: string): boolean {
  // Elegible si está en terciario o universitario
  return age >= 17 && (escolaridad === 'terciaria' || escolaridad === 'universitaria');
}

export function calculateRemainingQuotas(prestamo: {
  cuotas: number;
  cuotasPagadas: number;
}): number {
  return prestamo.cuotas - prestamo.cuotasPagadas;
}

export function calculateRemainingAmount(prestamo: {
  monto: number;
  cuotasPagadas: number;
  montoCuota: number;
}): number {
  return prestamo.monto - (prestamo.cuotasPagadas * prestamo.montoCuota);
}

export function generateNextAfiliadoNumber(empleados: { numeroAfiliado: number; esAfiliado: boolean }[]): number {
  const afiliadosNumbers = empleados
    .filter(emp => emp.esAfiliado && emp.numeroAfiliado > 0)
    .map(emp => emp.numeroAfiliado);
  
  if (afiliadosNumbers.length === 0) {
    return 1001; // Número inicial
  }
  
  return Math.max(...afiliadosNumbers) + 1;
}

export function validateCUIL(cuil: string): boolean {
  // Validación básica de formato CUIL argentino
  const cuilRegex = /^\d{2}-\d{8}-\d{1}$/;
  return cuilRegex.test(cuil);
}

export function validateDNI(dni: string): boolean {
  // Validación básica de DNI argentino
  const dniRegex = /^\d{7,8}$/;
  return dniRegex.test(dni);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}