// Tiny JSON-file store, optionally backed by MongoDB for persistence across serverless
// invocations. Every existing caller keeps using load()/save() synchronously — MongoDB (only
// touched when MONGODB_URI is set) is hydrated once per cold start and written to in the
// background after each save(), so nothing else in the codebase needs to change.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seed } from './seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// On Vercel (or any read-only-filesystem host) there's no writable 'data/' dir — fall back to
// /tmp. That still resets between cold starts / separate instances unless MongoDB is configured
// below; see README's "Deploying to Vercel" section.
const DB_PATH = process.env.EOS_DB || (process.env.VERCEL ? '/tmp/eos-db.json' : path.join(here, '..', 'data', 'db.json'));

let db = null;
let memoryOnly = false;

// ---------- optional MongoDB persistence ----------
// Set MONGODB_URI (e.g. a free MongoDB Atlas cluster) to make bookings, approvals, splits and
// expense reports actually survive between Vercel's separate, memory-isolated invocations.
// Without it the app behaves exactly as before: a JSON file (or /tmp on Vercel), reset on cold
// start. The whole app still keeps one in-memory object and reads/writes it synchronously —
// Mongo is only consulted at the two points below, never on the hot path.
const MONGO_URI = process.env.MONGODB_URI || '';
const MONGO_DB_NAME = process.env.MONGODB_DB || 'entertainment_os';
const MONGO_DOC_ID = 'app-state';
let mongoCollectionPromise = null;
let hydratedFromMongo = false;

export const mongoEnabled = () => Boolean(MONGO_URI);

async function getMongoCollection() {
  if (!MONGO_URI) return null;
  if (!mongoCollectionPromise) {
    mongoCollectionPromise = import('mongodb')
      .then(async ({ MongoClient }) => {
        // Fail fast: a wrong/unreachable URI must not reintroduce the multi-second stalls on
        // Vercel that the live-data fix (see providers.js/app.js) exists to avoid.
        const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
        await client.connect();
        return client.db(MONGO_DB_NAME).collection('state');
      })
      .catch((err) => {
        console.warn('[store] MongoDB unavailable, falling back to file storage:', err?.message || err);
        return null;
      });
  }
  return mongoCollectionPromise;
}

// Pull the saved state from MongoDB before the app serves any request (called once per cold
// start — see src/app.js's `ready`). A no-op when MongoDB isn't configured, already hydrated, or
// unreachable (falls back to the file store either way).
export async function hydrateFromMongo() {
  if (hydratedFromMongo || !MONGO_URI) return;
  hydratedFromMongo = true;
  const col = await getMongoCollection();
  if (!col) return;
  try {
    const doc = await col.findOne({ _id: MONGO_DOC_ID });
    if (doc?.data) db = doc.data;
  } catch (err) {
    console.warn('[store] MongoDB read failed, falling back to file storage:', err?.message || err);
  }
}

// Fire-and-forget: never blocks the (synchronous, in-memory) callers of save().
function persistToMongo() {
  if (!MONGO_URI) return;
  getMongoCollection()
    .then((col) => col?.replaceOne({ _id: MONGO_DOC_ID }, { _id: MONGO_DOC_ID, data: db, updatedAt: new Date() }, { upsert: true }))
    .catch((err) => console.warn('[store] MongoDB write failed:', err?.message || err));
}

export function load() {
  if (db) return db;
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } else {
    db = seed();
    save();
  }
  return db;
}

export function save() {
  if (memoryOnly) return;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  persistToMongo();
}

export function reset(data = seed()) {
  db = data;
  save();
  return db;
}

// Use an in-memory DB (tests).
export function useMemory(data = seed()) {
  memoryOnly = true;
  db = data;
  return db;
}

export function nextId(kind, prefix) {
  const d = load();
  d.counters[kind] = (d.counters[kind] || 0) + 1;
  return `${prefix}-${d.counters[kind]}`;
}

export function person(id) {
  return load().people.find((p) => p.id === id);
}

export function dept(id) {
  return load().departments.find((d) => d.id === id);
}

export function log(agent, message, ref) {
  const entry = { at: new Date().toISOString(), agent, message, ref: ref || null };
  load().activity.unshift(entry);
  load().activity.length = Math.min(load().activity.length, 400);
  return entry;
}
