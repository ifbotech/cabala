// El Bufón: el único anfitrión del juego y un chanta de ley. Lleva un humor vivo (la Afinidad, de −3 a +3): si le
// seguís los trucos se pone de tu lado y te tira la buena; si lo despreciás se vuelve garca y le sopla tu juego al
// próximo Rey. En sus Cábalas (los nodos del Mapa) propone un truco: aceptarlo o rechazarlo mueve su humor, y cuando
// el truco se juega a la suerte, la moneda cae según cómo le caés. Todo es cuestión de Cábala.
import { AMULETO, AMULETOS } from './amuletos';
import type { AmuletoId } from './amuletos';
import { B, L, fillL } from './balance';
import { esComodin } from './cartas';
import { curar, pagarVidaMax, tieneAumento } from './estado';
import type { Botin, Partida } from './estado';
import { azar, elegir } from './rng';

export type Humor = 'garca' | 'torcido' | 'neutral' | 'compinche' | 'detulado';
export const HUMOR_NOMBRE: Record<Humor, L> = {
  garca: L('Garca', 'Crooked'),
  torcido: L('Torcido', 'Sour'),
  neutral: L('Ni fu ni fa', 'So-so'),
  compinche: L('Compinche', 'Chummy'),
  detulado: L('De tu lado', 'On your side'),
};
export function humorDe(afinidad: number): Humor {
  if (afinidad <= -2) return 'garca';
  if (afinidad === -1) return 'torcido';
  if (afinidad === 0) return 'neutral';
  if (afinidad === 1) return 'compinche';
  return 'detulado';
}

const k = B.bufon;

/** Mueve el humor del Bufón (con sus topes; con Chamuyo nunca baja de neutral). */
export function moverAfinidad(p: Partida, d: number): void {
  const min = tieneAumento(p, 'chamuyo') ? 0 : k.afinidadMin;
  p.afinidad = Math.max(min, Math.min(k.afinidadMax, p.afinidad + d));
}

/** La probabilidad de que un truco a la suerte te salga bien ahora. */
export function suerte(p: Partida): number {
  return Math.max(0.1, Math.min(0.9, k.suerteBase + k.suertePorAfinidad * p.afinidad + (p.altar.suerte ?? 0) * B.altar.suerte));
}

/** Lo que pasó al elegir. `botin` abre un «ELEGÍ UNA» (lo arma partida.ts con su `oferta`). */
export interface ResultadoCabala {
  texto: L;
  bueno: boolean;
  oferta?: 'bendicion' | 'aumento';
}

export interface OpcionCabala {
  id: string;
  texto: L;
  detalle: L;
  /** El detalle con las cifras del tramo en que estás (si las apuestas crecen con el tramo). */
  detalleEn?: (p: Partida) => L;
  /** Aceptar el truco sube el humor del Bufón; rechazarlo lo baja. */
  acepta: boolean;
  /** Se juega a la suerte (la moneda del Bufón). */
  aSuerte?: true;
  puede?: (p: Partida) => boolean;
  hacer: (p: Partida, sale: boolean) => ResultadoCabala;
}

export interface CabalaDef {
  id: string;
  humor: 'buena' | 'normal' | 'garca';
  titulo: L;
  /** Lo que dice el Bufón al proponer. */
  propone: L;
  opciones: OpcionCabala[];
}

const DESPECHO: L[] = [
  L('«Vos te lo perdés.»', '"Your loss."'),
  L('«Anotado. Tengo buena memoria para los desaires.»', '"Noted. I have a fine memory for slights."'),
  L('«Cobarde con suerte sigue siendo cobarde.»', '"A lucky coward is still a coward."'),
  L('«Después no vengas llorando al mostrador.»', '"Do not come crying to the counter later."'),
];
const nada = (texto: L): OpcionCabala => ({
  id: 'no',
  texto,
  detalle: L('El Bufón se ofende: su humor baja un punto.', "The Jester takes offense: his mood drops a point."),
  acepta: false,
  hacer: (p) => ({ texto: DESPECHO[Math.min(DESPECHO.length - 1, Math.max(0, 1 - p.afinidad))], bueno: false }),
});
/** Lo que se apuesta crece con el tramo: en el tercero nadie juega por monedas. */
const tramo = (p: Partida): number => Math.min(2, p.acto) + 1;
const porTramo = (f: (t: number) => L): { detalle: L; detalleEn: (p: Partida) => L } => ({ detalle: f(1), detalleEn: (p) => f(tramo(p)) });
/** El detalle de una opción tal como vale ahora. */
export const detalleDe = (o: OpcionCabala, p: Partida): L => o.detalleEn?.(p) ?? o.detalle;

/** Las cartas de número más bajo del Mazo (para quemarlas o pintarlas). */
function masBajas(p: Partida, n: number) {
  return p.mazo
    .filter((c) => !esComodin(c) && !c.marcada)
    .sort((a, b) => a.n - b.n)
    .slice(0, n);
}

/** Un Amuleto común o raro que no lleves. */
function amuletoSuelto(p: Partida): AmuletoId | null {
  const libres = AMULETOS.filter((id) => !p.amuletos.includes(id) && (AMULETO[id].rareza === 'comun' || AMULETO[id].rareza === 'raro'));
  return libres.length ? elegir(p, libres) : null;
}

export const CABALAS: readonly CabalaDef[] = [
  {
    id: 'moneda',
    humor: 'normal',
    titulo: L('Cara o cruz', 'Heads or Tails'),
    propone: L('Cara ganás vos, cruz gano yo. La moneda es mía, eso sí.', 'Heads you win, tails I win. The coin is mine, mind you.'),
    opciones: [
      {
        id: 'si',
        texto: L('Apostar oro', 'Bet gold'),
        ...porTramo((t) => fillL(L('Apostás {a} de oro. Sale bien: +{g}. Si no, los perdés.', 'You bet {a} gold. Goes well: +{g}. If not, you lose it.'), { a: k.moneda.apuesta * t, g: k.moneda.paga * t })),
        acepta: true,
        aSuerte: true,
        puede: (p) => p.oro >= k.moneda.apuesta * tramo(p),
        hacer: (p, sale) => {
          const a = k.moneda.apuesta * tramo(p);
          const g = k.moneda.paga * tramo(p);
          p.oro += sale ? g : -a;
          return sale ? { texto: fillL(L('¡Cara! +{g} de oro.', 'Heads! +{g} gold.'), { g }) , bueno: true } : { texto: fillL(L('Cruz. Chau {a} de oro.', 'Tails. Goodbye, {a} gold.'), { a }), bueno: false };
        },
      },
      nada(L('No juego', "I'm out")),
    ],
  },
  {
    id: 'tapada',
    humor: 'normal',
    titulo: L('La carta tapada', 'The Face-Down Card'),
    propone: L('Tres cartas boca abajo. Una vale oro, otra duele. Elegí… si te animás.', 'Three cards face down. One is worth gold, one hurts. Pick… if you dare.'),
    opciones: [
      {
        id: 'si',
        texto: L('Dar vuelta una', 'Flip one'),
        detalle: L('Si sale bien, un Amuleto. Si no, −8 de Vida.', 'If it goes well, an Amulet. If not, −8 Health.'),
        acepta: true,
        aSuerte: true,
        hacer: (p, sale) => {
          if (!sale) {
            p.vida = Math.max(1, p.vida - 8);
            return { texto: L('Era la que duele: −8 de Vida.', 'It was the one that hurts: −8 Health.'), bueno: false };
          }
          const id = p.amuletos.length < p.huecos ? amuletoSuelto(p) : null;
          if (!id) {
            p.oro += 14;
            return { texto: L('Debajo había oro: +14.', 'There was gold under it: +14.'), bueno: true };
          }
          p.amuletos.push(id);
          return { texto: fillL(L('Te llevás: {a}.', 'You take: {b}.'), { a: AMULETO[id].nombre.es, b: AMULETO[id].nombre.en }), bueno: true };
        },
      },
      nada(L('Paso', 'Pass')),
    ],
  },
  {
    id: 'sangre',
    humor: 'normal',
    titulo: L('Pacto de sangre', 'Blood Pact'),
    propone: L('Un cachito de tu sangre y te presento a un Rey. Negocio redondo.', 'A little of your blood and I introduce you to a King. Fair deal.'),
    opciones: [
      {
        id: 'si',
        texto: L('Firmar', 'Sign'),
        detalle: L('−6 de Vida máxima. Elegís una Bendición.', '−6 max Health. You choose a Blessing.'),
        acepta: true,
        hacer: (p) => {
          pagarVidaMax(p, 6);
          return { texto: L('Firmado. Un Rey te mira con interés.', 'Signed. A King eyes you with interest.'), bueno: true, oferta: 'bendicion' };
        },
      },
      nada(L('Ni loco', 'No way')),
    ],
  },
  {
    id: 'vale',
    humor: 'normal',
    titulo: L('El vale', 'The Marker'),
    propone: L('Te adelanto unos pesos. El próximo Rey… digamos que se va a enterar.', 'I front you some coin. The next King… let us say he will hear of it.'),
    opciones: [
      {
        id: 'si',
        texto: L('Tomar el vale', 'Take the marker'),
        detalle: L('+15 de oro ya. El próximo Rey arranca con +3 de Furia.', '+15 gold now. The next King starts with +3 Fury.'),
        acepta: true,
        hacer: (p) => {
          p.oro += 15;
          p.furiaRey += 3;
          return { texto: L('+15 de oro. Y un Rey con bronca.', '+15 gold. And one angry King.'), bueno: true };
        },
      },
      nada(L('Rechazar', 'Refuse')),
    ],
  },
  {
    id: 'quema',
    humor: 'normal',
    titulo: L('Naipes al fuego', 'Cards to the Fire'),
    propone: L('Dame tus dos peores cartas. Les hago un favor a las tres partes.', 'Hand me your two worst cards. I do all three of us a favor.'),
    opciones: [
      {
        id: 'si',
        texto: L('Entregarlas', 'Hand them over'),
        detalle: L('Tus 2 cartas más bajas salen del Mazo para siempre.', 'Your 2 lowest cards leave the deck for good.'),
        acepta: true,
        puede: (p) => p.mazo.length - 2 >= B.jugador.mazoMin,
        hacer: (p) => {
          const fuera = masBajas(p, 2);
          p.mazo = p.mazo.filter((c) => !fuera.includes(c));
          return { texto: L('Dos cartas menos. El Mazo respira.', 'Two cards fewer. The deck breathes.'), bueno: true };
        },
      },
      nada(L('Me las quedo', 'I keep them')),
    ],
  },
  {
    id: 'doble',
    humor: 'normal',
    titulo: L('Doble o nada', 'Double or Nothing'),
    propone: L('¿Toda la bolsa? Así me gusta. Bueno, casi nada: la mitad.', 'The whole purse? That is the spirit. Well, almost nothing: half.'),
    opciones: [
      {
        id: 'si',
        texto: L('Jugar la bolsa', 'Play the purse'),
        ...porTramo((t) => fillL(L('Si sale bien, duplicás tu oro (tope +{t}). Si no, perdés la mitad.', 'If it goes well, you double your gold (max +{t}). If not, you lose half.'), { t: k.dobleTope * t })),
        acepta: true,
        aSuerte: true,
        puede: (p) => p.oro >= 6,
        hacer: (p, sale) => {
          if (sale) {
            const n = Math.min(k.dobleTope * tramo(p), p.oro);
            p.oro += n;
            return { texto: fillL(L('¡Doble! +{n} de oro.', 'Double! +{n} gold.'), { n }), bueno: true };
          }
          const n = Math.ceil(p.oro / 2);
          p.oro -= n;
          return { texto: fillL(L('Nada. −{n} de oro.', 'Nothing. −{n} gold.'), { n }), bueno: false };
        },
      },
      nada(L('Guardar la bolsa', 'Keep the purse')),
    ],
  },
  {
    id: 'pintado',
    humor: 'normal',
    titulo: L('El naipe pintado', 'The Painted Card'),
    propone: L('Dejame retocarte una carta. Va a quedar… irreconocible.', 'Let me touch up one of your cards. It will come out… unrecognizable.'),
    opciones: [
      {
        id: 'si',
        texto: L('Pagar 6 de Vida', 'Pay 6 Health'),
        detalle: L('Tu carta más baja se vuelve Comodín.', 'Your lowest card becomes a Joker.'),
        acepta: true,
        puede: (p) => p.vida > 6,
        hacer: (p) => {
          const [c] = masBajas(p, 1);
          p.vida -= 6;
          if (c) {
            c.palo = 'X';
            c.n = 0;
          }
          return { texto: L('Un Comodín nuevo en tu Mazo.', 'A fresh Joker in your deck.'), bueno: true };
        },
      },
      nada(L('Dejala así', 'Leave it be')),
    ],
  },
  {
    id: 'soplo',
    humor: 'normal',
    titulo: L('El soplo', 'The Tip-Off'),
    propone: L('Sé dónde duerme el próximo Rey. Por unas monedas, alguien le afloja la montura.', 'I know where the next King sleeps. For a few coins, someone loosens his saddle.'),
    opciones: [
      {
        id: 'si',
        texto: L('Pagar la trampa', 'Pay for the trap'),
        ...porTramo((t) => fillL(L('Pagás {o} de oro. Sale bien: el Rey llega con {v} % menos de Vida. Si no: +{f} de Furia.', 'Pay {o} gold. Goes well: the King arrives with {v}% less Health. If not: +{f} Fury.'), { o: k.soplo.oro * t, v: Math.round(k.soplo.vida * 100), f: k.soplo.furia })),
        acepta: true,
        aSuerte: true,
        puede: (p) => p.oro >= k.soplo.oro * tramo(p),
        hacer: (p, sale) => {
          p.oro -= k.soplo.oro * tramo(p);
          if (sale) {
            p.reyHerido = k.soplo.vida;
            return { texto: L('Hecho. El Rey va a llegar rengo.', 'Done. The King will arrive limping.'), bueno: true };
          }
          p.furiaRey += k.soplo.furia;
          return { texto: fillL(L('Le cobré a los dos. El Rey ya sabe: +{f} de Furia.', 'I charged you both. The King knows: +{f} Fury.'), { f: k.soplo.furia }), bueno: false };
        },
      },
      nada(L('No me meto', 'I stay out')),
    ],
  },
  {
    id: 'robo',
    humor: 'normal',
    titulo: L('Mano larga', 'Sticky Fingers'),
    propone: L('La Corte guarda sus mejores naipes en un cajón sin llave. Yo distraigo, vos metés la mano.', 'The Court keeps its best cards in an unlocked drawer. I distract, you reach in.'),
    opciones: [
      {
        id: 'si',
        texto: L('Robarle a la Corte', 'Rob the Court'),
        ...porTramo((t) => fillL(L('Sale bien: un 9 Templado (+{t} de Daño, +1 de Multi) a tu Mazo. Si no: −{v} de Vida.', 'Goes well: a Tempered 9 (+{t} Damage, +1 Mult) to your deck. If not: −{v} Health.'), { t: k.robo.temple, v: k.robo.vida * t })),
        acepta: true,
        aSuerte: true,
        puede: (p) => p.vida > k.robo.vida * tramo(p),
        hacer: (p, sale) => {
          if (!sale) {
            const v = k.robo.vida * tramo(p);
            p.vida = Math.max(1, p.vida - v);
            return { texto: fillL(L('Te vieron. −{v} de Vida y el cajón, con llave.', 'They saw you. −{v} Health, and the drawer is locked now.'), { v }), bueno: false };
          }
          const palo = elegir(p, ['S', 'C', 'D', 'H'] as const);
          p.robadas = (p.robadas ?? 0) + 1;
          p.mazo.push({ id: `R${palo}${p.robadas}`, palo, n: 9, temple: k.robo.temple, templada: true });
          return { texto: L('Un 9 al rojo, de la Corte a tu Mazo.', 'A red-hot 9, from the Court to your deck.'), bueno: true };
        },
      },
      nada(L('Las manos quietas', 'Hands to myself')),
    ],
  },
  {
    id: 'aciegas',
    humor: 'normal',
    titulo: L('Firmar a ciegas', 'Sign It Blind'),
    propone: L('Un papelito, una firmita. ¿Leerlo? Qué desconfiado. Firmá y después vemos.', 'A little paper, a little signature. Read it? So distrustful. Sign and we shall see.'),
    opciones: [
      {
        id: 'si',
        texto: L('Firmar sin leer', 'Sign unread'),
        detalle: fillL(L('Sale bien: una Cábala gratis. Si no: perdés un Amuleto al azar (sin Amuletos, −{v} de Vida máxima).', 'Goes well: a free Cábala. If not: you lose a random Amulet (with none, −{v} max Health).'), { v: k.aciegas.vida }),
        acepta: true,
        aSuerte: true,
        hacer: (p, sale) => {
          if (sale) return { texto: L('Letra chica a tu favor, por una vez.', 'Fine print in your favor, for once.'), bueno: true, oferta: 'aumento' };
          if (p.amuletos.length) {
            const id = elegir(p, p.amuletos);
            p.amuletos = p.amuletos.filter((x) => x !== id);
            return { texto: fillL(L('La letra chica decía: «{a}, para el Bufón».', 'The fine print said: "{b}, for the Jester".'), { a: AMULETO[id].nombre.es, b: AMULETO[id].nombre.en }), bueno: false };
          }
          pagarVidaMax(p, k.aciegas.vida);
          return { texto: fillL(L('La letra chica decía: −{v} de Vida máxima.', 'The fine print said: −{v} max Health.'), { v: k.aciegas.vida }), bueno: false };
        },
      },
      nada(L('Primero lo leo', 'I read it first')),
    ],
  },
  {
    id: 'buena',
    humor: 'buena',
    titulo: L('Te tiro la buena', 'I Deal You the Good One'),
    propone: L('Hoy estoy de tu lado, compadre. No te acostumbres.', 'Tonight I am on your side, friend. Do not get used to it.'),
    opciones: [
      {
        id: 'vida',
        texto: L('+18 de Vida', '+18 Health'),
        detalle: L('Un trago que cura.', 'A drink that heals.'),
        acepta: true,
        hacer: (p) => {
          curar(p, 18);
          return { texto: L('+18 de Vida. Salud.', '+18 Health. Cheers.'), bueno: true };
        },
      },
      {
        id: 'oro',
        texto: L('+12 de oro', '+12 gold'),
        detalle: L('De la caja de otro.', "From someone else's till."),
        acepta: true,
        hacer: (p) => {
          p.oro += 12;
          return { texto: L('+12 de oro. No preguntes de dónde.', '+12 gold. Do not ask where from.'), bueno: true };
        },
      },
    ],
  },
  {
    id: 'regalo',
    humor: 'buena',
    titulo: L('Invita la casa', 'On the House'),
    propone: L('Elegí una Cábala. Invita la casa… que no es mía.', 'Pick a Cábala. On the house… which is not mine.'),
    opciones: [
      {
        id: 'si',
        texto: L('Elegir una Cábala', 'Pick a Cábala'),
        detalle: L('Un Aumento del Bufón, gratis.', "A Jester's Augment, free."),
        acepta: true,
        hacer: () => ({ texto: L('Elegí bien.', 'Choose well.'), bueno: true, oferta: 'aumento' }),
      },
      nada(L('Otro día', 'Another day')),
    ],
  },
  {
    id: 'trampa',
    humor: 'garca',
    titulo: L('La apuesta trampa', 'The Rigged Bet'),
    propone: L('Fácil: adiviná dónde está la bolita. Los Reyes ya apostaron en tu contra.', 'Easy: guess where the pea is. The Kings already bet against you.'),
    opciones: [
      {
        id: 'si',
        texto: L('Apostar 8 de Vida', 'Bet 8 Health'),
        detalle: L('Si sale bien, +20 de oro. Si no, −8 de Vida. La moneda está cargada.', 'If it goes well, +20 gold. If not, −8 Health. The coin is loaded.'),
        acepta: true,
        aSuerte: true,
        puede: (p) => p.vida > 8,
        hacer: (p, sale) => {
          if (sale) {
            p.oro += 20;
            return { texto: L('Contra todo: +20 de oro.', 'Against the odds: +20 gold.'), bueno: true };
          }
          p.vida -= 8;
          return { texto: L('La bolita nunca estuvo: −8 de Vida.', 'The pea was never there: −8 Health.'), bueno: false };
        },
      },
      nada(L('Rechazar', 'Refuse')),
    ],
  },
];
export const CABALA = Object.fromEntries(CABALAS.map((c) => [c.id, c])) as Record<string, CabalaDef>;

/** La Cábala que propone el Bufón en este nodo, según su humor. */
export function sortearCabala(p: Partida): CabalaDef {
  const de = (h: CabalaDef['humor']) => CABALAS.filter((c) => c.humor === h);
  if (p.afinidad >= 2 && azar(p) < 0.6) return elegir(p, de('buena'));
  if (p.afinidad <= -2 && azar(p) < 0.6) return elegir(p, de('garca'));
  let libres = de('normal').filter((c) => !p.cabalasVistas.includes(c.id));
  if (!libres.length) {
    p.cabalasVistas = [];
    libres = de('normal');
  }
  const c = elegir(p, libres);
  p.cabalasVistas.push(c.id);
  return c;
}

/**
 * Resuelve una opción de la Cábala: tira la suerte si hace falta, mueve el humor del Bufón y, si lo rechazaste estando
 * ya garca, le sopla tu juego al próximo Rey.
 */
export function resolverCabala(p: Partida, def: CabalaDef, opcion: OpcionCabala): ResultadoCabala {
  // la apuesta trampa va con la moneda cargada: la suerte de siempre, a la mitad
  const prob = suerte(p) * (def.humor === 'garca' ? 0.5 : 1);
  const sale = opcion.aSuerte ? azar(p) < prob : true;
  const r = opcion.hacer(p, sale);
  if (opcion.acepta) moverAfinidad(p, 1);
  else {
    moverAfinidad(p, -1);
    if (p.afinidad <= -2) {
      p.furiaRey += k.furiaGarca;
      return { ...r, texto: fillL(L('{t} Y le sopla tu juego al próximo Rey: +{f} de Furia.', '{u} And he tips off the next King: +{f} Fury.'), { t: r.texto.es, u: r.texto.en, f: k.furiaGarca }) };
    }
  }
  return r;
}

export type { Botin };
