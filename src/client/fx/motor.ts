// El motor de efectos: pixel-art procedural en Canvas, sin dependencias, a 60 FPS.
//
// Tres lienzos de baja resolución que se estiran sin suavizado: el FONDO (la penumbra tramada de la escena, con el
// candil que respira y sus brasas), el de COLOR (píxeles opacos de los efectos: tajos, monedas, números, la carta
// que se parte) y el de LUZ (resplandores aditivos, tramados con Bayer, que se suman a la pantalla). Es el método
// de doble buffer de pixelfx (https://github.com/patch-gg/pixelfx, MIT): color por un lado, luz por otro, pasos de
// rampa duros en el color y la suavidad solo en la luz. El código es nuestro.
import { ajustes } from '../almacen';
import { BAYER4 } from '../pixel/dither';

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

// ───────────── la penumbra del fondo ─────────────

export type Escena = 'mesa' | 'mapa' | 'pulperia' | 'portada' | 'altar';

/** Tonos de cada penumbra, del abismo de los bordes a la luz de candil, y dónde cuelga el candil. */
const ESCENA: Record<Escena, { tonos: string[]; foco: [number, number]; radio: [number, number] }> = {
  mesa: { tonos: ['#09070f', '#120a24', '#1c0f2c', '#2a1533', '#3a1a34'], foco: [0.5, 0.42], radio: [0.62, 0.72] },
  mapa: { tonos: ['#07070f', '#0c0f26', '#141a3a', '#1e2450', '#2a2c5c'], foco: [0.5, 0.3], radio: [0.7, 0.9] },
  pulperia: { tonos: ['#0b0711', '#1a0b16', '#2a1018', '#40191a', '#5a2a1c'], foco: [0.5, 0.4], radio: [0.62, 0.74] },
  portada: { tonos: ['#09070f', '#160c1c', '#24112b', '#3a1436', '#55193c'], foco: [0.5, 0.38], radio: [0.66, 0.8] },
  altar: { tonos: ['#09070f', '#150a10', '#241018', '#3a1420', '#571c24'], foco: [0.5, 0.5], radio: [0.6, 0.7] },
};
let escena: Escena = 'portada';
/** Cuatro cuadros de la misma penumbra con el candil un poco más o menos abierto: al alternarlos, respira. */
let cuadrosFondo: HTMLCanvasElement[] = [];

function hex(h: string): number {
  const n = parseInt(h.slice(1), 16);
  // ABGR para escribir de a 32 bits en el ImageData (little-endian)
  return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255);
}

function pintarFondo(esc: Escena, apertura: number): HTMLCanvasElement {
  const { tonos, foco, radio } = ESCENA[esc];
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const img = x.createImageData(W, H);
  const buf = new Uint32Array(img.data.buffer);
  const col = tonos.map(hex);
  const n = tonos.length - 1;
  for (let y = 0; y < H; y++)
    for (let xx = 0; xx < W; xx++) {
      const d = Math.hypot(((xx + 0.5) / W - foco[0]) / (radio[0] * apertura), ((y + 0.5) / H - foco[1]) / (radio[1] * apertura));
      const v = Math.max(0, 1 - d) ** 1.4 * n;
      const i = Math.min(n - 1, Math.floor(v));
      const sube = v - i > (BAYER4[y & 3][xx & 3] + 0.5) / 16;
      buf[y * W + xx] = col[sube ? i + 1 : i];
    }
  x.putImageData(img, 0, 0);
  return c;
}

function rehacerFondo(): void {
  cuadrosFondo = [0.94, 0.98, 1.02, 1.06].map((a) => pintarFondo(escena, a));
}

/** Cambia la penumbra de la escena. */
export function ponerEscena(e: Escena): void {
  if (e === escena && cuadrosFondo.length) return;
  escena = e;
  if (W) rehacerFondo();
  fondoPintado = false;
}

interface Brasa {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  max: number;
  oro: boolean;
}
const brasas: Brasa[] = [];
let respiro = 1;

function nuevaBrasa(arranque = false): Brasa {
  const max = entre(4, 9);
  return { x: entre(0, W), y: arranque ? entre(0, H) : H + 2, vx: entre(-2, 2), vy: entre(-9, -3), vida: arranque ? entre(0, max) : 0, max, oro: azar() < 0.6 };
}

function pasoFondo(dt: number): void {
  // el candil respira: salta entre sus cuadros con un paseo lento
  if (azar() < dt * 5) respiro = Math.max(0, Math.min(3, respiro + (azar() < 0.5 ? -1 : 1)));
  xFondo.drawImage(cuadrosFondo[foto ? 1 : respiro], 0, 0);
  if (foto || ajustes.calma) return;
  const meta = Math.round((W * H) / 9000);
  while (brasas.length < meta) brasas.push(nuevaBrasa(true));
  for (let i = brasas.length - 1; i >= 0; i--) {
    const b = brasas[i];
    b.vida += dt;
    b.x += (b.vx + Math.sin(b.vida * 2 + i) * 2) * dt;
    b.y += b.vy * dt;
    if (b.vida > b.max || b.y < -2) {
      brasas[i] = nuevaBrasa();
      continue;
    }
    const f = b.vida / b.max;
    // brasas de oro y polvo: se encienden, titilan y se apagan
    const titila = (Math.floor(b.vida * 6 + i) & 3) !== 0;
    if (!titila) continue;
    xFondo.fillStyle = b.oro ? (f < 0.3 ? '#ffd500' : f < 0.7 ? '#ff7b00' : '#7a0026') : f < 0.5 ? '#5a1e96' : '#2e0f52';
    xFondo.fillRect(Math.round(b.x), Math.round(b.y), 1, 1);
  }
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
  brasas.length = 0;
  rehacerFondo();
  fondoPintado = false;
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
/** Modo foto: la escena queda quieta y determinista (QA visual). */
export function modoFoto(si: boolean): void {
  foto = si;
  if (si) efectos.length = 0;
}
export const enFoto = (): boolean => foto;
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
