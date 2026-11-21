// El resumen de una partida terminada (0.23.0), en dos capas: arriba la Build Estrella (con qué ganaste o caíste);
// abajo «Qué te frenó» y «Próximo récord». Es la última pantalla antes de «OTRA MANO YA», así que dice poco y concreto.
// Se calcula ANTES de anotar la partida en el perfil (si no, el récord se compara consigo mismo).
import { AMULETO, RAREZAS } from './amuletos';
import type { AmuletoId } from './amuletos';
import type { Jugada } from './cartas';
import type { Partida } from './estado';
import { evoluciones } from './evoluciones';
import type { EvolucionDe } from './evoluciones';
import type { Perfil } from './perfil';
import type { BendicionId } from './reyes';

export interface BuildEstrella {
  /** Las Evoluciones despiertas (van primero en la pantalla). */
  evoluciones: EvolucionDe[];
  /** Hasta tres Amuletos, de la rareza más alta a la más baja (los evolucionados primero). */
  amuletos: AmuletoId[];
  /** La Bendición de nivel más alto. */
  bendicion?: { id: BendicionId; nivel: number };
  /** La jugada que más golpes dio. */
  jugada?: Jugada;
  mejorGolpe: number;
}

export interface Freno {
  /** Quién te bajó y en qué tramo (del 0 al 2). */
  por: NonNullable<NonNullable<Partida['fin']>['por']>;
  /** Cuánto le faltaba al que te bajó: su Vida que quedaba, en % de la máxima. */
  leQuedaba: number;
}

export type TipoRecord = 'golpe' | 'tramo' | 'victoria';
export interface ProximoRecord {
  tipo: TipoRecord;
  /** Rompiste el récord en esta partida. */
  nuevo: boolean;
  actual: number;
  mejor: number;
}

export interface ResumenPartida {
  victoria: boolean;
  estrella: BuildEstrella;
  freno: Freno | null;
  record: ProximoRecord;
}

/** La Build Estrella de la partida. */
export function buildEstrella(p: Partida): BuildEstrella {
  const evs = evoluciones(p);
  const peso = (id: AmuletoId) => (evs.includes(id as EvolucionDe) ? 10 : 0) + RAREZAS.indexOf(AMULETO[id].rareza);
  const amuletos = [...p.amuletos].sort((a, b) => peso(b) - peso(a)).slice(0, 3);
  const bends = Object.entries(p.bendiciones) as [BendicionId, number][];
  const top = bends.sort((a, b) => b[1] - a[1])[0];
  const jugadas = Object.entries(p.stats.jugadas ?? {}) as [Jugada, number][];
  const jugada = jugadas.sort((a, b) => b[1] - a[1])[0]?.[0];
  return { evoluciones: evs, amuletos, bendicion: top ? { id: top[0], nivel: top[1] } : undefined, jugada, mejorGolpe: p.stats.mejorGolpe };
}

/**
 * El récord más cercano que vale perseguir: con victoria, el golpe más grande; sin victoria, el tramo más alto que
 * alcanzaste con ese Mazo (si lo igualaste), y si no, el golpe.
 */
export function proximoRecord(p: Partida, perfil: Perfil): ProximoRecord {
  const golpe = p.stats.mejorGolpe;
  const mejorGolpe = perfil.stats.mejorGolpe;
  const delMazo = perfil.cronica.filter((r) => r.mazo === p.mazoId);
  const mejorTramo = Math.max(0, ...delMazo.map((r) => (r.victoria ? 3 : r.acto)));
  const tramo = p.fin?.victoria ? 3 : p.acto;
  if (!p.fin?.victoria && tramo > mejorTramo) return { tipo: 'tramo', nuevo: true, actual: tramo + 1, mejor: mejorTramo + 1 };
  if (golpe > mejorGolpe) return { tipo: 'golpe', nuevo: true, actual: golpe, mejor: mejorGolpe };
  if (!p.fin?.victoria && tramo < mejorTramo) return { tipo: 'tramo', nuevo: false, actual: tramo + 1, mejor: mejorTramo + 1 };
  if (!p.fin?.victoria && delMazo.some((r) => r.victoria)) return { tipo: 'victoria', nuevo: false, actual: tramo + 1, mejor: 3 };
  return { tipo: 'golpe', nuevo: false, actual: golpe, mejor: mejorGolpe };
}

/** El resumen entero (llamar antes de `anotar`). */
export function resumenDe(p: Partida, perfil: Perfil): ResumenPartida {
  const por = p.fin?.por;
  return {
    victoria: !!p.fin?.victoria,
    estrella: buildEstrella(p),
    freno: por ? { por, leQuedaba: Math.round((100 * por.vida) / Math.max(1, por.vidaMax)) } : null,
    record: proximoRecord(p, perfil),
  };
}
