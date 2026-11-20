// QA de FPS: la mesa viva (candil, brasas, cartas flotando, retrato, Bufón) y una ráfaga de golpes con sus efectos
// tienen que correr a 60 cuadros por segundo. Mide los cuadros reales con requestAnimationFrame en dos ventanas.
//   npm run qa:fps
import { chromium } from 'playwright';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('qa:fps', 200);
/** Mínimos: media de cuadros por segundo y parte de los cuadros que pueden pasar de 25 ms. */
const MIN_FPS = 57;
const MAX_LENTOS = 0.03;
const MAX_CUADRO = 80;

interface Medida {
  fps: number;
  lentos: number;
  peor: number;
  cuadros: number;
}

const ventanas = [
  { nombre: '1366x768', w: 1366, h: 768 },
  { nombre: '1920x1080', w: 1920, h: 1080 },
  { nombre: '390x844', w: 390, h: 844 },
];
let fallos = 0;

await conServidor(5193, async (url) => {
  // con la GPU de verdad (el Chromium nuevo sin cabecera sobre ANGLE/D3D11): es donde corre el juego
  const navegador = await chromium.launch({ channel: 'chromium', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-zero-copy'] });
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
                await new Promise((ok) => setTimeout(ok, 250));
              }
            }
            await new Promise((ok) => setTimeout(ok, Math.max(0, fin - performance.now())));
            vivo = false;
            const usados = tiempos.slice(2);
            const total = usados.reduce((s, x) => s + x, 0);
            return { fps: Math.round((10000 * usados.length) / total) / 10, lentos: usados.filter((x) => x > 25).length / usados.length, peor: Math.round(Math.max(...usados)), cuadros: usados.length };
          },
          [ms, conGolpes] as const,
        );
      const reposo = await medir(3000, false);
      const golpes = await medir(4000, true);
      for (const [que, m] of [['reposo', reposo], ['golpes', golpes]] as const) {
        const bien = m.fps >= MIN_FPS && m.lentos <= MAX_LENTOS && m.peor <= MAX_CUADRO;
        if (!bien) fallos++;
        console.log(`${bien ? '✓' : '✗'} ${v.nombre} · ${que.padEnd(6)} ${m.fps} fps · ${(m.lentos * 100).toFixed(1)} % de cuadros de más de 25 ms · peor cuadro ${m.peor} ms · ${m.cuadros} cuadros`);
      }
      await ctx.close();
    }
  } finally {
    await navegador.close();
  }
});

console.log(fallos ? `\nqa:fps · ${fallos} medidas por debajo de ${MIN_FPS} fps` : `\nqa:fps · todo a 60 fps (mínimo exigido ${MIN_FPS})`);
process.exit(fallos ? 1 : 0);
