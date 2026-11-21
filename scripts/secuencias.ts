// Secuencias de cuadros para el Jurado Fable: lo que una foto quieta no cuenta. Cada secuencia son varios cuadros
// seguidos del mismo momento (el golpe con su conteo, el Rey que irrumpe, el botín que brota sobre la mesa, el paso
// en el mapa), en Steam Deck y en móvil. Quedan en artifacts/jurado/secuencias/<ventana>-<momento>-NN.png.
//   npx tsx scripts/secuencias.ts
import { mkdirSync, rmSync } from 'node:fs';
import { chromium, type Page } from 'playwright';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('secuencias', 280);
const SALIDA = 'artifacts/jurado/secuencias';
rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });

type G = {
  __cabala: { sesion: { partida: { racha: number; combate: { fila: { vida: number; escudo: number }[] } } }; mejorGolpe: (p: unknown) => { ids: string[] } | null };
  __mesa: { sincronizar: () => void; golpear: (ids: string[]) => void; mano: { elegir(ids: string[]): void } };
};

await conServidor(5198, async (url) => {
  const navegador = await chromium.launch();
  try {
    for (const [w, h] of [[1280, 800], [390, 844]] as const) {
      const ctx = await navegador.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500 });
      await ctx.addInitScript('globalThis.__name = (f) => f');
      const p = await ctx.newPage();
      const rafaga = async (nombre: string, cuadros: number, cada: number): Promise<void> => {
        for (let i = 0; i < cuadros; i++) {
          await p.screenshot({ path: `${SALIDA}/${w}-${nombre}-${String(i + 1).padStart(2, '0')}.png` });
          await p.waitForTimeout(cada);
        }
      };
      const mesa = async (estado: string, pg: Page = p): Promise<void> => {
        await pg.goto(`${url}/?qa=${estado}&vivo`);
        await pg.waitForSelector('[data-mano] .carta');
        await pg.waitForFunction(() => !document.querySelector('.cortina'), undefined, { timeout: 8000 });
      };

      // 1 · el Rey irrumpe: desde que se abre el combate
      await p.goto(`${url}/?qa=mesa-rey&vivo`);
      await p.waitForSelector('.mesa');
      await rafaga('rey-irrumpe', 7, 260);

      // 1b · la caída del Rey, entera: fogonazo, última frase, rajadura y lluvia de monedas
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
      await p.waitForTimeout(900);
      await rafaga('rey-cae', 10, 380);

      // 2 · el golpe: elegir, conteo en cadena, daño, respuesta del enemigo
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

      // 3 · el último enemigo cae: el oro vuela y «ELEGÍ UNA» brota sobre la mesa
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
      await rafaga('botin-brota', 9, 300);

      // 4 · un paso en el mapa
      await p.goto(`${url}/?qa=mapa&vivo`);
      await p.waitForSelector('.nodo.abierto');
      await p.waitForTimeout(900);
      await p.screenshot({ path: `${SALIDA}/${w}-mapa-paso-00.png` });
      await p.locator('.nodo.abierto').first().click();
      await rafaga('mapa-paso', 6, 220);

      // 5 · la portada entrando en frío
      await p.goto(`${url}/?perfil=nuevo`);
      await p.waitForSelector('.portada');
      await rafaga('portada', 5, 220);
      await ctx.close();
    }
  } finally {
    await navegador.close();
  }
});
console.log(`secuencias · cuadros en ${SALIDA}`);
process.exit(0);
