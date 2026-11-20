// QA visual: monta cada estado fijo (`?qa=…`) en las cuatro ventanas, lo captura y audita el DOM. Falla si algo se
// sale de la ventana, si hay texto de menos de 14 px, una diana chica, una caja clara de HTML, un borde liso de
// HTML o texto recortado.
//
//   npm run qa:visual                      español, las 4 ventanas, todos los estados
//   npm run qa:visual -- --lang=en         inglés (capturas en artifacts/visual-qa-en/)
//   npm run qa:visual -- mesa mapa         solo esos estados
//   npm run qa:visual -- --ventana=390x844 solo esa ventana
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
const ventanas = VENTANAS.filter((v) => !soloVentana || v.nombre === soloVentana);
const carpeta = `artifacts/visual-qa${lang === 'en' ? '-en' : ''}`;

interface Fallo {
  regla: string;
  detalle: string;
}

/** La auditoría que corre dentro de la página. */
function auditar(o: { esMovil: boolean; idioma: string }): Fallo[] {
  const { esMovil, idioma } = o;
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
  const enRollo = (el: Element) => !!el.closest('.mapa-rollo, .visor-cartas, .col-cuerpo, .hud-tiras, .pul-cuerpo, .velo, .rollo');
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
      if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) fallos.push({ regla: 'recorte', detalle: `${nombre(el)} en ${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}` });
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
        errores.length = 0;
        await pagina.goto(`${url}/?qa=${estado}&lang=${lang}`, { waitUntil: 'domcontentloaded' });
        await pagina.waitForSelector('html[data-qa="listo"]', { timeout: 15000 });
        await pagina.evaluate(() => document.fonts.ready);
        if (estado.endsWith('-mando')) {
          // el foco del mando: se mueve con las flechas, como con la cruceta (en la mesa, además, se elige una carta)
          if (estado === 'mesa-mando') {
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
        await pagina.waitForTimeout(120);
        const fallos = await pagina.evaluate(auditar, { esMovil: v.w < 700, idioma: lang });
        for (const e of errores) fallos.push({ regla: 'error-js', detalle: e.slice(0, 200) });
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
