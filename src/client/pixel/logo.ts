// El logotipo «CÁBALA»: letras romanas gruesas de oro en claroscuro tramado, con su canto de carmesí que les da
// cuerpo (como un cartel de litografía). Un solo sprite de 216 × 60 celdas; la portada lo pinta a escala entera.
import { rayado, sombrear } from './dither';
import { Lienzo } from './pincel';

export const LOGO_W = 216;
export const LOGO_H = 60;
const TOP = 12;
const ALTO = 42;

type Letra = (l: Lienzo, x: number) => number;

const oro = (l: Lienzo) => {
  sombrear(l, '¤', '9zoOyY', { base: 0.64, pendiente: 1.05, borde: 3, fuerzaBorde: 0.5, brillo: 2, fuerzaBrillo: 0.35, ancho: 0.85 });
};

const C: Letra = (l, x) => {
  const cx = x + 16;
  const cy = TOP + ALTO / 2;
  l.elipse(cx, cy, 16, 21, '¤');
  l.elipse(cx + 1.5, cy, 7, 12, '.');
  l.rect(cx + 4, cy - 6, 14, 12, '.');
  // los remates de la boca
  l.rect(cx + 6, cy - 15, 9, 9, '¤').rect(cx + 6, cy + 6, 9, 9, '¤');
  l.elipse(cx + 1.5, cy, 7, 12, '.');
  oro(l);
  return 34;
};

const A = (acento: boolean): Letra => (l, x) => {
  l.poli([[x, TOP + ALTO], [x + 11, TOP], [x + 21, TOP], [x + 32, TOP + ALTO], [x + 22, TOP + ALTO], [x + 19.5, TOP + 33], [x + 12.5, TOP + 33], [x + 10, TOP + ALTO]], '¤');
  l.poli([[x + 14, TOP + 25], [x + 16, TOP + 11], [x + 18, TOP + 25]], '.');
  if (acento) l.poli([[x + 14, TOP - 3], [x + 21, TOP - 11], [x + 26, TOP - 9], [x + 19, TOP - 2]], '¤');
  oro(l);
  return 36;
};

const B: Letra = (l, x) => {
  l.elipse(x + 13, TOP + 11, 14, 11, '¤').elipse(x + 14, TOP + 31, 16, 11.5, '¤');
  for (let y = 0; y < LOGO_H; y++) for (let xx = 0; xx < x; xx++) if (l.get(xx, y) === '¤') l.set(xx, y, '.');
  l.rect(x, TOP, 12, ALTO, '¤');
  l.elipse(x + 16, TOP + 11, 5, 4.5, '.').elipse(x + 17.5, TOP + 31, 6, 4.5, '.');
  l.rect(x + 10, TOP + 7, 6, 9, '.').rect(x + 10, TOP + 27, 7, 9, '.');
  oro(l);
  return 34;
};

const Ele: Letra = (l, x) => {
  l.rect(x, TOP, 11, ALTO, '¤').rect(x, TOP + 32, 27, 10, '¤');
  l.poli([[x + 20, TOP + 32], [x + 27, TOP + 26], [x + 27, TOP + 32]], '¤');
  oro(l);
  return 31;
};

let hecho: string[] | null = null;

/** El logotipo entero. */
export function logoMapa(): string[] {
  if (hecho) return hecho;
  const l = new Lienzo(LOGO_W, LOGO_H);
  let x = 4;
  for (const letra of [C, A(true), B, A(false), Ele, A(false)]) x += letra(l, x);
  // el grabado: rayas finas del lado de la sombra, en la mitad de abajo de cada letra
  rayado(l, 'zoOyY', 'o', { angulo: '/', paso: 4, caja: [0, TOP + 24, LOGO_W - 1, TOP + ALTO], hasta: 0.5 });
  // el canto de carmesí: tres celdas de cuerpo hacia abajo y a la derecha, y una de tinta abismal
  const cuerpo = 'zoOyY9';
  for (const [paso, tinta] of [[1, 'r'], [2, 'R'], [3, 'v'], [4, '0']] as [number, string][]) {
    const marca: [number, number][] = [];
    for (let y = 0; y < LOGO_H; y++)
      for (let xx = 0; xx < LOGO_W; xx++) {
        if (l.lleno(xx, y)) continue;
        if (l.lleno(xx - paso, y - paso, cuerpo)) marca.push([xx, y]);
      }
    for (const [mx, my] of marca) l.set(mx, my, tinta);
  }
  hecho = l.mapa();
  return hecho;
}
