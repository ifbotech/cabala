// Cámara cinematográfica en primera persona dentro de la pulpería: interpolación suave, parallax y sacudida 3D.
import * as THREE from 'three';

export type ModoCamara =
  | 'portada'
  | 'explorar'
  | 'mazos'
  | 'mesa'
  | 'mapa'
  | 'pulperia'
  | 'fogon'
  | 'altar'
  | 'coleccion'
  | 'cronica'
  | 'ajustes'
  | 'amanecer'
  | 'ocaso';

interface Pose {
  pos: [number, number, number];
  mira: [number, number, number];
  fov: number;
}

const POSES: Record<ModoCamara, Pose> = {
  portada: { pos: [0, 3.6, 8.8], mira: [0, 1.35, -0.5], fov: 42 },
  explorar: { pos: [0, 2.7, 5.4], mira: [0, 2.1, -6.0], fov: 50 },
  mazos: { pos: [0, 4.3, 8.4], mira: [0, 0.8, 0.2], fov: 42 },
  mesa: { pos: [0, 5.2, 7.6], mira: [0, 0.65, -0.2], fov: 44 },
  mapa: { pos: [0, 6.8, 5.4], mira: [0, 0.1, 0.1], fov: 44 },
  pulperia: { pos: [-0.4, 3.8, 7.8], mira: [0.3, 1.5, -1.6], fov: 42 },
  fogon: { pos: [1.2, 3.5, 7.5], mira: [0.2, 1.0, -0.8], fov: 43 },
  altar: { pos: [-0.5, 4.0, 8.2], mira: [0, 1.2, -0.8], fov: 42 },
  coleccion: { pos: [0, 3.4, 9.2], mira: [0, 1.6, -2.5], fov: 43 },
  cronica: { pos: [-0.3, 4.4, 8.0], mira: [0, 0.9, -0.2], fov: 42 },
  ajustes: { pos: [0.2, 4.2, 8.2], mira: [0, 1.0, -0.4], fov: 42 },
  amanecer: { pos: [0, 3.3, 9.0], mira: [0, 1.8, -2.0], fov: 44 },
  ocaso: { pos: [0, 3.5, 8.8], mira: [0, 1.4, -1.5], fov: 43 },
};

export class CamaraPulperia {
  readonly cam: THREE.PerspectiveCamera;
  private modo: ModoCamara = 'portada';
  private posActual = new THREE.Vector3(...POSES.portada.pos);
  private miraActual = new THREE.Vector3(...POSES.portada.mira);
  private fovActual = POSES.portada.fov;
  private punteroX = 0;
  private punteroY = 0;
  private sacudida = 0;
  private reloj = 0;
  private readonly vPosObj = new THREE.Vector3();
  private readonly vMiraObj = new THREE.Vector3();
  private libre = false;
  readonly posLibre = new THREE.Vector3(0, 2.7, 5.4);
  readonly dirLibre = new THREE.Vector3(0, 0, -1);
  private yaw = 0;
  private pitch = -0.05;
  private fasePaso = 0;
  private ultimoPasoIdx = 0;
  private metaPos: THREE.Vector3 | null = null;
  private metaYaw: number | null = null;
  private metaPitch: number | null = null;

  constructor(aspecto: number) {
    this.cam = new THREE.PerspectiveCamera(42, aspecto, 0.1, 60);
    this.cam.position.copy(this.posActual);
    this.cam.lookAt(this.miraActual);
  }

  ponerModo(modo: ModoCamara, inmediato = false): void {
    this.modo = modo;
    if (modo !== 'explorar') this.libre = false;
    if (inmediato) this.encajar();
  }

  entrarExploracion(inmediato = false): void {
    this.libre = true;
    this.modo = 'explorar';
    this.posLibre.set(0, 2.7, 5.4);
    this.yaw = 0;
    this.pitch = -0.05;
    this.fasePaso = 0;
    this.ultimoPasoIdx = 0;
    this.metaPos = null;
    this.metaYaw = null;
    this.metaPitch = null;
    if (inmediato) this.aplicarLibre(0);
  }

  salirExploracion(): void {
    this.libre = false;
    this.metaPos = null;
    this.modo = 'portada';
  }

  rotarLibre(dyaw: number, dpitch: number): void {
    this.metaPos = null;
    this.metaYaw = null;
    this.metaPitch = null;
    this.yaw += dyaw;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dpitch, -0.42, 0.36);
  }

  moverLibre(adelante: number, derecha: number, dt: number): boolean {
    if (!this.libre) return false;
    if (Math.abs(adelante) < 0.01 && Math.abs(derecha) < 0.01) return false;
    this.metaPos = null;
    this.metaYaw = null;
    this.metaPitch = null;

    const vel = 4.2 * dt;
    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw);
    const rz = -Math.sin(this.yaw);

    let nx = this.posLibre.x + (fx * adelante + rx * derecha) * vel;
    let nz = this.posLibre.z + (fz * adelante + rz * derecha) * vel;

    nx = THREE.MathUtils.clamp(nx, -6.0, 6.0);
    nz = THREE.MathUtils.clamp(nz, -4.4, 7.6);
    // Colisión suave con la mesa central
    if (Math.abs(nx) < 3.4 && nz > -2.4 && nz < 2.6) {
      if (Math.abs(this.posLibre.x) >= 3.4) nx = this.posLibre.x;
      else nz = this.posLibre.z;
    }
    this.posLibre.x = nx;
    this.posLibre.z = nz;
    this.fasePaso += dt * 10.5;
    const idx = Math.floor(this.fasePaso / Math.PI);
    if (idx !== this.ultimoPasoIdx) {
      this.ultimoPasoIdx = idx;
      return true;
    }
    return false;
  }

  enfocarPose(pos: [number, number, number], mira: [number, number, number], inmediato = false): void {
    this.libre = true;
    this.modo = 'explorar';
    const dx = mira[0] - pos[0];
    const dy = mira[1] - pos[1];
    const dz = mira[2] - pos[2];
    const yawObj = Math.atan2(-dx, -dz);
    const pitchObj = THREE.MathUtils.clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.42, 0.36);
    if (inmediato) {
      this.posLibre.set(pos[0], pos[1], pos[2]);
      this.yaw = yawObj;
      this.pitch = pitchObj;
      this.metaPos = null;
      this.aplicarLibre(0);
    } else {
      this.metaPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
      this.metaYaw = yawObj;
      this.metaPitch = pitchObj;
    }
  }

  private aplicarLibre(bob: number): void {
    const fovObj = POSES.explorar.fov;
    if (Math.abs(this.cam.fov - fovObj) > 0.05) {
      this.cam.fov = fovObj;
      this.cam.updateProjectionMatrix();
    }
    this.dirLibre.set(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch)).normalize();
    this.cam.position.set(this.posLibre.x, this.posLibre.y + bob, this.posLibre.z);
    this.cam.lookAt(this.posLibre.x + this.dirLibre.x * 5, this.posLibre.y + bob + this.dirLibre.y * 5, this.posLibre.z + this.dirLibre.z * 5);
  }

  establecerPuntero(nx: number, ny: number): void {
    this.punteroX = Math.max(-1, Math.min(1, nx));
    this.punteroY = Math.max(-1, Math.min(1, ny));
  }

  sacudir(fuerza = 1): void {
    this.sacudida = Math.min(1.4, Math.max(this.sacudida, fuerza));
  }

  redimensionar(ancho: number, alto: number): void {
    this.cam.aspect = ancho / Math.max(1, alto);
    this.cam.updateProjectionMatrix();
  }

  private objetivo(outPos: THREE.Vector3, outMira: THREE.Vector3): number {
    const p = POSES[this.modo];
    const esMovil = this.cam.aspect < 0.85;
    outPos.set(p.pos[0], p.pos[1] + (esMovil ? 0.25 : 0), p.pos[2] + (esMovil ? 1.15 : 0));
    outMira.set(p.mira[0], p.mira[1], p.mira[2]);
    return p.fov + (esMovil ? 4 : 0);
  }

  private encajar(): void {
    const fov = this.objetivo(this.posActual, this.miraActual);
    this.fovActual = fov;
    this.cam.fov = fov;
    this.cam.position.copy(this.posActual);
    this.cam.lookAt(this.miraActual);
    this.cam.updateProjectionMatrix();
  }

  actualizar(dt: number, quieto: boolean): void {
    if (this.libre) {
      if (!quieto && this.metaPos) {
        const k = 1 - Math.exp(-6.2 * dt);
        this.posLibre.lerp(this.metaPos, k);
        if (this.metaYaw !== null) {
          let diff = this.metaYaw - this.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          this.yaw += diff * k;
        }
        if (this.metaPitch !== null) this.pitch += (this.metaPitch - this.pitch) * k;
        if (this.posLibre.distanceTo(this.metaPos) < 0.04) this.metaPos = null;
      }
      const bob = quieto ? 0 : Math.sin(this.fasePaso) * 0.085;
      this.aplicarLibre(bob);
      return;
    }
    if (quieto) {
      this.sacudida = 0;
      this.encajar();
      return;
    }
    this.reloj += dt;
    this.sacudida = Math.max(0, this.sacudida - dt * 5.2);

    const fovObj = this.objetivo(this.vPosObj, this.vMiraObj);
    const k = 1 - Math.exp(-5.8 * dt);
    this.posActual.lerp(this.vPosObj, k);
    this.miraActual.lerp(this.vMiraObj, k);
    this.fovActual += (fovObj - this.fovActual) * k;

    const respX = Math.sin(this.reloj * 0.7) * 0.04;
    const respY = Math.cos(this.reloj * 1.1) * 0.03;
    const paraX = this.punteroX * 0.16;
    const paraY = -this.punteroY * 0.07;
    const s = this.sacudida * 0.14;
    const sx = s > 0 ? (Math.sin(this.reloj * 57) * s) : 0;
    const sy = s > 0 ? (Math.cos(this.reloj * 63) * s) : 0;

    if (Math.abs(this.cam.fov - this.fovActual) > 0.02) {
      this.cam.fov = this.fovActual;
      this.cam.updateProjectionMatrix();
    }
    this.cam.position.set(this.posActual.x + paraX + respX + sx, this.posActual.y + paraY + respY + sy, this.posActual.z);
    this.cam.lookAt(this.miraActual.x + paraX * 0.45 + sx * 0.4, this.miraActual.y + paraY * 0.4 + sy * 0.4, this.miraActual.z);
  }
}
