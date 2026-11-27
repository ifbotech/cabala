// El sonido: sintetizado con WebAudio, sin archivos. (0.29) La paleta de efectos se rehízo entera con el MISMO
// material que la música: ya no hay pitidos de onda cuadrada. Cada cosa que pasa en la mesa suena a algo de la
// pulpería:
//   · madera        el clic de un botón, el paso en el Mapa, el naipe de Bastos, lo que no se puede (dos tocs sordos)
//   · naipe         la carta sobre el paño (un soplo corto y sordo con su golpecito)
//   · cuerda        nylon pulsado con su filtro que se apaga: los aciertos, el conteo del golpe, los cantos
//   · bordona       la cuerda grave: lo que cierra (el remate chico, la llegada de un Rey)
//   · parche        el bombo: los impactos (golpe, golpazo, contragolpe, la caída, el Rey que se planta)
//   · campanita     campana chica por el filtro del bus: el oro, las monedas (en arpegio, nunca una por una), el vidrio
//   · metal         hierro suave (dos parciales inarmónicos): el acero de Espadas, el candado, el Escudo que frena
//   · fuelle        el bandoneón: los premios largos (curarse, la victoria) y los lamentos (la derrota, la maldición)
//   · soplo         ruido filtrado con cuerpo: los tajos por palo, el fuego, lo que se esfuma
// Los efectos melódicos se escriben en peldaños de la tríada de premio del acorde que suena (`armoniaActual()`):
// siempre afinados, nunca una b5 ni una b9. Todos tienen ataque de 1 a 5 ms: informan antes de sonar lindo.
//
//   paleta ─▶ nivel del efecto ─▶ (paneo) ─▶ bus de efectos: pasabajos 5 kHz ─▶ campana −4 dB en 3,5 kHz ─┐
//   voces y stingers ────────────────────────────────────────────────────────────────────────────────────────┼▶ empuje ─┐
//   música ────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─▶ compresor ─▶ limitador ─▶ maestro ─▶ techo
//   sala (reverb) ─────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
// El nivel de cada efecto (`NIVEL_FX`) está CALIBRADO con la medición (`npm run qa:audio -- --calibrar`): cada uno
// queda 4–8 dB por encima de la música de la mesa en su momento, según su familia (`FAMILIA` y `SOBRE`).
import type { Palo } from '../rules/cartas';
import type { MazoId } from '../rules/mazos';
import { ajustes } from './almacen';
import { crearBus } from './musica/bus';
import { ondasDe, type Ondas } from './musica/ondas';
import * as T from './musica/teoria';

/** Un soplo de ruido filtrado: `corte` en Hz (y `hasta`, si barre), `cuerpo`: cuánto del mismo ruido pasa además por un pasabajos de 300 Hz. */
interface Soplo {
  dur: number;
  vol: number;
  filtro: BiquadFilterType;
  corte: number;
  hasta?: number;
  q?: number;
  cuerpo?: number;
}

/** Los instrumentos de la paleta, ya puestos sobre un contexto, una salida, una hora y un acorde. Los tiempos son relativos al arranque. */
interface Kit {
  /** El palo (la segunda cara y el Rey que se planta). */
  palo: Palo;
  /** Cuántos peldaños sube este disparo (las monedas y los Escudos del ¡CHINCHÓN! suben uno por carta). */
  sube: number;
  /** La altura pedida (los que cambian de carácter con ella, como el total que se revela). */
  altura: number;
  /** La nota del peldaño `i` de la tríada de premio del acorde, con la tónica desde `piso`; y el grado `n` de la escala del compás. */
  p(i: number, piso: number): number;
  e(n: number, piso: number): number;
  madera(t: number, hz: number, vol?: number, cae?: number): void;
  naipe(t: number, vol?: number): void;
  cuerda(t: number, midi: number, vol?: number, cae?: number): void;
  bordona(t: number, midi: number, vol?: number, cae?: number): void;
  parche(t: number, hz: number, vol?: number, cae?: number, maza?: number): void;
  campanita(t: number, midi: number, vol?: number, cae?: number): void;
  metal(t: number, hz: number, vol?: number, cae?: number): void;
  fuelle(t: number, midi: number, vol: number, dura: number, o?: { cents?: number; hacia?: number }): void;
  soplo(t: number, s: Soplo): void;
  gota(t: number, desde: number, hasta: number, vol: number, dur: number): void;
}

const SONIDO = {
  // la interfaz: madera y naipe
  clic: (k) => k.madera(0, 640, 0.8, 0.03),
  carta: (k) => {
    k.naipe(0, 1);
    k.madera(0.004, 340, 0.25, 0.03);
  },
  suelta: (k) => {
    k.naipe(0, 0.8);
    k.madera(0.01, 220, 0.35, 0.05);
  },
  error: (k) => {
    k.madera(0, 175, 1, 0.07);
    k.madera(0.085, 131, 1, 0.09);
  },
  paso: (k) => {
    k.madera(0, 200, 0.9, 0.05);
    k.madera(0.05, 262, 0.7, 0.05);
  },
  brota: (k) => k.cuerda(0, k.p(1, 62), 0.8, 0.12),
  ficha: (k) => {
    k.madera(0, 520, 0.6, 0.03);
    k.campanita(0.01, k.p(3, 57), 0.6, 0.12);
  },
  // el paño (0.21): la Chispa del Comodín chisporrotea (tres brasas y un brillo); el Escalón sube cuatro notas; un
  // Chiche se usa con un toc de vidrio y madera; la Prenda vuela con tres campanitas que suben
  chispa: (k) => {
    for (const [t, hz] of [[0, 1900], [0.03, 2300], [0.07, 1700]] as const) k.soplo(t, { dur: 0.016, vol: 0.9, filtro: 'bandpass', corte: hz, q: 3 });
    k.campanita(0.02, k.p(4, 57), 0.5, 0.14);
  },
  escalon: (k) => [0, 1, 2, 3].forEach((i) => k.cuerda(i * 0.05, k.p(i, 57), 0.7 + i * 0.1, i === 3 ? 0.3 : 0.12)),
  chiche: (k) => {
    k.campanita(0, k.p(3, 57), 0.7, 0.14);
    k.madera(0.03, 330, 0.8, 0.06);
  },
  prenda: (k) => [1, 2, 3].forEach((i, n) => k.campanita(n * 0.04, k.p(i, 60), 0.7, n === 2 ? 0.2 : 0.08)),
  // (0.22) cada Chiche suena a lo suyo: la Ginebra, el vidrio y el trago que baja; el Dado, el traqueteo en el
  // cubilete; el Fósforo, el raspón y la llama que sube; la Tiza, un roce sordo; el Poroto, un salto de suerte
  'ch-ginebra': (k) => {
    k.campanita(0, k.p(4, 57), 0.6, 0.1);
    k.campanita(0.03, k.p(5, 57), 0.5, 0.12);
    k.gota(0.08, 392, 294, 0.8, 0.07);
    k.gota(0.15, 330, 220, 0.7, 0.09);
  },
  'ch-dado': (k) => {
    [900, 700, 1050, 620, 820].forEach((hz, n) => k.madera(n * 0.024, hz, 0.6, 0.018));
    k.soplo(0, { dur: 0.1, vol: 0.4, filtro: 'bandpass', corte: 1600, q: 1.2 });
    k.madera(0.13, 400, 1, 0.06);
  },
  'ch-fosforo': (k) => {
    k.soplo(0, { dur: 0.07, vol: 0.9, filtro: 'bandpass', corte: 2200, hasta: 1300, q: 1.2 });
    k.soplo(0.05, { dur: 0.2, vol: 0.6, filtro: 'bandpass', corte: 500, hasta: 1500, q: 0.8, cuerpo: 0.5 });
  },
  'ch-tiza': (k) => {
    k.soplo(0, { dur: 0.08, vol: 0.7, filtro: 'bandpass', corte: 1500, q: 0.6 });
    k.madera(0.02, 240, 0.7, 0.06);
  },
  'ch-poroto': (k) => {
    k.cuerda(0, k.p(0, 57), 0.8, 0.1);
    k.cuerda(0.05, k.p(3, 57), 0.8, 0.1);
    k.campanita(0.1, k.p(5, 57), 0.7, 0.22);
  },
  // la Evolución: el Amuleto despierta (un arpegio de cuerda que sube y se queda vibrando arriba); la Forja Brava:
  // dos martillazos sobre el yunque
  evolucion: (k) => {
    [0, 1, 2, 3, 4, 5].forEach((i) => k.cuerda(i * 0.055, k.p(i, 50), 0.7 + i * 0.05, 0.14));
    k.campanita(0.33, k.p(6, 50), 0.9, 0.6);
  },
  forja: (k) => {
    k.parche(0, 78, 1, 0.2, 0.8);
    k.metal(0, 720, 0.6, 0.12);
    k.soplo(0, { dur: 0.05, vol: 0.6, filtro: 'bandpass', corte: 1200, q: 0.7 });
    k.parche(0.1, 104, 0.8, 0.18, 0.6);
    k.metal(0.1, 880, 0.5, 0.2);
  },
  // (0.23) el Tesoro: el candado que cede (dos clacs de hierro), la tapa que cruje y el brillo que sube de adentro;
  // la Cábala Negra cose: cinco puntadas cortas y el nudo que tira
  tesoro: (k) => {
    k.metal(0, 520, 0.8, 0.05);
    k.metal(0.04, 400, 0.8, 0.06);
    k.soplo(0.09, { dur: 0.12, vol: 0.5, filtro: 'bandpass', corte: 320, hasta: 520, q: 5 });
    [3, 4, 5].forEach((i, n) => k.campanita(0.2 + n * 0.05, k.p(i, 57), 0.6 + n * 0.1, n === 2 ? 0.5 : 0.1));
  },
  coser: (k) => {
    [5, 4, 5, 4, 5].forEach((i, n) => k.cuerda(n * 0.022, k.p(i, 57), 0.5, 0.03));
    k.bordona(0.12, k.p(0, 45), 0.9, 0.2);
    k.cuerda(0.2, k.p(2, 57), 0.8, 0.35);
  },
  // el golpe: el parche, el toc de la madera y el transitorio de ruido (la capa de cada palo va aparte)
  golpe: (k) => {
    k.parche(0, 92, 1, 0.16, 0.8);
    k.madera(0, 250, 0.5, 0.05);
    k.soplo(0, { dur: 0.03, vol: 0.9, filtro: 'bandpass', corte: 1500, q: 0.7 });
  },
  fuerte: (k) => {
    k.parche(0, 66, 1, 0.34, 1);
    k.parche(0.005, 132, 0.6, 0.12, 0.4);
    k.soplo(0, { dur: 0.04, vol: 1, filtro: 'bandpass', corte: 1200, q: 0.6 });
    k.soplo(0, { dur: 0.2, vol: 0.6, filtro: 'lowpass', corte: 500, hasta: 120 });
  },
  // (0.27) el remate del golpe chico: cuando tu número ya se posó, un toc seco de madera y la bordona que cierra en la tónica
  remateChico: (k) => {
    k.madera(0, 420, 0.8, 0.035);
    k.bordona(0.03, k.p(0, 38), 0.9, 0.16);
  },
  // (0.27) ¡CHINCHÓN! corta la mano: cada carta que te quedó paga su Escudo con una campanita, un peldaño más arriba cada una
  corta: (k) => {
    k.madera(0, 560, 0.4, 0.02);
    k.campanita(0.005, k.p(1 + Math.min(k.sube, 7), 52), 0.8, 0.14);
  },
  exacto: (k) => {
    k.cuerda(0, k.p(0, 62), 0.8, 0.12);
    k.cuerda(0.055, k.p(2, 62), 0.85, 0.12);
    k.campanita(0.11, k.p(3, 62), 0.9, 0.3);
  },
  canto: (k) => {
    [0, 1, 2].forEach((i) => k.cuerda(i * 0.06, k.p(i, 57), 0.8, 0.14));
    k.campanita(0.18, k.p(3, 57), 0.9, 0.35);
  },
  // el golpe que recibís: sordo y hondo, sin brillo (0.28: +2,6 dB; medido, quedaba por debajo de la música)
  contra: (k) => {
    k.parche(0, 84, 1, 0.24, 1);
    k.madera(0, 170, 0.6, 0.07);
    k.soplo(0, { dur: 0.05, vol: 0.9, filtro: 'bandpass', corte: 800, q: 0.8 });
    k.soplo(0, { dur: 0.16, vol: 0.5, filtro: 'lowpass', corte: 400 });
  },
  // el Escudo frena: madera contra hierro
  frena: (k) => {
    k.madera(0, 480, 0.9, 0.05);
    k.metal(0.002, 610, 0.5, 0.09);
    k.soplo(0, { dur: 0.04, vol: 0.4, filtro: 'bandpass', corte: 2000, q: 3 });
  },
  quiebreEscudo: (k) => {
    k.metal(0, 820, 0.85, 0.14);
    k.metal(0.035, 520, 0.7, 0.12);
    k.soplo(0, { dur: 0.11, vol: 0.8, filtro: 'bandpass', corte: 2600, hasta: 900, q: 1.8 });
  },
  // el oro: dos campanitas, la quinta y la tónica de arriba
  oro: (k) => {
    k.campanita(0, k.p(2, 60), 0.8, 0.1);
    k.campanita(0.06, k.p(3, 60), 0.9, 0.28);
  },
  // curarse: el fuelle sube por la tríada y se queda
  cura: (k) => {
    k.fuelle(0, k.p(0, 57), 0.7, 0.07);
    k.fuelle(0.07, k.p(1, 57), 0.75, 0.07);
    k.fuelle(0.14, k.p(2, 57), 0.85, 0.22);
  },
  cae: (k) => {
    k.madera(0, 300, 0.8, 0.05);
    k.madera(0.055, 200, 0.8, 0.06);
    k.parche(0.12, 82, 1, 0.22, 0.7);
    k.soplo(0, { dur: 0.14, vol: 0.5, filtro: 'bandpass', corte: 1600, hasta: 700, q: 0.9 });
  },
  // la irrupción del Rey: tres bordonas que SUBEN por la tríada (llega), con el fuelle una octava arriba
  rey: (k) => {
    [0, 1, 2].forEach((i, n) => {
      k.bordona(n * 0.2, k.p(i, 33), 1, n === 2 ? 0.6 : 0.3);
      k.fuelle(n * 0.2, k.p(i, 45), 0.35, n === 2 ? 0.34 : 0.17);
    });
    k.parche(0, 60, 0.7, 0.3, 0.6);
  },
  // el Bufón: se esfuma (un soplo que cae) y reaparece (su cascabel: tres campanitas que suben)
  puf: (k) => {
    k.soplo(0, { dur: 0.16, vol: 0.8, filtro: 'bandpass', corte: 900, hasta: 240, q: 1.1, cuerpo: 0.4 });
    k.gota(0, 260, 120, 0.5, 0.12);
  },
  bufon: (k) => [2, 3, 4].forEach((i, n) => k.campanita(n * 0.045, k.p(i, 57), 0.7 + n * 0.1, n === 2 ? 0.22 : 0.07)),
  // el Mapa y el Fogón: el soplo del fuego, el suspenso (siete grados de la escala que suben), la ceniza
  fuego: (k) => {
    k.soplo(0, { dur: 0.22, vol: 0.8, filtro: 'lowpass', corte: 300, hasta: 900 });
    k.soplo(0.03, { dur: 0.14, vol: 0.5, filtro: 'bandpass', corte: 600, hasta: 1300, q: 1 });
  },
  suspenso: (k) => [0, 1, 2, 3, 4, 5, 6].forEach((n) => k.bordona(n * 0.09, k.e(n, 45), 0.55 + n * 0.07, 0.14)),
  // (0.24) la tercera pasada: el fuego que sube y sube (un rugido grave que trepa y la cuerda que se apura arriba)
  forjaSube: (k) => {
    k.soplo(0, { dur: 1.1, vol: 0.6, filtro: 'lowpass', corte: 200, hasta: 800 });
    k.gota(0, 60, 120, 0.7, 1.1);
    let t = 0.45;
    [0, 1, 2, 3, 4, 5, 6].forEach((n) => {
      k.cuerda(t, k.e(n, 57), 0.5 + n * 0.07, 0.1);
      t += 0.12 - n * 0.012;
    });
    k.campanita(t, k.p(3, 57), 0.9, 0.3);
  },
  ceniza: (k) => {
    k.soplo(0, { dur: 0.32, vol: 0.8, filtro: 'bandpass', corte: 1200, hasta: 280, q: 0.9, cuerpo: 0.5 });
    k.fuelle(0, k.p(2, 45), 0.5, 0.12, { cents: -200 });
    k.parche(0.14, 60, 0.9, 0.3, 0.5);
  },
  victoria: (k) => {
    [0, 1, 2, 3].forEach((i) => k.cuerda(i * 0.1, k.p(i, 57), 0.8, 0.2));
    k.campanita(0.4, k.p(4, 57), 0.9, 0.6);
    k.fuelle(0.4, k.p(0, 57), 0.4, 0.4);
    k.fuelle(0.4, k.p(2, 57), 0.4, 0.4);
  },
  derrota: (k) => [3, 2, 1, 0].forEach((i, n) => k.fuelle(n * 0.16, k.p(i, 50), 0.8, n === 3 ? 0.42 : 0.15)),
  // «¡AL PELO!»: un roce y la risita del Bufón, tres «je» de fuelle que bajan
  alpelo: (k) => {
    k.soplo(0, { dur: 0.1, vol: 0.5, filtro: 'bandpass', corte: 2000, hasta: 1400, q: 3 });
    [5, 4, 3].forEach((i, n) => k.fuelle(0.03 + n * 0.055, k.p(i, 57), 0.7, 0.03));
  },
  // el Tajo de revés del Caudillo: dos filos que se cruzan (soplo con cuerpo y hierro) y un golpe seco abajo
  deguello: (k) => {
    k.soplo(0, { dur: 0.16, vol: 0.9, filtro: 'bandpass', corte: 1200, hasta: 3600, q: 2.5, cuerpo: 0.3 });
    k.metal(0, 940, 0.4, 0.14);
    k.soplo(0.12, { dur: 0.16, vol: 0.9, filtro: 'bandpass', corte: 3600, hasta: 1200, q: 2.5, cuerpo: 0.3 });
    k.metal(0.12, 1080, 0.4, 0.14);
    k.parche(0.2, 58, 1, 0.3, 1);
    k.soplo(0.2, { dur: 0.22, vol: 0.7, filtro: 'lowpass', corte: 600, hasta: 90 });
  },
  // la caída del Rey: un tronco que se parte, hondo, distinto de su llegada (que sube): este BAJA y se apaga
  remate: (k) => {
    k.madera(0, 196, 1, 0.07);
    k.soplo(0, { dur: 0.06, vol: 1, filtro: 'bandpass', corte: 2000, q: 0.7 });
    k.parche(0.06, 147, 0.9, 0.12, 0.6);
    k.parche(0.15, 110, 0.9, 0.16, 0.6);
    k.parche(0.27, 62, 1, 0.6, 1);
    k.soplo(0, { dur: 0.7, vol: 0.7, filtro: 'lowpass', corte: 900, hasta: 60 });
    k.soplo(0.16, { dur: 0.05, vol: 0.5, filtro: 'bandpass', corte: 2200, q: 5 });
    k.soplo(0.27, { dur: 0.05, vol: 0.45, filtro: 'bandpass', corte: 1700, q: 5 });
  },
  // Fortín, Remate y Última ronda: el Rey hace lo suyo
  fortin: (k) => {
    k.parche(0, 120, 0.9, 0.1, 0.8);
    k.madera(0, 300, 0.8, 0.06);
    k.metal(0.03, 500, 0.5, 0.16);
    k.soplo(0, { dur: 0.08, vol: 0.4, filtro: 'bandpass', corte: 1800, q: 4 });
  },
  diezmo: (k) => [5, 4, 3, 2].forEach((i, n) => k.campanita(n * 0.05, k.p(i, 57), 0.7, n === 3 ? 0.2 : 0.07)),
  brindis: (k) => {
    k.campanita(0, k.p(4, 57), 0.7, 0.2);
    k.campanita(0.012, k.p(2, 57), 0.6, 0.2);
    k.gota(0.1, 330, 250, 0.6, 0.09);
    k.gota(0.19, 290, 210, 0.6, 0.12);
  },
  // la mesa se despeja (la interfaz de combate se va): un soplo que baja
  despeja: (k) => {
    k.soplo(0, { dur: 0.32, vol: 0.7, filtro: 'bandpass', corte: 1700, hasta: 300, q: 1.2, cuerpo: 0.3 });
    k.gota(0, 330, 140, 0.3, 0.14);
  },
  // el oro que cuenta en el HUD: las monedas NO suenan una por una; `sonar` las agrupa en un arpegio corto (ver `monedas`)
  tintin: (k) => k.campanita(0, k.p(Math.min(k.sube, 6), 57), 0.75, 0.16),
  // una Cábala del Bufón que se estampa (Cara de Póker, Seña Falsa): el sello seco y su cascabel, que se ríe
  mascara: (k) => {
    k.parche(0, 150, 1, 0.07, 1);
    k.soplo(0, { dur: 0.05, vol: 0.6, filtro: 'lowpass', corte: 900 });
    [4, 3, 5].forEach((i, n) => k.campanita(0.05 + n * 0.04, k.p(i, 57), 0.6, n === 2 ? 0.18 : 0.06));
  },
  // el naipe del Rey que se raja antes de partirse: un crujido seco y corto
  grieta: (k) => {
    k.soplo(0, { dur: 0.07, vol: 0.9, filtro: 'bandpass', corte: 1900, hasta: 900, q: 1.5 });
    k.madera(0, 420, 0.5, 0.03);
    k.parche(0.02, 95, 0.6, 0.07, 0.5);
  },
  // (0.25) la maldición de una Evolución cobra: un golpe seco y hondo y el fuelle que se cae desafinando
  maldicion: (k) => {
    k.parche(0, 82, 1, 0.1, 1);
    k.fuelle(0.04, k.p(1, 57), 0.6, 0.16, { cents: -160 });
    k.fuelle(0.04, k.p(0, 45), 0.5, 0.2, { cents: -60 });
  },
  // el total de la cuenta que se revela: un sello hondo y el acorde rasgueado que lo corona (con su campana si el golpe abate)
  revela: (k) => {
    k.parche(0, 98, 1, 0.14, 0.9);
    k.soplo(0, { dur: 0.05, vol: 0.7, filtro: 'bandpass', corte: 1300, q: 0.8 });
    [0, 1, 2].forEach((i, n) => k.cuerda(0.05 + n * 0.016, k.p(i, 50), 0.7, 0.3));
    if (k.altura >= 1) k.campanita(0.1, k.p(3, 57), 0.8, 0.4);
  },
  // el Crítico que estalla en su término del MULTI: un hachazo seco y dos campanitas que suben
  critico: (k) => {
    k.parche(0, 140, 1, 0.07, 1);
    k.soplo(0, { dur: 0.06, vol: 0.7, filtro: 'bandpass', corte: 1800, q: 1.2 });
    k.campanita(0.04, k.p(2, 60), 0.7, 0.1);
    k.campanita(0.09, k.p(3, 60), 0.8, 0.25);
  },
  // la capa de cada palo sobre el golpe (0.19): el acero de Espadas canta, el palo de Bastos suena a madera, el Oro
  // tintinea (tres campanitas en arpegio) y la Copa salpica. Soplos con cuerpo, por debajo de 2,5 kHz
  paloS: (k) => {
    k.soplo(0, { dur: 0.12, vol: 0.8, filtro: 'bandpass', corte: 2400, hasta: 1300, q: 3, cuerpo: 0.25 });
    k.metal(0, 1040, 0.5, 0.2);
  },
  paloC: (k) => {
    k.madera(0, 196, 1, 0.06);
    k.parche(0, 128, 0.5, 0.08, 0.6);
    k.soplo(0, { dur: 0.06, vol: 0.5, filtro: 'lowpass', corte: 600 });
  },
  paloD: (k) => [2, 3, 4].forEach((i, n) => k.campanita(n * 0.035, k.p(i, 57), 0.7, n === 2 ? 0.2 : 0.06)),
  paloH: (k) => {
    k.gota(0, 400, 640, 0.7, 0.07);
    k.soplo(0.02, { dur: 0.18, vol: 0.6, filtro: 'bandpass', corte: 900, hasta: 2000, q: 1.4, cuerpo: 0.3 });
  },
  /**
   * La segunda cara de un Rey: el acorde de la tonalidad que se va (Re menor) se sostiene y se TUERCE hacia arriba
   * hasta la que viene (Mi menor), desafinándose en el camino, con un soplo que sube y un parche hondo. (0.29) Antes
   * cada palo tenía su raíz (Oros sonaba Fa menor y Copas Do menor sobre Re menor); ahora los cuatro tuercen de Re a
   * Mi, que es lo que hace la música, y cada uno con el timbre y el registro de su Rey.
   */
  segunda: (k) => {
    const de = T.acordeDeGrado('i', T.TONICA);
    const piso = { S: 50, C: 38, D: 57, H: 53 }[k.palo as 'S'] ?? 50;
    [0, 1, 2].forEach((i, n) => k.fuelle(n * 0.025, T.notaPremio(de, piso, i), k.palo === 'C' ? 0.9 : 0.6, 0.72, { hacia: 2, cents: n % 2 ? 30 : -30 }));
    if (k.palo === 'D') [3, 4].forEach((i, n) => k.campanita(0.75 + n * 0.05, T.notaPremio(T.acordeDeGrado('i', T.TONICA_SEGUNDA), 57, i), 0.6, 0.3));
    if (k.palo === 'H') k.cuerda(0.75, T.notaPremio(T.acordeDeGrado('i', T.TONICA_SEGUNDA), 57, 2), 0.7, 0.4);
    k.parche(0.22, 82, 1, 0.5, 0.8);
    k.soplo(0, { dur: 0.8, vol: 0.5, filtro: 'bandpass', corte: 400, hasta: 2200, q: 1.5, cuerpo: 0.3 });
  },
  /**
   * (0.29) El Rey se planta: un golpe seco de parche (el tope contra el que choca tu número) y, abajo, el acorde grave
   * de SU motivo (`teoria.acordePlanta`: la tónica del acorde que suena y las notas de la cabeza de su motivo), en
   * bordonas, con la nota de arriba en el timbre de ese Rey (fuelle, grave, campana o cuerda). Seco: se apaga en 350 ms.
   */
  planta: (k) => {
    k.parche(0, 118, 1, 0.09, 1);
    k.madera(0, 300, 0.7, 0.04);
    k.soplo(0, { dur: 0.035, vol: 0.8, filtro: 'bandpass', corte: 900, q: 0.9 });
    const notas = k.acordeRey();
    notas.forEach((m, n) => k.bordona(0.012 + n * 0.012, m, 0.9 - n * 0.1, 0.34));
    const alta = notas[notas.length - 1];
    if (k.palo === 'S') k.fuelle(0.03, alta + 12, 0.5, 0.12);
    else if (k.palo === 'D') k.campanita(0.03, alta + 24, 0.5, 0.25);
    else if (k.palo === 'H') k.cuerda(0.03, alta + 12, 0.6, 0.3);
    else k.bordona(0.03, notas[0] - 12 < 28 ? notas[0] : notas[0] - 12, 0.7, 0.4);
  },
} satisfies Record<string, (k: Kit & { acordeRey(): number[] }) => void>;

export type Sonido = keyof typeof SONIDO;

/** La familia de cada efecto: de ella sale cuántos dB tiene que quedar por encima de la música de la mesa. */
export type Familia = 'golpe' | 'premio' | 'aviso' | 'mesa';
export const SOBRE: Record<Familia, number> = { golpe: 6.5, premio: 5.5, aviso: 5, mesa: 4.5 };
const GOLPES: Sonido[] = ['golpe', 'fuerte', 'contra', 'remate', 'cae', 'deguello', 'planta', 'segunda', 'forja', 'rey', 'revela', 'critico', 'maldicion', 'fortin'];
const PREMIOS: Sonido[] = ['exacto', 'canto', 'oro', 'cura', 'victoria', 'evolucion', 'tesoro', 'escalon', 'prenda', 'ch-poroto', 'bufon', 'tintin', 'corta', 'paloD', 'diezmo', 'brindis', 'derrota', 'mascara', 'alpelo'];
const MESA: Sonido[] = ['clic', 'carta', 'suelta', 'paso', 'brota', 'ficha', 'despeja', 'fuego', 'puf', 'chispa'];
export const familiaDe = (s: Sonido): Familia => (GOLPES.includes(s) ? 'golpe' : PREMIOS.includes(s) ? 'premio' : MESA.includes(s) ? 'mesa' : 'aviso');

/**
 * El nivel de cada efecto, calibrado con `npm run qa:audio -- --calibrar` (que imprime esta tabla): con estos números
 * cada efecto queda `SOBRE[familia]` dB por encima de la música de la mesa (tramo 2) en su momento.
 */
export const NIVEL_FX: Record<Sonido, number> = {
  clic: 0.239, carta: 0.316, suelta: 0.327, error: 0.155, paso: 0.182, brota: 0.13, ficha: 0.175, chispa: 0.245, escalon: 0.128, chiche: 0.136, prenda: 0.168, 'ch-ginebra': 0.209, 'ch-dado': 0.239, 'ch-fosforo': 0.706, 'ch-tiza': 0.229, 'ch-poroto': 0.158, evolucion: 0.127, forja: 0.111, tesoro: 0.19, coser: 0.141, golpe: 0.17, fuerte: 0.12, remateChico: 0.123, corta: 0.146, exacto: 0.132, canto: 0.135, contra: 0.155, frena: 0.186, quiebreEscudo: 0.153, oro: 0.193, cura: 0.118, cae: 0.144, rey: 0.182, puf: 0.305, bufon: 0.218, fuego: 0.698, suspenso: 0.16, forjaSube: 0.192, ceniza: 0.113, victoria: 0.146, derrota: 0.119, alpelo: 0.176, deguello: 0.242, remate: 0.118, fortin: 0.17, diezmo: 0.281, brindis: 0.281, despeja: 0.327, tintin: 0.215, mascara: 0.168, grieta: 0.18, maldicion: 0.118, revela: 0.094, critico: 0.144, paloS: 0.371, paloC: 0.089, paloD: 0.25, paloH: 0.206, segunda: 0.152, planta: 0.114,
};
/** El nivel de las notas del conteo del golpe (`nota`). */
export const NIVEL_CONTEO = 0.12;
/** Dónde suena cada efecto en el estéreo (los que no figuran, al centro): la mesa a un lado, el oro al otro. */
const PAN_FX: Partial<Record<Sonido, number>> = { carta: -0.15, suelta: -0.15, oro: 0.2, tintin: 0.2, paloD: 0.15, paloS: -0.12, bufon: -0.35, puf: -0.35, rey: 0.3, planta: 0.3, segunda: 0.3, fortin: 0.3, diezmo: 0.3, brindis: 0.3, deguello: 0.2 };

/** Cuánto se corre la altura de cada disparo, en semitonos (arriba o abajo): que nada suene a loop. Solo lo que no es melódico. */
const VARIA: Partial<Record<Sonido, number>> = { paloS: 1, paloC: 1, paloH: 1, golpe: 2, fuerte: 1.5, contra: 1.5, carta: 1, suelta: 1, clic: 0.5, frena: 0.8, cae: 1, puf: 1, paso: 1, grieta: 1, error: 0.4 };
const VARIA_BASE = 0.3;
/** Los efectos que suben un peldaño por disparo: cuánta `altura` vale un peldaño (así lo pide la mesa). */
const ESCALON: Partial<Record<Sonido, number>> = { corta: 0.06, tintin: 0.035 };

// ───────────── el cableado ─────────────

let ctx: AudioContext | null = null;
let busEfectos: GainNode | null = null;
let busFx: GainNode | null = null;
let busMusica: GainNode | null = null;
let busSala: GainNode | null = null;
let ruidoBlanco: AudioBuffer | null = null;
const alAbrir: (() => void)[] = [];

/** Crea el contexto y los buses la primera vez (después, siempre los mismos). */
function abrirContexto(): AudioContext {
  if (ctx) return ctx;
  const c = new AudioContext();
  // (0.28) el bus maestro: compresor suave, limitador, techo de −1 dBFS y la sala (ver musica/bus.ts)
  const bus = crearBus(c);
  busEfectos = bus.efectos;
  busEfectos.gain.value = ajustes.sonido ? 1 : 0;
  busFx = bus.fx;
  busMusica = bus.musica;
  busSala = bus.sala;
  // el ruido blanco, uno solo para todos: cada disparo lo lee desde un punto distinto
  ruidoBlanco = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = ruidoBlanco.getChannelData(0);
  for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
  ctx = c;
  return c;
}

/** El audio, si ya está abierto y andando (lo usa la música). */
export const contextoAudio = (): AudioContext | null => (ctx && ctx.state === 'running' ? ctx : null);
/** El bus de la música (con su compresor y la ganancia maestra), si el audio ya está abierto. */
export const salidaMusica = (): AudioNode | null => busMusica;
/** (0.28) El bus de los efectos (por acá cantan las voces y suenan los stingers) y el envío a la sala. */
export const salidaEfectos = (): AudioNode | null => busEfectos;
export const salidaSala = (): AudioNode | null => busSala;
/** Avisa cuando el navegador deja abrir el audio (con el primer gesto). */
export const alAbrirAudio = (f: () => void): void => void alAbrir.push(f);
/** Cuántos sonidos se pidieron (para la QA, que no oye). */
export const sonados: Sonido[] = [];

/** Al cambiar el ajuste de sonido: el bus de efectos se abre o se cierra (con un fundido corto, sin chasquido). */
export function refrescarSonido(): void {
  if (!ctx || !busEfectos) return;
  const t = ctx.currentTime;
  busEfectos.gain.cancelScheduledValues(t);
  busEfectos.gain.setTargetAtTime(ajustes.sonido ? 1 : 0, t, 0.03);
}

/**
 * La música se agacha (unos 6 dB) mientras dura un hitstop y vuelve sola: el golpe se oye solo un instante.
 */
export function agacharMusica(ms: number, db = -6): void {
  if (!ctx || !busMusica || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  const g = busMusica.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(10 ** (db / 20), t + 0.02);
  g.setValueAtTime(10 ** (db / 20), t + ms / 1000);
  g.linearRampToValueAtTime(1, t + ms / 1000 + 0.25);
}

/**
 * (0.28) Abre el audio si hay algo que oír: los efectos O la música (antes, con los efectos apagados, la música no
 * sonaba nunca). Hay que llamarlo dentro de un gesto del jugador (el primero, o el clic que prende la música en Ajustes).
 */
export function despertarAudio(): void {
  if (!ajustes.sonido && !ajustes.musica) return;
  try {
    const c = abrirContexto();
    const listo = (): void => alAbrir.forEach((f) => f());
    if (c.state === 'suspended') void c.resume().then(listo);
    else listo();
  } catch {
    // sin audio: el juego sigue en silencio
  }
}

/**
 * Abre el audio con el primer gesto del jugador (un clic o una tecla, en la portada). Abrir el dispositivo de sonido
 * cuesta más de 100 ms la primera vez: hacerlo al tocar el primer sonido dejaba un tirón en mitad del primer golpe.
 */
export function prepararAudio(): void {
  const abrir = (): void => {
    removeEventListener('pointerdown', abrir, true);
    removeEventListener('keydown', abrir, true);
    despertarAudio();
  };
  addEventListener('pointerdown', abrir, true);
  addEventListener('keydown', abrir, true);
}

/** El contexto, si se puede sonar ya (sonido prendido y el navegador dejó abrir el audio). */
function listo(): AudioContext | null {
  if (!ajustes.sonido) return null;
  try {
    const c = abrirContexto();
    if (c.state === 'suspended') void c.resume();
    return c;
  } catch {
    return null;
  }
}

// ───────────── los instrumentos de la paleta ─────────────

/** Arma los instrumentos sobre un contexto y una salida. `fuentes` junta lo que suena, para soltar la salida al terminar. */
function armarKit(c: BaseAudioContext, a: AudioNode, w: Ondas, ruido: AudioBuffer | null, t0: number, ac: T.Acorde, o: { alt: number; corre: number; sube: number; altura: number; palo: Palo }, fuentes: { n: AudioScheduledSourceNode; fin: number }[]): Kit & { acordeRey(): number[] } {
  /** Una envolvente pulsada (ataque y caída sola); devuelve cuándo termina. */
  const pulso = (g: AudioParam, t: number, vol: number, ataque: number, cae: number): number => {
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(vol, t + ataque);
    g.setTargetAtTime(0, t + ataque, cae / 5);
    return t + ataque + cae * 1.4;
  };
  const osc = (t: number, fin: number, f: number, tipo: OscillatorType | PeriodicWave, a2: AudioNode, hasta?: number, en = 0.012, cents = 0): OscillatorNode => {
    const x = c.createOscillator();
    if (typeof tipo === 'string') x.type = tipo as OscillatorType;
    else x.setPeriodicWave(tipo);
    x.frequency.setValueAtTime(f, t);
    if (hasta) x.frequency.exponentialRampToValueAtTime(hasta, t + en);
    if (cents) x.detune.setValueAtTime(cents, t);
    x.connect(a2);
    x.start(t);
    x.stop(fin);
    fuentes.push({ n: x, fin });
    return x;
  };
  const gan = (a2: AudioNode = a): GainNode => {
    const g = c.createGain();
    g.connect(a2);
    return g;
  };
  /** La pulsación: un pasabajos que arranca abierto y se cierra (la cuerda que se apaga). */
  const pulsa = (t: number, f: number, abre: number): BiquadFilterNode => {
    const fil = c.createBiquadFilter();
    fil.type = 'lowpass';
    fil.Q.value = 0.8;
    fil.frequency.setValueAtTime(Math.min(9000, f * abre), t);
    fil.frequency.setTargetAtTime(Math.max(380, f * 2.4), t + 0.004, 0.07);
    fil.connect(a);
    return fil;
  };
  const soplo = (tr: number, s: Soplo): void => {
    if (!ruido) return;
    const t = t0 + tr;
    const src = c.createBufferSource();
    src.buffer = ruido;
    src.playbackRate.value = o.alt;
    const fil = c.createBiquadFilter();
    fil.type = s.filtro;
    fil.frequency.setValueAtTime(s.corte * o.alt, t);
    if (s.hasta) fil.frequency.exponentialRampToValueAtTime(s.hasta * o.alt, t + s.dur);
    if (s.q) fil.Q.value = s.q;
    const g = gan();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(s.vol, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, t + s.dur);
    src.connect(fil).connect(g);
    if (s.cuerpo) {
      // el cuerpo: el mismo ruido por debajo de 300 Hz (un tajo con peso, no un silbido)
      const bajo = c.createBiquadFilter();
      bajo.type = 'lowpass';
      bajo.frequency.value = 300;
      const gb = gan(g);
      gb.gain.value = s.cuerpo * 3;
      src.connect(bajo).connect(gb);
    }
    const desde = Math.random() * Math.max(0, ruido.duration - s.dur - 0.05);
    src.start(t, desde, s.dur + 0.04);
    fuentes.push({ n: src, fin: t + s.dur + 0.04 });
  };
  const hz = (midi: number): number => T.hz(midi + o.corre);
  return {
    palo: o.palo,
    sube: o.sube,
    altura: o.altura,
    p: (i, piso) => T.notaPremio(ac, piso, i),
    e: (n, piso) => T.escalera(ac.escala, T.desde(ac.raiz, piso), T.desde(ac.raiz, piso) + 36)[n] ?? T.desde(ac.raiz, piso),
    acordeRey: () => T.acordePlanta(o.palo === 'S' || o.palo === 'C' || o.palo === 'D' || o.palo === 'H' ? o.palo : 'S', ac),
    madera(tr, f, vol = 1, cae = 0.04) {
      const t = t0 + tr;
      const g = gan();
      const fin = pulso(g.gain, t, vol, 0.001, cae);
      osc(t, fin, f * o.alt * 1.6, 'triangle', g, f * o.alt, 0.01);
      soplo(tr, { dur: Math.max(0.012, cae * 0.5), vol: vol * 0.5, filtro: 'bandpass', corte: Math.min(2200, f * 2.6), q: 2.2 });
    },
    naipe(tr, vol = 1) {
      const t = t0 + tr;
      soplo(tr, { dur: 0.05, vol, filtro: 'lowpass', corte: 1200, hasta: 450 });
      const g = gan();
      const fin = pulso(g.gain, t, vol * 0.5, 0.002, 0.045);
      osc(t, fin, 200 * o.alt, 'sine', g, 110 * o.alt, 0.04);
    },
    cuerda(tr, midi, vol = 1, cae = 0.4) {
      const t = t0 + tr;
      const f = hz(midi);
      const g = c.createGain();
      g.connect(pulsa(t, f, 9));
      osc(t, pulso(g.gain, t, vol, 0.003, cae), f, w.guitarra, g);
    },
    bordona(tr, midi, vol = 1, cae = 0.6) {
      const t = t0 + tr;
      const f = hz(midi);
      const g = c.createGain();
      g.connect(pulsa(t, f, 7));
      osc(t, pulso(g.gain, t, vol, 0.005, cae), f, w.grave, g);
    },
    parche(tr, f, vol = 1, cae = 0.2, maza = 0.5) {
      const t = t0 + tr;
      const g = gan();
      const fin = pulso(g.gain, t, vol, 0.004, cae);
      osc(t, fin, f * o.alt * 2.1, 'sine', g, f * o.alt, 0.08);
      if (maza) soplo(tr, { dur: 0.05, vol: vol * maza, filtro: 'lowpass', corte: 300 });
    },
    campanita(tr, midi, vol = 1, cae = 0.5) {
      const t = t0 + tr;
      const g = gan();
      osc(t, pulso(g.gain, t, vol * 0.8, 0.002, cae), hz(midi), w.campana, g);
    },
    metal(tr, f, vol = 1, cae = 0.15) {
      const t = t0 + tr;
      const g = gan();
      const fin = pulso(g.gain, t, vol * 0.6, 0.001, cae);
      osc(t, fin, f * o.alt, 'sine', g);
      const g2 = gan(g);
      g2.gain.value = 0.4;
      osc(t, fin, f * o.alt * 2.76, 'sine', g2);
    },
    fuelle(tr, midi, vol, dura, op = {}) {
      const t = t0 + tr;
      const f = hz(midi);
      const g = gan();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * 0.5, t + 0.018);
      g.gain.setTargetAtTime(0, t + Math.max(0.018, dura), 0.03);
      const fin = t + Math.max(0.018, dura) + 0.16;
      for (const cents of [0, 9]) {
        const x = osc(t, fin, f, w.fuelle, g, undefined, 0, cents);
        // se tuerce: sube `hacia` semitonos después de sostenerse (la segunda cara) o se cae desafinando (`cents`)
        if (op.hacia) {
          x.frequency.setValueAtTime(f, t + 0.22);
          x.frequency.exponentialRampToValueAtTime(f * 2 ** (op.hacia / 12), t + Math.max(0.3, dura));
          if (op.cents) {
            x.detune.setValueAtTime(cents, t + 0.22);
            x.detune.linearRampToValueAtTime(cents + op.cents, t + dura * 0.7);
            x.detune.linearRampToValueAtTime(cents, t + dura);
          }
        } else if (op.cents) x.detune.linearRampToValueAtTime(cents + op.cents, t + dura);
      }
    },
    soplo,
    gota(tr, desde, hasta, vol, dur) {
      const t = t0 + tr;
      const g = gan();
      const fin = pulso(g.gain, t, vol * 0.7, 0.004, dur);
      osc(t, fin, desde * o.alt, 'sine', g, hasta * o.alt, dur);
    },
  };
}

/** (0.28) La armonía que suena ahora (la pone musica.ts): los efectos melódicos se escriben sobre este acorde. */
let afinador: (() => T.Acorde | null) | null = null;
export const ponerAfinador = (f: () => T.Acorde | null): void => void (afinador = f);
/** Sin música ni reloj, los efectos suenan sobre la tónica (Re menor). */
const ACORDE_BASE = T.acordeDeGrado('i');

/**
 * Programa un sonido sobre un contexto y una salida cualesquiera (el juego usa `sonar`; la medición fuera de línea,
 * esto mismo sobre un `OfflineAudioContext`). `altura` corre lo que no es melódico (y, en semitonos enteros, el piso
 * de lo melódico); `acorde`: el acorde sobre el que se afina; `sube`: los peldaños que sube este disparo.
 */
export function sonarEn(c: BaseAudioContext, a: AudioNode, ruido: AudioBuffer | null, cual: Sonido, t0: number, o: { altura?: number; varia?: number; acorde?: T.Acorde | null; palo?: Palo; sube?: number; vol?: number } = {}): void {
  const altura = o.altura ?? 1;
  const paso = ESCALON[cual];
  const g = c.createGain();
  g.gain.value = NIVEL_FX[cual] * (o.vol ?? 1);
  let salida: AudioNode = g;
  const pan = PAN_FX[cual];
  if (pan) {
    const p = c.createStereoPanner();
    p.pan.value = pan;
    g.connect(p);
    salida = p;
  }
  salida.connect(a);
  const fuentes: { n: AudioScheduledSourceNode; fin: number }[] = [];
  const kit = armarKit(c, g, ondasDe(c), ruido, t0, o.acorde ?? ACORDE_BASE, {
    // lo que no es melódico se corre con la altura pedida y con la variación al azar; lo melódico, solo por octavas
    // enteras (0.29: en semitonos sueltos una altura de 0,85 bajaba el rasgueo una tercera menor y lo sacaba del acorde)
    alt: (paso ? 1 : altura) * 2 ** ((o.varia ?? 0) / 12),
    corre: paso ? 0 : 12 * Math.round(Math.log2(altura)),
    sube: o.sube ?? (paso ? Math.max(0, Math.round((altura - 1) / paso)) : 0),
    altura,
    palo: o.palo ?? 'S',
  }, fuentes);
  (SONIDO[cual] as (k: typeof kit) => void)(kit);
  // al terminar la última fuente, la salida de este disparo se suelta
  const ultima = fuentes.reduce<{ n: AudioScheduledSourceNode; fin: number } | null>((m, x) => (!m || x.fin > m.fin ? x : m), null);
  if (ultima) ultima.n.onended = () => salida.disconnect();
  else salida.disconnect();
}

/** (0.29) Quien quiera enterarse de cada sonido que se pide (la música cuelga de acá los stingers de la Forja Brava). */
let oyente: ((cual: Sonido) => void) | null = null;
export const ponerOyente = (f: (cual: Sonido) => void): void => void (oyente = f);

/** Las monedas que entran al HUD se agrupan: los `tintin` seguidos (menos de 450 ms entre uno y otro) son UN arpegio. */
const monedas = { t: -1, n: 0 };
/** De cada grupo de monedas suenan la primera y, después, una de cada dos (88 ms entre notas), a lo sumo seis notas. */
function peldanoMoneda(ahora: number): number | null {
  if (ahora - monedas.t > 0.45) monedas.n = 0;
  else monedas.n++;
  monedas.t = ahora;
  return monedas.n % 2 === 0 && monedas.n < 12 ? monedas.n / 2 : null;
}

/**
 * Toca un sonido. No hace nada si el sonido está apagado o el navegador todavía no dejó abrir el audio.
 * `retraso` (en segundos) lo encadena detrás de otro sin timers; `palo` tiñe la segunda cara y al Rey que se planta.
 */
export function sonar(cual: Sonido, o: { retraso?: number; palo?: Palo; altura?: number } = {}): void {
  sonados.push(cual);
  if (sonados.length > 60) sonados.shift();
  oyente?.(cual);
  const c = listo();
  if (!c || !busFx) return;
  try {
    const t0 = c.currentTime + (o.retraso ?? 0);
    let sube: number | undefined;
    if (cual === 'tintin') {
      const n = peldanoMoneda(t0);
      if (n === null) return;
      sube = n;
    }
    // la altura de este disparo: un corrimiento chico al azar (más grande en los golpes) y el que se pida; los
    // efectos melódicos no se corren al azar: se escriben sobre el acorde que suena
    sonarEn(c, busFx, ruidoBlanco, cual, t0, { altura: o.altura, varia: (Math.random() * 2 - 1) * (VARIA[cual] ?? VARIA_BASE), acorde: afinador?.() ?? null, palo: o.palo, sube });
  } catch {
    // sin audio: el juego sigue en silencio
  }
}

/** Quién habla: el Bufón, un Rey (por su palo) o el Personaje de un Mazo. */
export type VozId = 'bufon' | 'S' | 'C' | 'D' | 'H' | MazoId;

// (0.28) Las voces ya no son pitidos: cada personaje CANTA lo que dice (`cantar`, en musica.ts), con formantes por
// vocal, en su tesitura y sobre el acorde del compás (musica/teoria.ts y musica/canto.ts).
/** Quiénes hablaron (para la QA, que no oye). */
export const hablaron: VozId[] = [];

/** Una nota del conteo del golpe: cuerda pulsada, un grado más arriba cada paso. `larga` es la del total (con su campana). */
export function nota(semitono: number, larga = false): void {
  if (!ajustes.sonido || !ctx || ctx.state !== 'running' || !busFx) return;
  try {
    const c = ctx;
    const ac = afinador?.() ?? ACORDE_BASE;
    const g = c.createGain();
    g.gain.value = NIVEL_CONTEO;
    g.connect(busFx);
    const fuentes: { n: AudioScheduledSourceNode; fin: number }[] = [];
    const k = armarKit(c, g, ondasDe(c), ruidoBlanco, c.currentTime, ac, { alt: 1, corre: 0, sube: 0, altura: 1, palo: 'S' }, fuentes);
    const m = T.notaConteo(ac, semitono, larga);
    k.cuerda(0, m, larga ? 1 : 0.8, larga ? 0.3 : 0.09);
    // el total suena con su campana una octava arriba: cierra la cuenta
    if (larga && m + 12 <= 88) k.campanita(0.02, m + 12, 0.6, 0.3);
    fuentes[fuentes.length - 1].n.onended = () => g.disconnect();
  } catch {
    // sin audio: cuenta en silencio
  }
}
