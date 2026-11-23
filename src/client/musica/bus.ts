// El bus maestro (0.28): por acá sale TODO lo que suena, en el juego y en la medición fuera de línea. No sabe de
// ajustes ni de pantallas: solo cablea sobre el `BaseAudioContext` que le den (un `AudioContext` en el juego, un
// `OfflineAudioContext` en `npm run qa:audio`).
//
//   paleta de efectos ─▶ pasabajos 5 kHz ─▶ campana −4 dB en 3,5 kHz ─┐ (0.29: el bus propio de los efectos)
//   voces y stingers ────────────────────────────────────────────────────┴▶ efectos ─▶ empuje ─┐
//   música  ─────────────────────────────────────────────────────────────────────────────────────┼─▶ entrada
//   sala (envíos) ─▶ reverb de sala nocturna (convolución, respuesta generada una vez) ─▶ retorno ┘
//   entrada ─▶ compresor suave ─▶ limitador ─▶ maestro ─▶ techo ─▶ salida
//
// EL TECHO, documentado (0.29). No hay limitador «de pared» con anticipación propia: Web Audio no deja leer la
// reducción de un compresor a ritmo de audio y un AudioWorklet (la única forma de hacerlo de verdad) carga un módulo
// aparte y de forma asíncrona, que es justo lo que no puede fallar en el primer gesto del jugador. Lo que hay son tres
// etapas en serie:
//   1. el compresor (2,5:1 desde −14 dB, ataque 12 ms): junta la mezcla; no frena transitorios;
//   2. el limitador (20:1 desde −3 dB, ataque 2 ms): un `DynamicsCompressorNode`, que en Chromium mira ~6 ms por
//      delante (su retardo interno): frena casi todo, pero la cresta de un golpe seco se le escapa 1–3 dB;
//   3. el techo: una curva sin memoria (WaveShaper con sobremuestreo ×2), recta hasta −4,4 dBFS y tangente hiperbólica
//      hasta −1,2 dBFS. No bombea ni recorta en seco: SATURA suave lo que pasa de la rodilla.
// Cuánto trabaja cada etapa en el peor caso real (la caída de un Rey con todo encima) lo mide `npm run qa:audio`
// (dB de reducción del compresor + limitador, dB que el techo le saca al pico, parte de las muestras por encima de la
// rodilla y factor de cresta), con topes: el techo no puede sacar más de 2 dB ni tocar más del 2 % de las muestras.

export interface Bus {
  /** Las entradas: los efectos (voces y stingers), la paleta de efectos con su filtro, la música y el envío a la sala. */
  efectos: GainNode;
  fx: GainNode;
  musica: GainNode;
  sala: GainNode;
  /** La ganancia maestra. */
  maestro: GainNode;
}

/** Los números del bus maestro (los lee el juez). */
export const BUS = {
  // (el compresor de Web Audio suma solo su ganancia de compensación: con estos números, unos +5 dB el compresor y
  // +1,7 dB el limitador; el maestro devuelve 2,6 dB: lo que no llega al umbral sale unos 4 dB arriba, como antes de la 0.28)
  compresor: { umbral: -14, rodilla: 10, razon: 2.5, ataque: 0.012, relajo: 0.25 },
  limitador: { umbral: -3, rodilla: 0, razon: 20, ataque: 0.002, relajo: 0.12 },
  maestro: 0.74,
  /** Lo que entra por `efectos` (voces, stingers y la paleta) sube 5,6 dB; el nivel de cada efecto se calibra aparte (`audio.ts`). */
  efectos: 1.9,
  /**
   * (0.29) El bus de la paleta de efectos: su propio pasabajos y su campana en la banda que cansa (2,5–5 kHz), como
   * la música. Medido: los efectos a solas dejan ahí menos del 3,5 % de su energía (antes, 5,17 %).
   */
  fx: { corte: 5000, q: 0.5, campana: { hz: 3500, q: 0.9, db: -4 }, sala: 0.14 },
  /** El techo: por debajo de −4,4 dBFS no toca la señal; por encima la dobla sin recortar y nunca pasa de −1,2 dBFS. */
  techo: { rodilla: 0.6, tope: 0.87 },
  sala: { segundos: 1.7, predelay: 0.012, corte: 3200, retorno: 0.5 },
} as const;

/** Un ruido blanco de un segundo, determinista: lo comparten la batería, las brasas y la respuesta de la sala. */
export function crearRuido(ctx: BaseAudioContext, segundos = 1, semilla = 1): AudioBuffer {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * segundos), ctx.sampleRate);
  const d = b.getChannelData(0);
  let s = semilla * 2654435761 + 12345;
  for (let k = 0; k < d.length; k++) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    d[k] = (s >>> 0) / 2147483648 - 1;
  }
  return b;
}

/**
 * La respuesta de impulso de la sala: ruido que se apaga en `segundos`, más oscuro cuanto más tarde (un pasabajos de
 * un polo que se cierra), con unas pocas reflexiones tempranas. Estéreo, distinta en cada canal. Se genera una vez.
 */
export function respuestaSala(ctx: BaseAudioContext): AudioBuffer {
  const { segundos, predelay, corte } = BUS.sala;
  const fs = ctx.sampleRate;
  const n = Math.floor(fs * segundos);
  const b = ctx.createBuffer(2, n, fs);
  for (let canal = 0; canal < 2; canal++) {
    const d = b.getChannelData(canal);
    let s = 9001 + canal * 7919;
    let y = 0;
    const d0 = Math.floor(predelay * fs);
    for (let k = d0; k < n; k++) {
      s = (Math.imul(s, 1664525) + 1013904223) | 0;
      const t = (k - d0) / fs;
      // el brillo se va antes que el cuerpo: el corte baja de 3,2 kHz a unos 700 Hz
      const fc = corte * Math.exp(-t * 1.6) + 600;
      const a = 1 - Math.exp((-2 * Math.PI * fc) / fs);
      y += a * ((s >>> 0) / 2147483648 - 1 - y);
      d[k] = y * Math.exp((-6.9 * t) / segundos) * Math.min(1, t / 0.004);
    }
    // tres reflexiones tempranas (las paredes de la pulpería)
    for (const [ms, g] of [[19, 0.5], [31, 0.36], [47, 0.26]] as const) {
      const k = Math.floor(((ms + canal * 4) / 1000) * fs);
      if (k < n) d[k] += g * (canal ? -1 : 1) * 0.5;
    }
    // normaliza la energía: que la sala no cambie de volumen con la frecuencia de muestreo
    let e = 0;
    for (let k = 0; k < n; k++) e += d[k] * d[k];
    const g = 1 / Math.sqrt(e || 1);
    for (let k = 0; k < n; k++) d[k] *= g;
  }
  return b;
}

/** La curva del techo: recta hasta la rodilla y una tangente hiperbólica que se acuesta en el tope. */
export function techoDe(x: number): number {
  const { rodilla, tope } = BUS.techo;
  const a = Math.abs(x);
  return Math.sign(x) * (a <= rodilla ? a : rodilla + (tope - rodilla) * Math.tanh((a - rodilla) / (tope - rodilla)));
}
function curvaTecho(): Float32Array<ArrayBuffer> {
  const n = 4097;
  const c = new Float32Array(n);
  // la curva cubre de −2 a +2: lo que entre más fuerte todavía queda en el tope
  for (let k = 0; k < n; k++) c[k] = techoDe(((k / (n - 1)) * 2 - 1) * 2);
  return c;
}

/** Las sondas de la medición: la suma que entra al compresor y lo que sale del maestro, antes del techo. */
export interface Sondas {
  entrada?: (n: AudioNode) => void;
  preTecho?: (n: AudioNode) => void;
}

/** Cablea el bus maestro sobre un contexto y lo conecta a `destino` (por omisión, los altavoces). */
export function crearBus(ctx: BaseAudioContext, destino: AudioNode = ctx.destination, sondas: Sondas = {}): Bus {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = BUS.compresor.umbral;
  comp.knee.value = BUS.compresor.rodilla;
  comp.ratio.value = BUS.compresor.razon;
  comp.attack.value = BUS.compresor.ataque;
  comp.release.value = BUS.compresor.relajo;
  const lim = ctx.createDynamicsCompressor();
  lim.threshold.value = BUS.limitador.umbral;
  lim.knee.value = BUS.limitador.rodilla;
  lim.ratio.value = BUS.limitador.razon;
  lim.attack.value = BUS.limitador.ataque;
  lim.release.value = BUS.limitador.relajo;
  const maestro = ctx.createGain();
  maestro.gain.value = BUS.maestro;
  // el techo: una curva suave que no deja pasar nada de −1 dBFS (ver la cabecera: satura, no bombea).
  // La entrada se parte en 2 para que la curva (que va de −1 a 1) cubra de −2 a +2; la curva ya devuelve el nivel real.
  const pre = ctx.createGain();
  pre.gain.value = 0.5;
  const techo = ctx.createWaveShaper();
  techo.curve = curvaTecho();
  techo.oversample = '2x';
  const entrada = ctx.createGain();
  entrada.connect(comp).connect(lim).connect(maestro).connect(pre).connect(techo).connect(destino);
  sondas.entrada?.(entrada);
  sondas.preTecho?.(maestro);

  const efectos = ctx.createGain();
  const musica = ctx.createGain();
  const empuje = ctx.createGain();
  empuje.gain.value = BUS.efectos;
  efectos.connect(empuje).connect(entrada);
  musica.connect(entrada);
  // la sala: un envío común, una convolución y su retorno
  const sala = ctx.createGain();
  const conv = ctx.createConvolver();
  conv.normalize = false;
  conv.buffer = respuestaSala(ctx);
  const retorno = ctx.createGain();
  retorno.gain.value = BUS.sala.retorno;
  sala.connect(conv).connect(retorno).connect(entrada);
  // (0.29) la paleta de efectos: su pasabajos, su campana en 3,5 kHz y un hilo a la sala (suenan en la misma pieza)
  const fx = ctx.createGain();
  const fxBajos = ctx.createBiquadFilter();
  fxBajos.type = 'lowpass';
  fxBajos.frequency.value = BUS.fx.corte;
  fxBajos.Q.value = BUS.fx.q;
  const fxCampana = ctx.createBiquadFilter();
  fxCampana.type = 'peaking';
  fxCampana.frequency.value = BUS.fx.campana.hz;
  fxCampana.Q.value = BUS.fx.campana.q;
  fxCampana.gain.value = BUS.fx.campana.db;
  fx.connect(fxBajos).connect(fxCampana).connect(efectos);
  const fxSala = ctx.createGain();
  fxSala.gain.value = BUS.fx.sala;
  fxCampana.connect(fxSala).connect(sala);
  return { efectos, fx, musica, sala, maestro };
}
