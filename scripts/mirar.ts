// Fotos de momentos vivos, que la QA visual (que fotografía todo quieto) no ve: la portada entrando, el grito del
// Personaje, el Rey que cae y habla, el Fogón en suspenso. Deja las fotos en artifacts/mirar para revisarlas a ojo.
//   npx tsx scripts/mirar.ts
import { mkdirSync } from 'node:fs';
import { chromium, type Page } from 'playwright';
import { guardian } from './guardian';
import { conServidor } from './servidor';

guardian('mirar', 200);
const SALIDA = 'artifacts/mirar';
mkdirSync(SALIDA, { recursive: true });

await conServidor(5197, async (url) => {
  const navegador = await chromium.launch();
  try {
    for (const [w, h] of [[1280, 800], [390, 844]] as const) {
      const ctx = await navegador.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500 });
      await ctx.addInitScript('globalThis.__name = (f) => f');
      const p = await ctx.newPage();
      const foto = (nombre: string) => p.screenshot({ path: `${SALIDA}/${w}-${nombre}.png` });
      const listo = (pg: Page) => pg.waitForFunction(() => !document.querySelector('.cortina'), undefined, { timeout: 8000 });

      await p.goto(`${url}/?perfil=nuevo`);
      await p.waitForSelector('.portada [data-accion="jugar"]');
      await p.waitForTimeout(140);
      await foto('portada-entrando');

      await p.goto(`${url}/?qa=mesa&vivo`);
      await p.waitForSelector('[data-mano] .carta');
      await listo(p);
      await p.waitForTimeout(700);
      await p.evaluate(() => (window as unknown as { __mesa: { gritar: (t: string) => void } }).__mesa.gritar('¡ESCOBA!'));
      await p.waitForTimeout(350);
      await foto('mesa-grito');

      await p.goto(`${url}/?qa=mesa-rey&vivo`);
      await p.waitForSelector('[data-mano] .carta');
      await listo(p);
      await p.waitForTimeout(500);
      await p.evaluate(() => {
        const g = (window as unknown as { __cabala: { sesion: { partida: { combate: { fila: { vida: number; escudo: number }[] } } }; mejorGolpe: (p: unknown) => { ids: string[] } | null }; __mesa: { sincronizar: () => void; golpear: (ids: string[]) => void } });
        const x = g.__cabala.sesion.partida;
        x.combate.fila[0].vida = 1;
        x.combate.fila[0].escudo = 0;
        g.__mesa.sincronizar();
        const m = g.__cabala.mejorGolpe(x);
        if (m) g.__mesa.golpear(m.ids);
      });
      await p.waitForSelector('.e-dice', { timeout: 6000 }).catch(() => undefined);
      await p.waitForTimeout(650);
      await foto('rey-cae');

      await p.goto(`${url}/?qa=fogon&vivo`);
      await p.waitForSelector('[data-accion="templar"]');
      await p.waitForTimeout(900);
      await p.click('[data-accion="templar"]');
      await p.locator('.visor button.visor-carta').first().click();
      await p.waitForTimeout(260);
      await foto('fogon-templada');
      if (await p.locator('[data-accion="arrimar"]').count()) {
        await p.click('[data-accion="arrimar"]');
        await p.waitForTimeout(420);
        await foto('fogon-suspenso');
        await p.waitForTimeout(650);
        await foto('fogon-despues');
      }
      await ctx.close();
    }
  } finally {
    await navegador.close();
  }
});
console.log(`mirar · fotos en ${SALIDA}`);
process.exit(0);
