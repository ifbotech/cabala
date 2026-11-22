// La medición para el juez que no oye (0.28). Renderiza fuera de línea (`OfflineAudioContext`) el MISMO motor y el
// MISMO bus maestro del juego y mide lo que sale: pico, muestras recortadas, RMS, LUFS aproximado (ponderación K sin
// puertas) y la parte de la energía que cae en la banda que cansa (2,5–5 kHz). Además devuelve la partitura en texto.
// Lo llama `scripts/audio-render.ts` (`npm run qa:audio`) desde un Chromium sin cabecera; no se usa en el juego.
import { BUS, crearBus } from './bus';
import { Motor } from './motor';
import * as T from './teoria';

export const FS = 48000;

export interface Medida {
  id: string;
  tipo: 'escena' | 'voz' | 'stinger';
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
  /** Notas cantadas fuera del acorde o de la tesitura (tiene que ser 0). */
  fuera: number;
  partitura: string[];
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
  /** Cambios de estado en el límite de un compás (el viaje por las pantallas). */
  cambios?: { compas: number; estado: Partial<T.EstadoMusical>; furia?: number }[];
  /** Lo que se canta y los stingers que suenan: en qué compás y semicorchea. */
  cantos?: { compas: number; paso: number; quien: T.VozId; texto: string; idioma?: T.Idioma; breve?: boolean }[];
  stingers?: { compas: number; paso: number; id: T.StingerId }[];
}

const db = (x: number): number => (x > 0 ? 20 * Math.log10(x) : -Infinity);
const r2 = (x: number): number => (Number.isFinite(x) ? Math.round(x * 100) / 100 : -120);

/** Un filtro de segundo orden (forma directa I), en su sitio. */
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
  return `c${c.compas + 1} ${c.acorde.nombre}${marca ? ` (${marca})` : ''} · ${capas.join(' · ')}`;
}

/** Renderiza un pedido y lo mide. */
export async function medir(p: Pedido): Promise<Medida> {
  const segundos = p.compases * T.SEG_COMPAS + 1.5;
  const ctx = new OfflineAudioContext(2, Math.ceil(segundos * FS), FS);
  const bus = crearBus(ctx);
  const m = new Motor(ctx, { musica: bus.musica, efectos: bus.efectos, sala: bus.sala });
  m.registro = [];
  m.pedir({ ...T.ESTADO_INICIAL, ...p.estado });
  if (p.furia !== undefined) m.rtpc({ furia: p.furia });
  if (!p.sinMusica) {
    m.activar(true, 0);
    m.abrir(true, 0);
  }
  const t0 = m.tiempoDe(m.paso);
  const sonados: string[] = [];
  for (let c = 0; c < p.compases; c++) {
    for (const x of p.cambios ?? [])
      if (x.compas === c) {
        m.pedir(x.estado);
        if (x.furia !== undefined) m.rtpc({ furia: x.furia });
      }
    // semicorchea por semicorchea: lo que se canta y los stingers entran «en vivo», como en el juego
    for (let k = 0; k < T.PASOS; k++) {
      const ahora = t0 + (c * T.PASOS + k) * T.SEG_PASO;
      m.planificarHasta(ahora + 0.001);
      for (const x of p.cantos ?? []) if (x.compas === c && x.paso === k) m.cantar(x.quien, x.texto, { idioma: x.idioma, breve: x.breve }, ahora - 0.02);
      for (const x of p.stingers ?? [])
        if (x.compas === c && x.paso === k) {
          const a = m.armonia(ahora).acorde;
          const notas = m.stinger(x.id, ahora);
          sonados.push(`${x.id} en c${c + 1}:${k} sobre ${a.nombre} → ${notas.map((n) => `${T.nombreNota(n.midi)}(${T.gradoDe(n.midi, a)})`).join(' ')}`);
        }
    }
  }
  m.planificarHasta(t0 + p.compases * T.SEG_COMPAS);
  // se suelta todo al final del último compás: la cola de la sala entra en la medición
  m.abrir(false, t0 + p.compases * T.SEG_COMPAS);
  const buf = await ctx.startRendering();
  const canales = [buf.getChannelData(0), buf.getChannelData(1)];
  let pico = 0;
  let recortes = 0;
  let e = 0;
  const mono = new Float32Array(buf.length);
  for (const c of canales)
    for (let k = 0; k < c.length; k++) {
      const a = Math.abs(c[k]);
      if (a > pico) pico = a;
      if (a >= 0.999) recortes++;
      e += c[k] * c[k];
      mono[k] += c[k] / 2;
    }
  let fuera = 0;
  const partitura: string[] = [];
  if (p.tipo === 'escena') partitura.push(...m.registro.slice(0, 8).map(compasEnTexto));
  for (const f of m.cantadas) {
    const v = T.VOCES[f.quien];
    for (const n of f.notas) for (const x of [n.midi, ...n.adornos]) if (n.grado === '–' || x < v.grave || x > v.agudo) fuera++;
    partitura.push(`${f.quien} (${v.cuerda}, ${T.nombreNota(v.grave)}–${T.nombreNota(v.agudo)}) canta «${f.texto}»`);
    partitura.push(...f.notas.map((n) => `  ${n.silaba}${n.adorno ? ` [${n.adorno}: ${n.adornos.map(T.nombreNota).join(' ')}]` : ''} → ${T.nombreNota(n.midi)} · ${n.grado} de ${n.acorde}${n.regla !== 'libre' ? ` · ${n.regla}` : ''}`));
  }
  partitura.push(...sonados);
  const bandas = energiaPorBandas(mono, [120, 500, 2500, 5000]).map((x) => Math.round(x * 10000) / 10000);
  return { id: p.id, tipo: p.tipo, que: p.que, segundos: r2(buf.duration), pico: r2(db(pico)), recortes, rms: r2(db(Math.sqrt(e / (buf.length * 2)))), lufs: r2(lufs(canales)), banda: bandas[3], bandas, fuera, partitura };
}

/** Los números fijos de la cadena (para el resumen). */
export const cadena = (): unknown => ({ fs: FS, bpm: T.BPM, segCompas: T.SEG_COMPAS, bus: BUS });
