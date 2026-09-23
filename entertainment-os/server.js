// Entertainment OS — local dev server (Node 18+). One long-running process, so the in-memory
// chat sessions, live-data cache and JSON store all behave the way this app expects.
// The actual request handling lives in src/app.js, shared with the Vercel adapter (api/index.js).
import http from 'node:http';
import { ready, handleRequest } from './src/app.js';
import { llmEnabled } from './src/llm.js';

const PORT = Number(process.env.PORT) || 4600;

await ready;
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Entertainment OS running on http://localhost:${PORT}  (Claude intake: ${llmEnabled() ? 'on' : 'off — rule engine'})`);
});
