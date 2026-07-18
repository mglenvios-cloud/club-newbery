'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Cargar el adaptador de Firestore/JSON
const firestorePrisma = require('../firestorePrismaAdapter');

const sqliteDbPath = path.resolve(__dirname, '../dev.db');

async function run() {
  console.log('🚀 Iniciando migración de datos: SQLite → Firebase Firestore/JSON...\n');

  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`❌ No se encontró el archivo de SQLite en: ${sqliteDbPath}`);
    process.exit(1);
  }

  const sqlite = new Database(sqliteDbPath);

  // Mapear los nombres de tablas SQLite a modelos del adaptador
  const tables = [
    { name: 'Role', model: 'role' },
    { name: 'Club', model: 'club' },
    { name: 'User', model: 'user' },
    { name: 'ClubConfig', model: 'clubConfig' },
    { name: 'Season', model: 'season' },
    { name: 'FutsalTeam', model: 'futsalTeam' },
    { name: 'FutsalMatch', model: 'futsalMatch' },
    { name: 'MatchBroadcast', model: 'matchBroadcast' },
    { name: 'MatchEvent', model: 'matchEvent' },
    { name: 'HighlightClip', model: 'highlightClip' },
    { name: 'FutsalNews', model: 'futsalNews' },
    { name: 'FutsalMedia', model: 'futsalMedia' },
    { name: 'MediaFile', model: 'mediaFile' },
    { name: 'AdvertisementView', model: 'advertisementView' },
    { name: 'News', model: 'news' },
    { name: 'Tutor', model: 'tutor' },
    { name: 'Member', model: 'member' },
    { name: 'DigitalCard', model: 'digitalCard' },
    { name: 'PriceRule', model: 'priceRule' },
    { name: 'Sede', model: 'sede' },
    { name: 'Facility', model: 'facility' },
    { name: 'Schedule', model: 'schedule' },
    { name: 'Booking', model: 'booking' },
    { name: 'Sponsor', model: 'sponsor' },
    { name: 'Banner', model: 'banner' },
    { name: 'Campaign', model: 'campaign' },
    { name: 'ContractHistory', model: 'contractHistory' },
    { name: 'Transaction', model: 'transaction' },
    { name: 'Payment', model: 'payment' },
    { name: 'Invoice', model: 'invoice' },
    { name: 'Subscription', model: 'subscription' },
    { name: 'PlayerProfile', model: 'playerProfile' },
    { name: 'Coach', model: 'coach' },
    { name: 'TechnicalStaff', model: 'technicalStaff' },
    { name: 'ClubEvent', model: 'clubEvent' },
    { name: 'MedicalRecord', model: 'medicalRecord' },
    { name: 'PlayerDocument', model: 'playerDocument' },
    { name: 'SocialConfig', model: 'socialConfig' },
    { name: 'SocialPost', model: 'socialPost' }
  ];

  for (const table of tables) {
    try {
      // Verificar si la tabla existe en SQLite
      const tableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table.name);
      if (!tableCheck) {
        console.log(`⚠️  Tabla SQLite '${table.name}' no existe en esta BD. Omitiendo.`);
        continue;
      }

      const rows = sqlite.prepare(`SELECT * FROM "${table.name}"`).all();
      console.log(`📥 Leyendo ${rows.length} registros de la tabla SQLite '${table.name}'...`);

      let migrados = 0;
      for (const row of rows) {
        const id = row.id;
        delete row.id;

        // Convertir campos de SQLite a tipos JS adecuados (fechas, booleanos, JSON)
        const data = {};
        for (const [key, value] of Object.entries(row)) {
          if (value === null) {
            data[key] = null;
          } else if (typeof value === 'string' && (value.includes('T') && value.endsWith('Z') || key.toLowerCase().includes('date') || key === 'createdAt' || key === 'updatedAt' || key === 'scheduledFor')) {
            // Es una fecha
            data[key] = new Date(value);
          } else if (value === 1 && (key === 'isActive' || key === 'published' || key === 'featured' || key === 'generatedByAI' || key === 'hasPaid' || key === 'isMedicalCertificateValid' || key === 'isDniValid')) {
            data[key] = true;
          } else if (value === 0 && (key === 'isActive' || key === 'published' || key === 'featured' || key === 'generatedByAI' || key === 'hasPaid' || key === 'isMedicalCertificateValid' || key === 'isDniValid')) {
            data[key] = false;
          } else {
            data[key] = value;
          }
        }

        // Crear/Actualizar en Firestore usando nuestro adaptador
        await firestorePrisma[table.model].upsert({
          where: { id: id },
          create: { id: id, ...data },
          update: data
        });
        migrados++;
      }
      console.log(`✅ ${migrados} registros migrados con éxito para '${table.name}'.\n`);
    } catch (e) {
      console.error(`❌ Error migrando la tabla '${table.name}':`, e.message);
    }
  }

  console.log('🎉 Proceso de migración a Firebase Firestore finalizado exitosamente.');
  sqlite.close();
}

run();
