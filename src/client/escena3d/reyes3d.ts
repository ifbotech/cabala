// Los 4 Reyes Malvados en 3D saliendo de la carta en combate + VFX 3D de sus poderes especiales.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { texturaLaton, texturaOroMoneda, texturaTelaBufon } from './texturas';

const COLOR_REY: Record<Palo, number> = {
  S: 0x00e5ff,
  C: 0x22f06a,
  D: 0xffd500,
  H: 0xff1e5c,
};

interface ParticulaVfx {
  malla: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  vida: number;
  maxVida: number;
  esOnda?: boolean;
}

export class Reyes3D {
  readonly raiz = new THREE.Group();
  private readonly figuras: Record<Palo, THREE.Group>;
  private readonly luzRey: THREE.PointLight;
  private readonly vfxGrupo = new THREE.Group();
  private readonly vfx: ParticulaVfx[] = [];
  private paloActivo: Palo | null = null;
  private entrada = 0;
  private castTimer = 0;

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();
  private readonly matOro: THREE.MeshStandardMaterial;

  constructor(escena: THREE.Scene) {
    this.matOro = new THREE.MeshStandardMaterial({
      map: texturaOroMoneda(),
      color: 0xffd500,
      metalness: 0.68,
      roughness: 0.32,
      emissive: 0x422a00,
      emissiveIntensity: 0.28,
    });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.6, roughness: 0.4 });

    this.figuras = {
      S: this.crearRey('S', matLaton),
      C: this.crearRey('C', matLaton),
      D: this.crearRey('D', matLaton),
      H: this.crearRey('H', matLaton),
    };
    for (const p of ['S', 'C', 'D', 'H'] as const) {
      this.figuras[p].visible = false;
      this.raiz.add(this.figuras[p]);
    }

    this.luzRey = new THREE.PointLight(0x00e5ff, 2.6, 2.8, 1.8);
    this.luzRey.position.set(0, 0.35, 0.75);
    this.raiz.add(this.luzRey);
    this.raiz.visible = false;

    escena.add(this.raiz, this.vfxGrupo);
  }

  private crearRey(palo: Palo, matLaton: THREE.Material): THREE.Group {
    const g = new THREE.Group();
    const cNeon = COLOR_REY[palo];
    const cManto = palo === 'S' ? 0x13284a : palo === 'C' ? 0x12381c : palo === 'D' ? 0x3a260a : 0x4a0c22;

    const matManto = new THREE.MeshStandardMaterial({
      map: texturaTelaBufon(palo === 'H' || palo === 'D' ? 'carmesi' : 'purpura'),
      color: palo === 'S' ? 0x3b78b8 : palo === 'C' ? 0x38944a : palo === 'D' ? 0xc49528 : 0xa3264e,
      roughness: 0.78,
      metalness: 0.1,
    });
    const matOscuro = new THREE.MeshStandardMaterial({ color: 0x0b0612, roughness: 0.88 });
    const matNeon = new THREE.MeshBasicMaterial({ color: cNeon });
    const matArma = new THREE.MeshStandardMaterial({
      color: palo === 'D' ? 0xffd500 : cNeon,
      metalness: palo === 'S' || palo === 'D' ? 0.75 : 0.25,
      roughness: 0.32,
      emissive: cNeon,
      emissiveIntensity: 0.25,
    });

    // Capa y torso imponente emergiendo del naipe
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.31, 0.44, 8), matManto);
    torso.position.set(0, -0.05, 0.02);
    const capa = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.56, 8, 1, true, Math.PI * 0.65, Math.PI * 0.7), matOscuro);
    capa.position.set(0, -0.05, -0.1);
    capa.material.side = THREE.DoubleSide;

    // Hombreras reales
    for (const sx of [-1, 1] as const) {
      const h = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), matLaton);
      h.scale.set(1.2, 0.75, 0.9);
      h.position.set(sx * 0.24, 0.12, 0.04);
      g.add(h);
    }

    // Cabeza angulosa en sombra + ojos ardientes
    const cabeza = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.28, 6), matOscuro);
    cabeza.rotation.x = Math.PI;
    cabeza.position.set(0, 0.26, 0.08);
    const barba = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 5), matOscuro);
    barba.rotation.x = Math.PI;
    barba.position.set(0, 0.14, 0.15);

    for (const sx of [-1, 1] as const) {
      const ojo = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.018), matNeon);
      ojo.rotation.z = -sx * 0.22;
      ojo.position.set(sx * 0.052, 0.29, 0.19);
      g.add(ojo);
    }

    // Corona distintiva
    const aro = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.045, 8), palo === 'D' ? this.matOro : matLaton);
    aro.position.set(0, 0.39, 0.08);
    g.add(torso, capa, cabeza, barba, aro);

    if (palo === 'S') {
      for (let i = -2; i <= 2; i++) {
        const hoja = new THREE.Mesh(new THREE.ConeGeometry(0.028, i === 0 ? 0.18 : 0.12, 4), matArma);
        hoja.position.set(i * 0.058, 0.47, 0.11 - Math.abs(i) * 0.015);
        g.add(hoja);
      }
      // Sable cian alzado
      const sable = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.56, 0.016), matArma);
      sable.position.set(0.32, 0.18, 0.2);
      sable.rotation.z = -0.38;
      g.add(sable);
    } else if (palo === 'C') {
      for (const s of [-1, 1] as const) {
        const rama = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.18, 5), matManto);
        rama.position.set(s * 0.1, 0.46, 0.08);
        rama.rotation.z = -s * 0.46;
        const brote = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), matNeon);
        brote.position.set(s * 0.15, 0.54, 0.08);
        g.add(rama, brote);
      }
      // Garrote esmeralda con púas
      const garrote = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.03, 0.5, 6), matArma);
      garrote.position.set(0.33, 0.12, 0.18);
      garrote.rotation.z = -0.45;
      g.add(garrote);
    } else if (palo === 'D') {
      for (let i = -2; i <= 2; i++) {
        const rayo = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.16 - Math.abs(i) * 0.02, 4), this.matOro);
        rayo.position.set(i * 0.06, 0.47, 0.11 - Math.abs(i) * 0.015);
        rayo.rotation.z = -i * 0.16;
        g.add(rayo);
      }
      // Cetro de oro con orbe
      const cetro = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.5, 6), this.matOro);
      cetro.position.set(0.32, 0.08, 0.18);
      cetro.rotation.z = -0.32;
      const orbe = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), this.matOro);
      orbe.position.set(0.4, 0.31, 0.18);
      g.add(cetro, orbe);
    } else {
      const calizCor = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.045, 0.12, 7), matLaton);
      calizCor.position.set(0, 0.46, 0.08);
      g.add(calizCor);
      // Cáliz carmesí desbordante
      const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.035, 0.16, 7), matArma);
      copa.position.set(0.32, 0.12, 0.22);
      const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.055, 0.14, 6), matLaton);
      pie.position.set(0.32, -0.02, 0.22);
      g.add(copa, pie);
    }
    return g;
  }

  lanzarPoder(cam: THREE.PerspectiveCamera, palo: Palo): void {
    this.castTimer = 0.65;
    const origen = this.raiz.visible ? this.raiz.position.clone() : new THREE.Vector3(0, 2.2, 0.8);
    const col = COLOR_REY[palo];

    if (palo === 'S') {
      // Tajos cian cruzando el paño
      for (let i = -1; i <= 1; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
        const tajo = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.09), mat);
        tajo.position.copy(origen).add(new THREE.Vector3(i * 0.25, -0.1, 0.35));
        tajo.quaternion.copy(cam.quaternion);
        tajo.rotateZ(i * 0.55 + 0.4);
        this.vfxGrupo.add(tajo);
        this.vfx.push({ malla: tajo, vel: new THREE.Vector3(i * 1.4, -2.4, 3.2), rotVel: new THREE.Vector3(0, 0, i * 2), vida: 0.55, maxVida: 0.55 });
      }
    } else if (palo === 'C') {
      // Estacas esmeralda brotando del paño
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, roughness: 0.4 });
        const estaca = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 5), mat);
        estaca.position.copy(origen).add(new THREE.Vector3(Math.cos(a) * 0.55, -0.35, Math.sin(a) * 0.35 + 0.3));
        this.vfxGrupo.add(estaca);
        this.vfx.push({ malla: estaca, vel: new THREE.Vector3(Math.cos(a) * 0.4, 1.8, Math.sin(a) * 0.4), rotVel: new THREE.Vector3(0, 3, 0), vida: 0.65, maxVida: 0.65 });
      }
    } else if (palo === 'D') {
      // Lluvia de monedas malditas
      const geo = new THREE.CylinderGeometry(0.11, 0.11, 0.035, 8);
      for (let i = 0; i < 12; i++) {
        const moneda = new THREE.Mesh(geo, this.matOro);
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
      // Bruma / orbes carmesí del cáliz
      const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const anillo = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.34, 16), ringMat);
      anillo.position.copy(origen).add(new THREE.Vector3(0, -0.1, 0.35));
      anillo.quaternion.copy(cam.quaternion);
      this.vfxGrupo.add(anillo);
      this.vfx.push({ malla: anillo, vel: new THREE.Vector3(0, -0.4, 1.8), rotVel: new THREE.Vector3(0, 0, 2.5), vida: 0.65, maxVida: 0.65, esOnda: true });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const orbe = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 }));
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
    // Actualizar partículas VFX activas
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
      return;
    }
    const r = eEl.getBoundingClientRect();
    if (r.width < 12 || r.height < 12) {
      this.raiz.visible = false;
      return;
    }

    const palo = (eEl.dataset.palo || 'S') as Palo;
    const segunda = eEl.dataset.segunda === '1';
    if (palo !== this.paloActivo) {
      this.paloActivo = palo;
      this.entrada = quieto ? 1 : 0;
    } else if (!quieto) {
      this.entrada = Math.min(1, this.entrada + dt * 2.4);
    }

    if (this.castTimer > 0 && !quieto) this.castTimer = Math.max(0, this.castTimer - dt);

    const worldH = this.proyectar(cam, r.left + r.width / 2, r.top + r.height * 0.64, r.height, 5.55, this.raiz.position);
    this.raiz.scale.setScalar(worldH * 0.76);
    this.raiz.quaternion.copy(cam.quaternion);
    this.raiz.visible = true;

    this.luzRey.color.setHex(COLOR_REY[palo]);
    this.luzRey.intensity = (segunda ? 3.4 : 2.6) + (this.castTimer > 0 ? 1.8 : 0);

    for (const k of ['S', 'C', 'D', 'H'] as const) {
      const fig = this.figuras[k];
      fig.visible = k === palo;
      if (fig.visible) {
        const embiste = this.castTimer > 0 ? Math.sin((this.castTimer / 0.65) * Math.PI) * 0.28 : 0;
        const bob = quieto ? 0 : Math.sin(reloj * 2.3) * 0.025;
        const zSale = (quieto ? 0.18 : 0.18 * this.entrada) + embiste;
        fig.position.set(0, bob, zSale);
        fig.rotation.set(embiste * 0.5, quieto ? 0 : Math.sin(reloj * 1.1) * 0.14, segunda ? 0.05 : 0);
      }
    }
  }
}
