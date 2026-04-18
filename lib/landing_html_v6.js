// lib/landing_html_v6.js
// ============================================================
// BUILDER HTML v6 — Diseño tienda profesional de marca
// Cambios vs v5:
//   - Diseño limpio y elegante (no parece dropshipping)
//   - Precios de bundle correctamente formateados
//   - Copy profesional sin exageraciones
//   - Reviews con variación natural
//   - Sin exit popup intrusivo
//   - Colores sobrios con acentos cálidos
//   - Mobile-first responsive
//   - Mejor jerarquía visual
// ============================================================

export function buildLandingHTML_v6(landingData) {
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
  const ctaMain = isCOD ? "Pedir ahora — Pago al recibir" : "Comprar ahora";
  const ctaSub = isCOD ? "Pagas cuando lo recibas en tu puerta" : "Compra 100% segura · Garantía 30 días";
  const flag = countryData?.flag || "";
  const proof = socialProofCount || "2,847";
  const stock = Math.floor(Math.random() * 12) + 5;
  const imgs = images?.length > 0 ? images : [];
  const pName = productName || headline || "Producto";

  // Bundle prices — formatear correctamente con moneda local
  const basePrice = parseFloat(price) || 29.99;
  const bundle2Raw = basePrice * 1.8;
  const bundle3Raw = basePrice * 2.4;
  const save2 = Math.round((1 - 1.8/2) * 100);
  const save3 = Math.round((1 - 2.4/3) * 100);

  // Formatear precios de bundle con la moneda del país
  function fmtPrice(val) {
    if (countryData?.format && typeof countryData.format === 'function') {
      try { return countryData.format(val); } catch {}
    }
    if (countryData?.symbol) {
      const rounded = countryData.decimals === 0 ? Math.round(val) : val.toFixed(2);
      return `${countryData.symbol}${Number(rounded).toLocaleString()}`;
    }
    return `$${val.toFixed(2)}`;
  }
  const bundle2Price = fmtPrice(bundle2Raw);
  const bundle3Price = fmtPrice(bundle3Raw);
  const unitPrice2 = fmtPrice(bundle2Raw / 2);
  const unitPrice3 = fmtPrice(bundle3Raw / 3);

  let html = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
.lp6{font-family:'Inter',system-ui,-apple-system,sans-serif;color:#18181b;line-height:1.7;overflow-x:hidden;-webkit-font-smoothing:antialiased;background:#fff}
.lp6-w{max-width:680px;margin:0 auto;padding:0 20px}

/* Top bar */
.lp6-top{background:#18181b;color:#fff;text-align:center;padding:10px 16px;font-size:12px;font-weight:600;letter-spacing:.5px}
.lp6-top b{color:#fbbf24}

/* Sections */
.lp6-sec{padding:48px 0}
.lp6-sec-alt{padding:48px 0;background:#fafafa}
.lp6-sec-dark{padding:56px 0;background:#18181b;color:#fff}
.lp6-label{display:inline-block;font-size:11px;font-weight:700;color:#a16207;background:#fef9c3;padding:4px 12px;border-radius:6px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px}
.lp6-h2{font-size:clamp(22px,5vw,30px);font-weight:800;line-height:1.25;margin:0 0 6px;text-align:center;color:#18181b}
.lp6-h2 em{font-style:normal;color:#b45309}
.lp6-sub{font-size:14px;color:#71717a;text-align:center;margin:0 0 28px;line-height:1.6}

/* Hero */
.lp6-hero{text-align:center;padding:36px 0 16px}
.lp6-hero h1{font-size:clamp(26px,6.5vw,40px);font-weight:900;line-height:1.15;margin:0 0 12px;color:#18181b;letter-spacing:-.02em}
.lp6-hero h1 em{font-style:normal;color:#b45309}
.lp6-stars{display:inline-flex;align-items:center;gap:4px;font-size:13px;color:#71717a}
.lp6-stars svg{color:#f59e0b}
.lp6-pill{display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:12px;font-weight:600;padding:6px 14px;border-radius:8px;margin:10px 0}

/* Gallery */
.lp6-gal{position:relative;margin-bottom:20px;background:#fafafa;border-radius:16px;overflow:hidden}
.lp6-gal-main{width:100%;aspect-ratio:1;object-fit:contain;display:block}
.lp6-gal-thumbs{display:flex;gap:6px;margin-top:8px}
.lp6-gal-thumbs::-webkit-scrollbar{display:none}
.lp6-gal-thumb{width:56px;height:56px;border-radius:10px;object-fit:cover;border:2px solid #e4e4e7;cursor:pointer;flex-shrink:0;transition:.2s}
.lp6-gal-thumb.active{border-color:#18181b}
.lp6-gal-nav{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:1px solid #e4e4e7;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:.15s;color:#18181b}
.lp6-gal-nav:hover{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.1)}

/* Price */
.lp6-price{text-align:center;margin:20px 0}
.lp6-price-old{font-size:18px;color:#a1a1aa;text-decoration:line-through;margin-right:8px}
.lp6-price-now{font-size:clamp(32px,7vw,44px);font-weight:900;color:#18181b}
.lp6-price-save{display:inline-block;background:#fef2f2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px;margin-left:8px}

/* Button */
.lp6-btn{display:block;width:100%;max-width:440px;margin:0 auto;padding:16px 24px;background:#18181b;color:#fff;font-size:16px;font-weight:700;text-align:center;text-decoration:none;border:none;border-radius:12px;cursor:pointer;transition:.2s;letter-spacing:.3px}
.lp6-btn:hover{background:#27272a;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.15)}
.lp6-btn-accent{background:#b45309}
.lp6-btn-accent:hover{background:#92400e}
.lp6-btn-sub{text-align:center;font-size:12px;color:#a1a1aa;margin-top:8px}

/* Benefits */
.lp6-bens{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.lp6-bens{grid-template-columns:1fr}}
.lp6-ben{background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:20px;transition:.15s}
.lp6-ben:hover{border-color:#d4d4d8;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.lp6-ben-icon{width:36px;height:36px;border-radius:8px;background:#fef9c3;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px}
.lp6-ben-title{font-weight:700;font-size:14px;color:#18181b;margin-bottom:4px}
.lp6-ben-desc{font-size:13px;color:#71717a;line-height:1.5}

/* Before/After */
.lp6-ba{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.lp6-ba{grid-template-columns:1fr}}
.lp6-ba-card{border-radius:16px;padding:24px 20px;text-align:center}
.lp6-ba-before{background:#fef2f2;border:1px solid #fecaca}
.lp6-ba-after{background:#f0fdf4;border:1px solid #bbf7d0}

/* Steps */
.lp6-steps{display:flex;flex-direction:column;gap:10px}
.lp6-step{display:flex;align-items:center;gap:16px;padding:18px 20px;background:#fff;border:1px solid #e4e4e7;border-radius:12px}
.lp6-step-num{width:40px;height:40px;border-radius:10px;background:#18181b;color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}

/* Bundles */
.lp6-bundles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:24px 0}
@media(max-width:560px){.lp6-bundles{grid-template-columns:1fr}}
.lp6-bundle{border:2px solid #e4e4e7;border-radius:14px;padding:20px 14px;text-align:center;cursor:pointer;transition:.15s;position:relative;background:#fff}
.lp6-bundle:hover{border-color:#18181b}
.lp6-bundle-pop{border-color:#b45309;background:#fffbeb}
.lp6-bundle-tag{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#b45309;color:#fff;font-size:10px;font-weight:700;padding:3px 12px;border-radius:6px;white-space:nowrap;text-transform:uppercase;letter-spacing:.5px}
.lp6-bundle-qty{font-size:24px;font-weight:900;color:#18181b;margin:6px 0 2px}
.lp6-bundle-price{font-size:20px;font-weight:800;color:#18181b}
.lp6-bundle-unit{font-size:11px;color:#a1a1aa;margin-top:2px}
.lp6-bundle-save{display:inline-block;background:#f0fdf4;color:#15803d;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;margin-top:6px}

/* COD badge */
.lp6-cod{display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:13px;font-weight:700;padding:10px 20px;border-radius:10px;margin-top:14px}

/* Availability */
.lp6-avail{text-align:center;margin:16px 0}
.lp6-avail-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px;animation:lp6-blink 1.5s infinite}
@keyframes lp6-blink{0%,100%{opacity:1}50%{opacity:.4}}

/* Reviews */
.lp6-rev{background:#fff;border:1px solid #e4e4e7;border-radius:14px;padding:20px;margin-bottom:10px}
.lp6-rev-stars{color:#f59e0b;font-size:14px;letter-spacing:1px;margin-bottom:8px}
.lp6-rev-txt{font-size:13px;color:#3f3f46;line-height:1.7;margin-bottom:10px}
.lp6-rev-author{display:flex;align-items:center;gap:10px}
.lp6-rev-avatar{width:36px;height:36px;border-radius:50%;background:#f4f4f5;color:#71717a;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.lp6-rev-name{font-weight:600;font-size:13px;color:#18181b}
.lp6-rev-loc{font-size:11px;color:#a1a1aa}
.lp6-rev-badge{margin-left:auto;font-size:10px;color:#15803d;font-weight:600}

/* Guarantee */
.lp6-guarantee{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:32px 24px;text-align:center}

/* Trust */
.lp6-trust{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}
@media(max-width:600px){.lp6-trust{grid-template-columns:1fr 1fr}}
.lp6-trust-item{background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;padding:14px 8px;text-align:center;font-size:11px;font-weight:600;color:#3f3f46}

/* Table */
.lp6-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7}
.lp6-table th{padding:12px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
.lp6-table td{padding:10px 12px;border-top:1px solid #f4f4f5}
.lp6-table tr:nth-child(even){background:#fafafa}

/* FAQ */
.lp6-faq{margin-bottom:6px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;background:#fff}
.lp6-faq summary{padding:14px 18px;font-weight:600;font-size:14px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;color:#18181b}
.lp6-faq summary::after{content:'+';font-size:16px;color:#a1a1aa;transition:.2s}
.lp6-faq[open] summary::after{transform:rotate(45deg);color:#b45309}
.lp6-faq-a{padding:0 18px 14px;font-size:13px;color:#71717a;line-height:1.7}

/* Specs grid */
.lp6-specs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media(max-width:520px){.lp6-specs{grid-template-columns:1fr}}
.lp6-spec{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#fff;border:1px solid #e4e4e7;border-radius:10px;font-size:13px;color:#3f3f46}

/* Sticky */
.lp6-sticky{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,255,255,.95);padding:10px 16px;box-shadow:0 -2px 16px rgba(0,0,0,.08);display:none;backdrop-filter:blur(12px)}
.lp6-sticky-inner{display:flex;align-items:center;justify-content:center;gap:12px;max-width:480px;margin:0 auto}
.lp6-sticky a{flex:1;display:block;padding:12px;background:#18181b;color:#fff;font-size:14px;font-weight:700;text-align:center;text-decoration:none;border-radius:10px}
.lp6-sticky-price{font-weight:800;font-size:16px;color:#18181b;white-space:nowrap}

/* WhatsApp */
.lp6-wa{position:fixed;bottom:80px;right:16px;z-index:10000;width:52px;height:52px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,.3);text-decoration:none;transition:.15s}
.lp6-wa:hover{transform:scale(1.05)}

/* Animated slideshow (GIF effect) */
.lp6-slideshow{position:relative;width:100%;aspect-ratio:1;border-radius:14px;overflow:hidden;background:#fafafa;margin:20px 0}
.lp6-slideshow img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;opacity:0;animation:lp6-slide var(--duration) infinite}
.lp6-slideshow img:nth-child(1){animation-delay:0s}
.lp6-slideshow img:nth-child(2){animation-delay:calc(var(--duration) * 0.25)}
.lp6-slideshow img:nth-child(3){animation-delay:calc(var(--duration) * 0.5)}
.lp6-slideshow img:nth-child(4){animation-delay:calc(var(--duration) * 0.75)}
@keyframes lp6-slide{0%{opacity:0;transform:scale(1.03)}5%{opacity:1;transform:scale(1)}20%{opacity:1;transform:scale(1)}25%{opacity:0;transform:scale(.97)}100%{opacity:0}}

/* Product showcase strip */
.lp6-strip{display:flex;gap:10px;overflow:hidden;margin:20px 0;padding:10px 0}
.lp6-strip-track{display:flex;gap:10px;animation:lp6-scroll 20s linear infinite}
.lp6-strip img{width:120px;height:120px;object-fit:cover;border-radius:10px;flex-shrink:0}
@keyframes lp6-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* Fade */
.lp6-fade{opacity:0;transform:translateY(16px);transition:opacity .5s,transform .5s}
.lp6-fade.visible{opacity:1;transform:translateY(0)}
</style>`;

  // Pixels
  if (facebookPixelId) html += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${facebookPixelId}');fbq('track','PageView');</script>`;
  if (tiktokPixelId) html += `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');</script>`;

  html += `<div class="lp6">`;

  // ─── TOP BAR ───
  const shipText = countryData?.shipping || "Envío gratis";
  html += `<div class="lp6-top">${shipText} ${flag} · <b>Stock limitado</b></div>`;

  // ═══ HERO ═══
  html += `<div class="lp6-sec lp6-fade"><div class="lp6-w"><div class="lp6-hero">`;
  if (headline) {
    const h1Text = headline.replace(/[!¡]+/g, '').trim();
    html += `<h1>${h1Text}</h1>`;
  }
  if (subheadline) html += `<p style="font-size:15px;color:#71717a;margin:0 0 12px;line-height:1.6">${subheadline}</p>`;
  html += `<div class="lp6-stars"><svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg><span style="margin-left:4px">${proof}+ valoraciones</span></div>`;
  if (isCOD) html += `<div class="lp6-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Pago al recibir disponible</div>`;
  html += `</div>`;

  // Gallery
  if (imgs.length > 0) {
    html += `<div class="lp6-gal">`;
    html += `<img id="lp6-main" class="lp6-gal-main" src="${imgs[0]}" alt="${pName}" loading="eager">`;
    if (imgs.length > 1) {
      html += `<button class="lp6-gal-nav" style="left:8px" onclick="lp6G(-1)">&#8249;</button>`;
      html += `<button class="lp6-gal-nav" style="right:8px" onclick="lp6G(1)">&#8250;</button>`;
      html += `<div class="lp6-gal-thumbs">`;
      imgs.forEach((img, i) => { html += `<img class="lp6-gal-thumb${i === 0 ? ' active' : ''}" src="${img}" alt="${i+1}" onclick="lp6S(${i})" loading="lazy">`; });
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Video
  if (videoUrl) {
    let embedUrl = videoUrl;
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    html += `<div style="position:relative;width:100%;padding-bottom:56.25%;border-radius:12px;overflow:hidden;background:#000;margin-bottom:20px"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div>`;
  }

  // Price + CTA
  html += `<div class="lp6-price">`;
  if (dc) html += `<span class="lp6-price-old">${dc}</span>`;
  html += `<span class="lp6-price-now">${dp}</span>`;
  if (dc && dp) {
    const discount = Math.round((1 - basePrice / (parseFloat(comparePrice) || basePrice * 2)) * 100);
    if (discount > 0) html += `<span class="lp6-price-save">-${discount}%</span>`;
  }
  html += `</div>`;
  html += `<a href="#shopify-product-form" class="lp6-btn lp6-btn-accent">${ctaMain}</a>`;
  html += `<p class="lp6-btn-sub">${ctaSub}</p>`;
  if (isCOD) html += `<div style="text-align:center"><div class="lp6-cod"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>Paga al recibir en tu puerta</div></div>`;
  html += `</div></div>`;

  // ═══ PROBLEMA / SOLUCION ═══
  if (problemSolution || description) {
    html += `<div class="lp6-sec-alt lp6-fade"><div class="lp6-w">`;
    if (problemSolution) {
      html += `<div style="max-width:560px;margin:0 auto">`;
      html += `<p style="font-size:15px;color:#3f3f46;line-height:1.8;margin-bottom:16px">${problemSolution.problem || ''}</p>`;
      html += `<p style="font-size:15px;color:#3f3f46;line-height:1.8;margin-bottom:16px">${problemSolution.agitation || ''}</p>`;
      html += `<p style="font-size:15px;color:#18181b;line-height:1.8;font-weight:600">${problemSolution.solution || ''}</p>`;
      html += `</div>`;
    } else if (description) {
      html += `<div style="font-size:15px;color:#3f3f46;line-height:1.8;max-width:560px;margin:0 auto">${description}</div>`;
    }
    html += `</div></div>`;
  }

  // ═══ BENEFICIOS ═══
  if (bulletPoints?.length > 0) {
    const icons = ['✦', '◆', '●', '▸', '◉', '★'];
    html += `<div class="lp6-sec lp6-fade"><div class="lp6-w">`;
    html += `<div style="text-align:center"><span class="lp6-label">Beneficios</span></div>`;
    html += `<h2 class="lp6-h2">Por qué elegir <em>${pName.split(' ').slice(0,3).join(' ')}</em></h2>`;
    html += `<p class="lp6-sub">Lo que lo hace diferente</p>`;
    html += `<div class="lp6-bens">`;
    bulletPoints.forEach((bp, i) => {
      const cleanBp = bp.replace(/^[✅✓•\-\d.]+\s*/g, '').replace(/<\/?strong>/g, '');
      const parts = cleanBp.split(/\s*[—–-]\s*/);
      const title = parts[0]?.trim() || cleanBp.slice(0, 40);
      const desc = parts[1]?.trim() || '';
      html += `<div class="lp6-ben"><div class="lp6-ben-icon">${icons[i % icons.length]}</div><div class="lp6-ben-title">${title}</div>${desc ? `<div class="lp6-ben-desc">${desc}</div>` : ''}</div>`;
    });
    html += `</div></div></div>`;
  }

  // ═══ SLIDESHOW ANIMADO (efecto GIF) ═══
  if (imgs.length >= 2) {
    html += `<div class="lp6-sec-alt lp6-fade"><div class="lp6-w">`;
    html += `<div style="text-align:center"><span class="lp6-label">En acción</span></div>`;
    html += `<h2 class="lp6-h2">Mira el <em>producto</em></h2>`;
    html += `<p class="lp6-sub">Diseñado para resultados reales</p>`;
    const slideDuration = imgs.length * 3; // 3 seg por imagen
    html += `<div class="lp6-slideshow" style="--duration:${slideDuration}s">`;
    imgs.slice(0, 4).forEach((img, i) => { html += `<img src="${img}" alt="${pName} - vista ${i+1}" loading="lazy">`; });
    html += `</div>`;
    html += `</div></div>`;
  }

  // ═══ ANTES / DESPUÉS ═══
  if (beforeAfter || problemSolution) {
    html += `<div class="lp6-sec-alt lp6-fade"><div class="lp6-w">`;
    html += `<div style="text-align:center"><span class="lp6-label">Resultados</span></div>`;
    html += `<h2 class="lp6-h2">Antes vs <em>Después</em></h2>`;
    const bef = beforeAfter?.before || problemSolution?.problem || "";
    const aft = beforeAfter?.after || problemSolution?.solution || "";
    if (bef && aft) {
      html += `<div class="lp6-ba">`;
      html += `<div class="lp6-ba-card lp6-ba-before"><div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Antes</div><div style="font-size:14px;color:#7f1d1d;line-height:1.6">${bef}</div></div>`;
      html += `<div class="lp6-ba-card lp6-ba-after"><div style="font-size:13px;font-weight:700;color:#15803d;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Después</div><div style="font-size:14px;color:#14532d;line-height:1.6">${aft}</div></div>`;
      html += `</div>`;
    }
    html += `</div></div>`;
  }

  // ═══ PASOS ═══
  const steps = processSteps || [
    { title: "Realiza tu pedido", desc: "Selecciona tu paquete y completa el formulario" },
    { title: "Recibe en tu puerta", desc: `Llega en 3-7 días con ${shipText.toLowerCase()}` },
    { title: "Disfruta los resultados", desc: "Nota la diferencia desde la primera semana" },
  ];
  html += `<div class="lp6-sec lp6-fade"><div class="lp6-w">`;
  html += `<div style="text-align:center"><span class="lp6-label">Cómo funciona</span></div>`;
  html += `<h2 class="lp6-h2">3 pasos <em>simples</em></h2>`;
  html += `<p class="lp6-sub">Así de fácil</p>`;
  html += `<div class="lp6-steps">`;
  steps.forEach((s, i) => { html += `<div class="lp6-step"><div class="lp6-step-num">${i+1}</div><div><div style="font-weight:700;font-size:14px;color:#18181b">${s.title}</div><div style="font-size:13px;color:#71717a">${s.desc}</div></div></div>`; });
  html += `</div></div></div>`;

  // ═══ BUNDLES ═══
  html += `<div class="lp6-sec-alt lp6-fade"><div class="lp6-w">`;
  html += `<div style="text-align:center"><span class="lp6-label">Ofertas</span></div>`;
  html += `<h2 class="lp6-h2">Elige tu <em>paquete</em></h2>`;
  html += `<p class="lp6-sub">Más compras, más ahorras</p>`;
  html += `<div class="lp6-bundles">`;
  html += `<div class="lp6-bundle" onclick="location.href='#shopify-product-form'"><div class="lp6-bundle-qty">1x</div><div style="font-size:11px;color:#71717a;margin-bottom:6px">${pName.slice(0,30)}</div><div class="lp6-bundle-price">${dp}</div></div>`;
  html += `<div class="lp6-bundle lp6-bundle-pop" onclick="location.href='#shopify-product-form'"><div class="lp6-bundle-tag">Más vendido</div><div class="lp6-bundle-qty">2x</div><div style="font-size:11px;color:#71717a;margin-bottom:6px">${pName.slice(0,30)}</div><div class="lp6-bundle-price">${bundle2Price}</div><div class="lp6-bundle-unit">${unitPrice2} c/u</div><div class="lp6-bundle-save">Ahorras ${save2}%</div></div>`;
  html += `<div class="lp6-bundle" onclick="location.href='#shopify-product-form'"><div class="lp6-bundle-qty">3x</div><div style="font-size:11px;color:#71717a;margin-bottom:6px">${pName.slice(0,30)}</div><div class="lp6-bundle-price">${bundle3Price}</div><div class="lp6-bundle-unit">${unitPrice3} c/u</div><div class="lp6-bundle-save">Ahorras ${save3}%</div></div>`;
  html += `</div>`;

  // Availability
  html += `<div class="lp6-avail"><span class="lp6-avail-dot"></span><span style="font-size:13px;color:#3f3f46;font-weight:600">${stock} unidades disponibles</span></div>`;

  // CTA
  html += `<a href="#shopify-product-form" class="lp6-btn">${ctaMain}</a>`;
  html += `<p class="lp6-btn-sub">${ctaSub}</p>`;
  html += `</div></div>`;

  // ═══ SPECS + TABLE ═══
  if (features?.length > 0 || compareTable?.length > 0) {
    html += `<div class="lp6-sec lp6-fade"><div class="lp6-w">`;
    html += `<div style="text-align:center"><span class="lp6-label">Especificaciones</span></div>`;
    html += `<h2 class="lp6-h2">Detalles del <em>producto</em></h2>`;
    if (features?.length > 0) {
      html += `<div class="lp6-specs">`;
      features.forEach(f => { html += `<div class="lp6-spec"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${f}</div>`; });
      html += `</div>`;
    }
    if (compareTable?.length > 0) {
      html += `<div style="margin-top:20px;overflow-x:auto;border-radius:12px"><table class="lp6-table"><thead><tr><th style="text-align:left;background:#18181b;color:#fff">Característica</th><th style="text-align:center;background:#b45309;color:#fff">${pName.split(' ').slice(0,2).join(' ')}</th><th style="text-align:center;background:#f4f4f5;color:#71717a">Otros</th></tr></thead><tbody>`;
      compareTable.forEach(row => { html += `<tr><td style="font-weight:600">${row.feature}</td><td style="text-align:center;color:#15803d;font-weight:600">${row.ours}</td><td style="text-align:center;color:#a1a1aa">${row.theirs}</td></tr>`; });
      html += `</tbody></table></div>`;
    }
    html += `</div></div>`;
  }

  // ═══ IMAGE STRIP (scroll infinito) ═══
  if (imgs.length >= 2) {
    html += `<div style="overflow:hidden;padding:16px 0;background:#fafafa">`;
    html += `<div class="lp6-strip-track">`;
    // Duplicar imágenes para efecto scroll infinito
    const stripImgs = [...imgs, ...imgs, ...imgs];
    stripImgs.forEach((img, i) => { html += `<img src="${img}" alt="${pName}" loading="lazy">`; });
    html += `</div></div>`;
  }

  // ═══ REVIEWS ═══
  html += `<div class="lp6-sec-alt lp6-fade"><div class="lp6-w">`;
  html += `<div style="text-align:center"><span class="lp6-label">Reseñas</span></div>`;
  html += `<h2 class="lp6-h2">Lo que dicen nuestros <em>clientes</em></h2>`;
  const revs = testimonials?.length > 0 ? testimonials : [{ name: "Cliente", text: "Excelente producto, muy recomendado.", rating: 5 }];
  revs.forEach(t => {
    const init = (t.name || "C")[0].toUpperCase();
    const stars = t.rating || 5;
    html += `<div class="lp6-rev"><div class="lp6-rev-stars">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</div><div class="lp6-rev-txt">${t.text}</div><div class="lp6-rev-author"><div class="lp6-rev-avatar">${init}</div><div><div class="lp6-rev-name">${t.name}</div>${t.city ? `<div class="lp6-rev-loc">${flag} ${t.city}</div>` : ''}</div><span class="lp6-rev-badge">Compra verificada</span></div></div>`;
  });
  html += `</div></div>`;

  // ═══ GUARANTEE + TRUST ═══
  html += `<div class="lp6-sec lp6-fade"><div class="lp6-w">`;
  html += `<div class="lp6-guarantee"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="1.5" style="margin-bottom:10px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" stroke-width="2"/></svg><h3 style="font-size:20px;font-weight:800;margin:0 0 6px;color:#18181b">Garantía de satisfacción — 30 días</h3><p style="font-size:13px;color:#3f3f46;margin:0;line-height:1.7;max-width:440px;display:inline-block">${guaranteeText || 'Si no estás satisfecho, te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones.'}</p></div>`;
  const badges = trustBadges || ["Pago seguro", "Envío protegido", "Soporte dedicado", "Compra verificada"];
  html += `<div class="lp6-trust">`;
  badges.forEach(b => { html += `<div class="lp6-trust-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" style="margin-bottom:4px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><br>${b}</div>`; });
  html += `</div>`;
  if (countryData?.paymentMethods) html += `<p style="text-align:center;font-size:12px;color:#71717a;margin:14px 0 0">${countryData.paymentMethods}</p>`;
  html += `</div></div>`;

  // ═══ FAQ ═══
  if (faq?.length > 0) {
    html += `<div class="lp6-sec-alt lp6-fade"><div class="lp6-w">`;
    html += `<div style="text-align:center"><span class="lp6-label">Preguntas frecuentes</span></div>`;
    html += `<h2 class="lp6-h2">¿Tienes <em>dudas</em>?</h2>`;
    faq.forEach(item => { html += `<details class="lp6-faq"><summary>${item.q}</summary><div class="lp6-faq-a">${item.a}</div></details>`; });
    html += `</div></div>`;
  }

  // ═══ CTA FINAL ═══
  html += `<div class="lp6-sec-dark lp6-fade"><div class="lp6-w" style="text-align:center">`;
  html += `<h2 style="font-size:clamp(22px,5vw,30px);font-weight:800;color:#fff;margin:0 0 6px">No dejes pasar esta oportunidad</h2>`;
  html += `<p style="font-size:13px;color:rgba(255,255,255,.5);margin:0 0 20px">Disponibilidad limitada</p>`;
  if (dc && dp) html += `<div style="margin-bottom:16px"><span style="font-size:16px;color:rgba(255,255,255,.4);text-decoration:line-through;margin-right:8px">${dc}</span><span style="font-size:clamp(28px,6vw,40px);font-weight:900;color:#fbbf24">${dp}</span></div>`;
  html += `<a href="#shopify-product-form" class="lp6-btn" style="max-width:380px;background:#b45309">${ctaMain}</a>`;
  html += `<p class="lp6-btn-sub" style="color:rgba(255,255,255,.3)">${ctaSub}</p>`;
  html += `</div></div>`;

  // ─── WHATSAPP ───
  if (whatsappNumber) {
    const waMsg = encodeURIComponent(`Hola, me interesa ${pName}`);
    html += `<a id="lp6-wa" class="lp6-wa" href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${waMsg}" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>`;
  }

  // ─── STICKY ───
  html += `<div id="lp6-sticky" class="lp6-sticky"><div class="lp6-sticky-inner"><span class="lp6-sticky-price">${dp}</span><a href="#shopify-product-form">${isCOD ? 'Pedir ahora' : 'Comprar ahora'}</a></div></div>`;

  // ─── JS ───
  html += `<script>(function(){`;
  // Gallery
  if (imgs.length > 1) {
    html += `var ii=${JSON.stringify(imgs)},ci=0;window.lp6S=function(i){ci=i;document.getElementById("lp6-main").src=ii[i];document.querySelectorAll(".lp6-gal-thumb").forEach(function(t,j){t.classList.toggle("active",j===i)})};window.lp6G=function(d){ci=(ci+d+ii.length)%ii.length;lp6S(ci)};var g=document.querySelector(".lp6-gal"),sx=0;if(g){g.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});g.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){dx<0?lp6G(1):lp6G(-1)}},{passive:true})}`;
  }
  // Sticky
  html += `var st=document.getElementById("lp6-sticky");if(st){window.addEventListener("scroll",function(){st.style.display=window.scrollY>500?"block":"none";var wa=document.getElementById("lp6-wa");if(wa)wa.style.bottom=window.scrollY>500?"72px":"16px"})}`;
  // Fade
  html += `if("IntersectionObserver"in window){var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}})},{threshold:.1});document.querySelectorAll(".lp6-fade").forEach(function(el){obs.observe(el)})}else{document.querySelectorAll(".lp6-fade").forEach(function(el){el.classList.add("visible")})}`;

  html += `})();</script></div>`;
  return html;
}
