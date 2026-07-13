const prisma = require('../../../prismaClient');

const getPriceRulesByFacility = async (facilityId) => {
  return prisma.priceRule.findMany({
    where: { facilityId: parseInt(facilityId, 10) },
    orderBy: { userType: 'asc' }
  });
};

const createPriceRule = async ({ facilityId, userType, isPeakHour, price }) => {
  return prisma.priceRule.create({
    data: {
      facilityId: parseInt(facilityId, 10),
      userType, // SOCIO, GENERAL
      isPeakHour: isPeakHour === true || isPeakHour === 'true',
      price: parseFloat(price)
    }
  });
};

const calculatePrice = async (facilityId, userType, startTimeStr) => {
  const facId = parseInt(facilityId, 10);
  const type = userType === 'SOCIO' ? 'SOCIO' : 'GENERAL';

  // Determinar si es hora pico de forma predeterminada (e.g., entre 18:00 y 22:00 inclusive)
  let isPeak = false;
  if (startTimeStr) {
    const hour = parseInt(startTimeStr.split(':')[0], 10);
    if (hour >= 18 && hour <= 22) {
      isPeak = true;
    }
  }

  // Buscar reglas en la base de datos
  const rules = await prisma.priceRule.findMany({
    where: { facilityId: facId, userType: type }
  });

  if (rules.length > 0) {
    // Intentar buscar regla específica de hora pico
    const peakRule = rules.find(r => r.isPeakHour === isPeak);
    if (peakRule) return peakRule.price;

    // Fallback a cualquier regla del tipo de usuario
    return rules[0].price;
  }

  // Tarifas predeterminadas del club si no hay reglas cargadas
  if (type === 'SOCIO') {
    return isPeak ? 18000 : 15000;
  } else {
    return isPeak ? 25000 : 20000;
  }
};

module.exports = {
  getPriceRulesByFacility,
  createPriceRule,
  calculatePrice
};
