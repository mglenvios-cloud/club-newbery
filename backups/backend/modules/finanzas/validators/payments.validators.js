/**
 * Validadores para el módulo de Finanzas y Cobros.
 * Devuelven null si todo es correcto, o un string de error.
 */

function validateId(id) {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return 'ID no válido. Debe ser un entero positivo.';
  }
  return null;
}

function validatePlan(data, isUpdate = false) {
  const { nombre, tipo, importe, periodicidad } = data;

  if (!isUpdate) {
    if (!nombre || nombre.trim() === '') return 'El nombre del plan es obligatorio.';
    if (!tipo || !['SOCIO', 'DEPORTIVO', 'FAMILIAR'].includes(tipo.toUpperCase())) {
      return 'El tipo de plan debe ser SOCIO, DEPORTIVO o FAMILIAR.';
    }
    if (importe === undefined || isNaN(parseFloat(importe))) return 'El importe del plan es obligatorio.';
    if (!periodicidad || !['MENSUAL', 'ANUAL', 'UNICO'].includes(periodicidad.toUpperCase())) {
      return 'La periodicidad debe ser MENSUAL, ANUAL o UNICO.';
    }
  }

  if (importe !== undefined && parseFloat(importe) < 0) {
    return 'El importe del plan no puede ser negativo.';
  }

  return null;
}

function validatePayment(data, isUpdate = false) {
  const { socioId, importe, metodoPago, estado } = data;

  if (!isUpdate) {
    if (!socioId || isNaN(parseInt(socioId))) return 'El ID del socio es obligatorio.';
    if (importe === undefined || isNaN(parseFloat(importe))) return 'El importe es obligatorio.';
    if (parseFloat(importe) <= 0) return 'El importe del pago debe ser mayor a cero.';
  }

  if (importe !== undefined && parseFloat(importe) <= 0) {
    return 'El importe del pago debe ser mayor a cero.';
  }

  if (metodoPago && !['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'MERCADOPAGO'].includes(metodoPago.toUpperCase())) {
    return 'El método de pago especificado no es válido.';
  }

  if (estado && !['PENDIENTE', 'PAGADO', 'RECHAZADO', 'CANCELADO'].includes(estado.toUpperCase())) {
    return 'El estado de pago especificado no es válido.';
  }

  return null;
}

module.exports = {
  validateId,
  validatePlan,
  validatePayment
};
