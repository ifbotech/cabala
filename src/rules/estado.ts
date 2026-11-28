// Estado de una partida (serializable a JSON) y ayudas mínimas para CÁBALA 2.0 (MVP).
import type { AmuletoId } from './amuletos';
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
  aturdido: number;
  golpes: number;
  jefe?: true;
  elite?: true;
  boleado?: true;
  segunda?: boolean;
}

export type TipoCombate = 'guardia' | 'elite' | 'rey';

export interface Combate {
  tipo: TipoCombate;
  fila: Enemigo[];
  total: number;
  mazo: Carta[];
  mano: Carta[];
  descarte: Carta[];
  escudo: number;
  furia: number;
  turno: number;
  descartes: number;
  pasar: boolean;
  enganos: number;
  engano: boolean;
  cascabel?: number;
  cetro?: boolean;
  proxMulti: number;
  golpes: number;
  dado: number;
  perdida: number;
  ultimaJugada?: string;
}

export type TipoOferta = 'bendicion' | 'amuleto';
export interface Oferta {
  tipo: TipoOferta;
  opciones: string[];
  precio?: number;
}
export type ItemBotin =
  | { t: 'oro'; n: number; hecho?: true }
  | { t: 'cura'; n: number; hecho?: true }
  | { t: 'vidamax'; n: number; hecho?: true }
  | { t: 'oferta'; oferta: Oferta; hecho?: true };
export interface Botin {
  de: TipoCombate | 'duelo';
  items: ItemBotin[];
}

export interface Tienda {
  amuletos: { id: AmuletoId; precio: number; vendido?: true }[];
  purgar: number;
  curar: number;
  mejorar: number;
  rerolls: number;
}

export type ModTramo = 'ninguno' | 'escudoDoble' | 'manoRapida' | 'oroExtra' | 'furiaInicial';

export type Fase = 'combate' | 'botin' | 'pulperia' | 'duelo' | 'fin';
/** Paso lineal dentro de cada Tramo: 0 Sota → 1 Pulpería → 2 Caballo → 3 Duelo del Bufón → 4 Rey Jefe. */
export type PasoTramo = 0 | 1 | 2 | 3 | 4;

export interface Stats {
  combates: number;
  elites: number;
  reyes: number;
  abatidos: number;
  exactos: number;
  alPelo?: number;
  cantos: number;
  pokers: number;
  golpes: number;
  mejorGolpe: number;
  turnos: number;
  danoRecibido: number;
  jugadas?: Record<string, number>;
}

export interface Partida {
  v: 2;
  semilla: string;
  rng: number;
  mazoId: MazoId;
  vida: number;
  vidaMax: number;
  oro: number;
  mazo: Carta[];
  manoMax: number;
  amuletos: AmuletoId[];
  huecos: number;
  bendiciones: Partial<Record<BendicionId, number>>;
  cargas: Record<Palo, number>;
  cantos: number;
  afinidad: number;
  furiaRey: number;
  acto: number;
  paso: PasoTramo;
  reyes: Palo[];
  modificador?: ModTramo;
  fase: Fase;
  combate?: Combate;
  botin?: Botin;
  tienda?: Tienda;
  purgas: number;
  curas: number;
  stats: Stats;
  racha: number;
  fin?: {
    victoria: boolean;
    por?: { palo: Palo; rango: Rango; jefe: boolean; elite: boolean; acto: number; vida: number; vidaMax: number };
  };
}

export const tieneAmuleto = (p: Partida, id: AmuletoId): boolean => p.amuletos.includes(id);
export const nivelBend = (p: Partida, id: BendicionId): number => p.bendiciones[id] ?? 0;

export function sirveA(p: Partida, rey: Palo): boolean {
  for (const id in p.bendiciones) {
    if (BENDICION[id as BendicionId]?.rey === rey) return true;
  }
  return false;
}

export function tramoJugador(p: Pick<Partida, 'acto'>): number {
  const e = B.jugador.escalaTramo;
  return e[Math.min(p.acto, e.length - 1)];
}

export const escudoTope = (p: Pick<Partida, 'acto'>): number => B.jugador.escudoMax * tramoJugador(p);

export function carga(p: Partida, rey: Palo): number {
  if (!sirveA(p, rey)) return 0;
  const c = p.cargas[rey];
  if (rey === 'C') return Math.min(c, B.cargas.corazaTope);
  if (rey === 'D') return Math.min(c, B.cargas.fortunaTope);
  if (rey === 'H') return Math.min(c, B.cargas.brindisTope);
  return c;
}

export const activo = (p: Partida): Enemigo | undefined => p.combate?.fila[0];

export function valorCarta(p: Pick<Partida, 'mazoId'>, c: Carta): number {
  const brava = p.mazoId === 'truco' ? ((B.mazos.truco.bravas as Record<string, number>)[`${c.palo}${c.n}`] ?? 0) : 0;
  return c.n + brava + (c.bonus ?? 0);
}

export function curar(p: Partida, n: number): number {
  const antes = p.vida;
  p.vida = Math.min(p.vidaMax, p.vida + Math.max(0, Math.round(n)));
  return Math.max(0, antes + Math.round(n) - p.vidaMax);
}
