// Quién mata a cada Mazo en el tramo 1 (diagnóstico de balance): npx tsx scripts/caidas.ts escoba,truco
import { paso } from '../src/rules/bot';
import * as juego from '../src/rules/partida';
import type { MazoId } from '../src/rules/mazos';

for (const mazo of (process.argv[2] ?? 'escoba,truco,mentiroso').split(',') as MazoId[]) {
  const cuenta: Record<string, number> = {};
  let n = 0;
  for (let i = 0; i < 600; i++) {
    const p = juego.nuevaPartida({ mazo, semilla: `CAI${i}` });
    const o = { rng: { rng: i + 3 } };
    let tipo = '';
    let turnoRey = 0;
    while (p.fase !== 'fin') {
      if (p.combate) {
        tipo = `${p.combate.tipo}${p.combate.tipo === 'rey' ? (p.combate.fila[0]?.jefe ? '-jefe' : '-corte') : ''}`;
        turnoRey = p.combate.turno;
      }
      if (!paso(p, o)) break;
    }
    if (!p.fin?.victoria && p.acto === 0) {
      n++;
      const k = `${tipo} t${Math.min(turnoRey, 9)}`;
      cuenta[k] = (cuenta[k] ?? 0) + 1;
    }
  }
  console.log(mazo, n, Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(' '));
}
