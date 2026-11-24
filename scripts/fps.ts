// QA de FPS: la mesa viva (candil, brasas, cartas flotando, retrato, Bufón) y una ráfaga de golpes con sus efectos
// tienen que correr a 60 cuadros por segundo. Mide los cuadros reales con requestAnimationFrame en dos ventanas.
//   npm run qa:fps
import { mkdirSync, writeFileSync } from 'node:fs';
import { guardian } from './guardian';
import { abrirNavegador, conServidor } from './servidor';

guardian('qa:fps', 200);
/** Mínimos: media de cuadros por segundo y parte de los cuadros que pueden pasar de 25 ms. */
const MIN_FPS = 57;
const MAX_LENTOS = 0.03;
const MAX_CUADRO = 50;
/** El cambio de pantalla tras el último golpe (botín y «ELEGÍ UNA» sobre la mesa), también en frío: sin tirones. */
const MAX_CAMBIO = 50;

interface Medida {
  fps: number;
  lentos: number;
  peor: number;
  cuadros: number;
  /** El peor cuadro del cambio de pantalla que sigue a la ráfaga (0 si el combate no terminó). */
  cambio: number;
}

const ventanas = [
  { nombre: '1366x768', w: 1366, h: 768 },
  { nombre: '1280x800', w: 1280, h: 800 }, // Steam Deck
  { nombre: '1920x1080', w: 1920, h: 1080 },
  { nombre: '390x844', w: 390, h: 844 },
];
let fallos = 0;
const lineas: string[] = [];
const decir = (l: string): void => {
  console.log(l);
  lineas.push(l);
};

await conServidor(5193, async (url) => {
  const navegador = await abrirNavegador();
  try {
    for (const v of ventanas) {
      const ctx = await navegador.newContext({ viewport: { width: v.w, height: v.h }, isMobile: v.w < 700, hasTouch: v.w < 700 });
      await ctx.addInitScript('globalThis.__name = (f) => f');
      const p = await ctx.newPage();
      await p.goto(`${url}/?qa=mesa&vivo`);
      await p.waitForSelector('html[data-qa="listo"]');
      await p.waitForSelector('.mano .carta');
      // la forja de fondo termina antes de medir (en el juego real ocurre en la portada y al elegir Mazo)
      await p.waitForFunction(() => (window as unknown as { __cabala: { porForjar: () => number } }).__cabala.porForjar() === 0, undefined, { timeout: 60000 });
      // como en el juego de verdad, antes del primer golpe ya hubo un gesto (el clic de «JUGAR»): ahí se abre el audio
      await p.mouse.click(4, 4);
      await p.waitForTimeout(600);
      const medir = (ms: number, conGolpes: boolean): Promise<Medida> =>
        p.evaluate(
          async ([dur, golpes]) => {
            const g = window as unknown as { __cabala: { sesion: { partida: unknown }; mejorGolpe: (x: unknown) => { ids: string[] } | null }; __mesa: { golpear: (ids: string[]) => Promise<void> } };
            const tiempos: number[] = [];
            let ultimo = performance.now();
            let vivo = true;
            let finRafaga = -1;
            const cuadro = (t: number) => {
              tiempos.push(t - ultimo);
              ultimo = t;
              if (vivo) requestAnimationFrame(cuadro);
            };
            requestAnimationFrame(cuadro);
            const fin = performance.now() + (dur as number);
            if (golpes) {
              // una ráfaga de golpes, uno tras otro, con todos sus efectos
              while (performance.now() < fin) {
                const m = g.__cabala.mejorGolpe(g.__cabala.sesion.partida);
                if (!m || !document.querySelector('.mano .carta')) break;
                await g.__mesa.golpear(m.ids);
                // si el combate terminó, la ráfaga terminó: lo que sigue (el botín y «ELEGÍ UNA» que brota sobre la
                // mesa) es un cambio de pantalla y se mide aparte, con su propio tope
                if (!document.querySelector('.mano .carta')) {
                  finRafaga = tiempos.length;
                  break;
                }
                await new Promise((ok) => setTimeout(ok, 250));
              }
            }
            await new Promise((ok) => setTimeout(ok, Math.max(0, fin - performance.now())));
            vivo = false;
            const trasRafaga = finRafaga >= 0 ? tiempos.slice(finRafaga) : [];
            if (finRafaga >= 0) tiempos.length = finRafaga;
            const usados = tiempos.slice(2);
            const total = usados.reduce((s, x) => s + x, 0);
            return { fps: Math.round((10000 * usados.length) / total) / 10, lentos: usados.filter((x) => x > 25).length / usados.length, peor: Math.round(Math.max(...usados)), cuadros: usados.length, cambio: trasRafaga.length ? Math.round(Math.max(...trasRafaga)) : 0 };
          },
          [ms, conGolpes] as const,
        );
      const reposo = await medir(3000, false);
      const golpes = await medir(4000, true);
      for (const [que, m] of [['reposo', reposo], ['golpes', golpes]] as const) {
        const bien = m.fps >= MIN_FPS && m.lentos <= MAX_LENTOS && m.peor <= MAX_CUADRO && m.cambio <= MAX_CAMBIO;
        if (!bien) fallos++;
        decir(`${bien ? '✓' : '✗'} ${v.nombre} · ${que.padEnd(6)} ${m.fps} fps · ${(m.lentos * 100).toFixed(1)} % de cuadros de más de 25 ms · peor cuadro ${m.peor} ms · ${m.cuadros} cuadros${m.cambio ? ` · cambio de pantalla ${m.cambio} ms` : ''}`);
      }
      await ctx.close();
    }
  } finally {
    await navegador.close();
  }
});

decir(fallos ? `\nqa:fps · ${fallos} medidas por debajo de ${MIN_FPS} fps` : `\nqa:fps · todo a 60 fps (mínimo exigido ${MIN_FPS})`);
// la última medida queda a mano del Jurado
mkdirSync('artifacts/jurado', { recursive: true });
writeFileSync('artifacts/jurado/fps.txt', [new Date().toISOString() + ' · tope por cuadro ' + MAX_CUADRO + ' ms, cambio de pantalla ' + MAX_CAMBIO + ' ms', ...lineas, ''].join(String.fromCharCode(10)));
process.exit(fallos ? 1 : 0);
