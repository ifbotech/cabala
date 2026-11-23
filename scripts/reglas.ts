// Genera REGLAS.md a partir de los datos del motor (src/rules): nadie escribe una cifra a mano.   npm run docs
import { writeFileSync } from 'node:fs';
import { JUGADA_COMO, JUGADA_NOMBRE, NODO_DESC, NODO_NOMBRE, PALO_NOMBRE, PALO_PODER, RANGO_NOMBRE, TRAMO_NOMBRE } from '../src/client/textos';
import { AMULETO, AMULETOS, RAREZA_NOMBRE, precioBase } from '../src/rules/amuletos';
import { AUMENTO, AUMENTOS, NIVEL_NOMBRE } from '../src/rules/aumentos';
import { B } from '../src/rules/balance';
import { CABALAS } from '../src/rules/bufon';
import { CHICHE, CHICHES } from '../src/rules/chiches';
import { EVOLUCION, EVOLUCIONES } from '../src/rules/evoluciones';
import { JUGADAS, PALOS } from '../src/rules/cartas';
import type { Jugada } from '../src/rules/cartas';
import { COLUMNAS, PISOS, REGLAS_MAPA } from '../src/rules/mapa';
import { MAZO, MAZOS } from '../src/rules/mazos';
import { MEJORAS, costeMejora } from '../src/rules/perfil';
import { REINADOS } from '../src/rules/reinados';
import { BENDICION, BENDICIONES, REY_DEF } from '../src/rules/reyes';
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
p(`Cifras: cada Basto da **${B.palos.escudoPorBasto} de Escudo**, cada Copa cura **${B.palos.curaPorCopa} de Vida**, cada Oro paga **${B.palos.oroPorOro} de oro**. El Escudo frena el Contraataque antes que tu Vida (tope ${B.jugador.escudoMax}). **La defensa crece con el tramo:** en el segundo tramo el Escudo por Basto, la cura por Copa y el tope de Escudo valen ×${B.jugador.escalaTramo[1]}, y en el tercero ×${B.jugador.escalaTramo[2]}.`);
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

p('### El paño: las Postas');
p(
  `Las cartas del golpe se apoyan en las **Postas del paño**, tantas como tu mano (de 3 a 5). Al elegirlas, **la mesa las acomoda sola en la mejor disposición**; podés reordenarlas arrastrando o con LB/RB y la cuenta cambia al instante. Si otra manera de apoyar esas mismas cartas abate con **Golpe exacto**, la mesa te la ofrece con el chip **EXACTO**.`,
  '',
  `- **Posta del Medio** (rombo de oro): el naipe que cae ahí pega **×${B.postas.medio} su número** de Daño.`,
  `- **Chispa**: el naipe a la **derecha de un Comodín** pega **×${B.postas.chispa} su número** de Daño.`,
  `- **Escalón**: tres o más naipes en orden estrictamente creciente de izquierda a derecha, **+${B.postas.escalon} de Multi**.`,
);
p('### Los Chiches');
p(
  `Consumibles de un solo uso que se apoyan **sobre la madera, a la derecha de la mesa** (nunca en la mano). Entran **${B.chiches.huecos}**. Usarlos no gasta el turno: un clic, o arrastralos al enemigo. Se compran en La Pulpería (${B.chiches.precio} de oro) y, al abatir con Golpe exacto, al pelo o cantando, la Corte a veces suelta uno como **Prenda** (${Math.round(B.chiches.prenda * 100)} %).`,
);
tabla(['Chiche', 'Efecto'], CHICHES.map((id) => [`**${CHICHE[id].nombre.es}**`, CHICHE[id].desc.es]));

p('### Evoluciones, Forja Brava, Cábala Negra y Tesoros');
p(
  `- **Evoluciones.** Si llevás uno de los cuatro Amuletos de palo de rareza épica y además juntás **${B.evoluciones.despierta} niveles de dones** del Rey de su palo (cada nivel de cada don suyo cuenta uno), el Amuleto evoluciona solo (siguen siendo 15 Amuletos). La pieza que despierta una lleva el sello **★ EVOLUCIONA**.`,
);
tabla(['Amuleto', 'Evoluciona en', 'Qué hace'], EVOLUCIONES.map((de) => [`**${AMULETO[de].nombre.es}**`, `**${EVOLUCION[de].nombre.es}**`, EVOLUCION[de].desc.es]));
p(
  `- **Forja Brava.** El Fogón tiene ${B.fogon.pasadas} pasadas sobre un naipe: +${B.fogon.temple} de Daño, Templada (+${B.fogon.multiTemplada} de Multi al jugarla) y **¡FORJA BRAVA!**, que duplica el naipe entero (su número y su temple) y le deja la mutación que elijas entre dos a la vista: **Doble Filo** (+${B.fogon.dobleFilo.multi} de Multi, te corta ${B.fogon.dobleFilo.vida} de Vida), **Roba Carta** (robás ${B.fogon.robaCarta}) o **Chispa de Oro** (+${B.fogon.chispaOro} de oro). La segunda pasada arriesga quemar el naipe un ${Math.round(B.fogon.riesgos[1] * 100)} % y la tercera un ${Math.round(B.fogon.riesgos[2] * 100)} %.`,
  `- **Cábala Negra.** Una vez por partida, desde el segundo tramo, el Bufón cose naipes: **coser dos iguales** (dos del mismo número se vuelven uno que junta lo suyo y pega de más) o **trasplantar** (el primero se sacrifica y el segundo toma su palo y lo que le dejó el fuego).`,
  `- **Tesoros a la Vista.** El Mapa muestra algunos nodos con cofre: tras la Élite se abre solo; tras la Guardia, con candado de ${B.tesoros.precio} de oro. Adentro hay dos Amuletos para elegir uno.`,
);

p('### Inmune');
p('Una sola regla: **cada enemigo es Inmune a su propio palo**: las cartas de ese palo no le hacen Daño. En tu mano se ven oscurecidas mientras ese enemigo está activo, y el Mapa te muestra de antemano los palos que te esperan.');
p('### Golpe exacto');
p(`**Al pelo:** si te pasás por muy poco (hasta el ${Math.round(B.exacto.alPelo * 100)} % de la Vida máxima del enemigo), cobrás **${B.exacto.oroAlPelo} de oro**, la racha no se corta y el Cetro del Bufón se recarga.`);
p(`Abatir a un enemigo con un TOTAL **igual a su Vida** es ¡EXACTO!: cobrás **${B.exacto.oro} de oro** y tu próximo golpe lleva **+${B.exacto.multi} de Multi**. La mesa te dice cuánto le queda al enemigo o cuánto te sobra. **Racha:** cada exacto seguido sube el premio (+2 con el segundo, +${B.exacto.rachaTope} con el tercero, que es el tope); se corta al abatir a un enemigo sin exactitud.`);
p('### Aturdido y Furia');
p(`Un enemigo **Aturdido** se salta su próximo Contraataque. La **Furia** es Ataque de más de la Corte durante un combate, y se ve sumada junto al Ataque del enemigo. Sube por dos motivos: **+${B.furia.reyPorTurno}** cada turno que un Rey sigue en pie, y **+${B.furia.mazoAgotado}** cada vez que se te acaba el Mazo y se baraja el Descarte.`);

p('## La Corte');
tabla(['Enemigo', 'Vida', 'Ataque', 'Escudo'], ([10, 11, 12] as const).map((r) => [`${RANGO_NOMBRE[r].es} (${r})`, (en.vida as Record<string, number>)[r], `⚔ ${(en.ataque as Record<string, number>)[r]}`, r === 11 ? en.escudoCaballo : '—']));
tabla(['Tramo', 'Lugar', 'Vida', 'Ataque'], en.actos.map((a, i) => [i + 1, TRAMO_NOMBRE[i].es, `×${a.vida}`, `+${a.ataque}`]));
p(`La **Guardia Brava** (élite) tiene ×${en.elite.vida} de Vida y +${en.elite.ataque} de Ataque. El **Rey** de cada tramo llega detrás de su Sota y su Caballo, con ×${en.jefe.vida} de Vida. Por cada Bendición suya que llevés, arranca con ${Math.round(en.jefe.sangreConocida * 100)} % menos de Vida (tope ${Math.round(en.jefe.sangreTope * 100)} %).`);

p('## Los 4 Reyes');
p('Cada Rey te corteja con Bendiciones y, si es el jefe de un tramo, te enfrenta con su rasgo. Cada uno tiene **una carga** con una sola regla para los cuatro: **cada enemigo que abatís con su palo en el golpe, +1** (si llevás algún don suyo).');
tabla(['Rey', 'Apodo', 'Carga', 'Lo que da cada punto', 'Rasgo de jefe'], PALOS.map((s) => [REY_DEF[s].nombre.es, `**${REY_DEF[s].apodo.es}**`, REY_DEF[s].carga.es, REY_DEF[s].cargaDa.es, `*${REY_DEF[s].rasgo.es}*: ${REY_DEF[s].rasgoDesc.es}`]));
p('**La segunda cara.** Cuando un Rey baja a media Vida, la pelea cambia:');
for (const s of PALOS) p(`- **${REY_DEF[s].apodo.es} · ${REY_DEF[s].segunda.es}.** ${REY_DEF[s].segundaDesc.es}`);
p('### Bendiciones');
p('Tras cada combate de Guardia, tres Reyes ofrecen un don cada uno: te quedás con uno. Repetir un don **sube su nivel** (hasta 3). Los **Pactos Duales** solo aparecen si ya llevás un don de cada uno de sus dos Reyes.');
tabla(
  ['Bendición', 'Rey', 'Nivel 1', 'Nivel 2', 'Nivel 3'],
  BENDICIONES.map((id) => {
    const d = BENDICION[id];
    return [`**${d.nombre.es}**`, d.dual ? `${REY_DEF[d.rey].apodo.es} + ${REY_DEF[d.dual].apodo.es}` : REY_DEF[d.rey].apodo.es, d.desc(1).es, d.niveles > 1 ? d.desc(2).es : '—', d.niveles > 2 ? d.desc(3).es : '—'];
  }),
);

p('## Amuletos');
p(`Exactamente **${OBJETIVOS.amuletos}**: tres por palo (uno Común, uno Raro, uno Épico) y tres del Bufón, todos Legendarios. Llevás hasta **${B.jugador.huecos}** (uno más con el Altar). Salen de la Guardia Brava, de los Reyes y de la Pulpería.`);
tabla(['Amuleto', 'De', 'Rareza', 'Efecto', 'Precio'], AMULETOS.map((id) => [`**${AMULETO[id].nombre.es}**`, AMULETO[id].palo === 'X' ? 'El Bufón' : PALO_NOMBRE[AMULETO[id].palo as 'S'].es, RAREZA_NOMBRE[AMULETO[id].rareza].es, AMULETO[id].desc.es, precioBase(id)]));
p('Las piezas no llevan nota ni nivel: se eligen por lo que hacen. Cuando una potencia tu Mazo o algo que ya llevás, la mesa le pone la etiqueta **★ SINERGIA** con una línea que dice por qué.');

p('## Aumentos del Bufón');
p(`Son **${AUMENTOS.length}**, todos pasivos: jamás entran en tu mano. Se eligen de a tres en la pantalla **«ELEGÍ UNA CÁBALA»**: una de Plata al empezar, una de Oro tras el primer Rey y una Prismática tras el segundo (ahí también viven las Maldiciones: mucho poder con su precio).`);
tabla(['Aumento', 'Nivel', 'Efecto'], AUMENTOS.map((id) => [`**${AUMENTO[id].nombre.es}**`, AUMENTO[id].maldicion ? 'Prismático · Maldición' : NIVEL_NOMBRE[AUMENTO[id].nivel].es, AUMENTO[id].desc.es]));

p('## Los 5 Mazos');
tabla(
  ['Mazo', 'Personaje', 'Vida · mano', 'Regla estrella', 'Se abre con'],
  MAZOS.map((m) => [`**${MAZO[m].nombre.es}** · ${MAZO[m].lema.es}`, MAZO[m].personaje.es, `${B.mazos[m].vida} · ${B.mazos[m].mano}`, MAZO[m].regla.es, MAZO[m].desbloqueo ? MAZO[m].desbloqueo!.texto.es : 'abierto desde el principio']),
);
for (const m of MAZOS) p(`**${MAZO[m].nombre.es}** (${MAZO[m].canto.es})`, ...MAZO[m].reglas.map((r) => `- ${r.es}`));

p('## El camino');
p(`Tres tramos (${TRAMO_NOMBRE.map((t) => t.es).join(', ')}). Cada tramo es un Mapa que **se sube desde abajo**: ${PISOS} pisos y, arriba, su Rey. La red de caminos sale de la semilla y no repite la forma: en cada piso hay de 1 a ${COLUMNAS} lugares, y de cada uno salen hasta tres caminos hacia arriba. A veces hay dos entradas, a veces cuatro; a veces todo pasa por un solo lugar.`);
p(`El azar del Mapa tiene reglas, y se cumplen siempre: se empieza con una Guardia; el último piso antes del Rey es un Fogón o una Pulpería; la Guardia Brava no aparece antes del piso ${REGLAS_MAPA.pisoElite + 1} y siempre hay un camino que la esquiva (hay de ${REGLAS_MAPA.elites[0]} a ${REGLAS_MAPA.elites[1]} por tramo); nada que no sea una Guardia se repite pegado; una bifurcación nunca ofrece dos veces lo mismo; y cualquier recorrido de un tramo tiene entre ${REGLAS_MAPA.combates[0]} y ${REGLAS_MAPA.combates[1]} combates antes del Rey.`);
tabla(['Nodo', 'Qué pasa'], (Object.keys(NODO_NOMBRE) as (keyof typeof NODO_NOMBRE)[]).map((n) => [`**${NODO_NOMBRE[n].es}**`, NODO_DESC[n].es]));
p(`**Pulpería** (la atiende el Bufón): Amuletos (Común ${B.pulperia.precio.comun}, Raro ${B.pulperia.precio.raro}, Épico ${B.pulperia.precio.epico}, Legendario ${B.pulperia.precio.legendario} de oro), **Purgar** una carta (${B.pulperia.purgar} de oro, +${B.pulperia.purgarSube} cada vez; tu Mazo no baja de ${B.jugador.mazoMin}) y **Curar** ${Math.round(B.pulperia.curarPct * 100)} % de tu Vida (${B.pulperia.curar} de oro, +${B.pulperia.curarSube} cada vez).`);
p(`**Fogón**: descansar (curás ${Math.round(B.fogon.curaPct * 100)} % de tu Vida) o **templar un naipe**, hasta ${B.fogon.pasadas} pasadas por el fuego. La primera es segura: +${B.fogon.temple} de Daño para siempre. La segunda (${Math.round(B.fogon.riesgos[1] * 100)} % de quemarlo) suma otros +${B.fogon.temple} y lo deja **Templado**: +${B.fogon.multiTemplada} de Multi cada vez que lo jugás. La tercera (${Math.round(B.fogon.riesgos[2] * 100)} % de quemarlo) es la **Forja Brava**: su número vale doble en el Daño. Si se quema, lo perdés. **Tras un Rey** curás ${Math.round(B.botin.curaRey * 100)} % de tu Vida.`);
p('### El Bufón y sus Cábalas');
p(`El Bufón es el único anfitrión del juego y un chanta. Te sigue pantalla por pantalla: se esfuma en una nube de humo y reaparece en la siguiente; lo que dice se escribe, suena y al rato se va. Además lleva un **humor** (de garca a «de tu lado»). Seguirle un truco lo sube; rechazarlo lo baja. Cuando el truco se juega a la suerte, sale bien el ${Math.round(B.bufon.suerteBase * 100)} % de las veces, ±${Math.round(B.bufon.suertePorAfinidad * 100)} puntos por cada punto de humor. Si lo rechazás estando garca, le sopla tu juego al próximo Rey (+${B.bufon.furiaGarca} de Furia).`);
tabla(['Cábala', 'Humor', 'Opciones'], CABALAS.map((c) => [`**${c.titulo.es}**`, c.humor === 'buena' ? 'de tu lado' : c.humor === 'garca' ? 'garca' : 'cualquiera', c.opciones.map((o) => `*${o.texto.es}*: ${o.detalle.es}`).join(' · ')]));

p('## El Altar');
p(`Ganes o pierdas, cada partida deja **Porotos** (${B.porotos.combate} por combate, ${B.porotos.elite} por Guardia Brava, ${B.porotos.rey} por Rey y ${B.porotos.victoria} por ganar). Se gastan en el Altar: una sola pantalla con ${MEJORAS.length} mejoras directas.`);
tabla(['Mejora', 'Efecto', 'Niveles', 'Coste de cada nivel'], MEJORAS.map((m) => [`**${m.nombre.es}**`, m.desc.es, m.max, Array.from({ length: m.max }, (_, i) => costeMejora(m.id, i)).join(' · ')]));

p('## Reinados');
p('Ganar una partida abre el Reinado siguiente (hasta el 8). Cada uno suma su giro a todos los anteriores.');
tabla(['Reinado', 'Nombre', 'Giro'], REINADOS.map((r) => [r.n, r.nombre.es, r.giro.es]));

writeFileSync('REGLAS.md', L.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
console.log(`REGLAS.md generado (${L.length} líneas)`);
