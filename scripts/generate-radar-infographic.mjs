import { main } from './radar/generate-infographic.mjs';
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
