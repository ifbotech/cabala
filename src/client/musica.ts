// La música del juego (0.28): UN reloj para todas las pantallas. Ninguna pantalla corta la música: `ponerMusica`
// pide una escena y el director (`musica/motor.ts`) la hace entrar en el próximo límite de compás, con las capas
// que le tocan, sobre el mismo pulso (104 negras por minuto) y la misma armonía (Re menor). El combate le cuenta en
// vivo cómo va (`estadoCombate`): tramo, Furia, racha, poca Vida, qué Rey está en la mesa y si mostró la segunda cara.
// Los personajes cantan (`cantar`) y las jugadas tienen su stinger (`stinger`), afinados al acorde que suena.
//
// Acá solo vive lo que el motor no puede saber: los ajustes del jugador, el reloj del navegador (un intervalo de
// 30 ms que planifica 140 ms por delante), la pestaña oculta y el idioma. Con la música apagada y nadie cantando, el
// intervalo se apaga: cero trabajo.
import type { Palo } from '../rules/cartas';
import { ajustes, idioma } from './almacen';
import { alAbrirAudio, contextoAudio, despertarAudio, hablaron, ponerAfinador, salidaEfectos, salidaMusica, salidaSala, type VozId } from './audio';
import { INTERVALO, Motor } from './musica/motor';
import { nivelDe, type Acorde, type EscenaId, type PaloRey, type StingerId } from './musica/teoria';

/** Las escenas (antes, «pistas»): todas viven sobre el mismo reloj. */
export type PistaId = EscenaId;

let motor: Motor | null = null;
let deseada: PistaId | null = null;
let reloj = 0;
let enganchado = false;
/** Las escenas que sonaron (para la QA, que no oye). */
export const pistasSonadas: PistaId[] = [];
/** Lo último que contó el combate (se recuerda aunque el audio todavía no esté abierto). */
const combate: { tramo: number; furia: number; racha: number; vidaPct: number; rey: PaloRey | null; segunda: boolean } = { tramo: 0, furia: 0, racha: 0, vidaPct: 1, rey: null, segunda: false };
/** Los stingers que se pidieron (para la QA, que no oye). */
const stingersPedidos: StingerId[] = [];
/** Por debajo de esta parte de la Vida suena el latido. */
export const VIDA_BAJA = 0.3;

/** El director, si el audio ya está abierto (se crea la primera vez, sobre el contexto y los buses de `audio.ts`). */
function director(): Motor | null {
  const ctx = contextoAudio();
  const musica = salidaMusica();
  const efectos = salidaEfectos();
  const sala = salidaSala();
  if (!ctx || !musica || !efectos || !sala) return null;
  if (!motor) {
    motor = new Motor(ctx, { musica, efectos, sala });
    motor.alCambiar = (e) => {
      pistasSonadas.push(e);
      if (pistasSonadas.length > 40) pistasSonadas.shift();
    };
  }
  return motor;
}

/** Le pasa al director lo que se quiere oír. Él lo aplica en el próximo compás. */
function pedir(m: Motor): void {
  const enMesa = deseada === 'mesa' || deseada === 'rey';
  m.pedir({
    ...(deseada ? { escena: deseada } : {}),
    nivel: nivelDe(enMesa ? combate : {}),
    vidaBaja: enMesa && combate.vidaPct < VIDA_BAJA,
    rey: deseada === 'rey' ? combate.rey : null,
    segunda: deseada === 'rey' && combate.segunda,
  });
  m.rtpc({ furia: enMesa ? combate.furia : 0 });
}

function tic(): void {
  const m = director();
  if (!m) return;
  const quiere = ajustes.musica && deseada !== null;
  // con la pestaña oculta el reloj del navegador va a saltos: nada se programa (al volver, el director se pone al día)
  const oculta = typeof document !== 'undefined' && document.hidden;
  if (ajustes.musica && !oculta) {
    pedir(m);
    m.activar(true);
    m.abrir(quiere);
  } else if (!ajustes.musica) m.activar(false);
  if (!oculta && (m.estaActiva || m.cantando)) m.tic();
  // nada que hacer: el intervalo se apaga hasta que alguien pida música o cante
  if (!ajustes.musica && !m.cantando) dormir();
}
function dormir(): void {
  if (reloj) window.clearInterval(reloj);
  reloj = 0;
}
function despertar(): void {
  if (typeof window === 'undefined') return;
  if (!enganchado) {
    enganchado = true;
    alAbrirAudio(despertar);
  }
  if (!reloj) reloj = window.setInterval(tic, INTERVALO * 1000);
  tic();
}

/**
 * Pide la escena de la pantalla que se monta: entra en el próximo límite de compás, sin cortar nada. Con `null`, la
 * música calla con un fundido corto pero el reloj sigue (el silencio de la caída de un Rey).
 */
export function ponerMusica(id: PistaId | null): void {
  deseada = id;
  if (ajustes.musica) despertar();
}

/**
 * El combate cuenta cómo va: el tramo (0, 1, 2), la Furia, la racha de Golpes exactos, la parte de Vida que te queda
 * (0–1), el Rey que está en la mesa y si ya mostró su segunda cara. Las capas responden en el próximo compás.
 */
export function estadoCombate(e: { tramo?: number; furia?: number; racha?: number; vidaPct?: number; rey?: Palo | null; segunda?: boolean }): void {
  const { rey, ...resto } = e;
  Object.assign(combate, resto);
  if (rey !== undefined) combate.rey = rey === 'S' || rey === 'C' || rey === 'D' || rey === 'H' ? rey : null;
  if (motor) pedir(motor);
}
/** La racha encendida (dos Golpes exactos seguidos o más): las capas, al máximo. */
export const ponerFuego = (si: boolean): void => estadoCombate({ racha: si ? Math.max(2, combate.racha) : Math.min(1, combate.racha) });

/** Un stinger afinado al acorde del momento: los cantos de cada Mazo, «¡AL PELO!», el Golpe exacto y el jackpot de una Evolución. */
export function stinger(tipo: StingerId): void {
  stingersPedidos.push(tipo);
  if (stingersPedidos.length > 40) stingersPedidos.shift();
  if (!ajustes.sonido) return;
  try {
    director()?.stinger(tipo);
  } catch {
    // sin audio: el juego sigue en silencio
  }
}

/**
 * Alguien canta lo que dice: cada sílaba, una nota del acorde del compás, en su tesitura y con su manera. `breve`:
 * una exclamación (a lo sumo cuatro notas). Devuelve los milisegundos que dura (0 si no se oye).
 */
export function cantar(quien: VozId, texto: string, o: { breve?: boolean } = {}): number {
  if (!hablaron.includes(quien)) hablaron.push(quien);
  if (!ajustes.sonido) return 0;
  try {
    const m = director();
    if (!m) return 0;
    const seg = m.cantar(quien, texto, { idioma: idioma(), breve: o.breve });
    // el reloj tiene que seguir andando hasta que termine la frase, aunque la música esté apagada
    if (seg > 0 && !reloj) reloj = window.setInterval(tic, INTERVALO * 1000);
    return Math.round(seg * 1000);
  } catch {
    return 0;
  }
}

/**
 * La caída de un Rey: en vez de callar, la música remata con una cadencia cuantizada a la próxima negra (La7 → Re
 * menor; `mayor`: Re mayor, la de la victoria final) y sigue sola hacia la sección que venga.
 */
export function remateMusica(mayor = false): void {
  if (!ajustes.musica) return;
  try {
    director()?.rematar(mayor);
  } catch {
    // sin audio: el juego sigue en silencio
  }
}

/** Al cambiar el ajuste: suena o calla ya (el clic que la prende abre el audio si todavía estaba cerrado). */
export const refrescarMusica = (): void => {
  if (ajustes.musica) {
    despertarAudio();
    despertar();
  } else tic();
};

// los efectos melódicos (el oro, el conteo del golpe, la llegada del Rey…) se afinan al acorde que suena
ponerAfinador(() => {
  const a = motor?.armonia().acorde;
  return a ? { tonos: a.tonos, escala: a.escala } : null;
});

/** Para la QA: qué escena se pidió, cuál suena y cuántas semicorcheas lleva programadas. */
export const estadoMusica = (): { deseada: PistaId | null; suena: PistaId | null; pasos: number; reloj: number; arranques: number; combate: typeof combate; nivel: number; stingers: string[] } => ({
  deseada,
  suena: motor?.suena ?? null,
  pasos: motor?.pasosDados ?? 0,
  // el reloj (la semicorchea por la que va) y cuántas veces arrancó: si la música no se corta, arranca UNA vez
  reloj: motor?.paso ?? 0,
  arranques: motor?.arranques ?? 0,
  combate: { ...combate },
  nivel: motor?.aplicado.nivel ?? 0,
  stingers: [...stingersPedidos],
});
/** El acorde y la escala del compás que suena ahora (lo que leen las voces), o `null` si el audio no está abierto. */
export const armoniaActual = (): { acorde: Acorde; compas: number; paso: number } | null => motor?.armonia() ?? null;
