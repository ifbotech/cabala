// Del mapa de caracteres a píxeles de verdad. Funciones puras (sin DOM): el cliente las usa para llenar sus lienzos
// y la forja para escribir láminas PNG. Cada celda del mapa es un píxel; el color sale de la tabla de tintas.
import { medida, type Mapa, type Tintas } from './rejilla';

export interface Pixeles {
  w: number;
  h: number;
  /** RGBA, 4 bytes por píxel. */
  data: Uint8ClampedArray;
}

const cacheColor = new Map<string, [number, number, number]>();
/** «#rrggbb» o «#rgb» → [r, g, b]. */
export function rgb(hex: string): [number, number, number] {
  let c = cacheColor.get(hex);
  if (c) return c;
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  const n = parseInt(h, 16);
  c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  cacheColor.set(hex, c);
  return c;
}

/** Los píxeles de un mapa (el papel '.' queda transparente). */
export function pixeles(m: Mapa, t: Tintas): Pixeles {
  const [w, h] = medida(m);
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const fila = m[y];
    for (let x = 0; x < fila.length; x++) {
      const k = fila[x];
      if (k === '.' || k === ' ') continue;
      const color = t[k];
      if (!color) continue;
      const [r, g, b] = rgb(color);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return { w, h, data };
}

/** Pega unos píxeles sobre otros con su esquina en (x, y), escalados `k` veces (entero). */
export function pegarPixeles(base: Pixeles, capa: Pixeles, x: number, y: number, k = 1): void {
  for (let cy = 0; cy < capa.h; cy++)
    for (let cx = 0; cx < capa.w; cx++) {
      const i = (cy * capa.w + cx) * 4;
      if (capa.data[i + 3] === 0) continue;
      for (let dy = 0; dy < k; dy++)
        for (let dx = 0; dx < k; dx++) {
          const bx = x + cx * k + dx;
          const by = y + cy * k + dy;
          if (bx < 0 || by < 0 || bx >= base.w || by >= base.h) continue;
          const j = (by * base.w + bx) * 4;
          base.data[j] = capa.data[i];
          base.data[j + 1] = capa.data[i + 1];
          base.data[j + 2] = capa.data[i + 2];
          base.data[j + 3] = 255;
        }
    }
}

/** Un lienzo de píxeles de un color liso. */
export function lisos(w: number, h: number, hex: string): Pixeles {
  const [r, g, b] = rgb(hex);
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { w, h, data };
}
