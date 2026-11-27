// Todas las puertas de CÁBALA 2.0, una tras otra y en primer plano. Corta en la primera que falle.
//   npm run puertas
import { spawnSync } from 'node:child_process';

const PUERTAS = [
  ['tipos', 120, 'npm run typecheck'],
  ['forja y linter', 200, 'npm run forja'],
  ['pixel-lint', 120, 'npm run pixel-lint'],
  ['pruebas', 280, 'npm test'],
  ['QA de humo (es)', 290, 'npm run qa:smoke'],
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
