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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { guardian } from './guardian';
import { manoViva } from './mano-viva';
import { VENTANAS, conServidor } from './servidor';
import { ESTADOS } from '../src/client/qa';

guardian('qa:visual', 290);

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith('--lang='))?.split('=')[1] === 'en' ? 'en' : 'es';
const soloVentana = args.find((a) => a.startsWith('--ventana='))?.split('=')[1];
const pedidos = args.filter((a) => !a.startsWith('-'));
const estados = ESTADOS.filter((e) => !pedidos.length || pedidos.includes(e));
/**
 * Los móviles bajos: 390×664 (390 de ancho en Safari, con sus barras) y, desde la 0.27, 360×740 (un Android angosto).
 * Solo los estados de mesa, que son los que ceden por alto.
 */
const VENTANAS_BAJAS = [
  { nombre: '390x664', w: 390, h: 664 },
  { nombre: '360x740', w: 360, h: 740 },
] as const;
const ESTADOS_BAJA: readonly string[] = ['mesa', 'mesa-seleccion', 'mesa-mentiroso', 'mesa-rey', 'mesa-segunda', 'mesa-segunda-cambia', 'mesa-conteo', 'mesa-escudo', 'mesa-escalon', 'mesa-chinchon', 'mesa-chancho', 'mesa-garrote'];
const esBaja = (nombre: string): boolean => VENTANAS_BAJAS.some((v) => v.nombre === nombre);
const ventanas = [...VENTANAS, ...VENTANAS_BAJAS].filter((v) => !soloVentana || v.nombre === soloVentana);
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
  // (0.27) «texto-pisado»: en la mesa, lo que se lee no se pisa con un naipe (los de la mano, los del paño, la pila de
  // La Corte), con un chip de la cuenta ni con un botón, y los chips y los términos del desglose no se pisan entre sí.
  // Se mide la caja de cada renglón de TEXTO (no la de su contenedor): así cae «¡CHINCHÓ» bajo el naipe de La Corte,
  // «23 − 5 ESCUDO» contra su borde, «corre de Posta» bajo el 2 de Espadas y «TAKES IT DOWN» contra su chip vecino.
  // No cuenta la mesa tapada por un modal o una micro-escena, ni lo que va en el aire al arrastrar
  if (mesa && !mesa.classList.contains('cobra') && !document.querySelector('#capa .velo, .cortina') && !document.body.classList.contains('arrastrando')) {
    const cruzan = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const donde = (r: DOMRect) => `${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}`;
    /** Las cajas de los renglones de texto de un elemento (cada nodo de texto, cada línea). */
    const renglones = (el: Element): DOMRect[] => {
      const out: DOMRect[] = [];
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (!(n.textContent ?? '').trim() || !n.parentElement || !visible(n.parentElement)) continue;
        const r = document.createRange();
        r.selectNodeContents(n);
        for (const c of r.getClientRects()) if (c.width > 2 && c.height > 2) out.push(c);
      }
      return out;
    };
    const de = (sel: string) => [...document.querySelectorAll(sel)].filter((el) => visible(el) && el.getBoundingClientRect().width > 2);
    const textos: [string, Element[]][] = [
      ['el TE PEGA', de('.mesa .e-ataque')],
      ['el rasgo del Rey', de('.mesa .e-barras > .e-rasgo, .mesa .rey-rotulo')],
      ['los sellos del enemigo', de('.mesa .e-sellos > *')],
      ['el rótulo de La Corte', de('.mesa .corte > .rotulo, .mesa .corte > .corte-n')],
      ['la cuenta', de('.mesa [data-cuenta] .cuenta:not(.reposo) :is(.c-formula, .c-chips > *, .c-corta, .c-dial, .c-pista-pano, .d-fila)')],
      ['la regla del paño', de('.mesa .pano-regla:not([hidden])')],
      ['el sello del Escalón', de('.mesa .posta-escalon:not([hidden])')],
    ];
    const obstaculos: [string, Element[]][] = [
      ['un naipe de la mano', de('.mesa .mano .carta').filter((c) => Number((c as HTMLElement).style.zIndex || 0) < 100 && !c.classList.contains('elegida'))],
      ['un naipe del paño', de('.mesa .mano .carta.elegida').filter((c) => Number((c as HTMLElement).style.zIndex || 0) < 100)],
      ['el naipe de La Corte', de('.mesa .corte .corte-carta')],
      ['un chip de la cuenta', de('.mesa [data-cuenta] .cuenta:not(.reposo) :is(.c-chips > *, .c-jugada, .c-efecto, .c-corta, .c-dial)')],
      ['un botón', de('.mesa .botones .btn, .mesa .chiches .chiche')],
    ];
    const vistos = new Set<string>();
    for (const [que, els] of textos)
      for (const el of els) {
        const rs = renglones(el);
        for (const [otro, os] of obstaculos)
          for (const o of os) {
            if (o === el || o.contains(el) || el.contains(o)) continue;
            // (el sello del Escalón va A PROPÓSITO sobre el pie de sus naipes del paño)
            if (que === 'el sello del Escalón' && otro === 'un naipe del paño') continue;
            const R = o.getBoundingClientRect();
            // (la mano que baja bajo el paño se recorta en el pie de su zona: cuenta lo que se ve)
            const ins = /^inset\(([^)]*)\)/.exec(getComputedStyle(o).clipPath)?.[1].split(/\s+/).map((v) => parseFloat(v) || 0);
            const caja = ins?.length ? new DOMRect(R.left, R.top, R.width, Math.max(0, R.height - Math.max(0, ins[2] ?? ins[0]))) : R;
            const r = rs.find((x) => cruzan(x, caja));
            const clave = `${que}|${otro}`;
            if (!r || vistos.has(clave)) continue;
            vistos.add(clave);
            fallos.push({ regla: 'texto-pisado', detalle: `${que} («${(el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 24)}», ${donde(r)}) se pisa con ${otro} (${nombre(o)}, ${donde(caja)})` });
          }
      }
    // los términos del desglose no se montan sobre su vecino (ni quietos ni encendidos a mitad del conteo)
    const ts = de('.mesa [data-cuenta] .c-desglose .d-terminos > :is(.d-t, .d-cartas)').map((el) => ({ el, r: el.getBoundingClientRect() }));
    for (let i = 0; i < ts.length; i++)
      for (let j = i + 1; j < ts.length; j++)
        if (cruzan(ts[i].r, ts[j].r) && !vistos.has('terminos')) {
          vistos.add('terminos');
          fallos.push({ regla: 'texto-pisado', detalle: `el término «${(ts[i].el.textContent ?? '').trim().slice(0, 16)}» del desglose (${donde(ts[i].r)}) se monta sobre «${(ts[j].el.textContent ?? '').trim().slice(0, 16)}» (${donde(ts[j].r)})` });
        }
    // (0.27) en el teléfono, el paño enseña naipes ENTEROS (nada de medio naipe cortado)
    for (const c of de('.mesa .mano .carta.elegida')) if (getComputedStyle(c).clipPath !== 'none' && Number((c as HTMLElement).style.zIndex || 0) < 100) fallos.push({ regla: 'pano-cortado', detalle: `el naipe ${(c as HTMLElement).dataset.id} apoyado en el paño va recortado (${getComputedStyle(c).clipPath})` });
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
      // (0.26: lo apoyado en el paño es su propia fila, no la mano: lo cuida «mano-en-pano»)
      const rs = [...document.querySelectorAll<HTMLElement>('.mesa [data-mano] .carta:not(.volando):not(.elegida)')].filter((el) => visible(el) && Number(el.style.zIndex || 0) < 100).map((el) => el.getBoundingClientRect());
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
  // pieza que se inspecciona (los nodos del Mapa que quedaron atrás —recorridos, salteados y el de ESTÁS ACÁ— no
  // cuentan: no se tocan más)
  for (const t of [...document.querySelectorAll('.tip')].filter(visible)) {
    const T = t.getBoundingClientRect();
    const ancla = document.querySelector('[data-tip-abierto]');
    // (0.25: y en la mesa, lo del enemigo —su TE PEGA, su barra y, fuera del teléfono, su naipe— y la cuenta abierta)
    // (0.28: y, fuera del teléfono, el texto vivo que la ayuda del foco tapaba con mando: el desglose de la cuenta, el
    // naipe de La Corte, el renglón de botones y el Bufón con su globo)
    const vivo = W > 700 ? ', #app .mesa [data-cuenta] .c-bajo, #app .mesa [data-cuenta] .cuenta.reposo .pista, #app .mesa .corte .corte-carta, #app .anfitrion .bufon, #app .anfitrion .bocadillo, #app .esc-bufon .bufon, #app .esc-bufon .bocadillo' : '';
    const enemigo = `, #app .mesa [data-ataque], #app .mesa .e-barras, #app .mesa [data-cuenta] .cuenta:not(.reposo)${W > 700 ? ', #app .mesa [data-carta]' : ''}${vivo}`;
    for (const o of [...document.querySelectorAll(`#app button:not(.nodo.hecho, .nodo.pasado, .nodo.actual), #capa button, #app .titulo, #capa .titulo, #app .hud [data-n]${enemigo}`)].filter(visible)) {
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
  // (0.27) «oferta-sin-aviso»: en el teléfono, si una opción de ELEGÍ UNA queda cortada bajo el borde del velo (sobre
  // el HUD), el aviso «hay más ↓» está a la vista y SALTAR se ve sin deslizar
  for (const velo of esMovil ? [...document.querySelectorAll<HTMLElement>('#capa .velo')].filter((v) => v.querySelector('.oferta')) : []) {
    const V = velo.getBoundingClientRect();
    const cortada = [...velo.querySelectorAll('.oferta .opcion')].filter(visible).some((o) => o.getBoundingClientRect().bottom > V.bottom + 2);
    const aviso = velo.querySelector('.oferta-hay-mas');
    if (cortada && !(aviso && visible(aviso) && aviso.getBoundingClientRect().bottom <= V.bottom + 1)) fallos.push({ regla: 'oferta-sin-aviso', detalle: 'una opción queda cortada bajo el HUD y no hay aviso «hay más ↓» a la vista' });
    const saltar = velo.querySelector('.oferta [data-accion="saltar"]');
    if (saltar && visible(saltar)) {
      const S = saltar.getBoundingClientRect();
      if (S.bottom > V.bottom + 1 || S.top < V.top - 1) fallos.push({ regla: 'oferta-sin-aviso', detalle: `SALTAR no se ve sin deslizar (${Math.round(S.top)} → ${Math.round(S.bottom)} en un velo de ${Math.round(V.top)} → ${Math.round(V.bottom)})` });
    }
  }
  // (0.28) «placa-cara»: en el teléfono, la placa TE PEGA no pisa la CARA del enemigo (la caja del sombrero y el rostro
  // de la figura: del 30 al 70 % del ancho del naipe y del 12 al 33 % de su alto), con cualquier alto de escena
  if (esMovil && !document.querySelector('#capa .velo, .cortina, .mesa.cobra')) {
    const naipe = document.querySelector('.mesa [data-carta]');
    const placa = document.querySelector('.mesa .e-ataque');
    const centroE = document.querySelector('.mesa .e-centro');
    if (naipe && placa && centroE && visible(placa) && visible(naipe)) {
      const n = naipe.getBoundingClientRect();
      const c = centroE.getBoundingClientRect();
      const p = placa.getBoundingClientRect();
      const cara = { l: n.left + n.width * 0.3, r: n.left + n.width * 0.7, t: n.top + n.height * 0.12, b: Math.min(n.top + n.height * 0.33, c.bottom) };
      if (cara.b - cara.t > 8 && Math.min(p.right, cara.r) - Math.max(p.left, cara.l) > 2 && Math.min(p.bottom, cara.b) - Math.max(p.top, cara.t) > 2)
        fallos.push({ regla: 'placa-cara', detalle: `la placa TE PEGA (${Math.round(p.left)},${Math.round(p.top)} → ${Math.round(p.right)},${Math.round(p.bottom)}) tapa la cara del enemigo (${Math.round(cara.l)},${Math.round(cara.t)} → ${Math.round(cara.r)},${Math.round(cara.b)})` });
    }
  }
  // (0.28) «jugada-sin-nombre»: con una jugada válida elegida, su NOMBRE (Par, Escalera, Pierna…) está a la vista en la
  // cuenta: en su chip, en su casilla del renglón plegado del teléfono o en su término del desglose. En ninguna
  // ventana ni con ningún alto se elige a ciegas
  const previa = document.querySelector('.mesa [data-cuenta] .cuenta.previa');
  if (previa && visible(previa) && !document.querySelector('#capa .velo, .cortina') && !document.body.classList.contains('mueve-pano')) {
    const seVe = (el: Element): boolean => {
      if (!visible(el) || (el.textContent ?? '').trim().length < 2) return false;
      for (let a: Element | null = el; a && a !== previa.parentElement; a = a.parentElement) if (getComputedStyle(a).visibility === 'hidden' || getComputedStyle(a).display === 'none') return false;
      const r = el.getBoundingClientRect();
      if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) return false;
      const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !encima || previa.contains(encima) || encima.contains(previa) || !!encima.closest('.tip');
    };
    const nombres = [...previa.querySelectorAll('.c-jugada, .d-t[data-paso*="|j:"] .d-n')].filter(seVe);
    if (!nombres.length) fallos.push({ regla: 'jugada-sin-nombre', detalle: `la cuenta («${(previa.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)}») no enseña el nombre de la jugada` });
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
        if (esBaja(v.nombre) && !ESTADOS_BAJA.includes(estado)) continue;
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
        // (al pasar a mando la mano cambia de ancho y la cuenta se vuelve a pintar: se mide con sus entradas ya posadas)
        await pagina.waitForTimeout(estado.endsWith('-mando') || v.nombre === '1280x800' ? 320 : 120);
        const fallos = await pagina.evaluate(auditar, { esMovil: v.w < 700, idioma: lang, deck: v.nombre === '1280x800' && estado !== 'mesa-arrastrando' });
        // (0.28) nada vivo se monta, nada tapa la cuenta, la mano se ve entera (también fuera del teléfono)
        fallos.push(...(await pagina.evaluate(manoViva, {})));
        for (const e of errores) fallos.push({ regla: 'error-js', detalle: e.slice(0, 200) });
        for (const x of flechas) fallos.push({ regla: 'flecha-foco', detalle: x });
        // la mesa no salta al elegir («mesa-quieta»): fuera del teléfono, el naipe del Rey, La Corte y el Bufón quedan
        // donde estaban en reposo (±4 px) cuando se elige la jugada. (0.26) En el teléfono, lo que no se mueve es lo que
        // se toca: cada naipe de la mano que NO elegiste y los botones (la escena sí cede alto a la cuenta y al paño)
        const cajasMesa = (): Promise<Record<string, number[] | null>> =>
          pagina.evaluate((tel) => {
            const caja = (el: Element | null | undefined): number[] | null => {
              const r = el?.getBoundingClientRect();
              return r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null;
            };
            if (!tel) return Object.fromEntries(['.mesa .e-centro', '.mesa .corte', '.mesa .esc-bufon .bufon', '.mesa .e-vida'].map((s) => [s, caja(document.querySelector(s))])) as Record<string, number[] | null>;
            const out: Record<string, number[] | null> = {};
            for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta:not(.elegida)')) out[`naipe ${el.dataset.id}`] = caja(el);
            for (const s of ['[data-accion="golpear"]', '[data-accion="descartar"]']) out[s] = caja(document.querySelector(s));
            return out;
          }, v.w < 700);
        // (y con tu Escudo frenando casi todo y la causa larga en el chip, «TE PEGA 3 (23 − 20 ESCUDO)»: la misma mesa
        // se mide en reposo y con la jugada elegida, en la misma página)
        const tope = v.w < 700 ? 8 : 4;
        const quietaTel = v.w < 700;
        if (estado === 'mesa-escudo' && (v.w > 700 || quietaTel)) {
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
            if (corre > tope) fallos.push({ regla: 'mesa-quieta', detalle: `${s} se corre ${corre} px al elegir con tu Escudo (${a.join(',')} → ${r.join(',')})` });
          }
        }
        const QUIETA: Record<string, string> = { 'mesa-seleccion': 'mesa' };
        if ((QUIETA[estado] || Object.values(QUIETA).includes(estado)) && (v.w > 700 || quietaTel)) {
          const cajas = await cajasMesa();
          if (!QUIETA[estado]) reposo.set(`${v.nombre}|${estado}`, cajas);
          else {
            const antes = reposo.get(`${v.nombre}|${QUIETA[estado]}`);
            for (const [s, r] of Object.entries(cajas)) {
              const a = antes?.[s];
              if (!a || !r) continue;
              const corre = Math.max(...r.map((n, i) => Math.abs(n - a[i])));
              if (corre > tope) fallos.push({ regla: 'mesa-quieta', detalle: `${s} se corre ${corre} px al elegir (${a.join(',')} → ${r.join(',')})` });
            }
          }
        }
        await pagina.screenshot({ path: `${carpeta}/${v.nombre}/${estado}.png` });
        const m = await pagina.evaluate(medir, { esMovil: v.w < 700 });
        // (0.28) «hoja-cuenta»: en el teléfono, la cuenta plegada se abre con UN toque como hoja sobre la escena: la hoja
        // queda entera dentro de la ventana y por encima del renglón plegado, dice el nombre de la jugada y sus términos,
        // y ni un naipe de la mano ni GOLPEAR ni DESCARTAR se mueven (±1 px). Otro toque la cierra
        // (no con el golpe en el aire: ahí la mesa no escucha)
        const mesaLibre = await pagina.evaluate(() => !(window as unknown as { __mesa?: { ocupado?: () => boolean } }).__mesa?.ocupado?.());
        if (v.w < 700 && mesaLibre && (await pagina.locator('.mesa [data-cuenta] .cuenta[data-accion="hoja"]').count())) {
          const cajasHoja = (): Promise<Record<string, number[]>> =>
            pagina.evaluate(() => {
              const out: Record<string, number[]> = {};
              const caja = (el: Element): number[] => {
                const r = el.getBoundingClientRect();
                return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
              };
              for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta')) out[`naipe ${el.dataset.id}`] = caja(el);
              for (const s of ['[data-accion="golpear"]', '[data-accion="descartar"]', '[data-mano] .pano-postas']) {
                const el = document.querySelector(s);
                if (el) out[s] = caja(el);
              }
              return out;
            });
          const antes = await cajasHoja();
          // (se toca su «▾»: adentro de la cuenta puede haber otro botón, el dial)
          const cu = await pagina.locator('.mesa [data-cuenta] .cuenta[data-accion="hoja"] .c-abre').boundingBox();
          if (cu) {
            await pagina.touchscreen.tap(cu.x + cu.width / 2, cu.y + cu.height / 2);
            await pagina.waitForTimeout(260);
            const mal = await pagina.evaluate(() => {
              const h = document.querySelector<HTMLElement>('.mesa .cuenta-hoja');
              const cuenta = document.querySelector('.mesa [data-cuenta] .cuenta');
              if (!h || !cuenta) return 'el toque no abrió la hoja';
              const r = h.getBoundingClientRect();
              const c = cuenta.getBoundingClientRect();
              if (r.width < 200 || r.height < 60) return `la hoja mide ${Math.round(r.width)}×${Math.round(r.height)}`;
              // (la hoja va sobre la escena; en el teléfono bajo puede bajar sobre su renglón y el paño, nunca sobre la mano)
              const techoMano = Math.min(innerHeight, ...[...document.querySelectorAll<HTMLElement>('[data-mano] .carta:not(.elegida)')].map((k) => k.getBoundingClientRect().top));
              void c;
              if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > techoMano - 2) return `la hoja (${Math.round(r.top)} → ${Math.round(r.bottom)}) se sale de la ventana o baja sobre la mano (${Math.round(techoMano)})`;
              if (h.scrollHeight > h.clientHeight + 2) return `la hoja no entra entera (pide ${h.scrollHeight} px y enseña ${h.clientHeight})`;
              const nombre = [...h.querySelectorAll<HTMLElement>('.d-t[data-paso*="|j:"] .d-n, .c-jugada')].find((el) => el.getBoundingClientRect().width > 2 && (el.textContent ?? '').trim().length > 1);
              if (!nombre) return 'la hoja no dice el nombre de la jugada';
              const sinNombre = [...h.querySelectorAll<HTMLElement>('.c-desglose .d-t:not(.d-c)')].filter((el) => !((el.querySelector('.d-n')?.getBoundingClientRect().width ?? 0) > 2));
              if (sinNombre.length) return `en la hoja, ${sinNombre.length} términos del desglose van sin su nombre`;
              const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
              if (encima && !h.contains(encima)) return `la hoja queda bajo ${encima.tagName.toLowerCase()}.${String(encima.className).split(' ')[0]}`;
              return '';
            });
            if (mal) fallos.push({ regla: 'hoja-cuenta', detalle: mal });
            const despues = await cajasHoja();
            for (const [s, a] of Object.entries(antes)) {
              const d = despues[s];
              if (!d) continue;
              const corre = Math.max(...d.map((n, i) => Math.abs(n - a[i])));
              if (corre > 1) fallos.push({ regla: 'hoja-cuenta', detalle: `${s} se corre ${corre} px al abrir la hoja (${a.join(',')} → ${d.join(',')})` });
            }
            await pagina.screenshot({ path: `${carpeta}/${v.nombre}/${estado}.hoja.png` });
            // (otro toque, en la hoja, la cierra)
            const hb = (await pagina.locator('.mesa .cuenta-hoja').count()) ? await pagina.locator('.mesa .cuenta-hoja').boundingBox() : null;
            if (hb) await pagina.touchscreen.tap(hb.x + hb.width / 2, hb.y + hb.height / 2);
            await pagina.waitForTimeout(160);
            if (await pagina.locator('.mesa .cuenta-hoja').count()) fallos.push({ regla: 'hoja-cuenta', detalle: 'otro toque no cerró la hoja' });
          }
        }
        // (0.27) «el dedo manda», sin excepciones («elige-tres», «elige-cinco»): en las TRES ventanas del teléfono
        // (390×844, 390×664 y 360×740) y con las manos de 3 (Escoba), 4 (Chancho Va), 7 (Chinchón) y 8 (El Mentiroso),
        // toques de verdad, uno por naipe, hasta llenar el paño (hasta 5). Cada toque va al lugar donde ese naipe se
        // veía EN REPOSO y tiene que elegirlo; después de cada toque, la x y la y de cada naipe NO elegido son las de
        // reposo (±1 px), el elegido solo sube y GOLPEAR y DESCARTAR no se corren. El último toque, en la silueta del
        // primer naipe, lo devuelve a su lugar. Un solo píxel de más rompe la puerta
        if (v.w < 700 && ['mesa', 'mesa-chancho', 'mesa-chinchon', 'mesa-mentiroso'].includes(estado)) {
          type M = { __mesa: { mano: { elegir(ids: string[]): void; seleccion(): string[] } } };
          await pagina.evaluate(() => (window as unknown as M).__mesa.mano.elegir([]));
          await pagina.waitForTimeout(220);
          const cajas = (): Promise<Record<string, { c: number[]; elegida: boolean }>> =>
            pagina.evaluate(() => {
              const out: Record<string, { c: number[]; elegida: boolean }> = {};
              const caja = (el: Element): number[] => {
                const r = el.getBoundingClientRect();
                return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
              };
              for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta')) out[`naipe ${el.dataset.id}`] = { c: caja(el), elegida: el.classList.contains('elegida') };
              for (const s of ['[data-accion="golpear"]', '[data-accion="descartar"]']) {
                const el = document.querySelector(s);
                if (el) out[s] = { c: caja(el), elegida: false };
              }
              return out;
            });
          const reposoMano = await cajas();
          const postas = await pagina.evaluate(() => document.querySelectorAll('[data-mano] .posta').length);
          // el orden de los toques: de menor a mayor sin repetir número (la Escalera del Mentiroso arma su Escalón al
          // tercer toque), después los que falten; los Comodines, al final
          const orden = await pagina.evaluate(() => {
            const cs = [...document.querySelectorAll<HTMLElement>('[data-mano] .carta')].map((el) => ({ id: el.dataset.id!, n: Number(el.dataset.n), x: el.dataset.palo === 'X' }));
            const lisas = cs.filter((k) => !k.x).sort((a, b) => a.n - b.n);
            const unicas = lisas.filter((k, i) => lisas.findIndex((o) => o.n === k.n) === i);
            return [...unicas, ...lisas.filter((k) => !unicas.includes(k)), ...cs.filter((k) => k.x)].map((k) => k.id);
          });
          const toques = orden.slice(0, Math.min(5, postas));
          const medirPaso = async (paso: string, elegidas: string[]): Promise<void> => {
            const sel = await pagina.evaluate(() => (window as unknown as M).__mesa.mano.seleccion());
            if (sel.length !== elegidas.length || elegidas.some((id) => !sel.includes(id))) fallos.push({ regla: 'elige-cinco', detalle: `${paso}: quedó elegido [${sel.join(',')}] y tenía que ser [${elegidas.join(',')}]` });
            const ahora = await cajas();
            for (const [s, a] of Object.entries(ahora)) {
              const r = reposoMano[s];
              if (!r) continue;
              if (!a.elegida) {
                const corre = Math.max(...a.c.map((n, i) => Math.abs(n - r.c[i])));
                if (corre > 1) fallos.push({ regla: 'elige-cinco', detalle: `${paso}: ${s} se corre ${corre} px sin haberlo elegido (${r.c.join(',')} → ${a.c.join(',')})` });
              } else if (a.c[1] >= r.c[1]) fallos.push({ regla: 'elige-cinco', detalle: `${paso}: ${s}, elegido, no sube (y ${r.c[1]} → ${a.c[1]})` });
            }
          };
          let escalon = false;
          for (let i = 0; i < toques.length; i++) {
            const r = reposoMano[`naipe ${toques[i]}`].c;
            // (se toca lo que asoma del naipe en reposo: su franja de la izquierda, arriba)
            await pagina.touchscreen.tap(r[0] + Math.min(r[2] / 2, 30), r[1] + 20);
            await pagina.waitForTimeout(240);
            await medirPaso(`toque ${i + 1} de ${toques.length}`, toques.slice(0, i + 1));
            escalon ||= await pagina.evaluate(() => !!document.querySelector('[data-mano] .posta-escalon:not([hidden])'));
            if (i === 2 || i === toques.length - 1) await pagina.screenshot({ path: `${carpeta}/${v.nombre}/${estado}.elige-${i + 1}.png` });
          }
          if (estado === 'mesa-mentiroso' && !escalon) fallos.push({ regla: 'elige-cinco', detalle: 'la Escalera del Mentiroso no llegó a armar su Escalón: la prueba no cubre el caso que pidió el Jurado' });
          // la silueta del hueco devuelve su naipe
          if (toques.length) {
            const r = reposoMano[`naipe ${toques[0]}`].c;
            await pagina.touchscreen.tap(r[0] + Math.min(r[2] / 2, 30), r[1] + 20);
            await pagina.waitForTimeout(240);
            await medirPaso('toque en la silueta del primero', toques.slice(1));
          }
          // (y la mesa vuelve a como estaba para las medidas de dianas)
          await pagina.evaluate(() => (window as unknown as M).__mesa.mano.elegir([]));
          await pagina.waitForTimeout(200);
        }
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
// (0.28) el informe es de TODAS las ventanas: una corrida de una sola ventana (o de unos estados) reemplaza lo suyo y
// conserva lo de las demás (antes quedaba solo la última corrida y el Jurado no podía confirmar las otras). Cada
// entrada lleva cuándo se midió; `informe-resumen.json` dice, por ventana, cuántas capturas y cuántos fallos
const cuando = new Date().toISOString();
type Entrada = { estado: string; ventana: string; fallos: Fallo[]; cuando?: string };
let previo: Entrada[] = [];
try {
  if (existsSync(`${carpeta}/informe.json`)) previo = JSON.parse(readFileSync(`${carpeta}/informe.json`, 'utf8')) as Entrada[];
} catch {
  previo = [];
}
const corridas = new Set(informe.map((i) => `${i.ventana}|${i.estado}`));
const todo: Entrada[] = [...previo.filter((i) => !corridas.has(`${i.ventana}|${i.estado}`)), ...informe.map((i) => ({ ...i, cuando }))];
const ordenVentanas = [...VENTANAS, ...VENTANAS_BAJAS].map((v) => v.nombre as string);
const ordenEstados = ESTADOS as readonly string[];
todo.sort((a, b) => ordenVentanas.indexOf(a.ventana) - ordenVentanas.indexOf(b.ventana) || ordenEstados.indexOf(a.estado) - ordenEstados.indexOf(b.estado));
writeFileSync(`${carpeta}/informe.json`, JSON.stringify(todo, null, 2));
const resumen = ordenVentanas.map((v) => {
  const de = todo.filter((i) => i.ventana === v);
  return { ventana: v, capturas: de.length, conFallos: de.filter((i) => i.fallos.length).length, fallos: de.reduce((n, i) => n + i.fallos.length, 0), medido: de.map((i) => i.cuando ?? '').sort().pop() ?? null };
});
writeFileSync(`${carpeta}/informe-resumen.json`, JSON.stringify(resumen, null, 2));
console.log(`informe de todas las ventanas: ${resumen.map((r) => `${r.ventana} ${r.capturas} capturas y ${r.fallos} fallos`).join(' · ')}`);
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
