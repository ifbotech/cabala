// Secuencias de cuadros para el Jurado Fable: lo que una foto quieta no cuenta. Cada secuencia son varios cuadros
// seguidos del mismo momento (la irrupción del Rey, su segunda cara, el Tajo de revés, la caída del Rey encadenada con
// el botín, el golpe con su conteo, el Chiche que se usa y el golpe en el paño de Postas, el contragolpe y la maldición
// del Garrote (0.26), el botín que brota sobre la mesa, el paso en el mapa), en Steam Deck y en móvil,
// en español. En Steam Deck, además, un recorrido entero con un mando virtual (la API Gamepad del navegador, leída
// por nav.ts como la de un mando de verdad): elegir, golpear, cobrar y elegir el premio sin tocar el ratón.
// Quedan en artifacts/jurado/secuencias/<ventana>-<momento>-NN.png.
//   npx tsx scripts/secuencias.ts
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { chromium, type Page } from 'playwright';
import { guardian } from './guardian';
import { letraChica, manoViva, placasHud } from './mano-viva';
import { conServidor } from './servidor';

guardian('secuencias', 290);
const SALIDA = 'artifacts/jurado/secuencias';
// (0.28) con las secuencias nuevas la corrida entera pasa del tope de 300 s: `--ventana=1280` o `--ventana=390` corre
// una sola (y borra solo sus cuadros); sin argumento corre las dos, como siempre
const soloVentana = Number(process.argv.find((a) => a.startsWith('--ventana='))?.split('=')[1]) || 0;
if (!soloVentana) rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });
if (soloVentana) for (const x of readdirSync(SALIDA)) if (x.startsWith(`${soloVentana}-`)) rmSync(`${SALIDA}/${x}`, { force: true });
const LANG = 'es';

interface Q {
  ok: boolean;
  abate: boolean;
  ejecuta: boolean;
  critico: boolean;
  aVida: number;
  contra: number | null;
  jugada: string;
  perfora?: boolean;
  sobra?: number;
}
type G = {
  __cabala: {
    sesion: { partida: { racha: number; vida: number; vidaMax: number; bendiciones: Record<string, number>; combate: { golpes: number; ultimaJugada?: string; caraDePoker?: boolean; mano: { id: string; palo: string }[]; fila: { vida: number; vidaMax: number; escudo: number; palo: string; jefe?: boolean; segunda?: boolean; aturdido?: number }[] } } };
    mejorGolpe: (p: unknown) => { ids: string[]; postas?: number[] } | null;
  };
  __mesa: {
    sincronizar: () => void;
    golpear: (ids: string[], postas?: number[]) => void;
    cuenta: (ids: string[]) => Q;
    ocupado: () => boolean;
    usarChiche: (i: number) => Promise<void>;
    mano: { elegir(ids: string[], postas?: number[]): void; seleccion(): string[] };
  };
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
    for (const [w, h] of ([[1280, 800], [390, 844]] as const).filter(([ancho]) => !soloVentana || ancho === soloVentana)) {
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
      // (0.27) `debe`: algo que TIENE que verse en algún cuadro de la ráfaga (el sello «SE PLANTA EN LA MITAD»): si no
      // sale en ninguno, la corrida falla
      const manoVista = new Set<string>();
      // (0.28) la aserción mira la PANTALLA, no el DOM: la caja ENTERA dentro de la ventana, opaca, de por lo menos
      // `anchoMin` px y sin nada encima (se le pregunta al navegador qué hay en su centro y en sus cuatro esquinas de
      // adentro). `minimo`: en cuántos cuadros seguidos de la ráfaga tiene que verse así
      const rafaga = async (nombre: string, cuadros: number, cada: number, pg: Page = p, mide = true, debe?: { sel: string; que: string; minimo?: number; anchoMin?: number; msMin?: number }): Promise<void> => {
        if (mide) await vigilar(pg);
        let visto = 0;
        // (`msMin`: cuánto tiempo de reloj tiene que pasar entre la primera y la última vez que se lo ve bien)
        let primera = 0;
        let ultima = 0;
        let porque = 'no está en el DOM';
        for (let i = 0; i < cuadros; i++) {
          if (debe) {
            const mal = await pg.evaluate(
              ({ sel, anchoMin }) => {
                const els = [...document.querySelectorAll<HTMLElement>(sel)];
                if (!els.length) return 'no está en el DOM';
                let ultimo = '';
                for (const el of els) {
                  const r = el.getBoundingClientRect();
                  const st = getComputedStyle(el);
                  if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) < 0.9) ultimo = `apagado (visibility ${st.visibility}, opacity ${st.opacity})`;
                  else if (r.width < anchoMin || r.height < 14) ultimo = `chico (${Math.round(r.width)}×${Math.round(r.height)})`;
                  else if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) ultimo = `fuera de la ventana (${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)})`;
                  else {
                    // (lo que vuela no recibe el puntero: se lo presta un instante para preguntar qué hay encima)
                    el.style.setProperty('pointer-events', 'auto', 'important');
                    const puntos = [
                      [0.5, 0.5],
                      [0.1, 0.2],
                      [0.9, 0.2],
                      [0.1, 0.8],
                      [0.9, 0.8],
                    ];
                    let tapa = '';
                    for (const [fx, fy] of puntos) {
                      const hit = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy);
                      if (hit && !el.contains(hit)) tapa = `${hit.tagName.toLowerCase()}.${String(hit.className).split(' ')[0]}`;
                    }
                    el.style.removeProperty('pointer-events');
                    if (!tapa) return '';
                    ultimo = `tapado por ${tapa}`;
                  }
                }
                return ultimo;
              },
              { sel: debe.sel, anchoMin: debe.anchoMin ?? 40 },
            );
            if (!mal) {
              visto++;
              ultima = Date.now();
              primera ||= ultima;
            }
            else if (!porque.includes(mal)) porque = porque === 'no está en el DOM' ? mal : `${porque}; ${mal}`;
          }
          await pg.screenshot({ path: `${SALIDA}/${w}-${nombre}-${String(i + 1).padStart(2, '0')}.png` });
          // (0.28) y en cada cuadro: ningún naipe posado tapa la cuenta ni queda cortado por el HUD
          if (mide)
            for (const x of [...(await pg.evaluate(manoViva, { quietas: true })), ...(await pg.evaluate(placasHud)), ...(await pg.evaluate(letraChica, { persiste: 240 }))]) {
              const clave = x.regla === 'letra-chica' ? `${x.regla}|${x.detalle.split(' se ve a ')[0]}` : `${nombre}|${x.regla}`;
              if (manoVista.has(clave)) continue;
              manoVista.add(clave);
              fallos.push(`${w} · ${nombre} (cuadro ${i + 1}): ${x.regla}: ${x.detalle}`);
            }
          await pg.waitForTimeout(cada);
        }
        if (mide) await cosechar(nombre, pg);
        if (debe?.msMin && visto >= (debe.minimo ?? 2) && ultima - primera < debe.msMin) fallos.push(`${w} · ${nombre}: ${debe.que} se vio entero y sin nada encima solo ${ultima - primera} ms (tiene que verse ${debe.msMin} ms o más)`);
        if (debe && visto < (debe.minimo ?? 2)) fallos.push(`${w} · ${nombre}: ${debe.que} se vio entero y sin nada encima en ${visto} cuadros de ${cuadros} (tiene que verse en ${debe.minimo ?? 2} o más; ${porque})`);
      };
      const mesa = async (estado: string, pg: Page = p): Promise<void> => {
        await pg.goto(`${url}/?qa=${estado}&vivo&lang=${LANG}`);
        await pg.waitForSelector('[data-mano] .carta');
        await pg.waitForFunction(() => !document.querySelector('.cortina'), undefined, { timeout: 8000 });
        await despertar(pg);
      };
      const libre = (pg: Page = p): Promise<unknown> => pg.waitForFunction(() => !(window as unknown as G).__mesa?.ocupado?.(), undefined, { timeout: 12000 });

      // 1 · el Rey irrumpe: el duelo abierto, con la Corte reducida a su último naipe y con 1 de Vida; se lo abate y la
      // ráfaga filma al Rey entrando a la mesa (su halo, su cortina y su naipe), no a la Sota que lo precede
      await mesa('rey-abre');
      await p.waitForTimeout(400);
      const entraRey = await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        const fila = x.combate.fila;
        if (!fila[fila.length - 1]?.jefe) return 'no hay Rey al fondo de la fila';
        if (fila.length > 2) fila.splice(1, fila.length - 2);
        if (fila.length < 2) return 'el Rey ya está en la mesa';
        fila[0].vida = 1;
        fila[0].escudo = 0;
        g.__mesa.sincronizar();
        const m = g.__cabala.mejorGolpe(x);
        if (!m) return 'sin golpe para la Corte';
        g.__mesa.golpear(m.ids, m.postas);
        return true;
      });
      if (entraRey !== true) fallos.push(`${w} · rey-irrumpe: ${entraRey}`);
      await p.waitForTimeout(500);
      await rafaga('rey-irrumpe', 12, 230);

      // 2 · la segunda cara (0.25: filmada de verdad): la Corte reducida a un naipe con 1 de Vida y el Rey detrás, EN SU
      // PRIMERA CARA; un golpe con Espadas abate al de adelante y lo que Perfora le sobra entra al Rey, que se planta en
      // la mitad («SE PLANTA · N SE PIERDEN»), se da vuelta y cae el cartel de su segunda cara
      await mesa('rey-abre');
      await p.waitForTimeout(500);
      const planta = await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        const fila = x.combate.fila;
        const rey = fila[fila.length - 1];
        if (!rey?.jefe) return 'no hay Rey al fondo de la fila';
        if (fila.length > 2) fila.splice(1, fila.length - 2);
        if (fila.length < 2) return 'el Rey ya está en la mesa';
        rey.segunda = false;
        rey.escudo = 0;
        fila[0].escudo = 0;
        fila[0].vida = 1;
        // (Perfora es de Espadas: ni el de adelante ni el Rey pueden ser Inmunes a Espadas —el Caudillo lo es: hace de
        // Rey de Bastos—, y la mano lleva por lo menos una)
        if (fila[0].palo === 'S') fila[0].palo = 'D';
        if (rey.palo === 'S') rey.palo = 'C';
        rey.vida = rey.vidaMax;
        const mano = x.combate.mano;
        if (!mano.some((k) => k.palo === 'S')) {
          const k = mano.find((c) => c.palo !== 'X');
          if (k) k.palo = 'S';
        }
        g.__mesa.sincronizar();
        const candidatos = [g.__cabala.mejorGolpe(x)?.ids ?? [], ...mano.filter((k) => k.palo === 'S').map((k) => [k.id])];
        const ids = candidatos.find((c) => {
          if (!c.length) return false;
          const q = g.__mesa.cuenta(c);
          return q.ok && !!q.perfora && (q.sobra ?? 0) > 1;
        });
        if (!ids) return 'sin un golpe que perfore';
        const q = g.__mesa.cuenta(ids);
        // lo que sobra cruza la mitad del Rey: se planta ahí
        rey.vida = Math.min(rey.vidaMax, Math.floor(rey.vidaMax / 2) + Math.max(1, Math.floor((q.sobra ?? 0) / 2)));
        g.__mesa.sincronizar();
        g.__mesa.golpear(ids);
        return true;
      });
      if (planta !== true) fallos.push(`${w} · rey-segunda: ${planta}`);
      await p.waitForTimeout(250);
      // (el golpe, la caída del de adelante, la entrada del Rey con su cartel y recién ahí lo que Perfora le sobra: ~5 s)
      await rafaga('rey-segunda', 26, 210, p, true, { sel: '.sello-planta', que: 'el sello «SE PLANTA EN LA MITAD · N SE PIERDEN»', minimo: 3, msMin: 600, anchoMin: w === 1280 ? 240 : 150 });

      // 2b · (0.28) el Rey se planta, filmado de frente: un golpe directo al Rey en su primera cara, que está apenas por
      // encima de la mitad: casi todo el golpe se pierde. El sello tiene que verse ≥ 600 ms de reloj (del primer al último cuadro bueno), entero
      // y sin nada encima, ANTES de que el naipe se dé vuelta
      await mesa('mesa-rey');
      await p.waitForTimeout(500);
      const sePlanta = await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        const rey = x.combate.fila[0];
        if (!rey?.jefe) return 'no hay Rey en la mesa';
        rey.segunda = false;
        rey.escudo = 0;
        rey.aturdido = 0;
        rey.vida = Math.floor(rey.vidaMax / 2) + 4;
        g.__mesa.sincronizar();
        const m = g.__cabala.mejorGolpe(x);
        if (!m) return 'sin golpe';
        const q = g.__mesa.cuenta(m.ids) as Q & { total: number; frenaEnMitad?: boolean };
        if (!q.ok || q.abate || q.ejecuta || !q.frenaEnMitad) return `el golpe no se frena en la mitad (${JSON.stringify({ ok: q.ok, abate: q.abate, total: q.total, frena: q.frenaEnMitad })})`;
        if (q.total <= 4) return `el golpe (${q.total}) no pierde nada`;
        g.__mesa.mano.elegir(m.ids, m.postas);
        (window as unknown as { __planta: { ids: string[]; postas?: number[] } }).__planta = m;
        return true;
      });
      if (sePlanta !== true) fallos.push(`${w} · rey-planta: ${sePlanta}`);
      else {
        await p.waitForTimeout(350);
        await p.screenshot({ path: `${SALIDA}/${w}-rey-planta-00.png` });
        await p.evaluate(() => {
          const g = window as unknown as G;
          const m = (window as unknown as { __planta: { ids: string[]; postas?: number[] } }).__planta;
          g.__mesa.golpear(m.ids, m.postas);
        });
        await rafaga('rey-planta', 22, 150, p, true, { sel: '.sello-planta', que: 'el sello «SE PLANTA EN LA MITAD · N SE PIERDEN»', minimo: 3, msMin: 600, anchoMin: w === 1280 ? 240 : 150 });
      }

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

      // 5b · el Chiche y el paño: el Dado Cargado vuela de la bandeja a la mano (y arma el próximo paso), después la mejor
      // jugada se apoya en sus Postas (el naipe del Medio pega doble; la Chispa y el Escalón si los hay) y se golpea
      await mesa('mesa-chiches');
      await p.waitForTimeout(600);
      await vigilar();
      await p.evaluate(() => void (window as unknown as G).__mesa.usarChiche(1));
      for (let i = 0; i < 6; i++) {
        await p.screenshot({ path: `${SALIDA}/${w}-chiche-usa-${String(i + 1).padStart(2, '0')}.png` });
        await p.waitForTimeout(110);
      }
      await cosechar('chiche-usa');
      await libre();
      const armo = await p.evaluate(() => {
        const g = window as unknown as G;
        const m = g.__cabala.mejorGolpe(g.__cabala.sesion.partida);
        if (!m) return false;
        g.__mesa.mano.elegir(m.ids, m.postas);
        (window as unknown as { __postas: { ids: string[]; postas?: number[] } }).__postas = m;
        return true;
      });
      if (!armo) fallos.push(`${w} · postas-golpe: no hay jugada para el paño`);
      else {
        await p.waitForTimeout(350);
        await p.screenshot({ path: `${SALIDA}/${w}-postas-golpe-00.png` });
        await p.evaluate(() => {
          const g = window as unknown as G;
          const m = (window as unknown as { __postas: { ids: string[]; postas?: number[] } }).__postas;
          g.__mesa.golpear(m.ids, m.postas);
        });
        await rafaga('postas-golpe', 10, 150);
      }

      // 5c · (0.26) el contragolpe: un golpe que no abate y el enemigo que te pega (el «−N» pegado a tu VIDA y a tu
      // ESCUDO, el grito, el retrato que hace la mueca)
      await mesa('mesa');
      await p.waitForTimeout(600);
      const pega = await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        x.combate.fila[0].aturdido = 0;
        x.combate.caraDePoker = false;
        g.__mesa.sincronizar();
        const ids = x.combate.mano.map((k) => [k.id]).find((c) => {
          const q = g.__mesa.cuenta(c);
          return q.ok && !q.abate && !q.ejecuta && !!q.contra && q.contra > 0;
        });
        if (!ids) return 'sin un golpe que no abata';
        g.__mesa.mano.elegir(ids);
        (window as unknown as { __pega: string[] }).__pega = ids;
        return true;
      });
      if (pega !== true) fallos.push(`${w} · contragolpe: ${pega}`);
      else {
        await p.waitForTimeout(300);
        await p.screenshot({ path: `${SALIDA}/${w}-contragolpe-00.png` });
        await p.evaluate(() => void (window as unknown as G).__mesa.golpear((window as unknown as { __pega: string[] }).__pega));
        await rafaga('contragolpe', 16, 220);
      }

      // 5d · (0.26) la maldición: el Garrote del Cacique avisa «−N de Escudo» antes de golpear y lo cobra en la caja del
      // ESCUDO después del respiro del número, antes de que te peguen
      await mesa('mesa-garrote');
      await p.waitForTimeout(600);
      await p.screenshot({ path: `${SALIDA}/${w}-maldicion-00.png` });
      await p.evaluate(() => {
        const g = window as unknown as G;
        g.__mesa.golpear(g.__mesa.mano.seleccion());
      });
      await rafaga('maldicion', 16, 220);

      // 5e · (0.28) ¡CHINCHÓN! corta la mano: los escuditos «+N» salen de cada carta sin jugar y vuelan a tu ESCUDO
      await mesa('mesa-chinchon');
      await p.waitForTimeout(600);
      await p.screenshot({ path: `${SALIDA}/${w}-chinchon-corta-00.png` });
      await p.evaluate(() => {
        const g = window as unknown as G;
        g.__mesa.golpear(g.__mesa.mano.seleccion());
      });
      // (el conteo dura ~1,5 s; los escuditos salen después del número, uno cada 70 ms)
      await p.waitForSelector('.escudo-vuela', { timeout: 9000 }).catch(() => undefined);
      await rafaga('chinchon-corta', 10, 70, p, true, { sel: '.escudo-vuela', que: 'un escudito «+N» en vuelo de la mano al ESCUDO', minimo: 1, anchoMin: 16 });
      await libre();

      // 5f · (0.28) ¡CHANCHO! con la Pierna: tres del mismo número cantan (un escalón menos que el Póker) y aturden
      await mesa('mesa-chancho');
      await p.waitForTimeout(600);
      const pierna = await p.evaluate(() => {
        const g = window as unknown as G;
        const x = g.__cabala.sesion.partida;
        const e = x.combate.fila[0];
        e.aturdido = 0;
        e.vida = e.vidaMax = Math.max(e.vidaMax, 900);
        const mano = x.combate.mano as { id: string; palo: string; n: number }[];
        const palos = ['S', 'C', 'D', 'H'].filter((k) => k !== e.palo);
        // (cartas nuevas, con id nuevo, para que la mano las dibuje de verdad)
        mano.splice(0, 3, ...palos.slice(0, 3).map((palo, i) => ({ id: `qa-pierna-${i}`, palo, n: 5 })));
        g.__mesa.sincronizar();
        const ids = mano.slice(0, 3).map((k) => k.id);
        const q = g.__mesa.cuenta(ids) as Q & { canto?: boolean };
        if (!q.ok || q.jugada !== 'pierna') return `no arma Pierna (${q.jugada})`;
        if (!q.canto) return 'la Pierna no canta';
        g.__mesa.mano.elegir(ids);
        (window as unknown as { __pierna: string[] }).__pierna = ids;
        return true;
      });
      if (pierna !== true) fallos.push(`${w} · chancho-canta: ${pierna}`);
      else {
        await p.waitForTimeout(350);
        await p.screenshot({ path: `${SALIDA}/${w}-chancho-canta-00.png` });
        await p.evaluate(() => void (window as unknown as G).__mesa.golpear((window as unknown as { __pierna: string[] }).__pierna));
        await rafaga('chancho-canta', 16, 170, p, true, { sel: '.canto-grande', que: 'el canto grande «¡CHANCHO!»', minimo: 1, anchoMin: 80 });
      }
      await libre();

      // 5g · (0.28) el Sol de la Timba cobra un descarte: sin descartes y con oro, DESCARTAR cuesta; el «−N» nace en tu ORO
      await mesa('mesa-sol');
      await p.waitForTimeout(600);
      const sol = await p.evaluate(() => {
        const g = window as unknown as G & { __mesa: { descartar(ids: string[]): Promise<void> } };
        const x = g.__cabala.sesion.partida as unknown as { oro: number; combate: { mano: { id: string }[] } };
        const ids = g.__mesa.mano.seleccion();
        const id = ids[0] ?? x.combate.mano[0]?.id;
        if (!id) return 'sin carta para descartar';
        (window as unknown as { __oroAntes: number }).__oroAntes = x.oro;
        g.__mesa.mano.elegir([id]);
        return true;
      });
      if (sol !== true) fallos.push(`${w} · sol-descarta: ${sol}`);
      else {
        await p.waitForTimeout(300);
        await p.screenshot({ path: `${SALIDA}/${w}-sol-descarta-00.png` });
        await p.evaluate(() => {
          const g = window as unknown as G & { __mesa: { descartar(ids: string[]): Promise<void> } };
          void g.__mesa.descartar(g.__mesa.mano.seleccion());
        });
        await rafaga('sol-descarta', 10, 110, p, true, { sel: '.hud-delta.hd-oro', que: 'el «−N» del descarte pagado, en tu ORO', minimo: 2, anchoMin: 30 });
        const pago = await p.evaluate(() => {
          const x = (window as unknown as G).__cabala.sesion.partida as unknown as { oro: number };
          return (window as unknown as { __oroAntes: number }).__oroAntes - x.oro;
        });
        if (!(pago > 0)) fallos.push(`${w} · sol-descarta: el descarte no costó oro (${pago})`);
      }
      await libre();

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
