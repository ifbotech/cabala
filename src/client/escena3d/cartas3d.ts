// Sincronizador 3D de naipes físicos, tótem de enemigo y fractura en dos mitades con monedas 3D.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import type { MazoId } from '../../rules/mazos';
import { texturaDorso, texturaNaipe, texturaNaipeMitad } from './texturas';

interface Naipe3D {
  malla: THREE.Mesh;
  sombra: THREE.Mesh;
  claveTex: string;
  claveDorso: string;
  mats: THREE.MeshStandardMaterial[];
  visto: boolean;
}

interface PiezaFisica {
  malla: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  vida: number;
}

export class SincroCartas3D {
  readonly raiz = new THREE.Group();
  private readonly cartas = new Map<string, Naipe3D>();
  private readonly geoCarta = new THREE.BoxGeometry(1, 1, 0.045);
  private readonly geoSombra = new THREE.PlaneGeometry(1, 1);
  private readonly geoMoneda = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10);
  private readonly matSombra = new THREE.MeshBasicMaterial({
    color: 0x040208,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  private readonly matOro = new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.72, roughness: 0.28 });

  private readonly enemigoTotem: THREE.Mesh;
  private readonly enemigoMats: THREE.MeshStandardMaterial[];
  private claveEnemigo = '';
  private fracVisEnemigo = 1;

  private readonly piezas: PiezaFisica[] = [];
  private mazoDorso: MazoId = 'escoba';

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();
  private readonly vHit = new THREE.Vector3();

  constructor(escena: THREE.Scene) {
    this.enemigoMats = [
      new THREE.MeshStandardMaterial({ color: 0xe6d7bc, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0xe6d7bc, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0xe6d7bc, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0xe6d7bc, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.56, emissive: 0xffffff, emissiveIntensity: 0.34 }),
      new THREE.MeshStandardMaterial({ color: 0x261830, roughness: 0.7 }),
    ];
    this.enemigoTotem = new THREE.Mesh(this.geoCarta, this.enemigoMats);
    this.enemigoTotem.castShadow = true;
    this.enemigoTotem.visible = false;
    this.raiz.add(this.enemigoTotem);
    escena.add(this.raiz);
  }

  private crearCarta(id: string): Naipe3D {
    const matBorde = new THREE.MeshStandardMaterial({ color: 0xe6d7bc, roughness: 0.68 });
    const matFrente = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.54,
      metalness: 0.04,
      emissive: 0xffffff,
      emissiveIntensity: 0.36,
    });
    const matDorso = new THREE.MeshStandardMaterial({ map: texturaDorso(this.mazoDorso), roughness: 0.64 });
    const mats = [matBorde, matBorde, matBorde, matBorde, matFrente, matDorso];
    const malla = new THREE.Mesh(this.geoCarta, mats);
    malla.castShadow = true;
    const sombra = new THREE.Mesh(this.geoSombra, this.matSombra);
    this.raiz.add(sombra, malla);
    const entry: Naipe3D = { malla, sombra, claveTex: '', claveDorso: this.mazoDorso, mats, visto: true };
    this.cartas.set(id, entry);
    return entry;
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

  /** Lanza dos mitades 3D reales y monedas 3D cuando cae un enemigo. */
  partirEnemigo(cam: THREE.PerspectiveCamera, palo: Palo, rango: number, segunda: boolean): void {
    const el = document.querySelector<HTMLElement>('.mesa .e-carta');
    const r = el?.getBoundingClientRect();
    const cx = r && r.width > 4 ? r.left + r.width / 2 : window.innerWidth / 2;
    const cy = r && r.height > 4 ? r.top + r.height / 2 : window.innerHeight * 0.22;
    const w = r && r.width > 4 ? r.width : 140;
    const h = r && r.height > 4 ? r.height : 196;

    const tam = this.proyectarRect(cam, cx, cy, w, h, 5.9, this.vHit);
    for (const lado of ['izq', 'der'] as const) {
      const sign = lado === 'izq' ? -1 : 1;
      const tex = texturaNaipeMitad(palo, rango, lado, segunda);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        roughness: 0.55,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 0.35,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(tam.worldW, tam.worldH), mat);
      m.position.copy(this.vHit);
      m.quaternion.copy(cam.quaternion);
      this.raiz.add(m);
      this.piezas.push({
        malla: m,
        vel: new THREE.Vector3(sign * (1.8 + Math.random() * 0.8), 1.6 + Math.random() * 0.8, 1.1),
        rotVel: new THREE.Vector3(0.4, sign * 1.4, -sign * 2.2),
        vida: 0.95,
      });
    }

    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(this.geoMoneda, this.matOro);
      m.position.copy(this.vHit).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, -0.2, 0.2));
      this.raiz.add(m);
      this.piezas.push({
        malla: m,
        vel: new THREE.Vector3((Math.random() - 0.5) * 3.4, 2.2 + Math.random() * 2.0, 2.4 + Math.random() * 1.6),
        rotVel: new THREE.Vector3(8 + Math.random() * 6, 4 + Math.random() * 5, 6),
        vida: 1.05,
      });
    }
  }

  sincronizar(
    cam: THREE.PerspectiveCamera,
    mazoId: MazoId,
    dt: number,
    quieto: boolean,
    punteroX: number,
    punteroY: number,
    reloj: number,
  ): number {
    this.mazoDorso = mazoId;
    for (const c of this.cartas.values()) c.visto = false;

    let activas = 0;
    const esMesa = !!document.querySelector('.mesa');
    if (esMesa) {
      const nodos = document.querySelectorAll<HTMLButtonElement>('.mesa .mano .carta');
      nodos.forEach((el) => {
        const id = el.dataset.id;
        if (!id) return;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.05) return;
        const pxEl = el.querySelector<HTMLElement>(':scope > .px');
        const r = (pxEl ?? el).getBoundingClientRect();
        if (r.width < 8 || r.height < 8) return;

        // Respetar el recorte de fila trasera / pie de la mano (`clip-path: inset(...)` o contenedor .mano)
        const ins = /^inset\(([^)]*)\)/.exec(st.clipPath)?.[1].split(/\s+/).map((v) => parseFloat(v) || 0);
        const recorteB = ins && ins.length >= 3 ? Math.max(0, ins[2]) : 0;
        const hVis = Math.max(8, r.height - recorteB);
        const fracH = Math.max(0.08, Math.min(1, hVis / r.height));

        const entry = this.cartas.get(id) ?? this.crearCarta(id);
        entry.visto = true;
        activas++;

        const copia = el.querySelector('.c-espectro')?.getAttribute('data-v');
        const mCopia = copia ? /^(\d+)([SCDH])$/.exec(copia) : null;
        const palo = (mCopia ? mCopia[2] : el.dataset.palo || 'S') as Palo | 'X';
        const n = mCopia ? Number(mCopia[1]) : Number(el.dataset.n || 1);
        const elegida = el.classList.contains('elegida');
        const arrastrada = el.classList.contains('arrastrada');
        const inmune = el.classList.contains('inmune');
        const enMedio = el.classList.contains('en-medio');
        const enfocada = el.matches(':hover, :focus-visible');

        const clave = `${palo}:${n}:${fracH.toFixed(2)}`;
        if (clave !== entry.claveTex) {
          entry.claveTex = clave;
          const texBase = texturaNaipe(palo, n);
          const tex = fracH < 0.98 ? texBase.clone() : texBase;
          if (fracH < 0.98) {
            tex.repeat.set(1, fracH);
            tex.offset.set(0, 1 - fracH);
            tex.needsUpdate = true;
          }
          entry.mats[4].map = tex;
          entry.mats[4].emissiveMap = tex;
          entry.mats[4].needsUpdate = true;
        }
        if (entry.claveDorso !== this.mazoDorso) {
          entry.claveDorso = this.mazoDorso;
          entry.mats[5].map = texturaDorso(this.mazoDorso);
          entry.mats[5].needsUpdate = true;
        }

        // Tinte y brillo según estado de la carta
        if (inmune) {
          entry.mats[4].color.setHex(0x7e7a8c);
          entry.mats[4].emissiveIntensity = 0.18;
        } else {
          entry.mats[4].color.setHex(0xfff8ee);
          entry.mats[4].emissiveIntensity = copia || enMedio ? 0.7 : 0.62;
        }
        if (copia || enMedio) {
          entry.mats[0].color.setHex(0xffd23f);
          entry.mats[0].emissive.setHex(0x704c00);
          entry.mats[0].emissiveIntensity = 0.4;
        } else {
          entry.mats[0].color.setHex(0xe6d7bc);
          entry.mats[0].emissive.setHex(0x000000);
          entry.mats[0].emissiveIntensity = 0;
        }

        const dist = arrastrada ? 4.85 : elegida ? 5.85 : 5.45;
        const cx = r.left + r.width / 2;
        const cy = r.top + hVis / 2;
        const tam = this.proyectarRect(cam, cx, cy, r.width, hVis, dist, entry.malla.position);
        entry.malla.scale.set(tam.worldW, tam.worldH, 1);
        entry.malla.quaternion.copy(cam.quaternion);

        if (!quieto) {
          if (arrastrada) {
            entry.malla.rotateX(-0.08);
            entry.malla.rotateY(punteroX * 0.14);
          } else if (elegida) {
            entry.malla.rotateX(-0.11);
          } else if (enfocada) {
            entry.malla.rotateX(-punteroY * 0.08);
            entry.malla.rotateY(punteroX * 0.11);
          } else {
            entry.malla.rotateZ(Math.sin(reloj * 1.4 + cx * 0.01) * 0.012);
          }
        }
        entry.malla.visible = true;

        // Sombra desplazada por debajo de la carta
        entry.sombra.position.copy(entry.malla.position).add(new THREE.Vector3(0.06, -0.08, arrastrada ? -0.35 : -0.14));
        entry.sombra.quaternion.copy(cam.quaternion);
        entry.sombra.scale.set(tam.worldW * 1.03, tam.worldH * 1.03, 1);
        entry.sombra.visible = true;
      });

      // Tótem 3D del enemigo activo
      const eEl = document.querySelector<HTMLElement>('.mesa .e-carta');
      const eCentro = document.querySelector<HTMLElement>('.mesa .e-centro');
      const eBarra = document.querySelector<HTMLElement>('.mesa .e-barras');
      if (eEl && !eEl.classList.contains('partida')) {
        const r = eEl.getBoundingClientRect();
        const rc = eCentro?.getBoundingClientRect() ?? r;
        const rb = eBarra?.getBoundingClientRect();
        const top = Math.max(0, r.top, rc.top);
        const bottom = Math.min(r.bottom, rc.bottom, rb ? rb.top + 2 : r.bottom);
        const hVis = Math.max(12, bottom - top);
        if (r.width > 8 && hVis > 12) {
          const palo = (eEl.dataset.palo || 'S') as Palo;
          const rango = Number(eEl.dataset.rango || 10);
          const segunda = eEl.dataset.segunda === '1';
          const visFrac = Math.max(0.15, Math.min(1, hVis / r.height));
          const nuevaClave = `${palo}:${rango}:${segunda ? 1 : 0}:${visFrac.toFixed(2)}`;
          if (nuevaClave !== this.claveEnemigo || Math.abs(visFrac - this.fracVisEnemigo) > 0.02) {
            this.claveEnemigo = nuevaClave;
            this.fracVisEnemigo = visFrac;
            const base = texturaNaipe(palo, rango, segunda);
            const tex = visFrac < 0.98 ? base.clone() : base;
            if (visFrac < 0.98) {
              tex.repeat.set(1, visFrac);
              tex.offset.set(0, Math.max(0, 1 - (top - r.top + hVis) / r.height));
              tex.needsUpdate = true;
            }
            this.enemigoMats[4].map = tex;
            this.enemigoMats[4].emissiveMap = tex;
            this.enemigoMats[4].needsUpdate = true;
          }

          const herido = eEl.classList.contains('herido');
          const embiste = eEl.classList.contains('embiste');
          const aturdido = eEl.classList.contains('aturdido');
          const furia = eEl.classList.contains('con-furia');
          this.enemigoMats[4].color.setHex(0xfff8ee);
          this.enemigoMats[4].emissiveIntensity = herido ? 0.95 : 0.62;
          this.enemigoMats[0].color.setHex(segunda ? 0xff4d6d : furia ? 0xff9a2e : 0xe6d7bc);

          const distE = embiste ? 5.15 : herido ? 6.25 : 5.85;
          const tam = this.proyectarRect(cam, r.left + r.width / 2, top + hVis / 2, r.width, hVis, distE, this.enemigoTotem.position);
          this.enemigoTotem.scale.set(tam.worldW, tam.worldH, 1.4);
          this.enemigoTotem.quaternion.copy(cam.quaternion);
          if (!quieto && aturdido) this.enemigoTotem.rotateZ(Math.sin(reloj * 6.5) * 0.06);
          else if (!quieto && embiste) this.enemigoTotem.rotateX(0.14);
          this.enemigoTotem.visible = true;
        } else this.enemigoTotem.visible = false;
      } else this.enemigoTotem.visible = false;
    } else {
      this.enemigoTotem.visible = false;
    }

    for (const [id, c] of this.cartas.entries()) {
      if (!c.visto) {
        c.malla.visible = false;
        c.sombra.visible = false;
        if (!esMesa) {
          this.raiz.remove(c.malla, c.sombra);
          this.cartas.delete(id);
        }
      }
    }

    // Actualizar piezas voladoras (enemigo partido y monedas 3D)
    for (let i = this.piezas.length - 1; i >= 0; i--) {
      const pz = this.piezas[i];
      pz.vida -= dt;
      if (pz.vida <= 0) {
        this.raiz.remove(pz.malla);
        this.piezas.splice(i, 1);
        continue;
      }
      pz.vel.y -= 9.5 * dt;
      pz.malla.position.addScaledVector(pz.vel, dt);
      pz.malla.rotation.x += pz.rotVel.x * dt;
      pz.malla.rotation.y += pz.rotVel.y * dt;
      pz.malla.rotation.z += pz.rotVel.z * dt;
      if (pz.malla.material instanceof THREE.Material) {
        pz.malla.material.opacity = Math.min(1, pz.vida * 2);
      }
    }

    return activas;
  }
}
