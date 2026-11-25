// El Palacio del Rey (0.48.0): calabozo cenital HD-2D estilo Pokémon antes de cada Rey Jefe.
import type { Palo } from '../../rules/cartas';
import { CHICHE, huecosChiche, type ChicheId } from '../../rules/chiches';
import type { Partida } from '../../rules/estado';
import { REY_DEF } from '../../rules/reyes';
import { t, tx } from '../almacen';
import { sonar } from '../audio';
import { enFoto } from '../fx/motor';
import { guardar, irCaminoSol, pintarFase } from '../juego';
import { $, pantallaActual, type Pantalla } from '../ui';

const COLS = 15;
const FILAS = 11;
const TILE = 48;
const ANCHO = COLS * TILE;
const ALTO = FILAS * TILE;

type Dir = 'arriba' | 'abajo' | 'izq' | 'der';

interface Cofre {
  x: number;
  y: number;
  abierto: boolean;
  tipo: 'oro' | 'forja' | 'reliquia';
}

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  color: string;
}

interface PaletaPalacio {
  muroTope: string;
  muroCara: string;
  muroBorde: string;
  pisoA: string;
  pisoB: string;
  alfombra: string;
  alfombraBorde: string;
  acento: string;
  luz: string;
}

const PALETAS: Record<Palo, PaletaPalacio> = {
  S: {
    muroTope: '#0c1628',
    muroCara: '#1b2f4d',
    muroBorde: '#375c8a',
    pisoA: '#121b2c',
    pisoB: '#162136',
    alfombra: '#123d5c',
    alfombraBorde: '#00c8ff',
    acento: '#00e5ff',
    luz: 'rgba(0, 200, 255, 0.24)',
  },
  C: {
    muroTope: '#0d1a10',
    muroCara: '#243d22',
    muroBorde: '#45733e',
    pisoA: '#131f14',
    pisoB: '#182819',
    alfombra: '#1e4a27',
    alfombraBorde: '#22f06a',
    acento: '#22f06a',
    luz: 'rgba(34, 240, 106, 0.22)',
  },
  D: {
    muroTope: '#1a1207',
    muroCara: '#3d2a0f',
    muroBorde: '#8f6722',
    pisoA: '#1d150c',
    pisoB: '#261c10',
    alfombra: '#5c3c0e',
    alfombraBorde: '#ffd500',
    acento: '#ffd500',
    luz: 'rgba(255, 213, 0, 0.24)',
  },
  H: {
    muroTope: '#1a0812',
    muroCara: '#421227',
    muroBorde: '#85244b',
    pisoA: '#1c0c15',
    pisoB: '#24101b',
    alfombra: '#5e132f',
    alfombraBorde: '#ff1e5c',
    acento: '#ff1e5c',
    luz: 'rgba(255, 30, 92, 0.24)',
  },
};

const MAPA_BASE = [
  '###############',
  '#......G......#',
  '#.............#',
  '#...P.....P...#',
  '#.............#',
  '#.............#',
  '#.............#',
  '#...P.....P...#',
  '#.............#',
  '#......C......#',
  '###############',
];

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function pantallaPalacio(p: Partida, opts?: { palo?: Palo; puzzle?: 0 | 1 | 2 }): Pantalla {
  const tramo = p.tramos[p.acto] ?? p.tramos[0];
  const palo: Palo = opts?.palo ?? tramo?.rey ?? 'S';
  const pal = PALETAS[palo];
  const rey = REY_DEF[palo];
  const h = hashSeed(`${p.semilla}:${p.acto}:${palo}`);
  const puzzleTipo: 0 | 1 | 2 = opts?.puzzle ?? ((h % 3) as 0 | 1 | 2);

  let px = 7;
  let py = 9;
  let rx = px * TILE;
  let ry = py * TILE;
  let dir: Dir = 'arriba';
  let pasoAnim = 0;
  let puertaAbierta = false;
  let saliendo = false;
  let raf = 0;
  let onKeyDown: ((ev: KeyboardEvent) => void) | null = null;
  let toastTimer = 0;
  let reloj = 0;
  const cola: { x: number; y: number }[] = [];
  const particulas: Particula[] = [];

  const bufonPos = { x: 5, y: 9 };
  const cofres: Cofre[] = [
    { x: 2, y: 7, abierto: false, tipo: 'oro' },
    { x: 12, y: 7, abierto: false, tipo: 'forja' },
    { x: 2, y: 3, abierto: false, tipo: 'reliquia' },
  ];

  // Puzzle 0: Acertijo del 15
  const losas15 = [
    { x: 5, y: 6, val: 3, activa: false },
    { x: 6, y: 4, val: 5, activa: false },
    { x: 8, y: 4, val: 7, activa: false },
    { x: 9, y: 6, val: 8, activa: false },
  ];

  // Puzzle 1: Los 4 Braseros
  const braseros = [
    { x: 2, y: 5, encendido: false },
    { x: 12, y: 5, encendido: false },
    { x: 5, y: 3, encendido: false },
    { x: 9, y: 3, encendido: false },
  ];

  // Puzzle 2: Orden de los Palos
  const otrosPalos = (['S', 'C', 'D', 'H'] as const).filter((s) => s !== palo);
  const ordenObjetivo: Palo[] = [palo, otrosPalos[h % 3], otrosPalos[(h + 1) % 3]];
  const placasPalo = [
    { x: 5, y: 5, palo: ordenObjetivo[1], activa: false },
    { x: 7, y: 5, palo: ordenObjetivo[0], activa: false },
    { x: 9, y: 5, palo: ordenObjetivo[2], activa: false },
  ];
  let ordenProgreso = 0;

  const esSolido = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= COLS || y >= FILAS) return true;
    const ch = MAPA_BASE[y][x];
    if (ch === '#' || ch === 'P') return true;
    if (ch === 'G' && !puertaAbierta) return true;
    if (x === bufonPos.x && y === bufonPos.y) return true;
    if (cofres.some((c) => c.x === x && c.y === y)) return true;
    if (puzzleTipo === 1 && braseros.some((b) => b.x === x && b.y === y)) return true;
    return false;
  };

  const estallar = (gx: number, gy: number, color: string, cant = 14): void => {
    const cx = gx * TILE + TILE / 2;
    const cy = gy * TILE + TILE / 2;
    for (let i = 0; i < cant; i++) {
      const a = (i / cant) * Math.PI * 2 + Math.random() * 0.4;
      const v = 35 + Math.random() * 65;
      particulas.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 18, vida: 0.75, color });
    }
  };

  const mostrarToast = (msg: string): void => {
    const el = $<HTMLElement>('.palacio-toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      if (el.isConnected) el.hidden = true;
    }, 3200);
  };

  const actualizarMeta = (): void => {
    const cofEl = $<HTMLElement>('[data-pal-cofres]');
    if (cofEl) cofEl.textContent = t('palacioCofres', { n: cofres.filter((c) => c.abierto).length });

    const pistaEl = $<HTMLElement>('[data-pal-pista]');
    if (pistaEl) {
      if (puertaAbierta) pistaEl.textContent = t('palacioPuertaAbierta');
      else if (puzzleTipo === 0) {
        const s = losas15.reduce((acc, l) => acc + (l.activa ? l.val : 0), 0);
        pistaEl.textContent = t('palacioPista15', { s });
      } else if (puzzleTipo === 1) {
        pistaEl.textContent = t('palacioPistaBraseros', { n: braseros.filter((b) => b.encendido).length });
      } else {
        pistaEl.textContent = t('palacioPistaOrden', { n: ordenProgreso });
      }
    }

    const vidaEl = $<HTMLElement>('[data-pal-vida]');
    if (vidaEl) vidaEl.textContent = `${p.vida}/${p.vidaMax}`;
    const oroEl = $<HTMLElement>('[data-pal-oro]');
    if (oroEl) oroEl.textContent = `${p.oro}`;

    const btnTrono = $<HTMLButtonElement>('[data-accion="cruzar-trono"]');
    if (btnTrono) btnTrono.hidden = !puertaAbierta;
  };

  const abrirPuerta = (): void => {
    if (puertaAbierta) return;
    puertaAbierta = true;
    sonar('canto');
    estallar(7, 1, '#ffd500', 22);
    mostrarToast(t('palacioPuertaAbierta'));
    actualizarMeta();
  };

  const abrirCofre = (c: Cofre): void => {
    if (c.abierto) return;
    c.abierto = true;
    sonar('oro');
    estallar(c.x, c.y, '#ffd500', 16);
    if (c.tipo === 'oro') {
      p.oro += 22;
      p.vida = Math.min(p.vidaMax, p.vida + 15);
      mostrarToast(t('palacioCofreOro', { o: 22, v: 15 }));
    } else if (c.tipo === 'forja') {
      const candidatas = p.mazo.filter((k) => k.palo !== 'X').sort((a, b) => b.n - a.n);
      const carta = candidatas[0];
      if (carta) {
        if ((carta.temple ?? 0) > 0) carta.templada = true;
        carta.temple = (carta.temple ?? 0) + 6;
        mostrarToast(t('palacioCofreForja', { c: `${carta.n}`, n: 6 }));
      }
    } else {
      p.vidaMax += 8;
      p.vida = Math.min(p.vidaMax, p.vida + 8);
      p.cargas[palo] = (p.cargas[palo] ?? 0) + 2;
      p.chiches = huecosChiche(p.chiches);
      const hueco = p.chiches.indexOf(null);
      if (hueco !== -1) {
        const ordenCh: ChicheId[] = ['dado', 'fosforo', 'tiza', 'ginebra', 'poroto'];
        const nuevo = ordenCh.find((id) => !p.chiches!.includes(id)) ?? 'dado';
        p.chiches[hueco] = nuevo;
        mostrarToast(`${t('palacioCofreReliquia', { v: 8, k: 2 })} · +${tx(CHICHE[nuevo].nombre)}`);
      } else {
        mostrarToast(t('palacioCofreReliquia', { v: 8, k: 2 }));
      }
    }
    actualizarMeta();
  };

  const salirAlTrono = (): void => {
    if (saliendo || !puertaAbierta) return;
    saliendo = true;
    sonar('clic');
    guardar();
    if (p.acto >= 2) irCaminoSol(true);
    else pintarFase();
  };

  const pisarBaldosa = (x: number, y: number): void => {
    if (x === 7 && y === 1 && puertaAbierta) {
      salirAlTrono();
      return;
    }
    if (puzzleTipo === 0 && !puertaAbierta) {
      const losa = losas15.find((l) => l.x === x && l.y === y);
      if (losa) {
        losa.activa = !losa.activa;
        sonar('clic');
        const suma = losas15.reduce((acc, l) => acc + (l.activa ? l.val : 0), 0);
        if (suma === 15) abrirPuerta();
        else actualizarMeta();
      }
    } else if (puzzleTipo === 2 && !puertaAbierta) {
      const placa = placasPalo.find((pl) => pl.x === x && pl.y === y);
      if (placa && !placa.activa) {
        if (placa.palo === ordenObjetivo[ordenProgreso]) {
          placa.activa = true;
          ordenProgreso++;
          sonar('clic');
          estallar(x, y, pal.acento, 10);
          if (ordenProgreso >= 3) abrirPuerta();
          else actualizarMeta();
        } else {
          for (const pl of placasPalo) pl.activa = false;
          ordenProgreso = 0;
          sonar('clic');
          actualizarMeta();
        }
      }
    }
  };

  const interactuarEn = (txTile: number, tyTile: number): boolean => {
    const cofre = cofres.find((c) => c.x === txTile && c.y === tyTile && !c.abierto);
    if (cofre) {
      abrirCofre(cofre);
      return true;
    }
    if (txTile === bufonPos.x && tyTile === bufonPos.y) {
      sonar('clic');
      mostrarToast(t('palacioBufonPista'));
      return true;
    }
    if (puzzleTipo === 1 && !puertaAbierta) {
      const br = braseros.find((b) => b.x === txTile && b.y === tyTile && !b.encendido);
      if (br) {
        br.encendido = true;
        sonar('oro');
        estallar(br.x, br.y, '#ff9824', 14);
        if (braseros.every((b) => b.encendido)) abrirPuerta();
        else actualizarMeta();
        return true;
      }
    }
    if (txTile === 7 && tyTile === 1 && puertaAbierta) {
      salirAlTrono();
      return true;
    }
    return false;
  };

  const intentarPaso = (dx: number, dy: number): void => {
    if (dx < 0) dir = 'izq';
    else if (dx > 0) dir = 'der';
    else if (dy < 0) dir = 'arriba';
    else if (dy > 0) dir = 'abajo';

    const nx = px + dx;
    const ny = py + dy;
    if (interactuarEn(nx, ny)) return;
    if (esSolido(nx, ny)) return;
    px = nx;
    py = ny;
    pasoAnim++;
    sonar('paso');
    pisarBaldosa(px, py);
  };

  const buscarCamino = (destX: number, destY: number): { x: number; y: number }[] => {
    const q: { x: number; y: number; path: { x: number; y: number }[] }[] = [{ x: px, y: py, path: [] }];
    const vis = new Set<string>([`${px},${py}`]);
    while (q.length) {
      const cur = q.shift()!;
      if (cur.x === destX && cur.y === destY) return cur.path;
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const k = `${nx},${ny}`;
        if (vis.has(k)) continue;
        if (nx === destX && ny === destY && !esSolido(nx, ny)) return [...cur.path, { x: nx, y: ny }];
        if (esSolido(nx, ny)) continue;
        vis.add(k);
        q.push({ x: nx, y: ny, path: [...cur.path, { x: nx, y: ny }] });
      }
    }
    return [];
  };

  const dibujar = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = '#07040d';
    ctx.fillRect(0, 0, ANCHO, ALTO);

    // 1. Piso, muros 2.5D con ladrillos, alfombra real y pilares con sombra
    for (let y = 0; y < FILAS; y++) {
      for (let x = 0; x < COLS; x++) {
        const ch = MAPA_BASE[y][x];
        const sx = x * TILE;
        const sy = y * TILE;
        if (ch === '#') {
          ctx.fillStyle = pal.muroTope;
          ctx.fillRect(sx, sy, TILE, TILE - 14);
          ctx.fillStyle = pal.muroCara;
          ctx.fillRect(sx, sy + TILE - 14, TILE, 14);
          ctx.fillStyle = pal.muroBorde;
          ctx.fillRect(sx, sy + TILE - 16, TILE, 2);
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(sx + (y % 2 === 0 ? 12 : 28), sy + TILE - 14, 2, 14);
          ctx.fillRect(sx, sy + TILE - 7, TILE, 1);
        } else {
          ctx.fillStyle = (x + y) % 2 === 0 ? pal.pisoA : pal.pisoB;
          ctx.fillRect(sx, sy, TILE, TILE);
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fillRect(sx, sy, TILE, 1);
          ctx.fillRect(sx, sy, 1, TILE);
          if (y === 1) {
            ctx.fillStyle = 'rgba(0,0,0,0.38)';
            ctx.fillRect(sx, sy, TILE, 6);
          }
          if (x === 7 && y >= 1 && y <= 9) {
            ctx.fillStyle = pal.alfombra;
            ctx.fillRect(sx + 6, sy, TILE - 12, TILE);
            ctx.fillStyle = pal.alfombraBorde;
            ctx.fillRect(sx + 6, sy, 2, TILE);
            ctx.fillRect(sx + TILE - 8, sy, 2, TILE);
            ctx.fillStyle = 'rgba(255, 213, 0, 0.28)';
            ctx.fillRect(sx + TILE / 2 - 3, sy + TILE / 2 - 3, 6, 6);
          }
          if (ch === 'P') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(sx + 6, sy + 28, TILE - 12, 16);
            ctx.fillStyle = pal.muroCara;
            ctx.fillRect(sx + 10, sy + 6, TILE - 20, TILE - 10);
            ctx.fillStyle = pal.muroBorde;
            ctx.fillRect(sx + 8, sy + 4, TILE - 16, 8);
            ctx.fillStyle = pal.acento;
            ctx.fillRect(sx + 16, sy + 14, TILE - 32, 4);
          }
        }
      }
    }

    // 2. Estandartes reales en el muro norte
    for (const bx of [3, 5, 9, 11]) {
      const sx = bx * TILE + 12;
      const sy = 10;
      ctx.fillStyle = pal.alfombra;
      ctx.fillRect(sx, sy, 24, 30);
      ctx.fillStyle = pal.acento;
      ctx.fillRect(sx + 2, sy + 2, 20, 4);
      ctx.fillStyle = '#ffd500';
      ctx.fillRect(sx + 9, sy + 12, 6, 6);
      ctx.fillRect(sx, sy + 28, 24, 3);
    }

    // 3. Antorchas con halos de luz cálida
    for (const [txT, tyT] of [[2, 0], [12, 0], [0, 4], [14, 4], [0, 8], [14, 8]] as const) {
      const fx = txT * TILE + TILE / 2;
      const fy = tyT * TILE + TILE / 2;
      const fl = Math.sin(reloj * 9 + txT + tyT) * 2;
      const grad = ctx.createRadialGradient(fx, fy, 4, fx, fy, 74 + fl * 2);
      grad.addColorStop(0, 'rgba(255, 180, 64, 0.26)');
      grad.addColorStop(1, 'rgba(255, 120, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(fx - 80, fy - 80, 160, 160);
      ctx.fillStyle = '#4a2e16';
      ctx.fillRect(fx - 3, fy, 6, 12);
      ctx.fillStyle = '#ff7b00';
      ctx.fillRect(fx - 4, fy - 8 + fl * 0.3, 8, 8);
      ctx.fillStyle = '#ffd500';
      ctx.fillRect(fx - 2, fy - 6 + fl * 0.3, 4, 5);
    }

    // 4. Puerta del Trono en (7, 1) con corona real
    const gx = 7 * TILE;
    const gy = 1 * TILE;
    ctx.fillStyle = puertaAbierta ? '#0b1829' : '#26140c';
    ctx.fillRect(gx + 4, gy + 2, TILE - 8, TILE - 4);
    ctx.strokeStyle = puertaAbierta ? '#ffd500' : '#8f632b';
    ctx.lineWidth = 3;
    ctx.strokeRect(gx + 4, gy + 2, TILE - 8, TILE - 4);
    // Corona de 3 puntas sobre el dintel
    ctx.fillStyle = '#ffd500';
    ctx.fillRect(gx + 14, gy - 4, 20, 5);
    ctx.fillRect(gx + 14, gy - 9, 4, 5);
    ctx.fillRect(gx + 22, gy - 11, 4, 7);
    ctx.fillRect(gx + 30, gy - 9, 4, 5);
    if (puertaAbierta) {
      const gPuerta = ctx.createRadialGradient(gx + TILE / 2, gy + TILE / 2, 4, gx + TILE / 2, gy + TILE / 2, 54);
      gPuerta.addColorStop(0, 'rgba(255, 213, 0, 0.45)');
      gPuerta.addColorStop(1, 'rgba(255, 213, 0, 0)');
      ctx.fillStyle = gPuerta;
      ctx.fillRect(gx - 30, gy - 20, TILE + 60, TILE + 60);
      ctx.fillStyle = '#ffe875';
      ctx.fillRect(gx + 12, gy + 8, TILE - 24, TILE - 14);
    } else {
      ctx.fillStyle = '#5a3f28';
      for (const bx of [12, 20, 28, 36]) ctx.fillRect(gx + bx, gy + 5, 3, TILE - 10);
      ctx.fillStyle = '#ffd500';
      ctx.fillRect(gx + 20, gy + 20, 8, 8);
    }

    // 5. Puzzle 0: losas del 15
    if (puzzleTipo === 0) {
      for (const l of losas15) {
        const lx = l.x * TILE + 6;
        const ly = l.y * TILE + 6;
        ctx.fillStyle = l.activa ? pal.acento : '#221b30';
        ctx.fillRect(lx, ly, TILE - 12, TILE - 12);
        ctx.strokeStyle = l.activa ? '#ffffff' : pal.muroBorde;
        ctx.lineWidth = 2;
        ctx.strokeRect(lx, ly, TILE - 12, TILE - 12);
        ctx.fillStyle = l.activa ? '#09070f' : '#f4efe2';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(l.val), l.x * TILE + TILE / 2, l.y * TILE + TILE / 2);
      }
    }

    // 6. Puzzle 1: braseros con pedestal visible
    if (puzzleTipo === 1) {
      for (const b of braseros) {
        const bx = b.x * TILE + TILE / 2;
        const by = b.y * TILE + TILE / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(bx - 14, by + 6, 28, 8);
        ctx.fillStyle = '#4f3a2a';
        ctx.fillRect(bx - 12, by - 4, 24, 14);
        ctx.fillStyle = b.encendido ? '#ffd500' : '#8d7a64';
        ctx.fillRect(bx - 14, by - 6, 28, 4);
        if (b.encendido) {
          const fl = Math.sin(reloj * 10 + b.x) * 2;
          const gb = ctx.createRadialGradient(bx, by - 8, 3, bx, by - 8, 52);
          gb.addColorStop(0, 'rgba(255, 160, 40, 0.4)');
          gb.addColorStop(1, 'rgba(255, 120, 20, 0)');
          ctx.fillStyle = gb;
          ctx.fillRect(bx - 52, by - 60, 104, 104);
          ctx.fillStyle = '#ff7b00';
          ctx.beginPath();
          ctx.arc(bx, by - 9 + fl * 0.4, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd500';
          ctx.beginPath();
          ctx.arc(bx, by - 11 + fl * 0.4, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 7. Puzzle 2: orden de palos
    if (puzzleTipo === 2) {
      const sym = (s: Palo): string => (s === 'S' ? '♠' : s === 'C' ? '♣' : s === 'D' ? '♦' : '♥');
      const colPalo = (s: Palo): string => (s === 'S' ? '#00e5ff' : s === 'C' ? '#22f06a' : s === 'D' ? '#ffd500' : '#ff1e5c');
      ctx.fillStyle = 'rgba(9, 7, 15, 0.86)';
      ctx.fillRect(5 * TILE, 2 * TILE + 8, 5 * TILE, 28);
      ctx.strokeStyle = '#ffd500';
      ctx.lineWidth = 2;
      ctx.strokeRect(5 * TILE, 2 * TILE + 8, 5 * TILE, 28);
      ctx.fillStyle = '#ffd500';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ordenObjetivo.map(sym).join('  →  '), 7.5 * TILE, 2 * TILE + 22);

      for (const pl of placasPalo) {
        const lx = pl.x * TILE + 6;
        const ly = pl.y * TILE + 6;
        const cp = colPalo(pl.palo);
        ctx.fillStyle = pl.activa ? cp : '#221b30';
        ctx.fillRect(lx, ly, TILE - 12, TILE - 12);
        ctx.strokeStyle = cp;
        ctx.lineWidth = 2;
        ctx.strokeRect(lx, ly, TILE - 12, TILE - 12);
        ctx.fillStyle = pl.activa ? '#09070f' : cp;
        ctx.font = 'bold 20px monospace';
        ctx.fillText(sym(pl.palo), pl.x * TILE + TILE / 2, pl.y * TILE + TILE / 2);
      }
    }

    // 8. Cofres reales con halo dorado y herrajes
    for (const c of cofres) {
      const cx = c.x * TILE + 8;
      const cy = c.y * TILE + 10;
      if (!c.abierto) {
        const gc = ctx.createRadialGradient(cx + 16, cy + 14, 2, cx + 16, cy + 14, 34);
        gc.addColorStop(0, 'rgba(255, 213, 0, 0.28)');
        gc.addColorStop(1, 'rgba(255, 213, 0, 0)');
        ctx.fillStyle = gc;
        ctx.fillRect(cx - 18, cy - 18, 68, 68);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(cx - 2, cy + 20, TILE - 12, 10);
      ctx.fillStyle = c.abierto ? '#3b2b15' : '#8a5614';
      ctx.fillRect(cx, cy, TILE - 16, TILE - 18);
      ctx.fillStyle = c.abierto ? '#634824' : '#ffd500';
      ctx.fillRect(cx, cy, TILE - 16, 6);
      ctx.fillRect(cx + 4, cy, 4, TILE - 18);
      ctx.fillRect(cx + TILE - 24, cy, 4, TILE - 18);
      if (!c.abierto) {
        ctx.fillStyle = '#fff5b8';
        ctx.fillRect(cx + 12, cy + 10, 8, 6);
      }
    }

    // 9. Bufón NPC en (5, 9) con gorro arlequín bicolor
    const jx = bufonPos.x * TILE + TILE / 2;
    const jy = bufonPos.y * TILE + TILE / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(jx, jy + 13, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#331247';
    ctx.fillRect(jx - 10, jy - 4, 20, 16);
    ctx.fillStyle = '#ffd500';
    ctx.fillRect(jx - 11, jy - 5, 22, 3);
    ctx.fillStyle = '#f4efe2';
    ctx.beginPath();
    ctx.arc(jx, jy - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff1453';
    ctx.fillRect(jx - 13, jy - 19, 9, 7);
    ctx.fillStyle = '#7b2cbf';
    ctx.fillRect(jx + 4, jy - 19, 9, 7);
    ctx.fillStyle = '#ffd500';
    ctx.fillRect(jx - 15, jy - 14, 3, 3);
    ctx.fillRect(jx + 12, jy - 14, 3, 3);

    // 10. Héroe animado
    const hx = rx + TILE / 2;
    const hy = ry + TILE / 2 + Math.sin(pasoAnim * 2.2) * 1.5;
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.beginPath();
    ctx.ellipse(hx, hy + 13, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.acento;
    ctx.fillRect(hx - 10, hy - 4, 20, 16);
    ctx.fillStyle = '#ffd500';
    ctx.fillRect(hx - 10, hy + 4, 20, 2);
    ctx.fillStyle = '#f4efe2';
    ctx.beginPath();
    ctx.arc(hx, hy - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241432';
    ctx.fillRect(hx - 11, hy - 18, 22, 5);
    ctx.fillStyle = '#09070f';
    const ojoDx = dir === 'izq' ? -3 : dir === 'der' ? 3 : 0;
    const ojoDy = dir === 'arriba' ? -2 : 1;
    ctx.fillRect(hx - 4 + ojoDx, hy - 11 + ojoDy, 2, 3);
    ctx.fillRect(hx + 2 + ojoDx, hy - 11 + ojoDy, 2, 3);

    // 11. Partículas
    for (const pt of particulas) {
      ctx.globalAlpha = Math.max(0, pt.vida);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  };

  return {
    nombre: 'palacio',
    atras: () => {},
    alSalir: () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(toastTimer);
      if (onKeyDown) {
        window.removeEventListener('keydown', onKeyDown);
        onKeyDown = null;
      }
    },
    html: () => {
      const nomPalacio = t(`palacio${palo}` as 'palacioS');
      return `<main class="pantalla palacio">
        <header class="palacio-top">
          <div class="palacio-titulo-caja">
            <b class="rotulo dorado">${nomPalacio}</b>
            <span class="palacio-sub">${t('palacioSub', { rey: tx(rey.nombre) })}</span>
          </div>
          <div class="palacio-meta">
            <span class="marco chico">❤ <b data-pal-vida>${p.vida}/${p.vidaMax}</b></span>
            <span class="marco chico">● <b data-pal-oro>${p.oro}</b></span>
            <span class="marco chico" data-pal-cofres>${t('palacioCofres', { n: 0 })}</span>
          </div>
        </header>
        <p class="palacio-pista" data-pal-pista>${t('palacioPuertaCerrada')}</p>
        <div class="palacio-escena">
          <div class="palacio-marco marco">
            <canvas class="palacio-canvas" width="${ANCHO}" height="${ALTO}"></canvas>
          </div>
        </div>
        <p class="palacio-toast" hidden role="status"></p>
        <footer class="palacio-pie">
          <span class="palacio-controles">${t('palacioControles')}</span>
          <div class="palacio-dpad">
            <button class="btn marco chico" data-accion="pal-arr" aria-label="Arriba">▲</button>
            <button class="btn marco chico" data-accion="pal-izq" aria-label="Izquierda">◀</button>
            <button class="btn marco chico" data-accion="pal-aba" aria-label="Abajo">▼</button>
            <button class="btn marco chico" data-accion="pal-der" aria-label="Derecha">▶</button>
          </div>
          <button class="btn marco oro grande" data-accion="cruzar-trono" hidden>${t('palacioEntrarTrono')}</button>
        </footer>
      </main>`;
    },
    alMontar: () => {
      const canvas = $<HTMLCanvasElement>('.palacio-canvas');
      const ctx = canvas?.getContext('2d');
      actualizarMeta();
      if (!canvas || !ctx) return;

      canvas.addEventListener('pointerdown', (ev) => {
        if (pantallaActual()?.nombre !== 'palacio') return;
        const r = canvas.getBoundingClientRect();
        const txTile = Math.floor(((ev.clientX - r.left) / r.width) * COLS);
        const tyTile = Math.floor(((ev.clientY - r.top) / r.height) * FILAS);
        if (Math.abs(txTile - px) + Math.abs(tyTile - py) === 1 && interactuarEn(txTile, tyTile)) return;
        const path = buscarCamino(txTile, tyTile);
        if (path.length) {
          cola.length = 0;
          cola.push(...path);
        }
      });

      if (onKeyDown) window.removeEventListener('keydown', onKeyDown);
      onKeyDown = (ev: KeyboardEvent): void => {
        if (pantallaActual()?.nombre !== 'palacio') return;
        const k = ev.key.toLowerCase();
        if (k === 'w' || k === 'arrowup') {
          ev.preventDefault();
          cola.length = 0;
          intentarPaso(0, -1);
        } else if (k === 's' || k === 'arrowdown') {
          ev.preventDefault();
          cola.length = 0;
          intentarPaso(0, 1);
        } else if (k === 'a' || k === 'arrowleft') {
          ev.preventDefault();
          cola.length = 0;
          intentarPaso(-1, 0);
        } else if (k === 'd' || k === 'arrowright') {
          ev.preventDefault();
          cola.length = 0;
          intentarPaso(1, 0);
        } else if (k === 'e' || k === ' ' || k === 'enter') {
          ev.preventDefault();
          const dx = dir === 'izq' ? -1 : dir === 'der' ? 1 : 0;
          const dy = dir === 'arriba' ? -1 : dir === 'abajo' ? 1 : 0;
          interactuarEn(px + dx, py + dy);
        }
      };
      window.addEventListener('keydown', onKeyDown);

      if (enFoto()) {
        dibujar(ctx);
        return;
      }

      let ultimo = performance.now();
      let pasoCola = 0;
      const tick = (ahora: number): void => {
        if (pantallaActual()?.nombre !== 'palacio') return;
        const dt = Math.min(0.05, (ahora - ultimo) / 1000);
        ultimo = ahora;
        reloj += dt;

        if (cola.length && Math.hypot(px * TILE - rx, py * TILE - ry) < 2) {
          pasoCola += dt;
          if (pasoCola >= 0.08) {
            pasoCola = 0;
            const sig = cola.shift()!;
            intentarPaso(sig.x - px, sig.y - py);
          }
        }

        rx += (px * TILE - rx) * Math.min(1, dt * 16);
        ry += (py * TILE - ry) * Math.min(1, dt * 16);
        for (let i = particulas.length - 1; i >= 0; i--) {
          const pt = particulas[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vida -= dt * 1.4;
          if (pt.vida <= 0) particulas.splice(i, 1);
        }
        dibujar(ctx);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    },
    acciones: {
      'pal-arr': () => intentarPaso(0, -1),
      'pal-aba': () => intentarPaso(0, 1),
      'pal-izq': () => intentarPaso(-1, 0),
      'pal-der': () => intentarPaso(1, 0),
      'cruzar-trono': salirAlTrono,
    },
  };
}
