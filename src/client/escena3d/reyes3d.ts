// Los 4 Reyes Malvados en Voxel Art 3D con AO horneado, armas icónicas y VFX 3D en combate.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { VoxelGrid, construirMallaVoxel, type VoxelMat } from './voxel';

const COLOR_REY: Record<Palo, number> = {
  S: 0x00e5ff,
  C: 0x22f06a,
  D: 0xffd500,
  H: 0xff1e5c,
};

interface ReyConfig {
  tunica: number;
  tunicaOsc: number;
  capa: number;
  piel: number;
  pelo: number;
  peloLuz: number;
  ojo: number;
  anchoHombro: number;
}

const CFG: Record<Palo, ReyConfig> = {
  S: {
    tunica: 0x1d52cc,
    tunicaOsc: 0x123285,
    capa: 0x0e1c4a,
    piel: 0xe2a87e,
    pelo: 0x22171a,
    peloLuz: 0x3b2a2f,
    ojo: 0x5be8ff,
    anchoHombro: 0,
  },
  C: {
    tunica: 0x1b8a32,
    tunicaOsc: 0x115c20,
    capa: 0x0d3616,
    piel: 0xdfa278,
    pelo: 0x6b3418,
    peloLuz: 0x914c26,
    ojo: 0x4cff88,
    anchoHombro: 1,
  },
  D: {
    tunica: 0x6e1f9c,
    tunicaOsc: 0x48106b,
    capa: 0x2b0a42,
    piel: 0xe6ad82,
    pelo: 0x5c3318,
    peloLuz: 0x7d4724,
    ojo: 0xffe44d,
    anchoHombro: 0,
  },
  H: {
    tunica: 0xb81a2e,
    tunicaOsc: 0x7a0d1c,
    capa: 0x450814,
    piel: 0xe8c7bc,
    pelo: 0xe6dfd5,
    peloLuz: 0xffffff,
    ojo: 0xff3b6e,
    anchoHombro: 0,
  },
};

const ORO = 0xf7c531;
const ORO_OSC = 0xc98a18;
const CUERO = 0x542c16;
const BOTA = 0x241410;
const ARMINO = 0xf2ebe1;
const ARMINO_MOTA = 0x1e1326;
const RUBI = 0xe81e42;
const ACERO = 0x9ed8f5;
const ACERO_LUZ = 0xdff6ff;

interface ReyArticulado {
  grupo: THREE.Group;
  cuerpo: THREE.Group;
  cabeza: THREE.Group;
  brazoIzq: THREE.Group;
  brazoDer: THREE.Group;
  capa: THREE.Group;
  orbesSegunda: THREE.Mesh[];
}

interface ParticulaVfx {
  malla: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  vida: number;
  maxVida: number;
  esOnda?: boolean;
}

const V = 0.036;

export class Reyes3D {
  readonly raiz = new THREE.Group();
  private readonly figuras: Record<Palo, ReyArticulado>;
  private readonly luzRey: THREE.PointLight;
  private readonly luzFrente: THREE.PointLight;
  private readonly vfxGrupo = new THREE.Group();
  private readonly vfx: ParticulaVfx[] = [];
  private paloActivo: Palo | null = null;
  private entrada = 0;
  private castTimer = 0;
  private golpeTimer = 0;
  private eraHerido = false;

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();

  constructor(escena: THREE.Scene) {
    this.figuras = {
      S: this.crearRey('S'),
      C: this.crearRey('C'),
      D: this.crearRey('D'),
      H: this.crearRey('H'),
    };
    for (const p of ['S', 'C', 'D', 'H'] as const) {
      this.figuras[p].grupo.visible = false;
      this.raiz.add(this.figuras[p].grupo);
    }

    // Luz frontal cálida para lectura cristalina del rostro y vestiduras + luz de palo
    this.luzFrente = new THREE.PointLight(0xffe7c4, 1.6, 4.2, 1.4);
    this.luzFrente.position.set(-0.35, 0.55, 1.35);
    this.luzRey = new THREE.PointLight(0x00e5ff, 1.45, 3.8, 1.5);
    this.luzRey.position.set(0.55, 0.45, 0.9);
    this.raiz.add(this.luzFrente, this.luzRey);
    this.raiz.visible = false;

    escena.add(this.raiz, this.vfxGrupo);
  }

  private construirTorso(palo: Palo): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();
    const w = 4 + c.anchoHombro;

    // Piernas y botas
    g.mirrorX(1, -6, -1, 3, -4, 2, BOTA);
    g.mirrorX(1, -3, -1, 3, -1, 1, 0x160d1c);

    // Túnica real con faldón y ribetes dorados
    g.box(-w, 0, -2, w, 11, 2, c.tunica);
    g.box(-w, 0, -2, w, 1, 2, c.tunicaOsc);
    // Ribete vertical dorado central y borde inferior
    g.box(-1, 0, 2, 1, 10, 2, ORO, 'metal');
    g.box(-w, 0, 2, w, 0, 2, ORO, 'metal');
    g.mirrorX(w, 1, 2, w, 4, 2, c.tunicaOsc);

    // Cinturón de cuero y hebilla de oro
    g.box(-w, 5, -2, w, 6, 2, CUERO);
    g.box(-1, 5, 3, 1, 6, 3, ORO, 'metal');

    // Cuello de armiño blanco con motas oscuras
    g.box(-w, 11, -2, w, 12, 2, ARMINO);
    g.set(-3, 12, 2, ARMINO_MOTA).set(3, 12, 2, ARMINO_MOTA).set(0, 11, 2, ARMINO_MOTA);
    g.set(-2, 11, 2, ARMINO_MOTA).set(2, 11, 2, ARMINO_MOTA);

    // Cadena real de oro con gema rubí
    g.box(-3, 10, 3, 3, 10, 3, ORO, 'metal');
    g.set(0, 9, 3, RUBI, 'metal');

    // Hombreras reales
    g.mirrorX(w, 10, -2, w + 1, 12, 2, c.tunicaOsc);
    g.mirrorX(w + 1, 11, -1, w + 1, 12, 1, ORO, 'metal');

    return construirMallaVoxel(g, V, [0, 4, 0]);
  }

  private construirCapa(palo: Palo): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();
    const w = 5 + c.anchoHombro;
    g.box(-w, -4, -1, w, 12, 0, c.capa);
    g.box(-w + 1, -5, -1, w - 1, -4, 0, c.tunicaOsc);
    g.mirrorX(w, -4, 0, w, 11, 0, ORO_OSC, 'metal');
    return construirMallaVoxel(g, V, [0, 12, 0]);
  }

  private construirCabeza(palo: Palo): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();

    // Cráneo base
    g.box(-4, 0, -3, 4, 7, 3, c.piel);
    // Cabello lateral y trasero
    g.box(-4, 1, -4, 4, 7, -2, c.pelo);
    g.mirrorX(4, 2, -3, 4, 7, 1, c.pelo);
    g.box(-4, 7, -3, 4, 7, 2, c.pelo);

    // Rostro expresivo
    const pal: Record<string, number> = {
      C: c.pelo,
      L: c.peloLuz,
      O: c.ojo,
      B: 0x160c1c,
      R: RUBI,
      N: 0xc98a63,
      S: c.piel,
      M: 0x3b151e,
    };
    const matMap: Record<string, VoxelMat> = { O: 'emissive' };

    if (palo === 'S') {
      // Ceño fiero, ojos cian, cicatriz diagonal carmesí y barba negra en punta
      g.paintFront(
        -3,
        6,
        3,
        [
          'CC...CC',
          'BO...OR',
          '...N.R.',
          'CC.N.CR',
          'CCCCCCC',
          '.CCCCC.',
          '..CCC..',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.box(-2, -1, 2, 2, 0, 3, c.pelo);
      g.box(-1, -2, 2, 1, -1, 3, c.pelo);
    } else if (palo === 'C') {
      // Cejas gruesas, barba castaño-rojiza muy tupida
      g.paintFront(
        -3,
        6,
        3,
        [
          'CC...CC',
          'BO...OB',
          '...N...',
          'LLLLLLL',
          'CCCCCCC',
          'CLCCCLC',
          '.CCCCC.',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.box(-4, -2, 1, 4, 1, 4, c.pelo);
      g.box(-3, -3, 2, 3, -2, 4, c.peloLuz);
    } else if (palo === 'D') {
      // Bigote retorcido, barba perfilada y mirada dorada
      g.paintFront(
        -3,
        6,
        3,
        [
          'CC...CC',
          'BO...OB',
          '...N...',
          'C..M..C',
          'CCCCCCC',
          '.CCLCC.',
          '..CCC..',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.box(-2, -1, 2, 2, 0, 3, c.pelo);
    } else {
      // Rey de Copas: melena blanca, barba blanca larga, ojos rubí
      g.box(-5, -1, -3, -4, 6, 1, c.pelo);
      g.box(4, -1, -3, 5, 6, 1, c.pelo);
      g.paintFront(
        -3,
        6,
        3,
        [
          'CC...CC',
          'BO...OB',
          '...N...',
          '.MM.MM.',
          'LLLLLLL',
          'LCCCCCL',
          '.LLLLL.',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.box(-3, -3, 2, 3, 0, 4, c.pelo);
      g.box(-2, -5, 2, 2, -3, 4, c.peloLuz);
    }

    // Aro de la corona
    g.box(-5, 8, -4, 5, 9, 4, ORO, 'metal');
    g.set(-3, 8, 4, COLOR_REY[palo], 'emissive');
    g.set(0, 8, 4, RUBI, 'metal');
    g.set(3, 8, 4, COLOR_REY[palo], 'emissive');

    // Corona única de cada Rey
    if (palo === 'S') {
      // 5 hojas de acero
      for (const [dx, h] of [
        [-4, 4],
        [-2, 5],
        [0, 7],
        [2, 5],
        [4, 4],
      ] as const) {
        g.box(dx, 10, 2, dx, 9 + h, 3, ACERO, 'metal');
        g.set(dx, 9 + h, 3, ACERO_LUZ, 'emissive');
      }
      g.mirrorX(4, 10, -2, 4, 13, 0, ACERO, 'metal');
    } else if (palo === 'C') {
      // Ramas nudosas con brotes esmeralda
      g.line3D(-3, 10, 1, -5, 15, 2, 0.8, CUERO);
      g.line3D(3, 10, 1, 5, 15, 2, 0.8, CUERO);
      g.box(-1, 10, 2, 1, 14, 3, CUERO);
      g.ellipsoid(-5, 16, 2, 1.2, 1.2, 1.2, 0x22f06a, 'emissive');
      g.ellipsoid(5, 16, 2, 1.2, 1.2, 1.2, 0x22f06a, 'emissive');
      g.ellipsoid(0, 15, 3, 1.4, 1.3, 1.2, 0x22f06a, 'emissive');
    } else if (palo === 'D') {
      // Corona solar alta de oro
      for (let i = -4; i <= 4; i += 2) {
        const h = i === 0 ? 7 : Math.abs(i) === 2 ? 5 : 4;
        g.box(i, 10, 3, i, 9 + h, 3, ORO, 'metal');
        g.box(i, 10, -3, i, 9 + h - 1, -3, ORO_OSC, 'metal');
      }
      g.mirrorX(4, 10, -2, 4, 13, 2, ORO, 'metal');
    } else {
      // Corona real de Copas con cresta carmesí
      for (const [dx, h] of [
        [-4, 4],
        [-2, 5],
        [0, 6],
        [2, 5],
        [4, 4],
      ] as const) {
        g.box(dx, 10, 3, dx, 9 + h, 3, ORO, 'metal');
      }
      g.box(-1, 12, 3, 1, 14, 3, RUBI, 'emissive');
      g.mirrorX(4, 10, -2, 4, 12, 1, ORO, 'metal');
    }

    return construirMallaVoxel(g, V, [0, 0, 0]);
  }

  private construirBrazo(palo: Palo, lado: 'izq' | 'der'): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();

    // Manga y puño
    g.box(-1, -6, -1, 1, 0, 1, c.tunica);
    g.box(-1, -7, -1, 1, -6, 1, ORO, 'metal');
    g.box(-1, -9, -1, 1, -7, 1, c.piel);

    if (lado === 'der') {
      if (palo === 'S') {
        // Gran Espada voxel alzada
        g.box(-1, -10, 1, 1, -9, 3, ORO, 'metal');
        g.box(-3, -8, 2, 3, -7, 3, ORO, 'metal');
        g.box(-1, -6, 2, 1, 10, 3, ACERO, 'metal');
        g.box(0, -5, 3, 0, 12, 3, ACERO_LUZ, 'emissive');
      } else if (palo === 'C') {
        // Garrote nudoso con enredaderas esmeralda
        g.box(-1, -11, 2, 1, -4, 3, CUERO);
        g.box(-2, -3, 1, 2, 9, 4, 0x452410);
        g.set(-2, 2, 4, 0x22f06a, 'emissive').set(2, 5, 4, 0x22f06a, 'emissive').set(0, 8, 4, 0x22f06a, 'emissive');
        g.box(-1, 9, 2, 1, 11, 3, 0x2a7a38);
      } else if (palo === 'D') {
        // Escudo-Moneda de Oro gigante
        const escudo = [
          '..OOOOO..',
          '.OOLLLDO.',
          'OOLOOOLDO',
          'OOLOOOLDO',
          'OOLOOOLDO',
          'OOLLLLLDO',
          'OOLLOLDDO',
          '.OODDDDO.',
          '..DDDDD..',
        ];
        g.extrude2D(
          escudo,
          { O: ORO, L: 0xfff08a, D: ORO_OSC },
          2,
          1,
          -12,
          4,
          'metal',
          { L: 'emissive' },
        );
      } else {
        // Cáliz gigante desbordante de magia carmesí
        g.box(-2, -11, 2, 2, -10, 4, ORO, 'metal');
        g.box(-1, -9, 2, 1, -5, 4, ORO, 'metal');
        g.box(-4, -4, 1, 4, 3, 5, RUBI, 'metal');
        g.box(-4, 3, 1, 4, 4, 5, ORO, 'metal');
        g.box(-3, 4, 2, 3, 5, 4, 0xff2b64, 'emissive');
      }
    } else {
      // Mano izquierda (arma secundaria en S y C)
      if (palo === 'S') {
        g.box(-1, -10, 1, 1, -8, 5, ORO, 'metal');
        g.box(0, -8, 5, 0, -2, 13, ACERO, 'metal');
        g.set(0, -2, 14, ACERO_LUZ, 'emissive');
      } else if (palo === 'C') {
        g.box(-1, -12, 2, 1, 4, 4, CUERO);
        g.set(-1, 1, 4, 0x22f06a, 'emissive').set(1, -2, 4, 0x22f06a, 'emissive');
      }
    }

    return construirMallaVoxel(g, V, [0, 0, 0]);
  }

  private crearRey(palo: Palo): ReyArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();

    const torso = this.construirTorso(palo);
    const capa = this.construirCapa(palo);
    capa.position.set(0, 8 * V, -2.6 * V);

    const cabeza = this.construirCabeza(palo);
    cabeza.position.set(0, 9.2 * V, 0);

    const offHombro = (5.2 + CFG[palo].anchoHombro) * V;
    const brazoIzq = this.construirBrazo(palo, 'izq');
    brazoIzq.position.set(-offHombro - V, 8 * V, 0.5 * V);

    const brazoDer = this.construirBrazo(palo, 'der');
    brazoDer.position.set(offHombro + 2 * V, 8 * V, 0.5 * V);

    cuerpo.add(torso, capa, cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);

    const orbesSegunda: THREE.Mesh[] = [];
    const geoOrbe = new THREE.BoxGeometry(0.065, 0.065, 0.065);
    const matOrbe = new THREE.MeshBasicMaterial({ color: COLOR_REY[palo] });
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(geoOrbe, matOrbe);
      m.visible = false;
      grupo.add(m);
      orbesSegunda.push(m);
    }

    return { grupo, cuerpo, cabeza, brazoIzq, brazoDer, capa, orbesSegunda };
  }

  lanzarPoder(cam: THREE.PerspectiveCamera, palo: Palo): void {
    this.castTimer = 0.72;
    const origen = this.raiz.visible ? this.raiz.position.clone() : new THREE.Vector3(0, 2.2, 0.8);
    const col = COLOR_REY[palo];

    if (palo === 'S') {
      for (let i = -1; i <= 1; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.94 });
        const tajo = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.09, 0.06), mat);
        tajo.position.copy(origen).add(new THREE.Vector3(i * 0.25, -0.1, 0.35));
        tajo.quaternion.copy(cam.quaternion);
        tajo.rotateZ(i * 0.55 + 0.4);
        this.vfxGrupo.add(tajo);
        this.vfx.push({ malla: tajo, vel: new THREE.Vector3(i * 1.4, -2.4, 3.2), rotVel: new THREE.Vector3(0, 0, i * 2), vida: 0.55, maxVida: 0.55 });
      }
    } else if (palo === 'C') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.55, roughness: 0.4 });
        const estaca = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.45, 0.11), mat);
        estaca.position.copy(origen).add(new THREE.Vector3(Math.cos(a) * 0.55, -0.35, Math.sin(a) * 0.35 + 0.3));
        this.vfxGrupo.add(estaca);
        this.vfx.push({ malla: estaca, vel: new THREE.Vector3(Math.cos(a) * 0.4, 1.8, Math.sin(a) * 0.4), rotVel: new THREE.Vector3(0, 3, 0), vida: 0.65, maxVida: 0.65 });
      }
    } else if (palo === 'D') {
      const geo = new THREE.BoxGeometry(0.16, 0.16, 0.05);
      const matOro = new THREE.MeshStandardMaterial({ color: ORO, metalness: 0.72, roughness: 0.28, emissive: 0x3b2600 });
      for (let i = 0; i < 12; i++) {
        const moneda = new THREE.Mesh(geo, matOro);
        moneda.position.copy(origen).add(new THREE.Vector3((Math.random() - 0.5) * 1.1, 0.2, 0.3));
        this.vfxGrupo.add(moneda);
        this.vfx.push({
          malla: moneda,
          vel: new THREE.Vector3((Math.random() - 0.5) * 2.6, 1.2 + Math.random() * 1.5, 2.2 + Math.random()),
          rotVel: new THREE.Vector3(9, 6, 7),
          vida: 0.85,
          maxVida: 0.85,
        });
      }
    } else {
      const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
      const anillo = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.34, 12), ringMat);
      anillo.position.copy(origen).add(new THREE.Vector3(0, -0.1, 0.35));
      anillo.quaternion.copy(cam.quaternion);
      this.vfxGrupo.add(anillo);
      this.vfx.push({ malla: anillo, vel: new THREE.Vector3(0, -0.4, 1.8), rotVel: new THREE.Vector3(0, 0, 2.5), vida: 0.65, maxVida: 0.65, esOnda: true });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const orbe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.92 }));
        orbe.position.copy(origen).add(new THREE.Vector3(Math.cos(a) * 0.25, 0.05, 0.35));
        this.vfxGrupo.add(orbe);
        this.vfx.push({ malla: orbe, vel: new THREE.Vector3(Math.cos(a) * 1.8, -0.8 + Math.random(), 2.2), rotVel: new THREE.Vector3(4, 4, 4), vida: 0.7, maxVida: 0.7 });
      }
    }
  }

  private proyectar(cam: THREE.PerspectiveCamera, cx: number, cy: number, h: number, dist: number, outPos: THREE.Vector3): number {
    const W = Math.max(1, window.innerWidth);
    const H = Math.max(1, window.innerHeight);
    const ndcX = (cx / W) * 2 - 1;
    const ndcY = -(cy / H) * 2 + 1;
    const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5));
    cam.getWorldDirection(this.vFwd);
    this.vCentroPlano.copy(cam.position).addScaledVector(this.vFwd, dist);
    this.plano.setFromNormalAndCoplanarPoint(this.vFwd, this.vCentroPlano);
    this.vOrigen.set(ndcX, ndcY, -1).unproject(cam);
    this.vDir.copy(this.vOrigen).sub(cam.position).normalize();
    this.ray.set(cam.position, this.vDir);
    if (!this.ray.intersectPlane(this.plano, outPos)) outPos.copy(this.vCentroPlano);
    return Math.max(0.05, (h / H) * visH);
  }

  sincronizar(cam: THREE.PerspectiveCamera, dt: number, quieto: boolean, reloj: number): void {
    for (let i = this.vfx.length - 1; i >= 0; i--) {
      const p = this.vfx[i];
      p.vida -= dt;
      if (p.vida <= 0) {
        this.vfxGrupo.remove(p.malla);
        this.vfx.splice(i, 1);
        continue;
      }
      p.malla.position.addScaledVector(p.vel, dt);
      p.malla.rotation.x += p.rotVel.x * dt;
      p.malla.rotation.y += p.rotVel.y * dt;
      p.malla.rotation.z += p.rotVel.z * dt;
      if (p.esOnda) p.malla.scale.addScalar(dt * 3.8);
      const mat = p.malla.material as THREE.Material & { opacity?: number };
      if ('opacity' in mat && typeof mat.opacity === 'number') {
        mat.opacity = Math.max(0, p.vida / p.maxVida);
      }
    }

    const eEl = document.querySelector<HTMLElement>('.mesa .e-carta[data-jefe="1"]');
    if (!eEl) {
      this.raiz.visible = false;
      this.paloActivo = null;
      this.eraHerido = false;
      return;
    }
    const r = eEl.getBoundingClientRect();
    if (r.width < 12 || r.height < 12) {
      this.raiz.visible = false;
      return;
    }

    const palo = (eEl.dataset.palo || 'S') as Palo;
    const segunda = eEl.dataset.segunda === '1';
    const herido = eEl.classList.contains('herido');
    const embiste = eEl.classList.contains('embiste');
    const aturdido = eEl.classList.contains('aturdido');
    const grieta = eEl.classList.contains('grieta-1') || eEl.classList.contains('grieta-2') || eEl.classList.contains('grieta-3');

    if (palo !== this.paloActivo) {
      this.paloActivo = palo;
      this.entrada = quieto ? 1 : 0;
    } else if (!quieto) {
      this.entrada = Math.min(1, this.entrada + dt * 2.6);
    }

    if (herido && !this.eraHerido && !quieto) {
      this.golpeTimer = 0.42;
    }
    this.eraHerido = herido;

    if (this.castTimer > 0 && !quieto) this.castTimer = Math.max(0, this.castTimer - dt);
    if (this.golpeTimer > 0 && !quieto) this.golpeTimer = Math.max(0, this.golpeTimer - dt);

    const worldH = this.proyectar(cam, r.left + r.width / 2, r.top + r.height * 0.67, r.height, 5.55, this.raiz.position);
    this.raiz.scale.setScalar(worldH * 0.64);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    this.luzRey.color.setHex(COLOR_REY[palo]);
    this.luzRey.intensity = (segunda ? 2.15 : 1.45) + (this.castTimer > 0 ? 1.2 : 0);
    this.luzFrente.intensity = this.golpeTimer > 0 ? 2.9 : 1.6;

    for (const k of ['S', 'C', 'D', 'H'] as const) {
      const fig = this.figuras[k];
      fig.grupo.visible = k === palo;
      if (!fig.grupo.visible) continue;

      const castPhase = this.castTimer > 0 ? Math.sin((this.castTimer / 0.72) * Math.PI) : 0;
      const hitPhase = this.golpeTimer > 0 ? Math.sin((this.golpeTimer / 0.42) * Math.PI) : 0;
      const emb = castPhase * 0.28 + (embiste ? 0.16 : 0);
      const bob = quieto ? 0 : Math.sin(reloj * 2.4) * 0.02;
      const zSale = (quieto ? 0.15 : 0.15 * this.entrada) + emb - hitPhase * 0.25;
      const temblor = grieta && !quieto ? Math.sin(reloj * 38) * 0.04 : 0;

      fig.cuerpo.position.set(temblor, bob - 0.2, zSale);
      fig.cuerpo.rotation.set(
        emb * 0.35 - hitPhase * 0.32 + (segunda ? 0.08 : 0),
        quieto ? -0.08 : Math.sin(reloj * 1.15) * 0.15 - 0.06,
        aturdido && !quieto ? Math.sin(reloj * 7.5) * 0.1 : hitPhase * 0.14,
      );

      fig.cabeza.rotation.set(
        (segunda ? 0.08 : 0.02) - hitPhase * 0.2,
        quieto ? 0.06 : Math.sin(reloj * 1.8) * 0.1,
        aturdido && !quieto ? Math.cos(reloj * 6.5) * 0.12 : 0,
      );

      const armaSwing = castPhase * 0.72 + (quieto ? 0 : Math.sin(reloj * 2.1) * 0.06);
      fig.brazoDer.rotation.set(-0.22 - armaSwing, 0, -0.08 - castPhase * 0.2);
      fig.brazoIzq.rotation.set(0.1 + (quieto ? 0 : Math.cos(reloj * 1.9) * 0.06), 0, 0.08);
      fig.capa.rotation.x = 0.08 + (quieto ? 0 : Math.sin(reloj * 2.8) * 0.05) + emb * 0.25;

      fig.orbesSegunda.forEach((orb, idx) => {
        orb.visible = segunda;
        if (segunda) {
          const ang = (idx / 4) * Math.PI * 2 + (quieto ? 0 : reloj * 2.2);
          orb.position.set(Math.cos(ang) * 0.56, 0.25 + Math.sin(ang * 2) * 0.12, Math.sin(ang) * 0.35);
          orb.rotation.y = ang;
        }
      });
    }
  }
}
