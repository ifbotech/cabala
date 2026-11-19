// Los 5 Personajes jugables, uno por Mazo, de busto en claroscuro tramado (64 × 64 celdas) para el HUD de la mesa:
//   Escoba · La Barrendera (pañuelo carmesí, ojo clínico) · Truco · El Paisano Bravo (sombrero ladeado, mirada pícara)
//   Chinchón · La Timbera del Club (visera verde, anteojos) · El Mentiroso · El Chamuyero (sonrisa cínica, antifaz caído)
//   Chancho Va · El Manotazo (vincha, cicatriz, bandido de pulpería)
// Cada retrato se dibuja por cuadros: la mirada (izquierda, centro, derecha), el gesto (neutro, parpadeo, feroz al
// clavar un canto o un Golpe exacto, mueca al recibir el Contraataque, caído) y las heridas según la Vida que queda
// (entero, golpeado y despeinado, sangrando). Luz de arriba a la izquierda; sin contorno negro.
import type { MazoId } from '../../rules/mazos';
import { hueco, rayado, sombrear, tonoTramado } from './dither';
import { Lienzo } from './pincel';

export const RETRATO = 64;
const L = RETRATO;
const CX = 32;
const CY = 30;

export type Mirada = -1 | 0 | 1;
export type Gesto = 'neutro' | 'parpadeo' | 'feroz' | 'mueca' | 'caido';
export type Herida = 0 | 1 | 2;
export interface Cuadro {
  mirada: Mirada;
  gesto: Gesto;
  herida: Herida;
}
export const CUADRO0: Cuadro = { mirada: 0, gesto: 'neutro', herida: 0 };

interface Rasgo {
  /** La penumbra del fondo (rampa de los bordes a la luz de detrás de la cabeza). */
  fondo: string;
  piel: string;
  /** Tinta de las cejas y del iris. */
  ceja: string;
  iris: string;
  /** Lo que va detrás de la cabeza (melena, ala del sombrero, la escoba). */
  atras?: (l: Lienzo, c: Cuadro) => void;
  ropa: (l: Lienzo, c: Cuadro) => void;
  /** El contorno de la cara (polígono) si no es el de serie. */
  cara?: [number, number][];
  /** Lo que va sobre la cara antes de ojos y boca (bigote no: eso va en `encima`). */
  boca: (l: Lienzo, c: Cuadro) => void;
  /** Pelo, bigote, sombrero, anteojos, pañuelo: lo que tapa. */
  encima: (l: Lienzo, c: Cuadro) => void;
  /** La ceja que lleva alzada en reposo (-1 la izquierda, 1 la derecha, 0 ninguna). */
  cejaAlta?: -1 | 0 | 1;
  /** Separación de los ojos al centro y su altura. */
  ojoY?: number;
}

const CARA: [number, number][] = [
  [CX - 9, CY - 14],
  [CX + 9, CY - 14],
  [CX + 12, CY - 7],
  [CX + 12, CY + 2],
  [CX + 9, CY + 10],
  [CX + 3, CY + 15],
  [CX - 3, CY + 15],
  [CX - 9, CY + 10],
  [CX - 12, CY + 2],
  [CX - 12, CY - 7],
];

/** El fondo: la penumbra de su Mazo, tramada desde la luz de detrás de la cabeza. */
function fondo(l: Lienzo, rampa: string, apagado: boolean): void {
  for (let y = 0; y < L; y++)
    for (let x = 0; x < L; x++) {
      const d = Math.hypot((x + 0.5 - CX) / 36, (y + 0.5 - (CY - 2)) / 40);
      const [k, t] = tonoTramado(rampa, Math.max(0, 1 - d) ** 1.1 * (apagado ? 0.45 : 0.85), x, y, { ancho: 0.9 });
      l.set(x, y, k);
      if (t) l.marcar(x, y);
    }
}

/** Los ojos y las cejas de un cuadro. */
function ojos(l: Lienzo, c: Cuadro, r: Rasgo): void {
  const y = r.ojoY ?? CY - 2;
  const sombraPiel = r.piel[1];
  for (const lado of [-1, 1] as const) {
    const ex = CX + lado * 6;
    const alta = r.cejaAlta === lado && c.gesto === 'neutro';
    // la ceja: recta en reposo, fruncida hacia la nariz si está feroz, alzada al medio si le duele
    const dentro = ex - lado * 3;
    const fuera = ex + lado * 4;
    let yd = y - 5;
    let yf = y - 5;
    if (c.gesto === 'feroz') {
      yd = y - 3;
      yf = y - 6;
    } else if (c.gesto === 'mueca' || c.gesto === 'caido') {
      yd = y - 6;
      yf = y - 4;
    } else if (alta) {
      yd = y - 6;
      yf = y - 7;
    }
    l.linea(dentro, yd, fuera, yf, r.ceja).linea(dentro, yd + 1, fuera, yf + 1, r.ceja);
    if (c.gesto === 'parpadeo') {
      l.rect(ex - 3, y, 6, 1, '9').rect(ex - 2, y + 1, 4, 1, sombraPiel);
      continue;
    }
    if (c.gesto === 'caido') {
      // los ojos en cruz del que quedó tendido
      l.linea(ex - 2, y - 2, ex + 2, y + 2, '0').linea(ex + 2, y - 2, ex - 2, y + 2, '0');
      continue;
    }
    if (c.gesto === 'mueca' && lado === -1) {
      // un ojo apretado del dolor
      l.linea(ex - 3, y - 1, ex + 1, y, '9').linea(ex + 1, y, ex - 3, y + 2, '9');
      continue;
    }
    const alto = c.gesto === 'feroz' || c.gesto === 'mueca' ? 3 : 4;
    const y0 = y - (alto === 4 ? 2 : 1);
    // el blanco del ojo, almendrado
    l.rect(ex - 3, y0, 6, alto, 'w');
    l.set(ex - 3, y0, sombraPiel).set(ex + 2, y0, sombraPiel).set(ex - 3, y0 + alto - 1, sombraPiel).set(ex + 2, y0 + alto - 1, sombraPiel);
    // el párpado de arriba, en sombra
    l.rect(ex - 3, y0 - 1, 6, 1, '9');
    if (c.gesto === 'feroz') l.rect(ex - 3, y0, 6, 1, '9');
    // el iris sigue la mirada
    const ix = ex - 1 + c.mirada * 2;
    l.rect(ix, y0 + (alto === 4 ? 1 : 0), 2, alto === 4 ? 3 : alto, r.iris);
    l.set(ix + (c.mirada > 0 ? 1 : 0), y0 + (alto === 4 ? 2 : 1), '0');
    l.set(ix, y0 + (alto === 4 ? 1 : 0), 'w');
    // la ojera
    l.rect(ex - 2, y0 + alto, 4, 1, sombraPiel);
  }
}

/** La nariz: el hueso en luz y la aleta en sombra. */
function nariz(l: Lienzo, r: Rasgo): void {
  const [, s, , luz] = r.piel;
  l.linea(CX, CY - 3, CX + 1, CY + 4, s);
  l.rect(CX - 1, CY - 2, 1, 6, luz ?? r.piel[2]);
  l.rect(CX - 2, CY + 5, 5, 1, s).set(CX + 2, CY + 4, s).set(CX - 2, CY + 4, s).set(CX + 3, CY + 5, '9');
}

/** La boca de serie de cada gesto (cada personaje puede dibujar la suya en reposo). */
function bocaGesto(l: Lienzo, c: Cuadro, reposo: () => void): void {
  const y = CY + 9;
  if (c.gesto === 'feroz') {
    // la sonrisa feroz: de oreja a oreja, con los dientes apretados
    l.poli([[CX - 7, y - 2], [CX + 8, y - 2], [CX + 6, y + 3], [CX, y + 4], [CX - 5, y + 3]], '0');
    l.rect(CX - 5, y - 1, 11, 2, 'w');
    for (let x = CX - 3; x < CX + 6; x += 2) l.set(x, y - 1, 'h').set(x, y, 'h');
    l.set(CX - 7, y - 3, '9').set(CX + 7, y - 3, '9');
    return;
  }
  if (c.gesto === 'mueca') {
    // los dientes apretados, torcidos del lado del golpe
    l.poli([[CX - 5, y - 1], [CX + 6, y], [CX + 5, y + 3], [CX - 5, y + 2]], '0');
    l.rect(CX - 4, y, 9, 2, 'w');
    for (let x = CX - 3; x < CX + 5; x += 2) l.rect(x, y, 1, 2, 'h');
    l.set(CX - 6, y + 2, '9').set(CX + 6, y + 3, '9');
    return;
  }
  if (c.gesto === 'caido') {
    l.linea(CX - 4, y + 1, CX - 1, y - 1, '0').linea(CX - 1, y - 1, CX + 2, y + 1, '0').linea(CX + 2, y + 1, CX + 5, y - 1, '0');
    return;
  }
  reposo();
}

/** Las heridas: rasguño y moretón cuando va golpeado; la ceja partida y la sangre de la nariz cuando sangra. */
function heridas(l: Lienzo, c: Cuadro, r: Rasgo): void {
  if (c.herida === 0) return;
  // el rasguño en el pómulo
  l.linea(CX + 6, CY + 3, CX + 9, CY + 6, 'R').linea(CX + 7, CY + 2, CX + 10, CY + 5, 'r');
  // el moretón bajo el ojo izquierdo, tramado
  for (let y = CY + 1; y < CY + 4; y++) for (let x = CX - 9; x < CX - 3; x++) if ((x + y) % 2 === 0 && l.lleno(x, y, r.piel)) l.set(x, y, 'F').marcar(x, y);
  if (c.herida < 2) return;
  // la ceja partida, que chorrea, y la nariz que sangra
  l.linea(CX - 8, CY - 9, CX - 4, CY - 6, 'R');
  l.rect(CX - 9, CY - 8, 1, 6, 'r').rect(CX - 10, CY - 3, 1, 4, 'R').set(CX - 9, CY - 2, 'e');
  l.rect(CX + 1, CY + 6, 1, 3, 'r').rect(CX + 2, CY + 6, 1, 5, 'R').set(CX + 1, CY + 9, 'R');
  l.rect(CX - 2, CY + 13, 2, 2, 'R');
}

/** Hombros de serie: un trapecio vestido con su rampa. */
function hombros(l: Lienzo, rampa: string, base: number, ancho = 26): void {
  l.poli([[CX - ancho, L], [CX - ancho + 4, 50], [CX - 7, 44], [CX + 7, 44], [CX + ancho - 4, 50], [CX + ancho, L]], '¤');
  sombrear(l, '¤', rampa, { base, pendiente: 1.1, borde: 5, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.25, ancho: 0.85 });
}

const RASGO: Record<MazoId, Rasgo> = {
  // ── La Barrendera: vieja de pañuelo carmesí a lunares, mechones grises, un ojo que lo mide todo y la escoba al hombro
  escoba: {
    fondo: '09vR',
    piel: '9spP',
    ceja: 'j',
    iris: 'c',
    cejaAlta: 1,
    atras: (l) => {
      // la escoba al hombro: el palo en diagonal y la paja arriba a la derecha
      l.trazo(50, 62, 56, 16, 1.6, '¤');
      sombrear(l, '¤', '9Nndx', { base: 0.6, borde: 1 });
      l.poli([[51, 16], [61, 16], [63, 2], [57, 5], [54, 1], [50, 4]], '¤');
      sombrear(l, '¤', '9zoOyY', { base: 0.6, pendiente: 1, borde: 2, fuerzaBorde: 0.45 });
      for (let i = 0; i < 5; i++) l.linea(52 + i * 2, 15, 51 + i * 3, 3, i > 2 ? 'z' : 'o');
      l.rect(51, 15, 11, 2, 'r').rect(51, 15, 11, 1, 'e');
    },
    ropa: (l) => {
      // el rebozo de lana, vino hondo, con su trama
      hombros(l, '9vRr', 0.42, 27);
      rayado(l, '9vRr', 'v', { angulo: '\\', paso: 4, caja: [CX - 27, 46, CX + 27, L - 1], hasta: 0.4 });
      l.poli([[CX - 6, 44], [CX, 52], [CX + 6, 44]], '¤');
      sombrear(l, '¤', '9hmw', { base: 0.7, borde: 1 });
    },
    boca: (l) => {
      // labios finos, apretados, que bajan en las comisuras
      l.linea(CX - 4, CY + 10, CX - 1, CY + 9, 'v').linea(CX - 1, CY + 9, CX + 3, CY + 9, 'v').linea(CX + 3, CY + 9, CX + 5, CY + 10, 'v');
      l.rect(CX - 1, CY + 10, 3, 1, 's');
    },
    encima: (l, c) => {
      // las arrugas del que mira fino
      l.linea(CX - 10, CY + 4, CX - 7, CY + 8, 's').linea(CX + 8, CY + 4, CX + 10, CY + 8, 's');
      l.rect(CX - 3, CY - 9, 2, 1, 's').rect(CX + 2, CY - 9, 3, 1, 's');
      // el pañuelo: cubre la cabeza, baja por las sienes y se anuda bajo el mentón
      l.poli([[CX - 14, CY - 4], [CX - 13, CY - 14], [CX - 6, CY - 19], [CX + 6, CY - 19], [CX + 13, CY - 14], [CX + 14, CY - 4], [CX + 11, CY - 9], [CX + 5, CY - 12], [CX - 5, CY - 12], [CX - 11, CY - 9]], '¤');
      l.poli([[CX - 14, CY - 5], [CX - 11, CY - 9], [CX - 11, CY + 8], [CX - 6, CY + 15], [CX - 9, CY + 17], [CX - 15, CY + 9]], '¤');
      l.poli([[CX + 14, CY - 5], [CX + 11, CY - 9], [CX + 11, CY + 8], [CX + 6, CY + 15], [CX + 9, CY + 17], [CX + 15, CY + 9]], '¤');
      l.poli([[CX - 6, CY + 15], [CX + 6, CY + 15], [CX + 4, CY + 19], [CX - 4, CY + 19]], '¤');
      sombrear(l, '¤', '9vRre', { base: 0.58, pendiente: 1.1, borde: 3, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.25, ancho: 0.8 });
      // los lunares de marfil
      for (const [x, y] of [[-9, -15], [-3, -17], [4, -16], [10, -13], [-13, 2], [13, 0], [-12, 9], [12, 8], [0, 17]]) l.set(CX + x, CY + y, 'w');
      // el nudo y sus dos puntas
      l.elipse(CX, CY + 18, 2.5, 2, 'r').set(CX - 1, CY + 17, 'e');
      l.poli([[CX - 2, CY + 19], [CX - 7, CY + 25], [CX - 3, CY + 24]], 'R').poli([[CX + 2, CY + 19], [CX + 7, CY + 25], [CX + 3, CY + 24]], 'v');
      // mechones grises que se escapan (más cuando va golpeada)
      l.linea(CX - 5, CY - 12, CX - 8, CY - 8, 'u').linea(CX - 3, CY - 12, CX - 4, CY - 9, 'J');
      if (c.herida > 0) l.linea(CX + 2, CY - 12, CX + 6, CY - 6, 'u').linea(CX + 5, CY - 12, CX + 9, CY - 8, 'J').linea(CX - 9, CY - 10, CX - 11, CY - 3, 'u');
    },
  },
  // ── El Paisano Bravo: sombrero negro ladeado, bigote, pañuelo carmesí al cuello y la ceja pícara
  truco: {
    fondo: '09Bb',
    piel: '9spP',
    ceja: '0',
    iris: 'n',
    cejaAlta: -1,
    ropa: (l) => {
      hombros(l, '9BbcC', 0.4, 27);
      rayado(l, '9BbcC', '9', { angulo: '|', paso: 5, caja: [CX - 27, 50, CX + 27, L - 1], hasta: 0.5 });
      // el pañuelo al cuello, anudado
      l.poli([[CX - 11, 45], [CX + 11, 45], [CX + 6, 53], [CX, 58], [CX - 6, 53]], '¤');
      sombrear(l, '¤', '9vRre', { base: 0.62, pendiente: 1, borde: 2, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.25 });
      l.elipse(CX, 48, 2.6, 2, 'e').set(CX - 1, 47, 'w');
    },
    boca: (l) => {
      // media sonrisa de costado, bajo el bigote
      l.linea(CX - 3, CY + 11, CX + 2, CY + 11, 'v').linea(CX + 2, CY + 11, CX + 5, CY + 9, 'v');
    },
    encima: (l, c) => {
      // patillas y bigote negro, tupido, de puntas caídas
      l.rect(CX - 12, CY - 8, 2, 9, '0').rect(CX + 11, CY - 8, 2, 9, '0');
      if (c.gesto !== 'feroz' && c.gesto !== 'mueca') l.poli([[CX - 8, CY + 9], [CX - 5, CY + 6], [CX, CY + 7], [CX + 5, CY + 6], [CX + 8, CY + 9], [CX + 4, CY + 8], [CX, CY + 9], [CX - 4, CY + 8]], '0');
      else l.poli([[CX - 8, CY + 7], [CX - 5, CY + 5], [CX, CY + 6], [CX + 5, CY + 5], [CX + 8, CY + 7], [CX, CY + 7]], '0');
      // la barba de dos días, tramada
      for (let y = CY + 9; y < CY + 15; y++) for (let x = CX - 9; x < CX + 10; x++) if ((x + y) % 3 === 0 && l.lleno(x, y, 'spP')) l.set(x, y, 's').marcar(x, y);
      // el sombrero: copa baja y ala ancha, ladeado sobre el ojo derecho
      l.poli([[CX - 21, CY - 9], [CX - 12, CY - 14], [CX + 12, CY - 17], [CX + 24, CY - 15], [CX + 22, CY - 11], [CX + 10, CY - 11], [CX - 12, CY - 8], [CX - 20, CY - 6]], '¤');
      l.poli([[CX - 11, CY - 13], [CX - 9, CY - 24], [CX + 8, CY - 27], [CX + 13, CY - 17]], '¤');
      sombrear(l, '¤', '90ijJ', { base: 0.34, pendiente: 1.1, borde: 3, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.35 });
      // la cinta del sombrero
      l.poli([[CX - 11, CY - 14], [CX + 13, CY - 18], [CX + 13, CY - 16], [CX - 11, CY - 12]], 'R');
      l.linea(CX - 11, CY - 14, CX + 13, CY - 18, 'r');
      l.rect(CX + 5, CY - 18, 3, 3, 'y').set(CX + 5, CY - 18, 'Y');
      if (c.herida > 0) l.linea(CX - 12, CY - 7, CX - 9, CY - 2, '0').linea(CX - 10, CY - 8, CX - 6, CY - 5, '0');
    },
  },
  // ── La Timbera del Club: visera verde de tallador, anteojos de carey, rodete y la boca del que saca cuentas
  chinchon: {
    fondo: '09Gg',
    piel: '9spP',
    ceja: 'N',
    iris: 'l',
    atras: (l) => {
      // el rodete alto y la melena recogida
      l.elipse(CX, CY - 4, 14.5, 15, '¤').elipse(CX + 3, CY - 19, 6.5, 5.5, '¤');
      sombrear(l, '¤', '90Nn', { base: 0.4, pendiente: 1, borde: 3, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.3 });
      l.trazo(CX - 2, CY - 23, CX + 9, CY - 15, 0.8, 'y');
    },
    ropa: (l) => {
      hombros(l, '9GglL', 0.42, 25);
      // el cuello de la blusa y el collar de perlas
      l.poli([[CX - 8, 44], [CX, 55], [CX + 8, 44], [CX + 5, 44], [CX, 51], [CX - 5, 44]], '¤');
      sombrear(l, '¤', '9hmw', { base: 0.72, borde: 1 });
      for (let i = -3; i <= 3; i++) l.set(CX + i * 2, 47 + Math.round(2.4 - Math.abs(i) * 0.8), 'w');
    },
    boca: (l) => {
      // labios pintados, rectos: ni frío ni calor
      l.rect(CX - 3, CY + 9, 7, 1, 'R').rect(CX - 2, CY + 10, 5, 1, 'r').set(CX - 4, CY + 9, 'v').set(CX + 4, CY + 9, 'v');
    },
    encima: (l, c) => {
      // los anteojos de carey, de marco grueso, con su brillo
      for (const lado of [-1, 1]) {
        const ex = CX + lado * 6;
        l.rect(ex - 5, CY - 6, 10, 1, 'N').rect(ex - 5, CY + 1, 10, 1, 'N').rect(ex - 5, CY - 6, 1, 8, 'N').rect(ex + 4, CY - 6, 1, 8, 'N');
        l.set(ex - 5, CY - 6, 'n').set(ex - 4, CY - 5, 'A');
      }
      l.rect(CX - 1, CY - 4, 2, 1, 'N').rect(CX - 13, CY - 5, 2, 1, 'N').rect(CX + 11, CY - 5, 2, 1, 'N');
      // los aros de oro
      l.rect(CX - 13, CY + 4, 2, 3, 'y').rect(CX + 12, CY + 4, 2, 3, 'o');
      // la visera verde, translúcida, que le tiñe la frente
      l.poli([[CX - 17, CY - 8], [CX - 12, CY - 13], [CX + 12, CY - 13], [CX + 17, CY - 8], [CX + 12, CY - 9], [CX - 12, CY - 9]], '¤');
      sombrear(l, '¤', '9GglLK', { base: 0.66, pendiente: 1, borde: 2, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.3 });
      l.rect(CX - 12, CY - 15, 25, 2, 'G').rect(CX - 12, CY - 15, 14, 1, 'g');
      for (let x = CX - 10; x < CX + 11; x++) for (let y = CY - 8; y < CY - 6; y++) if ((x + y) % 2 === 0 && l.lleno(x, y, 'spP')) l.set(x, y, 'l').marcar(x, y);
      // un mechón suelto cuando la despeinan
      if (c.herida > 0) l.linea(CX - 9, CY - 13, CX - 12, CY - 2, 'N').linea(CX - 7, CY - 13, CX - 9, CY - 7, 'n').linea(CX + 9, CY - 13, CX + 12, CY - 4, 'N');
    },
  },
  // ── El Chamuyero: pelo engominado, bigotito fino, sonrisa de costado con su diente de oro y el antifaz caído al cuello
  mentiroso: {
    fondo: '09fF',
    piel: '9spP',
    ceja: '0',
    iris: 'q',
    cejaAlta: 1,
    ropa: (l) => {
      hombros(l, '9fFqQ', 0.4, 26);
      // las solapas del saco y la camisa
      l.poli([[CX - 7, 44], [CX, 60], [CX + 7, 44]], '¤');
      sombrear(l, '¤', '9hmw', { base: 0.7, borde: 1 });
      l.poli([[CX - 9, 45], [CX - 2, 62], [CX - 13, 55]], 'f').poli([[CX + 9, 45], [CX + 2, 62], [CX + 13, 55]], '9');
      l.rect(CX - 1, 50, 2, 9, 'R').set(CX - 1, 50, 'r');
      // el antifaz caído, colgado del cuello
      l.poli([[CX - 12, 47], [CX - 5, 45], [CX, 48], [CX + 5, 45], [CX + 12, 47], [CX + 10, 53], [CX + 4, 54], [CX, 51], [CX - 4, 54], [CX - 10, 53]], '¤');
      sombrear(l, '¤', '9fFqQ', { base: 0.6, pendiente: 1, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.3 });
      hueco(l, CX - 6, 49.5, 2.6, 1.8, '09f', { curva: 1.1 });
      hueco(l, CX + 6, 49.5, 2.6, 1.8, '09f', { curva: 1.1 });
      l.linea(CX - 12, 47, CX - 5, 45, 'y').linea(CX + 5, 45, CX + 12, 47, 'o');
    },
    boca: (l) => {
      // la sonrisa cínica, de un solo lado, con el diente de oro
      l.linea(CX - 5, CY + 10, CX - 1, CY + 11, 'v').linea(CX - 1, CY + 11, CX + 4, CY + 10, 'v').linea(CX + 4, CY + 10, CX + 7, CY + 7, 'v');
      l.rect(CX + 1, CY + 9, 4, 1, 'w').set(CX + 3, CY + 9, 'y');
    },
    encima: (l, c) => {
      // el bigotito fino, de puntas hacia arriba
      l.linea(CX - 6, CY + 6, CX - 1, CY + 7, '0').linea(CX + 1, CY + 7, CX + 6, CY + 6, '0').set(CX - 7, CY + 5, '0').set(CX + 7, CY + 5, '0');
      // el pelo engominado hacia atrás, con su brillo y la raya al costado
      l.poli([[CX - 13, CY - 5], [CX - 12, CY - 15], [CX - 6, CY - 20], [CX + 7, CY - 20], [CX + 13, CY - 14], [CX + 13, CY - 5], [CX + 11, CY - 10], [CX + 6, CY - 13], [CX - 4, CY - 13], [CX - 10, CY - 10]], '¤');
      sombrear(l, '¤', '90iJu', { base: 0.36, pendiente: 1.1, borde: 2, fuerzaBorde: 0.4, brillo: 2, fuerzaBrillo: 0.45 });
      l.linea(CX - 5, CY - 19, CX - 3, CY - 13, '9');
      // el lunar
      l.set(CX - 6, CY + 4, '0');
      if (c.herida > 0) l.linea(CX - 2, CY - 13, CX + 3, CY - 6, '0').linea(CX, CY - 13, CX + 6, CY - 8, 'i').linea(CX - 8, CY - 12, CX - 10, CY - 6, '0');
    },
  },
  // ── El Manotazo: vincha de cuero, pelo revuelto, cicatriz, barba de días y los ojos tensos del que roba primero
  chancho: {
    fondo: '09Nn',
    piel: '9spP',
    ceja: 'N',
    iris: 'o',
    ojoY: CY - 1,
    atras: (l) => {
      // la melena revuelta
      l.elipse(CX, CY - 5, 15, 15, '¤');
      for (const [x, y] of [[-15, -4], [-13, 6], [15, -3], [14, 7], [-8, -19], [6, -20], [0, -21]]) l.poli([[CX + x - 3, CY + y], [CX + x * 1.25, CY + y * 1.2], [CX + x + 3, CY + y + 2]], '¤');
      sombrear(l, '¤', '9Nndx', { base: 0.42, pendiente: 1, borde: 3, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.3 });
    },
    ropa: (l) => {
      // camisa abierta y chaleco de cuero
      hombros(l, '9hmw', 0.55, 26);
      l.poli([[CX - 26, L], [CX - 22, 50], [CX - 9, 45], [CX - 4, L]], '¤').poli([[CX + 26, L], [CX + 22, 50], [CX + 9, 45], [CX + 4, L]], '¤');
      sombrear(l, '¤', '9Nndx', { base: 0.5, pendiente: 1.1, borde: 4, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.25 });
      l.poli([[CX - 5, 44], [CX, 56], [CX + 5, 44]], 's');
      for (const y of [52, 57]) l.set(CX - 7, y, 'y').set(CX + 7, y, 'o');
    },
    boca: (l) => {
      // la boca apretada, lista para el manotazo
      l.rect(CX - 4, CY + 10, 9, 1, 'v').set(CX - 5, CY + 11, 'v').set(CX + 5, CY + 11, 'v').rect(CX - 2, CY + 11, 5, 1, 's');
    },
    encima: (l, c) => {
      // la barba de días, tramada
      for (let y = CY + 6; y < CY + 15; y++) for (let x = CX - 11; x < CX + 12; x++) if ((x + y) % 2 === 0 && l.lleno(x, y, 'spP') && Math.abs(x - CX) + (y - CY - 6) > 6) l.set(x, y, 'N').marcar(x, y);
      // la cicatriz que le cruza la mejilla
      l.linea(CX + 5, CY - 8, CX + 9, CY + 6, 'R').set(CX + 6, CY - 3, 'e').set(CX + 8, CY + 2, 'e');
      // la vincha de cuero con su nudo y la tira que cuelga
      l.poli([[CX - 13, CY - 11], [CX + 13, CY - 11], [CX + 13, CY - 7], [CX - 13, CY - 7]], '¤');
      sombrear(l, '¤', '9vRre', { base: 0.56, pendiente: 1, borde: 1, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.25 });
      l.elipse(CX + 14, CY - 9, 2.4, 2.4, 'R').poli([[CX + 14, CY - 8], [CX + 19, CY], [CX + 16, CY - 1]], 'R').poli([[CX + 15, CY - 8], [CX + 21, CY - 5], [CX + 18, CY - 4]], 'v');
      // mechones sobre la frente (más cuando va golpeado)
      l.poli([[CX - 9, CY - 12], [CX - 5, CY - 7], [CX - 3, CY - 12]], 'n').poli([[CX + 1, CY - 12], [CX + 3, CY - 8], [CX + 6, CY - 12]], 'N');
      if (c.herida > 0) l.poli([[CX - 4, CY - 12], [CX - 1, CY - 4], [CX + 1, CY - 12]], 'n').poli([[CX - 13, CY - 8], [CX - 11, CY - 1], [CX - 9, CY - 8]], 'N');
    },
  },
};

const cache = new Map<string, string[]>();

/** El retrato de un Personaje en un cuadro (mirada, gesto y heridas), con su fondo. 64 × 64 celdas. */
export function personajeMapa(mazo: MazoId, c: Cuadro = CUADRO0): string[] {
  const clave = `${mazo}|${c.mirada}|${c.gesto}|${c.herida}`;
  const hecho = cache.get(clave);
  if (hecho) return hecho;
  const r = RASGO[mazo];
  const l = new Lienzo(L, L);
  fondo(l, r.fondo, c.gesto === 'caido');
  r.atras?.(l, c);
  r.ropa(l, c);
  // el cuello, en sombra
  l.rect(CX - 5, CY + 11, 11, 7, '¤');
  sombrear(l, '¤', r.piel, { base: 0.36, pendiente: 0.8, borde: 2, fuerzaBorde: 0.4 });
  // la cara: pómulos altos y mentón firme, en claroscuro tramado
  l.poli(r.cara ?? CARA, '¤');
  sombrear(l, '¤', r.piel, { base: c.gesto === 'caido' ? 0.5 : 0.62, pendiente: 1.15, borde: 4, fuerzaBorde: 0.5, brillo: 1, fuerzaBrillo: 0.2, ancho: 0.8 });
  // las orejas
  l.rect(CX - 14, CY - 3, 2, 6, r.piel[2]).rect(CX + 12, CY - 3, 2, 6, r.piel[1]);
  nariz(l, r);
  ojos(l, c, r);
  bocaGesto(l, c, () => r.boca(l, c));
  heridas(l, c, r);
  r.encima(l, c);
  // el sudor frío del que anda con poca Vida
  if (c.herida === 2 && c.gesto !== 'caido') l.rect(CX + 10, CY - 12, 1, 2, 'A').set(CX + 10, CY - 10, 'C');
  const m = l.mapa();
  cache.set(clave, m);
  return m;
}

/** Todos los cuadros que usa el HUD (para la forja y las pruebas). */
export function cuadros(): Cuadro[] {
  const out: Cuadro[] = [];
  for (const herida of [0, 1, 2] as Herida[]) {
    for (const mirada of [-1, 0, 1] as Mirada[]) out.push({ mirada, gesto: 'neutro', herida });
    for (const gesto of ['parpadeo', 'feroz', 'mueca'] as Gesto[]) out.push({ mirada: 0, gesto, herida });
  }
  out.push({ mirada: 0, gesto: 'caido', herida: 2 });
  return out;
}
