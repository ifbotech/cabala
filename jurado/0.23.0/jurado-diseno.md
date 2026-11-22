```json
{
  "jurado": "jurado-diseno",
  "version": "0.23.0",
  "puntajes": { "claridad": 7.5, "diversion": 7.7, "estetica": 8.1, "veredicto": 7.7 },
  "defectos": [
    {
      "prioridad": "P1",
      "pantalla": "mesa · chip EXACTO del paño (mesa-exacto 1280 y 390)",
      "ventana": "todas",
      "archivo": "src/rules/bot.ts:126-130 (acomodoExacto) y :136-160 (mejorGolpe no lo usa) · src/client/pantallas/mesa.ts:352-366 (dialDe) · src/rules/combate.ts:343-349",
      "que": "El dial existe, pero casi nunca aparece y, cuando aparece, casi nunca es una decisión. Aparece solo si alguna disposición da Daño × Multi exactamente igual a la Vida. Con Multi 4 o más los totales saltan de a 4 o más, así que la coincidencia es rara, y el «al pelo» (5 %) quedó afuera. Cuando aparece sin Perfora (Copas, Oros, Bastos sin Lanza), el MÁXIMO está estrictamente dominado: en mesa-exacto, los 24 que sobran se tiran a la basura, mientras que el EXACTO paga 3 de oro, +1 de Multi de racha y un 35 % de Prenda. La mesa igual acomoda por defecto la opción peor. El bot no usa acomodoExacto: los exactos siguen entre 0,2 y 1,7 por partida (en la 0.22 iban de 0,3 a 1,8), y el laboratorio no sabe cuántas veces se ve el chip.",
      "por_que": "El dial tenía que darle al paño la pregunta que le faltaba. Hoy, en la mayoría de los golpes no hay chip, y en los que hay es un bono que el jugador tiene que descubrir, no una elección. La decisión real (exacto contra perforar al que viene) solo existe con Espadas o Lanza.",
      "propuesta": "1) El dial ofrece también AL PELO, que hoy no cobra nada. 2) Sin Perfora, la mesa acomoda directamente en EXACTO o AL PELO; el chip queda para cuando hay Perfora y dice el costo: «MÁXIMO → 72 al Caballo» frente a «EXACTO · +3 oro, racha». 3) Que el Medio duplique también el poder de su palo (Escudo, cura, oro o sobra), así elegir qué palo va al centro es la otra perilla. 4) Que el bot elija entre las dos y que el laboratorio cuente cuántos chips se vieron y cuántos se usaron."
    },
    {
      "prioridad": "P1",
      "pantalla": "mesa · la Corte en fila (rey-irrumpe; leído en código, no visto con el Facón)",
      "ventana": "todas",
      "archivo": "src/rules/combate.ts:549-557 (abatir: la sobra entra en sig sin mitad ni Escudo) · :340-342 (la mitad solo vale para el enemigo activo) · :752-755 (la segunda cara solo se dispara en golpe directo) · balance-config.json:258 (facon.sobra 3)",
      "que": "La sobra que Perfora entra en el siguiente de la fila con sig.vida -= sobra, sin aplicar la regla de «se planta en la mitad» y sin marcar la segunda cara. Con el Facón Maldito, que ahora pasa la sobra ×3, un golpe grande al Caballo del tramo 3 se lleva al Rey entero en su primera cara. Ejemplo: 5000 contra los 2200 de Vida del Caballo, ×3, son unos 8400 contra los ~4750 del Rey. Aunque no lo mate, lo deja por debajo de la mitad sin haber mostrado su segunda cara, y si el golpe siguiente lo abate, esa cara nunca aparece.",
      "por_que": "Las dos caras del Rey son el clímax que se construyó en la 0.20, y la Constitución las garantiza. La única Evolución de Espadas es justamente la que permite saltearlas. Es un combo roto que no grita: el Rey desaparece en el humo de la perfora, sin su cartel.",
      "propuesta": "Pasar la sobra por la misma función de daño que el golpe directo. Con un Rey en su primera cara, la perfora se planta en la mitad, se dispara la segunda cara y aparece el cartel «¡LO PARTISTE AL MEDIO!» con su sello. El grito queda y el clímax también. Que el laboratorio cuente los Reyes abatidos por perfora."
    },
    {
      "prioridad": "P1",
      "pantalla": "botín · jackpot de Evolución (evolucion-jackpot), ELEGÍ UN AMULETO (oferta-evoluciona), HUD (hud-evolucion-foco)",
      "ventana": "todas",
      "archivo": "src/rules/evoluciones.ts:27-52 y :55 (evoluciono) · src/rules/balance-config.json:256-267 · src/client/pantallas/camino.ts (sello «+ Multi siempre, y más»)",
      "que": "Sigue igual que en la 0.22, salvo el ×3 del Facón. Tres de las cuatro Evoluciones son retoques de número: el Facón (sobra ×3 en vez de ×2, más +1 de Multi), el Sol (tope +3 y 2 de oro) y el Brindis (le saca la condición al Cáliz y le suma +1). Las cuatro despiertan con cualquier don del Rey de su palo, y «Maldito» sigue sin maldición. El sello de la oferta lo resume en «+ Multi siempre, y más», que no promete nada.",
      "por_que": "Era la promesa del Salto 2: el momento estilo Duo de Hades en que dos piezas cambian la forma de jugar. Con un jackpot prismático de 1,2 s que paga +1 de Multi, el jugador aprende a ignorarlo. Los Amuletos siguen sin armar builds: es mi P1 por cuarta versión seguida.",
      "propuesta": "Una regla nueva y una maldición escrita por Evolución, en 110 caracteres. Facón Maldito: la sobra pasa también al primer enemigo del combate siguiente, pero tus Copas no curan. Brindis de Sangre: la cura que no te entra se vuelve Daño ×2, y cada golpe te cuesta 1 de Vida. Sol de la Timba: cada Oro del golpe da +1 de Multi, y la Pulpería te cobra un 25 % más. Garrote: igual que ahora, pero el primer golpe de cada combate entra sin Escudo. Que despierten con un don de nivel 2. Siguen siendo 15 Amuletos."
    }
  ],
  "aciertos": [
    "La Forja Brava ya es una apuesta de verdad. Duplica el naipe entero: un 9 con +8 pasa a pegar 34. Las dos mutaciones se ven antes de arrimar, y elegir una es aceptar el 50 % (fogon-mutaciones). La esperanza quedó pareja en Daño y positiva con la mutación, y el bot la toma cuando el Mazo aguanta perder el naipe (bot.ts:287-293).",
    "Por primera vez el Fogón arma una build propia: el naipe estrella. Forjás un 9 de Oros con Chispa de Oro, lo cosés en la Cábala Negra y alimentás el Sol de la Timba o el Peso fuerte.",
    "El resumen en dos capas con OTRA MANO YA es el mejor gancho de «una más» que tuvo el juego. Build Estrella con el nombre de la Evolución, QUÉ TE FRENÓ con el porcentaje en rojo y el récord contra tu mejor, todo con un botón grande y dorado (resumen-victoria, resumen-derrota, 390).",
    "El Altar con DEVOLVER (altar-devolver) saca el miedo a probar: el metajuego invita a experimentar con builds sin castigarlas.",
    "En el chip EXACTO, cuando aparece, la cuenta se lee de un vistazo: LO ABATÍS, el chip naranja con R3 y SOBRAN 24 en una sola fila, también en el teléfono (mesa-exacto 390)."
  ],
  "capturas_vistas": [
    "visual-qa/1280x800/mesa-exacto.png",
    "visual-qa/390x844/mesa-exacto.png",
    "visual-qa/1280x800/mesa-seleccion.png",
    "visual-qa/1280x800/fogon.png",
    "visual-qa/1280x800/fogon-mutaciones.png",
    "visual-qa/390x844/fogon-mutaciones.png",
    "visual-qa/1280x800/forja-brava.png",
    "visual-qa/1280x800/resumen-victoria.png",
    "visual-qa/390x844/resumen-victoria.png",
    "visual-qa/1280x800/resumen-derrota.png",
    "visual-qa/1280x800/altar-devolver.png",
    "visual-qa/1280x800/evolucion-jackpot.png",
    "visual-qa/1280x800/oferta-evoluciona.png",
    "visual-qa/1280x800/hud-evolucion-foco.png",
    "visual-qa/1280x800/cabala-negra.png",
    "visual-qa/1280x800/botin-tesoro.png",
    "jurado/secuencias/1280-golpe-04.png",
    "jurado/secuencias/1280-postas-golpe-06.png",
    "jurado/secuencias/1280-rey-irrumpe-06.png",
    "jurado/secuencias/1280-rey-irrumpe-10.png",
    "jurado/secuencias/1280-rey-irrumpe-12.png",
    "jurado/secuencias/1280-rey-tajo-06.png",
    "jurado/secuencias/1280-rey-cae-16.png",
    "jurado/secuencias/1280-botin-brota-08.png"
  ]
}
```

## Veredicto

**Respecto de la 0.22.0:** la Forja Brava quedó **resuelta casi entera**: duplica el naipe entero, ofrece dos mutaciones a la vista con su nombre en el cartel y el bot la toma. Faltan la ceniza y que el laboratorio la cuente. El paño **mejoró en parte**: está el chip EXACTO, pero no el AL PELO ni el Medio que duplique su palo. Las Evoluciones **siguen** como estaban. Entre los menores quedaron **resueltos** el arrastre que mentía, el Dado que tapaba LB/RB y REGLAS.md. **Siguen** el laboratorio ciego, el Escalón vedado a los iguales y el Cetro.

Simulé tres builds con las piezas reales:

- **Bastos tanque (Chinchón):** Poncho → Garrote con Empalizada y Palo y palo. Está igual que en la 0.22 y sigue siendo la build más clara.
- **Espadas (Escoba):** Lanza → Facón ×3. Ahora el pico es real, pero por un agujero: la perfora entra en el Rey sin respetar la mitad y se saltea su clímax (P1 #2).
- **Naipe estrella (Truco):** Fogón con un 9 de Oros, Forja con Chispa de Oro y Cábala Negra para coserlo. Pega 34 o más, da +3 de oro cada vez que sale y alimenta Peso fuerte. Es la primera build que nace del Fogón y se siente distinta. El límite: es un naipe en 38, y con mano 3 sale una de cada cuatro o cinco manos.

Son tres builds distintas, aunque una se apoya en un agujero. Es otro paso adelante.

**Laboratorio:** la caída en el tramo 1 sigue despareja: 19,2 % en Escoba contra 2,3 % en Chancho. Los cantos de Chancho siguen en 1,5 por partida y los de Truco en 23,9. El mejor golpe de Escoba (54 000) más que triplica el de Chinchón. **Leído en código, no visto:** el sonido de la forja, el corte del TURBO en el jackpot y el baúl del Tesoro abriéndose.

## Defectos menores

- En el teléfono, el Fogón con mutaciones solo dice «50 % de que se queme»: falta el premio («el naipe entero vale doble»), que en 1280 sí aparece (390 fogon-mutaciones): `src/client/pantallas/camino.ts:860-900`.
- Mientras entra el Rey, la cuenta sigue diciendo «LO ABATÍS · SOBRAN 167» con el Rey en 410/410, porque quedó la vista previa del golpe anterior (rey-irrumpe-10 y 12): `src/client/pantallas/mesa.ts` (repintado de la cuenta en el evento `entra`).
- «+8★ ×2» no le dice al jugador cuánto pega su naipe forjado: tendría que decir «pega 34». Además, el estado de QA forja-brava usa temple 12, imposible en el juego: `src/client/pantallas/camino.ts:51,866` y `src/client/qa.ts:455`.
- En la derrota, QUÉ TE FRENÓ dice quién y cuánto le quedaba, pero no por qué (Tajo, Furia, Remate). Y el récord elige «golpe más grande» cuando «llegar más lejos» motivaría más: `src/rules/resumen.ts`.
- El laboratorio no cuenta Forjas ni quemadas, chips de EXACTO vistos y usados, Evoluciones despiertas ni Reyes abatidos por perfora: `scripts/analyze-meta.ts`.

## Qué haría en la próxima versión

**«El paño decide, el Rey resiste, las piezas mandan».** El dial pasa a tener tres posiciones: MÁXIMO, EXACTO y AL PELO. Sin Perfora, la mesa elige sola la opción que paga. Con Perfora, el chip dice qué perdés y qué ganás, y el Medio duplica también el poder de su palo. La sobra que Perfora pasa por la misma regla de la mitad: el Facón sigue siendo un grito («¡LO PARTISTE AL MEDIO!»), pero el Rey muestra su segunda cara. Las cuatro Evoluciones se reescriben como cambios de regla con su maldición y despiertan con un don de nivel 2. La Forja Brava deja ceniza al quemarse. Y el laboratorio mide todo esto antes de que vote el panel.
