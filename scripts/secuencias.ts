// Secuencias de cuadros para el Jurado Fable: lo que una foto quieta no cuenta. Cada secuencia son varios cuadros
// seguidos del mismo momento (la irrupción del Rey, su segunda cara, el Tajo de revés, la caída del Rey encadenada con
// el botín, el golpe con su conteo, el botín que brota sobre la mesa, el paso en el mapa), en Steam Deck y en móvil,
// en español. En Steam Deck, además, un recorrido entero con un mando virtual (la API Gamepad del navegador, leída
// por nav.ts como la de un mando de verdad): elegir, golpear, cobrar y elegir el premio sin tocar el ratón.
// Quedan en artifacts/jurado/secuencias/<ventana>-<momento>-NN.png.
//   npx tsx scripts/secuencias.ts
import { mkdirSync, rmSync } from 'node:fs';
import { chromium, type Page } from 'playwright';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('secuencias', 290);
const SALIDA = 'artifacts/jurado/secuencias';
rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });
const LANG = 'es';

interface Q {
  ok: boolean;
  abate: boolean;
  ejecuta: boolean;
  critico: boolean;
  aVida: number;
  contra: number | null;
  jugada: string;
}
type G = {
  __cabala: {
    sesion: { partida: { racha: number; vida: number; vidaMax: number; bendiciones: Record<string, number>; combate: { golpes: number; ultimaJugada?: string; mano: { id: string; palo: string }[]; fila: { vida: number; vidaMax: number; escudo: number; palo: string; jefe?: boolean; segunda?: boolean }[] } } };
    mejorGolpe: (p: unknown) => { ids: string[] } | null;
  };
  __mesa: { sincronizar: () => void; golpear: (ids: string[]) => void; cuenta: (ids: string[]) => Q; ocupado: () => boolean; mano: { elegir(ids: string[]): void } };
  __pad?: { pulsar(i: number, ms?: number): void };
};

/** Un mando virtual: `navigator.getGamepads()` devuelve uno conectado cuyos botones aprieta `__pad.pulsar(i)`. */
const MANDO_VIRTUAL = `(() => {
  const suelto = () => ({ pressed: false, touched: false, value: 0 });
  const pad = { id: 'Mando virtual (QA)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, suelto) };
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [pad] });
  window.__pad = {
    pulsar(i, ms = 90) {
      pad.buttons[i] = { pressed: true, touched: true, value: 1 };
      pad.timestamp = performance.now();
      setTimeout(() => { pad.buttons[i] = suelto(); pad.timestamp = performance.now(); }, ms);
    },
  };
})();`;
const BOTON = { A: 0, B: 1, X: 2, Y: 3, ARRIBA: 12, ABAJO: 13, IZQUIERDA: 14, DERECHA: 15 } as const;

/** Lo que la medición de solapes en movimiento encontró (falla la corrida). */
const fallos: string[] = [];

await conServidor(5198, async (url) => {
  const navegador = await chromium.launch();
  try {
    for (const [w, h] of [[1280, 800], [390, 844]] as const) {
      const ctx = await navegador.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, locale: 'es-AR' });
      await ctx.addInitScript('globalThis.__name = (f) => f');
      // en Steam Deck todo se graba con el mando (los glifos y el foco que vería quien juega con él)
      if (w === 1280) await ctx.addInitScript(MANDO_VIRTUAL);
      const p = await ctx.newPage();
      /** El primer toque del mando: despierta los glifos del mando y pone el foco en lo principal. */
      const despertar = async (pg: Page = p): Promise<void> => {
        if (w !== 1280) return;
        await pg.evaluate((i) => (window as unknown as G).__pad?.pulsar(i), BOTON.ABAJO);
        await pg.waitForTimeout(120);
      };
      /**
       * La medición de solapes en movimiento: mientras dura la ráfaga, en cada cuadro de la página se le pregunta al
       * director de escena si algo de lo que vuela (número, canto, cartel, rótulo, bocadillo, grito) se pisa con otra
       * capa o con una zona prohibida (los sellos, el total, la Vida y el Escudo propios).
       */
      const vigilar = (pg: Page = p): Promise<void> =>
        pg.evaluate(() => {
          const g = window as unknown as { __vigila?: boolean; __solapes?: string[]; __director?: { solapes(): string[] } };
          g.__solapes = [];
          g.__vigila = true;
          const vistos = new Set<string>();
          const paso = (): void => {
            if (!g.__vigila) return;
            for (const s of g.__director?.solapes() ?? []) {
              const clave = s.replace(/[\d.,×-]+/g, '#');
              if (vistos.has(clave)) continue;
              vistos.add(clave);
              g.__solapes!.push(s);
            }
            requestAnimationFrame(paso);
          };
          requestAnimationFrame(paso);
        });
      const cosechar = async (nombre: string, pg: Page = p): Promise<void> => {
        const xs = await pg.evaluate(() => {
          const g = window as unknown as { __vigila?: boolean; __solapes?: string[] };
          g.__vigila = false;
          return g.__solapes ?? [];
        });
        for (const x of xs) fallos.push(`${w} · ${nombre}: ${x}`);
      };
      const rafaga = async (nombre: string, cuadros: number, cada: number, pg: Page = p, mide = true): Promise<void> => {
        if (mide) await vigilar(pg);
        for (let i = 0; i < cuadros; i++) {
          await pg.screenshot({ path: `${SALIDA}/${w}-${nombre}-${String(i + 1).padStart(2, '0')}.png` });
          await pg.waitForTimeout(cada);
        }
        if (mide) await cosechar(nombre, pg);
      };
      const mesa = async (estado: string, pg: Page = p): Promise<void> => {
        await pg.goto(`${url}/?qa=${estado}&vivo&lang=${LANG}`);
        await pg.waitForSelector('[data-mano] .carta');
        await pg.waitForFunction(() => !document.querySelector('.cortina'), undefined, { timeout: 8000 });
        await despertar(pg);
      };
      const libre = (pg: Page = p): Promise<unknown> => pg.waitForFunction(() => !(window as unknown as G).__mesa?.ocupado?.(), undefined, { timeout: 12000 });

      // 1 · el Rey irrumpe: el duelo recién abierto, desde el primer cuadro
      await p.goto(`${url}/?qa=rey-abre&vivo&lang=${LANG}`);
      await p.waitForSelector('.mesa');
      await despertar();
      await rafaga('rey-irrumpe', 8, 230);

      // 2 · la segunda cara: un golpe que lo deja a media Vida (sin matarlo); el naipe se da vuelta y cae el cartel
      await mesa('mesa-rey');
      await p.waitForTimeout(500);
      await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        const e = x.combate.fila[0];
        e.escudo = 0;
        const candidatos = [g.__cabala.mejorGolpe(x)?.ids ?? [], ...x.combate.mano.map((k) => [k.id])];
        const ids = candidatos.find((c) => {
          const q = g.__mesa.cuenta(c);
          return c.length && q.ok && q.aVida > 0 && q.aVida < e.vidaMax - 1;
        });
        if (!ids) return;
        const a = g.__mesa.cuenta(ids).aVida;
        e.vida = Math.min(e.vidaMax, a * 2 < e.vidaMax ? Math.floor(e.vidaMax / 2 + a / 2) : a + 1);
        g.__mesa.sincronizar();
        g.__mesa.golpear(ids);
      });
      await p.waitForTimeout(250);
      await rafaga('rey-segunda', 12, 170);

      // 3 · el Tajo de revés: repetir la jugada contra el Caudillo en segunda cara. Primero el aviso antes de soltar
      // (el chip rojo junto a TE PEGA y el ×2 del Rey), después el golpe que vuelve doble y atraviesa el Escudo. La
      // Carta sola no arma el Tajo (repiteJugada): se repite un Par (dos Pares seguidos); si la mano no tiene uno,
      // se arma con dos cartas fuera de Espadas (el Caudillo es Inmune a Espadas)
      await libre();
      await p.waitForFunction(() => document.querySelectorAll('[data-mano] .carta').length >= 2, undefined, { timeout: 6000 }).catch(() => undefined);
      await p.waitForTimeout(600);
      const hayTajo = await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        const e = x.combate?.fila[0];
        if (!e?.jefe) return 'no hay Rey en la mesa';
        // (es una secuencia de QA: el Rey de la mesa hace de Caudillo en segunda cara si no lo era)
        e.palo = 'S';
        e.segunda = true;
        e.escudo = 0;
        e.vida = Math.max(e.vida, Math.floor(e.vidaMax * 0.45));
        x.vida = x.vidaMax;
        const mano = x.combate.mano as { id: string; palo: string; n: number }[];
        const sirve = (c: string[]): boolean => {
          const q = g.__mesa.cuenta(c);
          return q.ok && q.jugada === 'par' && !q.ejecuta;
        };
        // el Par no lo tiene que matar: el Rey queda con la Vida justa para aguantarlo (y pegar de vuelta)
        const aguanta = (c: string[]): boolean => {
          const q = g.__mesa.cuenta(c) as Q & { total: number };
          if (q.abate) {
            // (con el Crítico el Par puede pasar la Vida entera del Rey: entonces el Rey de la secuencia es más grande)
            e.vidaMax = Math.max(e.vidaMax, Math.ceil(q.total * 1.25));
            e.vida = Math.min(e.vidaMax, q.total + Math.ceil(e.vidaMax * 0.1));
            g.__mesa.sincronizar();
          }
          const r = g.__mesa.cuenta(c);
          return r.ok && !r.abate && !r.ejecuta && !!r.contra && r.contra > 0;
        };
        const pares: string[][] = [];
        for (let i = 0; i < mano.length; i++) for (let j = i + 1; j < mano.length; j++) pares.push([mano[i].id, mano[j].id]);
        let ids = pares.find(sirve);
        if (!ids && mano.length >= 2) {
          // cartas nuevas (ids nuevos), para que la mano las dibuje de verdad
          mano.splice(0, 2, { id: 'qa-par-oros', palo: 'D', n: 3 }, { id: 'qa-par-copas', palo: 'H', n: 3 });
          g.__mesa.sincronizar();
          ids = sirve([mano[0].id, mano[1].id]) ? [mano[0].id, mano[1].id] : undefined;
        }
        if (!ids) return `sin Par que arme el Tajo (mano ${mano.length}: ${JSON.stringify(g.__mesa.cuenta([mano[0]?.id, mano[1]?.id].filter(Boolean)))})`;
        // y el Crítico de Punta y hacha cae en este golpe: el estallido del MULTI se ve en movimiento
        x.bendiciones.puntahacha = 3;
        const golpes = x.combate.golpes;
        for (let n = 0; n < 8 && !g.__mesa.cuenta(ids).critico; n++) x.combate.golpes = golpes + n;
        if (!g.__mesa.cuenta(ids).critico) return 'el Crítico de Punta y hacha no cae en este golpe';
        if (!aguanta(ids)) return 'el Par abate al Rey aun con la Vida corregida';
        x.combate.ultimaJugada = g.__mesa.cuenta(ids).jugada;
        g.__mesa.sincronizar();
        g.__mesa.mano.elegir(ids);
        (window as unknown as { __tajo: string[] }).__tajo = ids;
        return true;
      });
      // (la ráfaga del Tajo con Crítico es obligatoria: si no se arma, la corrida falla)
      if (hayTajo !== true) fallos.push(`${w} · rey-tajo: no se armó (${hayTajo})`);
      if (hayTajo === true) {
        await p.waitForTimeout(400);
        await p.screenshot({ path: `${SALIDA}/${w}-rey-tajo-00.png` });
        await p.evaluate(() => void (window as unknown as G).__mesa.golpear((window as unknown as { __tajo: string[] }).__tajo));
        await rafaga('rey-tajo', 12, 160);
      }

      // 4 · la caída del Rey encadenada con el botín: fogonazo, última frase, rajadura con su remate, la fanfarria
      // después, la mesa que se despeja, el oro que vuela al HUD contando, el botín al centro y la elección en su lugar
      await mesa('mesa-rey');
      await p.waitForTimeout(500);
      await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        x.combate.fila[0].vida = 1;
        x.combate.fila[0].escudo = 0;
        g.__mesa.sincronizar();
        const m = g.__cabala.mejorGolpe(x);
        if (m) g.__mesa.golpear(m.ids);
      });
      await p.waitForTimeout(700);
      await rafaga('rey-cae', 18, 330);

      // 5 · el golpe: elegir, conteo en cadena, daño, respuesta del enemigo
      await mesa('mesa');
      await p.waitForTimeout(700);
      await p.evaluate(() => {
        const g = window as unknown as G;
        const m = g.__cabala.mejorGolpe(g.__cabala.sesion.partida);
        if (m) g.__mesa.mano.elegir(m.ids);
      });
      await p.waitForTimeout(250);
      await p.screenshot({ path: `${SALIDA}/${w}-golpe-00.png` });
      await p.evaluate(() => {
        const g = window as unknown as G;
        const m = g.__cabala.mejorGolpe(g.__cabala.sesion.partida);
        if (m) g.__mesa.golpear(m.ids);
      });
      await rafaga('golpe', 9, 150);

      // 6 · el último enemigo de un combate común cae: lo mismo que el Rey, más corto
      await mesa('mesa');
      await p.waitForTimeout(600);
      await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        x.combate.fila.splice(1);
        x.combate.fila[0].vida = 1;
        x.combate.fila[0].escudo = 0;
        g.__mesa.sincronizar();
        const m = g.__cabala.mejorGolpe(x);
        if (m) g.__mesa.golpear(m.ids);
      });
      await rafaga('botin-brota', 12, 260);

      // 7 · un paso en el mapa
      await p.goto(`${url}/?qa=mapa&vivo&lang=${LANG}`);
      await p.waitForSelector('.nodo.abierto');
      await p.waitForTimeout(900);
      await despertar();
      await p.screenshot({ path: `${SALIDA}/${w}-mapa-paso-00.png` });
      // (en Steam Deck, con el mando: el foco ya está en el primer nodo abierto y A lo pisa)
      if (w === 1280) await p.evaluate((i) => (window as unknown as G).__pad?.pulsar(i), BOTON.A);
      else await p.locator('.nodo.abierto').first().click();
      await rafaga('mapa-paso', 6, 220, p, false);

      // 8 · la portada entrando en frío
      await p.goto(`${url}/?perfil=nuevo&lang=${LANG}`);
      await p.waitForSelector('.portada');
      await despertar();
      await rafaga('portada', 5, 220, p, false);
      await ctx.close();

      // 9 · con mando (solo en Steam Deck): la cruceta busca una carta que pegue, A la elige, X golpea; la mesa se
      // despeja, cobra y el botín brota; A elige el premio
      if (w !== 1280) continue;
      const cm = await navegador.newContext({ viewport: { width: w, height: h }, locale: 'es-AR' });
      await cm.addInitScript('globalThis.__name = (f) => f');
      await cm.addInitScript(MANDO_VIRTUAL);
      const pm = await cm.newPage();
      const pulsar = async (b: number, espera = 220): Promise<void> => {
        await pm.evaluate((i) => (window as unknown as G).__pad?.pulsar(i), b);
        await pm.waitForTimeout(espera);
      };
      await mesa('mesa', pm);
      await pm.waitForTimeout(500);
      // el último enemigo, con poca Vida; ¿cuántos pasos de cruceta hasta la primera carta a la que no es Inmune?
      const pasos = await pm.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        x.combate.fila.splice(1);
        x.combate.fila[0].vida = 2;
        x.combate.fila[0].escudo = 0;
        g.__mesa.sincronizar();
        const palo = x.combate.fila[0].palo;
        const cartas = [...document.querySelectorAll<HTMLElement>('[data-mano] .carta')];
        return Math.max(0, cartas.findIndex((c) => c.dataset.palo !== palo));
      });
      // el primer toque del mando lo despierta (los glifos pasan a ser los del mando) y pone el foco en la mano
      await pulsar(BOTON.ABAJO, 300);
      await pm.screenshot({ path: `${SALIDA}/${w}-mando-00.png` });
      await pm.evaluate(() => (document.querySelector<HTMLElement>('[data-mano] .carta') ?? document.body).focus());
      for (let i = 0; i < pasos; i++) await pulsar(BOTON.DERECHA);
      await pulsar(BOTON.A, 350);
      await pm.screenshot({ path: `${SALIDA}/${w}-mando-01.png` });
      await pulsar(BOTON.X, 60);
      for (let i = 2; i < 18; i++) {
        await pm.screenshot({ path: `${SALIDA}/${w}-mando-${String(i).padStart(2, '0')}.png` });
        await pm.waitForTimeout(260);
      }
      // la elección del premio, con el mando
      await pm.waitForSelector('.velo .opcion', { timeout: 8000 }).catch(() => undefined);
      await pulsar(BOTON.DERECHA, 300);
      await pm.screenshot({ path: `${SALIDA}/${w}-mando-18.png` });
      await pulsar(BOTON.A, 300);
      await rafaga('mando-elige', 4, 260, pm);
      await cm.close();
    }
  } finally {
    await navegador.close();
  }
});
console.log(`secuencias · cuadros en ${SALIDA}`);
if (fallos.length) {
  console.log(`\nsolapes en movimiento (${fallos.length}):`);
  for (const f of fallos.slice(0, 40)) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('solapes en movimiento: ninguno');
process.exit(0);
