// Los 5 Héroes de Mazo en Dark-Gothic Pixel-3D de alta densidad (V = 0.018, cero bloques Minecraft).
import * as THREE from 'three';
import type { MazoId } from '../../rules/mazos';
import { armoniaActual } from '../musica';
import { VoxelGrid, construirMallaVoxel } from './voxel';

const V = 0.018;
const PIEL = 0xc78d6b;
const PIEL_SOMBRA = 0x7a4458;
const BOTA = 0x241410;
const ORO = 0xc98c1e;
const CUERO = 0x422116;
const ABISMO = 0x0b0711;
const HUESO = 0xd9ceb4;

interface HeroeArticulado {
  grupo: THREE.Group;
  cuerpo: THREE.Group;
  cabeza: THREE.Group;
  brazoDer: THREE.Group;
  brazoIzq: THREE.Group;
}

export class Heroes3D {
  readonly raiz = new THREE.Group();
  private readonly heroes: Record<MazoId, HeroeArticulado>;
  private readonly luzFrente: THREE.PointLight;
  private readonly luzRim: THREE.PointLight;
  private pulsoSuave = 0;

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();

  constructor(escena: THREE.Scene) {
    this.heroes = {
      escoba: this.crearEscoba(),
      truco: this.crearTruco(),
      chinchon: this.crearChinchon(),
      mentiroso: this.crearMentiroso(),
      chancho: this.crearChancho(),
    };
    for (const m of ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const) {
      this.heroes[m].grupo.visible = false;
      this.raiz.add(this.heroes[m].grupo);
    }

    this.luzFrente = new THREE.PointLight(0xffcf94, 2.1, 4.4, 1.35);
    this.luzFrente.position.set(-0.3, 0.5, 1.35);
    this.luzRim = new THREE.PointLight(0xd9842b, 1.45, 3.6, 1.5);
    this.luzRim.position.set(0.55, 0.45, -0.35);
    this.raiz.add(this.luzFrente, this.luzRim);
    this.raiz.visible = false;
    escena.add(this.raiz);
  }

  private baseCuerpo(ropa: number, ropaOsc: number, pantalon: number, ancho = 7.4, cinturon = true): VoxelGrid {
    const g = new VoxelGrid();
    g.ellipsoid(-3.5, -17.5, 1.2, 2.3, 1.8, 3.0, BOTA);
    g.ellipsoid(3.5, -17.5, 1.2, 2.3, 1.8, 3.0, BOTA);
    g.taperedCylinder(-3.5, -15, -2, 0, 2.2, 2.2, 2.8, 2.6, pantalon);
    g.taperedCylinder(3.5, -15, -2, 0, 2.2, 2.2, 2.8, 2.6, pantalon);
    g.sculptTorso(-3, 4, 14, ancho + 1.0, 4.4, ancho - 1.4, 3.4, ancho + 0.6, 4.3, ropa);
    g.ditherRecolor(-Math.ceil(ancho) - 2, -3, -5, Math.ceil(ancho) + 2, 2, 5, ropaOsc, ropa);
    g.ellipsoid(-ancho - 0.6, 12.2, 0, 2.5, 2.4, 2.6, ropa);
    g.ellipsoid(ancho + 0.6, 12.2, 0, 2.5, 2.4, 2.6, ropa);
    if (cinturon) {
      g.taperedCylinder(0, 3, 5, 0, ancho - 0.8, 3.7, ancho - 0.8, 3.7, CUERO);
      g.ellipsoid(0, 4, 4.0, 1.8, 1.1, 0.8, ORO, 'metal');
    }
    return g;
  }

  private baseCabeza(pelo: number): VoxelGrid {
    const g = new VoxelGrid();
    g.sculptDome(0, 6.5, -0.6, 5.8, 6.9, 5.4, pelo);
    g.sculptHead(0, 6, 0.2, 5.2, 6.4, 4.8, PIEL, PIEL_SOMBRA);
    g.paintFront(
      -3,
      8,
      5,
      [
        'O.....O',
        '...N...',
        '..MMM..',
      ],
      { O: ABISMO, N: PIEL_SOMBRA, M: 0x5c2424 },
      1,
    );
    return g;
  }

  private crearEscoba(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x5e1126, 0x3b0817, 0x260d18, 7.2, false);
    gT.taperedCylinder(0, -3, 10, 1, 6.4, 3.6, 5.4, 3.2, 0x9e8c76); // Delantal envejecido
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x591124);
    gC.taperedCylinder(-4.5, 0, 9, -1, 2.0, 2.2, 1.8, 2.0, 0x591124);
    gC.taperedCylinder(4.5, 0, 9, -1, 2.0, 2.2, 1.8, 2.0, 0x591124);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 14.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.curve3D([[0, 0, 0], [-1.2, -5.5, 1.0], [-0.5, -10.5, 2.5]], 2.2, 1.6, 0x5e1126);
    gBI.ellipsoid(-0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    // Escoba larga con paja escalonada oscura
    gBI.cylinderY(0, -24, 16, 2.5, 0.8, 0.8, CUERO);
    gBI.taperedCylinder(0, -33, -23, 2.5, 4.2, 2.6, 1.8, 1.4, 0xb88224);
    gBI.ditherRecolor(-5, -34, -1, 5, -27, 6, 0x9e6a18, 0x6e440c);
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-9 * V, 13 * V, 0.5 * V);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.curve3D([[0, 0, 0], [1.2, -5.5, 1.0], [0.5, -10.5, 2.5]], 2.2, 1.6, 0x5e1126);
    gBD.ellipsoid(0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(9 * V, 13 * V, 0);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearTruco(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x162e66, 0x0e1d42, 0x111829, 7.6);
    // Poncho triangular drapeado en índigo oscuro, borgoña y hueso
    gT.taperedCylinder(0, 4, 14, 0, 9.6, 5.4, 6.2, 4.2, 0x162e66);
    gT.ditherRecolor(-10, 7, -6, 10, 9, 6, 0x7a0e28, 0x470620);
    gT.ditherRecolor(-9, 6, -6, 9, 6, 6, HUESO, HUESO);
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x1a0f0c);
    gC.box(-4, 4, 5, 4, 5, 5, 0x140b09); // Bigote gaucho espeso
    // Sombrero gaucho oscuro con cinta carmesí
    gC.taperedCylinder(0, 11, 12, 0, 9.5, 9.5, 8.8, 8.8, 0x140e1c);
    gC.taperedCylinder(0, 13, 14, 0, 5.6, 5.6, 5.4, 5.4, 0x8c122e);
    gC.taperedCylinder(0, 15, 19, 0, 5.4, 5.4, 4.8, 4.8, 0x140e1c);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 14.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.curve3D([[0, 0, 0], [-1.3, -5.5, 1.0], [-0.5, -10.5, 2.5]], 2.2, 1.6, 0x162e66);
    gBI.ellipsoid(-0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    // Espada de acero oscuro
    gBI.box(-3, -11, 2, 3, -10, 3, ORO, 'metal');
    gBI.box(-1, -9, 2, 1, 16, 3, 0x73b3db, 'metal');
    gBI.box(0, -8, 3, 0, 18, 3, 0xc2efff, 'emissive');
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-9.5 * V, 13 * V, 0.5 * V);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.curve3D([[0, 0, 0], [1.3, -5.5, 1.0], [0.5, -10.5, 2.5]], 2.2, 1.6, 0x162e66);
    gBD.ellipsoid(0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    // Basto nudoso con curve3D
    gBD.curve3D([[0, -12, 2], [1, 0, 3], [0, 14, 2]], 1.4, 2.1, 0x195e28);
    gBD.set(1, 5, 4, 0x22d95b, 'emissive').set(-1, 11, 3, 0x22d95b, 'emissive');
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(9.5 * V, 13 * V, 0.5 * V);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearChinchon(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x104d24, 0x0a3317, 0x2b1a14, 7.2);
    gT.box(-2, 5, 4, 2, 14, 4, HUESO);
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x361e12);
    // Anteojos de latón con brillo sutil
    gC.box(-4, 7, 5, -1, 9, 5, 0x1a1423).box(1, 7, 5, 4, 9, 5, 0x1a1423);
    gC.set(-3, 8, 5, 0x7be0ff, 'emissive').set(2, 8, 5, 0x7be0ff, 'emissive');
    // Boina verde bosque
    gC.taperedCylinder(0, 11, 16, 0, 6.2, 6.2, 5.2, 5.2, 0x104d24);
    gC.ditherRecolor(-7, 13, -7, 7, 14, 7, 0x1d7536, 0x104d24);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 14.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.curve3D([[0, 0, 0], [-1.2, -5.5, 1.0], [-0.5, -10.5, 2.5]], 2.2, 1.6, 0x104d24);
    gBI.ellipsoid(-0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    gBI.ellipsoid(0, -11, 4, 2.8, 2.8, 1.0, 0x1d8c3e);
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-9 * V, 13 * V, 0.5 * V);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.curve3D([[0, 0, 0], [1.2, -5.5, 1.0], [0.5, -10.5, 2.5]], 2.2, 1.6, 0x104d24);
    gBD.ellipsoid(0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    gBD.box(-2, -12, 3, 3, -3, 4, HUESO);
    gBD.set(0, -7, 4, 0x8c122e);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(9 * V, 13 * V, 0.5 * V);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearMentiroso(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x3e1366, 0x22093b, 0x160a24, 7.4);
    gT.sculptCape(-8, 14, -4.2, 9.8, 6.4, 1.4, 4, 0x22093b, 0x3e1366); // Capa púrpura abismal con pliegues
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x160c21);
    // Antifaz veneciano púrpura/carmesí
    gC.box(-5, 7, 5, 5, 9, 5, 0x6b1d9e);
    gC.set(-3, 8, 5, 0xffd500, 'emissive').set(3, 8, 5, 0xffd500, 'emissive');
    gC.curve3D([[-2, 11, 4], [-4, 15, 3]], 1.0, 0.5, 0x8c122e);
    gC.curve3D([[2, 11, 4], [4, 15, 3]], 1.0, 0.5, 0x8c122e);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 14.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.curve3D([[0, 0, 0], [-1.2, -5.5, 1.0], [-0.5, -10.5, 2.5]], 2.2, 1.6, 0x3e1366);
    gBI.ellipsoid(-0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-9 * V, 13 * V, 0);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.curve3D([[0, 0, 0], [1.2, -5.5, 1.0], [0.5, -10.5, 2.5]], 2.2, 1.6, 0x3e1366);
    gBD.ellipsoid(0.5, -12, 2.5, 1.4, 1.4, 1.4, PIEL);
    gBD.box(-2, -12, 3, 3, -3, 4, HUESO);
    gBD.set(0, -7, 4, ABISMO);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(9 * V, 13 * V, 0.5 * V);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearChancho(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x212033, 0x131221, 0x241610, 8.4);
    // Escudo de jabalí tallado en madera oscura + orejas y colmillos curvos + candado de oro
    gT.ellipsoid(0, 6, 6, 7.2, 6.2, 1.5, 0x5c2818);
    gT.curve3D([[-4.5, 10.5, 5.5], [-6.5, 14, 6]], 1.3, 0.6, 0x5c2818);
    gT.curve3D([[4.5, 10.5, 5.5], [6.5, 14, 6]], 1.3, 0.6, 0x5c2818);
    gT.curve3D([[-4, 2, 6.5], [-5.5, 3.8, 7.5]], 0.9, 0.4, HUESO);
    gT.curve3D([[4, 2, 6.5], [5.5, 3.8, 7.5]], 0.9, 0.4, HUESO);
    gT.box(-2, 3, 8, 2, 7, 8, ORO, 'metal'); // Candado
    gT.box(-1, 8, 8, 1, 9, 8, ORO, 'metal');
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x241410);
    gC.ditherRecolor(-6, 9, -6, 6, 11, 6, 0x8c122e, 0x5c091c); // Vincha carmesí
    gC.curve3D([[-5, 10, -5], [-7, 7, -6]], 0.9, 0.5, 0x8c122e);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 14.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.curve3D([[0, 0, 0], [-1.3, -5.5, 1.0], [-0.5, -11, 2.2]], 2.4, 1.8, PIEL);
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-9.5 * V, 13 * V, 0);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.curve3D([[0, 0, 0], [1.3, -5.5, 1.0], [0.5, -11, 2.2]], 2.4, 1.8, PIEL);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(9.5 * V, 13 * V, 0);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
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
    const el = document.querySelector<HTMLElement>('.intro-mazo .intro-retrato');
    if (!el) {
      this.raiz.visible = false;
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 12) {
      this.raiz.visible = false;
      return;
    }
    const mazo = (el.dataset.mazo || 'escoba') as MazoId;
    const worldH = this.proyectar(cam, r.left + r.width / 2, r.top + r.height * 0.56, r.height, 5.4, this.raiz.position);
    this.raiz.scale.setScalar(worldH * 0.86);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    const arm = armoniaActual();
    const pulsoMeta = !quieto && arm && (arm.paso === 0 || arm.paso === 6 || arm.paso === 12) ? 1 : 0;
    this.pulsoSuave += (pulsoMeta - this.pulsoSuave) * (1 - Math.exp(-10 * Math.max(0.001, dt)));
    this.luzFrente.intensity = 1.65 + this.pulsoSuave * 0.35;

    for (const m of ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const) {
      const h = this.heroes[m];
      h.grupo.visible = m === mazo;
      if (!h.grupo.visible) continue;
      h.cuerpo.position.y = (quieto ? 0 : Math.sin(reloj * 2.4) * 0.025) + this.pulsoSuave * 0.018;
      h.cuerpo.rotation.y = quieto ? -0.18 : Math.sin(reloj * 1.2) * 0.22 - 0.1;
      h.cabeza.rotation.y = quieto ? 0.12 : Math.sin(reloj * 1.6) * 0.14;
      h.brazoDer.rotation.x = -0.25 + (quieto ? 0 : Math.sin(reloj * 2.1) * 0.12);
      h.brazoIzq.rotation.x = -0.15 + (quieto ? 0 : Math.cos(reloj * 1.9) * 0.1);
    }
  }
}
