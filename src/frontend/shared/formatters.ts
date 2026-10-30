/**
 * Utilidades de formateo para la capa de presentación (Frontend)
 * Cumple con principios DRY, Single Responsibility y Clean Code.
 */

/**
 * Formatea un valor numérico como moneda oficial de Colombia (COP).
 * @param amount - Valor numérico a formatear
 * @returns Cadena con formato colombiano, ej: "$620.000"
 */
export function formatCOP(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `$${safeAmount.toLocaleString('es-CO')}`;
}

/**
 * Formatea un valor numérico como moneda oficial de Colombia con sufijo ISO.
 * @param amount - Valor numérico a formatear
 * @returns Cadena con formato colombiano, ej: "$620.000 COP"
 */
export function formatCOPWithCode(amount: number): string {
  return `${formatCOP(amount)} COP`;
}
