// El motor de efectos: pixel-art procedural en Canvas, sin dependencias, a 60 FPS.
//
// Tres lienzos de baja resolución que se estiran sin suavizado: el FONDO (la escena de cada parada, ver escenas.ts,
// con su luz que respira y sus brasas), el de COLOR (píxeles opacos de los efectos: tajos, monedas, números, la carta
// que se parte) y el de LUZ (resplandores aditivos, tramados con Bayer, que se suman a la pantalla). Es el método
// de doble buffer de pixelfx (https://github.com/patch-gg/pixelfx, MIT): color por un lado, luz por otro, pasos de
// rampa duros en el color y la suavidad solo en la luz. El código es nuestro.
import { ajustes } from '../almacen';
import type { Palo } from '../../rules/cartas';
import { BAYER4 } from '../pixel/dither';
import { armarEscenario, avivarFogon, dondeFuego, type Escena, type Escenario } from './escenas';

export type Ctx = CanvasRenderingContext2D;

export interface Efecto {
  /** Avanza `dt` segundos. Devuelve false cuando terminó. */
  paso(dt: number): boolean;
  /** Pinta en el lienzo de color y en el de luz (coordenadas lógicas). */
  pinta(color: Ctx, luz: Ctx): void;
}

/** Píxeles de pantalla por celda de efecto. */
export let S = 2;
export let W = 0;
export let H = 0;

let cFondo: HTMLCanvasElement;
let cColor: HTMLCanvasElement;
let cLuz: HTMLCanvasElement;
let xFondo: Ctx;
let xColor: Ctx;
let xLuz: Ctx;
const efectos: Efecto[] = [];
let congelado = 0;
let foto = false;
let ultimo = 0;
let reloj = 0;
let cuadros = 0;
let dtFondo = 0;
let fondoPintado = false;
let limpios = true;

/** Azar propio de los efectos (no toca el de las reglas). */
let semilla = 0x9e3779b9;
export function azar(): number {
  semilla = (semilla + 0x6d2b79f5) >>> 0;
  let t = semilla;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const entre = (a: number, b: number): number => a + azar() * (b - a);

// ───────────── la escena del fondo ─────────────

export type { Escena } from './escenas';

let escena: Escena = 'portada';
/** El clima del duelo de Rey (el palo del Rey) o nada. Solo lo viste la mesa. */
let clima: Palo | null = null;
/** La escena montada: sus cuadros de luz ya pintados y lo que se mueve encima. */
let escenario: Escenario | null = null;
/** Las escenas ya armadas a este tamaño: volver a una parada no cuesta nada. */
const armadas = new Map<string, Escenario>();
/** Segundos de escena (lo que lleva hamacándose el farol), el paseo del candil y lo que queda del fogonazo. */
let tEscena = 0;
let respiro = 1;
let golpe = 0;
/** Quedan cuadros de luz por adelantar en la escena montada. */
let calentando = false;

function rehacerFondo(): void {
  const palo = escena === 'mesa' ? clima : null;
  const clave = `${escena}|${palo ?? '-'}`;
  let e = armadas.get(clave);
  if (!e) {
    e = armarEscenario(escena, palo, W, H, { azar, entre });
    armadas.set(clave, e);
  }
  escenario = e;
  calentando = true;
  fondoPintado = false;
}

/** Cambia la escena del fondo (y despeja el clima: cada duelo de Rey pone el suyo al montarse). */
export function ponerEscena(e: Escena): void {
  if (e === escena && clima === null && escenario) return;
  escena = e;
  clima = null;
  golpe = 0;
  if (W) rehacerFondo();
}

/** El clima del duelo de Rey: relámpagos (Espadas), hojas y esporas (Bastos), lluvia de monedas (Oros) o bruma carmesí (Copas). `null` lo despeja. */
export function ponerClima(palo: Palo | null): void {
  if (palo === clima) return;
  clima = palo;
  if (W && escena === 'mesa') rehacerFondo();
}

/** El candil salta con el golpe: la luz de la mesa se abre un instante y decae en un cuarto de segundo. `fuerza` va de 0 a 1. */
export function fogonazoCandil(fuerza = 1): void {
  if (foto || ajustes.calma) return;
  golpe = Math.max(golpe, Math.max(0, Math.min(1, fuerza)));
}

function pasoFondo(dt: number): void {
  const e = escenario;
  if (!e) return;
  const quieta = foto || ajustes.calma;
  if (!quieta) {
    tEscena += dt;
    golpe = Math.max(0, golpe - dt * 4);
    // el candil respira: salta entre sus cuadros con un paseo lento
    if (azar() < dt * 5) respiro = Math.max(0, Math.min(3, respiro + (azar() < 0.5 ? -1 : 1)));
  }
  const k = quieta ? e.base : Math.max(0, Math.min(e.n - 1, e.elegir(tEscena, respiro, golpe)));
  // un cuadro de luz que falte se pinta en el momento; los demás se van adelantando de a uno, en reposo
  xFondo.drawImage(e.cuadro(k), 0, 0);
  e.animar(xFondo, quieta ? 0 : dt, tEscena, quieta);
  if (calentando && !quieta && !efectos.length) calentando = e.calentar();
}

// ───────────── el bucle ─────────────

function medir(): void {
  const k = Number(getComputedStyle(document.documentElement).getPropertyValue('--k')) || 1;
  S = k + 1;
  W = Math.ceil(innerWidth / S);
  H = Math.ceil(innerHeight / S);
  for (const c of [cFondo, cColor, cLuz]) {
    c.width = W;
    c.height = H;
  }
  for (const x of [xFondo, xColor, xLuz]) x.imageSmoothingEnabled = false;
  armadas.clear();
  rehacerFondo();
  limpios = false;
}

function cuadro(ahora: number): void {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0);
  ultimo = ahora;
  cuadros++;
  if (congelado > 0) congelado -= dt * 1000;
  const corre = congelado <= 0 && !foto;
  if (corre) reloj += dt;
  // el fondo (candil y brasas) se repinta un cuadro de cada dos: sus brasas derivan despacio
  dtFondo += corre ? dt : 0;
  if (cuadros % 2 === 0 || !fondoPintado) {
    pasoFondo(dtFondo);
    dtFondo = 0;
    fondoPintado = true;
  }
  // los lienzos de efectos solo se tocan si hay algo que pintar (o que borrar)
  if (!efectos.length && limpios) {
    requestAnimationFrame(cuadro);
    return;
  }
  xColor.clearRect(0, 0, W, H);
  xLuz.clearRect(0, 0, W, H);
  limpios = efectos.length === 0;
  for (let i = efectos.length - 1; i >= 0; i--) {
    const e = efectos[i];
    if (corre && !e.paso(dt)) {
      efectos.splice(i, 1);
      continue;
    }
    e.pinta(xColor, xLuz);
  }
  requestAnimationFrame(cuadro);
}

/** Arranca el motor sobre los tres lienzos de la página. */
export function iniciarFx(): void {
  cFondo = document.getElementById('fondo') as HTMLCanvasElement;
  cColor = document.getElementById('fx-color') as HTMLCanvasElement;
  cLuz = document.getElementById('fx-luz') as HTMLCanvasElement;
  xFondo = cFondo.getContext('2d', { alpha: false })!;
  xColor = cColor.getContext('2d')!;
  xLuz = cLuz.getContext('2d')!;
  medir();
  let espera = 0;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = window.setTimeout(medir, 80);
  });
  requestAnimationFrame((t) => {
    ultimo = t;
    cuadro(t);
  });
  // para la QA y las pruebas: la escena, el clima y el fogonazo a mano
  (window as unknown as { __fx?: unknown }).__fx = { ponerEscena, ponerClima, fogonazoCandil };
}

/** Suma un efecto (no hace nada en modo foto ni con «Reducir movimiento»). */
export function efecto(e: Efecto): void {
  if (foto || ajustes.calma) return;
  efectos.push(e);
}
/** Congela los efectos unos milisegundos: el golpe pesa (hitstop). */
export function congelar(ms: number): void {
  if (!ajustes.calma) congelado = Math.max(congelado, ms);
}
/** (0.25) La Forja Brava aviva la fogata del fondo (0 a 1; nada en modo foto ni con «Reducir movimiento»). */
export function avivarFuego(f: number): void {
  avivarFogon(foto || ajustes.calma ? 0 : f);
}
/** (0.25) Dónde arde la fogata del Fogón, en píxeles de la pantalla (o nada si la escena no la tiene armada). */
export function fuegoEnPantalla(): { x: number; y: number } | null {
  const f = escena === 'fogon' ? dondeFuego() : null;
  return f ? { x: f.x * S, y: f.y * S } : null;
}
/** Modo foto: la escena queda quieta y determinista (QA visual). */
export function modoFoto(si: boolean): void {
  foto = si;
  if (si) efectos.length = 0;
}
export const enFoto = (): boolean => foto;
/** ¿Corren los efectos? (no en modo foto ni con «Reducir movimiento»). */
export const vivos = (): boolean => !foto && !ajustes.calma;
/** Segundos de efectos corridos y cuadros pintados (para la QA de FPS). */
export const pulso = (): { reloj: number; cuadros: number; efectos: number } => ({ reloj, cuadros, efectos: efectos.length });
/** De píxeles de pantalla a celdas de efecto. */
export const aCelda = (v: number): number => v / S;

/** Sacude un elemento de la página con pasos enteros de píxel (el golpe medido). */
export function sacudir(el: HTMLElement | null, fuerza = 1): void {
  if (!el || ajustes.calma || foto) return;
  const k = Number(getComputedStyle(document.documentElement).getPropertyValue('--k')) || 1;
  const a = Math.max(1, Math.round(fuerza * 2 * k));
  el.animate(
    [
      { transform: 'translate(0,0)' },
      { transform: `translate(${a * 2}px,${-a}px)` },
      { transform: `translate(${-a * 2}px,${a}px)` },
      { transform: `translate(${a}px,${a}px)` },
      { transform: `translate(${-a}px,0)` },
      { transform: 'translate(0,0)' },
    ],
    { duration: 160 + fuerza * 60, easing: 'steps(5)' },
  );
}

// ───────────── resplandores tramados (para el lienzo de luz) ─────────────

const discos = new Map<string, HTMLCanvasElement>();
/** Un disco de luz tramado con Bayer: lleno en el centro y cada vez más ralo hacia el borde. */
export function disco(color: string, r: number): HTMLCanvasElement {
  const radio = Math.max(2, Math.round(r));
  const clave = `${color}|${radio}`;
  let c = discos.get(clave);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = c.height = radio * 2;
  const x = c.getContext('2d')!;
  x.fillStyle = color;
  for (let y = 0; y < radio * 2; y++)
    for (let xx = 0; xx < radio * 2; xx++) {
      const d = Math.hypot(xx + 0.5 - radio, y + 0.5 - radio) / radio;
      if (d >= 1) continue;
      if ((1 - d) ** 1.5 > (BAYER4[y & 3][xx & 3] + 0.5) / 16) x.fillRect(xx, y, 1, 1);
    }
  discos.set(clave, c);
  return c;
}
