// Los 5 Chiches físicos en 3D apoyados sobre la madera a la derecha de la mesa.
import * as THREE from 'three';
import type { ChicheId } from '../../rules/chiches';
import { texturaCaraDado, texturaHalo, texturaTiza } from './texturas';

interface RanuraChiche {
  raiz: THREE.Group;
  prop: THREE.Group;
  tipo: ChicheId | null;
  llamaExt?: THREE.Mesh;
  llamaInt?: THREE.Mesh;
}

export class Chiches3D {
  readonly raiz = new THREE.Group();
  activos = 0;

  private readonly ranuras: RanuraChiche[] = [];
  private readonly geoSombra = new THREE.CircleGeometry(0.32, 12);
  private readonly matSombra = new THREE.MeshBasicMaterial({
    color: 0x05030a,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });

  private readonly vFwd = new THREE.Vector3();
  private readonly vCentroPlano = new THREE.Vector3();
  private readonly vOrigen = new THREE.Vector3();
  private readonly vDir = new THREE.Vector3();
  private readonly ray = new THREE.Ray();
  private readonly plano = new THREE.Plane();

  constructor(escena: THREE.Scene) {
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Group();
      const sombra = new THREE.Mesh(this.geoSombra, this.matSombra);
      sombra.rotation.x = -Math.PI / 2;
      sombra.position.set(0, -0.34, 0);
      const prop = new THREE.Group();
      r.add(sombra, prop);
      r.visible = false;
      this.raiz.add(r);
      this.ranuras.push({ raiz: r, prop, tipo: null });
    }
    escena.add(this.raiz);
  }

  private construirProp(ranura: RanuraChiche, id: ChicheId): void {
    ranura.prop.clear();
    ranura.llamaExt = undefined;
    ranura.llamaInt = undefined;
    ranura.tipo = id;

    if (id === 'ginebra') {
      const vidrio = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.19, 0.54, 8),
        new THREE.MeshStandardMaterial({
          color: 0xc2f0e0,
          transparent: true,
          opacity: 0.38,
          roughness: 0.15,
          metalness: 0.2,
        }),
      );
      const borde = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.018, 5, 10),
        new THREE.MeshStandardMaterial({
          color: 0xdffaff,
          emissive: 0x3b7a8a,
          emissiveIntensity: 0.35,
          roughness: 0.18,
        }),
      );
      borde.rotation.x = Math.PI / 2;
      borde.position.y = 0.27;
      const liquido = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.16, 0.35, 8),
        new THREE.MeshStandardMaterial({
          color: 0x38eb6e,
          emissive: 0x1ea84a,
          emissiveIntensity: 0.72,
          roughness: 0.22,
        }),
      );
      liquido.position.y = -0.06;
      const hielo1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.11, 0.13),
        new THREE.MeshStandardMaterial({ color: 0xe6fbff, emissive: 0x326270, emissiveIntensity: 0.28, roughness: 0.2 }),
      );
      hielo1.position.set(0.04, 0.09, 0.03);
      hielo1.rotation.set(0.3, 0.5, 0.2);
      const hielo2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.09, 0.11),
        new THREE.MeshStandardMaterial({ color: 0xe6fbff, emissive: 0x326270, emissiveIntensity: 0.28, roughness: 0.2 }),
      );
      hielo2.position.set(-0.06, 0.07, -0.02);
      hielo2.rotation.set(-0.2, 0.8, 0.35);
      ranura.prop.add(liquido, hielo1, hielo2, vidrio, borde);
      return;
    }

    if (id === 'dado') {
      const caras = [3, 4, 5, 2, 1, 6].map(
        (n) =>
          new THREE.MeshStandardMaterial({
            map: texturaCaraDado(n),
            roughness: 0.45,
            emissive: 0xffffff,
            emissiveMap: texturaCaraDado(n),
            emissiveIntensity: 0.16,
          }),
      );
      const dado = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), caras);
      dado.rotation.set(0.48, 0.62, 0.14);
      ranura.prop.add(dado);
      return;
    }

    if (id === 'fosforo') {
      const palo = new THREE.Mesh(
        new THREE.BoxGeometry(0.072, 0.52, 0.072),
        new THREE.MeshStandardMaterial({ color: 0xd9a066, emissive: 0x3d220a, emissiveIntensity: 0.25, roughness: 0.72 }),
      );
      palo.position.set(0, -0.06, 0);
      const cabeza = new THREE.Mesh(
        new THREE.SphereGeometry(0.074, 7, 6),
        new THREE.MeshStandardMaterial({ color: 0xe62240, emissive: 0x4a0612, emissiveIntensity: 0.3, roughness: 0.48 }),
      );
      cabeza.position.set(0, 0.2, 0);
      const llamaExt = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.125, 0),
        new THREE.MeshBasicMaterial({ color: 0xff8a1e }),
      );
      llamaExt.scale.set(0.7, 1.5, 0.7);
      llamaExt.position.set(0, 0.33, 0);
      const llamaInt = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.075, 0),
        new THREE.MeshBasicMaterial({ color: 0xfff3a8 }),
      );
      llamaInt.scale.set(0.65, 1.3, 0.65);
      llamaInt.position.set(0, 0.31, 0);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texturaHalo(),
          color: 0xffa842,
          transparent: true,
          opacity: 0.58,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.position.set(0, 0.32, 0.04);
      halo.scale.set(0.78, 0.78, 1);
      ranura.llamaExt = llamaExt;
      ranura.llamaInt = llamaInt;
      ranura.prop.rotation.z = -0.32;
      ranura.prop.add(palo, cabeza, llamaExt, llamaInt, halo);
      return;
    }

    if (id === 'tiza') {
      const matLado = new THREE.MeshStandardMaterial({ map: texturaTiza(), roughness: 0.78 });
      const matTope = new THREE.MeshStandardMaterial({ color: 0x9be7ff, roughness: 0.92, emissive: 0x164e7a, emissiveIntensity: 0.25 });
      const cubo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.34, 0.4), [matLado, matLado, matTope, matLado, matLado, matLado]);
      const hueco = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.09, 0.04, 8),
        new THREE.MeshStandardMaterial({ color: 0x185fa8, roughness: 0.9 }),
      );
      hueco.position.set(0, 0.165, 0);
      ranura.prop.rotation.set(0.42, 0.52, 0);
      ranura.prop.add(cubo, hueco);
      return;
    }

    // Poroto de Yapa sobre platillo oscuro
    const platillo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.18, 0.06, 10),
      new THREE.MeshStandardMaterial({ color: 0x3b2a47, metalness: 0.6, roughness: 0.4 }),
    );
    platillo.position.set(0, -0.14, 0);
    const poroto = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0xd91a4a,
        metalness: 0.35,
        roughness: 0.28,
        emissive: 0x5c061d,
        emissiveIntensity: 0.35,
      }),
    );
    poroto.scale.set(1.18, 0.76, 0.86);
    poroto.rotation.set(0.2, 0.35, 0.15);
    const banda = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.018, 5, 10),
      new THREE.MeshStandardMaterial({ color: 0xffd500, metalness: 0.75, roughness: 0.25 }),
    );
    banda.rotation.set(Math.PI / 2 + 0.2, 0.35, 0);
    ranura.prop.add(platillo, poroto, banda);
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

  sincronizar(cam: THREE.PerspectiveCamera, _dt: number, quieto: boolean, reloj: number): void {
    this.activos = 0;
    const esEscritorio = window.innerWidth > 700;
    const enMesa = esEscritorio && !!document.querySelector('.mesa');
    if (!enMesa) {
      for (const r of this.ranuras) r.raiz.visible = false;
      return;
    }

    const botones = document.querySelectorAll<HTMLButtonElement>('.mesa [data-chiches] button.chiche');
    const usados = new Set<number>();

    botones.forEach((el) => {
      const idx = Number(el.dataset.i ?? -1);
      if (idx < 0 || idx >= this.ranuras.length) return;
      if (el.classList.contains('tomado') || el.classList.contains('llega')) return;
      const id = el.dataset.chiche as ChicheId | undefined;
      if (!id) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 12 || rect.height < 12) return;

      usados.add(idx);
      this.activos++;
      const ranura = this.ranuras[idx];
      if (ranura.tipo !== id) this.construirProp(ranura, id);

      const enfocado = el.matches(':hover, :focus-visible');
      const hProp = rect.height * 0.72;
      const tam = this.proyectarRect(cam, rect.left + rect.width / 2, rect.top + hProp * 0.5, rect.width, hProp, 5.55, ranura.raiz.position);
      const escala = Math.min(tam.worldW, tam.worldH) * 1.06 * (enfocado ? 1.12 : 1);
      ranura.raiz.scale.setScalar(escala);
      ranura.raiz.quaternion.copy(cam.quaternion);

      if (!quieto) {
        const alza = enfocado ? 0.08 + Math.sin(reloj * 4) * 0.025 : Math.sin(reloj * 1.6 + idx) * 0.02;
        ranura.prop.position.set(0, alza, 0);
        ranura.prop.rotation.y = Math.sin(reloj * (enfocado ? 2.2 : 0.9) + idx * 1.4) * (enfocado ? 0.45 : 0.18);
        if (ranura.llamaExt && ranura.llamaInt) {
          const escL = 1 + Math.sin(reloj * 14 + idx) * 0.16;
          ranura.llamaExt.scale.set(0.7 * escL, 1.5 * escL, 0.7 * escL);
          ranura.llamaInt.scale.set(0.65 * escL, 1.3 * escL, 0.65 * escL);
        }
      } else {
        ranura.prop.position.set(0, 0, 0);
        ranura.prop.rotation.y = 0;
      }
      ranura.raiz.visible = true;
    });

    for (let i = 0; i < this.ranuras.length; i++) {
      if (!usados.has(i)) this.ranuras[i].raiz.visible = false;
    }
  }
}
