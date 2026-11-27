// Notas internas de laboratorio y etiqueta de sinergia «★ SINERGIA» para Cábalas y Bendiciones.
import { AMULETO } from './amuletos';
import type { AmuletoId } from './amuletos';
import { L } from './balance';
import type { Palo } from './cartas';
import { sirveA, tieneAmuleto } from './estado';
import type { Partida, TipoOferta } from './estado';
import { MAZO } from './mazos';
import type { MazoId } from './mazos';
import { BENDICION, REY_DEF } from './reyes';
import type { BendicionId } from './reyes';
import datos from './notas.json';

export type Nota = 'S' | 'A' | 'B';
const TABLA = datos as Record<string, Nota>;
const PREFIJO: Record<TipoOferta, string> = { amuleto: 'a', bendicion: 'b' };

export const clavePieza = (tipo: TipoOferta, id: string): string => `${PREFIJO[tipo]}:${id}`;
export const notaDe = (tipo: TipoOferta, id: string): Nota => TABLA[clavePieza(tipo, id)] ?? 'A';

const AMULETO_MAZO: Partial<Record<AmuletoId, MazoId[]>> = {
  cascabel: ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'],
  cetro: ['chancho'],
  lanza: ['chancho'],
  cuchillo: ['truco'],
  doscaras: ['mentiroso', 'chinchon'],
  caliz: ['escoba'],
};
const COMUN: Record<Palo, AmuletoId> = { S: 'cuchillo', C: 'rebenque', D: 'moneda', H: 'mate' };

const para = (m: MazoId): L => L(`Para ${MAZO[m].nombre.es}`, `For ${MAZO[m].nombre.en}`);
const con = (rey: Palo): L => L(`Suma a ${REY_DEF[rey].carga.es}`, `Feeds ${REY_DEF[rey].carga.en}`);

export function sinergia(p: Partida, tipo: TipoOferta, id: string): L | null {
  if (tipo === 'amuleto') {
    const def = AMULETO[id as AmuletoId];
    if (AMULETO_MAZO[def.id]?.includes(p.mazoId)) return para(p.mazoId);
    if (def.palo !== 'X' && sirveA(p, def.palo)) return con(def.palo);
    return null;
  }
  const def = BENDICION[id as BendicionId];
  if (sirveA(p, def.rey) || tieneAmuleto(p, COMUN[def.rey])) return con(def.rey);
  return null;
}
