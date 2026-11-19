// El laboratorio de balance. Juega miles de partidas con el bot, en procesos paralelos, y deja:
//   · src/rules/sellos.json  — el sello S / A / B de cada Amuleto, Bendición y Aumento, sacado de victorias reales:
//     en partidas donde cada «ELEGÍ UNA» se resuelve al azar, se compara ganar habiendo elegido la pieza contra ganar
//     habiéndola visto ofrecida y no elegida (así no hay sesgo de quién llega lejos);
//   · scripts/meta-report.json — victorias por Mazo con el Altar vacío y lleno, ritmo y avisos contra los objetivos.
//
//   npm run analyze:meta              informe completo (certificación)
//   npm run analyze:meta -- --fast    muestras cortas (para iterar)
//   npm run analyze:meta -- --solo-sellos | --sin-sellos
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { guardian } from './guardian';
import { huella } from './huella';
import type { Celda, Pieza, Resultado } from './lab';
import { OBJETIVOS, RITMO } from './objetivos';
import { MAZOS } from '../src/rules/mazos';

guardian('analyze:meta', 590);
const args = process.argv.slice(2);
const FAST = args.includes('--fast');
const N = FAST ? 500 : 6000;
const N_SELLOS = FAST ? 800 : 8000;

/** Corre una celda en su propio proceso. */
function celda(c: Celda): Promise<Resultado> {
  return new Promise((ok, mal) => {
    const h = spawn(process.execPath, ['--import', 'tsx', 'scripts/lab.ts', '--json', JSON.stringify(c)], { stdio: ['ignore', 'pipe', 'inherit'] });
    let salida = '';
    h.stdout.on('data', (d) => (salida += d));
    h.on('exit', (codigo) => {
      if (codigo !== 0) return mal(new Error(`la celda ${c.mazo}/${c.altar} salió con ${codigo}`));
      ok(JSON.parse(salida.slice(salida.indexOf('{'))) as Resultado);
    });
  });
}
/** Corre las celdas de a tantas a la vez como núcleos haya. */
async function tanda(celdas: Celda[]): Promise<Resultado[]> {
  const out: Resultado[] = new Array(celdas.length);
  let sig = 0;
  const obrero = async () => {
    for (;;) {
      const i = sig++;
      if (i >= celdas.length) return;
      out[i] = await celda(celdas[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.max(2, Math.min(cpus().length - 1, celdas.length)) }, obrero));
  return out;
}
const pct = (a: number, b: number) => (b ? Math.round((1000 * a) / b) / 10 : 0);
const t0 = Date.now();

// ───────────── 1 · sellos ─────────────
let sellos: Record<string, 'S' | 'A' | 'B'> = {};
let tablaSellos: { clave: string; ofrecida: number; elegida: number; con: number; sin: number; delta: number; sello: string }[] = [];
if (!args.includes('--sin-sellos')) {
  const partes = 4;
  const rs = await tanda(MAZOS.flatMap((mazo) => Array.from({ length: partes }, (_, i) => ({ mazo, altar: 'vacio' as const, reinado: 1, n: Math.ceil(N_SELLOS / partes), ofertasAlAzar: true, semilla: `SELLO${i}-` }))));
  const suma: Record<string, Pieza> = {};
  for (const r of rs)
    for (const [k, p] of Object.entries(r.piezas)) {
      const z = (suma[k] ??= { ofrecida: 0, elegida: 0, ganaCon: 0, ganaSin: 0 });
      z.ofrecida += p.ofrecida;
      z.elegida += p.elegida;
      z.ganaCon += p.ganaCon;
      z.ganaSin += p.ganaSin;
    }
  tablaSellos = Object.entries(suma).map(([clave, p]) => {
    const con = pct(p.ganaCon, p.elegida);
    const sin = pct(p.ganaSin, p.ofrecida - p.elegida);
    return { clave, ofrecida: p.ofrecida, elegida: p.elegida, con, sin, delta: Math.round((con - sin) * 10) / 10, sello: 'A' };
  });
  // por familia (Amuletos, Bendiciones, Aumentos): el tercio que más sube la victoria es S; el que menos, B
  for (const pre of ['a', 'b', 'u']) {
    const fam = tablaSellos.filter((x) => x.clave.startsWith(`${pre}:`)).sort((x, y) => y.delta - x.delta);
    const tercio = Math.round(fam.length / 3);
    fam.forEach((x, i) => (x.sello = i < tercio ? 'S' : i >= fam.length - tercio ? 'B' : 'A'));
  }
  sellos = Object.fromEntries(tablaSellos.sort((a, b) => a.clave.localeCompare(b.clave)).map((x) => [x.clave, x.sello as 'S' | 'A' | 'B']));
  writeFileSync('src/rules/sellos.json', JSON.stringify(sellos, null, 2) + '\n');
  console.log(`sellos · ${tablaSellos.length} piezas medidas en ${rs.reduce((s, r) => s + r.celda.n, 0)} partidas al azar → src/rules/sellos.json (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  for (const pre of ['a', 'b', 'u']) console.log(`  ${pre}: ${tablaSellos.filter((x) => x.clave.startsWith(`${pre}:`)).sort((x, y) => y.delta - x.delta).map((x) => `${x.clave.slice(2)} ${x.sello}${x.delta >= 0 ? '+' : ''}${x.delta}`).join(' · ')}`);
}
if (args.includes('--solo-sellos')) process.exit(0);

// ───────────── 2 · victorias por Mazo ─────────────
const celdas: Celda[] = [];
for (const mazo of MAZOS) for (const altar of ['vacio', 'lleno'] as const) celdas.push({ mazo, altar, reinado: 1, n: N, semilla: 'META' });
for (const mazo of MAZOS) celdas.push({ mazo, altar: 'lleno', reinado: 8, n: Math.ceil(N / 3), semilla: 'META8-' });
const rs = await tanda(celdas);

const avisos: string[] = [];
const dentro = (v: number, [a, b]: readonly [number, number]) => v >= a && v <= b;
const filas = MAZOS.map((mazo) => {
  const de = (altar: string, reinado: number) => rs.find((r) => r.celda.mazo === mazo && r.celda.altar === altar && r.celda.reinado === reinado)!;
  const v = de('vacio', 1);
  const l = de('lleno', 1);
  const r8 = de('lleno', 8);
  const gv = pct(v.victorias, v.celda.n);
  const gl = pct(l.victorias, l.celda.n);
  const g8 = pct(r8.victorias, r8.celda.n);
  const golpesGuardia = Math.round((10 * v.golpesTipo.guardia) / Math.max(1, v.combatesTipo.guardia)) / 10;
  const golpesRey = Math.round((10 * (v.golpesTipo.rey ?? 0)) / Math.max(1, v.combatesTipo.rey)) / 10;
  // duración de una partida ganada: los golpes de una partida entera más las pantallas del camino
  const ganadas = Math.max(1, l.victorias);
  const golpesPorGanada = (l.golpes / l.celda.n) * (12.4 / Math.max(1, l.combates / l.celda.n));
  const minutos = Math.round(((golpesPorGanada * RITMO.golpe + 26 * RITMO.pantalla) / 60) * 10) / 10;
  void ganadas;
  if (!dentro(gv, OBJETIVOS.base)) avisos.push(`${mazo}: gana ${gv} % con el Altar vacío (objetivo ${OBJETIVOS.base.join('–')})`);
  if (!dentro(gl, OBJETIVOS.lleno)) avisos.push(`${mazo}: gana ${gl} % con el Altar lleno (objetivo ${OBJETIVOS.lleno.join('–')})`);
  if (gl - g8 < OBJETIVOS.reinado8Baja) avisos.push(`${mazo}: el Reinado 8 solo baja ${Math.round((gl - g8) * 10) / 10} puntos`);
  if (!dentro(golpesGuardia, OBJETIVOS.golpesGuardia)) avisos.push(`${mazo}: ${golpesGuardia} golpes por Guardia (objetivo ${OBJETIVOS.golpesGuardia.join('–')})`);
  if (!dentro(golpesRey, OBJETIVOS.golpesRey)) avisos.push(`${mazo}: ${golpesRey} golpes por Rey (objetivo ${OBJETIVOS.golpesRey.join('–')})`);
  if (!dentro(minutos, OBJETIVOS.minutos)) avisos.push(`${mazo}: ${minutos} min por partida ganada (objetivo ${OBJETIVOS.minutos.join('–')})`);
  return {
    mazo,
    vacio: gv,
    lleno: gl,
    reinado8: g8,
    caidas: v.caidas,
    golpesGuardia,
    golpesRey,
    golpeMedio: v.danoTramo.map((d, i) => (v.golpesTramo[i] ? Math.round(d / v.golpesTramo[i]) : 0)),
    exactos: Math.round((10 * v.exactos) / v.celda.n) / 10,
    cantos: Math.round((10 * v.cantos) / v.celda.n) / 10,
    mejorGolpe: Math.max(v.mejorGolpe, l.mejorGolpe),
    porotos: Math.round(v.porotos / v.celda.n),
    minutos,
  };
});

const informe = { fecha: new Date().toISOString().slice(0, 10), huella: huella(), rapido: FAST, partidasPorCelda: N, objetivos: OBJETIVOS, mazos: filas, sellos: tablaSellos, avisos };
writeFileSync(FAST ? 'scripts/meta-fast.json' : 'scripts/meta-report.json', JSON.stringify(informe, null, 2) + '\n');

console.log(`\nMazo        vacío   lleno   R8     Guardia  Rey   min   golpe medio por tramo`);
for (const f of filas) console.log(`${f.mazo.padEnd(11)} ${String(f.vacio).padStart(5)}   ${String(f.lleno).padStart(5)}   ${String(f.reinado8).padStart(5)}  ${String(f.golpesGuardia).padStart(5)}   ${String(f.golpesRey).padStart(4)}  ${String(f.minutos).padStart(4)}   ${f.golpeMedio.join(' / ')}`);
console.log(avisos.length ? `\n${avisos.length} avisos:\n  ${avisos.join('\n  ')}` : '\nSin avisos: los 5 Mazos están dentro de los objetivos.');
console.log(`\nanalyze:meta · ${FAST ? 'rápido' : 'completo'} · ${N} partidas por celda · ${((Date.now() - t0) / 1000).toFixed(0)} s → ${FAST ? 'scripts/meta-fast.json' : 'scripts/meta-report.json'}`);
process.exit(!FAST && avisos.length ? 1 : 0);
