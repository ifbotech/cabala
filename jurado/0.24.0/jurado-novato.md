```json
{
  "jurado": "jurado-novato",
  "version": "0.24.0",
  "puntajes": { "claridad": 8.2, "diversion": 8.1, "estetica": 8.2, "veredicto": 8.2 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "forja-brava-eleccion / fogon-mutaciones (tercera pasada del Fogón)", "ventana": "1280x800", "archivo": "src/client/pantallas/camino.ts:880-882 (cada .forja-mut es el botón de la Forja Brava y el riesgo queda afuera, en .forja-riesgo); src/client/pantallas/camino.ts:914 (la voz del Bufón no cambia en la tercera pasada); src/client/textos.ts:319 (forjaElegi)", "que": "Las dos mutaciones ahora son cartas grandes y lindas («DOBLE FILO · Al jugarlo: +2 de Multi y te corta 2 de Vida» / «CHISPA DE ORO»), pero se ven igual que «Elegí un Amuleto»: un premio gratis. El «50 % de que se queme» va suelto abajo de las dos, como una nota al pie. Arriba, «TEMPLADA: +8 DE DAÑO Y +1 DE MULTI» parece una tercera opción y en realidad es lo que ya tenés. Y el Bufón, al lado, dice «El fuego no cobra».", "por_que": "Es la apuesta más grande del juego: si sale mal, perdés tu mejor naipe. Yo apreté DOBLE FILO creyendo que elegía un regalo. Si se quema, siento que el juego me robó, no que perdí una apuesta. Y de paso se pierde el suspenso que esta versión quiso sumar.", "propuesta": "Que el riesgo vaya dentro de cada carta, con un verbo: «ARRIESGALO · 50 % SE QUEMA» en rojo, en la franja de abajo del botón. Rotular el estado actual como «TU AS HOY: +8 ★» y cambiar SEGUIR por «ME LO QUEDO ASÍ». Sumar una voz del Bufón propia de la tercera pasada («¿Te la jugás? La mitad de las veces el fuego se lo come»)." },
    { "prioridad": "P1", "pantalla": "hud-evolucion-foco (ayuda de la bandeja «Lo que llevás» con foco)", "ventana": "1280x800", "archivo": "src/client/ui.ts:204 (TAPA_NUNCA = 'button, .titulo, .hud [data-n]': no incluye el TE PEGA [data-ataque] de src/client/pantallas/mesa.ts:225 ni la barra de vida y el nombre del enemigo); src/client/hud.ts:135 (las cargas en 0 entran igual)", "que": "La versión promete que ninguna ayuda tapa títulos ni cifras. Pero cuando enfoco la bandeja, la ayuda de once renglones se pone justo encima del naipe enemigo, de la barra «SOTA DE BASTOS» y del TE PEGA, que queda cortado en «Cara de…». Además gasta un renglón en «Coraza 0: +0 de Escudo al empezar cada combate».", "por_que": "TE PEGA y la vida del enemigo son las dos cifras con las que decido cada golpe. Una ayuda que las tapa me obliga a cerrarla para pensar, y entonces deja de servir.", "propuesta": "Sumar a TAPA_NUNCA `[data-ataque]`, la barra del enemigo y `.cuenta` (si no entra en otro lado, la ayuda va encima de la mano o de la escena). Sacar las cargas en 0 y achicar el pie a «A: leerlas enteras»." },
    { "prioridad": "P2", "pantalla": "forja-brava, resumen-victoria / resumen-derrota, jugadas", "ventana": "1280x800 y 390x844", "archivo": "src/client/pantallas/camino.ts:886 (placa «+12 ★ ×2»); src/client/pantallas/camino.ts:888 (chip DOBLE FILO, con el costo solo en el tip); src/client/pantallas/camino.ts:1251 (nivel de Bendición en números romanos «III»); src/client/pantallas/camino.ts:159-177 (glosario abajo de todo)", "que": "Quedan cifras hechas de símbolos que nadie me enseñó. Debajo del naipe forjado dice «+12 ★ ×2». El chip DOBLE FILO no dice lo que cuesta. En TU MANO ESTRELLA, al lado de las piezas, hay un «II» o un «III» suelto que parece una pausa o un adorno (es el nivel de la Bendición). Y el glosario sigue al fondo de JUGADAS.", "por_que": "Cada símbolo sin palabra es una duda que me llevo a la próxima partida. En el resumen final, el «III» le saca peso justo a la pantalla que me tendría que hacer sentir que armé algo.", "propuesta": "Placa en palabras: «+12 Daño · ★ +1 Multi · ×2». El chip forjado dice su costo en una línea («−2 Vida al jugarlo»). Mostrar «NIVEL 3» o «FILO 7» en vez de «III». Que JUGADAS abra con el glosario a la vista y le sume Templada ★, Forja Brava y Porotos." }
  ],
  "aciertos": [
    "DEJALO JUSTO resuelve mi P0: una caja aparte, con verbo y premio («+3 de oro · +1 Multi al próximo»), en la Y. Y el Bufón lo presenta en un renglón: «¡Dejalo en 0 justo y cobrás oro y Multi!». La cuenta ya no se contradice: dice «LO ABATÍS · SOBRAN 75».",
    "La oferta de Evolución dice por qué evoluciona («BRINDIS DE SANGRE con tu don de Copas») y trae la regla entera, sin «y más». La carga pasó a llamarse TRAGO, así que ya no la confundo.",
    "El resumen final se lee de un vistazo: TU MANO ESTRELLA, «Envido · 2 del mismo palo (Truco)», y ESTA PARTIDA 819 separada de TU MEJOR 1284 por una raya. En la victoria aparece «¡NUEVO RÉCORD!».",
    "En el golpe, los «+3» y «+9» brotan sobre la carta que los da. Y el Tajo de Revés sale en su propia caja: «Si repetís (salvo Carta sola), TE PEGA x2», con la cuenta «TE PEGA 42 (21 ×2)».",
    "El Tesoro se entiende sin leer: «Candado: 27 de oro · Te faltan 20 de oro · DEJAR EL COFRE». En el mapa, la ayuda del nodo dice a qué es inmune el enemigo."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/forja-brava-eleccion.png", "visual-qa/1280x800/fogon-mutaciones.png",
    "visual-qa/1280x800/oferta-evoluciona.png", "visual-qa/1280x800/botin-tesoro.png", "visual-qa/1280x800/mapa-tesoro.png", "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/jugadas.png", "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/mesa-chiches.png",
    "visual-qa/1280x800/mesa-segunda.png", "visual-qa/1280x800/mesa-segunda-cambia.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/resumen-victoria.png",
    "visual-qa/1280x800/resumen-derrota-movil.png", "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa-rey.png",
    "visual-qa/390x844/mesa-dejalo-justo.png", "visual-qa/390x844/resumen-derrota.png", "mirar/1280-fogon-suspenso.png", "mirar/1280-fogon-despues.png",
    "jurado/secuencias/1280-golpe-00, 03, 06, 09.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano?** Bajo a cero la barra de cada uno de la Corte («LA CORTE · QUEDA 1»). Está claro.
- **¿Qué hace el enemigo?** «TE PEGA 19 · 21 − 2 ESCUDO · FURIA 3 ya incluida · +3 por turno». Clarísimo. En reposo, «TE PEGA 0 · Cara de Póker» todavía parece el nombre de alguien. Cuando elijo cartas dice «NO TE PEGA · CARA DE PÓKER», y así sí se entiende.
- **Números del enemigo:** la Vida, TE PEGA y la Furia se entienden. El «10» del naipe enemigo sigue siendo la cifra más grande de la pantalla y no me dice nada.
- **Furia, Inmune, Escudo, Multi, canto:** claros. **Golpe exacto:** ahora sí, por DEJALO JUSTO y la frase del Bufón. **Comodín:** JUGADAS lo explica en una línea.
- **Palabras o cifras que no entiendo:** «+12 ★ ×2», el «III» del resumen, «A LA SUERTE: 60» (¿60 qué?), «Medio» (después vi que es la carta del medio), «Chiches» y el cofre gris del mapa.

## Defectos menores

- Con DEJALO JUSTO a la vista, Y nunca descarta: alterna con PEGÁ CON TODO sin fin, y DESCARTAR pierde su glifo (`src/client/nav.ts:232`).
- En el resumen de la victoria, el nombre de abajo («EL FACÓN MALDITO») no es el de la pieza resaltada (Sol de la Timba). Sale de la primera Evolución, no de la que tiene el foco (`src/client/pantallas/camino.ts:1254-1255`).
- En golpe-06, el pulso de «LE QUEDAN 155» pisa «CARA DE PÓKER». En golpe-09, el 320 gigante tapa el nombre del enemigo (`src/client/pantallas/mesa.ts`, conteo).
- En el teléfono, en mesa-dejalo-justo, los botones «?» y «≡» de arriba salen vacíos y no veo la frase del Bufón que presenta la acción. No verifiqué la causa (`src/client/estilos/mesa.css`, desde la :4565).
- Las familias de nombres siguen. En el Fogón conviven FILO en el HUD y DOBLE FILO, y CHISPA en la cuenta y CHISPA DE ORO (`src/client/textos.ts:738-740`).

## Contra mi veredicto de la previa

**Resueltos:** el P0 del chip EXACTO (ahora es DEJALO JUSTO, con premio, Y y el Bufón), la causa de la Evolución con su regla entera y el choque Brindis/Brindis (ahora TRAGO). También el resumen en castellano con columnas, «Escalón +2 de Multi» y los «+N» sobre su carta. **Siguen:** «+12 ★ ×2» sin glosa, el costo de DOBLE FILO escondido en un tip, el glosario al fondo y las familias de nombres.

## Qué haría en la próxima versión

Un pase de «toda apuesta se ve como apuesta y toda cifra dice de qué es». (1) En la tercera pasada del Fogón, cada mutación lleva su riesgo dentro de la carta («ARRIESGALO · 50 % SE QUEMA»). SEGUIR pasa a decir «ME LO QUEDO ASÍ» y el Bufón tiene su propia línea de suspenso. (2) La ayuda que se abre con el foco suma TE PEGA, la barra del enemigo y la cuenta a lo que nunca tapa, y deja afuera las cargas en 0. (3) Ninguna cifra sin palabra: la placa del naipe forjado en palabras, «NIVEL 3» en vez de «III», y el chip de la mutación con su costo. (4) El glosario abre arriba en JUGADAS y suma Templada, Forja Brava, Porotos y Cara de Póker. (5) En reposo, TE PEGA usa la misma frase que en la selección: «NO TE PEGA · CARA DE PÓKER». Nada de esto toca la Constitución. Con (1) y (2), la claridad llegaría a 8,5.
