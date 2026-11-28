// Sprites 2D de cuerpo entero y animados para CÁBALA 2.0 (MVP):
//   5 Héroes (80×112, mirando a la derecha, litografía tramada oscura)
//   4 Sotas · 4 Caballos (96×140, izquierda, arte completo de figuras.ts)
//   4 Reyes Jefe (104×148, izquierda, arte completo de figuras.ts + aura de Segunda Cara)
//   Estados por combatiente: 'idle' | 'ataca' | 'escudo' | 'herido' (2 cuadros cada uno).
import type { Palo, Rango } from '../../rules/cartas';
import type { MazoId } from '../../rules/mazos';
import { sombrear } from './dither';
import { FIG_H, FIG_W, figuraLienzo, figuraSegunda } from './figuras';
import { Lienzo } from './pincel';
import type { Mapa } from './rejilla';

export type EstadoCombatiente = 'idle' | 'ataca' | 'escudo' | 'herido';
export const ESTADOS_COMBATIENTE: readonly EstadoCombatiente[] = ['idle', 'ataca', 'escudo', 'herido'];

export const HEROE_W = 80;
export const HEROE_H = 112;
export const ENEMIGO_W = 96;
export const ENEMIGO_H = 140;
export const REY_CUERPO_W = 104;
export const REY_CUERPO_H = 148;

interface Pose {
  dx: number;
  dy: number;
  armaDx: number;
  armaDy: number;
  capaDy: number;
}

function poseDe(estado: EstadoCombatiente, cuadro: 0 | 1, dir: 1 | -1): Pose {
  if (estado === 'ataca') return { dx: dir * (5 + cuadro * 2), dy: -2, armaDx: dir * (9 + cuadro * 2), armaDy: -3, capaDy: -2 };
  if (estado === 'escudo') return { dx: -dir * 2, dy: 0, armaDx: dir * 2, armaDy: 1, capaDy: 1 };
  if (estado === 'herido') return { dx: -dir * (4 + cuadro * 2), dy: 1, armaDx: -dir * 4, armaDy: 3, capaDy: -2 };
  return { dx: 0, dy: cuadro === 1 ? -1 : 0, armaDx: cuadro === 1 ? dir : 0, armaDy: cuadro === 1 ? -1 : 0, capaDy: cuadro === 1 ? 1 : 0 };
}

function sombraPies(l: Lienzo, cx: number, y: number, rx: number): void {
  l.elipse(cx, y, rx, 4, '9');
  l.elipse(cx, y, Math.max(5, rx - 4), 2, '0');
}

function fxEstado(l: Lienzo, estado: EstadoCombatiente, cuadro: 0 | 1, cx: number, cy: number, dir: 1 | -1): void {
  if (estado === 'escudo') {
    const sx = cx + dir * 22;
    for (let a = -18; a <= 18; a++) {
      const y = cy + a;
      const x = Math.round(sx + dir * (6 - (a * a) / 60));
      l.set(x, y, cuadro === 0 ? 'C' : 'A');
      l.set(x - dir, y, 'c');
    }
    l.elipse(sx + dir * 3, cy - 8, 2, 2, 'A');
  } else if (estado === 'herido') {
    const hx = cx - dir * 6;
    l.linea(hx - 8, cy - 14, hx + 8, cy + 6, cuadro === 0 ? 'w' : 'e');
    l.linea(hx + 8, cy - 14, hx - 8, cy + 6, 'r');
  } else if (estado === 'ataca') {
    const ax = cx + dir * 26;
    l.linea(ax - dir * 5, cy - 16, ax + dir * 7, cy + 6, 'w');
    l.linea(ax - dir * 6, cy - 14, ax + dir * 5, cy + 8, cuadro === 0 ? 'Y' : 'C');
  }
}

function cabezaLitografia(l: Lienzo, cx: number, cy: number, pelo: [string, string]): void {
  // melena trasera + perfil severo 3/4 mirando a la derecha
  l.elipse(cx - 2, cy - 1, 9, 10, '¤');
  l.rect(cx - 10, cy, 7, 9, '¤');
  sombrear(l, '¤', `9${pelo[1]}${pelo[0]}`, { base: 0.48, pendiente: 1.0, borde: 2, fuerzaBorde: 0.4, brillo: 0 });
  l.elipse(cx + 1, cy + 0.5, 7.5, 9, '§');
  l.rect(cx + 8, cy + 1, 1.5, 2, '§'); // nariz de perfil
  sombrear(l, '§', '9spP', { base: 0.58, pendiente: 1.15, borde: 2, fuerzaBorde: 0.42, brillo: 1, fuerzaBrillo: 0.2, ancho: 0.8 });
  l.rect(cx - 6, cy, 2, 3, 's'); // oreja
  // flequillo
  l.poli(
    [
      [cx - 8, cy - 6],
      [cx - 3, cy - 10],
      [cx + 6, cy - 9],
      [cx + 8, cy - 4],
      [cx + 2, cy - 6],
      [cx - 5, cy - 4],
    ],
    pelo[0],
  );
  l.sombra(pelo[0], pelo[1], 1, 1, 1, pelo[0] + pelo[1]);
  // ojos + ceja firme + boca
  l.rect(cx + 1, cy - 1, 1, 2, 'k').rect(cx + 5, cy - 1, 1, 2, 'k');
  l.set(cx + 1, cy - 2, 's').set(cx + 5, cy - 2, 's');
  l.linea(cx - 1, cy - 4, cx + 3, cy - 3, 'k').linea(cx + 4, cy - 3, cx + 8, cy - 4, 'k');
  l.rect(cx + 1, cy + 5, 4, 1, 'v');
}

// ───────────────────────── 5 HÉROES (80×112, derecha) ─────────────────────────

export function heroeMapa(mazo: MazoId, estado: EstadoCombatiente = 'idle', cuadro: 0 | 1 = 0): Mapa {
  const l = new Lienzo(HEROE_W, HEROE_H);
  const p = poseDe(estado, cuadro, 1);
  const cx = 36 + p.dx;
  const cy = 62 + p.dy;

  sombraPies(l, 38, 106, 20);

  // Piernas y botas criollas tramadas
  l.rect(cx - 9, cy + 16, 6, 24 - p.dy, '¤');
  l.rect(cx + 3, cy + 16, 6, 24 - p.dy, '¤');
  sombrear(l, '¤', '90Nn', { base: 0.5, borde: 1, fuerzaBorde: 0.4 });
  l.rect(cx - 10, cy + 35 - p.dy, 9, 5, '0');
  l.rect(cx + 3, cy + 35 - p.dy, 10, 5, '0');

  if (mazo === 'escoba') {
    // La Barrendera: falda esmeralda tramada, delantal hueso, pañuelo carmesí y escoba dorada
    l.poli(
      [
        [cx - 15, cy - 8 + p.capaDy],
        [cx - 4, cy - 14],
        [cx - 2, cy + 18],
        [cx - 19, cy + 21 + p.capaDy],
      ],
      'R',
    );
    l.poli(
      [
        [cx - 10, cy - 15],
        [cx + 10, cy - 15],
        [cx + 15, cy + 23],
        [cx - 14, cy + 23],
      ],
      'g',
    );
    sombrear(l, 'g', '9GgLK', { base: 0.54, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.25 });
    l.poli(
      [
        [cx - 7, cy + 2],
        [cx + 9, cy + 2],
        [cx + 12, cy + 19],
        [cx - 9, cy + 19],
      ],
      'h',
    );
    sombrear(l, 'h', '9mhw', { base: 0.62, borde: 1, fuerzaBorde: 0.35 });
    cabezaLitografia(l, cx, cy - 26, ['n', 'N']);
    // pañuelo carmesí
    l.poli(
      [
        [cx - 10, cy - 33],
        [cx + 8, cy - 36],
        [cx + 6, cy - 40],
        [cx - 11, cy - 37],
      ],
      'r',
    );
    l.linea(cx - 10, cy - 34, cx - 18, cy - 24 + p.capaDy, 'R');
    // escoba en diagonal
    const ax = cx + 10 + p.armaDx;
    const ay = cy - 8 + p.armaDy;
    l.trazo(ax - 15, ay + 22, ax + 18, ay - 22, 1.5, 'd');
    l.poli(
      [
        [ax + 13, ay - 27],
        [ax + 26, ay - 35],
        [ax + 30, ay - 22],
        [ax + 17, ay - 17],
      ],
      'y',
    );
    sombrear(l, 'y', '9zoOyY', { base: 0.55, borde: 1, fuerzaBorde: 0.4 });
  } else if (mazo === 'truco') {
    // El Paisano Bravo: poncho azul acero con guarda pampa oro, sombrero gaucho y facón
    l.poli(
      [
        [cx - 17, cy - 15],
        [cx + 15, cy - 15],
        [cx + 19, cy + 14],
        [cx - 19, cy + 17],
      ],
      'b',
    );
    sombrear(l, 'b', '9BbcC', { base: 0.52, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.22 });
    l.rect(cx - 16, cy + 8, 33, 3, 'y');
    l.rect(cx - 14, cy + 12, 29, 2, 'r');
    cabezaLitografia(l, cx, cy - 26, ['0', '9']);
    // sombrero gaucho ladeado
    l.rect(cx - 15, cy - 35, 31, 3, 'N');
    l.rect(cx - 9, cy - 44, 18, 9, 'n');
    l.rect(cx - 9, cy - 37, 18, 2, 'r');
    // facón criollo
    const ax = cx + 13 + p.armaDx;
    const ay = cy - 3 + p.armaDy;
    l.trazo(ax - 5, ay + 4, ax + 3, ay - 1, 1.6, 'y');
    l.poli(
      [
        [ax + 3, ay - 2],
        [ax + 26, ay - 18],
        [ax + 21, ay - 8],
        [ax + 3, ay + 2],
      ],
      'A',
    );
    l.linea(ax + 4, ay - 1, ax + 25, ay - 17, 'w');
  } else if (mazo === 'chinchon') {
    // La Timbera del Club: chaleco vino tramado, camisa marfil, visera esmeralda, abanico de naipes
    l.rect(cx - 12, cy - 15, 24, 30, 'h');
    l.poli(
      [
        [cx - 12, cy - 15],
        [cx - 3, cy - 15],
        [cx - 3, cy + 15],
        [cx - 12, cy + 15],
      ],
      'R',
    );
    l.poli(
      [
        [cx + 3, cy - 15],
        [cx + 12, cy - 15],
        [cx + 12, cy + 15],
        [cx + 3, cy + 15],
      ],
      'R',
    );
    sombrear(l, 'R', '9vRr', { base: 0.52, borde: 1, fuerzaBorde: 0.4 });
    cabezaLitografia(l, cx, cy - 26, ['d', 'n']);
    // anteojos + visera verde
    l.rect(cx + 1, cy - 28, 7, 3, 'C');
    l.rect(cx - 10, cy - 36, 25, 3, 'L');
    l.rect(cx - 9, cy - 41, 18, 5, 'l');
    // abanico de naipes
    const ax = cx + 14 + p.armaDx;
    const ay = cy - 6 + p.armaDy;
    for (const [dx, dy, k] of [
      [0, 0, 'm'],
      [5, -4, 'w'],
      [10, -1, 'h'],
    ] as const) {
      l.rect(ax + dx, ay + dy - 8, 9, 13, k);
      l.set(ax + dx + 4, ay + dy - 3, 'r');
    }
  } else if (mazo === 'mentiroso') {
    // El Chamuyero: capa púrpura teatral tramada, frac oscuro, galera y dado dorado
    l.poli(
      [
        [cx - 20, cy - 16],
        [cx + 10, cy - 16],
        [cx + 13, cy + 22],
        [cx - 23, cy + 24 + p.capaDy],
      ],
      'F',
    );
    sombrear(l, 'F', '9fFqQ', { base: 0.5, borde: 2, fuerzaBorde: 0.45, brillo: 1, fuerzaBrillo: 0.25 });
    l.rect(cx - 8, cy - 15, 16, 30, '0');
    l.rect(cx - 2, cy - 12, 6, 24, 'r');
    cabezaLitografia(l, cx, cy - 26, ['0', '9']);
    // antifaz + galera
    l.rect(cx - 1, cy - 28, 9, 3, 'q');
    l.rect(cx - 14, cy - 35, 28, 3, '0');
    l.rect(cx - 9, cy - 49, 18, 14, '0');
    l.rect(cx - 9, cy - 38, 18, 2, 'q');
    // dado dorado flotando
    const ax = cx + 16 + p.armaDx;
    const ay = cy - 10 + p.armaDy;
    l.rect(ax, ay, 10, 10, 'y');
    l.set(ax + 2, ay + 2, 'k');
    l.set(ax + 7, ay + 7, 'k');
    l.set(ax + 2, ay + 7, 'k');
    l.set(ax + 7, ay + 2, 'k');
    l.set(ax + 1, ay + 1, 'Y');
  } else {
    // El Manotazo (chancho): camisa remangada hueso, pañuelo rojo, vincha y guantelete gigante
    l.poli(
      [
        [cx - 12, cy - 15],
        [cx + 12, cy - 15],
        [cx + 13, cy + 16],
        [cx - 13, cy + 16],
      ],
      'h',
    );
    sombrear(l, 'h', '9mhw', { base: 0.58, borde: 2, fuerzaBorde: 0.4 });
    l.poli(
      [
        [cx - 6, cy - 15],
        [cx + 7, cy - 15],
        [cx + 3, cy - 5],
      ],
      'r',
    );
    cabezaLitografia(l, cx, cy - 26, ['N', '0']);
    // vincha roja con cintas atrás
    l.rect(cx - 9, cy - 35, 18, 4, 'r');
    l.linea(cx - 10, cy - 34, cx - 20, cy - 29 + p.capaDy, 'R');
    // mano gigante listísima para palmear
    const ax = cx + 12 + p.armaDx;
    const ay = cy - 4 + p.armaDy;
    l.elipse(ax + 6, ay, 9, 8, 'P');
    l.rect(ax + 11, ay - 7, 8, 3, 'p');
    l.rect(ax + 12, ay - 3, 9, 3, 'P');
    l.rect(ax + 12, ay + 1, 9, 3, 'p');
    l.rect(ax + 11, ay + 5, 7, 3, 's');
  }

  fxEstado(l, estado, cuadro, cx, cy - 6, 1);
  return l.mapa();
}

// ───────────────────────── 12 ENEMIGOS (arte completo de figuras.ts) ─────────────────────────

export function enemigoMapa(palo: Palo, rango: Rango, estado: EstadoCombatiente = 'idle', cuadro: 0 | 1 = 0, segunda = false): Mapa {
  const esRey = rango === 12;
  const W = esRey ? REY_CUERPO_W : ENEMIGO_W;
  const H = esRey ? REY_CUERPO_H : ENEMIGO_H;
  const l = new Lienzo(W, H);
  const p = poseDe(estado, cuadro, -1);
  const r = esRey ? 12 : rango === 11 ? 11 : 10;

  // Sombra apoyada en el suelo de la arena
  sombraPies(l, Math.floor(W / 2), H - 5, esRey ? 30 : r === 11 ? 32 : 24);

  // Aura carmesí de Segunda Cara detrás del Rey
  if (esRey && segunda) {
    l.elipse(Math.floor(W / 2), Math.floor(H / 2), 38 + cuadro, 54 + cuadro, 'v');
    l.elipse(Math.floor(W / 2), Math.floor(H / 2), 31, 46, 'R');
  }

  const fig = esRey && segunda ? figuraSegunda(palo) : figuraLienzo(palo, r);
  const ox = Math.floor((W - FIG_W) / 2) + p.dx;
  const oy = Math.max(0, H - FIG_H - 4) + p.dy;
  l.pegar(fig, ox, oy);

  fxEstado(l, estado, cuadro, Math.floor(W / 2) + p.dx, Math.floor(H / 2) + p.dy, -1);
  return l.mapa();
}
