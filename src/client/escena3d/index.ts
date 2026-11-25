// Orquestador de la escena 3D en Three.js: inicialización segura, fallback 2D si falta WebGL y bucle adaptativo 60+ FPS.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { ajustes, perfil } from '../almacen';
import type { Escena } from '../fx/escenas';
import { sesion } from '../juego';
import { Bufon3D } from './bufon3d';
import { CamaraPulperia, type ModoCamara } from './camara';
import { SincroCartas3D } from './cartas3d';
import { Chiches3D } from './chiches3d';
import { CuartoPulperia3D, type RinconId } from './cuarto3d';
export type { RinconId } from './cuarto3d';
import { Escenarios3D } from './escenarios3d';
import { MundoPulperia } from './pulperia';
import { CaminoSolDeMayo3D } from './solDeMayo3d';

class Motor3D {
  readonly renderer: THREE.WebGLRenderer;
  readonly escena = new THREE.Scene();
  readonly camara: CamaraPulperia;
  readonly mundo: MundoPulperia;
  readonly cartas: SincroCartas3D;
  readonly bufon: Bufon3D;
  readonly chiches: Chiches3D;
  readonly escenarios: Escenarios3D;
  readonly cuarto: CuartoPulperia3D;
  readonly solDeMayo: CaminoSolDeMayo3D;
  rinconResaltado: RinconId | null = null;

  private raf = 0;
  private ultimo = 0;
  private reloj = 0;
  private foto = false;
  private sucio = false;
  private ultimaPantalla = 'portada';
  private punteroX = 0;
  private punteroY = 0;
  private readonly esMovil = window.innerWidth < 700;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.camara = new CamaraPulperia(window.innerWidth / Math.max(1, window.innerHeight));
    this.mundo = new MundoPulperia(this.escena, this.esMovil);
    this.cartas = new SincroCartas3D(this.escena);
    this.bufon = new Bufon3D(this.escena);
    this.chiches = new Chiches3D(this.escena);
    this.escenarios = new Escenarios3D(this.escena);
    this.cuarto = new CuartoPulperia3D(this.escena);
    this.cuarto.sincronizarPerfil(perfil);
    this.solDeMayo = new CaminoSolDeMayo3D(this.escena);

    window.addEventListener('resize', () => this.redimensionar());
    window.addEventListener(
      'pointermove',
      (ev) => {
        this.punteroX = (ev.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        this.punteroY = (ev.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
        this.camara.establecerPuntero(this.punteroX, this.punteroY);
      },
      { passive: true },
    );
    document.addEventListener('cabala:pantalla', (ev) => {
      const nom = (ev as CustomEvent<string>).detail;
      if (nom && nom !== 'modal') {
        this.ultimaPantalla = nom;
        const esc = this.escenaDePantalla(nom);
        this.camara.ponerModo(this.modoDe(nom), this.foto || ajustes.calma);
        this.mundo.ponerEscena(esc, nom);
        this.escenarios.ponerEscena(esc, nom);
        const enCuarto = nom === 'explorar';
        this.cuarto.ponerVisible(enCuarto);
        if (enCuarto) this.cuarto.sincronizarPerfil(perfil);
        const enSol = nom === 'sol-de-mayo';
        this.solDeMayo.ponerVisible(enSol);
        this.mundo.raiz.visible = !enSol;
        if (enSol) {
          this.escena.background = new THREE.Color(0x081326);
          this.escena.fog = new THREE.FogExp2(0x0b1830, 0.024);
        } else {
          this.escena.background = new THREE.Color(0x09070f);
          this.escena.fog = this.mundo.niebla;
        }
        this.forzarCuadro();
      }
    });
    for (const evNom of ['focusin', 'click', 'keydown'] as const) {
      document.addEventListener(evNom, () => {
        if (this.foto) requestAnimationFrame(() => requestAnimationFrame(() => this.forzarCuadro()));
      });
    }
    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(this.raf);
      this.renderer.dispose();
    });
    const obsEntrada = new MutationObserver(() => {
      this.sucio = true;
      requestAnimationFrame(() => {
        this.sucio = true;
      });
    });
    obsEntrada.observe(document.documentElement, { attributes: true, attributeFilter: ['data-entrada'] });
  }

  private modoDe(pantalla: string): ModoCamara {
    switch (pantalla) {
      case 'explorar':
        return 'explorar';
      case 'sol-de-mayo':
        return 'sol-de-mayo';
      case 'mazo':
        return 'mazos';
      case 'mesa':
        return 'mesa';
      case 'mapa':
        return 'mapa';
      case 'pulperia':
        return 'pulperia';
      case 'fogon':
        return 'fogon';
      case 'altar':
      case 'cabala':
        return 'altar';
      case 'coleccion':
        return 'coleccion';
      case 'cronica':
        return 'cronica';
      case 'ajustes':
        return 'ajustes';
      case 'fin':
        return sesion.partida?.fin?.victoria ? 'amanecer' : 'ocaso';
      default:
        return 'portada';
    }
  }

  private escenaDePantalla(pantalla: string): Escena {
    if (pantalla === 'fin') return sesion.partida?.fin?.victoria ? 'amanecer' : 'ocaso';
    if (pantalla === 'pulperia') return 'pulperia';
    if (pantalla === 'fogon') return 'fogon';
    if (pantalla === 'mapa') return 'mapa';
    if (pantalla === 'altar' || pantalla === 'cabala') return 'altar';
    if (pantalla === 'coleccion') return 'coleccion';
    if (pantalla === 'mesa' || pantalla === 'cronica' || pantalla === 'ajustes') return 'mesa';
    return 'portada';
  }

  redimensionar(): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.camara.redimensionar(window.innerWidth, window.innerHeight);
    this.forzarCuadro();
  }

  iniciar(): void {
    this.ultimo = performance.now();
    const bucle = (ahora: number): void => {
      const dt = Math.min(0.05, Math.max(0.001, (ahora - this.ultimo) / 1000));
      this.ultimo = ahora;
      if (!this.foto) {
        this.paso(dt);
      } else if (this.sucio) {
        this.sucio = false;
        this.paso(0.016);
      }
      this.raf = requestAnimationFrame(bucle);
    };
    this.raf = requestAnimationFrame(bucle);
  }

  private paso(dt: number): void {
    const quieto = this.foto || ajustes.calma;
    if (!quieto) this.reloj += dt;

    const p = sesion.partida;
    const cartaF = p?.fogonCarta ? p.mazo.find((k) => k.id === p.fogonCarta) : undefined;
    const infoCartaF = cartaF && cartaF.palo !== 'X' ? { palo: cartaF.palo, rango: cartaF.n } : undefined;
    this.mundo.sincronizarPartida(p?.mazoId, p?.combate?.mazo.length, p?.oro);
    this.mundo.actualizar(dt, quieto);
    this.camara.actualizar(dt, quieto);
    this.cartas.sincronizar(this.camara.cam, p?.mazoId ?? 'escoba', dt, quieto, this.punteroX, this.punteroY, this.reloj);
    this.bufon.sincronizar(this.camara.cam, dt, quieto, this.punteroX, this.punteroY, this.reloj);
    this.chiches.sincronizar(this.camara.cam, dt, quieto, this.reloj);
    this.escenarios.actualizar(this.camara.cam, dt, quieto, this.reloj, p?.mazoId ?? 'escoba', infoCartaF);
    this.cuarto.actualizar(dt, quieto, this.reloj, this.rinconResaltado, this.camara.cam.position);
    this.solDeMayo.actualizar(dt, quieto, this.reloj);
    this.renderer.render(this.escena, this.camara.cam);
  }

  forzarCuadro(): void {
    this.camara.ponerModo(this.modoDe(this.ultimaPantalla), true);
    this.paso(0.016);
  }

  marcarSucio(): void {
    this.sucio = true;
  }

  ponerModoFoto(si: boolean): void {
    this.foto = si;
    if (si) this.forzarCuadro();
  }
}

let motor: Motor3D | null = null;

export function iniciarEscena3d(): boolean {
  if (motor) return true;
  const canvas = document.getElementById('escena-3d') as HTMLCanvasElement | null;
  if (!canvas) return false;
  try {
    motor = new Motor3D(canvas);
    document.documentElement.classList.add('modo-3d');
    motor.iniciar();
    (window as unknown as { __escena3d?: unknown }).__escena3d = {
      activa: () => motor !== null,
      forzar: () => motor?.forzarCuadro(),
      modo: () => motor?.camara,
      bufonVisible: () => motor?.bufon.raiz.visible ?? false,
      chichesActivos: () => motor?.chiches.activos ?? 0,
      escenario3d: () => motor?.escenarios.activo ?? 'ninguno',
      cuartoActivo: () => motor?.cuarto.raiz.visible ?? false,
      solDeMayoActivo: () => motor?.solDeMayo.raiz.visible ?? false,
    };
    return true;
  } catch {
    motor = null;
    document.documentElement.classList.remove('modo-3d');
    return false;
  }
}

export const escena3dActiva = (): boolean => motor !== null;
export const ponerEscena3d = (e: Escena, pantalla?: string): void => {
  motor?.mundo.ponerEscena(e, pantalla);
  motor?.escenarios.ponerEscena(e, pantalla);
};
export const ponerClima3d = (palo: Palo | null): void => motor?.mundo.ponerClima(palo);
export const fogonazo3d = (fuerza = 1): void => motor?.mundo.fogonazoCandil(fuerza);
export const sacudirCamara3d = (fuerza = 1): void => motor?.camara.sacudir(fuerza);
export const partirEnemigo3d = (palo: Palo, rango: number, segunda = false): void =>
  motor?.cartas.partirEnemigo(motor.camara.cam, palo, rango, segunda);
export const estallidoPalo3d = (palo: Palo, fuerza = 1): void => motor?.cartas.estallidoPalo(motor.camara.cam, palo, fuerza);
export const modoFoto3d = (si: boolean): void => motor?.ponerModoFoto(si);
export const marcarSucio3d = (): void => motor?.marcarSucio();
export const forzarCuadro3d = (): void => motor?.forzarCuadro();
export const entrarExploracion3d = (inmediato = false): void => {
  motor?.cuarto.ponerVisible(true);
  motor?.cuarto.sincronizarPerfil(perfil);
  motor?.camara.entrarExploracion(inmediato);
};
export const salirExploracion3d = (): void => motor?.camara.salirExploracion();
export const moverExploracion3d = (adelante: number, derecha: number, dt: number): boolean =>
  motor?.camara.moverLibre(adelante, derecha, dt) ?? false;
export const rotarExploracion3d = (dyaw: number, dpitch: number): void => motor?.camara.rotarLibre(dyaw, dpitch);
export const enfocarRincon3d = (id: RinconId, inmediato = false): void => {
  if (!motor) return;
  const pose = motor.cuarto.poseDe(id);
  motor.cuarto.ponerVisible(true);
  motor.cuarto.sincronizarPerfil(perfil);
  motor.camara.enfocarPose(pose.pos, pose.mira, inmediato);
  if (inmediato) motor.forzarCuadro();
};
export const raycastRincon3d = (ndcX: number, ndcY: number): RinconId | null =>
  motor ? motor.cuarto.raycast(motor.camara.cam, ndcX, ndcY) : null;
export const rinconFrente3d = (): RinconId | null =>
  motor ? motor.cuarto.cercano(motor.camara.posLibre, motor.camara.dirLibre) : null;
export const resaltarRincon3d = (id: RinconId | null): void => {
  if (motor) motor.rinconResaltado = id;
};
export const entrarSolDeMayo3d = (inmediato = false): void => {
  motor?.solDeMayo.ponerVisible(true);
  motor?.camara.entrarSolDeMayo(inmediato);
  if (inmediato) motor?.forzarCuadro();
};
export const salirSolDeMayo3d = (): void => motor?.camara.salirExploracion();
export const distanciaMesaGloria3d = (): number => (motor ? Math.abs(motor.camara.posLibre.z - -20.5) : 99);
