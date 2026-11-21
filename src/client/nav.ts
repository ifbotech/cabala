// Teclado y mando, sin huecos: las flechas (o la cruceta y la palanca del mando) mueven el foco hacia donde apuntan;
// Enter, Espacio o A activan; Escape o B vuelven; G / X golpea, D / Y descarta, E / LT arma el Engaño, J / Select abre
// JUGADAS, RT abre «Lo que llevás», LB y RB saltan entre la mano y los botones, la palanca derecha desplaza lo que se
// desplaza y Start abre el menú. Lo que se inspecciona sin pulsarse (el enemigo, La Corte) lleva `tabindex="0"`.
import { $, $$, atras, hayModal } from './ui';

const FOCO = 'button:not(:disabled):not([aria-disabled="true"]), [tabindex="0"]';

function visibles(): HTMLElement[] {
  const raiz = hayModal() ? $('#capa .velo')! : $('#app')!;
  return $$(FOCO, raiz).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  });
}

/** Mueve el foco al elemento más cercano en esa dirección. */
export function mover(dx: number, dy: number): void {
  const lista = visibles();
  if (!lista.length) return;
  const actual = document.activeElement as HTMLElement | null;
  if (!actual || !lista.includes(actual)) {
    principal(lista)?.focus();
    return;
  }
  const a = actual.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let mejor: HTMLElement | null = null;
  let nota = Infinity;
  for (const el of lista) {
    if (el === actual) continue;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const adelante = (x - ax) * dx + (y - ay) * dy;
    if (adelante <= 4) continue;
    const costado = Math.abs((x - ax) * dy) + Math.abs((y - ay) * dx);
    const n = adelante + costado * 2.2;
    if (n < nota) {
      nota = n;
      mejor = el;
    }
  }
  if (!mejor) return;
  // primero se trae a la vista y después se enfoca (así su ayuda se ubica donde quedó). En el Mapa, el nodo va al
  // centro del rollo: nada queda bajo la cabecera, el HUD ni los bordes que se funden
  mejor.scrollIntoView({ block: mejor.closest('.mapa-rollo') ? 'center' : 'nearest', inline: 'nearest' });
  mejor.focus({ preventScroll: true });
}

/** Lo principal de una pantalla: lo que lleva `data-inicio`; en la mesa, la primera carta de la mano; si no, lo primero. */
function principal(lista: HTMLElement[] = visibles()): HTMLElement | undefined {
  return lista.find((el) => el.dataset.inicio !== undefined) ?? lista.find((el) => el.classList.contains('carta') && !!el.closest('[data-mano]')) ?? lista[0];
}

/** Con qué se viene jugando: de eso depende adónde va el foco y qué glifos se enseñan (los del mando o los del teclado). */
export type Entrada = 'puntero' | 'teclado' | 'mando';
let entrada: Entrada = 'puntero';
function ponerEntrada(e: Entrada): void {
  if (entrada === e) return;
  entrada = e;
  document.documentElement.dataset.entrada = e;
}
export const entradaActual = (): Entrada => entrada;
/** Si se viene jugando con teclado o mando (sin ratón ni dedo): entonces el foco va solo a lo principal de cada pantalla. */
export const porTeclado = (): boolean => entrada !== 'puntero';

export type GlifoMando = 'A' | 'B' | 'X' | 'Y' | 'LB' | 'RB' | 'LT' | 'RT' | 'SEL' | 'START';
/**
 * El glifo de un botón, dos veces: el del mando y el de la tecla. Van escondidos; el CSS enseña el que toca según
 * con qué se viene jugando (`html[data-entrada]`), así que nada se repinta al pasar del ratón al mando.
 */
export const glifo = (mando: GlifoMando, tecla: string): string =>
  `<kbd class="glifo g-mando g-${mando.toLowerCase()}" aria-hidden="true">${mando === 'START' ? '≡' : mando}</kbd><kbd class="glifo g-tecla" aria-hidden="true">${tecla}</kbd>`;

/** Los botones de salida: B (o Escape) los pulsa. CERRAR, SALTAR, SALIR, VOLVER, NO y el SEGUIR que deja una pantalla. */
export const SALIDAS: readonly string[] = ['cerrar', 'saltar', 'salir', 'volver', 'no', 'seguir', 'portada'];
/** Los botones de elegir: A (o Enter) los pulsa. ELEGIR, COMPRAR y lo que se toma o se confirma. */
const ELIGEN: readonly string[] = ['elegir', 'comprar', 'abrir', 'si', 'jugar', 'nueva', 'mejorar', 'soltar', 'mazo', 'purgar', 'curar', 'templar', 'arrimar', 'descansar', 'opcion', 'otra', 'altar', 'carta'];
/**
 * Pone el glifo del mando (y de la tecla) en todo botón de la pantalla y de su modal que todavía no lo tenga: A en los
 * de elegir, B en los de salida (que además quedan marcados con `data-salida`: B y Escape los buscan) y Start en MENÚ.
 * En las opciones grandes (naipes de oferta, ventas), el A va en su esquina y solo se ve en la que tiene el foco.
 */
export function ponerGlifos(raiz: ParentNode = document): void {
  for (const b of raiz.querySelectorAll<HTMLElement>('button[data-accion]')) {
    if (b.querySelector(':scope > .glifo, :scope > .op-glifo')) continue;
    const a = b.dataset.accion!;
    if (a === 'menu') b.insertAdjacentHTML('afterbegin', glifo('START', 'M'));
    else if (SALIDAS.includes(a)) {
      b.dataset.salida = '';
      b.insertAdjacentHTML('afterbegin', glifo('B', 'ESC'));
    } else if (ELIGEN.includes(a)) {
      if (b.classList.contains('btn')) b.insertAdjacentHTML('afterbegin', glifo('A', 'ENTER'));
      else b.insertAdjacentHTML('beforeend', `<span class="op-glifo" aria-hidden="true">${glifo('A', 'ENTER')}</span>`);
    }
  }
}

/** LB y RB: el foco salta de los botones de la mesa a la mano (la carta elegida, o la primera) y de la mano a los botones. */
function saltar(aBotones: boolean): void {
  if (hayModal()) return;
  const lista = visibles();
  const enMano = (el: HTMLElement): boolean => el.classList.contains('carta') && !!el.closest('[data-mano]');
  const destino = aBotones ? (lista.find((el) => el.dataset.accion === 'golpear') ?? lista.find((el) => !!el.closest('.botones'))) : (lista.find((el) => enMano(el) && el.classList.contains('elegida')) ?? lista.find(enMano));
  destino?.focus();
}

/** Abre un modal de la partida con su botón (o lo cierra, si es el que ya está abierto). */
function alternar(accion: string, panel: string): void {
  if (hayModal()) {
    if ($(`#capa .velo ${panel}`)) atras();
    return;
  }
  $<HTMLButtonElement>(`[data-accion="${accion}"]`)?.click();
}

/** Lo que se desplaza en la pantalla (o en el modal) que está a la vista: lo mueve la palanca derecha. */
function rollo(): HTMLElement | null {
  const raiz = hayModal() ? $('#capa .velo')! : $('#app')!;
  return $$('.rollo, .mapa-rollo, .visor-cartas, .pul-cuerpo, .col-cuerpo', raiz).find((el) => el.scrollHeight > el.clientHeight + 2) ?? null;
}

/** Activa lo que tiene el foco (una carta se alterna; un botón se pulsa). */
function activar(): void {
  const el = document.activeElement as HTMLElement | null;
  if (!el || el === document.body) {
    mover(1, 0);
    return;
  }
  if (el.classList.contains('carta')) el.parentElement?.dispatchEvent(new CustomEvent('cabala:alternar', { detail: el.dataset.id }));
  else el.click();
}

const atajo = (tecla: string): boolean => {
  const el = $<HTMLButtonElement>(`[data-tecla="${tecla}"]`);
  if (!el || el.disabled) return false;
  el.click();
  return true;
};

export function iniciarNav(): void {
  document.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key;
    const dir: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (dir[k]) {
      ev.preventDefault();
      mover(...dir[k]);
    } else if (k === 'Escape') {
      ev.preventDefault();
      atras();
    } else if (k === 'g' || k === 'd' || k === 'e' || k === 'j') {
      if (atajo(k)) ev.preventDefault();
    } else if (k === 'm' && !hayModal()) {
      // M abre el menú, como Start
      const b = $<HTMLButtonElement>('[data-accion="menu"]');
      if (b && !b.disabled) {
        ev.preventDefault();
        b.click();
      }
    }
  });
  // al cambiar de pantalla, el foco va a lo principal (si se viene jugando sin ratón)
  document.addEventListener('keydown', () => ponerEntrada('teclado'), true);
  document.addEventListener('pointerdown', () => ponerEntrada('puntero'), true);
  document.addEventListener('cabala:pantalla', () => {
    // cada botón de la pantalla (y del modal) con su glifo: A, B o Start
    ponerGlifos(document);
    if (porTeclado()) requestAnimationFrame(() => principal()?.focus());
  });

  // el mando: se lee una vez por cuadro; cada botón actúa al pulsarse, y la dirección repite si se mantiene
  const antes: boolean[] = [];
  let repite = 0;
  const leer = (ahora: number) => {
    const mando = [...(navigator.getGamepads?.() ?? [])].find((g) => g && g.connected);
    if (mando) {
      const b = mando.buttons.map((x) => x.pressed);
      const recien = (i: number) => b[i] && !antes[i];
      const ex = mando.axes[0] ?? 0;
      const ey = mando.axes[1] ?? 0;
      const dx = b[14] || ex < -0.5 ? -1 : b[15] || ex > 0.5 ? 1 : 0;
      const dy = b[12] || ey < -0.5 ? -1 : b[13] || ey > 0.5 ? 1 : 0;
      if (dx || dy) {
        if (ahora > repite) {
          ponerEntrada('mando');
          mover(dx, dx ? 0 : dy);
          repite = ahora + (repite ? 150 : 320);
        }
      } else repite = 0;
      // cualquier botón del mando cuenta como «se juega con mando»: los glifos aparecen al primer toque
      if (b.some((x, i) => x && !antes[i])) ponerEntrada('mando');
      if (recien(0)) activar();
      if (recien(1)) atras();
      if (recien(2)) atajo('g');
      if (recien(3)) atajo('d');
      if (recien(4)) saltar(false);
      if (recien(5)) saltar(true);
      if (recien(6)) atajo('e');
      if (recien(7)) alternar('ver-piezas', '.piezas');
      if (recien(8)) alternar('jugadas', '.jugadas');
      if (recien(9)) $<HTMLButtonElement>('[data-accion="menu"]')?.click();
      // la palanca derecha desplaza la lista que no entra (JUGADAS, «Lo que llevás», el Mapa)
      const ry = mando.axes[3] ?? 0;
      if (Math.abs(ry) > 0.3) rollo()?.scrollBy(0, Math.round(ry * 16));
      for (let i = 0; i < b.length; i++) antes[i] = b[i];
    }
    requestAnimationFrame(leer);
  };
  requestAnimationFrame(leer);
}
