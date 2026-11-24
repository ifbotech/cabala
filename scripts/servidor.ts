// Levanta el servidor de desarrollo de Vite dentro del propio script (sin procesos en segundo plano) y lo cierra al
// terminar. Lo usan la QA visual, la de humo y la de FPS.
import { realpathSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

/** Lanza Chromium con soporte WebGL habilitado (GPU D3D11 en Windows o SwiftShader en CI headless). */
export async function abrirNavegador(): Promise<Browser> {
  if (process.platform === 'win32') {
    try {
      return await chromium.launch({
        channel: 'chromium',
        args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-zero-copy'],
      });
    } catch {
      // fallback a SwiftShader si el canal chromium no está disponible
    }
  }
  return chromium.launch({
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'],
  });
}

// (0.28) `fs.allow` con la ruta real de node_modules: en una copia de trabajo con node_modules enlazado, Vite negaba
// las fuentes (403) y la QA de humo lo contaba como error de consola.
export async function conServidor<T>(puerto: number, tarea: (url: string) => Promise<T>): Promise<T> {
  const servidor: ViteDevServer = await createServer({ server: { port: puerto, strictPort: false, host: '127.0.0.1', fs: { allow: [process.cwd(), realpathSync('node_modules')] } }, logLevel: 'error', clearScreen: false });
  await servidor.listen();
  const dir = servidor.resolvedUrls?.local[0] ?? `http://127.0.0.1:${puerto}/`;
  try {
    return await tarea(dir.replace(/\/$/, ''));
  } finally {
    await servidor.close();
  }
}

/** Las cuatro ventanas de la QA: escritorio grande, portátil, Steam Deck y móvil. */
export const VENTANAS = [
  { nombre: '1920x1080', w: 1920, h: 1080 },
  { nombre: '1366x768', w: 1366, h: 768 },
  { nombre: '1280x800', w: 1280, h: 800 },
  { nombre: '390x844', w: 390, h: 844 },
] as const;
