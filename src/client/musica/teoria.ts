// La teoría de la música de CÁBALA (0.28): pura, sin Web Audio y sin azar que no venga de una semilla. De acá salen
// la armonía de cada compás, los patrones 3-3-2 de la milonga, los motivos de los cuatro Reyes, la partitura de cada
// capa y lo que canta cada personaje. El motor (`motor.ts`) solo le pone timbre y hora a lo que esto escribe, y la
// medición (`scripts/audio-render.ts`) imprime esta misma partitura para el juez que no oye.
//
// Un solo reloj: 104 negras por minuto, compás de 16 semicorcheas, frases de 8 compases. Una sola tonalidad: Re menor
// (la segunda cara de un Rey la sube un tono, a Mi menor). Las pantallas no tienen pistas: tienen una FORMA (0.29:
// cuatro secciones de 8 compases, AABA o ABAC: 73,8 s antes de repetir), un ARREGLO que cambia en cada vuelta y una
// MEZCLA (qué capas suenan y con qué filtro) sobre ese mismo reloj. El bandoneón ya no pasea al azar: canta el TEMA.

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

export type EscenaId = 'portada' | 'coleccion' | 'mapa' | 'mesa' | 'rey' | 'pulperia' | 'fogon' | 'cabala' | 'derrota' | 'victoria';
export type SeccionId = 'base' | 'puente' | 'vuelta' | 'rey' | 'reyB' | 'cabala' | 'cabalaB' | 'derrota' | 'derrotaB' | 'derrotaC' | 'victoria' | 'victoriaB';
export type PaloRey = 'S' | 'C' | 'D' | 'H';
export type VozId = 'bufon' | PaloRey | 'escoba' | 'truco' | 'chinchon' | 'mentiroso' | 'chancho';
export type StingerId = 'escoba' | 'truco' | 'chinchon' | 'mentiroso' | 'chancho' | 'alpelo' | 'exacto' | 'evolucion' | 'brava' | 'quema';
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
  // (0.29) los de la sección B de la victoria, ya en Re mayor
  IVM: M('maj7', 5, [0, 4, 7, 11, 14], G9, MAYOR),
  VM: M('9', 7, [0, 4, 7, 10, 14], G9, MAYOR),
  viM: M('m7', 9, [0, 3, 7, 10, 14], G9, MAYOR),
} as const;
export type Grado = keyof typeof MOLDES;

/** Las secciones: 8 compases cada una, un acorde por compás. Todas en la misma tonalidad y sobre el mismo reloj. */
export const SECCIONES: Record<SeccionId, Grado[]> = {
  // A · la milonga de toda la noche: i – iv – V7 – i – VI – iv6 – iiø – V7
  base: ['i', 'iv', 'V', 'i', 'VI', 'iv6', 'ii', 'V'],
  // B · el puente (0.29): el relativo mayor (Fa) que se asoma y vuelve por la dominante
  puente: ['III', 'VII', 'VI', 'V', 'iv', 'VII', 'III', 'V'],
  // C · la vuelta (0.29): arranca en la subdominante y baja por quintas hasta la tónica
  vuelta: ['iv', 'VII', 'III', 'VI', 'ii', 'V', 'i', 'V'],
  // el duelo: la cadencia andaluza (i – VII – VI – V) y su vuelta por la subdominante
  rey: ['i', 'VII', 'VI', 'V', 'i', 'iv', 'VI', 'V'],
  // el duelo, B: el relativo amaga un respiro y la subdominante lo niega
  reyB: ['VI', 'VII', 'i', 'i', 'iv', 'VII', 'ii', 'V'],
  // la Cábala y el Altar: la napolitana (bII) le pone el misterio
  cabala: ['i', 'bII', 'iv6', 'V', 'i', 'bII', 'ii', 'V'],
  // la Cábala, B: se va por el relativo y vuelve por la napolitana
  cabalaB: ['iv6', 'VII', 'III', 'bII', 'iv', 'bII', 'ii', 'V'],
  // la derrota: el lamento no tiene dominante al final; se queda en la tónica
  derrota: ['i', 'iv', 'i', 'V', 'VI', 'iv6', 'ii', 'i'],
  derrotaB: ['VI', 'iv6', 'i', 'V', 'iv', 'i', 'ii', 'i'],
  derrotaC: ['iv', 'VII', 'III', 'VI', 'ii', 'V', 'i', 'i'],
  // la victoria: el relativo mayor y la tercera de Picardía (VI – VII – I)
  victoria: ['III', 'VII', 'VI', 'V', 'VI', 'VII', 'I', 'I'],
  // la victoria, B: ya en Re mayor (IV – V – I – vi)
  victoriaB: ['IVM', 'VM', 'I', 'viM', 'IVM', 'VM', 'I', 'I'],
};
/** La sección A de cada escena (la que le da nombre a su forma). */
export const SECCION_DE: Record<EscenaId, SeccionId> = { portada: 'base', coleccion: 'base', mapa: 'base', mesa: 'base', pulperia: 'base', fogon: 'base', rey: 'rey', cabala: 'cabala', derrota: 'derrota', victoria: 'victoria' };
/**
 * (0.29) La forma de cada escena: cuatro secciones de 8 compases (32 compases, 73,8 s) sobre el reloj único. La mesa,
 * la portada y los duelos son AABA; las pantallas de paso, ABAC, cada una con su orden: ya no hay seis pantallas
 * dando vueltas a los mismos 8 compases.
 */
export const FORMAS: Record<EscenaId, [SeccionId, SeccionId, SeccionId, SeccionId]> = {
  portada: ['base', 'base', 'puente', 'base'],
  coleccion: ['base', 'vuelta', 'base', 'puente'],
  mapa: ['base', 'puente', 'base', 'vuelta'],
  mesa: ['base', 'base', 'puente', 'base'],
  pulperia: ['base', 'vuelta', 'base', 'puente'],
  fogon: ['vuelta', 'base', 'vuelta', 'puente'],
  rey: ['rey', 'rey', 'reyB', 'rey'],
  cabala: ['cabala', 'cabala', 'cabalaB', 'cabala'],
  derrota: ['derrota', 'derrotaB', 'derrota', 'derrotaC'],
  victoria: ['victoria', 'victoria', 'victoriaB', 'victoria'],
};
/** Compases que dura la forma entera, y segundos (73,8 s). */
export const COMPASES_FORMA = FRASE * 4;
export const SEG_FORMA = COMPASES_FORMA * SEG_COMPAS;
const modulo = (n: number, m: number): number => ((n % m) + m) % m;
/** En qué sección de su forma está una escena en el compás `compas`, qué lugar ocupa (0–3), qué vuelta y qué compás de la frase. */
export function lugarEnForma(escena: EscenaId, compas: number): { seccion: SeccionId; pos: number; vuelta: number; k: number } {
  const pos = modulo(Math.floor(compas / FRASE), 4);
  return { seccion: FORMAS[escena][pos], pos, vuelta: Math.floor(compas / COMPASES_FORMA), k: modulo(compas, FRASE) };
}
export const seccionEn = (escena: EscenaId, compas: number): SeccionId => lugarEnForma(escena, compas).seccion;
/** La forma en letras («AABA»): la primera sección es A y cada sección nueva toma la letra que sigue. */
export function letrasForma(escena: EscenaId): string {
  const vistas: SeccionId[] = [];
  return FORMAS[escena]
    .map((s) => {
      if (!vistas.includes(s)) vistas.push(s);
      return 'ABCD'[vistas.indexOf(s)];
    })
    .join('');
}

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
export const acordeDelEstado = (e: EstadoMusical, compas: number): Acorde => acordeDe(seccionEn(e.escena, compas), compas, tonicaDe(e));

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
      // (0.29) y el bandoneón, bajito: el tema de CÁBALA se presenta acá
      m = { capas: { bajo: 0.8, guitarra: 1, pad: 0.45, bandoneon: 0.55 }, corte: 3000, q: 0.6, sala: 0.2, bajo: 'calmo', guitarra: 'intimo', rasgueo: 'relajado', bateria: 1 };
      break;
    case 'coleccion':
      // Colección, Crónica y Ajustes: la portada desde la pieza de al lado (más cerrada, más pad, la guitarra lejos)
      m = { capas: { bajo: 0.85, guitarra: 0.85, pad: 1.05, cuerdas: 0.35 }, corte: 1700, q: 0.8, sala: 0.3, bajo: 'calmo', guitarra: 'intimo', rasgueo: 'relajado', bateria: 1 };
      break;
    case 'mapa':
      // el mismo pulso + madera y bombo lejanos + pad misterioso
      m = { capas: { bajo: 1.05, pad: 1.25, cuerdas: 0.65, bandoneon: 0.55, bombo: 0.6, madera: 0.9 }, corte: 2300, q: 0.8, sala: 0.6, bajo: 'milonga', guitarra: 'intimo', rasgueo: 'relajado', bateria: 0 };
      break;
    case 'pulperia':
      // la misma armonía tras el pasabajos de la Pulpería, con rasgueo relajado
      m = { capas: { bajo: 1, rasgueo: 1.45, pad: 0.5, bandoneon: 0.45, bombo: 0.45, madera: 0.45 }, corte: 1700, q: 0.9, sala: 0.25, bajo: 'milonga', guitarra: 'intimo', rasgueo: 'relajado', bateria: 0 };
      break;
    case 'fogon':
      // más cerrada todavía, rasgueo lento y la textura de las brasas
      m = { capas: { bajo: 0.85, rasgueo: 1.4, pad: 0.75, brasas: 1 }, corte: 1500, q: 0.9, sala: 0.3, bajo: 'calmo', guitarra: 'intimo', rasgueo: 'lento', bateria: 1 };
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
      // tramo 1: contrabajo + guitarra + batería base (bombo, rimshot y un roce de escobillas a contratiempo)
      const capas: Partial<Record<CapaId, number>> = { bajo: 1, guitarra: 1, bombo: 1, madera: 0.8, escobillas: 1 };
      if (n >= 2) Object.assign(capas, { bandoneon: 0.9, cuerdas: 0.6, pad: 0.4, escobillas: 0.8, madera: 0.85 });
      if (n >= 3) Object.assign(capas, { bajo: 0.78, bombo: 0.78, bandoneon: 1.2, cuerdas: 0.95, pad: 0.5, escobillas: 1.45, madera: 1.15, rasgueo: 0.75 });
      // contra un Rey la melodía es SU motivo: el bandoneón le deja el lugar
      if (rey) Object.assign(capas, { motivo: e.rey ? 1 : 0, bandoneon: e.rey ? 0 : capas.bandoneon });
      m = { capas, corte: [3900, 4700, 5800][n - 1], q: 0.6, sala: 0.18, bajo: n >= 2 ? 'vivo' : 'milonga', guitarra: n >= 3 ? 'doble' : 'milonga', rasgueo: 'firme', bateria: n };
      break;
    }
  }
  // poca Vida: el latido grave al tempo, el filtro que se cierra con resonancia y la batería que se apaga (casi sin escobillas)
  if (e.vidaBaja && (e.escena === 'mesa' || e.escena === 'rey')) m = { ...m, capas: { ...m.capas, latido: 1, escobillas: (m.capas.escobillas ?? 0) * 0.3, madera: (m.capas.madera ?? 0) * 0.7 }, corte: Math.min(m.corte, 950), q: 3.2 };
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
  /** (0.29) Es una nota del tema (la guitarra, cuando lo canta, la toca más larga y más clara). */
  tema?: boolean;
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

// el arpegio de la guitarra: [paso, voz del acorde, octava, fuerza]; los acentos caen en el 3-3-2. (0.29) Cada modo
// tiene dos dibujos: el segundo suena en la sección B y en las vueltas impares, para que no sea siempre «el mismo
// arpegio transportado».
const ARPEGIO: Record<'intimo' | 'milonga', [number, number, number, number][][]> = {
  intimo: [
    [[0, 0, 0, 0.9], [3, 2, 0, 0.5], [6, 3, 0, 0.8], [8, 2, 0, 0.45], [10, 4, 0, 0.55], [12, 1, 1, 0.8], [14, 2, 0, 0.4]],
    [[0, 0, 0, 0.9], [2, 2, 0, 0.45], [4, 3, 0, 0.5], [6, 1, 1, 0.8], [9, 2, 0, 0.45], [12, 3, 0, 0.8], [14, 4, 0, 0.5]],
  ],
  milonga: [
    [[0, 0, 0, 1], [2, 2, 0, 0.45], [3, 3, 0, 0.5], [4, 2, 0, 0.4], [6, 1, 1, 0.9], [8, 2, 0, 0.45], [9, 4, 0, 0.55], [10, 2, 0, 0.4], [12, 0, 1, 0.9], [14, 3, 0, 0.5]],
    [[0, 0, 0, 1], [3, 2, 0, 0.5], [4, 3, 0, 0.45], [6, 4, 0, 0.9], [7, 2, 0, 0.4], [9, 1, 1, 0.55], [10, 3, 0, 0.4], [12, 2, 1, 0.9], [13, 3, 0, 0.4], [15, 1, 1, 0.45]],
  ],
};
function guitarra(a: Acorde, modo: Mezcla['guitarra'], v: Variante, patron: 0 | 1 = 0): Nota[] {
  const vs = voces(a, 50);
  let n: Nota[] = ARPEGIO[modo === 'intimo' ? 'intimo' : 'milonga'][patron].map(([paso, i, oct, vel]) => ({ paso, dur: 4, midi: vs[i] + 12 * oct, vel }));
  if (v.respiro) n = n.filter((x) => x.paso < 8);
  else if (v.adorno) n.push({ paso: 13, dur: 2, midi: vs[4], vel: 0.5 }, { paso: 15, dur: 2, midi: vs[3], vel: 0.45 });
  // al máximo, los acentos se doblan una octava arriba
  if (modo === 'doble') n.push(...n.filter((x) => (TRES_TRES_DOS as readonly number[]).includes(x.paso)).map((x) => ({ ...x, midi: x.midi + 12, vel: x.vel * 0.75 })));
  return n;
}

function rasgueo(a: Acorde, modo: Mezcla['rasgueo']): Nota[] {
  const vs = voces(a, 50).slice(0, 4);
  const golpes: [number, number, number][] = modo === 'lento' ? [[0, 10, 0.8], [6, 8, 0.45]] : modo === 'relajado' ? [[0, 5, 0.85], [6, 5, 0.55], [12, 2, 0.5]] : [[0, 4, 0.9], [6, 4, 0.7], [10, 1, 0.35], [12, 2, 0.75]];
  return golpes.flatMap(([paso, dur, vel]) => vs.map((midi) => ({ paso, dur, midi, vel })));
}

/** El pad: 3.ª, 7.ª y 9.ª en una ventana fija (La3–Sol#4): los acordes se enlazan solos, sin saltos. */
const pad = (a: Acorde): Nota[] => [a.tonos[1], a.tonos[3], a.tonos[4]].map((c) => ({ paso: 0, dur: 16, midi: desde(c, 57), vel: 0.7 }));
/**
 * Las cuerdas: una nota larga arriba (la 5.ª o la 9.ª, alternando por compás). (0.29) Con `cita`, al cerrar cada
 * media frase le contestan al bandoneón con la cabeza del tema (tres notas del acorde que suben, como «La–Re–Fa»).
 */
function cuerdas(a: Acorde, compas: number, cita: boolean): Nota[] {
  const larga = desde(a.tonos[compas % 2 ? 4 : 2], 69);
  if (!cita) return [{ paso: 0, dur: 16, midi: larga, vel: 0.6 }];
  const n1 = desde(a.tonos[2], 67);
  const n2 = desde(a.tonos[0], n1 + 1);
  const n3 = desde(a.tonos[1], n2 + 1);
  return [{ paso: 0, dur: 8, midi: larga, vel: 0.6 }, { paso: 8, dur: 2, midi: n1, vel: 0.55 }, { paso: 10, dur: 2, midi: n2, vel: 0.6 }, { paso: 12, dur: 4, midi: n3, vel: 0.7 }];
}

// ───────────── el tema de CÁBALA (0.29) ─────────────

/** El registro del bandoneón: de Re4 a La5. */
const BANDONEON: [number, number] = [62, 81];
/** La célula rítmica del tema (3 + 3 + 4 + 2 + 4 semicorcheas): la que se tararea. */
export const RITMO_TEMA = [0, 3, 6, 10, 12] as const;
type Escrito = [paso: number, dur: number, midi: number][][];
/**
 * El tema, escrito a mano en Re menor: ocho compases por sección, [semicorchea, duración, nota MIDI]. Cada compás
 * arranca en una nota de su acorde; lo demás pasa por la escala del compás (lo comprueban las pruebas).
 *
 * A · pregunta (c1–c4): un arpegio que sube y baja por grados, y su eco un tono abajo; la dominante lo estira y
 *     cae en «Mi–Re–La». Respuesta (c5–c8): la misma célula desde Sib trepa hasta La5, baja por el acorde de Sol
 *     menor y se abre en la dominante («Do#–Mi–La»), que pide volver a empezar.
 */
export const TEMA: Partial<Record<SeccionId, Escrito>> = {
  base: [
    // Rem9: La Re Fa · Mi Re
    [[0, 3, 69], [3, 3, 74], [6, 4, 77], [10, 2, 76], [12, 4, 74]],
    // Solm7: Sol Sib Re · Do Sib
    [[0, 3, 67], [3, 3, 70], [6, 4, 74], [10, 2, 72], [12, 4, 70]],
    // La7(b9): La Do# Mi — Sol Fa
    [[0, 3, 69], [3, 3, 73], [6, 6, 76], [12, 2, 79], [14, 2, 77]],
    // Rem9: Mi Re La —
    [[0, 2, 76], [2, 4, 74], [6, 6, 69]],
    // Sibmaj7: Sib Re Fa · Sol La
    [[0, 3, 70], [3, 3, 74], [6, 4, 77], [10, 2, 79], [12, 4, 81]],
    // Solm6: Sol Mi Re · Sib Sol
    [[0, 3, 79], [3, 3, 76], [6, 4, 74], [10, 2, 70], [12, 4, 67]],
    // Mim7(b5): La Sib Re — Mi Re
    [[0, 3, 69], [3, 3, 70], [6, 6, 74], [12, 2, 76], [14, 2, 74]],
    // La7(b9): Do# Mi La —
    [[0, 6, 73], [6, 4, 76], [12, 4, 69]],
  ],
  // B · el puente canta largo, en el relativo mayor: «Do — La Do Fa», y su secuencia subiendo por terceras
  puente: [
    [[0, 6, 72], [6, 3, 69], [9, 3, 72], [12, 4, 77]],
    [[0, 6, 76], [6, 3, 74], [9, 3, 76], [12, 4, 79]],
    [[0, 6, 77], [6, 3, 74], [9, 3, 77], [12, 4, 81]],
    [[0, 6, 79], [6, 6, 76], [12, 4, 73]],
    [[0, 6, 74], [6, 3, 70], [9, 3, 74], [12, 4, 79]],
    [[0, 6, 79], [6, 3, 76], [9, 3, 74], [12, 4, 72]],
    [[0, 6, 69], [6, 3, 72], [9, 3, 77], [12, 4, 76]],
    [[0, 6, 76], [6, 6, 73], [12, 4, 69]],
  ],
  // C · la vuelta: la célula del tema bajando por quintas, con una nota común que ata cada par de compases
  vuelta: [
    [[0, 3, 70], [3, 3, 74], [6, 4, 79], [10, 2, 77], [12, 4, 74]],
    [[0, 3, 70], [3, 3, 74], [6, 4, 79], [10, 2, 76], [12, 4, 72]],
    [[0, 3, 69], [3, 3, 72], [6, 4, 77], [10, 2, 76], [12, 4, 72]],
    [[0, 3, 69], [3, 3, 72], [6, 4, 77], [10, 2, 74], [12, 4, 70]],
    [[0, 3, 67], [3, 3, 70], [6, 4, 76], [10, 2, 74], [12, 4, 70]],
    [[0, 3, 67], [3, 3, 70], [6, 4, 76], [10, 2, 73], [12, 4, 69]],
    [[0, 3, 65], [3, 3, 69], [6, 10, 74]],
    [[8, 2, 69], [10, 2, 73], [12, 4, 76]],
  ],
};
const fuerteEnTema = (paso: number, n: number, total: number): boolean => n === 0 || n === total - 1 || (TRES_TRES_DOS as readonly number[]).includes(paso);

const temas = new Map<string, Nota[][]>();
/**
 * El tema de una sección, sus ocho compases. Las secciones con tema escrito (A, B y C de la milonga) lo tocan tal
 * cual, transportado a la tonalidad; las demás (el duelo, la Cábala, la derrota, la victoria) lo CITAN: el mismo
 * ritmo y el mismo dibujo del tema A (lo que subía, sube; lo que bajaba, baja), llevado a los acordes de esa sección.
 */
export function temaDe(seccion: SeccionId, tonica = TONICA): Nota[][] {
  const id = `${seccion}:${tonica}`;
  let t = temas.get(id);
  if (t) return t;
  const corre = tonica - TONICA;
  const escrito = TEMA[seccion];
  if (escrito) t = escrito.map((c) => c.map(([paso, dur, midi], n) => ({ paso, dur, midi: midi + corre, vel: fuerteEnTema(paso, n, c.length) ? 0.85 : 0.6, tema: true })));
  else {
    const [grave, agudo] = BANDONEON;
    let previa: number | null = null;
    let previaEscrita: number | null = null;
    t = TEMA.base!.map((c, k) => {
      const a = acordeDe(seccion, k, tonica);
      return c.map(([paso, dur, midi], n) => {
        const fuerte = fuerteEnTema(paso, n, c.length);
        const lista = escalera(fuerte ? a.tonos : a.escala, grave + corre, agudo + corre);
        const sube = previaEscrita !== null && midi > previaEscrita;
        const baja = previaEscrita !== null && midi < previaEscrita;
        // el dibujo manda: la nota del acorde (o de la escala) más cercana a la escrita que respete hacia dónde iba
        const lado = previa === null ? lista : lista.filter((x) => (sube ? x > previa! : baja ? x < previa! : x === previa));
        const m = cerca(lado.length ? lado : lista, midi + corre);
        previa = m;
        previaEscrita = midi;
        return { paso, dur, midi: m, vel: fuerte ? 0.85 : 0.6, tema: true };
      });
    });
  }
  temas.set(id, t);
  return t;
}

/** El tema adornado: entre dos notas a una tercera o más, una nota de paso de la escala justo antes de la segunda. */
function adornar(notas: Nota[], a: Acorde): Nota[] {
  const out: Nota[] = [];
  notas.forEach((x, n) => {
    const sig = notas[n + 1];
    if (sig && Math.abs(sig.midi - x.midi) >= 3 && sig.paso - x.paso >= 3) {
      const entre = escalera(a.escala, Math.min(x.midi, sig.midi) + 1, Math.max(x.midi, sig.midi) - 1);
      if (entre.length) {
        out.push({ ...x, dur: Math.min(x.dur, sig.paso - 1 - x.paso) }, { paso: sig.paso - 1, dur: 1, midi: cerca(entre, sig.midi), vel: 0.5, tema: true });
        return;
      }
    }
    out.push(x);
  });
  return out;
}

/** (0.29) El arreglo de un compás: cómo suena esa sección ESTA vez. Cambia con el lugar en la forma y con la vuelta. */
export interface Arreglo {
  pos: number;
  vuelta: number;
  /** El tema: entero, adornado con notas de paso, solo su respuesta (calla la primera mitad) o callado. */
  tema: 'pleno' | 'adornado' | 'respuesta';
  /** Las cuerdas le contestan al tema con su cabeza al cerrar cada media frase. */
  contracanto: boolean;
  /** Si no hay bandoneón en la mezcla, la guitarra canta el tema encima de su arpegio. */
  guitarraCanta: boolean;
  /** El dibujo del arpegio de la guitarra. */
  patron: 0 | 1;
}
export function arregloDe(escena: EscenaId, compas: number): Arreglo {
  const { pos, vuelta, seccion } = lugarEnForma(escena, compas);
  const impar = modulo(vuelta, 2) === 1;
  const esB = seccion !== FORMAS[escena][0];
  switch (pos) {
    case 0:
      return { pos, vuelta, tema: impar ? 'respuesta' : 'pleno', contracanto: false, guitarraCanta: false, patron: 0 };
    case 1:
      return { pos, vuelta, tema: esB ? 'pleno' : 'adornado', contracanto: true, guitarraCanta: !impar, patron: esB || impar ? 1 : 0 };
    case 2:
      return { pos, vuelta, tema: 'pleno', contracanto: impar, guitarraCanta: false, patron: esB ? 1 : 0 };
    default:
      return { pos, vuelta, tema: impar ? 'adornado' : 'pleno', contracanto: true, guitarraCanta: true, patron: esB ? 1 : 0 };
  }
}
/** El tema tal como suena en un compás, con su arreglo. */
export function temaEnCompas(escena: EscenaId, compas: number, tonica = TONICA): Nota[] {
  const { seccion, k } = lugarEnForma(escena, compas);
  const ar = arregloDe(escena, compas);
  if (ar.tema === 'respuesta' && k < FRASE / 2) return [];
  const notas = temaDe(seccion, tonica)[k];
  return ar.tema === 'adornado' ? adornar(notas, acordeDe(seccion, compas, tonica)) : notas;
}

// ───────────── los motivos de los cuatro Reyes ─────────────

export interface MotivoRey {
  /** El centro de su registro: la tónica del acorde se pone lo más cerca posible de acá. */
  centro: number;
  /**
   * Dos compases, que se repiten sobre el acorde de cada compás: [paso, duración, peldaño]. (0.29) El peldaño cuenta
   * las notas del acorde ordenadas por altura desde su tónica (0 = tónica, 5 = la tónica de arriba, −1 = la nota del
   * acorde que queda justo debajo): al cambiar de acorde el motivo cambia de notas pero NO de dibujo.
   */
  celula: [number, number, number][][];
  /** El carácter, para la partitura que lee el juez. */
  caracter: string;
}
export const MOTIVOS: Record<PaloRey, MotivoRey> = {
  // Espadas: una llamada marcial, cortante: una nota repetida, salto arriba y caída por grados
  S: {
    centro: 62,
    caracter: 'marcial y cortante: nota repetida, salto arriba y caída por los peldaños del acorde sobre el 3-3-2',
    celula: [
      [[0, 2, 3], [3, 1, 3], [4, 4, 5], [8, 3, 4], [12, 4, 3]],
      [[0, 3, 2], [3, 3, 1], [6, 6, 0], [14, 2, -2]],
    ],
  },
  // Bastos: tres golpes hondos y lentos sobre el 3-3-2, abajo de todo
  C: {
    centro: 47,
    caracter: 'hondo y pesado: tres notas largas sobre el 3-3-2 (sube y vuelve; después trepa a la tónica de arriba)',
    celula: [
      [[0, 6, 0], [6, 6, 2], [12, 4, 0]],
      [[0, 6, 3], [6, 6, 4], [12, 4, 5]],
    ],
  },
  // Oros: arpegios brillantes de semicorcheas que suben y una cascada que baja
  D: {
    centro: 66,
    caracter: 'brillante: arpegio de semicorcheas que sube una octava y cascada que baja',
    celula: [
      [[0, 1, 0], [1, 1, 2], [2, 1, 3], [3, 1, 4], [4, 4, 5], [8, 2, 6], [10, 2, 5], [12, 4, 7]],
      [[0, 2, 8], [2, 2, 7], [4, 2, 5], [6, 2, 4], [8, 8, 3]],
    ],
  },
  // Copas: una línea ligada que ondula por grados y se posa arriba
  H: {
    centro: 64,
    caracter: 'aterciopelado: ondula por los peldaños (baja dos, vuelve a subir), se posa y suspira',
    celula: [
      [[0, 4, 2], [4, 2, 1], [6, 2, 0], [8, 2, 1], [10, 2, 2], [12, 4, 3]],
      [[0, 6, 4], [6, 2, 3], [8, 8, 2]],
    ],
  },
};
/** Los peldaños de un acorde: sus cinco notas como semitonos sobre la tónica, de grave a agudo. */
export const peldanos = (a: Acorde): number[] => a.tonos.map((t) => mod12(t - a.raiz)).sort((x, y) => x - y);
/** La nota del peldaño `i` de un acorde, con su tónica en `raiz` (MIDI). */
export function notaPeldano(a: Acorde, raiz: number, i: number): number {
  const p = peldanos(a);
  return raiz + p[modulo(i, p.length)] + 12 * Math.floor(i / p.length);
}
/** La tónica del acorde (MIDI) más cercana a `centro` (si empatan, la de abajo). */
export const raizCerca = (a: Acorde, centro: number): number => cerca([desde(a.raiz, Math.ceil(centro) - 12), desde(a.raiz, Math.ceil(centro))], centro);
/** El motivo del Rey sobre el acorde de un compás. En la segunda cara, además, doblado una octava arriba. */
export function motivoRey(rey: PaloRey, a: Acorde, compas: number, segunda = false): Nota[] {
  const m = MOTIVOS[rey];
  const raiz = raizCerca(a, m.centro);
  const n: Nota[] = m.celula[modulo(compas, 2)].map(([paso, dur, i]) => ({ paso, dur, midi: notaPeldano(a, raiz, i), vel: (TRES_TRES_DOS as readonly number[]).includes(paso) ? 0.95 : 0.7 }));
  return segunda ? [...n, ...n.map((x) => ({ ...x, midi: x.midi + 12, vel: x.vel * 0.45 }))] : n;
}
/** El dibujo de una melodía: +1 sube, −1 baja, 0 repite (de cada nota a la siguiente). */
export const dibujo = (midis: number[]): number[] => midis.slice(1).map((m, k) => Math.sign(m - midis[k]));
/** (0.29) La cabeza del motivo de un Rey (sus tres primeros peldaños): lo que cita su voz al hablar. */
export const cabezaMotivo = (rey: PaloRey): number[] => MOTIVOS[rey].celula[0].slice(0, 3).map(([, , i]) => i);
/**
 * Las notas con que una voz cita unos peldaños sobre un acorde: el grupo entero se corre por octavas hasta quedar
 * centrado en su tesitura (así conserva el dibujo); si alguna nota todavía se sale, se pliega sola.
 */
export function citaEnVoz(peld: number[], a: Acorde, grave: number, agudo: number): number[] {
  const crudo = peld.map((i) => notaPeldano(a, desde(a.raiz, 48), i));
  const medio = (Math.min(...crudo) + Math.max(...crudo)) / 2;
  const corre = 12 * Math.round(((grave + agudo) / 2 - medio) / 12);
  return crudo.map((m) => {
    let x = m + corre;
    while (x > agudo) x -= 12;
    while (x < grave) x += 12;
    return x;
  });
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
  // base: solo el roce a contratiempo; rica: el dibujo entero
  let escobillas: Golpe[] = nivel === 1 ? golpesDe('..x...x...x...x.', 0.6, 'escobilla') : [];
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
  arreglo: Arreglo;
  seccion: SeccionId;
  notas: Partial<Record<CapaId, Nota[]>>;
  golpes: Partial<Record<CapaId, Golpe[]>>;
}

/** La guitarra canta el tema encima de su arpegio: donde cae una nota del tema, el arpegio le deja el lugar y baja la voz. */
function guitarraConTema(arpegio: Nota[], tema: Nota[]): Nota[] {
  if (!tema.length) return arpegio;
  const pasos = new Set(tema.map((x) => x.paso));
  return [...arpegio.filter((x) => !pasos.has(x.paso)).map((x) => ({ ...x, vel: x.vel * 0.75 })), ...tema.map((x) => ({ ...x, dur: Math.max(4, x.dur), vel: Math.min(1, x.vel + 0.1) }))].sort((x, y) => x.paso - y.paso);
}

/** Todo lo que suena en un compás, capa por capa. Solo escribe las capas que la mezcla de ese estado deja oír. */
export function partitura(e: EstadoMusical, compas: number, semilla: number): Compas {
  const { seccion, k } = lugarEnForma(e.escena, compas);
  const tonica = tonicaDe(e);
  const acorde = acordeDe(seccion, compas, tonica);
  const sig = acordeDelEstado(e, compas + 1);
  const mezcla = mezclaDe(e);
  const variante = varianteDe(compas, semilla);
  const arreglo = arregloDe(e.escena, compas);
  const suena = (c: CapaId): boolean => (mezcla.capas[c] ?? 0) > 0;
  const notas: Compas['notas'] = {};
  const golpes: Compas['golpes'] = {};
  const conMotivo = suena('motivo') && !!e.rey;
  if (suena('bajo')) notas.bajo = bajo(acorde, sig, mezcla.bajo, variante);
  if (suena('guitarra')) {
    const arpegio = guitarra(acorde, mezcla.guitarra, variante, arreglo.patron);
    // sin bandoneón (ni motivo de Rey) en la mezcla, el tema lo canta la guitarra en los lugares de la forma que le tocan
    notas.guitarra = arreglo.guitarraCanta && !suena('bandoneon') && !conMotivo ? guitarraConTema(arpegio, temaEnCompas(e.escena, compas, tonica)) : arpegio;
  }
  if (suena('rasgueo')) notas.rasgueo = rasgueo(acorde, mezcla.rasgueo);
  if (suena('pad')) notas.pad = pad(acorde);
  if (suena('cuerdas')) notas.cuerdas = cuerdas(acorde, compas, arreglo.contracanto && k % 4 === 3);
  if (suena('bandoneon')) notas.bandoneon = temaEnCompas(e.escena, compas, tonica);
  if (conMotivo) notas.motivo = motivoRey(e.rey!, acorde, compas, e.segunda);
  const b = bateria(compas, mezcla.bateria, semilla);
  if (suena('bombo')) golpes.bombo = b.bombo;
  if (suena('madera')) golpes.madera = b.madera;
  if (suena('escobillas')) golpes.escobillas = b.escobillas;
  if (suena('brasas')) golpes.brasas = brasas(compas, semilla);
  if (suena('latido')) golpes.latido = LATIDO;
  return { compas, acorde, mezcla, variante, arreglo, seccion, notas, golpes };
}

// ───────────── los stingers ─────────────

export interface Stinger {
  /**
   * [medias semicorcheas desde el arranque, duración en medias semicorcheas, peldaño, fuerza, papel]. (0.29) El
   * peldaño cuenta las notas de la TRÍADA DE PREMIO del acorde (0 = tónica, 1 = 3.ª, 2 = 5.ª, 3 = la tónica de
   * arriba…). El papel `remate` es la nota en la que el stinger se posa: busca la nota común con el acorde que viene;
   * `sosten` son las que la acompañan.
   */
  notas: [paso: number, dur: number, peldano: number, vel: number, papel?: 'remate' | 'sosten'][];
  piso: number;
  timbre: 'cuerda' | 'fuelle' | 'campana' | 'grave';
  /** La última nota se desliza desde la anterior (¡MENTIRA!). */
  desliza?: boolean;
  /** Es un premio (todos menos la quema de la Forja Brava). */
  premio: boolean;
}
/**
 * Los stingers. (0.29) Un premio RESUELVE siempre: se escriben sobre la tríada consonante del acorde (tónica, 3.ª y
 * 5.ª justa; en el iiø, que no tiene quinta justa, tónica, 3.ª y 7.ª), nunca tocan la b5 ni la b9, y la nota en la que
 * se posan es la que el acorde de ahora comparte con el que viene (en La7, el La que ya es la quinta de Re menor).
 */
export const STINGERS: Record<StingerId, Stinger> = {
  // ¡ESCOBA!: una barrida que sube dos octavas por la tríada
  escoba: { piso: 50, timbre: 'cuerda', premio: true, notas: [[0, 2, 0, 0.7], [1, 2, 1, 0.7], [2, 2, 2, 0.75], [3, 2, 3, 0.8], [4, 2, 4, 0.85], [5, 2, 5, 0.9], [6, 10, 6, 1, 'remate']] },
  // ¡ENVIDO!: la quinta que llama dos veces y la tónica que planta
  truco: { piso: 57, timbre: 'fuelle', premio: true, notas: [[0, 3, 2, 0.9], [3, 3, 2, 0.8], [6, 10, 3, 1, 'remate']] },
  // ¡CHINCHÓN!: dos escaleritas de tres y el remate arriba
  chinchon: { piso: 57, timbre: 'campana', premio: true, notas: [[0, 2, 0, 0.7], [1, 2, 1, 0.7], [2, 2, 2, 0.8], [4, 2, 1, 0.7], [5, 2, 2, 0.75], [6, 2, 3, 0.8], [8, 10, 4, 1, 'remate']] },
  // ¡MENTIRA!: baja por la tríada y resbala, socarrona, hasta la tónica
  mentiroso: { piso: 57, timbre: 'fuelle', premio: true, desliza: true, notas: [[0, 3, 4, 0.8], [3, 3, 2, 0.8], [6, 10, 0, 1, 'remate']] },
  // ¡CHANCHO!: dos gruñidos abajo y la quinta con su octava que rematan
  chancho: { piso: 38, timbre: 'grave', premio: true, notas: [[0, 2, 0, 1], [2, 2, 0, 0.9], [4, 8, 2, 1, 'remate'], [4, 8, 3, 0.6, 'sosten']] },
  // «¡AL PELO!»: dos toquecitos, quinta y tónica de arriba
  alpelo: { piso: 62, timbre: 'campana', premio: true, notas: [[0, 1, 2, 0.7], [1, 6, 3, 0.9, 'remate']] },
  // Golpe exacto: tónica, quinta y octava, limpias
  exacto: { piso: 62, timbre: 'campana', premio: true, notas: [[0, 2, 0, 0.8], [1, 2, 2, 0.85], [2, 10, 3, 1, 'remate'], [2, 10, 2, 0.5, 'sosten']] },
  // el jackpot de una Evolución: la tríada que trepa dos octavas y media y se queda sonando entera
  evolucion: { piso: 45, timbre: 'cuerda', premio: true, notas: [[0, 2, 0, 0.7], [1, 2, 1, 0.7], [2, 2, 2, 0.75], [3, 2, 3, 0.75], [4, 2, 4, 0.8], [5, 2, 5, 0.8], [6, 2, 6, 0.85], [7, 2, 7, 0.9], [8, 14, 6, 1, 'remate'], [8, 14, 8, 0.6, 'sosten'], [8, 14, 7, 0.6, 'sosten'], [8, 14, 3, 0.5, 'sosten']] },
  // (0.29) la Forja Brava sale (×2): tónica, quinta y octava a martillazos, y el acorde abierto que queda vibrando
  brava: { piso: 50, timbre: 'cuerda', premio: true, notas: [[0, 2, 0, 0.9], [1, 2, 2, 0.85], [2, 2, 3, 0.9], [3, 10, 5, 1, 'remate'], [3, 10, 3, 0.6, 'sosten']] },
  // (0.29) la Forja Brava quema: el fuelle baja por la tríada y se apaga en la tónica (no es premio, pero no desafina)
  quema: { piso: 45, timbre: 'fuelle', premio: false, notas: [[0, 3, 5, 0.8], [3, 3, 4, 0.75], [6, 10, 3, 0.9, 'remate']] },
};

/** ¿Esa nota hace tritono o novena menor contra un bajo? (lo que un premio no puede tener nunca). */
export function choca(midi: number, raiz: number): boolean {
  const d = mod12(midi - raiz);
  return d === 1 || d === 6;
}
/** La tríada de premio de un acorde, como clases de altura: tónica, 3.ª y 5.ª justa (o la 7.ª si la quinta es disminuida). */
export function premio(a: Acorde): number[] {
  return [a.raiz, a.tonos[1], mod12(a.tonos[2] - a.raiz) === 7 ? a.tonos[2] : a.tonos[3]];
}
/** Las notas estables de un acorde: todas menos las que chocan con su propio bajo (la b5 del iiø, la b9 de la dominante). */
export const estables = (a: Acorde): number[] => a.tonos.filter((c) => !choca(c, a.raiz));
/** El peldaño `i` de la tríada de premio, con la tónica en la primera octava desde `piso`. */
export function notaPremio(a: Acorde, piso: number, i: number): number {
  const p = premio(a).map((c) => mod12(c - a.raiz));
  return desde(a.raiz, piso) + p[modulo(i, 3)] + 12 * Math.floor(i / 3);
}
/** Cuánto sigue sonando una nota de stinger después de su duración escrita (las pulsadas y las campanas se apagan solas). */
export const COLA_STINGER = 1.5;

/**
 * Las notas de un stinger que arranca en la semicorchea `pasoEnCompas` del compás de `a`, cuando el compás siguiente
 * es de `sig`. `paso` y `dur` salen en medias semicorcheas. Garantía (la comprueban las pruebas): ninguna nota hace
 * tritono ni novena menor contra el bajo que suena mientras ella suena, aunque el compás cambie debajo.
 */
export function notasStinger(id: StingerId, a: Acorde, sig: Acorde = a, pasoEnCompas = 0): Nota[] {
  const s = STINGERS[id];
  const comunes = premio(a).filter((c) => premio(sig).includes(c));
  const usadas = new Map<number, number[]>();
  /** La nota más cercana a `escrita` (±7) de alguna de esas clases que no choque con ninguno de esos bajos ni repita una usada. */
  const elegir = (escrita: number, clases: number[], bajos: number[], fuera: number[]): number | null => {
    let mejor: number | null = null;
    for (let m = escrita - 7; m <= escrita + 7; m++) {
      if (!clases.includes(mod12(m)) || bajos.some((b) => choca(m, b)) || fuera.includes(m)) continue;
      if (mejor === null || Math.abs(m - escrita) < Math.abs(mejor - escrita)) mejor = m;
    }
    return mejor;
  };
  return s.notas.map(([paso, dur, i, vel, papel]) => {
    const ini = pasoEnCompas + paso / 2;
    const fin = ini + (dur / 2) * COLA_STINGER;
    const yaEs = ini >= PASOS;
    const cruza = !yaEs && fin > PASOS;
    const ac = yaEs ? sig : a;
    const escrita = notaPremio(ac, s.piso, i);
    const fuera = usadas.get(paso) ?? [];
    const bajos = cruza ? [a.raiz, sig.raiz] : [ac.raiz];
    let midi: number | null = null;
    if (yaEs) midi = elegir(escrita, premio(sig), bajos, fuera);
    else if (papel === 'remate') {
      // se posa en la nota que comparten las dos tríadas; si no hay, en la de ahora (o, si el compás cambia debajo, en la que viene)
      midi = elegir(escrita, comunes, bajos, fuera) ?? elegir(escrita, cruza ? premio(sig) : premio(a), bajos, fuera);
    } else if (cruza) midi = elegir(escrita, premio(a).filter((c) => estables(sig).includes(c)), bajos, fuera) ?? elegir(escrita, premio(sig), bajos, fuera);
    else midi = escrita;
    // el último recurso: cualquier nota estable del acorde que viene (o del de ahora) que no choque
    midi ??= elegir(escrita, estables(cruza ? sig : ac), bajos, fuera) ?? elegir(escrita, [...estables(a), ...estables(sig)], bajos, []) ?? escrita;
    if (papel) usadas.set(paso, [...fuera, midi]);
    return { paso, dur, midi, vel };
  });
}

/** Hasta cuántos grados sube el conteo del golpe (dos octavas: arriba de eso la cuerda ya chilla). */
export const CONTEO_TOPE = 14;
/**
 * La nota del paso «n» del conteo del golpe sobre un acorde: cada paso sube un grado de la ESCALA del compás desde la
 * tónica del acorde (entre Sol3 y Fa#4), hasta dos octavas; el total («larga») cae en la tónica o la quinta del acorde.
 */
export function notaConteo(ac: Acorde, n: number, larga = false): number {
  const base = desde(ac.raiz, 55);
  const grados = escalera(ac.escala, base, base + 30);
  const m = grados[Math.min(Math.max(0, n), CONTEO_TOPE)] ?? base;
  if (!larga) return m;
  return cerca(escalera([ac.raiz, premio(ac)[2]], base, base + 30), m);
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
  /** (0.29) El ritmo de las sílabas, si no son todas iguales: semicorcheas de cada una, en rueda (el Bufón: larga–corta). */
  ritmo?: number[];
  /** (0.29) Dónde se para en el escenario: −1 izquierda, 0 centro, 1 derecha. */
  pan: number;
  /** (0.29) Cuánto aire lleva la voz (1 = lo normal): las voces de terciopelo soplan más; los bajos, casi nada. */
  aire?: number;
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
  // el Bufón: tenor buffo, de Re3 a La4. (0.29) Ya no parlotea: canta larga–corta (4,6 sílabas por segundo, no 6,9),
  // a lo sumo ocho notas, con saltos de tercera a quinta y un solo trino, de adorno, al final. Se para a la izquierda.
  bufon: { cuerda: 'tenor buffo', grave: 50, agudo: 69, paso: 2, ritmo: [2, 1], pan: -0.4, tope: 8, estilo: 'buffo', formante: 1.06, vibrato: [5.8, 28], porta: 0.04, ligado: 0.88, vol: 0.8 },
  // los Reyes cantan desde la derecha (el Bufón, desde la izquierda; los Personajes, al centro)
  // el Rey de Espadas: barítono solemne y cortante, de La2 a Mi4
  S: { cuerda: 'barítono', grave: 45, agudo: 64, paso: 1, pan: 0.4, aire: 0.7, tope: 10, estilo: 'recitado', formante: 0.96, vibrato: [5.2, 18], porta: 0.02, ligado: 0.6, vol: 0.93 },
  // el Rey de Bastos: bajo profundo, de Mi2 a Do4
  C: { cuerda: 'bajo profundo', grave: 40, agudo: 60, paso: 2, pan: 0.4, aire: 0.6, tope: 8, estilo: 'profundo', formante: 0.88, vibrato: [5, 22], porta: 0.06, ligado: 0.92, vol: 0.87 },
  // el Rey de Oros: tenor lírico brillante, de Mi3 a Si4, con arpegios
  D: { cuerda: 'tenor lírico', grave: 52, agudo: 71, paso: 1, pan: 0.4, aire: 0.9, tope: 10, estilo: 'arpegio', formante: 1.04, vibrato: [5.6, 30], porta: 0.035, ligado: 0.9, vol: 0.82 },
  // el Rey de Copas: mezzo / contralto aterciopelada, de Sol3 a Mi5, con melismas
  H: { cuerda: 'mezzo / contralto', grave: 55, agudo: 76, paso: 2, pan: 0.4, aire: 1.7, tope: 8, estilo: 'melisma', formante: 1.15, vibrato: [5.4, 34], porta: 0.09, ligado: 1, vol: 0.7 },
  // los Personajes: exclamaciones dulces y breves
  escoba: { cuerda: 'soprano ligera', grave: 62, agudo: 79, paso: 1, pan: 0, aire: 1.4, tope: 4, estilo: 'dulce', formante: 1.2, vibrato: [5.8, 24], porta: 0.04, ligado: 0.9, vol: 0.93 },
  truco: { cuerda: 'barítono', grave: 45, agudo: 64, paso: 1, pan: 0, aire: 0.8, tope: 4, estilo: 'dulce', formante: 0.95, vibrato: [5.2, 20], porta: 0.04, ligado: 0.9, vol: 0.95 },
  chinchon: { cuerda: 'mezzo', grave: 57, agudo: 74, paso: 1, pan: 0, aire: 1.3, tope: 4, estilo: 'dulce', formante: 1.14, vibrato: [5.6, 24], porta: 0.04, ligado: 0.9, vol: 0.83 },
  mentiroso: { cuerda: 'tenor', grave: 50, agudo: 67, paso: 1, pan: 0, aire: 1.2, tope: 4, estilo: 'dulce', formante: 1.02, vibrato: [5.4, 26], porta: 0.07, ligado: 1, vol: 0.77 },
  chancho: { cuerda: 'bajo-barítono', grave: 41, agudo: 60, paso: 1, pan: 0, aire: 0.7, tope: 4, estilo: 'dulce', formante: 0.9, vibrato: [5, 20], porta: 0.04, ligado: 0.9, vol: 0.9 },
};

/** Los tres primeros formantes de cada vocal (Hz, voz de hombre; `PerfilVoz.formante` los corre). */
export const FORMANTES: Record<Vocal, [number, number, number]> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [270, 2290, 3010],
  o: [570, 840, 2410],
  u: [300, 870, 2240],
};

/** (0.29) La fuente de la voz: un tren de armónicos que cae 9 dB por octava (1/k^1,5), más oscuro que el de la 0.28. */
export const FUENTE_VOZ = { armonicos: 40, pendiente: 1.5 } as const;
/** El tracto: la ganancia y la agudeza de cada formante, y el «cuerpo» (un pasabajos en paralelo). */
export const TRACTO = { gan: [1, 0.5, 0.18], q: [5, 8, 9], cuerpo: { hz: 520, gan: 0.22, qdb: 1 } } as const;

/**
 * El nivel (RMS, lineal) con que sale una vocal a una altura por el tracto de `canto.ts`: cada armónico de la fuente
 * pasa por los tres pasabandas en paralelo y el cuerpo (se suman con su fase) y se suma la potencia. Es el modelo con
 * el que se empareja la sonoridad: sin compensar, la «i» de una soprano en La4 sale unos 5 dB más baja que su «a».
 */
export function nivelVocal(vocal: Vocal, midi: number, formante = 1): number {
  const f0 = hz(midi);
  let pot = 0;
  for (let k = 1; k <= FUENTE_VOZ.armonicos && k * f0 < 16000; k++) {
    const f = k * f0;
    let re = 0;
    let im = 0;
    FORMANTES[vocal].forEach((fc0, n) => {
      // pasabanda: H = (j·x/Q) / (1 − x² + j·x/Q), con x = f / fc
      const x = f / (fc0 * formante);
      const a = 1 - x * x;
      const b = x / TRACTO.q[n];
      const d = a * a + b * b;
      re += (TRACTO.gan[n] * b * b) / d;
      im += (TRACTO.gan[n] * b * a) / d;
    });
    // el cuerpo: pasabajos, H = 1 / (1 − x² + j·x/Q)
    const x = f / TRACTO.cuerpo.hz;
    const a = 1 - x * x;
    const b = x / 10 ** (TRACTO.cuerpo.qdb / 20);
    const d = a * a + b * b;
    re += (TRACTO.cuerpo.gan * a) / d;
    im -= (TRACTO.cuerpo.gan * b) / d;
    pot += (re * re + im * im) / k ** (2 * FUENTE_VOZ.pendiente);
  }
  return Math.sqrt(pot / 2);
}
/** Hasta cuánto se deja corregir el nivel de una vocal (dB). */
export const COMPENSA_TOPE = [-14, 12] as const;
/**
 * (0.29) La compensación por vocal y por nota: la ganancia (lineal) que lleva esa vocal, a esa altura, al nivel de
 * la «a» del centro de la tesitura de quien canta. Con esto la «i» y la «u» ya no se hunden en los agudos.
 */
export function compensaVocal(v: PerfilVoz, vocal: Vocal, midi: number): number {
  const ref = nivelVocal('a', Math.round((v.grave + v.agudo) / 2), v.formante);
  const g = ref / nivelVocal(vocal, midi, v.formante);
  return Math.max(10 ** (COMPENSA_TOPE[0] / 20), Math.min(10 ** (COMPENSA_TOPE[1] / 20), g));
}

// ───────────── las consonantes (0.29) ─────────────

export type TipoConsonante = 'ninguna' | 'oclusiva' | 'fricativa' | 'africada' | 'nasal' | 'vibrante' | 'lateral' | 'aproximante';
export type Lugar = 'labial' | 'dental' | 'velar' | 'palatal' | 'sibilante' | 'glotal';
export interface Consonante {
  tipo: TipoConsonante;
  lugar: Lugar;
  sonora: boolean;
  /** Las vibraciones de la lengua: 1 la «r» simple, 3 la «rr» y la «r» que empieza palabra. */
  golpes?: number;
}
const C = (tipo: TipoConsonante, lugar: Lugar, sonora: boolean, golpes?: number): Consonante => (golpes ? { tipo, lugar, sonora, golpes } : { tipo, lugar, sonora });
export const SIN_CONSONANTE: Consonante = C('ninguna', 'glotal', true);
const VOCALES_TODAS = 'aeiouáéíóúü';
/**
 * La consonante con la que ataca una sílaba, por su letra (aproximación fonética). En español rioplatense la «ll» y
 * la «y» son fricativas («sh» sonora), la «h» es muda y la «r» que abre palabra vibra tres veces; en inglés la «r» y
 * la «w» son aproximantes y la «h» se aspira.
 */
export function consonanteDe(silaba: string, idioma: Idioma = 'es', inicial = false): Consonante {
  const w = silaba.toLowerCase().replace(/[^\p{L}]/gu, '');
  if (!w) return SIN_CONSONANTE;
  const a = w[0];
  const b = w[1] ?? '';
  const ante = (c: string): boolean => c !== '' && 'eiéíy'.includes(c);
  if (idioma === 'en') {
    if ('aeiou'.includes(a)) return SIN_CONSONANTE;
    if (a === 't' && b === 'h') return C('fricativa', 'dental', true);
    if (a === 's' && b === 'h') return C('fricativa', 'palatal', false);
    if (a === 'c' && b === 'h') return C('africada', 'palatal', false);
    if (a === 'p' && b === 'h') return C('fricativa', 'labial', false);
    if (a === 'k' && b === 'n') return C('nasal', 'dental', true);
    if (a === 'w' || a === 'y') return C('aproximante', a === 'w' ? 'labial' : 'palatal', true);
    if (a === 'r') return C('aproximante', 'dental', true);
    if (a === 'h') return C('fricativa', 'glotal', false);
    if (a === 'j') return C('africada', 'palatal', true);
    if (a === 'v') return C('fricativa', 'labial', true);
    if (a === 'z') return C('fricativa', 'sibilante', true);
  } else {
    if (VOCALES_TODAS.includes(a)) return SIN_CONSONANTE;
    if (a === 'h') return b === 'u' && w.length > 2 && VOCALES_TODAS.includes(w[2]) ? C('aproximante', 'labial', true) : SIN_CONSONANTE;
    if (a === 'c' && b === 'h') return C('africada', 'palatal', false);
    if ((a === 'l' && b === 'l') || a === 'y') return C('fricativa', 'palatal', true);
    if (a === 'r') return C('vibrante', 'dental', true, b === 'r' || inicial ? 3 : 1);
    if (a === 'j' || (a === 'g' && ante(b))) return C('fricativa', 'velar', false);
    if (a === 'z') return C('fricativa', 'sibilante', false);
    if (a === 'v') return C('oclusiva', 'labial', true);
    if (a === 'ñ') return C('nasal', 'palatal', true);
    if (a === 'w') return C('aproximante', 'labial', true);
  }
  if (a === 'c') return ante(b) ? C('fricativa', 'sibilante', false) : C('oclusiva', 'velar', false);
  if (a === 's' || a === 'x') return C('fricativa', 'sibilante', false);
  if (a === 'f') return C('fricativa', 'labial', false);
  if (a === 'p') return C('oclusiva', 'labial', false);
  if (a === 'b') return C('oclusiva', 'labial', true);
  if (a === 't') return C('oclusiva', 'dental', false);
  if (a === 'd') return C('oclusiva', 'dental', true);
  if (a === 'k' || a === 'q') return C('oclusiva', 'velar', false);
  if (a === 'g') return C('oclusiva', 'velar', true);
  if (a === 'm') return C('nasal', 'labial', true);
  if (a === 'n') return C('nasal', 'dental', true);
  if (a === 'l') return C('lateral', 'dental', true);
  return SIN_CONSONANTE;
}

/** Cómo suena el ataque de una consonante: lo que `canto.ts` programa antes de abrir la vocal. */
export interface Articulacion {
  /** Segundos que la consonante le saca al principio de la sílaba (la vocal abre recién después). */
  previa: number;
  /** El silencio del cierre de una oclusiva (segundos, dentro de `previa`). */
  cierre: number;
  /** El soplo: ruido filtrado, breve. `hz` es el centro (pasabanda) o el corte (pasaaltos). */
  ruido: { filtro: 'bandpass' | 'highpass'; hz: number; q: number; dur: number; vol: number } | null;
  /** Cuánto suena la voz mientras dura la consonante (0 las sordas; un murmullo las sonoras, las nasales y las líquidas). */
  voz: number;
  /** La boca durante la consonante: los dos primeros formantes desde los que se abre la vocal (las nasales y las líquidas). */
  boca: [number, number] | null;
  /** Las vibraciones de la lengua (cortes brevísimos de la voz). */
  golpes: number;
}
/** El estallido de una oclusiva y el soplo de una fricativa, por lugar: [filtro, Hz, Q, volumen]. La «s» sopla por encima de 5 kHz (fuera de la banda que cansa). */
const SOPLO: Record<Lugar, ['bandpass' | 'highpass', number, number, number]> = {
  labial: ['bandpass', 700, 0.8, 0.5],
  dental: ['bandpass', 2300, 1.1, 0.4],
  velar: ['bandpass', 1500, 2.2, 0.5],
  palatal: ['bandpass', 2100, 1.4, 0.45],
  sibilante: ['highpass', 5200, 0.7, 0.3],
  glotal: ['bandpass', 1000, 0.6, 0.3],
};
/** El ataque de cada consonante, derivado de su tipo y su lugar. Las oclusivas duran 30–42 ms; las fricativas, 45–70. */
export function articular(c: Consonante): Articulacion {
  const [filtro, hzS, q, vol] = SOPLO[c.lugar];
  switch (c.tipo) {
    case 'oclusiva':
      // el cierre (silencio, o un murmullo si es sonora) y el estallido
      return { previa: c.sonora ? 0.03 : 0.042, cierre: c.sonora ? 0.016 : 0.026, ruido: { filtro, hz: hzS, q, dur: c.sonora ? 0.012 : 0.018, vol: c.sonora ? vol * 0.6 : vol }, voz: c.sonora ? 0.18 : 0, boca: null, golpes: 0 };
    case 'fricativa':
      return { previa: c.sonora ? 0.045 : 0.065, cierre: 0, ruido: { filtro, hz: hzS, q, dur: c.sonora ? 0.05 : 0.07, vol: (c.lugar === 'labial' ? vol * 0.5 : vol) * (c.sonora ? 0.6 : 1) }, voz: c.sonora ? 0.35 : 0, boca: null, golpes: 0 };
    case 'africada':
      return { previa: 0.065, cierre: 0.022, ruido: { filtro, hz: hzS, q, dur: 0.045, vol }, voz: c.sonora ? 0.25 : 0, boca: null, golpes: 0 };
    case 'nasal':
      // el murmullo nasal: la voz sigue, apagada, con la boca cerrada (un solo formante grave)
      return { previa: 0.05, cierre: 0, ruido: null, voz: 0.4, boca: [260, c.lugar === 'labial' ? 900 : 1400], golpes: 0 };
    case 'vibrante':
      return { previa: 0.03 + 0.03 * ((c.golpes ?? 1) - 1), cierre: 0, ruido: null, voz: 0.7, boca: [420, 1400], golpes: c.golpes ?? 1 };
    case 'lateral':
      return { previa: 0.04, cierre: 0, ruido: null, voz: 0.55, boca: [360, 1300], golpes: 0 };
    case 'aproximante':
      return { previa: 0.045, cierre: 0, ruido: null, voz: 0.6, boca: c.lugar === 'labial' ? [300, 800] : c.lugar === 'palatal' ? [280, 2200] : [420, 1300], golpes: 0 };
    default:
      return { previa: 0, cierre: 0, ruido: null, voz: 1, boca: null, golpes: 0 };
  }
}

// ───────────── el silabeo ─────────────

/** Cómo termina la frase que cierra una sílaba: de eso depende hacia dónde va la melodía. */
export type Cierre = '' | ',' | '.' | '!' | '?' | '…';
export interface Silaba {
  texto: string;
  vocal: Vocal;
  cierre: Cierre;
  /** (0.29) La consonante con la que ataca. */
  consonante: Consonante;
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
      (s.length ? s : [{ texto: m[1], vocal: 'e' as Vocal }]).forEach((x, k) => out.push({ ...x, cierre: '', consonante: consonanteDe(x.texto, idioma, k === 0) }));
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
  /** El Bufón trina (solo al final de todo); Copas hace un melisma (dos notas más, ligadas, sobre la misma sílaba). */
  adorno?: 'trino' | 'melisma';
  consonante: Consonante;
  /** (0.29) Un Rey abre su frase citando la cabeza de su motivo: los peldaños del grupo y cuál le toca a esta sílaba. */
  cita?: { peldanos: number[]; k: number };
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
    // (0.29) lo largo se resume por FRASES, no salteando sílabas dentro de las palabras: se canta entero lo que
    // entra desde el principio y, de cada frase que ya no entra, su arranque (si queda lugar) y su última sílaba, que
    // es la que lleva la cadencia. Así «¿Una manito? La casa siempre pierde… dicen.» es «U-na-ma-ni-to? La… de… cen.»
    const frases: Silaba[][] = [[]];
    for (const s of sil) {
      frases[frases.length - 1].push(s);
      if (s.cierre) frases.push([]);
    }
    if (!frases[frases.length - 1].length) frases.pop();
    const res: Silaba[] = [];
    let quedan = tope;
    frases.forEach((f, k) => {
      // a cada frase que falta se le guarda al menos su última sílaba
      const lugar = quedan - Math.min(quedan, frases.length - 1 - k);
      if (lugar <= 0) return;
      const toma = f.length <= lugar ? f : [...f.slice(0, lugar - 1), f[f.length - 1]];
      res.push(...toma.map((s) => ({ ...s })));
      quedan -= toma.length;
    });
    // si había más frases que notas, la última nota cierra como cerraba el texto
    if (res.length) res[res.length - 1].cierre ||= sil[sil.length - 1].cierre;
    sil = res.length ? res : [{ ...sil[sil.length - 1] }];
  }
  const r = azarDe(clave(semilla, texto.length, texto.charCodeAt(0) | 0, quien.charCodeAt(0)));
  const ancho = v.agudo - v.grave;
  const cabeza = quien === 'S' || quien === 'C' || quien === 'D' || quien === 'H' ? cabezaMotivo(quien) : null;
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
          // (0.29) cantable: un arco con vaivén de terceras (antes, zigzag de quintas y octavas)
          objetivo = base + Math.sin(x * Math.PI) * 3.5 + (k % 2 ? 1 : -1) * (1.2 + r() * 1.3);
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
      const largo = ultima ? v.paso + (cierre === '…' ? 4 : cierre === '' || cierre === ',' ? 1 : 2) : v.ritmo ? v.ritmo[k % v.ritmo.length] : v.paso;
      const nota: NotaPlan = { silaba: s.texto, vocal: s.vocal, paso, dur: largo, objetivo: Math.max(v.grave, Math.min(v.agudo, objetivo)), regla: ultima ? REGLA[cierre] : 'libre', entra: k === 0, consonante: s.consonante };
      // (0.29) un Rey abre lo que dice con la cabeza de su motivo (hasta tres notas; la última de la frase la manda la puntuación, y una pregunta no cita: tiene que subir)
      if (cabeza && desdeK === 0 && cierre !== '?' && k < Math.min(cabeza.length, n - 1)) nota.cita = { peldanos: cabeza.slice(0, Math.min(cabeza.length, n - 1)), k };
      // el trino del Bufón: solo de adorno, en la última nota de todo lo que dice y si cierra con exclamación; el melisma de Copas, en la penúltima sílaba
      if (v.estilo === 'buffo' && ultima && cierre === '!' && hastaK === sil.length - 1) nota.adorno = 'trino';
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
  // (0.29) la cita del motivo del Rey: el grupo entero, sobre este acorde, centrado en su tesitura
  if (n.cita) return citaEnVoz(n.cita.peldanos, a, v.grave, v.agudo)[n.cita.k];
  // (0.29) el Bufón no salta más de una quinta: de cada lista se queda con lo que tiene a mano
  const mano = (l: number[]): number[] => {
    if (v.estilo !== 'buffo' || anterior === null) return l;
    const c = l.filter((x) => Math.abs(x - anterior) <= SALTO_BUFFO);
    return c.length ? c : l;
  };
  switch (n.regla) {
    case 'sube': {
      // la pregunta termina arriba: 5.ª, 7.ª o 9.ª por encima de lo que venía (y de donde empezó la frase)
      const piso = Math.max(prev, primera ?? prev);
      const arriba = mano(de([2, 3, 4])).filter((x) => x > piso);
      if (arriba.length) return arriba[0];
      const mas = todas.filter((x) => x > piso);
      return mas.length ? mas[0] : todas[todas.length - 1];
    }
    case 'resuelve':
      // la exclamación cae en la tónica o la quinta
      return cerca(mano(de([0, 2])), prev - 1);
    case 'suspende':
      return cerca(mano(de([3, 4])), prev);
    case 'reposa': {
      const l = mano(de([0, 1]));
      const abajo = l.filter((x) => x <= prev);
      return abajo.length ? abajo[abajo.length - 1] : l[0];
    }
    case 'coma':
      return cerca(mano(de([1, 2])), prev);
    default: {
      const l = mano(todas);
      let m = cerca(l, n.objetivo);
      // que la melodía se mueva: la misma nota dos veces seguidas solo la recita Espadas
      if (m === anterior && v.estilo !== 'recitado' && l.length > 1) m = cerca(l.filter((x) => x !== anterior), n.objetivo);
      return m;
    }
  }
}

/** El salto más grande que canta el Bufón dentro de una frase: una quinta. */
export const SALTO_BUFFO = 7;
/** (0.29) La nota de un trino de verdad: el grado vecino de arriba en la ESCALA del compás (antes era la nota vecina del acorde: un trémolo de terceras). */
export function vecinaDeEscala(quien: VozId, midi: number, a: Acorde): number {
  const v = VOCES[quien];
  const arriba = escalera(a.escala, midi + 1, Math.min(v.agudo, midi + 2));
  if (arriba.length) return arriba[0];
  const abajo = escalera(a.escala, Math.max(v.grave, midi - 2), midi - 1);
  return abajo.length ? abajo[abajo.length - 1] : midi;
}
/** La nota de adorno de un melisma: la nota del acorde vecina (arriba o abajo). */
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
    const adornos = n.adorno === 'trino' ? [vecinaDeEscala(quien, midi, a)] : n.adorno === 'melisma' ? [vecinaDelAcorde(quien, midi, a, 1), vecinaDelAcorde(quien, midi, a, -1)] : [];
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
