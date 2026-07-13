const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');

async function main() {
  console.log('🌱 Iniciando seed de usuarios y club principal...\n');

  // 1. Club por defecto
  let club = await prisma.club.findUnique({ where: { name: 'Club Jorge Newbery' } });
  if (!club) {
    club = await prisma.club.create({
      data: {
        id: 1,
        name: 'Club Jorge Newbery',
        logoUrl: '/images/escudo.png'
      }
    });
    console.log(`✅ Club Jorge Newbery creado con ID: ${club.id}`);
  } else {
    console.log(`⚠️  El club '${club.name}' ya existe.`);
  }

  // 2. Configuración institucional del club por defecto
  const configCount = await prisma.clubConfig.count({ where: { clubId: club.id } });
  if (configCount === 0) {
    await prisma.clubConfig.create({
      data: {
        name: 'Club Jorge Newbery',
        shieldUrl: '/images/escudo.png',
        colorPrimary: '#CC0000',
        colorSecondary: '#FFFFFF',
        address: 'Calle Ficticia 1234',
        city: 'Buenos Aires',
        province: 'CABA',
        country: 'Argentina',
        phone: '011-4567-8910',
        email: 'contacto@jorgenewbery.com.ar',
        website: 'www.jorgenewbery.com.ar',
        socialFacebook: 'https://facebook.com/clubjorgenewbery',
        socialInstagram: 'https://instagram.com/clubjorgenewbery',
        history: 'El Club Jorge Newbery fue fundado en 1916 con el objetivo de fomentar la actividad deportiva, social y cultural del barrio.',
        foundedDate: new Date('1916-10-12'),
        president: 'Claudio González',
        secretary: 'María Paz López',
        officeHours: 'Lunes a Viernes de 09:00 a 18:00 hs',
        clubId: club.id
      }
    });
    console.log('✅ Configuración institucional creada para Club Jorge Newbery');
  } else {
    console.log('⚠️  La configuración del club ya existe.');
  }

  // 3. Usuario ADMIN
  const adminEmail = 'admin';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const hashedAdmin = await bcrypt.hash('admin', 10);
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { clubId: club.id }
    });
    console.log(`⚠️  El usuario '${adminEmail}' ya existe. Vinculado al club ID ${club.id}.`);
  } else {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedAdmin,
        role: 'ADMIN',
        clubId: club.id
      },
    });
    console.log(`✅ Usuario ADMIN creado: email='${admin.email}' | role='${admin.role}' | id=${admin.id}`);
  }

  // 4. Usuario FUTSAL
  const futsalEmail = 'futsal';
  const existingFutsal = await prisma.user.findUnique({ where: { email: futsalEmail } });
  const hashedFutsal = await bcrypt.hash('futsal', 10);
  if (existingFutsal) {
    await prisma.user.update({
      where: { id: existingFutsal.id },
      data: { clubId: club.id }
    });
    console.log(`⚠️  El usuario '${futsalEmail}' ya existe. Vinculado al club ID ${club.id}.`);
  } else {
    const futsal = await prisma.user.create({
      data: {
        email: futsalEmail,
        password: hashedFutsal,
        role: 'FUTSAL',
        clubId: club.id
      },
    });
    console.log(`✅ Usuario FUTSAL creado: email='${futsal.email}' | role='${futsal.role}' | id=${futsal.id}`);
  }

  console.log('\n🎉 Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
