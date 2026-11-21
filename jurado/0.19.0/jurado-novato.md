```json
{
  "jurado": "jurado-novato",
  "version": "0.19.0",
  "puntajes": { "claridad": 7.4, "diversion": 7.2, "estetica": 7.9, "veredicto": 7.4 },
  "defectos": [
    { "prioridad": "P1", "pantalla": "secuencia golpe, cuadro 09 (el golpe que abate con ¡ESCOBA!)", "ventana": "1280x800", "archivo": "src/client/pantallas/mesa.ts:521-531 (el canto grande se centra sobre el naipe del enemigo) contra :539-540 y :913-917 (el número del daño va al carril del 4 % izquierdo del mismo naipe, alineado a la derecha); src/client/estilos/mesa.css:1045-1058 (.canto-grande a fs-xl × 2,2, sin apartarse)", "que": "En el cuadro clave, el «700» rojo y el «¡ESCOBA!» dorado caen al mismo tiempo y en el mismo renglón, encima de la Sota. El 700 tapa el «¡ES», así que se lee «700:COBA!», y el canto le tapa la cara al enemigo. Y en ese mismo instante hay tres «¡ESCOBA!»: el chip de la cuenta, el globo del Personaje y el estampado.", "por_que": "Es el premio de todo lo que entendí en la previa: abatí con el canto de mi Mazo. Si el clímax no se lee, no aprendo que el 15 justo fue lo que multiplicó, y el momento más lindo de la partida queda como un borrón.", "propuesta": "Darles turno o lugar. El canto sale primero, arriba del naipe (en.y − 0,6 × alto), y se apaga. Recién después cae el daño por su carril. O, si salen juntos, el canto va en el renglón de la placa TE PEGA y nunca cruza el carril del número. Con el chip y el globo alcanza: el estampado puede ser más chico." },
    { "prioridad": "P1", "pantalla": "HUD (mesa, mesa-seleccion, golpe-00 a 09; también cabala)", "ventana": "1280x800", "archivo": "src/client/hud.ts:74 y :411-424 (el «+N» de las piezas que no entran) y :232 (el conteo dispara cifras desde ese «+N»); src/client/estilos/base.css:1144-1150 (.hud-mas en oro, con el mismo marco que una carga)", "que": "Al lado de «FORTUNA 5» hay un recuadro dorado que dice «+4» (en cabala, «BRINDIS 5 +4»). Es el contador de cuatro piezas escondidas, pero tiene el mismo oro y el mismo marco que la cifra de la carga, así que se lee «Fortuna 5, +4 de bonus». Además, durante el conteo, las cifras de las piezas escondidas salen de ahí: un «+12» brota del «+4».", "por_que": "La bandeja es lo que me dice qué tengo. Si un número que no es un valor parece un valor, ya no confío en ninguno, y lo que el conteo trata de enseñar («esta pieza te dio +12») sale de una caja que para mí era otra cosa. Lo marqué en la 0.18 y sigue.", "propuesta": "El contador no puede parecer una cifra: «···4 MÁS» en hueso apagado, con el icono de una bolsita y separado de la última carga por el mismo separador que usan los Amuletos. Y que una pieza escondida, cuando suma, asome un instante en la bandeja en vez de disparar desde el contador." },
    { "prioridad": "P2", "pantalla": "elegi-una, piezas, coleccion (nivel de las Cábalas del Bufón)", "ventana": "1280x800", "archivo": "src/rules/aumentos.ts:9 (NIVEL_NOMBRE Plata/Oro/Prismático) y su uso en src/client/pantallas/camino.ts:72 y src/client/ui.ts:275", "que": "En «LO QUE LLEVÁS», abajo de «CARA DE PÓKER» dice «Oro». Pero en el HUD, ORO es mi plata y en la mano Oros es un palo. Encima, las Cábalas se miden en Plata/Oro y los Amuletos en Común/Raro/Épico: son dos escalas para la misma idea.", "por_que": "Un novato lee «Oro» y piensa «cuesta oro» o «va con Oros». Una palabra con tres sentidos en la misma pantalla es justo lo que me hace dejar de leer.", "propuesta": "Respetar los tres niveles de la Constitución, pero decirlos de otra forma: «Cábala de oro» o, mejor, solo el marco (plata, dorado o prisma, que ya existe en ui.ts:275) y el rótulo «CÁBALA» sin metal. Nunca la palabra «Oro» suelta al lado de una pieza." }
  ],
  "aciertos": [
    "La previa vuelve a decir todo antes de soltar: «QUINCE · DAÑO 35 × MULTI 20 = 700 · LO ABATÍS · SOBRAN 360». Era mi P1 de la 0.18 y ahora puedo comparar jugadas sin sumar a mano.",
    "El rasgo del Rey tiene su regla en un renglón: «ESTOCADA DEL CAUDILLO / Medio golpe suyo cruza tu Escudo». Y el Tajo de revés avisa con la cifra real en la cuenta: «TE PEGA 42 (21 ×2)».",
    "El Botín del Rey con cinco piezas entra entero y se entiende: +20 DE ORO, +9 DE VIDA MÁXIMA (con su «El Rey vencido te curte»), +19 DE VIDA, y Amuleto y Cábala con ELEGIR.",
    "Furia («ya incluida · +3 por turno») e Inmune («INMUNE A ESPADAS» con el escudito tachado) siguen claros de un vistazo."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/portada.png", "visual-qa/1280x800/elegir-mazo.png", "visual-qa/1280x800/cabala.png", "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/mesa.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/mesa-rey.png", "visual-qa/1280x800/mesa-mentiroso.png",
    "visual-qa/1280x800/elegi-una.png", "visual-qa/1280x800/pulperia.png", "visual-qa/1280x800/fogon.png", "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png", "visual-qa/1280x800/fin-derrota.png", "visual-qa/1280x800/mesa-segunda-cambia.png", "visual-qa/1280x800/botin-rey.png",
    "visual-qa/1280x800/mesa-conteo.png",
    "jurado/secuencias/1280-golpe-00 a 09.png (los diez cuadros)"
  ]
}
```

## Primeras impresiones (antes de abrir el código)

- **¿Cómo gano un combate?** Bajo a cero la barra de la Sota (340/340), y después viene «LA CORTE · QUEDA 1». Ahora la previa me dice si lo abato y con cuánto.
- **¿Qué hace el enemigo en su turno?** «TE PEGA 23». Con el Tajo armado, «TE PEGA 42 (21 ×2)». Claro.
- **Números del enemigo:** Vida, TE PEGA y Furia, bien. El «10», el «11» y el «12» de los naipes siguen sin decirme si son rango u orden.
- **Furia / Inmune / Multi:** claros. **Escudo:** se entiende por el chip «+4» de la previa. **Canto:** el chip «¡ESCOBA!» sí, pero «Cantos hechos +4» no sé de dónde sale. **Golpe exacto:** solo lo adivino por «SOBRAN 360» y por la estadística de la derrota. **Comodín:** el naipe dice «COMODÍN» y nada más; qué hace lo dice JUGADAS, no la mesa.
- Palabras que no conozco: FILO, BRINDIS y FORTUNA (sé que suman, pero no de dónde vienen), Taba cargada, Mano corta, Peso fuerte, Primera sangre, ENGAÑO (LT), porotos (el icono es una gema), Noche mansa, «Ni fu ni fa», Plata/Oro, «la primera pasada es segura».

## Defectos menores

- Conteo: mientras el total sube 7 → 19 → 35, la cuenta sigue diciendo «LO ABATÍS · SOBRAN 360», y por un segundo los números se contradicen (golpe-01 a 03): `src/client/pantallas/mesa.ts:1170-1174`.
- El «+4» de Moneda falsa nace sobre el pie del 9 de Copas que no jugué y parece que ese naipe sumó (golpe-03 y 04): `src/client/hud.ts:243-244` (escalón −18 px a la izquierda y −26 hacia arriba).
- Segunda cara: «Si repetís jugada», pero la mesa no muestra cuál fue la última. Lo descubro recién al elegir: `src/client/pantallas/mesa.ts:146` (agregar «última: PAR» a la regla).
- Fogón: «La primera pasada es segura» insinúa un riesgo que no se nombra (que la segunda puede quemar el naipe): `src/client/textos.ts:139`.
- Mentiroso: el botón «LT ENGAÑO» y el canto de foco del primer naipe se meten bajo el HUD: `src/client/pantallas/mesa.ts:1402`.
- Nota del material: la portada dice «v0.18.0» porque la foto (16:31) es un minuto anterior al commit de versión (16:32). No es un defecto del juego.

## Contra mi veredicto de la 0.18.0

**Resueltos:** la previa vuelve a dar DAÑO × MULTI = total y SOBRAN/LE QUEDAN (P1). El rasgo de primera cara tiene regla, y Coraza/Brindis ya no chocan con Cuero del Cacique y Sed del Bacanal (P1). Los «+N» de la bandeja casi no se pisan (solo en golpe-04 el «+12» y el «+1» se rozan). **Siguen:** el «+N» enmarcado al lado de las cargas, y faltan canto y carga en el glosario.

## Qué haría en la próxima versión

Que el golpe se lea igual de bien después de soltar que antes. (1) Una coreografía de clímax con turnos fijos: canto arriba, daño por su carril, Rey que cae. Nunca dos letras grandes en el mismo renglón, y una prueba de QA que congele el cuadro del golpe y mida el solapamiento entre `.canto-grande` y el número del daño. (2) En la bandeja, nada que no sea un valor puede parecer un valor: contador de piezas en hueso, y la pieza escondida que suma asoma un instante. (3) Cada término de la cuenta que no tiene ficha («Cantos hechos») gana una: el canto del Mazo en la bandeja, con su número acumulado. (4) En JUGADAS, el glosario sube al primer pliegue y suma canto, carga y Golpe exacto. En la mesa, «SOBRAN 360» lleva al lado «exacto = premio». Y el nivel de las Cábalas se dice con el marco, no con la palabra «Oro». Es todo orden, tiempo y rótulos sobre piezas que ya existen, sin tocar la Constitución, y me dejaría la claridad en 8.
