// El laboratorio: juega partidas enteras con el bot y cuenta lo que pasa. Lo usan analyze:meta, las pruebas de
// invariantes y los sondeos rápidos de balance (npx tsx scripts/lab.ts <n> [mazo] [vacio|lleno] [reinado]).
import { pathToFileURL } from 'node:url';
import { jugarEntera } from '../src/rules/bot';
import type { Oferta } from '../src/rules/estado';
import { MAZOS } from '../src/rules/mazos';
import type { MazoId } from '../src/rules/mazos';
import { nuevaPartida } from '../src/rules/partida';
import { altarLleno, altarVacio } from '../src/rules/perfil';
import { semillaDe } from '../src/rules/rng';
import { clavePieza } from '../src/rules/notas';

export interface Celda {
  mazo: MazoId;
  altar: 'vacio' | 'lleno';
  reinado: number;
  n: number;
  /** Elegir al azar en cada «ELEGÍ UNA» (para las notas del laboratorio). */
  ofertasAlAzar?: boolean;
  semilla?: string;
}

export interface Pieza {
  ofrecida: number;
  elegida: number;
  /** Victorias de las partidas en que se eligió / en que se ofreció y no se eligió. */
  ganaCon: number;
  ganaSin: number;
}

export interface Resultado {
  celda: Celda;
  victorias: number;
  /** Tramo en el que terminó cada partida perdida: [tramo 1, tramo 2, tramo 3]. */
  caidas: [number, number, number];
  turnos: number;
  combates: number;
  reyes: number;
  golpes: number;
  exactos: number;
  cantos: number;
  mejorGolpe: number;
  porotos: number;
  vidaFinal: number;
  piezas: Record<string, Pieza>;
  /** Por tramo: golpes dados y daño total (para ver cómo crece el golpe medio). */
  golpesTramo: [number, number, number];
  danoTramo: [number, number, number];
  /** Golpes por tipo de combate (los turnos que dura cada uno). */
  golpesTipo: Record<string, number>;
  combatesTipo: Record<string, number>;
}

/** Juega una celda entera. */
export function correr(celda: Celda): Resultado {
  const r: Resultado = { celda, victorias: 0, caidas: [0, 0, 0], turnos: 0, combates: 0, reyes: 0, golpes: 0, exactos: 0, cantos: 0, mejorGolpe: 0, porotos: 0, vidaFinal: 0, piezas: {}, golpesTramo: [0, 0, 0], danoTramo: [0, 0, 0], golpesTipo: {}, combatesTipo: {} };
  const altar = celda.altar === 'lleno' ? altarLleno() : altarVacio();
  for (let i = 0; i < celda.n; i++) {
    const semilla = `${celda.semilla ?? 'LAB'}${i}`;
    const p = nuevaPartida({ mazo: celda.mazo, reinado: celda.reinado, semilla, altar });
    const vistas: { clave: string; elegida: boolean }[] = [];
    jugarEntera(p, {
      rng: { rng: semillaDe(`bot|${semilla}`) },
      ofertasAlAzar: celda.ofertasAlAzar,
      alGolpear: (acto, tipo, total) => {
        r.golpesTramo[Math.min(2, acto)]++;
        r.danoTramo[Math.min(2, acto)] += total;
        r.golpesTipo[tipo] = (r.golpesTipo[tipo] ?? 0) + 1;
      },
      alElegir: (oferta: Oferta, elegido) => {
        for (const id of oferta.opciones) vistas.push({ clave: clavePieza(oferta.tipo, id), elegida: id === elegido });
      },
    });
    const gano = !!p.fin?.victoria;
    if (gano) r.victorias++;
    else r.caidas[Math.min(2, p.acto)]++;
    r.turnos += p.stats.turnos;
    r.combates += p.stats.combates;
    r.reyes += p.stats.reyes;
    r.golpes += p.stats.golpes;
    r.exactos += p.stats.exactos;
    r.cantos += p.stats.cantos;
    r.mejorGolpe = Math.max(r.mejorGolpe, p.stats.mejorGolpe);
    r.porotos += p.fin?.porotos ?? 0;
    r.vidaFinal += gano ? p.vida / p.vidaMax : 0;
    r.combatesTipo.guardia = (r.combatesTipo.guardia ?? 0) + p.stats.combates - p.stats.elites - p.stats.reyes;
    r.combatesTipo.elite = (r.combatesTipo.elite ?? 0) + p.stats.elites;
    r.combatesTipo.rey = (r.combatesTipo.rey ?? 0) + p.stats.reyes;
    for (const v of vistas) {
      const z = (r.piezas[v.clave] ??= { ofrecida: 0, elegida: 0, ganaCon: 0, ganaSin: 0 });
      z.ofrecida++;
      if (v.elegida) {
        z.elegida++;
        if (gano) z.ganaCon++;
      } else if (gano) z.ganaSin++;
    }
  }
  return r;
}

export const pctDe = (a: number, b: number): string => (b ? ((100 * a) / b).toFixed(1) : '—');

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href && process.argv[2] === '--json') {
  // una celda pedida por analyze:meta: el resultado sale entero por la salida estándar
  process.stdout.write(JSON.stringify(correr(JSON.parse(process.argv[3]) as Celda)));
  process.exit(0);
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [nTxt, mazoTxt, altarTxt, reinadoTxt] = process.argv.slice(2);
  const n = Number(nTxt) || 300;
  const mazos = mazoTxt && mazoTxt !== 'todos' ? [mazoTxt as MazoId] : [...MAZOS];
  const altares = altarTxt === 'lleno' || altarTxt === 'vacio' ? [altarTxt] : ['vacio', 'lleno'];
  const t0 = Date.now();
  for (const mazo of mazos)
    for (const altar of altares as ('vacio' | 'lleno')[]) {
      const r = correr({ mazo, altar, reinado: Number(reinadoTxt) || 1, n });
      console.log(
        `${mazo.padEnd(10)} ${altar.padEnd(6)} gana ${pctDe(r.victorias, n).padStart(5)} %  cae en ${r.caidas.join('/')}  turnos ${(r.turnos / n).toFixed(1)}  combates ${(r.combates / n).toFixed(1)}  exactos ${(r.exactos / n).toFixed(1)}  cantos ${(r.cantos / n).toFixed(1)}  mejor ${r.mejorGolpe}  porotos ${(r.porotos / n).toFixed(0)}`,
      );
      console.log(`           golpe medio por tramo ${r.danoTramo.map((d, i) => (r.golpesTramo[i] ? Math.round(d / r.golpesTramo[i]) : 0)).join(' / ')}  ·  golpes por combate: guardia ${(r.golpesTipo.guardia / Math.max(1, r.combatesTipo.guardia)).toFixed(1)} élite ${((r.golpesTipo.elite ?? 0) / Math.max(1, r.combatesTipo.elite)).toFixed(1)} rey ${((r.golpesTipo.rey ?? 0) / Math.max(1, r.combatesTipo.rey)).toFixed(1)}  ·  vida al ganar ${pctDe(r.vidaFinal, Math.max(1, r.victorias))} %`);
    }
  console.log(`${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
