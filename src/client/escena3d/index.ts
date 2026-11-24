// Orquestador de la escena 3D en Three.js: inicialización segura, fallback 2D si falta WebGL y bucle adaptativo 60+ FPS.
import * as THREE from 'three';
import type { Palo } from '../../rules/cartas';
import { ajustes } from '../almacen';
import type { Escena } from '../fx/escenas';
import { sesion } from '../juego';
import { CamaraPulperia, type ModoCamara } from './camara';
import { SincroCartas3D } from './cartas3d';
import { MundoPulperia } from './pulperia';

class Motor3D {
  readonly renderer: THREE.WebGLRenderer;
  readonly escena = new THREE.Scene();
  readonly camara: CamaraPulperia;
  readonly mundo: MundoPulperia;
  readonly cartas: SincroCartas3D;

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
        this.camara.ponerModo(this.modoDe(nom), this.foto || ajustes.calma);
        this.mundo.ponerEscena(this.escenaDePantalla(nom), nom);
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
    this.mundo.sincronizarPartida(p?.mazoId, p?.combate?.mazo.length, p?.oro);
    this.mundo.actualizar(dt, quieto);
    this.camara.actualizar(dt, quieto);
    this.cartas.sincronizar(this.camara.cam, p?.mazoId ?? 'escoba', dt, quieto, this.punteroX, this.punteroY, this.reloj);
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
    };
    return true;
  } catch {
    motor = null;
    document.documentElement.classList.remove('modo-3d');
    return false;
  }
}

export const escena3dActiva = (): boolean => motor !== null;
export const ponerEscena3d = (e: Escena, pantalla?: string): void => motor?.mundo.ponerEscena(e, pantalla);
export const ponerClima3d = (palo: Palo | null): void => motor?.mundo.ponerClima(palo);
export const fogonazo3d = (fuerza = 1): void => motor?.mundo.fogonazoCandil(fuerza);
export const sacudirCamara3d = (fuerza = 1): void => motor?.camara.sacudir(fuerza);
export const partirEnemigo3d = (palo: Palo, rango: number, segunda = false): void =>
  motor?.cartas.partirEnemigo(motor.camara.cam, palo, rango, segunda);
export const modoFoto3d = (si: boolean): void => motor?.ponerModoFoto(si);
export const marcarSucio3d = (): void => motor?.marcarSucio();
export const forzarCuadro3d = (): void => motor?.forzarCuadro();
