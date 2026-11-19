// El perfil del jugador: lo que queda entre partidas. Los Porotos (la moneda del Altar; con porotos se anotan los
// tantos del truco), las mejoras del Altar, los Mazos abiertos, la Colección y la Crónica.
import { B, L, fillL, pct } from './balance';
import { MAZO, MAZOS } from './mazos';
import type { MazoId } from './mazos';
import type { Partida } from './estado';

export type MejoraId = 'vida' | 'oro' | 'descuento' | 'suerte' | 'reyes' | 'hueco' | 'purga';

export interface MejoraDef {
  id: MejoraId;
  nombre: L;
  /** Lo que da cada nivel. */
  desc: L;
  max: number;
}

const a = B.altar;

/** El Altar entero: siete mejoras directas, una pantalla, sin árbol. */
export const MEJORAS: readonly MejoraDef[] = [
  { id: 'vida', nombre: L('Vida Inicial', 'Starting Health'), desc: fillL(L('+{p} % de Vida por nivel.', '+{p}% Health per level.'), { p: pct(a.vida) }), max: 5 },
  { id: 'oro', nombre: L('Oro de Arranque', 'Starting Gold'), desc: fillL(L('+{n} de oro al empezar por nivel.', '+{n} starting gold per level.'), { n: a.oro }), max: 5 },
  { id: 'descuento', nombre: L('Descuento en Pulpería', 'Pulpería Discount'), desc: fillL(L('Todo cuesta {p} % menos por nivel.', 'Everything costs {p}% less per level.'), { p: pct(a.descuento) }), max: 5 },
  { id: 'suerte', nombre: L('Suerte del Bufón', "Jester's Luck"), desc: fillL(L('+{p} % de que sus trucos te salgan bien por nivel.', '+{p}% chance his tricks go your way per level.'), { p: pct(a.suerte) }), max: 5 },
  { id: 'reyes', nombre: L('Poder de Reyes', 'Power of Kings'), desc: fillL(L('Tu primera Bendición llega con +{n} carga por nivel.', 'Your first Blessing arrives with +{n} charge per level.'), { n: a.reyes }), max: 2 },
  { id: 'hueco', nombre: L('Hueco de Amuleto', 'Amulet Slot'), desc: L('+1 hueco de Amuleto.', '+1 Amulet slot.'), max: 1 },
  { id: 'purga', nombre: L('Purga Barata', 'Cheap Purge'), desc: fillL(L('Purgar cuesta {n} de oro menos por nivel.', 'Purging costs {n} less gold per level.'), { n: a.purga }), max: 3 },
];
export const MEJORA = Object.fromEntries(MEJORAS.map((m) => [m.id, m])) as Record<MejoraId, MejoraDef>;

/** Lo que cuesta el nivel siguiente de una mejora (null si ya está al máximo). */
export function costeMejora(id: MejoraId, nivel: number): number | null {
  const def = MEJORA[id];
  if (nivel >= def.max) return null;
  // las mejoras cortas (Hueco, Purga) usan los escalones altos de la tabla
  const desde = Math.max(0, a.costes.length - def.max);
  return a.costes[Math.min(a.costes.length - 1, desde + nivel)];
}

export interface Resumen {
  fecha: number;
  semilla: string;
  mazo: MazoId;
  reinado: number;
  victoria: boolean;
  acto: number;
  reyes: number;
  abatidos: number;
  mejorGolpe: number;
  turnos: number;
  porotos: number;
}

export interface Perfil {
  v: 1;
  porotos: number;
  altar: Record<MejoraId, number>;
  stats: { partidas: number; victorias: number; reyes: number; pokers: number; exactos: number; cantos: number; abatidos: number; mejorGolpe: number };
  /** El Reinado más alto ganado con cada Mazo (0: ninguno). */
  ganado: Record<MazoId, number>;
  /** Piezas ya vistas (para la Colección): «a:cuchillo», «b:deguello», «u:senafalsa», «r:S». */
  vistos: string[];
  /** Las últimas partidas. */
  cronica: Resumen[];
  /** Los tres comentarios del Bufón en el primer combate ya se dijeron. */
  aprendido: boolean;
}

export function perfilNuevo(): Perfil {
  return {
    v: 1,
    porotos: 0,
    altar: { vida: 0, oro: 0, descuento: 0, suerte: 0, reyes: 0, hueco: 0, purga: 0 },
    stats: { partidas: 0, victorias: 0, reyes: 0, pokers: 0, exactos: 0, cantos: 0, abatidos: 0, mejorGolpe: 0 },
    ganado: { escoba: 0, truco: 0, chinchon: 0, mentiroso: 0, chancho: 0 },
    vistos: [],
    cronica: [],
    aprendido: false,
  };
}

/** El Altar lleno (para el laboratorio). */
export const altarLleno = (): Record<MejoraId, number> => Object.fromEntries(MEJORAS.map((m) => [m.id, m.max])) as Record<MejoraId, number>;
export const altarVacio = (): Record<MejoraId, number> => Object.fromEntries(MEJORAS.map((m) => [m.id, 0])) as Record<MejoraId, number>;

/** ¿Está abierto ese Mazo? */
export function mazoAbierto(perfil: Perfil, id: MazoId): boolean {
  const d = MAZO[id].desbloqueo;
  if (!d) return true;
  return (d.stat === 'reyes' ? perfil.stats.reyes : perfil.stats.pokers) >= d.n;
}
/** Cuánto lleva del hito que abre un Mazo: [hecho, pedido]. */
export function avanceMazo(perfil: Perfil, id: MazoId): [number, number] {
  const d = MAZO[id].desbloqueo;
  if (!d) return [1, 1];
  return [Math.min(d.n, d.stat === 'reyes' ? perfil.stats.reyes : perfil.stats.pokers), d.n];
}
/** El Reinado más alto que se puede elegir: uno más que el más alto ganado con cualquier Mazo (hasta 8). */
export const reinadoMax = (perfil: Perfil): number => Math.min(8, 1 + Math.max(0, ...MAZOS.map((m) => perfil.ganado[m])));

/** Compra el nivel siguiente de una mejora. Devuelve false si no alcanza o ya está al máximo. */
export function mejorar(perfil: Perfil, id: MejoraId): boolean {
  const coste = costeMejora(id, perfil.altar[id]);
  if (coste === null || perfil.porotos < coste) return false;
  perfil.porotos -= coste;
  perfil.altar[id]++;
  return true;
}

/** Los Porotos que deja una partida terminada. */
export function porotosDe(p: Partida, victoria: boolean): number {
  const k = B.porotos;
  const s = p.stats;
  const base = (s.combates - s.elites - s.reyes) * k.combate + s.elites * k.elite + s.reyes * k.rey + (victoria ? k.victoria : 0);
  return Math.round(base * (1 + (p.reinado - 1) * k.porReinado));
}

/** Anota una partida terminada en el perfil: Porotos, hitos, Crónica. Devuelve los Mazos que se abrieron con ella. */
export function anotar(perfil: Perfil, p: Partida, fecha: number): MazoId[] {
  const antes = MAZOS.filter((m) => mazoAbierto(perfil, m));
  const victoria = !!p.fin?.victoria;
  const porotos = p.fin?.porotos ?? porotosDe(p, victoria);
  perfil.porotos += porotos;
  const s = perfil.stats;
  s.partidas++;
  if (victoria) s.victorias++;
  s.reyes += p.stats.reyes;
  s.pokers += p.stats.pokers;
  s.exactos += p.stats.exactos;
  s.cantos += p.stats.cantos;
  s.abatidos += p.stats.abatidos;
  s.mejorGolpe = Math.max(s.mejorGolpe, p.stats.mejorGolpe);
  if (victoria) perfil.ganado[p.mazoId] = Math.max(perfil.ganado[p.mazoId], p.reinado);
  perfil.cronica.unshift({ fecha, semilla: p.semilla, mazo: p.mazoId, reinado: p.reinado, victoria, acto: p.acto, reyes: p.stats.reyes, abatidos: p.stats.abatidos, mejorGolpe: p.stats.mejorGolpe, turnos: p.stats.turnos, porotos });
  perfil.cronica.length = Math.min(perfil.cronica.length, 20);
  return MAZOS.filter((m) => mazoAbierto(perfil, m) && !antes.includes(m));
}

/** Marca una pieza como vista (Colección). */
export function ver(perfil: Perfil, clave: string): void {
  if (!perfil.vistos.includes(clave)) perfil.vistos.push(clave);
}
