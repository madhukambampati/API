// Prints the demo dataset (produced by the real agent pipeline) as JSON for the doc generators.
import { useMemory } from '../src/store.js';
import { loadDemo } from '../src/demo.js';

process.env.EOS_DISABLE_LLM = '1';
useMemory();
const d = await loadDemo();
process.stdout.write(JSON.stringify(d));
