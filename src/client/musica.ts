// La música: un secuenciador chico sobre WebAudio, sin archivos. Cada pantalla tiene su pista (milonga en la portada,
// vals criollo en la Pulpería, rasguido lento en el Fogón, galope frigio contra los Reyes): un bajo, un rasgueo, un
// canto y percusión de ruido. El canto de cada pista se compone solo, una vez y con semilla fija: notas del acorde en
// los tiempos fuertes y grados vecinos de la escala entre medio, así siempre suena igual y siempre entona.
import { ajustes } from './almacen';
import { alAbrirAudio, contextoAudio, salidaMusica } from './audio';

export type PistaId = 'portada' | 'mapa' | 'mesa' | 'rey' | 'pulperia' | 'fogon' | 'cabala' | 'derrota';

export interface Pista {
  bpm: number;
  /** Semicorcheas por compás: 16 es un 4/4, 12 un 3/4. */
  pasos: number;
  /** La tónica, en número MIDI. */
  tonica: number;
  escala: number[];
  /** Un acorde por compás: semitonos desde la tónica (raíz, tercera, quinta). */
  acordes: number[][];
  /** Bajo y rasgueo: `0`, `1`, `2` son las notas del acorde, `3` la raíz una octava arriba, `c` el acorde entero. */
  bajo: string;
  rasgueo: string;
  /** Los ritmos del canto (uno por compás, en ronda): `x` es una nota. */
  canto: string[];
  bombo?: string;
  caja?: string;
  plato?: string;
  ondas: [bajo: OscillatorType, rasgueo: OscillatorType, canto: OscillatorType];
  vol: [bajo: number, rasgueo: number, canto: number, percusion: number];
  /** El canto suena doblado, apenas desafinado (un fuelle). */
  fuelle?: boolean;
  semilla: number;
}

const MENOR = [0, 2, 3, 5, 7, 8, 10];
const MAYOR = [0, 2, 4, 5, 7, 9, 11];
const DORICA = [0, 2, 3, 5, 7, 9, 10];
const FRIGIA = [0, 1, 3, 5, 7, 8, 10];
const ARMONICA = [0, 2, 3, 5, 7, 8, 11];
// acordes, en semitonos desde la tónica
const i = [0, 3, 7], iv = [5, 8, 12], V = [7, 11, 14], VI = [8, 12, 15], VII = [10, 14, 17], III = [3, 7, 10];
const I = [0, 4, 7], IV = [5, 9, 12], vi = [9, 12, 16], ii = [2, 5, 9], bII = [1, 5, 8], vii = [10, 13, 17];

export const PISTAS: Record<PistaId, Pista> = {
  // milonga campera: el bajo en 3 + 3 + 2
  portada: {
    bpm: 96, pasos: 16, tonica: 57, escala: MENOR, acordes: [i, i, iv, i, VI, V, i, V],
    bajo: '0.....2.....0.2.', rasgueo: '..0.1.2...1.2.1.',
    canto: ['x.....x.x...x...', 'x...x.x.....x.x.', 'x.....x.x.x.x...', 'x.......x.......'],
    bombo: 'x.....x.....x...', plato: '..x...x...x...x.',
    ondas: ['triangle', 'triangle', 'square'], vol: [0.16, 0.05, 0.036, 0.5], fuelle: true, semilla: 11,
  },
  // el camino: un paseo dórico, liviano
  mapa: {
    bpm: 108, pasos: 16, tonica: 50, escala: DORICA, acordes: [i, VII, i, IV, i, VII, III, IV],
    bajo: '0...2...0...2.3.', rasgueo: '0.1.2.1.0.1.2.1.',
    canto: ['x...x.x.x...x...', 'x.x...x...x.....', 'x...x.x.x.x.x...', 'x.....x.........'],
    bombo: 'x.......x.......', plato: '..x...x...x...x.',
    ondas: ['triangle', 'triangle', 'triangle'], vol: [0.15, 0.04, 0.085, 0.4], semilla: 23,
  },
  // la mesa: corcheas que empujan
  mesa: {
    bpm: 132, pasos: 16, tonica: 52, escala: MENOR, acordes: [i, i, VI, VII, i, i, iv, V],
    bajo: '0.0.3.0.0.0.3.2.', rasgueo: '0.1.2.3.2.1.2.1.',
    canto: ['x..x..x.x...x.x.', 'x.x.x..x..x.....', 'x..x..x.x.x.x.x.', 'x.......x..x..x.'],
    bombo: 'x...x...x...x...', caja: '....x.......x...', plato: '..x...x...x...x.',
    ondas: ['triangle', 'square', 'square'], vol: [0.17, 0.02, 0.036, 0.6], semilla: 37,
  },
  // el Rey: galope frigio, con diente de sierra
  rey: {
    bpm: 150, pasos: 16, tonica: 50, escala: FRIGIA, acordes: [i, i, bII, i, i, vii, bII, i],
    bajo: '0..00..00..00.3.', rasgueo: '3.2.1.2.3.2.1.2.',
    canto: ['x...x...x.x.x...', 'x.x.....x...x.x.', 'x...x.x.x...x...', 'x.......x.x.x.x.'],
    bombo: 'x..x..x.x..x..x.', caja: '....x.......x...', plato: 'x.x.x.x.x.x.x.x.',
    ondas: ['sawtooth', 'square', 'sawtooth'], vol: [0.075, 0.02, 0.034, 0.65], semilla: 53,
  },
  // la Pulpería: vals criollo (bajo en el uno, acorde en el dos y el tres)
  pulperia: {
    bpm: 150, pasos: 12, tonica: 60, escala: MAYOR, acordes: [I, vi, ii, V, I, IV, V, I],
    bajo: '0...........', rasgueo: '....c...c...',
    canto: ['x...x.x.x...', 'x.......x...', 'x.x.x...x...', 'x...........'],
    bombo: 'x...........', plato: '....x...x...',
    ondas: ['triangle', 'triangle', 'square'], vol: [0.16, 0.035, 0.034, 0.35], fuelle: true, semilla: 71,
  },
  // el Fogón: una guitarra sola, lenta
  fogon: {
    bpm: 72, pasos: 16, tonica: 57, escala: MENOR, acordes: [i, VI, III, VII],
    bajo: '0...............', rasgueo: '0.1.2.3.2.1.2.1.',
    canto: ['x.......x...x...', 'x...........x...', 'x.....x.x.......', 'x...............'],
    ondas: ['triangle', 'triangle', 'triangle'], vol: [0.13, 0.06, 0.07, 0], semilla: 89,
  },
  // la Cábala y el Altar: campanitas sobre una menor armónica
  cabala: {
    bpm: 84, pasos: 16, tonica: 59, escala: ARMONICA, acordes: [i, bII, i, V],
    bajo: '0.......0.......', rasgueo: '0...2...1...2...',
    canto: ['x.....x...x.....', 'x.........x.x...', 'x...x.....x.....', 'x...............'],
    plato: '........x.......',
    ondas: ['triangle', 'sine', 'sine'], vol: [0.12, 0.07, 0.09, 0.25], semilla: 97,
  },
  // la derrota: un lamento
  derrota: {
    bpm: 60, pasos: 16, tonica: 57, escala: MENOR, acordes: [i, iv, i, V],
    bajo: '0.......2.......', rasgueo: '..0...1...2...1.',
    canto: ['x.......x.......', 'x...x...x.......'],
    ondas: ['triangle', 'triangle', 'triangle'], vol: [0.13, 0.045, 0.075, 0], semilla: 5,
  },
};

interface NotaCanto {
  midi: number;
  /** Duración, en pasos. */
  largo: number;
}
const cantos = new Map<PistaId, (NotaCanto | null)[]>();

/**
 * Compone el canto de una pista: una vez, con su semilla. La primera mitad se inventa (notas del acorde en los
 * tiempos fuertes, grados vecinos entre medio); la segunda repite su dibujo sobre los acordes nuevos, así la pista
 * tiene una frase que se reconoce y su respuesta.
 */
export function componer(id: PistaId): (NotaCanto | null)[] {
  const ya = cantos.get(id);
  if (ya) return ya;
  const p = PISTAS[id];
  let s = p.semilla * 2654435761;
  const azar = (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  // el registro del canto: ni grave (se pisa con el rasgueo) ni chillón
  const piso = p.tonica + 7;
  const techo = p.tonica + 22;
  const enRegistro = (semis: number[]): number[] => {
    const out: number[] = [];
    for (let o = -1; o <= 3; o++) for (const x of semis) if (p.tonica + 12 * o + x >= piso && p.tonica + 12 * o + x <= techo) out.push(p.tonica + 12 * o + x);
    return [...new Set(out)].sort((m, n) => m - n);
  };
  const escala = enRegistro(p.escala);
  const cerca = (lista: number[], a: number): number => lista.reduce((m, x) => (Math.abs(x - a) < Math.abs(m - a) ? x : m), lista[0]);
  const grado = (midi: number): number => escala.indexOf(cerca(escala, midi));
  const total = p.acordes.length * p.pasos;
  const notas: (NotaCanto | null)[] = Array.from({ length: total }, () => null);
  const mitad = p.acordes.length / 2;
  /** Por compás: los grados de la escala de cada nota (para repetir el dibujo). */
  const dibujo: number[][] = [];
  let anterior = piso + 7;
  for (let c = 0; c < p.acordes.length; c++) {
    const ritmo = p.canto[c % p.canto.length];
    const acorde = enRegistro(p.acordes[c].map((x) => x % 12));
    const golpes = [...ritmo].map((ch, k) => (ch === 'x' ? k : -1)).filter((k) => k >= 0);
    const modelo = c >= mitad && p.canto[(c - mitad) % p.canto.length] === ritmo ? dibujo[c - mitad] : null;
    dibujo[c] = [];
    golpes.forEach((k, n) => {
      const fuerte = k % 4 === 0;
      const ultima = c === p.acordes.length - 1 && n === golpes.length - 1;
      let midi: number;
      if (modelo) {
        // la respuesta: el mismo dibujo, apoyado en el acorde de este compás
        const paso = n === 0 ? 0 : modelo[n] - modelo[n - 1];
        const libre = n === 0 ? escala[modelo[0]] : escala[Math.max(0, Math.min(escala.length - 1, grado(anterior) + paso))];
        midi = fuerte || ultima ? cerca(acorde, libre) : libre;
      } else if (ultima) midi = cerca(acorde, anterior);
      else if (fuerte) midi = cerca(acorde, anterior + Math.round((azar() - 0.5) * 7));
      else midi = escala[Math.max(0, Math.min(escala.length - 1, grado(anterior) + (azar() < 0.5 ? -1 : 1)))];
      const hasta = golpes[n + 1] ?? p.pasos;
      notas[c * p.pasos + k] = { midi, largo: Math.min(hasta - k, 6) };
      dibujo[c].push(grado(midi));
      anterior = midi;
    });
  }
  cantos.set(id, notas);
  return notas;
}

// ───────────── la orquesta ─────────────

let maestro: GainNode | null = null;
let ruido: AudioBuffer | null = null;
let sonando: { id: PistaId; sale: GainNode; paso: number; t: number } | null = null;
let deseada: PistaId | null = null;
let reloj = 0;
/** Las pistas que sonaron (para la QA, que no oye). */
export const pistasSonadas: PistaId[] = [];
let pasosDados = 0;

const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

function nota(ctx: AudioContext, a: AudioNode, t: number, midi: number, dur: number, onda: OscillatorType, vol: number, desafina = 0): void {
  const osc = ctx.createOscillator();
  const gan = ctx.createGain();
  osc.type = onda;
  osc.frequency.setValueAtTime(hz(midi), t);
  if (desafina) osc.detune.setValueAtTime(desafina, t);
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.linearRampToValueAtTime(vol, t + 0.008);
  gan.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  osc.connect(gan).connect(a);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}
function golpeRuido(ctx: AudioContext, a: AudioNode, t: number, dur: number, vol: number, corte: number, tipo: BiquadFilterType): void {
  if (!ruido) {
    ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const d = ruido.getChannelData(0);
    let s = 1;
    for (let k = 0; k < d.length; k++) {
      s = (s * 16807) % 2147483647;
      d[k] = (s / 2147483647) * 2 - 1;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = ruido;
  const fil = ctx.createBiquadFilter();
  fil.type = tipo;
  fil.frequency.value = corte;
  const gan = ctx.createGain();
  gan.gain.setValueAtTime(vol, t);
  gan.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  src.connect(fil).connect(gan).connect(a);
  src.start(t);
  src.stop(t + dur + 0.02);
}
function bombo(ctx: AudioContext, a: AudioNode, t: number, vol: number): void {
  const osc = ctx.createOscillator();
  const gan = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, t);
  osc.frequency.exponentialRampToValueAtTime(46, t + 0.11);
  gan.gain.setValueAtTime(vol, t);
  gan.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
  osc.connect(gan).connect(a);
  osc.start(t);
  osc.stop(t + 0.18);
}

/** Programa todo lo que suena en un paso de la pista. */
function programar(ctx: AudioContext, s: NonNullable<typeof sonando>): void {
  const p = PISTAS[s.id];
  const largo = p.acordes.length * p.pasos;
  const vuelta = Math.floor(s.paso / largo);
  const abs = s.paso % largo;
  const compas = Math.floor(abs / p.pasos);
  const k = abs % p.pasos;
  const acorde = p.acordes[compas];
  const seg = 60 / p.bpm / 4;
  const t = s.t;
  const tono = (ch: string, octava: number): number[] => (ch === 'c' ? acorde.map((x) => p.tonica + x + octava) : ch === '3' ? [p.tonica + acorde[0] + 12 + octava] : [p.tonica + acorde[Number(ch)] + octava]);
  const b = p.bajo[k];
  if (b && b !== '.') for (const m of tono(b, -12)) nota(ctx, s.sale, t, m, seg * 3.4, p.ondas[0], p.vol[0]);
  const r = p.rasgueo[k];
  if (r && r !== '.') for (const m of tono(r, 12)) nota(ctx, s.sale, t, m, seg * 2.2, p.ondas[1], p.vol[1]);
  // el canto calla la primera mitad de las vueltas impares: la pista respira
  const n = componer(s.id)[abs];
  if (n && !(vuelta % 2 === 1 && compas < p.acordes.length / 2)) {
    nota(ctx, s.sale, t, n.midi, seg * n.largo * 0.92, p.ondas[2], p.vol[2]);
    if (p.fuelle) nota(ctx, s.sale, t, n.midi, seg * n.largo * 0.92, p.ondas[2], p.vol[2] * 0.7, 9);
  }
  // la racha encendida: palmas a contratiempo y el rasgueo doblado una octava arriba
  if (fuego) {
    if (k % 4 === 2) golpeRuido(ctx, s.sale, t, 0.05, 0.11, 2600, 'bandpass');
    if (r && r !== '.') for (const m of tono(r, 24)) nota(ctx, s.sale, t, m, seg * 1.6, 'square', p.vol[1] * 0.6);
  }
  if (p.vol[3] > 0) {
    if (p.bombo?.[k] === 'x') bombo(ctx, s.sale, t, 0.3 * p.vol[3]);
    if (p.caja?.[k] === 'x') golpeRuido(ctx, s.sale, t, 0.11, 0.16 * p.vol[3], 1800, 'bandpass');
    if (p.plato?.[k] === 'x') golpeRuido(ctx, s.sale, t, 0.03, 0.07 * p.vol[3], 7000, 'highpass');
  }
}

const VOLUMEN = 0.6;
let fuego = false;
/** Enciende o apaga la capa extra de la música (la racha de Golpes exactos). */
export const ponerFuego = (si: boolean): void => void (fuego = si);

function tic(): void {
  const ctx = contextoAudio();
  if (!ctx) return;
  if (!ajustes.musica || !deseada) {
    callar(ctx);
    return;
  }
  maestro ??= (() => {
    const g = ctx.createGain();
    g.gain.value = VOLUMEN;
    // un pasabajos suave: el chiptune no raspa
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 3600;
    // al bus de la música (que pasa por el compresor y la ganancia maestra, y se agacha en cada hitstop)
    g.connect(f).connect(salidaMusica() ?? ctx.destination);
    return g;
  })();
  if (!sonando || sonando.id !== deseada) {
    callar(ctx);
    const sale = ctx.createGain();
    sale.gain.setValueAtTime(0.0001, ctx.currentTime);
    sale.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.5);
    sale.connect(maestro);
    sonando = { id: deseada, sale, paso: 0, t: ctx.currentTime + 0.12 };
    pistasSonadas.push(deseada);
    if (pistasSonadas.length > 40) pistasSonadas.shift();
  }
  // con la pestaña oculta el reloj va a saltos: la música espera
  if (document.hidden) {
    sonando.t = ctx.currentTime + 0.1;
    return;
  }
  if (sonando.t < ctx.currentTime) sonando.t = ctx.currentTime + 0.03;
  const seg = 60 / PISTAS[sonando.id].bpm / 4;
  while (sonando.t < ctx.currentTime + 0.32) {
    programar(ctx, sonando);
    sonando.paso++;
    sonando.t += seg;
    pasosDados++;
  }
}

/** Apaga la pista que suena (con un fundido corto). */
function callar(ctx: AudioContext): void {
  if (!sonando) return;
  const { sale } = sonando;
  sonando = null;
  try {
    sale.gain.cancelScheduledValues(ctx.currentTime);
    sale.gain.setValueAtTime(sale.gain.value, ctx.currentTime);
    sale.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    window.setTimeout(() => sale.disconnect(), 900);
  } catch {
    // sin audio: nada que apagar
  }
}

/** Pide la pista de la pantalla que se monta. Empieza a sonar cuando el navegador deja abrir el audio. */
export function ponerMusica(id: PistaId | null): void {
  deseada = id;
  if (!reloj && typeof window !== 'undefined') {
    reloj = window.setInterval(tic, 90);
    alAbrirAudio(tic);
  }
}

/** Al cambiar el ajuste: suena o calla ya. */
export const refrescarMusica = (): void => tic();

/** Para la QA: qué pista se pidió, cuál suena y cuántos pasos lleva programados. */
export const estadoMusica = (): { deseada: PistaId | null; suena: PistaId | null; pasos: number } => ({ deseada, suena: sonando?.id ?? null, pasos: pasosDados });
