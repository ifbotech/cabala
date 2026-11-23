```json
{
  "jurado": "jurado-juice",
  "version": "0.29.0",
  "puntajes": { "claridad": 8.9, "diversion": 9.0, "estetica": 8.8, "veredicto": 8.9 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "mesa · el ¡CHANCHO! que aturde (el enemigo sobrevive, o entra aturdido tras el que cae)",
      "ventana": "390x844 y 1280x800",
      "archivo": "src/client/pantallas/mesa.ts:1287-1303 (suceso `aturde`: solo el sello, 8 chispas y el sonido prestado `frena`) · src/client/estilos/mesa.css:2245-2249 (en el teléfono el sello pierde el rótulo) · mesa.css:6691-6707 (`sello-nace`) · mesa.css:6435-6438 y 6739-6754 (la columna de dos sellos alineada abajo)",
      "que": "Ya se ve, pero no se siente. A 1280 es un rótulo «ATURDIDO» chico y gris bajo «INMUNE A COPAS», lejos del naipe (1280-chancho-aturde-08 y 10). En el teléfono es un ícono de ~16 px sin palabra, debajo del escudo de Inmune (390-chancho-aturde-09 y 10). El naipe del enemigo no hace nada: ni estrellas sobre la cabeza, ni tambaleo. Y cuando lo recibe el que entra, a 1280 la columna INMUNE + ATURDIDO trepa sobre «GUARDIA · Turno 1» y roza al Bufón (1280-chancho-canta-13 y 14).",
      "por_que": "Aturdir es la firma del Mazo del Chancho y te ahorra un golpe entero. Hoy es la consecuencia más grande del canto y la más chica en pantalla; en el teléfono no se lee.",
      "propuesta": "Que el aturdido viva en el naipe: estrellitas que giran sobre la cabeza mientras dure, el naipe inclinado unos grados y un tambaleo al nacer, con sonido propio (parche sordo y campanitas que giran). En el teléfono, el rótulo ATURDIDO estampado sobre el naipe durante los 860 ms. A 1280, la columna de sellos anclada arriba (o un solo renglón) cuando la cuenta tiene dos filas de chips."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · el conteo en el teléfono (cuenta siempre plegada)",
      "ventana": "390x844",
      "archivo": "src/client/pantallas/mesa.ts:2558-2585 (`volarCifra`: con el término oculto, vuela a la cifra de la fórmula) · mesa.ts:370-410 (pliegue) · mesa.ts:2550-2555 (`encender`, que en el teléfono no tiene a quién)",
      "que": "Lo que avisa el autor, visto: los términos ya no se encienden. Los «+9» nacen a 1,5× y caen sobre una fórmula de cifras chicas: en 390-postas-golpe-03 y 04 se lee «P+9 × 1 = 37» con otro «+9» sobre «LO ABATÍS». La fórmula con Postas va a la mitad del tamaño que sin ellas (comparar con 390-golpe-04 y 05, donde 68 × 5 = 340 sí pega). La cifra que recibe no brinca ni cambia de color.",
      "por_que": "La escalada del conteo es el corazón del juego. En el teléfono, con Postas, el número que más importa es el más chico de la escena y lo que le llega lo tapa en vez de inflarlo.",
      "propuesta": "Que la cifra receptora (DAÑO o MULTI) brinque y suba un escalón de tamaño con cada «+N», que el «+N» muera al borde de la cifra y no encima, y que cada aporte encienda su ficha en la bandeja del HUD o su naipe. La fórmula con Postas, al tamaño de la común."
    },
    {
      "prioridad": "P2",
      "pantalla": "mesa · el crítico de Punta y hacha (la chapa «×2»)",
      "ventana": "1280x800",
      "archivo": "src/client/estilos/mesa.css:3799-3815 (`.c-parte[data-cm].con-crit` y `.c-crit-sello`: `right: 0`, `scale: 1.5`, origen abajo a la derecha)",
      "que": "La chapa salió de encima del 14, pero a escala 1,5 se sale de su reserva y tapa el «=» y la primera cifra del total: en 1280-rey-tajo-08 y 09 el total se lee «78» y no 378, justo cuando el 378 golpea al Caudillo. En 07 tapa el «=».",
      "por_que": "Es el cuadro en que el crítico duplica: el total es lo que hay que leer y la chapa que lo festeja lo muerde.",
      "propuesta": "Chapa arriba del MULTI (fuera del renglón, `bottom: 100%`) o reserva del ancho real a 1,5×. Aserción de QA: la caja de la chapa no interseca `[data-total]`."
    }
  ],
  "aciertos": [
    "Mi P2 del golpe que abate está resuelto de punta a punta: «NO TE PEGA 0 · LO ABATÍS» se sostiene con el 960 encima y la barra dice 0/900 antes de que el naipe gire y se parta (1280-chancho-canta-07 a 11; 390-chancho-canta-09).",
    "El Rey ahora se planta con el cuerpo: aura celeste que le cierra el naipe, sacudida de cámara, el 196 gris que cae de su pecho hacia el sello y el 4 que entra (1280-rey-planta-07 a 09). En el teléfono es mejor todavía: 196 y 4 grandes sobre el Rey (390-rey-planta-08 y 09). El sello vive en el paño y ya no tapa la FURIA ni el rasgo.",
    "El contragolpe del teléfono quedó bien: retrato libre con su mueca y el corazón que salta, «−19» grande bajo la Vida, «−4» de Escudo al lado sin pisarse (390-contragolpe-09 y 10).",
    "El golpe de todos los días a 1280 y a 1920 es lo mejor del juego: términos que se encienden uno por uno, «×2» sobre el naipe del Medio, «+1» que vuela de la bandeja, total que cambia de color (1280-golpe-05; 1920-golpe-06 y 09, con el desglose en dos columnas limpias).",
    "Rendimiento: 0,0 % de cuadros largos en las cuatro ventanas, peor cuadro 15 a 21 ms (fps.txt).",
    "Audio, leído en código, no oído: `planta` es un parche seco a 118 Hz con madera y el acorde grave del motivo de ese Rey, apagado en 350 ms y con timbre propio por palo; `segunda` tuerce de Re a Mi como la música; los golpes quedan calibrados 6,5 dB sobre la mesa (audio.ts:356-399)."
  ],
  "capturas_vistas": [
    "jurado/secuencias/1280-chancho-canta-07, 08, 09, 10, 11, 13, 14, 16; 390-chancho-canta-09, 12",
    "jurado/secuencias/1280-chancho-aturde-06, 07, 08, 10, 12, 14, 16, 19; 390-chancho-aturde-08, 09, 10",
    "jurado/secuencias/1280-rey-planta-06, 07, 08, 09, 10, 11; 390-rey-planta-08, 09",
    "jurado/secuencias/390-contragolpe-06, 08, 09, 10; 1280-contragolpe-08",
    "jurado/secuencias/1280-rey-segunda-09, 10, 12, 15; 1280-rey-tajo-07, 08, 09, 11",
    "jurado/secuencias/1920-golpe-06, 09, 12; 1280-golpe-05; 390-golpe-04, 05; 390-postas-golpe-03, 04, 05, 06",
    "jurado/secuencias/1280-rey-cae-07, 10; 1280-rey-irrumpe-06; 1280-mapa-paso-03; 1280-botin-brota-06; 1280-portada-03",
    "jurado/fps.txt; jurado/audio/RESUMEN.md (cadena, forma, motivos, tesituras, escenas)"
  ]
}
```

## Veredicto

La 0.29 sube en las cuatro columnas y sigue sin P0 ni P1 míos. No llega al 9,1: diversión 9,0 (pesa doble), veredicto 8,9. Los tres remates que pedí están: la muerte tiene su cero, el Rey se planta con el cuerpo y el retrato del teléfono reacciona a la vista. Lo que separa del 9,1 es que el aturdido todavía es un cartelito, que el conteo del teléfono perdió su escalada y que dos arreglos (la chapa «×2», el 99) cambiaron un choque por otro.

**Contra la 0.28.0.**
- Resuelto: la placa que mentía y la barra que no llegaba a 0.
- Resuelto: las placas «−N» sobre el retrato del teléfono y el «−19» chico.
- Resuelto en lo esencial: el Rey que se planta. Queda que a 1280 el «4» que entra sigue a escala 1 (menor).
- De los menores: el 99 de Perfora ya va a escala 2; la chapa «×2» salió del MULTI pero ahora muerde el total (tercer defecto); el aturdido ya se filma y se ve (primer defecto).

**Lo que no pude ver ni oír.**
- Todo el sonido: juzgo recetas y medidas. Sin ondas cuadradas en lo que leí (parche, madera, bordona, fuelle, campanita, soplo).
- El hitstop de 70 ms y el rebote del número perdido entre cuadros: leídos en `gestoPlanta` (mesa.ts:2089-2134); en las capturas se ven la salida y la caída, no el choque.
- El promedio de fps bajó de 164 a 93 respecto de la 0.28 con los mismos peores cuadros. Desde acá no distingo carga de la máquina de cuadros más pesados; la puerta pasa con margen.

## Defectos menores

- El 99 de Perfora toca el borde de arriba de la ventana y tapa la «T» de «TE PEGA» (1280-rey-segunda-09): carriles del número, `mesa.ts:1199`.
- El sello «¡PRENDA!» esquiva el número pero cae sobre «×2 = 120 PASAN» de la cuenta (1280-chancho-canta-08 a 10): zonas prohibidas de `src/client/fx/director.ts`.
- El «4» que entra cuando el Rey se planta va a escala 1 a 1280 y grande en el teléfono (1280-rey-planta-08 a 10): `mesa.ts:1188-1199`.
- La ficha del rasgo «TAJO DE REVÉS» tapa media FURIA («FUR») durante todo el golpe (1280-rey-tajo-07 a 09): `mesa.css`, placa del rasgo.
- El aturdido suena con `frena`, el sonido del Escudo que frena: `mesa.ts:1298`, falta receta propia en `audio.ts`.

## Qué haría en la próxima versión

Un paquete de **estados con cuerpo y conteo de bolsillo**. Primero, el aturdido como estado vivo: estrellas que giran sobre el naipe, inclinación y sonido propio, igual en las tres ventanas, y de paso un lenguaje común para todo estado del enemigo (aturdido, plantado, furioso) que viva en el naipe y no en rótulos al costado. Segundo, la escalada del teléfono: cifra receptora que crece con cada aporte, fichas del HUD que se encienden al disparar y fórmula con Postas a tamaño pleno. Tercero, una aserción de QA de choques entre efímeros: ninguna chapa, sello ni número a escala 2 interseca el total, la placa TE PEGA, la cabecera ni el borde de la ventana, medida cuadro por cuadro como ya se hace con la letra chica. Cuarto, que la QA filme a 60 ms por cuadro el rebote del Rey que se planta y el nacimiento del sello. Con eso defiendo el 9,1 en diversión.
