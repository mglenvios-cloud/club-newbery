'use strict';

const fs = require('fs');
const path = require('path');

let firestoreDb = null;
let useLocalJson = true;

// Intentar conectarse a Firebase Admin SDK
// Detectar modos automáticos
const hasEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
const hasProduction = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_STORAGE_BUCKET);

if (hasEmulator) {
  try {
    const admin = require('./config/firebase-admin');
    firestoreDb = admin.firestore();
    useLocalJson = false;
    console.log('[Prisma-Firestore] Modo 1 activo: Conectado a Firebase Local Emulator (Firestore)');
  } catch (e) {
    console.warn('[Prisma-Firestore] Error al inicializar Firestore Emulator, usando JSON offline:', e.message);
    useLocalJson = true;
  }
} else if (hasProduction) {
  try {
    const admin = require('./config/firebase-admin');
    firestoreDb = admin.firestore();
    useLocalJson = false;
    console.log('[Prisma-Firestore] Modo 2 activo: Conectado a Firebase Producción (Firestore)');
  } catch (e) {
    console.warn('[Prisma-Firestore] Error al inicializar Firebase Producción, usando JSON offline:', e.message);
    useLocalJson = true;
  }
} else {
  useLocalJson = true;
  console.log('[Prisma-Firestore] Modo 3 activo: Desarrollo Offline (fallback JSON)');
}

function cleanUndefined(obj) {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      result[k] = v;
    }
  }
  return result;
}

const JSON_DB_PATH = path.join(__dirname, 'firestore_db.json');

function readJsonDb() {
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify({ counters: {} }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
  } catch {
    return { counters: {} };
  }
}

function writeJsonDb(data) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
}

async function getNextId(collectionName) {
  if (useLocalJson) {
    const dbData = readJsonDb();
    const list = dbData[collectionName] || [];
    const maxId = list.reduce((max, item) => (item.id && typeof item.id === 'number' ? Math.max(max, item.id) : max), 0);
    const nextId = maxId + 1;
    if (!dbData.counters) dbData.counters = {};
    dbData.counters[collectionName] = nextId;
    writeJsonDb(dbData);
    return nextId;
  } else {
    const counterRef = firestoreDb.collection('counters').doc('all');
    let nextId = 1;
    await firestoreDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      if (!doc.exists) {
        transaction.set(counterRef, { [collectionName]: 1 });
        nextId = 1;
      } else {
        const data = doc.data();
        const currentId = data[collectionName] || 0;
        nextId = currentId + 1;
        transaction.update(counterRef, { [collectionName]: nextId });
      }
    });
    return nextId;
  }
}

class FirestoreCollection {
  constructor(collectionName, relations = {}) {
    this.collectionName = collectionName;
    this.relations = relations;
  }

  // --- Operaciones Locales JSON ---
  async localFindMany(args = {}) {
    const dbData = readJsonDb();
    const list = dbData[this.collectionName] || [];
    let records = list.map(item => ({ ...item }));

    // Filtrar
    records = records.filter(rec => this.filterRecord(rec, args.where));

    // Ordenar
    if (args.orderBy) {
      const orderKeys = Object.keys(args.orderBy);
      records.sort((a, b) => {
        for (const key of orderKeys) {
          const dir = args.orderBy[key] === 'desc' ? -1 : 1;
          if (a[key] < b[key]) return -1 * dir;
          if (a[key] > b[key]) return 1 * dir;
        }
        return 0;
      });
    }

    // Paginación
    if (args.skip) records = records.slice(args.skip);
    if (args.take) records = records.slice(0, args.take);

    // Resolver includes
    if (args.include) {
      for (const rec of records) {
        await this.resolveIncludes(rec, args.include);
      }
    }

    return records;
  }

  async localCreate(args = {}) {
    const dbData = readJsonDb();
    if (!dbData[this.collectionName]) dbData[this.collectionName] = [];

    const data = cleanUndefined(args.data);
    
    // Extraer relaciones anidadas
    const nestedCreates = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && value.create) {
        nestedCreates[key] = value.create;
        delete data[key];
      }
    }

    const nextId = await getNextId(this.collectionName);
    
    // Normalizar fechas
    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Date) {
        data[k] = v.toISOString();
      }
    }

    const record = { id: nextId, ...data };
    
    // Re-leer dbData tras getNextId
    const currentDbData = readJsonDb();
    if (!currentDbData[this.collectionName]) currentDbData[this.collectionName] = [];
    currentDbData[this.collectionName].push(record);
    writeJsonDb(currentDbData);

    // Guardar relaciones anidadas
    for (const [relName, relData] of Object.entries(nestedCreates)) {
      const relConfig = this.relations[relName];
      if (relConfig) {
        const relDataWithFk = { ...relData };
        if (relConfig.foreignKey) {
          relDataWithFk[relConfig.foreignKey] = record.id;
        }
        const createdRel = await exports[relConfig.model].create({ data: relDataWithFk });
        record[relName] = createdRel;
      }
    }

    if (args.include) {
      await this.resolveIncludes(record, args.include);
    }

    return record;
  }

  async localUpdate(args = {}) {
    const id = args.where?.id;
    if (id === undefined) {
      const existing = await this.localFindFirst(args);
      if (!existing) throw new Error(`Document not found to update in ${this.collectionName}`);
      return this.localUpdate({ where: { id: existing.id }, data: args.data });
    }

    const dbData = readJsonDb();
    const list = dbData[this.collectionName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`Document with ID ${id} not found in ${this.collectionName}`);

    const record = list[index];
    const updateData = cleanUndefined(args.data);

    for (const [k, v] of Object.entries(updateData)) {
      if (v instanceof Date) {
        record[k] = v.toISOString();
      } else if (v && typeof v === 'object' && 'increment' in v) {
        record[k] = (record[k] || 0) + v.increment;
      } else {
        record[k] = v;
      }
    }

    writeJsonDb(dbData);

    const updated = { ...record };
    if (args.include) {
      await this.resolveIncludes(updated, args.include);
    }
    return updated;
  }

  async localDelete(args = {}) {
    const id = args.where?.id;
    if (id === undefined) {
      const existing = await this.localFindFirst(args);
      if (!existing) throw new Error(`Document not found to delete in ${this.collectionName}`);
      return this.localDelete({ where: { id: existing.id } });
    }

    const dbData = readJsonDb();
    const list = dbData[this.collectionName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`Document with ID ${id} not found in ${this.collectionName}`);

    const deleted = list.splice(index, 1)[0];
    writeJsonDb(dbData);

    return deleted;
  }

  async localFindFirst(args = {}) {
    const list = await this.localFindMany(args);
    return list[0] || null;
  }

  // --- Operaciones Cloud Firestore ---
  getRef() {
    return firestoreDb.collection(this.collectionName);
  }

  convertTimestamps(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (typeof obj.toDate === 'function') {
      return obj.toDate();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertTimestamps(item));
    }
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = this.convertTimestamps(v);
    }
    return result;
  }

  docToRecord(doc) {
    if (!doc.exists) return null;
    const data = this.convertTimestamps(doc.data());
    return {
      id: parseInt(doc.id) || doc.id,
      ...data
    };
  }

  async cloudFindMany(args = {}) {
    const snapshot = await this.getRef().get();
    let records = [];
    snapshot.forEach(doc => {
      const rec = this.docToRecord(doc);
      if (this.filterRecord(rec, args.where)) {
        records.push(rec);
      }
    });

    if (args.orderBy) {
      const orderKeys = Object.keys(args.orderBy);
      records.sort((a, b) => {
        for (const key of orderKeys) {
          const dir = args.orderBy[key] === 'desc' ? -1 : 1;
          if (a[key] < b[key]) return -1 * dir;
          if (a[key] > b[key]) return 1 * dir;
        }
        return 0;
      });
    }

    if (args.skip) records = records.slice(args.skip);
    if (args.take) records = records.slice(0, args.take);

    if (args.include) {
      for (const rec of records) {
        await this.resolveIncludes(rec, args.include);
      }
    }
    return records;
  }

  async cloudCreate(args = {}) {
    const data = cleanUndefined(args.data);
    const nestedCreates = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && value.create) {
        nestedCreates[key] = value.create;
        delete data[key];
      }
    }

    const nextId = await getNextId(this.collectionName);
    const docRef = this.getRef().doc(String(nextId));

    for (const [k, v] of Object.entries(data)) {
      if (v instanceof Date) {
        data[k] = v.toISOString();
      }
    }

    const record = { id: nextId, ...data };
    await docRef.set(record);

    for (const [relName, relData] of Object.entries(nestedCreates)) {
      const relConfig = this.relations[relName];
      if (relConfig) {
        const relDataWithFk = { ...relData };
        if (relConfig.foreignKey) {
          relDataWithFk[relConfig.foreignKey] = record.id;
        }
        const createdRel = await exports[relConfig.model].create({ data: relDataWithFk });
        record[relName] = createdRel;
      }
    }

    if (args.include) {
      await this.resolveIncludes(record, args.include);
    }
    return record;
  }

  async cloudUpdate(args = {}) {
    const id = args.where?.id;
    if (id === undefined) {
      const existing = await this.cloudFindFirst(args);
      if (!existing) throw new Error(`Document not found to update in ${this.collectionName}`);
      return this.cloudUpdate({ where: { id: existing.id }, data: args.data });
    }

    const docRef = this.getRef().doc(String(id));
    const updateData = cleanUndefined(args.data);

    for (const [k, v] of Object.entries(updateData)) {
      if (v instanceof Date) {
        updateData[k] = v.toISOString();
      } else if (v && typeof v === 'object' && 'increment' in v) {
        const doc = await docRef.get();
        const current = doc.data()[k] || 0;
        updateData[k] = current + v.increment;
      }
    }

    await docRef.update(updateData);
    const doc = await docRef.get();
    const rec = this.docToRecord(doc);
    if (args.include) {
      await this.resolveIncludes(rec, args.include);
    }
    return rec;
  }

  async cloudDelete(args = {}) {
    const id = args.where?.id;
    if (id === undefined) {
      const existing = await this.cloudFindFirst(args);
      if (!existing) throw new Error(`Document not found to delete in ${this.collectionName}`);
      return this.cloudDelete({ where: { id: existing.id } });
    }

    const docRef = this.getRef().doc(String(id));
    const doc = await docRef.get();
    const rec = this.docToRecord(doc);
    await docRef.delete();
    return rec;
  }

  async cloudFindFirst(args = {}) {
    const list = await this.cloudFindMany(args);
    return list[0] || null;
  }

  // --- Interfaz Unificada (Prisma-like) ---
  async findMany(args = {}) {
    return useLocalJson ? this.localFindMany(args) : this.cloudFindMany(args);
  }

  async findFirst(args = {}) {
    return useLocalJson ? this.localFindFirst(args) : this.cloudFindFirst(args);
  }

  async findUnique(args = {}) {
    if (args.where && args.where.id !== undefined) {
      if (useLocalJson) {
        const dbData = readJsonDb();
        const list = dbData[this.collectionName] || [];
        const rec = list.find(item => item.id === args.where.id);
        if (!rec) return null;
        const copy = { ...rec };
        if (args.include) {
          await this.resolveIncludes(copy, args.include);
        }
        return copy;
      } else {
        const doc = await this.getRef().doc(String(args.where.id)).get();
        if (!doc.exists) return null;
        const rec = this.docToRecord(doc);
        if (args.include) {
          await this.resolveIncludes(rec, args.include);
        }
        return rec;
      }
    }
    return this.findFirst(args);
  }

  async create(args = {}) {
    return useLocalJson ? this.localCreate(args) : this.cloudCreate(args);
  }

  async createMany(args = {}) {
    const dataList = Array.isArray(args.data) ? args.data : [];
    const created = [];
    for (const data of dataList) {
      created.push(await this.create({ data }));
    }
    return { count: created.length };
  }

  async update(args = {}) {
    return useLocalJson ? this.localUpdate(args) : this.cloudUpdate(args);
  }

  async delete(args = {}) {
    return useLocalJson ? this.localDelete(args) : this.cloudDelete(args);
  }

  async updateMany(args = {}) {
    const list = await this.findMany({ where: args.where });
    let count = 0;
    for (const item of list) {
      await this.update({ where: { id: item.id }, data: args.data });
      count++;
    }
    return { count };
  }

  async deleteMany(args = {}) {
    const list = await this.findMany({ where: args.where });
    let count = 0;
    for (const item of list) {
      await this.delete({ where: { id: item.id } });
      count++;
    }
    return { count };
  }

  async count(args = {}) {
    const list = await this.findMany(args);
    return list.length;
  }

  async aggregate(args = {}) {
    const list = await this.findMany({ where: args.where });
    const result = {};
    if (args._sum) {
      result._sum = {};
      for (const key of Object.keys(args._sum)) {
        result._sum[key] = list.reduce((acc, curr) => acc + (curr[key] || 0), 0);
      }
    }
    if (args._avg) {
      result._avg = {};
      for (const key of Object.keys(args._avg)) {
        const sum = list.reduce((acc, curr) => acc + (curr[key] || 0), 0);
        result._avg[key] = list.length > 0 ? sum / list.length : 0;
      }
    }
    return result;
  }

  async groupBy(args = {}) {
    const list = await this.findMany({ where: args.where });
    const groups = {};
    for (const item of list) {
      const keyVal = args.by.map(field => item[field]).join('|');
      if (!groups[keyVal]) {
        groups[keyVal] = {
          fields: args.by.reduce((acc, field) => {
            acc[field] = item[field];
            return acc;
          }, {}),
          count: 0
        };
      }
      groups[keyVal].count++;
    }

    let results = Object.values(groups).map(g => {
      const res = { ...g.fields };
      if (args._count) {
        res._count = {};
        for (const countKey of Object.keys(args._count)) {
          res._count[countKey] = g.count;
        }
      }
      return res;
    });

    if (args.orderBy) {
      results.sort((a, b) => {
        for (const [key, val] of Object.entries(args.orderBy)) {
          if (key.startsWith('_') && typeof val === 'object') {
            for (const field of Object.keys(val)) {
              const dir = val[field] === 'desc' ? -1 : 1;
              const valA = a[key] ? a[key][field] : 0;
              const valB = b[key] ? b[key][field] : 0;
              if (valA < valB) return -1 * dir;
              if (valA > valB) return 1 * dir;
            }
          } else {
            const dir = val === 'desc' ? -1 : 1;
            if (a[key] < b[key]) return -1 * dir;
            if (a[key] > b[key]) return 1 * dir;
          }
        }
        return 0;
      });
    }

    return results;
  }

  async upsert(args = {}) {
    const existing = await this.findFirst({ where: args.where });
    if (existing) {
      return this.update({ where: { id: existing.id }, data: args.update });
    } else {
      return this.create({ data: args.create });
    }
  }

  filterRecord(record, where) {
    if (!where) return true;
    for (const [key, value] of Object.entries(where)) {
      if (key === 'OR' && Array.isArray(value)) {
        const matchOr = value.some(subWhere => {
          return Object.entries(subWhere).every(([subKey, subVal]) => {
            const recordVal = record[subKey] || '';
            if (subVal && typeof subVal === 'object') {
              if (subVal.contains !== undefined) {
                return String(recordVal).toLowerCase().includes(subVal.contains.toLowerCase());
              }
              if (subVal.equals !== undefined) {
                return recordVal === subVal.equals;
              }
            }
            return recordVal === subVal;
          });
        });
        if (!matchOr) return false;
        continue;
      }
      if (value && typeof value === 'object' && !(value instanceof Date)) {
        if ('equals' in value) {
          if (record[key] !== value.equals) return false;
        }
        if ('contains' in value) {
          const recordVal = record[key] || '';
          if (!String(recordVal).toLowerCase().includes(value.contains.toLowerCase())) return false;
        }
        if ('in' in value) {
          if (!Array.isArray(value.in) || !value.in.includes(record[key])) return false;
        }
        if ('not' in value) {
          if (record[key] === value.not) return false;
        }
        if ('gte' in value) {
          if (record[key] < value.gte) return false;
        }
        if ('lte' in value) {
          if (record[key] > value.lte) return false;
        }
        if ('gt' in value) {
          if (record[key] <= value.gt) return false;
        }
        if ('lt' in value) {
          if (record[key] >= value.lt) return false;
        }
      } else if (value instanceof Date) {
        const recDate = record[key] instanceof Date ? record[key] : new Date(record[key]);
        if (recDate.getTime() !== value.getTime()) return false;
      } else if (value !== undefined) {
        if (record[key] !== value) return false;
      }
    }
    return true;
  }

  async resolveIncludes(record, include) {
    for (const [key, val] of Object.entries(include)) {
      if (val) {
        const relConfig = this.relations[key];
        if (relConfig) {
          const queryParams = {};
          if (typeof val === 'object' && val.include) {
            queryParams.include = val.include;
          }
          if (relConfig.type === 'one') {
            queryParams.where = { [relConfig.foreignKey]: record.id };
            record[key] = await exports[relConfig.model].findFirst(queryParams);
          } else if (relConfig.type === 'belongsTo') {
            queryParams.where = { id: record[relConfig.foreignKey] };
            record[key] = await exports[relConfig.model].findUnique(queryParams);
          } else if (relConfig.type === 'many') {
            queryParams.where = { [relConfig.foreignKey]: record.id };
            record[key] = await exports[relConfig.model].findMany(queryParams);
          }
        }
      }
    }
  }
}

// Colecciones registradas
const collectionsConfig = {
  user: {
    member: { model: 'member', type: 'one', foreignKey: 'userId' },
    roleRel: { model: 'role', type: 'belongsTo', foreignKey: 'roleId' }
  },
  role: {},
  club: {},
  clubConfig: {},
  season: {},
  discipline: {},
  futsalMatch: {
    matchBroadcasts: { model: 'matchBroadcast', type: 'many', foreignKey: 'matchId' },
    matchEvents: { model: 'matchEvent', type: 'many', foreignKey: 'matchId' },
    highlightClips: { model: 'highlightClip', type: 'many', foreignKey: 'matchId' },
    playerStatistics: { model: 'playerStatistic', type: 'many', foreignKey: 'matchId' }
  },
  matchBroadcast: {
    match: { model: 'futsalMatch', type: 'belongsTo', foreignKey: 'matchId' },
    cameraStatuses: { model: 'cameraStatus', type: 'many', foreignKey: 'matchBroadcastId' },
    replayMarkers: { model: 'replayMarker', type: 'many', foreignKey: 'matchBroadcastId' }
  },
  matchEvent: {
    match: { model: 'futsalMatch', type: 'belongsTo', foreignKey: 'matchId' }
  },
  highlightClip: {
    match: { model: 'futsalMatch', type: 'belongsTo', foreignKey: 'matchId' }
  },
  futsalTeam: {},
  futsalNews: {},
  futsalMedia: {},
  mediaFile: {},
  advertisementView: {},
  news: {},
  member: {
    user: { model: 'user', type: 'belongsTo', foreignKey: 'userId' },
    tutor: { model: 'tutor', type: 'belongsTo', foreignKey: 'tutorId' },
    digitalCard: { model: 'digitalCard', type: 'one', foreignKey: 'socioId' }
  },
  tutor: {
    socios: { model: 'member', type: 'many', foreignKey: 'tutorId' }
  },
  digitalCard: {
    socio: { model: 'member', type: 'belongsTo', foreignKey: 'socioId' }
  },
  priceRule: {},
  facility: {
    sede: { model: 'sede', type: 'belongsTo', foreignKey: 'sedeId' }
  },
  sede: {
    facilities: { model: 'facility', type: 'many', foreignKey: 'sedeId' }
  },
  schedule: {},
  booking: {},
  sponsor: {
    contracts: { model: 'contractHistory', type: 'many', foreignKey: 'sponsorId' },
    advertisements: { model: 'advertisement', type: 'many', foreignKey: 'sponsorId' }
  },
  banner: {
    advertisements: { model: 'advertisement', type: 'many', foreignKey: 'bannerId' }
  },
  campaign: {},
  contractHistory: {
    sponsor: { model: 'sponsor', type: 'belongsTo', foreignKey: 'sponsorId' }
  },
  transaction: {},
  payment: {
    socio: { model: 'member', type: 'belongsTo', foreignKey: 'socioId' },
    plan: { model: 'membershipPlan', type: 'belongsTo', foreignKey: 'planId' },
    invoices: { model: 'invoice', type: 'many', foreignKey: 'paymentId' }
  },
  invoice: {
    payment: { model: 'payment', type: 'belongsTo', foreignKey: 'paymentId' },
    socio: { model: 'member', type: 'belongsTo', foreignKey: 'socioId' }
  },
  subscription: {
    socio: { model: 'member', type: 'belongsTo', foreignKey: 'socioId' },
    plan: { model: 'membershipPlan', type: 'belongsTo', foreignKey: 'planId' }
  },
  playerProfile: {
    playerStatistics: { model: 'playerStatistic', type: 'many', foreignKey: 'playerId' }
  },
  coach: {},
  technicalStaff: {},
  clubEvent: {},
  medicalRecord: {},
  playerDocument: {},
  socialConfig: {},
  socialPost: {},
  training: {},
  categoryConfig: {},
  courtBooking: {},
  post: {},
  liveMatchEvent: {},
  document: {},
  membershipPlan: {},
  channel: {},
  liveStream: {},
  video: {},
  replayMarker: {},
  streamEvent: {},
  streamCamera: {},
  streamReplay: {},
  auditLog: {},
  cameraStatus: {
    matchBroadcast: { model: 'matchBroadcast', type: 'belongsTo', foreignKey: 'matchBroadcastId' }
  },
  playlist: {},
  streamStatistic: {},
  broadcastSponsor: {},
  advertisement: {
    sponsor: { model: 'sponsor', type: 'belongsTo', foreignKey: 'sponsorId' },
    banner: { model: 'banner', type: 'belongsTo', foreignKey: 'bannerId' }
  },
  playerStatistic: {
    player: { model: 'playerProfile', type: 'belongsTo', foreignKey: 'playerId' },
    match: { model: 'futsalMatch', type: 'belongsTo', foreignKey: 'matchId' }
  }
};

for (const [colName, relations] of Object.entries(collectionsConfig)) {
  exports[colName] = new FirestoreCollection(colName, relations);
}

exports.$disconnect = async () => {};
exports.$queryRaw = async () => [1];
exports.$transaction = async (callback) => {
  return callback(exports);
};
