// El canto (0.28): la voz de un personaje como un cantante lírico de síntesis. Una fuente rica (un tren de armónicos)
// pasa por tres pasabanda en paralelo, los formantes de la vocal de cada sílaba (a, e, i, o, u), más un poco de
// «cuerpo» sin filtrar; el vibrato (5–6 Hz) arranca tarde en cada nota, como en una voz de verdad, y entre nota y
// nota la altura se desliza (portamento). Un cantor vive lo que dura su frase: son 14 nodos, se crean una vez y se
// sueltan al terminar. Qué nota canta cada sílaba lo decide `teoria.ts` con el acorde del compás.
import { FORMANTES, hz, type PerfilVoz, type Vocal } from './teoria';

export interface Cantor {
  /**
   * Canta una sílaba. `entra`: primera nota de su frase (sin portamento); `ultima`: se apaga despacio;
   * `trino` / `melisma`: las notas del adorno (ya afinadas al acorde).
   */
  nota(t: number, dur: number, midi: number, vocal: Vocal, o: { entra: boolean; ultima: boolean; trino?: number; melisma?: number[] }): void;
  /** Se calla ya (el mismo personaje empezó otra frase): un fundido de 20 ms. */
  callar(t: number): void;
}

/** La ganancia y la agudeza de cada formante: el tercero (2,2–3 kHz, la banda que cansa) va 15 dB abajo del primero. */
const FORMANTE_GAN = [1, 0.5, 0.18];
const FORMANTE_Q = [5, 8, 9];
/** El vibrato espera esto antes de empezar a abrirse, y tarda otro tanto en llegar a su ancho. */
export const VIBRATO_ESPERA = 0.14;
/** Cuánto va a la sala. */
const ENVIO_SALA = 0.3;

export function crearCantor(ctx: BaseAudioContext, v: PerfilVoz, onda: PeriodicWave, vol: number, salida: AudioNode, sala: AudioNode, t0: number, tFin: number): Cantor {
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(onda);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = v.vibrato[0];
  const hondo = ctx.createGain();
  hondo.gain.value = 0;
  lfo.connect(hondo).connect(osc.detune);
  const amp = ctx.createGain();
  amp.gain.value = 0;
  const formantes = FORMANTE_GAN.map((g, k) => {
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = FORMANTE_Q[k];
    f.frequency.value = FORMANTES.a[k] * v.formante;
    const gan = ctx.createGain();
    gan.gain.value = g;
    osc.connect(f).connect(gan).connect(amp);
    return f;
  });
  // el cuerpo: la fundamental y sus primeros armónicos, para que la nota se entienda aunque caiga entre formantes
  const cuerpo = ctx.createBiquadFilter();
  cuerpo.type = 'lowpass';
  cuerpo.frequency.value = 520;
  const cuerpoGan = ctx.createGain();
  cuerpoGan.gain.value = 0.22;
  osc.connect(cuerpo).connect(cuerpoGan).connect(amp);
  const fuera = ctx.createGain();
  fuera.gain.value = vol * v.vol;
  const envio = ctx.createGain();
  envio.gain.value = ENVIO_SALA;
  amp.connect(fuera).connect(salida);
  fuera.connect(envio).connect(sala);
  osc.start(t0);
  lfo.start(t0);
  osc.stop(tFin + 0.5);
  lfo.stop(tFin + 0.5);
  osc.onended = () => {
    fuera.disconnect();
    envio.disconnect();
  };

  return {
    callar(t) {
      amp.gain.cancelScheduledValues(t);
      amp.gain.setTargetAtTime(0, t, 0.02);
    },
    nota(t, dur, midi, vocal, o) {
      const f = hz(midi);
      if (o.entra) osc.frequency.setValueAtTime(f, t);
      else osc.frequency.setTargetAtTime(f, t, v.porta / 3);
      // la boca cambia de vocal en unos 25 ms
      formantes.forEach((fil, k) => fil.frequency.setTargetAtTime(FORMANTES[vocal][k] * v.formante, t, o.entra ? 0.004 : 0.025));
      amp.gain.setTargetAtTime(1, t, 0.012);
      const fin = t + dur * (o.ultima ? 1 : v.ligado);
      if (o.ultima) amp.gain.setTargetAtTime(0, fin, 0.07);
      else if (v.ligado < 1) amp.gain.setTargetAtTime(0, fin, 0.018);
      // el vibrato, con ataque retrasado: cada nota arranca limpia y recién después se abre
      hondo.gain.setTargetAtTime(0, t, 0.012);
      hondo.gain.setTargetAtTime(v.vibrato[1], t + VIBRATO_ESPERA, 0.09);
      // el trino del Bufón: la nota y su vecina del acorde, alternando rápido
      if (o.trino !== undefined) {
        const f2 = hz(o.trino);
        for (let k = 1; k * 0.07 < dur - 0.1; k++) osc.frequency.setTargetAtTime(k % 2 ? f2 : f, t + k * 0.07, 0.008);
      }
      // el melisma de Copas: dos notas más sobre la misma sílaba, ligadas
      if (o.melisma?.length) o.melisma.forEach((m, k) => osc.frequency.setTargetAtTime(hz(m), t + ((k + 1) * dur) / (o.melisma!.length + 1), v.porta / 2));
    },
  };
}
