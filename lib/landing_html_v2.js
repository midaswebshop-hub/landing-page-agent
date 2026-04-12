// lib/landing_html_v2.js
// ============================================================
// BUILDER HTML v2 — Landing pages de ALTA CONVERSIÓN
// Mejoras: mobile-first mejorado, mejor diseño visual,
// CTAs más potentes, testimonios tipo tarjeta, badges SVG
// NO TOCAR shopify.js — esta es la versión mejorada
// ============================================================

export function buildLandingHTML_v2(landingData) {
  const {
    headline, subheadline, bulletPoints, description, features, faq,
    urgencyText, compareTable, testimonials, problemSolution,
    guaranteeText, trustBadges, price, comparePrice, socialProofCount,
    countryCode, countryData, formattedPrice, formattedCompare, savingsText,
    whatsappNumber, facebookPixelId, tiktokPixelId, upsellProducts,
  } = landingData;

  const displayPrice = formattedPrice || (price ? `$${price}` : null);
  const displayCompare = formattedCompare || (comparePrice ? `$${comparePrice}` : null);
  const displaySavings = savingsText || null;
  const isCOD = countryData?.contraentrega === true;
  const ctaMain = isCOD ? "&#161;PIDE AHORA Y PAGA AL RECIBIR!" : "&#161;LO QUIERO AHORA &mdash; 50% OFF!";
  const ctaSecond = isCOD ? "&#128230; PEDIR AHORA &mdash; PAGAS AL RECIBIR" : "&#128722; COMPRAR AHORA &mdash; 50% OFF";
  const ctaFinal = isCOD ? "&#161;S&Iacute;, LO QUIERO &mdash; PAGO AL RECIBIR!" : "&#161;S&Iacute;, LO NECESITO!";
  const ctaSub = isCOD ? "Sin tarjeta &bull; Pagas cuando te llegue &bull; Sin riesgo" : "Compra 100% segura &bull; Garant&iacute;a 30 d&iacute;as";
  const flag = countryData?.flag || "";
  const proofCount = socialProofCount || "2,847";

  // ─── CSS Variables ───
  const css = `
<style>
*{box-sizing:border-box}
.lp{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;line-height:1.7;margin:0;padding:0;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.lp-wrap{max-width:680px;margin:0 auto;padding:0 20px}
.lp h2{font-size:clamp(22px,5vw,28px);font-weight:800;text-align:center;margin:0 0 24px;line-height:1.3}
.lp-banner{background:linear-gradient(135deg,#e65100,#ff8f00);color:#fff;text-align:center;padding:14px 16px;font-size:14px;font-weight:700;letter-spacing:.3px}
.lp-badge{display:inline-block;background:#ff8f00;color:#fff;font-size:11px;font-weight:800;padding:5px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:1.5px}
.lp-price-box{text-align:center;margin:20px 0}
.lp-price-old{font-size:18px;color:#999;text-decoration:line-through;margin-right:10px}
.lp-price-now{font-size:clamp(32px,7vw,42px);font-weight:900;color:#059669}
.lp-savings{display:inline-block;background:#fef3c7;color:#d97706;font-size:13px;font-weight:700;padding:4px 12px;border-radius:6px;margin-top:8px}
.lp-cod{display:inline-block;background:#d1fae5;color:#059669;font-size:14px;font-weight:700;padding:10px 18px;border-radius:10px;margin-top:12px}
.lp-btn{display:block;width:100%;max-width:460px;margin:0 auto;padding:18px 28px;background:linear-gradient(135deg,#059669,#047857);color:#fff;font-size:clamp(16px,4vw,20px);font-weight:800;text-align:center;text-decoration:none;border:none;border-radius:14px;cursor:pointer;box-shadow:0 6px 20px rgba(5,150,105,.35);letter-spacing:.3px;transition:transform .2s,box-shadow .2s;position:relative;overflow:hidden}
.lp-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(5,150,105,.45)}
.lp-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);transition:left .6s}
.lp-btn:hover::after{left:100%}
.lp-btn-sub{text-align:center;font-size:12px;color:#999;margin-top:10px}
.lp-section{padding:40px 0}
.lp-section-alt{padding:40px 0;background:#f8fafb}
.lp-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.lp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:500px){.lp-grid2{grid-template-columns:1fr}}
.lp-benefit{background:#f8fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px;text-align:center;font-size:15px;line-height:1.5}
.lp-timer{background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:24px 16px;text-align:center}
.lp-timer-boxes{display:flex;justify-content:center;gap:14px}
.lp-timer-box{background:rgba(255,255,255,.1);border-radius:10px;padding:14px 18px;min-width:65px}
.lp-timer-num{display:block;font-size:clamp(26px,6vw,34px);font-weight:900;color:#fff;line-height:1}
.lp-timer-label{display:block;font-size:10px;color:#94a3b8;text-transform:uppercase;margin-top:5px;letter-spacing:1.5px}
.lp-pas{border-left:4px solid;border-radius:0 10px 10px 0;padding:18px 20px;margin-bottom:16px;font-size:15px;line-height:1.7}
.lp-review{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.lp-review-stars{color:#f59e0b;font-size:16px;margin-bottom:8px;letter-spacing:2px}
.lp-review-text{font-size:15px;color:#374151;font-style:italic;line-height:1.6;margin-bottom:12px}
.lp-review-author{display:flex;align-items:center;gap:10px}
.lp-review-avatar{width:40px;height:40px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0}
.lp-review-verified{margin-left:auto;font-size:11px;color:#059669;font-weight:600;background:#d1fae5;padding:3px 10px;border-radius:6px}
.lp-table{width:100%;border-collapse:collapse;font-size:14px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
.lp-table th{padding:14px 16px;font-weight:700}
.lp-table td{padding:12px 16px;border-top:1px solid #e5e7eb}
.lp-table tr:hover{background:#f8fafb}
.lp-guarantee{background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:2px solid #059669;border-radius:16px;padding:32px 24px;text-align:center}
.lp-trust{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:400px){.lp-trust{grid-template-columns:1fr}}
.lp-trust-item{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center;font-size:14px;font-weight:700}
.lp-faq summary{padding:16px 20px;font-weight:700;font-size:15px;cursor:pointer;background:#fff;list-style:none;display:flex;justify-content:space-between;align-items:center}
.lp-faq summary::after{content:'+';font-size:22px;color:#cbd5e1;transition:transform .2s}
.lp-faq[open] summary::after{transform:rotate(45deg);color:#059669}
.lp-faq-answer{padding:0 20px 16px;font-size:14px;color:#6b7280;line-height:1.7}
.lp-cta-final{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:48px 0;text-align:center}
.lp-sticky{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#fff;padding:10px 16px;box-shadow:0 -4px 20px rgba(0,0,0,.12);display:none}
.lp-sticky a{display:block;width:100%;padding:14px;background:linear-gradient(135deg,#059669,#047857);color:#fff;font-size:16px;font-weight:800;text-align:center;text-decoration:none;border-radius:10px}
.lp-wa{position:fixed;bottom:80px;right:16px;z-index:10000;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(37,211,102,.45);text-decoration:none;transition:transform .2s}
.lp-wa:hover{transform:scale(1.1)}
.lp-exit{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.7);align-items:center;justify-content:center}
.lp-exit-card{background:#fff;border-radius:16px;max-width:400px;width:90%;margin:auto;padding:32px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)}
@keyframes lp-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.lp-btn-pulse{animation:lp-pulse 2s infinite}
</style>`;

  let html = css;

  // ─── PIXELS ───
  if (facebookPixelId) {
    html += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${facebookPixelId}');fbq('track','PageView');</script>`;
  }
  if (tiktokPixelId) {
    html += `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');</script>`;
  }

  html += `<div class="lp">`;

  // 1. BANNER
  const shippingText = countryData?.shipping || "Env&iacute;o GRATIS";
  html += `<div class="lp-banner">&#128293; OFERTA POR TIEMPO LIMITADO &mdash; 50% OFF &mdash; ${shippingText} &#128293;</div>`;

  // 2. TITULO + PRECIO
  html += `<div class="lp-section" style="text-align:center;padding-bottom:20px">`;
  html += `<div class="lp-wrap">`;
  html += `<div class="lp-badge">&#11088; M&Aacute;S VENDIDO EN ${(countryData?.name || "LATAM").toUpperCase()}</div>`;
  if (headline) html += `<h1 style="font-size:clamp(26px,6vw,36px);font-weight:900;color:#1a1a2e;margin:20px 0 10px;line-height:1.2">${headline}</h1>`;
  if (subheadline) html += `<p style="font-size:clamp(16px,3.5vw,19px);color:#6b7280;margin:0 0 8px;line-height:1.5">${subheadline}</p>`;

  // Estrellas + prueba social
  html += `<div style="margin:16px 0">`;
  html += `<span style="font-size:22px;letter-spacing:2px">&#11088;&#11088;&#11088;&#11088;&#11088;</span>`;
  html += `<span style="font-size:14px;color:#6b7280;margin-left:8px">+${proofCount} clientes ${flag}</span>`;
  html += `</div>`;

  // Precios
  if (displayPrice || displayCompare) {
    html += `<div class="lp-price-box">`;
    if (displayCompare) html += `<span class="lp-price-old">${displayCompare}</span>`;
    if (displayPrice) html += `<span class="lp-price-now">${displayPrice}</span>`;
    if (displaySavings) html += `<br><span class="lp-savings">Ahorras ${displaySavings}</span>`;
    if (isCOD) html += `<br><span class="lp-cod">&#128230; Pago contraentrega disponible &mdash; pagas al recibir</span>`;
    html += `</div>`;
  }
  html += `</div></div>`;

  // 3. CONTADOR
  html += `<div class="lp-wrap" style="margin-bottom:28px">`;
  html += `<div class="lp-timer">`;
  html += `<p style="color:#94a3b8;font-size:13px;margin:0 0 14px;text-transform:uppercase;letter-spacing:1.5px">&#9200; Esta oferta termina en:</p>`;
  html += `<div class="lp-timer-boxes">`;
  html += `<div class="lp-timer-box"><span id="lp-hours" class="lp-timer-num">02</span><span class="lp-timer-label">Horas</span></div>`;
  html += `<div class="lp-timer-box"><span id="lp-mins" class="lp-timer-num">45</span><span class="lp-timer-label">Min</span></div>`;
  html += `<div class="lp-timer-box"><span id="lp-secs" class="lp-timer-num">33</span><span class="lp-timer-label">Seg</span></div>`;
  html += `</div></div></div>`;

  // 4. CTA 1
  html += `<div class="lp-wrap" style="margin-bottom:36px">`;
  html += `<a href="#shopify-product-form" class="lp-btn lp-btn-pulse">${ctaMain}</a>`;
  html += `<p class="lp-btn-sub">&#128274; ${ctaSub}</p>`;
  html += `</div>`;

  // 5. PAS — Problema → Solución
  if (problemSolution || description) {
    html += `<div class="lp-section-alt"><div class="lp-wrap">`;
    if (problemSolution?.problem) {
      html += `<h2>&#129300; &iquest;Te pasa esto?</h2>`;
      html += `<div class="lp-pas" style="border-color:#ef4444;background:#fef2f2">${problemSolution.problem}</div>`;
    }
    if (problemSolution?.agitation) {
      html += `<div class="lp-pas" style="border-color:#f59e0b;background:#fffbeb">${problemSolution.agitation}</div>`;
    }
    if (problemSolution?.solution) {
      html += `<h2 style="color:#059669">&#10024; La soluci&oacute;n</h2>`;
      html += `<div class="lp-pas" style="border-color:#059669;background:#f0fdf4">${problemSolution.solution}</div>`;
    } else if (description) {
      html += `<div style="font-size:16px;color:#374151;line-height:1.8">${description}</div>`;
    }
    html += `</div></div>`;
  }

  // 6. BENEFICIOS
  if (bulletPoints?.length > 0) {
    html += `<div class="lp-section"><div class="lp-wrap">`;
    html += `<h2>&iquest;Por qu&eacute; elegir este producto?</h2>`;
    html += `<div class="lp-grid2">`;
    for (const bp of bulletPoints) {
      html += `<div class="lp-benefit">${bp}</div>`;
    }
    html += `</div></div></div>`;
  }

  // 7. PRUEBA SOCIAL
  html += `<div class="lp-section-alt"><div class="lp-wrap">`;
  html += `<div style="text-align:center;margin-bottom:28px">`;
  html += `<div style="font-size:30px;letter-spacing:3px;margin-bottom:8px">&#11088;&#11088;&#11088;&#11088;&#11088;</div>`;
  html += `<p style="font-size:clamp(20px,4.5vw,26px);font-weight:800;color:#1a1a2e;margin:0">+${proofCount} clientes satisfechos ${flag}</p>`;
  html += `<p style="font-size:14px;color:#6b7280;margin:4px 0 0">Calificaci&oacute;n promedio: 4.9/5</p>`;
  html += `</div>`;

  const reviews = testimonials?.length > 0 ? testimonials : [
    { name: "Cliente verificado", text: "Excelente producto, super recomendado.", rating: 5 },
  ];
  for (const t of reviews) {
    const initial = (t.name || "C")[0].toUpperCase();
    const stars = "&#11088;".repeat(t.rating || 5);
    html += `<div class="lp-review">`;
    html += `<div class="lp-review-stars">${stars}</div>`;
    html += `<div class="lp-review-text">&ldquo;${t.text}&rdquo;</div>`;
    html += `<div class="lp-review-author">`;
    html += `<div class="lp-review-avatar">${initial}</div>`;
    html += `<div><div style="font-weight:700;font-size:14px">${flag} ${t.name}</div>`;
    if (t.city) html += `<div style="font-size:12px;color:#9ca3af">${t.city}</div>`;
    html += `</div>`;
    html += `<span class="lp-review-verified">&#9989; Verificada</span>`;
    html += `</div></div>`;
  }
  html += `</div></div>`;

  // 8. TABLA COMPARATIVA
  if (compareTable?.length > 0) {
    html += `<div class="lp-section"><div class="lp-wrap">`;
    html += `<h2>&#129354; Nosotros vs La competencia</h2>`;
    html += `<div style="overflow-x:auto;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.06)">`;
    html += `<table class="lp-table">`;
    html += `<thead><tr><th style="text-align:left;background:#1a1a2e;color:#fff">Caracter&iacute;stica</th><th style="text-align:center;background:#059669;color:#fff">&#10024; Nosotros</th><th style="text-align:center;background:#e5e7eb;color:#6b7280">Otros</th></tr></thead><tbody>`;
    for (const row of compareTable) {
      html += `<tr><td style="font-weight:600">${row.feature}</td><td style="text-align:center;color:#059669;font-weight:700">&#9989; ${row.ours}</td><td style="text-align:center;color:#9ca3af">&#10060; ${row.theirs}</td></tr>`;
    }
    html += `</tbody></table></div></div></div>`;
  }

  // 9. CTA 2
  html += `<div class="lp-wrap" style="margin:8px 0 36px"><a href="#shopify-product-form" class="lp-btn">${ctaSecond}</a><p class="lp-btn-sub">&#9889; Quedan pocas unidades</p></div>`;

  // 10. CARACTERÍSTICAS
  if (features?.length > 0) {
    html += `<div class="lp-section-alt"><div class="lp-wrap">`;
    html += `<h2>&#128295; Especificaciones</h2>`;
    html += `<div class="lp-grid2">`;
    for (const f of features) {
      html += `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;display:flex;align-items:flex-start;gap:10px"><span style="color:#059669;font-size:18px;flex-shrink:0">&#9989;</span><span style="font-size:14px;color:#374151;line-height:1.5">${f}</span></div>`;
    }
    html += `</div></div></div>`;
  }

  // 11. GARANTÍA
  const guarantee = guaranteeText || "Si no est&aacute;s satisfecho, te devolvemos el 100% de tu dinero. Sin preguntas.";
  html += `<div class="lp-section"><div class="lp-wrap">`;
  html += `<div class="lp-guarantee">`;
  html += `<div style="font-size:48px;margin-bottom:12px">&#128737;&#65039;</div>`;
  html += `<h3 style="font-size:22px;font-weight:800;margin:0 0 12px">&#9989; Garant&iacute;a 30 D&iacute;as</h3>`;
  html += `<p style="font-size:16px;color:#374151;margin:0;line-height:1.6;max-width:480px;display:inline-block">${guarantee}</p>`;
  html += `</div></div></div>`;

  // 12. SELLOS DE CONFIANZA
  const badges = trustBadges || ["Pago 100% Seguro", "Env&iacute;o Protegido", "Soporte 24/7", "Compra Verificada"];
  html += `<div class="lp-section-alt"><div class="lp-wrap">`;
  html += `<div class="lp-trust">`;
  for (const b of badges) {
    html += `<div class="lp-trust-item">${b}</div>`;
  }
  html += `</div>`;
  // Métodos de pago
  if (countryData?.paymentMethods) {
    html += `<p style="text-align:center;font-size:14px;color:#6b7280;margin:16px 0 0">&#128179; ${countryData.paymentMethods}</p>`;
  }
  html += `</div></div>`;

  // 13. FAQ
  if (faq?.length > 0) {
    html += `<div class="lp-section"><div class="lp-wrap">`;
    html += `<h2>&#10068; Preguntas Frecuentes</h2>`;
    for (const item of faq) {
      html += `<details class="lp-faq" style="margin-bottom:10px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">`;
      html += `<summary>${item.q}</summary>`;
      html += `<div class="lp-faq-answer">${item.a}</div>`;
      html += `</details>`;
    }
    html += `</div></div>`;
  }

  // 14. CTA FINAL
  html += `<div class="lp-cta-final"><div class="lp-wrap">`;
  html += `<h2 style="color:#fff;margin-bottom:8px">&#128640; No dejes pasar esta oportunidad</h2>`;
  html += `<p style="font-size:16px;color:#94a3b8;margin:0 0 24px">La oferta del 50% puede terminar en cualquier momento</p>`;
  if (displayCompare && displayPrice) {
    html += `<div style="margin-bottom:20px"><span class="lp-price-old">${displayCompare}</span><span class="lp-price-now">${displayPrice}</span></div>`;
  }
  html += `<a href="#shopify-product-form" class="lp-btn" style="max-width:400px">${ctaFinal}</a>`;
  html += `<p class="lp-btn-sub" style="color:#64748b">${ctaSub}</p>`;
  html += `</div></div>`;

  // 15. WHATSAPP
  if (whatsappNumber) {
    const waMsg = encodeURIComponent(`Hola, me interesa el producto: ${headline || ""}`);
    html += `<a id="lp-wa" class="lp-wa" href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${waMsg}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>`;
  }

  // 16. STICKY BUTTON
  html += `<div id="lp-sticky" class="lp-sticky"><a href="#shopify-product-form">&#128722; AGREGAR AL CARRITO &mdash; 50% OFF</a></div>`;

  // 17. EXIT POPUP
  html += `<div id="lp-exit" class="lp-exit"><div class="lp-exit-card">`;
  html += `<div style="font-size:36px;margin-bottom:12px">&#128561;</div>`;
  html += `<h3 style="font-size:20px;font-weight:900;margin:0 0 8px">&iexcl;Espera! 10% EXTRA de descuento</h3>`;
  html += `<p style="font-size:14px;color:#6b7280;margin:0 0 20px">Solo si compras en los pr&oacute;ximos 15 minutos</p>`;
  html += `<a href="#shopify-product-form" onclick="document.getElementById('lp-exit').style.display='none'" class="lp-btn" style="font-size:16px;padding:14px 20px">QUIERO MI DESCUENTO</a>`;
  html += `<p style="margin:14px 0 0"><a href="#" onclick="document.getElementById('lp-exit').style.display='none';return false" style="font-size:12px;color:#999;text-decoration:underline">No gracias</a></p>`;
  html += `</div></div>`;

  // JAVASCRIPT
  html += `<script>(function(){`;
  // Timer
  html += `var k="lp_end",s=localStorage.getItem(k),e;if(s&&parseInt(s)>Date.now())e=parseInt(s);else{e=Date.now()+9933000;localStorage.setItem(k,String(e))}function p(n){return n<10?"0"+n:String(n)}function t(){var d=Math.max(0,e-Date.now()),h=Math.floor(d/36e5);d%=36e5;var m=Math.floor(d/6e4);d%=6e4;var s=Math.floor(d/1e3);var eh=document.getElementById("lp-hours"),em=document.getElementById("lp-mins"),es=document.getElementById("lp-secs");if(eh)eh.textContent=p(h);if(em)em.textContent=p(m);if(es)es.textContent=p(s);if(d<=0)localStorage.removeItem(k)}t();setInterval(t,1e3);`;
  // Sticky
  html += `var st=document.getElementById("lp-sticky");if(st){window.addEventListener("scroll",function(){var sh=window.scrollY>500;st.style.display=sh?"block":"none";var wa=document.getElementById("lp-wa");if(wa)wa.style.bottom=sh?"80px":"20px"});var sp=document.createElement("div");sp.style.height="70px";st.parentNode.insertBefore(sp,st)}`;
  // Exit intent
  html += `var ex=document.getElementById("lp-exit"),exs=localStorage.getItem("lp_ex");if(ex&&!exs){document.addEventListener("mouseout",function(e){if(!e.toElement&&!e.relatedTarget&&e.clientY<10){ex.style.display="flex";localStorage.setItem("lp_ex","1")}});if(/Mobi|Android/i.test(navigator.userAgent))setTimeout(function(){if(!localStorage.getItem("lp_ex")){ex.style.display="flex";localStorage.setItem("lp_ex","1")}},30000);ex.addEventListener("click",function(e){if(e.target===ex)ex.style.display="none"})}`;
  html += `})();</script>`;

  html += `</div>`;
  return html;
}
