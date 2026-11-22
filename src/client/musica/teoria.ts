// La teoría de la música de CÁBALA (0.28): pura, sin Web Audio y sin azar que no venga de una semilla. De acá salen
// la armonía de cada compás, los patrones 3-3-2 de la milonga, los motivos de los cuatro Reyes, la partitura de cada
// capa y lo que canta cada personaje. El motor (`motor.ts`) solo le pone timbre y hora a lo que esto escribe, y la
// medición (`scripts/audio-render.ts`) imprime esta misma partitura para el juez que no oye.
//
// Un solo reloj: 104 negras por minuto, compás de 16 semicorcheas, frases de 8 compases. Una sola tonalidad: Re menor
// (la segunda cara de un Rey la sube un tono, a Mi menor). Las pantallas no tienen pistas: tienen SECCIONES (el orden
// de los acordes) y MEZCLAS (qué capas suenan y con qué filtro) sobre ese mismo reloj.

export const BPM = 104;
/** Semicorcheas por compás. */
export const PASOS = 16;
/** Compases por frase: al cerrar cada una, la batería hace su fill. */
export const FRASE = 8;
/** Segundos por semicorchea y por compás. */
export const SEG_PASO = 60 / BPM / 4;
export const SEG_COMPAS = SEG_PASO * PASOS;
/** La síncopa de la milonga: 3 + 3 + 2 corcheas (semicorcheas 0, 6 y 12). */
export const TRES_TRES_DOS = [0, 6, 12] as const;
/** Las semicorcheas impares llegan tarde esta parte de un paso (el swing de las escobillas y el shaker). */
export const SWING = 0.16;

export type EscenaId = 'portada' | 'mapa' | 'mesa' | 'rey' | 'pulperia' | 'fogon' | 'cabala' | 'derrota' | 'victoria';
export type SeccionId = 'base' | 'rey' | 'cabala' | 'derrota' | 'victoria';
export type PaloRey = 'S' | 'C' | 'D' | 'H';
export type VozId = 'bufon' | PaloRey | 'escoba' | 'truco' | 'chinchon' | 'mentiroso' | 'chancho';
export type StingerId = 'escoba' | 'truco' | 'chinchon' | 'mentiroso' | 'chancho' | 'alpelo' | 'exacto' | 'evolucion';
export type Idioma = 'es' | 'en';

// ───────────── el azar con semilla ─────────────

/** Un generador determinista (mulberry32). */
export function azarDe(semilla: number): () => number {
  let s = semilla | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
/** Mezcla varios números en una semilla (para sortear «por compás» sin llevar estado). */
export function clave(...n: number[]): number {
  let h = 0x811c9dc5;
  for (const x of n) {
    h ^= x | 0;
    h = Math.imul(h, 0x01000193);
    h ^= h >>> 13;
  }
  return h | 0;
}
const azarEn = (...n: number[]): number => azarDe(clave(...n))();

// ───────────── la armonía ─────────────

export interface Acorde {
  nombre: string;
  /** La raíz, como clase de altura (0 = Do). */
  raiz: number;
  /** Las notas del acorde como clases de altura: tónica, 3.ª, 5.ª, 7.ª (o 6.ª) y 9.ª (u 11.ª). */
  tonos: number[];
  /** El nombre de cada grado, en el mismo orden que `tonos`. */
  grados: string[];
  /** La escala del compás (7 clases de altura); contiene a todos los tonos. */
  escala: number[];
}

const NATURAL = [0, 2, 3, 5, 7, 8, 10];
const ARMONICA = [0, 2, 3, 5, 7, 8, 11];
const FRIGIA = [0, 1, 3, 5, 7, 8, 10];
const MAYOR = [0, 2, 4, 5, 7, 9, 11];

interface Molde {
  /** El nombre con la tónica en Re (se transporta al escribirlo). */
  cifra: string;
  /** Semitonos de la raíz sobre la tónica. */
  raiz: number;
  intervalos: number[];
  grados: string[];
  escala: number[];
}
const M = (cifra: string, raiz: number, intervalos: number[], grados: string[], escala: number[]): Molde => ({ cifra, raiz, intervalos, grados, escala });
const G9 = ['1', '3', '5', '7', '9'];
/** Los acordes del juego, en grados de la tonalidad menor. */
export const MOLDES = {
  i: M('m9', 0, [0, 3, 7, 10, 14], G9, NATURAL),
  iv: M('m7', 5, [0, 3, 7, 10, 14], G9, NATURAL),
  iv6: M('m6', 5, [0, 3, 7, 9, 14], ['1', '3', '5', '6', '9'], NATURAL),
  V: M('7(b9)', 7, [0, 4, 7, 10, 13], ['1', '3', '5', '7', 'b9'], ARMONICA),
  VI: M('maj7', 8, [0, 4, 7, 11, 14], G9, NATURAL),
  VII: M('9', 10, [0, 4, 7, 10, 14], G9, NATURAL),
  ii: M('m7(b5)', 2, [0, 3, 6, 10, 17], ['1', '3', 'b5', '7', '11'], NATURAL),
  bII: M('maj7', 1, [0, 4, 7, 11, 14], G9, FRIGIA),
  III: M('maj7', 3, [0, 4, 7, 11, 14], G9, NATURAL),
  I: M('6/9', 0, [0, 4, 7, 9, 14], ['1', '3', '5', '6', '9'], MAYOR),
} as const;
export type Grado = keyof typeof MOLDES;

/** Las secciones: 8 compases cada una, un acorde por compás. Todas en la misma tonalidad y sobre el mismo reloj. */
export const SECCIONES: Record<SeccionId, Grado[]> = {
  // la milonga de toda la noche: i – iv – V7 – i – VI – iv6 – iiø – V7
  base: ['i', 'iv', 'V', 'i', 'VI', 'iv6', 'ii', 'V'],
  // el duelo: la cadencia andaluza (i – VII – VI – V) y su vuelta por la subdominante
  rey: ['i', 'VII', 'VI', 'V', 'i', 'iv', 'VI', 'V'],
  // la Cábala y el Altar: la napolitana (bII) le pone el misterio
  cabala: ['i', 'bII', 'iv6', 'V', 'i', 'bII', 'ii', 'V'],
  // la derrota: el lamento no tiene dominante al final; se queda en la tónica
  derrota: ['i', 'iv', 'i', 'V', 'VI', 'iv6', 'ii', 'i'],
  // la victoria: el relativo mayor y la tercera de Picardía (VI – VII – I)
  victoria: ['III', 'VII', 'VI', 'V', 'VI', 'VII', 'I', 'I'],
};
export const SECCION_DE: Record<EscenaId, SeccionId> = { portada: 'base', mapa: 'base', mesa: 'base', pulperia: 'base', fogon: 'base', rey: 'rey', cabala: 'cabala', derrota: 'derrota', victoria: 'victoria' };

const NOMBRES = ['Do', 'Do#', 'Re', 'Mib', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'Sib', 'Si'];
const mod12 = (n: number): number => ((n % 12) + 12) % 12;
/** El nombre de una nota MIDI (Re4 = 62). */
export const nombreNota = (midi: number): string => `${NOMBRES[mod12(midi)]}${Math.floor(midi / 12) - 1}`;
export const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

/** La tónica: Re (2); Mi (4) en la segunda cara de un Rey. */
export const TONICA = 2;
export const TONICA_SEGUNDA = 4;

const cache = new Map<string, Acorde>();
/** El acorde de un grado en una tonalidad. */
export function acordeDeGrado(g: Grado, tonica = TONICA): Acorde {
  const k = `${g}:${tonica}`;
  let a = cache.get(k);
  if (!a) {
    const m = MOLDES[g];
    const raiz = mod12(tonica + m.raiz);
    a = { nombre: `${NOMBRES[raiz]}${m.cifra}`, raiz, tonos: m.intervalos.map((x) => mod12(raiz + x)), grados: [...m.grados], escala: m.escala.map((x) => mod12(tonica + x)) };
    cache.set(k, a);
  }
  return a;
}
/** El acorde y la escala del compás `compas` (contado desde que arrancó el reloj) en una sección. */
export const acordeDe = (seccion: SeccionId, compas: number, tonica = TONICA): Acorde => acordeDeGrado(SECCIONES[seccion][((compas % FRASE) + FRASE) % FRASE], tonica);

/** ¿La nota está en el acorde? ¿En la escala del compás? */
export const enAcorde = (midi: number, a: Acorde): boolean => a.tonos.includes(mod12(midi));
export const enEscala = (midi: number, a: Acorde): boolean => a.escala.includes(mod12(midi));
/** El grado del acorde que canta una nota («1», «3», «5», «7», «9»…), o «–» si no es del acorde. */
export const gradoDe = (midi: number, a: Acorde): string => a.grados[a.tonos.indexOf(mod12(midi))] ?? '–';

/** Todas las notas de esas clases de altura entre dos notas MIDI (inclusive), de grave a agudo. */
export function escalera(clases: number[], grave: number, agudo: number): number[] {
  const out: number[] = [];
  for (let m = Math.ceil(grave); m <= agudo; m++) if (clases.includes(mod12(m))) out.push(m);
  return out;
}
/** La nota de `lista` más cercana a `a` (si empatan, la más grave). */
export const cerca = (lista: number[], a: number): number => lista.reduce((m, x) => (Math.abs(x - a) < Math.abs(m - a) ? x : m), lista[0]);
/** Cuantiza una altura a la nota más cercana del acorde (o de su escala), dentro de un registro. */
export function cuantizar(midi: number, a: Acorde, grave: number, agudo: number, a_que: 'acorde' | 'escala' = 'acorde'): number {
  const l = escalera(a_que === 'acorde' ? a.tonos : a.escala, grave, agudo);
  return l.length ? cerca(l, midi) : Math.round(midi);
}
/** La nota más grave con esa clase de altura desde `piso` (inclusive). */
export const desde = (clase: number, piso: number): number => piso + mod12(clase - piso);

// ───────────── el estado musical ─────────────

export interface EstadoMusical {
  escena: EscenaId;
  /** La intensidad del combate: 1 (tramo 1), 2 (tramo 2), 3 (tramo 3, racha «¡AL PELO!» o Furia alta). */
  nivel: 1 | 2 | 3;
  /** Menos del 30 % de Vida: el latido y el filtro dramático. */
  vidaBaja: boolean;
  /** El Rey que está en la mesa (su motivo suena en la sección del duelo). */
  rey: PaloRey | null;
  segunda: boolean;
}
export const ESTADO_INICIAL: EstadoMusical = { escena: 'portada', nivel: 1, vidaBaja: false, rey: null, segunda: false };

/** La Furia desde la que el combate suena «al máximo». */
export const FURIA_ALTA = 8;
/** El nivel de intensidad que piden el tramo (0, 1, 2), la Furia y la racha. */
export function nivelDe(o: { tramo?: number; furia?: number; racha?: number }): 1 | 2 | 3 {
  const base = Math.max(1, Math.min(3, (o.tramo ?? 0) + 1));
  if ((o.racha ?? 0) >= 2 || (o.furia ?? 0) >= FURIA_ALTA) return 3;
  if ((o.furia ?? 0) >= FURIA_ALTA / 2) return Math.max(2, base) as 2 | 3;
  return base as 1 | 2 | 3;
}
export const tonicaDe = (e: EstadoMusical): number => (e.escena === 'rey' && e.segunda ? TONICA_SEGUNDA : TONICA);
export const acordeDelEstado = (e: EstadoMusical, compas: number): Acorde => acordeDe(SECCION_DE[e.escena], compas, tonicaDe(e));

// ───────────── las capas y sus mezclas ─────────────

export const CAPAS = ['bajo', 'guitarra', 'rasgueo', 'pad', 'cuerdas', 'bandoneon', 'motivo', 'bombo', 'madera', 'escobillas', 'brasas', 'latido'] as const;
export type CapaId = (typeof CAPAS)[number];
/** Las capas que tocan notas (las demás son golpes). */
export const MELODICAS: readonly CapaId[] = ['bajo', 'guitarra', 'rasgueo', 'pad', 'cuerdas', 'bandoneon', 'motivo'];

export interface Mezcla {
  /** La ganancia de cada capa (0 = callada); las que no figuran, calladas. */
  capas: Partial<Record<CapaId, number>>;
  /** El corte del pasabajos cálido de las capas melódicas (Hz) y su resonancia. */
  corte: number;
  q: number;
  /** Cuánta batería va a la sala (la del Mapa suena lejos). */
  sala: number;
  bajo: 'redonda' | 'calmo' | 'milonga' | 'vivo';
  guitarra: 'intimo' | 'milonga' | 'doble';
  rasgueo: 'lento' | 'relajado' | 'firme';
  /** La batería: 0 lejana (Mapa), 1 base, 2 rica, 3 al máximo. */
  bateria: 0 | 1 | 2 | 3;
}

/** Qué suena en cada estado. Las capas entran y salen con rampa en el límite del compás; el reloj no se toca. */
export function mezclaDe(e: EstadoMusical): Mezcla {
  let m: Mezcla;
  switch (e.escena) {
    case 'portada':
      // contrabajo cálido + arpegio íntimo de guitarra + atmósfera
      m = { capas: { bajo: 0.8, guitarra: 1, pad: 0.45 }, corte: 2200, q: 0.6, sala: 0.2, bajo: 'calmo', guitarra: 'intimo', rasgueo: 'relajado', bateria: 1 };
      break;
    case 'mapa':
      // el mismo pulso + madera y bombo lejanos + pad misterioso
      m = { capas: { bajo: 0.75, pad: 0.8, cuerdas: 0.3, bombo: 0.45, madera: 0.6 }, corte: 1700, q: 0.8, sala: 0.6, bajo: 'milonga', guitarra: 'intimo', rasgueo: 'relajado', bateria: 0 };
      break;
    case 'pulperia':
      // la misma armonía tras el pasabajos de taberna, con rasgueo relajado
      m = { capas: { bajo: 0.8, rasgueo: 1, pad: 0.35, bombo: 0.4, madera: 0.35 }, corte: 1300, q: 0.9, sala: 0.25, bajo: 'milonga', guitarra: 'intimo', rasgueo: 'relajado', bateria: 0 };
      break;
    case 'fogon':
      // más cerrada todavía, rasgueo lento y la textura de las brasas
      m = { capas: { bajo: 0.6, rasgueo: 0.8, pad: 0.5, brasas: 1 }, corte: 1100, q: 0.9, sala: 0.3, bajo: 'calmo', guitarra: 'intimo', rasgueo: 'lento', bateria: 1 };
      break;
    case 'cabala':
      m = { capas: { bajo: 0.5, guitarra: 0.6, pad: 0.9, cuerdas: 0.45 }, corte: 1800, q: 1.2, sala: 0.3, bajo: 'calmo', guitarra: 'intimo', rasgueo: 'lento', bateria: 1 };
      break;
    case 'derrota':
      m = { capas: { bajo: 0.6, pad: 0.8, cuerdas: 0.5, bandoneon: 0.5 }, corte: 1200, q: 0.7, sala: 0.3, bajo: 'redonda', guitarra: 'intimo', rasgueo: 'lento', bateria: 1 };
      break;
    case 'victoria':
      m = { capas: { bajo: 1, guitarra: 0.9, rasgueo: 0.7, cuerdas: 0.7, bandoneon: 0.8, bombo: 0.8, madera: 0.6, escobillas: 0.6 }, corte: 3400, q: 0.6, sala: 0.25, bajo: 'vivo', guitarra: 'milonga', rasgueo: 'firme', bateria: 2 };
      break;
    case 'mesa':
    case 'rey': {
      const rey = e.escena === 'rey';
      const n = rey ? (Math.max(2, e.segunda ? 3 : e.nivel) as 2 | 3) : e.nivel;
      // tramo 1: contrabajo + guitarra + batería base
      const capas: Partial<Record<CapaId, number>> = { bajo: 1, guitarra: 1, bombo: 1, madera: 0.7 };
      if (n >= 2) Object.assign(capas, { bandoneon: 0.9, cuerdas: 0.6, pad: 0.4, escobillas: 0.8, madera: 0.85 });
      if (n >= 3) Object.assign(capas, { bandoneon: 1, cuerdas: 0.8, pad: 0.5, escobillas: 1, madera: 1, rasgueo: 0.5 });
      // contra un Rey la melodía es SU motivo: el bandoneón le deja el lugar
      if (rey) Object.assign(capas, { motivo: e.rey ? 1 : 0, bandoneon: e.rey ? 0 : capas.bandoneon });
      m = { capas, corte: [2000, 3000, 3800][n - 1], q: 0.6, sala: 0.18, bajo: n >= 2 ? 'vivo' : 'milonga', guitarra: n >= 3 ? 'doble' : 'milonga', rasgueo: 'firme', bateria: n };
      break;
    }
  }
  // poca Vida: el latido grave al tempo y el filtro que se cierra con resonancia
  if (e.vidaBaja && (e.escena === 'mesa' || e.escena === 'rey')) m = { ...m, capas: { ...m.capas, latido: 1 }, corte: Math.min(m.corte, 950), q: 3.2 };
  return m;
}

// ───────────── la partitura ─────────────

export interface Nota {
  /** La semicorchea del compás (0–15) en la que empieza. */
  paso: number;
  /** Cuánto dura, en semicorcheas. */
  dur: number;
  midi: number;
  /** La fuerza del toque (0–1). */
  vel: number;
}
export interface Golpe {
  paso: number;
  vel: number;
  /** El timbre del golpe dentro de su capa (p. ej. `shaker` en las escobillas, `tom` en el fill). */
  tipo?: string;
}

/** La micro-variación de un compás: se sortea al cerrar cada grupo de 4 y de 8 compases, con semilla. */
export interface Variante {
  /** Un adorno de la guitarra al final del compás. */
  adorno: boolean;
  /** Una nota fantasma del contrabajo que lleva al compás siguiente. */
  fantasma: boolean;
  /** Un silencio de respiro: la guitarra calla la segunda mitad del compás. */
  respiro: boolean;
}
export function varianteDe(compas: number, semilla: number): Variante {
  const k = ((compas % FRASE) + FRASE) % FRASE;
  const r = azarEn(semilla, compas, 71);
  const cierra4 = k % 4 === 3;
  return { adorno: cierra4 && r < 0.4, fantasma: cierra4 && r >= 0.4 && r < 0.75, respiro: k === FRASE - 1 && azarEn(semilla, compas, 73) < 0.4 };
}

/** La humanización de un toque: ±8 ms de tiempo y un 12 % de fuerza (los del 3-3-2 del bombo, la mitad: son el piso). */
export function humanizar(semilla: number, compas: number, paso: number, capa: number, firme = false): { dt: number; vel: number } {
  const r = azarDe(clave(semilla, compas, paso, capa));
  const ms = firme ? 4 : 8;
  return { dt: ((r() * 2 - 1) * ms) / 1000, vel: 0.92 + r() * 0.14 };
}

/** El bombo criollo: siempre 3-3-2. */
export const BOMBO = 'x.....x.....x...';

/** La voz del acorde para la guitarra: tónica, 3.ª, 5.ª, 7.ª y 9.ª, subiendo desde Re3. */
function voces(a: Acorde, piso: number): number[] {
  const v: number[] = [];
  let p = piso;
  for (const c of a.tonos) {
    const m = desde(c, p);
    v.push(m);
    p = m + 1;
  }
  return v;
}

function bajo(a: Acorde, sig: Acorde, modo: Mezcla['bajo'], v: Variante): Nota[] {
  const r = desde(a.raiz, 36);
  const quinta = desde(a.tonos[2], r);
  if (modo === 'redonda') return [{ paso: 0, dur: 14, midi: r, vel: 0.8 }];
  if (modo === 'calmo') return [{ paso: 0, dur: 10, midi: r, vel: 0.85 }, { paso: 12, dur: 4, midi: quinta, vel: 0.6 }];
  // la milonga: tónica, quinta y octava sobre el 3-3-2
  const n: Nota[] = [{ paso: 0, dur: 5, midi: r, vel: 1 }, { paso: 6, dur: 5, midi: quinta, vel: 0.8 }, { paso: 12, dur: modo === 'vivo' ? 2 : 3, midi: r + 12 > 52 ? r : r + 12, vel: 0.85 }];
  if (modo === 'vivo') n.push({ paso: 14, dur: 2, midi: quinta, vel: 0.6 });
  // la nota fantasma: una nota de la escala pegada a la raíz que viene
  if (v.fantasma) {
    const destino = desde(sig.raiz, 36);
    const vecinas = escalera(a.escala, destino - 2, destino + 2).filter((x) => x !== destino);
    if (vecinas.length) n.push({ paso: 15, dur: 1, midi: vecinas[0], vel: 0.4 });
  }
  return n;
}

// el arpegio de la guitarra: [paso, voz del acorde, octava, fuerza]; los acentos caen en el 3-3-2
const ARPEGIO: Record<'intimo' | 'milonga', [number, number, number, number][]> = {
  intimo: [[0, 0, 0, 0.9], [3, 2, 0, 0.5], [6, 3, 0, 0.8], [8, 2, 0, 0.45], [10, 4, 0, 0.55], [12, 1, 1, 0.8], [14, 2, 0, 0.4]],
  milonga: [[0, 0, 0, 1], [2, 2, 0, 0.45], [3, 3, 0, 0.5], [4, 2, 0, 0.4], [6, 1, 1, 0.9], [8, 2, 0, 0.45], [9, 4, 0, 0.55], [10, 2, 0, 0.4], [12, 0, 1, 0.9], [14, 3, 0, 0.5]],
};
function guitarra(a: Acorde, modo: Mezcla['guitarra'], v: Variante): Nota[] {
  const vs = voces(a, 50);
  let n: Nota[] = ARPEGIO[modo === 'intimo' ? 'intimo' : 'milonga'].map(([paso, i, oct, vel]) => ({ paso, dur: 4, midi: vs[i] + 12 * oct, vel }));
  if (v.respiro) n = n.filter((x) => x.paso < 8);
  else if (v.adorno) n.push({ paso: 13, dur: 2, midi: vs[4], vel: 0.5 }, { paso: 15, dur: 2, midi: vs[3], vel: 0.45 });
  // al máximo, los acentos se doblan una octava arriba
  if (modo === 'doble') n.push(...n.filter((x) => (TRES_TRES_DOS as readonly number[]).includes(x.paso)).map((x) => ({ ...x, midi: x.midi + 12, vel: x.vel * 0.5 })));
  return n;
}

function rasgueo(a: Acorde, modo: Mezcla['rasgueo']): Nota[] {
  const vs = voces(a, 50).slice(0, 4);
  const golpes: [number, number, number][] = modo === 'lento' ? [[0, 10, 0.8], [6, 8, 0.45]] : modo === 'relajado' ? [[0, 5, 0.85], [6, 5, 0.55], [12, 2, 0.5]] : [[0, 4, 0.9], [6, 4, 0.7], [10, 1, 0.35], [12, 2, 0.75]];
  return golpes.flatMap(([paso, dur, vel]) => vs.map((midi) => ({ paso, dur, midi, vel })));
}

/** El pad: 3.ª, 7.ª y 9.ª en una ventana fija (La3–Sol#4): los acordes se enlazan solos, sin saltos. */
const pad = (a: Acorde): Nota[] => [a.tonos[1], a.tonos[3], a.tonos[4]].map((c) => ({ paso: 0, dur: 16, midi: desde(c, 57), vel: 0.7 }));
/** Las cuerdas: una nota larga arriba (la 5.ª o la 9.ª, alternando por compás). */
const cuerdas = (a: Acorde, compas: number): Nota[] => [{ paso: 0, dur: 16, midi: desde(a.tonos[compas % 2 ? 4 : 2], 69), vel: 0.6 }];

// los ritmos de la contramelodía del bandoneón (uno por compás, sorteado con la semilla de la frase)
const CELULAS = ['x.....x.....x...', '....x.x.....x.x.', 'x..x..x.........', '......x.x.x.x...', 'x.....x...x.x...', 'x...........x...'];
const BANDONEON: [number, number] = [62, 81];

/**
 * La contramelodía del bandoneón para una frase de 8 compases: notas del acorde en el 3-3-2 y al empezar el compás,
 * grados vecinos de la escala entre medio; la segunda mitad repite el dibujo de la primera sobre los acordes nuevos.
 * Hay tres frases por semilla, que se turnan: se reconoce sin ser un loop.
 */
export function contramelodia(seccion: SeccionId, frase: number, tonica: number, semilla: number): Nota[][] {
  const r = azarDe(clave(semilla, seccion.length * 31 + seccion.charCodeAt(0), ((frase % 3) + 3) % 3, tonica));
  const [grave, agudo] = BANDONEON;
  const out: Nota[][] = [];
  const ritmos: string[] = [];
  const dibujo: number[][] = [];
  let anterior = 69;
  for (let c = 0; c < FRASE; c++) {
    const a = acordeDe(seccion, c, tonica);
    const tonos = escalera(a.tonos, grave, agudo);
    const esc = escalera(a.escala, grave, agudo);
    const eco = c >= FRASE / 2;
    const ritmo = eco ? ritmos[c - FRASE / 2] : CELULAS[Math.floor(r() * CELULAS.length)];
    ritmos.push(ritmo);
    const golpes = [...ritmo].map((ch, k) => (ch === 'x' ? k : -1)).filter((k) => k >= 0);
    const notas: Nota[] = [];
    dibujo[c] = [];
    golpes.forEach((paso, n) => {
      const fuerte = n === 0 || (TRES_TRES_DOS as readonly number[]).includes(paso) || n === golpes.length - 1;
      let objetivo: number;
      if (eco) objetivo = anterior + (n === 0 ? dibujo[c - FRASE / 2][0] : dibujo[c - FRASE / 2][n]);
      else objetivo = fuerte ? anterior + Math.round((r() - 0.5) * 8) : anterior + (r() < 0.5 ? -1.5 : 1.5);
      let midi = cerca(fuerte ? tonos : esc, objetivo);
      // ni saltos de más de una quinta ni la misma nota tres veces
      if (Math.abs(midi - anterior) > 7) midi = cerca(fuerte ? tonos : esc, anterior + Math.sign(midi - anterior) * 5);
      dibujo[c].push(midi - anterior);
      const hasta = golpes[n + 1] ?? PASOS;
      notas.push({ paso, dur: Math.min(hasta - paso, 6), midi, vel: fuerte ? 0.85 : 0.6 });
      anterior = midi;
    });
    out.push(notas);
  }
  return out;
}

// ───────────── los motivos de los cuatro Reyes ─────────────

export interface MotivoRey {
  /** La nota más grave de su registro: cada grado se pone en la primera octava desde acá. */
  piso: number;
  /** Dos compases, que se repiten sobre el acorde de cada compás: [paso, duración, grado del acorde (0–4), octava]. */
  celula: [number, number, number, number][][];
  /** El carácter, para la partitura que lee el juez. */
  caracter: string;
}
/**
 * El motivo de cada Rey. Se escribe en grados del acorde (0 = tónica, 1 = 3.ª, 2 = 5.ª, 3 = 7.ª, 4 = 9.ª): suena
 * sobre cualquier compás del duelo sin salirse nunca de la armonía, y se reconoce por su ritmo y su dibujo.
 */
export const MOTIVOS: Record<PaloRey, MotivoRey> = {
  // Espadas: una llamada marcial, cortante: la quinta repetida, salto a la octava y caída por grados (3.ª – 9.ª – 1)
  S: {
    piso: 57,
    caracter: 'marcial y cortante: quinta repetida, salto de octava y caída 3.ª–9.ª–1 sobre el 3-3-2',
    celula: [
      [[0, 2, 2, 0], [3, 1, 2, 0], [4, 4, 0, 1], [8, 3, 3, 0], [12, 4, 2, 0]],
      [[0, 3, 1, 0], [3, 3, 4, 0], [6, 6, 0, 0], [14, 2, 2, -1]],
    ],
  },
  // Bastos: tres golpes hondos y lentos sobre el 3-3-2, tónica y tercera abajo de todo
  C: {
    piso: 45,
    caracter: 'hondo y pesado: tres notas largas sobre el 3-3-2 (1–3–1, 5–7–1)',
    celula: [
      [[0, 6, 0, 0], [6, 6, 1, 0], [12, 4, 0, 0]],
      [[0, 6, 2, 0], [6, 6, 3, 0], [12, 4, 0, 0]],
    ],
  },
  // Oros: arpegios brillantes de semicorcheas que suben y una cascada que baja
  D: {
    piso: 62,
    caracter: 'brillante: arpegio de semicorcheas que sube (1–3–5–7–1) y cascada que baja',
    celula: [
      [[0, 1, 0, 0], [1, 1, 1, 0], [2, 1, 2, 0], [3, 1, 3, 0], [4, 4, 0, 1], [8, 2, 4, 0], [10, 2, 2, 0], [12, 4, 1, 1]],
      [[0, 2, 2, 1], [2, 2, 1, 1], [4, 2, 0, 1], [6, 2, 3, 0], [8, 8, 2, 0]],
    ],
  },
  // Copas: una línea ligada que ondula por grados (3.ª – 9.ª – 1 – 9.ª – 3.ª) y se posa en la quinta
  H: {
    piso: 60,
    caracter: 'aterciopelado: ondula por grados (3.ª–9.ª–1–9.ª–3.ª), se posa en la 5.ª y suspira en la 7.ª',
    celula: [
      [[0, 4, 1, 0], [4, 2, 4, 0], [6, 2, 0, 0], [8, 2, 4, 0], [10, 2, 1, 0], [12, 4, 2, 0]],
      [[0, 6, 3, 0], [6, 2, 2, 0], [8, 8, 1, 0]],
    ],
  },
};
/** El motivo del Rey sobre el acorde de un compás. En la segunda cara, además, doblado una octava arriba. */
export function motivoRey(rey: PaloRey, a: Acorde, compas: number, segunda = false): Nota[] {
  const m = MOTIVOS[rey];
  const n: Nota[] = m.celula[compas % 2].map(([paso, dur, g, oct]) => ({ paso, dur, midi: desde(a.tonos[g], m.piso) + 12 * oct, vel: (TRES_TRES_DOS as readonly number[]).includes(paso) ? 0.95 : 0.7 }));
  return segunda ? [...n, ...n.map((x) => ({ ...x, midi: x.midi + 12, vel: x.vel * 0.45 }))] : n;
}

// ───────────── la batería ─────────────

function golpesDe(patron: string, vel: number, tipo?: string): Golpe[] {
  return [...patron].flatMap((ch, paso) => (ch === 'x' ? [{ paso, vel, tipo }] : ch === 'o' ? [{ paso, vel: vel * 0.45, tipo }] : []));
}
/** La batería de un compás. `nivel`: 0 lejana (Mapa), 1 base, 2 rica, 3 al máximo. El último compás de la frase lleva fill. */
export function bateria(compas: number, nivel: 0 | 1 | 2 | 3, semilla: number): { bombo: Golpe[]; madera: Golpe[]; escobillas: Golpe[] } {
  const k = ((compas % FRASE) + FRASE) % FRASE;
  const fill = k === FRASE - 1 && nivel >= 1;
  let bombo = golpesDe(BOMBO, 1);
  // el rimshot de madera: contesta al bombo en el hueco del 3-3-2
  let madera = golpesDe(nivel === 0 ? '......x.........' : nivel === 1 ? '..........x.....' : nivel === 2 ? '....x.....x.....' : '....x.....x....o', 0.9);
  // lejana: el bombo marca solo el 1 y el último golpe del 3-3-2; la madera pone el del medio
  if (nivel === 0) bombo = golpesDe('x...........x...', 0.8);
  let escobillas: Golpe[] = [];
  if (nivel >= 2) escobillas = golpesDe('x.o.o.x.o.o.x.o.', 0.8, 'escobilla');
  if (nivel >= 3) escobillas.push(...golpesDe('xoooooxoooooxooo', 0.6, 'shaker'));
  if (fill) {
    // el fill: limpia la segunda mitad y la llena con una figura corta que cae en el 1 del compás que viene
    const cual = Math.floor(azarEn(semilla, compas, 79) * 3);
    const figura = ['........x..xx.x.', '........x.x.xxx.', '..........xx.xxx'][cual];
    madera = [...madera.filter((g) => g.paso < 8), ...golpesDe(figura, 0.85).map((g, n, l) => ({ ...g, vel: 0.5 + (0.45 * (n + 1)) / l.length }))];
    if (nivel >= 2) madera.push(...golpesDe('............x.xx', 0.7, 'tom'));
    escobillas = escobillas.filter((g) => g.paso < 12);
    bombo = [...bombo.filter((g) => g.paso < 12), { paso: 12, vel: 0.9 }, { paso: 15, vel: 0.7 }];
  }
  return { bombo, madera, escobillas };
}

/** El latido de la poca Vida: «lub-dub» dos veces por compás, clavado al tempo. */
export const LATIDO: Golpe[] = [{ paso: 0, vel: 1, tipo: 'lub' }, { paso: 2, vel: 0.7, tipo: 'dub' }, { paso: 8, vel: 1, tipo: 'lub' }, { paso: 10, vel: 0.7, tipo: 'dub' }];

/** Las brasas del Fogón: chasquidos sueltos, sorteados por paso. */
export function brasas(compas: number, semilla: number): Golpe[] {
  const out: Golpe[] = [];
  for (let paso = 0; paso < PASOS; paso++) {
    const r = azarDe(clave(semilla, compas, paso, 83));
    if (r() < 0.3) out.push({ paso, vel: 0.3 + r() * 0.7 });
  }
  return out;
}

export interface Compas {
  compas: number;
  acorde: Acorde;
  mezcla: Mezcla;
  variante: Variante;
  notas: Partial<Record<CapaId, Nota[]>>;
  golpes: Partial<Record<CapaId, Golpe[]>>;
}

/** Todo lo que suena en un compás, capa por capa. Solo escribe las capas que la mezcla de ese estado deja oír. */
export function partitura(e: EstadoMusical, compas: number, semilla: number): Compas {
  const seccion = SECCION_DE[e.escena];
  const tonica = tonicaDe(e);
  const acorde = acordeDe(seccion, compas, tonica);
  const sig = acordeDe(seccion, compas + 1, tonica);
  const mezcla = mezclaDe(e);
  const variante = varianteDe(compas, semilla);
  const suena = (c: CapaId): boolean => (mezcla.capas[c] ?? 0) > 0;
  const notas: Compas['notas'] = {};
  const golpes: Compas['golpes'] = {};
  if (suena('bajo')) notas.bajo = bajo(acorde, sig, mezcla.bajo, variante);
  if (suena('guitarra')) notas.guitarra = guitarra(acorde, mezcla.guitarra, variante);
  if (suena('rasgueo')) notas.rasgueo = rasgueo(acorde, mezcla.rasgueo);
  if (suena('pad')) notas.pad = pad(acorde);
  if (suena('cuerdas')) notas.cuerdas = cuerdas(acorde, compas);
  if (suena('bandoneon')) {
    const frase = Math.floor(compas / FRASE);
    // el bandoneón respira: en las frases impares calla su primera mitad
    const k = ((compas % FRASE) + FRASE) % FRASE;
    notas.bandoneon = frase % 2 === 1 && k < FRASE / 2 ? [] : contramelodia(seccion, frase, tonica, semilla)[k];
  }
  if (suena('motivo') && e.rey) notas.motivo = motivoRey(e.rey, acorde, compas, e.segunda);
  const b = bateria(compas, mezcla.bateria, semilla);
  if (suena('bombo')) golpes.bombo = b.bombo;
  if (suena('madera')) golpes.madera = b.madera;
  if (suena('escobillas')) golpes.escobillas = b.escobillas;
  if (suena('brasas')) golpes.brasas = brasas(compas, semilla);
  if (suena('latido')) golpes.latido = LATIDO;
  return { compas, acorde, mezcla, variante, notas, golpes };
}

// ───────────── los stingers ─────────────

export interface Stinger {
  /** [medias semicorcheas desde el arranque, duración en medias semicorcheas, grado del acorde (0–4), octava, fuerza]. */
  notas: [number, number, number, number, number][];
  piso: number;
  timbre: 'cuerda' | 'fuelle' | 'campana' | 'grave';
  /** La última nota se desliza desde la anterior (¡MENTIRA!). */
  desliza?: boolean;
}
/** Los stingers: se escriben en grados del acorde y se afinan al acorde que suena en ese momento. */
export const STINGERS: Record<StingerId, Stinger> = {
  // ¡ESCOBA!: una barrida que sube por todo el acorde
  escoba: { piso: 62, timbre: 'cuerda', notas: [[0, 2, 0, 0, 0.7], [1, 2, 1, 0, 0.7], [2, 2, 2, 0, 0.75], [3, 2, 3, 0, 0.8], [4, 2, 4, 0, 0.85], [5, 8, 0, 1, 1]] },
  // ¡ENVIDO!: la quinta que llama y la tónica que planta
  truco: { piso: 57, timbre: 'fuelle', notas: [[0, 3, 2, 0, 0.9], [3, 3, 2, 0, 0.8], [6, 8, 0, 1, 1]] },
  // ¡CHINCHÓN!: dos escaleritas de tres y la octava
  chinchon: { piso: 62, timbre: 'campana', notas: [[0, 2, 0, 0, 0.7], [1, 2, 4, 0, 0.7], [2, 2, 1, 0, 0.8], [4, 2, 1, 0, 0.7], [5, 2, 2, 0, 0.75], [6, 2, 3, 0, 0.8], [8, 8, 0, 1, 1]] },
  // ¡MENTIRA!: la novena que resbala, socarrona, hasta la tónica
  mentiroso: { piso: 57, timbre: 'fuelle', desliza: true, notas: [[0, 3, 4, 0, 0.8], [3, 3, 3, 0, 0.8], [6, 8, 0, 0, 1]] },
  // ¡CHANCHO!: dos gruñidos abajo y la quinta que remata
  chancho: { piso: 38, timbre: 'grave', notas: [[0, 2, 0, 0, 1], [2, 2, 0, 0, 0.9], [4, 6, 2, 0, 1], [4, 6, 0, 1, 0.6]] },
  // «¡AL PELO!»: dos toquecitos arriba, novena y tónica
  alpelo: { piso: 74, timbre: 'campana', notas: [[0, 1, 4, 0, 0.7], [1, 4, 0, 1, 0.9]] },
  // Golpe exacto: tónica, quinta y octava, limpias
  exacto: { piso: 62, timbre: 'campana', notas: [[0, 2, 0, 0, 0.8], [1, 2, 2, 0, 0.85], [2, 8, 0, 1, 1], [2, 8, 2, 0, 0.5]] },
  // el jackpot de una Evolución: el acorde entero que trepa dos octavas y se queda sonando
  evolucion: { piso: 50, timbre: 'cuerda', notas: [[0, 2, 0, 0, 0.7], [1, 2, 1, 0, 0.7], [2, 2, 2, 0, 0.75], [3, 2, 3, 0, 0.75], [4, 2, 4, 0, 0.8], [5, 2, 0, 1, 0.8], [6, 2, 1, 1, 0.85], [7, 2, 2, 1, 0.9], [8, 14, 0, 2, 1], [8, 14, 2, 1, 0.6], [8, 14, 1, 1, 0.6], [8, 14, 4, 1, 0.5]] },
};
/** Las notas de un stinger sobre un acorde: `paso` y `dur` en medias semicorcheas. */
export function notasStinger(id: StingerId, a: Acorde): Nota[] {
  const s = STINGERS[id];
  return s.notas.map(([paso, dur, g, oct, vel]) => ({ paso, dur, midi: desde(a.tonos[g], s.piso) + 12 * oct, vel }));
}

// ───────────── las voces: quién canta, en qué registro y cómo ─────────────

export type Vocal = 'a' | 'e' | 'i' | 'o' | 'u';
export interface PerfilVoz {
  cuerda: string;
  /** La tesitura (notas MIDI, inclusive): de acá no se sale. */
  grave: number;
  agudo: number;
  /** Semicorcheas por sílaba. */
  paso: number;
  /** Cuántas notas canta como mucho una frase (las largas se resumen: se cantan sílabas salteadas y siempre la última). */
  tope: number;
  estilo: 'buffo' | 'recitado' | 'profundo' | 'arpegio' | 'melisma' | 'dulce';
  /** Los formantes se corren por este factor (más de 1, tracto más corto: voz más clara). */
  formante: number;
  /** El vibrato: Hz y profundidad en cents; arranca tarde (ver `canto.ts`). */
  vibrato: [number, number];
  /** El portamento entre notas, en segundos. */
  porta: number;
  /** Cuánto de cada sílaba suena (1 = ligado). */
  ligado: number;
  vol: number;
}
export const VOCES: Record<VozId, PerfilVoz> = {
  // el Bufón: tenor buffo, de Re3 a La4: saltos traviesos y trinos
  bufon: { cuerda: 'tenor buffo', grave: 50, agudo: 69, paso: 1, tope: 12, estilo: 'buffo', formante: 1.06, vibrato: [5.8, 28], porta: 0.03, ligado: 0.8, vol: 0.8 },
  // el Rey de Espadas: barítono solemne y cortante, de La2 a Mi4
  S: { cuerda: 'barítono', grave: 45, agudo: 64, paso: 1, tope: 10, estilo: 'recitado', formante: 0.96, vibrato: [5.2, 18], porta: 0.02, ligado: 0.6, vol: 0.9 },
  // el Rey de Bastos: bajo profundo, de Mi2 a Do4
  C: { cuerda: 'bajo profundo', grave: 40, agudo: 60, paso: 2, tope: 8, estilo: 'profundo', formante: 0.88, vibrato: [5, 22], porta: 0.06, ligado: 0.92, vol: 1 },
  // el Rey de Oros: tenor lírico brillante, de Mi3 a Si4, con arpegios
  D: { cuerda: 'tenor lírico', grave: 52, agudo: 71, paso: 1, tope: 10, estilo: 'arpegio', formante: 1.04, vibrato: [5.6, 30], porta: 0.035, ligado: 0.9, vol: 0.8 },
  // el Rey de Copas: mezzo / contralto aterciopelada, de Sol3 a Mi5, con melismas
  H: { cuerda: 'mezzo / contralto', grave: 55, agudo: 76, paso: 2, tope: 8, estilo: 'melisma', formante: 1.15, vibrato: [5.4, 34], porta: 0.09, ligado: 1, vol: 0.8 },
  // los Personajes: exclamaciones dulces y breves
  escoba: { cuerda: 'soprano ligera', grave: 62, agudo: 79, paso: 1, tope: 4, estilo: 'dulce', formante: 1.2, vibrato: [5.8, 24], porta: 0.04, ligado: 0.9, vol: 0.65 },
  truco: { cuerda: 'barítono', grave: 45, agudo: 64, paso: 1, tope: 4, estilo: 'dulce', formante: 0.95, vibrato: [5.2, 20], porta: 0.04, ligado: 0.9, vol: 0.85 },
  chinchon: { cuerda: 'mezzo', grave: 57, agudo: 74, paso: 1, tope: 4, estilo: 'dulce', formante: 1.14, vibrato: [5.6, 24], porta: 0.04, ligado: 0.9, vol: 0.7 },
  mentiroso: { cuerda: 'tenor', grave: 50, agudo: 67, paso: 1, tope: 4, estilo: 'dulce', formante: 1.02, vibrato: [5.4, 26], porta: 0.07, ligado: 1, vol: 0.8 },
  chancho: { cuerda: 'bajo-barítono', grave: 41, agudo: 60, paso: 1, tope: 4, estilo: 'dulce', formante: 0.9, vibrato: [5, 20], porta: 0.04, ligado: 0.9, vol: 0.95 },
};

/** Los tres primeros formantes de cada vocal (Hz, voz de hombre; `PerfilVoz.formante` los corre). */
export const FORMANTES: Record<Vocal, [number, number, number]> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [270, 2290, 3010],
  o: [570, 840, 2410],
  u: [300, 870, 2240],
};

// ───────────── el silabeo ─────────────

/** Cómo termina la frase que cierra una sílaba: de eso depende hacia dónde va la melodía. */
export type Cierre = '' | ',' | '.' | '!' | '?' | '…';
export interface Silaba {
  texto: string;
  vocal: Vocal;
  cierre: Cierre;
}

const SIN_TILDE: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };
const esVocalEs = (c: string): boolean => 'aeiouáéíóúü'.includes(c);
const fuerte = (c: string): boolean => 'aeoáéó'.includes(c);
const GRUPOS = ['pl', 'pr', 'bl', 'br', 'tr', 'dr', 'cl', 'cr', 'gl', 'gr', 'fl', 'fr', 'ch', 'll', 'rr', 'qu', 'gu'];

/** Las sílabas de una palabra en español (aproximación fonética: diptongos, hiatos, «qu»/«gu» mudas, «y» final). */
function silabasEs(palabra: string): { texto: string; vocal: Vocal }[] {
  const w = palabra.toLowerCase();
  // los núcleos: tramos de vocales que suenan juntas
  const nucleos: { desde: number; hasta: number; vocal: Vocal }[] = [];
  const vocalEn = (k: number): boolean => {
    const c = w[k];
    if (c === 'y') return k === w.length - 1 || !esVocalEs(w[k + 1] ?? '');
    if (!esVocalEs(c)) return false;
    // la «u» muda de «que», «gui»
    if (c === 'u' && (w[k - 1] === 'q' || w[k - 1] === 'g') && 'eiéí'.includes(w[k + 1] ?? '')) return false;
    return true;
  };
  for (let k = 0; k < w.length; k++) {
    if (!vocalEn(k)) continue;
    const ult = nucleos[nucleos.length - 1];
    const c = w[k];
    const prev = w[k - 1] ?? '';
    // se pega al núcleo anterior si forman diptongo: no dos fuertes seguidas, ni una débil con tilde
    const pega = ult && ult.hasta === k - 1 && !(fuerte(c) && fuerte(prev)) && !'íú'.includes(c) && !'íú'.includes(prev);
    const v = (c === 'y' ? 'i' : (SIN_TILDE[c] ?? c)) as Vocal;
    if (pega) {
      ult.hasta = k;
      // manda la vocal fuerte; entre dos débiles, la segunda
      if (fuerte(c) || !fuerte(prev)) ult.vocal = v;
    } else nucleos.push({ desde: k, hasta: k, vocal: v });
  }
  if (!nucleos.length) return [];
  // los cortes: las consonantes entre dos núcleos se reparten (una sola va con la que sigue; los grupos no se parten)
  const cortes = [0];
  for (let n = 1; n < nucleos.length; n++) {
    const a = nucleos[n - 1].hasta + 1;
    const b = nucleos[n].desde;
    const cons = b - a;
    if (cons <= 1) cortes.push(a);
    else cortes.push(GRUPOS.includes(w.slice(b - 2, b)) ? b - 2 : b - 1);
  }
  return nucleos.map((n, k) => ({ texto: palabra.slice(cortes[k], cortes[k + 1] ?? palabra.length), vocal: n.vocal }));
}

const VOCAL_EN: [RegExp, Vocal][] = [
  [/^(ee|ea|ie|ey|y)$/, 'i'],
  [/^(oo|ew|ue|ui|u)$/, 'u'],
  [/^(ou|ow|au|aw)$/, 'a'],
  [/^(ai|ay|ei)$/, 'e'],
  [/^(oa|oe|o|oi|oy)$/, 'o'],
];
/** Las sílabas de una palabra en inglés (aproximación: un grupo de vocales por sílaba, «e» muda final). */
function silabasEn(palabra: string): { texto: string; vocal: Vocal }[] {
  const w = palabra.toLowerCase().replace(/[^a-z']/g, (c) => SIN_TILDE[c] ?? c);
  const grupos: { desde: number; hasta: number }[] = [];
  for (let k = 0; k < w.length; k++) {
    const c = w[k];
    const v = 'aeiou'.includes(c) || (c === 'y' && k > 0);
    if (!v) continue;
    const ult = grupos[grupos.length - 1];
    if (ult && ult.hasta === k - 1) ult.hasta = k;
    else grupos.push({ desde: k, hasta: k });
  }
  // la «e» muda del final («take», «house») y el «-ed» que no suena («called»)
  if (grupos.length > 1) {
    const ult = grupos[grupos.length - 1];
    const muda = ult.desde === ult.hasta && w[ult.desde] === 'e' && (ult.hasta === w.length - 1 || (ult.hasta === w.length - 2 && w.endsWith('ed') && !'td'.includes(w[ult.desde - 1])) || (ult.hasta === w.length - 2 && w.endsWith('es') && !'sxzh'.includes(w[ult.desde - 1])));
    if (muda && !(w.endsWith('le') && !'aeiou'.includes(w[w.length - 3] ?? 'a'))) grupos.pop();
  }
  if (!grupos.length) return [];
  const cortes = [0];
  for (let n = 1; n < grupos.length; n++) cortes.push(Math.max(grupos[n - 1].hasta + 1, grupos[n].desde - 1));
  return grupos.map((g, k) => {
    const s = w.slice(g.desde, g.hasta + 1);
    const vocal = VOCAL_EN.find(([re]) => re.test(s))?.[1] ?? ((s[0] === 'y' ? 'i' : 'aeiou'.includes(s[0]) ? s[0] : 'a') as Vocal);
    return { texto: palabra.slice(cortes[k], cortes[k + 1] ?? palabra.length), vocal };
  });
}

/** Parte un texto en sílabas cantables, cada una con su vocal dominante y, la última de cada frase, con su cierre. */
export function silabear(texto: string, idioma: Idioma = 'es'): Silaba[] {
  const out: Silaba[] = [];
  const re = /([\p{L}']+)|(\.\.\.|…|[.,;:!?])/gu;
  for (const m of texto.matchAll(re)) {
    if (m[1]) {
      const s = idioma === 'en' ? silabasEn(m[1]) : silabasEs(m[1]);
      // una palabra sin vocal («y» suelta ya cuenta; «Mmm», «Pst») se canta con una «e» apagada
      for (const x of s.length ? s : [{ texto: m[1], vocal: 'e' as Vocal }]) out.push({ ...x, cierre: '' });
    } else if (out.length) {
      const p = m[2];
      const c: Cierre = p === '...' || p === '…' ? '…' : p === '!' || p === '?' || p === '.' ? p : ',';
      const ult = out[out.length - 1];
      // «?!» y «!…»: manda el primer signo fuerte
      if (ult.cierre === '' || ult.cierre === ',') ult.cierre = c;
    }
  }
  return out;
}

// ───────────── el canto ─────────────

export interface NotaPlan {
  silaba: string;
  vocal: Vocal;
  /** La semicorchea, contada desde que empieza la frase, en la que entra. */
  paso: number;
  /** Cuánto dura, en semicorcheas. */
  dur: number;
  /** La altura a la que apunta (MIDI, sin cuantizar): el dibujo de la frase. */
  objetivo: number;
  /** Cómo se elige la nota: libre (la del acorde más cercana) o lo que manda el cierre de la frase. */
  regla: 'libre' | 'sube' | 'resuelve' | 'suspende' | 'reposa' | 'coma';
  /** El Bufón trina; Copas hace un melisma (dos notas más, ligadas, sobre la misma sílaba). */
  adorno?: 'trino' | 'melisma';
  /** Es la primera nota de su frase (la melodía no arrastra portamento desde la anterior). */
  entra: boolean;
}

const REGLA: Record<Cierre, NotaPlan['regla']> = { '': 'reposa', ',': 'coma', '.': 'reposa', '!': 'resuelve', '?': 'sube', '…': 'suspende' };

/**
 * El plan de una frase cantada: qué sílabas se cantan, cuándo, y hacia dónde apunta la melodía. La puntuación manda:
 * «?» sube, «!» resuelve en tónica o quinta, «…» se queda suspendida en la séptima o la novena, «.» reposa. Cada
 * cuerda tiene su manera: el Bufón salta y trina, Espadas recita, Bastos camina hondo, Oros arpegia, Copas ondula.
 * Todavía no hay notas: se eligen sílaba por sílaba con el acorde del compás en que caen (`notaCantada`).
 */
export function planCanto(quien: VozId, texto: string, idioma: Idioma = 'es', semilla = 1, breve = false): NotaPlan[] {
  const v = VOCES[quien];
  let sil = silabear(texto, idioma);
  if (!sil.length) return [];
  const tope = breve ? Math.min(4, v.tope) : v.tope;
  if (sil.length > tope) {
    // la frase larga se resume: sílabas salteadas, sin perder ningún cierre ni la última
    const cada = sil.length / tope;
    const elegidas = new Set<number>([sil.length - 1]);
    for (let k = 0; k < tope - 1; k++) elegidas.add(Math.floor(k * cada));
    const cierres: Cierre[] = [];
    const res: Silaba[] = [];
    sil.forEach((s, k) => {
      if (elegidas.has(k)) res.push({ ...s });
      else if (s.cierre && res.length) cierres[res.length - 1] = s.cierre;
    });
    res.forEach((s, k) => void (s.cierre ||= cierres[k] ?? ''));
    sil = res;
  }
  const r = azarDe(clave(semilla, texto.length, texto.charCodeAt(0) | 0, quien.charCodeAt(0)));
  const ancho = v.agudo - v.grave;
  const out: NotaPlan[] = [];
  let paso = 0;
  let desdeK = 0;
  while (desdeK < sil.length) {
    let hastaK = sil.findIndex((s, k) => k >= desdeK && s.cierre !== '');
    if (hastaK < 0) hastaK = sil.length - 1;
    const n = hastaK - desdeK + 1;
    const cierre = sil[hastaK].cierre;
    // dónde arranca la frase: la pregunta, abajo (tiene que tener adónde subir); la exclamación, arriba
    const base = v.grave + ancho * (cierre === '?' ? 0.25 : cierre === '!' ? 0.6 : v.estilo === 'profundo' ? 0.25 : 0.5);
    for (let k = 0; k < n; k++) {
      const s = sil[desdeK + k];
      const ultima = k === n - 1;
      const x = n > 1 ? k / (n - 1) : 1;
      let objetivo: number;
      switch (v.estilo) {
        case 'buffo':
          // saltos traviesos: zigzag de una quinta alrededor de un arco
          objetivo = base + Math.sin(x * Math.PI) * 3 + (k % 2 ? 1 : -1) * (2.5 + r() * 2.5);
          break;
        case 'recitado':
          // recita casi en una nota y cae al final
          objetivo = base + 2 - x * 4 + (r() < 0.25 ? 3 : 0);
          break;
        case 'profundo':
          objetivo = base + Math.sin(x * Math.PI) * 4 - x * 2;
          break;
        case 'arpegio':
          // sube por el acorde y vuelve a arrancar de abajo
          objetivo = v.grave + ancho * 0.2 + (k % 4) * 3.6 + Math.floor(k / 4) * 2;
          break;
        case 'melisma':
          objetivo = base + Math.sin(x * Math.PI * 1.5) * 5;
          break;
        default:
          // dulce: un arpegio corto que sube
          objetivo = v.grave + ancho * 0.35 + k * 3.6;
      }
      if (cierre === '?') objetivo = Math.min(objetivo, v.grave + ancho * 0.5) + x * 2;
      const largo = ultima ? v.paso + (cierre === '…' ? 4 : cierre === '' || cierre === ',' ? 1 : 2) : v.paso;
      const nota: NotaPlan = { silaba: s.texto, vocal: s.vocal, paso, dur: largo, objetivo: Math.max(v.grave, Math.min(v.agudo, objetivo)), regla: ultima ? REGLA[cierre] : 'libre', entra: k === 0 };
      // el trino del Bufón, en la última nota de una exclamación; el melisma de Copas, en la penúltima sílaba
      if (v.estilo === 'buffo' && ultima && cierre === '!') nota.adorno = 'trino';
      if (v.estilo === 'melisma' && k === n - 2) nota.adorno = 'melisma';
      out.push(nota);
      paso += largo;
    }
    // el respiro entre frases
    paso += cierre === ',' || cierre === '' ? 1 : 2;
    desdeK = hastaK + 1;
  }
  return out;
}

/** Cuántas semicorcheas dura un plan entero. */
export const largoPlan = (plan: NotaPlan[]): number => (plan.length ? plan[plan.length - 1].paso + plan[plan.length - 1].dur : 0);

/**
 * La nota que canta una sílaba sobre el acorde de su compás: siempre una nota del acorde (tónica, 3.ª, 5.ª, 7.ª o
 * 9.ª) y siempre dentro de la tesitura. `anterior` es la nota que se cantó antes en la misma frase (o `null`).
 */
export function notaCantada(quien: VozId, n: NotaPlan, a: Acorde, anterior: number | null, primera: number | null = anterior): number {
  const v = VOCES[quien];
  const todas = escalera(a.tonos, v.grave, v.agudo);
  const de = (indices: number[]): number[] => {
    const l = escalera(indices.map((k) => a.tonos[k]), v.grave, v.agudo);
    return l.length ? l : todas;
  };
  const prev = anterior ?? n.objetivo;
  switch (n.regla) {
    case 'sube': {
      // la pregunta termina arriba: 5.ª, 7.ª o 9.ª por encima de lo que venía (y de donde empezó la frase)
      const piso = Math.max(prev, primera ?? prev);
      const arriba = de([2, 3, 4]).filter((x) => x > piso);
      if (arriba.length) return arriba[0];
      const mas = todas.filter((x) => x > piso);
      return mas.length ? mas[0] : todas[todas.length - 1];
    }
    case 'resuelve':
      // la exclamación cae en la tónica o la quinta
      return cerca(de([0, 2]), prev - 1);
    case 'suspende':
      return cerca(de([3, 4]), prev);
    case 'reposa': {
      const l = de([0, 1]);
      const abajo = l.filter((x) => x <= prev);
      return abajo.length ? abajo[abajo.length - 1] : l[0];
    }
    case 'coma':
      return cerca(de([1, 2]), prev);
    default: {
      let m = cerca(todas, n.objetivo);
      // que la melodía se mueva: la misma nota dos veces seguidas solo la recita Espadas
      if (m === anterior && v.estilo !== 'recitado' && todas.length > 1) m = cerca(todas.filter((x) => x !== anterior), n.objetivo);
      return m;
    }
  }
}

/** La nota de adorno de un trino o un melisma: la nota del acorde vecina (arriba para el trino, abajo para el melisma). */
export function vecinaDelAcorde(quien: VozId, midi: number, a: Acorde, hacia: 1 | -1): number {
  const v = VOCES[quien];
  const l = escalera(a.tonos, v.grave, v.agudo);
  const k = l.indexOf(midi);
  if (k < 0) return midi;
  return l[k + hacia] ?? l[k - hacia] ?? midi;
}

export interface NotaCantada extends NotaPlan {
  midi: number;
  /** El grado del acorde que canta («1», «3», «5», «7», «9»…). */
  grado: string;
  acorde: string;
  /** Las notas del adorno (trino o melisma), si lo hay. */
  adornos: number[];
}
/**
 * Una frase entera, cantada: cada sílaba con su nota. `acordeEn(paso)` da el acorde del compás en que cae la
 * semicorchea `paso` de la frase (el director lo sabe; en las pruebas, una función cualquiera).
 */
export function fraseCantada(quien: VozId, texto: string, acordeEn: (paso: number) => Acorde, o: { idioma?: Idioma; semilla?: number; breve?: boolean } = {}): NotaCantada[] {
  const plan = planCanto(quien, texto, o.idioma ?? 'es', o.semilla ?? 1, o.breve);
  let anterior: number | null = null;
  let primera: number | null = null;
  return plan.map((n) => {
    const a = acordeEn(n.paso);
    if (n.entra) primera = null;
    const midi = notaCantada(quien, n, a, n.entra ? null : anterior, primera);
    primera ??= midi;
    anterior = midi;
    const adornos = n.adorno === 'trino' ? [vecinaDelAcorde(quien, midi, a, 1)] : n.adorno === 'melisma' ? [vecinaDelAcorde(quien, midi, a, 1), vecinaDelAcorde(quien, midi, a, -1)] : [];
    return { ...n, midi, grado: gradoDe(midi, a), acorde: a.nombre, adornos };
  });
}

// ───────────── la partitura en texto (para el juez que no oye) ─────────────

/** Un compás de una capa de notas, en texto: «0:Re2 6:La2 12:Re3». */
export const notasEnTexto = (n: Nota[]): string => (n.length ? n.map((x) => `${x.paso}:${nombreNota(x.midi)}`).join(' ') : '—');
/** Un compás de golpes como rejilla de 16 semicorcheas: «x.....x.....x...» (minúscula «o»: golpe fantasma). */
export function golpesEnTexto(g: Golpe[]): string {
  const r = Array.from({ length: PASOS }, () => '.');
  for (const x of g) if (r[x.paso] !== 'x') r[x.paso] = x.vel >= 0.5 ? 'x' : 'o';
  return r.join('');
}
