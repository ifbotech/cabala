// Genera REGLAS.md a partir de los datos del motor (src/rules): nadie escribe una cifra a mano.   npm run docs
import { writeFileSync } from 'node:fs';
import { JUGADA_COMO, JUGADA_NOMBRE, NODO_DESC, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, RANGO_NOMBRE, TRAMO_NOMBRE } from '../src/client/textos';
import { AMULETO, AMULETOS, RAREZA_NOMBRE, precioBase } from '../src/rules/amuletos';
import { AUMENTO, AUMENTOS, NIVEL_NOMBRE } from '../src/rules/aumentos';
import { B } from '../src/rules/balance';
import { CABALAS } from '../src/rules/bufon';
import { JUGADAS, PALOS } from '../src/rules/cartas';
import type { Jugada } from '../src/rules/cartas';
import { MAZO, MAZOS } from '../src/rules/mazos';
import { MEJORAS, costeMejora } from '../src/rules/perfil';
import { REINADOS } from '../src/rules/reinados';
import { BENDICION, BENDICIONES, REY_DEF } from '../src/rules/reyes';
import { selloDe } from '../src/rules/sellos';
import { MARCA, VERSION } from '../src/shared/brand';
import { OBJETIVOS } from './objetivos';

const L: string[] = [];
const p = (...lineas: string[]) => L.push(...lineas, '');
const tabla = (cab: string[], filas: (string | number)[][]) => p(`| ${cab.join(' | ')} |`, `|${cab.map(() => '---').join('|')}|`, ...filas.map((f) => `| ${f.join(' | ')} |`));
const en = B.enemigos;

p(`# ${MARCA.es.titulo} — Reglas`, `> Versión ${VERSION}. Este archivo se genera con \`npm run docs\` a partir de los datos del motor (\`src/rules\`). No lo edites a mano.`);
p(`*${MARCA.es.lema}* ${MARCA.es.subtitulo} para un jugador. Elegís un Mazo, el Bufón te lleva por tres tramos de caminos y al fondo de cada uno te espera un Rey. Tu mano contra la Corte: cada golpe es **DAÑO × MULTI**.`);

p('## La baraja');
p(`Tu Mazo lleva las cartas del **1 al 9** de los cuatro palos (36) y **${B.jugador.comodines} Comodines**. La Corte —**Sota (10)**, **Caballo (11)** y **Rey (12)** de cada palo— son los enemigos y nunca entran en tu mano.`);
tabla(['Palo', 'Poder'], PALOS.map((s) => [`**${PALO_NOMBRE[s].es}**`, PALO_PODER[s].es]));
p(`Cifras: cada Basto da **${B.palos.escudoPorBasto} de Escudo**, cada Copa cura **${B.palos.curaPorCopa} de Vida**, cada Oro paga **${B.palos.oroPorOro} de oro**. El Escudo frena el Contraataque antes que tu Vida (tope ${B.jugador.escudoMax}).`);
p(`**El Comodín** vale como una copia de tu carta más alta del golpe: mismo número y mismo palo. Al elegirlo, el naipe muestra qué número y qué palo copia. Necesita al menos otra carta a su lado.`);

p('## El turno');
p(
  `1. **Elegí cartas** de tu mano (hasta 5) que formen una jugada y **arrastralas al enemigo** (o tocá GOLPEAR). La tabla de JUGADAS está a un toque en la mesa.`,
  `2. Si el enemigo sigue en pie, **contraataca**: te pega su Ataque (⚔) más la Furia. Tu Escudo frena primero.`,
  `3. **Robás** hasta completar la mano.`,
  '',
  `Además tenés **${B.jugador.descartes} descartes por combate**: descartar no gasta el turno. Solo se golpea al enemigo activo; el resto espera en la pila de la Corte.`,
);

p('## Daño × Multi');
p('> **TOTAL = DAÑO × MULTI** (los dos, siempre enteros). La mesa te muestra la cuenta mientras elegís o arrastrás.');
p(`**Daño**: la base de la jugada más el número de cada carta, más lo que sumen tu Mazo, tus Amuletos y tus Bendiciones. **Multi**: el de la jugada más lo que sume, y al final lo que multiplique (×2, ×3…).`);
tabla(['Jugada', 'Cartas', 'Daño base', 'Multi'], [...JUGADAS, 'quince' as Jugada, 'envido' as Jugada].map((j) => [`**${JUGADA_NOMBRE[j].es}**`, JUGADA_COMO[j].es, `+${B.jugadas[j].d}`, `×${B.jugadas[j].m}`]));

p('### Inmune');
p('Una sola regla: **cada enemigo es Inmune a su propio palo**: las cartas de ese palo no le hacen Daño. En tu mano se ven oscurecidas mientras ese enemigo está activo, y el Mapa te muestra de antemano los palos que te esperan.');
p('### Golpe exacto');
p(`Abatir a un enemigo con un TOTAL **igual a su Vida** es ¡EXACTO!: cobrás **${B.exacto.oro} de oro** y tu próximo golpe lleva **+${B.exacto.multi} de Multi**.`);
p('### Aturdido y Furia');
p(`Un enemigo **Aturdido** se salta su próximo Contraataque. La **Furia** es Ataque de más de la Corte durante un combate, y se ve sumada junto al Ataque del enemigo. Sube por dos motivos: **+${B.furia.reyPorTurno}** cada turno que un Rey sigue en pie, y **+${B.furia.mazoAgotado}** cada vez que se te acaba el Mazo y se baraja el Descarte.`);

p('## La Corte');
tabla(['Enemigo', 'Vida', 'Ataque', 'Escudo'], ([10, 11, 12] as const).map((r) => [`${RANGO_NOMBRE[r].es} (${r})`, (en.vida as Record<string, number>)[r], `⚔ ${(en.ataque as Record<string, number>)[r]}`, r === 11 ? en.escudoCaballo : '—']));
tabla(['Tramo', 'Lugar', 'Vida', 'Ataque'], en.actos.map((a, i) => [i + 1, TRAMO_NOMBRE[i].es, `×${a.vida}`, `+${a.ataque}`]));
p(`La **Guardia Brava** (élite) tiene ×${en.elite.vida} de Vida y +${en.elite.ataque} de Ataque. El **Rey** de cada tramo llega detrás de su Sota y su Caballo, con ×${en.jefe.vida} de Vida. Por cada Bendición suya que llevés, arranca con ${Math.round(en.jefe.sangreConocida * 100)} % menos de Vida (tope ${Math.round(en.jefe.sangreTope * 100)} %).`);

p('## Los 4 Reyes');
p('Cada Rey te corteja con Bendiciones y, si es el jefe de un tramo, te enfrenta con su rasgo. Cada uno tiene **una carga** con una sola regla para los cuatro: **cada enemigo que abatís con su palo en el golpe, +1** (si llevás algún don suyo).');
tabla(['Rey', 'Apodo', 'Carga', 'Lo que da cada punto', 'Rasgo de jefe'], PALOS.map((s) => [REY_DEF[s].nombre.es, `**${REY_DEF[s].apodo.es}**`, REY_DEF[s].carga.es, REY_DEF[s].cargaDa.es, `*${REY_DEF[s].rasgo.es}*: ${REY_DEF[s].rasgoDesc.es}`]));
p('### Bendiciones');
p('Tras cada combate de Guardia, tres Reyes ofrecen un don cada uno: te quedás con uno. Repetir un don **sube su nivel** (hasta 3). Los **Pactos Duales** solo aparecen si ya llevás un don de cada uno de sus dos Reyes.');
tabla(
  ['Bendición', 'Rey', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Sello'],
  BENDICIONES.map((id) => {
    const d = BENDICION[id];
    return [`**${d.nombre.es}**`, d.dual ? `${REY_DEF[d.rey].apodo.es} + ${REY_DEF[d.dual].apodo.es}` : REY_DEF[d.rey].apodo.es, d.desc(1).es, d.niveles > 1 ? d.desc(2).es : '—', d.niveles > 2 ? d.desc(3).es : '—', selloDe('bendicion', id)];
  }),
);

p('## Amuletos');
p(`Exactamente **${OBJETIVOS.amuletos}**: tres por palo (uno Común, uno Raro, uno Épico) y tres del Bufón, todos Legendarios. Llevás hasta **${B.jugador.huecos}** (uno más con el Altar). Salen de la Guardia Brava, de los Reyes y de la Pulpería.`);
tabla(['Amuleto', 'De', 'Rareza', 'Efecto', 'Precio', 'Sello'], AMULETOS.map((id) => [`**${AMULETO[id].nombre.es}**`, AMULETO[id].palo === 'X' ? 'El Bufón' : PALO_NOMBRE[AMULETO[id].palo as 'S'].es, RAREZA_NOMBRE[AMULETO[id].rareza].es, AMULETO[id].desc.es, precioBase(id), selloDe('amuleto', id)]));
p('**El sello** (S · A · B) de cada pieza sale del laboratorio (`npm run analyze:meta`): en miles de partidas con elecciones al azar se compara ganar habiéndola elegido contra ganar habiéndola visto y dejado pasar. El tercio que más sube la victoria lleva S; el que menos, B. En la mesa el sello se enciende a **S+** o **★ SINERGIA** con una micro-etiqueta cuando la pieza potencia tu Mazo o lo que ya llevás.');

p('## Aumentos del Bufón');
p(`Son **${AUMENTOS.length}**, todos pasivos: jamás entran en tu mano. Se eligen de a tres en la pantalla **«ELEGÍ UNA CÁBALA»**: una de Plata al empezar, una de Oro tras el primer Rey y una Prismática tras el segundo (ahí también viven las Maldiciones: mucho poder con su precio).`);
tabla(['Aumento', 'Nivel', 'Efecto', 'Sello'], AUMENTOS.map((id) => [`**${AUMENTO[id].nombre.es}**`, AUMENTO[id].maldicion ? 'Prismático · Maldición' : NIVEL_NOMBRE[AUMENTO[id].nivel].es, AUMENTO[id].desc.es, selloDe('aumento', id)]));

p('## Los 5 Mazos');
tabla(
  ['Mazo', 'Personaje', 'Vida · mano', 'Regla estrella', 'Se abre con'],
  MAZOS.map((m) => [`**${MAZO[m].nombre.es}** · ${MAZO[m].lema.es}`, MAZO[m].personaje.es, `${B.mazos[m].vida} · ${B.mazos[m].mano}`, MAZO[m].regla.es, MAZO[m].desbloqueo ? MAZO[m].desbloqueo!.texto.es : 'abierto desde el principio']),
);
for (const m of MAZOS) p(`**${MAZO[m].nombre.es}** (${MAZO[m].canto.es})`, ...MAZO[m].reglas.map((r) => `- ${r.es}`));

p('## El camino');
p(`Tres tramos (${TRAMO_NOMBRE.map((t) => t.es).join(', ')}), cada uno con cinco pisos de tres nodos y su Rey al fondo. De cada nodo salen uno o dos caminos. El Bufón te presenta el Mapa.`);
tabla(['Nodo', 'Qué pasa'], (Object.keys(NODO_NOMBRE) as (keyof typeof NODO_NOMBRE)[]).map((n) => [`**${NODO_NOMBRE[n].es}**`, NODO_DESC[n].es]));
p(`**Pulpería** (la atiende el Bufón): Amuletos (Común ${B.pulperia.precio.comun}, Raro ${B.pulperia.precio.raro}, Épico ${B.pulperia.precio.epico}, Legendario ${B.pulperia.precio.legendario} de oro), **Purgar** una carta (${B.pulperia.purgar} de oro, +${B.pulperia.purgarSube} cada vez; tu Mazo no baja de ${B.jugador.mazoMin}) y **Curar** ${Math.round(B.pulperia.curarPct * 100)} % de tu Vida (${B.pulperia.curar} de oro, +${B.pulperia.curarSube} cada vez).`);
p(`**Fogón**: descansar (curás ${Math.round(B.fogon.curaPct * 100)} % de tu Vida) o quemar un naipe, gratis. **Tras un Rey** curás ${Math.round(B.botin.curaRey * 100)} % de tu Vida.`);
p('### El Bufón y sus Cábalas');
p(`El Bufón es el único anfitrión del juego y un chanta: lleva un **humor** (de garca a «de tu lado»). Seguirle un truco lo sube; rechazarlo lo baja. Cuando el truco se juega a la suerte, sale bien el ${Math.round(B.bufon.suerteBase * 100)} % de las veces, ±${Math.round(B.bufon.suertePorAfinidad * 100)} puntos por cada punto de humor. Si lo rechazás estando garca, le sopla tu juego al próximo Rey (+${B.bufon.furiaGarca} de Furia).`);
tabla(['Cábala', 'Humor', 'Opciones'], CABALAS.map((c) => [`**${c.titulo.es}**`, c.humor === 'buena' ? 'de tu lado' : c.humor === 'garca' ? 'garca' : 'cualquiera', c.opciones.map((o) => `*${o.texto.es}*: ${o.detalle.es}`).join(' · ')]));

p('## El Altar');
p(`Ganes o pierdas, cada partida deja **Porotos** (${B.porotos.combate} por combate, ${B.porotos.elite} por Guardia Brava, ${B.porotos.rey} por Rey y ${B.porotos.victoria} por ganar). Se gastan en el Altar: una sola pantalla con ${MEJORAS.length} mejoras directas.`);
tabla(['Mejora', 'Efecto', 'Niveles', 'Coste de cada nivel'], MEJORAS.map((m) => [`**${m.nombre.es}**`, m.desc.es, m.max, Array.from({ length: m.max }, (_, i) => costeMejora(m.id, i)).join(' · ')]));

p('## Reinados');
p('Ganar una partida abre el Reinado siguiente (hasta el 8). Cada uno suma su giro a todos los anteriores.');
tabla(['Reinado', 'Nombre', 'Giro'], REINADOS.map((r) => [r.n, r.nombre.es, r.giro.es]));

writeFileSync('REGLAS.md', L.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
console.log(`REGLAS.md generado (${L.length} líneas)`);
