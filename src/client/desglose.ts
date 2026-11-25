// (0.29) El desglose de la cuenta entra en su lugar sin cortar un solo nombre. Fuera del teléfono cuelga de la cuenta y
// cae en la franja de lo jugado: en la Deck y el portátil, en una columna a la izquierda del paño; a 1080p, en dos
// columnas a los costados del paño (DAÑO a la izquierda, MULTI a la derecha), con letra grande. Si no entra, cede por
// pasos y en este orden: la letra baja un escalón (solo a 1080p, nunca de 20 px; en la Deck el piso son 16), se va la
// pista del mando, se juntan los renglones, los nombres pasan a su forma corta ESCRITA A MANO («1.ª sangre», «Sol»,
// «Garrote»: nunca puntos suspensivos) y, por último, los términos que menos pesan se juntan en «otras +N» (su ayuda
// dice cuáles son). Los que más pesan quedan siempre enteros.
import { t, tx } from './almacen';
import { NOMBRE_CORTO } from './textos';
import { esc, tip } from './ui';

/** El nombre corto de un término (por su clave `de`: «a:taba», «b:primerasangre», «cantos»…), o null si no tiene. */
export function nombreCorto(de: string): string | null {
  const par = NOMBRE_CORTO[de];
  return par ? tx(par) : null;
}

/** El nombre de un término del desglose: entero y, si lo tiene, su forma corta al lado (el CSS enseña una u otra). */
export function nombreHtml(de: string, entero: string): string {
  const corto = nombreCorto(de);
  return corto && corto !== entero ? `<span class="d-n"><span class="d-nl">${esc(entero)}</span><span class="d-nc">${esc(corto)}</span></span>` : `<span class="d-n">${esc(entero)}</span>`;
}

const NIVELES = ['sin-pista', 'junto', 'cortos', 'dos-col'] as const;
/** La ventana de 1080p (la misma consulta que usa la hoja de estilos de la mesa). */
const ES_1080 = '(min-width: 1700px) and (min-height: 950px) and (max-height: 1250px)';

/** Deshace los «otras +N»: cada término vuelve a su renglón. */
function soltarOtras(bajo: HTMLElement): void {
  for (const el of bajo.querySelectorAll('.d-otras')) el.remove();
  for (const el of bajo.querySelectorAll('.d-oculto')) el.classList.remove('d-oculto');
}

const valorDe = (el: Element): number => Math.abs(Number((el.querySelector('.d-v')?.textContent ?? '').trim().replace('−', '-').replace('+', '')) || 0);

/**
 * Junta en «otras +N» el término que menos pesa de la fila que más términos tiene a la vista (la primera vez, los dos
 * que menos pesan). No toca las cartas, la jugada, el canto, lo que resta ni lo que multiplica, y deja siempre a la
 * vista, enteros, los que más pesan. Devuelve false si ya no queda nada que juntar.
 */
function juntarUno(bajo: HTMLElement): boolean {
  let mejor: { fila: HTMLElement; libres: HTMLElement[] } | null = null;
  for (const fila of bajo.querySelectorAll<HTMLElement>('.d-fila')) {
    const libres = [...fila.querySelectorAll<HTMLElement>('.d-t:not(.d-c):not(.d-neg):not(.d-x):not(.d-critico):not(.d-oculto):not(.d-otras)')].filter((el) => !/\|(j:|canto$)/.test(el.dataset.paso ?? ''));
    // (queda a la vista por lo menos el que más pesa de cada fila)
    if (libres.length >= 2 && (!mejor || libres.length > mejor.libres.length)) mejor = { fila, libres };
  }
  if (!mejor) return false;
  const { fila, libres } = mejor;
  libres.sort((a, b) => valorDe(a) - valorDe(b));
  const ya = fila.querySelector<HTMLElement>('.d-otras');
  const cuantos = ya || libres.length < 3 ? 1 : 2;
  for (const el of libres.slice(0, cuantos)) el.classList.add('d-oculto');
  const ocultos = [...fila.querySelectorAll<HTMLElement>('.d-t.d-oculto')];
  const suma = ocultos.reduce((s, el) => s + valorDe(el), 0);
  const detalle = ocultos.map((el) => `${el.querySelector('.d-nl')?.textContent ?? el.querySelector('.d-n')?.textContent ?? ''} ${el.querySelector('.d-v')?.textContent ?? ''}`.trim()).join(' · ');
  const html = `<span class="d-t d-otras mirable" tabindex="0" data-otras ${tip(`${t('otras')} +${suma}`, detalle)}><span class="d-n">${esc(t('otras'))}</span><b class="d-v">+${suma}</b></span>`;
  ya?.remove();
  (fila.querySelector('.d-terminos') ?? fila).insertAdjacentHTML('beforeend', html);
  return true;
}

/** El término que se ve por `el`: él mismo o, si quedó junto con otros, su «otras +N». */
export function terminoVisto(el: Element | null | undefined): Element | null | undefined {
  if (!el || !el.classList.contains('d-oculto')) return el;
  return el.closest('.d-fila')?.querySelector('.d-otras') ?? el;
}

/**
 * Acomoda la columna (o las dos columnas) del desglose en la franja de lo jugado. `izq` y `der`: los bordes del paño en
 * la pantalla; `tope`: el alto de la franja; `zonaIzq` y `zonaDer`: hasta dónde puede llegar a cada lado.
 */
export function encajarDesglose(o: { bajo: HTMLElement; cu: HTMLElement; izq: number | null; der: number | null; zonaIzq: number; zonaDer: number; techo: number; tope: number }): void {
  const { bajo, cu, izq, der, zonaIzq, zonaDer, techo, tope } = o;
  soltarOtras(bajo);
  bajo.classList.remove(...NIVELES, 'chico', 'chico-2', 'chico-3', 'chico-4');
  bajo.style.removeProperty('--fs-desglose');
  const dos = matchMedia(ES_1080).matches && izq !== null && der !== null;
  const x = 8;
  const rc = cu.getBoundingClientRect();
  // (se mide con desplazamientos, no con cajas: la cuenta entra con una animación que la corre unos píxeles)
  bajo.style.left = `${Math.round(x - cu.offsetLeft - cu.clientLeft)}px`;
  bajo.style.top = `${Math.round(techo - rc.top - cu.clientTop)}px`;
  let cabe: () => boolean;
  if (dos) {
    const colIzq = Math.max(180, Math.round(izq - zonaIzq - x - 14));
    const libreDer = Math.round(zonaDer - x - der - 14);
    const colDer = Math.max(180, Math.min(libreDer, Math.max(colIzq, 340)));
    bajo.classList.add('dos-col');
    bajo.style.width = `${Math.round(zonaDer - zonaIzq - 2 * x)}px`;
    bajo.style.height = `${Math.round(tope)}px`;
    bajo.style.setProperty('--col-izq', `${colIzq}px`);
    bajo.style.setProperty('--col-pano', `${Math.round(der - izq + 28)}px`);
    bajo.style.setProperty('--col-der', `${colDer}px`);
    const alto = (sel: string): number => [...bajo.querySelectorAll<HTMLElement>(sel)].reduce((s, el) => s + (el.offsetHeight ? el.offsetHeight + 6 : 0), 0);
    cabe = () => {
      // ningún renglón pide más ancho que su columna, y ninguna columna más alto que la franja
      for (const el of bajo.querySelectorAll<HTMLElement>('.d-fila, .c-corta, .d-t')) if (el.scrollWidth > el.clientWidth + 1) return false;
      return alto('.d-fd, .c-pista-pano') <= tope + 6 && alto('.c-corta, .d-fm, .c-dial-fila') <= tope + 6;
    };
  } else {
    bajo.style.height = `${Math.round(tope)}px`;
    bajo.style.width = `${Math.max(220, Math.round((izq !== null ? izq : zonaDer) - zonaIzq - x - 12))}px`;
    const mTop = parseFloat(getComputedStyle(bajo).marginTop) || 0;
    const altoHijos = (): number => {
      const vis = [...bajo.children].filter((el) => (el as HTMLElement).offsetHeight > 0) as HTMLElement[];
      if (!vis.length) return 0;
      const ult = vis[vis.length - 1];
      return ult.offsetTop + ult.offsetHeight;
    };
    cabe = () => altoHijos() + mTop <= tope - 18;
  }
  // los pasos, del más cómodo al más apretado: la letra (1080p: fija a 24 para no saltar), la pista, los renglones, los nombres cortos
  const pasos: { fs?: number; cls: string[] }[] = dos
    ? [
        { fs: 24, cls: [] },
        { fs: 24, cls: ['sin-pista'] },
        { fs: 24, cls: ['sin-pista', 'cortos'] },
        { fs: 22, cls: ['sin-pista', 'junto', 'cortos'] },
        { fs: 20, cls: ['sin-pista', 'junto', 'cortos'] },
      ]
    : [{ cls: [] }, { cls: ['sin-pista'] }, { cls: ['sin-pista', 'junto'] }, { cls: ['sin-pista', 'junto', 'cortos'] }];
  for (const paso of pasos) {
    bajo.classList.remove('sin-pista', 'junto', 'cortos');
    bajo.classList.add(...paso.cls);
    if (paso.fs) bajo.style.setProperty('--fs-desglose', `${paso.fs}px`);
    if (cabe()) return;
  }
  // todavía no entra: los que menos pesan, a «otras +N» (de a uno, hasta que entre)
  for (let i = 0; i < 12 && !cabe(); i++) if (!juntarUno(bajo)) break;
}
