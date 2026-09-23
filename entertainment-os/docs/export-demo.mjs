// Prints the demo dataset (produced by the real agent pipeline) as JSON for the doc generators.
// The documents describe the India edition; the region has to be set before the modules load.
process.env.EOS_REGION = process.env.EOS_DOCS_REGION || 'IN';
process.env.EOS_DISABLE_LLM = '1';
process.env.EOS_OFFLINE = '1';
process.env.EOS_DEMO = '1'; // the docs describe the demo edition; real-data-only mode is off by default

const { useMemory } = await import('../src/store.js');
const { loadDemo } = await import('../src/demo.js');
const { POLICY, CATEGORIES, FUNDING } = await import('../src/seed.js');
const { LOCATIONS } = await import('../src/locations.js');
const { MOVIES, EVENT_TYPES } = await import('../src/catalog.js');

useMemory();
const d = await loadDemo();
process.stdout.write(
  JSON.stringify({
    ...d,
    policy: POLICY,
    categories: CATEGORIES,
    funding: FUNDING,
    movieCatalog: MOVIES,
    eventTypes: EVENT_TYPES,
    locations: LOCATIONS,
    locationCounts: { countries: Object.keys(LOCATIONS).length, indiaStates: Object.keys(LOCATIONS.India).length, indiaCities: Object.values(LOCATIONS.India).flat().length },
  }),
);
