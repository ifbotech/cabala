// QA de estabilidad geométrica (layout shift) y simetría entre estados interactivos.
//   npm run qa:estabilidad              falla (exit 1) si hay cualquier salto o asimetría
//   npm run qa:estabilidad -- --reportar escribe el informe y sale con 0 (para línea base)
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('qa:estabilidad', 240);

const reportar = process.argv.includes('--reportar');

const VENTANAS = [
  { nombre: '1920x1080', w: 1920, h: 1080 },
  { nombre: '1366x768', w: 1366, h: 768 },
  { nombre: '1280x800', w: 1280, h: 800 },
  { nombre: '390x844', w: 390, h: 844 },
  { nombre: '390x664', w: 390, h: 664 },
] as const;

type Rect = [number, number, number, number]; // [left, top, width, height]

interface Hallazgo {
  ventana: string;
  sonda: string;
  estado: string;
  detalle: string;
}

const hallazgos: Hallazgo[] = [];

function agregar(ventana: string, sonda: string, estado: string, detalle: string): void {
  hallazgos.push({ ventana, sonda, estado, detalle });
}

function compararRect(a: Rect | null, b: Rect | null, tol: number, indices: readonly number[] = [0, 1, 2, 3]): string | null {
  if (!a || !b) return null;
  const nombres = ['x', 'y', 'w', 'h'];
  const diffs: string[] = [];
  for (const i of indices) {
    const d = Math.abs(b[i] - a[i]);
    if (d > tol) diffs.push(`${nombres[i]}:${a[i]}→${b[i]}(Δ${d})`);
  }
  return diffs.length ? diffs.join(', ') : null;
}

async function irQa(page: Page, url: string, estado: string): Promise<void> {
  await page.goto(`${url}/?qa=${estado}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('html[data-qa="listo"]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(80);
}

async function medirSelectores(page: Page, selectores: readonly string[]): Promise<Record<string, Rect | null>> {
  return page.evaluate((sels) => {
    const rect = (el: Element | null): [number, number, number, number] | null => {
      if (!el) return null;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) <= 0.05) return null;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return null;
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    };
    const out: Record<string, [number, number, number, number] | null> = {};
    for (const sel of sels) out[sel] = rect(document.querySelector(sel));
    return out;
  }, selectores);
}

await conServidor(5194, async (url) => {
  const navegador = await chromium.launch();
  try {
    for (const v of VENTANAS) {
      const esMovil = v.w < 700;
      const esBaja = v.nombre === '390x664';
      const ctx = await navegador.newContext({
        viewport: { width: v.w, height: v.h },
        deviceScaleFactor: 1,
        hasTouch: esMovil,
        isMobile: esMovil,
      });
      await ctx.addInitScript('globalThis.__name = (f) => f');
      const page = await ctx.newPage();

      // 1. elegir-mazo
      {
        const sonda = 'elegir-mazo';
        await irQa(page, url, 'elegir-mazo');
        const sels = [
          '.mazos',
          '.mazo-detalle',
          '.reinado',
          '[data-accion="jugar"]',
          '.mini-anfitrion .bocadillo',
          '.mazo-op[data-id="escoba"]',
          '.mazo-op[data-id="truco"]',
          '.mazo-op[data-id="chinchon"]',
          '.mazo-op[data-id="mentiroso"]',
          '.mazo-op[data-id="chancho"]',
        ];
        const base = await medirSelectores(page, sels);
        const pasos = ['truco', 'chinchon', 'mentiroso', 'chancho', 'escoba'];
        for (const id of pasos) {
          const btn = page.locator(`.mazo-op[data-id="${id}"]`);
          if (await btn.count()) {
            await btn.click();
            await page.waitForTimeout(80);
            const act = await medirSelectores(page, sels);
            for (const s of sels) {
              if (s === '.mini-anfitrion .bocadillo') continue;
              const diff = compararRect(base[s], act[s], 1);
              if (diff) agregar(v.nombre, sonda, `mazo=${id}`, `${s} saltó (${diff})`);
            }
            const b0 = base['.mini-anfitrion .bocadillo'];
            const b1 = act['.mini-anfitrion .bocadillo'];
            const m0 = base['.mazos'];
            const m1 = act['.mazos'];
            if (b0 && b1 && Math.abs(b1[3] - b0[3]) > 2 && m0 && m1 && Math.abs(m1[1] - m0[1]) > 1) {
              agregar(v.nombre, sonda, `mazo=${id}`, `.mini-anfitrion .bocadillo cambió alto (${b0[3]}→${b1[3]}) empujando .mazos (${m0[1]}→${m1[1]})`);
            }
          }
        }
        // reinado-mas / reinado-menos si están habilitados
        for (const acc of ['reinado-mas', 'reinado-menos']) {
          const btn = page.locator(`[data-accion="${acc}"]:not(:disabled)`);
          if (await btn.count()) {
            await btn.click();
            await page.waitForTimeout(80);
            const act = await medirSelectores(page, sels);
            for (const s of ['.mazos', '.mazo-detalle', '.reinado', '[data-accion="jugar"]']) {
              const diff = compararRect(base[s], act[s], 1);
              if (diff) agregar(v.nombre, sonda, acc, `${s} saltó (${diff})`);
            }
          }
        }
      }

      // 2. altar
      {
        const sonda = 'altar';
        await irQa(page, url, 'altar');
        const ofrendas = ['vida', 'oro', 'descuento', 'suerte', 'reyes', 'hueco', 'purga'];
        const sels = ['.al-pano', '.al-detalle', '[data-accion="mejorar"]', '[data-accion="devolver"]', ...ofrendas.map((o) => `.al-ofrenda[data-id="${o}"]`)];
        const base = await medirSelectores(page, sels);
        for (const o of ofrendas) {
          const btn = page.locator(`.al-ofrenda[data-id="${o}"]`);
          if (await btn.count()) {
            await btn.click();
            await page.waitForTimeout(80);
            const act = await medirSelectores(page, sels);
            for (const s of sels) {
              const diff = compararRect(base[s], act[s], 1);
              if (diff) agregar(v.nombre, sonda, `ofrenda=${o}`, `${s} saltó (${diff})`);
            }
          }
        }
      }

      // 3. coleccion (solo w > 700 y 390x844)
      if (!esBaja) {
        const sonda = 'coleccion';
        await irQa(page, url, 'coleccion');
        const sels = ['.pestanas', '.col-pared'];
        const base = await medirSelectores(page, sels);
        for (const tab of ['mazos', 'reyes', 'amuletos', 'cabalas', 'bendiciones']) {
          const btn = page.locator(`[data-accion="pestana"][data-id="${tab}"]`);
          if (await btn.count()) {
            await btn.click();
            await page.waitForTimeout(80);
            const act = await medirSelectores(page, sels);
            for (const s of sels) {
              const diff = compararRect(base[s], act[s], 2);
              if (diff) agregar(v.nombre, sonda, `pestana=${tab}`, `${s} cambió (${diff})`);
            }
          }
        }
      }

      // 4. mesa-interaccion
      for (const estadoMesa of ['mesa', 'mesa-chinchon', 'mesa-mentiroso']) {
        const sonda = 'mesa-interaccion';
        await irQa(page, url, estadoMesa);
        await page.evaluate(() => {
          const g = window as unknown as { __mesa?: { mano?: { elegir(ids: string[]): void } } };
          g.__mesa?.mano?.elegir([]);
        });
        await page.waitForTimeout(120);

        const anclas = [
          '.mesa-top',
          '.e-centro',
          '.e-vida',
          '.e-ataque',
          '.corte',
          '.esc-bufon',
          '.pano-postas',
          '[data-accion="golpear"]',
          '[data-accion="descartar"]',
          '.chiches',
          '.hud',
        ];
        const anclasMovilFijas = ['.pano-postas', '[data-accion="golpear"]', '[data-accion="descartar"]', '.hud'];
        const anclasMovilEscena = ['.e-vida', '.e-ataque', '.e-centro'];

        const medirMesa = async () =>
          page.evaluate((sels) => {
            const rect = (el: Element | null): [number, number, number, number] | null => {
              if (!el) return null;
              const s = getComputedStyle(el);
              if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) <= 0.05) return null;
              const r = el.getBoundingClientRect();
              if (r.width <= 1 || r.height <= 1) return null;
              return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
            };
            const outAnclas: Record<string, [number, number, number, number] | null> = {};
            for (const sel of sels) outAnclas[sel] = rect(document.querySelector(sel));
            const cartas: Record<string, { rect: [number, number, number, number] | null; elegida: boolean; palo: string }> = {};
            for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta')) {
              const id = el.dataset.id ?? '';
              if (id) cartas[id] = { rect: rect(el), elegida: el.classList.contains('elegida'), palo: el.dataset.palo ?? '' };
            }
            const cuEl = document.querySelector('.mesa [data-cuenta] .cuenta:not(.reposo)');
            const bajoEl = document.querySelector('.mesa [data-cuenta] .c-bajo');
            const dnEl = document.querySelector('.mesa [data-cuenta] .c-desglose .d-n');
            return {
              anclas: outAnclas,
              cartas,
              cuenta: rect(cuEl),
              bajo: rect(bajoEl),
              dnFontSize: dnEl ? parseFloat(getComputedStyle(dnEl).fontSize) : null,
            };
          }, anclas);

        const reposo = await medirMesa();
        const idsTodos = Object.keys(reposo.cartas);
        const noComodines = idsTodos.filter((id) => reposo.cartas[id].palo !== 'X');
        const pool = noComodines.length >= 3 ? noComodines : idsTodos;
        const elegibles = pool.slice(0, 3);

        let prevCuenta: { paso: string; cuenta: Rect | null; bajo: Rect | null; dnFontSize: number | null } | null = null;

        for (const [pasoNombre, ids] of [
          ['1-carta', elegibles.slice(0, 1)],
          ['2-cartas', elegibles.slice(0, 2)],
          ['3-cartas', elegibles.slice(0, 3)],
          ['vuelta-reposo', [] as string[]],
        ] as const) {
          await page.evaluate((selIds) => {
            const g = window as unknown as { __mesa?: { mano?: { elegir(ids: string[]): void } } };
            g.__mesa?.mano?.elegir([...selIds]);
          }, ids);
          await page.waitForTimeout(140);
          const act = await medirMesa();

          if (!esMovil) {
            for (const s of anclas) {
              const diff = compararRect(reposo.anclas[s], act.anclas[s], 1);
              if (diff) agregar(v.nombre, sonda, `${estadoMesa}:${pasoNombre}`, `${s} saltó (${diff})`);
            }
          } else {
            for (const s of anclasMovilFijas) {
              const diff = compararRect(reposo.anclas[s], act.anclas[s], 1);
              if (diff) agregar(v.nombre, sonda, `${estadoMesa}:${pasoNombre}`, `${s} saltó (${diff})`);
            }
            for (const s of anclasMovilEscena) {
              const diff = compararRect(reposo.anclas[s], act.anclas[s], 2);
              if (diff) agregar(v.nombre, sonda, `${estadoMesa}:${pasoNombre}`, `${s} (escena móvil) saltó (${diff})`);
            }
          }

          for (const [id, info] of Object.entries(act.cartas)) {
            if (!info.elegida && reposo.cartas[id]) {
              const diff = compararRect(reposo.cartas[id].rect, info.rect, 1);
              if (diff) agregar(v.nombre, sonda, `${estadoMesa}:${pasoNombre}`, `carta no elegida ${id} saltó (${diff})`);
            }
          }

          if (ids.length > 0) {
            if (!prevCuenta) {
              prevCuenta = { paso: pasoNombre, cuenta: act.cuenta, bajo: act.bajo, dnFontSize: act.dnFontSize };
            } else {
              const dCuenta = compararRect(prevCuenta.cuenta, act.cuenta, 2, [1, 3]); // top, height
              if (dCuenta) agregar(v.nombre, sonda, `${estadoMesa}:${prevCuenta.paso}→${pasoNombre}`, `.cuenta cambió (${dCuenta})`);
              if (!esMovil) {
                const dBajo = compararRect(prevCuenta.bajo, act.bajo, 2, [1, 2, 3]); // top, width, height
                if (dBajo) agregar(v.nombre, sonda, `${estadoMesa}:${prevCuenta.paso}→${pasoNombre}`, `.c-bajo cambió (${dBajo})`);
                if (prevCuenta.dnFontSize !== null && act.dnFontSize !== null && Math.abs(act.dnFontSize - prevCuenta.dnFontSize) > 1) {
                  agregar(v.nombre, sonda, `${estadoMesa}:${prevCuenta.paso}→${pasoNombre}`, `.d-n fontSize saltó (${prevCuenta.dnFontSize}→${act.dnFontSize})`);
                }
              }
            }
          }
        }
      }

      // 5. mesa-dial
      {
        const sonda = 'mesa-dial';
        await irQa(page, url, 'mesa-dejalo-justo');
        const sels = ['.cuenta', '.c-bajo', '.e-centro', '.e-vida', '.botones', '.hud'];
        const medirDial = async () =>
          page.evaluate((ss) => {
            const rect = (el: Element | null): [number, number, number, number] | null => {
              if (!el) return null;
              const s = getComputedStyle(el);
              if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) <= 0.05) return null;
              const r = el.getBoundingClientRect();
              if (r.width <= 1 || r.height <= 1) return null;
              return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
            };
            const out: Record<string, [number, number, number, number] | null> = {};
            for (const s of ss) out[s] = rect(document.querySelector(s));
            for (const el of document.querySelectorAll<HTMLElement>('[data-mano] .carta:not(.elegida)')) {
              const id = el.dataset.id ?? '';
              if (id) out[`carta:${id}`] = rect(el);
            }
            return out;
          }, sels);

        const dialBtn = page.locator('[data-accion="dial"]');
        if (await dialBtn.count()) {
          const base = await medirDial();
          await dialBtn.click();
          await page.waitForTimeout(120);
          const paso1 = await medirDial();
          for (const k of Object.keys(base)) {
            const diff = compararRect(base[k], paso1[k] ?? null, 1);
            if (diff) agregar(v.nombre, sonda, 'dial-1', `${k} saltó (${diff})`);
          }
          await dialBtn.click();
          await page.waitForTimeout(120);
          const paso2 = await medirDial();
          for (const k of Object.keys(base)) {
            const diff = compararRect(base[k], paso2[k] ?? null, 1);
            if (diff) agregar(v.nombre, sonda, 'dial-2', `${k} saltó (${diff})`);
          }
        }
      }

      // 6. portada-idioma (solo w > 700 y 390x844)
      if (!esBaja) {
        const sonda = 'portada-idioma';
        await irQa(page, url, 'portada');
        const sels = ['.logo-caja', '[data-accion="jugar"]', '.portada-pila'];
        const base = await medirSelectores(page, sels);
        for (const lang of ['en', 'es']) {
          const btn = page.locator(`[data-accion="${lang}"]`);
          if (await btn.count()) {
            await btn.click();
            await page.waitForTimeout(120);
            const act = await medirSelectores(page, sels);
            for (const s of sels) {
              const diff = compararRect(base[s], act[s], 2);
              if (diff) agregar(v.nombre, sonda, `lang=${lang}`, `${s} saltó (${diff})`);
            }
          }
        }
      }

      // 7. ofertas-simetria
      for (const estadoOf of ['elegi-una', 'elegi-amuleto', 'elegi-bendicion', 'pulperia']) {
        const sonda = 'ofertas-simetria';
        await irQa(page, url, estadoOf);
        const problemas = await page.evaluate((est) => {
          const out: string[] = [];
          const rect = (el: Element | null): [number, number, number, number] | null => {
            if (!el) return null;
            const s = getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) <= 0.05) return null;
            const r = el.getBoundingClientRect();
            if (r.width <= 1 || r.height <= 1) return null;
            return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
          };
          const selectorTarjetas = est === 'pulperia' ? '.pulperia .venta' : '.oferta .opciones > .opcion';
          const tarjetas = [...document.querySelectorAll(selectorTarjetas)]
            .map((el) => ({ el, r: rect(el) }))
            .filter((x): x is { el: Element; r: [number, number, number, number] } => !!x.r);

          // Agrupar tarjetas por fila (Math.abs(topA - topB) < 20)
          const filas: { el: Element; r: [number, number, number, number] }[][] = [];
          for (const t of tarjetas) {
            const fila = filas.find((f) => Math.abs(f[0].r[1] - t.r[1]) < 20);
            if (fila) fila.push(t);
            else filas.push([t]);
          }
          filas.forEach((f, idx) => {
            if (f.length < 2) return;
            const hs = f.map((x) => x.r[3]);
            const ws = f.map((x) => x.r[2]);
            const dh = Math.max(...hs) - Math.min(...hs);
            const dw = Math.max(...ws) - Math.min(...ws);
            if (dh > 2) out.push(`fila ${idx} altura despareja (${Math.min(...hs)}..${Math.max(...hs)}, Δ${dh})`);
            if (dw > 2) out.push(`fila ${idx} ancho desparejo (${Math.min(...ws)}..${Math.max(...ws)}, Δ${dw})`);
          });

          // Verificar Bufón dentro de viewport y sin solape > 4 px con .opcion o .panel
          const bufones = [...document.querySelectorAll('.bufon')]
            .map((el) => rect(el))
            .filter((r): r is [number, number, number, number] => !!r);
          const cajas = [...document.querySelectorAll('.opcion, .panel')]
            .map((el) => ({ el, r: rect(el) }))
            .filter((x): x is { el: Element; r: [number, number, number, number] } => !!x.r);

          for (const b of bufones) {
            const [bl, bt, bw, bh] = b;
            const br = bl + bw;
            const bb = bt + bh;
            if (bl < -1 || br > innerWidth + 1 || bt < -1 || bb > innerHeight + 1) {
              out.push(`.bufon cortado fuera de ventana (${bl},${bt}→${br},${bb} en ${innerWidth}x${innerHeight})`);
            }
            for (const c of cajas) {
              const [cl, ct, cw, ch] = c.r;
              const cr = cl + cw;
              const cb = ct + ch;
              const ix = Math.min(br, cr) - Math.max(bl, cl);
              const iy = Math.min(bb, cb) - Math.max(bt, ct);
              if (ix > 4 && iy > 4) {
                const nom = c.el.className.split(' ')[0] || c.el.tagName.toLowerCase();
                out.push(`.bufon solapa con .${nom} (${ix}×${iy} px)`);
              }
            }
          }
          return out;
        }, estadoOf);

        for (const prob of problemas) {
          agregar(v.nombre, sonda, estadoOf, prob);
        }
      }

      await ctx.close();
    }
  } finally {
    await navegador.close();
  }
});

// Agrupar resumen por ventana y sonda
const lineas: string[] = [];
lineas.push(`qa:estabilidad · ${new Date().toISOString()} · ${hallazgos.length} hallazgo(s)`);
for (const v of VENTANAS) {
  const deV = hallazgos.filter((h) => h.ventana === v.nombre);
  lineas.push(`\n[${v.nombre}] ${deV.length} hallazgo(s)`);
  const porSonda = new Map<string, Hallazgo[]>();
  for (const h of deV) {
    const arr = porSonda.get(h.sonda) ?? [];
    arr.push(h);
    porSonda.set(h.sonda, arr);
  }
  for (const [sonda, items] of porSonda) {
    lineas.push(`  · ${sonda} (${items.length}):`);
    for (const it of items.slice(0, 12)) {
      lineas.push(`      - [${it.estado}] ${it.detalle}`);
    }
    if (items.length > 12) lineas.push(`      … y ${items.length - 12} más`);
  }
}

const texto = lineas.join('\n') + '\n';
mkdirSync('artifacts/jurado', { recursive: true });
writeFileSync('artifacts/jurado/estabilidad.json', JSON.stringify({ fecha: new Date().toISOString(), total: hallazgos.length, hallazgos }, null, 2));
writeFileSync('artifacts/jurado/estabilidad.txt', texto);
console.log(texto);

if (hallazgos.length > 0 && !reportar) {
  process.exit(1);
}
process.exit(0);
