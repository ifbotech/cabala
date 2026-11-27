// Los 5 Mazos: cada uno es un juego de naipes rioplatense vuelto fantasía mecánica, con su Personaje jugable.
// Los números salen de balance-config.json (`mazos`).
import { B, L, fillL } from './balance';

export type MazoId = 'escoba' | 'truco' | 'chinchon' | 'mentiroso' | 'chancho';
export const MAZOS: readonly MazoId[] = ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'];

export interface MazoDef {
  id: MazoId;
  nombre: L;
  /** El juego del que sale. */
  lema: L;
  /** El Personaje jugable (su retrato vive en el HUD). */
  personaje: L;
  /** La regla estrella en una línea (≤ 12 palabras). */
  regla: L;
  /** Lo que grita la mesa cuando la regla se cumple. */
  canto: L;
  /** Detalle de sus reglas, una por renglón. */
  reglas: L[];
  /** Hito que lo abre (null: abierto desde el minuto 0). */
  desbloqueo: { stat: 'reyes' | 'pokers'; n: number; texto: L } | null;
}

const m = B.mazos;

export const MAZO: Record<MazoId, MazoDef> = {
  escoba: {
    id: 'escoba',
    nombre: L('Escoba', 'Escoba'),
    lema: L('Escoba del 15', 'Sweep to 15'),
    personaje: L('La Barrendera', 'The Sweeper'),
    regla: fillL(L('Sumá 15 justo: ¡ESCOBA!, Multi ×{x} y más Daño para siempre.', 'Add up to exactly 15: ESCOBA! Mult ×{x} and permanent Damage.'), { x: m.escoba.multi }),
    canto: L('¡ESCOBA!', 'ESCOBA!'),
    reglas: [
      fillL(L('Mano de {n} cartas, como en la mesa: tus golpes llevan +{x} de Multi.', 'Hand of {n} cards, as at the table: your hits carry +{x} Mult.'), { n: m.escoba.mano, x: m.escoba.multiMano }),
      fillL(L('Si las cartas del golpe suman 15: ¡ESCOBA!, ×{x} de Multi.', 'If the cards in a hit add up to 15: ESCOBA! ×{x} Mult.'), { x: m.escoba.multi }),
      fillL(L('Cada Escoba deja +{d} de Daño en todos tus golpes, para siempre.', 'Each Escoba leaves +{d} Damage on all your hits, forever.'), { d: m.escoba.cargaDano }),
      L('Cualquier grupo de cartas que sume 15 vale como jugada.', 'Any set of cards adding up to 15 counts as a play.'),
      fillL(L('Mesa limpia: en el primer tramo arrancás cada combate con {e} de Escudo.', 'Clean table: in the first stretch you start every fight with {e} Shield.'), { e: m.escoba.mesaLimpia }),
    ],
    desbloqueo: null,
  },
  truco: {
    id: 'truco',
    nombre: L('Truco', 'Truco'),
    lema: L('Envido y Bravas', 'Envido and Bravas'),
    personaje: L('El Paisano Bravo', 'The Bold Gaucho'),
    regla: L('Mazo corto del 1 al 7: Bravas que matan y ¡ENVIDO!', 'Short deck, 1 to 7: lethal Bravas and ENVIDO!'),
    canto: L('¡ENVIDO!', 'ENVIDO!'),
    reglas: [
      fillL(L('Mano de {n} cartas, como en la mesa: tus golpes llevan +{x} de Multi.', 'Hand of {n} cards, as at the table: your hits carry +{x} Mult.'), { n: m.truco.mano, x: m.truco.multiMano }),
      L('Tu Mazo va del 1 al 7, y barajarlo no sube la Furia.', 'Your deck runs 1 to 7, and reshuffling it raises no Fury.'),
      fillL(L('Las 4 Bravas pegan de más: 1 de Espadas +{a}, 1 de Bastos +{b}, 7 de Espadas +{c}, 7 de Oros +{d}.', 'The 4 Bravas hit harder: 1 of Swords +{a}, 1 of Clubs +{b}, 7 of Swords +{c}, 7 of Coins +{d}.'), {
        a: m.truco.bravas.S1,
        b: m.truco.bravas.C1,
        c: m.truco.bravas.S7,
        d: m.truco.bravas.D7,
      }),
      fillL(L('Dos cartas del mismo palo que sumen {n} o más: ¡ENVIDO!, Multi {mm} y +{e} de Daño (×2 y ×3 en los tramos 2 y 3), más +{c} por cada Envido ya cantado.', 'Two cards of the same suit adding up to {n} or more: ENVIDO! Mult {mm} and +{e} Damage (×2 and ×3 in stretches 2 and 3), plus +{c} for each Envido already called.'), { e: m.truco.envido, c: m.truco.cargaDano, mm: B.jugadas.envido.m, n: m.truco.envidoMin }),
    ],
    desbloqueo: null,
  },
  chinchon: {
    id: 'chinchon',
    nombre: L('Chinchón', 'Chinchón'),
    lema: L('Pierna y Escalera', 'Sets and Runs'),
    personaje: L('La Timbera del Club', 'The Club Gambler'),
    regla: L('Pierna o Escalera de palo: ¡CHINCHÓN! Cortás y tu mano es Escudo.', 'Set or suited Run: CHINCHÓN! You cut and your hand is Shield.'),
    canto: L('¡CHINCHÓN!', 'CHINCHÓN!'),
    reglas: [
      fillL(L('Mano de {n} cartas (del 1 al 8): tus golpes llevan +{x} de Multi.', 'Hand of {n} cards (1–8 deck): your hits carry +{x} Mult.'), { n: m.chinchon.mano, x: m.chinchon.multiMano }),
      fillL(L('Cada Pierna o Escalera de palo: ¡CHINCHÓN!, +{d} de Daño para siempre en esas jugadas.', 'Each Set or suited Run: CHINCHÓN! +{d} permanent Damage on those plays.'), { d: m.chinchon.cargaDano }),
      fillL(L('Cortás la mano: +{e} de Escudo por cada carta que te queda sin jugar (×2 y ×3 en los tramos 2 y 3).', 'You cut the hand: +{e} Shield for each card left unplayed (×2 and ×3 in stretches 2 and 3).'), { e: m.chinchon.corta }),
    ],
    desbloqueo: null,
  },
  mentiroso: {
    id: 'mentiroso',
    nombre: L('El Mentiroso', 'The Liar'),
    lema: L('Cara de Piedra', 'Stone Face'),
    personaje: L('El Chamuyero', 'The Smooth Talker'),
    regla: L('Comodines, Escudo de entrada y un Engaño por combate: mentí y cobrá.', 'Jokers, an opening Shield and one Bluff per fight: lie and collect.'),
    canto: L('¡MENTIRA!', 'LIAR!'),
    reglas: [
      fillL(L('Mano de {n} cartas (del 1 al 6).', 'Hand of {n} cards (1–6 deck).'), { n: m.mentiroso.mano }),
      fillL(L('Tu Mazo lleva {n} Comodines.', 'Your deck holds {n} Jokers.'), { n: m.mentiroso.comodines }),
      fillL(L('Cara de Piedra: empezás cada combate con {e} de Escudo.', 'Stone Face: you start each fight with {e} Shield.'), { e: m.mentiroso.caraDePiedra }),
      L('Engaño, una vez por combate: todas las cartas del golpe fingen ser tu carta más alta y nada les es Inmune.', 'Bluff, once per fight: every card in the hit poses as your highest card and nothing is Immune to them.'),
      fillL(L('Si el Engaño no abate al enemigo, su Furia sube {f}.', "If the Bluff doesn't take the enemy down, its Fury rises {f}."), { f: m.mentiroso.furiaFallo }),
    ],
    desbloqueo: null,
  },
  chancho: {
    id: 'chancho',
    nombre: L('Chancho Va', 'Chancho Va'),
    lema: L('Mano al Centro', 'Hand on the Pile'),
    personaje: L('El Manotazo', 'The Grabber'),
    regla: L('Pasá una carta gratis por turno. Tres o cuatro iguales: ¡CHANCHO!', 'Pass one card free each turn. Three or four of a kind: CHANCHO!'),
    canto: L('¡CHANCHO!', 'CHANCHO!'),
    reglas: [
      fillL(L('Mano de {n} cartas, como en la mesa: tus golpes llevan +{x} de Multi.', 'Hand of {n} cards, as at the table: your hits carry +{x} Mult.'), { n: m.chancho.mano, x: m.chancho.multiMano }),
      L('Cada turno, descartar 1 sola carta es gratis: robás otra en el acto.', 'Each turn, discarding 1 single card is free: you draw another right away.'),
      L('Pierna (3 iguales): ¡CHANCHO!, el enemigo queda Aturdido 1 turno.', '3 of a kind: CHANCHO! The enemy is Stunned for 1 turn.'),
      fillL(L('Póker (4 iguales): ¡CHANCHO!, ×{x} de Multi y Aturdido {t} turnos.', '4 of a kind: CHANCHO! ×{x} Mult and Stunned for {t} turns.'), { x: m.chancho.multi, t: m.chancho.aturde }),
      L('De un saque: si abatís a un enemigo de un solo golpe, el siguiente entra Aturdido.', 'In one swipe: take an enemy down in a single hit and the next one enters Stunned.'),
    ],
    desbloqueo: null,
  },
};

/** Los Mazos abiertos desde el minuto 0. */
export const MAZOS_ABIERTOS: readonly MazoId[] = MAZOS.filter((id) => MAZO[id].desbloqueo === null);
