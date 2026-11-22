```json
{
  "jurado": "jurado-arte",
  "version": "0.24.0",
  "puntajes": { "claridad": 8.0, "diversion": 7.8, "estetica": 8.1, "veredicto": 7.9 },
  "defectos": [
    {
      "prioridad": "P0",
      "pantalla": "La mesa en el teléfono: los naipes amputados",
      "ventana": "390x844 (mesa, mesa-seleccion, mesa-dejalo-justo, mesa-escalon; secuencias 390-golpe y 390-rey-segunda)",
      "archivo": "src/client/mano.ts:258-261 (el naipe apoyado se ve al 40 %: hp * 0.4) y :326-330 (la fila de atrás asoma 46 px); src/client/estilos/mesa.css:912 y :4464-4496 (el naipe del Rey se acorta y TE PEGA cae adentro); src/client/pantallas/mesa.ts:947 (el «−N» de VIDA) y :1873 (el «+N» que sube)",
      "que": "En el teléfono no se ve entero ningún naipe del jugador. Los del paño muestran la mitad de arriba: el 9 de Copas enseña 5 de sus 9 copas y el 3, dos. La mano asoma una franja bajo la barra del pulgar. Con la mano de 8 (mesa-escalon), el 2 de Oros de la fila de atrás flota solo, como un naipe perdido, y un Comodín queda reducido a su rótulo de canto. Encima, en mesa-escalon el recuadro TE PEGA 2 tapa la cara entera de la Sota de Oros. En las secuencias, el «−42» del Tajo se monta sobre el retrato y sobre el 35 de VIDA, y un «+8» atraviesa DESCARTAR.",
      "por_que": "Es la pantalla donde se juega el 90 % del tiempo, y el naipe es el protagonista del juego. Con el arreglo de las ayudas, el escritorio quedó limpio. El teléfono es ahora la peor composición del juego: tres pisos de naipes cortados, con el ojo saltando entre los cortes.",
      "propuesta": "En el teléfono, el paño muestra los naipes enteros a menos escala (k menor, sin recorte); que achique, no que corte. La mano de 8 va en una sola fila en abanico con 44 px tocables, y el naipe con el foco sube entero, en vez de dos filas montadas. TE PEGA va a la columna del Bufón, al costado del naipe del Rey, nunca adentro. Los números con dueño se acotan a su caja (clamp del ancho) y los «+N» de las cartas no cruzan la barra del pulgar. Sumar a la QA a 390: ningún .carta del jugador visible por debajo del 85 % de su alto."
    },
    {
      "prioridad": "P1",
      "pantalla": "La ayuda de la bandeja del HUD (Evolución con el foco)",
      "ventana": "1280x800 (hud-evolucion-foco)",
      "archivo": "src/client/ui.ts:204 (TAPA_NUNCA = 'button, .titulo, .hud [data-n]': el enemigo no cuenta como obstáculo) y :270-283 (el hueco libre más cercano); src/client/hud.ts:474 (el texto de la bandeja)",
      "que": "La ayuda ya no tapa GOLPEAR ni la mano (bien), pero escapa a la escena y cae encima del Rey: tapa el naipe de la Sota, la mitad de TE PEGA, el rótulo SOTA DE… y la línea de controles del mando. Además es un muro de 13 renglones: la regla del Garrote, después un glosario («Amuletos, Cábalas, cargas de los Reyes…») y después Filo, Coraza y Trago.",
      "por_que": "Lo que el Rey te pega es la cifra más importante de la mesa. Una ayuda puede tapar la escena, pero nunca al enemigo. Y el muro de texto entierra lo único que se pidió mirar: qué hace la Evolución.",
      "propuesta": "Sumar a TAPA_NUNCA `.enemigo, .e-ataque, .e-barras, [data-mano] .carta`. Si no hay hueco, la ayuda se apoya pegada al borde de arriba de la bandeja, del ancho de la bandeja. El texto se limita a la pieza con el foco (nombre, regla y estado, cinco renglones como mucho) y el glosario pasa a JUGADAS."
    },
    {
      "prioridad": "P1",
      "pantalla": "¡FORJA BRAVA! (tercera pasada)",
      "ventana": "1920x1080 y 1280x800 (fogon-mutaciones, forja-brava-eleccion); a 390 está bien",
      "archivo": "src/client/pantallas/camino.ts:881 (las mutaciones como «opcion marco dorado»); src/client/estilos/pantallas.css:4264-4293 (.opcion.forja-mut, sin tramado, con el ícono a 2×)",
      "que": "Las mutaciones ya son cartas y SEGUIR es de hierro (bien), pero el relleno es marrón liso, sin un punto de tramado: dos ladrillos planos. La caja de CHISPA DE ORO ocupa dos renglones y deja el 40 % de la carta vacía. El ícono de Doble Filo sigue siendo una barrita rosa (un lápiz labial, no una hoja de dos filos). El título sigue dejando «MULTI» solo en el segundo renglón. A 1280, el panel tapa el fogón, que es el centro de la escena.",
      "por_que": "Es el clímax del Fogón, y el resto del juego vive del tramado. Dos planos de color lisos se leen como un prototipo pegado sobre la escena.",
      "propuesta": "Rellenar con tramado Bayer de brasa (rampa de naranja a índigo, con la luz del fuego desde abajo). Igualar las cajas de regla con una altura mínima común y el ícono arriba. Redibujar Doble Filo como un facón de hoja doble con chispa roja, a 3×. Título de un renglón: «+8★ +1 MULTI». A 1280, el panel sube y deja ver la llama entera."
    }
  ],
  "aciertos": [
    "Mi P0 de la previa quedó resuelto donde dolía: ELEGÍ UN AMULETO con candado abre limpio en las tres ventanas, sin cartel sobre el título ni sobre el naipe que Evoluciona. En el Altar, la ayuda de DEVOLVER se fue abajo a la derecha y MEJORAR se ve entero. Y la oferta que Evoluciona dice por qué («con tu don de Copas»), con su minicáliz al lado.",
    "El Tesoro ya no pisa el HUD: a 1920 queda un colchón de 80 px entre los naipes y el marco, y a 1280 cierra justo encima. El precio se lee a plena tinta, con el candado de oro, y «Te faltan 20 de oro» en carmín.",
    "DEJALO JUSTO es una acción con premio y está en su lugar: un marco prismático al costado de lo apoyado a 1920 y a 1280, y dentro de la cuenta en el teléfono. El resumen sigue siendo la mejor pantalla del juego, y a 390 ahora entra con los botones al pie sin tapar la segunda capa."
  ],
  "capturas_vistas": [
    "visual-qa/1920x1080/botin-tesoro.png", "visual-qa/1920x1080/oferta-evoluciona.png", "visual-qa/1920x1080/forja-brava-eleccion.png", "visual-qa/1920x1080/fogon-mutaciones.png",
    "visual-qa/1920x1080/mesa-dejalo-justo.png", "visual-qa/1920x1080/mesa-seleccion.png", "visual-qa/1920x1080/resumen-victoria.png", "visual-qa/1920x1080/rey-mascara.png",
    "visual-qa/1920x1080/coleccion-amuletos.png", "visual-qa/1920x1080/mapa-tesoro.png", "visual-qa/1920x1080/pulperia-chiches.png",
    "visual-qa/1280x800/botin-tesoro.png", "visual-qa/1280x800/altar-devolver.png", "visual-qa/1280x800/hud-evolucion-foco.png", "visual-qa/1280x800/forja-brava-eleccion.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png", "visual-qa/1280x800/mesa-seleccion.png", "visual-qa/1280x800/resumen-derrota.png", "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/390x844/botin-tesoro.png", "visual-qa/390x844/mesa-dejalo-justo.png", "visual-qa/390x844/mesa-seleccion.png", "visual-qa/390x844/mesa.png",
    "visual-qa/390x844/mesa-escalon.png", "visual-qa/390x844/fogon-mutaciones.png", "visual-qa/390x844/resumen-derrota-movil.png", "visual-qa/390x844/resumen-victoria.png",
    "jurado/secuencias/1280-rey-segunda-01.png", "jurado/secuencias/1280-rey-segunda-04.png", "jurado/secuencias/1280-rey-segunda-06.png", "jurado/secuencias/1280-rey-segunda-08.png",
    "jurado/secuencias/1280-rey-segunda-09.png", "jurado/secuencias/1280-rey-segunda-11.png", "jurado/secuencias/1280-rey-segunda-12.png",
    "jurado/secuencias/390-rey-segunda-10.png", "jurado/secuencias/390-rey-segunda-11.png", "jurado/secuencias/390-golpe-05.png",
    "jurado/secuencias/1280-golpe-05.png", "jurado/secuencias/1280-rey-cae-09.png", "jurado/secuencias/1280-mando-elige-03.png",
    "mirar/1280-fogon-suspenso.png"
  ]
}
```

## Veredicto

La 0.24.0 hizo lo que pedí: ninguna ayuda se abre sola sobre lo que se elige. El Tesoro, el Altar y la oferta que Evoluciona se leen limpios a la primera, y el Tesoro ya no se monta sobre el HUD. DEJALO JUSTO pasó de chip a acción con premio, en un marco prismático que se distingue de todo lo demás. Por eso claridad sube a 8,0.

Estética queda en 8,1. Lo nuevo no está a la altura del tramado del resto: las cartas de mutación de la Forja Brava son dos ladrillos marrones lisos. Y con el escritorio ya limpio, el teléfono quedó como la deuda más grande. Ahí la mesa corta todos los naipes del jugador: los del paño, los de la mano y, en mesa-escalon, la cara del Rey, que queda bajo TE PEGA. Leído en código y no visto: la tercera pasada dura 1,5 s y sale con hitstop; en la foto de suspenso (en inglés) se ve el naipe sobre el fuego, pero no el temblor.

**Respecto de la previa:** quedaron resueltos el P0 de las ayudas en el Tesoro y en el Altar y el P1 del Tesoro sobre el HUD. El P0 de la bandeja del HUD está a medias: ya no tapa GOLPEAR, pero ahora tapa al Rey. Del P1 de la Forja, las cartas y SEGUIR en hierro están hechos; siguen el ícono de Doble Filo, el título partido y el oro sin tramado. Entre los menores siguen la Colección vacía, la banda negra de la máscara, el «III» del nivel en TU MANO ESTRELLA y el Garrote igual al escudo INMUNE A BASTOS.

## Defectos menores

- **ELEGÍ UN AMULETO a 1920:** Taba y Cofre del Caudal son cartas de 450×480 con el ícono a ~80 px y el 55 % de abajo vacío. Conviene un alto ajustado al contenido o el ícono a k4 en 1080p. `src/client/estilos/pantallas.css:390`.
- **JUGADAS y MENÚ salen como cajas vacías a 390 con mando o teclado** (mesa-dejalo-justo): a ≤700 px se esconde el glifo y también el «?». `src/client/estilos/base.css:1347-1358`.
- **La Colección de Amuletos** deja tablón vacío en la mitad de abajo, y el Bufón y las Evoluciones no aparecen. `src/client/pantallas/menu.ts:320`.
- **La máscara del Rey** sigue siendo una banda negra plana con dos rayas celestes. `src/client/estilos/mesa.css:4330`.
- **El resumen:** el «III» sigue pegado a la última ficha, y a 1920 la columna QUÉ TE FRENÓ deja 200 px de negro. A 390, en la derrota, el título corta el índice de arriba de los tres Reyes. `src/client/pantallas/camino.ts:1208` y `src/client/estilos/pantallas.css:4240`.

## Qué haría en la próxima versión

**El teléfono como pantalla de primera.** Una mesa de 390 rediseñada desde cero:
- el Rey entero arriba, con TE PEGA a su costado;
- la cuenta compacta;
- el paño con los naipes enteros a menos escala;
- la mano en una sola fila en abanico, con el naipe enfocado subiendo entero;
- números que nunca salen de su caja.

Al mismo tiempo, una pasada de tramado sobre todo lo que hoy es relleno liso: las cartas de la Forja, el interior vacío de las ofertas y la banda de la máscara, que pasaría a ser un telón tramado con candil. La Colección, como vitrina con el Bufón detrás del mostrador y cada Evolución colgada junto a su forma de base. Con eso la estética pasa de 8,5 y el veredicto llega a 8.
