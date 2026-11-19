// El hilo del juego en el cliente: qué partida hay, qué pantalla toca y cuándo se guarda. Las pantallas piden aquí
// los cambios de fase; las reglas viven en src/rules.
import type { Partida } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import { nuevaPartida } from '../rules/partida';
import { anotar, reinadoMax } from '../rules/perfil';
import { semillaNueva } from '../rules/rng';
import { cargarPartida, guardarPartida, guardarPerfil, perfil } from './almacen';
import { ponerEscena, type Escena } from './fx/motor';
import { apagarRetrato } from './hud';
import { pantallaBotin, pantallaCabala, pantallaFin, pantallaFogon, pantallaMapa, pantallaPulperia } from './pantallas/camino';
import { pantallaAjustes, pantallaAltar, pantallaColeccion, pantallaCronica, pantallaMazo, pantallaPortada } from './pantallas/menu';
import { pantallaMesa } from './pantallas/mesa';
import { precargarPersonaje } from './precarga';
import { montar, type Pantalla } from './ui';

export const sesion: {
  partida: Partida | null;
  /** Mazos y Reinado que se abrieron con la última partida (para contarlo en el final). */
  abiertos: MazoId[];
  reinadoAbierto: number;
  anotada: boolean;
  /** Modo QA: nada se guarda en el navegador. */
  qa: boolean;
} = { partida: null, abiertos: [], reinadoAbierto: 0, anotada: false, qa: false };

function ir(p: Pantalla, escena: Escena): void {
  apagarRetrato();
  ponerEscena(escena);
  montar(p);
}

export const irPortada = (): void => ir(pantallaPortada(), 'portada');
export const irMazo = (): void => ir(pantallaMazo(), 'portada');
export const irAltar = (): void => ir(pantallaAltar(), 'altar');
export const irColeccion = (): void => ir(pantallaColeccion(), 'portada');
export const irCronica = (): void => ir(pantallaCronica(), 'portada');
export const irAjustes = (): void => ir(pantallaAjustes(), 'portada');

/** Guarda la partida en curso (o la borra si terminó). */
export function guardar(): void {
  if (sesion.qa) return;
  guardarPartida(sesion.partida);
  guardarPerfil();
}

/** Empieza una partida nueva con ese Mazo y ese Reinado. */
export function empezar(mazo: MazoId, reinado: number, semilla?: string): void {
  sesion.partida = nuevaPartida({ mazo, reinado: Math.min(reinado, reinadoMax(perfil)), altar: { ...perfil.altar }, semilla: semilla ?? semillaNueva((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0) });
  sesion.anotada = false;
  precargarPersonaje(mazo);
  guardar();
  pintarFase();
}

/** Retoma la partida guardada, si hay. */
export function continuar(): boolean {
  const p = sesion.partida ?? cargarPartida();
  if (!p) return false;
  sesion.partida = p;
  sesion.anotada = false;
  precargarPersonaje(p.mazoId);
  pintarFase();
  return true;
}
export const hayPartida = (): boolean => !!(sesion.partida ?? (sesion.qa ? null : cargarPartida()));

/** La partida terminó: se anota en el perfil una sola vez (Porotos, hitos, Crónica). */
function anotarFin(p: Partida): void {
  if (sesion.anotada) return;
  sesion.anotada = true;
  const antes = reinadoMax(perfil);
  sesion.abiertos = anotar(perfil, p, Date.now());
  const ahora = reinadoMax(perfil);
  sesion.reinadoAbierto = ahora > antes ? ahora : 0;
  if (sesion.qa) return;
  guardarPartida(null);
  guardarPerfil();
}

/** Monta la pantalla que corresponde a la fase de la partida. */
export function pintarFase(): void {
  const p = sesion.partida;
  if (!p) {
    irPortada();
    return;
  }
  switch (p.fase) {
    case 'botin':
      ir(pantallaBotin(p), p.botin?.de === 'inicio' ? 'portada' : 'mesa');
      break;
    case 'mapa':
      ir(pantallaMapa(p), 'mapa');
      break;
    case 'combate':
      ir(pantallaMesa(p), 'mesa');
      break;
    case 'pulperia':
      ir(pantallaPulperia(p), 'pulperia');
      break;
    case 'fogon':
      ir(pantallaFogon(p), 'pulperia');
      break;
    case 'cabala':
      ir(pantallaCabala(p), 'altar');
      break;
    case 'fin':
      anotarFin(p);
      ir(pantallaFin(p), p.fin?.victoria ? 'portada' : 'altar');
      break;
  }
}

/** Tras una acción fuera del combate: guarda y vuelve a pintar lo que toque. */
export function avanzar(): void {
  guardar();
  pintarFase();
}

/** Deja la partida terminada y vuelve a la portada. */
export function soltarPartida(): void {
  sesion.partida = null;
  irPortada();
}
