// Sprites 2D de cuerpo entero y animados para CÁBALA 2.0 (MVP):
//   5 Héroes (64×80, mirando a la derecha) · 4 Sotas (64×80, izquierda) · 4 Caballos (64×80, izquierda) · 4 Reyes (76×92, izquierda).
//   Estados por combatiente: 'idle' | 'ataca' | 'escudo' | 'herido' (2 cuadros cada uno).
//   Paleta Dark Dithered & Textured (paleta.ts), luz arriba-izquierda, sombra bajo los pies, cero cartas-enemigo.
import type { Palo, Rango } from '../../rules/cartas';
import type { MazoId } from '../../rules/mazos';
import { sombrear } from './dither';
import { Lienzo } from './pincel';
import type { Mapa } from './rejilla';

export type EstadoCombatiente = 'idle' | 'ataca' | 'escudo' | 'herido';
export const ESTADOS_COMBATIENTE: readonly EstadoCombatiente[] = ['idle', 'ataca', 'escudo', 'herido'];

export const HEROE_W = 64;
export const HEROE_H = 80;
export const ENEMIGO_W = 64;
export const ENEMIGO_H = 80;
export const REY_CUERPO_W = 76;
export const REY_CUERPO_H = 92;

interface Pose {
  dx: number;
  dy: number;
  armaDx: number;
  armaDy: number;
  capaDy: number;
}

function poseDe(estado: EstadoCombatiente, cuadro: 0 | 1, dir: 1 | -1): Pose {
  if (estado === 'ataca') return { dx: dir * (4 + cuadro), dy: -1, armaDx: dir * (7 + cuadro * 2), armaDy: -2, capaDy: -1 };
  if (estado === 'escudo') return { dx: -dir * 1, dy: 1, armaDx: dir * 2, armaDy: 1, capaDy: 1 };
  if (estado === 'herido') return { dx: -dir * (3 + cuadro), dy: 1, armaDx: -dir * 3, armaDy: 2, capaDy: -2 };
  return { dx: 0, dy: cuadro === 1 ? 1 : 0, armaDx: cuadro === 1 ? dir : 0, armaDy: cuadro === 1 ? 1 : 0, capaDy: cuadro === 1 ? 1 : 0 };
}

function sombraPies(l: Lienzo, cx: number, y: number, rx: number): void {
  l.elipse(cx, y, rx, 3, '9');
  l.elipse(cx, y, Math.max(4, rx - 3), 2, '0');
}

function fxEstado(l: Lienzo, estado: EstadoCombatiente, cuadro: 0 | 1, cx: number, cy: number, dir: 1 | -1): void {
  if (estado === 'escudo') {
    const sx = cx + dir * 16;
    for (let a = -12; a <= 12; a++) {
      const y = cy + a;
      const x = Math.round(sx + dir * (4 - (a * a) / 42));
      l.set(x, y, cuadro === 0 ? 'C' : 'A');
      l.set(x - dir, y, 'c');
    }
    l.elipse(sx + dir * 2, cy - 5, 2, 2, 'A');
  } else if (estado === 'herido') {
    const hx = cx - dir * 6;
    l.linea(hx - 6, cy - 10, hx + 6, cy + 4, cuadro === 0 ? 'w' : 'e');
    l.linea(hx + 6, cy - 10, hx - 6, cy + 4, 'r');
  } else if (estado === 'ataca') {
    const ax = cx + dir * 20;
    l.linea(ax - dir * 4, cy - 10, ax + dir * 5, cy + 2, 'w');
    l.linea(ax - dir * 5, cy - 8, ax + dir * 3, cy + 4, cuadro === 0 ? 'Y' : 'C');
  }
}

function cabezaPerfil(l: Lienzo, cx: number, cy: number, dir: 1 | -1, pelo: [string, string]): void {
  l.elipse(cx - dir * 1, cy, 7, 8, pelo[1]);
  l.elipse(cx + dir * 1, cy + 0.5, 6, 7, '§');
  l.rect(cx + dir * 6, cy, 1, 2, '§');
  sombrear(l, '§', '9spP', { base: 0.58, pendiente: 1.1, borde: 2, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.2 });
  // ojo
  l.set(cx + dir * 3, cy - 1, 'w');
  l.set(cx + dir * 4, cy - 1, 'k');
  // ceja firme
  l.linea(cx + dir * 1, cy - 3, cx + dir * 5, cy - 2, 'k');
  // flequillo
  l.rect(cx - 5, cy - 8, 10, 3, pelo[0]);
  l.sombra(pelo[0], pelo[1], 1, 1, 1, pelo[0] + pelo[1]);
}

// ───────────────────────── 5 HÉROES (64×80, derecha) ─────────────────────────

export function heroeMapa(mazo: MazoId, estado: EstadoCombatiente = 'idle', cuadro: 0 | 1 = 0): Mapa {
  const l = new Lienzo(HEROE_W, HEROE_H);
  const p = poseDe(estado, cuadro, 1);
  const cx = 28 + p.dx;
  const cy = 44 + p.dy;

  sombraPies(l, 29, 75, 14);

  // Piernas y botas criollas
  l.rect(cx - 7, cy + 12, 5, 17 - p.dy, 'N');
  l.rect(cx + 2, cy + 12, 5, 17 - p.dy, 'n');
  l.rect(cx - 8, cy + 25 - p.dy, 7, 4, '0');
  l.rect(cx + 2, cy + 25 - p.dy, 8, 4, '0');

  if (mazo === 'escoba') {
    // La Barrendera: vestido esmeralda/rojo, pañuelo carmesí, escoba de paja dorada
    l.poli([[cx - 12, cy - 4 + p.capaDy], [cx - 4, cy - 10], [cx - 2, cy + 14], [cx - 15, cy + 16 + p.capaDy]], 'R');
    l.poli([[cx - 8, cy - 10], [cx + 8, cy - 10], [cx + 11, cy + 16], [cx - 11, cy + 16]], 'g');
    sombrear(l, 'g', '9GgLK', { base: 0.52, borde: 2, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.25 });
    l.rect(cx - 7, cy + 2, 15, 12, 'h');
    cabezaPerfil(l, cx, cy - 19, 1, ['n', 'N']);
    // pañuelo carmesí
    l.poli([[cx - 8, cy - 24], [cx + 6, cy - 26], [cx + 4, cy - 29], [cx - 9, cy - 27]], 'r');
    l.linea(cx - 9, cy - 24, cx - 14, cy - 18 + p.capaDy, 'R');
    // escoba en diagonal
    const ax = cx + 8 + p.armaDx;
    const ay = cy - 6 + p.armaDy;
    l.trazo(ax - 12, ay + 16, ax + 14, ay - 16, 1.3, 'd');
    l.poli([[ax + 10, ay - 20], [ax + 20, ay - 26], [ax + 23, ay - 16], [ax + 13, ay - 12]], 'y');
    sombrear(l, 'y', '9zoOyY', { base: 0.55, borde: 1, fuerzaBorde: 0.4 });
  } else if (mazo === 'truco') {
    // El Paisano Bravo: poncho azul/oro, sombrero gaucho, facón brillante
    l.poli([[cx - 13, cy - 11], [cx + 12, cy - 11], [cx + 14, cy + 10], [cx - 14, cy + 12]], 'b');
    sombrear(l, 'b', '9BbcC', { base: 0.5, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.2 });
    l.rect(cx - 12, cy + 5, 25, 3, 'y');
    cabezaPerfil(l, cx, cy - 19, 1, ['0', '9']);
    // sombrero gaucho ladeado
    l.rect(cx - 12, cy - 26, 24, 3, 'N');
    l.rect(cx - 7, cy - 33, 14, 7, 'n');
    l.rect(cx - 7, cy - 28, 14, 2, 'r');
    // facón
    const ax = cx + 10 + p.armaDx;
    const ay = cy - 2 + p.armaDy;
    l.trazo(ax - 4, ay + 3, ax + 2, ay - 1, 1.5, 'y');
    l.poli([[ax + 2, ay - 2], [ax + 20, ay - 14], [ax + 16, ay - 6], [ax + 2, ay + 1]], 'A');
    l.linea(ax + 3, ay - 1, ax + 19, ay - 13, 'w');
  } else if (mazo === 'chinchon') {
    // La Timbera del Club: chaleco vino, visera verde, abanico de naipes
    l.rect(cx - 9, cy - 11, 18, 22, 'v');
    l.rect(cx - 6, cy - 10, 12, 20, 'h');
    l.rect(cx - 8, cy - 11, 5, 21, 'R');
    l.rect(cx + 3, cy - 11, 5, 21, 'R');
    cabezaPerfil(l, cx, cy - 19, 1, ['d', 'n']);
    // anteojos + visera verde
    l.rect(cx + 1, cy - 21, 6, 3, 'C');
    l.rect(cx - 8, cy - 27, 20, 3, 'L');
    l.rect(cx - 7, cy - 31, 14, 4, 'l');
    // abanico de naipes
    const ax = cx + 11 + p.armaDx;
    const ay = cy - 4 + p.armaDy;
    for (const [dx, dy, k] of [[0, 0, 'm'], [4, -3, 'w'], [8, -1, 'h']] as const) {
      l.rect(ax + dx, ay + dy - 6, 7, 10, k);
      l.set(ax + dx + 3, ay + dy - 2, 'r');
    }
  } else if (mazo === 'mentiroso') {
    // El Chamuyero: capa púrpura teatral, galera, dado de oro
    l.poli([[cx - 15, cy - 12], [cx + 8, cy - 12], [cx + 10, cy + 16], [cx - 17, cy + 17 + p.capaDy]], 'F');
    sombrear(l, 'F', '9fFqQ', { base: 0.5, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.25 });
    l.rect(cx - 6, cy - 11, 12, 22, '0');
    l.rect(cx - 2, cy - 9, 5, 18, 'r');
    cabezaPerfil(l, cx, cy - 19, 1, ['0', '9']);
    // antifaz + galera
    l.rect(cx - 1, cy - 21, 7, 3, 'q');
    l.rect(cx - 11, cy - 26, 22, 2, '0');
    l.rect(cx - 7, cy - 37, 14, 11, '0');
    l.rect(cx - 7, cy - 29, 14, 2, 'q');
    // dado dorado flotando
    const ax = cx + 13 + p.armaDx;
    const ay = cy - 8 + p.armaDy;
    l.rect(ax, ay, 8, 8, 'y');
    l.set(ax + 2, ay + 2, 'k');
    l.set(ax + 5, ay + 5, 'k');
    l.set(ax + 1, ay + 1, 'Y');
  } else {
    // El Manotazo (chancho): camisa remangada hueso, vincha roja, puño/guantelete gigante
    l.rect(cx - 9, cy - 11, 18, 22, 'h');
    l.rect(cx - 8, cy - 11, 16, 6, 'd');
    l.poli([[cx - 4, cy - 11], [cx + 5, cy - 11], [cx + 2, cy - 4]], 'r');
    cabezaPerfil(l, cx, cy - 19, 1, ['N', '0']);
    // vincha roja con cintas atrás
    l.rect(cx - 7, cy - 26, 14, 3, 'r');
    l.linea(cx - 8, cy - 25, cx - 15, cy - 22 + p.capaDy, 'R');
    // mano gigante listísima para palmear
    const ax = cx + 10 + p.armaDx;
    const ay = cy - 3 + p.armaDy;
    l.elipse(ax + 4, ay, 7, 6, 'P');
    l.rect(ax + 8, ay - 5, 6, 2, 'p');
    l.rect(ax + 9, ay - 2, 7, 2, 'P');
    l.rect(ax + 9, ay + 1, 7, 2, 'p');
    l.rect(ax + 8, ay + 4, 5, 2, 's');
  }

  fxEstado(l, estado, cuadro, cx, cy - 4, 1);
  return l.mapa();
}

// ───────────────────────── 12 ENEMIGOS (izquierda) ─────────────────────────

const PALO_RAMPAS: Record<Palo, { ropa: string; capa: string }> = {
  S: { ropa: '9BbcCA', capa: '9vRre' },
  C: { ropa: '9GglLK', capa: '9vRre' },
  D: { ropa: '9zoOyY', capa: '9BbcC' },
  H: { ropa: '9vRre', capa: '9GglL' },
};

function armaPalo(l: Lienzo, palo: Palo, ax: number, ay: number): void {
  if (palo === 'S') {
    l.trazo(ax + 6, ay + 10, ax - 14, ay - 16, 1.3, 'A');
    l.linea(ax + 4, ay + 8, ax - 15, ay - 17, 'w');
    l.rect(ax + 2, ay + 6, 8, 2, 'y');
  } else if (palo === 'C') {
    l.trazo(ax + 6, ay + 10, ax - 10, ay - 14, 2.2, 'd');
    l.elipse(ax - 11, ay - 15, 4, 4, 'n');
    l.set(ax - 13, ay - 17, 'x');
  } else if (palo === 'D') {
    l.elipse(ax - 4, ay - 4, 7, 7, 'y');
    l.elipse(ax - 5, ay - 5, 4, 4, 'Y');
    l.set(ax - 4, ay - 4, 'O');
  } else {
    l.trazo(ax + 2, ay + 8, ax + 2, ay - 2, 1.2, 'y');
    l.poli([[ax - 5, ay - 10], [ax + 9, ay - 10], [ax + 6, ay - 2], [ax - 2, ay - 2]], 'y');
    l.rect(ax - 2, ay - 11, 8, 2, 'r');
  }
}

export function enemigoMapa(palo: Palo, rango: Rango, estado: EstadoCombatiente = 'idle', cuadro: 0 | 1 = 0, segunda = false): Mapa {
  const esRey = rango === 12;
  const W = esRey ? REY_CUERPO_W : ENEMIGO_W;
  const H = esRey ? REY_CUERPO_H : ENEMIGO_H;
  const l = new Lienzo(W, H);
  const p = poseDe(estado, cuadro, -1);
  const rampas = PALO_RAMPAS[palo];
  const ropaBase = rampas.ropa[2];
  const capaBase = rampas.capa[2];

  if (rango === 10) {
    // Sota (10): paje ágil de cuerpo entero mirando a la izquierda
    const cx = 35 + p.dx;
    const cy = 45 + p.dy;
    sombraPies(l, 34, 75, 13);
    l.rect(cx - 7, cy + 12, 5, 16 - p.dy, '0');
    l.rect(cx + 2, cy + 12, 5, 16 - p.dy, '9');
    l.poli([[cx + 3, cy - 10], [cx + 15, cy - 6 + p.capaDy], [cx + 17, cy + 16 + p.capaDy], [cx + 2, cy + 12]], capaBase);
    sombrear(l, capaBase, rampas.capa, { base: 0.5, borde: 2, fuerzaBorde: 0.4 });
    l.poli([[cx - 9, cy - 11], [cx + 8, cy - 11], [cx + 10, cy + 14], [cx - 10, cy + 14]], ropaBase);
    sombrear(l, ropaBase, rampas.ropa, { base: 0.54, borde: 2, fuerzaBorde: 0.4, brillo: 1, fuerzaBrillo: 0.25 });
    l.rect(cx - 9, cy + 3, 18, 2, 'y');
    cabezaPerfil(l, cx, cy - 19, -1, ['d', 'n']);
    // gorra emplumada
    l.rect(cx - 8, cy - 28, 16, 4, ropaBase);
    l.linea(cx + 2, cy - 28, cx + 10, cy - 35, 'Y');
    armaPalo(l, palo, cx - 10 + p.armaDx, cy - 2 + p.armaDy);
    fxEstado(l, estado, cuadro, cx, cy - 4, -1);
  } else if (rango === 11) {
    // Caballo (11): jinete blindado sobre corcel gris mirando a la izquierda
    const cx = 36 + p.dx;
    const cy = 48 + p.dy;
    sombraPies(l, 34, 75, 18);
    // patas del caballo
    l.rect(cx - 16, cy + 12, 4, 14 - p.dy, 'j');
    l.rect(cx - 9, cy + 13, 4, 13 - p.dy, 'i');
    l.rect(cx + 7, cy + 13, 4, 13 - p.dy, 'i');
    l.rect(cx + 14, cy + 12, 4, 14 - p.dy, 'j');
    // cuerpo + gualdrapa del palo
    l.elipse(cx, cy + 5, 18, 9, 'J');
    l.poli([[cx - 14, cy + 1], [cx + 14, cy + 1], [cx + 16, cy + 13], [cx - 16, cy + 13]], ropaBase);
    sombrear(l, ropaBase, rampas.ropa, { base: 0.54, borde: 2, fuerzaBorde: 0.4 });
    // cuello y cabeza del caballo a la izquierda
    l.poli([[cx - 12, cy + 2], [cx - 22, cy - 12], [cx - 15, cy - 15], [cx - 6, cy - 1]], 'J');
    l.poli([[cx - 22, cy - 13], [cx - 28, cy - 5], [cx - 23, cy - 3], [cx - 16, cy - 9]], 'j');
    l.set(cx - 21, cy - 10, 'Y');
    // jinete encima
    l.rect(cx - 5, cy - 14, 13, 15, capaBase);
    l.rect(cx - 4, cy - 24, 10, 10, 'j'); // yelmo
    l.rect(cx - 5, cy - 20, 6, 2, '0');
    l.linea(cx + 1, cy - 25, cx + 7, cy - 32, 'y');
    armaPalo(l, palo, cx - 12 + p.armaDx, cy - 8 + p.armaDy);
    fxEstado(l, estado, cuadro, cx - 4, cy - 6, -1);
  } else {
    // Rey Jefe (12): figura imponente 76×92 con manto, armiño, corona y aura de segunda cara
    const cx = 40 + p.dx;
    const cy = 50 + p.dy;
    sombraPies(l, 40, 86, 20);
    if (segunda) {
      l.elipse(cx, cy - 4, 24, 32, 'v');
      l.elipse(cx, cy - 4, 20, 28, '9');
    }
    // manto real largo
    l.poli([[cx - 6, cy - 16], [cx + 18, cy - 12 + p.capaDy], [cx + 22, cy + 32 + p.capaDy], [cx - 14, cy + 32]], capaBase);
    sombrear(l, capaBase, rampas.capa, { base: 0.5, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.2 });
    // túnica frontal
    l.poli([[cx - 13, cy - 16], [cx + 10, cy - 16], [cx + 12, cy + 30], [cx - 14, cy + 30]], ropaBase);
    sombrear(l, ropaBase, rampas.ropa, { base: 0.56, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.28 });
    // esclavina de armiño
    l.poli([[cx - 14, cy - 17], [cx + 13, cy - 17], [cx + 15, cy - 9], [cx - 15, cy - 9]], 'm');
    for (const dx of [-9, -3, 3, 9]) l.set(cx + dx, cy - 13, '0');
    // cabeza + barba real
    cabezaPerfil(l, cx - 1, cy - 26, -1, ['0', '9']);
    l.poli([[cx - 7, cy - 22], [cx + 4, cy - 22], [cx + 2, cy - 12], [cx - 5, cy - 12]], palo === 'H' ? 'w' : palo === 'D' ? 'y' : '0');
    if (segunda) l.set(cx - 4, cy - 27, 'r');
    // corona única por palo
    l.rect(cx - 10, cy - 37, 19, 4, 'y');
    for (const dx of [-8, -3, 2, 7]) l.rect(cx + dx, cy - 44, 3, 7, palo === 'S' ? 'A' : palo === 'C' ? 'L' : 'Y');
    armaPalo(l, palo, cx - 16 + p.armaDx, cy - 4 + p.armaDy);
    fxEstado(l, estado, cuadro, cx - 4, cy - 6, -1);
  }

  return l.mapa();
}
