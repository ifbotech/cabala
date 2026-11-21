// La forja en segundo plano: los sprites se dibujan por código (tramado incluido), y los grandes tardan lo suyo.
// Para que ninguno frene un cuadro en mitad de un golpe, al arrancar se dejan pedidos todos y se van pintando de a
// uno en los ratos libres del navegador. Al entrar a una partida se piden primero los de su Mazo.
import { AMULETOS } from '../rules/amuletos';
import { AUMENTOS } from '../rules/aumentos';
import { PALOS } from '../rules/cartas';
import type { MazoId } from '../rules/mazos';
import { MAZOS } from '../rules/mazos';
import { BENDICIONES } from '../rules/reyes';
import { bufonCapas, EXPRESIONES } from './pixel/bufon';
import { cifraMapa, GLIFOS, type TonoCifra } from './pixel/cifras';
import { HUD_PX, NODOS_PX, hudMapa, inmuneMapa, nodoMapa, estrellaMapa } from './pixel/iconos';
import { cuadros, personajeMapa } from './pixel/personajes';
import { REY_PX, reyFondo, reyMapa } from './pixel/reyes';
import { claveRetrato, forjarLuego, lienzoNaipe, lienzoNaipeSegunda, pxAmuleto, pxAumento, pxBendicion, pxDorso, pxNaipe, pxNaipeSegunda, url } from './sprites';

/** Los cuadros del retrato de un Personaje (lo primero que hace falta al entrar a una partida). */
export function precargarPersonaje(mazo: MazoId): void {
  forjarLuego(cuadros().map((c) => () => url(claveRetrato(mazo, c), () => personajeMapa(mazo, c))), true);
}

/** Todo lo demás: naipes, la Corte, Reyes, Bufón, iconos y cifras. */
export function precargarTodo(): void {
  const tareas: (() => unknown)[] = [];
  for (const s of PALOS) for (let n = 1; n <= 12; n++) tareas.push(() => (n >= 10 ? lienzoNaipe(s, n) && pxNaipe({ palo: s, n }) : pxNaipe({ palo: s, n })));
  tareas.push(() => pxNaipe({ palo: 'X', n: 0 }));
  // la segunda cara de cada Rey: el volteo la revela sin forjarla en el momento
  for (const s of PALOS) tareas.push(() => lienzoNaipeSegunda(s) && pxNaipeSegunda(s));
  for (const e of EXPRESIONES) tareas.push(() => url(`bf:${e}`, () => bufonCapas(e).cuerpo));
  for (const s of PALOS) {
    const id = REY_PX[s];
    tareas.push(() => url(`rey:fondo:${id}:c`, () => reyFondo(id, 'calma')));
    for (const a of ['calma', 'habla', 'vencido'] as const) tareas.push(() => url(`rey:${id}:${a}`, () => reyMapa(id, a)));
    tareas.push(() => url(`rey:fondo:${id}:v`, () => reyFondo(id, 'vencido')));
    tareas.push(() => url(`inmune:${s}`, () => inmuneMapa(s)));
  }
  for (const id of AMULETOS) tareas.push(() => pxAmuleto(id));
  for (const id of AUMENTOS) tareas.push(() => pxAumento(id));
  for (const id of BENDICIONES) tareas.push(() => pxBendicion(id));
  for (const id of HUD_PX) tareas.push(() => url(`h:${id}`, () => hudMapa(id)));
  for (const id of NODOS_PX) tareas.push(() => url(`n:${id}`, () => nodoMapa(id)));
  tareas.push(() => url('estrella', estrellaMapa));
  for (const tono of ['roja', 'azul', 'oro', 'hueso', 'verde'] as TonoCifra[]) for (const g of GLIFOS) tareas.push(() => url(`cf:${tono}:${g}`, () => cifraMapa(g, tono)));
  for (const m of MAZOS) tareas.push(() => pxDorso(m));
  for (const m of MAZOS) tareas.push(...cuadros().map((c) => () => url(claveRetrato(m, c), () => personajeMapa(m, c))));
  forjarLuego(tareas);
}
