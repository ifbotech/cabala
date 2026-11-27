// Los 4 Reyes Malvados en Dark-Gothic Pixel-3D de alta densidad (V = 0.017, cero bloques Minecraft).
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { armoniaActual } from '../musica';
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
  pielSombra: number;
  pelo: number;
  peloLuz: number;
  ojo: number;
  anchoExtra: number;
}

const CFG: Record<Palo, ReyConfig> = {
  S: {
    tunica: 0x132b6e,
    tunicaOsc: 0x0a1742,
    capa: 0x090f29,
    piel: 0xc78d6b,
    pielSombra: 0x7a4458,
    pelo: 0x1c1016,
    peloLuz: 0x36222c,
    ojo: 0x00e5ff,
    anchoExtra: 0,
  },
  C: {
    tunica: 0x0d4222,
    tunicaOsc: 0x072413,
    capa: 0x061a0e,
    piel: 0xc48866,
    pielSombra: 0x754052,
    pelo: 0x5c2814,
    peloLuz: 0x7d3b1e,
    ojo: 0x22f06a,
    anchoExtra: 2,
  },
  D: {
    tunica: 0x3a1059,
    tunicaOsc: 0x210836,
    capa: 0x160726,
    piel: 0xc9916d,
    pielSombra: 0x7a4458,
    pelo: 0x4d2614,
    peloLuz: 0x6e3a20,
    ojo: 0xffd500,
    anchoExtra: 0,
  },
  H: {
    tunica: 0x6e0c22,
    tunicaOsc: 0x400514,
    capa: 0x24040d,
    piel: 0xbfa8a0,
    pielSombra: 0x6e5660,
    pelo: 0xcfc8c2,
    peloLuz: 0xede6df,
    ojo: 0xff1e5c,
    anchoExtra: 0,
  },
};

const ORO = 0xc98c1e;
const ORO_OSC = 0x78430b;
const CUERO = 0x3b1b14;
const BOTA = 0x1c0f12;
const ARMINO = 0xcfc3ad;
const ABISMO = 0x0b0711;
const RUBI = 0xc4143a;
const ACERO = 0x6b9ac4;
const ACERO_LUZ = 0xb8f6ff;

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

const V = 0.017;

export class Reyes3D {
  readonly raiz = new THREE.Group();
  private readonly figuras: Record<Palo, ReyArticulado>;
  private readonly luzRey: THREE.PointLight;
  private readonly luzFrente: THREE.PointLight;
  private readonly vfxGrupo = new THREE.Group();
  private readonly vfx: ParticulaVfx[] = [];
  private readonly geoOnda = new THREE.RingGeometry(0.16, 0.28, 24);
  private readonly geoMoneda = new THREE.CylinderGeometry(0.1, 0.1, 0.035, 8);
  private readonly geoGota = new THREE.OctahedronGeometry(0.085, 0);
  private readonly geoEstaca = new THREE.ConeGeometry(0.08, 0.46, 6);
  private paloActivo: Palo | null = null;
  private entrada = 0;
  private castTimer = 0;
  private golpeTimer = 0;
  private eraHerido = false;
  private pulsoSuave = 0;

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

    this.luzFrente = new THREE.PointLight(0xffcf94, 1.45, 4.2, 1.4);
    this.luzFrente.position.set(-0.35, 0.55, 1.35);
    this.luzRey = new THREE.PointLight(0x00e5ff, 1.35, 3.8, 1.5);
    this.luzRey.position.set(0.55, 0.45, 0.9);
    this.raiz.add(this.luzFrente, this.luzRey);
    this.raiz.visible = false;

    escena.add(this.raiz, this.vfxGrupo);
  }

  private construirTorso(palo: Palo): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();
    const w = 8 + c.anchoExtra;

    // Botas redondeadas y piernas
    g.ellipsoid(-3.5, -10, 1.2, 2.6, 1.9, 3.5, BOTA);
    g.ellipsoid(3.5, -10, 1.2, 2.6, 1.9, 3.5, BOTA);
    g.taperedCylinder(-3.5, -8, 0, 0, 2.5, 2.5, 3.0, 2.8, c.capa);
    g.taperedCylinder(3.5, -8, 0, 0, 2.5, 2.5, 3.0, 2.8, c.capa);

    // Túnica real anatómica en reloj de arena con dithering sin aristas cuadradas
    g.sculptTorso(0, 8, 19, w + 2.4, 5.4, w - 1.4, 4.0, w + 1.0, 4.8, c.tunica);
    g.ditherRecolor(-w - 3, 0, -6, w + 3, 5, 6, c.tunicaOsc, c.tunica);
    g.box(-1, 1, 4, 1, 16, 5, ORO, 'metal');
    g.taperedCylinder(0, 0, 1, 0, w + 2.4, 5.4, w + 2.3, 5.3, ORO_OSC, 'metal');

    // Cinturón de cuero y hebilla
    g.taperedCylinder(0, 7, 9, 0, w - 0.6, 4.3, w - 0.6, 4.3, CUERO);
    g.ellipsoid(0, 8, 4.6, 2.1, 1.2, 0.9, ORO, 'metal');

    // Cuello de armiño envejecido + motas abismales
    g.taperedCylinder(0, 17, 20, 0, w + 1.2, 4.8, w - 0.5, 4.4, ARMINO);
    for (const mx of [-5, -2, 2, 5]) {
      g.set(mx, 19, 4, ABISMO).set(mx - 1, 18, 4, ABISMO);
    }

    // Cadena real + rubí
    g.box(-5, 16, 5, 5, 16, 5, ORO, 'metal');
    g.ellipsoid(0, 14.5, 5, 1.3, 1.3, 0.9, RUBI, 'metal');

    // Hombreras reales esculpidas redondeadas
    g.ellipsoid(-w - 1.2, 17.5, 0, 3.8, 3.2, 3.8, c.tunicaOsc);
    g.ellipsoid(w + 1.2, 17.5, 0, 3.8, 3.2, 3.8, c.tunicaOsc);
    g.ellipsoid(-w - 1.6, 19.2, 0, 2.4, 1.4, 2.6, ORO, 'metal');
    g.ellipsoid(w + 1.6, 19.2, 0, 2.4, 1.4, 2.6, ORO, 'metal');

    return construirMallaVoxel(g, V, [0, 7, 0]);
  }

  private construirCapa(palo: Palo): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();
    const w = 10 + c.anchoExtra;
    g.sculptCape(-19, 1, 0, w + 3.2, w - 1.2, 1.6, 5, c.capa, c.tunicaOsc);
    g.curve3D([[-w + 1, 0, 0], [-w - 2.2, -18, -1.2]], 0.9, 0.9, ORO_OSC, 'metal');
    g.curve3D([[w - 1, 0, 0], [w + 2.2, -18, -1.2]], 0.9, 0.9, ORO_OSC, 'metal');
    return construirMallaVoxel(g, V, [0, 1, 0]);
  }

  private construirCabeza(palo: Palo): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();

    // Melena/cráneo redondeado + cabeza esculpida (cero bloque cuadrado)
    g.sculptDome(0, 6.5, -0.8, 6.1, 7.2, 5.6, c.pelo);
    g.sculptHead(0, 6.5, 0.2, 5.4, 6.8, 5.0, c.piel, c.pielSombra);

    const pal: Record<string, number> = {
      C: c.pelo,
      L: c.peloLuz,
      O: c.ojo,
      B: ABISMO,
      R: RUBI,
      N: c.pielSombra,
      M: 0x3b1218,
    };
    const matMap: Record<string, VoxelMat> = { O: 'emissive' };

    if (palo === 'S') {
      g.paintFront(
        -4,
        10,
        5,
        [
          'CC.....CC',
          'BOO...OOR',
          '....N..R.',
          'CCC.N.CCR',
          '.CCCCCCC.',
          '..CCCCC..',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.taperedCylinder(0, -3, 2, 3, 1.6, 1.4, 3.6, 2.0, c.pelo);
    } else if (palo === 'C') {
      g.paintFront(
        -4,
        10,
        5,
        [
          'CCC...CCC',
          'BOO...OOB',
          '....N....',
          'LLLLLLLLL',
          'CCCCCCCCC',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.taperedCylinder(0, -4, 4, 3, 3.2, 2.2, 5.4, 2.8, c.pelo);
      g.ditherRecolor(-6, -4, 0, 6, 4, 7, c.peloLuz, c.pelo);
    } else if (palo === 'D') {
      g.paintFront(
        -4,
        10,
        5,
        [
          'CC.....CC',
          'BOO...OOB',
          '....N....',
          'C...M...C',
          '.CCCCCCC.',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.taperedCylinder(0, -2, 3, 3, 2.4, 1.8, 4.2, 2.2, c.pelo);
    } else {
      // Melena y barba blanca larga
      g.taperedCylinder(-5.2, -3, 9, -1, 1.8, 2.2, 1.6, 2.0, c.pelo);
      g.taperedCylinder(5.2, -3, 9, -1, 1.8, 2.2, 1.6, 2.0, c.pelo);
      g.paintFront(
        -4,
        10,
        5,
        [
          'CC.....CC',
          'BOO...OOB',
          '....N....',
          '..MM.MM..',
          '.LLLLLLL.',
        ],
        pal,
        1,
        'matte',
        matMap,
      );
      g.taperedCylinder(0, -7, 3, 3, 2.2, 1.8, 4.4, 2.4, c.pelo);
      g.ditherRecolor(-5, -7, 0, 5, 3, 7, c.peloLuz, c.pelo);
    }

    // Aro de la corona en oro antiguo
    g.taperedCylinder(0, 12, 14, 0, 6.2, 5.8, 6.4, 6.0, ORO, 'metal');
    g.set(-3, 13, 6, COLOR_REY[palo], 'emissive');
    g.set(0, 13, 6, RUBI, 'metal');
    g.set(3, 13, 6, COLOR_REY[palo], 'emissive');

    if (palo === 'S') {
      // 5 hojas afiladas de acero oscuro
      for (const [dx, h] of [
        [-5, 6],
        [-2.5, 8],
        [0, 11],
        [2.5, 8],
        [5, 6],
      ] as const) {
        g.taperedCylinder(dx, 14, 14 + h, 4, 1.1, 0.9, 0.5, 0.5, ACERO, 'metal');
        g.set(Math.round(dx), 14 + h, 4, ACERO_LUZ, 'emissive');
      }
      g.mirrorX(5, 14, -3, 5, 19, 1, ACERO, 'metal');
    } else if (palo === 'C') {
      // Ramas orgánicas con curve3D + brotes esmeralda
      g.curve3D([[-4, 14, 2], [-7, 20, 3], [-9, 23, 3]], 1.4, 0.7, CUERO);
      g.curve3D([[4, 14, 2], [7, 20, 3], [9, 23, 3]], 1.4, 0.7, CUERO);
      g.curve3D([[0, 14, 4], [1, 21, 5]], 1.3, 0.7, CUERO);
      g.ellipsoid(-9, 24, 3, 1.7, 1.5, 1.5, 0x22f06a, 'emissive');
      g.ellipsoid(9, 24, 3, 1.7, 1.5, 1.5, 0x22f06a, 'emissive');
      g.ellipsoid(1, 22, 5, 1.8, 1.6, 1.5, 0x22f06a, 'emissive');
    } else if (palo === 'D') {
      // Corona solar gótica
      for (let i = -5; i <= 5; i += 2) {
        const h = i === 0 ? 11 : Math.abs(i) === 3 ? 8 : 6;
        g.taperedCylinder(i, 14, 14 + h, 4, 1.0, 0.9, 0.5, 0.5, ORO, 'metal');
      }
      g.mirrorX(5, 14, -3, 5, 19, 2, ORO_OSC, 'metal');
    } else {
      // Corona real de Copas
      for (const [dx, h] of [
        [-5, 6],
        [-2.5, 8],
        [0, 10],
        [2.5, 8],
        [5, 6],
      ] as const) {
        g.taperedCylinder(dx, 14, 14 + h, 4, 1.0, 0.9, 0.5, 0.5, ORO, 'metal');
      }
      g.box(-1, 18, 4, 1, 22, 5, RUBI, 'emissive');
      g.mirrorX(5, 14, -3, 5, 18, 2, ORO, 'metal');
    }

    return construirMallaVoxel(g, V, [0, 0, 0]);
  }

  private construirBrazo(palo: Palo, lado: 'izq' | 'der'): THREE.Group {
    const c = CFG[palo];
    const g = new VoxelGrid();

    g.curve3D([[0, 0, 0], [lado === 'der' ? 1.5 : -1.5, -6, 1.5], [0, -12, 3.5]], 2.7, 1.9, c.tunica);
    g.ellipsoid(0, -11, 3.5, 2.2, 1.2, 2.0, ORO, 'metal');
    g.ellipsoid(0, -13, 3.5, 1.8, 1.7, 1.8, c.piel);

    if (lado === 'der') {
      if (palo === 'S') {
        // Espada larga afinada
        g.box(-1, -17, 2, 1, -15, 4, ORO, 'metal');
        g.box(-4, -14, 2, 4, -13, 4, ORO, 'metal');
        g.box(-1, -12, 3, 1, 18, 4, ACERO, 'metal');
        g.box(0, -10, 4, 0, 21, 4, ACERO_LUZ, 'emissive');
      } else if (palo === 'C') {
        // Garrote orgánico nudoso con enredaderas
        g.curve3D([[0, -18, 2], [1, -4, 3], [0, 16, 3]], 1.3, 3.0, CUERO);
        g.set(-2, 4, 5, 0x22f06a, 'emissive').set(2, 9, 5, 0x22f06a, 'emissive').set(0, 14, 5, 0x22f06a, 'emissive');
      } else if (palo === 'D') {
        // Escudo-Moneda de Oro tallado con relieve profundo
        const escudo = [
          '...OOOOOOO...',
          '..OOLLLLLDO..',
          '.OOLOOOOOLDO.',
          'OOLOOLLL0OLDO',
          'OOLOOLOL0OLDO',
          'OOLOOLLL0OLDO',
          'OOLOOOOOOOLDO',
          '.OOLLLLLLLDO.',
          '..OODDDDDDO..',
          '...DDDDDDD...',
        ];
        g.extrude2D(
          escudo,
          { O: ORO, L: 0xffe46b, D: ORO_OSC, '0': ORO_OSC },
          3,
          2,
          -20,
          5,
          'metal',
          { L: 'emissive' },
        );
      } else {
        // Cáliz gótico esculpido (pie fino, copa acampanada y fulgor carmesí)
        g.taperedCylinder(2, -18, -16, 4, 3.6, 3.6, 1.4, 1.4, ORO, 'metal');
        g.cylinderY(2, -16, -9, 4, 1.1, 1.1, ORO, 'metal');
        g.taperedCylinder(2, -9, 4, 4, 1.8, 1.8, 5.2, 5.2, RUBI, 'metal');
        g.taperedCylinder(2, 3, 5, 4, 5.4, 5.4, 5.6, 5.6, ORO, 'metal');
        g.ellipsoid(2, 5, 4, 4.0, 1.4, 4.0, 0xff2b64, 'emissive');
      }
    } else {
      if (palo === 'S') {
        g.box(-1, -16, 2, 1, -13, 6, ORO, 'metal');
        g.box(0, -13, 6, 0, -3, 22, ACERO, 'metal');
        g.set(0, -3, 23, ACERO_LUZ, 'emissive');
      } else if (palo === 'C') {
        g.curve3D([[0, -18, 2], [-1, -4, 3], [0, 10, 4]], 1.3, 2.5, CUERO);
        g.set(-1, 2, 5, 0x22f06a, 'emissive').set(1, -3, 5, 0x22f06a, 'emissive');
      }
    }

    return construirMallaVoxel(g, V, [0, 0, 0]);
  }

  private crearRey(palo: Palo): ReyArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();

    const torso = this.construirTorso(palo);
    const capa = this.construirCapa(palo);
    capa.position.set(0, 11 * V, -4.8 * V);

    const cabeza = this.construirCabeza(palo);
    cabeza.position.set(0, 13 * V, 0);

    const offHombro = (10 + CFG[palo].anchoExtra) * V;
    const brazoIzq = this.construirBrazo(palo, 'izq');
    brazoIzq.position.set(-offHombro - 2 * V, 11 * V, 0.5 * V);

    const brazoDer = this.construirBrazo(palo, 'der');
    brazoDer.position.set(offHombro + 3 * V, 11 * V, 0.5 * V);

    cuerpo.add(torso, capa, cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);

    const orbesSegunda: THREE.Mesh[] = [];
    const geoOrbe = new THREE.OctahedronGeometry(0.065, 0);
    const matOrbe = new THREE.MeshBasicMaterial({ color: COLOR_REY[palo] });
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(geoOrbe, matOrbe);
      m.visible = false;
      grupo.add(m);
      orbesSegunda.push(m);
    }

    return { grupo, cuerpo, cabeza, brazoIzq, brazoDer, capa, orbesSegunda };
  }

  transformarSegunda(cam: THREE.PerspectiveCamera, palo: Palo): void {
    this.castTimer = 0.85;
    const origen = this.raiz.visible ? this.raiz.position.clone() : new THREE.Vector3(0, 2.2, 0.8);
    const onda = new THREE.Mesh(
      this.geoOnda,
      new THREE.MeshBasicMaterial({ color: COLOR_REY[palo], transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
    );
    onda.position.copy(origen).add(new THREE.Vector3(0, 0.1, 0.35));
    onda.quaternion.copy(cam.quaternion);
    this.vfxGrupo.add(onda);
    this.vfx.push({ malla: onda, vel: new THREE.Vector3(0, 0, 1.2), rotVel: new THREE.Vector3(0, 0, 1.5), vida: 0.55, maxVida: 0.55, esOnda: true });
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
        const estaca = new THREE.Mesh(this.geoEstaca, mat);
        estaca.position.copy(origen).add(new THREE.Vector3(Math.cos(a) * 0.55, -0.35, Math.sin(a) * 0.35 + 0.3));
        this.vfxGrupo.add(estaca);
        this.vfx.push({ malla: estaca, vel: new THREE.Vector3(Math.cos(a) * 0.4, 1.8, Math.sin(a) * 0.4), rotVel: new THREE.Vector3(0, 3, 0), vida: 0.65, maxVida: 0.65 });
      }
    } else if (palo === 'D') {
      const matOro = new THREE.MeshStandardMaterial({ color: ORO, metalness: 0.72, roughness: 0.28, emissive: 0x3b2600 });
      for (let i = 0; i < 12; i++) {
        const moneda = new THREE.Mesh(this.geoMoneda, matOro);
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
        const orbe = new THREE.Mesh(this.geoGota, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.92 }));
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
    if (!eEl || eEl.classList.contains('partida')) {
      this.raiz.visible = false;
      if (!eEl) {
        this.paloActivo = null;
        this.eraHerido = false;
      }
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

    const arm = armoniaActual();
    const pulsoMeta = !quieto && arm && (arm.paso === 0 || arm.paso === 6 || arm.paso === 12) ? 1 : 0;
    this.pulsoSuave += (pulsoMeta - this.pulsoSuave) * (1 - Math.exp(-10 * dt));

    const worldH = this.proyectar(cam, r.left + r.width / 2, r.top + r.height * 0.52, r.height, 5.55, this.raiz.position);
    this.raiz.scale.setScalar(worldH * 0.94);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    this.luzRey.color.setHex(COLOR_REY[palo]);
    this.luzRey.intensity = (segunda ? 2.85 : 2.05) + (this.castTimer > 0 ? 1.25 : 0) + this.pulsoSuave * 0.45;
    this.luzFrente.intensity = this.golpeTimer > 0 ? 3.25 : 2.35;

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

      fig.cuerpo.position.set(temblor, bob - 0.02 + this.pulsoSuave * 0.018, zSale);
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
          const ang = (idx / 4) * Math.PI * 2 + Math.PI * 0.25 + (quieto ? 0 : reloj * 1.9);
          orb.position.set(Math.cos(ang) * 0.62, 0.22 + Math.sin(ang) * 0.28, -0.16 + Math.sin(ang * 2) * 0.06);
          orb.rotation.set(ang * 0.7, ang, ang * 0.5);
        }
      });
    }
  }
}
