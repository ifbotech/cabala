// El sonido: sintetizado con WebAudio, sin archivos. Tonos cortos de onda cuadrada y triangular con su envolvente
// (chiptune de pulpería) y, desde la 0.16, ruido filtrado para los golpes: cada cosa que pasa en la mesa suena a lo
// suyo. Todo pasa por dos buses (efectos y música) que se juntan en un compresor y una ganancia maestra: así un golpe
// fuerte encima de la música no satura, y la música se agacha un instante en cada hitstop.
//
//   efectos ─┐
//            ├─▶ compresor ─▶ limitador ─▶ maestro ─▶ techo ─▶ altavoces   (0.28: el bus vive en musica/bus.ts)
//   música  ─┘        ▲ sala (reverb)
import type { Palo } from '../rules/cartas';
import type { MazoId } from '../rules/mazos';
import { ajustes } from './almacen';
import { crearBus } from './musica/bus';

type Nota = [frecuencia: number, duracion: number, onda?: OscillatorType, volumen?: number, cae?: number];

/**
 * Las capas de ruido de cada sonido (el transitorio de un golpe, el silbido de un tajo): `filtro` y `corte` en Hz,
 * `hasta` si el corte barre hacia otra frecuencia, `retraso` desde el arranque del sonido.
 */
interface Ruido {
  dur: number;
  vol: number;
  filtro: BiquadFilterType;
  corte: number;
  hasta?: number;
  q?: number;
  retraso?: number;
}

const SONIDO = {
  clic: [[520, 0.04, 'square', 0.12]],
  // el paño (0.21): la Chispa del Comodín chisporrotea; el Escalón sube tres notas; un Chiche se usa con un toc de
  // vidrio y madera; la Prenda vuela con un tintineo que sube
  chispa: [[2349, 0.03, 'square', 0.07], [3136, 0.05, 'triangle', 0.07], [2637, 0.04, 'square', 0.05]],
  escalon: [[392, 0.05, 'square', 0.1], [523, 0.05, 'square', 0.1], [659, 0.05, 'square', 0.1], [784, 0.09, 'triangle', 0.12]],
  chiche: [[880, 0.03, 'triangle', 0.16], [330, 0.06, 'square', 0.12, 180]],
  // (0.22) cada Chiche suena a lo suyo: la Ginebra, el vidrio y el trago que baja; el Dado, el traqueteo en el cubilete;
  // el Fósforo, el raspón (en RUIDO) y la llama que sube; la Tiza, un roce sordo; el Poroto, un salto de suerte
  'ch-ginebra': [[1976, 0.03, 'triangle', 0.14], [2637, 0.05, 'triangle', 0.1], [392, 0.06, 'triangle', 0.14, 294], [330, 0.08, 'triangle', 0.12, 220]],
  'ch-dado': [[1200, 0.02, 'square', 0.08], [900, 0.02, 'square', 0.08], [1400, 0.02, 'square', 0.08], [700, 0.02, 'square', 0.08], [1100, 0.03, 'square', 0.1], [523, 0.08, 'triangle', 0.14]],
  'ch-fosforo': [[220, 0.04, 'sawtooth', 0.1, 440], [440, 0.08, 'triangle', 0.12, 880], [660, 0.1, 'triangle', 0.08]],
  'ch-tiza': [[260, 0.05, 'triangle', 0.12, 200], [196, 0.07, 'triangle', 0.1]],
  'ch-poroto': [[392, 0.04, 'square', 0.1, 784], [784, 0.04, 'square', 0.1], [1175, 0.09, 'triangle', 0.12]],
  // la Evolución: el Amuleto despierta (un arpegio que sube y se queda vibrando arriba); la Forja Brava: martillazo
  // grave y la chispa que salta
  evolucion: [[392, 0.06, 'square', 0.14], [523, 0.06, 'square', 0.14], [659, 0.06, 'square', 0.14], [784, 0.06, 'square', 0.14], [1047, 0.06, 'square', 0.15], [1319, 0.08, 'square', 0.15], [1568, 0.3, 'triangle', 0.18]],
  forja: [[98, 0.06, 'sawtooth', 0.26, 49], [1568, 0.03, 'square', 0.1], [2093, 0.05, 'triangle', 0.1], [131, 0.1, 'square', 0.2, 65], [1760, 0.12, 'triangle', 0.12]],
  // (0.23) el Tesoro: el candado que cede (dos clacs de hierro), la tapa que cruje y el brillo que sube de adentro;
  // la Cábala Negra cose: tres puntadas cortas y el nudo que tira
  tesoro: [[180, 0.03, 'square', 0.18, 120], [140, 0.04, 'square', 0.18, 90], [220, 0.1, 'sawtooth', 0.1, 330], [784, 0.05, 'square', 0.12], [1175, 0.05, 'square', 0.12], [1568, 0.05, 'square', 0.13], [2093, 0.24, 'triangle', 0.16]],
  coser: [[1760, 0.02, 'square', 0.07], [1397, 0.02, 'square', 0.07], [1760, 0.02, 'square', 0.07], [1397, 0.02, 'square', 0.07], [1760, 0.02, 'square', 0.07], [330, 0.08, 'triangle', 0.16, 494], [494, 0.18, 'triangle', 0.16]],
  prenda: [[784, 0.04, 'square', 0.1], [1047, 0.04, 'square', 0.1], [1568, 0.1, 'triangle', 0.12]],
  ficha: [[1175, 0.03, 'square', 0.08], [880, 0.05, 'triangle', 0.1]],
  carta: [[320, 0.03, 'triangle', 0.2], [480, 0.03, 'triangle', 0.14]],
  suelta: [[240, 0.05, 'triangle', 0.18]],
  // el golpe: el cuerpo grave (el ruido del impacto va en RUIDO)
  golpe: [[150, 0.07, 'square', 0.22, 60], [90, 0.1, 'sawtooth', 0.2, 40]],
  fuerte: [[110, 0.08, 'sawtooth', 0.26, 40], [70, 0.16, 'square', 0.24, 30], [220, 0.05, 'square', 0.12]],
  // (0.27) el remate del golpe chico: cuando tu número ya se posó, un toc seco de madera y una nota que cae y cierra
  // (corto y limpio: no pisa lo que viene, que es lo que te pegan)
  remateChico: [[294, 0.035, 'triangle', 0.2, 196], [147, 0.09, 'triangle', 0.18, 98]],
  // (0.27) ¡CHINCHÓN! corta la mano: cada carta que te quedó paga su Escudo con un toque de vidrio que sube
  corta: [[1175, 0.03, 'square', 0.08], [1568, 0.06, 'triangle', 0.1]],
  exacto: [[660, 0.06, 'square', 0.16], [880, 0.06, 'square', 0.16], [1320, 0.14, 'square', 0.16]],
  canto: [[523, 0.07, 'square', 0.16], [659, 0.07, 'square', 0.16], [784, 0.07, 'square', 0.16], [1047, 0.16, 'square', 0.16]],
  contra: [[200, 0.06, 'sawtooth', 0.24, 80], [120, 0.14, 'sawtooth', 0.22, 50]],
  frena: [[700, 0.04, 'square', 0.14], [500, 0.08, 'triangle', 0.18]],
  oro: [[988, 0.05, 'square', 0.12], [1319, 0.1, 'square', 0.12]],
  cura: [[440, 0.06, 'triangle', 0.2], [554, 0.06, 'triangle', 0.2], [659, 0.12, 'triangle', 0.2]],
  cae: [[300, 0.06, 'square', 0.18, 120], [180, 0.08, 'square', 0.18, 80], [90, 0.18, 'sawtooth', 0.2, 40]],
  // la irrupción del Rey: tres notas de sierra que SUBEN (llega)
  rey: [[98, 0.2, 'sawtooth', 0.22], [147, 0.2, 'sawtooth', 0.2], [196, 0.36, 'sawtooth', 0.2]],
  error: [[160, 0.08, 'square', 0.14], [120, 0.1, 'square', 0.14]],
  // el Bufón: se esfuma (un soplo que cae) y reaparece (su cascabel: tres notas que suben)
  puf: [[260, 0.05, 'sawtooth', 0.16, 120], [140, 0.1, 'sawtooth', 0.14, 50]],
  bufon: [[784, 0.045, 'square', 0.13], [1175, 0.045, 'square', 0.13], [1568, 0.1, 'triangle', 0.18]],
  // el Mapa: un paso; el Fogón: el soplo del fuego, el chisporroteo que sube y la ceniza
  paso: [[196, 0.04, 'triangle', 0.2], [262, 0.05, 'triangle', 0.16]],
  fuego: [[90, 0.16, 'sawtooth', 0.14, 240], [240, 0.12, 'sawtooth', 0.1, 520]],
  suspenso: [[220, 0.09, 'square', 0.08], [247, 0.09, 'square', 0.09], [277, 0.09, 'square', 0.1], [311, 0.09, 'square', 0.11], [349, 0.09, 'square', 0.12], [392, 0.09, 'square', 0.13], [440, 0.12, 'square', 0.14]],
  // (0.24) la tercera pasada: el fuego que sube y sube (un rugido grave que trepa y un tintineo que se apura arriba)
  forjaSube: [[82, 0.36, 'sawtooth', 0.12, 165], [165, 0.32, 'sawtooth', 0.13, 330], [330, 0.26, 'square', 0.1, 523], [523, 0.12, 'square', 0.09], [587, 0.1, 'square', 0.1], [659, 0.08, 'square', 0.11], [740, 0.07, 'square', 0.12], [831, 0.06, 'square', 0.13], [932, 0.05, 'square', 0.14], [1047, 0.12, 'triangle', 0.15]],
  ceniza: [[420, 0.07, 'sawtooth', 0.16, 160], [200, 0.12, 'sawtooth', 0.16, 70], [90, 0.3, 'sawtooth', 0.14, 40]],
  brota: [[660, 0.03, 'triangle', 0.1]],
  victoria: [[523, 0.1, 'square', 0.16], [659, 0.1, 'square', 0.16], [784, 0.1, 'square', 0.16], [1047, 0.1, 'square', 0.16], [1319, 0.3, 'square', 0.16]],
  derrota: [[392, 0.16, 'triangle', 0.22], [330, 0.16, 'triangle', 0.22], [262, 0.16, 'triangle', 0.22], [196, 0.4, 'triangle', 0.22]],
  // «¡AL PELO!»: un roce agudo (en RUIDO) y la risita del Bufón, tres «je» que bajan
  alpelo: [[1568, 0.03, 'square', 0.1], [1175, 0.05, 'square', 0.12], [1319, 0.05, 'square', 0.12], [1047, 0.05, 'square', 0.12], [1175, 0.09, 'triangle', 0.16]],
  // el Tajo de revés del Caudillo: dos filos que se cruzan (el silbido va en RUIDO) y un golpe seco abajo
  deguello: [[1760, 0.04, 'square', 0.12, 2400], [70, 0.14, 'square', 0.26, 34], [1865, 0.04, 'square', 0.12, 2600], [55, 0.2, 'sawtooth', 0.26, 30]],
  // la caída del Rey: un tronco que se parte, hondo, distinto de su llegada (que sube): este BAJA y se apaga
  remate: [[196, 0.07, 'sawtooth', 0.26, 98], [147, 0.1, 'square', 0.24, 55], [110, 0.14, 'sawtooth', 0.24, 41], [62, 0.5, 'triangle', 0.32, 31]],
  // Fortín, Remate y Última ronda: el Rey hace lo suyo
  fortin: [[392, 0.04, 'square', 0.12], [523, 0.08, 'square', 0.12, 500], [262, 0.12, 'triangle', 0.18]],
  diezmo: [[1319, 0.05, 'square', 0.1], [988, 0.05, 'square', 0.1], [784, 0.05, 'square', 0.1], [587, 0.1, 'triangle', 0.14]],
  brindis: [[330, 0.08, 'triangle', 0.18, 280], [294, 0.08, 'triangle', 0.18, 250], [262, 0.14, 'triangle', 0.18, 220]],
  // la mesa se despeja (la interfaz de combate se va): un soplo que baja
  despeja: [[330, 0.12, 'triangle', 0.08, 140]],
  // el oro que cuenta en el HUD (cada moneda que entra)
  tintin: [[1568, 0.03, 'square', 0.07], [2093, 0.05, 'triangle', 0.08]],
  // una Cábala del Bufón que se estampa (Cara de Póker, Seña Falsa): el sello seco y su cascabel, que se ríe
  mascara: [[180, 0.05, 'square', 0.2, 90], [1175, 0.04, 'square', 0.1], [988, 0.04, 'square', 0.1], [1319, 0.09, 'triangle', 0.14]],
  // el naipe del Rey que se raja antes de partirse: un crujido seco y corto
  grieta: [[420, 0.03, 'sawtooth', 0.12, 180], [95, 0.06, 'square', 0.14, 50]],
  // (0.25) la maldición de una Evolución cobra: un golpe seco y hondo y una nota agria que se cae
  maldicion: [[82, 0.05, 'square', 0.24, 41], [622, 0.05, 'square', 0.1, 466], [233, 0.14, 'sawtooth', 0.12, 110]],
  // el total de la cuenta que se revela: un sello hondo y el acorde que lo corona
  revela: [[98, 0.09, 'square', 0.24, 49], [523, 0.06, 'square', 0.12], [784, 0.08, 'square', 0.12], [1047, 0.22, 'triangle', 0.16]],
  // el Crítico que estalla en su término del MULTI: un hachazo seco y dos notas de oro que suben
  critico: [[140, 0.05, 'square', 0.22, 60], [1175, 0.05, 'square', 0.13], [1760, 0.12, 'square', 0.13]],
  // la capa de cada palo sobre el golpe (0.19): el acero de Espadas canta, el palo de Bastos suena a madera, el Oro
  // tintinea y la Copa salpica (su ruido va en RUIDO)
  paloS: [[2093, 0.05, 'square', 0.07, 1900], [2637, 0.1, 'triangle', 0.08]],
  paloC: [[196, 0.04, 'triangle', 0.22, 120], [131, 0.07, 'triangle', 0.2, 90]],
  paloD: [[1568, 0.035, 'square', 0.08], [2349, 0.06, 'triangle', 0.08], [1976, 0.08, 'triangle', 0.07]],
  paloH: [[392, 0.06, 'triangle', 0.12, 260]],
} satisfies Record<string, Nota[]>;

/** Las capas de ruido: el transitorio que hace que un golpe pegue y no suene a pitido. */
const RUIDO: Partial<Record<keyof typeof SONIDO | 'segunda', Ruido[]>> = {
  'ch-fosforo': [{ dur: 0.07, vol: 0.22, filtro: 'highpass', corte: 3000, hasta: 1200 }],
  'ch-tiza': [{ dur: 0.08, vol: 0.14, filtro: 'bandpass', corte: 2200, q: 0.6 }],
  'ch-dado': [{ dur: 0.1, vol: 0.12, filtro: 'bandpass', corte: 1600, q: 1.2 }],
  forja: [{ dur: 0.05, vol: 0.4, filtro: 'bandpass', corte: 1200, q: 0.7 }],
  golpe: [{ dur: 0.03, vol: 0.42, filtro: 'bandpass', corte: 1800, q: 0.7 }, { dur: 0.09, vol: 0.28, filtro: 'lowpass', corte: 700 }],
  fuerte: [{ dur: 0.04, vol: 0.5, filtro: 'bandpass', corte: 1400, q: 0.6 }, { dur: 0.2, vol: 0.34, filtro: 'lowpass', corte: 500, hasta: 120 }],
  remateChico: [{ dur: 0.025, vol: 0.2, filtro: 'bandpass', corte: 2400, q: 1.6 }],
  contra: [{ dur: 0.05, vol: 0.36, filtro: 'bandpass', corte: 900, q: 0.8 }, { dur: 0.16, vol: 0.2, filtro: 'lowpass', corte: 400 }],
  cae: [{ dur: 0.14, vol: 0.24, filtro: 'highpass', corte: 2400, hasta: 900 }],
  frena: [{ dur: 0.05, vol: 0.22, filtro: 'bandpass', corte: 3200, q: 3 }],
  alpelo: [{ dur: 0.11, vol: 0.26, filtro: 'bandpass', corte: 5200, hasta: 9000, q: 4 }],
  deguello: [
    { dur: 0.16, vol: 0.4, filtro: 'bandpass', corte: 2500, hasta: 9000, q: 2.5 },
    { dur: 0.16, vol: 0.4, filtro: 'bandpass', corte: 9000, hasta: 2500, q: 2.5, retraso: 0.12 },
    { dur: 0.22, vol: 0.32, filtro: 'lowpass', corte: 600, hasta: 90, retraso: 0.2 },
  ],
  remate: [
    { dur: 0.06, vol: 0.5, filtro: 'highpass', corte: 3000, q: 0.7 },
    { dur: 0.7, vol: 0.4, filtro: 'lowpass', corte: 900, hasta: 60 },
    { dur: 0.05, vol: 0.3, filtro: 'bandpass', corte: 4200, q: 6, retraso: 0.16 },
    { dur: 0.05, vol: 0.26, filtro: 'bandpass', corte: 3100, q: 6, retraso: 0.27 },
  ],
  fortin: [{ dur: 0.08, vol: 0.26, filtro: 'bandpass', corte: 2600, q: 5 }],
  despeja: [{ dur: 0.32, vol: 0.16, filtro: 'bandpass', corte: 1800, hasta: 300, q: 1.2 }],
  mascara: [{ dur: 0.05, vol: 0.3, filtro: 'lowpass', corte: 900 }],
  grieta: [{ dur: 0.07, vol: 0.32, filtro: 'highpass', corte: 2600, hasta: 1200 }],
  revela: [{ dur: 0.05, vol: 0.34, filtro: 'bandpass', corte: 1300, q: 0.8 }, { dur: 0.18, vol: 0.2, filtro: 'lowpass', corte: 500, hasta: 100 }],
  segunda: [{ dur: 0.8, vol: 0.26, filtro: 'bandpass', corte: 400, hasta: 3000, q: 1.5 }],
  critico: [{ dur: 0.06, vol: 0.34, filtro: 'bandpass', corte: 2200, q: 1.2 }],
  paloS: [{ dur: 0.12, vol: 0.18, filtro: 'bandpass', corte: 6000, hasta: 3500, q: 6 }],
  paloC: [{ dur: 0.06, vol: 0.26, filtro: 'lowpass', corte: 600 }],
  paloH: [{ dur: 0.18, vol: 0.2, filtro: 'bandpass', corte: 900, hasta: 2600, q: 1.4, retraso: 0.02 }],
};

export type Sonido = keyof typeof SONIDO | 'segunda';

/** Cuánto se corre la altura de cada disparo, en semitonos (arriba o abajo): que nada suene a loop. */
const VARIA: Partial<Record<Sonido, number>> = { paloS: 1, paloC: 1, paloD: 1, paloH: 1, golpe: 2, fuerte: 1.5, contra: 1.5, carta: 1, suelta: 1, clic: 0.5, oro: 0.6, tintin: 1.2, frena: 0.8, cae: 1, puf: 1, paso: 1 };
const VARIA_BASE = 0.3;

// ───────────── el cableado ─────────────

let ctx: AudioContext | null = null;
let busEfectos: GainNode | null = null;
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
 * Abre el audio con el primer gesto del jugador (un clic o una tecla, en la portada). Abrir el dispositivo de sonido
 * cuesta más de 100 ms la primera vez: hacerlo al tocar el primer sonido dejaba un tirón en mitad del primer golpe.
 */
export function prepararAudio(): void {
  const abrir = (): void => {
    removeEventListener('pointerdown', abrir, true);
    removeEventListener('keydown', abrir, true);
    if (!ajustes.sonido) return;
    try {
      const c = abrirContexto();
      const listo = (): void => alAbrir.forEach((f) => f());
      if (c.state === 'suspended') void c.resume().then(listo);
      else listo();
    } catch {
      // sin audio: el juego sigue en silencio
    }
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

/** Un tono con su envolvente, al bus de efectos. */
function tono(c: AudioContext, t: number, f: number, dur: number, onda: OscillatorType, vol: number, cae?: number, detune = 0): void {
  const osc = c.createOscillator();
  const gan = c.createGain();
  osc.type = onda;
  osc.frequency.setValueAtTime(f, t);
  if (detune) osc.detune.setValueAtTime(detune, t);
  if (cae) osc.frequency.exponentialRampToValueAtTime(cae, t + dur);
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.linearRampToValueAtTime(vol, t + 0.004);
  gan.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gan).connect(busEfectos!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Una ráfaga de ruido blanco filtrado (leída desde un punto al azar del mismo buffer). */
function soplo(c: AudioContext, t0: number, r: Ruido, altura = 1): void {
  if (!ruidoBlanco) return;
  const t = t0 + (r.retraso ?? 0);
  const src = c.createBufferSource();
  src.buffer = ruidoBlanco;
  src.playbackRate.value = altura;
  const fil = c.createBiquadFilter();
  fil.type = r.filtro;
  fil.frequency.setValueAtTime(r.corte * altura, t);
  if (r.hasta) fil.frequency.exponentialRampToValueAtTime(r.hasta * altura, t + r.dur);
  if (r.q) fil.Q.value = r.q;
  const gan = c.createGain();
  gan.gain.setValueAtTime(r.vol, t);
  gan.gain.exponentialRampToValueAtTime(0.001, t + r.dur);
  src.connect(fil).connect(gan).connect(busEfectos!);
  const desde = Math.random() * Math.max(0, ruidoBlanco.duration - r.dur - 0.05);
  src.start(t, desde, r.dur + 0.04);
}

// la segunda cara: un tinte por palo (la raíz del acorde y la onda)
const TINTE: Record<Palo, { raiz: number; onda: OscillatorType }> = {
  S: { raiz: 147, onda: 'sawtooth' },
  C: { raiz: 98, onda: 'square' },
  D: { raiz: 175, onda: 'square' },
  H: { raiz: 131, onda: 'triangle' },
};

/**
 * La segunda cara de un Rey: un acorde menor que se sostiene y se QUIEBRA hacia abajo (cae un tritono mientras se
 * desafina), con un soplo que sube y un golpe hondo. La irrupción sube; la caída se parte; esto se tuerce.
 */
function segundaCara(c: AudioContext, t: number, palo: Palo): void {
  const { raiz, onda } = TINTE[palo];
  [1, 1.189, 1.498, 2].forEach((k, i) => {
    const osc = c.createOscillator();
    const gan = c.createGain();
    osc.type = onda;
    const f = raiz * k;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.setValueAtTime(f, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(f / 1.414, t + 0.75);
    osc.detune.setValueAtTime(0, t + 0.22);
    osc.detune.linearRampToValueAtTime((i % 2 ? 1 : -1) * 35, t + 0.75);
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.linearRampToValueAtTime(onda === 'triangle' ? 0.16 : 0.07, t + 0.03);
    gan.gain.setValueAtTime(onda === 'triangle' ? 0.16 : 0.07, t + 0.3);
    gan.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
    osc.connect(gan).connect(busEfectos!);
    osc.start(t + i * 0.025);
    osc.stop(t + 1);
  });
  tono(c, t + 0.22, 82, 0.5, 'sine', 0.4, 36);
  for (const r of RUIDO.segunda ?? []) soplo(c, t, r);
}

/**
 * Toca un sonido. No hace nada si el sonido está apagado o el navegador todavía no dejó abrir el audio.
 * `retraso` (en segundos) lo encadena detrás de otro sin timers; `palo` tiñe la segunda cara.
 */
export function sonar(cual: Sonido, o: { retraso?: number; palo?: Palo; altura?: number } = {}): void {
  sonados.push(cual);
  if (sonados.length > 60) sonados.shift();
  const c = listo();
  if (!c || !busEfectos) return;
  try {
    const t0 = c.currentTime + (o.retraso ?? 0);
    if (cual === 'segunda') {
      segundaCara(c, t0, o.palo ?? 'S');
      return;
    }
    // la altura de este disparo: un corrimiento chico al azar (más grande en los golpes) y el que se pida
    const semis = (Math.random() * 2 - 1) * (VARIA[cual] ?? VARIA_BASE);
    const k = 2 ** (semis / 12) * (o.altura ?? 1);
    let t = t0;
    for (const [f, dur, onda = 'square', vol = 0.15, cae] of SONIDO[cual] as Nota[]) {
      tono(c, t, f * k, dur, onda, vol * 0.5, cae ? cae * k : undefined);
      t += dur * 0.85;
    }
    for (const r of RUIDO[cual] ?? []) soplo(c, t0, r, k);
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

/** Una nota del conteo del golpe: cada paso sube un semitono. `larga` es la del total. */
export function nota(semitono: number, larga = false): void {
  if (!ajustes.sonido || !ctx || ctx.state !== 'running' || !busEfectos) return;
  try {
    const t = ctx.currentTime;
    const f = 523.25 * 2 ** (semitono / 12);
    tono(ctx, t, f, larga ? 0.22 : 0.07, 'square', larga ? 0.09 : 0.07);
    // el total suena con su quinta arriba: cierra la cuenta
    if (larga) tono(ctx, t + 0.02, f * 1.5, 0.2, 'triangle', 0.08);
  } catch {
    // sin audio: cuenta en silencio
  }
}
