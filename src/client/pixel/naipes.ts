// Los naipes de la baraja española como sprites enteros de 100 × 140 celdas: papel hueso curtido con su canto
// tramado, el recuadro fino de tinta con las pintas reales del palo (Oros, línea continua; Copas, un corte; Espadas,
// dos; Bastos, tres) y, en las dos esquinas opuestas, SOLO el número, nítido, en la tinta de su palo. Sin mini-palo
// debajo del número: el dibujo del centro y los cortes del recuadro ya dicen el palo.
//
// Del 2 al 9, las pintas en su disposición tradicional; el 1 de cada palo, ornamentado (ases.ts); la Corte —Sota 10,
// Caballo 11, Rey 12— de cuerpo entero (figuras.ts); el Comodín es el Bufón.
import type { Palo } from '../../rules/cartas';
import { asMapa } from './ases';
import { bufonMapa } from './bufon';
import { CIFRA_H, CIFRA_W, glifo } from './cifras';
import { umbral } from './dither';
import { dorsoMapa } from './dorsos';
import { figuraLienzo, figuraSegunda } from './figuras';
import { REY_PX, reyMapa } from './reyes';
import { LETRA_PALO } from './paleta';
import { Lienzo, girar } from './pincel';
import { pintaNaipe, type Talla } from './pintas';
import { medida } from './rejilla';

/** El sprite del naipe, en celdas (la cara dibujada ocupa las 96 columnas del centro). */
export const NAIPE_W = 100;
export const NAIPE_H = 140;
const OX = 2;
/** Radio de las esquinas redondeadas, en celdas. */
const RADIO = 5;

/** Cortes del recuadro por palo (en el filete de arriba y en el de abajo): Oros 0, Copas 1, Espadas 2, Bastos 3. */
export const CORTES: Record<Palo, number> = { D: 0, H: 1, S: 2, C: 3 };

/** Zonas reservadas al índice, en celdas de la cara: [x0, y0, x1, y1] (inclusivas). */
export const ZONA_INDICE: [number, number, number, number][] = [
  [0, 0, 15, 32],
  [80, 107, 95, 139],
];

/** Tramo del recuadro: [x0, y0, x1, y1] inclusivo, en celdas de la cara (líneas de una celda). */
export type Tramo = [number, number, number, number];
const CORTE = 4;

/**
 * Los tramos del recuadro de un naipe: el filete de arriba (de después del índice hasta la esquina), el de la derecha
 * (hasta antes del índice de abajo) y sus giros de 180°. Los filetes de arriba y de abajo llevan los cortes del palo.
 */
export function recuadroTramos(s: Palo, rango: number): { arriba: Tramo[]; abajo: Tramo[]; lados: Tramo[] } {
  const x0 = rango >= 10 ? 31 : 19;
  const n = CORTES[s];
  const arriba: Tramo[] = [];
  let x = x0;
  for (let i = 1; i <= n; i++) {
    const g = Math.round(x0 + ((95 - x0) * i) / (n + 1) - CORTE / 2);
    arriba.push([x, 1, g - 1, 1]);
    x = g + CORTE;
  }
  arriba.push([x, 1, 95, 1]);
  const gira = ([a, b, c, d]: Tramo): Tramo => [95 - c, 139 - d, 95 - a, 139 - b];
  return { arriba, abajo: arriba.map(gira), lados: [[95, 1, 95, 104], gira([95, 1, 95, 104])] };
}

/** ¿La celda (x, y) del sprite cae fuera de las esquinas redondeadas? */
function fuera(x: number, y: number): boolean {
  const cx = x < RADIO ? RADIO : x >= NAIPE_W - RADIO ? NAIPE_W - RADIO : -1;
  const cy = y < RADIO ? RADIO : y >= NAIPE_H - RADIO ? NAIPE_H - RADIO : -1;
  if (cx < 0 || cy < 0) return false;
  return Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > RADIO;
}

/** El papel: hueso curtido, con el canto tramado de hueso viejo (más denso abajo y a la derecha) y su filo. */
function papel(): Lienzo {
  const l = new Lienzo(NAIPE_W, NAIPE_H);
  for (let y = 0; y < NAIPE_H; y++)
    for (let x = 0; x < NAIPE_W; x++) {
      if (fuera(x, y)) continue;
      // el canto: la sombra de hueso crece hacia abajo y a la derecha (la luz viene de arriba a la izquierda)
      const izq = x;
      const der = NAIPE_W - 1 - x;
      const arr = y;
      const aba = NAIPE_H - 1 - y;
      let p = 0;
      if (izq < 2) p = Math.max(p, izq === 0 ? 0.3 : 0.12);
      if (arr < 1) p = Math.max(p, 0.3);
      if (der < 2) p = Math.max(p, der === 0 ? 0.6 : 0.3);
      if (aba < 2) p = Math.max(p, aba === 0 ? 0.6 : 0.25);
      const tramado = p > umbral(x, y);
      l.set(x, y, tramado ? 'h' : 'm');
      if (tramado) l.marcar(x, y);
    }
  return l;
}

/** El recuadro de tinta con los cortes del palo. */
function recuadro(l: Lienzo, s: Palo, rango: number): void {
  const { arriba, abajo, lados } = recuadroTramos(s, rango);
  for (const [a, b, c, d] of [...arriba, ...abajo, ...lados]) l.rect(OX + a, b, c - a + 1, d - b + 1, 'k');
}

/** El número en las dos esquinas opuestas, en la tinta del palo (abajo a la derecha, girado 180°). */
function indice(l: Lienzo, s: Palo, rango: number): void {
  const k = LETRA_PALO[s];
  const texto = String(rango);
  [...texto].forEach((c, i) => {
    const g = glifo(c, k);
    const x = OX + 4 + i * (CIFRA_W + 1);
    l.pegar(g, x, 5);
    const gi = girar(girar(g));
    l.pegar(gi, NAIPE_W - x - CIFRA_W, NAIPE_H - 5 - CIFRA_H);
  });
  // (0.28) el 6 y el 9 llevan su raya al pie, como en cualquier naipe: el 9 girado ya no se lee «6» (ni el Comodín
  // que copia un 9). La del índice de abajo, girada con él, queda del lado de adentro
  if (rango === 6 || rango === 9) {
    const x = OX + 4;
    l.rect(x, 5 + CIFRA_H + 1, CIFRA_W, 1, k);
    l.rect(NAIPE_W - x - CIFRA_W, NAIPE_H - 5 - CIFRA_H - 2, CIFRA_W, 1, k);
  }
}

// ───────────── disposiciones de las pintas ─────────────

type Lugar = [number, number, ('h' | 'v')?];
const fila = (y: number, xs: number[]): Lugar[] => xs.map((x) => [x, y]);

/** Espadas y Bastos (pintas altas y estrechas): 2 o 3 columnas, con la del medio acostada en el 5 y el 7. */
const ALTAS: Record<number, Lugar[]> = {
  4: [...fila(38, [32, 63]), ...fila(102, [32, 63])],
  5: [...fila(30, [32, 63]), [48, 70, 'h'], ...fila(110, [32, 63])],
  6: [...fila(38, [24, 48, 72]), ...fila(102, [24, 48, 72])],
  7: [...fila(30, [24, 48, 72]), [48, 70, 'h'], ...fila(110, [24, 48, 72])],
  8: [...fila(25, [24, 48, 72]), ...fila(70, [36, 60]), ...fila(115, [24, 48, 72])],
  9: [...fila(25, [24, 48, 72]), ...fila(70, [24, 48, 72]), ...fila(115, [24, 48, 72])],
};
/** Oros y Copas (pintas redondas): dos columnas y la del medio al centro. */
const REDONDAS: Record<number, Lugar[]> = {
  4: [...fila(38, [30, 66]), ...fila(102, [30, 66])],
  5: [...fila(30, [30, 66]), [48, 70], ...fila(110, [30, 66])],
  6: [...fila(26, [30, 66]), ...fila(70, [30, 66]), ...fila(114, [30, 66])],
  7: [...fila(22, [30, 66]), [48, 52], ...fila(82, [30, 66]), ...fila(114, [30, 66])],
  8: [...fila(19, [30, 66]), ...fila(53, [30, 66]), ...fila(87, [30, 66]), ...fila(121, [30, 66])],
  9: [...fila(16, [30, 66]), ...fila(43, [30, 66]), [48, 70], ...fila(97, [30, 66]), ...fila(124, [30, 66])],
};
/** El 2 y el 3, con la pinta grande. */
const GRANDES: Record<Palo, Record<number, Lugar[]>> = {
  S: { 2: [[34, 70], [62, 70, 'v']], 3: [[25, 70], [48, 70, 'v'], [71, 70]] },
  C: { 2: [[35, 72], [61, 72]], 3: [[27, 72], [49, 72], [71, 72]] },
  D: { 2: [[48, 38], [48, 102]], 3: [[36, 28], [60, 70], [36, 112]] },
  H: { 2: [[48, 36], [48, 104]], 3: [[36, 27], [60, 70], [36, 113]] },
};

/** La lista de lugares de un naipe del 2 al 9 y la talla de su pinta. */
export function disposicion(s: Palo, rango: number): { talla: Talla; at: Lugar[] } {
  if (rango <= 3) return { talla: 'grande', at: GRANDES[s][rango] ?? [] };
  return { talla: 'chica', at: (s === 'S' || s === 'C' ? ALTAS : REDONDAS)[rango] ?? [] };
}

/** Las pintas de un naipe del 2 al 9, como mapas colocados en la cara (para el naipe y para las pruebas de solape). */
export function pintasColocadas(s: Palo, rango: number): { m: string[]; x: number; y: number }[] {
  const { talla, at } = disposicion(s, rango);
  return at.map(([cx, cy, giro], i) => {
    let m = pintaNaipe(s, talla, i);
    if (giro === 'h') m = girar(m);
    if (giro === 'v') m = girar(girar(m));
    const [w, h] = medida(m);
    return { m, x: Math.round(cx - w / 2), y: Math.round(cy - h / 2) };
  });
}

const cache = new Map<string, string[]>();

/** El naipe entero de un palo: del 1 al 9 (jugables) y 10, 11, 12 (la Corte). */
export function naipeMapa(s: Palo, rango: number): string[] {
  const clave = `${s}${rango}`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const l = papel();
  recuadro(l, s, rango);
  if (rango === 12) {
    l.rect(OX + 14, 34, 68, 68, 'y');
    l.rect(OX + 15, 35, 66, 66, 'k');
    l.pegar(reyMapa(REY_PX[s], 'calma'), OX + 16, 36);
    const p = pintaNaipe(s, 'chica', 0);
    const [pw, ph] = medida(p);
    l.pegar(p, Math.round(NAIPE_W / 2 - pw / 2), Math.round(117 - ph / 2));
  } else if (rango >= 10) l.pegar(figuraLienzo(s, rango as 10 | 11 | 12), OX, 0);
  else if (rango === 1) l.pegar(asMapa(s), OX, 0);
  else for (const p of pintasColocadas(s, rango)) l.pegar(p.m, OX + p.x, p.y);
  indice(l, s, rango);
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}

/**
 * El naipe del Rey en su segunda cara: el mismo papel, recuadro y número, con otro dibujo (herido, enojado, la capa
 * violeta, la corona torcida, la grieta en el manto y el rasgo de su segunda cara). Lo revela el volteo en la mesa.
 */
export function naipeSegundaMapa(s: Palo): string[] {
  const clave = `${s}seg`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const l = papel();
  recuadro(l, s, 12);
  l.rect(OX + 14, 34, 68, 68, 'r');
  l.rect(OX + 15, 35, 66, 66, 'k');
  l.pegar(reyMapa(REY_PX[s], 'habla'), OX + 16, 36);
  const p = pintaNaipe(s, 'chica', 0);
  const [pw, ph] = medida(p);
  l.pegar(p, Math.round(NAIPE_W / 2 - pw / 2), Math.round(117 - ph / 2));
  indice(l, s, 12);
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}

/** Una estrella de cinco puntas chica (la marca del Comodín en sus esquinas). */
const ESTRELLA = ['....k....', '....k....', '...kkk...', 'kkkkkkkkk', '.kkkkkkk.', '..kkkkk..', '..kkkkk..', '.kkk.kkk.', '.k.....k.'];

/** El Comodín: el Bufón entero sobre el papel, sin palo ni recuadro, con su estrella en las esquinas. */
export function comodinMapa(): string[] {
  const hecho = cache.get('X');
  if (hecho) return hecho;
  const l = papel();
  const b = bufonMapa('risa');
  const [w, h] = medida(b);
  l.pegar(b, Math.round(NAIPE_W / 2 - w / 2), Math.round(72 - h / 2));
  l.pegar(ESTRELLA, OX + 5, 6);
  l.pegar(girar(girar(ESTRELLA)), NAIPE_W - OX - 5 - 9, NAIPE_H - 6 - 9);
  const m = l.mapa();
  cache.set('X', m);
  return m;
}

/** El dorso de un Mazo, con las esquinas redondeadas del naipe. */
export function dorsoNaipe(mazo: string): string[] {
  const clave = `dorso:${mazo}`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const l = Lienzo.de(dorsoMapa(mazo));
  for (let y = 0; y < NAIPE_H; y++) for (let x = 0; x < NAIPE_W; x++) if (fuera(x, y)) l.set(x, y, '.');
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}
