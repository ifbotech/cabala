```json
{
  "jurado": "jurado-ux-deck",
  "version": "0.15.0",
  "puntajes": { "claridad": 7.1, "diversion": 7.5, "estetica": 8.3, "veredicto": 7.3 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa durante el golpe (conteo pieza por pieza)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:713-722; src/client/estilos/mesa.css:1582-1592", "que": "El cartel del conteo (.c-vuela) se clava centrado en rc.bottom de la cuenta con translate -100%: cae justo encima del renglón fijo del desglose. En 1280-golpe-05 «Short hand +4» tapa «Seasoned Mate +24», que es la pieza que más suma; en 1280-golpe-03 «Calls made +10» tapa su propio renglón y la cuenta se monta («FLORDAMAGE 26»), mientras los «+2 +3 +5» de las cartas pisan sus índices.", "por_que": "La versión resolvió la explicación del golpe con un desglose fijo de 18 px que sí se lee a 40 cm, y el conteo animado la borra en el momento exacto en que el jugador la mira. Dos textos de 18-20 px superpuestos en un panel de 7 pulgadas son ruido; y el cartel centrado no dice cuál de los ocho sumandos se está contando.", "propuesta": "Sacar el cartel flotante a 1100-1699 px y encender en su sitio el sumando del desglose que dispara (fondo de su color, 1,2x, steps), de izquierda a derecha. Si se quiere cartel, que vaya encima de la cuenta, nunca sobre el desglose, y que los números por carta suban sobre el arte, no sobre el índice." },
    { "prioridad": "P1", "pantalla": "mesa, mesa-mentiroso, mesa-rey (zona AL DESCARTE)", "ventana": "1280x800", "archivo": "src/client/estilos/mesa.css:471-482 y :1785 (grid-template-columns: 152px …)", "que": "Con mando la zona punteada de descarte sigue ocupando una columna de 152 px a la izquierda de la mano, a opacidad 0,25: es un blanco de arrastre que el mando no puede usar. Con la mano de 8 del Mentiroso el naipe enfocado a 1,1x se le monta encima y vuelve a cortar «DESCARTE» (mesa-mentiroso.png).", "por_que": "Son 152 px de los 1280 regalados a un gesto imposible, robados a la mano que más los necesita (8 naipes de ~100 px más el Comodín). Y un rótulo gris a 25 % parece un botón apagado: el jugador de Deck lo busca con la cruceta y no existe.", "propuesta": "html[data-entrada='mando'] .descarte-zona { display:none } y la mano a 1fr; el descarte ya vive en el botón Y. Con 8 naipes, dejarlos a 108-112 px de ancho con ese sitio ganado." },
    { "prioridad": "P2", "pantalla": "bandeja del HUD (mesa, botín, Pulpería, Fogón)", "ventana": "1280x800", "archivo": "src/client/hud.ts:218-222 (dispararFicha) y ajustarBandeja; src/client/estilos/base.css (hud-tiras)", "que": "La bandeja sigue mostrando 5-6 fichas de ~44 px y esconde «+5» / «+4» / «+3» en un chip de ~28 px con cifra chica. Cuando dispara una pieza escondida ahora brinca el «+N»: mejor que nada, pero el jugador ve saltar «+5» y no sabe cuál de las cinco fue.", "por_que": "Con 5 Amuletos, Cábalas y Bendiciones la mitad del armado queda detrás del chip justo en la recta de los Reyes, cuando más piezas tenés. RT abre «Lo que llevás» (bien), pero en pleno golpe no hay tiempo de abrir nada.", "propuesta": "A 1100-1699 px, fichas de 40 px en dos filas (la bandeja tiene alto de sobra: 96 px) para que entren 10-12; o que la ficha escondida asome 0,6 s sobre el «+N» con su icono a 40 px cuando dispara." }
  ],
  "aciertos": [
    "El piso tipográfico por fin está: minPx 18 en las 28 pantallas de 1280x800 y en las 28 de 1366x768 (antes 16 en todas), cuerpo 20 en Botín, Cábala, Fogón, elegi-amuleto/bendición y los finales; 0 recortes, 0 solapes, dianas mínimas de 48 px.",
    "Capa de mando completa y visible: «A elige · X golpea · Y descarta» en lugar de «arrastralas», glifos en GOLPEAR, DESCARTAR, ENGAÑO (LT), JUGADAS (SEL) y la bandeja (RT); LB/RB, Select, gatillos y palanca derecha atados en nav.ts:163-171. El Mentiroso ya no camina hasta ENGAÑO.",
    "Enemigo inspeccionable y rotulado: INMUNE A ESPADAS, TE PEGA 21 con «+3 FURIA», QUEDA 1, el rasgo del Rey y La Corte con tabindex=0. Se entiende qué te hace el enemigo sin abrir un solo tooltip.",
    "La cuenta en reposo es la mejor pantalla del juego en Deck: «CARTA SOLA · DAÑO 23 × MULTI 5 = 115 · TE PEGA 23 · LE QUEDAN 225» en cifras de 30-40 px y el desglose fijo debajo (mesa-mando.png).",
    "«Lo que llevás» con iconos de ~40 px y flecha de que sigue abajo; FPS de 1280x800 medido: 133,7 fps bajo golpes, peor cuadro 8 ms."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-mando.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/mapa-mando.png",
    "visual-qa/1280x800/elegi-amuleto.png", "visual-qa/1280x800/elegi-bendicion.png", "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/botin.png", "visual-qa/1280x800/elegir-mazo.png",
    "jurado/secuencias/1280-golpe-03.png", "jurado/secuencias/1280-golpe-05.png", "jurado/secuencias/1280-golpe-07.png", "jurado/secuencias/1280-golpe-09.png",
    "jurado/secuencias/1280-rey-irrumpe-04.png", "mirar/1280-conteo.png",
    "medidas.json de las 28 pantallas de 1280x800 y las 28 de 1366x768 (leídas con node)", "jurado/fps.txt"
  ]
}
```

## Veredicto

La 0.15.0 es la primera versión hecha para mi silla, y se nota. El paquete «Deck de verdad» que pedí dos veces llegó casi entero: letra a 18-20 px en todas las pantallas medidas, glifos del mando donde hacen falta, gatillos y Select con trabajo, y el enemigo se lee y se inspecciona con la cruceta. La mesa en reposo, con la cuenta grande y el desglose fijo, se entiende a 40 cm sin tocar nada. Lo que queda es de segundo orden pero está en el centro del juego: el conteo animado tapa el desglose que la misma versión inventó, la zona de arrastre sigue ocupando sitio con mando, y la bandeja esconde media build. Hoy lo pondría en «Verificado» con reparos de legibilidad en el golpe; ya no en «Jugable».

**Seguimiento de la 0.14.0:** resueltos el P0 (texto a 16 px: ahora minPx 18 en las 56 pantallas) y el P1 del mando mudo; el P1 de inspección, resuelto en el enemigo y a medias en la bandeja (pasa a mi P2). De los menores: resueltos la falta de FPS en 1280, los iconos de «Lo que llevás» y su señal de que sigue, las pintas de Inmune del Mapa y ENGAÑO chico; «AL DESCARTE» entra en la mesa de 3 naipes pero se vuelve a cortar con la de 8; sigue el tooltip del Mapa.

Avisos sobre el material:

- Las secuencias de 1280 siguen en inglés y **en modo puntero** (`scripts/secuencias.ts:23` no fija idioma ni `data-entrada`): en 1280-rey-irrumpe-04 sale «Pick cards and drag them onto the enemy» y ningún glifo. Los momentos vivos con mando no están vistos.
- En la QA de 1280 se pulsa ArrowDown antes de la foto (`scripts/visual-qa.ts:329-331`): por eso elegi-* sale con el foco en SALTAR. El código pone `data-inicio` en la primera opción (`camino.ts:299`); el foco inicial real lo di por bueno leyendo código, no visto.
- El cartel «SEGUNDA CARA» (`mesa.ts:353-369`): leído en código, no visto en ninguna captura. Sonido y vibración: no juzgados.

## Defectos menores

- Mapa: el tooltip del nodo enfocado («PULPERÍA») sigue tapando el nodo de arriba, que es el paso siguiente — `src/client/estilos/pantallas.css` (tip del `.nodo`), `src/client/pantallas/camino.ts:220`.
- Golpe recibido: el «-23» rojo cae sobre VIDA y tapa rótulo y cifra justo cuando importa cuánto te queda (1280-golpe-09) — `src/client/pantallas/mesa.ts` (numero() sobre el HUD); desplazarlo arriba del recuadro.
- Sin glifo de B en CERRAR, SALTAR y ‹ VOLVER, ni de Start en MENÚ, ni de LB/RB en el selector de Reinado — `src/client/pantallas/camino.ts:196` y `:311`, `src/client/nav.ts:62` (glifo()).
- «Turno 1» y el dado del Mentiroso (~16 px) junto a la cabecera de 24 px: el contador de turnos es una cifra de juego y va a 18 — `src/client/pantallas/mesa.ts` (cabecera), `base.css:75-79`.
- La marca «+8★» del naipe templado y el rótulo «COMODÍN» sobre naipes de 100 px rozan el piso — `src/client/estilos/mesa.css:1795`.

## Qué haría en la próxima versión

«El golpe se lee en Deck». Primero, el conteo encendiendo cada sumando dentro del desglose, sin cartel flotante ni números sobre los índices, y el daño recibido fuera de la cifra de Vida. Segundo, la mesa de mando sin zona de arrastre y con la mano de 8 a 110 px. Tercero, la bandeja de dos filas a 40 px para que entre la build entera y cada pieza que dispara se vea. Cuarto, secuencias de 1280 en castellano y con `data-entrada='mando'`, sumando un momento «segunda-cara», para que el jurado juzgue lo vivo como lo juega el de la Deck. Y glifos de B y Start en todo botón de volver o menú. Nada toca reglas ni la Constitución.
