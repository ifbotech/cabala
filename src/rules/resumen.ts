// Resumen limpio de una partida terminada en CÁBALA 2.0.
import { AMULETO, RAREZAS } from './amuletos';
import type { AmuletoId } from './amuletos';
import type { Jugada } from './cartas';
import type { Partida } from './estado';
import type { Perfil } from './perfil';
import type { BendicionId } from './reyes';

export interface BuildEstrella {
  amuletos: AmuletoId[];
  bendicion?: { id: BendicionId; nivel: number };
  jugada?: Jugada;
  mejorGolpe: number;
}

export interface Freno {
  por: NonNullable<NonNullable<Partida['fin']>['por']>;
  leQuedaba: number;
}

export interface ProximoRecord {
  tipo: 'golpe' | 'tramo';
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

export function buildEstrella(p: Partida): BuildEstrella {
  const amuletos = [...p.amuletos].sort((a, b) => RAREZAS.indexOf(AMULETO[b].rareza) - RAREZAS.indexOf(AMULETO[a].rareza)).slice(0, 3);
  const bends = Object.entries(p.bendiciones) as [BendicionId, number][];
  const top = bends.sort((a, b) => b[1] - a[1])[0];
  const jugadas = Object.entries(p.stats.jugadas ?? {}) as [Jugada, number][];
  const jugada = jugadas.sort((a, b) => b[1] - a[1])[0]?.[0];
  return { amuletos, bendicion: top ? { id: top[0], nivel: top[1] } : undefined, jugada, mejorGolpe: p.stats.mejorGolpe };
}

export function proximoRecord(p: Partida, perfil: Perfil): ProximoRecord {
  const golpe = p.stats.mejorGolpe;
  const mejorGolpe = perfil.stats.mejorGolpe;
  const tramo = p.fin?.victoria ? 3 : p.acto;
  if (golpe > mejorGolpe) return { tipo: 'golpe', nuevo: true, actual: golpe, mejor: mejorGolpe };
  return { tipo: 'tramo', nuevo: false, actual: tramo + 1, mejor: 3 };
}

export function resumenDe(p: Partida, perfil: Perfil): ResumenPartida {
  const por = p.fin?.por;
  return {
    victoria: !!p.fin?.victoria,
    estrella: buildEstrella(p),
    freno: por ? { por, leQuedaba: Math.round((100 * por.vida) / Math.max(1, por.vidaMax)) } : null,
    record: proximoRecord(p, perfil),
  };
}
