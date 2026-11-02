import { main } from './radar/generate-weekly-assets.mjs';
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
