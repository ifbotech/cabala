// (0.28) La regla que cerró el teléfono, medida también en el escritorio y EN MOVIMIENTO: «nada vivo se monta, nada
// tapa la cuenta, la mano se ve entera». Corre dentro de la página (la llaman la QA visual, en cada estado quieto, y
// las secuencias, en cada cuadro del golpe). Falla si:
//   · «mano-tapa-cuenta»: un naipe de la mano o del paño se monta sobre un renglón de texto de la cuenta (la fórmula,
//     sus chips, el desglose, CORTÁS, el dial);
//   · «mano-cortada»: fuera del teléfono, un naipe de la mano queda cortado por el HUD (su pie pasa del borde de arriba
//     del HUD) o va recortado;
//   · «mano-montada»: fuera del teléfono, un naipe vivo de la mano enseña menos del 45 % de su ancho (la mano de 8 a 2×
//     va en abanico de media carta: su índice y la mitad de sus pintas; nunca en tiras).
// `quietas`: en una ráfaga solo cuentan los naipes posados (los que no se movieron desde la muestra anterior): el
// reparto que llega volando desde el Mazo pasa por delante del HUD a propósito.
export function manoViva(o: { quietas?: boolean }): { regla: string; detalle: string }[] {
  const out: { regla: string; detalle: string }[] = [];
  const mesa = document.querySelector('.mesa');
  if (!mesa || mesa.classList.contains('cobra') || document.querySelector('#capa .velo, .cortina')) return out;
  const g = window as unknown as { __manoAntes?: Map<string, number[]> };
  const antes = g.__manoAntes ?? new Map<string, number[]>();
  const ahora = new Map<string, number[]>();
  const visible = (el: Element): boolean => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05 && r.width > 2 && r.height > 2;
  };
  const cartas = [...document.querySelectorAll<HTMLElement>('.mesa [data-mano] .carta:not(.volando):not(.en-transito)')].filter((c) => visible(c) && Number(c.style.zIndex || 0) < 100);
  const posadas: HTMLElement[] = [];
  for (const c of cartas) {
    const r = c.getBoundingClientRect();
    const id = c.dataset.id ?? '';
    ahora.set(id, [r.left, r.top]);
    const a = antes.get(id);
    if (!o.quietas || (a && Math.abs(a[0] - r.left) <= 4 && Math.abs(a[1] - r.top) <= 4)) posadas.push(c);
  }
  g.__manoAntes = ahora;
  if (document.body.classList.contains('arrastrando')) return out;
  const donde = (r: DOMRect): string => `${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}`;
  // los renglones de texto de la cuenta que se ven
  const renglones: { r: DOMRect; t: string }[] = [];
  for (const cu of document.querySelectorAll('.mesa [data-cuenta] .cuenta:not(.reposo)')) {
    if (!visible(cu)) continue;
    const w = document.createTreeWalker(cu, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const p = n.parentElement;
      if (!(n.textContent ?? '').trim() || !p || !visible(p)) continue;
      // (lo que un ancestro esconde tampoco cuenta)
      let oculto = false;
      for (let a: Element | null = p; a && a !== cu; a = a.parentElement) {
        const sa = getComputedStyle(a);
        if (sa.visibility === 'hidden' || sa.display === 'none') oculto = true;
      }
      if (oculto) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const c of rg.getClientRects()) if (c.width > 2 && c.height > 2) renglones.push({ r: c, t: (n.textContent ?? '').trim().slice(0, 24) });
    }
  }
  const cruzan = (a: DOMRect, b: DOMRect): boolean => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
  const vistos = new Set<string>();
  const falla = (regla: string, detalle: string): void => {
    if (vistos.has(regla)) return;
    vistos.add(regla);
    out.push({ regla, detalle });
  };
  const escritorio = innerWidth > 700;
  const hud = document.querySelector('.mesa .hud')?.getBoundingClientRect();
  for (const c of posadas) {
    const R = c.getBoundingClientRect();
    const que = `el naipe ${c.dataset.id} ${c.classList.contains('elegida') ? 'del paño' : 'de la mano'} (${donde(R)})`;
    const pisa = renglones.find((x) => cruzan(x.r, R));
    if (pisa) falla('mano-tapa-cuenta', `${que} tapa «${pisa.t}» de la cuenta (${donde(pisa.r)})`);
    if (!escritorio || c.classList.contains('elegida')) continue;
    if (hud && R.bottom > hud.top + 2) falla('mano-cortada', `${que} queda cortado por el HUD, que empieza en ${Math.round(hud.top)}`);
    if (getComputedStyle(c).clipPath !== 'none') falla('mano-cortada', `${que} va recortado (${getComputedStyle(c).clipPath})`);
  }
  if (escritorio) {
    const vivas = posadas
      .filter((c) => !c.classList.contains('elegida'))
      .map((c) => c.getBoundingClientRect())
      .sort((a, b) => a.left - b.left);
    for (let i = 0; i + 1 < vivas.length; i++) {
      const franja = vivas[i + 1].left - vivas[i].left;
      if (Math.abs(vivas[i + 1].top - vivas[i].top) < 20 && franja < vivas[i].width * 0.45) falla('mano-montada', `un naipe vivo de la mano enseña ${Math.round(franja)} px de ${Math.round(vivas[i].width)} (${donde(vivas[i])})`);
    }
  }
  return out;
}

/**
 * (0.28) «placa-pisa»: las placas «−N» del HUD (lo que te sacan de Vida, de Escudo o de oro) no nacen sobre ninguna
 * cifra del HUD (la Vida, el Escudo, el oro) ni una sobre otra. Se mide en cada cuadro de las secuencias.
 */
export function placasHud(): { regla: string; detalle: string }[] {
  const out: { regla: string; detalle: string }[] = [];
  const placas = [...document.querySelectorAll<HTMLElement>('.hud-delta')].filter((el) => Number(getComputedStyle(el).opacity) > 0.3).map((el) => ({ el, r: el.getBoundingClientRect() }));
  if (!placas.length) return out;
  const cruzan = (a: DOMRect, b: DOMRect): boolean => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
  const donde = (r: DOMRect): string => `${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}`;
  const cifras = [...document.querySelectorAll<HTMLElement>('.hud [data-hud-vida] .valor .cifra, .hud [data-hud-escudo] .valor .cifra, .hud [data-hud-oro] .valor .cifra, .hud [data-hud-vida] .valor [data-n], .hud [data-hud-escudo] .valor [data-n], .hud [data-hud-oro] .valor [data-n]')].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 2 && r.height > 2);
  for (const p of placas) {
    const c = cifras.find((r) => cruzan(r, p.r));
    if (c) out.push({ regla: 'placa-pisa', detalle: `la placa «${p.el.getAttribute('aria-label')}» (${donde(p.r)}) tapa una cifra del HUD (${donde(c)})` });
  }
  for (let i = 0; i < placas.length; i++) for (let j = i + 1; j < placas.length; j++) if (cruzan(placas[i].r, placas[j].r)) out.push({ regla: 'placa-pisa', detalle: `la placa «${placas[i].el.getAttribute('aria-label')}» (${donde(placas[i].r)}) se monta sobre «${placas[j].el.getAttribute('aria-label')}» (${donde(placas[j].r)})` });
  return out.slice(0, 1);
}
