// lib/social_proof.js
// ============================================================
// SOCIAL PROOF — Elementos de confianza para landing pages
//
// Genera HTML para:
// 1. Reviews/testimonios verificables
// 2. Badges de confianza (COD, envío, garantía)
// 3. FAQ dinámico basado en producto
// 4. Stock real de Dropi
// 5. Contador de compradores recientes (solo si es real)
//
// Usa las mismas clases CSS de lp7-* para mantener consistencia.
// Archivo nuevo — NO modifica ningún archivo existente
// ============================================================

// ─── BADGES DE CONFIANZA ────────────────────────────────────
// Siempre verdaderos — representan las políticas reales de la tienda
export function buildTrustBadges(opts = {}) {
  const {
    hasCOD = true,
    returnDays = 30,
    freeShipping = false,
    shippingDays = "3-5",
    country = "Costa Rica",
  } = opts;

  const badges = [];

  if (hasCOD) {
    badges.push({
      icon: `<svg width="24" height="24" fill="none" stroke="#15803d" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
      title: "Pago contra entrega",
      desc: "Pagas cuando recibes",
    });
  }

  badges.push({
    icon: `<svg width="24" height="24" fill="none" stroke="#15803d" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`,
    title: `Garantía ${returnDays} días`,
    desc: "Devolución sin preguntas",
  });

  badges.push({
    icon: `<svg width="24" height="24" fill="none" stroke="#15803d" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8zM5 21a2 2 0 100-4 2 2 0 000 4zM19 21a2 2 0 100-4 2 2 0 000 4z"/></svg>`,
    title: freeShipping ? "Envío gratis" : `Envío ${shippingDays} días`,
    desc: `Cobertura en ${country}`,
  });

  badges.push({
    icon: `<svg width="24" height="24" fill="none" stroke="#15803d" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    title: "Compra segura",
    desc: "Datos protegidos",
  });

  const badgesHtml = badges
    .map(
      (b) => `<div style="display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #f4f4f5">
      <div style="flex-shrink:0;width:44px;height:44px;background:#f0fdf4;border-radius:10px;display:flex;align-items:center;justify-content:center">${b.icon}</div>
      <div><div style="font-weight:700;font-size:14px;color:#18181b">${b.title}</div><div style="font-size:12px;color:#71717a">${b.desc}</div></div>
    </div>`
    )
    .join("");

  return `<div class="lp7-sec lp7-fade"><div class="lp7-w">
    <div style="text-align:center"><span class="lp7-label">Compra con confianza</span></div>
    <h2 class="lp7-h2">¿Por qué comprar aquí?</h2>
    <p class="lp7-sub">Tu compra está protegida de principio a fin</p>
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:4px 20px;border:1px solid #e4e4e7">
      ${badgesHtml}
    </div>
  </div></div>`;
}

// ─── FAQ DINÁMICO ───────────────────────────────────────────
// Genera preguntas frecuentes basadas en datos del producto
export function buildFAQ(opts = {}) {
  const {
    productName = "este producto",
    hasCOD = true,
    shippingDays = "3-5",
    returnDays = 30,
    country = "Costa Rica",
    customQuestions = [], // [{ q: "pregunta", a: "respuesta" }]
  } = opts;

  const faqs = [];

  if (hasCOD) {
    faqs.push({
      q: "¿Cómo funciona el pago contra entrega?",
      a: `Hacés tu pedido y cuando el repartidor llega a tu casa, ahí pagás. No necesitás tarjeta de crédito ni hacer transferencias por adelantado.`,
    });
  }

  faqs.push({
    q: `¿Cuánto tarda el envío?`,
    a: `El envío en ${country} toma aproximadamente ${shippingDays} días hábiles. Te enviamos el número de seguimiento por WhatsApp.`,
  });

  faqs.push({
    q: `¿Puedo devolver el producto?`,
    a: `Sí. Tenés ${returnDays} días para devolver ${productName} si no es lo que esperabas. Sin preguntas.`,
  });

  faqs.push({
    q: `¿Es el producto tal como se ve en las fotos?`,
    a: `Las fotos son del producto real. Pueden haber variaciones menores de color según la pantalla de tu dispositivo.`,
  });

  // Add custom questions
  for (const cq of customQuestions) {
    faqs.push({ q: cq.q, a: cq.a });
  }

  const faqItems = faqs
    .map(
      (f, i) => `<details style="border-bottom:1px solid #e4e4e7;padding:16px 0" ${i === 0 ? "open" : ""}>
      <summary style="cursor:pointer;font-weight:700;font-size:15px;color:#18181b;list-style:none;display:flex;justify-content:space-between;align-items:center">
        ${f.q}
        <svg width="18" height="18" fill="none" stroke="#71717a" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </summary>
      <p style="margin:10px 0 0;font-size:14px;color:#52525b;line-height:1.7">${f.a}</p>
    </details>`
    )
    .join("");

  return `<div class="lp7-sec-alt lp7-fade"><div class="lp7-w">
    <div style="text-align:center"><span class="lp7-label">Preguntas frecuentes</span></div>
    <h2 class="lp7-h2">¿Tenés dudas?</h2>
    <p class="lp7-sub">Las respuestas a lo que más preguntan nuestros clientes</p>
    <div style="max-width:560px;margin:0 auto">
      ${faqItems}
    </div>
  </div></div>`;
}

// ─── STOCK REAL ─────────────────────────────────────────────
// Muestra disponibilidad honesta basada en stock real de Dropi
export function buildStockIndicator(stock) {
  if (stock === null || stock === undefined) return "";

  let color, bg, text;

  if (stock <= 0) {
    color = "#dc2626";
    bg = "#fef2f2";
    text = "Agotado temporalmente";
  } else if (stock <= 20) {
    color = "#d97706";
    bg = "#fffbeb";
    text = `Últimas ${stock} unidades en stock`;
  } else if (stock <= 50) {
    color = "#15803d";
    bg = "#f0fdf4";
    text = `${stock} unidades disponibles`;
  } else {
    color = "#15803d";
    bg = "#f0fdf4";
    text = "Disponible · Envío inmediato";
  }

  return `<div style="display:inline-flex;align-items:center;gap:8px;background:${bg};color:${color};font-size:13px;font-weight:600;padding:8px 16px;border-radius:8px;margin:8px 0">
    <span style="width:8px;height:8px;background:${color};border-radius:50%;${stock > 0 && stock <= 50 ? "animation:sp-pulse 2s infinite" : ""}"></span>
    ${text}
  </div>
  ${stock > 0 && stock <= 50 ? `<style>@keyframes sp-pulse{0%,100%{opacity:1}50%{opacity:.4}}</style>` : ""}`;
}

// ─── COMPRADORES RECIENTES ──────────────────────────────────
// SOLO muestra si hay datos reales de ventas
export function buildRecentBuyers(salesCount) {
  if (!salesCount || salesCount <= 0) return "";

  return `<div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#71717a;margin:4px 0">
    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
    ${salesCount} ${salesCount === 1 ? "persona compró" : "personas compraron"} este producto
  </div>`;
}

// ─── WRAPPER: INSERTAR TODO EN HTML ─────────────────────────
// Generates all social proof blocks and returns them for injection
export function buildAllSocialProof(opts = {}) {
  const {
    productName,
    hasCOD = true,
    shippingDays = "3-5",
    returnDays = 30,
    country = "Costa Rica",
    stock = null,
    salesCount = 0,
    customFAQ = [],
  } = opts;

  return {
    trustBadges: buildTrustBadges({ hasCOD, returnDays, country, shippingDays }),
    faq: buildFAQ({ productName, hasCOD, shippingDays, returnDays, country, customQuestions: customFAQ }),
    stockIndicator: buildStockIndicator(stock),
    recentBuyers: buildRecentBuyers(salesCount),
  };
}
