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
  /** Daño permanente sumado en la Pulpería. */
  bonus?: number;
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

const ORDEN_JUGADA: Record<Jugada, number> = {
  sola: 0,
  envido: 1,
  par: 2,
  quince: 3,
  doblepar: 4,
  flor: 5,
  pierna: 6,
  escalera: 7,
  full: 8,
  escalerapalo: 9,
  poker: 10,
};

/**
 * Resuelve los Comodines: completa la mejor jugada posible (póker, escalera, 15 en Escoba, etc.) y, a empate,
 * copia la carta de mayor número evitando el palo Inmune. Con `engano` (El Mentiroso) todas fingen ser la más alta.
 */
export function resolver(sel: readonly Carta[], evitar?: Palo, engano = false, mazo?: MazoId): Efectiva[] | null {
  let hasCom = false;
  let natLen = 0;
  let mejor: Carta | null = null;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c.palo === 'X') {
      hasCom = true;
    } else {
      natLen++;
      if (!mejor || c.n > mejor.n || (c.n === mejor.n && mejor.palo === evitar && c.palo !== evitar)) mejor = c;
    }
  }
  if (!mejor) return null;
  const base: Efectiva[] = new Array(sel.length);
  const comIdx: number[] = [];
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    const esCom = c.palo === 'X';
    if (esCom) comIdx.push(i);
    base[i] = esCom || (engano && c !== mejor)
      ? { palo: mejor.palo as Palo, n: mejor.n, de: c, copia: true }
      : { palo: c.palo as Palo, n: c.n, de: c, copia: false };
  }
  if (engano || !hasCom) return base;

  const naturales = sel.filter((c) => c.palo !== 'X');
  const paloNoEvitar = (PALOS.find((p) => p !== evitar) ?? 'S') as Palo;
  const mismoPaloNat = naturales.every((c) => c.palo === naturales[0].palo);
  const paloEscalera = mismoPaloNat ? (naturales[0].palo as Palo) : paloNoEvitar;
  const candidatas: { palo: Palo; n: number }[][] = [];
  let sumaNat = 0;
  let minNat = 99;
  let maxNat = 0;
  let dupNat = false;
  const vistosN = new Set<number>();
  const vistosPN = new Set<string>();
  for (const nat of naturales) {
    sumaNat += nat.n;
    if (nat.n < minNat) minNat = nat.n;
    if (nat.n > maxNat) maxNat = nat.n;
    if (vistosN.has(nat.n)) dupNat = true;
    vistosN.add(nat.n);
    const key = `${nat.palo}${nat.n}`;
    if (!vistosPN.has(key)) {
      vistosPN.add(key);
      if (!(nat.palo === mejor.palo && nat.n === mejor.n)) {
        candidatas.push(comIdx.map(() => ({ palo: nat.palo as Palo, n: nat.n })));
      }
    }
  }

  if (comIdx.length === 1) {
    if (mazo === 'escoba') {
      const falta = 15 - sumaNat;
      if (falta >= 1 && falta <= 9) candidatas.push([{ palo: paloNoEvitar, n: falta }]);
    }
    if (sel.length >= 3 && !dupNat && maxNat - minNat < sel.length) {
      for (let ini = Math.max(1, maxNat - sel.length + 1); ini <= Math.min(10 - sel.length, minNat); ini++) {
        for (let k = 0; k < sel.length; k++) {
          const v = ini + k;
          if (!vistosN.has(v)) {
            candidatas.push([{ palo: paloEscalera, n: v }]);
            break;
          }
        }
      }
    }
  } else if (comIdx.length === 2 && sel.length >= 3 && !dupNat && maxNat - minNat < sel.length) {
    for (let ini = Math.max(1, maxNat - sel.length + 1); ini <= Math.min(10 - sel.length, minNat); ini++) {
      const huecos: number[] = [];
      for (let k = 0; k < sel.length; k++) {
        const v = ini + k;
        if (!vistosN.has(v)) huecos.push(v);
      }
      if (huecos.length === 2) {
        candidatas.push([
          { palo: paloEscalera, n: huecos[0] },
          { palo: paloEscalera, n: huecos[1] },
        ]);
      }
    }
  }

  if (!candidatas.length) return base;

  const puntaje = (ef: Efectiva[]) => {
    const j = clasificar(ef, mazo);
    const rank = j ? ORDEN_JUGADA[j] : -1;
    let sum = 0;
    let noEv = 0;
    for (let i = 0; i < ef.length; i++) {
      sum += ef[i].n;
      if (ef[i].palo !== evitar) noEv++;
    }
    return [rank, sum, noEv] as const;
  };
  let mejorEf = base;
  let mejorPts = puntaje(base);
  for (const cand of candidatas) {
    const ef = base.slice();
    for (let ci = 0; ci < comIdx.length; ci++) {
      const idx = comIdx[ci];
      ef[idx] = { palo: cand[ci].palo, n: cand[ci].n, de: sel[idx], copia: true };
    }
    const pts = puntaje(ef);
    if (pts[0] > mejorPts[0] || (pts[0] === mejorPts[0] && (pts[1] > mejorPts[1] || (pts[1] === mejorPts[1] && pts[2] > mejorPts[2])))) {
      mejorEf = ef;
      mejorPts = pts;
    }
  }
  return mejorEf;
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
    else if (n === 5 && cuenta === '1,4') j = 'poker';
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
