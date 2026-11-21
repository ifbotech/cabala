// Reúne los veredictos del Jurado Fable de una versión (artifacts/jurado/<versión>/*.md), los copia a la carpeta
// versionada jurado/<versión>/ y escribe RESUMEN.md con la tabla de puntajes y los defectos principales.
//   node scripts/jurado-resumen.mjs 0.14.0
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!version) {
  console.error('uso: node scripts/jurado-resumen.mjs <versión>');
  process.exit(2);
}
const origen = `artifacts/jurado/${version}`;
const destino = `jurado/${version}`;
mkdirSync(destino, { recursive: true });
const veredictos = [];
for (const f of readdirSync(origen).filter((x) => x.endsWith('.md')).sort()) {
  const texto = readFileSync(`${origen}/${f}`, 'utf8');
  writeFileSync(`${destino}/${f}`, texto);
  const m = texto.match(/```json\s*([\s\S]*?)```/);
  if (!m) {
    console.error(`sin bloque JSON: ${f}`);
    continue;
  }
  try {
    veredictos.push(JSON.parse(m[1]));
  } catch (e) {
    console.error(`JSON roto en ${f}: ${e.message}`);
  }
}
const columnas = ['claridad', 'diversion', 'estetica', 'veredicto'];
const n1 = (x) => x.toFixed(1).replace('.', ',');
const media = (c) => veredictos.reduce((s, v) => s + Number(v.puntajes[c]), 0) / Math.max(1, veredictos.length);
const lineas = [`# Jurado Fable · ${version}`, '', `${veredictos.length} jurados. Puntajes de 1 a 10.`, '', '| Jurado | Claridad | Diversión | Estética | Veredicto |', '|---|---|---|---|---|'];
for (const v of veredictos) lineas.push(`| ${v.jurado} | ${columnas.map((c) => n1(Number(v.puntajes[c]))).join(' | ')} |`);
lineas.push(`| **Media** | ${columnas.map((c) => `**${n1(media(c))}**`).join(' | ')} |`, '', '## Defectos principales', '');
const orden = { P0: 0, P1: 1, P2: 2 };
const defectos = veredictos.flatMap((v) => (v.defectos ?? []).map((d) => ({ ...d, jurado: v.jurado }))).sort((a, b) => (orden[a.prioridad] ?? 9) - (orden[b.prioridad] ?? 9));
for (const d of defectos) lineas.push(`- **${d.prioridad}** · ${d.jurado} · ${d.pantalla} (${d.ventana}) — ${d.que} _Dónde:_ \`${d.archivo}\`.`);
lineas.push('');
writeFileSync(`${destino}/RESUMEN.md`, lineas.join('\n'));
console.log(lineas.slice(4, 6 + veredictos.length + 1).join('\n'));
