// La huella de las reglas: un resumen de todo lo que cambia el balance (el código de src/rules y los números de
// balance-config.json; no las notas de las piezas, que salen del propio laboratorio). El informe del laboratorio la guarda y las
// pruebas la comparan: si las reglas cambian, hay que volver a certificar con `npm run analyze:meta`.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';

export function huella(): string {
  const h = createHash('sha256');
  const dir = new URL('../src/rules/', import.meta.url);
  for (const f of readdirSync(dir).sort()) {
    if (f === 'notas.json') continue;
    h.update(f);
    h.update(readFileSync(new URL(f, dir), 'utf8').replace(/\r\n/g, '\n'));
  }
  return h.digest('hex').slice(0, 16);
}
