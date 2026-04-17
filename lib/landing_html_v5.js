// lib/landing_html_v5.js
// ============================================================
// BUILDER HTML v5 — Diseño nivel Imperio Ecommerce
// Mejoras sobre v4:
//   - Bundles de producto (1x, 2x, 3x con ahorro)
//   - Tipografía premium con jerarquía fuerte
//   - Gradientes warm (dorado, naranja, rojo)
//   - Secciones con imágenes integradas
//   - Antes/Después visual mejorado
//   - Badge de envío gratis + COD prominente
//   - Cards de beneficios con iconos grandes
//   - CTA más agresivos con micro-animaciones
//   - Pasos numerados estilo Imperio (1, 2, 3)
// NO TOCAR v4 — esta es versión nueva
// ============================================================

export function buildLandingHTML_v5(landingData) {
  const {
    headline, subheadline, bulletPoints, description, features, faq,
    urgencyText, compareTable, testimonials, problemSolution,
    guaranteeText, trustBadges, price, comparePrice, socialProofCount,
    countryCode, countryData, formattedPrice, formattedCompare, savingsText,
    whatsappNumber, facebookPixelId, tiktokPixelId,
    images, videoUrl, beforeAfter, productName, processSteps,
  } = landingData;

  const dp = formattedPrice || (price ? `$${price}` : "");
  const dc = formattedCompare || (comparePrice ? `$${comparePrice}` : "");
  const isCOD = countryData?.contraentrega === true;
  const ctaMain = isCOD ? "PEDIR AHORA — PAGO AL RECIBIR" : "LO QUIERO — 50% OFF";
  const ctaSub = isCOD ? "Sin tarjeta · Pagas cuando te llegue · Sin riesgo" : "Compra segura · Garantia 30 dias";
  const flag = countryData?.flag || "";
  const proof = socialProofCount || "2,847";
  const stock = Math.floor(Math.random() * 8) + 3;
  const imgs = images?.length > 0 ? images : [];
  const pName = productName || headline || "Producto";

  // Bundle prices
  const basePrice = parseFloat(price) || 29.99;
  const bundle2 = (basePrice * 1.8).toFixed(2);
  const bundle3 = (basePrice * 2.4).toFixed(2);
  const save2 = Math.round((1 - 1.8/2) * 100);
  const save3 = Math.round((1 - 2.4/3) * 100);

  let html = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
.lp5{font-family:'Plus Jakarta Sans','Inter',system-ui,sans-serif;color:#1a1a2e;line-height:1.7;overflow-x:hidden;-webkit-font-smoothing:antialiased;background:#fff}
.lp5-w{max-width:720px;margin:0 auto;padding:0 20px}

/* Banner */
.lp5-ban{background:linear-gradient(135deg,#dc2626,#ea580c);color:#fff;text-align:center;padding:10px 16px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.lp5-ban span{animation:lp5-flash 1.5s infinite}
@keyframes lp5-flash{0%,100%{opacity:1}50%{opacity:.5}}

/* Sections */
.lp5-sec{padding:48px 0}
.lp5-sec-warm{padding:48px 0;background:linear-gradient(180deg,#fffbf0,#fff7e6)}
.lp5-sec-dark{padding:56px 0;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff}
.lp5-tag{display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-size:11px;font-weight:800;padding:4px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.lp5-h2{font-size:clamp(24px,5.5vw,34px);font-weight:900;line-height:1.2;margin:0 0 8px;text-align:center}
.lp5-h2 em{font-style:normal;background:linear-gradient(135deg,#f59e0b,#ea580c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.lp5-sub{font-size:15px;color:#64748b;text-align:center;margin:0 0 28px;line-height:1.6}

/* Hero */
.lp5-hero{text-align:center;padding:40px 0 20px}
.lp5-hero h1{font-size:clamp(28px,7vw,44px);font-weight:900;line-height:1.15;margin:0 0 12px;color:#1a1a2e}
.lp5-hero h1 em{font-style:normal;background:linear-gradient(135deg,#f59e0b,#ea580c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.lp5-badge{display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;border:1px solid #a7f3d0;color:#059669;font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;margin:12px 0}

/* Gallery */
.lp5-gal{position:relative;margin-bottom:20px}
.lp5-gal-main{width:100%;aspect-ratio:1;object-fit:contain;border-radius:20px;background:#fafafa;display:block;box-shadow:0 4px 24px rgba(0,0,0,.06)}
.lp5-gal-thumbs{display:flex;gap:8px;margin-top:10px;overflow-x:auto;scrollbar-width:none}
.lp5-gal-thumbs::-webkit-scrollbar{display:none}
.lp5-gal-thumb{width:60px;height:60px;border-radius:12px;object-fit:cover;border:2px solid transparent;cursor:pointer;flex-shrink:0;opacity:.5;transition:.2s}
.lp5-gal-thumb.active,.lp5-gal-thumb:hover{border-color:#f59e0b;opacity:1}
.lp5-gal-nav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:none;box-shadow:0 2px 12px rgba(0,0,0,.1);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:.2s}
.lp5-gal-nav:hover{transform:translateY(-50%) scale(1.1)}

/* Benefits grid */
.lp5-bens{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:520px){.lp5-bens{grid-template-columns:1fr}}
.lp5-ben{background:#fff;border:1px solid #f0f0f0;border-radius:16px;padding:20px;transition:.2s;position:relative;overflow:hidden}
.lp5-ben:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06);border-color:#f59e0b}
.lp5-ben::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f59e0b,#ea580c);opacity:0;transition:.2s}
.lp5-ben:hover::before{opacity:1}
.lp5-ben-num{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#fff7e6,#fef3c7);color:#f59e0b;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.lp5-ben-title{font-weight:800;font-size:15px;color:#1a1a2e;margin-bottom:4px}
.lp5-ben-desc{font-size:13px;color:#64748b;line-height:1.5}

/* Before/After */
.lp5-ba{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:520px){.lp5-ba{grid-template-columns:1fr}}
.lp5-ba-card{border-radius:20px;padding:28px 20px;text-align:center}
.lp5-ba-before{background:linear-gradient(135deg,#fef2f2,#fee2e2);border:2px solid #fecaca}
.lp5-ba-after{background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #a7f3d0}

/* Steps */
.lp5-steps{counter-reset:s5}
.lp5-step{position:relative;padding:24px 24px 24px 80px;background:#fff;border:1px solid #f0f0f0;border-radius:16px;margin-bottom:12px;transition:.2s}
.lp5-step:hover{transform:translateX(4px);box-shadow:0 4px 16px rgba(0,0,0,.04)}
.lp5-step::before{counter-increment:s5;content:counter(s5);position:absolute;left:20px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(245,158,11,.3)}

/* Bundles */
.lp5-bundles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
@media(max-width:560px){.lp5-bundles{grid-template-columns:1fr}}
.lp5-bundle{border:2px solid #e5e7eb;border-radius:20px;padding:20px 16px;text-align:center;cursor:pointer;transition:.2s;position:relative;background:#fff}
.lp5-bundle:hover{border-color:#f59e0b;transform:translateY(-2px)}
.lp5-bundle-pop{border-color:#f59e0b;background:linear-gradient(180deg,#fffbf0,#fff);box-shadow:0 8px 32px rgba(245,158,11,.15)}
.lp5-bundle-tag{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#dc2626,#ea580c);color:#fff;font-size:10px;font-weight:800;padding:3px 14px;border-radius:12px;white-space:nowrap;text-transform:uppercase}
.lp5-bundle-qty{font-size:28px;font-weight:900;color:#1a1a2e;margin:8px 0 4px}
.lp5-bundle-price{font-size:22px;font-weight:900;color:#059669}
.lp5-bundle-unit{font-size:11px;color:#94a3b8;margin-top:2px}
.lp5-bundle-save{display:inline-block;background:#ecfdf5;color:#059669;font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;margin-top:6px}

/* Price box */
.lp5-price{text-align:center;margin:20px 0}
.lp5-price-old{font-size:20px;color:#9ca3af;text-decoration:line-through;margin-right:10px}
.lp5-price-now{font-size:clamp(36px,8vw,52px);font-weight:900;background:linear-gradient(135deg,#059669,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.lp5-cod-badge{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #059669;color:#059669;font-size:14px;font-weight:800;padding:12px 24px;border-radius:16px;margin-top:12px}

/* Timer */
.lp5-timer{background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:20px;padding:28px 20px;text-align:center;margin:24px 0}
.lp5-timer-boxes{display:flex;justify-content:center;gap:12px}
.lp5-timer-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 18px;min-width:70px}
.lp5-timer-num{display:block;font-size:clamp(28px,6vw,38px);font-weight:900;color:#fff;line-height:1}
.lp5-timer-label{display:block;font-size:9px;color:rgba(255,255,255,.4);text-transform:uppercase;margin-top:4px;letter-spacing:2px}

/* Stock */
.lp5-stock{max-width:300px;margin:16px auto 0}
.lp5-stock-bar{height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden}
.lp5-stock-fill{height:100%;background:linear-gradient(90deg,#dc2626,#f59e0b);border-radius:4px;transition:width 1s}
.lp5-stock-txt{font-size:13px;color:#dc2626;font-weight:700;text-align:center;margin-top:6px}

/* Button */
.lp5-btn{display:block;width:100%;max-width:480px;margin:0 auto;padding:20px 28px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-size:clamp(16px,4vw,20px);font-weight:900;text-align:center;text-decoration:none;border:none;border-radius:16px;cursor:pointer;box-shadow:0 8px 32px rgba(245,158,11,.35);letter-spacing:.3px;transition:.25s;position:relative;overflow:hidden;text-transform:uppercase}
.lp5-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(245,158,11,.45)}
.lp5-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);transition:left .7s}
.lp5-btn:hover::after{left:100%}
.lp5-btn-green{background:linear-gradient(135deg,#059669,#047857);box-shadow:0 8px 32px rgba(5,150,105,.35)}
.lp5-btn-green:hover{box-shadow:0 12px 40px rgba(5,150,105,.45)}
.lp5-btn-sub{text-align:center;font-size:12px;color:#9ca3af;margin-top:8px}
@keyframes lp5-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
.lp5-btn-pulse{animation:lp5-pulse 2.5s infinite}

/* Reviews */
.lp5-rev{background:#fff;border:1px solid #f0f0f0;border-radius:20px;padding:24px;margin-bottom:12px;transition:.2s}
.lp5-rev:hover{box-shadow:0 4px 16px rgba(0,0,0,.04)}
.lp5-rev-stars{color:#f59e0b;font-size:18px;letter-spacing:2px;margin-bottom:10px}
.lp5-rev-txt{font-size:14px;color:#374151;font-style:italic;line-height:1.7;margin-bottom:12px}
.lp5-rev-author{display:flex;align-items:center;gap:10px}
.lp5-rev-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0}
.lp5-rev-verified{margin-left:auto;font-size:10px;color:#059669;font-weight:700;background:#ecfdf5;padding:4px 10px;border-radius:8px}

/* Guarantee */
.lp5-guarantee{background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #059669;border-radius:24px;padding:36px 28px;text-align:center}

/* Trust */
.lp5-trust{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px}
@media(max-width:600px){.lp5-trust{grid-template-columns:1fr 1fr}}
.lp5-trust-item{background:#fff;border:1px solid #f0f0f0;border-radius:14px;padding:16px 10px;text-align:center;font-size:12px;font-weight:700;color:#374151}

/* Table */
.lp5-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 2px 12px rgba(0,0,0,.04)}
.lp5-table th{padding:14px;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:.5px}
.lp5-table td{padding:12px 14px;border-top:1px solid #f3f4f6}
.lp5-table tr:nth-child(even){background:#fafafa}

/* FAQ */
.lp5-faq{margin-bottom:8px;border:1px solid #f0f0f0;border-radius:14px;overflow:hidden;background:#fff}
.lp5-faq summary{padding:16px 20px;font-weight:700;font-size:14px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}
.lp5-faq summary::after{content:'+';font-size:18px;color:#9ca3af;transition:.2s}
.lp5-faq[open] summary::after{transform:rotate(45deg);color:#f59e0b}
.lp5-faq-a{padding:0 20px 16px;font-size:13px;color:#64748b;line-height:1.7}

/* Video */
.lp5-video{position:relative;width:100%;padding-bottom:56.25%;border-radius:20px;overflow:hidden;background:#000;margin-bottom:24px}
.lp5-video iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}

/* Sticky */
.lp5-sticky{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,255,255,.97);padding:10px 16px;box-shadow:0 -4px 24px rgba(0,0,0,.08);display:none;backdrop-filter:blur(12px)}
.lp5-sticky a{display:block;width:100%;max-width:480px;margin:0 auto;padding:14px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-size:15px;font-weight:900;text-align:center;text-decoration:none;border-radius:14px;text-transform:uppercase}

/* WhatsApp */
.lp5-wa{position:fixed;bottom:80px;right:16px;z-index:10000;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,.4);text-decoration:none;transition:.2s}
.lp5-wa:hover{transform:scale(1.1)}

/* Exit */
.lp5-exit{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.lp5-exit-card{background:#fff;border-radius:24px;max-width:400px;width:90%;margin:auto;padding:36px 28px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.25)}

/* Fade */
.lp5-fade{opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s}
.lp5-fade.visible{opacity:1;transform:translateY(0)}
</style>`;

  // Pixels
  if (facebookPixelId) html += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${facebookPixelId}');fbq('track','PageView');</script>`;
  if (tiktokPixelId) html += `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');</script>`;

  html += `<div class="lp5">`;

  // ─── BANNER ───
  const shipText = countryData?.shipping || "Envio GRATIS";
  html += `<div class="lp5-ban"><span>OFERTA LIMITADA</span> — 50% OFF + ${shipText} ${flag}</div>`;

  // ═══ HERO ═══
  html += `<div class="lp5-sec lp5-fade"><div class="lp5-w"><div class="lp5-hero">`;
  if (headline) html += `<h1>${headline.replace(/\b(resultado|soluci[oó]n|transforma|descubre|secreto|ahora|gratis|nuevo|mejor|[uú]ltim)/gi, '<em>$1</em>')}</h1>`;
  if (subheadline) html += `<p style="font-size:16px;color:#64748b;margin:0 0 8px;line-height:1.6">${subheadline}</p>`;
  html += `<div style="margin:12px 0"><span style="font-size:22px;letter-spacing:2px">&#11088;&#11088;&#11088;&#11088;&#11088;</span><span style="font-size:13px;color:#64748b;margin-left:6px">${proof}+ clientes ${flag}</span></div>`;
  if (isCOD) html += `<div class="lp5-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Pago al recibir disponible</div>`;
  html += `</div>`;

  // Gallery
  if (imgs.length > 0) {
    html += `<div class="lp5-gal">`;
    html += `<img id="lp5-main" class="lp5-gal-main" src="${imgs[0]}" alt="${pName}">`;
    if (imgs.length > 1) {
      html += `<button class="lp5-gal-nav" style="left:8px" onclick="lp5G(-1)">&#8249;</button>`;
      html += `<button class="lp5-gal-nav" style="right:8px" onclick="lp5G(1)">&#8250;</button>`;
      html += `<div class="lp5-gal-thumbs">`;
      imgs.forEach((img, i) => { html += `<img class="lp5-gal-thumb${i === 0 ? ' active' : ''}" src="${img}" alt="${i+1}" onclick="lp5S(${i})">`; });
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Video
  if (videoUrl) {
    let embedUrl = videoUrl;
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    html += `<div class="lp5-video"><iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe></div>`;
  }

  // Early CTA
  html += `<div style="margin-top:24px"><a href="#shopify-product-form" class="lp5-btn lp5-btn-pulse">${ctaMain}</a><p class="lp5-btn-sub">${ctaSub}</p></div>`;
  html += `</div></div>`;

  // ═══ BENEFICIOS ═══
  if (bulletPoints?.length > 0) {
    html += `<div class="lp5-sec-warm lp5-fade"><div class="lp5-w">`;
    html += `<div style="text-align:center"><span class="lp5-tag">Beneficios</span></div>`;
    html += `<h2 class="lp5-h2">¿Que vas a <em>lograr</em>?</h2>`;
    html += `<p class="lp5-sub">Resultados reales que cambian tu dia a dia</p>`;
    html += `<div class="lp5-bens">`;
    bulletPoints.forEach((bp, i) => {
      html += `<div class="lp5-ben"><div class="lp5-ben-num">${i + 1}</div><div class="lp5-ben-title">${bp.split('.')[0] || bp.split(',')[0] || bp.slice(0, 40)}</div><div class="lp5-ben-desc">${bp}</div></div>`;
    });
    html += `</div></div></div>`;
  }

  // ═══ ANTES / DESPUÉS ═══
  if (beforeAfter || problemSolution) {
    html += `<div class="lp5-sec lp5-fade"><div class="lp5-w">`;
    html += `<div style="text-align:center"><span class="lp5-tag">Transformacion</span></div>`;
    html += `<h2 class="lp5-h2">Antes vs <em>Despues</em></h2>`;
    const bef = beforeAfter?.before || problemSolution?.problem || "Frustrado con soluciones que no funcionan";
    const aft = beforeAfter?.after || problemSolution?.solution || "Resultados reales desde la primera semana";
    html += `<div class="lp5-ba">`;
    html += `<div class="lp5-ba-card lp5-ba-before"><div style="font-size:36px;margin-bottom:10px">&#128542;</div><div style="font-size:18px;font-weight:900;color:#dc2626;margin-bottom:8px">ANTES</div><div style="font-size:14px;color:#7f1d1d;line-height:1.6">${bef}</div></div>`;
    html += `<div class="lp5-ba-card lp5-ba-after"><div style="font-size:36px;margin-bottom:10px">&#128513;</div><div style="font-size:18px;font-weight:900;color:#059669;margin-bottom:8px">DESPUES</div><div style="font-size:14px;color:#065f46;line-height:1.6">${aft}</div></div>`;
    html += `</div></div></div>`;
  }

  // ═══ PASOS ═══
  const steps = processSteps || [
    { title: "Realiza tu pedido", desc: "Selecciona tu paquete y completa tu pedido en 2 minutos" },
    { title: "Recibe en tu puerta", desc: "Llega a tu casa en 3-7 dias con envio gratis" },
    { title: "Disfruta los resultados", desc: "Nota la diferencia desde la primera semana de uso" },
  ];
  html += `<div class="lp5-sec-warm lp5-fade"><div class="lp5-w">`;
  html += `<div style="text-align:center"><span class="lp5-tag">Como funciona</span></div>`;
  html += `<h2 class="lp5-h2">Asi de <em>facil</em></h2>`;
  html += `<p class="lp5-sub">3 simples pasos para empezar</p>`;
  html += `<div class="lp5-steps">`;
  steps.forEach(s => { html += `<div class="lp5-step"><div style="font-weight:800;font-size:15px;color:#1a1a2e;margin-bottom:2px">${s.title}</div><div style="font-size:13px;color:#64748b">${s.desc}</div></div>`; });
  html += `</div></div></div>`;

  // ═══ OFERTA + BUNDLES ═══
  html += `<div class="lp5-sec lp5-fade"><div class="lp5-w">`;
  html += `<div style="text-align:center"><span class="lp5-tag">Oferta especial</span></div>`;
  html += `<h2 class="lp5-h2">Elige tu <em>paquete</em></h2>`;
  html += `<p class="lp5-sub">Mientras mas compras, mas ahorras</p>`;

  // Bundles
  html += `<div class="lp5-bundles">`;
  html += `<div class="lp5-bundle" onclick="location.href='#shopify-product-form'"><div class="lp5-bundle-qty">1x</div><div style="font-size:12px;color:#64748b;margin-bottom:8px">${pName}</div><div class="lp5-bundle-price">${dp}</div><div class="lp5-bundle-unit">${dc ? `<s style="color:#9ca3af">${dc}</s>` : ''}</div></div>`;
  html += `<div class="lp5-bundle lp5-bundle-pop" onclick="location.href='#shopify-product-form'"><div class="lp5-bundle-tag">Mas vendido</div><div class="lp5-bundle-qty">2x</div><div style="font-size:12px;color:#64748b;margin-bottom:8px">${pName}</div><div class="lp5-bundle-price">${countryData?.format ? countryData.format(bundle2) : '$'+bundle2}</div><div class="lp5-bundle-save">Ahorras ${save2}%</div></div>`;
  html += `<div class="lp5-bundle" onclick="location.href='#shopify-product-form'"><div class="lp5-bundle-qty">3x</div><div style="font-size:12px;color:#64748b;margin-bottom:8px">${pName}</div><div class="lp5-bundle-price">${countryData?.format ? countryData.format(bundle3) : '$'+bundle3}</div><div class="lp5-bundle-save">Ahorras ${save3}%</div></div>`;
  html += `</div>`;

  // COD badge
  if (isCOD) html += `<div style="text-align:center"><div class="lp5-cod-badge"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg> PAGA AL RECIBIR — Sin riesgo</div></div>`;

  // Timer
  html += `<div class="lp5-timer"><p style="color:rgba(255,255,255,.5);font-size:11px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px">Oferta termina en:</p><div class="lp5-timer-boxes"><div class="lp5-timer-box"><span id="lp5-h" class="lp5-timer-num">02</span><span class="lp5-timer-label">Horas</span></div><div class="lp5-timer-box"><span id="lp5-m" class="lp5-timer-num">45</span><span class="lp5-timer-label">Min</span></div><div class="lp5-timer-box"><span id="lp5-s" class="lp5-timer-num">33</span><span class="lp5-timer-label">Seg</span></div></div></div>`;

  // Stock
  const sPct = Math.round((stock / 20) * 100);
  html += `<div class="lp5-stock"><div class="lp5-stock-bar"><div class="lp5-stock-fill" style="width:${sPct}%"></div></div><div class="lp5-stock-txt">Solo quedan ${stock} unidades en stock</div></div>`;

  // CTA
  html += `<div style="margin-top:24px"><a href="#shopify-product-form" class="lp5-btn lp5-btn-green lp5-btn-pulse">${ctaMain}</a><p class="lp5-btn-sub">${ctaSub}</p></div>`;
  html += `</div></div>`;

  // ═══ SPECS + TABLE ═══
  if (features?.length > 0 || compareTable?.length > 0) {
    html += `<div class="lp5-sec-warm lp5-fade"><div class="lp5-w">`;
    html += `<div style="text-align:center"><span class="lp5-tag">Especificaciones</span></div>`;
    html += `<h2 class="lp5-h2">Calidad <em>premium</em></h2>`;
    if (features?.length > 0) {
      html += `<div class="lp5-bens">`;
      features.forEach(f => { html += `<div class="lp5-ben" style="padding:14px 16px;display:flex;align-items:center;gap:10px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span style="font-size:13px;color:#374151">${f}</span></div>`; });
      html += `</div>`;
    }
    if (compareTable?.length > 0) {
      html += `<div style="margin-top:24px;overflow-x:auto;border-radius:16px"><table class="lp5-table"><thead><tr><th style="text-align:left;background:#1a1a2e;color:#fff">Caracteristica</th><th style="text-align:center;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff">Nosotros</th><th style="text-align:center;background:#f3f4f6;color:#6b7280">Otros</th></tr></thead><tbody>`;
      compareTable.forEach(row => { html += `<tr><td style="font-weight:600">${row.feature}</td><td style="text-align:center;color:#059669;font-weight:700">&#9989; ${row.ours}</td><td style="text-align:center;color:#9ca3af">&#10060; ${row.theirs}</td></tr>`; });
      html += `</tbody></table></div>`;
    }
    html += `</div></div>`;
  }

  // ═══ REVIEWS ═══
  html += `<div class="lp5-sec lp5-fade"><div class="lp5-w">`;
  html += `<div style="text-align:center"><span class="lp5-tag">Testimonios</span></div>`;
  html += `<h2 class="lp5-h2">${proof}+ clientes <em>satisfechos</em></h2>`;
  html += `<div style="text-align:center;font-size:24px;letter-spacing:3px;margin-bottom:20px">&#11088;&#11088;&#11088;&#11088;&#11088;</div>`;
  const revs = testimonials?.length > 0 ? testimonials : [{ name: "Cliente", text: "Excelente producto, super recomendado.", rating: 5 }];
  revs.forEach(t => {
    const init = (t.name || "C")[0].toUpperCase();
    html += `<div class="lp5-rev"><div class="lp5-rev-stars">${"&#11088;".repeat(t.rating || 5)}</div><div class="lp5-rev-txt">"${t.text}"</div><div class="lp5-rev-author"><div class="lp5-rev-avatar">${init}</div><div><div style="font-weight:700;font-size:13px">${flag} ${t.name}</div>${t.city ? `<div style="font-size:11px;color:#9ca3af">${t.city}</div>` : ''}</div><span class="lp5-rev-verified">&#9989; Verificada</span></div></div>`;
  });
  html += `</div></div>`;

  // ═══ GUARANTEE + TRUST ═══
  html += `<div class="lp5-sec-warm lp5-fade"><div class="lp5-w">`;
  html += `<div class="lp5-guarantee"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" style="margin-bottom:12px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" stroke-width="2"/></svg><h3 style="font-size:22px;font-weight:900;margin:0 0 8px;color:#1a1a2e">Garantia 30 Dias</h3><p style="font-size:14px;color:#374151;margin:0;line-height:1.7;max-width:460px;display:inline-block">${guaranteeText || 'Si no estas 100% satisfecho, te devolvemos el dinero completo. Sin preguntas.'}</p></div>`;
  const badges = trustBadges || ["Pago Seguro", "Envio Protegido", "Soporte 24/7", "Compra Verificada"];
  html += `<div class="lp5-trust">`;
  badges.forEach(b => { html += `<div class="lp5-trust-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" style="margin-bottom:6px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><br>${b}</div>`; });
  html += `</div>`;
  if (countryData?.paymentMethods) html += `<p style="text-align:center;font-size:13px;color:#64748b;margin:16px 0 0">${countryData.paymentMethods}</p>`;
  html += `</div></div>`;

  // ═══ FAQ ═══
  if (faq?.length > 0) {
    html += `<div class="lp5-sec lp5-fade"><div class="lp5-w">`;
    html += `<div style="text-align:center"><span class="lp5-tag">FAQ</span></div>`;
    html += `<h2 class="lp5-h2">Preguntas <em>frecuentes</em></h2>`;
    faq.forEach(item => { html += `<details class="lp5-faq"><summary>${item.q}</summary><div class="lp5-faq-a">${item.a}</div></details>`; });
    html += `</div></div>`;
  }

  // ═══ CTA FINAL ═══
  html += `<div class="lp5-sec-dark lp5-fade"><div class="lp5-w" style="text-align:center">`;
  html += `<h2 style="font-size:clamp(24px,5vw,34px);font-weight:900;color:#fff;margin:0 0 8px">No dejes pasar esta oportunidad</h2>`;
  html += `<p style="font-size:14px;color:rgba(255,255,255,.5);margin:0 0 24px">El precio de oferta puede terminar en cualquier momento</p>`;
  if (dc && dp) html += `<div style="margin-bottom:20px"><span style="font-size:18px;color:rgba(255,255,255,.4);text-decoration:line-through;margin-right:10px">${dc}</span><span style="font-size:clamp(32px,7vw,48px);font-weight:900;color:#10b981">${dp}</span></div>`;
  html += `<a href="#shopify-product-form" class="lp5-btn" style="max-width:400px">${isCOD ? 'PEDIR AHORA — PAGO AL RECIBIR' : 'COMPRAR AHORA — 50% OFF'}</a>`;
  html += `<p class="lp5-btn-sub" style="color:rgba(255,255,255,.3)">${ctaSub}</p>`;
  html += `</div></div>`;

  // ─── WHATSAPP ───
  if (whatsappNumber) {
    const waMsg = encodeURIComponent(`Hola, me interesa: ${pName}`);
    html += `<a id="lp5-wa" class="lp5-wa" href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${waMsg}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>`;
  }

  // ─── STICKY ───
  html += `<div id="lp5-sticky" class="lp5-sticky"><a href="#shopify-product-form">AGREGAR AL CARRITO — 50% OFF</a></div>`;

  // ─── EXIT POPUP ───
  html += `<div id="lp5-exit" class="lp5-exit"><div class="lp5-exit-card"><div style="font-size:40px;margin-bottom:10px">&#128561;</div><h3 style="font-size:22px;font-weight:900;margin:0 0 6px;color:#1a1a2e">Espera! 10% EXTRA</h3><p style="font-size:13px;color:#64748b;margin:0 0 20px">Solo si compras en los proximos 15 minutos</p><a href="#shopify-product-form" onclick="document.getElementById('lp5-exit').style.display='none'" class="lp5-btn" style="font-size:15px;padding:14px 20px">QUIERO MI DESCUENTO</a><p style="margin:14px 0 0"><a href="#" onclick="document.getElementById('lp5-exit').style.display='none';return false" style="font-size:11px;color:#9ca3af;text-decoration:underline">No gracias</a></p></div></div>`;

  // ─── JS ───
  html += `<script>(function(){`;
  // Gallery
  if (imgs.length > 1) {
    html += `var ii=${JSON.stringify(imgs)},ci=0;window.lp5S=function(i){ci=i;document.getElementById("lp5-main").src=ii[i];document.querySelectorAll(".lp5-gal-thumb").forEach(function(t,j){t.classList.toggle("active",j===i)})};window.lp5G=function(d){ci=(ci+d+ii.length)%ii.length;lp5S(ci)};var g=document.querySelector(".lp5-gal"),sx=0;if(g){g.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});g.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){dx<0?lp5G(1):lp5G(-1)}},{passive:true})}`;
  }
  // Timer
  html += `var k="lp5_end",s=localStorage.getItem(k),e;if(s&&parseInt(s)>Date.now())e=parseInt(s);else{e=Date.now()+9933000;localStorage.setItem(k,String(e))}function pad(n){return n<10?"0"+n:String(n)}function tick(){var d=Math.max(0,e-Date.now()),h=Math.floor(d/36e5);d%=36e5;var m=Math.floor(d/6e4);d%=6e4;var sc=Math.floor(d/1e3);var eh=document.getElementById("lp5-h"),em=document.getElementById("lp5-m"),es=document.getElementById("lp5-s");if(eh)eh.textContent=pad(h);if(em)em.textContent=pad(m);if(es)es.textContent=pad(sc);if(d<=0)localStorage.removeItem(k)}tick();setInterval(tick,1e3);`;
  // Sticky
  html += `var st=document.getElementById("lp5-sticky");if(st){window.addEventListener("scroll",function(){var sh=window.scrollY>600;st.style.display=sh?"block":"none";var wa=document.getElementById("lp5-wa");if(wa)wa.style.bottom=sh?"76px":"20px"})}`;
  // Exit intent
  html += `var ex=document.getElementById("lp5-exit"),exs=localStorage.getItem("lp5_ex");if(ex&&!exs){document.addEventListener("mouseout",function(e){if(!e.toElement&&!e.relatedTarget&&e.clientY<10){ex.style.display="flex";localStorage.setItem("lp5_ex","1")}});if(/Mobi|Android/i.test(navigator.userAgent))setTimeout(function(){if(!localStorage.getItem("lp5_ex")){ex.style.display="flex";localStorage.setItem("lp5_ex","1")}},30000);ex.addEventListener("click",function(e){if(e.target===ex)ex.style.display="none"})}`;
  // Fade
  html += `if("IntersectionObserver"in window){var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}})},{threshold:.15});document.querySelectorAll(".lp5-fade").forEach(function(el){obs.observe(el)})}else{document.querySelectorAll(".lp5-fade").forEach(function(el){el.classList.add("visible")})}`;

  html += `})();</script></div>`;
  return html;
}
