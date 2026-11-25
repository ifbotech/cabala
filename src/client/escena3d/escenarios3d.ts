// Escenarios 3D dedicados por pantalla: Mapa sobre cuero, Fogón con brasas, Mostrador de Pulpería y marco de Mazos.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import type { MazoId } from '../../rules/mazos';
import type { Escena } from '../fx/escenas';
import { texturaCuero, texturaDorso, texturaHalo, texturaMadera, texturaNaipe, texturaPiedra } from './texturas';

export type TipoEscenario3D = 'ninguno' | 'mapa' | 'fogon' | 'pulperia' | 'mazos';

interface PedestalNodo {
  grupo: THREE.Group;
  anillo: THREE.Mesh;
  cristal: THREE.Mesh;
}

export class Escenarios3D {
  readonly raiz = new THREE.Group();
  activo: TipoEscenario3D = 'ninguno';

  private readonly mapaGrupo = new THREE.Group();
  private readonly pedestales: PedestalNodo[] = [];
  private readonly fogonGrupo = new THREE.Group();
  private readonly llamas: THREE.Mesh[] = [];
  private readonly chispasFogon: THREE.Mesh[] = [];
  private readonly luzFogon: THREE.PointLight;
  private readonly matBrasa: THREE.MeshStandardMaterial;
  private readonly cartaFogon: THREE.Mesh;
  private readonly matCartaFogonCara: THREE.MeshStandardMaterial;
  private readonly matCartaFogonDorso: THREE.MeshStandardMaterial;
  private readonly pulperiaGrupo = new THREE.Group();
  private readonly mazosGrupo = new THREE.Group();
  private readonly rayo = new THREE.Vector3();
  private mazoCartaFogon: MazoId = 'escoba';
  private claveCartaFogon = '';

  constructor(escenaThree: THREE.Scene) {
    this.construirMapa();
    const fogon = this.construirFogon();
    this.luzFogon = fogon.luz;
    this.matBrasa = fogon.matBrasa;
    this.cartaFogon = fogon.carta;
    this.matCartaFogonCara = fogon.matCara;
    this.matCartaFogonDorso = fogon.matDorso;
    this.construirPulperia();
    this.construirMazos();

    this.mapaGrupo.visible = false;
    this.fogonGrupo.visible = false;
    this.pulperiaGrupo.visible = false;
    this.mazosGrupo.visible = false;

    this.raiz.add(this.mapaGrupo, this.fogonGrupo, this.pulperiaGrupo, this.mazosGrupo);
    escenaThree.add(this.raiz);
  }

  private construirMapa(): void {
    const matCuero = new THREE.MeshStandardMaterial({
      map: texturaCuero(),
      roughness: 0.84,
      metalness: 0.06,
    });
    const matLaton = new THREE.MeshStandardMaterial({ color: 0xc99c46, metalness: 0.72, roughness: 0.34 });
    const matHierro = new THREE.MeshStandardMaterial({ color: 0x2a2434, metalness: 0.65, roughness: 0.45 });

    const tabla = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.07, 6.4), matCuero);
    tabla.position.set(0, 0.04, -0.35);
    tabla.receiveShadow = true;
    this.mapaGrupo.add(tabla);

    // Bordes enrollados de cuero con punteras de latón
    for (const x of [-3.92, 3.92]) {
      const rollo = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 6.56, 10), matCuero);
      rollo.rotation.x = Math.PI / 2;
      rollo.position.set(x, 0.09, -0.35);
      rollo.castShadow = true;
      this.mapaGrupo.add(rollo);

      for (const z of [-3.65, 2.95]) {
        const puntera = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.14, 10), matLaton);
        puntera.rotation.x = Math.PI / 2;
        puntera.position.set(x, 0.09, z);
        this.mapaGrupo.add(puntera);
      }
    }

    // 4 tachuelas de latón en las esquinas
    for (const [tx, tz] of [
      [-3.58, -3.28],
      [3.58, -3.28],
      [-3.58, 2.58],
      [3.58, 2.58],
    ] as const) {
      const tachuela = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.05, 8), matLaton);
      tachuela.position.set(tx, 0.09, tz);
      this.mapaGrupo.add(tachuela);
    }

    // Cofrecito de ruta en esquina superior derecha despejada
    const cofre = new THREE.Group();
    const baseCofre = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.3), matHierro);
    baseCofre.position.y = 0.11;
    baseCofre.castShadow = true;
    const tapaCofre = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.46, 8, 1, false, 0, Math.PI), matLaton);
    tapaCofre.rotation.z = Math.PI / 2;
    tapaCofre.rotation.y = Math.PI / 2;
    tapaCofre.position.y = 0.22;
    const cerradura = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), matLaton);
    cerradura.position.set(0, 0.18, 0.16);
    cofre.add(baseCofre, tapaCofre, cerradura);
    cofre.position.set(3.25, 0.07, -2.35);
    cofre.rotation.y = -0.32;
    this.mapaGrupo.add(cofre);

    // Rosa de los vientos en latón en esquina inferior izquierda despejada
    const brujula = new THREE.Group();
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 6, 16), matLaton);
    aro.rotation.x = Math.PI / 2;
    const aguja = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), matLaton);
    aguja.scale.set(0.45, 0.25, 2.2);
    aguja.position.y = 0.02;
    brujula.add(aro, aguja);
    brujula.position.set(-3.2, 0.09, 2.2);
    brujula.rotation.y = 0.45;
    this.mapaGrupo.add(brujula);

    // Pool de 6 pedestales iluminados para nodos activos / abiertos del mapa
    for (let i = 0; i < 6; i++) {
      const grupo = new THREE.Group();
      const anillo = new THREE.Mesh(
        new THREE.TorusGeometry(0.46, 0.036, 6, 20),
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.9 }),
      );
      anillo.rotation.x = Math.PI / 2;
      const cristal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.09, 0),
        new THREE.MeshStandardMaterial({
          color: 0xffd166,
          emissive: 0xff9f1c,
          emissiveIntensity: 0.85,
          metalness: 0.4,
          roughness: 0.25,
        }),
      );
      cristal.position.set(0.34, 0.28, -0.18);
      grupo.add(anillo, cristal);
      grupo.visible = false;
      this.mapaGrupo.add(grupo);
      this.pedestales.push({ grupo, anillo, cristal });
    }
  }

  private construirFogon(): {
    luz: THREE.PointLight;
    matBrasa: THREE.MeshStandardMaterial;
    carta: THREE.Mesh;
    matCara: THREE.MeshStandardMaterial;
    matDorso: THREE.MeshStandardMaterial;
  } {
    const matPiedra = new THREE.MeshStandardMaterial({
      map: texturaPiedra(),
      roughness: 0.92,
      metalness: 0.05,
    });
    const matLena = new THREE.MeshStandardMaterial({ color: 0x261512, roughness: 0.95 });
    const matBrasa = new THREE.MeshStandardMaterial({
      color: 0x3a1208,
      emissive: 0xff4512,
      emissiveIntensity: 1.35,
      roughness: 0.7,
    });

    const centro = new THREE.Group();
    centro.position.set(0, 0.02, 0.25);

    // 9 piedras facetadas formando el aro del fogón
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const piedra = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24 + (i % 2) * 0.04, 0), matPiedra);
      piedra.position.set(Math.cos(a) * 0.88, 0.14, Math.sin(a) * 0.76);
      piedra.rotation.set(i * 0.7, a, i * 0.4);
      piedra.scale.set(1.15, 0.72, 1.05);
      piedra.castShadow = true;
      piedra.receiveShadow = true;
      centro.add(piedra);
    }

    // Lecho vivo de brasas
    const brasas = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.74, 0.08, 12), matBrasa);
    brasas.position.y = 0.04;
    centro.add(brasas);

    // 4 leños cruzados carbonizados
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI + 0.35;
      const leno = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 1.28, 7), matLena);
      leno.rotation.z = Math.PI / 2 - 0.18;
      leno.rotation.y = a;
      leno.position.set(Math.cos(a) * 0.1, 0.14 + (i % 2) * 0.05, Math.sin(a) * 0.1);
      leno.castShadow = true;
      centro.add(leno);
    }

    // 3 capas concéntricas de llama translúcida para que el núcleo dorado brille por dentro + 2 lenguas laterales
    const capaSpecs = [
      { radio: 0.35, alto: 0.88, color: 0xff4800, y: 0.46, opacity: 0.44, transparent: true },
      { radio: 0.23, alto: 0.68, color: 0xffa81e, y: 0.42, opacity: 0.78, transparent: true },
      { radio: 0.12, alto: 0.44, color: 0xfff5a8, y: 0.33, opacity: 1, transparent: false },
    ];
    for (const sp of capaSpecs) {
      const llama = new THREE.Mesh(
        new THREE.OctahedronGeometry(sp.radio, 0),
        new THREE.MeshBasicMaterial({
          color: sp.color,
          transparent: sp.transparent,
          opacity: sp.opacity,
          depthWrite: !sp.transparent,
        }),
      );
      llama.scale.set(1, sp.alto / sp.radio, 1);
      llama.position.set(0, sp.y, 0);
      centro.add(llama);
      this.llamas.push(llama);
    }

    for (const [lx, ly, lz, rotZ] of [
      [-0.18, 0.34, 0.04, 0.24],
      [0.18, 0.32, -0.02, -0.22],
    ] as const) {
      const lengua = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14, 0),
        new THREE.MeshBasicMaterial({
          color: 0xff6e14,
          transparent: true,
          opacity: 0.68,
          depthWrite: false,
        }),
      );
      lengua.scale.set(0.85, 2.6, 0.85);
      lengua.position.set(lx, ly, lz);
      lengua.rotation.z = rotZ;
      centro.add(lengua);
      this.llamas.push(lengua);
    }

    // 6 chispas pixel-art flotando sobre el fuego
    for (let i = 0; i < 6; i++) {
      const chispa = new THREE.Mesh(
        new THREE.BoxGeometry(0.036, 0.036, 0.036),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffd166 : 0xff7b00 }),
      );
      chispa.position.set(Math.cos(i * 1.4) * 0.24, 0.65 + (i / 6) * 0.68, Math.sin(i * 1.9) * 0.2);
      centro.add(chispa);
      this.chispasFogon.push(chispa);
    }

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texturaHalo(),
        color: 0xff8b2e,
        transparent: true,
        opacity: 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    halo.position.set(0, 0.58, 0);
    halo.scale.set(2.1, 2.1, 1);
    centro.add(halo);

    const luz = new THREE.PointLight(0xff6a1a, 20, 14, 1.35);
    luz.position.set(0, 0.88, 0.1);
    centro.add(luz);

    // Carta calentándose sobre las llamas (se muestra cuando .fogon .fuego está abierto)
    const matCara = new THREE.MeshStandardMaterial({
      map: texturaNaipe('D', 12),
      emissive: 0xff621a,
      emissiveIntensity: 0.22,
      roughness: 0.55,
    });
    const matDorso = new THREE.MeshStandardMaterial({
      map: texturaDorso('escoba'),
      roughness: 0.65,
    });
    const matBorde = new THREE.MeshStandardMaterial({ color: 0xd8c7a8, roughness: 0.75 });
    const carta = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.2, 0.03), [
      matBorde,
      matBorde,
      matBorde,
      matBorde,
      matCara,
      matDorso,
    ]);
    carta.position.set(0, 1.52, 0.08);
    carta.rotation.x = -0.22;
    carta.visible = false;
    centro.add(carta);

    this.fogonGrupo.add(centro);
    return { luz, matBrasa, carta, matCara, matDorso };
  }

  private construirPulperia(): void {
    const matMadera = new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.82 });
    const matLaton = new THREE.MeshStandardMaterial({ color: 0xc99c46, metalness: 0.72, roughness: 0.35 });
    const matCera = new THREE.MeshStandardMaterial({
      color: 0xf4e3c1,
      emissive: 0x6b3a12,
      emissiveIntensity: 0.45,
      roughness: 0.62,
    });
    const matOro = new THREE.MeshStandardMaterial({ color: 0xf5c542, metalness: 0.78, roughness: 0.28 });

    // Barra de mostrador al fondo, detrás del puesto
    const barra = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.22, 0.92), matMadera);
    barra.position.set(0, 0.11, -2.25);
    barra.receiveShadow = true;
    barra.castShadow = true;
    this.pulperiaGrupo.add(barra);

    for (const x of [-3.2, 0, 3.2]) {
      const mensula = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.96), matLaton);
      mensula.position.set(x, 0.1, -2.25);
      this.pulperiaGrupo.add(mensula);
    }

    // Velas bajas en el primer plano despejado de la mesa
    for (const [vx, vz, vh] of [
      [-4.2, 2.25, 0.44],
      [4.1, 2.15, 0.36],
    ] as const) {
      const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, vh, 8), matCera);
      vela.position.set(vx, vh * 0.5, vz);
      const llama = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.065, 0),
        new THREE.MeshBasicMaterial({ color: 0xffa733 }),
      );
      llama.scale.set(0.65, 1.55, 0.65);
      llama.position.set(vx, vh + 0.08, vz);
      this.pulperiaGrupo.add(vela, llama);
    }

    // Pilas de monedas doradas sobre la mesa en los flancos
    for (const [mx, mz, mh] of [
      [-3.65, 2.45, 0.18],
      [-3.42, 2.52, 0.12],
      [3.6, 2.35, 0.22],
    ] as const) {
      const pila = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, mh, 10), matOro);
      pila.position.set(mx, mh * 0.5, mz);
      this.pulperiaGrupo.add(pila);
    }

    // Dos botellas de vidrio verde y ámbar en los flancos
    const botellas: Array<[number, number, number]> = [
      [-4.55, 1.85, 0x2a8c58],
      [4.55, 1.85, 0xc97422],
    ];
    for (const [bx, bz, col] of botellas) {
      const matVidrio = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.22,
        metalness: 0.14,
        transparent: true,
        opacity: 0.86,
      });
      const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.54, 10), matVidrio);
      cuerpo.position.set(bx, 0.27, bz);
      const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, 0.24, 8), matVidrio);
      cuello.position.set(bx, 0.66, bz);
      this.pulperiaGrupo.add(cuerpo, cuello);
    }
  }

  private construirMazos(): void {
    const matLaton = new THREE.MeshStandardMaterial({ color: 0xc99c46, metalness: 0.7, roughness: 0.36 });
    const matPoroto = new THREE.MeshStandardMaterial({ color: 0x3b1f14, roughness: 0.68 });
    const matOro = new THREE.MeshStandardMaterial({ color: 0xf5c542, metalness: 0.78, roughness: 0.28 });
    const matCera = new THREE.MeshStandardMaterial({
      color: 0xf4e3c1,
      emissive: 0x6b3a12,
      emissiveIntensity: 0.45,
      roughness: 0.62,
    });

    // Cuenco con porotos de Truco a la izquierda de JUGAR
    const cuenco = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.2, 0.14, 12), matLaton);
    cuenco.position.set(-3.0, 0.07, 2.35);
    cuenco.castShadow = true;
    this.mazosGrupo.add(cuenco);

    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const poroto = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), matPoroto);
      poroto.scale.set(1.3, 0.8, 0.9);
      poroto.position.set(-3.0 + Math.cos(a) * 0.12, 0.14, 2.35 + Math.sin(a) * 0.12);
      this.mazosGrupo.add(poroto);
    }

    // Vela corta encendida y pila de monedas a la derecha de JUGAR
    const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.38, 8), matCera);
    vela.position.set(3.05, 0.19, 2.35);
    const llama = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.06, 0),
      new THREE.MeshBasicMaterial({ color: 0xffaa38 }),
    );
    llama.scale.set(0.65, 1.55, 0.65);
    llama.position.set(3.05, 0.46, 2.35);
    this.mazosGrupo.add(vela, llama);

    for (const [mx, mz, mh] of [
      [2.68, 2.42, 0.2],
      [3.38, 2.46, 0.13],
    ] as const) {
      const pila = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, mh, 10), matOro);
      pila.position.set(mx, mh * 0.5, mz);
      this.mazosGrupo.add(pila);
    }
  }

  ponerEscena(escena: Escena, pantalla?: string): void {
    let nuevo: TipoEscenario3D = 'ninguno';
    if (pantalla === 'mapa' || escena === 'mapa') nuevo = 'mapa';
    else if (pantalla === 'fogon' || escena === 'fogon') nuevo = 'fogon';
    else if (pantalla === 'pulperia' || escena === 'pulperia') nuevo = 'pulperia';
    else if (pantalla === 'mazo') nuevo = 'mazos';

    this.activo = nuevo;
    this.mapaGrupo.visible = nuevo === 'mapa';
    this.fogonGrupo.visible = nuevo === 'fogon';
    this.pulperiaGrupo.visible = nuevo === 'pulperia';
    this.mazosGrupo.visible = nuevo === 'mazos';
  }

  actualizar(
    cam: THREE.PerspectiveCamera,
    dt: number,
    quieto: boolean,
    reloj: number,
    mazoId: MazoId,
    fogonCarta?: { palo: Palo; rango: number },
  ): void {
    if (this.activo === 'mapa') {
      this.sincronizarNodosMapa(cam, quieto, reloj);
    } else if (this.activo === 'fogon') {
      if (mazoId !== this.mazoCartaFogon) {
        this.mazoCartaFogon = mazoId;
        this.matCartaFogonDorso.map = texturaDorso(mazoId);
        this.matCartaFogonDorso.needsUpdate = true;
      }
      if (fogonCarta) {
        const clave = `${fogonCarta.palo}:${fogonCarta.rango}`;
        if (clave !== this.claveCartaFogon) {
          this.claveCartaFogon = clave;
          this.matCartaFogonCara.map = texturaNaipe(fogonCarta.palo, fogonCarta.rango);
          this.matCartaFogonCara.needsUpdate = true;
        }
      }
      const hayFuego = Boolean(document.querySelector('.fogon .fuego'));
      this.cartaFogon.visible = hayFuego;
      if (!quieto) {
        const pul = Math.sin(reloj * 9.5) * 0.12 + Math.cos(reloj * 14.3) * 0.08;
        this.luzFogon.intensity = 20 + pul * 16;
        this.matBrasa.emissiveIntensity = 1.3 + pul * 0.55;
        this.llamas.forEach((ll, i) => {
          const f = 1 + Math.sin(reloj * (10 + i * 3.1) + i) * 0.18;
          const baseScale = i === 0 ? 2.51 : i === 1 ? 2.96 : i === 2 ? 3.67 : 2.6;
          ll.scale.set((i >= 3 ? 0.85 : 1) + Math.cos(reloj * 8 + i) * 0.09, baseScale * f, i >= 3 ? 0.85 : 1);
          if (i < 3) ll.rotation.y += dt * (1.2 + i * 0.5);
        });
        this.chispasFogon.forEach((ch, i) => {
          ch.position.y += dt * (0.38 + (i % 3) * 0.14);
          if (ch.position.y > 1.38) ch.position.y = 0.62;
          ch.position.x = Math.cos(i * 1.4 + reloj * 1.6) * 0.24;
        });
        if (hayFuego) {
          this.cartaFogon.position.y = 1.52 + Math.sin(reloj * 2.6) * 0.05;
          this.cartaFogon.rotation.y = Math.sin(reloj * 1.4) * 0.16;
          this.cartaFogon.rotation.z = Math.sin(reloj * 16) * 0.015;
        }
      } else {
        this.luzFogon.intensity = 20;
        this.matBrasa.emissiveIntensity = 1.35;
        if (hayFuego) {
          this.cartaFogon.position.y = 1.52;
          this.cartaFogon.rotation.set(-0.22, 0, 0);
        }
      }
    }
  }

  private sincronizarNodosMapa(cam: THREE.PerspectiveCamera, quieto: boolean, reloj: number): void {
    const rollo = document.querySelector<HTMLElement>('.mapa .mapa-rollo');
    const rRollo = rollo?.getBoundingClientRect();
    const nodos = rRollo
      ? Array.from(document.querySelectorAll<HTMLElement>('.mapa .nodo.actual, .mapa .nodo.abierto')).slice(0, this.pedestales.length)
      : [];

    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);

    for (let i = 0; i < this.pedestales.length; i++) {
      const ped = this.pedestales[i];
      const nodo = nodos[i];
      if (!nodo || !rRollo) {
        ped.grupo.visible = false;
        continue;
      }
      const r = nodo.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (
        r.width < 4 ||
        cx < rRollo.left + 8 ||
        cx > rRollo.right - 8 ||
        cy < rRollo.top + 8 ||
        cy > rRollo.bottom - 8
      ) {
        ped.grupo.visible = false;
        continue;
      }
      const ndcX = (cx / vw) * 2 - 1;
      const ndcY = -(cy / vh) * 2 + 1;
      this.rayo.set(ndcX, ndcY, 0.5).unproject(cam).sub(cam.position).normalize();
      if (this.rayo.y < -0.05) {
        const t = (0.09 - cam.position.y) / this.rayo.y;
        ped.grupo.position.set(cam.position.x + this.rayo.x * t, 0.09, cam.position.z + this.rayo.z * t);
      } else {
        ped.grupo.position.copy(cam.position).addScaledVector(this.rayo, 6.2);
      }
      const esActual = nodo.classList.contains('actual');
      ped.cristal.visible = esActual;
      const matAnillo = ped.anillo.material as THREE.MeshBasicMaterial;
      matAnillo.color.setHex(esActual ? 0xffd166 : 0x5ae08e);
      if (!quieto) {
        const esc = esActual ? 1 + Math.sin(reloj * 4.5 + i) * 0.12 : 0.88 + Math.sin(reloj * 3 + i) * 0.08;
        ped.anillo.scale.setScalar(esc);
        ped.cristal.position.y = 0.28 + Math.sin(reloj * 3.8) * 0.04;
        ped.cristal.rotation.y = reloj * 1.9;
      } else {
        ped.anillo.scale.setScalar(esActual ? 1 : 0.88);
        ped.cristal.position.y = 0.28;
      }
      ped.grupo.visible = true;
    }
  }
}
