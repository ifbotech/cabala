// Motor Voxel Art 3D con culling de caras ocultas y Ambient Occlusion horneado por vértice.
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

  cylinderY(cx: number, y0: number, y1: number, cz: number, rx: number, rz: number, color: number, mat: VoxelMat = 'matte'): this {
    const ya = Math.round(Math.min(y0, y1));
    const yb = Math.round(Math.max(y0, y1));
    const x0 = Math.floor(cx - rx);
    const x1 = Math.ceil(cx + rx);
    const z0 = Math.floor(cz - rz);
    const z1 = Math.ceil(cz + rz);
    for (let y = ya; y <= yb; y++) {
      for (let z = z0; z <= z1; z++) {
        for (let x = x0; x <= x1; x++) {
          const dx = (x - cx) / Math.max(0.5, rx);
          const dz = (z - cz) / Math.max(0.5, rz);
          if (dx * dx + dz * dz <= 1.04) {
            this.set(x, y, z, color, mat);
          }
        }
      }
    }
    return this;
  }

  line3D(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r: number, color: number, mat: VoxelMat = 'matte'): this {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dz = z1 - z0;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy, dz) * 2));
    const rr = r * r;
    const ir = Math.ceil(r);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x0 + dx * t;
      const py = y0 + dy * t;
      const pz = z0 + dz * t;
      if (r <= 0.6) {
        this.set(px, py, pz, color, mat);
      } else {
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
    // +X
    n: [1, 0, 0],
    u: [0, 0, 1],
    v: [0, 1, 0],
    verts: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
    aoSigns: [[1, -1], [-1, -1], [-1, 1], [1, 1]],
    shade: 0.9,
  },
  {
    // -X
    n: [-1, 0, 0],
    u: [0, 0, 1],
    v: [0, 1, 0],
    verts: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    aoSigns: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    shade: 0.9,
  },
  {
    // +Y
    n: [0, 1, 0],
    u: [1, 0, 0],
    v: [0, 0, 1],
    verts: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
    aoSigns: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
    shade: 1.06,
  },
  {
    // -Y
    n: [0, -1, 0],
    u: [1, 0, 0],
    v: [0, 0, 1],
    verts: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    aoSigns: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    shade: 0.74,
  },
  {
    // +Z
    n: [0, 0, 1],
    u: [1, 0, 0],
    v: [0, 1, 0],
    verts: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    aoSigns: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    shade: 1.0,
  },
  {
    // -Z
    n: [0, 0, -1],
    u: [1, 0, 0],
    v: [0, 1, 0],
    verts: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]],
    aoSigns: [[1, -1], [-1, -1], [-1, 1], [1, 1]],
    shade: 0.82,
  },
];

const AO_TABLE = [0.54, 0.72, 0.87, 1.0] as const;

const MAT_MATTE = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.76,
  metalness: 0.06,
});

const MAT_METAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.26,
  metalness: 0.68,
});

const MAT_EMISSIVE = new THREE.MeshBasicMaterial({
  vertexColors: true,
});

const tmpColor = new THREE.Color();

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
    // Micro-variación determinista (±3 %) para textura pixel-art viva
    const hash = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719) * 43758.5453;
    const jitter = 0.97 + (hash - Math.floor(hash)) * 0.06;

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

        const factor = v.mat === 'emissive' ? 1 : AO_TABLE[ao] * c.shade * jitter;
        b.col.push(tmpColor.r * factor, tmpColor.g * factor, tmpColor.b * factor);
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
