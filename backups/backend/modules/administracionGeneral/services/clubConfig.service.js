const prisma = require('../../../prismaClient');

/**
 * Obtiene la configuración general del club.
 * Si no existe, se crea una por defecto.
 * @param {number} [clubId=1]
 * @returns {Promise<ClubConfig>}
 */
async function get(clubId = 1) {
  let config = await prisma.clubConfig.findFirst({
    where: { clubId }
  });

  if (!config) {
    config = await prisma.clubConfig.create({
      data: {
        name: 'Club Jorge Newbery',
        shieldUrl: '/images/escudo.png',
        clubId
      }
    });
  }

  return config;
}

/**
 * Actualiza la configuración general del club.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<ClubConfig>}
 */
async function update(clubId = 1, data) {
  const config = await get(clubId);

  return prisma.clubConfig.update({
    where: { id: config.id },
    data: {
      name: data.name,
      shieldUrl: data.shieldUrl,
      colorPrimary: data.colorPrimary,
      colorSecondary: data.colorSecondary,
      address: data.address,
      city: data.city,
      province: data.province,
      country: data.country,
      phone: data.phone,
      email: data.email,
      website: data.website,
      socialFacebook: data.socialFacebook,
      socialInstagram: data.socialInstagram,
      socialTwitter: data.socialTwitter,
      socialYoutube: data.socialYoutube,
      history: data.history,
      foundedDate: data.foundedDate ? new Date(data.foundedDate) : null,
      president: data.president,
      secretary: data.secretary,
      officeHours: data.officeHours
    }
  });
}

module.exports = { get, update };
