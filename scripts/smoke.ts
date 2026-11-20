// QA de humo: una partida ENTERA jugada por la interfaz, con el navegador de verdad.
//   1. Portada → elegir Mazo → «ELEGÍ UNA CÁBALA» → Mapa → mesa.
//   2. En la mesa: el HUD del jugador está completo (Vida, Escudo, oro, Mazo, retrato vivo), se golpea ARRASTRANDO las
//      cartas sobre el enemigo, se descarta ARRASTRANDO al descarte, y se elige una carta con el teclado.
//   3. La partida sigue hasta el final con clics (lo que haría el bot): Botín, «ELEGÍ UNA», Pulpería, Fogón, Cábala.
//   4. El final anota los Porotos; al volver a la portada el progreso quedó guardado.
//   5. En móvil (390 × 844, táctil): se llega a la mesa y se golpea tocando.
// Falla ante cualquier error de consola.   npm run qa:smoke [-- --lang=en] [-- --mazo=truco]
import { chromium, type Page } from 'playwright';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('qa:smoke', 280);
const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith('--lang='))?.split('=')[1] === 'en' ? 'en' : 'es';
const mazo = args.find((a) => a.startsWith('--mazo='))?.split('=')[1] ?? 'escoba';
const t0 = Date.now();
const hechos: string[] = [];
const ok = (texto: string) => {
  hechos.push(texto);
  console.log(`  ✓ ${texto}`);
};
function exigir(cond: unknown, texto: string): asserts cond {
  if (!cond) throw new Error(`HUMO: ${texto}`);
}

interface Estado {
  fase: string;
  golpes: number;
  descartes: number;
  vida: number;
  oro: number;
  mano: string[];
  ocupada: boolean;
}
const estado = (p: Page): Promise<Estado | null> =>
  p.evaluate(() => {
    const g = (window as unknown as { __cabala: { sesion: { partida: null | { fase: string; vida: number; oro: number; stats: { golpes: number }; combate?: { descartes: number; mano: { id: string }[] } } } } }).__cabala;
    const x = g.sesion.partida;
    return x ? { fase: x.fase, golpes: x.stats.golpes, descartes: x.combate?.descartes ?? 0, vida: x.vida, oro: x.oro, mano: x.combate?.mano.map((c) => c.id) ?? [], ocupada: !!document.querySelector('.mano.bloqueada') } : null;
  });
const consejo = (p: Page): Promise<{ t: string; ids: string[]; engano?: boolean } | null> =>
  p.evaluate(() => {
    const g = (window as unknown as { __cabala: { sesion: { partida: unknown }; decidir: (p: unknown) => { t: string; ids: string[]; engano?: boolean } | null } }).__cabala;
    return g.decidir(g.sesion.partida);
  });
const libre = (p: Page) => p.waitForFunction(() => !document.querySelector('.mano.bloqueada') && !document.querySelector('.cortina'), undefined, { timeout: 10000 });
const centro = async (p: Page, sel: string) => {
  const caja = await p.locator(sel).first().boundingBox();
  exigir(caja, `no se encuentra ${sel}`);
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
};
/** Arrastra una carta de la mano hasta el centro de una zona, paso a paso, como una persona. */
async function arrastrar(p: Page, id: string, zona: string): Promise<void> {
  const de = await centro(p, `.carta[data-id="${id}"]`);
  const a = await centro(p, zona);
  await p.mouse.move(de.x, de.y);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(de.x + ((a.x - de.x) * i) / 12, de.y + ((a.y - de.y) * i) / 12);
  await p.mouse.up();
}
const elegir = async (p: Page, ids: string[]) => {
  for (const id of ids) await p.locator(`.carta[data-id="${id}"]`).click();
};

async function hastaLaMesa(p: Page, url: string): Promise<void> {
  await p.goto(`${url}/?rapido&lang=${lang}`);
  await p.evaluate((l) => localStorage.setItem('cabala:ajustes', JSON.stringify({ idioma: l, calma: false, sonido: false })), lang);
  await p.reload();
  await p.waitForSelector('.portada [data-accion="jugar"]');
  await p.click('[data-accion="jugar"]');
  await p.waitForSelector('.elegir');
  await p.click(`.mazo-op[data-id="${mazo}"]`);
  await p.click('[data-accion="jugar"]');
  await p.waitForSelector('.oferta .opcion');
  await p.locator('.oferta .opcion').first().click();
  await p.waitForSelector('.nodo.abierto');
  await p.locator('.nodo.abierto').first().click();
  await p.waitForSelector('.mano .carta');
  await libre(p);
}

await conServidor(5192, async (url) => {
  const navegador = await chromium.launch();
  const errores: string[] = [];
  try {
    // ───────────── escritorio ─────────────
    const ctx = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
    // tsx envuelve las funciones con `__name`: la página necesita tenerlo
    await ctx.addInitScript('globalThis.__name = (f) => f');
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errores.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
    await hastaLaMesa(p, url);
    ok('portada → elegir Mazo → «ELEGÍ UNA CÁBALA» → Mapa → mesa');

    // el HUD del jugador
    const hud = await p.evaluate(() => {
      const n = (k: string) => document.querySelector(`[data-hud] [data-n="${k}"] .cifra`)?.getAttribute('aria-label') ?? '';
      const cara = document.querySelector<HTMLElement>('[data-hud] [data-cara]');
      return { vida: n('vida'), escudo: n('escudo'), oro: n('oro'), mazo: n('mazo'), cara: cara?.style.backgroundImage.startsWith('url(') ?? false, ancla: (document.querySelector('[data-hud]')?.getBoundingClientRect().bottom ?? 0) > innerHeight - 40 };
    });
    exigir(hud.vida && hud.escudo !== '' && hud.oro !== '' && hud.mazo, `el HUD no enseña Vida, Escudo, oro y Mazo (${JSON.stringify(hud)})`);
    exigir(hud.cara, 'el HUD no tiene el retrato del Personaje');
    exigir(hud.ancla, 'el HUD no está anclado abajo');
    ok(`HUD del jugador: Vida ${hud.vida} · Escudo ${hud.escudo} · oro ${hud.oro} · Mazo ${hud.mazo} · retrato vivo`);

    // la tabla de JUGADAS (tecla J) y «LO QUE LLEVÁS» (la tira del HUD, un solo botón)
    await p.keyboard.press('j');
    await p.waitForSelector('.jugadas .jugadas-tabla tbody tr');
    const filas = await p.locator('.jugadas .jugadas-tabla tbody tr').count();
    exigir(filas >= 9, `la tabla de JUGADAS tiene ${filas} filas (se esperan 9 o más)`);
    exigir((await p.locator('.jugadas .palos-lista li').count()) === 4, 'la tabla de JUGADAS no explica los 4 palos');
    await p.keyboard.press('Escape');
    await p.waitForSelector('.jugadas', { state: 'detached' });
    await p.click('[data-accion="ver-piezas"]');
    await p.waitForSelector('.piezas .pieza-fila');
    exigir((await p.locator('[data-hud] button.ficha').count()) === 0, 'las fichas de la tira siguen siendo botones sueltos');
    await p.keyboard.press('Escape');
    await p.waitForSelector('.piezas', { state: 'detached' });
    ok(`tabla de JUGADAS con ${filas} jugadas y los 4 palos (tecla J); la tira del HUD abre «LO QUE LLEVÁS»`);

    // teclado: Enter elige una carta y la suelta
    const primera = (await estado(p))!.mano[0];
    await p.locator(`.carta[data-id="${primera}"]`).focus();
    await p.keyboard.press('Enter');
    exigir((await p.locator(`.carta[data-id="${primera}"]`).getAttribute('aria-pressed')) === 'true', 'Enter no eligió la carta enfocada');
    exigir(await p.locator('[data-cuenta] .cuenta:not(.reposo)').count(), 'al elegir una carta no aparece la cuenta');
    await p.keyboard.press('Enter');
    exigir((await p.locator('[data-cuenta] .cuenta:not(.reposo)').count()) === 0, 'en reposo la cuenta no se calla');
    ok('teclado: Enter elige y suelta; la cuenta DAÑO × MULTI aparece y se calla');

    // arrastrar al descarte
    let e = (await estado(p))!;
    let d = (await consejo(p))!;
    const sobra = e.mano.find((id) => !d.ids.includes(id));
    if (sobra && e.descartes > 0) {
      await arrastrar(p, sobra, '[data-soltar="descarte"]');
      await libre(p);
      const tras = (await estado(p))!;
      exigir(tras.descartes === e.descartes - 1 || !tras.mano.includes(sobra), 'arrastrar al descarte no descartó');
      ok('arrastrar una carta al descarte la descarta y roba otra');
    }

    // arrastrar para atacar: el grupo elegido entero, soltado sobre el enemigo
    e = (await estado(p))!;
    d = (await consejo(p))!;
    while (d.t === 'descarte') {
      await elegir(p, d.ids);
      await p.click('[data-accion="descartar"]');
      await libre(p);
      d = (await consejo(p))!;
    }
    await elegir(p, d.ids);
    const total = await p.locator('[data-cuenta] [data-total] .cifra').getAttribute('aria-label');
    exigir(total && Number(total) > 0, 'la cuenta no enseña el TOTAL');
    // mientras se arrastra, el enemigo enciende su halo de destino
    const de = await centro(p, `.carta[data-id="${d.ids[0]}"]`);
    const a = await centro(p, '[data-carta]');
    await p.mouse.move(de.x, de.y);
    await p.mouse.down();
    for (let i = 1; i <= 12; i++) await p.mouse.move(de.x + ((a.x - de.x) * i) / 12, de.y + ((a.y - de.y) * i) / 12);
    exigir(await p.locator('[data-soltar="enemigo"].apunta').count(), 'al arrastrar sobre el enemigo no se enciende el halo de destino');
    await p.mouse.up();
    await p.waitForFunction((g) => ((window as unknown as { __cabala: { sesion: { partida: { stats: { golpes: number } } } } }).__cabala.sesion.partida.stats.golpes ?? 0) > g, e.golpes, { timeout: 8000 });
    ok(`arrastrar ${d.ids.length} carta(s) sobre el enemigo golpea (TOTAL ${total}), con el halo de destino encendido`);

    // ───────────── el resto de la partida, con clics ─────────────
    let pasos = 0;
    let arrastres = 0;
    for (; pasos < 900; pasos++) {
      await libre(p).catch(() => undefined);
      const x = await estado(p);
      exigir(x, 'la partida desapareció');
      if (x.fase === 'fin') break;
      if (await p.locator('.velo .reemplazo .opcion').count()) await p.locator('.velo .reemplazo .opcion').first().click();
      else if (await p.locator('.velo .oferta .opcion').count()) await p.locator('.velo .oferta .opcion').first().click();
      else if (x.fase === 'combate') {
        const c = await consejo(p);
        if (!c) continue;
        if (c.t === 'descarte') {
          await elegir(p, c.ids);
          await p.click('[data-accion="descartar"]');
        } else {
          if (c.engano) await p.click('[data-accion="engano"]');
          await elegir(p, c.ids);
          // uno de cada cuatro golpes, arrastrando; el resto, con el botón
          if (pasos % 4 === 0) {
            await arrastrar(p, c.ids[0], '[data-carta]');
            arrastres++;
          } else await p.click('[data-accion="golpear"]');
        }
        await p.waitForFunction((g) => {
          const s = (window as unknown as { __cabala: { sesion: { partida: null | { fase: string; stats: { golpes: number }; combate?: { descartes: number } } } } }).__cabala.sesion.partida;
          return !s || s.fase !== 'combate' || s.stats.golpes !== g[0] || (s.combate?.descartes ?? 0) !== g[1] || !document.querySelector('.mano .carta.elegida');
        }, [x.golpes, x.descartes], { timeout: 8000 });
      } else if (x.fase === 'botin') {
        if (await p.locator('[data-accion="abrir"]').count()) await p.locator('[data-accion="abrir"]').first().click();
        else if (await p.locator('.botin [data-accion="seguir"]').count()) await p.click('.botin [data-accion="seguir"]');
      } else if (x.fase === 'mapa') await p.locator('.nodo.abierto').first().click();
      else if (x.fase === 'pulperia') {
        const venta = p.locator('.venta[data-accion="comprar"]:not([disabled])').first();
        if (pasos % 2 === 0 && (await venta.count()) && !(await p.locator('.velo').count())) {
          const antes = x.oro;
          await venta.click();
          await p.waitForTimeout(30);
          if ((await estado(p))!.oro === antes && !(await p.locator('.velo').count())) await p.click('[data-accion="salir"]');
        } else if (!(await p.locator('.velo').count())) await p.click('[data-accion="salir"]');
      } else if (x.fase === 'fogon') {
        if (await p.locator('[data-accion="descansar"]:not([disabled])').count()) await p.click('[data-accion="descansar"]');
        else await p.click('.fogon [data-accion="seguir"]');
      } else if (x.fase === 'cabala') {
        if (await p.locator('.cabala [data-accion="seguir"]').count()) await p.click('.cabala [data-accion="seguir"]');
        else await p.locator('.cabala .opcion:not([disabled])').first().click();
      }
    }
    exigir((await estado(p))?.fase === 'fin', `la partida no llegó al final en ${pasos} pasos`);
    await p.waitForSelector('.fin .fin-porotos');
    const fin = await p.evaluate(() => ({ titulo: document.querySelector('.fin-titulo')?.textContent ?? '', porotos: document.querySelector('.fin-porotos')?.textContent ?? '' }));
    ok(`partida entera por la interfaz en ${pasos} pasos (${arrastres} golpes arrastrando): «${fin.titulo.trim()}» · ${fin.porotos.trim()}`);

    await p.click('[data-accion="portada"]');
    await p.waitForSelector('.portada');
    const guardado = await p.evaluate(() => JSON.parse(localStorage.getItem('cabala:perfil') ?? '{}') as { porotos?: number; stats?: { partidas: number }; cronica?: unknown[] });
    exigir(guardado.stats?.partidas === 1 && (guardado.cronica?.length ?? 0) === 1, 'la partida no quedó anotada en el perfil');
    exigir(!(await p.evaluate(() => localStorage.getItem('cabala:partida'))), 'quedó una partida terminada guardada');
    ok(`el perfil guardó la partida: ${guardado.porotos} Porotos y 1 entrada en la Crónica`);

    // el Altar, la Colección, la Crónica y los Ajustes abren y vuelven
    for (const pantalla of ['altar', 'coleccion', 'cronica', 'ajustes']) {
      await p.click(`[data-accion="${pantalla}"]`);
      await p.waitForSelector('[data-accion="volver"]');
      await p.keyboard.press('Escape');
      await p.waitForSelector('.portada');
    }
    ok('Altar, Colección, Crónica y Ajustes abren y vuelven con Escape');
    await ctx.close();

    // ───────────── móvil, táctil ─────────────
    const movil = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await movil.addInitScript('globalThis.__name = (f) => f');
    const m = await movil.newPage();
    m.on('pageerror', (e2) => errores.push(e2.message));
    m.on('console', (x) => x.type() === 'error' && errores.push(x.text()));
    await hastaLaMesa(m, url);
    const antes = (await estado(m))!;
    const c = (await consejo(m))!;
    const ids = c.t === 'golpe' ? c.ids : [antes.mano[0]];
    // se toca la parte de arriba de cada carta: en la mano de dos filas es lo que asoma de las de atrás
    for (const id of ids) await m.locator(`.carta[data-id="${id}"]`).tap({ position: { x: 24, y: 18 } });
    await m.locator('[data-accion="golpear"]').tap();
    await m.waitForFunction((g) => ((window as unknown as { __cabala: { sesion: { partida: { stats: { golpes: number } } } } }).__cabala.sesion.partida.stats.golpes ?? 0) > g, antes.golpes, { timeout: 8000 });
    const desborde = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    exigir(!desborde, 'la mesa se desborda de la ventana del móvil');
    ok('móvil (390 × 844, táctil): se llega a la mesa y se golpea tocando');
    await movil.close();

    // el Bufón vivo (sin el modo rápido, que lo deja quieto): llega con su nube y su sonido, escribe lo que dice,
    // se esfuma al cambiar de pantalla y reaparece en la siguiente; el bocadillo se va solo
    const vivo = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
    await vivo.addInitScript('globalThis.__name = (f) => f');
    const v = await vivo.newPage();
    v.on('pageerror', (e) => errores.push(e.message));
    await v.goto(`${url}/?perfil=nuevo&lang=${lang}`);
    await v.waitForSelector('.portada [data-accion="jugar"]');
    const sonados = (): Promise<string> => v.evaluate(() => (window as unknown as { __cabala: { sonados: string[] } }).__cabala.sonados.join(' '));
    await v.waitForFunction(() => !!document.querySelector('.portada [data-anfitrion] [data-voz] .dicho')?.textContent, undefined, { timeout: 5000 });
    exigir((await sonados()).includes('bufon'), 'el Bufón llegó a la portada sin su sonido');
    await v.click('[data-accion="jugar"]');
    await v.waitForSelector('.elegir .mini-anfitrion .bufon');
    await v.waitForFunction(() => !!document.querySelector('.mini-anfitrion [data-voz] .dicho')?.textContent, undefined, { timeout: 5000 });
    const tras = await sonados();
    exigir(tras.includes('puf') && tras.lastIndexOf('bufon') > tras.indexOf('puf'), `al cambiar de pantalla el Bufón no se esfumó y reapareció (${tras})`);
    await v.waitForFunction(() => document.querySelector<HTMLElement>('.mini-anfitrion [data-voz]')?.hidden === true, undefined, { timeout: 12000 });
    ok('el Bufón te sigue: se esfuma con humo, reaparece con su sonido, escribe lo que dice y el bocadillo se va');
    await vivo.close();
  } finally {
    await navegador.close();
  }
  exigir(!errores.length, `errores de consola: ${errores.slice(0, 3).join(' | ')}`);
  ok('sin errores de consola');
});

console.log(`\nqa:smoke (${lang}, ${mazo}) · ${hechos.length} comprobaciones en verde · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(0);
