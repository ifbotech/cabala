```json
{
  "jurado": "jurado-diseno",
  "version": "0.29.0",
  "puntajes": { "claridad": 8.5, "diversion": 8.9, "estetica": 8.5, "veredicto": 8.7 },
  "defectos": [
    {
      "prioridad": "P2",
      "pantalla": "Evoluciones: piezas («LO QUE LLEVÁS»), elegi-amuleto, oferta-evoluciona, elegi-bendicion y REGLAS.md",
      "ventana": "todas",
      "archivo": "src/client/pantallas/camino.ts:80-84 (modalPiezas) · src/client/ui.ts:483-490 (sello) · src/client/textos.ts:348 («con tu don de {p}») · scripts/reglas.ts:64 · src/rules/evoluciones.ts:1 y :54 (comentarios viejos)",
      "que": "La Evolución ahora pide cuatro niveles de dones del Rey de su palo, pero el juego no lo dice en ningún lado. REGLAS.md sigue diciendo «y además un don del Rey de su palo»; la oferta dice «con tu don de Copas» (uno); en «LO QUE LLEVÁS» el Cofre del Caudal figura como un Épico cualquiera, sin «2 de 4»; y el sello ★ EVOLUCIONA solo aparece en la pieza que da el cuarto nivel. En elegi-amuleto el Cofre se ofrece con «SINERGIA · Suma a Fortuna» y nada sobre lo que le falta para despertar.",
      "por_que": "La 0.29 convirtió la Evolución en una meta de media partida, y una meta que no se ve no se persigue: el jugador se entera cuando ya está a un don. Los tres dones anteriores se eligen a ciegas. Es justo la apuesta («repito este don o diversifico») que el cambio quería crear. Además la regla escrita es falsa.",
      "propuesta": "En «LO QUE LLEVÁS» y en la ayuda del Amuleto en el HUD: «Despierta con 4 niveles de dones del Cacique · llevás 2». En cada don de ese Rey ofrecido, una micro-línea «Garrote del Cacique 3 de 4» en lugar de la SINERGIA genérica. Corregir REGLAS (scripts/reglas.ts:64) y «con tus dones de {p}»."
    },
    {
      "prioridad": "P2",
      "pantalla": "Truco · mesa y scripts/meta-report.json (golpe medio 318 / 802 / 1922; cantos 14,7; caídas 236 / 571 / 1348)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:264 (25 × tramo, fijo) y :131 · src/rules/balance-config.json:172-173",
      "que": "El Envido ya no suena siempre (de 21,1 a 14,7 cantos) y las caídas del tramo 3 bajaron a 62,6 %. Pero cuando está en la mano sigue ganando sin discusión: +25 / +50 / +75 fijos con dos cartas. En el tramo 3 un 5 y 6 de un palo da (75 + 11) × 9 = 774 antes de piezas; una Escalera de palo de tres cartas, (12 + 18) × 11 = 330. La Flor de tres comparte el Multi 2 y no cobra el Envido. El golpe medio del tramo 1 subió de 295 a 318, entre 43 y 71 % arriba de los otros Mazos (186 a 223).",
      "por_que": "El umbral cambió la pregunta de «¿canto?» a «¿me tocó?»: es suerte de robo más descarte, no una decisión entre jugadas. Un 1 y 7 paga igual que un 6 y 7, así que tampoco importa qué Envido armo.",
      "propuesta": "Que el Envido valga por sus puntos: (suma de las dos cartas + 10) × tramo en vez de 25 × tramo. Un 6 y 7 paga 23 / 46 / 69; un 3 y 5 paga 18 / 36 / 54 y ya pierde contra una Escalera con Escalón. Meta: golpe medio del tramo 1 ≤ 260 con cantos entre 10 y 14."
    },
    {
      "prioridad": "P2",
      "pantalla": "Golpe exacto, «al pelo» y racha (mesa-dejalo-justo, dial R3) · scripts/meta-report.json (exactos 0,2 a 1,9)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:528-549 (racha y Hoja y broquel solo con exacto) · scripts/lab.ts:87 (no suma stats.alPelo) · scripts/reglas.ts:76",
      "que": "El «al pelo» se ensanchó a 10 % y paga 1 de oro, pero el exacto sigue en 0,2 (Truco) a 1,9 (Mentiroso) por partida y el informe no cuenta los «al pelo»: no se puede saber si la precisión pesa más que antes. La racha solo sube con exactos, así que el tope de 3 sigue sin armarse, y Hoja y broquel no cobra con el «al pelo»: sigue siendo un Pacto Dual muerto. REGLAS dice «no cobrás el premio» y el motor paga 1 de oro; la mesa (mesa-dejalo-justo) tampoco muestra ese +1.",
      "por_que": "Es la mecánica con más interfaz propia (dial, chip EXACTO, cartel, racha, música) y sigue pasando una vez por partida. Lo nuevo no se puede medir ni se ve cobrar.",
      "propuesta": "Que el «al pelo» sume medio paso de racha (dos «al pelo» valen un exacto) y dispare Hoja y broquel a la mitad (+2 de Escudo). Mostrar «+1 de oro» junto a ¡AL PELO! en la cuenta. Sumar `alPelo` al informe. Meta: exactos más «al pelo» entre 4 y 6 por partida."
    }
  ],
  "aciertos": [
    "Las Evoluciones pasaron de 85–94 % a 50,8–59,9 % de las partidas: ya no son el estado normal del Épico. El Poncho, el Cáliz y el Cofre sin despertar vuelven a jugarse media partida.",
    "Cada maldición cobra por algo distinto y se ve antes de soltar: en mesa-garrote la Carta sola de Espadas avisa «MALDICIÓN −5 DE ESCUDO» y el TE PEGA ya lo descuenta (23 − 5); en mesa-maldicion el Facón avisa «−3 DE VIDA». El Brindis dejó de alimentarse solo: sin Copas que curen es un cañón de vidrio de verdad.",
    "El Truco ya no canta en cada golpe (14,7) y sus caídas en el tramo 3 bajaron de 74 a 62,6 %, dentro de la meta que pedí. Con el umbral, el Cascabel pasa a ser una apuesta en el Mazo que antes lo llevaba gratis.",
    "Chancho Va: el Aturdido del canto que abate pasa al que entra y «de un saque» vale con Degüello (leído en código, combate.ts:566 y :800). La build de control ya no tiene el agujero.",
    "El Rey se planta sin que el cartel cruce la ESTOCADA (rey-planta-08): «SE PLANTA EN LA MITAD · 196 SE PIERDEN» en su caja."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa.png",
    "visual-qa/1280x800/mesa-grito.png",
    "visual-qa/1280x800/mesa-rey.png",
    "visual-qa/1280x800/mesa-dejalo-justo.png",
    "visual-qa/1280x800/mesa-garrote.png",
    "visual-qa/1280x800/mesa-maldicion.png",
    "visual-qa/1280x800/mesa-sol.png",
    "visual-qa/1280x800/mesa-chancho.png",
    "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/elegi-una.png",
    "visual-qa/1280x800/elegi-amuleto.png",
    "visual-qa/1280x800/elegi-bendicion.png",
    "visual-qa/1280x800/cabala.png",
    "visual-qa/1280x800/pulperia.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/jugadas.png",
    "visual-qa/1280x800/piezas.png",
    "visual-qa/1280x800/mapa.png",
    "visual-qa/1280x800/fin-victoria.png",
    "visual-qa/1280x800/fin-derrota.png",
    "visual-qa/390x844/mesa-garrote.png",
    "jurado/secuencias/1280-golpe-05.png",
    "jurado/secuencias/1280-botin-brota-08.png",
    "jurado/secuencias/1280-chancho-aturde-04.png",
    "jurado/secuencias/1280-chancho-aturde-07.png",
    "jurado/secuencias/1280-chancho-aturde-10.png",
    "jurado/secuencias/1280-chancho-aturde-15.png",
    "jurado/secuencias/1280-chancho-aturde-19.png",
    "jurado/secuencias/390-chancho-aturde-10.png",
    "jurado/secuencias/1280-maldicion-08.png",
    "jurado/secuencias/1280-sol-descarta-05.png",
    "jurado/secuencias/1280-rey-planta-08.png"
  ]
}
```

## Veredicto

**Respecto de la 0.28.0:**
- Envido (P2): **resuelto a medias**. Frecuencia (14,7) y caídas del tramo 3 (62,6 %) cumplen; **sigue** el dominio del canto de dos cartas y el tramo 1 quedó más alto (318).
- Evoluciones y maldiciones (P2): **resuelto en reglas** (50–60 %, cuatro maldiciones distintas). Abre un defecto nuevo: el requisito no se muestra y REGLAS lo dice mal. **Sigue** sin contarse lo que cobra cada maldición.
- Exacto (P2): **sigue**. Se hizo la mitad barata (el «al pelo») y no se mide.
- Menores: **resueltos** el encadenado con Degüello, la Pierna que abate y el cartel del Rey. **Siguen** `pierna: 1` muerto y el Chinchón flojo.

No abro P1: nada rompe ni frena. Es la versión que más movió el diseño en tres entregas, y por eso subo diversión dos décimas. Bajo claridad una: la regla estrella del cambio no está escrita bien en ningún lado.

Tres builds con las piezas reales:

- **Truco + Cascabel + Lanza → Facón.** Ahora hay que ganarla: Degüello ×2 y Primera sangre ×2. El Degüello evita el corte del Facón, linda sinergia. El Cascabel cobra −1 en el golpe sin Envido, así que descarto para buscar el par de 8 o más. Más viva que antes, pero cuando el Envido está, no hay nada que pensar.
- **Chancho Va + Boleadoras + Poncho → Garrote.** Empalizada y Palo y palo hasta cuatro niveles. Uso el pase gratis para tener un Basto en cada golpe y no perder medio Escudo; contra el Inmune a Bastos el Basto no pega pero cuida el Escudo. Es la decisión más rica de la versión.
- **Mentiroso + Cáliz → Brindis + Sangre por sangre ×3 + Sangría.** Sin Copas que curen, solo me levantan el Fogón y la Sangría. A media Vida voy con +8 de Multi. De paso apaga la segunda cara del Bacanal.

Se sienten distintas entre sí, más que en la 0.28.

**Reyes:** clímax (4,2 a 4,7 golpes, se plantan y cambian de regla). **Bufón y Cábala:** pesan, sin novedad. **Mitad de partida:** 14,4 a 15,7 minutos; la Evolución que llega en el tramo 2 es por fin el hito que le faltaba, cuando llega.

**Leído en código, no visto:** el Aturdido que pasa al que entra, «de un saque» con Degüello, el oro del «al pelo» y el Brindis sin cura.

## Defectos menores

- La secuencia `chancho-aturde` no muestra la regla nueva: la Sota tiene 6000 de Vida y no cae, así que nunca se ve el Aturdido pasar al que entra: `scripts/secuencias.ts`.
- El Brindis apaga dos de los tres dones que lo despiertan: Otra ronda y Copa rebosante quedan muertos (6 de los 9 niveles del Bacanal) y nada lo avisa: `src/rules/combate.ts:332` y `:349`.
- El informe no cuenta lo que cobra cada maldición ni en qué tramo despierta la Evolución: `scripts/lab.ts:89`.
- `pierna: 1` sigue multiplicando por uno, y quedan comentarios de reglas viejas («el Brindis bebe en cada golpe», «el golpe que no abate»): `src/rules/balance-config.json:202`, `src/rules/combate.ts:321`, `:385`, `:750`.
- Chinchón: 10,2 % de caídas en el tramo 1 y 15,7 % en el Reinado 8, contra 28,1 % del Chancho: `src/rules/balance-config.json:176`. Y la Constitución habla de «un don de nivel 4» con dones que llegan a 3: `CONSTITUCION.md:172`.

## Qué haría en la próxima versión

**«Que la meta se vea».** Cada Épico muestra su camino: «Despierta con 4 niveles del Cacique · llevás 2» en «LO QUE LLEVÁS», en el HUD y en cada don que suma. El don que apaga otro bajo una Evolución lo avisa antes de tomarlo. El Envido vale por sus puntos, (suma + 10) × tramo, para que un Envido flaco pierda contra una Escalera con Escalón. El «al pelo» sube media racha, dispara Hoja y broquel a la mitad y muestra su +1 de oro. El informe suma «al pelo», lo que cobra cada maldición y el tramo en que despierta cada Evolución. Una secuencia nueva con el ¡CHANCHO! que abate y aturde al que entra. Se recertifica con golpe medio del Truco en el tramo 1 ≤ 260, Evoluciones entre 45 y 60 % y de 4 a 6 golpes de precisión por partida.
