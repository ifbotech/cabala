// Cambia números de balance-config.json desde la consola:  node scripts/balance-set.mjs enemigos.vida.10=90 jugador.vida=70
import { readFileSync, writeFileSync } from 'node:fs';
const f = new URL('../src/rules/balance-config.json', import.meta.url);
const j = JSON.parse(readFileSync(f, 'utf8'));
for (const arg of process.argv.slice(2)) {
  const [ruta, valor] = arg.split('=');
  const claves = ruta.split('.');
  let o = j;
  for (const k of claves.slice(0, -1)) {
    if (!(k in o)) throw new Error(`no existe ${ruta}`);
    o = o[k];
  }
  const ultima = claves[claves.length - 1];
  if (!(ultima in o)) throw new Error(`no existe ${ruta}`);
  o[ultima] = JSON.parse(valor);
  console.log(`${ruta} = ${valor}`);
}
writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
