// Los números del juego viven en balance-config.json (los afina el laboratorio: npm run analyze:meta).
// Aquí solo se cargan con tipo y se dan las ayudas para escribirlos en los textos.
import datos from './balance-config.json';

export const B = datos;
export type Balance = typeof datos;

/** Un texto en los dos idiomas del juego. */
export interface L {
  es: string;
  en: string;
}
export type Idioma = 'es' | 'en';
export const L = (es: string, en: string): L => ({ es, en });

/** «12 %» a partir de 0,12. */
export const pct = (v: number): string => `${Math.round(v * 100)}`;

/** Sustituye `{campo}` por su valor. */
export function fill(texto: string, valores: Record<string, string | number> = {}): string {
  return texto.replace(/\{(\w+)\}/g, (_, k: string) => (k in valores ? String(valores[k]) : `{${k}}`));
}
/** Lo mismo sobre un texto en los dos idiomas. */
export const fillL = (l: L, valores: Record<string, string | number> = {}): L => ({ es: fill(l.es, valores), en: fill(l.en, valores) });
