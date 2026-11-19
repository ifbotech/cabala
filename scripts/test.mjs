// `npm test`: todas las pruebas de Vitest con tope duro (ninguna espera es infinita).
// Con argumentos (`npm test -- tests/combate.test.ts`), se le pasan a Vitest tal cual.
import { spawnSync } from 'node:child_process';

const TOPE = Number(process.env.GUARDIAN_S) || 300;
const extra = process.argv.slice(2);
const r = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', ...extra], { stdio: 'inherit', timeout: TOPE * 1000, killSignal: 'SIGKILL' });
if (r.error && /ETIMEDOUT/.test(String(r.error.code ?? r.error.message))) {
  console.error(`\nGUARDIÁN · npm test: Vitest pasó de ${TOPE} s. Se corta con 124.`);
  process.exit(124);
}
process.exit(r.status ?? 1);
