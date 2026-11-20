// CÁBALA · La baraja española y sus jugadas. Motor puro: sin DOM, sin azar propio, sin dependencias.
//
// Códigos internos de palo (la correspondencia clásica con la baraja francesa; nadie los ve en pantalla):
//   S = eSpadas · C = bastos (Cachiporras) · D = oros (Doblones) · H = copas
// El mazo del jugador lleva las numeradas del 1 al 9 de los cuatro palos más los Comodines; la Corte (10 Sota,
// 11 Caballo, 12 Rey) son los enemigos y nunca entran en la mano.
import type { MazoId } from './mazos';

export type Palo = 'S' | 'C' | 'D' | 'H';
/** X = Comodín (sin palo ni número propios). */
export type PaloCarta = Palo | 'X';
export const PALOS: readonly Palo[] = ['S', 'C', 'D', 'H'];

export interface Carta {
  /** Identidad estable dentro de la partida (no cambia aunque la carta se transforme). */
  id: string;
  palo: PaloCarta;
  /** 0 = Comodín · 1 a 9 = numeradas. */
  n: number;
  /** Carta Marcada: vuelve a la mano al jugarla. */
  marcada?: true;
  /** Templada en el Fogón: Daño de más, para siempre, cada vez que se juega. */
  temple?: number;
}

export const MAX_NUM = 9;
export const SOTA = 10;
export const CABALLO = 11;
export const REY = 12;
export type Rango = 10 | 11 | 12;
/** Tope de cartas por golpe. */
export const MAX_GOLPE = 5;

export const esComodin = (c: Carta): boolean => c.palo === 'X';

/** Las 36 numeradas (o del 1 al `hasta`) más `comodines` Comodines. Los id son estables: «S7», «X1». */
export function barajaBase(hasta = MAX_NUM, comodines = 2): Carta[] {
  const out: Carta[] = [];
  for (const palo of PALOS) for (let n = 1; n <= hasta; n++) out.push({ id: `${palo}${n}`, palo, n });
  for (let i = 1; i <= comodines; i++) out.push({ id: `X${i}`, palo: 'X', n: 0 });
  return out;
}

/** Orden de lectura de la mano: por palo y número, Comodines al final. */
export function ordenar(cartas: readonly Carta[]): Carta[] {
  const o = 'SCDHX';
  return [...cartas].sort((a, b) => o.indexOf(a.palo) - o.indexOf(b.palo) || a.n - b.n || a.id.localeCompare(b.id));
}

// ───────────────────────── Jugadas ─────────────────────────

export type Jugada = 'sola' | 'par' | 'doblepar' | 'pierna' | 'flor' | 'escalera' | 'full' | 'escalerapalo' | 'poker' | 'quince' | 'envido';
/** Las nueve jugadas de siempre, de menor a mayor. */
export const JUGADAS: readonly Jugada[] = ['sola', 'par', 'doblepar', 'flor', 'pierna', 'escalera', 'full', 'escalerapalo', 'poker'];
/** Jugadas que solo valen con su Mazo: el Quince de la Escoba y el Envido del Truco. */
export const JUGADAS_MAZO: Partial<Record<MazoId, Jugada>> = { escoba: 'quince', truco: 'envido' };

/** Una carta ya resuelta para la cuenta: el Comodín (o el Engaño) ya tomó palo y número. */
export interface Efectiva {
  palo: Palo;
  n: number;
  /** La carta de la mano de la que sale. */
  de: Carta;
  /** Es copia (Comodín o Engaño): no cuenta como Brava. */
  copia: boolean;
}

/**
 * Resuelve los Comodines: cada uno copia la carta de mayor número del golpe (palo y número). A igualdad de número
 * prefiere un palo que no sea `evitar` (el del enemigo, que es Inmune). Sin cartas de número no hay jugada.
 * Con `engano` (El Mentiroso) todas las cartas fingen ser esa misma carta.
 */
export function resolver(sel: readonly Carta[], evitar?: Palo, engano = false): Efectiva[] | null {
  const naturales = sel.filter((c) => !esComodin(c));
  if (!naturales.length) return null;
  let mejor = naturales[0];
  for (const c of naturales) {
    if (c.n > mejor.n || (c.n === mejor.n && mejor.palo === evitar && c.palo !== evitar)) mejor = c;
  }
  return sel.map((c) =>
    esComodin(c) || (engano && c !== mejor) ? { palo: mejor.palo as Palo, n: mejor.n, de: c, copia: true } : { palo: c.palo as Palo, n: c.n, de: c, copia: false },
  );
}

const seguidas = (ns: number[]): boolean => ns.every((n, i) => i === 0 || n === ns[i - 1] + 1);

/**
 * Qué jugada forman las cartas (ya resueltas), o null si no forman ninguna. De 1 a 5 cartas.
 *   sola 1 · par 2 iguales · doble par 2+2 · flor 3–5 del mismo palo · pierna 3 iguales · escalera 3–5 seguidas ·
 *   full 3+2 · escalera de palo 3–5 seguidas del mismo palo · póker 4 (o 5) iguales
 * Con el Mazo: en la Escoba, lo que suma 15 y no es otra cosa vale como Quince; en el Truco, dos del mismo palo valen
 * como Envido.
 */
export function clasificar(ef: readonly Efectiva[], mazo?: MazoId): Jugada | null {
  const n = ef.length;
  if (n < 1 || n > MAX_GOLPE) return null;
  if (n === 1) return 'sola';
  const ns = ef.map((c) => c.n).sort((a, b) => a - b);
  const mismoPalo = ef.every((c) => c.palo === ef[0].palo);
  const iguales = ns.every((x) => x === ns[0]);
  let j: Jugada | null = null;
  if (iguales) j = n === 2 ? 'par' : n === 3 ? 'pierna' : 'poker';
  else {
    const cuenta = [...new Set(ns)].map((r) => ns.filter((x) => x === r).length).sort((a, b) => a - b).join();
    if (n >= 3 && seguidas(ns)) j = mismoPalo ? 'escalerapalo' : 'escalera';
    else if (n === 5 && cuenta === '2,3') j = 'full';
    else if (n === 5 && cuenta === '1,4') j = null;
    else if (n >= 3 && mismoPalo) j = 'flor';
    else if (n === 4 && cuenta === '2,2') j = 'doblepar';
  }
  if (j) return j;
  if (mazo === 'truco' && n === 2 && mismoPalo) return 'envido';
  if (mazo === 'escoba' && suma(ef) === 15) return 'quince';
  return null;
}

/** La suma de los números de un golpe (la Escoba canta con 15). */
export const suma = (ef: readonly Efectiva[]): number => ef.reduce((s, c) => s + c.n, 0);

/** Todas las combinaciones de 1 a `max` cartas de una mano (para el bot y para «la mejor jugada»). */
export function combinaciones<T>(mano: readonly T[], max = MAX_GOLPE): T[][] {
  const out: T[][] = [];
  const n = mano.length;
  const rec = (i: number, acc: T[]) => {
    if (acc.length) out.push([...acc]);
    if (acc.length === max) return;
    for (let k = i; k < n; k++) {
      acc.push(mano[k]);
      rec(k + 1, acc);
      acc.pop();
    }
  };
  rec(0, []);
  return out;
}
