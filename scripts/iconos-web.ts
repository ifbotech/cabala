// Los iconos de la web, forjados con el mismo pixel-art del juego: public/favicon.svg (la máscara del Bufón),
// public/icono-192.png y icono-512.png (para el manifest) y public/og.png (la tarjeta al compartir el enlace).
//   npx tsx scripts/iconos-web.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { bufonMapa } from '../src/client/pixel/bufon';
import { nodoMapa } from '../src/client/pixel/iconos';
import { logoMapa } from '../src/client/pixel/logo';
import { dorsoNaipe } from '../src/client/pixel/naipes';
import { tintas } from '../src/client/pixel/paleta';
import { lisos, pegarPixeles, pixeles } from '../src/client/pixel/raster';
import { medida } from '../src/client/pixel/rejilla';
import { guardar } from './png';

const T = tintas();
mkdirSync('public', { recursive: true });

// favicon: el mapa de la máscara como rectángulos SVG (se ve nítido a cualquier tamaño)
const m = nodoMapa('cabala');
const [w, h] = medida(m);
let rects = '';
m.forEach((fila, y) => [...fila].forEach((k, x) => k !== '.' && T[k] && (rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${T[k]}"/>`)));
writeFileSync('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${w + 4} ${h + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${w + 4}" height="${h + 4}" fill="#160c1c"/>${rects}</svg>\n`);

// iconos del manifest: la máscara, grande, sobre la noche
for (const lado of [192, 512]) {
  const k = Math.floor((lado * 0.8) / Math.max(w, h));
  const base = lisos(lado, lado, '#160c1c');
  pegarPixeles(base, pixeles(m, T), Math.round((lado - w * k) / 2), Math.round((lado - h * k) / 2), k);
  guardar(`public/icono-${lado}.png`, base);
}

// tarjeta: el logotipo, el Bufón y tres dorsos sobre la noche (1200 × 630)
const og = lisos(1200, 630, '#160c1c');
const logo = pixeles(logoMapa(), T);
pegarPixeles(og, logo, Math.round((1200 - logo.w * 4) / 2), 60, 4);
const bufon = pixeles(bufonMapa('risa'), T);
pegarPixeles(og, bufon, 90, 320, 3);
['escoba', 'truco', 'chinchon', 'mentiroso', 'chancho'].forEach((d, i) => pegarPixeles(og, pixeles(dorsoNaipe(d), T), 420 + i * 140, 340, 1));
guardar('public/og.png', og);

writeFileSync(
  'public/manifest.webmanifest',
  JSON.stringify(
    {
      name: 'CÁBALA',
      short_name: 'CÁBALA',
      description: 'Roguelike de baraja española en pixel-art oscuro. · A Spanish-Deck Roguelike.',
      start_url: './',
      scope: './',
      display: 'fullscreen',
      orientation: 'any',
      background_color: '#09070f',
      theme_color: '#09070f',
      icons: [
        { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('public/: favicon.svg, icono-192.png, icono-512.png, og.png y manifest.webmanifest');
