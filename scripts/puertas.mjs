// Todas las puertas de CÁBALA, una tras otra y en primer plano, cada una con su tope. Corta en la primera que falle.
//   npm run puertas            todas
//   npm run puertas -- --sin-lab   sin el laboratorio completo (si las reglas no cambiaron, la huella ya lo certifica)
import { spawnSync } from 'node:child_process';

const sinLab = process.argv.includes('--sin-lab');
const PUERTAS = [
  ['tipos', 120, 'npm run typecheck'],
  ['forja y linter', 200, 'npm run forja'],
  ['pixel-lint', 120, 'npm run pixel-lint'],
  ...(sinLab ? [] : [['laboratorio', 590, 'npm run analyze:meta']]),
  ['reglamento', 60, 'npm run docs'],
  ['pruebas', 280, 'npm test'],
  ['QA visual (es)', 290, 'npm run qa:visual'],
  ['QA visual (en)', 290, 'npm run qa:visual -- --lang=en'],
  ['QA de humo (es)', 290, 'npm run qa:smoke'],
  ['QA de humo (en, truco)', 290, 'npm run qa:smoke -- --lang=en --mazo=truco'],
  ['QA de audio', 200, 'npm run qa:audio'],
  ['FPS', 200, 'npm run qa:fps'],
  ['construcción', 200, 'npm run build:web'],
];

const t0 = Date.now();
const hechas = [];
for (const [nombre, tope, orden] of PUERTAS) {
  const t = Date.now();
  process.stdout.write(`\n━━ ${nombre} · ${orden}\n`);
  const r = spawnSync(process.execPath, ['scripts/con-tope.mjs', String(tope), ...orden.split(' ')], { stdio: 'inherit' });
  const seg = ((Date.now() - t) / 1000).toFixed(0);
  if (r.status !== 0) {
    console.error(`\n✗ PUERTA EN ROJO: ${nombre} (salió con ${r.status} a los ${seg} s). Hechas antes: ${hechas.join(', ') || 'ninguna'}.`);
    process.exit(r.status ?? 1);
  }
  hechas.push(`${nombre} ${seg} s`);
}
console.log(`\n✓ ${PUERTAS.length} puertas en verde en ${((Date.now() - t0) / 1000).toFixed(0)} s:\n  ${hechas.join('\n  ')}`);
