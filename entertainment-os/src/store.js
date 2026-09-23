// Tiny JSON-file store. Single process, synchronous writes — fine for a demo OS.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seed } from './seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// On Vercel (or any read-only-filesystem host) there's no writable 'data/' dir — fall back to
// /tmp. That still resets between cold starts / separate instances; see README's Vercel section.
const DB_PATH = process.env.EOS_DB || (process.env.VERCEL ? '/tmp/eos-db.json' : path.join(here, '..', 'data', 'db.json'));

let db = null;
let memoryOnly = false;

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
