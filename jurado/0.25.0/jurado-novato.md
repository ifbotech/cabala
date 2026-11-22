```json
{
  "jurado": "jurado-novato",
  "version": "0.25.0",
  "puntajes": { "claridad": 8.4, "diversion": 8.2, "estetica": 8.3, "veredicto": 8.3 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "mesa-dejalo-justo / mesa-pega-todo (dial con Perfora)", "ventana": "1280x800 y 390x844", "archivo": "src/client/pantallas/mesa.ts:486 («SOBRAN» sale de q.aVida − vidaE) contra src/client/pantallas/mesa.ts:430-435 (el dial usa q.sobra, que ya trae el ×3 del Facón Maldito, src/rules/combate.ts:358)", "que": "La misma pantalla me da dos cifras distintas para lo que sobra. La cuenta dice «LO ABATÍS · SOBRAN 24» y, justo abajo, la caja DEJALO JUSTO dice «pierde 72 que pasaban». En el otro lado del dial, «PEGÁ CON TODO · 72 pasan al siguiente». El ×3 que convierte 24 en 72 no aparece en ningún lado.", "por_que": "Esta versión promete que el dial dice qué gano y qué pierdo, y lo primero que veo es una cuenta que no cierra. Si no sé si sobran 24 o 72, no puedo comparar «+3 de oro» con lo que pierdo, y la decisión se vuelve una moneda al aire.", "propuesta": "Una sola cifra y su causa, en los dos lugares: «SOBRAN 24 · PASAN 72 (×3 Facón)» en la cuenta, y «pierde 72 que pasaban (24 ×3)» en el dial. Si no hay multiplicador, que diga lo mismo en los dos." },
    { "prioridad": "P1", "pantalla": "mesa-dejalo-justo / mesa-pega-todo (golpe que abate)", "ventana": "1280x800 y 390x844", "archivo": "src/client/pantallas/mesa.ts:612-613 (cuando golpeNeto devuelve null porque abatís, la placa vuelve al ataque crudo e.ataque + furia, sin Escudo y sin aviso)", "que": "Con un golpe que abate a la Sota, la cuenta dice «LO ABATÍS» o «¡EXACTO!», pero arriba TE PEGA salta de 19 (23 − 4 ESCUDO) a un 23 pelado, más grande que antes y sin la resta del Escudo. En el teléfono queda «TE PEGA ✕ 23» al lado de la barra.", "por_que": "Si lo mato, ¿por qué me pega más? Leo que matarlo me cuesta 23 de Vida, y eso le saca las ganas al golpe que el juego quiere que dé. Es la cifra que más miro antes de golpear.", "propuesta": "Si el golpe abate, que la placa diga «NO TE PEGA · LO ABATÍS» (como ya hace Cara de Póker) o muestre al que sigue: «EL CABALLO TE PEGA 19». Nunca el ataque crudo del que se muere." },
    { "prioridad": "P2", "pantalla": "oferta-evoluciona, piezas, hud-evolucion-foco", "ventana": "1280x800", "archivo": "src/rules/evoluciones.ts:50 (Brindis: «MALDICIÓN: … pero suma +3 de Multi»); src/client/ui.ts:446 + src/client/estilos/pantallas.css:3470 (.evo-gana pone regla y maldición lado a lado)", "que": "La maldición ahora se ve como costo, en su caja roja, y eso está muy bien. Pero en el Brindis de Sangre la caja roja dice «cada golpe te bebe 2 de Vida, pero suma +3 de Multi»: hay un premio adentro del castigo. Y en la oferta, la regla («Tus Copas curan doble.») queda apretada en una columnita de una palabra por renglón, al lado de la maldición.", "por_que": "Si dentro de lo rojo también hay premio, deja de ser una alarma y vuelvo a leer todo. Y una regla partida palabra por palabra no se lee en cinco segundos.", "propuesta": "Pasar el «+3 de Multi» a la regla («Tus Copas curan doble y cada golpe suma +3 de Multi») y dejar en rojo solo el costo («cada golpe te bebe 2 de Vida»). En la oferta, regla arriba y maldición abajo, a lo ancho (flex-direction: column)." }
  ],
  "aciertos": [
    "La Forja Brava ya se ve como apuesta. Arriba dice «APUESTA: 50 % SE QUEMA · Si sale, el naipe entero vale doble», debajo «YA TIENE +8 de Daño · ★ +1 de Multi», y DOBLE FILO trae su «CUESTA −2 de Vida al jugarlo» adentro de la carta. El Bufón dice «o vale doble, o ceniza… rezá», y si sale mal aparece «SE QUEMÓ. LA PERDISTE.». Era mi P1 y está resuelto.",
    "La placa del naipe forjado está en palabras: «+12 DE DAÑO · ★ +1 DE MULTI · NAIPE ENTERO x2». En el resumen, el «III» pasó a «nivel 2».",
    "Mesa limpia se entiende de una: el Bufón dice «¡Mesa limpia! Arrancás con 10 de Escudo», una etiqueta MESA LIMPIA se pega a ESCUDO 10 y TE PEGA lo descuenta («2 · 12 − 10 ESCUDO»).",
    "La maldición se cobra a la vista en la cuenta («−3 DE VIDA» en mesa-maldicion) y, en «Lo que llevás», cada Evolución trae su MALDICIÓN en rojo debajo de la regla. La ayuda de la bandeja ya no tapa ni TE PEGA ni la barra del enemigo.",
    "En el teléfono los naipes de la mano se ven enteros, y el resumen dice «HAY MÁS ↓». En JUGADAS, el glosario está a la vista en la columna derecha."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-exacto.png", "visual-qa/1280x800/mesa-dejalo-justo.png",
    "visual-qa/1280x800/mesa-pega-todo.png", "visual-qa/1280x800/mesa-maldicion.png", "visual-qa/1280x800/mesa-garrote.png", "visual-qa/1280x800/mesa-limpia.png",
    "visual-qa/1280x800/oferta-evoluciona.png", "visual-qa/1280x800/forja-brava-eleccion.png", "visual-qa/1280x800/forja-brava.png", "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/1280x800/resumen-victoria.png", "visual-qa/1280x800/resumen-derrota.png",
    "visual-qa/390x844/mesa.png", "visual-qa/390x844/mesa-dejalo-justo.png", "visual-qa/390x844/mesa-pega-todo.png", "visual-qa/390x844/mesa-exacto.png", "visual-qa/390x844/resumen-derrota.png",
    "mirar/1280-fogon-suspenso-brava-llama.png", "mirar/1280-forja-brava-despues.png",
    "jurado/secuencias/1280-golpe-00, 03, 06, 07, 08, 09.png"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano?** Bajo a cero la barra de cada uno de la Corte («LA CORTE · QUEDA 1»). Está claro.
- **¿Qué hace el enemigo?** «TE PEGA 19 · 23 − 4 ESCUDO», y en el Rey «FURIA 3 ya incluida · +3 por turno» y «ESTOCADA DEL CAUDILLO: medio golpe suyo cruza tu Escudo». Clarísimo, salvo cuando lo abato (P1 de arriba).
- **Números del enemigo:** la Vida, TE PEGA y la Furia se entienden. El «10» del naipe sigue siendo la cifra más grande y no me dice nada.
- **Furia, Inmune, Escudo, Multi, canto:** claros. **Golpe exacto:** «¡EXACTO!» y el Bufón («¡Dejalo en 0 justo y cobrás oro y Multi!»). La parte de que, sin Perfora, la mesa lo arma sola no la vi: la captura mesa-exacto es igual a mesa. **Comodín:** JUGADAS lo explica en una línea.
- **Palabras o cifras que no entiendo:** «R3 lo deja justo» (¿qué botón es R3?), «corre de Posta», «Chiches», «lo que le dejó el fuego» (Cábala Negra) y el «nivel 2» suelto al lado de la última pieza de TU ARMADO.

## Defectos menores

- En golpe-07, el pulso de «LE QUEDAN 79» tapa el 9 de «TE PEGA 19» (`src/client/estilos/mesa.css:3450`).
- La ayuda de la bandeja ya no tapa TE PEGA, pero sí el globo del Bufón y «INMUNE A BASTOS» (queda «MUNE A ASTOS»). Falta sumar `.e-sellos` a TAPA_NUNCA (`src/client/ui.ts:220`).
- «QUÉ TE FRENÓ: El Caudillo en el tramo 2 / le quedaba 50%» está mal armada; tendría que decir «Al Caudillo, en el tramo 2, le quedaba 50 %» (`src/client/pantallas/camino.ts:1306`).
- El «nivel 2» de TU ARMADO va pegado a la última ficha y no se sabe de cuál es (`src/client/pantallas/camino.ts:1288`). En la victoria, «PRÓXIMO RÉCORD» queda arriba de «¡NUEVO RÉCORD!».
- Después de una Forja Brava que sale bien, el Bufón repite «El fuego no cobra», como si no hubiera pasado nada (`src/client/pantallas/camino.ts`, voz del Fogón).

## Contra mi veredicto de la previa

**Resueltos:** el P1 de la Forja Brava (apuesta arriba, costo dentro de DOBLE FILO, voz propia de la tercera pasada), el P1 de la ayuda que tapaba TE PEGA y la barra, la placa «+12 ★ ×2» (ahora en palabras), el «III» (ahora «nivel 2»), el glosario a la vista y la Y, que ahora siempre descarta (el dial pasó a R3). **Siguen:** SEGUIR en vez de «ME LO QUEDO ASÍ», las familias de nombres (FILO / DOBLE FILO, CHISPA / CHISPA DE ORO) y el «10» gigante del naipe enemigo.

## Qué haría en la próxima versión

Un pase de «la cuenta no se contradice nunca». (1) Una sola cifra para lo que sobra, con su multiplicador a la vista, en la cuenta y en el dial. (2) TE PEGA con un golpe que abate dice «NO TE PEGA · LO ABATÍS» o muestra al que sigue, nunca el ataque crudo del que muere. (3) En rojo, solo el costo de cada MALDICIÓN, y en la oferta regla y maldición a lo ancho. (4) El dial dice qué hace en palabras («TOCÁ PARA DEJARLO JUSTO») y, en el mando, si R3 se descubre poco, que aparezca en la primera mesa con Perfora. (5) Una captura de QA donde se vea a la mesa armando sola el Golpe exacto, para que el jurado lo pueda juzgar. Nada de esto toca la Constitución. Con (1) y (2), la claridad llega a 8,6.
