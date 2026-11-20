// Los marcos de la interfaz, forjados en pixel-art tramado: nada de bordes de HTML. Cada marco es un sprite de
// 24 × 24 celdas que se usa en 9 trozos (esquinas de 8, cantos y centro repetibles de 8): madera oscura, hierro, oro,
// hueso (los bocadillos) y los de nivel (plata, prisma) y de palo (los dones de cada Rey). La luz, como en todo el
// juego, viene de arriba a la izquierda: canto claro arriba y a la izquierda, sombra abajo y a la derecha.
import type { Palo } from '../../rules/cartas';
import { umbral } from './dither';
import { Lienzo } from './pincel';
import type { Mapa } from './rejilla';

/** Lado del sprite de un marco y grosor de su canto, en celdas. */
export const MARCO = 24;
export const CANTO = 8;

export type Estilo = 'madera' | 'hierro' | 'oro' | 'dorado' | 'hueso' | 'hundido' | 'plata' | 'prisma' | 'tinta' | `palo${Palo}`;

interface Receta {
  /** Rampa del canto, de la sombra a la luz (4 tonos). */
  canto: string;
  /** El filete de dentro: [del lado de la luz, del lado de la sombra]. */
  filete: [string, string];
  /** El centro: [tono base, tono de la trama, densidad 0–1]. */
  centro: [string, string, number];
  /** Remache de las esquinas: [base, brillo] (o null). */
  remache: [string, string] | null;
}

const RECETA: Record<string, Receta> = {
  madera: { canto: 'Nndx', filete: ['o', 'z'], centro: ['9', '0', 0.5], remache: ['y', 'Y'] },
  hierro: { canto: 'ijJu', filete: ['j', 'i'], centro: ['9', 'i', 0.25], remache: ['J', 'u'] },
  oro: { canto: 'zoyY', filete: ['Y', 'o'], centro: ['y', 'O', 0.25], remache: ['Y', 'w'] },
  dorado: { canto: 'zoyY', filete: ['Y', 'o'], centro: ['9', 'z', 0.38], remache: ['Y', 'w'] },
  plata: { canto: 'ijJu', filete: ['u', 'j'], centro: ['9', 'i', 0.38], remache: ['u', 'w'] },
  prisma: { canto: 'fFqQ', filete: ['C', 'r'], centro: ['9', 'f', 0.25], remache: ['Y', 'w'] },
  paloS: { canto: 'BbcC', filete: ['A', 'b'], centro: ['9', 'B', 0.25], remache: ['y', 'Y'] },
  paloC: { canto: 'GglL', filete: ['K', 'g'], centro: ['9', 'G', 0.25], remache: ['y', 'Y'] },
  paloD: { canto: 'zoOy', filete: ['Y', 'o'], centro: ['9', 'z', 0.25], remache: ['Y', 'w'] },
  paloH: { canto: 'vRre', filete: ['e', 'R'], centro: ['9', 'v', 0.25], remache: ['y', 'Y'] },
};

const cache = new Map<string, Mapa>();

/** El sprite de un marco (24 × 24), listo para partirlo en 9. `viva` lo enciende (foco o pulsado). */
export function marcoMapa(estilo: Estilo, viva = false): Mapa {
  const clave = `${estilo}|${viva}`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const l = new Lienzo(MARCO, MARCO);
  if (estilo === 'hueso') hueso(l);
  else if (estilo === 'hundido') hundido(l);
  else if (estilo === 'tinta') tinta(l);
  else forjado(l, RECETA[estilo], viva, estilo === 'prisma');
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}

/** Un marco forjado: canto biselado de 5 celdas, surco oscuro, filete y centro tramado. */
function forjado(l: Lienzo, r: Receta, viva: boolean, irisado: boolean): void {
  const N = MARCO;
  const [s0, s1, s2, s3] = r.canto;
  const iris = 'CqreyK';
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const d = Math.min(x, y, N - 1 - x, N - 1 - y);
      // de qué lado cae la celda: los cantos de arriba y de la izquierda reciben la luz
      const luz = Math.min(x, y) <= Math.min(N - 1 - x, N - 1 - y);
      let k: string;
      let trama = false;
      if (d === 0) k = '0';
      else if (d === 1) k = luz ? s3 : s0;
      else if (d === 2 || d === 3) {
        // el cuerpo del canto, con su veta tramada
        const veta = umbral(x, y, 4) < 0.4;
        k = luz ? (veta ? s2 : s1) : veta ? s0 : s1;
        if (irisado) k = iris[Math.floor((x + y) / 4) % iris.length];
        trama = veta || irisado;
      } else if (d === 4) k = s0;
      else if (d === 5) k = '0';
      else if (d === 6) k = luz ? r.filete[0] : r.filete[1];
      else if (d === 7) k = '0';
      else {
        const [base, tono, dens] = r.centro;
        trama = true;
        k = umbral(x, y, 4) < dens ? tono : base;
      }
      if (viva && d === 6) k = 'Y';
      if (viva && d === 1) k = luz ? 'w' : s2;
      l.set(x, y, k);
      if (trama) l.marcar(x, y);
    }
  // remaches en las cuatro esquinas
  if (r.remache) {
    const [b, br] = r.remache;
    for (const [cx, cy] of [[2, 2], [N - 4, 2], [2, N - 4], [N - 4, N - 4]] as [number, number][]) {
      l.rect(cx, cy, 2, 2, b).set(cx, cy, br).set(cx + 1, cy + 1, viva ? b : s0);
    }
  }
}

/**
 * El bocadillo: papel hueso con canto de tinta, filete de oro y otra línea de tinta por dentro (se recorta sobre
 * cualquier fondo, también los oscuros), esquinas en chaflán y la sombra tramada del papel abajo y a la derecha.
 */
function hueso(l: Lienzo): void {
  const N = MARCO;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const d = Math.min(x, y, N - 1 - x, N - 1 - y);
      const luz = Math.min(x, y) <= Math.min(N - 1 - x, N - 1 - y);
      // esquinas cortadas en chaflán
      const esquina = Math.min(x, N - 1 - x) + Math.min(y, N - 1 - y);
      if (esquina < 3) continue;
      let k = 'm';
      if (d === 0 || esquina === 3) k = '0';
      else if (d === 1 || esquina === 4) k = luz ? 'Y' : 'o';
      else if (d === 2 || esquina === 5) k = '0';
      else if (d === 3 || esquina === 6) k = luz ? 'w' : 'h';
      else if (d <= 5 && !luz && umbral(x, y, 4) < 0.5) k = 'h';
      l.set(x, y, k);
      if (d >= 1 && d <= 5) l.marcar(x, y);
    }
}

/** El hueco: un pozo oscuro hundido en la madera (para cifras, barras y huecos de Amuleto). */
function hundido(l: Lienzo): void {
  const N = MARCO;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const d = Math.min(x, y, N - 1 - x, N - 1 - y);
      const luz = Math.min(x, y) <= Math.min(N - 1 - x, N - 1 - y);
      let k = '0';
      if (d === 0) k = luz ? 'N' : 'd';
      else if (d === 1) k = luz ? '0' : 'n';
      else if (d === 2) k = luz ? '0' : '9';
      else if (d <= 4 && luz && umbral(x, y, 4) < 0.5) k = '0';
      else k = umbral(x, y, 4) < 0.25 ? '9' : '0';
      l.set(x, y, k);
      if (d >= 2) l.marcar(x, y);
    }
}

/** Un marco fino de tinta y oro viejo (chips, etiquetas, la cápsula de la cuenta). */
function tinta(l: Lienzo): void {
  const N = MARCO;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const d = Math.min(x, y, N - 1 - x, N - 1 - y);
      const luz = Math.min(x, y) <= Math.min(N - 1 - x, N - 1 - y);
      const esquina = Math.min(x, N - 1 - x) + Math.min(y, N - 1 - y);
      if (esquina < 2) continue;
      let k: string;
      if (d === 0 || esquina === 2) k = '0';
      else if (d === 1) k = luz ? 'o' : 'z';
      else if (d === 2) k = '0';
      else k = umbral(x, y, 4) < 0.5 ? '9' : '0';
      l.set(x, y, k);
      if (d >= 3) l.marcar(x, y);
    }
}

// ───────────── barras ─────────────

/** El relleno de una barra (8 × 8, repetible): un tono con su brillo arriba y su sombra tramada abajo. */
export function barraMapa(rampa: string): Mapa {
  const clave = `barra|${rampa}`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const [s, b, lz] = rampa;
  const l = new Lienzo(8, 8);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      let k = b;
      if (y === 0) k = lz;
      else if (y === 1) k = umbral(x, y, 4) < 0.5 ? lz : b;
      else if (y >= 6) k = s;
      else if (y === 5) k = umbral(x, y, 4) < 0.5 ? s : b;
      l.set(x, y, k);
      if (k !== b) l.marcar(x, y);
    }
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}

/** Los rellenos de barra del juego: Vida (carmesí), Escudo (cian), la herida reciente (hueso) y el avance (oro). */
export const BARRAS = { vida: 'Rre', escudo: 'bcA', herida: 'hmw', oro: 'oyY', verde: 'glK' } as const;

// ───────────── el paño de la mesa ─────────────

/**
 * El paño: una elipse de fieltro oscuro tramado sobre la que flota el enemigo, con la luz de candil en el centro y el
 * canto hundido en el abismo. Sprite de 160 × 56 celdas.
 */
export function panoMapa(): Mapa {
  const hecho = cache.get('pano');
  if (hecho) return hecho;
  const W = 160;
  const H = 56;
  const l = new Lienzo(W, H);
  const rampa = '09fFFq';
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const e = Math.hypot((x + 0.5 - W / 2) / (W / 2), (y + 0.5 - H / 2) / (H / 2));
      if (e > 1) continue;
      // el canto, hundido en el abismo; el fieltro púrpura se enciende hacia el centro
      const v = Math.min(1, Math.max(0, 1 - e) ** 0.6 * 0.95);
      const p = v * (rampa.length - 1);
      const i = Math.min(rampa.length - 2, Math.floor(p));
      const sube = p - i > umbral(x, y, 4);
      l.set(x, y, rampa[sube ? i + 1 : i]).marcar(x, y);
    }
  const m = l.mapa();
  cache.set('pano', m);
  return m;
}
