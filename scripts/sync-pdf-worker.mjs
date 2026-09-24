// Copia el worker de pdf.js a public/ para que los PDF funcionen sin internet.
// react-pdf importa la misma copia hoisted de pdfjs-dist, así que las versiones coinciden.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const src = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
mkdirSync(new URL('../public', import.meta.url), { recursive: true });
copyFileSync(src, new URL('../public/pdf.worker.min.mjs', import.meta.url));
console.log('pdf worker synced:', src);
