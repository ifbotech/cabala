// Levanta el servidor de desarrollo de Vite dentro del propio script (sin procesos en segundo plano) y lo cierra al
// terminar. Lo usan la QA visual, la de humo y la de FPS.
import { createServer, type ViteDevServer } from 'vite';

export async function conServidor<T>(puerto: number, tarea: (url: string) => Promise<T>): Promise<T> {
  const servidor: ViteDevServer = await createServer({ server: { port: puerto, strictPort: false, host: '127.0.0.1' }, logLevel: 'error', clearScreen: false });
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
