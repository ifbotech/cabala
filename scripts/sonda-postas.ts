// Sonda temporal: posiciones de la mano y el paño en una ventana (npx tsx scripts/sonda-postas.ts 1280 800 mesa-seleccion)
import { chromium } from 'playwright';
import { conServidor } from './servidor';

const [w, h, estado] = [Number(process.argv[2] ?? 1280), Number(process.argv[3] ?? 800), process.argv[4] ?? 'mesa-seleccion'];
await conServidor(5199, async (url) => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript('globalThis.__name = (f) => f');
  const p = await ctx.newPage();
  await p.goto(`${url}/?qa=${estado}`);
  await p.waitForSelector('[data-mano] .carta');
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const m = document.querySelector('[data-mano]')!;
    const mr = m.getBoundingClientRect();
    const out = [`mano ${Math.round(mr.top)}..${Math.round(mr.bottom)} h=${m.clientHeight} asoma=${getComputedStyle(m).getPropertyValue('--asoma')} cls=${m.className}`];
    for (const c of m.querySelectorAll('.carta')) {
      const r = c.getBoundingClientRect();
      out.push(`${(c as HTMLElement).dataset.id} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} z=${(c as HTMLElement).style.zIndex} ${c.className}`);
    }
    return out.join('\n');
  });
  console.log(r);
  await b.close();
});
