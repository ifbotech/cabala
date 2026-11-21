```json
{
  "jurado": "jurado-ux-movil",
  "version": "0.20.0",
  "puntajes": { "claridad": 7.7, "diversion": 7.6, "estetica": 8.0, "veredicto": 7.7 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa en vivo, el grito del Personaje con una jugada armada (secuencia rey-tajo)",
      "ventana": "390x844",
      "archivo": "src/client/hud.ts:369-378 (en el teléfono solo el Botín corta la búsqueda; en la mesa, si a 120 px no hay hueco limpio, cae a buscar(false) en la pantalla entera) + src/client/pantallas/mesa.ts:585 (el canto grita en pleno golpe)",
      "que": "En `390-rey-tajo-00.png`, «¡AY, MI ESPALDA!» aparece arriba de todo, montado sobre el canto superior del naipe del Caudillo y su índice «12», pegado a «Turno 4». Queda a unos 700 px del retrato, que está en el HUD de abajo, y no tiene cola que apunte a nadie. En la foto quieta (`mesa-grito.png`) sale junto al retrato porque ahí GOLPEAR está apagado y la mano no está elegida. En vivo, con dos naipes arriba, la cuenta abierta y GOLPEAR encendido, cerca del retrato no queda hueco, y el código lo manda a la otra punta.",
      "por_que": "Es mi P1 de la 0.19, que se arregló en el Botín pero sigue en la mesa. El grito vuelve a salir de la boca del Rey o del Bufón y no del Personaje. En vertical lo leés como que habla el enemigo, justo en el canto, que es el momento de festejo. En *Balatro* móvil cada texto que flota nace de su dueño o no aparece.",
      "propuesta": "Llevar a toda la pantalla ≤700 px la regla que ya tiene el Botín: si a 120 px del retrato no hay hueco limpio, el grito no se dibuja y quedan la voz y el salto del retrato. O sea, sacar `botinTel &&` de la línea 371 cuando innerWidth ≤ 700. Y que la QA dispare un canto con la selección armada en 390, no solo con la mesa en reposo."
    },
    {
      "prioridad": "P1",
      "pantalla": "placa TE PEGA y chip de la cuenta con Escudo propio (mesa-escudo, mesa-mentiroso, mesa-rey)",
      "ventana": "390x844",
      "archivo": "src/client/estilos/mesa.css:3200-3204 (.e-neto display:none en ≤700) + :3686 (.cuenta.apretada .c-frena display:none) + src/client/pantallas/mesa.ts:431-447",
      "que": "La placa ya va neta también en reposo, pero en el teléfono la causa no aparece en ningún lado. En `mesa-escudo.png` tenés Escudo 20 y la Sota dice «TE PEGA 3», y el chip de la cuenta dice «TE PEGA 3». En `mesa-mentiroso.png`, con Escudo 22, dice «1». En `mesa-rey.png`, con Escudo 2, dice 19. Nunca se ve «23 − 20 ESCUDO». El CSS esconde la causa de la placa en ≤700 y la cuenta apretada (que en el teléfono va casi siempre así) esconde la del chip. Encima, con el Tajo (`mesa-conteo.png`), dice «42 (21 ×2)» y el Escudo 2 no descuenta nada, sin que el teléfono avise que el Tajo lo atraviesa.",
      "por_que": "El Mentiroso juega con el Escudo, y su pregunta central es cuánto me frena. Un Rey que «pega 3» parece débil, no que tu Escudo trabaja. Y cuando el Tajo de golpe sí pega 42 contra Escudo 2, no se entiende por qué no restó. La causa vive en una ayuda que en el teléfono pide mantener apretado. Es el «por qué» del número que más te mata.",
      "propuesta": "En ≤700 px, ubicar la causa en el renglón de abajo de la placa, como ya hace «21 ×2» con el Tajo, con un icono de Escudo y la cifra: «⛨ −20», 16 px, hueso. En el chip, que se esconda primero el nombre de la jugada repetida y no la causa. Con el Tajo, la causa dice «cruza tu ⛨»."
    },
    {
      "prioridad": "P2",
      "pantalla": "número del golpe contra un Rey en primera cara que se planta en la mitad (secuencia rey-segunda)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:596 (numero(ev.n, …) usa el daño bruto aunque la Vida solo baje hasta la mitad)",
      "que": "Lo bueno: el número ya nace centrado sobre el naipe, adentro de la pantalla y sin tapar tu columna. Lo malo: en `390-rey-segunda-08.png` dice «280» y la barra pasa de 171/340 a 170/340, o sea un punto. Después entra «SEGUNDA CARA». En vivo, la cuenta no estaba a la vista y el veredicto «SE PLANTA EN LA MITAD» no aparece en ningún cuadro del golpe.",
      "por_que": "Es la cifra grande del clímax y contradice a la barra que tiene al lado. El jugador de móvil mira el número, no lee la ayuda. Si ve 280 y −1, cree que fue un error o que el Rey tiene un escudo oculto.",
      "propuesta": "Cuando el golpe se frena en la mitad, que el número diga lo que de verdad sacó (o «280» tachado que se encoge a «1») y que lleve el sello celeste «SE PLANTA» pegado debajo, en el mismo carril. Así el sello vive en el lienzo y no depende de que la cuenta esté a la vista."
    }
  ],
  "aciertos": [
    "El número del golpe grande ya no se sale de la pantalla. En `390-rey-segunda-08` y `-09`, «280» queda centrado en el naipe, entero, sin tapar al Bufón, tu Escudo ni el INMUNE. Mi P1 de la 0.19 está resuelto.",
    "En el Botín vivo del teléfono el grito ya no se monta sobre el Bufón ni sobre una fila elegible (`390-rey-cae-11`, `-12`, `botin-grito.png`, `botin-rey.png`): si no hay lugar, no sale.",
    "La cuenta ya no baila. De `390-golpe-00` a `-07`, el renglón 1, CURA y el desglose quedan quietos mientras cuenta, y el desglose separa cada icono de su cifra («★ +10», «🎲 +20»).",
    "De «ELEGÍ UNA» sin velo negro: el Botín queda atenuado detrás y las tres ofertas brotan de su fila (`390-rey-cae-12` → `-16`). Se entiende de dónde sale lo que elegís.",
    "«ESTÁS ACÁ» clavado a su nodo con flecha en el mapa vertical, y el Tajo con su regla completa («salvo Carta sola») debajo de la barra. 0 recortes, dianas ≥ 44 px y letra ≥ 16 px en las 35 medidas de 390x844 (los finales, a 14)."
  ],
  "capturas_vistas": [
    "visual-qa/390x844/mesa.png", "mesa-seleccion.png", "mesa-conteo.png", "mesa-escudo.png", "mesa-segunda.png", "mesa-segunda-cambia.png", "mesa-rey.png", "mesa-grito.png", "mesa-arrastrando.png", "mesa-mentiroso.png", "mesa-mando.png",
    "botin-rey.png", "botin-grito.png", "elegi-una.png", "pulperia.png", "jugadas.png", "piezas.png", "mapa.png", "fogon.png", "altar.png", "portada.png", "elegir-mazo.png", "fin-victoria.png",
    "visual-qa/390x664/mesa-conteo.png",
    "jurado/secuencias/390-golpe-00, -03, -06, -07, -08, -09",
    "390-rey-segunda-01, -04, -06, -07, -08, -09, -10, -12",
    "390-rey-tajo-00, -04, -08",
    "390-rey-cae-01, -02, -03, -04, -05, -06, -09, -11, -12, -16, -18",
    "390-rey-irrumpe-05", "390-botin-brota-04, -10, -12", "390-mapa-paso-03",
    "mirar/390-rey-cae.png", "390-conteo.png", "390-mesa-grito.png", "390-fogon-suspenso.png", "390-comodin-espectral-racha.png",
    "recortes ampliados ×2–×3 de mesa-conteo, mesa-escudo, mesa-rey (placa), mesa-mando (cabecera y barra), 390-rey-tajo-00 y mirar/390-conteo",
    "las 35 medidas.json de visual-qa/390x844"
  ]
}
```

## Veredicto

La 0.20.0 arregla las tres cosas que pedí de lo vivo. El número grande nace adentro del naipe y adentro de la pantalla. El grito del Botín ya no pisa al Bufón ni una pieza por elegir. La cuenta queda quieta mientras cuenta. El paso del Botín a «ELEGÍ UNA» sin velo es lo mejor de la versión en vertical: se ve de qué fila brota cada oferta. Claridad, que en mi ficha pesa doble, sube de 7,5 a 7,7.

No paso de ahí por tres cosas. El grito se arregló en el Botín pero no en la mesa. En el teléfono, la causa del TE PEGA neto (tu Escudo, o el Tajo que lo cruza) quedó escondida por CSS. Y el número del golpe contra un Rey que se planta en la mitad contradice a la barra. Las tres tienen la misma raíz: el teléfono tira el «por qué» para ganar ancho.

Alcance: no corrí nada. `src/client/mano.ts` no cambió desde la 0.19 (umbral de 14 px con el dedo). Juzgo el arrastre por `mesa-arrastrando.png` («SOLTÁ ACÁ» y DESCARTAR punteado, bien). El sonido lo conozco solo por código. Las fotos quietas son de antes del salto de versión: la portada dice «v0.19.0».

## Contra mi veredicto de la 0.19.0

**Resueltos:** el número del golpe fuera de pantalla (P1), el grito en el Botín (P1), la cuenta que bailaba de costado y los iconos montados en el desglose (P2), la placa en reposo que cambiaba de crudo a neto. **Siguen:** CERRAR arriba a la derecha en JUGADAS y LO QUE LLEVÁS, «Multi ×3 al cantar ¡ESCOBA!» en cuatro renglones, los finales a 14 px tachados, el grito sobre GOLPEAR apagado (`mirar/390-mesa-grito.png`: «STR…»), sin capturas frescas en 360x740.

## Defectos menores

- **Mando o teclado en ≤700 px**: los botones «?» y «≡» quedan vacíos (`mesa-mando.png`). base.css:1347-1351 esconde el glifo y mesa.css:3739 y base.css:1357 esconden el signo. Uno de los dos tiene que quedar.
- **Mano de 8 elegida**: el Comodín copiado crece hasta el borde derecho y su «+4» se corta (`mirar/390-conteo.png`). `src/client/estilos/mesa.css:1920` (.mano.dos-filas): falta topar la escala al viewport.
- **Mesa del Mentiroso**: la barra de Vida corta el índice de abajo de la Sota (`mesa-mentiroso.png`, «OT»). Lo mismo en `mesa.css:1920` y siguientes.
- **«ELEGÍ UNA» sobre el Botín**: un «…LEGIR» fantasma asoma pegado a SALTAR (`390-rey-cae-16`) y parece un segundo botón en la zona del pulgar (`src/client/estilos/pantallas.css:2853-2861`: esconder también los .btn de las filas).
- **La Pulpería**: SERVICIOS queda cortado debajo de los tres Amuletos, sin pista de que hay más abajo (`pulperia.png`). Hace falta una flecha ▼ como la de JUGADAS (`src/client/estilos/pantallas.css`, panel de la Pulpería).

## Qué haría en la próxima versión

Paquete «el teléfono también dice por qué». Uno: el grito en ≤700 px nunca busca en la pantalla entera, ni en la mesa ni en el Botín, y la QA lo dispara con la selección armada. Dos: la causa del TE PEGA vive debajo de la placa (con icono de Escudo, o «cruza ⛨» si es el Tajo) y es lo último que se esconde de la cuenta apretada. Tres: el número del golpe dice lo que de verdad sacó cuando el Rey se planta, con el sello SE PLANTA en el lienzo. Cuatro: CERRAR al pie de JUGADAS y LO QUE LLEVÁS, en la zona del pulgar, y una flecha de «hay más» en la Pulpería. Cinco: una tanda de 360x740 con muesca y una secuencia con el Mentiroso y su mano de 8. La Constitución, intacta.
