// El Mapa de caminos: tres tramos. Cada tramo es una red irregular de seis pisos que se recorre de abajo hacia arriba
// hasta su Rey. La red sale de trazar varios caminos al azar sobre una grilla de cinco columnas: donde se juntan nace
// un nodo compartido, donde se separan nace una bifurcación; así ningún Mapa repite la forma del anterior (no siempre
// hay tres opciones: a veces dos, a veces cuatro, a veces un cuello de botella).
//
// El azar del Mapa está domado por reglas de balance (ver `REGLAS_MAPA` y `cumple`): se sortea el contenido de los
// nodos hasta que la red entera las cumple. Todo sale de la semilla de la partida.
import { B } from './balance';
import { PALOS } from './cartas';
import type { Palo } from './cartas';
import type { Nodo, TipoNodo, Tramo } from './estado';
import { azar, elegir, muestra } from './rng';
import type { ConAzar } from './rng';

export const PISOS = 6;
export const COLUMNAS = 5;
export const TRAMOS = 3;

/** Las reglas de balance del Mapa, en números (las vigila `tests/reglas.test.ts` sobre cientos de semillas). */
export const REGLAS_MAPA = {
  /** Caminos que se trazan para armar la red. */
  caminos: [4, 5],
  /** Combates (Guardia o Guardia Brava) en cualquier recorrido de un tramo, sin contar al Rey. */
  combates: [3, 5],
  /** Guardias Bravas por tramo; nunca antes de este piso, y siempre con un camino que las esquiva. */
  elites: [1, 3],
  pisoElite: 2,
  /** Cábalas del Bufón por tramo. */
  cabalas: [1, 3],
  /** Pulperías entre el piso 2 y el penúltimo (el último piso siempre es Fogón o Pulpería). */
  pulperias: [0, 2],
  fogones: [0, 2],
  /** Qué tan seguido sale cada cosa en los pisos del medio. */
  peso: { guardia: 46, cabala: 18, elite: 14, pulperia: 11, fogon: 11 } as Record<Exclude<TipoNodo, 'rey'>, number>,
} as const;

/** Los palos de los enemigos de un nodo de combate (cada enemigo es Inmune al suyo). */
function palosDe(e: ConAzar, tipo: TipoNodo, acto: number): Palo[] | undefined {
  if (tipo === 'guardia') return muestra(e, PALOS, 2);
  if (tipo === 'elite') return muestra(e, PALOS, acto === 0 ? 1 : 2);
  return undefined;
}

/** La forma de la red: por cada piso, a qué columnas del piso siguiente sale cada columna. */
type Forma = Map<number, Set<number>>[];

/** Traza los caminos: cada uno arranca en una columna y sube un piso por vez, recto o en diagonal, sin cruzar a otro. */
function trazar(e: ConAzar): { forma: Forma; pisos: Set<number>[] } {
  const forma: Forma = Array.from({ length: PISOS - 1 }, () => new Map());
  const pisos: Set<number>[] = Array.from({ length: PISOS }, () => new Set());
  const cuantos = REGLAS_MAPA.caminos[0] + (azar(e) < 0.5 ? 1 : 0);
  let primero = -1;
  for (let k = 0; k < cuantos; k++) {
    let col = Math.floor(azar(e) * COLUMNAS);
    // los dos primeros caminos nunca arrancan juntos: siempre hay al menos dos entradas
    if (k === 1 && col === primero) col = (col + 1 + Math.floor(azar(e) * (COLUMNAS - 1))) % COLUMNAS;
    if (k === 0) primero = col;
    pisos[0].add(col);
    for (let piso = 0; piso < PISOS - 1; piso++) {
      const desde = col;
      const opciones = [desde - 1, desde, desde + 1].filter((c) => c >= 0 && c < COLUMNAS && (c === desde || !forma[piso].get(c)?.has(desde)));
      col = elegir(e, opciones);
      if (!forma[piso].has(desde)) forma[piso].set(desde, new Set());
      forma[piso].get(desde)!.add(col);
      pisos[piso + 1].add(col);
    }
  }
  return { forma, pisos };
}

const esCombate = (t: TipoNodo): boolean => t === 'guardia' || t === 'elite';

/** ¿La red, con ese contenido, cumple las reglas de balance? */
export function cumple(nodos: readonly Nodo[]): boolean {
  const R = REGLAS_MAPA;
  const por = new Map(nodos.map((n) => [n.id, n]));
  const cuenta = (t: TipoNodo, desde = 0, hasta = PISOS - 1): number => nodos.filter((n) => n.tipo === t && n.piso >= desde && n.piso <= hasta).length;
  const entre = (x: number, [a, b]: readonly [number, number] | readonly number[]): boolean => x >= a && x <= b;
  if (!entre(cuenta('elite'), R.elites) || !entre(cuenta('cabala'), R.cabalas)) return false;
  if (!entre(cuenta('pulperia', 0, PISOS - 2), R.pulperias) || !entre(cuenta('fogon', 0, PISOS - 2), R.fogones)) return false;
  for (const n of nodos) {
    if (n.tipo === 'rey') continue;
    if (n.piso === 0 && n.tipo !== 'guardia') return false;
    if (n.piso === PISOS - 1 && n.tipo !== 'fogon' && n.tipo !== 'pulperia') return false;
    if (n.tipo === 'elite' && n.piso < R.pisoElite) return false;
    const hijos = n.sig.map((id) => por.get(id)!).filter((h) => h.tipo !== 'rey');
    // nada que no sea una Guardia se repite pegado (ni dos Bravas, ni dos Pulperías, ni dos Fogones, ni dos Cábalas)
    if (n.tipo !== 'guardia' && hijos.some((h) => h.tipo === n.tipo)) return false;
    // una Guardia Brava nunca es obligatoria, y una bifurcación siempre ofrece cosas distintas
    if (hijos.length && hijos.every((h) => h.tipo === 'elite')) return false;
    if (hijos.length >= 2 && hijos.every((h) => h.tipo === hijos[0].tipo)) return false;
  }
  // los combates de cualquier recorrido, del piso 0 al último
  const min = new Map<string, number>();
  const max = new Map<string, number>();
  for (const n of [...nodos].filter((x) => x.tipo !== 'rey').sort((a, b) => b.piso - a.piso)) {
    const hijos = n.sig.filter((id) => min.has(id));
    const c = esCombate(n.tipo) ? 1 : 0;
    min.set(n.id, c + (hijos.length ? Math.min(...hijos.map((id) => min.get(id)!)) : 0));
    max.set(n.id, c + (hijos.length ? Math.max(...hijos.map((id) => max.get(id)!)) : 0));
  }
  for (const n of nodos.filter((x) => x.piso === 0)) if (min.get(n.id)! < R.combates[0] || max.get(n.id)! > R.combates[1]) return false;
  return true;
}

/** Sortea qué hay en cada nodo (sin mirar todavía si la red entera cumple). */
function repartir(e: ConAzar, nodos: Nodo[]): void {
  const pesos = Object.entries(REGLAS_MAPA.peso) as [Exclude<TipoNodo, 'rey'>, number][];
  const ultimo = nodos.filter((n) => n.piso === PISOS - 1).sort((a, b) => a.col - b.col);
  const empieza = azar(e) < 0.5 ? 0 : 1;
  ultimo.forEach((n, i) => (n.tipo = ultimo.length === 1 || (i + empieza) % 2 === 0 ? 'fogon' : 'pulperia'));
  for (const n of nodos) {
    if (n.tipo === 'rey' || n.piso === PISOS - 1) continue;
    if (n.piso === 0) {
      n.tipo = 'guardia';
      continue;
    }
    const validos = pesos.filter(([t]) => t !== 'elite' || n.piso >= REGLAS_MAPA.pisoElite);
    let r = azar(e) * validos.reduce((s, [, w]) => s + w, 0);
    n.tipo = validos[validos.length - 1][0];
    for (const [t, w] of validos) {
      r -= w;
      if (r < 0) {
        n.tipo = t;
        break;
      }
    }
  }
}

/** Un contenido de emergencia que respeta lo esencial (por si el sorteo no cumple en ningún intento: no pasa). */
function deEmergencia(nodos: Nodo[]): void {
  for (const n of nodos) {
    if (n.tipo === 'rey' || n.piso === 0 || n.piso === PISOS - 1) continue;
    const par = n.col % 2 === 0;
    n.tipo = n.piso === 1 ? (par ? 'guardia' : 'cabala') : n.piso === 2 ? (par ? 'elite' : 'guardia') : n.piso === 3 ? (par ? 'guardia' : 'pulperia') : 'guardia';
  }
}

/**
 * Un Tesoro a la vista por tramo (0.22.0), en un combate de los pisos del medio: sobre una Guardia Brava se abre al
 * vencerla; sobre una Guardia lleva candado de oro, que se paga en su Botín. Se ve desde la entrada del tramo.
 */
function ponerTesoro(e: ConAzar, nodos: Nodo[]): void {
  const [desde, hasta] = B.tesoros.pisos;
  const libres = nodos.filter((n) => n.piso >= desde && n.piso <= hasta && esCombate(n.tipo));
  if (!libres.length) return;
  const n = elegir(e, libres);
  n.tesoro = n.tipo === 'elite' ? 'elite' : 'oro';
}

/** Un tramo del Mapa. */
export function generarTramo(e: ConAzar, acto: number, rey: Palo): Tramo {
  const id = (piso: number, col: number) => `${acto}-${piso}-${col}`;
  const reyId = `${acto}-rey`;
  for (let intento = 0; ; intento++) {
    const { forma, pisos } = trazar(e);
    const nodos: Nodo[] = [];
    for (let piso = 0; piso < PISOS; piso++)
      for (const col of [...pisos[piso]].sort((a, b) => a - b))
        nodos.push({ id: id(piso, col), piso, col, tipo: 'guardia', sig: piso === PISOS - 1 ? [reyId] : [...(forma[piso].get(col) ?? [])].sort((a, b) => a - b).map((c) => id(piso + 1, c)) });
    nodos.push({ id: reyId, piso: PISOS, col: (COLUMNAS - 1) / 2, tipo: 'rey', sig: [] });
    let bien = false;
    for (let k = 0; k < 60 && !bien; k++) {
      repartir(e, nodos);
      bien = cumple(nodos);
    }
    if (!bien && intento < 60) continue; // esa forma no admite un reparto justo: se traza otra
    if (!bien) deEmergencia(nodos);
    for (const n of nodos) n.palos = n.tipo === 'rey' ? [rey] : palosDe(e, n.tipo, acto);
    ponerTesoro(e, nodos);
    return { nodos, rey };
  }
}

/** Los tres Reyes de la partida (de los cuatro), uno por tramo. */
export const sortearReyes = (e: ConAzar): Palo[] => muestra(e, PALOS, TRAMOS);

/** Los nodos a los que se puede ir ahora: el piso 0 al entrar al tramo; después, los que siguen al actual. */
export function alcanzables(tramo: Tramo, pos: string | null): Nodo[] {
  if (pos === null) return tramo.nodos.filter((n) => n.piso === 0);
  const actual = tramo.nodos.find((n) => n.id === pos);
  return actual ? tramo.nodos.filter((n) => actual.sig.includes(n.id)) : [];
}
