// El oráculo de la mesa: cada Amuleto, Bendición y Aumento lleva su sello S / A / B, que sale de las victorias reales
// del laboratorio (npm run analyze:meta escribe sellos.json), y se enciende a «S+» o «★ SINERGIA» con una
// micro-etiqueta cuando potencia tu Mazo o lo que ya llevás.
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
import datos from './sellos.json';

export type Sello = 'S' | 'A' | 'B';
const TABLA = datos as Record<string, Sello>;
const PREFIJO: Record<TipoOferta, string> = { amuleto: 'a', bendicion: 'b', aumento: 'u' };

/** La clave de una pieza en sellos.json y en la Colección: «a:cuchillo», «b:deguello», «u:senafalsa». */
export const clavePieza = (tipo: TipoOferta, id: string): string => `${PREFIJO[tipo]}:${id}`;
/** El sello de una pieza (A mientras el laboratorio no la haya medido). */
export const selloDe = (tipo: TipoOferta, id: string): Sello => TABLA[clavePieza(tipo, id)] ?? 'A';

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

/** El sello tal como se enseña: la letra del laboratorio, «S+» si además hay sinergia, y la micro-etiqueta. */
export function selloVivo(p: Partida, tipo: TipoOferta, id: string): { letra: Sello | 'S+'; sinergia: L | null } {
  const s = sinergia(p, tipo, id);
  const base = selloDe(tipo, id);
  return { letra: s && base === 'S' ? 'S+' : base, sinergia: s };
}
