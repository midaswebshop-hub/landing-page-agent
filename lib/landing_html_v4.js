// lib/landing_html_v4.js
// ============================================================
// BUILDER HTML v4 — Estructura psicológica de ALTA CONVERSIÓN
// Orden de bloques basado en dirección emocional del cliente:
//   1. Beneficios + Transformación (Aspiración 80%)
//   2. Problema → Solución (Identificación con dolor 90%)
//   3. Hero Principal (Curiosidad intensa 75%)
//   4. Materiales / Ingredientes (Confianza racional 50%)
//   5. Proceso de Uso (Claridad y control 45%)
//   6. Oferta + Precios (Urgencia excitante 95%)
//   7. Prueba Social (Confianza social 85%)
//   8. CTA Final (Decisión clara 100%)
// NO TOCAR v3 — esta es versión nueva
// ============================================================

export function buildLandingHTML_v4(landingData) {
  const {
    headline, subheadline, bulletPoints, description, features, faq,
    urgencyText, compareTable, testimonials, problemSolution,
    guaranteeText, trustBadges, price, comparePrice, socialProofCount,
    countryCode, countryData, formattedPrice, formattedCompare, savingsText,
    whatsappNumber, facebookPixelId, tiktokPixelId, upsellProducts,
    images, videoUrl, beforeAfter, productName, processSteps,
  } = landingData;

  const displayPrice = formattedPrice || (price ? `$${price}` : null);
  const displayCompare = formattedCompare || (comparePrice ? `$${comparePrice}` : null);
  const displaySavings = savingsText || null;
  const isCOD = countryData?.contraentrega === true;
  const ctaMain = isCOD ? "&#161;PIDE AHORA Y PAGA AL RECIBIR!" : "&#161;LO QUIERO AHORA &mdash; 50% OFF!";
  const ctaFinal = isCOD ? "&#161;S&Iacute;, LO QUIERO &mdash; PAGO AL RECIBIR!" : "&#161;S&Iacute;, LO NECESITO &mdash; COMPRAR AHORA!";
  const ctaSub = isCOD ? "Sin tarjeta &bull; Pagas cuando te llegue &bull; Sin riesgo" : "Compra 100% segura &bull; Garant&iacute;a 30 d&iacute;as";
  const flag = countryData?.flag || "";
  const proofCount = socialProofCount || "2,847";
  const stockLeft = Math.floor(Math.random() * 8) + 3;

  // ─── CSS ───
  const css = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
.lp{font-family:'Inter',system-ui,-apple-system,sans-serif;color:#111827;line-height:1.7;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.lp-wrap{max-width:720px;margin:0 auto;padding:0 20px}
.lp h2{font-size:clamp(22px,5vw,30px);font-weight:800;text-align:center;margin:0 0 28px;line-height:1.25;color:#111827}
.lp h2 span{color:#059669}

/* Banner */
.lp-banner{background:linear-gradient(135deg,#111827 0%,#1f2937 100%);color:#fff;text-align:center;padding:12px 16px;font-size:13px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.lp-banner-dot{display:inline-block;width:8px;height:8px;background:#ef4444;border-radius:50%;margin-right:8px;animation:lp-blink 1s infinite}
@keyframes lp-blink{0%,100%{opacity:1}50%{opacity:.3}}

/* Secciones */
.lp-section{padding:48px 0}
.lp-section-alt{padding:48px 0;background:#f9fafb}
.lp-divider{width:60px;height:4px;background:linear-gradient(90deg,#059669,#10b981);border-radius:2px;margin:0 auto 28px}

/* Beneficios / Transformación */
.lp-benefit{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:22px;font-size:15px;line-height:1.6;transition:transform .2s,box-shadow .2s}
.lp-benefit:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
.lp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:520px){.lp-grid2{grid-template-columns:1fr}}

/* Antes/Después (Transformación) */
.lp-ba{display:grid;grid-template-columns:1fr 1fr;gap:20px;text-align:center}
@media(max-width:520px){.lp-ba{grid-template-columns:1fr}}
.lp-ba-card{border-radius:16px;padding:28px 20px;font-size:15px;line-height:1.7}
.lp-ba-before{background:#fef2f2;border:1px solid #fecaca}
.lp-ba-after{background:#ecfdf5;border:1px solid #a7f3d0}
.lp-ba-icon{font-size:36px;margin-bottom:12px;display:block}
.lp-ba-title{font-weight:800;font-size:18px;margin-bottom:10px}

/* PAS — Problema Agitación Solución */
.lp-pas{border-left:4px solid;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:16px;font-size:15px;line-height:1.8}

/* Galería */
.lp-gallery{position:relative;margin-bottom:24px}
.lp-gallery-main{width:100%;aspect-ratio:1;object-fit:contain;border-radius:16px;background:#f9fafb;display:block}
.lp-gallery-thumbs{display:flex;gap:8px;margin-top:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.lp-gallery-thumbs::-webkit-scrollbar{display:none}
.lp-gallery-thumb{width:64px;height:64px;border-radius:10px;object-fit:cover;border:2px solid transparent;cursor:pointer;flex-shrink:0;opacity:.6;transition:all .2s}
.lp-gallery-thumb.active,.lp-gallery-thumb:hover{border-color:#059669;opacity:1}
.lp-gallery-nav{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:#374151;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:transform .2s}
.lp-gallery-nav:hover{transform:translateY(-50%) scale(1.1)}
.lp-gallery-prev{left:8px}
.lp-gallery-next{right:8px}

/* Materiales / Specs */
.lp-spec{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;display:flex;align-items:flex-start;gap:12px}
.lp-spec svg{flex-shrink:0;margin-top:2px}
.lp-spec span{font-size:14px;color:#374151;line-height:1.6}

/* Proceso de uso */
.lp-steps{counter-reset:step}
.lp-step{position:relative;padding:24px 24px 24px 72px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;margin-bottom:14px;font-size:15px;line-height:1.7;transition:transform .2s}
.lp-step:hover{transform:translateX(4px)}
.lp-step::before{counter-increment:step;content:counter(step);position:absolute;left:20px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center}
.lp-step-title{font-weight:700;color:#111827;margin-bottom:4px}
.lp-step-desc{color:#6b7280;font-size:14px}

/* Precios */
.lp-price-box{text-align:center;margin:24px 0}
.lp-price-old{font-size:22px;color:#9ca3af;text-decoration:line-through;margin-right:12px}
.lp-price-now{font-size:clamp(36px,8vw,52px);font-weight:900;color:#059669}
.lp-savings{display:inline-block;background:#ecfdf5;color:#059669;font-size:14px;font-weight:700;padding:6px 16px;border-radius:8px;margin-top:10px}
.lp-cod{display:inline-flex;align-items:center;gap:8px;background:#ecfdf5;color:#059669;font-size:14px;font-weight:700;padding:10px 18px;border-radius:12px;margin-top:12px}

/* Stock bar */
.lp-stock{max-width:320px;margin:16px auto 0}
.lp-stock-bar{height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden}
.lp-stock-fill{height:100%;background:linear-gradient(90deg,#ef4444,#f59e0b);border-radius:3px;transition:width 1s}
.lp-stock-text{font-size:13px;color:#ef4444;font-weight:700;text-align:center;margin-top:6px}

/* Timer */
.lp-timer{background:linear-gradient(135deg,#111827,#1f2937);border-radius:16px;padding:28px 20px;text-align:center;margin-bottom:24px}
.lp-timer-boxes{display:flex;justify-content:center;gap:16px}
.lp-timer-box{background:rgba(255,255,255,.08);border-radius:12px;padding:16px 20px;min-width:72px;backdrop-filter:blur(10px)}
.lp-timer-num{display:block;font-size:clamp(28px,6vw,36px);font-weight:900;color:#fff;line-height:1}
.lp-timer-label{display:block;font-size:10px;color:#6b7280;text-transform:uppercase;margin-top:6px;letter-spacing:2px}

/* Garantía */
.lp-guarantee{background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #059669;border-radius:20px;padding:36px 28px;text-align:center}

/* Trust badges */
.lp-trust{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:600px){.lp-trust{grid-template-columns:1fr 1fr}}
.lp-trust-item{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 12px;text-align:center;font-size:13px;font-weight:700;color:#374151}
.lp-trust-icon{display:block;margin-bottom:8px}

/* Reviews */
.lp-review{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.03);transition:transform .2s}
.lp-review:hover{transform:translateY(-1px)}
.lp-review-stars{color:#f59e0b;font-size:16px;margin-bottom:10px;letter-spacing:2px}
.lp-review-text{font-size:15px;color:#374151;font-style:italic;line-height:1.7;margin-bottom:14px}
.lp-review-author{display:flex;align-items:center;gap:12px}
.lp-review-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;flex-shrink:0}
.lp-review-verified{margin-left:auto;font-size:11px;color:#059669;font-weight:700;background:#ecfdf5;padding:4px 12px;border-radius:8px;white-space:nowrap}

/* Tabla comparativa */
.lp-table{width:100%;border-collapse:separate;border-spacing:0;font-size:14px;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb}
.lp-table th{padding:16px;font-weight:700}
.lp-table td{padding:14px 16px;border-top:1px solid #f3f4f6}
.lp-table tr:nth-child(even){background:#f9fafb}

/* FAQ */
.lp-faq{margin-bottom:10px;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;background:#fff}
.lp-faq summary{padding:18px 24px;font-weight:700;font-size:15px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}
.lp-faq summary::after{content:'+';font-size:20px;color:#9ca3af;font-weight:400;transition:transform .2s}
.lp-faq[open] summary::after{transform:rotate(45deg);color:#059669}
.lp-faq-answer{padding:0 24px 18px;font-size:14px;color:#6b7280;line-height:1.8}

/* Botones */
.lp-btn{display:block;width:100%;max-width:480px;margin:0 auto;padding:20px 28px;background:linear-gradient(135deg,#059669,#047857);color:#fff;font-size:clamp(16px,4vw,20px);font-weight:800;text-align:center;text-decoration:none;border:none;border-radius:14px;cursor:pointer;box-shadow:0 8px 24px rgba(5,150,105,.3);letter-spacing:.3px;transition:all .25s;position:relative;overflow:hidden}
.lp-btn:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(5,150,105,.4)}
.lp-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);transition:left .7s}
.lp-btn:hover::after{left:100%}
.lp-btn-sub{text-align:center;font-size:12px;color:#9ca3af;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:6px}

/* CTA Final */
.lp-cta-final{background:linear-gradient(135deg,#111827 0%,#1e293b 100%);padding:56px 0;text-align:center}

/* Video */
.lp-video{position:relative;width:100%;padding-bottom:56.25%;border-radius:16px;overflow:hidden;background:#000;margin-bottom:28px}
.lp-video iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}

/* Sticky */
.lp-sticky{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,255,255,.95);padding:12px 16px;box-shadow:0 -4px 24px rgba(0,0,0,.1);display:none;backdrop-filter:blur(10px)}
.lp-sticky a{display:block;width:100%;max-width:480px;margin:0 auto;padding:14px;background:linear-gradient(135deg,#059669,#047857);color:#fff;font-size:16px;font-weight:800;text-align:center;text-decoration:none;border-radius:12px}

/* WhatsApp */
.lp-wa{position:fixed;bottom:80px;right:16px;z-index:10000;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,.4);text-decoration:none;transition:transform .2s}
.lp-wa:hover{transform:scale(1.1)}

/* Exit popup */
.lp-exit{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.lp-exit-card{background:#fff;border-radius:20px;max-width:400px;width:90%;margin:auto;padding:36px 28px;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.25)}

/* Animaciones */
@keyframes lp-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
.lp-btn-pulse{animation:lp-pulse 2.5s infinite}
.lp-fade{opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s}
.lp-fade.visible{opacity:1;transform:translateY(0)}
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

  // ─── BANNER SUPERIOR ───
  const shippingText = countryData?.shipping || "Env&iacute;o GRATIS";
  html += `<div class="lp-banner"><span class="lp-banner-dot"></span>OFERTA ESPECIAL &mdash; 50% OFF + ${shippingText}</div>`;

  // ════════════════════════════════════════════════════════════
  // BLOQUE 1: BENEFICIOS + TRANSFORMACIÓN (Aspiración 80%)
  // Primera impresión = aspiracional. El cliente ve lo que GANA.
  // ════════════════════════════════════════════════════════════
  html += `<div class="lp-section lp-fade"><div class="lp-wrap">`;
  if (headline) html += `<h1 style="font-size:clamp(26px,6vw,38px);font-weight:900;color:#111827;margin:0 0 8px;line-height:1.2;text-align:center">${headline}</h1>`;
  if (subheadline) html += `<p style="font-size:clamp(15px,3.5vw,18px);color:#6b7280;margin:0 0 6px;line-height:1.5;text-align:center">${subheadline}</p>`;

  // Estrellas + prueba social mini
  html += `<div style="text-align:center;margin:14px 0 28px">`;
  html += `<span style="font-size:20px;letter-spacing:2px">&#11088;&#11088;&#11088;&#11088;&#11088;</span>`;
  html += `<span style="font-size:14px;color:#6b7280;margin-left:8px">${proofCount}+ clientes ${flag}</span>`;
  html += `</div>`;

  // Beneficios en grid
  if (bulletPoints?.length > 0) {
    html += `<h2>&iquest;Qu&eacute; vas a <span>lograr</span>?</h2>`;
    html += `<div class="lp-divider"></div>`;
    html += `<div class="lp-grid2">`;
    for (const bp of bulletPoints) {
      html += `<div class="lp-benefit">${bp}</div>`;
    }
    html += `</div>`;
  }

  // Antes / Después (transformación visual)
  if (beforeAfter) {
    html += `<div style="margin-top:32px">`;
    html += `<div class="lp-ba">`;
    html += `<div class="lp-ba-card lp-ba-before"><span class="lp-ba-icon">&#128542;</span><div class="lp-ba-title">ANTES</div>${beforeAfter.before || "Sin el producto"}</div>`;
    html += `<div class="lp-ba-card lp-ba-after"><span class="lp-ba-icon">&#128513;</span><div class="lp-ba-title">DESPU&Eacute;S</div>${beforeAfter.after || "Con el producto"}</div>`;
    html += `</div></div>`;
  }

  // CTA temprano (aspiracional)
  html += `<div style="margin-top:32px">`;
  html += `<a href="#shopify-product-form" class="lp-btn lp-btn-pulse">${ctaMain}</a>`;
  html += `<p class="lp-btn-sub"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ${ctaSub}</p>`;
  html += `</div>`;

  html += `</div></div>`;

  // ════════════════════════════════════════════════════════════
  // BLOQUE 2: PROBLEMA → SOLUCIÓN (Identificación con dolor 90%)
  // El cliente se identifica con el dolor y ve la salida.
  // ════════════════════════════════════════════════════════════
  if (problemSolution || description) {
    html += `<div class="lp-section-alt lp-fade"><div class="lp-wrap">`;
    if (problemSolution?.problem) {
      html += `<h2>&#129300; &iquest;Te pasa <span>esto</span>?</h2>`;
      html += `<div class="lp-divider"></div>`;
      html += `<div class="lp-pas" style="border-color:#ef4444;background:#fef2f2">${problemSolution.problem}</div>`;
    }
    if (problemSolution?.agitation) {
      html += `<div class="lp-pas" style="border-color:#f59e0b;background:#fffbeb">${problemSolution.agitation}</div>`;
    }
    if (problemSolution?.solution) {
      html += `<h2 style="margin-top:24px">&#10024; La <span>soluci&oacute;n</span></h2>`;
      html += `<div class="lp-pas" style="border-color:#059669;background:#ecfdf5">${problemSolution.solution}</div>`;
    } else if (description) {
      html += `<div style="font-size:16px;color:#374151;line-height:1.8">${description}</div>`;
    }
    html += `</div></div>`;
  }

  // ════════════════════════════════════════════════════════════
  // BLOQUE 3: HERO PRINCIPAL (Curiosidad intensa 75%)
  // Galería de imágenes + video. El cliente VE el producto.
  // ════════════════════════════════════════════════════════════
  const imgs = images?.length > 0 ? images : [];
  if (imgs.length > 0 || videoUrl) {
    html += `<div class="lp-section lp-fade"><div class="lp-wrap">`;
    html += `<h2>&#128248; Conoce tu <span>producto</span></h2>`;
    html += `<div class="lp-divider"></div>`;

    // Galería
    if (imgs.length > 0) {
      html += `<div class="lp-gallery">`;
      html += `<img id="lp-main-img" class="lp-gallery-main" src="${imgs[0]}" alt="${productName || 'Producto'}">`;
      if (imgs.length > 1) {
        html += `<div class="lp-gallery-nav lp-gallery-prev" onclick="lpGallery(-1)">&#8249;</div>`;
        html += `<div class="lp-gallery-nav lp-gallery-next" onclick="lpGallery(1)">&#8250;</div>`;
        html += `<div class="lp-gallery-thumbs">`;
        imgs.forEach((img, i) => {
          html += `<img class="lp-gallery-thumb${i === 0 ? ' active' : ''}" src="${img}" alt="Foto ${i + 1}" onclick="lpSetImg(${i})">`;
        });
        html += `</div>`;
      }
      html += `</div>`;
    }

    // Video
    if (videoUrl) {
      let embedUrl = videoUrl;
      const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      html += `<div class="lp-video"><iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe></div>`;
    }

    html += `</div></div>`;
  }

  // ════════════════════════════════════════════════════════════
  // BLOQUE 4: MATERIALES / INGREDIENTES (Confianza racional 50%)
  // Specs técnicas + tabla comparativa. El cerebro lógico decide.
  // ════════════════════════════════════════════════════════════
  if (features?.length > 0 || compareTable?.length > 0) {
    html += `<div class="lp-section-alt lp-fade"><div class="lp-wrap">`;
    html += `<h2>&#128295; Materiales y <span>especificaciones</span></h2>`;
    html += `<div class="lp-divider"></div>`;

    if (features?.length > 0) {
      html += `<div class="lp-grid2">`;
      for (const f of features) {
        html += `<div class="lp-spec"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>${f}</span></div>`;
      }
      html += `</div>`;
    }

    // Tabla comparativa
    if (compareTable?.length > 0) {
      html += `<div style="margin-top:28px">`;
      html += `<h3 style="font-size:18px;font-weight:800;text-align:center;margin-bottom:16px;color:#111827">&#129354; Nosotros vs Competencia</h3>`;
      html += `<div style="overflow-x:auto;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.06)">`;
      html += `<table class="lp-table">`;
      html += `<thead><tr><th style="text-align:left;background:#111827;color:#fff">Caracter&iacute;stica</th><th style="text-align:center;background:#059669;color:#fff">&#10024; Nosotros</th><th style="text-align:center;background:#f3f4f6;color:#6b7280">Otros</th></tr></thead><tbody>`;
      for (const row of compareTable) {
        html += `<tr><td style="font-weight:600">${row.feature}</td><td style="text-align:center;color:#059669;font-weight:700">&#9989; ${row.ours}</td><td style="text-align:center;color:#9ca3af">&#10060; ${row.theirs}</td></tr>`;
      }
      html += `</tbody></table></div></div>`;
    }

    html += `</div></div>`;
  }

  // ════════════════════════════════════════════════════════════
  // BLOQUE 5: PROCESO DE USO (Claridad y control 45%)
  // Pasos claros que eliminan incertidumbre.
  // ════════════════════════════════════════════════════════════
  const steps = processSteps || faq?.slice(0, 3)?.map((f, i) => ({
    title: [`Recibe tu pedido`, `&Uacute;salo a diario`, `Disfruta los resultados`][i] || `Paso ${i + 1}`,
    desc: [`Llega a tu puerta en 3-7 d&iacute;as`, `Sigue las instrucciones incluidas`, `Nota la diferencia desde la primera semana`][i] || f.a,
  }));

  if (steps?.length > 0) {
    html += `<div class="lp-section lp-fade"><div class="lp-wrap">`;
    html += `<h2>&#128221; As&iacute; de <span>f&aacute;cil</span> funciona</h2>`;
    html += `<div class="lp-divider"></div>`;
    html += `<div class="lp-steps">`;
    for (const step of steps) {
      html += `<div class="lp-step">`;
      html += `<div class="lp-step-title">${step.title}</div>`;
      html += `<div class="lp-step-desc">${step.desc}</div>`;
      html += `</div>`;
    }
    html += `</div></div></div>`;
  }

  // ════════════════════════════════════════════════════════════
  // BLOQUE 6: OFERTA + PRECIOS (Urgencia excitante 95%)
  // Precio, descuento, timer, stock. Máxima urgencia.
  // ════════════════════════════════════════════════════════════
  html += `<div class="lp-section-alt lp-fade"><div class="lp-wrap">`;
  html += `<h2>&#127873; Oferta <span>especial</span> por tiempo limitado</h2>`;
  html += `<div class="lp-divider"></div>`;

  // Precios
  if (displayPrice || displayCompare) {
    html += `<div class="lp-price-box">`;
    if (displayCompare) html += `<span class="lp-price-old">${displayCompare}</span>`;
    if (displayPrice) html += `<span class="lp-price-now">${displayPrice}</span>`;
    if (displaySavings) html += `<br><span class="lp-savings">&#127881; Ahorras ${displaySavings}</span>`;
    if (isCOD) html += `<br><span class="lp-cod"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg> Pago contraentrega disponible</span>`;
    html += `</div>`;
  }

  // Timer
  html += `<div class="lp-timer">`;
  html += `<p style="color:#6b7280;font-size:12px;margin:0 0 14px;text-transform:uppercase;letter-spacing:2px">&#9200; Oferta termina en:</p>`;
  html += `<div class="lp-timer-boxes">`;
  html += `<div class="lp-timer-box"><span id="lp-hours" class="lp-timer-num">02</span><span class="lp-timer-label">Horas</span></div>`;
  html += `<div class="lp-timer-box"><span id="lp-mins" class="lp-timer-num">45</span><span class="lp-timer-label">Min</span></div>`;
  html += `<div class="lp-timer-box"><span id="lp-secs" class="lp-timer-num">33</span><span class="lp-timer-label">Seg</span></div>`;
  html += `</div></div>`;

  // Stock bar
  const stockPct = Math.round((stockLeft / 20) * 100);
  html += `<div class="lp-stock">`;
  html += `<div class="lp-stock-bar"><div class="lp-stock-fill" style="width:${stockPct}%"></div></div>`;
  html += `<div class="lp-stock-text">&#128293; &iexcl;Solo quedan ${stockLeft} unidades!</div>`;
  html += `</div>`;

  // Garantía
  const guarantee = guaranteeText || "Si no est&aacute;s 100% satisfecho, te devolvemos el dinero completo. Sin preguntas.";
  html += `<div class="lp-guarantee" style="margin-top:24px">`;
  html += `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" style="margin-bottom:12px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" stroke-width="2"/></svg>`;
  html += `<h3 style="font-size:20px;font-weight:800;margin:0 0 10px;color:#111827">Garant&iacute;a 30 D&iacute;as</h3>`;
  html += `<p style="font-size:15px;color:#374151;margin:0;line-height:1.7;max-width:480px;display:inline-block">${guarantee}</p>`;
  html += `</div>`;

  // Trust badges
  const badges = trustBadges || ["Pago 100% Seguro", "Env&iacute;o Protegido", "Soporte 24/7", "Compra Verificada"];
  const badgeIcons = [
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  ];
  html += `<div class="lp-trust" style="margin-top:24px">`;
  badges.forEach((b, i) => {
    html += `<div class="lp-trust-item"><span class="lp-trust-icon">${badgeIcons[i] || badgeIcons[0]}</span>${b}</div>`;
  });
  html += `</div>`;
  if (countryData?.paymentMethods) {
    html += `<p style="text-align:center;font-size:14px;color:#6b7280;margin:20px 0 0">${countryData.paymentMethods}</p>`;
  }

  // CTA de urgencia
  html += `<div style="margin-top:28px">`;
  html += `<a href="#shopify-product-form" class="lp-btn lp-btn-pulse">${ctaMain}</a>`;
  html += `<p class="lp-btn-sub"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ${ctaSub}</p>`;
  html += `</div>`;

  html += `</div></div>`;

  // ════════════════════════════════════════════════════════════
  // BLOQUE 7: PRUEBA SOCIAL (Confianza social 85%)
  // Testimonios + FAQ. Eliminar las últimas dudas.
  // ════════════════════════════════════════════════════════════
  html += `<div class="lp-section lp-fade"><div class="lp-wrap">`;
  html += `<div style="text-align:center;margin-bottom:32px">`;
  html += `<div style="font-size:28px;letter-spacing:3px;margin-bottom:8px">&#11088;&#11088;&#11088;&#11088;&#11088;</div>`;
  html += `<p style="font-size:clamp(20px,4.5vw,28px);font-weight:800;color:#111827;margin:0">${proofCount}+ clientes satisfechos ${flag}</p>`;
  html += `<p style="font-size:14px;color:#6b7280;margin:6px 0 0">Calificaci&oacute;n promedio: 4.9/5</p>`;
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

  // FAQ dentro de prueba social
  if (faq?.length > 0) {
    html += `<div style="margin-top:32px">`;
    html += `<h3 style="font-size:20px;font-weight:800;text-align:center;margin-bottom:16px;color:#111827">&#10068; Preguntas Frecuentes</h3>`;
    for (const item of faq) {
      html += `<details class="lp-faq">`;
      html += `<summary>${item.q}</summary>`;
      html += `<div class="lp-faq-answer">${item.a}</div>`;
      html += `</details>`;
    }
    html += `</div>`;
  }

  html += `</div></div>`;

  // ════════════════════════════════════════════════════════════
  // BLOQUE 8: CTA FINAL (Decisión clara 100%)
  // Último empujón. Precio + CTA + urgencia máxima.
  // ════════════════════════════════════════════════════════════
  html += `<div class="lp-cta-final"><div class="lp-wrap">`;
  html += `<h2 style="color:#fff;margin-bottom:8px">&#128640; No dejes pasar esta oportunidad</h2>`;
  html += `<p style="font-size:16px;color:#94a3b8;margin:0 0 28px">El precio de oferta puede terminar en cualquier momento</p>`;
  if (displayCompare && displayPrice) {
    html += `<div style="margin-bottom:24px"><span class="lp-price-old" style="color:#64748b">${displayCompare}</span><span class="lp-price-now">${displayPrice}</span></div>`;
  }
  html += `<a href="#shopify-product-form" class="lp-btn" style="max-width:400px">${ctaFinal}</a>`;
  html += `<p class="lp-btn-sub" style="color:#64748b"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ${ctaSub}</p>`;
  html += `</div></div>`;

  // ─── WHATSAPP FLOTANTE ───
  if (whatsappNumber) {
    const waMsg = encodeURIComponent(`Hola, me interesa: ${headline || productName || ""}`);
    html += `<a id="lp-wa" class="lp-wa" href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${waMsg}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>`;
  }

  // ─── STICKY BUTTON ───
  html += `<div id="lp-sticky" class="lp-sticky"><a href="#shopify-product-form">&#128722; AGREGAR AL CARRITO &mdash; 50% OFF</a></div>`;

  // ─── EXIT POPUP ───
  html += `<div id="lp-exit" class="lp-exit"><div class="lp-exit-card">`;
  html += `<div style="font-size:40px;margin-bottom:12px">&#128561;</div>`;
  html += `<h3 style="font-size:22px;font-weight:900;margin:0 0 8px;color:#111827">&iexcl;Espera! 10% EXTRA</h3>`;
  html += `<p style="font-size:14px;color:#6b7280;margin:0 0 24px">Solo si compras en los pr&oacute;ximos 15 minutos</p>`;
  html += `<a href="#shopify-product-form" onclick="document.getElementById('lp-exit').style.display='none'" class="lp-btn" style="font-size:16px;padding:14px 20px">QUIERO MI DESCUENTO</a>`;
  html += `<p style="margin:16px 0 0"><a href="#" onclick="document.getElementById('lp-exit').style.display='none';return false" style="font-size:12px;color:#9ca3af;text-decoration:underline">No gracias, prefiero pagar m&aacute;s</a></p>`;
  html += `</div></div>`;

  // ─── JAVASCRIPT ───
  html += `<script>(function(){`;

  // Gallery
  if (imgs.length > 1) {
    html += `var imgs=${JSON.stringify(imgs)},ci=0;`;
    html += `window.lpSetImg=function(i){ci=i;document.getElementById("lp-main-img").src=imgs[i];document.querySelectorAll(".lp-gallery-thumb").forEach(function(t,j){t.classList.toggle("active",j===i)})};`;
    html += `window.lpGallery=function(d){ci=(ci+d+imgs.length)%imgs.length;lpSetImg(ci)};`;
    html += `var gal=document.querySelector(".lp-gallery"),sx=0;if(gal){gal.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});gal.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){dx<0?lpGallery(1):lpGallery(-1)}},{passive:true})}`;
  }

  // Timer
  html += `var k="lp_end_v4",s=localStorage.getItem(k),e;if(s&&parseInt(s)>Date.now())e=parseInt(s);else{e=Date.now()+9933000;localStorage.setItem(k,String(e))}function pad(n){return n<10?"0"+n:String(n)}function tick(){var d=Math.max(0,e-Date.now()),h=Math.floor(d/36e5);d%=36e5;var m=Math.floor(d/6e4);d%=6e4;var sc=Math.floor(d/1e3);var eh=document.getElementById("lp-hours"),em=document.getElementById("lp-mins"),es=document.getElementById("lp-secs");if(eh)eh.textContent=pad(h);if(em)em.textContent=pad(m);if(es)es.textContent=pad(sc);if(d<=0)localStorage.removeItem(k)}tick();setInterval(tick,1e3);`;

  // Sticky
  html += `var st=document.getElementById("lp-sticky");if(st){window.addEventListener("scroll",function(){var sh=window.scrollY>600;st.style.display=sh?"block":"none";var wa=document.getElementById("lp-wa");if(wa)wa.style.bottom=sh?"80px":"20px"});var sp=document.createElement("div");sp.style.height="70px";st.parentNode.insertBefore(sp,st)}`;

  // Exit intent
  html += `var ex=document.getElementById("lp-exit"),exs=localStorage.getItem("lp_ex_v4");if(ex&&!exs){document.addEventListener("mouseout",function(e){if(!e.toElement&&!e.relatedTarget&&e.clientY<10){ex.style.display="flex";localStorage.setItem("lp_ex_v4","1")}});if(/Mobi|Android/i.test(navigator.userAgent))setTimeout(function(){if(!localStorage.getItem("lp_ex_v4")){ex.style.display="flex";localStorage.setItem("lp_ex_v4","1")}},30000);ex.addEventListener("click",function(e){if(e.target===ex)ex.style.display="none"})}`;

  // Fade-in animations
  html += `if("IntersectionObserver"in window){var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}})},{threshold:.15});document.querySelectorAll(".lp-fade").forEach(function(el){obs.observe(el)})}else{document.querySelectorAll(".lp-fade").forEach(function(el){el.classList.add("visible")})}`;

  html += `})();</script>`;
  html += `</div>`;

  return html;
}
