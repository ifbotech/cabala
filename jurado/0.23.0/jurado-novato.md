```json
{
  "jurado": "jurado-novato",
  "version": "0.23.0",
  "puntajes": { "claridad": 7.8, "diversion": 8.0, "estetica": 8.1, "veredicto": 7.9 },
  "defectos": [
    { "prioridad": "P0", "pantalla": "mesa-exacto (cuenta con cartas en el paño)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:362-367 (dialHtml: el chip solo dice «R3 EXACTO», y su explicación vive en un tip); src/client/textos.ts:308-311 (chipExacto = la misma palabra que el veredicto «¡EXACTO!» de textos.ts:49); src/client/nav.ts:236", "que": "La cuenta dice, en un mismo renglón, «LO ABATÍS · [R3] EXACTO · SOBRAN 24». Lo leo como «es exacto, pero sobran 24»: una contradicción. El chip naranja usa la misma palabra y casi el mismo color que el veredicto «¡EXACTO!», que aparece cuando el golpe sí es justo. No dice qué hace ni qué gano: no sé que es un botón que reacomoda las cartas, ni que el Golpe exacto paga oro y Multi, porque eso está en el glosario, abajo de todo en JUGADAS. Además lo activa R3 (hundir el stick), un botón que ningún novato aprieta.", "por_que": "Es la novedad de la versión en la pantalla donde más decido, y la leo al revés: creo que mi golpe ya es exacto y lo suelto así. O lo aprieto, veo que el 144 baja, y siento que el juego me sacó Daño sin razón. Un estado y una acción no pueden usar la misma palabra.", "propuesta": "Que el chip sea un verbo con premio: «R3 · DEJALO JUSTO: +N oro, +M Multi» (y «R3 · PEGÁ AL MÁXIMO» para volver). Cuando aparece por primera vez, que el Bufón lo diga en una línea. Si el veredicto ya es «¡EXACTO!», no mostrar nunca un chip con esa palabra. Dar también un botón de cara (X o Y largo, o un toque en la cuenta) y dejar R3 como atajo." },
    { "prioridad": "P1", "pantalla": "oferta-evoluciona (Elegí un Amuleto)", "ventana": "1280x800", "archivo": "src/client/ui.ts:317 (el sello no usa la causa); src/client/textos.ts:316 (evolucionCon «con tu don de {p}» está definido y no se usa en ningún lado); src/client/textos.ts:753 (EVO_GANA.caliz «Multi siempre, y más»); src/rules/evoluciones.ts (nombre Brindis de Sangre)", "que": "Avanzó: ahora el sello trae el sprite y una línea de ganancia. Pero el Cáliz dice «★ EVOLUCIONA · BRINDIS DE SANGRE · + Multi siempre, y más». «Y más» no es una regla, y sigue sin decir por qué evoluciona (el don del Rey de Copas). El texto existe en textos.ts, pero nadie lo pinta. Y abajo, en el HUD, dice «BRINDIS 4 · +4 vida»: sigo creyendo que la Evolución mejora esa carga.", "por_que": "Elegir una Evolución tendría que ser la decisión más jugosa del botín, y la tomo a ciegas. Como no veo la causa, no aprendo a buscarla la próxima partida, y el nombre me hace confundir dos piezas distintas.", "propuesta": "Debajo del sello, dos renglones a la vista: «con tu don de Copas →» y la regla entera de EVOLUCION.desc («+2 de Multi siempre; con 80 % de Vida, +1 más»), sin «y más». Renombrar la Evolución del Cáliz para que no contenga «Brindis»." },
    { "prioridad": "P2", "pantalla": "resumen-derrota / fin-derrota y resumen-victoria", "ventana": "1280x800", "archivo": "src/client/textos.ts:293 y :306 (BUILD ESTRELLA, ESTA); src/client/pantallas/camino.ts:1213-1229; src/client/estilos/pantallas.css:3919-3934 (gap var(--u) entre cifras)", "que": "El resumen es lindo y OTRA MANO YA es una invitación perfecta, pero tiene tres trabas. (1) «BUILD ESTRELLA» es inglés de foro en un juego que dice «Pulpería» y «Fogón». (2) En la derrota, «PRÓXIMO RÉCORD · GOLPE MÁS GRANDE · ESTA TU MEJOR · 819 1284»: los rótulos quedan pegados y las dos cifras se leen como un solo número. «ESTA» sin tilde no dice «esta partida». (3) «TU JUGADA Envido» con el mazo Escoba: es una jugada que no vi en la tabla principal de JUGADAS.", "por_que": "Es la pantalla que decide si juego otra. Si la comparación con mi récord no se lee de un vistazo, pierde la gracia de tenerla.", "propuesta": "«LO MEJOR DE TU MANO» o «TU JUGADA ESTRELLA». Columnas separadas con más aire y un «vs» o una raya entre «ESTA PARTIDA 819» y «TU MEJOR 1284». Mostrar la jugada favorita con su forma de una línea (JUGADA_COMO)." }
  ],
  "aciertos": [
    "El jackpot de la Evolución ahora se lee: «DESPIERTA PONCHO DEL CACIQUE», el sprite viejo ▶ el nuevo, el nombre y la regla entera. Los primeros 400 ms se tragan la entrada, así que mi primer botón ya no lo borra.",
    "LO QUE LLEVÁS muestra la forma despierta: «SOL DE LA TIMBA · Evolución de Cofre del Caudal» y «BRINDIS DE SANGRE · Evolución de Cáliz del Bacanal», con su regla verdadera. El HUD con foco también lo dice.",
    "La tercera pasada del Fogón es una elección clara: «Templada: +8 de Daño y +1 de Multi». Hay dos botones grandes con lo que hacen y lo que cuestan («te corta 2 de Vida (nunca te mata)») y «50 % de que se queme». Ya en la Forja Brava, el foco cae en SEGUIR.",
    "DEVOLVER en el Altar se entiende sin leer: «Bajás un nivel y te vuelven 70 Porotos: todo lo que costó.»",
    "OTRA MANO YA, como botón principal del final, con «QUÉ TE FRENÓ · El Caudillo en el tramo 2 · le quedaba 50%»: me dice qué falló y me devuelve a la mesa en un toque."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/fogon-mutaciones.png", "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/oferta-evoluciona.png", "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/hud-evolucion.png", "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/resumen-derrota.png", "visual-qa/1280x800/resumen-victoria.png", "visual-qa/1280x800/altar-devolver.png",
    "jurado/secuencias/1280-golpe-00, 03, 06, 09.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano?** Bajo a cero la barra de cada uno de la Corte («LA CORTE · QUEDA 1»). Claro.
- **¿Qué hace el enemigo?** «TE PEGA 19 · 21 − 2 ESCUDO · FURIA 3 ya incluida · +3 por turno». Clarísimo. «TE PEGA 0 · Cara de Póker» todavía parece el nombre de alguien.
- **Números del enemigo:** Vida, TE PEGA y Furia, bien. El «10» del naipe enemigo sigue siendo la cifra más grande y no significa nada.
- **Furia, Inmune, Escudo, Multi, canto:** claros. **Golpe exacto:** solo en el glosario. Y ahora el chip EXACTO me confunde más (P0). **Comodín:** JUGADAS lo explica en una línea.
- **Palabras o cifras que no entiendo:** el chip «R3 EXACTO», «+12 ★ ×2», BUILD ESTRELLA, «Envido», «Escalón +2» (¿de qué?), «lo que le dejó el fuego», «6 MÁS», «Hueco de Amuleto» en amarillo en el Altar.

## Defectos menores

- Ya forjado, el chip «DOBLE FILO» vuelve a esconder su costo en un tip, y «+12 ★ ×2» sigue sin glosa (`src/client/pantallas/camino.ts:866-868`).
- «3 o más en subida: Escalón +2» no dice «de Multi» (`src/client/textos.ts:271`).
- Al glosario le faltan Evolución, Forja Brava/Templada, Porotos y Cara de Póker, y sigue abajo de todo (`src/client/pantallas/camino.ts:159-177`).
- Siguen las familias de nombres: Chispa / Chispa de Oro, Filo / Doble Filo, Porotos / Poroto de Yapa (`src/client/textos.ts:738-740`, `src/rules/chiches.ts`).
- En golpe-03, los «+4» y «+12» flotan sobre la madera y sobre DESCARTAR, lejos de la pieza que los da (`src/client/pantallas/mesa.ts`, conteo).

## Contra mi veredicto de la previa

**Resueltos:** el jackpot (antes ▶ después, regla y 400 ms firmes), LO QUE LLEVÁS con la Evolución, el foco del mando en SEGUIR, la mutación a la vista al elegirla y el Fósforo que se niega en vano. **Siguen:** la causa de la Evolución en la oferta, los nombres que se pisan, el glosario incompleto y «Escalón +2».

## Qué haría en la próxima versión

Un pase de «cada chip es un verbo con premio». (1) El dial del paño dice qué hace y qué paga («DEJALO JUSTO: +3 oro, +1 Multi»), nunca repite la palabra del veredicto y tiene un botón de cara. La primera vez, que lo diga el Bufón. (2) La oferta de Evolución pinta `evolucionCon` y la regla entera, y la del Cáliz se renombra. Una prueba recorre todos los nombres visibles y falla si uno contiene a otro. (3) El glosario se arma con lo que emite el motor más lo que llevás (Evolución, Templada ★, Forja Brava, Porotos, Cara de Póker) y abre arriba en JUGADAS. (4) El resumen final en castellano («TU JUGADA ESTRELLA»), con esta partida contra tu mejor en dos columnas que respiren. (5) La mutación ya forjada muestra su costo en una línea. Nada toca la Constitución. Con el P0 resuelto, la claridad pasaría de 8.
