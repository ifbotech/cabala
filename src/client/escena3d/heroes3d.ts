// Los 5 Héroes de Mazo en Voxel Art 3D con AO horneado (escoba, truco, chinchón, mentiroso, chancho).
import * as THREE from 'three';
import type { MazoId } from '../../rules/mazos';
import { VoxelGrid, construirMallaVoxel } from './voxel';

const V = 0.032;
const PIEL = 0xe8b288;
const PIEL_OSC = 0xc98b60;
const BOTA = 0x3b2116;
const ORO = 0xf5b52e;
const CUERO = 0x6b391c;
const OJOS = 0x160c1c;

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

    this.luzFrente = new THREE.PointLight(0xffe7c4, 1.55, 4.0, 1.4);
    this.luzFrente.position.set(-0.3, 0.5, 1.3);
    this.luzRim = new THREE.PointLight(0xffb44d, 1.15, 3.2, 1.6);
    this.luzRim.position.set(0.55, 0.35, -0.4);
    this.raiz.add(this.luzFrente, this.luzRim);
    this.raiz.visible = false;
    escena.add(this.raiz);
  }

  private baseCuerpo(ropa: number, ropaOsc: number, pantalon: number, cinturon = true): VoxelGrid {
    const g = new VoxelGrid();
    g.mirrorX(1, -9, -1, 3, -7, 2, BOTA);
    g.mirrorX(1, -6, -1, 3, -1, 1, pantalon);
    g.box(-4, 0, -2, 4, 8, 2, ropa);
    g.box(-4, 0, -2, 4, 1, 2, ropaOsc);
    if (cinturon) {
      g.box(-4, 2, -2, 4, 3, 2, CUERO);
      g.box(-1, 2, 3, 1, 3, 3, ORO, 'metal');
    }
    return g;
  }

  private baseCabeza(pelo: number): VoxelGrid {
    const g = new VoxelGrid();
    g.box(-3, 0, -3, 3, 6, 3, PIEL);
    g.box(-3, 1, -4, 3, 6, -2, pelo);
    g.box(-3, 6, -3, 3, 7, 2, pelo);
    g.mirrorX(3, 2, -3, 3, 6, 0, pelo);
    g.paintFront(
      -2,
      4,
      3,
      [
        'O...O',
        '..N..',
        '.MMM.',
      ],
      { O: OJOS, N: PIEL_OSC, M: 0x7d3b32 },
      1,
    );
    return g;
  }

  private crearEscoba(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x7d192e, 0x540e1d, 0x3b1822, false);
    gT.box(-3, 0, 2, 3, 5, 3, 0xc7b299); // Delantal
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x961f3f);
    gC.mirrorX(3, -1, -2, 4, 5, 0, 0x961f3f);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 8.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.box(-1, -5, -1, 1, 0, 1, 0x7d192e);
    gBI.box(-1, -7, -1, 1, -5, 1, PIEL);
    // Escoba de paja
    gBI.box(0, -13, 1, 0, 8, 1, CUERO);
    gBI.box(-2, -16, 0, 2, -12, 2, 0xe3b13b);
    gBI.box(-2, -18, 0, 2, -16, 2, 0xc48b22);
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-5 * V, 7.5 * V, 0.5 * V);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.box(-1, -5, -1, 1, 0, 1, 0x7d192e);
    gBD.box(-1, -7, -1, 1, -5, 1, PIEL);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(5 * V, 7.5 * V, 0);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearTruco(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x1f499c, 0x142e69, 0x16223b);
    // Poncho a rayas azul/carmesí/marfil
    gT.box(-5, 3, -3, 5, 8, 3, 0x1f499c);
    gT.box(-5, 5, -3, 5, 5, 3, 0xd62845);
    gT.box(-5, 4, -3, 5, 4, 3, 0xf2ebe1);
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x241612);
    // Bigote gaucho
    gC.box(-3, 2, 4, -1, 2, 4, 0x1a0f0c).box(1, 2, 4, 3, 2, 4, 0x1a0f0c);
    // Sombrero gaucho con cinta roja
    gC.box(-6, 7, -6, 6, 7, 6, 0x1d1726);
    gC.box(-4, 8, -4, 4, 8, 4, 0xd62845);
    gC.box(-4, 9, -4, 4, 11, 4, 0x1d1726);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 8.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.box(-1, -5, -1, 1, 0, 1, 0x1f499c);
    gBI.box(-1, -7, -1, 1, -5, 1, PIEL);
    // Espada de acero
    gBI.box(-2, -6, 1, 2, -5, 2, ORO, 'metal');
    gBI.box(0, -4, 1, 0, 9, 2, 0x9ed8f5, 'metal');
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-5.5 * V, 7.5 * V, 0.5 * V);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.box(-1, -5, -1, 1, 0, 1, 0x1f499c);
    gBD.box(-1, -7, -1, 1, -5, 1, PIEL);
    // Basto verde nudoso
    gBD.box(-1, -6, 1, 1, 8, 2, 0x248c38);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(5.5 * V, 7.5 * V, 0.5 * V);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearChinchon(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x1b7a2f, 0x114f1e, 0x3b2416);
    gT.box(-1, 3, 2, 1, 8, 2, 0xf2ebe1);
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x472816);
    // Anteojos y boina verde a rayas
    gC.box(-3, 4, 4, -1, 5, 4, 0x1a1423).box(1, 4, 4, 3, 5, 4, 0x1a1423);
    gC.set(-2, 4, 4, 0xb8f0ff, 'emissive').set(2, 4, 4, 0xb8f0ff, 'emissive');
    gC.box(-4, 7, -4, 4, 9, 4, 0x1b7a2f);
    gC.box(-4, 8, -4, 4, 8, 4, 0x67d675);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 8.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.box(-1, -5, -1, 1, 0, 1, 0x1b7a2f);
    gBI.box(-1, -7, -1, 1, -5, 1, PIEL);
    gBI.ellipsoid(0, -6, 3, 1.8, 1.8, 0.8, 0x2fd65a); // Ficha verde
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-5 * V, 7.5 * V, 0.5 * V);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.box(-1, -5, -1, 1, 0, 1, 0x1b7a2f);
    gBD.box(-1, -7, -1, 1, -5, 1, PIEL);
    gBD.box(-1, -6, 2, 2, -1, 3, 0xf4ede0); // Cartas
    gBD.set(0, -3, 3, 0xd62845);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(5 * V, 7.5 * V, 0.5 * V);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearMentiroso(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x6e1f9c, 0x451166, 0x261238);
    gT.box(-5, 0, -3, 5, 8, -2, 0x451166); // Capa púrpura
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x1f142b);
    // Antifaz de carnaval púrpura con plumas carmesí
    gC.box(-3, 4, 4, 3, 5, 4, 0x8f28c9);
    gC.set(-2, 4, 4, 0xffe44d, 'emissive').set(2, 4, 4, 0xffe44d, 'emissive');
    gC.set(-2, 7, 3, 0xcf2440).set(0, 8, 3, 0xcf2440).set(2, 7, 3, 0xcf2440);
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 8.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.box(-1, -5, -1, 1, 0, 1, 0x6e1f9c);
    gBI.box(-1, -7, -1, 1, -5, 1, PIEL);
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-5 * V, 7.5 * V, 0);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.box(-1, -5, -1, 1, 0, 1, 0x6e1f9c);
    gBD.box(-1, -7, -1, 1, -5, 1, PIEL);
    gBD.box(-1, -6, 2, 2, -1, 3, 0xf4ede0); // Carta trucada
    gBD.set(0, -3, 3, 0x160c1c);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(5 * V, 7.5 * V, 0.5 * V);

    cuerpo.add(cabeza, brazoIzq, brazoDer);
    grupo.add(cuerpo);
    return { grupo, cuerpo, cabeza, brazoDer, brazoIzq };
  }

  private crearChancho(): HeroeArticulado {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Group();
    const gT = this.baseCuerpo(0x28324a, 0x1a2030, 0x2b1d17);
    // Escudo de chancho con candado dorado en el pecho/frente
    gT.box(-4, 1, 3, 4, 7, 4, 0xa84c24);
    gT.set(-3, 8, 3, 0xa84c24).set(3, 8, 3, 0xa84c24); // Orejas del escudo
    gT.box(-1, 2, 5, 1, 4, 5, ORO, 'metal'); // Candado
    gT.set(0, 5, 5, ORO, 'metal');
    cuerpo.add(construirMallaVoxel(gT, V, [0, 0, 0]));

    const cabeza = new THREE.Group();
    const gC = this.baseCabeza(0x2e1a14);
    gC.box(-4, 5, -3, 4, 6, 4, 0xcf2440); // Vincha roja
    cabeza.add(construirMallaVoxel(gC, V, [0, 0, 0]));
    cabeza.position.set(0, 8.5 * V, 0);

    const brazoIzq = new THREE.Group();
    const gBI = new VoxelGrid();
    gBI.box(-1, -6, -1, 1, 0, 1, PIEL);
    brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));
    brazoIzq.position.set(-5.2 * V, 7.5 * V, 0);

    const brazoDer = new THREE.Group();
    const gBD = new VoxelGrid();
    gBD.box(-1, -6, -1, 1, 0, 1, PIEL);
    brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));
    brazoDer.position.set(5.2 * V, 7.5 * V, 0);

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

  sincronizar(cam: THREE.PerspectiveCamera, quieto: boolean, reloj: number): void {
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
    const worldH = this.proyectar(cam, r.left + r.width / 2, r.top + r.height * 0.62, r.height, 5.4, this.raiz.position);
    this.raiz.scale.setScalar(worldH * 1.12);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    for (const m of ['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'] as const) {
      const h = this.heroes[m];
      h.grupo.visible = m === mazo;
      if (!h.grupo.visible) continue;
      h.cuerpo.position.y = quieto ? 0 : Math.sin(reloj * 2.4) * 0.025;
      h.cuerpo.rotation.y = quieto ? -0.18 : Math.sin(reloj * 1.2) * 0.22 - 0.1;
      h.cabeza.rotation.y = quieto ? 0.12 : Math.sin(reloj * 1.6) * 0.14;
      h.brazoDer.rotation.x = -0.25 + (quieto ? 0 : Math.sin(reloj * 2.1) * 0.12);
      h.brazoIzq.rotation.x = -0.15 + (quieto ? 0 : Math.cos(reloj * 1.9) * 0.1);
    }
  }
}
