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
  const enRollo = (el: Element) => !!el.closest('.mapa-rollo, .visor-cartas, .col-cuerpo, .hud-tiras, .pul-cuerpo, .velo');
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
    if (el.matches('button, .chip, .op-nombre, .e-nombre, .titulo') && el.scrollWidth > el.clientWidth + 2 && s.overflow !== 'visible') fallos.push({ regla: 'texto-cortado', detalle: `${nombre(el)} «${(el.textContent ?? '').trim().slice(0, 30)}»` });
  }
  // restos de español en la pantalla inglesa
  if (idioma === 'en') {
    const texto = (document.querySelector('#app') as HTMLElement).innerText + (document.querySelector('#capa') as HTMLElement).innerText;
    const restos = ['Elegí', 'Golpear', 'Descartar', 'Seguir', 'Volver', 'Vida', 'Escudo', 'Daño', 'Bendición', 'Amuleto', 'Reinado', 'Tramo', ' de oro', 'Turno'].filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(texto));
    if (restos.length) fallos.push({ regla: 'español-en-inglés', detalle: restos.join(', ') });
  }
  return fallos;
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
        await pagina.waitForTimeout(120);
        const fallos = await pagina.evaluate(auditar, { esMovil: v.w < 700, idioma: lang });
        for (const e of errores) fallos.push({ regla: 'error-js', detalle: e.slice(0, 200) });
        await pagina.screenshot({ path: `${carpeta}/${v.nombre}/${estado}.png` });
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
