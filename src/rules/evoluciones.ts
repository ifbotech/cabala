// Las Evoluciones (0.22.0; con maldición desde la 0.25.0): el Amuleto Épico de un palo, si además llevás un don del Rey de ese palo, evoluciona solo
// a su forma maldita. No es una pieza nueva (siguen siendo 15 Amuletos): es el mismo Amuleto, despierto. Se ve en el
// HUD como un ícono prismático y en las ofertas con el sello «★ EVOLUCIONA».
import type { AmuletoId } from './amuletos';
import { B, L, fillL } from './balance';
import type { Palo } from './cartas';
import { donesDe, tieneAmuleto } from './estado';
import type { Partida } from './estado';
import type { BendicionId } from './reyes';
import { BENDICION } from './reyes';

export type EvolucionDe = 'lanza' | 'poncho' | 'cofre' | 'caliz';
export const EVOLUCIONES: readonly EvolucionDe[] = ['lanza', 'poncho', 'cofre', 'caliz'];

export interface EvolucionDef {
  /** El Amuleto Épico que evoluciona. */
  de: EvolucionDe;
  /** El palo del Rey cuyo don lo despierta. */
  palo: Palo;
  nombre: L;
  desc: L;
}

const ev = B.evoluciones;
const am = B.amuletos;
const pct = (x: number) => Math.round(x * 100);
export const EVOLUCION: Record<EvolucionDe, EvolucionDef> = {
  lanza: {
    de: 'lanza',
    palo: 'S',
    nombre: L('EL FACÓN MALDITO', 'THE CURSED FACÓN'),
    desc: fillL(L('Todo golpe Perfora y lo que sobra pasa ×{x}. MALDICIÓN: el golpe que no abate te corta {v} de Vida.', 'Every hit Pierces; the overflow carries ×{x}. CURSE: a hit that kills nothing cuts you for {v} Health.'), { x: ev.facon.sobra, v: ev.facon.corta }),
  },
  poncho: {
    de: 'poncho',
    palo: 'C',
    nombre: L('GARROTE DEL CACIQUE', "CHIEFTAIN'S CLUB"),
    desc: fillL(L('Con {e}+ de Escudo, +{m} Multi; tu Escudo suma ×{g} al Daño. MALDICIÓN: el golpe sin Bastos gasta medio Escudo.', 'At {e}+ Shield, +{m} Mult; your Shield adds ×{g} to Damage. CURSE: a hit with no Clubs spends half your Shield.'), { e: am.poncho.escudo, m: am.poncho.multi, g: ev.garrote }),
  },
  cofre: {
    de: 'cofre',
    palo: 'D',
    nombre: L('SOL DE LA TIMBA', 'SUN OF THE GAMBLING DEN'),
    desc: fillL(L('Oros dobles, +1 Multi cada {k} de oro (tope +{t}) y descartes sin fin. MALDICIÓN: cada descarte, −{o} de oro.', 'Double Coins, +1 Mult per {k} gold (max +{t}), endless discards. CURSE: each discard costs {o} gold.'), { k: am.cofre.cada, t: ev.sol.tope, o: ev.sol.descarte }),
  },
  caliz: {
    de: 'caliz',
    palo: 'H',
    nombre: L('BRINDIS DE SANGRE', 'BLOOD TOAST'),
    desc: fillL(L('+1 de Multi por cada {k} % de Vida que te falta. MALDICIÓN: tus Copas ya no te curan.', '+1 Mult for every {k}% Health you are missing. CURSE: your Cups no longer heal you.'), { k: ev.brindis.cada }),
  },
};

/** El Amuleto, ¿ya evolucionó? (lo llevás y llevás algún don del Rey de su palo). */
/** Niveles de dones de ese Rey que llevás (un don de nivel 2 cuenta 2; las Duales cuentan para los dos). */
export function nivelesDe(p: Partida, palo: Palo): number {
  let n = 0;
  for (const id in p.bendiciones) {
    const d = BENDICION[id as BendicionId];
    if (d.rey === palo || d.dual === palo) n += p.bendiciones[id as BendicionId] ?? 0;
  }
  return n;
}
/** (0.29.0) El Amuleto, ¿ya evolucionó? Lo llevás y el Rey de su palo te dio dones por el nivel que pide el despertar. */
export const evoluciono = (p: Partida, de: EvolucionDe): boolean => tieneAmuleto(p, de) && nivelesDe(p, EVOLUCION[de].palo) >= B.evoluciones.despierta;
/** Las Evoluciones despiertas de la partida. */
export const evoluciones = (p: Partida): EvolucionDe[] => EVOLUCIONES.filter((de) => evoluciono(p, de));
export const esEvolucionable = (id: string): id is EvolucionDe => (EVOLUCIONES as readonly string[]).includes(id);

/**
 * ¿Tomar esa pieza despierta una Evolución? Para el sello «★ EVOLUCIONA» de «ELEGÍ UNA» y La Pulpería: un Épico cuyo
 * Rey ya te dio un don, o un don de un Rey cuyo Épico ya llevás.
 */
export function despierta(p: Partida, tipo: 'amuleto' | 'bendicion' | 'aumento', id: string): EvolucionDe | null {
  if (tipo === 'amuleto') return esEvolucionable(id) && !tieneAmuleto(p, id) && nivelesDe(p, EVOLUCION[id].palo) >= B.evoluciones.despierta ? id : null;
  if (tipo !== 'bendicion') return null;
  const d = BENDICION[id as BendicionId];
  if (!d) return null;
  for (const de of EVOLUCIONES) {
    const palo = EVOLUCION[de].palo;
    // el don que se ofrece suma un nivel: despierta si con él se llega justo al umbral
    if (tieneAmuleto(p, de as AmuletoId) && nivelesDe(p, palo) === B.evoluciones.despierta - 1 && (d.rey === palo || d.dual === palo)) return de;
  }
  return null;
}
