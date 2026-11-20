// Espera, en primer plano y con tope, a que termine la última ejecución de CI de `main` y comprueba que la página
// publicada sirve la versión esperada (lo que haría `gh run watch`, sin depender de `gh`).
//   node scripts/esperar-ci.mjs [versión] [segundos]
import { readFileSync } from 'node:fs';

const version = process.argv[2] ?? JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const tope = Number(process.argv[3]) || 420;
const REPO = 'ifbotech/cabala';
const PAGINA = 'https://ifbotech.github.io/cabala/';
const dormir = (ms) => new Promise((ok) => setTimeout(ok, ms));
const t0 = Date.now();
const seg = () => Math.round((Date.now() - t0) / 1000);

let conclusion = '';
let sha = '';
while (seg() < tope) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=1&branch=main`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ci-watch' } });
  if (r.ok) {
    const run = (await r.json()).workflow_runs?.[0];
    if (run) {
      sha = run.head_sha.slice(0, 7);
      console.log(`[${seg()} s] ${run.name} · ${sha} · ${run.status}${run.conclusion ? ` · ${run.conclusion}` : ''}`);
      if (run.status === 'completed') {
        conclusion = run.conclusion;
        break;
      }
    } else console.log(`[${seg()} s] todavía no hay ejecuciones`);
  } else console.log(`[${seg()} s] la API respondió ${r.status}`);
  await dormir(20000);
}
if (conclusion !== 'success') {
  console.error(`CI no terminó en verde (${conclusion || 'sin terminar'} a los ${seg()} s).`);
  process.exit(1);
}

// la página: que responda y que su código lleve esta versión
for (let i = 0; i < 12 && seg() < tope + 120; i++) {
  const html = await fetch(`${PAGINA}?v=${Date.now()}`).then((r) => (r.ok ? r.text() : ''));
  const js = /src="([^"]+\.js)"/.exec(html)?.[1];
  if (js) {
    const codigo = await fetch(new URL(js, PAGINA)).then((r) => (r.ok ? r.text() : ''));
    if (codigo.includes(`"${version}"`) || codigo.includes(`'${version}'`) || codigo.includes(`\`${version}\``)) {
      console.log(`✓ CI en verde (${sha}) y ${PAGINA} sirve la ${version} (${seg()} s).`);
      process.exit(0);
    }
    console.log(`[${seg()} s] la página responde, pero todavía no con la ${version}`);
  } else console.log(`[${seg()} s] la página todavía no responde`);
  await dormir(10000);
}
console.error(`La página no llegó a servir la ${version}.`);
process.exit(1);
