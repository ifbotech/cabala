// La medición para el juez que no oye (0.28). Renderiza fuera de línea (`OfflineAudioContext`) el MISMO motor y el
// MISMO bus maestro del juego y mide lo que sale: pico, muestras recortadas, RMS, LUFS aproximado (ponderación K sin
// puertas) y la parte de la energía que cae en la banda que cansa (2,5–5 kHz). Además devuelve la partitura en texto.
// Lo llama `scripts/audio-render.ts` (`npm run qa:audio`) desde un Chromium sin cabecera; no se usa en el juego.
//
// (0.29) Medición honesta: el render sale por seis canales (la salida, lo que sale del maestro ANTES del techo y la
// suma que entra al compresor), así que se sabe cuánto trabaja cada etapa del bus y no solo que «el pico no pasa de
// −1 dBFS» (que el techo garantiza por construcción). Mide además cada efecto por separado (la ventana que junta el
// 90 % de su energía), el nivel de cada vocal de cada voz, la voz contra la música en el mismo instante, el ancho del
// estéreo, la presencia del latido en 120–300 Hz y los nodos que se crean por segundo. Y devuelve el audio (WAV).
import { NIVEL_FX, SOBRE, familiaDe, sonarEn, type Familia, type Sonido } from '../audio';
import { BUS, crearBus, crearRuido } from './bus';
import { Motor } from './motor';
import * as T from './teoria';

export const FS = 48000;

export interface Momento {
  id: string;
  /** RMS (dBFS) de la ventana, su pico, el «brillo» (RMS de la derivada, dB) y el RMS de la banda de la voz (300–3000 Hz). */
  rms: number;
  pico: number;
  brillo: number;
  rmsVoz: number;
  /** Cuánto dura la ventana (segundos). */
  dur: number;
}

/** Cuánto trabaja el bus maestro en un render. */
export interface Dinamica {
  /** El pico de lo que entra al techo y de lo que sale (dBFS), y cuántos dB le saca el techo a ese pico. */
  picoPreTecho: number;
  picoSalida: number;
  techoDb: number;
  /** La parte de las muestras que llegan al techo por encima de su rodilla (0–1): las que salen saturadas. */
  sobreRodilla: number;
  /** La mayor reducción de ganancia del compresor + limitador (dB), en ventanas de 50 ms, contra su ganancia en reposo. */
  reduccion: number;
  /** El factor de cresta de la salida (pico − RMS, dB) en el segundo más fuerte. */
  cresta: number;
}

export interface Medida {
  id: string;
  tipo: 'escena' | 'voz' | 'stinger' | 'fx' | 'banco';
  que: string;
  segundos: number;
  /** El pico, en dBFS. */
  pico: number;
  /** Muestras con |x| ≥ 0,999. */
  recortes: number;
  rms: number;
  lufs: number;
  /** La parte de la energía entre 2,5 y 5 kHz (0–1). */
  banda: number;
  /** El reparto de la energía por bandas: < 120 Hz, 120–500, 500–2500, 2500–5000 y > 5000 Hz (suma 1). */
  bandas: number[];
  /** El nivel (dBFS) de lo que cae entre 120 y 300 Hz (donde se tiene que oír el latido en un teléfono). */
  b120a300: number;
  /** Notas cantadas fuera del acorde o de la tesitura (tiene que ser 0). */
  fuera: number;
  /** El ancho del estéreo: la energía del lado (L − R) contra la del medio (L + R), en dB (−∞ sería mono). */
  ancho: number;
  /** La mediana del RMS en ventanas de 100 ms (dBFS): el nivel «de todos los días» de una escena. */
  mediana: number;
  dinamica: Dinamica;
  /** Los nodos que el motor creó por segundo de música. */
  nodosPorSegundo: number;
  momentos: Momento[];
  partitura: string[];
  /** El audio: WAV de 16 bits, estéreo, en base64 (si se pidió). */
  wav?: string;
}

export interface Pedido {
  id: string;
  tipo: Medida['tipo'];
  que: string;
  compases: number;
  estado: Partial<T.EstadoMusical>;
  furia?: number;
  /** Con la música apagada (solo corre el reloj): para medir una voz o un stinger a solas. */
  sinMusica?: boolean;
  /** Solo suenan estas capas (para medir el latido a solas). */
  solo?: T.CapaId[];
  /** Cambios de estado en el límite de un compás (el viaje por las pantallas). */
  cambios?: { compas: number; paso?: number; estado: Partial<T.EstadoMusical>; furia?: number }[];
  /** Efectos del juego (los mismos de audio.ts): `agache` es el hitstop que agacha la música 6 dB esos ms; `mudo`, solo el agache; `mide`: abre una ventana con su nombre. */
  efectos?: { compas: number; paso: number; cual: Sonido; agache?: number; db?: number; mudo?: boolean; palo?: 'S' | 'C' | 'D' | 'H'; altura?: number; sube?: number; mide?: boolean }[];
  /** El remate de la caída de un Rey. */
  remates?: { compas: number; paso: number; mayor?: boolean }[];
  /** Ventanas en las que se mide el nivel (segundos de duración desde esa semicorchea). */
  ventanas?: { id: string; compas: number; paso: number; dur: number }[];
  /** Lo que se canta y los stingers que suenan: en qué compás y semicorchea. `cantosMudos`: se planifican y agachan la música, pero no suenan. */
  cantos?: { compas: number; paso: number; quien: T.VozId; texto: string; idioma?: T.Idioma; breve?: boolean }[];
  cantosMudos?: boolean;
  stingers?: { compas: number; paso: number; id: T.StingerId }[];
  /** Vocales sostenidas (para medir el nivel de cada una): cada una abre su ventana. */
  vocales?: { id: string; quien: T.VozId; vocal: T.Vocal; midi: number; compas: number; paso: number; dur: number }[];
  /** Segundos de audio que se devuelven como WAV (0: nada). */
  wav?: number;
}

const db = (x: number): number => (x > 0 ? 20 * Math.log10(x) : -Infinity);
const r2 = (x: number): number => (Number.isFinite(x) ? Math.round(x * 100) / 100 : -120);

/** Un filtro de segundo orden (forma directa I). */
function bicuad(x: Float32Array, b: [number, number, number], a: [number, number, number]): Float32Array {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let k = 0; k < x.length; k++) {
    const v = b[0] * x[k] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
    x2 = x1;
    x1 = x[k];
    y2 = y1;
    y1 = v;
    y[k] = v;
  }
  return y;
}
/** Un Butterworth de segundo orden (pasabajos o pasaaltos) en `hz`. */
function butter(x: Float32Array, tipo: 'bajo' | 'alto', hz: number): Float32Array {
  const w = Math.tan((Math.PI * hz) / FS);
  const n = 1 / (1 + Math.SQRT2 * w + w * w);
  const a: [number, number, number] = [1, 2 * (w * w - 1) * n, (1 - Math.SQRT2 * w + w * w) * n];
  return tipo === 'bajo' ? bicuad(x, [w * w * n, 2 * w * w * n, w * w * n], a) : bicuad(x, [n, -2 * n, n], a);
}
/** La sonoridad integrada aproximada (ITU-R BS.1770: ponderación K a 48 kHz, sin puertas). */
function lufs(canales: Float32Array[]): number {
  let suma = 0;
  for (const c of canales) {
    const k = bicuad(bicuad(c, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]), [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]);
    let e = 0;
    for (let n = 0; n < k.length; n++) e += k[n] * k[n];
    suma += e / k.length;
  }
  return suma > 0 ? -0.691 + 10 * Math.log10(suma) : -Infinity;
}
/** El reparto de la energía entre bandas separadas por `cortes` Hz (FFT de 4096 con ventana de Hann, promediada). */
function energiaPorBandas(x: Float32Array, cortes: number[]): number[] {
  const N = 4096;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const ventana = Float64Array.from({ length: N }, (_, k) => 0.5 - 0.5 * Math.cos((2 * Math.PI * k) / N));
  const dentro = cortes.map(() => 0).concat(0);
  let total = 0;
  for (let ini = 0; ini + N <= x.length; ini += N / 2) {
    for (let k = 0; k < N; k++) {
      re[k] = x[ini + k] * ventana[k];
      im[k] = 0;
    }
    // FFT de base 2, en su sitio
    for (let i = 1, j = 0; i < N; i++) {
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        [re[i], re[j]] = [re[j], re[i]];
        [im[i], im[j]] = [im[j], im[i]];
      }
    }
    for (let len = 2; len <= N; len <<= 1) {
      const ang = (-2 * Math.PI) / len;
      const wr = Math.cos(ang);
      const wi = Math.sin(ang);
      for (let i = 0; i < N; i += len) {
        let cr = 1;
        let ci = 0;
        for (let j = 0; j < len / 2; j++) {
          const a = i + j;
          const b = a + len / 2;
          const tr = re[b] * cr - im[b] * ci;
          const ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr;
          im[b] = im[a] - ti;
          re[a] += tr;
          im[a] += ti;
          const n = cr * wr - ci * wi;
          ci = cr * wi + ci * wr;
          cr = n;
        }
      }
    }
    for (let k = 1; k < N / 2; k++) {
      const p = re[k] * re[k] + im[k] * im[k];
      total += p;
      const f = (k * FS) / N;
      let b = 0;
      while (b < cortes.length && f >= cortes[b]) b++;
      dentro[b] += p;
    }
  }
  return dentro.map((e) => (total > 0 ? e / total : 0));
}

/** Un compás de la partitura, en texto. */
function compasEnTexto(c: T.Compas): string {
  const capas: string[] = [];
  for (const id of T.CAPAS) {
    const n = c.notas[id];
    const g = c.golpes[id];
    if (n) capas.push(`${id}: ${T.notasEnTexto(n)}`);
    if (g) capas.push(`${id}: ${T.golpesEnTexto(g)}`);
  }
  const v = c.variante;
  const marca = [v.adorno ? 'adorno' : '', v.fantasma ? 'fantasma' : '', v.respiro ? 'respiro' : ''].filter(Boolean).join('+');
  const ar = c.arreglo;
  return `c${c.compas + 1} [${c.seccion} · lugar ${ar.pos + 1}/4 · tema ${ar.tema}${ar.contracanto ? ' + contracanto' : ''}] ${c.acorde.nombre}${marca ? ` (${marca})` : ''} · ${capas.join(' · ')}`;
}

/** Un WAV de 16 bits, estéreo, en base64. */
function aWav(l: Float32Array, r: Float32Array, n: number): string {
  const datos = new DataView(new ArrayBuffer(44 + n * 4));
  const txt = (p: number, s: string): void => [...s].forEach((ch, k) => datos.setUint8(p + k, ch.charCodeAt(0)));
  txt(0, 'RIFF');
  datos.setUint32(4, 36 + n * 4, true);
  txt(8, 'WAVEfmt ');
  datos.setUint32(16, 16, true);
  datos.setUint16(20, 1, true);
  datos.setUint16(22, 2, true);
  datos.setUint32(24, FS, true);
  datos.setUint32(28, FS * 4, true);
  datos.setUint16(32, 4, true);
  datos.setUint16(34, 16, true);
  txt(36, 'data');
  datos.setUint32(40, n * 4, true);
  for (let k = 0; k < n; k++) {
    datos.setInt16(44 + k * 4, Math.max(-32768, Math.min(32767, Math.round(l[k] * 32767))), true);
    datos.setInt16(46 + k * 4, Math.max(-32768, Math.min(32767, Math.round(r[k] * 32767))), true);
  }
  const bytes = new Uint8Array(datos.buffer);
  let bin = '';
  for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
  return btoa(bin);
}

/** Renderiza un pedido y lo mide. */
export async function medir(p: Pedido): Promise<Medida> {
  // (los efectos leen el ruido desde un punto al azar: acá, con semilla, para que la medición se repita igual)
  const azar = Math.random;
  const sembrado = T.azarDe(4242);
  Math.random = sembrado;
  const segundos = p.compases * T.SEG_COMPAS + 1.5;
  // seis canales: 0–1 la salida, 2–3 lo que sale del maestro antes del techo, 4–5 la suma que entra al compresor
  const ctx = new OfflineAudioContext(6, Math.ceil(segundos * FS), FS);
  const junta = ctx.createChannelMerger(6);
  junta.connect(ctx.destination);
  const a = (canal: number): AudioNode => {
    const g = ctx.createGain();
    g.channelCount = 2;
    g.channelCountMode = 'explicit';
    const parte = ctx.createChannelSplitter(2);
    g.connect(parte);
    parte.connect(junta, 0, canal);
    parte.connect(junta, 1, canal + 1);
    return g;
  };
  const bus = crearBus(ctx, a(0), { preTecho: (n) => n.connect(a(2)), entrada: (n) => n.connect(a(4)) });
  const m = new Motor(ctx, { musica: bus.musica, efectos: bus.efectos, sala: bus.sala });
  m.registro = [];
  m.solo = p.solo ?? null;
  m.pedir({ ...T.ESTADO_INICIAL, ...p.estado });
  if (p.furia !== undefined) m.rtpc({ furia: p.furia });
  if (!p.sinMusica) {
    m.activar(true, 0);
    m.abrir(true, 0);
  }
  const t0 = m.tiempoDe(m.paso);
  const sonados: string[] = [];
  const ruido = crearRuido(ctx, 1, 3);
  const ventanas: { id: string; t: number; dur: number; auto?: boolean }[] = (p.ventanas ?? []).map((v) => ({ id: v.id, t: t0 + (v.compas * T.PASOS + v.paso) * T.SEG_PASO, dur: v.dur }));
  /** Programa un compás, semicorchea por semicorchea: los cambios, lo que se canta y los stingers entran «en vivo», como en el juego. */
  const programarCompas = (c: number): void => {
    Math.random = sembrado;
    for (let k = 0; k < T.PASOS; k++) {
      const ahora = t0 + (c * T.PASOS + k) * T.SEG_PASO;
      for (const x of p.cambios ?? [])
        if (x.compas === c && (x.paso ?? 0) === k) {
          m.pedir(x.estado, ahora);
          if (x.furia !== undefined) m.rtpc({ furia: x.furia }, ahora);
        }
      m.planificarHasta(ahora + 0.001);
      for (const x of p.efectos ?? [])
        if (x.compas === c && x.paso === k) {
          if (!x.mudo) sonarEn(ctx, bus.fx, ruido, x.cual, ahora, { acorde: m.armonia(ahora).acorde, palo: x.palo, altura: x.altura, sube: x.sube });
          if (x.mide) ventanas.push({ id: x.cual, t: ahora, dur: 1.1, auto: true });
          if (x.agache) {
            // lo mismo que `agacharMusica` en el juego: −6 dB (o los que se pidan) en 20 ms, se sostiene y vuelve en 250 ms
            const g = bus.musica.gain;
            const abajo = 10 ** ((x.db ?? -6) / 20);
            g.setValueAtTime(1, ahora);
            g.linearRampToValueAtTime(abajo, ahora + 0.02);
            g.setValueAtTime(abajo, ahora + x.agache / 1000);
            g.linearRampToValueAtTime(1, ahora + x.agache / 1000 + 0.25);
          }
        }
      for (const x of p.remates ?? []) if (x.compas === c && x.paso === k) m.rematar(!!x.mayor, ahora);
      for (const x of p.cantos ?? [])
        if (x.compas === c && x.paso === k) {
          const dura = m.cantar(x.quien, x.texto, { idioma: x.idioma, breve: x.breve, mudo: p.cantosMudos }, ahora - 0.02);
          const ini = m.cantadas[m.cantadas.length - 1].inicio;
          ventanas.push({ id: `canto:${x.quien}:${ventanas.length}`, t: ini, dur: Math.max(0.1, ahora - 0.02 + dura - ini) });
        }
      for (const x of p.stingers ?? [])
        if (x.compas === c && x.paso === k) {
          const ar = m.armonia(ahora);
          const notas = m.stinger(x.id, ahora);
          sonados.push(`${x.id} en c${c + 1}:${k} sobre ${ar.acorde.nombre} (viene ${ar.siguiente.nombre}) → ${notas.map((n) => T.nombreNota(n.midi)).join(' ')}`);
        }
      for (const x of p.vocales ?? [])
        if (x.compas === c && x.paso === k) {
          m.vocalizar(x.quien, x.vocal, x.midi, ahora, x.dur);
          // la ventana deja afuera el ataque y la cola
          ventanas.push({ id: x.id, t: ahora + 0.08, dur: x.dur - 0.12 });
        }
    }
    if (c === p.compases - 1) {
      m.planificarHasta(t0 + p.compases * T.SEG_COMPAS);
      // se suelta todo al final del último compás: la cola de la sala entra en la medición
      m.abrir(false, t0 + p.compases * T.SEG_COMPAS);
    }
    Math.random = azar;
  };
  // El render se detiene 120 ms antes de cada compás y recién ahí se programa ese compás (como en el juego, que
  // planifica sobre la marcha): con todo programado de entrada, miles de nodos que todavía no suenan viven en el grafo
  // y un render de 75 s tardaba un minuto.
  programarCompas(0);
  for (let c = 1; c < p.compases; c++) {
    const t = (Math.floor(((t0 + c * T.SEG_COMPAS - 0.12) * FS) / 128) * 128) / FS;
    void ctx.suspend(t).then(() => {
      programarCompas(c);
      void ctx.resume();
    });
  }
  const buf = await ctx.startRendering();
  const canales = [buf.getChannelData(0), buf.getChannelData(1)];
  const pre = [buf.getChannelData(2), buf.getChannelData(3)];
  const ent = [buf.getChannelData(4), buf.getChannelData(5)];
  let pico = 0;
  let picoPre = 0;
  let recortes = 0;
  let sobre = 0;
  let e = 0;
  let eLado = 0;
  let eMedio = 0;
  const mono = new Float32Array(buf.length);
  for (let k = 0; k < buf.length; k++) {
    const l = canales[0][k];
    const r = canales[1][k];
    for (const x of [l, r]) {
      const ab = Math.abs(x);
      if (ab > pico) pico = ab;
      if (ab >= 0.999) recortes++;
      e += x * x;
    }
    for (const x of [pre[0][k], pre[1][k]]) {
      const ab = Math.abs(x);
      if (ab > picoPre) picoPre = ab;
      if (ab > BUS.techo.rodilla) sobre++;
    }
    mono[k] = (l + r) / 2;
    eMedio += ((l + r) / 2) ** 2;
    eLado += ((l - r) / 2) ** 2;
  }
  // el compresor + el limitador: su ganancia (salida del maestro / entrada) en ventanas de 50 ms. Los dos compresores
  // de Chromium miran 6 ms por delante cada uno: la salida llega 12 ms tarde, y se compara con la entrada de 12 ms
  // antes. La ganancia de reposo es la mayor entre las ventanas flojas (entrada entre −50 y −30 dBFS: por debajo de la
  // rodilla); la reducción, lo que le falta a la ventana más apretada para llegar a ella
  const V = Math.floor(0.05 * FS);
  const RETARDO = Math.round(0.012 * FS);
  let gMax = -Infinity;
  let gMin = Infinity;
  const rmsV: number[] = [];
  let fuerte = -Infinity;
  let cresta = 0;
  for (let ini = RETARDO; ini + V <= buf.length; ini += V) {
    let ee = 0;
    let ep = 0;
    for (let k = ini; k < ini + V; k++) {
      ee += ent[0][k - RETARDO] ** 2 + ent[1][k - RETARDO] ** 2;
      ep += pre[0][k] ** 2 + pre[1][k] ** 2;
    }
    const nivel = 10 * Math.log10(ee / (2 * V) || 1e-12);
    if (nivel < -50) continue;
    const g = 10 * Math.log10(ep / ee);
    if (nivel < -30) gMax = Math.max(gMax, g);
    gMin = Math.min(gMin, g);
  }
  // (si ninguna ventana quedó floja, la ganancia de reposo es la que da la cuenta: +5,0 y +1,7 dB de los dos
  // compresores y −2,6 dB del maestro)
  if (!Number.isFinite(gMax)) gMax = 4.1;
  const V1 = Math.floor(0.1 * FS);
  for (let ini = 0; ini + V1 <= buf.length; ini += V1) {
    let es = 0;
    for (let k = ini; k < ini + V1; k++) es += mono[k] ** 2;
    const x = db(Math.sqrt(es / V1));
    if (x > -70) rmsV.push(x);
  }
  // el factor de cresta, en el segundo más fuerte
  for (let ini = 0; ini + FS <= buf.length; ini += FS / 2) {
    let es = 0;
    let pk = 0;
    for (let k = ini; k < ini + FS; k++) {
      for (const x of [canales[0][k], canales[1][k]]) {
        es += x * x;
        pk = Math.max(pk, Math.abs(x));
      }
    }
    const nivel = db(Math.sqrt(es / (2 * FS)));
    if (nivel > fuerte) {
      fuerte = nivel;
      cresta = db(pk) - nivel;
    }
  }
  rmsV.sort((x, y) => x - y);
  let fuera = 0;
  const partitura: string[] = [];
  if (p.tipo === 'escena') partitura.push(...m.registro.slice(0, 9).map(compasEnTexto));
  for (const f of m.cantadas) {
    const v = T.VOCES[f.quien];
    for (const n of f.notas) for (const x of [n.midi, ...(n.adorno === 'trino' ? [] : n.adornos)]) if (n.grado === '–' || x < v.grave || x > v.agudo) fuera++;
    partitura.push(`${f.quien} (${v.cuerda}, ${T.nombreNota(v.grave)}–${T.nombreNota(v.agudo)}) canta «${f.texto}»`);
    partitura.push(...f.notas.map((n) => `  ${n.silaba} [${n.consonante.tipo === 'ninguna' ? 'vocal' : `${n.consonante.tipo} ${n.consonante.lugar}`}]${n.adorno ? ` [${n.adorno}: ${n.adornos.map(T.nombreNota).join(' ')}]` : ''} → ${T.nombreNota(n.midi)} · ${n.grado} de ${n.acorde}${n.cita ? ' · cita su motivo' : n.regla !== 'libre' ? ` · ${n.regla}` : ''} · ${n.dur} semicorchea${n.dur > 1 ? 's' : ''}`));
  }
  partitura.push(...sonados);
  const voz = butter(butter(mono, 'alto', 300), 'bajo', 3000);
  const momentos: Momento[] = ventanas.map((v) => {
    const desde = Math.max(1, Math.floor(v.t * FS));
    let hasta = Math.min(buf.length, desde + Math.floor(v.dur * FS));
    if (v.auto) {
      // la ventana de un efecto: desde que arranca hasta que juntó el 90 % de su energía (al menos 40 ms)
      let total = 0;
      for (let k = desde; k < hasta; k++) total += mono[k] * mono[k];
      let ac = 0;
      let k = desde;
      for (; k < hasta && ac < total * 0.9; k++) ac += mono[k] * mono[k];
      hasta = Math.max(k, desde + Math.floor(0.04 * FS));
    }
    let e2 = 0;
    let d2 = 0;
    let v2 = 0;
    let pk = 0;
    for (let k = desde; k < hasta; k++) {
      e2 += mono[k] * mono[k];
      d2 += (mono[k] - mono[k - 1]) ** 2;
      v2 += voz[k] * voz[k];
      pk = Math.max(pk, Math.abs(canales[0][k]), Math.abs(canales[1][k]));
    }
    const n = Math.max(1, hasta - desde);
    return { id: v.id, rms: r2(db(Math.sqrt(e2 / n))), pico: r2(db(pk)), brillo: r2(db(Math.sqrt(d2 / n))), rmsVoz: r2(db(Math.sqrt(v2 / n))), dur: r2(n / FS) };
  });
  const bandas = energiaPorBandas(mono, [120, 500, 2500, 5000]).map((x) => Math.round(x * 10000) / 10000);
  const rmsMono = Math.sqrt(eMedio / buf.length);
  const n = p.wav ? Math.min(buf.length, Math.floor(p.wav * FS)) : 0;
  return {
    id: p.id,
    tipo: p.tipo,
    que: p.que,
    segundos: r2(buf.duration),
    pico: r2(db(pico)),
    recortes,
    rms: r2(db(Math.sqrt(e / (buf.length * 2)))),
    lufs: r2(lufs(canales)),
    banda: bandas[3],
    bandas,
    b120a300: r2(db(rmsMono * Math.sqrt(energiaPorBandas(mono, [120, 300])[1]))),
    fuera,
    ancho: r2(10 * Math.log10(eLado / (eMedio || 1e-12) || 1e-12)),
    mediana: r2(rmsV.length ? rmsV[Math.floor(rmsV.length / 2)] : -120),
    dinamica: { picoPreTecho: r2(db(picoPre)), picoSalida: r2(db(pico)), techoDb: r2(db(picoPre) - db(pico)), sobreRodilla: Math.round((sobre / (buf.length * 2)) * 1e6) / 1e6, reduccion: r2(Number.isFinite(gMin) ? Math.max(0, gMax - gMin) : 0), cresta: r2(cresta) },
    nodosPorSegundo: r2(m.nodos / (p.compases * T.SEG_COMPAS)),
    momentos,
    partitura,
    ...(n ? { wav: aWav(canales[0], canales[1], n) } : {}),
  };
}

/** El catálogo de la paleta de efectos: cada uno con su familia, su nivel y cuántos dB tiene que quedar sobre la música. */
export const catalogoFx = (): { id: Sonido; familia: Familia; nivel: number; sobre: number }[] => (Object.keys(NIVEL_FX) as Sonido[]).map((id) => ({ id, familia: familiaDe(id), nivel: NIVEL_FX[id], sobre: SOBRE[familiaDe(id)] }));

/** Los números fijos de la cadena (para el resumen). */
export const cadena = (): unknown => ({ fs: FS, bpm: T.BPM, segCompas: T.SEG_COMPAS, bus: BUS });
