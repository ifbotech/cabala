// El sonido: sintetizado con WebAudio, sin archivos. Tonos cortos de onda cuadrada y triangular con su envolvente
// (chiptune de pulpería): cada cosa que pasa en la mesa suena a lo suyo.
import type { MazoId } from '../rules/mazos';
import { ajustes } from './almacen';

type Nota = [frecuencia: number, duracion: number, onda?: OscillatorType, volumen?: number, cae?: number];

const SONIDO = {
  clic: [[520, 0.04, 'square', 0.12]],
  carta: [[320, 0.03, 'triangle', 0.2], [480, 0.03, 'triangle', 0.14]],
  suelta: [[240, 0.05, 'triangle', 0.18]],
  golpe: [[150, 0.07, 'square', 0.22, 60], [90, 0.1, 'sawtooth', 0.2, 40]],
  fuerte: [[110, 0.08, 'sawtooth', 0.26, 40], [70, 0.16, 'square', 0.24, 30], [220, 0.05, 'square', 0.12]],
  exacto: [[660, 0.06, 'square', 0.16], [880, 0.06, 'square', 0.16], [1320, 0.14, 'square', 0.16]],
  canto: [[523, 0.07, 'square', 0.16], [659, 0.07, 'square', 0.16], [784, 0.07, 'square', 0.16], [1047, 0.16, 'square', 0.16]],
  contra: [[200, 0.06, 'sawtooth', 0.24, 80], [120, 0.14, 'sawtooth', 0.22, 50]],
  frena: [[700, 0.04, 'square', 0.14], [500, 0.08, 'triangle', 0.18]],
  oro: [[988, 0.05, 'square', 0.12], [1319, 0.1, 'square', 0.12]],
  cura: [[440, 0.06, 'triangle', 0.2], [554, 0.06, 'triangle', 0.2], [659, 0.12, 'triangle', 0.2]],
  cae: [[300, 0.06, 'square', 0.18, 120], [180, 0.08, 'square', 0.18, 80], [90, 0.18, 'sawtooth', 0.2, 40]],
  rey: [[98, 0.2, 'sawtooth', 0.22], [147, 0.2, 'sawtooth', 0.2], [196, 0.36, 'sawtooth', 0.2]],
  error: [[160, 0.08, 'square', 0.14], [120, 0.1, 'square', 0.14]],
  // el Bufón: se esfuma (un soplo que cae) y reaparece (su cascabel: tres notas que suben)
  puf: [[260, 0.05, 'sawtooth', 0.16, 120], [140, 0.1, 'sawtooth', 0.14, 50]],
  bufon: [[784, 0.045, 'square', 0.13], [1175, 0.045, 'square', 0.13], [1568, 0.1, 'triangle', 0.18]],
  // el Mapa: un paso; el Fogón: el soplo del fuego, el chisporroteo que sube y la ceniza
  paso: [[196, 0.04, 'triangle', 0.2], [262, 0.05, 'triangle', 0.16]],
  fuego: [[90, 0.16, 'sawtooth', 0.14, 240], [240, 0.12, 'sawtooth', 0.1, 520]],
  suspenso: [[220, 0.09, 'square', 0.08], [247, 0.09, 'square', 0.09], [277, 0.09, 'square', 0.1], [311, 0.09, 'square', 0.11], [349, 0.09, 'square', 0.12], [392, 0.09, 'square', 0.13], [440, 0.12, 'square', 0.14]],
  ceniza: [[420, 0.07, 'sawtooth', 0.16, 160], [200, 0.12, 'sawtooth', 0.16, 70], [90, 0.3, 'sawtooth', 0.14, 40]],
  brota: [[660, 0.03, 'triangle', 0.1]],
  victoria: [[523, 0.1, 'square', 0.16], [659, 0.1, 'square', 0.16], [784, 0.1, 'square', 0.16], [1047, 0.1, 'square', 0.16], [1319, 0.3, 'square', 0.16]],
  derrota: [[392, 0.16, 'triangle', 0.22], [330, 0.16, 'triangle', 0.22], [262, 0.16, 'triangle', 0.22], [196, 0.4, 'triangle', 0.22]],
} satisfies Record<string, Nota[]>;

export type Sonido = keyof typeof SONIDO;

let ctx: AudioContext | null = null;
const alAbrir: (() => void)[] = [];
/** El audio, si ya está abierto y andando (lo usa la música). */
export const contextoAudio = (): AudioContext | null => (ctx && ctx.state === 'running' ? ctx : null);
/** Avisa cuando el navegador deja abrir el audio (con el primer gesto). */
export const alAbrirAudio = (f: () => void): void => void alAbrir.push(f);
/** Cuántos sonidos se pidieron (para la QA, que no oye). */
export const sonados: Sonido[] = [];

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
      ctx ??= new AudioContext();
      const listo = (): void => alAbrir.forEach((f) => f());
      if (ctx.state === 'suspended') void ctx.resume().then(listo);
      else listo();
    } catch {
      // sin audio: el juego sigue en silencio
    }
  };
  addEventListener('pointerdown', abrir, true);
  addEventListener('keydown', abrir, true);
}

/** Quién habla: el Bufón, un Rey (por su palo) o el Personaje de un Mazo. */
export type VozId = 'bufon' | 'S' | 'C' | 'D' | 'H' | MazoId;

// Cada cual habla con su timbre: un pitido corto por sílaba, con la altura que le toca a esa letra. `cae` tuerce
// el pitido (menos de 1 baja, más de 1 sube).
const VOCES: Record<VozId, { onda: OscillatorType; escala: number[]; dur: number; vol: number; cae?: number }> = {
  bufon: { onda: 'square', escala: [392, 440, 494, 523, 587, 659], dur: 0.045, vol: 0.045 },
  // los Reyes hablan grave: Espadas seco y cortante, Bastos el más hondo, Oros nasal y apurado, Copas arrastra
  S: { onda: 'sawtooth', escala: [110, 123, 131, 147], dur: 0.06, vol: 0.05, cae: 0.9 },
  C: { onda: 'triangle', escala: [65, 73, 78, 87], dur: 0.1, vol: 0.13, cae: 0.9 },
  D: { onda: 'square', escala: [208, 233, 262, 277, 311], dur: 0.04, vol: 0.035, cae: 1.07 },
  H: { onda: 'triangle', escala: [147, 165, 185, 196, 220], dur: 0.085, vol: 0.1, cae: 0.78 },
  // los Personajes: la Barrendera clara, el Paisano ronco, la Timbera rápida, el Chamuyero meloso, el Manotazo bruto
  escoba: { onda: 'triangle', escala: [523, 587, 659, 698, 784], dur: 0.05, vol: 0.1 },
  truco: { onda: 'sawtooth', escala: [165, 185, 196, 220, 247], dur: 0.055, vol: 0.05 },
  chinchon: { onda: 'square', escala: [330, 370, 415, 440, 494], dur: 0.04, vol: 0.04 },
  mentiroso: { onda: 'triangle', escala: [262, 294, 311, 349, 392], dur: 0.07, vol: 0.1, cae: 1.08 },
  chancho: { onda: 'square', escala: [131, 147, 165, 175, 196], dur: 0.05, vol: 0.05, cae: 0.85 },
};
/** Quiénes hablaron (para la QA, que no oye). */
export const hablaron: VozId[] = [];

/** Una sílaba de la voz de alguien. */
export function voz(quien: VozId, letra: number): void {
  if (!hablaron.includes(quien)) hablaron.push(quien);
  if (!ajustes.sonido || !ctx || ctx.state !== 'running') return;
  try {
    const v = VOCES[quien];
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    const f = v.escala[letra % v.escala.length];
    osc.type = v.onda;
    osc.frequency.setValueAtTime(f, t);
    if (v.cae) osc.frequency.exponentialRampToValueAtTime(f * v.cae, t + v.dur);
    gan.gain.setValueAtTime(v.vol, t);
    gan.gain.exponentialRampToValueAtTime(0.001, t + v.dur);
    osc.connect(gan).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + v.dur + 0.02);
  } catch {
    // sin audio: habla en silencio
  }
}
/** La voz del Bufón (habla en chiptune). */
export const vozBufon = (letra: number): void => voz('bufon', letra);

/** Toca un sonido. No hace nada si el sonido está apagado o el navegador todavía no dejó abrir el audio. */
export function sonar(cual: Sonido): void {
  sonados.push(cual);
  if (sonados.length > 60) sonados.shift();
  if (!ajustes.sonido) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    let t = ctx.currentTime;
    for (const [f, dur, onda = 'square', vol = 0.15, cae] of SONIDO[cual] as Nota[]) {
      const osc = ctx.createOscillator();
      const gan = ctx.createGain();
      osc.type = onda;
      osc.frequency.setValueAtTime(f, t);
      if (cae) osc.frequency.exponentialRampToValueAtTime(cae, t + dur);
      gan.gain.setValueAtTime(vol * 0.5, t);
      gan.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gan).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur * 0.85;
    }
  } catch {
    // sin audio: el juego sigue en silencio
  }
}
