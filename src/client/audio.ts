// El sonido: sintetizado con WebAudio, sin archivos. Tonos cortos de onda cuadrada y triangular con su envolvente
// (chiptune de pulpería): cada cosa que pasa en la mesa suena a lo suyo.
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
  victoria: [[523, 0.1, 'square', 0.16], [659, 0.1, 'square', 0.16], [784, 0.1, 'square', 0.16], [1047, 0.1, 'square', 0.16], [1319, 0.3, 'square', 0.16]],
  derrota: [[392, 0.16, 'triangle', 0.22], [330, 0.16, 'triangle', 0.22], [262, 0.16, 'triangle', 0.22], [196, 0.4, 'triangle', 0.22]],
} satisfies Record<string, Nota[]>;

export type Sonido = keyof typeof SONIDO;

let ctx: AudioContext | null = null;
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
      if (ctx.state === 'suspended') void ctx.resume();
    } catch {
      // sin audio: el juego sigue en silencio
    }
  };
  addEventListener('pointerdown', abrir, true);
  addEventListener('keydown', abrir, true);
}

/** La voz del Bufón: un pitido corto por sílaba, con la altura que le toca a esa letra (habla en chiptune). */
export function vozBufon(letra: number): void {
  if (!ajustes.sonido || !ctx || ctx.state !== 'running') return;
  try {
    const ESCALA = [392, 440, 494, 523, 587, 659];
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(ESCALA[letra % ESCALA.length], t);
    gan.gain.setValueAtTime(0.045, t);
    gan.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(gan).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch {
    // sin audio: habla en silencio
  }
}

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
