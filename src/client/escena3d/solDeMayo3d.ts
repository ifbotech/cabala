// Escena 3D caminable del clímax argentino: «El Camino al Sol de Mayo» — empedrado porteño nocturno, faroles, banderines celestes y blancos, arcos de naipes y Sol de Mayo monumental.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { armoniaActual } from '../musica';
import {
  texturaEmpedrado,
  texturaHalo,
  texturaLaton,
  texturaMadera,
  texturaNaipe,
  texturaParticula,
  texturaPiedra,
  texturaRey,
  texturaSolDeMayo,
} from './texturas';

export class CaminoSolDeMayo3D {
  readonly raiz = new THREE.Group();
  private readonly banderines: THREE.Mesh[] = [];
  private readonly cartaGloria: THREE.Mesh;
  private readonly coronaSol: THREE.Sprite;
  private readonly haloSol: THREE.Sprite;
  private readonly luzMesa: THREE.PointLight;
  private readonly particulas: THREE.Points;
  private readonly posParticulas: Float32Array;
  private readonly nParticulas = 90;

  constructor(escenaThree: THREE.Scene) {
    const matEmpedrado = new THREE.MeshStandardMaterial({ map: texturaEmpedrado(), roughness: 0.9, metalness: 0.06 });
    const matPiedra = new THREE.MeshStandardMaterial({ map: texturaPiedra(), roughness: 0.92 });
    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.88 });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.65, roughness: 0.38 });
    const matHierro = new THREE.MeshStandardMaterial({ color: 0x161c2c, metalness: 0.65, roughness: 0.48 });

    // Iluminación nocturna celeste y dorada
    const luzAmb = new THREE.HemisphereLight(0x52a8e8, 0x161428, 1.25);
    const luzDir = new THREE.DirectionalLight(0xffdf88, 1.35);
    luzDir.position.set(0, 12, -26);
    this.raiz.add(luzAmb, luzDir);

    // Avenida empedrada porteña
    const calle = new THREE.Mesh(new THREE.PlaneGeometry(14, 48), matEmpedrado);
    calle.rotation.x = -Math.PI / 2;
    calle.position.set(0, -1.62, -10);
    calle.receiveShadow = true;
    this.raiz.add(calle);

    for (const cx of [-5.4, 5.4]) {
      const cordon = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.24, 48), matPiedra);
      cordon.position.set(cx, -1.5, -10);
      this.raiz.add(cordon);
    }

    // Siluetas de fachadas bajas nocturnas enmarcando la avenida
    const matFachada = new THREE.MeshStandardMaterial({ color: 0x0b101d, roughness: 0.96 });
    for (const fx of [-8.4, 8.4]) {
      for (let i = 0; i < 4; i++) {
        const h = 5.4 + (i % 2) * 1.4;
        const fach = new THREE.Mesh(new THREE.BoxGeometry(3.2, h, 9.6), matFachada);
        fach.position.set(fx, -1.62 + h * 0.5, 4 - i * 10.5);
        this.raiz.add(fach);
      }
    }

    // Puerta Doble abierta a tus espaldas (z = +9.2)
    const marcoP = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.8, 0.3), matHierro);
    marcoP.position.set(0, 0.78, 9.2);
    const hojaI = new THREE.Mesh(new THREE.BoxGeometry(1.86, 4.5, 0.16), matMadera);
    hojaI.position.set(-1.95, 0.65, 8.4);
    hojaI.rotation.y = 1.15;
    const hojaD = new THREE.Mesh(new THREE.BoxGeometry(1.86, 4.5, 0.16), matMadera);
    hojaD.position.set(1.95, 0.65, 8.4);
    hojaD.rotation.y = -1.15;
    this.raiz.add(marcoP, hojaI, hojaD);

    // 6 Faroles porteños de hierro forjado (con 2 PointLights estratégicas)
    const farolesZ = [3, -6, -15];
    farolesZ.forEach((fz, idx) => {
      for (const fx of [-4.7, 4.7]) {
        const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 6), matHierro);
        poste.position.set(fx, 0.48, fz);
        const jaula = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.56, 6), new THREE.MeshBasicMaterial({ color: 0xffd074 }));
        jaula.position.set(fx, 2.75, fz);
        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: texturaHalo(),
            color: 0xffb85c,
            transparent: true,
            opacity: 0.42,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        halo.position.set(fx, 2.75, fz);
        halo.scale.set(2.1, 2.1, 1);
        this.raiz.add(poste, jaula, halo);
      }
      if (idx === 0) {
        const lf0 = new THREE.PointLight(0xffcc70, 12, 16, 1.35);
        lf0.position.set(0, 2.8, 1.5);
        this.raiz.add(lf0);
      } else {
        const lf = new THREE.PointLight(0xffb85c, 12, 18, 1.35);
        lf.position.set(0, 2.9, fz);
        this.raiz.add(lf);
      }
    });

    // 3 pares de festones laterales celestes y blancos (despejando el rostro del Sol de Mayo)
    const geoBand = new THREE.ConeGeometry(0.16, 0.34, 3);
    const matCel = new THREE.MeshBasicMaterial({ color: 0x62d0ff });
    const matBla = new THREE.MeshBasicMaterial({ color: 0xedf5ff });
    for (const gz of [1.5, -6.5, -14.5]) {
      for (const lado of [-1, 1]) {
        const cable = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.03, 0.03), matHierro);
        cable.position.set(lado * 3.7, 4.42, gz);
        this.raiz.add(cable);
        for (let i = 0; i < 5; i++) {
          const t = i / 4;
          const bx = lado * (2.3 + t * 2.8);
          const b = new THREE.Mesh(geoBand, i % 2 === 0 ? matCel : matBla);
          b.rotation.x = Math.PI;
          b.position.set(bx, 4.25, gz);
          this.raiz.add(b);
          this.banderines.push(b);
        }
      }
    }

    // 3 Arcos monumentales: Ases y Reyes en retrato dorado sin carta 12
    const arcos: Array<{ z: number; izq: [Palo, number]; der: [Palo, number]; rey?: boolean }> = [
      { z: -1.5, izq: ['D', 1], der: ['S', 1] },
      { z: -9.5, izq: ['C', 1], der: ['H', 1] },
      { z: -17.5, izq: ['D', 12], der: ['S', 12], rey: true },
    ];
    for (const a of arcos) {
      const mI = new THREE.MeshStandardMaterial({
        map: a.rey ? texturaRey(a.izq[0], 'calma') : texturaNaipe(a.izq[0], a.izq[1]),
        roughness: 0.58,
      });
      const mD = new THREE.MeshStandardMaterial({
        map: a.rey ? texturaRey(a.der[0], 'calma') : texturaNaipe(a.der[0], a.der[1]),
        roughness: 0.58,
      });
      const geo = a.rey ? new THREE.BoxGeometry(1.95, 1.95, 0.1) : new THREE.BoxGeometry(1.75, 2.55, 0.08);
      const cI = new THREE.Mesh(geo, [matLaton, matLaton, matLaton, matLaton, mI, mI]);
      cI.position.set(-3.35, 0.55, a.z);
      cI.rotation.y = 0.28;
      cI.rotation.z = -0.14;
      const cD = new THREE.Mesh(geo, [matLaton, matLaton, matLaton, matLaton, mD, mD]);
      cD.position.set(3.35, 0.55, a.z);
      cD.rotation.y = -0.28;
      cD.rotation.z = 0.14;
      this.raiz.add(cI, cD);
    }

    // La Mesa de la Gloria al final de la avenida (z = -20.5)
    const mesaG = new THREE.Group();
    mesaG.position.set(0, -1.62, -20.5);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.75, 1.45, 8), matPiedra);
    pedestal.position.y = 0.725;
    const aro = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.12, 8), matLaton);
    aro.position.y = 1.48;
    const hazMesa = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 5.2),
      new THREE.MeshBasicMaterial({
        map: texturaHalo(),
        color: 0x62d0ff,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    hazMesa.position.set(0, 3.6, 0);
    const matOro1 = new THREE.MeshStandardMaterial({ map: texturaNaipe('D', 1), roughness: 0.45 });
    this.cartaGloria = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.38, 0.05), [matLaton, matLaton, matLaton, matLaton, matOro1, matOro1]);
    this.cartaGloria.position.set(0, 2.55, 0);
    this.luzMesa = new THREE.PointLight(0x74d8ff, 18, 16, 1.3);
    this.luzMesa.position.set(0, 3.2, 0.6);
    mesaG.add(pedestal, aro, hazMesa, this.cartaGloria, this.luzMesa);
    this.raiz.add(mesaG);

    // Colosal SOL DE MAYO en el horizonte (z = -33)
    const sol = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 17),
      new THREE.MeshBasicMaterial({ map: texturaSolDeMayo(), transparent: true, alphaTest: 0.05 }),
    );
    sol.position.set(0, 7.6, -33);
    this.coronaSol = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texturaHalo(),
        color: 0x62d0ff,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.coronaSol.position.set(0, 7.6, -33.2);
    this.coronaSol.scale.set(22, 22, 1);
    this.haloSol = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texturaHalo(),
        color: 0xffe26a,
        transparent: true,
        opacity: 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.haloSol.position.set(0, 7.6, -33.4);
    this.haloSol.scale.set(26, 26, 1);
    this.raiz.add(sol, this.coronaSol, this.haloSol);

    // Chispas doradas y papelitos celestes flotando
    this.posParticulas = new Float32Array(this.nParticulas * 3);
    for (let i = 0; i < this.nParticulas; i++) {
      this.posParticulas[i * 3] = (Math.random() - 0.5) * 11;
      this.posParticulas[i * 3 + 1] = -0.5 + Math.random() * 6.5;
      this.posParticulas[i * 3 + 2] = 6 - Math.random() * 30;
    }
    const geoP = new THREE.BufferGeometry();
    geoP.setAttribute('position', new THREE.BufferAttribute(this.posParticulas, 3));
    this.particulas = new THREE.Points(
      geoP,
      new THREE.PointsMaterial({
        size: 0.16,
        map: texturaParticula(),
        color: 0xffe07d,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.raiz.add(this.particulas);

    this.raiz.visible = false;
    escenaThree.add(this.raiz);
  }

  private pulsoSuave = 0;

  ponerVisible(si: boolean): void {
    this.raiz.visible = si;
  }

  actualizar(dt: number, quieto: boolean, reloj: number): void {
    if (!this.raiz.visible) return;
    const arm = armoniaActual();
    const pulsoMeta = !quieto && arm && (arm.paso === 0 || arm.paso === 6 || arm.paso === 12) ? 0.35 : 0;
    this.pulsoSuave += (pulsoMeta - this.pulsoSuave) * (1 - Math.exp(-10 * Math.max(0.001, dt)));
    const pulso = this.pulsoSuave;

    if (!quieto) {
      this.cartaGloria.rotation.y += dt * 0.9;
      this.cartaGloria.position.y = 2.55 + Math.sin(reloj * 2.2) * 0.12;
      const escCorona = 22 + pulso * 2.0 + Math.sin(reloj * 1.4) * 0.6;
      this.coronaSol.scale.set(escCorona, escCorona, 1);
      const escHalo = 26 + pulso * 2.5 + Math.sin(reloj * 1.8) * 0.8;
      this.haloSol.scale.set(escHalo, escHalo, 1);
      this.luzMesa.intensity = 17 + pulso * 8 + Math.sin(reloj * 3) * 1.5;

      this.banderines.forEach((b, i) => {
        b.rotation.z = Math.sin(reloj * 2.8 + i * 0.6) * 0.14;
      });

      const attr = this.particulas.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < this.nParticulas; i++) {
        const ix = i * 3;
        this.posParticulas[ix + 1] += dt * (0.28 + (i % 3) * 0.08);
        if (this.posParticulas[ix + 1] > 6.2) this.posParticulas[ix + 1] = -0.8;
      }
      attr.needsUpdate = true;
    }
  }
}
