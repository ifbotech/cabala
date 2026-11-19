// El Mapa de caminos: tres tramos, cada uno con cinco pisos de tres nodos y, arriba, su Rey. De cada nodo salen uno o
// dos caminos al piso siguiente (a su misma columna o a la de al lado), sin cruzarse. Sale de la semilla.
import { PALOS } from './cartas';
import type { Palo } from './cartas';
import type { Nodo, TipoNodo, Tramo } from './estado';
import { azar, barajar, elegir, muestra } from './rng';
import type { ConAzar } from './rng';

export const PISOS = 5;
export const COLUMNAS = 3;
export const TRAMOS = 3;

/** Qué hay en cada piso: dos tipos fijos y un tercero que se sortea entre dos. Siempre tres cosas distintas que elegir. */
const PISO: readonly (readonly [TipoNodo, TipoNodo, readonly [TipoNodo, TipoNodo]])[] = [
  ['guardia', 'guardia', ['guardia', 'guardia']],
  ['guardia', 'cabala', ['guardia', 'fogon']],
  ['elite', 'guardia', ['cabala', 'pulperia']],
  ['guardia', 'fogon', ['pulperia', 'cabala']],
  ['pulperia', 'fogon', ['elite', 'guardia']],
];

/** Los palos de los enemigos de un nodo de combate (cada enemigo es Inmune al suyo). */
function palosDe(e: ConAzar, tipo: TipoNodo, acto: number): Palo[] | undefined {
  if (tipo === 'guardia') return muestra(e, PALOS, 2);
  if (tipo === 'elite') return muestra(e, PALOS, acto === 0 ? 1 : 2);
  return undefined;
}

/** Un tramo del Mapa. */
export function generarTramo(e: ConAzar, acto: number, rey: Palo): Tramo {
  const nodos: Nodo[] = [];
  const id = (piso: number, col: number) => `${acto}-${piso}-${col}`;
  for (let piso = 0; piso < PISOS; piso++) {
    const [a, b, alt] = PISO[piso];
    const tipos = barajar(e, [a, b, elegir(e, alt)]);
    for (let col = 0; col < COLUMNAS; col++) nodos.push({ id: id(piso, col), piso, col, tipo: tipos[col], sig: [], palos: palosDe(e, tipos[col], acto) });
  }
  const reyId = `${acto}-rey`;
  nodos.push({ id: reyId, piso: PISOS, col: 1, tipo: 'rey', sig: [], palos: [rey] });
  // caminos: recto casi siempre, y una diagonal a veces; nunca dos diagonales que se crucen
  for (let piso = 0; piso < PISOS - 1; piso++) {
    const sale: number[][] = [[], [], []];
    for (let col = 0; col < COLUMNAS; col++) if (azar(e) < 0.8) sale[col].push(col);
    for (let col = 0; col < COLUMNAS - 1; col++) {
      const r = azar(e);
      if (r < 0.35) sale[col].push(col + 1);
      else if (r < 0.7) sale[col + 1].push(col);
    }
    // nadie se queda sin salida ni sin entrada
    for (let col = 0; col < COLUMNAS; col++) if (!sale[col].length) sale[col].push(col);
    for (let col = 0; col < COLUMNAS; col++) if (!sale.some((s) => s.includes(col))) sale[col].push(col);
    for (let col = 0; col < COLUMNAS; col++) {
      const n = nodos.find((x) => x.id === id(piso, col))!;
      n.sig = [...new Set(sale[col])].sort().map((c2) => id(piso + 1, c2));
    }
  }
  for (let col = 0; col < COLUMNAS; col++) nodos.find((x) => x.id === id(PISOS - 1, col))!.sig = [reyId];
  return { nodos, rey };
}

/** Los tres Reyes de la partida (de los cuatro), uno por tramo. */
export const sortearReyes = (e: ConAzar): Palo[] => muestra(e, PALOS, TRAMOS);

/** Los nodos a los que se puede ir ahora: el piso 0 al entrar al tramo; después, los que siguen al actual. */
export function alcanzables(tramo: Tramo, pos: string | null): Nodo[] {
  if (pos === null) return tramo.nodos.filter((n) => n.piso === 0);
  const actual = tramo.nodos.find((n) => n.id === pos);
  return actual ? tramo.nodos.filter((n) => actual.sig.includes(n.id)) : [];
}
