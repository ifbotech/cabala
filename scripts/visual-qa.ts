// QA visual: monta cada estado fijo (`?qa=…`) en las cuatro ventanas, lo captura y audita el DOM. Falla si algo se
// sale de la ventana, si hay texto de menos de 14 px, una diana chica, una caja clara de HTML, un borde liso de
// HTML, texto recortado (también el rótulo que no entra en su botón) o algo que desborda de costado dentro de un
// modal o un panel. En el móvil, además, la mesa no puede pisarse: la cuenta, la barra de Vida del enemigo y la mano
// van cada una en su sitio (regla «solape-mesa»), también en la ventana baja de 390×664 (Safari con sus barras), que
// se monta solo para los estados de mesa. En todas las ventanas, lo del enemigo (barra, rótulo del Rey, TE PEGA,
// sellos) no se monta sobre la cuenta, la cabecera, la mano ni los botones, y lo que dice la cuenta se ve («solape-
// enemigo»); el grito del Personaje no tapa controles («grito-tapa»). En el Mapa, el «ESTÁS ACÁ» se ve, el nodo con
// el foco queda entero a la vista y su ayuda no tapa ningún nodo («mapa-foco»).
//
//   npm run qa:visual                      español, las 4 ventanas, todos los estados
//   npm run qa:visual -- --lang=en         inglés (capturas en artifacts/visual-qa-en/)
//   npm run qa:visual -- mesa mapa         solo esos estados
//   npm run qa:visual -- --ventana=390x844 solo esa ventana (también 390x664, la baja del móvil)
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { guardian } from './guardian';
import { VENTANAS, conServidor } from './servidor';
import { ESTADOS } from '../src/client/qa';

guardian('qa:visual', 290);

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith('--lang='))?.split('=')[1] === 'en' ? 'en' : 'es';
const soloVentana = args.find((a) => a.startsWith('--ventana='))?.split('=')[1];
const pedidos = args.filter((a) => !a.startsWith('-'));
const estados = ESTADOS.filter((e) => !pedidos.length || pedidos.includes(e));
/** El móvil bajo (390 de ancho en Safari, con sus barras): solo los estados de mesa, que son los que ceden por alto. */
const VENTANA_BAJA = { nombre: '390x664', w: 390, h: 664 } as const;
const ESTADOS_BAJA: readonly string[] = ['mesa', 'mesa-seleccion', 'mesa-mentiroso', 'mesa-rey', 'mesa-segunda', 'mesa-segunda-cambia', 'mesa-conteo', 'mesa-escudo'];
const ventanas = [...VENTANAS, VENTANA_BAJA].filter((v) => !soloVentana || v.nombre === soloVentana);
const carpeta = `artifacts/visual-qa${lang === 'en' ? '-en' : ''}`;

interface Fallo {
  regla: string;
  detalle: string;
}

/** La auditoría que corre dentro de la página. */
function auditar(o: { esMovil: boolean; idioma: string; deck: boolean }): Fallo[] {
  const { esMovil, idioma, deck } = o;
  const fallos: Fallo[] = [];
  const W = innerWidth;
  const H = innerHeight;
  const doc = document.documentElement;
  if (doc.scrollWidth > W + 1 || doc.scrollHeight > H + 1) fallos.push({ regla: 'desborde', detalle: `la página mide ${doc.scrollWidth}×${doc.scrollHeight} en una ventana de ${W}×${H}` });
  const visible = (el: Element) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  // (0.24: en el teléfono, el cuadro del final también se desliza entre el título y los botones)
  const enRollo = (el: Element) => !!el.closest(`.mapa-rollo, .visor-cartas, .col-cuerpo, .hud-tiras, .pul-cuerpo, .velo, .rollo${esMovil ? ', .fin-cuadro' : ''}`);
  const nombre = (el: Element) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`;
  const todos = [...document.querySelectorAll('#app *, #capa *')].filter(visible);
  for (const el of todos) {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    // texto de menos de 14 px
    const propio = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0);
    if (propio && parseFloat(s.fontSize) < 14) fallos.push({ regla: 'texto<14', detalle: `${nombre(el)} «${(el.textContent ?? '').trim().slice(0, 30)}» a ${s.fontSize}` });
    // fuera de la ventana (lo que no vive en una zona que se desplaza)
    if (!enRollo(el) && (el.matches('button, .chip, .bocadillo, .titulo, .cifra, .hud, .cuenta') || propio)) {
      // (lo que un `clip-path: inset(…)` recorta no cuenta: la mano que baja bajo el paño se corta en el pie de su zona)
      const ins = /^inset\(([^)]*)\)/.exec(s.clipPath)?.[1].split(/\s+/).map((v) => parseFloat(v) || 0);
      if (ins?.length) {
        const [t, d = t, b = t, i = d] = ins;
        const c = { left: r.left + Math.max(0, i), top: r.top + Math.max(0, t), right: r.right - Math.max(0, d), bottom: r.bottom - Math.max(0, b) };
        if (c.left < -1 || c.top < -1 || c.right > W + 1 || c.bottom > H + 1) fallos.push({ regla: 'recorte', detalle: `${nombre(el)} en ${Math.round(c.left)},${Math.round(c.top)} → ${Math.round(c.right)},${Math.round(c.bottom)}` });
      } else if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) fallos.push({ regla: 'recorte', detalle: `${nombre(el)} en ${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}` });
    }
    // dianas: 44 px (48 en la barra del pulgar del móvil)
    if (el.matches('button[data-accion]') && !(el as HTMLButtonElement).disabled) {
      const min = esMovil && el.closest('.botones') ? 48 : 44;
      if (r.width < min - 0.5 || r.height < min - 0.5) fallos.push({ regla: 'diana', detalle: `${nombre(el)} mide ${Math.round(r.width)}×${Math.round(r.height)} (mínimo ${min})` });
    }
    // cajas claras de HTML: un fondo liso casi blanco o beige que no sea un sprite
    const fondo = s.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
    if (fondo.length >= 3 && (fondo[3] ?? 1) > 0.5 && r.width * r.height > 900) {
      const luz = (0.2126 * fondo[0] + 0.7152 * fondo[1] + 0.0722 * fondo[2]) / 255;
      if (luz > 0.6) fallos.push({ regla: 'caja-clara', detalle: `${nombre(el)} con fondo ${s.backgroundColor}` });
    }
    // bordes lisos de HTML: un borde con color y sin sprite de marco
    for (const lado of ['Top', 'Left'] as const) {
      const ancho = parseFloat(s[`border${lado}Width`]);
      const color = s[`border${lado}Color`];
      if (ancho > 0 && s[`border${lado}Style`] !== 'none' && s.borderImageSource === 'none' && !/rgba\(.*, 0\)|transparent/.test(color)) {
        fallos.push({ regla: 'borde-html', detalle: `${nombre(el)} con borde ${ancho}px ${color}` });
        break;
      }
    }
    // texto recortado dentro de su caja
    if (el.matches('button:not(.hud-tiras), .chip, .op-nombre, .e-nombre, .titulo') && el.scrollWidth > el.clientWidth + 2 && s.overflow !== 'visible') fallos.push({ regla: 'texto-cortado', detalle: `${nombre(el)} «${(el.textContent ?? '').trim().slice(0, 30)}»` });
  }
  // el rótulo que no entra en su botón (aunque el botón no recorte: se sale por el costado o se monta en el marco)
  for (const el of todos) {
    if (!el.matches('button.btn') || getComputedStyle(el).overflow !== 'visible') continue;
    if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) fallos.push({ regla: 'texto-cortado', detalle: `${nombre(el)} «${(el.textContent ?? '').trim().slice(0, 30)}» pide ${el.scrollWidth} px y el botón tiene ${el.clientWidth}` });
  }
  // desborde de costado dentro de un modal o un panel: ni el panel ni su cuerpo se desplazan a lo ancho, y nada asoma
  // por sus bordes (la columna que queda fuera, el botón que se sale)
  for (const panel of [...document.querySelectorAll<HTMLElement>('#capa .panel, #app .panel')].filter(visible)) {
    const cajas = new Set<HTMLElement>([panel, ...panel.querySelectorAll<HTMLElement>(':scope > *, .rollo, .rollo > *')]);
    for (const el of cajas) {
      if (!visible(el) || el.clientWidth === 0 || getComputedStyle(el).overflowX === 'scroll') continue;
      // (la última cifra de un número de sprites deja asomar su margen transparente: esa cola no es un desborde)
      const cola = Math.max(0, ...[...el.querySelectorAll<HTMLElement>('.cifra')].map((c) => c.scrollWidth - c.clientWidth));
      if (el.scrollWidth > el.clientWidth + 1 + cola) fallos.push({ regla: 'desborde-panel', detalle: `${nombre(el)} pide ${el.scrollWidth} px de ancho y enseña ${el.clientWidth}` });
    }
    const p = panel.getBoundingClientRect();
    /** ¿Lo recorta alguna caja de dentro del panel? (entonces su desborde ya lo cuenta la regla de arriba) */
    const recortado = (el: Element): boolean => {
      for (let a = el.parentElement; a && a !== panel; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true;
      return false;
    };
    let fuera = 0;
    for (const el of panel.querySelectorAll('*')) {
      if (fuera >= 3) break;
      if (!visible(el) || getComputedStyle(el).position === 'fixed' || recortado(el)) continue;
      const r = el.getBoundingClientRect();
      const cola = el.closest('.cifra') ? 4 : 0;
      if (r.right > p.right + 1 + cola || r.left < p.left - 1) {
        fuera++;
        fallos.push({ regla: 'desborde-panel', detalle: `${nombre(el)} asoma fuera de ${nombre(panel)}: ${Math.round(r.left)} → ${Math.round(r.right)} en un panel de ${Math.round(p.left)} → ${Math.round(p.right)}` });
      }
    }
  }
  // la mesa del móvil no se pisa: la barra de Vida del enemigo, la cuenta y la mano, cada una en su franja, y la
  // cuenta a la vista (nada encima). No cuenta el grupo que va en el aire al arrastrar, ni la mesa tapada por un modal.
  if (esMovil && document.querySelector('.mesa [data-cuenta]') && !document.querySelector('#capa .velo')) {
    const franja = (r: { top: number; bottom: number } | undefined) => (r ? { t: Math.round(r.top), b: Math.round(r.bottom) } : null);
    const vida = franja(document.querySelector('.mesa .e-vida')?.getBoundingClientRect());
    const cuentaEl = document.querySelector('.mesa [data-cuenta] .cuenta');
    const cuenta = franja(cuentaEl?.getBoundingClientRect());
    const enMano = [...document.querySelectorAll<HTMLElement>('.mesa .mano .carta')].filter((c) => Number(c.style.zIndex || 0) < 100).map((c) => c.getBoundingClientRect());
    const mano = enMano.length ? { t: Math.round(Math.min(...enMano.map((c) => c.top))), b: Math.round(Math.max(...enMano.map((c) => c.bottom))) } : null;
    const pisa = (a: { t: number; b: number } | null, b: { t: number; b: number } | null, que: string): void => {
      if (a && b && a.b > b.t + 1 && b.b > a.t + 1) fallos.push({ regla: 'solape-mesa', detalle: `${que}: ${a.t} → ${a.b} con ${b.t} → ${b.b}` });
    };
    pisa(vida, cuenta, 'la barra de Vida pisa la cuenta');
    pisa(cuenta, mano, 'la cuenta pisa la mano');
    pisa(vida, mano, 'la barra de Vida pisa la mano');
    // (una micro-escena a pantalla entera tapa la mesa a propósito: no cuenta)
    if (cuentaEl && !document.body.classList.contains('arrastrando') && !document.querySelector('.cortina')) {
      const r = cuentaEl.getBoundingClientRect();
      for (const fx of [0.2, 0.5, 0.8]) {
        const encima = document.elementFromPoint(r.left + r.width * fx, r.top + r.height / 2);
        if (encima && !cuentaEl.contains(encima) && !encima.contains(cuentaEl)) {
          fallos.push({ regla: 'solape-mesa', detalle: `la cuenta queda bajo ${nombre(encima)}` });
          break;
        }
      }
    }
  }
  // la mesa no se pisa, en TODAS las ventanas: lo del enemigo (su barra de Vida, el rótulo del rasgo o de la segunda
  // cara, la placa del TE PEGA con su Furia y sus sellos) no se monta sobre la cuenta, la cabecera (su rótulo, el
  // turno, JUGADAS y MENÚ), la mano, los botones, La Corte, el Bufón ni el HUD, ni sus piezas entre sí. Y lo que dice la
  // cuenta (la jugada, Daño, Multi, el total y sus chips) se ve: nada encima. No cuenta la mesa ya despejada (cobro),
  // la tapada por un modal ni el grupo que va en el aire al arrastrar.
  const mesa = document.querySelector('.mesa');
  if (mesa && !mesa.classList.contains('cobra') && !document.querySelector('#capa .velo')) {
    const caja = (el: Element) => el.getBoundingClientRect();
    const de = (sel: string) => [...document.querySelectorAll(sel)].filter((el) => visible(el) && caja(el).width > 2 && caja(el).height > 2);
    const cruzan = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const donde = (r: DOMRect) => `${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}`;
    const piezas: [string, Element[]][] = [
      ['la barra de Vida', de('.mesa .e-vida')],
      ['el rótulo del Rey', de('.mesa .e-barras > .e-rasgo')],
      ['el TE PEGA', de('.mesa .e-ataque')],
      ['los sellos', de('.mesa .e-sellos > *')],
    ];
    const ajenos: [string, Element[]][] = [
      ['la cuenta', de('.mesa [data-cuenta] .cuenta:not(.reposo)')],
      ['la cabecera', de('.mesa .mesa-top .lado > *')],
      ['la mano', de('.mesa .mano .carta').filter((c) => Number((c as HTMLElement).style.zIndex || 0) < 100)],
      ['los botones', de('.mesa .botones .btn')],
      ['La Corte', de('.mesa .corte .corte-carta')],
      ['el Bufón', de('.mesa .esc-bufon .bufon')],
      ['el HUD', de('.mesa .hud')],
    ];
    // (y lo que dice el Bufón tampoco sube a la cabecera ni baja a la cuenta)
    for (const b of de('.mesa .esc-bufon .bocadillo')) for (const [otro, ys] of ajenos.slice(0, 2)) for (const y of ys) if (cruzan(caja(b), caja(y))) fallos.push({ regla: 'solape-enemigo', detalle: `el bocadillo del Bufón (${donde(caja(b))}) pisa ${otro} (${nombre(y)})` });
    const vistos = new Set<string>();
    const pisa = (que: string, a: Element, otro: string, b: Element): void => {
      const clave = `${que}|${otro}`;
      if (vistos.has(clave) || !cruzan(caja(a), caja(b))) return;
      vistos.add(clave);
      fallos.push({ regla: 'solape-enemigo', detalle: `${que} (${nombre(a)}, ${donde(caja(a))}) pisa ${otro} (${nombre(b)}, ${donde(caja(b))})` });
    };
    for (const [que, xs] of piezas) for (const a of xs) for (const [otro, ys] of ajenos) for (const b of ys) pisa(que, a, otro, b);
    for (let i = 0; i < piezas.length; i++)
      for (let j = i + 1; j < piezas.length; j++) for (const a of piezas[i][1]) for (const b of piezas[j][1]) pisa(piezas[i][0], a, piezas[j][0], b);
    if (!document.body.classList.contains('arrastrando')) {
      for (const el of de('.mesa [data-cuenta] .cuenta:not(.reposo) :is(.c-jugada, .c-parte, [data-total], .c-chips > .chip, .c-efecto)')) {
        const r = caja(el);
        const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (encima && !el.contains(encima) && !encima.contains(el) && !encima.closest('.tip')) {
          fallos.push({ regla: 'solape-enemigo', detalle: `«${(el.textContent ?? '').trim().slice(0, 24)}» de la cuenta queda bajo ${nombre(encima)}` });
          break;
        }
      }
    }
    // en el teléfono, el naipe del enemigo asoma de verdad (no una tira) entre lo de arriba y su barra de Vida
    const centro = document.querySelector('.mesa .e-centro');
    const vida = document.querySelector('.mesa .e-vida');
    if (esMovil && centro && vida && visible(vida)) {
      const arriba = Math.max(caja(centro).top, caja(document.querySelector('.mesa .mesa-top') ?? centro).bottom);
      const asoma = Math.round(Math.min(caja(centro).bottom, caja(vida).top) - arriba);
      if (asoma < 80) fallos.push({ regla: 'solape-enemigo', detalle: `el naipe del enemigo asoma solo ${asoma} px (mínimo 80)` });
    }
  }
  // (0.21) cada naipe de la mano y del paño deja ver su índice: el de arriba a la izquierda o el de abajo a la derecha
  // (cabeza abajo). Ni la vecina, ni la carta con el foco, ni los naipes del paño, ni el HUD le tapan los dos
  if (!document.querySelector('#capa .velo, .cortina, .mesa.cobra')) {
    for (const el of [...document.querySelectorAll<HTMLElement>('.mesa [data-mano] .carta:not(.volando)')].filter(visible)) {
      const r = el.getBoundingClientRect();
      // (0.22: el índice es el del dibujo, sin placas de texto encima)
      const arriba = { x: r.left + r.width * 0.09, y: r.top + r.height * 0.1 };
      const abajo = { x: r.right - r.width * 0.09, y: r.bottom - r.height * 0.1 };
      // (la carta que va bajo el dedo —arrastrada de la mano o de una Posta a otra— puede pasar por encima: no cuenta)
      const seVe = (pt: { x: number; y: number }): boolean => {
        if (pt.x < 0 || pt.y < 0 || pt.x >= W || pt.y >= H) return false;
        const sobre = document.elementFromPoint(pt.x, pt.y)?.closest<HTMLElement>('.carta');
        return sobre === el || (!!sobre && sobre.classList.contains('en-transito') && !el.classList.contains('en-transito'));
      };
      if (!seVe(arriba) && !seVe(abajo)) {
        const encima = document.elementFromPoint(arriba.x, arriba.y);
        fallos.push({ regla: 'indice-tapado', detalle: `el naipe ${el.dataset.id} no deja ver ningún índice (arriba lo tapa ${encima ? nombre(encima) : 'el borde'})` });
      }
    }
    // (0.22) el paño es una fila propia: con el fieltro a la vista, ningún naipe de la mano entra en una Posta
    const pano = document.querySelector('.mesa .pano-postas.activo');
    if (pano && visible(pano)) {
      const postas = [...pano.querySelectorAll('.posta')].map((x) => x.getBoundingClientRect());
      for (const el of [...document.querySelectorAll<HTMLElement>('.mesa [data-mano] .carta:not(.elegida):not(.volando)')].filter(visible)) {
        const r = el.getBoundingClientRect();
        const dentro = postas.find((p) => Math.min(r.right, p.right) - Math.max(r.left, p.left) > 4 && Math.min(r.bottom, p.bottom) - Math.max(r.top, p.top) > 4);
        if (dentro) fallos.push({ regla: 'mano-en-pano', detalle: `el naipe ${el.dataset.id} de la mano entra en una Posta del paño` });
      }
    }
    // (0.22) con el dedo, cada naipe de una fila de la mano deja una franja tocable de 44 px o más
    if (W <= 700 || matchMedia('(pointer: coarse)').matches) {
      const filas: DOMRect[][] = [];
      const rs = [...document.querySelectorAll<HTMLElement>('.mesa [data-mano] .carta:not(.volando)')].filter((el) => visible(el) && Number(el.style.zIndex || 0) < 100).map((el) => el.getBoundingClientRect());
      for (const r of rs.sort((a, b) => a.top - b.top)) {
        const f = filas.find((x) => Math.abs(x[0].top - r.top) < r.height * 0.3);
        if (f) f.push(r);
        else filas.push([r]);
      }
      let franja = Infinity;
      for (const f of filas) {
        f.sort((a, b) => a.left - b.left);
        for (let i = 0; i + 1 < f.length; i++) if (f[i + 1].left < f[i].right) franja = Math.min(franja, f[i + 1].left - f[i].left);
      }
      if (franja < 44) fallos.push({ regla: 'franja', detalle: `con el dedo, un naipe de la mano deja solo ${Math.round(franja)} px tocables (mínimo 44)` });
    }
  }
  // el grito del Personaje: cerca de su retrato (a no más de 120 px en el teléfono y 280 en el escritorio, hueco entre
  // las dos cajas), dentro de la pantalla, sin tapar controles que se puedan tocar, la mano, la cuenta, las cifras del
  // HUD (Vida, Escudo, oro, Mazo) ni la cabecera
  for (const g of [...document.querySelectorAll('.hud-grito')].filter(visible)) {
    const r = g.getBoundingClientRect();
    const ret = document.querySelector('.hud-retrato')?.getBoundingClientRect();
    if (ret) {
      const hueco = Math.round(Math.hypot(Math.max(0, ret.left - r.right, r.left - ret.right), Math.max(0, ret.top - r.bottom, r.top - ret.bottom)));
      const tope = W < 700 ? 120 : 280;
      if (hueco > tope + 4) fallos.push({ regla: 'grito-tapa', detalle: `«${(g.textContent ?? '').trim()}» queda a ${hueco} px de su retrato (máximo ${tope})` });
    }
    for (const el of [...document.querySelectorAll('#app button:not(:disabled), #app .mano .carta, #app .cuenta:not(.reposo), #app [data-hud-vida], #app [data-hud-escudo], #app [data-hud-oro], #app .hud [data-n], #app .mesa-top .lado > *')].filter(visible)) {
      const c = el.getBoundingClientRect();
      if (Math.min(r.right, c.right) - Math.max(r.left, c.left) > 2 && Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top) > 2) {
        fallos.push({ regla: 'grito-tapa', detalle: `«${(g.textContent ?? '').trim()}» tapa ${nombre(el)} «${(el.textContent ?? '').trim().slice(0, 20)}»` });
        break;
      }
    }
  }
  // el Mapa («mapa-foco»): el «ESTÁS ACÁ» se ve (nada encima); el nodo con el foco queda entero a la vista dentro del
  // rollo (ni bajo la cabecera ni bajo el HUD ni en los bordes que se funden), y su ayuda no tapa ningún nodo
  const rollo = document.querySelector('.mapa-rollo');
  if (rollo && !document.querySelector('#capa .velo')) {
    const R = rollo.getBoundingClientRect();
    const cruza = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const aca = document.querySelector('.nodo-aca');
    if (aca && visible(aca)) {
      const r = aca.getBoundingClientRect();
      if (r.top >= R.top && r.bottom <= R.bottom) {
        const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (encima && !aca.contains(encima) && !encima.closest('.tip')) fallos.push({ regla: 'mapa-foco', detalle: `«${(aca.textContent ?? '').trim()}» queda bajo ${nombre(encima)}` });
      }
    }
    const foco = document.activeElement?.closest('.nodo');
    if (foco) {
      const f = foco.getBoundingClientRect();
      const borde = R.height * 0.07;
      if (f.top < R.top + borde - 1 || f.bottom > R.bottom - borde + 1) fallos.push({ regla: 'mapa-foco', detalle: `el nodo con el foco (${Math.round(f.top)} → ${Math.round(f.bottom)}) no queda entero en el rollo (${Math.round(R.top + borde)} → ${Math.round(R.bottom - borde)})` });
      // (en el teléfono no hay carril al costado del lienzo: la ayuda se toca y se va)
      for (const t of esMovil ? [] : [...document.querySelectorAll('.tip')].filter(visible)) {
        const T = t.getBoundingClientRect();
        for (const n of [...document.querySelectorAll('.nodo')].filter(visible)) {
          const N = n.getBoundingClientRect();
          if (N.bottom < R.top || N.top > R.bottom) continue;
          if (cruza(T, N)) {
            fallos.push({ regla: 'mapa-foco', detalle: `la ayuda (${Math.round(T.left)},${Math.round(T.top)} → ${Math.round(T.right)},${Math.round(T.bottom)}) tapa ${n === foco ? 'el nodo con el foco' : 'un nodo vecino'} (${n.getAttribute('aria-label')})` });
            break;
          }
        }
      }
    }
  }
  // en Steam Deck se juega con mando («glifo-mando»): todo botón de salida (CERRAR, SALTAR, SALIR, VOLVER, NO, SEGUIR)
  // dice que es B, y MENÚ dice que es Start. Un botón de salida sin su glifo a la vista falla
  if (deck) {
    const salidas = ['cerrar', 'saltar', 'salir', 'volver', 'no', 'seguir', 'portada'];
    for (const b of [...document.querySelectorAll<HTMLButtonElement>('#app button[data-accion], #capa button[data-accion]')].filter(visible)) {
      if (b.disabled) continue;
      const a = b.dataset.accion ?? '';
      const pide = a === 'menu' ? 'g-start' : salidas.includes(a) ? 'g-b' : '';
      if (!pide) continue;
      const g = b.querySelector(`.glifo.g-mando.${pide}`);
      if (!g || !visible(g)) fallos.push({ regla: 'glifo-mando', detalle: `${nombre(b)} «${(b.textContent ?? '').trim().slice(0, 24)}» sin su glifo ${pide.slice(2).toUpperCase()}` });
    }
  }
  // (0.24) ninguna ayuda abierta tapa un botón, un título ni una cifra del HUD («tip-tapa»), salvo los de la propia
  // pieza que se inspecciona
  for (const t of [...document.querySelectorAll('.tip')].filter(visible)) {
    const T = t.getBoundingClientRect();
    const ancla = document.querySelector('[data-tip-abierto]');
    for (const o of [...document.querySelectorAll('#app button, #capa button, #app .titulo, #capa .titulo, #app .hud [data-n]')].filter(visible)) {
      if (ancla && (o === ancla || o.contains(ancla) || ancla.contains(o))) continue;
      const O = o.getBoundingClientRect();
      if (Math.min(T.right, O.right) - Math.max(T.left, O.left) > 2 && Math.min(T.bottom, O.bottom) - Math.max(T.top, O.top) > 2) {
        fallos.push({ regla: 'tip-tapa', detalle: `la ayuda «${(t.textContent ?? '').trim().slice(0, 24)}» tapa ${nombre(o)} «${((o as HTMLElement).innerText ?? '').trim().slice(0, 20)}»` });
        break;
      }
    }
  }
  // (0.24) «ELEGÍ UNA» (con la cinta del Tesoro o sin ella) no pisa el HUD que queda a la vista («oferta-hud»)
  const hud = document.querySelector('#app .hud');
  if (hud && visible(hud)) {
    const H0 = hud.getBoundingClientRect();
    for (const o of [...document.querySelectorAll('#capa .velo .oferta :is(.opcion, .btn)')].filter(visible)) {
      const O = o.getBoundingClientRect();
      // (lo que se desliza dentro del velo se ve solo hasta su borde de abajo)
      const fondo = Math.min(O.bottom, o.closest('.velo')!.getBoundingClientRect().bottom);
      if (fondo > H0.top + 2 && O.right > H0.left && O.left < H0.right) {
        fallos.push({ regla: 'oferta-hud', detalle: `${nombre(o)} baja hasta ${Math.round(fondo)} y el HUD empieza en ${Math.round(H0.top)}` });
        break;
      }
    }
  }
  // restos de español en la pantalla inglesa
  if (idioma === 'en') {
    const texto = (document.querySelector('#app') as HTMLElement).innerText + (document.querySelector('#capa') as HTMLElement).innerText;
    const restos = ['Elegí', 'Golpear', 'Descartar', 'Seguir', 'Volver', 'Vida', 'Escudo', 'Daño', 'Bendición', 'Amuleto', 'Reinado', 'Tramo', ' de oro', 'Turno'].filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(texto));
    if (restos.length) fallos.push({ regla: 'español-en-inglés', detalle: restos.join(', ') });
  }
  return fallos;
}

/** Medidas reales del DOM de la captura (hechos, no opiniones): las lee el panel de jugadores simulado, y de ellas
 * salen las reglas de dianas. Una diana es lo que se puede tocar de verdad: su caja recortada por las zonas que se
 * desplazan y por la ventana, y solo si en su centro no hay otra cosa encima. */
function medir(o: { esMovil: boolean }) {
  const visible = (el: Element) => {
    const s = getComputedStyle(el);
    return !(s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0);
  };
  const rotulo = (el: Element) => ((el as HTMLElement).innerText || el.getAttribute('aria-label') || el.getAttribute('data-tip') || el.className || '').toString().trim().replace(/\s+/g, ' ').slice(0, 28);
  /** La caja que se ve: la del elemento, recortada por sus contenedores con desplazamiento y por la ventana. */
  const caja = (el: Element) => {
    const r = el.getBoundingClientRect();
    let l = Math.max(0, r.left);
    let t = Math.max(0, r.top);
    let d = Math.min(innerWidth, r.right);
    let b = Math.min(innerHeight, r.bottom);
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflow === 'visible' && s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      const q = p.getBoundingClientRect();
      l = Math.max(l, q.left);
      t = Math.max(t, q.top);
      d = Math.min(d, q.right);
      b = Math.min(b, q.bottom);
    }
    return { l, t, d, b, w: d - l, h: b - t };
  };
  const tocable = (el: Element, c: { l: number; t: number; w: number; h: number }) => {
    const hit = document.elementFromPoint(c.l + c.w / 2, c.t + c.h / 2);
    return !!hit && (el.contains(hit) || hit.contains(el));
  };
  const dianas = [...document.querySelectorAll('#app button:not(:disabled), #capa button:not(:disabled), #app [data-accion]:not(button), #capa [data-accion]:not(button), #app [data-soltar="descarte"]')]
    .filter((el) => visible(el) && !el.closest('.mano'))
    .map((el) => ({ el, c: caja(el) }))
    .filter((x) => x.c.w >= 8 && x.c.h >= 8 && tocable(x.el, x.c))
    // lo que asoma cortado por una zona que se desplaza se termina de ver al desplazar: su tamaño es el entero
    .map((x) => {
      const r = x.el.getBoundingClientRect();
      const cortada = x.c.w < r.width - 1 || x.c.h < r.height - 1;
      return { ...x, lado: cortada ? Math.min(r.width, r.height) : Math.min(x.c.w, x.c.h), ancho: cortada ? r.width : x.c.w, alto: cortada ? r.height : x.c.h };
    });
  let menor: (typeof dianas)[number] | null = null;
  for (const x of dianas) if (!menor || x.lado < menor.lado) menor = x;
  let separacion: number | null = null;
  let par = '';
  const chicas: string[] = [];
  const pisadas: string[] = [];
  for (const x of dianas) {
    const min = o.esMovil && x.el.closest('.botones') ? 48 : 44;
    // una diana cortada por el borde de una zona que se desplaza no cuenta como chica (se termina de ver al desplazar)
    const r = x.el.getBoundingClientRect();
    const cortada = x.c.w < r.width - 1 || x.c.h < r.height - 1;
    if (!cortada && (x.c.w < min - 0.5 || x.c.h < min - 0.5)) chicas.push(`«${rotulo(x.el)}» ${Math.round(x.c.w)}×${Math.round(x.c.h)} (mínimo ${min})`);
  }
  for (let i = 0; i < dianas.length; i++)
    for (let j = i + 1; j < dianas.length; j++) {
      const p = dianas[i];
      const q = dianas[j];
      if (p.el.contains(q.el) || q.el.contains(p.el)) continue;
      const dx = Math.max(0, Math.max(p.c.l, q.c.l) - Math.min(p.c.d, q.c.d));
      const dy = Math.max(0, Math.max(p.c.t, q.c.t) - Math.min(p.c.b, q.c.b));
      if (dx === 0 && dy === 0) {
        const ix = Math.min(p.c.d, q.c.d) - Math.max(p.c.l, q.c.l);
        const iy = Math.min(p.c.b, q.c.b) - Math.max(p.c.t, q.c.t);
        if (ix > 2 && iy > 2) pisadas.push(`«${rotulo(p.el)}» y «${rotulo(q.el)}»`);
        continue;
      }
      const d = Math.round(Math.max(dx, dy));
      if (separacion === null || d < separacion) {
        separacion = d;
        par = `«${rotulo(p.el)}» y «${rotulo(q.el)}»`;
      }
    }
  // (las cartas que el jugador lleva en el aire al arrastrar van juntas a propósito: no son «la mano»)
  const cartas = [...document.querySelectorAll<HTMLElement>('.mano .carta')].filter((el) => visible(el) && Number(el.style.zIndex || 0) < 100).map((el) => el.getBoundingClientRect());
  let mano: { n: number; montadas: boolean; franjaMin: number; filas?: number; asomaMin?: number } | null = null;
  if (cartas.length) {
    // las filas de la mano (cartas con la misma altura de reposo, con margen para la que está elegida)
    const filas: DOMRect[][] = [];
    for (const r of [...cartas].sort((a, b) => a.top - b.top)) {
      const f = filas.find((x) => Math.abs(x[0].top - r.top) < r.height * 0.3);
      if (f) f.push(r);
      else filas.push([r]);
    }
    let montadas = false;
    let franja = Infinity;
    for (const f of filas) {
      f.sort((a, b) => a.left - b.left);
      for (let i = 0; i < f.length; i++) {
        const sig = f[i + 1];
        const monta = !!sig && sig.left < f[i].right - f[i].width * 0.12;
        if (monta) montadas = true;
        franja = Math.min(franja, sig && sig.left < f[i].right ? sig.left - f[i].left : f[i].width);
      }
    }
    mano = { n: cartas.length, montadas, franjaMin: Math.round(franja) };
    if (filas.length > 1) {
      mano.filas = filas.length;
      mano.asomaMin = Math.round(Math.min(...filas.slice(0, -1).map((f, i) => Math.min(...filas[i + 1].map((r) => r.top)) - Math.max(...f.map((r) => r.top)))));
    }
  }
  // el foco del mando o del teclado, si está a la vista
  let foco: { borde: number; halo: boolean; que: string; escala: number } | null = null;
  const act = document.activeElement as HTMLElement | null;
  if (act && act !== document.body && act.matches(':focus-visible')) {
    const dibujo = act.querySelector<HTMLElement>(':scope > .px') ?? act;
    const sa = getComputedStyle(act);
    const sd = getComputedStyle(dibujo);
    const anillos = [...(sd.boxShadow + ',' + sa.boxShadow).matchAll(/(rgba?\([^)]*\))\s+0px\s+0px\s+0px\s+([\d.]+)px/g)].map((m) => ({ color: m[1], px: parseFloat(m[2]) }));
    const macizos = anillos.filter((a) => !/rgba\(.*,\s*0?\.\d+\)/.test(a.color)).map((a) => a.px);
    const borde = sa.outlineStyle !== 'none' && parseFloat(sa.outlineWidth) > 0 ? parseFloat(sa.outlineWidth) : macizos.length ? Math.max(...macizos) : 0;
    const m = /matrix\(([-\d.]+)/.exec(sd.transform);
    foco = { borde: Math.round(borde), halo: anillos.some((a) => /rgba\(.*,\s*0?\.\d+\)/.test(a.color)), que: rotulo(act) || (act.dataset.n ? `${act.dataset.n} ${act.dataset.palo}` : ''), escala: m ? Math.round(parseFloat(m[1]) * 100) / 100 : 1 };
  }
  let n = 0;
  let minPx = Infinity;
  let minQue = '';
  let bajo14 = 0;
  for (const el of document.querySelectorAll('#app *, #capa *')) {
    if (!visible(el)) continue;
    const propio = [...el.childNodes].some((x) => x.nodeType === 3 && (x.textContent ?? '').trim().length > 0);
    if (!propio) continue;
    const c = caja(el);
    if (c.w < 2 || c.h < 2) continue;
    n++;
    const px = parseFloat(getComputedStyle(el).fontSize);
    if (px < 14) bajo14++;
    if (px < minPx) {
      minPx = px;
      minQue = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 28);
    }
  }
  return {
    medidas: {
      dianas: menor ? { n: dianas.length, minW: Math.round(menor.ancho), minH: Math.round(menor.alto), minQue: rotulo(menor.el), separacionMin: separacion, solapes: pisadas.length } : { n: 0 },
      mano,
      texto: n ? { n, minPx: Math.round(minPx), minQue, bajo14 } : { n: 0 },
      ...(foco ? { foco } : {}),
    },
    chicas,
    pisadas,
    pegadas: separacion !== null && separacion < 8 ? [`${par} a ${separacion} px`] : [],
  };
}

const informe: { estado: string; ventana: string; fallos: Fallo[] }[] = [];
/** Las cajas de la mesa en reposo, por ventana (la regla «mesa-quieta» las compara con las de la selección). */
const reposo = new Map<string, Record<string, number[] | null>>();
const t0 = Date.now();

await conServidor(5191, async (url) => {
  const navegador = await chromium.launch();
  try {
    for (const v of ventanas) {
      const ctx = await navegador.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1, hasTouch: v.w < 700, isMobile: v.w < 700, reducedMotion: 'no-preference' });
      // tsx envuelve las funciones con `__name`: la página necesita tenerlo para la auditoría
      await ctx.addInitScript('globalThis.__name = (f) => f');
      const pagina = await ctx.newPage();
      const errores: string[] = [];
      pagina.on('pageerror', (e) => errores.push(e.message));
      pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
      mkdirSync(`${carpeta}/${v.nombre}`, { recursive: true });
      for (const estado of estados) {
        if (v.nombre === VENTANA_BAJA.nombre && !ESTADOS_BAJA.includes(estado)) continue;
        errores.length = 0;
        await pagina.goto(`${url}/?qa=${estado}&lang=${lang}`, { waitUntil: 'domcontentloaded' });
        await pagina.waitForSelector('html[data-qa="listo"]', { timeout: 15000 });
        await pagina.evaluate(() => document.fonts.ready);
        const flechas: string[] = [];
        if (estado.endsWith('-mando')) {
          // el foco del mando: se mueve con las flechas, como con la cruceta (en la mesa, además, se elige una carta)
          if (estado === 'mesa-escudo-mando') {
            // la mano de 8 montada (el Mentiroso): con el foco en la 2.ª, la 5.ª y la 8.ª carta, bajo la punta de la ▼
            // tiene que estar la carta enfocada («flecha-foco»), no su vecina
            for (const i of [1, 4, 7]) {
              await pagina.locator('.mano .carta').nth(i).focus();
              await pagina.evaluate(() => (document.documentElement.dataset.entrada = 'mando'));
              await pagina.waitForTimeout(80);
              const mal = await pagina.evaluate(() => {
                const el = document.activeElement as HTMLElement | null;
                if (!el?.matches('[data-mano] .carta')) return 'el foco no quedó en la mano';
                const r = el.getBoundingClientRect();
                const k = Number(getComputedStyle(el).getPropertyValue('--k-naipe')) || 1;
                const fm = parseFloat(el.style.getPropertyValue('--fm')) || r.width / 2;
                const bajo = document.elementFromPoint(r.left + fm, r.top + 8 * k);
                return bajo?.closest('.carta') === el ? '' : `bajo la ▼ de ${el.dataset.id} está ${bajo?.closest('.carta')?.getAttribute('data-id') ?? bajo?.tagName}`;
              });
              if (mal) flechas.push(mal);
            }
          } else if (estado === 'mesa-mando') {
            // se llega a la mano, se elige una carta y el foco pasa a la siguiente
            await pagina.locator('.mano .carta').first().focus();
            await pagina.keyboard.press('ArrowRight');
            await pagina.keyboard.press('Enter');
            await pagina.keyboard.press('ArrowRight');
          } else await pagina.keyboard.press('ArrowRight');
        } else if (v.nombre === '1280x800' && estado !== 'mesa-arrastrando') {
          // en Steam Deck se juega solo con mando: el foco siempre está a la vista (se pone como lo pondría la cruceta)
          await pagina.keyboard.press('ArrowDown');
        }
        // las flechas de la QA hacen de cruceta: en Steam Deck y en los estados «-mando» los glifos son los del mando
        // (X, Y, LT…), no los del teclado (G, D, E…), como los vería quien juega con el mando de verdad
        if (estado.endsWith('-mando') || (v.nombre === '1280x800' && estado !== 'mesa-arrastrando')) await pagina.evaluate(() => (document.documentElement.dataset.entrada = 'mando'));
        await pagina.waitForTimeout(120);
        const fallos = await pagina.evaluate(auditar, { esMovil: v.w < 700, idioma: lang, deck: v.nombre === '1280x800' && estado !== 'mesa-arrastrando' });
        for (const e of errores) fallos.push({ regla: 'error-js', detalle: e.slice(0, 200) });
        for (const x of flechas) fallos.push({ regla: 'flecha-foco', detalle: x });
        // la mesa no salta al elegir («mesa-quieta»): fuera del teléfono, el naipe del Rey, La Corte y el Bufón quedan
        // donde estaban en reposo (±4 px) cuando se elige la jugada
        const cajasMesa = () =>
          pagina.evaluate(() =>
            Object.fromEntries(
              ['.mesa .e-centro', '.mesa .corte', '.mesa .esc-bufon .bufon', '.mesa .e-vida'].map((s) => {
                const r = document.querySelector(s)?.getBoundingClientRect();
                return [s, r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null];
              }),
            ),
          );
        // (y con tu Escudo frenando casi todo y la causa larga en el chip, «TE PEGA 3 (23 − 20 ESCUDO)»: la misma mesa
        // se mide en reposo y con la jugada elegida, en la misma página)
        if (estado === 'mesa-escudo' && v.w > 700) {
          type M = { __mesa: { mano: { elegir(ids: string[]): void } }; __qaSel: string[] };
          await pagina.evaluate(() => (window as unknown as M).__mesa.mano.elegir([]));
          await pagina.waitForTimeout(150);
          const antes = await cajasMesa();
          await pagina.evaluate(() => (window as unknown as M).__mesa.mano.elegir((window as unknown as M).__qaSel));
          await pagina.waitForTimeout(150);
          const despues = await cajasMesa();
          for (const [s, r] of Object.entries(despues)) {
            const a = antes[s];
            if (!a || !r) continue;
            const corre = Math.max(...r.map((n, i) => Math.abs(n - a[i])));
            if (corre > 4) fallos.push({ regla: 'mesa-quieta', detalle: `${s} se corre ${corre} px al elegir con tu Escudo (${a.join(',')} → ${r.join(',')})` });
          }
        }
        const QUIETA: Record<string, string> = { 'mesa-seleccion': 'mesa' };
        if ((QUIETA[estado] || Object.values(QUIETA).includes(estado)) && v.w > 700) {
          const cajas = await cajasMesa();
          if (!QUIETA[estado]) reposo.set(`${v.nombre}|${estado}`, cajas);
          else {
            const antes = reposo.get(`${v.nombre}|${QUIETA[estado]}`);
            for (const [s, r] of Object.entries(cajas)) {
              const a = antes?.[s];
              if (!a || !r) continue;
              const corre = Math.max(...r.map((n, i) => Math.abs(n - a[i])));
              if (corre > 4) fallos.push({ regla: 'mesa-quieta', detalle: `${s} se corre ${corre} px al elegir (${a.join(',')} → ${r.join(',')})` });
            }
          }
        }
        await pagina.screenshot({ path: `${carpeta}/${v.nombre}/${estado}.png` });
        const m = await pagina.evaluate(medir, { esMovil: v.w < 700 });
        for (const x of m.chicas) fallos.push({ regla: 'diana-chica', detalle: x });
        for (const x of m.pisadas) fallos.push({ regla: 'dianas-pisadas', detalle: x });
        for (const x of m.pegadas) fallos.push({ regla: 'dianas-pegadas', detalle: x });
        writeFileSync(`${carpeta}/${v.nombre}/${estado}.medidas.json`, JSON.stringify({ ...m.medidas, recortes: fallos.filter((x) => x.regla === 'recorte' || x.regla === 'texto-cortado').length }));
        informe.push({ estado, ventana: v.nombre, fallos });
      }
      await ctx.close();
    }
  } finally {
    await navegador.close();
  }
});

const malos = informe.filter((i) => i.fallos.length);
writeFileSync(`${carpeta}/informe.json`, JSON.stringify(informe, null, 2));
for (const i of malos) {
  console.log(`✗ ${i.ventana} · ${i.estado}`);
  const vistos = new Set<string>();
  for (const f of i.fallos) {
    const linea = `    ${f.regla}: ${f.detalle}`;
    if (vistos.has(linea)) continue;
    vistos.add(linea);
    if (vistos.size <= 8) console.log(linea);
  }
  if (i.fallos.length > 8) console.log(`    … y ${i.fallos.length - 8} más`);
}
const total = malos.reduce((s, i) => s + i.fallos.length, 0);
console.log(`\nqa:visual (${lang}) · ${informe.length} capturas en ${carpeta}/ · ${malos.length} con fallos (${total} fallos) · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(total ? 1 : 0);
