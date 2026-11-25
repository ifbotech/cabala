// Cuarto completo de La Pulpería en 3D caminable: paredes de madera, 6 rincones interactivos y Puerta Doble con resplandor del Sol de Mayo.
import * as THREE from 'three';
import { PALOS } from '../../rules/cartas';
import { AMULETOS } from '../../rules/amuletos';
import { AUMENTOS } from '../../rules/aumentos';
import { MAZOS } from '../../rules/mazos';
import { MEJORAS, type MejoraId, type Perfil } from '../../rules/perfil';
import { glorias as listaGlorias } from '../almacen';
import { armoniaActual } from '../musica';
import { amuletoMapa, aumentoMapa } from '../pixel/iconos';
import {
  texturaCera,
  texturaCuero,
  texturaDorso,
  texturaHalo,
  texturaIconoMapa,
  texturaLaton,
  texturaMadera,
  texturaMantelAltar,
  texturaNaipe,
  texturaOroMoneda,
  texturaPaginaCronica,
  texturaPano,
  texturaPared,
  texturaPiedra,
  texturaRey,
  texturaVinilo,
} from './texturas';
import { VoxelGrid, construirMallaVoxel } from './voxel';

export type RinconId = 'mesa' | 'altar' | 'coleccion' | 'fogon' | 'cronica' | 'ajustes' | 'puerta';

interface ZonaRincon {
  id: RinconId;
  pos: THREE.Vector3;
  mira: THREE.Vector3;
  malla: THREE.Object3D;
  baliza: THREE.Mesh;
}

interface VelaAltar {
  id: MejoraId;
  cera: THREE.Mesh;
  llama: THREE.Mesh;
  halo: THREE.Sprite;
  baseY: number;
}

export class CuartoPulperia3D {
  readonly raiz = new THREE.Group();
  private readonly zonas: ZonaRincon[] = [];
  private readonly velasAltar: VelaAltar[] = [];
  private readonly llamasFogon: THREE.Mesh[] = [];
  private readonly chispasFogon: THREE.Mesh[] = [];
  private readonly luzFogon: THREE.PointLight;
  private readonly luzAltar: THREE.PointLight;
  private readonly luzPuerta: THREE.PointLight;
  private readonly rendijasPuerta: THREE.Mesh[] = [];
  private readonly cartasGloria: THREE.Mesh[] = [];
  private readonly placasGloria: THREE.Mesh[] = [];
  private pivotePuertaIzq!: THREE.Group;
  private pivotePuertaDer!: THREE.Group;
  private trancaPuerta!: THREE.Mesh;
  private readonly discoFonografo: THREE.Mesh;
  private readonly bocinaFonografo: THREE.Group;
  private llamaCronica!: THREE.Mesh;
  private readonly raycaster = new THREE.Raycaster();
  private readonly vNdc = new THREE.Vector2();
  private readonly vDelta = new THREE.Vector3();

  constructor(escenaThree: THREE.Scene) {
    this.construirEstructura();
    this.construirMesaRincon();
    this.luzAltar = this.construirAltar();
    this.construirParedGloria();
    const fogon = this.construirFogonCuarto();
    this.luzFogon = fogon.luz;
    this.construirCronica();
    const fono = this.construirFonografo();
    this.discoFonografo = fono.disco;
    this.bocinaFonografo = fono.bocina;
    this.luzPuerta = this.construirPuertaDoble();

    this.raiz.visible = false;
    escenaThree.add(this.raiz);
  }

  private registrarZona(
    id: RinconId,
    pos: [number, number, number],
    mira: [number, number, number],
    malla: THREE.Object3D,
    balizaPos: [number, number, number],
  ): void {
    const baliza = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055, 0),
      new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: 0.58 }),
    );
    baliza.position.set(...balizaPos);
    this.raiz.add(baliza);
    this.zonas.push({
      id,
      pos: new THREE.Vector3(...pos),
      mira: new THREE.Vector3(...mira),
      malla,
      baliza,
    });
  }

  private construirEstructura(): void {
    const matPiso = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.9, metalness: 0.04 });
    const matPared = new THREE.MeshStandardMaterial({ map: texturaPared(), roughness: 0.94 });
    const matViga = new THREE.MeshStandardMaterial({ color: 0x120919, roughness: 0.96 });

    const piso = new THREE.Mesh(new THREE.BoxGeometry(24, 0.25, 22), matPiso);
    piso.position.set(0, -1.75, 0);
    piso.receiveShadow = true;
    this.raiz.add(piso);

    const paredFondo = new THREE.Mesh(new THREE.BoxGeometry(22, 8.4, 0.3), matPared);
    paredFondo.position.set(0, 2.3, -8.35);
    const paredFrente = new THREE.Mesh(new THREE.BoxGeometry(22, 8.4, 0.3), matPared);
    paredFrente.position.set(0, 2.3, 11.4);
    const paredIzq = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8.4, 20.5), matPared);
    paredIzq.position.set(-10.4, 2.3, 1.5);
    const paredDer = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8.4, 20.5), matPared);
    paredDer.position.set(10.4, 2.3, 1.5);
    this.raiz.add(paredFondo, paredFrente, paredIzq, paredDer);

    // Vigas oscuras del techo
    for (const z of [-6, -2, 2, 6]) {
      const viga = new THREE.Mesh(new THREE.BoxGeometry(21, 0.32, 0.36), matViga);
      viga.position.set(0, 6.2, z);
      this.raiz.add(viga);
    }
  }

  private construirMesaRincon(): void {
    const grupo = new THREE.Group();
    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.86 });
    const matPano = new THREE.MeshStandardMaterial({ map: texturaPano(), roughness: 0.92 });
    const matSilla = new THREE.MeshStandardMaterial({ color: 0x1e1120, roughness: 0.88 });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.65, roughness: 0.38 });

    const tablero = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.22, 3.0), matMadera);
    tablero.position.set(0, -0.09, 0);
    tablero.castShadow = true;
    tablero.receiveShadow = true;
    grupo.add(tablero);

    const pano = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.04, 2.1), matPano);
    pano.position.set(0, 0.04, 0);
    pano.receiveShadow = true;
    grupo.add(pano);

    const geoPata = new THREE.BoxGeometry(0.24, 1.52, 0.24);
    for (const px of [-2.05, 2.05]) {
      for (const pz of [-1.15, 1.15]) {
        const pata = new THREE.Mesh(geoPata, matMadera);
        pata.position.set(px, -0.88, pz);
        pata.castShadow = true;
        grupo.add(pata);
      }
    }

    const crearSilla = (zPos: number, rotY: number): void => {
      const s = new THREE.Group();
      s.position.set(0, -1.62, zPos);
      s.rotation.y = rotY;
      const asiento = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.9), matSilla);
      asiento.position.y = 0.82;
      const respaldo = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.1), matSilla);
      respaldo.position.set(0, 1.38, -0.4);
      s.add(asiento, respaldo);
      for (const sx of [-0.38, 0.38]) {
        for (const sz of [-0.36, 0.36]) {
          const ps = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), matSilla);
          ps.position.set(sx, 0.4, sz);
          s.add(ps);
        }
      }
      grupo.add(s);
    };
    crearSilla(-2.1, Math.PI);
    crearSilla(2.1, 0.18);

    // 5 cartas con los 5 Dorsos en abanico sobre el paño
    MAZOS.forEach((m, i) => {
      const matD = new THREE.MeshStandardMaterial({ map: texturaDorso(m), roughness: 0.62 });
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.025, 0.76), [
        matLaton,
        matLaton,
        matD,
        matLaton,
        matLaton,
        matLaton,
      ]);
      const ang = (i - 2) * 0.14;
      c.position.set((i - 2) * 0.56, 0.08 + i * 0.002, 0.12 + Math.abs(i - 2) * 0.06);
      c.rotation.y = -ang;
      grupo.add(c);
    });

    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.4, 3.0),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hit.position.set(0, 0.4, 0);
    grupo.add(hit);
    this.raiz.add(grupo);
    this.registrarZona('mesa', [0, 3.1, 5.2], [0, 1.0, 0], grupo, [3.6, 1.05, 0.4]);
  }

  private construirAltar(): THREE.PointLight {
    const g = new THREE.Group();
    g.position.set(-7.4, -1.62, -2.5);

    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.86 });
    const matPiedra = new THREE.MeshStandardMaterial({ map: texturaPiedra(), roughness: 0.92 });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.68, roughness: 0.35 });
    const matCera = new THREE.MeshStandardMaterial({ map: texturaCera(), color: 0xf0dec0, roughness: 0.84 });
    const matMantel = new THREE.MeshStandardMaterial({ map: texturaMantelAltar(), roughness: 0.88 });
    const matPoroto = new THREE.MeshStandardMaterial({ color: 0x8f1838, emissive: 0x3b0816, roughness: 0.36 });

    // Zócalo escalonado de piedra y cuerpo de madera tallada con 4 pilares esquineros
    const zocalo = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.22, 3.45), matPiedra);
    zocalo.position.y = 0.11;
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.24, 3.05), matMadera);
    cuerpo.position.y = 0.84;
    cuerpo.castShadow = true;
    cuerpo.receiveShadow = true;
    const losa = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.16, 3.36), matPiedra);
    losa.position.y = 1.54;
    losa.castShadow = true;
    losa.receiveShadow = true;
    g.add(zocalo, cuerpo, losa);

    for (const px of [-0.68, 0.68]) {
      for (const pz of [-1.52, 1.52]) {
        const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.32, 0.18), matMadera);
        pilar.position.set(px, 0.86, pz);
        const remate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), matLaton);
        remate.position.set(px, 1.58, pz);
        g.add(pilar, remate);
      }
    }

    // Mantel ritual colgando hacia el centro del cuarto (+X)
    const mantelTop = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.03, 1.55), matMantel);
    mantelTop.position.set(0.15, 1.63, 0);
    const mantelFrente = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 1.48), matMantel);
    mantelFrente.position.set(0.84, 1.28, 0);
    g.add(mantelTop, mantelFrente);

    // Cáliz / cuenco de ofrendas en latón sobre pedestal + 8 Porotos carmesí
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.16, 8), matLaton);
    pedestal.position.set(0.26, 1.71, 0);
    const cuenco = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.16, 0.18, 8), matLaton);
    cuenco.position.set(0.26, 1.84, 0);
    g.add(pedestal, cuenco);

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = i === 0 ? 0 : 0.12 + (i % 2) * 0.06;
      const poroto = new THREE.Mesh(new THREE.SphereGeometry(0.052, 6, 5), matPoroto);
      poroto.scale.set(1.3, 0.85, 0.9);
      poroto.position.set(0.26 + Math.cos(a) * r, 1.91 + (i % 2) * 0.02, Math.sin(a) * r);
      g.add(poroto);
    }

    // 7 velas físicas con platillos de latón
    MEJORAS.forEach((m, i) => {
      const zOff = (i - 3) * 0.42;
      const xOff = i % 2 === 0 ? -0.34 : -0.08;
      const platillo = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.03, 8), matLaton);
      platillo.position.set(xOff, 1.63, zOff);
      const cera = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.078, 1, 7), matCera);
      cera.position.set(xOff, 1.64, zOff);
      const llama = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.055, 0),
        new THREE.MeshBasicMaterial({ color: 0xffb338 }),
      );
      llama.scale.set(0.7, 1.6, 0.7);
      llama.visible = false;
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texturaHalo(),
          color: 0xffaa33,
          transparent: true,
          opacity: 0.46,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.scale.set(0.62, 0.62, 1);
      halo.visible = false;
      g.add(platillo, cera, llama, halo);
      this.velasAltar.push({ id: m.id, cera, llama, halo, baseY: 1.64 });
    });

    const luz = new THREE.PointLight(0xff9c38, 6.5, 9, 1.4);
    luz.position.set(0.45, 2.55, 0);
    g.add(luz);

    this.raiz.add(g);
    this.registrarZona('altar', [-4.4, 2.7, -1.5], [-7.4, 1.15, -2.5], g, [-6.6, 1.4, -2.5]);
    return luz;
  }

  private construirParedGloria(): void {
    const g = new THREE.Group();
    g.position.set(5.6, 2.35, -8.05);

    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.85 });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.65, roughness: 0.38 });

    const tablero = new THREE.Mesh(new THREE.BoxGeometry(6.4, 4.1, 0.14), matMadera);
    g.add(tablero);

    // Marco perimetral de latón
    const marcoSup = new THREE.Mesh(new THREE.BoxGeometry(6.62, 0.12, 0.2), matLaton);
    marcoSup.position.set(0, 2.08, 0.02);
    const marcoInf = new THREE.Mesh(new THREE.BoxGeometry(6.62, 0.12, 0.2), matLaton);
    marcoInf.position.set(0, -2.08, 0.02);
    const marcoIzq = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.28, 0.2), matLaton);
    marcoIzq.position.set(-3.25, 0, 0.02);
    const marcoDer = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.28, 0.2), matLaton);
    marcoDer.position.set(3.25, 0, 0.02);
    g.add(marcoSup, marcoInf, marcoIzq, marcoDer);

    // 5 Dorsos en fila superior (izquierda)
    MAZOS.forEach((m, i) => {
      const matD = new THREE.MeshStandardMaterial({ map: texturaDorso(m), roughness: 0.62 });
      const carta = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.94, 0.04), [
        matLaton,
        matLaton,
        matLaton,
        matLaton,
        matD,
        matLaton,
      ]);
      carta.position.set(-2.55 + i * 0.84, 1.28, 0.09);
      g.add(carta);
    });

    // 4 Reyes Malvados en fila media (retratos reales enmarcados en latón, sin carta 12 ni palo repetido)
    PALOS.forEach((palo, i) => {
      const matR = new THREE.MeshStandardMaterial({ map: texturaRey(palo, 'calma'), roughness: 0.56 });
      const cuadro = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.05), [
        matLaton,
        matLaton,
        matLaton,
        matLaton,
        matR,
        matLaton,
      ]);
      cuadro.position.set(-2.2 + i * 0.92, 0.08, 0.09);
      g.add(cuadro);
    });

    const luz = new THREE.PointLight(0xffd27a, 14, 10, 1.35);
    luz.position.set(0, 0.9, 2.2);
    g.add(luz);

    // Fila inferior izquierda: Cartas de Gloria clavadas (hasta 4)
    for (let i = 0; i < 4; i++) {
      const matG = new THREE.MeshStandardMaterial({ map: texturaNaipe('D', 1), roughness: 0.55 });
      const cg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.84, 0.04), [
        matLaton,
        matLaton,
        matLaton,
        matLaton,
        matG,
        matLaton,
      ]);
      cg.position.set(-2.2 + i * 0.92, -1.16, 0.1);
      const clavo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), matLaton);
      clavo.rotation.x = Math.PI / 2;
      clavo.position.set(0, 0.36, 0.03);
      cg.add(clavo);
      cg.visible = false;
      g.add(cg);
      this.cartasGloria.push(cg);
    }

    // Columna derecha (2 × 4): Amuletos y Cábalas descubiertas clavadas en madera
    for (let i = 0; i < 8; i++) {
      const col = i % 2;
      const fila = Math.floor(i / 2);
      const matP = new THREE.MeshStandardMaterial({ roughness: 0.62 });
      const placa = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.64, 0.04), [
        matLaton,
        matLaton,
        matLaton,
        matLaton,
        matP,
        matLaton,
      ]);
      placa.position.set(1.8 + col * 0.84, 1.24 - fila * 0.84, 0.1);
      const tachuela = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), matLaton);
      tachuela.rotation.x = Math.PI / 2;
      tachuela.position.set(0, 0.25, 0.03);
      placa.add(tachuela);
      placa.visible = false;
      g.add(placa);
      this.placasGloria.push(placa);
    }

    this.raiz.add(g);
    this.registrarZona('coleccion', [4.6, 2.55, -3.5], [5.6, 2.35, -8.0], g, [5.6, 4.45, -7.7]);
  }

  private construirFogonCuarto(): { luz: THREE.PointLight } {
    const g = new THREE.Group();
    g.position.set(-6.4, -1.62, -7.2);

    const matPiedra = new THREE.MeshStandardMaterial({ map: texturaPiedra(), roughness: 0.92 });
    const matLena = new THREE.MeshStandardMaterial({ color: 0x261512, roughness: 0.95 });
    const matBrasa = new THREE.MeshStandardMaterial({
      color: 0x3a1208,
      emissive: 0xff4512,
      emissiveIntensity: 1.35,
      roughness: 0.7,
    });

    // Arco de hogar de piedra contra la pared
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 1.6), matPiedra);
    base.position.y = 0.15;
    const pilarL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.2, 1.2), matPiedra);
    pilarL.position.set(-1.1, 1.2, -0.15);
    const pilarR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.2, 1.2), matPiedra);
    pilarR.position.set(1.1, 1.2, -0.15);
    const dintel = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.55, 1.3), matPiedra);
    dintel.position.set(0, 2.45, -0.15);
    g.add(base, pilarL, pilarR, dintel);

    const brasas = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.72, 0.08, 10), matBrasa);
    brasas.position.set(0, 0.34, 0.1);
    g.add(brasas);

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI + 0.3;
      const leno = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.15, 6), matLena);
      leno.rotation.z = Math.PI / 2 - 0.18;
      leno.rotation.y = a;
      leno.position.set(Math.cos(a) * 0.1, 0.44, 0.1 + Math.sin(a) * 0.1);
      g.add(leno);
    }

    const specs = [
      { r: 0.32, h: 0.85, c: 0xff4800, y: 0.75, op: 0.46, tr: true },
      { r: 0.21, h: 0.65, c: 0xffa81e, y: 0.7, op: 0.78, tr: true },
      { r: 0.11, h: 0.42, c: 0xfff5a8, y: 0.62, op: 1, tr: false },
    ];
    for (const sp of specs) {
      const ll = new THREE.Mesh(
        new THREE.OctahedronGeometry(sp.r, 0),
        new THREE.MeshBasicMaterial({ color: sp.c, transparent: sp.tr, opacity: sp.op, depthWrite: !sp.tr }),
      );
      ll.scale.set(1, sp.h / sp.r, 1);
      ll.position.set(0, sp.y, 0.1);
      g.add(ll);
      this.llamasFogon.push(ll);
    }

    for (let i = 0; i < 5; i++) {
      const ch = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.04),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffd166 : 0xff7b00 }),
      );
      ch.position.set(Math.cos(i * 1.4) * 0.22, 0.9 + i * 0.16, 0.1 + Math.sin(i * 1.8) * 0.16);
      g.add(ch);
      this.chispasFogon.push(ch);
    }

    const luz = new THREE.PointLight(0xff6a1a, 12, 10, 1.4);
    luz.position.set(0, 1.2, 0.6);
    g.add(luz);

    this.raiz.add(g);
    this.registrarZona('fogon', [-4.4, 2.4, -4.0], [-6.4, 0.8, -7.2], g, [-6.4, 1.9, -6.5]);
    return { luz };
  }

  private construirCronica(): void {
    const g = new THREE.Group();
    g.position.set(7.2, -1.62, 1.2);

    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.84 });
    const matCuero = new THREE.MeshStandardMaterial({ map: texturaCuero(), roughness: 0.8 });
    const matPagina = new THREE.MeshStandardMaterial({ map: texturaPaginaCronica(), roughness: 0.78 });
    const matHojas = new THREE.MeshStandardMaterial({ color: 0xc9b998, roughness: 0.84 });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.68, roughness: 0.34 });
    const matCera = new THREE.MeshStandardMaterial({ map: texturaCera(), color: 0xf0dec0, roughness: 0.84 });
    const matCarmesi = new THREE.MeshStandardMaterial({ color: 0x8c122e, roughness: 0.72 });

    // Escritorio tallado con 4 patas torneadas, travesaño y tablero con esquineros de latón
    const tablero = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 2.2), matMadera);
    tablero.position.y = 1.48;
    tablero.castShadow = true;
    tablero.receiveShadow = true;
    const faja = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.22, 1.92), matMadera);
    faja.position.y = 1.32;
    g.add(tablero, faja);

    for (const px of [-0.62, 0.62]) {
      for (const pz of [-0.92, 0.92]) {
        const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.055, 1.44, 7), matMadera);
        pata.position.set(px, 0.72, pz);
        pata.castShadow = true;
        const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 7), matLaton);
        pie.position.set(px, 0.06, pz);
        g.add(pata, pie);
      }
    }
    const travesano = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 1.84), matMadera);
    travesano.position.set(0, 0.42, 0);
    g.add(travesano);

    // Atril inclinado hacia el jugador (-X) con Gran Libro de Crónicas abierto
    const atril = new THREE.Group();
    atril.position.set(-0.08, 1.58, 0);
    atril.rotation.z = 0.26;
    const baseAtril = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.06, 1.18), matMadera);
    const topeAtril = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 1.18), matLaton);
    topeAtril.position.set(-0.4, 0.06, 0);
    const tapa = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.04, 1.08), matCuero);
    tapa.position.set(0, 0.05, 0);
    const bloqueHojas = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.07, 0.98), matHojas);
    bloqueHojas.position.set(0, 0.09, 0);
    const hojaSup = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.02, 0.46), matPagina);
    hojaSup.position.set(0, 0.135, -0.25);
    hojaSup.rotation.x = 0.06;
    const hojaInf = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.02, 0.46), matPagina);
    hojaInf.position.set(0, 0.135, 0.25);
    hojaInf.rotation.x = -0.06;
    const cinta = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.055), matCarmesi);
    cinta.position.set(-0.42, 0.09, 0.06);
    cinta.rotation.z = -0.5;
    atril.add(baseAtril, topeAtril, tapa, bloqueHojas, hojaSup, hojaInf, cinta);
    g.add(atril);

    // Tintero de latón + pluma voxel esculpida
    const tintero = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.105, 0.14, 7), matLaton);
    tintero.position.set(0.28, 1.62, -0.78);
    const gPluma = new VoxelGrid();
    gPluma.curve3D([[0, 0, 0], [2, 6, 1], [4, 13, 2]], 0.7, 0.4, 0xc99c46, 'metal');
    gPluma.box(2, 7, 1, 5, 13, 2, 0xe8dcc4);
    const pluma = construirMallaVoxel(gPluma, 0.026, [0, 0, 0]);
    pluma.position.set(0.28, 1.67, -0.78);
    g.add(tintero, pluma);

    // Candelabro de latón con vela encendida iluminando las páginas abiertas
    const candBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.08, 8), matLaton);
    candBase.position.set(0.24, 1.59, 0.78);
    const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.056, 0.34, 7), matCera);
    vela.position.set(0.24, 1.79, 0.78);
    const llama = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.048, 0),
      new THREE.MeshBasicMaterial({ color: 0xffc04a }),
    );
    llama.scale.set(0.7, 1.6, 0.7);
    llama.position.set(0.24, 2.02, 0.78);
    this.llamaCronica = llama;
    const luz = new THREE.PointLight(0xffb44d, 7.5, 8, 1.4);
    luz.position.set(-0.35, 2.45, 0.2);
    g.add(candBase, vela, llama, luz);

    this.raiz.add(g);
    this.registrarZona('cronica', [4.1, 2.6, 1.8], [7.2, 0.7, 1.2], g, [6.6, 1.2, 1.2]);
  }

  private construirFonografo(): { disco: THREE.Mesh; bocina: THREE.Group } {
    const g = new THREE.Group();
    g.position.set(7.2, -1.62, -3.2);

    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.82 });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.72, roughness: 0.3 });
    const matVinilo = new THREE.MeshStandardMaterial({ map: texturaVinilo(), roughness: 0.42, metalness: 0.18 });
    const matOscuro = new THREE.MeshStandardMaterial({ color: 0x1a1222, roughness: 0.75 });

    // Mueble victoriano-rioplatense con zócalo, cuerpo moldurado y manivela lateral
    const zocalo = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.22, 1.48), matMadera);
    zocalo.position.y = 0.11;
    const mueble = new THREE.Mesh(new THREE.BoxGeometry(1.26, 1.24, 1.26), matMadera);
    mueble.position.y = 0.84;
    mueble.castShadow = true;
    mueble.receiveShadow = true;
    const cornisa = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.16, 1.42), matMadera);
    cornisa.position.y = 1.54;
    const rejillaFrente = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.66, 0.78), matOscuro);
    rejillaFrente.position.set(-0.64, 0.86, 0);
    const marcoLaton = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.74, 0.86), matLaton);
    marcoLaton.position.set(-0.625, 0.86, 0);
    g.add(zocalo, mueble, cornisa, marcoLaton, rejillaFrente);

    // Manivela lateral de latón
    const ejeMan = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), matLaton);
    ejeMan.rotation.z = Math.PI / 2;
    ejeMan.position.set(-0.7, 1.15, 0.44);
    const brazoMan = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), matLaton);
    brazoMan.position.set(-0.8, 1.06, 0.44);
    const punoMan = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.14, 6), matMadera);
    punoMan.rotation.z = Math.PI / 2;
    punoMan.position.set(-0.88, 0.96, 0.44);
    g.add(ejeMan, brazoMan, punoMan);

    // Bandeja giratoria de latón + disco de vinilo + brazo fonocaptor
    const plato = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.51, 0.05, 16), matLaton);
    plato.position.set(-0.04, 1.645, 0);
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 18), matVinilo);
    disco.position.set(-0.04, 1.685, 0);
    const pua = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.07, 6), matLaton);
    pua.position.set(-0.04, 1.72, 0);

    const soporteBrazo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.18, 8), matLaton);
    soporteBrazo.position.set(0.32, 1.71, -0.38);
    const brazoTono = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.46), matLaton);
    brazoTono.position.set(0.18, 1.77, -0.18);
    brazoTono.rotation.y = 0.52;
    g.add(plato, disco, pua, soporteBrazo, brazoTono);

    // Bocina acampanada esculpida orientada hacia el jugador (-X)
    const bocina = new THREE.Group();
    bocina.position.set(0.28, 1.98, 0.06);
    const soporteBocina = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.36, 8), matLaton);
    soporteBocina.position.set(0, -0.16, 0);
    const codo = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.46, 8), matLaton);
    codo.rotation.z = 0.55;
    codo.position.set(-0.1, 0.1, 0);
    const campana = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.66, 10, 1, true), matLaton);
    campana.material.side = THREE.DoubleSide;
    campana.position.set(-0.44, 0.38, 0);
    campana.rotation.z = -Math.PI * 0.62;
    const aroCampana = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.032, 6, 12), matLaton);
    aroCampana.rotation.x = Math.PI / 2;
    aroCampana.position.set(0, -0.33, 0);
    campana.add(aroCampana);
    bocina.add(soporteBocina, codo, campana);

    const luz = new THREE.PointLight(0xffbe64, 7.5, 8, 1.4);
    luz.position.set(-0.65, 2.55, 0.2);

    g.add(bocina, luz);
    this.raiz.add(g);
    this.registrarZona('ajustes', [4.2, 2.7, -2.5], [7.2, 1.2, -3.2], g, [6.6, 1.7, -3.2]);
    return { disco, bocina };
  }

  private construirPuertaDoble(): THREE.PointLight {
    const g = new THREE.Group();
    g.position.set(0, -1.62, -8.12);

    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.88 });
    const matHierro = new THREE.MeshStandardMaterial({ color: 0x201c2a, metalness: 0.65, roughness: 0.46 });
    const matLaton = new THREE.MeshStandardMaterial({ map: texturaLaton(), color: 0xc99c46, metalness: 0.65, roughness: 0.38 });
    const matSol = new THREE.MeshBasicMaterial({ color: 0xffe26a });
    const matCeleste = new THREE.MeshBasicMaterial({ color: 0x62d0ff });

    // 3 vigas reales de marco dejando el vano central abierto
    const jambaIzq = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.9, 0.28), matHierro);
    jambaIzq.position.set(-1.98, 2.45, 0);
    const jambaDer = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.9, 0.28), matHierro);
    jambaDer.position.set(1.98, 2.45, 0);
    const dintel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.28, 0.28), matHierro);
    dintel.position.set(0, 4.76, 0);

    // Fondo de portal nocturno celeste-dorado detrás del vano
    const portalFondo = new THREE.Mesh(
      new THREE.PlaneGeometry(3.75, 4.65),
      new THREE.MeshBasicMaterial({ color: 0x0d2142 }),
    );
    portalFondo.position.set(0, 2.35, -0.04);
    const portalHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texturaHalo(),
        color: 0x70d8ff,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    portalHalo.position.set(0, 2.35, -0.01);
    portalHalo.scale.set(4.6, 5.2, 1);

    // Pivotes en bisagras reales para ambas hojas
    const pivoteIzq = new THREE.Group();
    pivoteIzq.position.set(-1.86, 0, 0.08);
    const hojaIzq = new THREE.Mesh(new THREE.BoxGeometry(1.84, 4.55, 0.16), matMadera);
    hojaIzq.position.set(0.92, 2.28, 0);
    pivoteIzq.add(hojaIzq);
    for (const by of [0.85, 3.65]) {
      const bIzq = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.06), matLaton);
      bIzq.position.set(0.14, by, 0.1);
      pivoteIzq.add(bIzq);
    }
    const aldabaIzq = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 10), matLaton);
    aldabaIzq.position.set(1.42, 2.05, 0.12);
    pivoteIzq.add(aldabaIzq);

    const pivoteDer = new THREE.Group();
    pivoteDer.position.set(1.86, 0, 0.08);
    const hojaDer = new THREE.Mesh(new THREE.BoxGeometry(1.84, 4.55, 0.16), matMadera);
    hojaDer.position.set(-0.92, 2.28, 0);
    pivoteDer.add(hojaDer);
    for (const by of [0.85, 3.65]) {
      const bDer = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.06), matLaton);
      bDer.position.set(-0.14, by, 0.1);
      pivoteDer.add(bDer);
    }
    const aldabaDer = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 10), matLaton);
    aldabaDer.position.set(-1.42, 2.05, 0.12);
    pivoteDer.add(aldabaDer);

    this.pivotePuertaIzq = pivoteIzq;
    this.pivotePuertaDer = pivoteDer;

    // Tranca de hierro trabando ambas hojas
    const tranca = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 0.14), matHierro);
    tranca.position.set(0, 2.05, 0.22);
    this.trancaPuerta = tranca;

    // Rendijas celestes y doradas filtrando el resplandor del Sol de Mayo
    const rendijaCentro = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 4.5), matSol);
    rendijaCentro.position.set(0, 2.28, 0.18);
    const rendijaSup = new THREE.Mesh(new THREE.PlaneGeometry(3.75, 0.07), matCeleste);
    rendijaSup.position.set(0, 4.58, 0.18);
    const rendijaInf = new THREE.Mesh(new THREE.PlaneGeometry(3.75, 0.06), matCeleste);
    rendijaInf.position.set(0, 0.04, 0.18);
    this.rendijasPuerta.push(rendijaCentro, rendijaSup, rendijaInf);

    // Derrame de luz celeste sobre las tablas del piso y haz dorado vertical
    const derramePiso = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.4),
      new THREE.MeshBasicMaterial({
        map: texturaHalo(),
        color: 0x70d8ff,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    derramePiso.rotation.x = -Math.PI / 2;
    derramePiso.position.set(0, 0.03, 1.85);

    const hazDorado = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 4.4),
      new THREE.MeshBasicMaterial({
        map: texturaHalo(),
        color: 0xffe26a,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    hazDorado.position.set(0, 2.25, 0.28);

    const luz = new THREE.PointLight(0x8be2ff, 15, 12, 1.3);
    luz.position.set(0, 2.3, 1.1);

    g.add(jambaIzq, jambaDer, dintel, portalFondo, portalHalo, pivoteIzq, pivoteDer, tranca, rendijaCentro, rendijaSup, rendijaInf, derramePiso, hazDorado, luz);
    this.raiz.add(g);
    this.registrarZona('puerta', [0, 2.6, -3.9], [0, 1.9, -8.1], g, [0, 2.6, -7.7]);
    return luz;
  }

  ponerVisible(si: boolean): void {
    this.raiz.visible = si;
  }

  sincronizarPerfil(perfil: Perfil): void {
    let activas = 0;
    for (const v of this.velasAltar) {
      const nv = perfil.altar[v.id] ?? 0;
      const h = nv > 0 ? 0.28 + nv * 0.11 : 0.16;
      v.cera.scale.y = h;
      v.cera.position.y = v.baseY + h * 0.5;
      const encendida = nv > 0;
      v.llama.visible = encendida;
      v.halo.visible = encendida;
      if (encendida) {
        activas++;
        v.llama.position.set(v.cera.position.x, v.baseY + h + 0.07, v.cera.position.z);
        v.halo.position.set(v.cera.position.x, v.baseY + h + 0.08, v.cera.position.z);
      }
    }
    this.luzAltar.intensity = activas > 0 ? 5.2 + activas * 1.4 : 4.8;

    const glorias = listaGlorias;
    this.cartasGloria.forEach((cg, i) => {
      const g = glorias[i];
      if (!g) {
        cg.visible = false;
        return;
      }
      const mats = cg.material as THREE.MeshStandardMaterial[];
      mats[4].map = texturaNaipe(g.palo, g.n);
      mats[4].needsUpdate = true;
      cg.visible = true;
    });

    const piezas: Array<{ clave: string; mapa: readonly string[]; fondo: string }> = [];
    for (const id of AMULETOS) {
      if (perfil.vistos.includes(`a:${id}`) || piezas.length < 4) {
        const m = amuletoMapa(id);
        if (m) piezas.push({ clave: `a:${id}`, mapa: m, fondo: '#1b112c' });
      }
      if (piezas.length >= 4) break;
    }
    for (const id of AUMENTOS) {
      if (perfil.vistos.includes(`u:${id}`) || piezas.length < 8) {
        const m = aumentoMapa(id);
        if (m) piezas.push({ clave: `u:${id}`, mapa: m, fondo: '#241122' });
      }
      if (piezas.length >= 8) break;
    }
    this.placasGloria.forEach((placa, i) => {
      const pz = piezas[i];
      if (!pz) {
        placa.visible = false;
        return;
      }
      const mats = placa.material as THREE.MeshStandardMaterial[];
      mats[4].map = texturaIconoMapa(pz.clave, pz.mapa, pz.fondo);
      mats[4].needsUpdate = true;
      placa.visible = true;
    });

    const abierta = perfil.stats.victorias > 0;
    this.trancaPuerta.visible = !abierta;
    this.pivotePuertaIzq.rotation.y = abierta ? -0.36 : 0;
    this.pivotePuertaDer.rotation.y = abierta ? 0.36 : 0;
  }

  actualizar(dt: number, quieto: boolean, reloj: number, resaltado: RinconId | null, camPos?: THREE.Vector3): void {
    if (!this.raiz.visible) return;
    const arm = armoniaActual();
    const pulso = arm && (arm.paso === 0 || arm.paso === 6 || arm.paso === 12) ? 0.3 : 0;

    if (!quieto) {
      this.discoFonografo.rotation.y += dt * 1.8;
      this.bocinaFonografo.scale.setScalar(1 + pulso * 0.09 + Math.sin(reloj * 4) * 0.015);

      this.luzFogon.intensity = 12 + Math.sin(reloj * 10) * 3.5;
      this.llamasFogon.forEach((ll, i) => {
        ll.scale.y = (i === 0 ? 2.65 : i === 1 ? 3.1 : 3.8) * (1 + Math.sin(reloj * 11 + i) * 0.16);
        ll.rotation.y += dt * 1.4;
      });
      this.chispasFogon.forEach((ch, i) => {
        ch.position.y += dt * (0.4 + (i % 3) * 0.12);
        if (ch.position.y > 1.75) ch.position.y = 0.85;
      });

      this.luzPuerta.intensity = 7 + pulso * 5 + Math.sin(reloj * 2.1) * 1.6;
      if (this.llamaCronica) {
        const sc = 1 + Math.sin(reloj * 13.5) * 0.14 + pulso * 0.25;
        this.llamaCronica.scale.set(0.7, 1.6 * sc, 0.7);
        this.llamaCronica.rotation.y += dt * 1.9;
      }
      this.velasAltar.forEach((v, i) => {
        if (!v.llama.visible) return;
        const sc = 1 + Math.sin(reloj * 12 + i * 1.7) * 0.15 + pulso * 0.22;
        v.llama.scale.set(0.65, 1.55 * sc, 0.65);
        v.halo.scale.setScalar(0.32 + pulso * 0.08 + Math.sin(reloj * 9 + i) * 0.025);
      });
    }

    for (const z of this.zonas) {
      const activo = resaltado === z.id;
      const cerca = camPos ? camPos.distanceTo(z.mira) < 4.6 : false;
      z.baliza.visible = !cerca && (activo || z.id !== 'mesa');
      if (!quieto) {
        z.baliza.rotation.y = reloj * (activo ? 3.5 : 1.4);
        z.baliza.scale.setScalar(activo ? 1.45 + Math.sin(reloj * 8) * 0.18 : 0.85);
      } else {
        z.baliza.scale.setScalar(activo ? 1.35 : 0.85);
      }
      (z.baliza.material as THREE.MeshBasicMaterial).color.setHex(activo ? 0x62d0ff : 0xffd54a);
    }
  }

  raycast(cam: THREE.PerspectiveCamera, ndcX: number, ndcY: number): RinconId | null {
    if (!this.raiz.visible) return null;
    this.vNdc.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.vNdc, cam);
    for (const z of this.zonas) {
      if (this.raycaster.intersectObject(z.malla, true).length > 0 || this.raycaster.intersectObject(z.baliza, false).length > 0) {
        return z.id;
      }
    }
    return null;
  }

  cercano(posCam: THREE.Vector3, dirCam: THREE.Vector3): RinconId | null {
    let mejor: RinconId | null = null;
    let mejorPunt = -Infinity;
    for (const z of this.zonas) {
      this.vDelta.copy(z.mira).sub(posCam);
      const dist = this.vDelta.length();
      if (dist > 6.8) continue;
      this.vDelta.normalize();
      const dot = dirCam.dot(this.vDelta);
      if (dot < 0.72) continue;
      const punt = dot * 3 - dist * 0.25;
      if (punt > mejorPunt) {
        mejorPunt = punt;
        mejor = z.id;
      }
    }
    return mejor;
  }

  poseDe(id: RinconId): { pos: [number, number, number]; mira: [number, number, number] } {
    const z = this.zonas.find((x) => x.id === id);
    if (!z) return { pos: [0, 2.7, 5.4], mira: [0, 2.1, -6.0] };
    return {
      pos: [z.pos.x, z.pos.y, z.pos.z],
      mira: [z.mira.x, z.mira.y, z.mira.z],
    };
  }
}
