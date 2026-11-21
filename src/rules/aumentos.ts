// Los 18 Aumentos del Bufón: trucos de chanta, todos pasivos (jamás entran en tu mano). Se ofrecen de a tres en la
// pantalla «ELEGÍ UNA CÁBALA», en tres niveles: Plata, Oro y Prismático (donde también viven las Maldiciones: mucho
// poder con su precio).
import { B, L, fillL, pct } from './balance';
import type { MazoId } from './mazos';

export type Nivel = 'plata' | 'oro' | 'prisma';
export const NIVELES: readonly Nivel[] = ['plata', 'oro', 'prisma'];
export const NIVEL_NOMBRE: Record<Nivel, L> = { plata: L('Plata', 'Silver'), oro: L('Oro', 'Gold'), prisma: L('Prismático', 'Prismatic') };

export type AumentoId =
  | 'senafalsa' | 'dardeabajo' | 'cortedemazo' | 'vueltodemas' | 'sermano' | 'mesaservida'
  | 'cartamarcada' | 'manocaliente' | 'chamuyo' | 'retruco' | 'caradepoker' | 'irsealmazo'
  | 'faltaenvido' | 'valecuatro' | 'barajacargada' | 'pactogarca' | 'contraflor' | 'venderalma';

export interface AumentoDef {
  id: AumentoId;
  nivel: Nivel;
  /** Maldición: poder con precio. */
  maldicion?: true;
  nombre: L;
  desc: L;
  /** Mazos con los que hace sinergia a la vista (★). */
  mazos?: MazoId[];
}

const a = B.aumentos;

const lista: AumentoDef[] = [
  // ── Plata
  { id: 'senafalsa', nivel: 'plata', nombre: L('Seña Falsa', 'False Signal'), desc: L('Tu primer descarte de cada combate convierte tu carta más baja en un 7, para siempre.', 'Your first discard each fight turns your lowest card into a 7, forever.'), mazos: ['truco', 'chancho'] },
  { id: 'dardeabajo', nivel: 'plata', nombre: L('Dar de Abajo', 'Bottom Deal'), desc: fillL(L('Robás +{n} cartas en el turno 1 de cada combate.', 'Draw +{n} cards on turn 1 of each fight.'), { n: a.dardeabajo }), mazos: ['chinchon', 'chancho'] },
  { id: 'cortedemazo', nivel: 'plata', nombre: L('Corte de Mazo', 'Cut the Deck'), desc: fillL(L('+{n} descarte por combate.', '+{n} discard per fight.'), { n: a.cortedemazo }) },
  { id: 'vueltodemas', nivel: 'plata', nombre: L('Vuelto de Más', 'Extra Change'), desc: fillL(L('+{n} de oro al ganar cada combate.', '+{n} gold on winning each fight.'), { n: a.vueltodemas }) },
  { id: 'sermano', nivel: 'plata', nombre: L('Ser Mano', 'First Hand'), desc: fillL(L('Tu primer golpe de cada combate: +{n} de Multi.', 'Your first hit of each fight: +{n} Mult.'), { n: a.sermano }) },
  { id: 'mesaservida', nivel: 'plata', nombre: L('Mesa Servida', 'Table Set'), desc: fillL(L('Empezás cada combate con {n} de Escudo.', 'Start each fight with {n} Shield.'), { n: a.mesaservida }) },
  // ── Oro
  { id: 'cartamarcada', nivel: 'oro', nombre: L('Carta Marcada', 'Marked Card'), desc: L('Sumás un 1 de Espadas marcado: no ocupa lugar y vuelve a tu mano al jugarlo.', 'Add a marked 1 of Swords: it takes no hand slot and returns when played.'), mazos: ['truco'] },
  { id: 'manocaliente', nivel: 'oro', nombre: L('Mano Caliente', 'Hot Hand'), desc: fillL(L('Cada canto de tu Mazo: +{m} de Multi por el resto del combate (tope +{t}).', "Each of your deck's calls: +{m} Mult for the rest of the fight (max +{t})."), { m: a.manocaliente.multi, t: a.manocaliente.tope }), mazos: ['escoba', 'truco', 'chinchon'] },
  { id: 'chamuyo', nivel: 'oro', nombre: L('Chamuyo', 'Sweet Talk'), desc: fillL(L('La Pulpería te cobra {p} % menos y el humor del Bufón nunca baja de neutral.', "The Pulpería charges you {p}% less and the Jester's mood never drops below neutral."), { p: pct(a.chamuyo) }) },
  { id: 'retruco', nivel: 'oro', nombre: L('Retruco', 'Retruco'), desc: fillL(L('Si el enemigo sobrevivió a tu golpe anterior: +{m} de Multi.', 'If the enemy survived your previous hit: +{m} Mult.'), { m: a.retruco }) },
  { id: 'caradepoker', nivel: 'oro', nombre: L('Cara de Póker', 'Poker Face'), desc: L('Lo primero que TE PEGAN en cada combate no llega.', 'The first hit on you in each fight never lands.') },
  { id: 'irsealmazo', nivel: 'oro', nombre: L('Irse al Mazo', 'Fold'), desc: fillL(L('Una vez por partida, el golpe que te mataría no llega y curás {p} % de tu Vida.', "Once per run, the blow that would kill you misses and you heal {p}% of your Health."), { p: pct(a.irsealmazo) }) },
  // ── Prismático
  { id: 'faltaenvido', nivel: 'prisma', nombre: L('Falta Envido', 'Falta Envido'), desc: fillL(L('Al golpear con {p} % de Vida o menos: ×{m} de Multi. Pero tus Copas curan la mitad.', 'When hitting at {p}% Health or less: ×{m} Mult. But your Cups heal half.'), { p: pct(a.faltaenvido.vida), m: a.faltaenvido.multi }) },
  { id: 'valecuatro', nivel: 'prisma', nombre: L('Vale Cuatro', 'Vale Cuatro'), desc: fillL(L('Golpes con toda tu mano (o con 5 cartas): ×{m} de Multi. Pero un descarte menos por combate.', 'Hits with your whole hand (or 5 cards): ×{m} Mult. But one less discard per fight.'), { m: a.valecuatro.multi }), mazos: ['escoba', 'truco', 'chancho'] },
  { id: 'barajacargada', nivel: 'prisma', nombre: L('Baraja Cargada', 'Stacked Deck'), desc: fillL(L('Los 2 y los 3 de tu Mazo se vuelven {n}. Pero los {c} se vuelven {d}.', 'The 2s and 3s in your deck become {n}s. But the {c}s become {d}s.'), { n: a.barajacargada.a, c: a.barajacargada.contraDe[0], d: a.barajacargada.contraA }), mazos: ['chancho', 'mentiroso'] },
  { id: 'pactogarca', nivel: 'prisma', maldicion: true, nombre: L('Pacto Garca', 'Crooked Pact'), desc: fillL(L('+{o} de oro ya, pero el próximo Rey arranca con +{f} de Furia.', '+{o} gold now, but the next King starts with +{f} Fury.'), { o: a.pactogarca.oro, f: a.pactogarca.furia }) },
  { id: 'contraflor', nivel: 'prisma', maldicion: true, nombre: L('Contraflor al Resto', 'All-In Contraflor'), desc: fillL(L('×{m} de Multi en todos tus golpes, pero perdés el {p} % de tu Vida máxima.', '×{m} Mult on all your hits, but you lose {p}% of your max Health.'), { m: a.contraflor.multi, p: pct(1 - a.contraflor.vida) }) },
  { id: 'venderalma', nivel: 'prisma', maldicion: true, nombre: L('Vender el Alma', 'Sell Your Soul'), desc: fillL(L('+{n} carta en la mano, pero el Bufón se queda con {v} de tu Vida máxima.', '+{n} card in hand, but the Jester keeps {v} of your max Health.'), { n: a.venderalma.mano, v: a.venderalma.vida }) },
];

export const AUMENTOS: readonly AumentoId[] = lista.map((x) => x.id);
export const AUMENTO = Object.fromEntries(lista.map((x) => [x.id, x])) as Record<AumentoId, AumentoDef>;
export const aumentosDe = (nivel: Nivel): AumentoId[] => lista.filter((x) => x.nivel === nivel).map((x) => x.id);
