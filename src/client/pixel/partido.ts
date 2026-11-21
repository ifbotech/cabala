// Un dibujo partido en dos por una grieta en zigzag, a celda entera: la mitad de la izquierda o la de la derecha, del
// mismo tamaño que el dibujo entero (lo que queda del otro lado, vacío). El filo de la rajadura se oscurece una celda
// (el papel del naipe se rasga en hueso y la tinta cae al abismo). Lo usan los finales: los Reyes vencidos quedan
// tirados en dos mitades, y en la derrota el que se parte es tu retrato. Es la rajadura de la mesa, quieta.
import { Lienzo } from './pincel';
import type { Mapa } from './rejilla';

/** La columna de la grieta en la fila `y`: zigzag de dientes de `paso` filas alrededor del medio. */
function corte(w: number, h: number, y: number, semilla: number): number {
  const paso = Math.max(6, Math.round(h / 9));
  const tramo = Math.floor(y / paso);
  const f = (y % paso) / paso;
  const amp = Math.max(2, Math.round(w * 0.09));
  // cada diente va a un lado y a otro; la semilla corre la grieta un poco para que no sean todas iguales
  const lado = (tramo + semilla) % 2 ? 1 : -1;
  const de = lado * amp * (0.5 + 0.5 * ((tramo * 7 + semilla * 3) % 3) / 2);
  const a = -lado * amp * 0.6;
  return Math.round(w / 2 + (semilla % 3) - 1 + de + (a - de) * f);
}

/** La mitad `lado` de un dibujo partido por una grieta en zigzag. */
export function mitad(m: Mapa, lado: 'izq' | 'der', semilla = 0): string[] {
  const l = Lienzo.de(m);
  const { w, h } = l;
  for (let y = 0; y < h; y++) {
    const c = corte(w, h, y, semilla);
    for (let x = 0; x < w; x++) {
      const fuera = lado === 'izq' ? x >= c : x < c;
      if (fuera) {
        l.set(x, y, '.');
        continue;
      }
      // el filo de la rajadura: el papel se rasga en hueso; lo demás cae a la sombra abismal
      const filo = lado === 'izq' ? x === c - 1 : x === c;
      if (filo && l.get(x, y) !== '.') l.set(x, y, 'mwh'.includes(l.get(x, y)) ? 'h' : '9');
    }
  }
  return l.mapa();
}
