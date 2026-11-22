// El bus maestro (0.28): por acá sale TODO lo que suena, en el juego y en la medición fuera de línea. No sabe de
// ajustes ni de pantallas: solo cablea sobre el `BaseAudioContext` que le den (un `AudioContext` en el juego, un
// `OfflineAudioContext` en `npm run qa:audio`).
//
//   efectos ─┐
//   música  ─┼─▶ compresor suave ─▶ limitador ─▶ maestro ─▶ techo (−1 dBFS) ─▶ salida
//   sala  ───┘        ▲
//   (envíos) ─▶ reverb de sala nocturna (convolución, respuesta generada una vez)

export interface Bus {
  /** Las entradas: los efectos (golpes, voces y stingers), la música y el envío a la sala. */
  efectos: GainNode;
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
function curvaTecho(): Float32Array<ArrayBuffer> {
  const { rodilla, tope } = BUS.techo;
  const n = 4097;
  const c = new Float32Array(n);
  // la curva cubre de −2 a +2: lo que entre más fuerte todavía queda en el tope
  for (let k = 0; k < n; k++) {
    const x = ((k / (n - 1)) * 2 - 1) * 2;
    const a = Math.abs(x);
    const y = a <= rodilla ? a : rodilla + (tope - rodilla) * Math.tanh((a - rodilla) / (tope - rodilla));
    c[k] = Math.sign(x) * y;
  }
  return c;
}

/** Cablea el bus maestro sobre un contexto y lo conecta a `destino` (por omisión, los altavoces). */
export function crearBus(ctx: BaseAudioContext, destino: AudioNode = ctx.destination): Bus {
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
  // el techo: una curva suave que no deja pasar nada de −1 dBFS (un limitador de verdad no es una pared; esto sí).
  // La entrada se parte en 2 para que la curva (que va de −1 a 1) cubra de −2 a +2; la curva ya devuelve el nivel real.
  const pre = ctx.createGain();
  pre.gain.value = 0.5;
  const techo = ctx.createWaveShaper();
  techo.curve = curvaTecho();
  techo.oversample = '2x';
  comp.connect(lim).connect(maestro).connect(pre).connect(techo).connect(destino);

  const efectos = ctx.createGain();
  const musica = ctx.createGain();
  efectos.connect(comp);
  musica.connect(comp);
  // la sala: un envío común, una convolución y su retorno
  const sala = ctx.createGain();
  const conv = ctx.createConvolver();
  conv.normalize = false;
  conv.buffer = respuestaSala(ctx);
  const retorno = ctx.createGain();
  retorno.gain.value = BUS.sala.retorno;
  sala.connect(conv).connect(retorno).connect(comp);
  return { efectos, musica, sala, maestro };
}
