import { main } from './radar/generate-audio.mjs';
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
