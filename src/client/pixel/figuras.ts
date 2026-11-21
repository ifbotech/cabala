// V40 · fase 2c · Las vestimentas van en claroscuro tramado (Bayer, de la sombra abismal a la luz), las caras son
// severas —cejas que bajan hacia la nariz, la boca recta, sin arrebol— y el caballo es gris frío tramado.
//
// V40 · fase 2b · La Corte de la baraja española en pixel-art «sin línea», de cuerpo entero sobre la rejilla del naipe
// (96 × 140): 10 Sota (paje de pie), 11 Caballo (jinete sobre un caballo gris con gualdrapa) y 12 Rey (corona, barba,
// esclavina y manto con armiño). Figuras altas y estilizadas, con masa: mangas abullonadas con franjas, faldón
// acampanado, calzas partidas de dos colores, capa a la espalda. Caras pálidas simples de tres cuartos mirando a la
// izquierda, pliegues en dos tonos y la luz de arriba a la izquierda. Cada palo viste sus colores y empuña su pinta.
// Dibujos originales; sin texto.
//
// El dibujo deja libres las zonas del índice de dos cifras: arriba a la izquierda (x ≤ 27, y ≤ 32) y abajo a la
// derecha (x ≥ 69, y ≥ 107).
import type { Palo } from '../../rules/cartas';
import { hueco, rayado, sombrear } from './dither';
import { RAMPA, type Material } from './paleta';
import { Lienzo, girar, recortar } from './pincel';
import { heredar } from './rejilla';
import { pintaNaipe } from './pintas';

export const FIG_W = 96;
export const FIG_H = 140;

/** Ropa de cada palo: túnica, capa y adorno (materiales de la paleta). */
export const ROPA: Record<Palo, { tunica: Material; capa: Material; adorno: Material }> = {
  S: { tunica: 'acero', capa: 'rojo', adorno: 'oro' },
  C: { tunica: 'oliva', capa: 'rojo', adorno: 'oro' },
  D: { tunica: 'rojo', capa: 'acero', adorno: 'oro' },
  H: { tunica: 'rojo', capa: 'oliva', adorno: 'oro' },
};

// letras provisionales del dibujo (se tiñen al final por palo): 1-4 túnica (honda, sombra, base, luz), 5-8 capa
const TUN = '1234';
const CAP = '5678';

/**
 * Una masa de tela en volumen tramado: las celdas del tono base de `prov` se sombrean entre la sombra abismal y la luz
 * (rampa '9' + prov), con el canto de sombra de `n` celdas abajo a la derecha y un filo de luz arriba a la izquierda.
 */
function volumen(l: Lienzo, prov: string, n: number, brillo = true, base = 0.5): void {
  sombrear(l, prov[2], '9' + prov, { base, pendiente: 1.15, borde: n, fuerzaBorde: 0.45, brillo: brillo ? 1 : 0, fuerzaBrillo: 0.2, ancho: 0.85, masa: prov + '9' });
}

/**
 * Cabeza de tres cuartos mirando a la izquierda: óvalo pálido, sombra a la derecha, oreja, ojos de dos celdas, ceja,
 * nariz que asoma, boca y mejilla. `pelo` y su sombra enmarcan la cara.
 */
function cabeza(l: Lienzo, cx: number, cy: number, pelo: [string, string], opts: { barba?: boolean; boca?: string } = {}): void {
  // pelo de atrás (melena hasta la nuca), tramado
  l.elipse(cx + 1.5, cy - 1, 8, 9, '¤');
  l.rect(cx + 2, cy, 7, 8, '¤');
  sombrear(l, '¤', '9' + pelo[1] + pelo[0], { base: 0.45, pendiente: 1, borde: 2, fuerzaBorde: 0.4, brillo: 0 });
  // cara en claroscuro: la mitad de la sombra cae a la piel violácea
  l.elipse(cx - 0.5, cy + 0.5, 6.5, 8, '§');
  l.rect(cx - 7, cy + 1, 1, 2, '§'); // la nariz asoma por el perfil
  sombrear(l, '§', '9spP', { base: 0.56, pendiente: 1.15, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.2, ancho: 0.8 });
  l.rect(cx + 4, cy, 2, 3, 's'); // oreja
  // flequillo
  l.poli([[cx - 7, cy - 4], [cx - 5, cy - 8], [cx + 2, cy - 9], [cx + 7, cy - 6], [cx + 6, cy - 2], [cx + 1, cy - 5], [cx - 4, cy - 4]], pelo[0]);
  l.sombra(pelo[0], pelo[1], 1, 1, 1, pelo[0] + pelo[1]);
  // ojos hundidos y cejas que bajan hacia la nariz (la mirada severa), nariz con su sombra y la boca recta
  l.rect(cx - 5, cy - 1, 1, 2, 'k').rect(cx - 1, cy - 1, 1, 2, 'k');
  l.set(cx - 5, cy - 2, 's').set(cx - 1, cy - 2, 's');
  l.linea(cx - 7, cy - 4, cx - 4, cy - 3, 'k').linea(cx - 2, cy - 3, cx + 1, cy - 4, 'k');
  l.rect(cx - 4, cy + 2, 1, 2, 's').set(cx - 3, cy + 3, '9');
  l.rect(cx - 4, cy + 5, 4, 1, opts.boca ?? 'v');
  if (opts.barba) {
    l.poli([[cx - 7, cy + 4], [cx + 5, cy + 2], [cx + 5, cy + 9], [cx + 1, cy + 16], [cx - 4, cy + 14], [cx - 7, cy + 9]], '¤');
    sombrear(l, '¤', '9shw', { base: 0.6, pendiente: 1, borde: 2, fuerzaBorde: 0.45, brillo: 0, ancho: 0.8 });
    rayado(l, 'hw', 's', { angulo: '|', paso: 2, caja: [cx - 6, cy + 8, cx + 4, cy + 15], hasta: 0.6 });
    l.rect(cx - 6, cy + 4, 8, 1, 'h'); // bigote
    l.rect(cx - 3, cy + 6, 4, 1, 'v');
  }
}

/** Colorea las letras provisionales con los materiales del palo. */
function vestir(m: string[], s: Palo): string[] {
  const r = ROPA[s];
  const tun = RAMPA[r.tunica];
  const cap = RAMPA[r.capa];
  const mapa: Record<string, string> = {};
  for (let i = 0; i < 4; i++) {
    mapa[TUN[i]] = tun[i];
    mapa[CAP[i]] = cap[i];
  }
  return heredar(m.map((f) => [...f].map((k) => mapa[k] ?? k).join('')), m);
}

/** Pega la pinta del palo con su centro en (x, y). */
function empuñar(l: Lienzo, s: Palo, x: number, y: number, v = 0): void {
  const p = pintaNaipe(s, 'chica', v);
  l.pegar(p, Math.round(x - p[0].length / 2), Math.round(y - p.length / 2));
}
/** Una mano en claroscuro. */
const mano = (l: Lienzo, x: number, y: number) => {
  l.elipse(x, y, 2.8, 2.6, '§');
  sombrear(l, '§', '9spP', { base: 0.55, borde: 1, fuerzaBorde: 0.4, brillo: 0 });
};

/** Manga abullonada de (x0, y0) a (x1, y1), con franjas de oro. */
function manga(l: Lienzo, x0: number, y0: number, x1: number, y1: number, r: number, k: string): void {
  l.trazo(x0, y0, x1, y1, r, k);
  for (const t of [0.35, 0.7]) {
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    l.trazo(x - r, y - 0.5, x + r, y + 0.5, 0.7, 'y', k);
  }
}

// ───────────── 10 · Sota ─────────────
function sota(s: Palo): string[] {
  const l = new Lienzo(FIG_W, FIG_H);
  const cx = 50;
  // capa a la espalda: cae del hombro derecho hasta las corvas, abierta
  l.poli([[cx + 6, 40], [cx + 17, 42], [cx + 19, 96], [cx + 10, 102], [cx + 8, 70]], '7');
  volumen(l, CAP, 3);
  // calzas partidas y zapatos
  l.poli([[cx - 9, 86], [cx - 1, 86], [cx - 2, 126], [cx - 8, 126]], '7');
  l.poli([[cx + 1, 86], [cx + 9, 86], [cx + 8, 126], [cx + 2, 126]], '3');
  volumen(l, CAP, 2, false, 0.45);
  volumen(l, TUN, 2, false, 0.45);
  l.rect(cx - 2, 96, 1, 22, '6');
  l.poli([[cx - 12, 126], [cx - 2, 125], [cx - 2, 130], [cx - 12, 130]], 'N').poli([[cx + 1, 125], [cx + 10, 125], [cx + 10, 130], [cx + 1, 130]], 'N');
  l.rect(cx - 11, 126, 4, 1, 'n').rect(cx + 2, 126, 3, 1, 'n');
  // jubón: hombros anchos, talle y faldón acampanado
  l.poli([[cx - 14, 41], [cx + 14, 41], [cx + 11, 66], [cx + 16, 88], [cx - 16, 88], [cx - 11, 66]], '3');
  volumen(l, TUN, 5);
  for (const x of [cx - 8, cx + 2]) l.trazo(x, 70, x - 2, 87, 0.5, '2', TUN); // pliegues del faldón
  l.rect(cx - 16, 86, 33, 2, 'y').rect(cx - 16, 87, 33, 1, 'o');
  // pechera de oro, botones y cinto
  l.poli([[cx - 4, 42], [cx + 4, 42], [cx + 2, 64], [cx - 2, 64]], '4');
  for (let y = 46; y < 63; y += 4) l.rect(cx - 1, y, 2, 2, 'y');
  l.rect(cx - 12, 64, 24, 3, 'n').rect(cx - 2, 64, 4, 3, 'y').set(cx - 1, 65, 'o');
  // cuello de lechuguilla
  l.elipse(cx, 41, 8, 2.5, '¤');
  sombrear(l, '¤', '9hw', { base: 0.62, borde: 1, fuerzaBorde: 0.45, brillo: 0 });
  // brazo derecho (el del fondo) caído, con la mano sobre el cinto
  manga(l, cx + 13, 45, cx + 15, 62, 3.6, '2');
  mano(l, cx + 14, 66);
  // brazo izquierdo (el de delante), doblado hacia afuera con la pinta
  manga(l, cx - 12, 45, cx - 20, 58, 3.8, '3');
  l.sombra('3', '4', -1, -1, 1, TUN);
  // cabeza con bonete de pluma
  cabeza(l, cx - 1, 29, ['y', 'o']);
  l.poli([[cx - 10, 22], [cx - 7, 15], [cx + 6, 14], [cx + 10, 21]], '7');
  volumen(l, CAP, 2);
  l.rect(cx - 10, 21, 21, 2, 'y').rect(cx - 10, 22, 21, 1, 'o');
  l.trazo(cx + 6, 16, cx + 16, 8, 1.5, 'w');
  l.trazo(cx + 8, 15, cx + 17, 10, 0.6, 'h', 'w');
  // la pinta, en la mano izquierda
  const prop: Record<Palo, [number, number]> = { S: [cx - 22, 49], C: [cx - 22, 52], D: [cx - 24, 58], H: [cx - 24, 55] };
  empuñar(l, s, prop[s][0], prop[s][1], 1);
  mano(l, cx - 21.5, 62);
  return vestir(l.mapa(), s);
}

// ───────────── 11 · Caballo ─────────────
function caballo(s: Palo): string[] {
  const l = new Lienzo(FIG_W, FIG_H);
  // la cola, que cae del anca
  l.poli([[62, 84], [70, 86], [72, 98], [68, 104], [64, 96]], 'j');
  l.sombra('j', 'i', 1, 0, 2);
  // patas: de atrás, la delantera alzada y la de apoyo
  const pata = (x0: number, y0: number, xr: number, yr: number, x1: number, y1: number, k: string) => {
    l.trazo(x0, y0, xr, yr, 2.4, k);
    l.trazo(xr, yr, x1, y1, 1.6, k);
    l.poli([[x1 - 2.5, y1], [x1 + 2.5, y1], [x1 + 2.5, y1 + 3], [x1 - 2.5, y1 + 3]], 'i');
  };
  pata(60, 96, 62, 112, 61, 124, 'j'); // trasera del fondo
  pata(56, 96, 54, 112, 56, 125, 'J'); // trasera
  pata(34, 96, 36, 112, 37, 125, 'j'); // delantera del fondo
  // delantera alzada: el caballo manotea
  l.trazo(30, 94, 22, 104, 2.4, 'J');
  l.trazo(22, 104, 24, 113, 1.6, 'J');
  l.poli([[21, 113], [26, 112], [27, 115], [22, 116]], 'i');
  // cuerpo: pecho, barril y anca
  l.elipse(47, 90, 18, 10, 'J');
  l.elipse(31, 87, 8, 10, 'J');
  l.elipse(60, 89, 9, 10, 'J');
  // cuello arqueado y cabeza
  l.poli([[24, 84], [36, 82], [32, 66], [26, 56], [18, 58], [20, 70]], 'J');
  l.poli([[18, 56], [26, 54], [28, 62], [20, 72], [12, 76], [8, 74], [9, 68]], 'J');
  l.poli([[20, 54], [22, 48], [25, 54]], 'J'); // oreja
  sombrear(l, 'J', '9ijJu', { base: 0.5, pendiente: 1.15, borde: 4, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.25, ancho: 0.85, masa: 'Jjiu9' });
  // crin, ojo, ollar y riendas
  for (let i = 0; i < 6; i++) l.trazo(26 + i * 1.2, 56 + i * 4, 31 + i * 1.2, 58 + i * 4, 1.2, 'i');
  l.rect(17, 62, 2, 2, 'k').set(17, 62, 'u');
  l.rect(9, 72, 2, 1, 'i');
  l.trazo(12, 68, 20, 66, 0.6, 'v');
  l.trazo(20, 66, 39, 68, 0.6, 'v');
  // gualdrapa del palo, con su ribete y sus flecos de oro
  l.poli([[34, 78], [66, 80], [70, 100], [52, 104], [30, 100]], '7');
  volumen(l, CAP, 3, true, 0.42);
  l.trazo(30, 100, 52, 104, 0.8, 'y').trazo(52, 104, 70, 100, 0.8, 'y');
  for (let x = 31; x < 69; x += 3) l.rect(x, x < 52 ? 101 + Math.round((x - 30) * 0.2) : 104 - Math.round((x - 52) * 0.24), 1, 3, 'o');
  for (let x = 38; x < 64; x += 8) l.rect(x, 90, 3, 3, 'y');
  // silla y estribo
  l.poli([[40, 76], [58, 76], [56, 81], [42, 81]], 'n');
  l.sombra('n', 'N', 1, 1, 1);
  // el jinete: pierna con bota, torso, brazo en alto, cabeza y sombrero con pluma
  l.poli([[44, 74], [54, 74], [52, 94], [46, 94]], '3');
  l.sombra('3', '2', 1, 0, 2, TUN);
  l.poli([[44, 93], [53, 93], [55, 100], [42, 100]], 'N');
  l.rect(43, 94, 3, 1, 'n');
  l.poli([[41, 50], [59, 50], [57, 76], [43, 76]], '3');
  volumen(l, TUN, 4);
  l.rect(43, 72, 14, 3, 'y').rect(43, 74, 14, 1, 'o');
  l.elipse(50, 50, 7, 2.2, '¤');
  sombrear(l, '¤', '9hw', { base: 0.62, borde: 1, fuerzaBorde: 0.45, brillo: 0 });
  // el brazo del fondo, en alto con la pinta; el de delante lleva las riendas
  manga(l, 57, 54, 62, 40, 3.2, '2');
  manga(l, 43, 53, 39, 65, 3.4, '3');
  l.sombra('3', '4', -1, -1, 1, TUN);
  cabeza(l, 49, 38, ['n', 'N']);
  l.poli([[38, 31], [41, 25], [56, 24], [60, 30]], '7');
  volumen(l, CAP, 2);
  l.rect(36, 30, 26, 2, 'y').rect(36, 31, 26, 1, 'o');
  l.trazo(40, 28, 31, 22, 1.6, 'Y');
  l.trazo(39, 27, 32, 23, 0.7, 'y', 'Y');
  // la pinta, en alto
  const prop: Record<Palo, [number, number]> = { S: [63, 22], C: [63, 23], D: [63, 29], H: [63, 28] };
  empuñar(l, s, prop[s][0], prop[s][1]);
  mano(l, 62.5, 38);
  mano(l, 39, 67);
  return vestir(l.mapa(), s);
}

// ───────────── 12 · Rey ─────────────
function rey(s: Palo): string[] {
  const l = new Lienzo(FIG_W, FIG_H);
  const cx = 47;
  // manto largo, abierto por delante, que se abre hasta el suelo
  l.poli([[cx - 15, 40], [cx + 15, 40], [cx + 20, 100], [cx + 21, 129], [cx - 24, 129], [cx - 21, 90]], '7');
  volumen(l, CAP, 6);
  for (const x of [cx - 14, cx + 13]) l.trazo(x, 70, x + (x > cx ? 3 : -4), 126, 0.6, '6', CAP);
  // túnica larga con pliegues, cinto y orla de oro
  l.poli([[cx - 9, 46], [cx + 9, 46], [cx + 12, 129], [cx - 12, 129]], '3');
  volumen(l, TUN, 4);
  for (const x of [cx - 4, cx + 3]) l.trazo(x, 76, x + (x > cx ? 1 : -2), 126, 0.5, '2', TUN);
  l.rect(cx - 12, 124, 25, 3, 'y').rect(cx - 12, 126, 25, 1, 'o');
  l.rect(cx - 9, 70, 19, 3, 'y').rect(cx - 9, 72, 19, 1, 'o');
  l.rect(cx - 2, 69, 4, 5, 'r');
  // armiño: los bordes del manto y el ruedo, con sus motas
  l.trazo(cx - 14, 52, cx - 22, 128, 1.8, 'w');
  l.trazo(cx + 14, 52, cx + 19, 128, 1.8, 'h');
  l.rect(cx - 25, 129, 47, 3, 'w');
  for (let y = 58; y < 126; y += 8) {
    l.rect(Math.round(cx - 14 - (y - 52) * 0.105), y, 1, 2, 'k');
    l.rect(Math.round(cx + 14 + (y - 52) * 0.066), y + 4, 1, 2, 'k');
  }
  for (let x = cx - 22; x < cx + 20; x += 6) l.rect(x, 130, 1, 2, 'k');
  l.rect(cx - 10, 132, 8, 3, 'N').rect(cx + 2, 132, 8, 3, 'N');
  // esclavina (la capa corta de los hombros) con su cadena de oro
  l.poli([[cx - 17, 41], [cx + 17, 41], [cx + 21, 56], [cx, 62], [cx - 21, 56]], '7');
  volumen(l, CAP, 3, true, 0.42);
  for (let x = cx - 15; x <= cx + 15; x += 4) l.rect(x, 50 + Math.round((15 - Math.abs(x - cx)) * 0.38), 2, 2, 'y');
  // cuello de armiño
  l.elipse(cx, 41, 10, 3, '¤');
  sombrear(l, '¤', '9hw', { base: 0.62, borde: 1, fuerzaBorde: 0.45, brillo: 0 });
  l.set(cx - 5, 41, 'k').set(cx + 1, 42, 'k').set(cx + 6, 41, 'k');
  // brazos: el de la pinta, hacia afuera; el otro, con la mano en el cinto
  manga(l, cx - 17, 46, cx - 23, 62, 4, '7');
  volumen(l, CAP, 2, true, 0.4);
  mano(l, cx + 11, 72);
  // cabeza con barba y corona
  cabeza(l, cx, 30, ['w', 'h'], { barba: true });
  l.poli([[cx - 9, 20], [cx + 9, 20], [cx + 9, 15], [cx + 6, 18], [cx + 3, 11], [cx, 17], [cx - 3, 11], [cx - 6, 18], [cx - 9, 15]], 'y');
  for (const x of [cx - 9, cx - 3, cx + 3, cx + 9]) l.elipse(x + 0.5, x === cx - 9 || x === cx + 9 ? 14.5 : 10.5, 1.4, 1.4, 'Y');
  l.rect(cx - 9, 20, 19, 3, 'y').rect(cx - 9, 22, 19, 1, 'o');
  l.rect(cx - 1, 20, 2, 2, 'r').rect(cx - 6, 20, 2, 2, 't').rect(cx + 4, 20, 2, 2, 't');
  l.sombra('y', 'o', 1, 0, 1, 'yoY');
  // la pinta
  const prop: Record<Palo, [number, number]> = { S: [cx - 24, 51], C: [cx - 24, 54], D: [cx - 26, 60], H: [cx - 26, 58] };
  empuñar(l, s, prop[s][0], prop[s][1]);
  mano(l, cx - 23.5, 66);
  return vestir(l.mapa(), s);
}

// ───────────── 12 · Rey en segunda cara ─────────────
// El mismo Rey, otro dibujo: herido y enojado. La capa se le pasa al violeta (la sombra de la segunda cara), la corona
// se le tuerce y pierde una punta, el ceño se le cierra en V con los ojos encendidos y la boca abierta en un grito, una
// grieta tramada le parte el manto, y cada uno cuenta su segunda cara con un rasgo propio:
//   Espadas · El Caudillo: la espada de revés, en alto, con la punta para abajo, y la cicatriz que le cruza la cara.
//   Bastos · El Cacique: atrincherado detrás de una empalizada de estacas atadas, con el garrote en alto.
//   Oros · El Caudal: la bolsa abierta en la mano y las monedas que se le caen hasta el suelo.
//   Copas · El Bacanal: la copa en alto que desborda vino por el borde y la cara colorada.

/** La ropa de la segunda cara: la túnica sigue en el color del palo y la capa se pasa al violeta. */
const ROPA_SEG: Record<Palo, { tunica: Material; capa: Material }> = {
  S: { tunica: 'acero', capa: 'purpura' },
  C: { tunica: 'oliva', capa: 'purpura' },
  D: { tunica: 'rojo', capa: 'purpura' },
  H: { tunica: 'rojo', capa: 'purpura' },
};
function vestirSeg(m: string[], s: Palo): string[] {
  const r = ROPA_SEG[s];
  const tun = RAMPA[r.tunica];
  const cap = RAMPA[r.capa];
  const mapa: Record<string, string> = {};
  for (let i = 0; i < 4; i++) {
    mapa[TUN[i]] = tun[i];
    mapa[CAP[i]] = cap[i];
  }
  return heredar(m.map((f) => [...f].map((k) => mapa[k] ?? k).join('')), m);
}

/** La cabeza enojada: el ceño en V cerrado y grueso, los ojos encendidos y la boca abierta en un grito con dientes. */
function cabezaFuriosa(l: Lienzo, cx: number, cy: number, colorada: boolean): void {
  // pelo de atrás, tramado
  l.elipse(cx + 1.5, cy - 1, 8, 9, '¤');
  l.rect(cx + 2, cy, 7, 8, '¤');
  sombrear(l, '¤', '9hw', { base: 0.42, pendiente: 1, borde: 2, fuerzaBorde: 0.4, brillo: 0 });
  // la cara: en el Bacanal, colorada (la piel corre al carmesí)
  l.elipse(cx - 0.5, cy + 0.5, 6.5, 8, '§');
  l.rect(cx - 7, cy + 1, 1, 2, '§');
  sombrear(l, '§', colorada ? '9Rre' : '9spP', { base: colorada ? 0.62 : 0.5, pendiente: 1.15, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.2, ancho: 0.8 });
  l.rect(cx + 4, cy, 2, 3, colorada ? 'R' : 's');
  // flequillo revuelto
  l.poli([[cx - 7, cy - 4], [cx - 6, cy - 9], [cx - 2, cy - 7], [cx + 2, cy - 10], [cx + 7, cy - 6], [cx + 6, cy - 2], [cx + 1, cy - 5], [cx - 4, cy - 4]], 'w');
  l.sombra('w', 'h', 1, 1, 1, 'wh');
  // el ceño: dos cejas gruesas que bajan en V hasta la nariz
  l.poli([[cx - 8, cy - 6], [cx - 3, cy - 3], [cx - 3, cy - 1.6], [cx - 8, cy - 4.6]], 'k');
  l.poli([[cx - 2, cy - 3], [cx + 2, cy - 6], [cx + 2, cy - 4.6], [cx - 2, cy - 1.6]], 'k');
  // los ojos encendidos, bajo el ceño
  l.set(cx - 5, cy - 1, 'Y').set(cx - 5, cy, 'r').set(cx - 1, cy - 1, 'Y').set(cx - 1, cy, 'r');
  // la nariz y la arruga del entrecejo
  l.rect(cx - 4, cy + 1, 1, 2, colorada ? 'v' : 's').set(cx - 3, cy + 3, '9');
  // la barba, más corta y revuelta, con el grito abierto en el medio
  l.poli([[cx - 7, cy + 4], [cx + 5, cy + 2], [cx + 5, cy + 9], [cx + 2, cy + 15], [cx, cy + 12], [cx - 3, cy + 15], [cx - 7, cy + 9]], '¤');
  sombrear(l, '¤', '9shw', { base: 0.6, pendiente: 1, borde: 2, fuerzaBorde: 0.45, brillo: 0, ancho: 0.8 });
  rayado(l, 'hw', 's', { angulo: '|', paso: 2, caja: [cx - 6, cy + 9, cx + 4, cy + 14], hasta: 0.6 });
  // la boca abierta: el hueco, los dientes de arriba y el de abajo
  l.rect(cx - 5, cy + 4, 5, 4, '0');
  l.rect(cx - 5, cy + 4, 5, 1, 'w').set(cx - 3, cy + 4, 'h').set(cx - 2, cy + 7, 'h');
  l.rect(cx - 4, cy + 3, 4, 1, colorada ? 'v' : 's');
}

/** La corona torcida: el aro se ladea, le falta una punta y una piedra quedó vacía. */
function coronaTorcida(l: Lienzo, cx: number): void {
  const t = (x: number, y: number): [number, number] => [x + 2, y + (x - cx) * 0.3 - 1];
  const puntas: [number, number][] = [[cx - 9, 20], [cx + 9, 20], [cx + 9, 15], [cx + 6, 18], [cx + 3, 11], [cx, 17], [cx - 3, 17], [cx - 6, 18], [cx - 9, 15]];
  l.poli(puntas.map(([x, y]) => t(x, y)), 'y');
  l.poli([[cx - 9, 20], [cx + 10, 20], [cx + 10, 23], [cx - 9, 23]].map(([x, y]) => t(x, y)), 'y');
  l.poli([[cx - 9, 22], [cx + 10, 22], [cx + 10, 23], [cx - 9, 23]].map(([x, y]) => t(x, y)), 'o');
  for (const x of [cx - 9, cx + 3, cx + 9]) {
    const [px, py] = t(x, x === cx + 3 ? 10.5 : 14.5);
    l.elipse(px + 0.5, py, 1.4, 1.4, 'Y');
  }
  // la punta rota del medio a la izquierda: queda el muñón
  const [rx, ry] = t(cx - 3, 16);
  l.set(Math.round(rx), Math.round(ry), 'o');
  // las piedras: una se cayó y dejó el engaste vacío
  for (const [x, k] of [[cx - 6, 't'], [cx - 1, '0'], [cx + 4, 'r']] as [number, string][]) {
    const [px, py] = t(x, 20.5);
    l.rect(Math.round(px), Math.round(py), 2, 2, k);
  }
  l.sombra('y', 'o', 1, 0, 1, 'yoY');
}

/** La grieta que le parte el manto: un zigzag de sombra abismal con su filo de luz del lado de abajo. */
function grietaManto(l: Lienzo, puntos: [number, number][], masa: string): void {
  for (let i = 1; i < puntos.length; i++) {
    const [x0, y0] = puntos[i - 1];
    const [x1, y1] = puntos[i];
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let j = 0; j <= n; j++) {
      const x = Math.round(x0 + ((x1 - x0) * j) / n);
      const y = Math.round(y0 + ((y1 - y0) * j) / n);
      if (!l.lleno(x, y, masa + '90')) continue;
      l.set(x, y, '0').marcar(x, y);
      if (l.lleno(x + 1, y, masa + '9')) l.set(x + 1, y, '0').marcar(x + 1, y);
      if (l.lleno(x + 2, y, masa) && (x + y) % 2 === 0) l.set(x + 2, y, '9').marcar(x + 2, y);
      if (l.lleno(x - 1, y, masa) && (x + y) % 2 === 1) l.set(x - 1, y, 'Q').marcar(x - 1, y);
    }
  }
}

function reySegunda(s: Palo): string[] {
  const l = new Lienzo(FIG_W, FIG_H);
  const cx = 47;
  // manto largo, ahora violeta, abierto por delante
  l.poli([[cx - 15, 40], [cx + 15, 40], [cx + 20, 100], [cx + 21, 129], [cx - 24, 129], [cx - 21, 90]], '7');
  volumen(l, CAP, 6, true, 0.42);
  for (const x of [cx - 14, cx + 13]) l.trazo(x, 70, x + (x > cx ? 3 : -4), 126, 0.6, '6', CAP);
  // túnica larga, más honda que en la primera cara
  l.poli([[cx - 9, 46], [cx + 9, 46], [cx + 12, 129], [cx - 12, 129]], '3');
  volumen(l, TUN, 4, true, 0.4);
  for (const x of [cx - 4, cx + 3]) l.trazo(x, 76, x + (x > cx ? 1 : -2), 126, 0.5, '2', TUN);
  l.rect(cx - 12, 124, 25, 3, 'y').rect(cx - 12, 126, 25, 1, 'o');
  l.rect(cx - 9, 70, 19, 3, 'y').rect(cx - 9, 72, 19, 1, 'o');
  l.rect(cx - 2, 69, 4, 5, 'r');
  // armiño ensuciado: el borde de sombra se apaga al hueso
  l.trazo(cx - 14, 52, cx - 22, 128, 1.8, 'w');
  l.trazo(cx + 14, 52, cx + 19, 128, 1.8, 'h');
  l.rect(cx - 25, 129, 47, 3, 'h');
  for (let y = 58; y < 126; y += 8) {
    l.rect(Math.round(cx - 14 - (y - 52) * 0.105), y, 1, 2, 'k');
    l.rect(Math.round(cx + 14 + (y - 52) * 0.066), y + 4, 1, 2, 'k');
  }
  for (let x = cx - 22; x < cx + 20; x += 6) l.rect(x, 130, 1, 2, 'k');
  l.rect(cx - 10, 132, 8, 3, 'N').rect(cx + 2, 132, 8, 3, 'N');
  // la grieta que parte el manto de arriba abajo, del hombro derecho al ruedo
  grietaManto(l, [[cx + 12, 60], [cx + 4, 74], [cx + 9, 84], [cx - 1, 98], [cx + 6, 108], [cx - 3, 122], [cx + 1, 128]], '5678' + TUN + 'yowhkr');
  // esclavina con su cadena, que se cortó: cuelga de un lado
  l.poli([[cx - 17, 41], [cx + 17, 41], [cx + 21, 56], [cx, 62], [cx - 21, 56]], '7');
  volumen(l, CAP, 3, true, 0.38);
  for (let x = cx - 15; x <= cx + 3; x += 4) l.rect(x, 50 + Math.round((15 - Math.abs(x - cx)) * 0.38), 2, 2, 'y');
  for (let i = 0; i < 3; i++) l.rect(cx + 6, 56 + i * 3, 2, 2, 'o');
  // cuello de armiño
  l.elipse(cx, 41, 10, 3, '¤');
  sombrear(l, '¤', '9hw', { base: 0.55, borde: 1, fuerzaBorde: 0.45, brillo: 0 });
  l.set(cx - 5, 41, 'k').set(cx + 1, 42, 'k').set(cx + 6, 41, 'k');
  // el puño cerrado en el cinto
  mano(l, cx + 11, 72);
  rasgoSeg[s](l, cx);
  return vestirSeg(l.mapa(), s);
}

/** La altura de la cabeza del Rey en su lienzo. */
const cy0 = 30;

/** Un brazo alzado: sube del hombro hasta la mano, en alto. */
function brazoEnAlto(l: Lienzo, cx: number, mx: number, my: number): void {
  manga(l, cx - 16, 46, mx, my + 4, 4, '7');
  volumen(l, CAP, 2, true, 0.4);
}

const rasgoSeg: Record<Palo, (l: Lienzo, cx: number) => void> = {
  // El Caudillo: la espada de revés en alto (la punta para abajo) y la cicatriz que le cruza la cara
  S: (l, cx) => {
    brazoEnAlto(l, cx, cx - 25, 52);
    cabezaFuriosa(l, cx, 30, false);
    coronaTorcida(l, cx);
    l.linea(cx - 7, cy0 - 6, cx - 2, cy0 + 4, 'R').linea(cx - 6, cy0 - 6, cx - 1, cy0 + 4, 'e');
    const p = girar(girar(pintaNaipe('S', 'chica', 0)));
    l.pegar(p, cx - 25 - Math.round(p[0].length / 2), 45);
    mano(l, cx - 24.5, 55);
  },
  // El Cacique: el garrote en alto y la empalizada de estacas atadas por delante
  C: (l, cx) => {
    brazoEnAlto(l, cx, cx - 22, 52);
    cabezaFuriosa(l, cx, 30, false);
    coronaTorcida(l, cx);
    empuñar(l, 'C', cx - 22, 39, 1);
    mano(l, cx - 22, 54);
    // las estacas: de punta, de madera tramada, con la luz del lado izquierdo
    for (const [x, alto] of [[6, 96], [15, 90], [24, 94], [33, 88], [42, 93], [51, 89], [60, 95]] as [number, number][]) {
      l.poli([[x, 140], [x, alto + 5], [x + 3.5, alto], [x + 7, alto + 5], [x + 7, 140]], '¤');
    }
    sombrear(l, '¤', '9Nndx', { base: 0.52, pendiente: 0.6, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.3, ancho: 0.8 });
    // las ataduras de cuero que las juntan
    for (const y of [106, 122]) l.rect(6, y, 61, 2, 'n').rect(6, y + 1, 61, 1, 'N');
    // la empalizada no pisa el índice de abajo: se recorta antes
    for (let y = 107; y < 140; y++) for (let x = 67; x < FIG_W; x++) if ('9Nndx'.includes(l.get(x, y)) && x > 66) l.set(x, y, '.');
  },
  // El Caudal: la bolsa abierta en la mano y las monedas que se le caen hasta el suelo
  D: (l, cx) => {
    manga(l, cx - 17, 46, cx - 24, 60, 4, '7');
    volumen(l, CAP, 2, true, 0.4);
    cabezaFuriosa(l, cx, 30, false);
    coronaTorcida(l, cx);
    // la bolsa: panza de cuero, boca abierta y el cordón suelto
    l.elipse(cx - 27, 74, 9, 8, '¤').poli([[cx - 32, 66], [cx - 22, 66], [cx - 20, 62], [cx - 34, 62]], '¤');
    sombrear(l, '¤', '9Nndx', { base: 0.5, pendiente: 1, borde: 2, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.25, ancho: 0.8 });
    hueco(l, cx - 27, 63, 6, 1.6, '90z');
    l.rect(cx - 31, 61, 3, 2, 'y').rect(cx - 25, 60, 3, 2, 'Y').rect(cx - 28, 60, 2, 1, 'y');
    l.trazo(cx - 20, 64, cx - 17, 70, 0.6, 'x');
    mano(l, cx - 22, 64);
    // las monedas que caen y las que ya rodaron por el suelo
    const moneda = (x: number, y: number, canto = false) => {
      if (canto) l.rect(x - 1, y - 3, 2, 6, 'y').rect(x, y - 3, 1, 6, 'o');
      else l.elipse(x, y, 3.4, 2.6, 'y').rect(Math.round(x) - 2, Math.round(y) - 1, 2, 1, 'Y').rect(Math.round(x), Math.round(y) + 1, 3, 1, 'o').set(Math.round(x) + 2, Math.round(y), 'o');
    };
    for (const [x, y, c] of [[cx - 31, 88, 0], [cx - 25, 94, 1], [cx - 33, 102, 1], [cx - 28, 110, 0], [cx - 35, 118, 0], [cx - 30, 124, 1]] as [number, number, number][]) moneda(x, y, !!c);
    empuñar(l, 'D', cx - 30, 129, 0);
  },
  // El Bacanal: la copa en alto que desborda vino y la cara colorada
  H: (l, cx) => {
    brazoEnAlto(l, cx, cx - 25, 56);
    cabezaFuriosa(l, cx, 30, true);
    coronaTorcida(l, cx);
    empuñar(l, 'H', cx - 27, 46, 0);
    mano(l, cx - 25, 60);
    // el vino que rebalsa: la ola sobre el borde y los chorros que bajan por el pie y caen
    l.elipse(cx - 27, 35, 11, 2.2, 'R').elipse(cx - 27, 33.5, 9, 2.2, 'r').rect(cx - 31, 32, 5, 1, 'e');
    for (const [x, y] of [[cx - 33, 30], [cx - 22, 29], [cx - 27, 28]] as [number, number][]) l.rect(x, y, 2, 2, 'r').set(x, y, 'e');
    for (const [x0, y0, y1] of [[cx - 36, 35, 56], [cx - 18, 35, 49], [cx - 34, 60, 80], [cx - 31, 84, 98]] as [number, number, number][]) {
      l.trazo(x0, y0, x0 + (x0 < cx - 27 ? -1 : 1), y1, 1, 'R');
      l.set(x0 + (x0 < cx - 27 ? -1 : 1), y1 + 2, 'r');
    }
    // el charco en el suelo
    l.elipse(cx - 31, 128, 9, 2, 'R').rect(cx - 36, 127, 5, 1, 'r');
  },
};

const DIBUJO: Record<10 | 11 | 12, (s: Palo) => string[]> = { 10: sota, 11: caballo, 12: rey };
const cache = new Map<string, string[]>();
/** La figura en su lienzo de 96 × 140 (la cara del naipe la coloca tal cual). */
export function figuraLienzo(s: Palo, rango: 10 | 11 | 12): string[] {
  const k = `${s}${rango}`;
  let m = cache.get(k);
  if (!m) cache.set(k, (m = DIBUJO[rango](s)));
  return m;
}
/** El Rey en su segunda cara, en el mismo lienzo de 96 × 140. */
export function figuraSegunda(s: Palo): string[] {
  const k = `${s}seg`;
  let m = cache.get(k);
  if (!m) cache.set(k, (m = reySegunda(s)));
  return m;
}
/** La figura entera de un palo y un rango (10, 11 o 12), recortada a su silueta. */
export const figuraMapa = (s: Palo, rango: 10 | 11 | 12): string[] => recortar(figuraLienzo(s, rango));
