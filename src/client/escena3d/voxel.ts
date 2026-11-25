// Motor Dark-Dithered Pixel-3D con culling de caras ocultas, AO horneado violáceo y dithering Bayer 4×4.
import * as THREE from 'three';

export type VoxelMat = 'matte' | 'metal' | 'emissive';

interface VoxelCelda {
  x: number;
  y: number;
  z: number;
  color: number;
  mat: VoxelMat;
}

const STRIDE_Y = 512;
const STRIDE_Z = 512 * 512;
const OFF = 256;

const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function claveDe(x: number, y: number, z: number): number {
  return x + OFF + (y + OFF) * STRIDE_Y + (z + OFF) * STRIDE_Z;
}

export class VoxelGrid {
  private readonly celdas = new Map<number, VoxelCelda>();

  set(x: number, y: number, z: number, color: number, mat: VoxelMat = 'matte'): this {
    const ix = Math.round(x);
    const iy = Math.round(y);
    const iz = Math.round(z);
    this.celdas.set(claveDe(ix, iy, iz), { x: ix, y: iy, z: iz, color, mat });
    return this;
  }

  del(x: number, y: number, z: number): this {
    this.celdas.delete(claveDe(Math.round(x), Math.round(y), Math.round(z)));
    return this;
  }

  has(x: number, y: number, z: number): boolean {
    return this.celdas.has(claveDe(Math.round(x), Math.round(y), Math.round(z)));
  }

  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: number, mat: VoxelMat = 'matte'): this {
    const xa = Math.round(Math.min(x0, x1));
    const xb = Math.round(Math.max(x0, x1));
    const ya = Math.round(Math.min(y0, y1));
    const yb = Math.round(Math.max(y0, y1));
    const za = Math.round(Math.min(z0, z1));
    const zb = Math.round(Math.max(z0, z1));
    for (let y = ya; y <= yb; y++) {
      for (let z = za; z <= zb; z++) {
        for (let x = xa; x <= xb; x++) {
          this.set(x, y, z, color, mat);
        }
      }
    }
    return this;
  }

  ditherBox(
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    colBase: number,
    colOscuro: number,
    mat: VoxelMat = 'matte',
  ): this {
    const xa = Math.round(Math.min(x0, x1));
    const xb = Math.round(Math.max(x0, x1));
    const ya = Math.round(Math.min(y0, y1));
    const yb = Math.round(Math.max(y0, y1));
    const za = Math.round(Math.min(z0, z1));
    const zb = Math.round(Math.max(z0, z1));
    for (let y = ya; y <= yb; y++) {
      for (let z = za; z <= zb; z++) {
        for (let x = xa; x <= xb; x++) {
          const b = BAYER4[(y + z) & 3][(x + z) & 3];
          this.set(x, y, z, b >= 10 ? colOscuro : colBase, mat);
        }
      }
    }
    return this;
  }

  mirrorX(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: number, mat: VoxelMat = 'matte'): this {
    this.box(x0, y0, z0, x1, y1, z1, color, mat);
    this.box(-x1, y0, z0, -x0, y1, z1, color, mat);
    return this;
  }

  ellipsoid(cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, color: number, mat: VoxelMat = 'matte'): this {
    const x0 = Math.floor(cx - rx);
    const x1 = Math.ceil(cx + rx);
    const y0 = Math.floor(cy - ry);
    const y1 = Math.ceil(cy + ry);
    const z0 = Math.floor(cz - rz);
    const z1 = Math.ceil(cz + rz);
    for (let y = y0; y <= y1; y++) {
      for (let z = z0; z <= z1; z++) {
        for (let x = x0; x <= x1; x++) {
          const dx = (x - cx) / Math.max(0.5, rx);
          const dy = (y - cy) / Math.max(0.5, ry);
          const dz = (z - cz) / Math.max(0.5, rz);
          if (dx * dx + dy * dy + dz * dz <= 1.02) {
            this.set(x, y, z, color, mat);
          }
        }
      }
    }
    return this;
  }

  sculptHead(cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, piel: number, pielSombra: number): this {
    const x0 = Math.floor(cx - rx);
    const x1 = Math.ceil(cx + rx);
    const y0 = Math.floor(cy - ry);
    const y1 = Math.ceil(cy + ry);
    const z0 = Math.floor(cz - rz);
    const z1 = Math.ceil(cz + rz);
    for (let y = y0; y <= y1; y++) {
      const ny = (y - cy) / Math.max(0.5, ry);
      // Afinar mandíbula suavemente hacia abajo
      const taper = ny < 0 ? 1 - Math.abs(ny) * 0.24 : 1;
      for (let z = z0; z <= z1; z++) {
        for (let x = x0; x <= x1; x++) {
          const dx = (x - cx) / Math.max(0.5, rx * taper);
          const dz = (z - cz) / Math.max(0.5, rz * (ny < -0.3 ? 0.9 : 1));
          const d = dx * dx + ny * ny * 0.92 + dz * dz;
          if (d <= 1.02) {
            const enSien = Math.abs(dx) > 0.72 || ny < -0.65;
            this.set(x, y, z, enSien ? pielSombra : piel, 'matte');
          }
        }
      }
    }
    return this;
  }

  cylinderY(cx: number, y0: number, y1: number, cz: number, rx: number, rz: number, color: number, mat: VoxelMat = 'matte'): this {
    return this.taperedCylinder(cx, y0, y1, cz, rx, rz, rx, rz, color, mat);
  }

  taperedCylinder(
    cx: number,
    y0: number,
    y1: number,
    cz: number,
    rx0: number,
    rz0: number,
    rx1: number,
    rz1: number,
    color: number,
    mat: VoxelMat = 'matte',
  ): this {
    const ya = Math.round(Math.min(y0, y1));
    const yb = Math.round(Math.max(y0, y1));
    const span = Math.max(1, yb - ya);
    const maxRx = Math.max(rx0, rx1);
    const maxRz = Math.max(rz0, rz1);
    const x0 = Math.floor(cx - maxRx);
    const x1 = Math.ceil(cx + maxRx);
    const z0 = Math.floor(cz - maxRz);
    const z1 = Math.ceil(cz + maxRz);
    for (let y = ya; y <= yb; y++) {
      const t = (y - ya) / span;
      const rx = Math.max(0.5, rx0 + (rx1 - rx0) * t);
      const rz = Math.max(0.5, rz0 + (rz1 - rz0) * t);
      for (let z = z0; z <= z1; z++) {
        for (let x = x0; x <= x1; x++) {
          const dx = (x - cx) / rx;
          const dz = (z - cz) / rz;
          if (dx * dx + dz * dz <= 1.04) {
            this.set(x, y, z, color, mat);
          }
        }
      }
    }
    return this;
  }

  line3D(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r: number, color: number, mat: VoxelMat = 'matte'): this {
    return this.curve3D([[x0, y0, z0], [x1, y1, z1]], r, r, color, mat);
  }

  curve3D(
    pts: readonly [number, number, number][],
    rInicio: number,
    rFin: number,
    color: number,
    mat: VoxelMat = 'matte',
  ): this {
    if (pts.length < 2) return this;
    const totalSeg = pts.length - 1;
    for (let s = 0; s < totalSeg; s++) {
      const [x0, y0, z0] = pts[s];
      const [x1, y1, z1] = pts[s + 1];
      const dx = x1 - x0;
      const dy = y1 - y0;
      const dz = z1 - z0;
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy, dz) * 2.5));
      for (let i = 0; i <= steps; i++) {
        const lt = i / steps;
        const gt = (s + lt) / totalSeg;
        const r = rInicio + (rFin - rInicio) * gt;
        const px = x0 + dx * lt;
        const py = y0 + dy * lt;
        const pz = z0 + dz * lt;
        if (r <= 0.6) {
          this.set(px, py, pz, color, mat);
        } else {
          const rr = r * r;
          const ir = Math.ceil(r);
          for (let oy = -ir; oy <= ir; oy++) {
            for (let oz = -ir; oz <= ir; oz++) {
              for (let ox = -ir; ox <= ir; ox++) {
                if (ox * ox + oy * oy + oz * oz <= rr + 0.25) {
                  this.set(px + ox, py + oy, pz + oz, color, mat);
                }
              }
            }
          }
        }
      }
    }
    return this;
  }

  paintFront(
    x0: number,
    yTop: number,
    z: number,
    rows: readonly string[],
    palette: Record<string, number>,
    depth = 1,
    mat: VoxelMat = 'matte',
    matMap?: Record<string, VoxelMat>,
  ): this {
    for (let ry = 0; ry < rows.length; ry++) {
      const row = rows[ry];
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[rx];
        if (ch === '.' || ch === ' ') continue;
        const col = palette[ch];
        if (col === undefined) continue;
        const m = matMap?.[ch] ?? mat;
        for (let d = 0; d < depth; d++) {
          this.set(x0 + rx, yTop - ry, z - d, col, m);
        }
      }
    }
    return this;
  }

  extrude2D(
    rows: readonly string[],
    palette: Record<string, number>,
    depth: number,
    cx: number,
    yBase: number,
    cz: number,
    mat: VoxelMat = 'matte',
    matMap?: Record<string, VoxelMat>,
  ): this {
    const h = rows.length;
    const w = rows[0]?.length ?? 0;
    const xStart = Math.round(cx - w / 2);
    const zStart = Math.round(cz - depth / 2);
    for (let ry = 0; ry < h; ry++) {
      const row = rows[ry];
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[rx];
        if (ch === '.' || ch === ' ') continue;
        const col = palette[ch];
        if (col === undefined) continue;
        const m = matMap?.[ch] ?? mat;
        for (let d = 0; d < depth; d++) {
          this.set(xStart + rx, yBase + (h - 1 - ry), zStart + d, col, m);
        }
      }
    }
    return this;
  }

  values(): IterableIterator<VoxelCelda> {
    return this.celdas.values();
  }
}

interface CaraDef {
  n: [number, number, number];
  u: [number, number, number];
  v: [number, number, number];
  verts: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]];
  aoSigns: [[number, number], [number, number], [number, number], [number, number]];
  shade: number;
}

const CARAS: readonly CaraDef[] = [
  {
    n: [1, 0, 0],
    u: [0, 0, 1],
    v: [0, 1, 0],
    verts: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
    aoSigns: [[1, -1], [-1, -1], [-1, 1], [1, 1]],
    shade: 0.9,
  },
  {
    n: [-1, 0, 0],
    u: [0, 0, 1],
    v: [0, 1, 0],
    verts: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    aoSigns: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    shade: 0.9,
  },
  {
    n: [0, 1, 0],
    u: [1, 0, 0],
    v: [0, 0, 1],
    verts: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
    aoSigns: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
    shade: 1.06,
  },
  {
    n: [0, -1, 0],
    u: [1, 0, 0],
    v: [0, 0, 1],
    verts: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    aoSigns: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    shade: 0.72,
  },
  {
    n: [0, 0, 1],
    u: [1, 0, 0],
    v: [0, 1, 0],
    verts: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    aoSigns: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    shade: 1.0,
  },
  {
    n: [0, 0, -1],
    u: [1, 0, 0],
    v: [0, 1, 0],
    verts: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]],
    aoSigns: [[1, -1], [-1, -1], [-1, 1], [1, 1]],
    shade: 0.8,
  },
];

const AO_TABLE = [0.38, 0.62, 0.82, 1.0] as const;

const MAT_MATTE = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.84,
  metalness: 0.04,
});

const MAT_METAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.28,
  metalness: 0.72,
});

const MAT_EMISSIVE = new THREE.MeshBasicMaterial({
  vertexColors: true,
});

const tmpColor = new THREE.Color();
const ABISMO_VIOLETA = new THREE.Color(0x120a24);

export function construirMallaVoxel(
  grid: VoxelGrid,
  tamVoxel: number,
  pivote: [number, number, number] = [0, 0, 0],
): THREE.Group {
  const grupo = new THREE.Group();
  const buckets: Record<VoxelMat, { pos: number[]; norm: number[]; col: number[]; idx: number[] }> = {
    matte: { pos: [], norm: [], col: [], idx: [] },
    metal: { pos: [], norm: [], col: [], idx: [] },
    emissive: { pos: [], norm: [], col: [], idx: [] },
  };

  const px0 = pivote[0];
  const py0 = pivote[1];
  const pz0 = pivote[2];

  for (const v of grid.values()) {
    const b = buckets[v.mat];
    tmpColor.setHex(v.color);
    // Dithering Bayer 4×4 3D para textura Dark Pixel-Art orgánica
    const bayer = (BAYER4[(v.y + v.z) & 3][(v.x + v.z) & 3] + 0.5) / 16;
    const ditherMod = 0.93 + bayer * 0.11;

    for (const c of CARAS) {
      const nx = v.x + c.n[0];
      const ny = v.y + c.n[1];
      const nz = v.z + c.n[2];
      if (grid.has(nx, ny, nz)) continue;

      const baseIdx = b.pos.length / 3;
      const aos: [number, number, number, number] = [3, 3, 3, 3];

      for (let vi = 0; vi < 4; vi++) {
        const vert = c.verts[vi];
        b.pos.push((v.x + vert[0] - px0) * tamVoxel, (v.y + vert[1] - py0) * tamVoxel, (v.z + vert[2] - pz0) * tamVoxel);
        b.norm.push(c.n[0], c.n[1], c.n[2]);

        const [su, sv] = c.aoSigns[vi];
        const s1 = grid.has(nx + su * c.u[0], ny + su * c.u[1], nz + su * c.u[2]) ? 1 : 0;
        const s2 = grid.has(nx + sv * c.v[0], ny + sv * c.v[1], nz + sv * c.v[2]) ? 1 : 0;
        const cr = grid.has(
          nx + su * c.u[0] + sv * c.v[0],
          ny + su * c.u[1] + sv * c.v[1],
          nz + su * c.u[2] + sv * c.v[2],
        )
          ? 1
          : 0;
        const ao = s1 && s2 ? 0 : 3 - (s1 + s2 + cr);
        aos[vi] = ao;

        if (v.mat === 'emissive') {
          b.col.push(tmpColor.r, tmpColor.g, tmpColor.b);
        } else {
          const factor = AO_TABLE[ao] * c.shade * ditherMod;
          const shadowMix = (1 - AO_TABLE[ao]) * 0.45;
          const r = tmpColor.r * factor;
          const g = tmpColor.g * factor;
          const bl = tmpColor.b * factor;
          b.col.push(
            r + (ABISMO_VIOLETA.r - r) * shadowMix,
            g + (ABISMO_VIOLETA.g - g) * shadowMix,
            bl + (ABISMO_VIOLETA.b - bl) * shadowMix,
          );
        }
      }

      if (aos[0] + aos[2] > aos[1] + aos[3]) {
        b.idx.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
      } else {
        b.idx.push(baseIdx + 1, baseIdx + 2, baseIdx + 3, baseIdx + 1, baseIdx + 3, baseIdx);
      }
    }
  }

  for (const matKind of ['matte', 'metal', 'emissive'] as const) {
    const b = buckets[matKind];
    if (b.idx.length === 0) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.norm, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
    geo.setIndex(b.idx);
    const mat = matKind === 'matte' ? MAT_MATTE : matKind === 'metal' ? MAT_METAL : MAT_EMISSIVE;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = matKind !== 'emissive';
    mesh.receiveShadow = matKind !== 'emissive';
    grupo.add(mesh);
  }

  return grupo;
}
