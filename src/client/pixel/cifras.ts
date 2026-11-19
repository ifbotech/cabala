// Los números del juego, dibujados a mano en una rejilla de 10 × 16 celdas: numerales gruesos de naipe español.
// Sirven para el índice de las cartas (en la tinta de su palo) y, con su claroscuro, para las cifras del HUD, la
// cuenta DAÑO × MULTI = TOTAL, la Vida de los enemigos y los números de daño que saltan de la mesa.
import { Lienzo } from './pincel';
import type { Mapa } from './rejilla';

export const CIFRA_W = 10;
export const CIFRA_H = 16;

const G: Record<string, string[]> = {
  '0': ['..XXXXXX..', '.XXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXX.', '..XXXXXX..'],
  '1': ['....XXX...', '...XXXX...', '..XXXXX...', '.XXXXXX...', '....XXX...', '....XXX...', '....XXX...', '....XXX...', '....XXX...', '....XXX...', '....XXX...', '....XXX...', '....XXX...', '....XXX...', '.XXXXXXXX.', '.XXXXXXXX.'],
  '2': ['..XXXXXX..', '.XXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', '.......XXX', '.......XXX', '......XXXX', '.....XXXX.', '....XXXX..', '...XXXX...', '..XXXX....', '.XXXX.....', 'XXXX......', 'XXX.......', 'XXXXXXXXXX', 'XXXXXXXXXX'],
  '3': ['..XXXXXX..', '.XXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', '.......XXX', '.......XXX', '......XXXX', '...XXXXXX.', '...XXXXXX.', '......XXXX', '.......XXX', '.......XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXX.', '..XXXXXX..'],
  '4': ['......XXX.', '.....XXXX.', '....XXXXX.', '....XXXXX.', '...XX.XXX.', '..XXX.XXX.', '..XX..XXX.', '.XXX..XXX.', 'XXX...XXX.', 'XXX...XXX.', 'XXXXXXXXXX', 'XXXXXXXXXX', '......XXX.', '......XXX.', '......XXX.', '......XXX.'],
  '5': ['XXXXXXXXXX', 'XXXXXXXXXX', 'XXX.......', 'XXX.......', 'XXX.......', 'XXX.XXXX..', 'XXXXXXXXX.', 'XXXX..XXXX', '.......XXX', '.......XXX', '.......XXX', '.......XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXX.', '..XXXXXX..'],
  '6': ['..XXXXXX..', '.XXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', 'XXX.......', 'XXX.......', 'XXX.XXXX..', 'XXXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXX.', '..XXXXXX..'],
  '7': ['XXXXXXXXXX', 'XXXXXXXXXX', '.......XXX', '.......XXX', '......XXXX', '......XXX.', '.....XXXX.', '.....XXX..', '....XXXX..', '....XXX...', '...XXXX...', '...XXX....', '...XXX....', '...XXX....', '...XXX....', '...XXX....'],
  '8': ['..XXXXXX..', '.XXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXX.', '.XXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXX.', '..XXXXXX..'],
  '9': ['..XXXXXX..', '.XXXXXXXX.', 'XXXX..XXXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXXX', '..XXXX.XXX', '.......XXX', '.......XXX', 'XXX....XXX', 'XXXX..XXXX', '.XXXXXXXX.', '..XXXXXX..'],
  x: ['..........', '..........', '..........', '..........', 'XX......XX', 'XXX....XXX', '.XXX..XXX.', '..XXXXXX..', '...XXXX...', '...XXXX...', '..XXXXXX..', '.XXX..XXX.', 'XXX....XXX', 'XX......XX', '..........', '..........'],
  '=': ['..........', '..........', '..........', '..........', '..........', 'XXXXXXXXXX', 'XXXXXXXXXX', '..........', '..........', 'XXXXXXXXXX', 'XXXXXXXXXX', '..........', '..........', '..........', '..........', '..........'],
  '+': ['..........', '..........', '..........', '....XX....', '....XX....', '....XX....', '....XX....', 'XXXXXXXXXX', 'XXXXXXXXXX', '....XX....', '....XX....', '....XX....', '....XX....', '..........', '..........', '..........'],
  '-': ['..........', '..........', '..........', '..........', '..........', '..........', '..........', 'XXXXXXXXXX', 'XXXXXXXXXX', '..........', '..........', '..........', '..........', '..........', '..........', '..........'],
  '/': ['........XX', '.......XXX', '.......XX.', '......XXX.', '......XX..', '.....XXX..', '.....XX...', '....XXX...', '....XX....', '...XXX....', '...XX.....', '..XXX.....', '..XX......', '.XXX......', '.XX.......', 'XXX.......'],
  '%': ['.XX.....XX', 'XXXX...XXX', 'XXXX...XX.', '.XX...XXX.', '......XX..', '.....XXX..', '.....XX...', '....XXX...', '....XX....', '...XXX....', '...XX.....', '..XXX..XX.', '..XX..XXXX', '.XXX..XXXX', '.XX....XX.', '..........'],
};

/** Los caracteres que se pueden escribir con cifras. */
export const GLIFOS = Object.keys(G);

/** El glifo liso de un carácter, en la letra de tinta `k`. */
export function glifo(c: string, k = 'k'): string[] {
  const g = G[c] ?? G['-'];
  return g.map((r) => r.replace(/X/g, k));
}

/** Rampas de las cifras con claroscuro, de la sombra a la luz: [sombra, base, luz]. */
export const TONO_CIFRA = {
  roja: ['R', 'r', 'e'],
  azul: ['b', 'C', 'A'],
  oro: ['o', 'y', 'Y'],
  hueso: ['h', 'm', 'w'],
  verde: ['g', 'L', 'K'],
  purpura: ['F', 'q', 'Q'],
} as const;
export type TonoCifra = keyof typeof TONO_CIFRA;

const cache = new Map<string, string[]>();

/**
 * Un glifo con claroscuro y canto de tinta abismal (12 × 18 celdas): la luz arriba a la izquierda, la sombra abajo a
 * la derecha y un borde oscuro de un píxel que lo despega de cualquier fondo.
 */
export function cifraMapa(c: string, tono: TonoCifra = 'hueso'): Mapa {
  const clave = `${c}|${tono}`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const [sombra, base, luz] = TONO_CIFRA[tono];
  const g = G[c] ?? G['-'];
  const l = new Lienzo(CIFRA_W + 2, CIFRA_H + 2);
  const lleno = (x: number, y: number) => y >= 0 && y < CIFRA_H && x >= 0 && x < CIFRA_W && g[y][x] === 'X';
  for (let y = 0; y < CIFRA_H; y++)
    for (let x = 0; x < CIFRA_W; x++) {
      if (!lleno(x, y)) continue;
      // el canto: tinta abismal alrededor (vecindad de 8)
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!lleno(x + dx, y + dy)) l.set(x + 1 + dx, y + 1 + dy, '0');
    }
  for (let y = 0; y < CIFRA_H; y++)
    for (let x = 0; x < CIFRA_W; x++) {
      if (!lleno(x, y)) continue;
      // un canto cuenta si corre al menos dos celdas: los escalones de una diagonal quedan lisos
      const canto = (dy: number) => !lleno(x, y + dy) && ((lleno(x - 1, y) && !lleno(x - 1, y + dy)) || (lleno(x + 1, y) && !lleno(x + 1, y + dy)));
      const arriba = canto(-1);
      const abajo = canto(1);
      const liso = !/[0-9]/.test(c);
      l.set(x + 1, y + 1, liso ? base : arriba && !abajo ? luz : abajo && !arriba ? sombra : base);
    }
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}
