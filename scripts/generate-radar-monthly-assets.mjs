import { main } from './radar/generate-monthly-assets.mjs';
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
