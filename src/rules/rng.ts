// Azar determinista: el estado es un entero que vive dentro de la partida (`rng`). La misma semilla y las mismas
// decisiones dan exactamente la misma partida. Nada en src/rules usa Math.random.

export interface ConAzar {
  rng: number;
}

/** Semilla numérica a partir de un texto (FNV-1a). */
export function semillaDe(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0 || 1;
}

/** Un número en [0, 1) y avanza el estado (mulberry32). */
export function azar(e: ConAzar): number {
  e.rng = (e.rng + 0x6d2b79f5) >>> 0;
  let t = e.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Entero en [0, n). */
export const entero = (e: ConAzar, n: number): number => Math.floor(azar(e) * n);
/** Un dado de 1 a 6. */
export const dado = (e: ConAzar): number => 1 + entero(e, 6);
/** Un elemento al azar. */
export const elegir = <T>(e: ConAzar, lista: readonly T[]): T => lista[entero(e, lista.length)];

/** Baraja en el sitio (Fisher-Yates) y devuelve la misma lista. */
export function barajar<T>(e: ConAzar, lista: T[]): T[] {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = entero(e, i + 1);
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

/** Saca `n` elementos distintos al azar (sin tocar la lista). */
export function muestra<T>(e: ConAzar, lista: readonly T[], n: number): T[] {
  return barajar(e, [...lista]).slice(0, n);
}

/** Elige por pesos: `[valor, peso][]`. */
export function ponderado<T>(e: ConAzar, opciones: readonly (readonly [T, number])[]): T {
  const total = opciones.reduce((s, [, p]) => s + Math.max(0, p), 0);
  let r = azar(e) * total;
  for (const [v, p] of opciones) {
    r -= Math.max(0, p);
    if (r < 0) return v;
  }
  return opciones[opciones.length - 1][0];
}

/** Una semilla legible para enseñar y compartir (6 letras y cifras). */
export function semillaNueva(base: number): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const e = { rng: base >>> 0 || 1 };
  let s = '';
  for (let i = 0; i < 6; i++) s += abc[entero(e, abc.length)];
  return s;
}
