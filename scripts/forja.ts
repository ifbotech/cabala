// La forja: dibuja todas las piezas del juego en láminas PNG (artifacts/forja/) para mirarlas, y pasa el linter de
// pixel-art sobre el catálogo entero.   npm run forja [-- grupo…]
import { guardian } from './guardian';
import { guardar, lamina } from './png';
import { catalogo } from '../src/client/pixel/catalogo';
import { tintas } from '../src/client/pixel/paleta';

guardian('forja', 240);
const T = tintas();
const pedidos = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const piezas = catalogo();
const grupos = [...new Set(piezas.map((p) => p.grupo))].filter((g) => !pedidos.length || pedidos.includes(g));
for (const g of grupos) {
  const del = piezas.filter((p) => p.grupo === g);
  const px = lamina(del.map((p) => ({ m: p.m, k: p.k ?? 2 })), T, { ancho: 1800, fondo: g === 'naipes' || g === 'dorsos' ? '#24112b' : '#160c1c' });
  guardar(`artifacts/forja/${g}.png`, px);
  console.log(`forja · ${g}: ${del.length} piezas → artifacts/forja/${g}.png (${px.w} × ${px.h})`);
}
process.exit(0);
