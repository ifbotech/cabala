// Dos cosas sobre las piezas (Amuletos, Bendiciones y Aumentos):
//  · la nota del laboratorio (S / A / B por tercios, de victorias reales: npm run analyze:meta escribe notas.json).
//    Es interna: la usa el bot que certifica el balance. NO se le muestra al jugador (decisión del 2026-11-20).
//  · la sinergia: la micro-etiqueta «★ SINERGIA» que sí ve el jugador cuando una pieza potencia su Mazo o lo que lleva.
import { AMULETO } from './amuletos';
import type { AmuletoId } from './amuletos';
import { AUMENTO } from './aumentos';
import type { AumentoId } from './aumentos';
import { L } from './balance';
import type { Palo } from './cartas';
import { donesDe, tieneAmuleto } from './estado';
import type { Partida, TipoOferta } from './estado';
import { MAZO } from './mazos';
import type { MazoId } from './mazos';
import { BENDICION, REY_DEF } from './reyes';
import type { BendicionId } from './reyes';
import datos from './notas.json';

export type Nota = 'S' | 'A' | 'B';
const TABLA = datos as Record<string, Nota>;
const PREFIJO: Record<TipoOferta, string> = { amuleto: 'a', bendicion: 'b', aumento: 'u' };

/** La clave de una pieza en notas.json y en la Colección: «a:cuchillo», «b:deguello», «u:senafalsa». */
export const clavePieza = (tipo: TipoOferta, id: string): string => `${PREFIJO[tipo]}:${id}`;
/** La nota de laboratorio de una pieza (A mientras no se haya medido). Solo para el bot. */
export const notaDe = (tipo: TipoOferta, id: string): Nota => TABLA[clavePieza(tipo, id)] ?? 'A';

/** Amuletos que brillan con un Mazo en particular. */
const AMULETO_MAZO: Partial<Record<AmuletoId, MazoId[]>> = {
  cascabel: ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'],
  cetro: ['chancho'],
  lanza: ['chancho'],
  cuchillo: ['truco'],
  doscaras: ['mentiroso', 'chinchon'],
  caliz: ['escoba'],
};
/** El Amuleto Común de cada palo (el que hace valer más a sus cartas). */
const COMUN: Record<Palo, AmuletoId> = { S: 'cuchillo', C: 'rebenque', D: 'moneda', H: 'mate' };

const para = (m: MazoId): L => L(`Para ${MAZO[m].nombre.es}`, `For ${MAZO[m].nombre.en}`);
const con = (rey: Palo): L => L(`Suma a ${REY_DEF[rey].carga.es}`, `Feeds ${REY_DEF[rey].carga.en}`);

/** La micro-etiqueta de sinergia de una pieza con lo que llevás ahora (o null). */
export function sinergia(p: Partida, tipo: TipoOferta, id: string): L | null {
  if (tipo === 'amuleto') {
    const def = AMULETO[id as AmuletoId];
    if (AMULETO_MAZO[def.id]?.includes(p.mazoId)) return para(p.mazoId);
    if (def.palo !== 'X' && donesDe(p, def.palo) > 0) return con(def.palo);
    return null;
  }
  if (tipo === 'bendicion') {
    const def = BENDICION[id as BendicionId];
    if (def.dual) return L('Pacto Dual', 'Dual Pact');
    if ((p.bendiciones[def.id] ?? 0) > 0) return L('Sube de nivel', 'Levels up');
    if (donesDe(p, def.rey) > 0 || tieneAmuleto(p, COMUN[def.rey])) return con(def.rey);
    return null;
  }
  const def = AUMENTO[id as AumentoId];
  return def.mazos?.includes(p.mazoId) ? para(p.mazoId) : null;
}
