const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');

async function main() {
  console.log('🌱 Iniciando seed comercial para demostración...\n');

  // 1. Limpieza de datos dependientes
  console.log('🧹 Limpiando tablas de base de datos...');
  await prisma.invoice.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.sede.deleteMany({});
  await prisma.training.deleteMany({});
  await prisma.clubEvent.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.playerDocument.deleteMany({});
  await prisma.playerProfile.deleteMany({});
  await prisma.futsalMatch.deleteMany({});
  await prisma.liveMatchEvent.deleteMany({});
  await prisma.futsalTeam.deleteMany({});
  await prisma.futsalNews.deleteMany({});
  await prisma.futsalMedia.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.transaction.deleteMany({});
  
  // Limpiar usuarios que sean socios (no admin ni futsal)
  await prisma.member.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      NOT: [
        { email: 'admin' },
        { email: 'futsal' }
      ]
    }
  });

  // 2. Obtener o crear club principal
  let club = await prisma.club.findFirst();
  if (!club) {
    club = await prisma.club.create({
      data: {
        id: 1,
        name: 'Club Jorge Newbery',
        logoUrl: '/images/escudo.png'
      }
    });
  }

  // 3. Crear sede y cancha
  console.log('🏟️  Creando Sede y Canchas...');
  const sede = await prisma.sede.create({
    data: {
      id: 1,
      name: 'Sede Central Villa Devoto',
      address: 'Calle Alpatacal 3026, CABA',
      capacity: 1200,
      status: 'ACTIVE',
      clubId: club.id
    }
  });

  const cancha1 = await prisma.facility.create({
    data: {
      id: 1,
      name: 'Cancha Parquet Principal',
      type: 'CANCHA',
      capacity: 800,
      status: 'ACTIVE',
      sedeId: sede.id
    }
  });

  const cancha2 = await prisma.facility.create({
    data: {
      id: 2,
      name: 'Microestadio Césped Sintético',
      type: 'CANCHA',
      capacity: 400,
      status: 'ACTIVE',
      sedeId: sede.id
    }
  });

  // 4. Crear planes de membresía
  console.log('💳 Creando Planes de Membresía...');
  const planSocioActivo = await prisma.membershipPlan.create({
    data: {
      id: 1,
      nombre: 'Socio Activo Pleno',
      tipo: 'SOCIO',
      importe: 12500,
      periodicidad: 'MENSUAL',
      moneda: 'ARS',
      activo: true,
      clubId: club.id
    }
  });

  const planDeportivoFutsal = await prisma.membershipPlan.create({
    data: {
      id: 2,
      nombre: 'Arancel Futsal AFA',
      tipo: 'DEPORTIVO',
      importe: 9500,
      periodicidad: 'MENSUAL',
      moneda: 'ARS',
      activo: true,
      clubId: club.id
    }
  });

  // 5. Crear usuarios y socios de prueba
  console.log('👥 Creando Socios y Usuarios...');
  const passwordHash = await bcrypt.hash('socio123', 10);
  
  const sociosData = [
    { email: 'martin.perez.47542096@example.com', name: 'Martin Perez', dni: '47542096', num: 1001, cat: 'ACTIVO', est: 'ACTIVO' },
    { email: 'julian.alvarez@example.com', name: 'Julian Alvarez', dni: '45123456', num: 1002, cat: 'ACTIVO', est: 'ACTIVO' },
    { email: 'sofia.martinez@example.com', name: 'Sofia Martinez', dni: '48901234', num: 1003, cat: 'CADETE', est: 'ACTIVO' },
    { email: 'lucas.beltran@example.com', name: 'Lucas Beltran', dni: '46789012', num: 1004, cat: 'ACTIVO', est: 'SUSPENDIDO' },
    { email: 'valentina.ortiz@example.com', name: 'Valentina Ortiz', dni: '44567890', num: 1005, cat: 'ACTIVO', est: 'INACTIVO' }
  ];

  const createdMembers = [];

  for (const s of sociosData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: passwordHash,
        role: 'SOCIO',
        isActive: s.est === 'ACTIVO',
        name: s.name,
        clubId: club.id
      }
    });

    const member = await prisma.member.create({
      data: {
        socioNumber: s.num,
        firstName: s.name.split(' ')[0],
        lastName: s.name.split(' ')[1] || '',
        dni: s.dni,
        birthDate: new Date('2000-05-15'),
        address: 'Av. Lincoln 4500, Villa Devoto',
        phone: '11-3456-7890',
        email: s.email,
        category: s.cat,
        estado: s.est,
        userId: user.id,
        clubId: club.id
      }
    });
    
    createdMembers.push(member);

    // Crear suscripciones y pagos para dar realismo financiero
    await prisma.subscription.create({
      data: {
        socioId: member.id,
        planId: planSocioActivo.id,
        fechaInicio: new Date('2026-01-01'),
        estado: s.est === 'ACTIVO' ? 'ACTIVO' : 'CANCELADO',
        proximoCobro: new Date('2026-08-01')
      }
    });

    // Registrar pagos
    const p1 = await prisma.payment.create({
      data: {
        socioId: member.id,
        planId: planSocioActivo.id,
        importe: 12500,
        metodoPago: 'MERCADOPAGO',
        estado: s.est === 'ACTIVO' ? 'PAGADO' : 'PENDIENTE',
        fechaPago: s.est === 'ACTIVO' ? new Date('2026-06-10T14:30:00Z') : null,
        mpPaymentId: s.est === 'ACTIVO' ? 'mp-pay-99210' : '',
        mpStatus: s.est === 'ACTIVO' ? 'approved' : ''
      }
    });

    if (s.est === 'ACTIVO') {
      await prisma.invoice.create({
        data: {
          paymentId: p1.id,
          numero: `REC-00${member.socioNumber}`,
          fechaEmision: new Date('2026-06-10T14:35:00Z'),
          estado: 'EMITIDO',
          tipoComprobante: 'RECIBO'
        }
      });

      // Crear transacción de caja consolidada
      await prisma.transaction.create({
        data: {
          concept: 'CUOTA_SOCIAL',
          amount: 12500,
          date: new Date('2026-06-10T14:30:00Z'),
          status: 'COMPLETED',
          memberName: s.name,
          memberId: member.id
        }
      });
    }
  }

  // 6. Crear jugadores de futsal
  console.log('⚽ Creando Jugadores de Futsal...');
  const jugadores = [
    { name: 'Lucas', lastName: 'González', dorsal: 1, age: 22, pos: 'Arquero', team: 'Primera Masculina', gp: 18, g: 0, a: 2, cs: 9, status: 'ACTIVE' },
    { name: 'Matías', lastName: 'Rodríguez', dorsal: 5, age: 24, pos: 'Cierre', team: 'Primera Masculina', gp: 20, g: 3, a: 7, cs: 0, status: 'ACTIVE' },
    { name: 'Sebastián', lastName: 'López', dorsal: 10, age: 25, pos: 'Ala', team: 'Primera Masculina', gp: 22, g: 15, a: 11, cs: 0, status: 'ACTIVE' },
    { name: 'Diego', lastName: 'Martínez', dorsal: 9, age: 23, pos: 'Pivot', team: 'Primera Masculina', gp: 19, g: 12, a: 4, cs: 0, status: 'INJURED' },
    { name: 'Gabriel', lastName: 'Peralta', dorsal: 8, age: 21, pos: 'Ala', team: 'Primera Masculina', gp: 15, g: 7, a: 6, cs: 0, status: 'ACTIVE' },
    // Femenino
    { name: 'Florencia', lastName: 'Russo', dorsal: 1, age: 23, pos: 'Arquero', team: 'Primera Femenina', gp: 12, g: 0, a: 0, cs: 6, status: 'ACTIVE' },
    { name: 'Camila', lastName: 'Gómez', dorsal: 10, age: 21, pos: 'Ala', team: 'Primera Femenina', gp: 14, g: 18, a: 9, cs: 0, status: 'ACTIVE' },
    { name: 'Belen', lastName: 'Méndez', dorsal: 7, age: 24, pos: 'Pivot', team: 'Primera Femenina', gp: 14, g: 10, a: 5, cs: 0, status: 'ACTIVE' }
  ];

  for (const j of jugadores) {
    await prisma.playerProfile.create({
      data: {
        name: j.name,
        lastName: j.lastName,
        dorsal: j.dorsal,
        age: j.age,
        category: j.team,
        position: j.pos,
        team: 'Futsal AFA',
        discipline: 'FUTSAL',
        matchesPlayed: j.gp,
        goals: j.g,
        assists: j.a,
        cleanSheets: j.cs,
        yellowCards: Math.floor(Math.random() * 4),
        redCards: Math.random() > 0.85 ? 1 : 0,
        playerStatus: j.status,
        season: '2026',
        description: `${j.pos} titular defendiendo con honor los colores de Villa Devoto.`,
        clubId: club.id
      }
    });
  }

  // 7. Crear partidos de futsal
  console.log('🏆 Creando Fixture e Historial de Partidos...');
  
  // Partido En Vivo
  const partidoVivo = await prisma.futsalMatch.create({
    data: {
      category: 'Primera Masculina',
      opponent: 'Pinocho',
      homeTeam: 'Jorge Newbery',
      awayTeam: 'Pinocho',
      date: new Date(),
      timeSlot: '20:30',
      ourScore: 2,
      opponentScore: 1,
      status: 'LIVE',
      competition: 'Torneo Local AFA',
      venue: 'Cancha Jorge Newbery',
      isFeatured: true,
      liveMinute: 15,
      liveStreamUrl: 'https://youtube.com/live/fake-stream-url',
      clubId: club.id
    }
  });

  // Eventos en vivo
  await prisma.liveMatchEvent.createMany({
    data: [
      { matchId: partidoVivo.id, minute: 4, type: 'GOL', playerName: 'Sebastián López', team: 'HOME', detail: 'Gol de penal' },
      { matchId: partidoVivo.id, minute: 8, type: 'TARJETA', playerName: 'Matías Rodríguez', team: 'HOME', detail: 'Tarjeta Amarilla' },
      { matchId: partidoVivo.id, minute: 12, type: 'GOL', playerName: 'Pinocho Nº10', team: 'AWAY', detail: 'Gol de jugada colectiva' },
      { matchId: partidoVivo.id, minute: 14, type: 'GOL', playerName: 'Sebastián López', team: 'HOME', detail: 'Golazo de volea' }
    ]
  });

  // Partido Próximo
  await prisma.futsalMatch.create({
    data: {
      category: 'Primera Masculina',
      opponent: 'San Lorenzo',
      homeTeam: 'Jorge Newbery',
      awayTeam: 'San Lorenzo',
      date: new Date(Date.now() + 5*24*60*60*1000), // 5 días en el futuro
      timeSlot: '21:30',
      status: 'UPCOMING',
      competition: 'AFA Primera',
      venue: 'Cancha Jorge Newbery',
      isFeatured: false,
      clubId: club.id
    }
  });

  // Partidos Finalizados (Historial)
  await prisma.futsalMatch.create({
    data: {
      category: 'Primera Masculina',
      opponent: 'Boca Juniors',
      homeTeam: 'Boca Juniors',
      awayTeam: 'Jorge Newbery',
      date: new Date(Date.now() - 7*24*60*60*1000), // Hace 7 días
      timeSlot: '20:00',
      ourScore: 4,
      opponentScore: 3,
      status: 'FINISHED',
      competition: 'AFA Primera',
      venue: 'Estadio La Bombonerita',
      isFeatured: true,
      clubId: club.id
    }
  });

  await prisma.futsalMatch.create({
    data: {
      category: 'Primera Femenina',
      opponent: 'Ferro',
      homeTeam: 'Jorge Newbery',
      awayTeam: 'Ferro',
      date: new Date(Date.now() - 4*24*60*60*1000),
      timeSlot: '16:00',
      ourScore: 5,
      opponentScore: 2,
      status: 'FINISHED',
      competition: 'Torneo Femenino AFA',
      venue: 'Cancha Jorge Newbery',
      isFeatured: false,
      clubId: club.id
    }
  });

  // 8. Reservas de canchas
  console.log('📅 Creando Reservas de Canchas...');
  await prisma.booking.create({
    data: {
      nombreCliente: 'Carlos Tevez',
      telefono: '11-1234-5678',
      email: 'carlitos@example.com',
      facilityId: cancha1.id,
      fecha: new Date(),
      horaInicio: '19:00',
      horaFin: '20:00',
      tipoReserva: 'GENERAL',
      estado: 'CONFIRMADA',
      importe: 15000,
      clubId: club.id
    }
  });

  await prisma.booking.create({
    data: {
      nombreCliente: 'Julian Alvarez',
      telefono: '11-8765-4321',
      email: 'julian.alvarez@example.com',
      facilityId: cancha2.id,
      fecha: new Date(Date.now() + 1*24*60*60*1000), // Mañana
      horaInicio: '21:00',
      horaFin: '22:00',
      tipoReserva: 'SOCIO',
      estado: 'CONFIRMADA',
      importe: 12000,
      socioId: createdMembers[1].id,
      clubId: club.id
    }
  });

  // 9. Novedades y Noticias generales
  console.log('📰 Creando Novedades y Multimedia...');
  await prisma.news.createMany({
    data: [
      { title: 'Inauguración de la nueva cancha de Futsal', content: 'El piso de parquet flotante de última generación ya está listo para todas las divisiones formativas e inferiores.', category: 'FUTSAL', tag: 'IMPORTANTE', imageUrl: '/images/action.png' },
      { title: 'Gran Medallero en el Metropolitano de Patín', content: 'Nuestras representantes consiguieron el Oro en la categoría grupal show en un certamen repleto de público.', category: 'PATIN', tag: 'LOGRO', imageUrl: '/images/futsal_hero.png' },
      { title: 'Prueba de Jugadores para las Inferiores', content: 'Se abren las inscripciones y convocatorias para los chicos nacidos entre 2010 y 2018 para sumarse al club.', category: 'FUTSAL', tag: 'CONVOCATORIA', imageUrl: '/images/fans.png' }
    ]
  });

  // Futsal News
  await prisma.futsalNews.createMany({
    data: [
      { title: 'Sebastián López, convocado a la Selección Argentina de Futsal', description: 'El ala estrella del club formará parte del plantel de entrenamientos de cara a las eliminatorias de la Copa América.', category: 'Primera Masculina', clubId: club.id },
      { title: 'Fixture de Play-offs AFA Confirmado', description: 'Jorge Newbery disputará los cuartos de final frente a Pinocho a ida y vuelta en sedes neutrales.', category: 'Primera Masculina', clubId: club.id }
    ]
  });

  // Multimedia Newbery TV
  await prisma.futsalMedia.createMany({
    data: [
      { type: 'VIDEO', title: 'Resumen Completo: Victoria en el Superclásico del Barrio', url: 'https://youtube.com/watch/fake-video-1', category: 'Primera', description: 'Reviví los goles de López y Russo para conseguir los tres puntos vitales en el torneo.', visibility: 'PUBLIC', featured: true, views: 145, clubId: club.id },
      { type: 'PHOTO', title: 'Entrenamiento Físico y Táctico - Pretemporada 2026', url: '/images/action.png', category: 'Primera', description: 'El plantel entrena bajo las órdenes del Prof. Martínez de cara a la segunda fase.', visibility: 'PUBLIC', featured: false, views: 320, clubId: club.id }
    ]
  });

  console.log('\n🎉 ¡Seed comercial finalizado con total éxito! Base de datos lista.');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
