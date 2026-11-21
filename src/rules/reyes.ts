// Los 4 Reyes y sus Bendiciones. Cada Rey te corteja con dones que escalan y, al final de un tramo, te espera como
// jefe. Cada Rey tiene una sola carga (Filo, Coraza, Fortuna, Brindis) con una sola regla para todos:
// «cada enemigo que abatís con su palo en el golpe: +1». La carga solo corre si llevás alguna Bendición suya.
import { B, L, fillL, pct } from './balance';
import type { Palo } from './cartas';

export interface ReyDef {
  palo: Palo;
  nombre: L;
  apodo: L;
  /** El nombre de su carga y lo que da cada punto. */
  carga: L;
  cargaDa: L;
  /** Su rasgo como jefe. */
  rasgo: L;
  rasgoDesc: L;
  /** Su segunda cara: lo que cambia cuando baja a media Vida. */
  segunda: L;
  segundaDesc: L;
  /** Lo que dice: al ofrecer, al enfrentarte llevando dones suyos, sin ellos, al caer. */
  voz: { ofrece: L[]; aliado: L; ajeno: L; cae: L; pega: L[]; duele: L };
}

const r = B.reyes;
const c = B.cargas;

export const REY_DEF: Record<Palo, ReyDef> = {
  S: {
    palo: 'S',
    nombre: L('El Rey de Espadas', 'The King of Swords'),
    apodo: L('El Caudillo', 'The Warlord'),
    carga: L('Filo', 'Edge'),
    cargaDa: fillL(L('+{n} de Daño en todos tus golpes por punto.', '+{n} Damage on all your hits per point.'), { n: c.filoDano }),
    rasgo: L('Filo del Caudillo', "Warlord's Edge"),
    rasgoDesc: fillL(L('Su Furia sube {f} por turno y la mitad de su Contraataque atraviesa tu Escudo.', 'His Fury rises {f} per turn and half his Counterattack cuts through your Shield.'), { f: r.S.furiaTurno }),
    segunda: L('Degüello', 'Cutthroat'),
    segundaDesc: fillL(L('A media Vida: si repetís la jugada de tu golpe anterior, +{f} de Furia.', 'At half Health: repeat the play of your last hit and he gains +{f} Fury.'), { f: r.S.deguello }),
    voz: {
      ofrece: [L('Un solo tajo. El resto es ruido.', 'One clean cut. The rest is noise.'), L('Tomá mi filo. Usalo bien.', 'Take my edge. Use it well.')],
      aliado: L('Con mi propio filo venís. Mostrame qué aprendiste.', 'You come with my own edge. Show me what you learned.'),
      ajeno: L('Nunca aceptaste nada mío. Mejor: no te debo piedad.', 'You never took a thing from me. Good: I owe you no mercy.'),
      cae: L('Buen tajo… paisano.', 'Clean cut… stranger.'),
      pega: [L('¿Eso era tu guardia?', 'Was that your guard?'), L('Sangrás fácil.', 'You bleed easy.')],
      duele: L('¡Así se pega, carajo!', 'Now that is a blow!'),
    },
  },
  C: {
    palo: 'C',
    nombre: L('El Rey de Bastos', 'The King of Clubs'),
    apodo: L('El Cacique', 'The Chieftain'),
    carga: L('Coraza', 'Armor'),
    cargaDa: fillL(L('+1 de Escudo al empezar cada combate por punto (tope {t}).', '+1 Shield at the start of each fight per point (max {t}).'), { t: c.corazaTope }),
    rasgo: L('Coraza del Cacique', "Chieftain's Armor"),
    rasgoDesc: fillL(L('Arranca con {e} de Escudo y recupera {g} por turno. Si tu golpe no le saca Vida, pega más fuerte.', 'Starts with {e} Shield and regains {g} per turn. If your hit takes no Health off him, he strikes harder.'), { e: r.C.escudo, g: r.C.regenera }),
    segunda: L('Empalizada', 'Palisade'),
    segundaDesc: L('A media Vida: recupera todo su Escudo de golpe, una sola vez.', 'At half Health: he regains his whole Shield at once, one time only.'),
    voz: {
      ofrece: [L('El que aguanta, gana. Siempre.', 'Whoever endures, wins. Always.'), L('Mi palo no se quiebra. El tuyo tampoco.', 'My club does not break. Neither will yours.')],
      aliado: L('Te di mi coraza. Veamos si la merecés.', 'I gave you my armor. Let us see if you earn it.'),
      ajeno: L('Sin mi amparo llegaste. Sin él te vas.', 'You came without my shelter. You leave without it.'),
      cae: L('Se quebró… el roble.', 'The oak… broke.'),
      pega: [L('Leña al que se arrima.', 'Firewood, if you come close.'), L('Acá mando yo.', 'I rule here.')],
      duele: L('¡Astillas nomás!', 'Splinters, that is all!'),
    },
  },
  D: {
    palo: 'D',
    nombre: L('El Rey de Oros', 'The King of Coins'),
    apodo: L('El Caudal', 'The Fortune'),
    carga: L('Fortuna', 'Fortune'),
    cargaDa: fillL(L('+1 de oro al ganar cada combate por punto (tope {t}).', '+1 gold on winning each fight per point (max {t}).'), { t: c.fortunaTope }),
    rasgo: L('Diezmo del Caudal', "Fortune's Tithe"),
    rasgoDesc: fillL(L('Cada Contraataque te cobra {d} de oro, y cada moneda que te saca es +1 de Furia.', 'Each Counterattack takes {d} gold from you, and every coin he takes is +1 Fury.'), { d: r.D.diezmo }),
    segunda: L('Remate', 'Foreclosure'),
    segundaDesc: fillL(L('A media Vida: su Diezmo cobra ×{x}.', 'At half Health: his Tithe takes ×{x}.'), { x: r.D.remate }),
    voz: {
      ofrece: [L('Todo tiene precio. Yo te hago descuento.', 'Everything has a price. I give you a discount.'), L('La plata llama a la plata.', 'Money calls money.')],
      aliado: L('Invertí en vos. Hora de cobrar los intereses.', 'I invested in you. Time to collect the interest.'),
      ajeno: L('Ni una moneda mía tocaste. Venís pobre a morir.', 'Not one coin of mine you touched. You come poor to die.'),
      cae: L('Quedate… con el vuelto.', 'Keep… the change.'),
      pega: [L('Eso te lo cobro con interés.', 'I charge interest on that.'), L('Barato me salís.', 'You come cheap.')],
      duele: L('¡Mi bolsa, atorrante!', 'My purse, you rascal!'),
    },
  },
  H: {
    palo: 'H',
    nombre: L('El Rey de Copas', 'The King of Cups'),
    apodo: L('El Bacanal', 'The Reveler'),
    carga: L('Brindis', 'Toast'),
    cargaDa: fillL(L('+1 de Vida curada al ganar cada combate por punto (tope {t}).', '+1 Health healed on winning each fight per point (max {t}).'), { t: c.brindisTope }),
    rasgo: L('Brindis del Bacanal', "Reveler's Toast"),
    rasgoDesc: fillL(L('Se cura {c} por turno; lo que no le cabe se le vuelve Furia.', 'He heals {c} per turn; whatever overflows turns into Fury.'), { c: r.H.cura }),
    segunda: L('Última ronda', 'Last Round'),
    segundaDesc: L('A media Vida: lo que vos te curás, él también se lo cura.', 'At half Health: whatever you heal, he heals too.'),
    voz: {
      ofrece: [L('¡Otra ronda! Hoy invito yo.', 'Another round! Tonight is on me.'), L('Brindemos. Después vemos quién paga.', 'A toast. We will see who pays later.')],
      aliado: L('¡Bebiste de mi copa! Ahora bailamos.', 'You drank from my cup! Now we dance.'),
      ajeno: L('Rechazaste mi vino. Qué falta de modales.', 'You refused my wine. Such poor manners.'),
      cae: L('La última… y me voy.', 'One last… and I go.'),
      pega: [L('¡Salud! A la tuya, digo.', 'Cheers! To yours, I mean.'), L('Tomá, de la casa.', 'Here, on the house.')],
      duele: L('¡Me volcaste la copa!', 'You spilled my cup!'),
    },
  },
};

// ───────────────────────── Bendiciones ─────────────────────────

export type BendicionId =
  | 'deguello' | 'puntahacha' | 'primerasangre'
  | 'empalizada' | 'contragolpe' | 'paloypalo'
  | 'interes' | 'pesofuerte' | 'tabacargada'
  | 'coparebosante' | 'sangreporsangre' | 'otraronda'
  | 'hojabroquel' | 'filodorado' | 'sangria' | 'peaje' | 'rescoldo' | 'convite';

export interface BendicionDef {
  id: BendicionId;
  rey: Palo;
  /** Pacto Dual: el segundo Rey. Solo se ofrece si ya llevás un don de cada uno. */
  dual?: Palo;
  nombre: L;
  /** Niveles (los Pactos Duales tienen uno solo). */
  niveles: number;
  /** El texto del efecto en un nivel (1…niveles). */
  desc: (nivel: number) => L;
}

const b = B.bendiciones;
const lv = (a: readonly number[], n: number) => a[Math.min(a.length, Math.max(1, n)) - 1];

const lista: BendicionDef[] = [
  // Espadas · El Caudillo: filo, ejecuciones, críticos
  { id: 'deguello', rey: 'S', nombre: L('Degüello', 'Throat-Cut'), niveles: 3, desc: (n) => fillL(L('El enemigo que queda con {p} % de Vida o menos, cae.', 'An enemy left at {p}% Health or less goes down.'), { p: pct(lv(b.deguello, n)) }) },
  { id: 'puntahacha', rey: 'S', nombre: L('Punta y hacha', 'Point and Axe'), niveles: 3, desc: (n) => fillL(L('Uno de cada {k} golpes es Crítico: ×2 de Multi.', 'One in every {k} hits is a Critical: ×2 Mult.'), { k: lv(b.puntahacha, n) }) },
  { id: 'primerasangre', rey: 'S', nombre: L('Primera sangre', 'First Blood'), niveles: 3, desc: (n) => fillL(L('+{d} de Daño en tu primer golpe contra cada enemigo.', '+{d} Damage on your first hit against each enemy.'), { d: lv(b.primerasangre, n) }) },
  // Bastos · El Cacique: escudo persistente, contragolpes
  { id: 'empalizada', rey: 'C', nombre: L('Empalizada', 'Palisade'), niveles: 3, desc: (n) => fillL(L('Cada carta de Bastos da +{e} de Escudo más.', 'Each Clubs card gives +{e} more Shield.'), { e: lv(b.empalizada, n) }) },
  { id: 'contragolpe', rey: 'C', nombre: L('Contragolpe', 'Riposte'), niveles: 3, desc: (n) => fillL(L('Si tu Escudo frena la mitad o más de un Contraataque, devuelve lo frenado ×{d}, más tu Coraza.', 'If your Shield blocks half or more of a Counterattack, it returns what it blocked ×{d}, plus your Armor.'), { d: lv(b.contragolpe, n) }) },
  { id: 'paloypalo', rey: 'C', nombre: L('Palo y palo', 'Blow for Blow'), niveles: 3, desc: (n) => fillL(L('+{d} de Daño por cada 2 de Escudo que tengas.', '+{d} Damage for every 2 Shield you hold.'), { d: lv(b.paloypalo, n) }) },
  // Oros · El Caudal: multiplicadores por oro, interés, dados
  { id: 'interes', rey: 'D', nombre: L('Interés compuesto', 'Compound Interest'), niveles: 3, desc: (n) => fillL(L('Al ganar un combate: +1 de oro por cada {k} que tengas (tope {t}).', 'On winning a fight: +1 gold for every {k} you hold (max {t}).'), { k: lv(b.interes.cada, n), t: lv(b.interes.tope, n) }) },
  { id: 'pesofuerte', rey: 'D', nombre: L('Peso fuerte', 'Hard Coin'), niveles: 3, desc: (n) => fillL(L('+1 de Multi por cada {k} de oro en tu bolsa (tope +{t}).', '+1 Mult for every {k} gold in your purse (max +{t}).'), { k: lv(b.pesofuerte.cada, n), t: b.pesofuerte.tope }) },
  { id: 'tabacargada', rey: 'D', nombre: L('Taba cargada', 'Loaded Die'), niveles: 3, desc: (n) => fillL(L('Cada turno tirás un dado: tu golpe suma {k} × el dado de Daño.', 'Each turn you roll a die: your hit adds {k} × the die in Damage.'), { k: lv(b.tabacargada, n) }) },
  // Copas · El Bacanal: sobrecuración vuelta Multi, pactos de sangre
  { id: 'coparebosante', rey: 'H', nombre: L('Copa rebosante', 'Brimming Cup'), niveles: 3, desc: (n) => fillL(L('Cada {k} de curación que no te cabe en un golpe: +1 de Multi a ese golpe.', 'Every {k} healing that overflows in a hit: +1 Mult to that hit.'), { k: lv(b.coparebosante, n) }) },
  { id: 'sangreporsangre', rey: 'H', nombre: L('Sangre por sangre', 'Blood for Blood'), niveles: 3, desc: (n) => fillL(L('Con tu Vida al 50 % o menos: +{m} de Multi.', 'With your Health at 50% or less: +{m} Mult.'), { m: lv(b.sangreporsangre, n) }) },
  { id: 'otraronda', rey: 'H', nombre: L('Otra ronda', 'Another Round'), niveles: 3, desc: (n) => fillL(L('Cada carta de Copas cura +{c} más.', 'Each Cups card heals +{c} more.'), { c: lv(b.otraronda, n) }) },
  // Pactos Duales
  { id: 'hojabroquel', rey: 'S', dual: 'C', nombre: L('Hoja y broquel', 'Blade and Buckler'), niveles: 1, desc: () => fillL(L('Cada Golpe exacto: +{e} de Escudo y +{f} de Filo.', 'Each Exact Hit: +{e} Shield and +{f} Edge.'), { e: b.hojabroquel.escudo, f: b.hojabroquel.filo }) },
  { id: 'filodorado', rey: 'S', dual: 'D', nombre: L('Filo dorado', 'Gilded Edge'), niveles: 1, desc: () => fillL(L('+1 de Daño por cada {k} de oro que tengas (tope +{t}).', '+1 Damage for every {k} gold you hold (max +{t}).'), { k: b.filodorado.cada, t: b.filodorado.tope }) },
  { id: 'sangria', rey: 'S', dual: 'H', nombre: L('Sangría', 'Bloodletting'), niveles: 1, desc: () => fillL(L('Cada enemigo abatido te cura {c}.', 'Each enemy you take down heals you {c}.'), { c: b.sangria }) },
  { id: 'peaje', rey: 'C', dual: 'D', nombre: L('Peaje', 'Toll'), niveles: 1, desc: () => fillL(L('Cada Contraataque que tu Escudo frena por la mitad o más: +{o} de oro.', 'Each Counterattack your Shield blocks by half or more: +{o} gold.'), { o: b.peaje }) },
  { id: 'rescoldo', rey: 'C', dual: 'H', nombre: L('Rescoldo', 'Embers'), niveles: 1, desc: () => fillL(L('Al ganar un combate, cada {k} de Escudo que te queda te cura 1.', 'On winning a fight, every {k} Shield you have left heals you 1.'), { k: b.rescoldo }) },
  { id: 'convite', rey: 'D', dual: 'H', nombre: L('Convite', 'Feast'), niveles: 1, desc: () => fillL(L('Al ganar un combate: +1 de Vida máxima por cada {k} de oro (tope +{t}).', 'On winning a fight: +1 max Health for every {k} gold (max +{t}).'), { k: b.convite.cada, t: b.convite.tope }) },
];

export const BENDICIONES: readonly BendicionId[] = lista.map((x) => x.id);
export const BENDICION = Object.fromEntries(lista.map((x) => [x.id, x])) as Record<BendicionId, BendicionDef>;
/** El valor de una Bendición con niveles, según el nivel que se lleva. */
export const nivelDe = lv;

/** Los Reyes a los que cuenta una Bendición (las Duales, a los dos). */
export const reyesDe = (id: BendicionId): Palo[] => (BENDICION[id].dual ? [BENDICION[id].rey, BENDICION[id].dual!] : [BENDICION[id].rey]);
