// El estado de una partida (serializable a JSON) y sus ayudas mínimas. Lo mutan las funciones de combate.ts y
// partida.ts; la interfaz y el bot solo lo leen y llaman a esas funciones.
import type { AmuletoId } from './amuletos';
import type { AumentoId, Nivel } from './aumentos';
import { B } from './balance';
import type { Carta, Palo, Rango } from './cartas';
import type { MazoId } from './mazos';
import type { BendicionId } from './reyes';
import { BENDICION } from './reyes';

export interface Enemigo {
  palo: Palo;
  rango: Rango;
  vida: number;
  vidaMax: number;
  escudo: number;
  escudoMax: number;
  ataque: number;
  /** Turnos que le quedan Aturdido (se salta su Contraataque). */
  aturdido: number;
  /** Golpes que ya recibió. */
  golpes: number;
  /** El Rey jefe del tramo. */
  jefe?: true;
  elite?: true;
  /** Ya lo aturdieron las Boleadoras. */
  boleado?: true;
}

export type TipoCombate = 'guardia' | 'elite' | 'rey';

export interface Combate {
  tipo: TipoCombate;
  /** Los enemigos que quedan: el primero es el activo, el resto espera en la pila de la Corte. */
  fila: Enemigo[];
  /** Cuántos había al empezar. */
  total: number;
  mazo: Carta[];
  mano: Carta[];
  descarte: Carta[];
  escudo: number;
  furia: number;
  turno: number;
  descartes: number;
  /** Chancho Va: el pase gratis de este turno sigue disponible. */
  pasar: boolean;
  /** El Mentiroso: Engaños que quedan y si el próximo golpe va con Engaño. */
  enganos: number;
  engano: boolean;
  /** Multi ganado para el resto del combate (Mano Caliente). */
  multiCombate: number;
  /** Multi que lleva el próximo golpe (Golpe exacto, Facón). */
  proxMulti: number;
  /** Golpes dados en el combate. */
  golpes: number;
  /** El dado de este turno (0 si no llevás nada que lo tire). */
  dado: number;
  /** Cara de Póker: el primer Contraataque todavía no llegó. */
  caraDePoker: boolean;
  /** Seña Falsa ya hecha en este combate. */
  sena: boolean;
  /** Vida perdida en el combate. */
  perdida: number;
}

export type TipoNodo = 'guardia' | 'elite' | 'pulperia' | 'cabala' | 'fogon' | 'rey';
export interface Nodo {
  id: string;
  piso: number;
  col: number;
  tipo: TipoNodo;
  /** Nodos del piso siguiente a los que lleva. */
  sig: string[];
  /** Los palos de los enemigos que esperan ahí (se ven en el Mapa: cada uno es Inmune al suyo). */
  palos?: Palo[];
}
export interface Tramo {
  nodos: Nodo[];
  rey: Palo;
}

export type TipoOferta = 'bendicion' | 'amuleto' | 'aumento';
export interface Oferta {
  tipo: TipoOferta;
  opciones: string[];
  /** Nivel de los Aumentos ofrecidos. */
  nivel?: Nivel;
}
export type ItemBotin = { t: 'oro'; n: number; hecho?: true } | { t: 'cura'; n: number; hecho?: true } | { t: 'oferta'; oferta: Oferta; hecho?: true };
export interface Botin {
  de: 'inicio' | TipoCombate | 'cabala';
  items: ItemBotin[];
}

export interface Tienda {
  amuletos: { id: AmuletoId; precio: number; vendido?: true }[];
  purgar: number;
  curar: number;
}

export interface CabalaEstado {
  id: string;
  /** Lo que pasó al elegir (texto ya resuelto en los dos idiomas). */
  resultado?: { es: string; en: string; bueno: boolean };
}

export type Fase = 'botin' | 'mapa' | 'combate' | 'pulperia' | 'fogon' | 'cabala' | 'fin';

export interface Stats {
  combates: number;
  elites: number;
  reyes: number;
  abatidos: number;
  exactos: number;
  cantos: number;
  pokers: number;
  golpes: number;
  mejorGolpe: number;
  turnos: number;
  danoRecibido: number;
}

export interface Partida {
  v: 1;
  semilla: string;
  rng: number;
  mazoId: MazoId;
  reinado: number;
  vida: number;
  vidaMax: number;
  oro: number;
  /** El Mazo de la partida (lo que se baraja al empezar cada combate). */
  mazo: Carta[];
  manoMax: number;
  amuletos: AmuletoId[];
  huecos: number;
  aumentos: AumentoId[];
  /** Nivel de cada Bendición que llevás. */
  bendiciones: Partial<Record<BendicionId, number>>;
  /** Las cargas de los 4 Reyes: Filo (S), Coraza (C), Fortuna (D), Brindis (H). */
  cargas: Record<Palo, number>;
  /** Cargas del canto de tu Mazo (Escobas hechas, Chinchones cantados). */
  cantos: number;
  /** El humor del Bufón: de −3 (garca) a +3 (te tira la buena). */
  afinidad: number;
  /** Furia que el próximo Rey se lleva de regalo (Pacto Garca, el Bufón garca). */
  furiaRey: number;
  irseAlMazo: boolean;
  /** Tramo actual (0, 1, 2) y su Mapa. */
  acto: number;
  tramos: Tramo[];
  /** El nodo en el que estás (null: todavía no entraste al tramo). */
  pos: string | null;
  /** Los nodos ya pisados en este tramo, en orden. */
  camino: string[];
  fase: Fase;
  combate?: Combate;
  botin?: Botin;
  tienda?: Tienda;
  cabala?: CabalaEstado;
  cabalasVistas: string[];
  /** Fogón: ya usaste su servicio. */
  fogonHecho?: boolean;
  /** Veces que purgaste y curaste en Pulperías (encarece el precio). */
  purgas: number;
  curas: number;
  /** Los niveles del Altar con los que empezó la partida. */
  altar: Record<string, number>;
  stats: Stats;
  fin?: { victoria: boolean; porotos: number };
}

// ───────────────────────── ayudas ─────────────────────────

export const tieneAumento = (p: Partida, id: AumentoId): boolean => p.aumentos.includes(id);
export const tieneAmuleto = (p: Partida, id: AmuletoId): boolean => p.amuletos.includes(id);
/** Nivel de una Bendición (0 si no la llevás). */
export const nivelBend = (p: Partida, id: BendicionId): number => p.bendiciones[id] ?? 0;
/** ¿Llevás algún don de ese Rey? (su carga solo corre si es así). */
export function sirveA(p: Partida, rey: Palo): boolean {
  for (const id in p.bendiciones) {
    const d = BENDICION[id as BendicionId];
    if (d.rey === rey || d.dual === rey) return true;
  }
  return false;
}
/** Cuántos dones de ese Rey llevás (las Duales cuentan para los dos). */
export function donesDe(p: Partida, rey: Palo): number {
  let n = 0;
  for (const id in p.bendiciones) {
    const d = BENDICION[id as BendicionId];
    if (d.rey === rey || d.dual === rey) n++;
  }
  return n;
}
/** La carga de un Rey que cuenta de verdad (0 si no llevás dones suyos; con su tope). */
export function carga(p: Partida, rey: Palo): number {
  if (!sirveA(p, rey)) return 0;
  const c = p.cargas[rey];
  if (rey === 'C') return Math.min(c, B.cargas.corazaTope);
  if (rey === 'D') return Math.min(c, B.cargas.fortunaTope);
  if (rey === 'H') return Math.min(c, B.cargas.brindisTope);
  return c;
}
/** El enemigo activo del combate. */
export const activo = (p: Partida): Enemigo | undefined => p.combate?.fila[0];

/** Cura sin pasarse del máximo; devuelve lo que no cupo. */
export function curar(p: Partida, n: number): number {
  const antes = p.vida;
  p.vida = Math.min(p.vidaMax, p.vida + Math.max(0, Math.round(n)));
  return Math.max(0, antes + Math.round(n) - p.vidaMax);
}
