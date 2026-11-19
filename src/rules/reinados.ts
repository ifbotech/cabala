// Los 8 Reinados: la dificultad. Ganar una partida abre el siguiente; cada uno suma su giro a todos los anteriores.
import { B, L, fillL, pct } from './balance';

const r = B.reinados;

export const REINADOS: readonly { n: number; nombre: L; giro: L }[] = [
  { n: 1, nombre: L('Noche mansa', 'Quiet Night'), giro: L('Las reglas de siempre.', 'The usual rules.') },
  { n: 2, nombre: L('Guardia doble', 'Double Guard'), giro: fillL(L('La Guardia tiene {p} % más de Vida.', 'The Guard has {p}% more Health.'), { p: pct(r.vidaGuardias) }) },
  { n: 3, nombre: L('Corte airada', 'Angry Court'), giro: fillL(L('Cada combate empieza con {n} de Furia.', 'Each fight starts with {n} Fury.'), { n: r.furiaInicial }) },
  { n: 4, nombre: L('Reyes acorazados', 'Armored Kings'), giro: fillL(L('Los Reyes tienen {p} % más de Vida.', 'Kings have {p}% more Health.'), { p: pct(r.vidaReyes) }) },
  { n: 5, nombre: L('Mano corta', 'Short Hand'), giro: fillL(L('{n} descarte menos por combate.', '{n} fewer discard per fight.'), { n: r.descartes }) },
  { n: 6, nombre: L('Heridas viejas', 'Old Wounds'), giro: fillL(L('Tu Vida máxima baja {n}.', 'Your max Health drops by {n}.'), { n: r.vidaMax }) },
  { n: 7, nombre: L('Guardia de noche', 'Night Watch'), giro: fillL(L('Toda la Corte pega +{n}.', 'The whole Court hits +{n} harder.'), { n: r.ataque }) },
  { n: 8, nombre: L('Medianoche', 'Midnight'), giro: fillL(L('Los Reyes arrancan con +{n} de Furia.', 'Kings start with +{n} Fury.'), { n: r.furiaReyes }) },
];
