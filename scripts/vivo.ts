// Comprueba el sitio publicado con un navegador de verdad: carga la portada, entra a una partida hasta la mesa y
// revisa que no haya errores de consola ni recursos rotos. Guarda una captura en artifacts/vivo.png.
//   npx tsx scripts/vivo.ts [url]
import { chromium } from 'playwright';
import { guardian } from './guardian';

guardian('vivo', 120);
const url = process.argv[2] ?? 'https://ifbotech.github.io/cabala/';
const navegador = await chromium.launch();
const errores: string[] = [];
try {
  const p = await navegador.newPage({ viewport: { width: 1366, height: 768 } });
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  p.on('response', (r) => r.status() >= 400 && errores.push(`${r.status()} ${r.url()}`));
  await p.goto(`${url}?rapido`, { waitUntil: 'networkidle' });
  await p.waitForSelector('.portada [data-accion="jugar"]');
  const version = await p.locator('.pie .sub').textContent();
  await p.click('[data-accion="jugar"]');
  await p.waitForSelector('.elegir');
  await p.click('[data-accion="jugar"]');
  await p.waitForSelector('.oferta .opcion');
  await p.locator('.oferta .opcion').first().click();
  await p.waitForSelector('.nodo.abierto');
  await p.locator('.nodo.abierto').first().click();
  await p.waitForSelector('.mano .carta');
  await p.screenshot({ path: 'artifacts/vivo.png' });
  const cartas = await p.locator('.mano .carta').count();
  if (errores.length) throw new Error(`errores en el sitio publicado: ${errores.slice(0, 4).join(' | ')}`);
  console.log(`✓ ${url} · ${version?.trim()} · portada → Mazo → Cábala → Mapa → mesa con ${cartas} cartas, sin errores`);
} finally {
  await navegador.close();
}
process.exit(0);
