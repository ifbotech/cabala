// El Bufón en Dark-Gothic Pixel-3D de alta densidad (V = 0.018), máscara de tarot y cuernos orgánicos.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { armoniaActual } from '../musica';
import { VoxelGrid, construirMallaVoxel } from './voxel';

const COLOR_REY: Record<Palo, number> = {
  S: 0x00e5ff,
  C: 0x22f06a,
  D: 0xffe042,
  H: 0xff1e5c,
};

const CARMESI = 0x7a0e28;
const CARMESI_OSC = 0x470620;
const PURPURA = 0x3e1366;
const PURPURA_OSC = 0x22093b;
const MARFIL = 0xcfc2aa;
const MARFIL_SOMBRA = 0x7a6275;
const HUESO = 0xd9ceb4;
const ORO = 0xc98c1e;
const ORO_OSC = 0x78430b;
const CAPA = 0x120a24;
const CUERO = 0x3b1b14;
const ABISMO = 0x0b0711;

const V = 0.018;

export class Bufon3D {
  readonly raiz = new THREE.Group();
  private readonly cuerpo = new THREE.Group();
  private readonly cabeza = new THREE.Group();
  private readonly cuernoIzq = new THREE.Group();
  private readonly cuernoCentro = new THREE.Group();
  private readonly cuernoDer = new THREE.Group();
  private readonly ojoIzq: THREE.Mesh;
  private readonly ojoDer: THREE.Mesh;
  private readonly pupilaIzq: THREE.Mesh;
  private readonly pupilaDer: THREE.Mesh;
  private readonly brazoIzq = new THREE.Group();
  private readonly brazoDer = new THREE.Group();
  private readonly cetro = new THREE.Group();
  private readonly abanico = new THREE.Group();
  private readonly luzMascara: THREE.PointLight;
  private readonly luzFrente: THREE.PointLight;

  private miraX = 0;
  private miraY = 0;
  private inclina = 0;
  private parpadeoHasta = 0;
  private proxParpadeo = 2.6;
  private pulsoSuave = 0;

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();

  constructor(escena: THREE.Scene) {
    // ── Torso arlequín entallado, piernas estilizadas, gola dentada y capa abismal ──
    const gTorso = new VoxelGrid();

    // Piernas estilizadas y botas esculpidas con puntas curvas y cascabeles de oro
    gTorso.taperedCylinder(-4, -20, -6, 0, 2.2, 2.2, 2.8, 2.6, PURPURA_OSC);
    gTorso.taperedCylinder(4, -20, -6, 0, 2.2, 2.2, 2.8, 2.6, CARMESI_OSC);
    gTorso.ellipsoid(-4, -22, 1, 2.3, 1.8, 3.2, CUERO);
    gTorso.ellipsoid(4, -22, 1, 2.3, 1.8, 3.2, CUERO);
    gTorso.curve3D([[-4, -22, 4], [-4, -21, 7], [-4, -19, 8]], 1.2, 0.7, ORO, 'metal');
    gTorso.curve3D([[4, -22, 4], [4, -21, 7], [4, -19, 8]], 1.2, 0.7, ORO, 'metal');

    // Jubón anatómico en reloj de arena con bipartido dithered sin aristas cuadradas
    gTorso.sculptTorso(-7, 0, 10, 8.2, 4.6, 5.4, 3.6, 8.8, 4.8, PURPURA);
    gTorso.ditherRecolor(1, -7, -6, 10, 10, 6, CARMESI, CARMESI_OSC);
    gTorso.ditherRecolor(-10, -7, -6, 0, 10, 6, PURPURA, PURPURA_OSC);

    // Rombos de tarot en el pecho
    for (const [rx, ry, col] of [
      [-4, 5, CARMESI],
      [4, 5, PURPURA],
      [-4, 0, ORO],
      [4, 0, ORO],
    ] as const) {
      gTorso.set(rx, ry + 1, 5, col).set(rx - 1, ry, 5, col).set(rx + 1, ry, 5, col).set(rx, ry - 1, 5, col);
    }

    // Cinturón de cuero y hebilla de oro antiguo
    gTorso.taperedCylinder(0, -2, 0, 0, 6.2, 4.1, 6.2, 4.1, CUERO);
    gTorso.ellipsoid(0, -1, 4.3, 2.0, 1.2, 0.9, ORO, 'metal');

    // Naipes envejecidos metidos en la faja
    gTorso.box(-8, -4, 2, -6, 2, 3, HUESO);
    gTorso.set(-7, 0, 3, CARMESI);
    gTorso.box(6, -4, 2, 8, 2, 3, HUESO);
    gTorso.set(7, 0, 3, PURPURA);

    // Capa abismal con pliegues detrás
    gTorso.sculptCape(-19, 10, -4.4, 11.5, 7.6, 1.5, 5, CAPA, PURPURA_OSC);

    // Hombros arlequín abullonados y gola dentada oscura con cascabeles redondeados
    gTorso.ellipsoid(-8.2, 8.5, 0, 2.8, 2.6, 2.8, PURPURA);
    gTorso.ellipsoid(8.2, 8.5, 0, 2.8, 2.6, 2.8, CARMESI);
    gTorso.taperedCylinder(0, 9, 12, 0, 10.6, 6.2, 6.2, 4.2, CARMESI_OSC);
    gTorso.ditherRecolor(-12, 8, -7, 0, 12, 7, PURPURA_OSC, CAPA);
    for (let i = -9; i <= 9; i += 3) {
      gTorso.ellipsoid(i, 8, 5, 0.9, 0.9, 0.9, ORO, 'metal');
      gTorso.ellipsoid(i, 8, -5, 0.9, 0.9, 0.9, ORO_OSC, 'metal');
    }
    // Solapas arlequín curvas en la gola con cascabeles en las puntas
    gTorso.curve3D([[-7, 10, 3], [-10, 7.5, 4.5]], 1.4, 0.8, PURPURA);
    gTorso.curve3D([[7, 10, 3], [10, 7.5, 4.5]], 1.4, 0.8, CARMESI);
    gTorso.ellipsoid(-10, 7, 4.5, 0.95, 0.95, 0.95, ORO, 'metal');
    gTorso.ellipsoid(10, 7, 4.5, 0.95, 0.95, 0.95, ORO, 'metal');

    this.cuerpo.add(construirMallaVoxel(gTorso, V, [0, 6, 0]));

    // ── Cabeza / Máscara Veneciana esculpida con capucha redondeada ──
    this.cabeza.position.set(0, 7.5 * V, 0);
    const gCab = new VoxelGrid();
    gCab.sculptDome(0, 6, -0.8, 6.6, 8.6, 6.2, PURPURA);
    gCab.ditherRecolor(-8, 4, -8, 0, 16, 2, PURPURA, PURPURA_OSC);
    gCab.ditherRecolor(1, 4, -8, 8, 16, 2, CARMESI, CARMESI_OSC);
    gCab.sculptHead(0, 7, 0.3, 5.6, 7.0, 5.2, MARFIL, MARFIL_SOMBRA);

    // Diadema curva de oro antiguo sobre la frente
    gCab.curve3D([[-5, 12, 3.5], [0, 12.8, 5.2], [5, 12, 3.5]], 1.0, 1.0, ORO, 'metal');

    // Cuencas oculares talladas y oscuras + nariz afilada + lágrima + sonrisa ladina
    for (const sx of [-1, 1] as const) {
      gCab.box(sx * 2, 8, 5, sx * 3, 9, 6, ABISMO);
      gCab.set(sx * 2, 8, 4, ABISMO).set(sx * 3, 8, 4, ABISMO);
      gCab.set(sx * 2, 9, 4, ABISMO).set(sx * 3, 9, 4, ABISMO);
    }
    // Nariz afilada
    gCab.box(0, 5, 5, 0, 7, 6, MARFIL_SOMBRA);
    gCab.set(0, 6, 6, MARFIL);
    // Lágrima de rombo bajo el ojo izquierdo
    gCab.set(-3, 6, 5, PURPURA_OSC).set(-3, 5, 5, ABISMO);
    // Sonrisa carmesí de títere
    gCab.paintFront(
      -3,
      4,
      5,
      [
        'R.....R',
        '.RRRRR.',
        '..DDD..',
      ],
      { R: CARMESI, D: CARMESI_OSC },
      1,
    );

    this.cabeza.add(construirMallaVoxel(gCab, V, [0, 0, 0]));

    // Ojos luminosos ámbar con pupilas verticales móviles
    const matIris = new THREE.MeshBasicMaterial({ color: 0xffcf4a });
    const matPupila = new THREE.MeshBasicMaterial({ color: 0x0b0711 });
    const geoOjo = new THREE.PlaneGeometry(2.1 * V, 1.3 * V);
    const geoPupila = new THREE.PlaneGeometry(0.75 * V, 1.2 * V);

    this.ojoIzq = new THREE.Mesh(geoOjo, matIris);
    this.ojoIzq.rotation.z = -0.16;
    this.ojoIzq.position.set(-2.5 * V, 8.6 * V, 6.28 * V);
    this.pupilaIzq = new THREE.Mesh(geoPupila, matPupila);
    this.pupilaIzq.position.set(0, 0, 0.004);
    this.ojoIzq.add(this.pupilaIzq);

    this.ojoDer = new THREE.Mesh(geoOjo, matIris);
    this.ojoDer.rotation.z = 0.16;
    this.ojoDer.position.set(2.5 * V, 8.6 * V, 6.28 * V);
    this.pupilaDer = new THREE.Mesh(geoPupila, matPupila);
    this.pupilaDer.position.set(0, 0, 0.004);
    this.ojoDer.add(this.pupilaDer);
    this.cabeza.add(this.ojoIzq, this.ojoDer);

    // 3 Cuernos largos y curvos con curve3D + cascabeles de oro antiguo
    const gCuernoI = new VoxelGrid();
    gCuernoI.curve3D([[0, 0, 0], [-4, 6, 1], [-10, 7, 2], [-14, 2, 3]], 2.4, 0.9, PURPURA);
    gCuernoI.ellipsoid(-14, 0, 3, 1.5, 1.5, 1.5, ORO, 'metal');
    this.cuernoIzq.add(construirMallaVoxel(gCuernoI, V, [0, 0, 0]));
    this.cuernoIzq.position.set(-4 * V, 13.5 * V, -1 * V);

    const gCuernoC = new VoxelGrid();
    gCuernoC.curve3D([[0, 0, 0], [0, 7, 0], [1, 12, -4], [2, 9, -8]], 2.2, 0.9, CARMESI);
    gCuernoC.ellipsoid(2, 7, -8, 1.4, 1.4, 1.4, ORO_OSC, 'metal');
    this.cuernoCentro.add(construirMallaVoxel(gCuernoC, V, [0, 0, 0]));
    this.cuernoCentro.position.set(0, 14 * V, -1 * V);

    const gCuernoD = new VoxelGrid();
    gCuernoD.curve3D([[0, 0, 0], [4, 7, 1], [10, 8, 2], [14, 3, 3]], 2.4, 0.9, CARMESI);
    gCuernoD.ellipsoid(14, 1, 3, 1.5, 1.5, 1.5, ORO, 'metal');
    this.cuernoDer.add(construirMallaVoxel(gCuernoD, V, [0, 0, 0]));
    this.cuernoDer.position.set(4 * V, 13.5 * V, -1 * V);

    this.cabeza.add(this.cuernoIzq, this.cuernoCentro, this.cuernoDer);
    this.cuerpo.add(this.cabeza);

    // ── Brazo izquierdo (-X) curvo con Cetro Marotte gótico ──
    this.brazoIzq.position.set(-9.5 * V, 6.2 * V, 0.5 * V);
    const gBI = new VoxelGrid();
    gBI.curve3D([[0, 0, 0], [-1.5, -5.5, 1], [-1, -11, 3.5]], 2.3, 1.6, PURPURA);
    gBI.ellipsoid(-1, -10.5, 3.5, 2.0, 1.2, 1.8, ORO, 'metal');
    gBI.ellipsoid(-1, -12.5, 3.5, 1.5, 1.5, 1.5, MARFIL);
    this.brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));

    const gCetro = new VoxelGrid();
    gCetro.cylinderY(0, -8, 15, 0, 0.9, 0.9, CARMESI_OSC);
    gCetro.taperedCylinder(0, -8, -7, 0, 1.3, 1.3, 1.1, 1.1, ORO, 'metal');
    gCetro.taperedCylinder(0, 14, 15, 0, 1.4, 1.4, 1.2, 1.2, ORO, 'metal');
    gCetro.sculptHead(0, 18, 0, 2.8, 3.2, 2.4, MARFIL, MARFIL_SOMBRA);
    gCetro.set(-1, 19, 3, ABISMO).set(1, 19, 3, ABISMO);
    gCetro.box(-1, 17, 3, 1, 17, 3, CARMESI);
    gCetro.curve3D([[-1, 21, 0], [-4, 23, 0]], 1.0, 0.6, PURPURA);
    gCetro.curve3D([[1, 21, 0], [4, 23, 0]], 1.0, 0.6, CARMESI);
    gCetro.set(-4, 23, 0, ORO, 'metal').set(4, 23, 0, ORO, 'metal');
    this.cetro.add(construirMallaVoxel(gCetro, V, [0, 0, 0]));
    this.cetro.position.set(-1 * V, -13 * V, 3.5 * V);
    this.cetro.rotation.set(0.2, 0, 0.25);
    this.brazoIzq.add(this.cetro);

    // ── Brazo derecho (+X) curvo con Abanico de 3 Naipes envejecidos ──
    this.brazoDer.position.set(9.5 * V, 6.2 * V, 0.5 * V);
    const gBD = new VoxelGrid();
    gBD.curve3D([[0, 0, 0], [1.5, -5.5, 1], [1, -11, 3.5]], 2.3, 1.6, CARMESI);
    gBD.ellipsoid(1, -10.5, 3.5, 2.0, 1.2, 1.8, ORO, 'metal');
    gBD.ellipsoid(1, -12.5, 3.5, 1.5, 1.5, 1.5, MARFIL);
    this.brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));

    const gAbanico = new VoxelGrid();
    const palCartas: Record<string, number> = { M: HUESO, R: CARMESI, O: ORO, S: 0x1440b8 };
    gAbanico.extrude2D(['MMMMMM', 'MRMMRM', 'MMOOMM', 'MRMMRM', 'MMMMMM', 'MMMMMM', 'MMMMMM'], palCartas, 1, -3, 0, 0);
    gAbanico.extrude2D(['MMMMMM', 'MMSSMM', 'MMSSMM', 'MMOOMM', 'MMMMMM', 'MMMMMM', 'MMMMMM'], palCartas, 1, 1, 2, 1);
    gAbanico.extrude2D(['MMMMMM', 'MMOOMM', 'MOOOOM', 'MMOOMM', 'MMMMMM', 'MMMMMM', 'MMMMMM'], palCartas, 1, 5, 1, 2);
    this.abanico.add(construirMallaVoxel(gAbanico, V * 0.9, [0, 0, 0]));
    this.abanico.position.set(1 * V, -13 * V, 4 * V);
    this.abanico.rotation.set(-0.22, -0.22, -0.18);
    this.brazoDer.add(this.abanico);

    this.cuerpo.add(this.brazoIzq, this.brazoDer);

    // Iluminación nocturna de claroscuro (fiel al tono oscuro del juego)
    this.luzFrente = new THREE.PointLight(0xffc880, 1.75, 4.2, 1.45);
    this.luzFrente.position.set(-0.35, 0.45, 1.25);
    this.luzMascara = new THREE.PointLight(0x9e58ff, 1.25, 3.1, 1.7);
    this.luzMascara.position.set(0.45, 0.15, 0.85);
    this.raiz.add(this.cuerpo, this.luzFrente, this.luzMascara);
    this.raiz.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });
    this.raiz.visible = false;
    escena.add(this.raiz);
  }

  private anfitrionVisible(): HTMLElement | null {
    const hayVelo = !!document.querySelector('#capa .velo');
    const candidatos = hayVelo
      ? Array.from(document.querySelectorAll<HTMLElement>('#capa .velo .bufon'))
      : Array.from(document.querySelectorAll<HTMLElement>('#app .bufon'));
    for (const el of candidatos) {
      if (el.closest('.fin-escena.corrida')) continue;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.05) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 16 && r.height > 16) return el;
    }
    return null;
  }

  private proyectarRect(
    cam: THREE.PerspectiveCamera,
    cx: number,
    cy: number,
    w: number,
    h: number,
    dist: number,
    outPos: THREE.Vector3,
  ): { worldW: number; worldH: number } {
    const W = Math.max(1, window.innerWidth);
    const H = Math.max(1, window.innerHeight);
    const ndcX = (cx / W) * 2 - 1;
    const ndcY = -(cy / H) * 2 + 1;
    const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5));
    const visW = visH * cam.aspect;

    cam.getWorldDirection(this.vFwd);
    this.vCentroPlano.copy(cam.position).addScaledVector(this.vFwd, dist);
    this.plano.setFromNormalAndCoplanarPoint(this.vFwd, this.vCentroPlano);

    this.vOrigen.set(ndcX, ndcY, -1).unproject(cam);
    this.vDir.copy(this.vOrigen).sub(cam.position).normalize();
    this.ray.set(cam.position, this.vDir);
    if (!this.ray.intersectPlane(this.plano, outPos)) outPos.copy(this.vCentroPlano);

    return {
      worldW: Math.max(0.05, (w / W) * visW),
      worldH: Math.max(0.05, (h / H) * visH),
    };
  }

  sincronizar(
    cam: THREE.PerspectiveCamera,
    dt: number,
    quieto: boolean,
    punteroX: number,
    punteroY: number,
    reloj: number,
  ): void {
    const el = this.anfitrionVisible();
    if (!el) {
      this.raiz.visible = false;
      return;
    }
    const r = el.getBoundingClientRect();
    const enMesa = !!el.closest('.mesa');
    const movil = window.innerWidth <= 700;
    const esMovilPortada = !enMesa && movil && !!el.closest('.portada');
    const esMovilFin = !enMesa && movil && !!el.closest('.fin-bufon');
    const esMovilElegir = !enMesa && movil && !!el.closest('.elegir');
    const factorY = enMesa ? 0.58 : esMovilFin ? 0.58 : esMovilElegir ? 0.6 : esMovilPortada ? 0.45 : 0.5;
    const factorEscala = enMesa ? 0.78 : esMovilFin ? 0.9 : esMovilElegir ? 0.92 : esMovilPortada ? 0.96 : 1.06;

    const tam = this.proyectarRect(cam, r.left + r.width / 2, r.top + r.height * factorY, r.width, r.height, 5.85, this.raiz.position);
    this.raiz.scale.setScalar(tam.worldH * factorEscala);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    const eEl = document.querySelector<HTMLElement>('.mesa .e-carta[data-jefe="1"]');
    const paloRey = eEl ? ((eEl.dataset.palo || 'S') as Palo) : null;
    const segundaRey = eEl?.dataset.segunda === '1';

    const arm = armoniaActual();
    const pulsoMeta = !quieto && arm && (arm.paso === 0 || arm.paso === 6 || arm.paso === 12) ? 1 : 0;
    this.pulsoSuave += (pulsoMeta - this.pulsoSuave) * (1 - Math.exp(-10 * dt));

    const enModal = !!el.closest('#capa .velo');
    this.luzFrente.intensity = enModal ? 2.65 : 2.05;
    if (paloRey) {
      this.luzMascara.color.setHex(COLOR_REY[paloRey]);
      this.luzMascara.intensity = (segundaRey ? 1.6 : 1.25) + this.pulsoSuave * 0.35;
    } else {
      this.luzMascara.color.setHex(0xffaa44);
      this.luzMascara.intensity = (enModal ? 1.85 : 1.25) + this.pulsoSuave * 0.35;
    }

    let objX = punteroX;
    let objY = punteroY;
    const foco = document.querySelector<HTMLElement>('.mesa .mano .carta.arrastrada, .mesa .mano .carta:focus-visible');
    if (foco) {
      const fr = foco.getBoundingClientRect();
      objX = ((fr.left + fr.width / 2) / Math.max(1, window.innerWidth)) * 2 - 1;
      objY = ((fr.top + fr.height / 2) / Math.max(1, window.innerHeight)) * 2 - 1;
    }

    const bufonNdcX = ((r.left + r.width / 2) / Math.max(1, window.innerWidth)) * 2 - 1;
    const bufonNdcY = ((r.top + r.height * factorY) / Math.max(1, window.innerHeight)) * 2 - 1;
    const aimX = quieto ? 0 : objX;
    const aimY = quieto ? 0.06 : objY;
    const relX = THREE.MathUtils.clamp((aimX - bufonNdcX) * 0.85, -1, 1);
    const relY = THREE.MathUtils.clamp((aimY - bufonNdcY) * 0.65, -0.85, 0.85);

    const expr = el.dataset.expresion ?? 'reposo';
    const habla = el.classList.contains('habla');
    const festeja = el.classList.contains('festeja');
    const lamenta = el.classList.contains('lamenta');

    if (quieto) {
      this.miraX = relX;
      this.miraY = relY;
      this.cabeza.rotation.set((expr === 'sombria' ? 0.14 : -0.02) + relY * 0.16, relX * 0.36, expr === 'burla' ? -0.1 : 0);
      this.cuerpo.rotation.set(0.03, relX * 0.18 + 0.08, 0);
      this.cuerpo.position.set(0, 0, 0);
      this.ojoIzq.scale.set(1, 1, 1);
      this.ojoDer.scale.set(1, 1, 1);
      const pxQ = THREE.MathUtils.clamp(relX * 0.55 * V, -0.55 * V, 0.55 * V);
      const pyQ = THREE.MathUtils.clamp(-relY * 0.25 * V, -0.25 * V, 0.25 * V);
      this.pupilaIzq.position.set(pxQ, pyQ, 0.004);
      this.pupilaDer.position.set(pxQ, pyQ, 0.004);
      this.brazoIzq.rotation.set(0.08, 0, 0.1);
      this.brazoDer.rotation.set(0.06, 0, -0.1);
      this.cetro.rotation.set(0.2, 0, 0.25);
      return;
    }

    const k = 1 - Math.exp(-8 * dt);
    this.miraX += (relX - this.miraX) * k;
    this.miraY += (relY - this.miraY) * k;
    const metaInclina = habla || expr === 'brillo' || expr === 'sombria' ? 0.12 : 0;
    this.inclina += (metaInclina - this.inclina) * k;

    const risaOsc = expr === 'risa' || expr === 'burla' || festeja ? Math.sin(reloj * 14) * 0.09 : 0;
    const penaOsc = lamenta ? Math.sin(reloj * 18) * 0.05 : 0;
    const respY = Math.sin(reloj * 2.1) * 0.022 + this.pulsoSuave * 0.018;

    this.cuerpo.position.set(0, respY + (festeja ? Math.abs(Math.sin(reloj * 10)) * 0.045 : 0), this.inclina * 0.3);
    this.cuerpo.rotation.set(this.inclina + (lamenta ? 0.14 : 0), this.miraX * 0.2 + 0.08, risaOsc * 0.35 + penaOsc);

    this.cabeza.rotation.set(
      (expr === 'sombria' ? 0.15 : 0) + this.miraY * 0.2 + risaOsc,
      this.miraX * 0.38,
      (expr === 'burla' ? -0.12 : 0) + penaOsc,
    );

    this.cuernoIzq.rotation.z = Math.sin(reloj * 2.6) * 0.05 + risaOsc * 0.35;
    this.cuernoCentro.rotation.z = Math.cos(reloj * 2.3) * 0.04;
    this.cuernoDer.rotation.z = -Math.sin(reloj * 2.6 + 0.6) * 0.05 - risaOsc * 0.35;

    const hablaCetro = habla ? Math.sin(reloj * 12) * 0.16 : Math.sin(reloj * 1.7) * 0.06;
    const gestoDer = habla || festeja ? Math.sin(reloj * 10 + 0.8) * 0.22 : Math.sin(reloj * 1.5 + 1.1) * 0.07;
    this.brazoIzq.rotation.set(-hablaCetro * 0.5, 0, 0.1 + hablaCetro * 0.3);
    this.brazoDer.rotation.set(-0.18 - Math.abs(gestoDer) * 0.4, this.miraX * 0.16, -0.1 - gestoDer * 0.3);
    this.cetro.rotation.set(0.2 + hablaCetro * 0.45, 0, 0.25 + hablaCetro);

    const px = THREE.MathUtils.clamp(this.miraX * 0.55 * V, -0.55 * V, 0.55 * V);
    const py = THREE.MathUtils.clamp(-this.miraY * 0.25 * V, -0.25 * V, 0.25 * V);
    this.pupilaIzq.position.set(px, py, 0.004);
    this.pupilaDer.position.set(px, py, 0.004);

    if (reloj >= this.proxParpadeo) {
      this.parpadeoHasta = reloj + 0.13;
      this.proxParpadeo = reloj + 2.4 + Math.random() * 2.8;
    }
    const parpadea = reloj < this.parpadeoHasta;
    this.ojoIzq.scale.set(1, parpadea ? 0.1 : 1, 1);
    this.ojoDer.scale.set(1, parpadea ? 0.1 : 1, 1);
  }
}
