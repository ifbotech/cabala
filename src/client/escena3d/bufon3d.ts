// El Bufón en Voxel Art 3D con AO horneado, gorro de 3 puntas, cetro Marotte y abanico de naipes.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { VoxelGrid, construirMallaVoxel, type VoxelMat } from './voxel';

const COLOR_REY: Record<Palo, number> = {
  S: 0x00e5ff,
  C: 0x22f06a,
  D: 0xffe042,
  H: 0xff1e5c,
};

const CELESTE = 0x4cc2eb;
const CELESTE_OSC = 0x2994bf;
const MARFIL = 0xf4ede0;
const MARFIL_OSC = 0xd9ccb8;
const ORO = 0xf5b52e;
const ORO_OSC = 0xd48814;
const CARMESI = 0xcf2440;
const CARMESI_OSC = 0x8f1428;
const CUERO = 0x6b391c;
const SOMBRA = 0x180f24;

const V = 0.032;

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

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();

  constructor(escena: THREE.Scene) {
    // ── Torso arlequín celeste/marfil/oro + piernas asimétricas + gola + naipes en la faja ──
    const gTorso = new VoxelGrid();
    // Botas curvas de bufón + piernas bicolores
    gTorso.box(-4, -13, -1, -2, -11, 3, ORO, 'metal');
    gTorso.set(-3, -10, 4, ORO, 'metal').set(-3, -11, 4, ORO, 'metal');
    gTorso.box(-4, -10, -1, -2, -5, 1, CELESTE);
    gTorso.box(-4, -8, -1, -2, -7, 1, MARFIL);

    gTorso.box(2, -13, -1, 4, -11, 3, CELESTE_OSC);
    gTorso.set(3, -10, 4, ORO, 'metal').set(3, -11, 4, ORO, 'metal');
    gTorso.box(2, -10, -1, 4, -5, 1, ORO);
    gTorso.box(2, -8, -1, 4, -7, 1, ORO_OSC);

    // Jubón arlequín
    gTorso.box(-4, -4, -2, 0, 5, 2, CELESTE);
    gTorso.box(1, -4, -2, 4, 5, 2, MARFIL);
    // Rombos en el pecho
    gTorso.set(-2, 2, 2, MARFIL).set(-1, 1, 2, MARFIL).set(-3, 1, 2, MARFIL).set(-2, 0, 2, MARFIL);
    gTorso.set(2, 2, 2, CELESTE).set(1, 1, 2, CELESTE).set(3, 1, 2, CELESTE).set(2, 0, 2, CELESTE);
    gTorso.set(2, -2, 2, ORO, 'metal');

    // Cinturón de cuero y hebilla de oro
    gTorso.box(-4, -1, -2, 4, 0, 2, CUERO);
    gTorso.box(-1, -1, 3, 1, 0, 3, ORO, 'metal');

    // Cartas españolas metidas en la cintura
    gTorso.box(-5, -3, 1, -4, 0, 2, MARFIL);
    gTorso.set(-4, -1, 2, CARMESI);
    gTorso.box(4, -3, 1, 5, 0, 2, MARFIL);
    gTorso.set(4, -1, 2, CELESTE_OSC);

    // Gola de picos de arlequín alrededor del cuello
    gTorso.box(-6, 5, -3, 0, 6, 3, CELESTE);
    gTorso.box(1, 5, -3, 6, 6, 3, ORO);
    for (const [gx, gz] of [
      [-6, 2],
      [-3, 3],
      [0, 3],
      [3, 3],
      [6, 2],
      [-5, -3],
      [5, -3],
    ] as const) {
      gTorso.set(gx, 4, gz, ORO, 'metal');
    }

    const torsoMesh = construirMallaVoxel(gTorso, V, [0, 3, 0]);
    this.cuerpo.add(torsoMesh);

    // ── Cabeza / Máscara de Arlequín ──
    this.cabeza.position.set(0, 5.5 * V, 0);
    const gCab = new VoxelGrid();
    // Base marfil redondeada
    gCab.box(-4, 0, -3, 4, 8, 3, MARFIL);
    gCab.box(-3, 0, 4, 3, 7, 4, MARFIL);
    // Capucha trasera/superior bipartida celeste y oro
    gCab.box(-5, 2, -4, 0, 9, 0, CELESTE);
    gCab.box(1, 2, -4, 5, 9, 0, ORO);
    gCab.box(-5, 7, -3, 0, 9, 3, CELESTE);
    gCab.box(1, 7, -3, 5, 9, 3, ORO);

    // Rostro teatral (cejas, cuencas hondas, nariz y sonrisa carmesí)
    const palCab: Record<string, number> = {
      S: SOMBRA,
      R: CARMESI,
      D: CARMESI_OSC,
      N: MARFIL_OSC,
    };
    gCab.paintFront(
      -3,
      6,
      4,
      [
        'SS...SS',
        'SS...SS',
        '...N...',
        'R..N..R',
        '.RRRRR.',
        '..DDD..',
      ],
      palCab,
      1,
      'matte',
    );
    gCab.set(0, 3, 5, MARFIL_OSC);
    const cabMesh = construirMallaVoxel(gCab, V, [0, 0, 0]);
    this.cabeza.add(cabMesh);

    // Ojos luminosos móviles + pupilas (z = 5.06*V delante del bloque z=4..5)
    const matIris = new THREE.MeshBasicMaterial({ color: 0xffe875 });
    const matPupila = new THREE.MeshBasicMaterial({ color: 0x0b0514 });
    const geoOjo = new THREE.PlaneGeometry(1.7 * V, 1.0 * V);
    const geoPupila = new THREE.PlaneGeometry(0.65 * V, 0.9 * V);

    this.ojoIzq = new THREE.Mesh(geoOjo, matIris);
    this.ojoIzq.position.set(-1.9 * V, 5.1 * V, 5.06 * V);
    this.pupilaIzq = new THREE.Mesh(geoPupila, matPupila);
    this.pupilaIzq.position.set(0, 0, 0.004);
    this.ojoIzq.add(this.pupilaIzq);

    this.ojoDer = new THREE.Mesh(geoOjo, matIris);
    this.ojoDer.position.set(1.9 * V, 5.1 * V, 5.06 * V);
    this.pupilaDer = new THREE.Mesh(geoPupila, matPupila);
    this.pupilaDer.position.set(0, 0, 0.004);
    this.ojoDer.add(this.pupilaDer);
    this.cabeza.add(this.ojoIzq, this.ojoDer);

    // 3 Cuernos curvos de gorro con cascabeles de oro
    const gCuernoI = new VoxelGrid();
    gCuernoI.line3D(0, 0, 0, -4, 4, 1, 1.5, CELESTE);
    gCuernoI.line3D(-4, 4, 1, -7, 2, 2, 1.0, CELESTE_OSC);
    gCuernoI.ellipsoid(-7, 1, 2, 1.1, 1.1, 1.1, ORO, 'metal');
    this.cuernoIzq.add(construirMallaVoxel(gCuernoI, V, [0, 0, 0]));
    this.cuernoIzq.position.set(-3 * V, 8.2 * V, 0);

    const gCuernoC = new VoxelGrid();
    gCuernoC.line3D(0, 0, 0, 0, 5, 1, 1.4, CELESTE);
    gCuernoC.box(1, 0, 0, 1, 5, 2, ORO);
    gCuernoC.line3D(0, 5, 1, 0, 7, -1, 1.0, ORO);
    gCuernoC.ellipsoid(0, 8, -1, 1.0, 1.0, 1.0, ORO_OSC, 'metal');
    this.cuernoCentro.add(construirMallaVoxel(gCuernoC, V, [0, 0, 0]));
    this.cuernoCentro.position.set(0, 8.8 * V, -0.5 * V);

    const gCuernoD = new VoxelGrid();
    gCuernoD.line3D(0, 0, 0, 4, 4, 1, 1.5, MARFIL);
    gCuernoD.line3D(4, 4, 1, 7, 2, 2, 1.0, ORO);
    gCuernoD.ellipsoid(7, 1, 2, 1.1, 1.1, 1.1, ORO, 'metal');
    this.cuernoDer.add(construirMallaVoxel(gCuernoD, V, [0, 0, 0]));
    this.cuernoDer.position.set(3 * V, 8.2 * V, 0);

    this.cabeza.add(this.cuernoIzq, this.cuernoCentro, this.cuernoDer);
    this.cuerpo.add(this.cabeza);

    // ── Brazo izquierdo (-X) con Cetro Marotte ──
    this.brazoIzq.position.set(-5.2 * V, 4.2 * V, 0.5 * V);
    const gBI = new VoxelGrid();
    gBI.box(-1, -5, -1, 1, 0, 1, CELESTE);
    gBI.box(-1, -6, 0, 1, -5, 2, ORO, 'metal');
    gBI.box(-1, -8, 1, 1, -6, 3, MARFIL);
    this.brazoIzq.add(construirMallaVoxel(gBI, V, [0, 0, 0]));

    const gCetro = new VoxelGrid();
    gCetro.box(0, -4, 0, 0, 8, 0, CARMESI);
    gCetro.set(0, -4, 0, ORO, 'metal').set(0, 8, 0, ORO, 'metal');
    // Mini cabeza de Bufón en la punta del cetro
    gCetro.box(-2, 9, -1, 2, 12, 1, MARFIL);
    gCetro.set(-1, 11, 1, SOMBRA).set(1, 11, 1, SOMBRA);
    gCetro.box(-1, 10, 1, 1, 10, 1, CARMESI);
    gCetro.box(-3, 13, 0, -1, 14, 0, CELESTE);
    gCetro.box(1, 13, 0, 3, 14, 0, ORO);
    gCetro.set(-3, 12, 0, ORO, 'metal').set(3, 12, 0, ORO, 'metal');
    this.cetro.add(construirMallaVoxel(gCetro, V, [0, 0, 0]));
    this.cetro.position.set(-0.5 * V, -7 * V, 2.5 * V);
    this.cetro.rotation.set(0.18, 0, 0.25);
    this.brazoIzq.add(this.cetro);

    // ── Brazo derecho (+X) con Abanico de 3 Naipes Españoles ──
    this.brazoDer.position.set(5.2 * V, 4.2 * V, 0.5 * V);
    const gBD = new VoxelGrid();
    gBD.box(-1, -5, -1, 1, 0, 1, MARFIL_OSC);
    gBD.box(-1, -6, 0, 1, -5, 2, ORO, 'metal');
    gBD.box(-1, -8, 1, 1, -6, 3, MARFIL);
    this.brazoDer.add(construirMallaVoxel(gBD, V, [0, 0, 0]));

    const gAbanico = new VoxelGrid();
    const palCartas: Record<string, number> = { M: MARFIL, R: CARMESI, O: ORO, S: 0x1d88d9, C: 0x1e9c40 };
    const carta = [
      'MMMMM',
      'MRMRM',
      'MMOMM',
      'MRMRM',
      'MMMMM',
      'MMMMM',
    ];
    gAbanico.extrude2D(carta, palCartas, 1, -2, 0, 0, 'matte');
    gAbanico.extrude2D(
      ['MMMMM', 'MMSMM', 'MMSMM', 'MMOMM', 'MMMMM', 'MMMMM'],
      palCartas,
      1,
      1,
      2,
      1,
      'matte',
    );
    gAbanico.extrude2D(
      ['MMMMM', 'MMOMM', 'MOOOM', 'MMOMM', 'MMMMM', 'MMMMM'],
      palCartas,
      1,
      4,
      1,
      2,
      'matte',
    );
    this.abanico.add(construirMallaVoxel(gAbanico, V * 0.78, [0, 0, 0]));
    this.abanico.position.set(0.5 * V, -7.2 * V, 3.2 * V);
    this.abanico.rotation.set(-0.25, -0.2, -0.18);
    this.brazoDer.add(this.abanico);

    this.cuerpo.add(this.brazoIzq, this.brazoDer);

    // Iluminación dedicada para que siempre destaque con volumen y color vivo
    this.luzFrente = new THREE.PointLight(0xffeacc, 1.45, 3.6, 1.5);
    this.luzFrente.position.set(-0.35, 0.45, 1.25);
    this.luzMascara = new THREE.PointLight(0xffbe5c, 1.15, 2.8, 1.8);
    this.luzMascara.position.set(0.42, 0.15, 0.85);
    this.raiz.add(this.cuerpo, this.luzFrente, this.luzMascara);
    this.raiz.visible = false;
    escena.add(this.raiz);
  }

  private anfitrionVisible(): HTMLElement | null {
    const candidatos = [
      ...Array.from(document.querySelectorAll<HTMLElement>('#capa .velo .bufon')),
      ...Array.from(document.querySelectorAll<HTMLElement>('#app .bufon')),
    ];
    for (const el of candidatos) {
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
    const esMovilPortada = !enMesa && window.innerWidth <= 700 && !!el.closest('.portada');
    const factorY = enMesa ? 0.58 : esMovilPortada ? 0.45 : 0.5;
    const factorEscala = enMesa ? 0.88 : esMovilPortada ? 0.96 : 1.06;

    const tam = this.proyectarRect(cam, r.left + r.width / 2, r.top + r.height * factorY, r.width, r.height, 5.85, this.raiz.position);
    this.raiz.scale.setScalar(tam.worldH * factorEscala);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    const eEl = document.querySelector<HTMLElement>('.mesa .e-carta[data-jefe="1"]');
    const paloRey = eEl ? ((eEl.dataset.palo || 'S') as Palo) : null;
    const segundaRey = eEl?.dataset.segunda === '1';

    const enModal = !!el.closest('#capa .velo');
    if (paloRey) {
      this.luzMascara.color.setHex(COLOR_REY[paloRey]);
      this.luzMascara.intensity = segundaRey ? 1.4 : 1.15;
    } else {
      this.luzMascara.color.setHex(0xffbe5c);
      this.luzMascara.intensity = enModal ? 1.35 : 1.15;
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
      const pxQ = THREE.MathUtils.clamp(relX * 0.45 * V, -0.45 * V, 0.45 * V);
      const pyQ = THREE.MathUtils.clamp(-relY * 0.25 * V, -0.25 * V, 0.25 * V);
      this.pupilaIzq.position.set(pxQ, pyQ, 0.004);
      this.pupilaDer.position.set(pxQ, pyQ, 0.004);
      this.brazoIzq.rotation.set(0.08, 0, 0.1);
      this.brazoDer.rotation.set(0.06, 0, -0.1);
      this.cetro.rotation.set(0.18, 0, 0.25);
      return;
    }

    const k = 1 - Math.exp(-8 * dt);
    this.miraX += (relX - this.miraX) * k;
    this.miraY += (relY - this.miraY) * k;
    const metaInclina = habla || expr === 'brillo' || expr === 'sombria' ? 0.12 : 0;
    this.inclina += (metaInclina - this.inclina) * k;

    const risaOsc = expr === 'risa' || expr === 'burla' || festeja ? Math.sin(reloj * 14) * 0.09 : 0;
    const penaOsc = lamenta ? Math.sin(reloj * 18) * 0.05 : 0;
    const respY = Math.sin(reloj * 2.1) * 0.022;

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
    this.cetro.rotation.set(0.18 + hablaCetro * 0.45, 0, 0.25 + hablaCetro);

    const px = THREE.MathUtils.clamp(this.miraX * 0.45 * V, -0.45 * V, 0.45 * V);
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
