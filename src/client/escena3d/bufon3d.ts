// Bufón veneciano esculpido en 3D en la penumbra + Máscaras venecianas y Coronas 3D de los 4 Reyes Jefe.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { texturaLaton, texturaMascaraBufon, texturaOroMoneda, texturaTelaBufon } from './texturas';

const COLOR_REY: Record<Palo, number> = {
  S: 0x00e5ff,
  C: 0x22f06a,
  D: 0xffe042,
  H: 0xff1e5c,
};

function normalizarUvsPlanar(geo: THREE.BufferGeometry, minX: number, maxX: number, minY: number, maxY: number): void {
  const pos = geo.getAttribute('position');
  const uv = geo.getAttribute('uv');
  if (!pos || !uv) return;
  const spanX = Math.max(0.001, maxX - minX);
  const spanY = Math.max(0.001, maxY - minY);
  for (let i = 0; i < pos.count; i++) {
    const u = THREE.MathUtils.clamp((pos.getX(i) - minX) / spanX, 0, 1);
    const v = THREE.MathUtils.clamp((pos.getY(i) - minY) / spanY, 0, 1);
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
}

function geometriaRostroBufon(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.195, 12, 10);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * 0.92;
    const y = pos.getY(i) * 1.06;
    const z = pos.getZ(i) * 0.78;
    // Mandíbula orgánica levemente afinada sin púa triangular
    if (y < -0.02) {
      const f = THREE.MathUtils.clamp((-y - 0.02) / 0.2, 0, 1);
      x *= 1 - f * 0.24;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  normalizarUvsPlanar(geo, -0.18, 0.18, -0.2, 0.2);
  return geo;
}

function geometriaDominoRey(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.045);
  s.quadraticCurveTo(-0.08, 0.015, -0.22, 0.065);
  s.quadraticCurveTo(-0.2, 0.15, -0.1, 0.155);
  s.quadraticCurveTo(0, 0.125, 0.1, 0.155);
  s.quadraticCurveTo(0.2, 0.15, 0.22, 0.065);
  s.quadraticCurveTo(0.08, 0.015, 0, -0.045);
  return new THREE.ExtrudeGeometry(s, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 1,
  });
}

export class Bufon3D {
  readonly raiz = new THREE.Group();
  private readonly cuerpo = new THREE.Group();
  private readonly cabeza = new THREE.Group();
  private readonly cuernoIzq = new THREE.Group();
  private readonly cuernoDer = new THREE.Group();
  private readonly cascabelIzq: THREE.Mesh;
  private readonly cascabelDer: THREE.Mesh;
  private readonly ojoIzq: THREE.Mesh;
  private readonly ojoDer: THREE.Mesh;
  private readonly pupilaIzq: THREE.Mesh;
  private readonly pupilaDer: THREE.Mesh;
  private readonly manoIzq = new THREE.Group();
  private readonly manoDer = new THREE.Group();
  private readonly cetro = new THREE.Group();
  private readonly luzMascara: THREE.PointLight;
  private readonly mascarasRey: Record<Palo, THREE.Group>;
  private readonly ojosReyMat: Record<Palo, THREE.MeshBasicMaterial>;

  private miraX = 0;
  private miraY = 0;
  private inclina = 0;
  private reyActual: Palo | null = null;
  private reyProgreso = 0;
  private parpadeoHasta = 0;
  private proxParpadeo = 2.6;

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();

  constructor(escena: THREE.Scene) {
    const matCarmesi = new THREE.MeshStandardMaterial({
      map: texturaTelaBufon('carmesi'),
      roughness: 0.78,
      metalness: 0.06,
    });
    const matPurpura = new THREE.MeshStandardMaterial({
      map: texturaTelaBufon('purpura'),
      roughness: 0.78,
      metalness: 0.06,
    });
    const matCapa = new THREE.MeshStandardMaterial({
      color: 0x07030e,
      roughness: 0.99,
      metalness: 0.0,
    });
    const matCapucha = new THREE.MeshStandardMaterial({
      color: 0x0b0516,
      roughness: 0.98,
      metalness: 0.0,
    });
    const matOro = new THREE.MeshStandardMaterial({
      map: texturaOroMoneda(),
      color: 0xffd500,
      metalness: 0.65,
      roughness: 0.34,
      emissive: 0x3b2600,
      emissiveIntensity: 0.25,
    });
    const matMascara = new THREE.MeshStandardMaterial({
      map: texturaMascaraBufon(),
      roughness: 0.86,
      metalness: 0.04,
      emissive: 0x261a2e,
      emissiveIntensity: 0.26,
    });

    // Torso de jubón oscuro + hombreras abullonadas bicolor + doble gorguera isabelina con cuentas doradas
    const jubon = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.27, 0.36, 8), matCapa);
    jubon.position.set(0, -0.27, -0.04);
    jubon.castShadow = true;
    this.cuerpo.add(jubon);

    const hombreraIzq = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 6), matPurpura);
    hombreraIzq.scale.set(1.1, 0.85, 0.85);
    hombreraIzq.position.set(-0.22, -0.16, -0.02);
    const hombreraDer = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 6), matCarmesi);
    hombreraDer.scale.set(1.1, 0.85, 0.85);
    hombreraDer.position.set(0.22, -0.16, -0.02);
    this.cuerpo.add(hombreraIzq, hombreraDer);

    for (let i = 0; i < 10; i++) {
      const a = ((i + 0.5) / 10) * Math.PI * 2;
      const punta = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.18, 4), i % 2 === 0 ? matCarmesi : matPurpura);
      punta.position.set(Math.sin(a) * 0.2, -0.19, Math.cos(a) * 0.12);
      punta.rotation.x = Math.PI - Math.cos(a) * 0.72;
      punta.rotation.z = Math.sin(a) * 0.72;
      this.cuerpo.add(punta);

      const cuenta = new THREE.Mesh(new THREE.OctahedronGeometry(0.024, 0), matOro);
      cuenta.position.set(Math.sin(a) * 0.27, -0.26, Math.cos(a) * 0.18);
      this.cuerpo.add(cuenta);
    }

    // Cintas asimétricas de arlequín flameando desde el cuello
    const matCintaIzq = new THREE.MeshStandardMaterial({ map: texturaTelaBufon('carmesi'), side: THREE.DoubleSide, roughness: 0.82 });
    const matCintaDer = new THREE.MeshStandardMaterial({ map: texturaTelaBufon('purpura'), side: THREE.DoubleSide, roughness: 0.82 });
    for (const [cx, cy, cz, rx, rz, matC] of [
      [-0.25, -0.26, 0.08, 0.22, 0.48, matCintaIzq],
      [-0.31, -0.34, 0.04, 0.18, 0.72, matCintaDer],
      [0.25, -0.26, 0.08, 0.22, -0.46, matCintaDer],
      [0.31, -0.34, 0.04, 0.18, -0.7, matCintaIzq],
    ] as const) {
      const cinta = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 0.24), matC);
      cinta.position.set(cx, cy, cz);
      cinta.rotation.set(rx, 0, rz);
      this.cuerpo.add(cinta);
    }

    // Cabeza articulada con capucha arlequín bicolor envolvente y rostro esculpido 3D con volumen real
    this.cabeza.position.set(0, 0.15, 0.03);
    const capuchaIzq = new THREE.Mesh(new THREE.SphereGeometry(0.215, 10, 8, Math.PI * 0.5, Math.PI), matPurpura);
    capuchaIzq.scale.set(1.05, 1.06, 0.72);
    capuchaIzq.position.set(0, 0.02, -0.055);
    const capuchaDer = new THREE.Mesh(new THREE.SphereGeometry(0.215, 10, 8, -Math.PI * 0.5, Math.PI), matCarmesi);
    capuchaDer.scale.set(1.05, 1.06, 0.72);
    capuchaDer.position.set(0, 0.02, -0.055);
    const bandaFrente = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.017, 5, 14, Math.PI * 0.85), matOro);
    bandaFrente.rotation.set(-0.42, 0, Math.PI * 0.075);
    bandaFrente.position.set(0, 0.04, 0.055);
    this.cabeza.add(capuchaIzq, capuchaDer, bandaFrente);

    const mascara = new THREE.Mesh(geometriaRostroBufon(), matMascara);
    mascara.position.set(0, 0.01, 0.045);
    mascara.castShadow = true;
    this.cabeza.add(mascara);

    const nariz = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.055, 4), matMascara);
    nariz.rotation.x = Math.PI * 0.5;
    nariz.position.set(0, 0.005, 0.198);
    this.cabeza.add(nariz);

    // Ojos luminosos estilo Leshy suspendidos en las cuencas + pupilas verticales afiladas
    const matIris = new THREE.MeshBasicMaterial({ color: 0xffe84a });
    const matPupila = new THREE.MeshBasicMaterial({ color: 0x05020a });
    const geoOjo = new THREE.PlaneGeometry(0.054, 0.026);
    const geoPupila = new THREE.PlaneGeometry(0.014, 0.024);

    this.ojoIzq = new THREE.Mesh(geoOjo, matIris);
    this.ojoIzq.rotation.z = -0.2;
    this.ojoIzq.position.set(-0.065, 0.052, 0.192);
    this.pupilaIzq = new THREE.Mesh(geoPupila, matPupila);
    this.pupilaIzq.position.set(0, 0, 0.003);
    this.ojoIzq.add(this.pupilaIzq);

    this.ojoDer = new THREE.Mesh(geoOjo, matIris);
    this.ojoDer.rotation.z = 0.2;
    this.ojoDer.position.set(0.065, 0.052, 0.192);
    this.pupilaDer = new THREE.Mesh(geoPupila, matPupila);
    this.pupilaDer.position.set(0, 0, 0.003);
    this.ojoDer.add(this.pupilaDer);
    this.cabeza.add(this.ojoIzq, this.ojoDer);

    // 3 Colas de gorro curvas con peso natural (izquierda, derecha y trasera central)
    const armarColaGorro = (grupo: THREE.Group, pts: [number, number, number][], mat: THREE.Material): THREE.Mesh => {
      const curva = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, 10, 0.058, 6, false), mat);
      const ult = pts[pts.length - 1];
      const cascabel = new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), matOro);
      cascabel.position.set(ult[0], ult[1] - 0.03, ult[2]);
      grupo.add(tubo, cascabel);
      return cascabel;
    };
    this.cascabelIzq = armarColaGorro(
      this.cuernoIzq,
      [[-0.08, 0.18, 0], [-0.22, 0.34, 0.02], [-0.36, 0.28, 0.05], [-0.42, 0.14, 0.07]],
      matPurpura,
    );
    this.cascabelDer = armarColaGorro(
      this.cuernoDer,
      [[0.08, 0.18, 0], [0.22, 0.38, 0.02], [0.38, 0.32, 0.05], [0.43, 0.17, 0.07]],
      matCarmesi,
    );
    const colaAtras = new THREE.Group();
    armarColaGorro(colaAtras, [[0, 0.2, -0.06], [0, 0.36, -0.2], [0.02, 0.24, -0.32]], matCarmesi);
    this.cabeza.add(this.cuernoIzq, this.cuernoDer, colaAtras);

    // Máscaras venecianas y coronas de los 4 Reyes Jefe
    const ojosReyMat = {
      S: new THREE.MeshBasicMaterial({ color: COLOR_REY.S }),
      C: new THREE.MeshBasicMaterial({ color: COLOR_REY.C }),
      D: new THREE.MeshBasicMaterial({ color: COLOR_REY.D }),
      H: new THREE.MeshBasicMaterial({ color: COLOR_REY.H }),
    };
    this.ojosReyMat = ojosReyMat;
    this.mascarasRey = {
      S: this.crearMascaraRey('S', ojosReyMat.S, matOro),
      C: this.crearMascaraRey('C', ojosReyMat.C, matOro),
      D: this.crearMascaraRey('D', ojosReyMat.D, matOro),
      H: this.crearMascaraRey('H', ojosReyMat.H, matOro),
    };
    for (const palo of ['S', 'C', 'D', 'H'] as const) {
      this.mascarasRey[palo].visible = false;
      this.cabeza.add(this.mascarasRey[palo]);
    }

    this.cuerpo.add(this.cabeza);

    // Manos enguantadas estilizadas + cetro dorado con miniatura veneciana
    const matGuante = new THREE.MeshStandardMaterial({ color: 0x1d0b2c, roughness: 0.72 });
    const armarMano = (grupo: THREE.Group, x: number): void => {
      const palma = new THREE.Mesh(new THREE.ConeGeometry(0.058, 0.13, 5), matGuante);
      palma.rotation.x = Math.PI * 0.78;
      const puno = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.058, 0.085, 6), matCarmesi);
      puno.position.set(0, -0.055, -0.02);
      grupo.add(palma, puno);
      grupo.position.set(x, -0.32, 0.2);
    };
    armarMano(this.manoIzq, -0.3);
    armarMano(this.manoDer, 0.28);

    const asta = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.66, 6), matOro);
    asta.position.set(0, 0.08, 0);
    const remate = new THREE.Mesh(new THREE.OctahedronGeometry(0.062, 0), matMascara);
    remate.scale.set(0.85, 1.15, 0.65);
    remate.position.set(0, 0.44, 0);
    const cuernoMiniL = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.075, 5), matPurpura);
    cuernoMiniL.position.set(-0.042, 0.495, 0);
    cuernoMiniL.rotation.z = 0.65;
    const cuernoMiniR = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.075, 5), matCarmesi);
    cuernoMiniR.position.set(0.042, 0.495, 0);
    cuernoMiniR.rotation.z = -0.65;
    this.cetro.add(asta, remate, cuernoMiniL, cuernoMiniR);
    this.cetro.position.set(-0.24, -0.26, 0.21);
    this.cetro.rotation.z = 0.42;

    this.cuerpo.add(this.manoIzq, this.manoDer, this.cetro);

    // Luz rasante de claroscuro desde abajo a la izquierda (como candil cercano, sin lavar el lado derecho)
    this.luzMascara = new THREE.PointLight(0xffbe5c, 2.5, 2.0, 2);
    this.luzMascara.position.set(-0.26, 0.06, 0.72);
    this.raiz.add(this.cuerpo, this.luzMascara);
    this.raiz.visible = false;
    escena.add(this.raiz);
  }

  private crearMascaraRey(palo: Palo, matOjos: THREE.MeshBasicMaterial, matOro: THREE.Material): THREE.Group {
    const g = new THREE.Group();
    const colorMetal =
      palo === 'S' ? 0x2b4560 : palo === 'C' ? 0x263d28 : palo === 'D' ? 0xd9a826 : 0x5c1129;
    const matVisor = new THREE.MeshStandardMaterial({
      color: colorMetal,
      metalness: palo === 'S' || palo === 'D' ? 0.72 : 0.25,
      roughness: palo === 'C' ? 0.75 : 0.35,
    });

    // Antifaz dominó veneciano puntiagudo sobre ojos y puente nasal
    const domino = new THREE.Mesh(geometriaDominoRey(), matVisor);
    domino.position.set(0, 0.015, 0.188);
    g.add(domino);

    const geoRendija = new THREE.CircleGeometry(0.038, 4);
    for (const signo of [-1, 1] as const) {
      const r = new THREE.Mesh(geoRendija, matOjos);
      r.scale.set(1.28, 0.52, 1);
      r.rotation.z = -signo * 0.22;
      r.position.set(signo * 0.072, 0.068, 0.238);
      g.add(r);
    }

    // Corona distintiva de cada Rey (proporcionada para no recortarse en la cabecera)
    const aro = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.048, 8), palo === 'D' ? matOro : matVisor);
    aro.position.set(0, 0.24, 0.03);
    g.add(aro);

    if (palo === 'S') {
      for (let i = -2; i <= 2; i++) {
        const punta = new THREE.Mesh(new THREE.ConeGeometry(0.034, i === 0 ? 0.16 : 0.11, 4), matVisor);
        punta.position.set(i * 0.072, 0.31, 0.1 - Math.abs(i) * 0.025);
        g.add(punta);
      }
    } else if (palo === 'C') {
      for (const s of [-1, 1]) {
        const rama = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.032, 0.18, 5), matVisor);
        rama.position.set(s * 0.12, 0.31, 0.04);
        rama.rotation.z = -s * 0.48;
        const brote = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), matOjos);
        brote.position.set(s * 0.17, 0.39, 0.04);
        g.add(rama, brote);
      }
    } else if (palo === 'D') {
      for (let i = -2; i <= 2; i++) {
        const rayo = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15 - Math.abs(i) * 0.02, 4), matOro);
        rayo.position.set(i * 0.072, 0.32, 0.09 - Math.abs(i) * 0.02);
        rayo.rotation.z = -i * 0.16;
        g.add(rayo);
      }
      const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.038, 0), new THREE.MeshBasicMaterial({ color: 0xff2b55 }));
      gema.position.set(0, 0.245, 0.21);
      g.add(gema);
    } else {
      const caliz = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.048, 0.13, 7), matVisor);
      caliz.position.set(0, 0.31, 0.06);
      const filo = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.015, 5, 8), matOro);
      filo.rotation.x = Math.PI / 2;
      filo.position.set(0, 0.37, 0.06);
      g.add(caliz, filo);
    }
    return g;
  }

  private anfitrionVisible(): HTMLElement | null {
    const esEscritorio = window.innerWidth > 700;
    const candidatos = [
      document.querySelector<HTMLElement>('.portada .anfitrion .bufon'),
      ...(esEscritorio
        ? [
            document.querySelector<HTMLElement>('.mesa .esc-bufon .bufon'),
            document.querySelector<HTMLElement>('.mapa .mapa-bufon .bufon'),
            document.querySelector<HTMLElement>('.pulperia .pul-bufon .bufon'),
            document.querySelector<HTMLElement>('.fogon .anfitrion .bufon'),
          ]
        : []),
    ];
    for (const el of candidatos) {
      if (!el) continue;
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
    const factorY = enMesa ? 0.62 : esMovilPortada ? 0.45 : 0.5;
    const factorEscala = enMesa ? 0.84 : esMovilPortada ? 0.94 : 1.02;

    const tam = this.proyectarRect(cam, r.left + r.width / 2, r.top + r.height * factorY, r.width, r.height, 5.95, this.raiz.position);
    this.raiz.scale.setScalar(tam.worldH * factorEscala);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    const eEl = document.querySelector<HTMLElement>('.mesa .e-carta[data-jefe="1"]');
    const paloRey = eEl ? ((eEl.dataset.palo || 'S') as Palo) : null;
    const segundaRey = eEl?.dataset.segunda === '1';

    if (paloRey !== this.reyActual) {
      this.reyActual = paloRey;
      this.reyProgreso = quieto ? 1 : 0;
    } else if (paloRey && !quieto) {
      this.reyProgreso = Math.min(1, this.reyProgreso + dt * 2.8);
    }

    for (const p of ['S', 'C', 'D', 'H'] as const) {
      const m = this.mascarasRey[p];
      const activo = p === paloRey;
      m.visible = activo;
      if (activo) {
        const yOff = quieto ? 0 : (1 - this.reyProgreso) * 0.34;
        m.position.set(0, yOff, 0);
        this.ojosReyMat[p].color.setHex(segundaRey ? 0xffffff : COLOR_REY[p]);
      }
    }

    if (paloRey) {
      this.luzMascara.color.setHex(COLOR_REY[paloRey]);
      this.luzMascara.intensity = segundaRey ? 2.8 : 2.2;
      this.luzMascara.distance = 1.7;
    } else {
      this.luzMascara.color.setHex(0xffb464);
      this.luzMascara.intensity = 1.8;
      this.luzMascara.distance = 1.6;
    }

    let objX = punteroX;
    let objY = punteroY;
    const foco = document.querySelector<HTMLElement>('.mesa .mano .carta.arrastrada, .mesa .mano .carta:focus-visible');
    if (foco) {
      const fr = foco.getBoundingClientRect();
      objX = ((fr.left + fr.width / 2) / Math.max(1, window.innerWidth)) * 2 - 1;
      objY = ((fr.top + fr.height / 2) / Math.max(1, window.innerHeight)) * 2 - 1;
    }

    const expr = el.dataset.expresion ?? 'reposo';
    const habla = el.classList.contains('habla');
    const festeja = el.classList.contains('festeja');
    const lamenta = el.classList.contains('lamenta');

    if (quieto) {
      this.cabeza.rotation.set(expr === 'sombria' ? 0.14 : -0.04, 0.08, expr === 'burla' ? -0.1 : 0);
      this.cuerpo.rotation.set(0.04, 0.06, 0);
      this.cuerpo.position.set(0, 0, 0);
      this.ojoIzq.scale.set(1.15, 0.58, 1);
      this.ojoDer.scale.set(1.15, 0.58, 1);
      this.pupilaIzq.position.set(0.006, -0.003, 0.003);
      this.pupilaDer.position.set(0.006, -0.003, 0.003);
      this.cetro.rotation.set(0, 0, 0.42);
      this.manoIzq.position.set(-0.3, enMesa ? -0.34 : -0.3, enMesa ? 0.18 : 0.22);
      this.manoDer.position.set(0.28, enMesa ? -0.34 : -0.3, enMesa ? 0.18 : 0.22);
      return;
    }

    const k = 1 - Math.exp(-8 * dt);
    this.miraX += (objX - this.miraX) * k;
    this.miraY += (objY - this.miraY) * k;
    const metaInclina = habla || expr === 'brillo' || expr === 'sombria' ? 0.14 : 0;
    this.inclina += (metaInclina - this.inclina) * k;

    const risaOsc = expr === 'risa' || expr === 'burla' || festeja ? Math.sin(reloj * 14) * 0.09 : 0;
    const penaOsc = lamenta ? Math.sin(reloj * 18) * 0.05 : 0;
    const respY = Math.sin(reloj * 1.9) * 0.018;

    this.cuerpo.position.set(0, respY + (festeja ? Math.abs(Math.sin(reloj * 10)) * 0.04 : 0), this.inclina * 0.35);
    this.cuerpo.rotation.set(this.inclina + (lamenta ? 0.15 : 0), this.miraX * 0.14, risaOsc * 0.4 + penaOsc);

    this.cabeza.rotation.set(
      (expr === 'sombria' ? 0.16 : 0) + this.miraY * 0.16 + risaOsc,
      this.miraX * 0.28,
      (expr === 'burla' ? -0.12 : 0) + penaOsc,
    );

    this.cuernoIzq.rotation.z = Math.sin(reloj * 2.4) * 0.05 + risaOsc * 0.4;
    this.cuernoDer.rotation.z = -Math.sin(reloj * 2.4 + 0.6) * 0.05 - risaOsc * 0.4;
    this.cascabelIzq.position.y = 0.06 + Math.sin(reloj * 4.5) * 0.012;
    this.cascabelDer.position.y = 0.06 + Math.cos(reloj * 4.5) * 0.012;

    const hablaCetro = habla ? Math.sin(reloj * 12) * 0.12 : Math.sin(reloj * 1.6) * 0.05;
    this.cetro.rotation.set(hablaCetro * 0.5, 0, 0.42 + hablaCetro);
    this.manoIzq.position.set(-0.3, (enMesa ? -0.34 : -0.3) + hablaCetro * 0.12, enMesa ? 0.18 : 0.22);
    this.manoDer.position.set(0.28, (enMesa ? -0.34 : -0.3) - hablaCetro * 0.1, enMesa ? 0.18 : 0.22);

    const px = THREE.MathUtils.clamp(this.miraX * 0.014, -0.014, 0.014);
    const py = THREE.MathUtils.clamp(-this.miraY * 0.008, -0.008, 0.008);
    this.pupilaIzq.position.set(px, py, 0.003);
    this.pupilaDer.position.set(px, py, 0.003);

    if (reloj >= this.proxParpadeo) {
      this.parpadeoHasta = reloj + 0.13;
      this.proxParpadeo = reloj + 2.4 + Math.random() * 2.8;
    }
    const parpadea = reloj < this.parpadeoHasta;
    this.ojoIzq.scale.set(1.15, parpadea ? 0.08 : 0.58, 1);
    this.ojoDer.scale.set(1.15, parpadea ? 0.08 : 0.58, 1);
  }
}
