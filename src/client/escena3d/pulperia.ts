// Mundo persistente de la pulpería nocturna 3D: mesa, paño, vela con pulso 3-3-2, farol, mazo físico, monedas y clima.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { MAZOS, type MazoId } from '../../rules/mazos';
import type { Escena } from '../fx/escenas';
import { armoniaActual } from '../musica';
import { texturaCantoCarta, texturaDorso, texturaHalo, texturaMadera, texturaPano, texturaPared, texturaParticula } from './texturas';

const CLIMA_TINTE: Record<Palo, number> = {
  S: 0x4cc9ff,
  C: 0x3ad47a,
  D: 0xffc838,
  H: 0xff3b5c,
};

export class MundoPulperia {
  readonly raiz = new THREE.Group();
  readonly luzVela: THREE.PointLight;
  readonly luzFarol: THREE.PointLight;
  readonly luzAmbiente: THREE.HemisphereLight;
  readonly luzCenital: THREE.DirectionalLight;
  readonly niebla: THREE.FogExp2;

  private readonly grupoVela = new THREE.Group();
  private readonly llamaExt: THREE.Mesh;
  private readonly llamaInt: THREE.Mesh;
  private readonly farolPivote = new THREE.Group();
  private readonly grupoPano = new THREE.Group();
  private readonly grupoMazo = new THREE.Group();
  private readonly pilaMazo: THREE.Mesh;
  private readonly matTapaMazo: THREE.MeshStandardMaterial;
  private readonly grupoMonedas = new THREE.Group();
  private readonly pilasMonedas: THREE.Mesh[] = [];
  private readonly grupoPortadaDorsos = new THREE.Group();
  private readonly particulas: THREE.Points;
  private readonly matParticulas: THREE.PointsMaterial;
  private readonly posParticulas: Float32Array;
  private readonly velParticulas: Float32Array;
  private readonly nParticulas: number;

  private escenaActual: Escena = 'portada';
  private climaActual: Palo | null = null;
  private mazoActual: MazoId = 'escoba';
  private ultimoPasoMusica = -1;
  private pulsoMusica = 0;
  private fogonazo = 0;
  private reloj = 0;
  private ultimoOro = -1;
  private ultimoMazoN = -1;

  constructor(escenaThree: THREE.Scene, esMovil: boolean) {
    this.niebla = new THREE.FogExp2(0x0b0714, 0.036);
    escenaThree.fog = this.niebla;
    escenaThree.background = new THREE.Color(0x09070f);

    // Iluminación base de pulpería nocturna
    this.luzAmbiente = new THREE.HemisphereLight(0x52448c, 0x160b22, 1.15);
    this.raiz.add(this.luzAmbiente);

    this.luzCenital = new THREE.DirectionalLight(0xffdfb8, 0.62);
    this.luzCenital.position.set(1.5, 9.2, 5.4);
    this.raiz.add(this.luzCenital);

    // Mesa principal de madera vieja
    const matMadera = new THREE.MeshStandardMaterial({
      map: texturaMadera(),
      roughness: 0.86,
      metalness: 0.04,
    });
    const tablero = new THREE.Mesh(new THREE.BoxGeometry(19, 0.7, 12.5), matMadera);
    tablero.position.set(0, -0.35, 0);
    tablero.receiveShadow = true;
    this.raiz.add(tablero);

    const bisel = new THREE.Mesh(
      new THREE.BoxGeometry(19.2, 0.24, 12.7),
      new THREE.MeshStandardMaterial({ color: 0x110918, roughness: 0.9, metalness: 0.15 }),
    );
    bisel.position.set(0, -0.62, 0);
    this.raiz.add(bisel);

    // Paño verde central en relieve sobre la madera
    const matPano = new THREE.MeshStandardMaterial({
      map: texturaPano(),
      roughness: 0.92,
      metalness: 0.02,
    });
    const pano = new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.05, 3.6), matPano);
    pano.position.set(0, 0.025, 0.1);
    pano.receiveShadow = true;
    this.grupoPano.add(pano);

    const matMarcoPano = new THREE.MeshStandardMaterial({ color: 0x2a182d, roughness: 0.8 });
    const largoH = new THREE.BoxGeometry(8.14, 0.08, 0.12);
    const largoV = new THREE.BoxGeometry(0.12, 0.08, 3.6);
    for (const z of [-1.74, 1.94]) {
      const m = new THREE.Mesh(largoH, matMarcoPano);
      m.position.set(0, 0.04, z);
      this.grupoPano.add(m);
    }
    for (const x of [-4.01, 4.01]) {
      const m = new THREE.Mesh(largoV, matMarcoPano);
      m.position.set(x, 0.04, 0.1);
      this.grupoPano.add(m);
    }
    this.raiz.add(this.grupoPano);

    // Pared trasera en penumbra y estante de botellas
    const pared = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 15),
      new THREE.MeshStandardMaterial({ map: texturaPared(), roughness: 0.95 }),
    );
    pared.position.set(0, 4.6, -5.8);
    this.raiz.add(pared);

    // Repisas laterales con botellas (centro oscuro limpio detrás del logo y del enemigo)
    const matEstante = new THREE.MeshStandardMaterial({ color: 0x201228, roughness: 0.85 });
    for (const sx of [-5.0, 5.0]) {
      const est = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 0.9), matEstante);
      est.position.set(sx, 3.2, -5.2);
      this.raiz.add(est);
    }

    const geoBotella = new THREE.CylinderGeometry(0.16, 0.22, 0.88, 8);
    const geoCuello = new THREE.CylinderGeometry(0.06, 0.1, 0.34, 8);
    const botellasX = [-5.8, -4.9, -4.1, 4.1, 4.9, 5.8];
    const coloresBotella = [0x154a36, 0x5c2c12, 0x1a3e54, 0x4d172c, 0x18523d, 0x613214];
    coloresBotella.forEach((col, i) => {
      const matB = new THREE.MeshStandardMaterial({ color: col, roughness: 0.25, metalness: 0.12 });
      const b = new THREE.Mesh(geoBotella, matB);
      const bx = botellasX[i];
      b.position.set(bx, 3.71, -5.2);
      const c = new THREE.Mesh(geoCuello, matB);
      c.position.set(bx, 4.3, -5.2);
      this.raiz.add(b, c);
    });

    // Farol colgante a la izquierda con jaula de hierro forjado y halo cálido
    this.farolPivote.position.set(-6.1, 6.2, -3.1);
    const cadena = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x3b314d, metalness: 0.6, roughness: 0.5 }),
    );
    cadena.position.set(0, -1.1, 0);
    const cuerpoFarol = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.24, 0.68, 6),
      new THREE.MeshBasicMaterial({ color: 0xffc662 }),
    );
    cuerpoFarol.position.set(0, -2.3, 0);
    const sombreroFarol = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x261c33, metalness: 0.5, roughness: 0.6 }),
    );
    sombreroFarol.position.set(0, -1.87, 0);
    const baseFarol = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.24, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x261c33, metalness: 0.5, roughness: 0.6 }),
    );
    baseFarol.position.set(0, -2.67, 0);
    this.farolPivote.add(cadena, cuerpoFarol, sombreroFarol, baseFarol);
    const matBarrote = new THREE.MeshStandardMaterial({ color: 0x1e1529, metalness: 0.6, roughness: 0.5 });
    const geoBarrote = new THREE.BoxGeometry(0.03, 0.68, 0.03);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const bar = new THREE.Mesh(geoBarrote, matBarrote);
      bar.position.set(Math.cos(a) * 0.28, -2.3, Math.sin(a) * 0.28);
      this.farolPivote.add(bar);
    }
    const haloFarol = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texturaHalo(),
        color: 0xffb44c,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    haloFarol.position.set(0, -2.3, 0.15);
    haloFarol.scale.set(1.4, 1.4, 1);
    this.luzFarol = new THREE.PointLight(0xff8e3c, 10, 17, 1.45);
    this.luzFarol.position.set(0, -2.3, 0.3);
    this.farolPivote.add(haloFarol, this.luzFarol);
    this.raiz.add(this.farolPivote);

    // Vela cálida 3D despejada por encima de CHICHES con collarín, llama animada y halo
    this.grupoVela.position.set(esMovil ? 2.8 : 6.1, 0, esMovil ? -2.7 : -2.1);
    const platillo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.26, 0.07, 10),
      new THREE.MeshStandardMaterial({ color: 0x2d243b, metalness: 0.55, roughness: 0.5 }),
    );
    platillo.position.set(0, 0.035, 0);
    const cera = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.16, 0.78, 10),
      new THREE.MeshStandardMaterial({ color: 0xf4e3c1, emissive: 0x6b3a12, emissiveIntensity: 0.42, roughness: 0.65 }),
    );
    cera.position.set(0, 0.44, 0);
    cera.castShadow = true;
    const collarin = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.032, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0xf4e3c1, emissive: 0x6b3a12, emissiveIntensity: 0.42, roughness: 0.6 }),
    );
    collarin.rotation.x = Math.PI / 2;
    collarin.position.set(0, 0.82, 0);
    const mecha = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.12, 5),
      new THREE.MeshBasicMaterial({ color: 0x1b121c }),
    );
    mecha.position.set(0, 0.88, 0);
    this.llamaExt = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshBasicMaterial({ color: 0xff8a1e }),
    );
    this.llamaExt.scale.set(0.7, 1.75, 0.7);
    this.llamaExt.position.set(0, 1.03, 0);
    this.llamaInt = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.07, 0),
      new THREE.MeshBasicMaterial({ color: 0xfff3a8 }),
    );
    this.llamaInt.scale.set(0.65, 1.4, 0.65);
    this.llamaInt.position.set(0, 1.01, 0);
    const haloVela = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texturaHalo(),
        color: 0xffb44c,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    haloVela.position.set(0, 1.04, 0);
    haloVela.scale.set(0.95, 0.95, 1);

    this.luzVela = new THREE.PointLight(0xffa447, 26, 26, 1.35);
    this.luzVela.position.set(0, 1.25, 0);
    this.luzVela.castShadow = true;
    this.luzVela.shadow.mapSize.set(esMovil ? 512 : 1024, esMovil ? 512 : 1024);
    this.luzVela.shadow.bias = -0.0005;
    this.luzVela.shadow.radius = 2;
    this.grupoVela.add(platillo, cera, collarin, mecha, this.llamaExt, this.llamaInt, haloVela, this.luzVela);
    this.raiz.add(this.grupoVela);

    // Mazo físico 3D del jugador (costado izquierdo despejado)
    this.matTapaMazo = new THREE.MeshStandardMaterial({ map: texturaDorso('escoba'), roughness: 0.62 });
    const matCanto = new THREE.MeshStandardMaterial({ map: texturaCantoCarta(), roughness: 0.75 });
    this.pilaMazo = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1, 1.48), [
      matCanto,
      matCanto,
      this.matTapaMazo,
      matCanto,
      matCanto,
      matCanto,
    ]);
    this.pilaMazo.castShadow = true;
    this.pilaMazo.receiveShadow = true;
    this.grupoMazo.add(this.pilaMazo);
    this.grupoMazo.position.set(-5.75, 0, 1.15);
    this.grupoMazo.rotation.y = 0.14;
    this.raiz.add(this.grupoMazo);

    // Pilas de monedas de oro 3D
    const geoMoneda = new THREE.CylinderGeometry(0.15, 0.15, 1, 10);
    const matOro = new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.68, roughness: 0.3 });
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(geoMoneda, matOro);
      m.position.set(i * 0.34, 0, (i % 2) * 0.22);
      m.castShadow = true;
      this.pilasMonedas.push(m);
      this.grupoMonedas.add(m);
    }
    this.grupoMonedas.position.set(-4.85, 0, 2.35);
    this.raiz.add(this.grupoMonedas);

    // 5 Mazos físicos 3D en abanico limpio en el flanco derecho de Portada
    const matCantoPortada = new THREE.MeshStandardMaterial({ map: texturaCantoCarta(), roughness: 0.75 });
    MAZOS.forEach((mazoId, idx) => {
      const matTop = new THREE.MeshStandardMaterial({ map: texturaDorso(mazoId), roughness: 0.58 });
      const bloque = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 1.62), [
        matCantoPortada,
        matCantoPortada,
        matTop,
        matCantoPortada,
        matCantoPortada,
        matCantoPortada,
      ]);
      bloque.position.set(3.3 + idx * 0.42, 0.11 + idx * 0.025, 0.25 + (idx - 2) * 0.22);
      bloque.rotation.y = -0.36 + idx * 0.14;
      bloque.castShadow = true;
      bloque.receiveShadow = true;
      this.grupoPortadaDorsos.add(bloque);
    });
    this.raiz.add(this.grupoPortadaDorsos);

    // Partículas ambientales 3D (polvo dorado + brasas)
    this.nParticulas = esMovil ? 70 : 140;
    this.posParticulas = new Float32Array(this.nParticulas * 3);
    this.velParticulas = new Float32Array(this.nParticulas);
    for (let i = 0; i < this.nParticulas; i++) {
      this.posParticulas[i * 3] = (Math.random() - 0.5) * 14;
      this.posParticulas[i * 3 + 1] = Math.random() * 5.2;
      this.posParticulas[i * 3 + 2] = (Math.random() - 0.5) * 9 - 0.8;
      this.velParticulas[i] = 0.15 + Math.random() * 0.35;
    }
    const geoPart = new THREE.BufferGeometry();
    geoPart.setAttribute('position', new THREE.BufferAttribute(this.posParticulas, 3));
    this.matParticulas = new THREE.PointsMaterial({
      size: 0.14,
      map: texturaParticula(),
      color: 0xffc66d,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.particulas = new THREE.Points(geoPart, this.matParticulas);
    this.raiz.add(this.particulas);

    escenaThree.add(this.raiz);
  }

  ponerEscena(escena: Escena, pantalla?: string): void {
    this.escenaActual = escena;
    const enMesa = escena === 'mesa' && (!pantalla || pantalla === 'mesa');
    this.grupoPano.visible = enMesa;
    this.grupoPortadaDorsos.visible = escena === 'portada' && (!pantalla || pantalla === 'portada');
    this.grupoMazo.visible = enMesa;
    this.grupoMonedas.visible = enMesa;

    if (escena === 'amanecer') {
      this.niebla.color.setHex(0x281028);
      this.luzAmbiente.color.setHex(0xff9b54);
    } else if (escena === 'ocaso') {
      this.niebla.color.setHex(0x160712);
      this.luzAmbiente.color.setHex(0x88324c);
    } else {
      this.niebla.color.setHex(this.climaActual ? CLIMA_TINTE[this.climaActual] : 0x0b0714);
      if (this.climaActual) this.niebla.color.lerp(new THREE.Color(0x0b0714), 0.72);
      this.luzAmbiente.color.setHex(0x52448c);
    }
  }

  ponerClima(palo: Palo | null): void {
    this.climaActual = palo;
    if (palo) {
      this.matParticulas.color.setHex(CLIMA_TINTE[palo]);
      this.matParticulas.opacity = 0.72;
      this.luzFarol.color.setHex(CLIMA_TINTE[palo]);
      this.niebla.color.setHex(CLIMA_TINTE[palo]).lerp(new THREE.Color(0x0b0714), 0.74);
    } else {
      this.matParticulas.color.setHex(0xffc66d);
      this.matParticulas.opacity = 0.56;
      this.luzFarol.color.setHex(0xff8e3c);
      this.niebla.color.setHex(0x0b0714);
    }
  }

  fogonazoCandil(fuerza = 1): void {
    this.fogonazo = Math.min(1.4, Math.max(this.fogonazo, fuerza));
  }

  sincronizarPartida(mazoId?: MazoId, mazoRestante?: number, oro?: number): void {
    if (mazoId && mazoId !== this.mazoActual) {
      this.mazoActual = mazoId;
      this.matTapaMazo.map = texturaDorso(mazoId);
      this.matTapaMazo.needsUpdate = true;
    }
    if (typeof mazoRestante === 'number' && mazoRestante !== this.ultimoMazoN) {
      this.ultimoMazoN = mazoRestante;
      const h = Math.max(0.06, Math.min(0.75, (mazoRestante / 38) * 0.72));
      this.pilaMazo.scale.y = h;
      this.pilaMazo.position.y = h * 0.5;
      this.pilaMazo.visible = mazoRestante > 0;
    }
    if (typeof oro === 'number' && oro !== this.ultimoOro) {
      this.ultimoOro = oro;
      this.pilasMonedas.forEach((m, i) => {
        const umbralOro = i * 18;
        const h = oro > umbralOro ? Math.min(0.62, 0.08 + ((oro - umbralOro) / 40) * 0.52) : 0;
        m.visible = h > 0.02;
        if (m.visible) {
          m.scale.y = h;
          m.position.y = h * 0.5;
        }
      });
    }
  }

  actualizar(dt: number, quieto: boolean): void {
    if (!quieto) {
      this.reloj += dt;
      this.fogonazo = Math.max(0, this.fogonazo - dt * 4.0);
      this.pulsoMusica = Math.max(0, this.pulsoMusica - dt * 3.4);

      const arm = armoniaActual();
      if (arm && arm.paso !== this.ultimoPasoMusica) {
        this.ultimoPasoMusica = arm.paso;
        if (arm.paso === 0) this.pulsoMusica = Math.max(this.pulsoMusica, 0.45);
        else if (arm.paso === 6 || arm.paso === 12) this.pulsoMusica = Math.max(this.pulsoMusica, 0.25);
      }

      const titileo = Math.sin(this.reloj * 11) * 0.07 + Math.cos(this.reloj * 17) * 0.05;
      const pulso = Math.max(this.fogonazo, this.pulsoMusica);
      this.luzVela.intensity = 25 + pulso * 18 + titileo * 16;
      const escLlama = 1 + pulso * 0.35 + titileo * 0.4;
      this.llamaExt.scale.set(0.7 * escLlama, 1.75 * escLlama, 0.7 * escLlama);
      this.llamaInt.scale.set(0.65 * escLlama, 1.4 * escLlama, 0.65 * escLlama);

      this.farolPivote.rotation.z = Math.sin(this.reloj * 1.15) * 0.065;
      const relampago = this.climaActual === 'S' && Math.sin(this.reloj * 7.3) > 0.94 ? 9 : 0;
      this.luzFarol.intensity = (this.climaActual ? 12 : 9.5) + pulso * 4 + relampago;

      if (this.grupoPortadaDorsos.visible) {
        this.grupoPortadaDorsos.rotation.y = Math.sin(this.reloj * 0.55) * 0.04;
      }

      const attr = this.particulas.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < this.nParticulas; i++) {
        const ix = i * 3;
        if (this.climaActual === 'D') {
          let py = this.posParticulas[ix + 1] - this.velParticulas[i] * dt * 1.4;
          if (py < 0.1) py = 5.4;
          this.posParticulas[ix + 1] = py;
        } else {
          const multY = this.climaActual === 'H' ? 2.1 : this.climaActual === 'S' ? 1.85 : 1.15;
          let py = this.posParticulas[ix + 1] + this.velParticulas[i] * dt * multY;
          if (py > 5.4) py = 0.1;
          this.posParticulas[ix + 1] = py;
          if (this.climaActual === 'S') {
            this.posParticulas[ix] += dt * 0.9;
            if (this.posParticulas[ix] > 7) this.posParticulas[ix] = -7;
          } else if (this.climaActual === 'C') {
            this.posParticulas[ix] += Math.sin(this.reloj * 1.7 + i) * dt * 0.32;
          }
        }
      }
      attr.needsUpdate = true;
    } else {
      this.luzVela.intensity = 26;
      this.farolPivote.rotation.z = 0;
    }
  }
}
