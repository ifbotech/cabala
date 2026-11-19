// Sonda: cuánto pesa cada mejora del Altar por separado (victorias del bot con solo esa mejora al máximo).
//   npx tsx scripts/sonda-altar.ts [n] [mazo]
import { jugarEntera } from '../src/rules/bot';
import type { MazoId } from '../src/rules/mazos';
import { nuevaPartida } from '../src/rules/partida';
import { MEJORAS, altarLleno, altarVacio } from '../src/rules/perfil';
import { semillaDe } from '../src/rules/rng';

const n = Number(process.argv[2]) || 400;
const mazo = (process.argv[3] as MazoId) || 'truco';
function gana(altar: Record<string, number>): number {
  let g = 0;
  for (let i = 0; i < n; i++) {
    const p = nuevaPartida({ mazo, semilla: `SONDA${i}`, altar });
    jugarEntera(p, { rng: { rng: semillaDe(`bot${i}`) } });
    if (p.fin?.victoria) g++;
  }
  return Math.round((1000 * g) / n) / 10;
}
console.log(`${mazo} · n=${n}`);
console.log(`vacío   ${gana(altarVacio())}`);
for (const m of MEJORAS) console.log(`${m.id.padEnd(10)} ${gana({ ...altarVacio(), [m.id]: m.max })}`);
console.log(`lleno   ${gana(altarLleno())}`);
