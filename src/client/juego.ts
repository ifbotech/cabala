// El hilo del juego en CÁBALA 2.0: portada (JUGAR / COLECCIÓN / AJUSTES), selección de Mazo y las 5 fases de la partida.
import type { Partida } from '../rules/estado';
import type { MazoId } from '../rules/mazos';
import { nuevaPartida } from '../rules/partida';
import { anotar } from '../rules/perfil';
import { resumenDe, type ResumenPartida } from '../rules/resumen';
import { semillaNueva } from '../rules/rng';
import { cargarPartida, guardarPartida, guardarPerfil, perfil } from './almacen';
import { ponerEscena, type Escena } from './fx/motor';
import { apagarRetrato } from './hud';
import { ponerMusica, type PistaId } from './musica';
import { pantallaBotin, pantallaFin, pantallaPulperia } from './pantallas/camino';
import { pantallaAjustes, pantallaColeccion, pantallaMazo, pantallaPortada } from './pantallas/menu';
import { pantallaMesa } from './pantallas/mesa';
import { pantallaDueloBufon } from './pantallas/dueloBufon';
import { precargarPersonaje } from './precarga';
import { montar, type Pantalla } from './ui';

export const sesion: {
  partida: Partida | null;
  anotada: boolean;
  resumen: ResumenPartida | null;
  qa: boolean;
} = { partida: null, anotada: false, resumen: null, qa: false };

function ir(p: Pantalla, escena: Escena, pista: PistaId = 'portada', seguido = false): void {
  apagarRetrato();
  ponerEscena(escena);
  ponerMusica(pista);
  montar(p, seguido);
}

export const irPortada = (): void => ir(pantallaPortada(), 'portada');
export const irDueloBufon = (p: Partida): void => ir(pantallaDueloBufon(p), 'mesa', 'cabala');
export const irMazo = (): void => ir(pantallaMazo(), 'portada');
export const irColeccion = (): void => ir(pantallaColeccion(), 'coleccion', 'coleccion');
export const irAjustes = (): void => ir(pantallaAjustes(), 'mesa', 'coleccion');

export function guardar(): void {
  if (sesion.qa) return;
  guardarPartida(sesion.partida);
  guardarPerfil();
}

export function empezar(mazo: MazoId, semilla?: string): void {
  sesion.partida = nuevaPartida({ mazo, semilla: semilla ?? semillaNueva((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0) });
  sesion.anotada = false;
  precargarPersonaje(mazo);
  guardar();
  pintarFase();
}

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

function anotarFin(p: Partida): void {
  if (sesion.anotada) return;
  sesion.anotada = true;
  sesion.resumen = resumenDe(p, perfil);
  anotar(perfil, p);
  if (sesion.qa) return;
  guardarPartida(null);
  guardarPerfil();
}

export function pintarFase(desdeMesa = false): void {
  const p = sesion.partida;
  if (!p) {
    irPortada();
    return;
  }
  switch (p.fase) {
    case 'botin':
      ir(pantallaBotin(p, desdeMesa), 'mesa', 'mapa', desdeMesa);
      break;
    case 'combate':
      ir(pantallaMesa(p), 'mesa', p.combate?.tipo === 'rey' ? 'rey' : 'mesa');
      break;
    case 'pulperia':
      ir(pantallaPulperia(p), 'pulperia', 'pulperia');
      break;
    case 'duelo':
      ir(pantallaDueloBufon(p), 'mesa', 'cabala');
      break;
    case 'fin':
      anotarFin(p);
      ir(pantallaFin(p), p.fin?.victoria ? 'amanecer' : 'ocaso', p.fin?.victoria ? 'victoria' : 'derrota');
      break;
  }
}

export function avanzar(): void {
  guardar();
  pintarFase();
}

export function soltarPartida(): void {
  sesion.partida = null;
  irPortada();
}
