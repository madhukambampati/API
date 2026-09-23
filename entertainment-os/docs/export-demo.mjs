// Prints the demo dataset (produced by the real agent pipeline) as JSON for the doc generators.
import { useMemory } from '../src/store.js';
import { loadDemo } from '../src/demo.js';
import { POLICY, CATEGORIES, FUNDING } from '../src/seed.js';
import { LOCATIONS } from '../src/locations.js';
import { MOVIES, EVENT_TYPES } from '../src/catalog.js';

process.env.EOS_DISABLE_LLM = '1';
useMemory();
const d = await loadDemo();
process.stdout.write(JSON.stringify({ ...d, policy: POLICY, categories: CATEGORIES, funding: FUNDING, movieCatalog: MOVIES, eventTypes: EVENT_TYPES, locations: LOCATIONS, locationCounts: { countries: Object.keys(LOCATIONS).length, indiaStates: Object.keys(LOCATIONS.India).length, indiaCities: Object.values(LOCATIONS.India).flat().length } }));
