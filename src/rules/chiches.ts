// Los Chiches de Pulpería (0.21.0): consumibles de un solo uso que se apoyan sobre la madera, a la derecha de la mesa
// (nunca en la mano: en la mano solo hay naipes). Entran tres. Se compran en La Pulpería o se le roban a la Corte como
// Prenda al abatir con Golpe exacto, al pelo o cantando. Usarlos no gasta el turno.
import { B, L, fillL } from './balance';

export type ChicheId = 'ginebra' | 'dado' | 'fosforo' | 'tiza' | 'poroto';
export const CHICHES: readonly ChicheId[] = ['ginebra', 'dado', 'fosforo', 'tiza', 'poroto'];

export interface ChicheDef {
  id: ChicheId;
  nombre: L;
  /** Lo que hace, en 3 a 6 palabras. */
  desc: L;
}

const ch = B.chiches;
export const CHICHE: Record<ChicheId, ChicheDef> = {
  ginebra: {
    id: 'ginebra',
    nombre: L('Vaso de Ginebra', 'Glass of Gin'),
    desc: fillL(L('Curás {n} de Vida (×tramo).', 'Heal {n} Health (×act).'), { n: ch.ginebra }),
  },
  dado: {
    id: 'dado',
    nombre: L('Dado Cargado', 'Loaded Die'),
    desc: fillL(L('+{n} de Multi en este golpe.', '+{n} Mult on this hit.'), { n: ch.dado }),
  },
  fosforo: {
    id: 'fosforo',
    nombre: L('Fósforo de Fogón', 'Campfire Match'),
    desc: L('Quema el Inmune en este golpe.', 'Burns away Immune for this hit.'),
  },
  tiza: {
    id: 'tiza',
    nombre: L('Polvo de Tiza', 'Chalk Dust'),
    desc: L('Tu carta más baja se vuelve Comodín.', 'Your lowest card becomes a Joker.'),
  },
  poroto: {
    id: 'poroto',
    nombre: L('Poroto de Yapa', 'Lucky Bean'),
    desc: fillL(L('Robás {n} cartas de más.', 'Draw {n} extra cards.'), { n: ch.poroto }),
  },
};

/** Los huecos de Chiches de la partida (las partidas guardadas antes de la 0.21 no los traen). */
export const huecosChiche = (lista: readonly (ChicheId | null)[] | undefined): (ChicheId | null)[] => {
  const out = [...(lista ?? [])].slice(0, ch.huecos);
  while (out.length < ch.huecos) out.push(null);
  return out;
};
