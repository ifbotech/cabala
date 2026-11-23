// El canto (0.28): la voz de un personaje como un cantante lírico de síntesis. Una fuente rica (un tren de armónicos)
// pasa por tres pasabanda en paralelo, los formantes de la vocal de cada sílaba (a, e, i, o, u), más un poco de
// «cuerpo» sin filtrar; el vibrato (5–6 Hz) arranca tarde en cada nota, como en una voz de verdad, y entre nota y
// nota la altura se desliza (portamento). Qué nota canta cada sílaba lo decide `teoria.ts` con el acorde del compás.
//
// (0.29) Ahora ARTICULA y tiene aire:
//   · cada sílaba ataca con su consonante (`teoria.articular`): las oclusivas cierran la voz 16–26 ms y estallan con
//     un soplo de ruido filtrado según dónde se arman (labial, dental, velar); las fricativas soplan 45–70 ms (la «s»,
//     por encima de 5 kHz); las nasales murmuran con la boca cerrada; la «r» corta la voz una vez y la «rr», tres;
//   · un hilo de aire (ruido por los mismos formantes) acompaña a la voz;
//   · el nivel se empareja por vocal y por nota (`teoria.compensaVocal`): la «i» ya no canta 5 dB más bajo que la «a»;
//   · cada cantor se para en su lugar del escenario (paneo): el Bufón a la izquierda, el Rey a la derecha.
// Un cantor vive lo que dura su frase: son 21 nodos, se crean una vez y se sueltan al terminar.
import { FORMANTES, TRACTO, compensaVocal, hz, type Articulacion, type PerfilVoz, type Vocal } from './teoria';

export interface Cantor {
  /**
   * Canta una sílaba. `entra`: primera nota de su frase (sin portamento); `ultima`: se apaga despacio;
   * `trino` / `melisma`: las notas del adorno (ya afinadas); `consonante`: cómo ataca.
   */
  nota(t: number, dur: number, midi: number, vocal: Vocal, o: { entra: boolean; ultima: boolean; trino?: number; melisma?: number[]; consonante?: Articulacion }): void;
  /** Se calla ya (el mismo personaje empezó otra frase): un fundido de 20 ms. */
  callar(t: number): void;
}

/** El vibrato espera esto antes de empezar a abrirse, y tarda otro tanto en llegar a su ancho. */
export const VIBRATO_ESPERA = 0.14;
/** Cuánto va a la sala. */
const ENVIO_SALA = 0.3;
/** El aire: cuánto ruido entra a los formantes junto con la voz; y el nivel de los soplos de las consonantes. */
export const AIRE = 0.05;
export const NIVEL_SOPLO = 0.42;
/** Cuántos nodos crea un cantor (para la cuenta de costo). */
export const NODOS_CANTOR = 21;

export function crearCantor(ctx: BaseAudioContext, v: PerfilVoz, onda: PeriodicWave, vol: number, salida: AudioNode, sala: AudioNode, t0: number, tFin: number, ruido: AudioBuffer | null = null): Cantor {
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(onda);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = v.vibrato[0];
  const hondo = ctx.createGain();
  hondo.gain.value = 0;
  lfo.connect(hondo).connect(osc.detune);
  const amp = ctx.createGain();
  amp.gain.value = 0;
  // el ruido del cantor: una sola fuente para el aire (por los formantes) y para los soplos de las consonantes
  const src = ruido ? ctx.createBufferSource() : null;
  const aire = ctx.createGain();
  aire.gain.value = AIRE;
  if (src) {
    src.buffer = ruido;
    src.loop = true;
    src.connect(aire);
  }
  const formantes = TRACTO.gan.map((g, k) => {
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = TRACTO.q[k];
    f.frequency.value = FORMANTES.a[k] * v.formante;
    const gan = ctx.createGain();
    gan.gain.value = g;
    osc.connect(f).connect(gan).connect(amp);
    aire.connect(f);
    return f;
  });
  // el cuerpo: la fundamental y sus primeros armónicos, para que la nota se entienda aunque caiga entre formantes
  const cuerpo = ctx.createBiquadFilter();
  cuerpo.type = 'lowpass';
  cuerpo.frequency.value = TRACTO.cuerpo.hz;
  cuerpo.Q.value = TRACTO.cuerpo.qdb;
  const cuerpoGan = ctx.createGain();
  cuerpoGan.gain.value = TRACTO.cuerpo.gan;
  osc.connect(cuerpo).connect(cuerpoGan).connect(amp);
  const fuera = ctx.createGain();
  fuera.gain.value = vol * v.vol;
  const pan = ctx.createStereoPanner();
  pan.pan.value = v.pan;
  const envio = ctx.createGain();
  envio.gain.value = ENVIO_SALA;
  amp.connect(fuera).connect(pan).connect(salida);
  fuera.connect(envio).connect(sala);
  // los soplos de las consonantes: un pasabanda (estallidos, «f», «j», «ch») y un pasaaltos (la «s»), cada uno con su envolvente
  const soplos = (['bandpass', 'highpass'] as const).map((tipo) => {
    const fil = ctx.createBiquadFilter();
    fil.type = tipo;
    const gan = ctx.createGain();
    gan.gain.value = 0;
    src?.connect(fil);
    fil.connect(gan).connect(fuera);
    return { fil, gan };
  });
  osc.start(t0);
  lfo.start(t0);
  src?.start(t0, (t0 * 0.37) % 0.5);
  osc.stop(tFin + 0.5);
  lfo.stop(tFin + 0.5);
  src?.stop(tFin + 0.5);
  osc.onended = () => {
    pan.disconnect();
    envio.disconnect();
  };

  return {
    callar(t) {
      amp.gain.cancelScheduledValues(t);
      amp.gain.setTargetAtTime(0, t, 0.02);
      for (const s of soplos) {
        s.gan.gain.cancelScheduledValues(t);
        s.gan.gain.setTargetAtTime(0, t, 0.01);
      }
    },
    nota(t, dur, midi, vocal, o) {
      const f = hz(midi);
      if (o.entra) osc.frequency.setValueAtTime(f, t);
      else osc.frequency.setTargetAtTime(f, t, v.porta / 3);
      // (0.29) el nivel parejo: cada vocal, a esta altura, sale como la «a» del centro de la tesitura
      const nivel = compensaVocal(v, vocal, midi);
      const art = o.consonante;
      // la consonante le saca su tiempo al principio de la sílaba (nunca más del 40 %): la vocal abre después
      const previa = art ? Math.min(art.previa, dur * 0.4) : 0;
      const tv = t + previa;
      const boca = FORMANTES[vocal];
      if (art && previa > 0) {
        // la voz durante la consonante: callada (sordas), un murmullo (sonoras y nasales) o casi entera (líquidas)
        amp.gain.setTargetAtTime(nivel * art.voz, t, 0.005);
        if (art.boca) {
          formantes[0].frequency.setTargetAtTime(art.boca[0] * v.formante, t, 0.006);
          formantes[1].frequency.setTargetAtTime(art.boca[1] * v.formante, t, 0.006);
        }
        if (art.ruido) {
          const s = soplos[art.ruido.filtro === 'highpass' ? 1 : 0];
          const tr = t + Math.min(art.cierre, previa * 0.6);
          s.fil.frequency.setValueAtTime(art.ruido.hz * (art.ruido.filtro === 'highpass' ? 1 : v.formante), t);
          s.fil.Q.setValueAtTime(art.ruido.q, t);
          s.gan.gain.setValueAtTime(0, tr);
          s.gan.gain.linearRampToValueAtTime(art.ruido.vol * NIVEL_SOPLO, tr + 0.003);
          s.gan.gain.setTargetAtTime(0, tr + Math.max(0.004, art.ruido.dur - 0.006), art.ruido.dur / 4);
        }
        // la lengua que vibra: cortes brevísimos de la voz, uno la «r», tres la «rr»
        for (let g = 0; g < art.golpes; g++) {
          const tg = t + g * 0.03;
          amp.gain.setTargetAtTime(nivel * 0.12, tg, 0.003);
          amp.gain.setTargetAtTime(nivel * art.voz, tg + 0.011, 0.004);
        }
      }
      // la boca cambia de vocal en unos 25 ms (si viene de una consonante, abre desde ahí)
      formantes.forEach((fil, k) => fil.frequency.setTargetAtTime(boca[k] * v.formante, tv, o.entra && !previa ? 0.004 : 0.022));
      amp.gain.setTargetAtTime(nivel, tv, 0.012);
      const fin = t + dur * (o.ultima ? 1 : v.ligado);
      if (o.ultima) amp.gain.setTargetAtTime(0, fin, 0.07);
      else if (v.ligado < 1) amp.gain.setTargetAtTime(0, fin, 0.018);
      // el vibrato, con ataque retrasado: cada nota arranca limpia y recién después se abre
      hondo.gain.setTargetAtTime(0, t, 0.012);
      hondo.gain.setTargetAtTime(v.vibrato[1], tv + VIBRATO_ESPERA, 0.09);
      // (0.29) el trino del Bufón: un adorno de verdad (la nota y su vecina de arriba en la escala), solo en la
      // primera mitad de la nota final; después se posa
      if (o.trino !== undefined) {
        const f2 = hz(o.trino);
        const hasta = Math.min(dur * 0.55, 0.36);
        let k = 1;
        for (; k * 0.065 < hasta; k++) osc.frequency.setTargetAtTime(k % 2 ? f2 : f, tv + k * 0.065, 0.007);
        osc.frequency.setTargetAtTime(f, tv + k * 0.065, 0.01);
      }
      // el melisma de Copas: dos notas más sobre la misma sílaba, ligadas
      if (o.melisma?.length) o.melisma.forEach((m, k) => osc.frequency.setTargetAtTime(hz(m), t + ((k + 1) * dur) / (o.melisma!.length + 1), v.porta / 2));
    },
  };
}
