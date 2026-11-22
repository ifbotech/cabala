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
/** (0.28) La música, vista desde afuera: qué escena se pidió y cuál suena, el reloj, cuántas veces arrancó y lo que le contó el combate. */
type Musica = { deseada: string | null; suena: string | null; pasos: number; reloj: number; arranques: number; combate: { tramo: number }; nivel: number; stingers: string[] };
const musicaDe = (p: Page): Promise<Musica & { acto: number | null }> =>
  p.evaluate(() => {
    const g = (window as unknown as { __cabala: { musica: () => Musica; sesion: { partida: null | { acto: number } } } }).__cabala;
    return { ...g.musica(), acto: g.sesion.partida?.acto ?? null };
  });
/**
 * (0.28) Salir de la Pulpería. Una vez (en cinco corridas) este clic se quedó 30 s esperando: primero lo tapó el
 * jackpot de una Evolución (a propósito: se traga la entrada hasta 1,6 s) y después, sin que se haya podido repetir,
 * una carta en venta. Si vuelve a pasar, el humo dice QUÉ tapa el botón, dónde está cada cosa y con qué semilla.
 */
async function salirDeLaPulperia(p: Page): Promise<void> {
  try {
    await p.click('[data-accion="salir"]', { timeout: 8000 });
  } catch (e) {
    const foto = await p.evaluate(() => {
      const caja = (el: Element | null): string => {
        const r = el?.getBoundingClientRect();
        return r ? `${Math.round(r.left)},${Math.round(r.top)}–${Math.round(r.right)},${Math.round(r.bottom)}` : '—';
      };
      const salir = document.querySelector('[data-accion="salir"]');
      const r = salir?.getBoundingClientRect();
      const encima = r ? (document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) as HTMLElement | null) : null;
      const corridos: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('#app, #app *')) if (el.scrollTop || el.scrollLeft) corridos.push(`${el.tagName}.${el.className} ${el.scrollLeft},${el.scrollTop}`);
      const g = (window as unknown as { __cabala: { sesion: { partida: null | { semilla: string; oro: number; amuletos: string[] } } } }).__cabala.sesion.partida;
      return {
        salir: caja(salir),
        encima: encima ? `${encima.tagName}.${encima.className}[${encima.dataset.foco ?? ''}] ${caja(encima)} transform ${getComputedStyle(encima).transform}` : '—',
        ventas: [...document.querySelectorAll('.venta')].map((v) => `${(v as HTMLElement).dataset.foco}:${caja(v)}`).join(' '),
        cuerpo: caja(document.querySelector('.pul-cuerpo')),
        capa: [...(document.querySelector('#capa')?.children ?? [])].map((c) => c.className).join(' | '),
        corridos,
        ventana: `${scrollX},${scrollY}`,
        semilla: g?.semilla,
        oro: g?.oro,
        amuletos: g?.amuletos,
      };
    });
    throw new Error(`HUMO: no se pudo salir de la Pulpería: ${JSON.stringify(foto)} · ${String(e).split(String.fromCharCode(10))[0]}`);
  }
}
const libre = (p: Page) => p.waitForFunction(() => !document.querySelector('.mano.bloqueada') && !document.querySelector('.cortina'), undefined, { timeout: 10000 });
const centro = async (p: Page, sel: string) => {
  const caja = await p.locator(sel).first().boundingBox();
  exigir(caja, `no se encuentra ${sel}`);
  return { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
};
/**
 * Un punto de la carta que se ve (0.21: la carta elegida va al paño de las Postas, detrás de la mano, y asoma solo su
 * franja de arriba; una persona la toma de ahí, no del centro que tapan las otras).
 */
async function puntoDe(p: Page, id: string): Promise<{ x: number; y: number }> {
  await p.locator(`.carta[data-id="${id}"]`).first().waitFor({ state: 'visible' });
  const pt = await p.evaluate((id) => {
    const el = document.querySelector<HTMLElement>(`.carta[data-id="${id}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // (0.21: el paño va encima de la mano; de una carta de la mano a veces se ve solo un costado o su índice al pie)
    for (const fy of [0.5, 0.3, 0.15, 0.08, 0.7, 0.04, 0.85, 0.94])
      for (const fx of [0.5, 0.3, 0.7, 0.12, 0.88]) {
        const x = r.left + r.width * fx;
        const y = r.top + r.height * fy;
        if (y < 0 || y > innerHeight - 2) continue;
        if (document.elementFromPoint(x, y)?.closest<HTMLElement>('.carta')?.dataset.id === id) return { x, y };
      }
    return null;
  }, id);
  exigir(pt, `la carta ${id} no se ve en ningún punto`);
  return pt;
}
/** Arrastra una carta de la mano hasta el centro de una zona, paso a paso, como una persona. */
async function arrastrar(p: Page, id: string, zona: string): Promise<void> {
  const de = await puntoDe(p, id);
  const a = await centro(p, zona);
  await p.mouse.move(de.x, de.y);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(de.x + ((a.x - de.x) * i) / 12, de.y + ((a.y - de.y) * i) / 12);
  await p.mouse.up();
}
/** Deja elegidas justo esas cartas (suelta las que sobran de antes), tocándolas donde se ven. */
const elegir = async (p: Page, ids: string[]) => {
  const ya: string[] = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>('.mano .carta.elegida')].map((x) => x.dataset.id ?? ''));
  for (const id of [...ya.filter((x) => !ids.includes(x)), ...ids.filter((x) => !ya.includes(x))]) {
    // (la carta viaja a su Posta o vuelve a la mano: se espera a que se pose antes de tocar la siguiente)
    const pt = await puntoDe(p, id);
    await p.mouse.click(pt.x, pt.y);
    await p.waitForTimeout(260);
  }
  const quedan: string[] = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>('.mano .carta.elegida')].map((x) => x.dataset.id ?? ''));
  if (quedan.length !== ids.length || ids.some((x) => !quedan.includes(x))) console.log(`  · elegir: pedidas ${ids.join(',')} y quedaron ${quedan.join(',')}`);
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
    p.on('pageerror', (e) => {
      errores.push(e.message);
      console.error(`  (error de página: ${e.message})`);
    });
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
    const de = await puntoDe(p, d.ids[0]);
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
    // (0.28) la música es UNA: mientras la partida pasa de pantalla en pantalla, el reloj nunca vuelve a arrancar ni
    // retrocede, y el combate le cuenta el tramo de verdad
    const escenas = new Set<string>();
    let relojAntes = 0;
    let combatesOidos = 0;
    for (; pasos < 900; pasos++) {
      await libre(p).catch(() => undefined);
      const x = await estado(p);
      exigir(x, 'la partida desapareció');
      const mu = await musicaDe(p);
      if (mu.deseada) escenas.add(mu.deseada);
      exigir(mu.arranques <= 1, `la música se cortó y volvió a arrancar (${mu.arranques} arranques) al pasar a «${mu.deseada}»`);
      exigir(mu.reloj >= relojAntes, `el reloj de la música retrocedió (${relojAntes} → ${mu.reloj}) al pasar a «${mu.deseada}»`);
      relojAntes = mu.reloj;
      if (x.fase === 'combate' && (mu.deseada === 'mesa' || mu.deseada === 'rey')) {
        exigir(mu.combate.tramo === mu.acto, `la música cree que el combate es del tramo ${mu.combate.tramo} y es del ${mu.acto}`);
        combatesOidos++;
      }
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
          // (0.27) el bot a veces aconseja más cartas de las que entran en el paño (mano de 4 con «Dar de abajo» y 3
          // Postas: `postasDe` cuenta la mano del Mazo, no la de este turno). Una persona no puede apoyar la cuarta: juega
          // lo que entra. El humo hace lo mismo (la primera carta sola que valga) y lo anota
          if (await p.locator('[data-accion="golpear"]:disabled').count()) {
            console.log(`  · el consejo (${c.ids.join(',')}) no entra en el paño: se juega una carta sola`);
            for (const id of x.mano) {
              await elegir(p, [id]);
              if (!(await p.locator('[data-accion="golpear"]:disabled').count())) break;
            }
          }
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
          if ((await estado(p))!.oro === antes && !(await p.locator('.velo').count())) await salirDeLaPulperia(p);
        } else if (!(await p.locator('.velo').count())) await salirDeLaPulperia(p);
      } else if (x.fase === 'fogon') {
        if (await p.locator('[data-accion="descansar"]:not([disabled])').count()) await p.click('[data-accion="descansar"]');
        else await p.click('.fogon [data-accion="seguir"]');
      } else if (x.fase === 'cabala') {
        if (await p.locator('.cabala [data-accion="seguir"]').count()) await p.click('.cabala [data-accion="seguir"]');
        else if (await p.locator('.negra-bandeja').count()) {
          // (0.22) la Cábala Negra: se eligen los naipes en su bandeja (los que quedan encendidos) y se cose
          const coser = p.locator('.negra-bandeja [data-accion="coser"]:not([disabled])');
          const naipe = p.locator('.negra-naipe:not([disabled]):not(.elegida)').first();
          if (await coser.count()) await coser.click();
          else if (await naipe.count()) await naipe.click();
          else await p.click('.negra-bandeja [data-accion="volver"]');
        } else await p.locator('.cabala .opcion:not([disabled])').first().click();
      }
    }
    exigir((await estado(p))?.fase === 'fin', `la partida no llegó al final en ${pasos} pasos`);
    const dicho = await p.evaluate(() => {
      const g = (window as unknown as { __cabala: { hablaron: string[]; sesion: { partida: { stats: { cantos: number } } } } }).__cabala;
      return { hablaron: g.hablaron, cantos: g.sesion.partida.stats.cantos };
    });
    exigir(dicho.cantos === 0 || dicho.hablaron.includes(mazo), `hubo ${dicho.cantos} cantos y el Personaje no gritó ninguno (hablaron: ${dicho.hablaron.join(' ')})`);
    const mFin = await musicaDe(p);
    exigir(mFin.arranques === 1 && mFin.reloj > 16, `con los efectos apagados y la música prendida, la música no sonó (arranques ${mFin.arranques}, reloj ${mFin.reloj})`);
    exigir(escenas.has('mapa') && escenas.has('mesa') && combatesOidos > 0, `la partida no pasó por el Mapa y la mesa con música (${[...escenas].join(' ')})`);
    exigir(dicho.cantos === 0 || mFin.stingers.includes(mazo), `hubo ${dicho.cantos} cantos y ningún stinger del Mazo (stingers: ${mFin.stingers.join(' ')})`);
    exigir(dicho.hablaron.length > 0, 'nadie cantó en toda la partida');
    await p.waitForSelector('.fin .fin-porotos');
    const fin = await p.evaluate(() => ({ titulo: document.querySelector('.fin-titulo')?.textContent ?? '', porotos: document.querySelector('.fin-porotos')?.textContent ?? '' }));
    ok(`partida entera por la interfaz en ${pasos} pasos (${arrastres} golpes arrastrando): «${fin.titulo.trim()}» · ${fin.porotos.trim()}`);
    ok(`música: un solo reloj de punta a punta (${[...escenas].join(' → ')}; 1 arranque, ${mFin.reloj} semicorcheas), el tramo real llegó en ${combatesOidos} lecturas, stingers ${[...new Set(mFin.stingers)].join(' ') || '—'}, cantaron ${dicho.hablaron.join(' ')}`);

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
    // (0.26) si el consejo cuenta con el Engaño, se lo prende antes (sin él la jugada puede no ser jugada)
    if (c.t === 'golpe' && c.engano) await m.locator('[data-accion="engano"]').tap();
    // se toca cada carta donde se ve: en la mano de dos filas, lo que asoma de las de atrás (y la elegida se va al paño)
    for (const id of ids) {
      const pt = await puntoDe(m, id);
      await m.touchscreen.tap(pt.x, pt.y);
      await m.waitForTimeout(260);
    }
    // (0.27) lo mismo que en el escritorio: si el consejo no entra en el paño, se juega la primera carta sola que valga
    if (await m.locator('[data-accion="golpear"]:disabled').count()) {
      const quedo = await m.evaluate(() => [...document.querySelectorAll<HTMLElement>('.mano .carta.elegida')].map((x2) => x2.dataset.id).join(','));
      console.log(`  · móvil: el consejo (${ids.join(',')}) dejó elegido [${quedo}] y no es jugada: se juega una carta sola`);
      for (const id of antes.mano) {
        for (const ya of await m.evaluate(() => [...document.querySelectorAll<HTMLElement>('.mano .carta.elegida')].map((x2) => x2.dataset.id ?? ''))) {
          const pt = await puntoDe(m, ya);
          await m.touchscreen.tap(pt.x, pt.y);
          await m.waitForTimeout(260);
        }
        const pt = await puntoDe(m, id);
        await m.touchscreen.tap(pt.x, pt.y);
        await m.waitForTimeout(260);
        if (!(await m.locator('[data-accion="golpear"]:disabled').count())) break;
      }
    }
    await m.locator('[data-accion="golpear"]').tap();
    await m.waitForFunction((g) => ((window as unknown as { __cabala: { sesion: { partida: { stats: { golpes: number } } } } }).__cabala.sesion.partida.stats.golpes ?? 0) > g, antes.golpes, { timeout: 8000 });
    const desborde = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    exigir(!desborde, 'la mesa se desborda de la ventana del móvil');
    ok('móvil (390 × 844, táctil): se llega a la mesa y se golpea tocando');
    await movil.close();

    // el Fogón de tres pasadas: templar un naipe (segura), arrimarlo (Templada) y la Forja Brava, hasta que se queme o llegue al tope
    const fg = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
    await fg.addInitScript('globalThis.__name = (f) => f');
    const pf = await fg.newPage();
    pf.on('pageerror', (e) => errores.push(e.message));
    await pf.goto(`${url}/?qa=fogon&vivo&rapido&lang=${lang}`);
    await pf.waitForSelector('[data-accion="templar"]');
    const mazoAntes = await pf.evaluate(() => (window as unknown as { __cabala: { sesion: { partida: { mazo: unknown[] } } } }).__cabala.sesion.partida.mazo.length);
    await pf.click('[data-accion="templar"]');
    await pf.locator('.visor button.visor-carta').first().click();
    await pf.waitForSelector('.opcion.fuego .c-temple');
    // la placa lo dice en palabras desde la 0.25 («+4 de Daño» / «+4 Damage»): basta con que arranque en +4
    exigir(/^\+4(?!\d)/.test((await pf.locator('.opcion.fuego .c-temple').textContent())?.trim() ?? ''), 'la primera pasada por el fuego no dejó el naipe al rojo (+4)');
    let pasadas = 1;
    while ((await pf.locator('[data-accion="arrimar"]').count()) > 0 && pasadas < 6) {
      await pf.click('[data-accion="arrimar"]');
      await pf.waitForTimeout(60);
      pasadas++;
    }
    const finFuego = await pf.evaluate(() => {
      const p = (window as unknown as { __cabala: { sesion: { partida: { mazo: { temple?: number; templada?: boolean; brava?: boolean }[] } } } }).__cabala.sesion.partida;
      const mejor = [...p.mazo].sort((x, y) => (y.temple ?? 0) - (x.temple ?? 0))[0];
      return { mazo: p.mazo.length, temple: mejor?.temple ?? 0, templada: !!mejor?.templada, brava: !!mejor?.brava };
    });
    exigir(finFuego.mazo === mazoAntes - 1 ? finFuego.temple === 0 : finFuego.temple === 8 && finFuego.templada && finFuego.brava, `el Fogón de riesgo terminó raro: ${JSON.stringify(finFuego)} tras ${pasadas} pasadas`);
    ok(`Fogón de riesgo: templar (+4 seguro) y arrimar ${pasadas - 1} vez/veces más → ${finFuego.mazo < mazoAntes ? 'se quemó (un naipe menos)' : 'llegó a la Forja Brava (+8, Templada y su número vale doble)'}`);
    await fg.close();

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

    // la música: suena la pista de la pantalla desde el primer gesto, y el ajuste la apaga y la prende
    type Mus = { deseada: string | null; suena: string | null; pasos: number };
    const musica = (pg: Page): Promise<Mus> => pg.evaluate(() => (window as unknown as { __cabala: { musica: () => Mus } }).__cabala.musica());
    const suena = (pg: Page, pista: string | null): Promise<unknown> =>
      pg.waitForFunction((x) => (window as unknown as { __cabala: { musica: () => Mus } }).__cabala.musica().suena === x, pista, { timeout: 6000 });
    await suena(v, 'portada');
    const m0 = await musicaDe(v);
    await v.waitForFunction((n) => (window as unknown as { __cabala: { musica: () => Mus } }).__cabala.musica().pasos > n + 8, m0.pasos, { timeout: 6000 });
    await v.click('[data-accion="volver"]');
    await v.click('[data-accion="ajustes"]');
    // (0.28) Ajustes tiene su mezcla (la de la Colección) y entra sin cortar: mismo reloj, un solo arranque
    await suena(v, 'coleccion');
    const m1 = await musicaDe(v);
    exigir(m1.arranques === 1 && m1.reloj > m0.reloj, `al pasar de la portada a Ajustes la música se cortó (arranques ${m1.arranques}, reloj ${m0.reloj} → ${m1.reloj})`);
    await v.click('[data-accion="musica-no"]');
    await suena(v, null);
    await v.click('[data-accion="musica-si"]');
    await suena(v, 'coleccion');
    // el Bufón de la portada cantó lo que dijo (una voz registrada) y el stinger se puede pedir
    const cantaron = await v.evaluate(() => (window as unknown as { __cabala: { hablaron: string[] } }).__cabala.hablaron);
    exigir(cantaron.includes('bufon'), `el Bufón habló sin cantar (hablaron: ${cantaron.join(' ')})`);
    ok('música: la milonga suena desde el primer gesto, pasa de la portada a Ajustes sin cortarse (mismo reloj) y Ajustes → Música la apaga y la prende');
    await vivo.close();

    // las voces: el Rey que ofrece su Bendición habla letra por letra con su voz, y la pantalla cambia de pista
    const vc = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
    await vc.addInitScript('globalThis.__name = (f) => f');
    const pv = await vc.newPage();
    pv.on('pageerror', (e) => errores.push(e.message));
    await pv.goto(`${url}/?qa=elegi-bendicion&vivo&lang=${lang}`);
    await pv.waitForFunction(() => (document.querySelector('.oferta-voz [data-teclea] .dicho')?.textContent ?? '').length > 6, undefined, { timeout: 6000 });
    const voces = await pv.evaluate(() => (window as unknown as { __cabala: { hablaron: string[] } }).__cabala.hablaron);
    exigir(voces.some((x) => 'SCDH'.includes(x)), `el Rey ofreció su Bendición sin voz (hablaron: ${voces.join(' ')})`);
    await pv.mouse.click(8, 8);
    await suena(pv, 'mapa');
    await pv.goto(`${url}/?qa=mesa-rey&vivo&lang=${lang}`);
    await pv.waitForSelector('[data-mano] .carta');
    await pv.mouse.click(8, 8);
    await suena(pv, 'rey');
    ok(`voces y pistas: el Rey habla con su voz (${voces.filter((x) => 'SCDH'.includes(x)).join('')}); el botín suena a camino y el Rey tiene su galope`);
    await vc.close();
  } finally {
    await navegador.close();
  }
  exigir(!errores.length, `errores de consola: ${errores.slice(0, 3).join(' | ')}`);
  ok('sin errores de consola');
});

console.log(`\nqa:smoke (${lang}, ${mazo}) · ${hechos.length} comprobaciones en verde · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(0);
