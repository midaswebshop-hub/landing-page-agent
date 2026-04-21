// lib/landing_html_v7.js
// ============================================================
// BUILDER HTML v7 — Magazine Article + Conversion Hybrid
// Merge of Kily's high-converting manual style with v6 data-rich
// conversion elements. Article-style "razones" with branded
// feature names, inline testimonials, full-width product images,
// plus bundles, FAQ accordion, comparison table, sticky CTA.
// ============================================================

export function buildLandingHTML_v7(landingData) {
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
  const proof = socialProofCount || "3,147";
  const stock = Math.floor(Math.random() * 12) + 5;
  const imgs = images?.length > 0 ? images : [];
  const pName = productName || headline || "Producto";
  const shipText = countryData?.shipping || "Envío gratis";

  // Bundle prices
  const basePrice = parseFloat(price) || 29.99;
  const bundle2Raw = basePrice * 1.8;
  const bundle3Raw = basePrice * 2.4;
  const save2 = Math.round((1 - 1.8 / 2) * 100);
  const save3 = Math.round((1 - 2.4 / 3) * 100);

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

  // Discount percentage
  const discount = dc && dp ? Math.round((1 - basePrice / (parseFloat(comparePrice) || basePrice * 2)) * 100) : 0;

  // Build razones from bulletPoints + testimonials
  const razones = (bulletPoints || []).slice(0, 5).map((bp, i) => {
    const clean = bp.replace(/^[✅✓•\-\d.]+\s*/g, '').replace(/<\/?strong>/g, '');
    const parts = clean.split(/\s*[—–:\-]\s*/);
    const title = parts[0]?.trim() || clean.slice(0, 50);
    const desc = parts.slice(1).join(' — ').trim() || '';
    const test = testimonials?.[i] || null;
    return { title, desc, testimonial: test };
  });

  // Short product name for headings
  const shortName = pName.split(' ').slice(0, 3).join(' ');

  // Branded feature names to make copy sound premium
  const brandedFeatures = [
    'Tecnología AdaptCore™', 'Sistema FlexGuard™', 'Diseño ErgoFit™',
    'Membrana AirFlow Pro™', 'Estructura DuraFlex™'
  ];

  // ── CSS ──────────────────────────────────────────────────────
  let html = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
.lp7{font-family:'Inter',system-ui,-apple-system,sans-serif;color:#18181b;line-height:1.8;overflow-x:hidden;-webkit-font-smoothing:antialiased;background:#fff}
.lp7-w{max-width:720px;margin:0 auto;padding:0 20px}

/* Top bar */
.lp7-top{background:#18181b;color:#fff;text-align:center;padding:10px 16px;font-size:12px;font-weight:600;letter-spacing:.5px}
.lp7-top b{color:#fbbf24}

/* Sections */
.lp7-sec{padding:52px 0}
.lp7-sec-alt{padding:52px 0;background:#fafaf9}
.lp7-sec-dark{padding:60px 0;background:#18181b;color:#fff}
.lp7-label{display:inline-block;font-size:10px;font-weight:700;color:#92400e;background:#fef3c7;padding:4px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:1.8px;margin-bottom:14px}
.lp7-h2{font-size:clamp(24px,5.5vw,32px);font-weight:800;line-height:1.2;margin:0 0 8px;text-align:center;color:#18181b}
.lp7-h2 em{font-style:normal;color:#b45309}
.lp7-sub{font-size:15px;color:#71717a;text-align:center;margin:0 0 32px;line-height:1.7}

/* Hero */
.lp7-hero{text-align:center;padding:40px 0 20px}
.lp7-hero h1{font-size:clamp(28px,7vw,42px);font-weight:900;line-height:1.12;margin:0 0 14px;color:#18181b;letter-spacing:-.03em}
.lp7-hero h1 em{font-style:normal;color:#b45309}
.lp7-hero-sub{font-size:16px;color:#52525b;margin:0 0 16px;line-height:1.7;max-width:560px;display:inline-block}
.lp7-stars{display:inline-flex;align-items:center;gap:4px;font-size:13px;color:#71717a}
.lp7-stars svg{color:#f59e0b}
.lp7-pill{display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:12px;font-weight:600;padding:6px 14px;border-radius:8px;margin:12px 0}
.lp7-proof{font-size:13px;color:#71717a;margin-top:6px}
.lp7-proof b{color:#18181b;font-weight:700}

/* Gallery */
.lp7-gal{position:relative;margin-bottom:24px;background:#fafaf9;border-radius:16px;overflow:hidden}
.lp7-gal-main{width:100%;aspect-ratio:1;object-fit:contain;display:block}
.lp7-gal-thumbs{display:flex;gap:8px;padding:8px 12px}
.lp7-gal-thumbs::-webkit-scrollbar{display:none}
.lp7-gal-thumb{width:60px;height:60px;border-radius:10px;object-fit:cover;border:2px solid transparent;cursor:pointer;flex-shrink:0;transition:.2s}
.lp7-gal-thumb.active{border-color:#b45309}
.lp7-gal-nav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.92);border:1px solid #e4e4e7;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:.15s;color:#18181b;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.lp7-gal-nav:hover{background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.1)}

/* Price block */
.lp7-price{text-align:center;margin:24px 0 16px}
.lp7-price-old{font-size:18px;color:#a1a1aa;text-decoration:line-through;margin-right:8px}
.lp7-price-now{font-size:clamp(34px,8vw,48px);font-weight:900;color:#18181b}
.lp7-price-save{display:inline-block;background:#fef2f2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px;margin-left:8px;vertical-align:middle}

/* Buttons */
.lp7-btn{display:block;width:100%;max-width:460px;margin:0 auto;padding:18px 24px;background:#18181b;color:#fff;font-size:17px;font-weight:700;text-align:center;text-decoration:none;border:none;border-radius:14px;cursor:pointer;transition:.2s;letter-spacing:.3px}
.lp7-btn:hover{background:#27272a;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.12)}
.lp7-btn-accent{background:#b45309}
.lp7-btn-accent:hover{background:#92400e}
.lp7-btn-sub{text-align:center;font-size:12px;color:#a1a1aa;margin-top:8px}

/* COD badge */
.lp7-cod{display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:13px;font-weight:700;padding:10px 20px;border-radius:10px;margin-top:16px}

/* ── Article / Razones ── */
.lp7-article-intro{font-size:clamp(22px,5vw,30px);font-weight:800;line-height:1.3;text-align:center;color:#18181b;margin:0 0 12px}
.lp7-article-intro em{font-style:normal;color:#b45309}
.lp7-article-lead{font-size:17px;color:#52525b;line-height:1.8;text-align:center;max-width:620px;margin:0 auto 40px}
.lp7-razon{margin-bottom:48px}
.lp7-razon-num{font-size:12px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.lp7-razon h3{font-size:clamp(20px,4.5vw,26px);font-weight:800;line-height:1.3;margin:0 0 16px;color:#18181b}
.lp7-razon h3 span{color:#b45309}
.lp7-razon p{font-size:16px;color:#3f3f46;line-height:1.85;margin:0 0 16px}
.lp7-razon-img{width:100%;border-radius:14px;margin:20px 0;display:block}
.lp7-quote{border-left:3px solid #b45309;padding:16px 0 16px 24px;margin:24px 0;background:#fffbeb;border-radius:0 12px 12px 0}
.lp7-quote p{font-size:15px;font-style:italic;color:#44403c;line-height:1.7;margin:0 0 8px}
.lp7-quote cite{font-size:13px;font-style:normal;color:#92400e;font-weight:600}

/* Before/After */
.lp7-ba{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:520px){.lp7-ba{grid-template-columns:1fr}}
.lp7-ba-card{border-radius:16px;padding:28px 24px;text-align:center}
.lp7-ba-before{background:#fef2f2;border:1px solid #fecaca}
.lp7-ba-after{background:#f0fdf4;border:1px solid #bbf7d0}
.lp7-ba-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px}
.lp7-ba-text{font-size:15px;line-height:1.7}

/* Bundles */
.lp7-bundles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:28px 0}
@media(max-width:560px){.lp7-bundles{grid-template-columns:1fr}}
.lp7-bundle{border:2px solid #e4e4e7;border-radius:16px;padding:24px 16px;text-align:center;cursor:pointer;transition:.2s;position:relative;background:#fff}
.lp7-bundle:hover{border-color:#18181b;box-shadow:0 4px 16px rgba(0,0,0,.06)}
.lp7-bundle-pop{border-color:#b45309;background:#fffbeb}
.lp7-bundle-tag{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:#b45309;color:#fff;font-size:10px;font-weight:700;padding:4px 14px;border-radius:20px;white-space:nowrap;text-transform:uppercase;letter-spacing:.8px}
.lp7-bundle-qty{font-size:28px;font-weight:900;color:#18181b;margin:8px 0 4px}
.lp7-bundle-price{font-size:22px;font-weight:800;color:#18181b}
.lp7-bundle-unit{font-size:12px;color:#a1a1aa;margin-top:4px}
.lp7-bundle-save{display:inline-block;background:#f0fdf4;color:#15803d;font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px;margin-top:8px}

/* Comparison table */
.lp7-table{width:100%;border-collapse:separate;border-spacing:0;font-size:14px;border-radius:14px;overflow:hidden;border:1px solid #e4e4e7}
.lp7-table th{padding:14px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.8px}
.lp7-table td{padding:12px 14px;border-top:1px solid #f4f4f5}
.lp7-table tr:nth-child(even){background:#fafaf9}

/* Reviews */
.lp7-rev{background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:24px;margin-bottom:12px}
.lp7-rev-stars{color:#f59e0b;font-size:15px;letter-spacing:1px;margin-bottom:10px}
.lp7-rev-txt{font-size:14px;color:#3f3f46;line-height:1.8;margin-bottom:12px}
.lp7-rev-author{display:flex;align-items:center;gap:10px}
.lp7-rev-avatar{width:38px;height:38px;border-radius:50%;background:#fef3c7;color:#92400e;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0}
.lp7-rev-name{font-weight:600;font-size:13px;color:#18181b}
.lp7-rev-loc{font-size:11px;color:#a1a1aa}
.lp7-rev-badge{margin-left:auto;font-size:10px;color:#15803d;font-weight:600;background:#f0fdf4;padding:3px 8px;border-radius:6px}

/* Guarantee */
.lp7-guarantee{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:36px 28px;text-align:center}

/* Trust badges */
.lp7-trust{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px}
@media(max-width:600px){.lp7-trust{grid-template-columns:1fr 1fr}}
.lp7-trust-item{background:#fafaf9;border:1px solid #e4e4e7;border-radius:12px;padding:16px 10px;text-align:center;font-size:12px;font-weight:600;color:#3f3f46}
.lp7-trust-item svg{display:block;margin:0 auto 6px}

/* FAQ */
.lp7-faq{margin-bottom:8px;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;background:#fff}
.lp7-faq summary{padding:16px 20px;font-weight:600;font-size:15px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;color:#18181b;line-height:1.4}
.lp7-faq summary::after{content:'+';font-size:18px;color:#a1a1aa;transition:.2s;flex-shrink:0;margin-left:12px}
.lp7-faq[open] summary::after{transform:rotate(45deg);color:#b45309}
.lp7-faq-a{padding:0 20px 16px;font-size:14px;color:#71717a;line-height:1.8}

/* Availability */
.lp7-avail{text-align:center;margin:18px 0}
.lp7-avail-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:6px;animation:lp7-blink 1.5s infinite}
@keyframes lp7-blink{0%,100%{opacity:1}50%{opacity:.4}}

/* Sticky */
.lp7-sticky{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,255,255,.96);padding:12px 16px;box-shadow:0 -2px 20px rgba(0,0,0,.08);display:none;backdrop-filter:blur(12px);border-top:1px solid #f4f4f5}
.lp7-sticky-inner{display:flex;align-items:center;justify-content:center;gap:14px;max-width:480px;margin:0 auto}
.lp7-sticky a{flex:1;display:block;padding:13px;background:#b45309;color:#fff;font-size:14px;font-weight:700;text-align:center;text-decoration:none;border-radius:12px;transition:.15s}
.lp7-sticky a:hover{background:#92400e}
.lp7-sticky-price{font-weight:800;font-size:17px;color:#18181b;white-space:nowrap}

/* WhatsApp */
.lp7-wa{position:fixed;bottom:16px;right:16px;z-index:10000;width:54px;height:54px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,.35);text-decoration:none;transition:.2s}
.lp7-wa:hover{transform:scale(1.08)}

/* Fade animation */
.lp7-fade{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}
.lp7-fade.visible{opacity:1;transform:translateY(0)}

/* Divider */
.lp7-divider{width:60px;height:3px;background:#fbbf24;border-radius:2px;margin:0 auto 32px}
</style>`;

  // ── Pixels ──
  if (facebookPixelId) html += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${facebookPixelId}');fbq('track','PageView');</script>`;
  if (tiktokPixelId) html += `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');</script>`;

  html += `<div class="lp7">`;

  // ═══ 1. TOP BAR ═══
  html += `<div class="lp7-top">${flag} ${shipText} · <b>Solo ${stock} unidades disponibles</b></div>`;

  // ═══ 2. HERO ═══
  html += `<div class="lp7-sec lp7-fade"><div class="lp7-w"><div class="lp7-hero">`;
  if (headline) {
    const h1Text = headline.replace(/[!¡]+/g, '').trim();
    html += `<h1>${h1Text}</h1>`;
  }
  if (subheadline) html += `<p class="lp7-hero-sub">${subheadline}</p>`;
  // Stars
  const starSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>';
  html += `<div class="lp7-stars">${starSvg.repeat(5)}<span style="margin-left:6px">4.8/5</span></div>`;
  html += `<p class="lp7-proof"><b>${proof}+</b> clientes satisfechos</p>`;
  if (isCOD) html += `<div class="lp7-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Pago al recibir disponible</div>`;
  html += `</div>`;

  // ═══ 3. GALLERY ═══
  if (imgs.length > 0) {
    html += `<div class="lp7-gal">`;
    html += `<img id="lp7-main" class="lp7-gal-main" src="${imgs[0]}" alt="${pName}" loading="eager">`;
    if (imgs.length > 1) {
      html += `<button class="lp7-gal-nav" style="left:10px" onclick="lp7G(-1)" aria-label="Anterior">&#8249;</button>`;
      html += `<button class="lp7-gal-nav" style="right:10px" onclick="lp7G(1)" aria-label="Siguiente">&#8250;</button>`;
      html += `<div class="lp7-gal-thumbs">`;
      imgs.forEach((img, i) => { html += `<img class="lp7-gal-thumb${i === 0 ? ' active' : ''}" src="${img}" alt="Vista ${i + 1}" onclick="lp7S(${i})" loading="lazy">`; });
      html += `</div>`;
    }
    html += `</div>`;
  }

  // ═══ 4. PRICE + CTA ═══
  html += `<div class="lp7-price">`;
  if (dc) html += `<span class="lp7-price-old">${dc}</span>`;
  html += `<span class="lp7-price-now">${dp}</span>`;
  if (discount > 0) html += `<span class="lp7-price-save">-${discount}%</span>`;
  html += `</div>`;
  html += `<a href="#shopify-product-form" class="lp7-btn lp7-btn-accent">${ctaMain}</a>`;
  html += `<p class="lp7-btn-sub">${ctaSub}</p>`;
  if (isCOD) html += `<div style="text-align:center"><div class="lp7-cod"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>Paga al recibir en tu puerta</div></div>`;
  html += `</div></div>`;

  // ═══ 5. ARTICLE INTRO ═══
  const razonCount = razones.length || 5;
  html += `<div class="lp7-sec lp7-fade"><div class="lp7-w">`;
  html += `<div class="lp7-divider"></div>`;
  html += `<p class="lp7-article-intro">${razonCount} razones por las que <em>${shortName}</em> está cambiando las reglas del juego</p>`;
  const introText = problemSolution?.problem || description || `Descubre por qué miles de personas están eligiendo ${pName} como su solución definitiva.`;
  html += `<p class="lp7-article-lead">${introText}</p>`;
  html += `</div></div>`;

  // ═══ 6-10. RAZONES (article-style) ═══
  razones.forEach((r, i) => {
    const isAlt = i % 2 !== 0;
    html += `<div class="${isAlt ? 'lp7-sec-alt' : 'lp7-sec'} lp7-fade"><div class="lp7-w">`;
    html += `<div class="lp7-razon">`;
    html += `<div class="lp7-razon-num">Razón ${i + 1}</div>`;
    html += `<h3>${r.title} <span>con ${brandedFeatures[i] || 'tecnología avanzada'}</span></h3>`;

    // Problem paragraph
    if (r.desc) {
      html += `<p>${r.desc}</p>`;
    }

    // Solution paragraph — expand on the benefit
    html += `<p>Gracias a ${brandedFeatures[i] || 'su diseño innovador'}, ${pName} ofrece una experiencia completamente diferente. No se trata solo de una mejora incremental — es un cambio real que notarás desde el primer uso.</p>`;

    // Product image between razones (cycle through available images)
    if (imgs.length > 0) {
      const imgIdx = i % imgs.length;
      html += `<img class="lp7-razon-img" src="${imgs[imgIdx]}" alt="${pName} - ${r.title}" loading="lazy">`;
    }

    // Inline testimonial quote
    if (r.testimonial) {
      html += `<div class="lp7-quote">`;
      html += `<p>"${r.testimonial.text}"</p>`;
      html += `<cite>— ${r.testimonial.name}${r.testimonial.city ? `, ${r.testimonial.city}` : ''} ${flag}</cite>`;
      html += `</div>`;
    }

    html += `</div></div></div>`;
  });

  // Mid-article CTA
  html += `<div class="lp7-sec lp7-fade"><div class="lp7-w" style="text-align:center">`;
  html += `<p style="font-size:15px;color:#71717a;margin-bottom:16px">Compra segura con garantía de 30 días</p>`;
  html += `<a href="#shopify-product-form" class="lp7-btn lp7-btn-accent">${ctaMain}</a>`;
  html += `<p class="lp7-btn-sub">${ctaSub}</p>`;
  html += `</div></div>`;

  // ═══ 11. BEFORE / AFTER ═══
  if (beforeAfter || problemSolution) {
    const bef = beforeAfter?.before || problemSolution?.problem || "";
    const aft = beforeAfter?.after || problemSolution?.solution || "";
    if (bef && aft) {
      html += `<div class="lp7-sec-alt lp7-fade"><div class="lp7-w">`;
      html += `<div style="text-align:center"><span class="lp7-label">Resultados</span></div>`;
      html += `<h2 class="lp7-h2">Antes vs <em>Después</em></h2>`;
      html += `<p class="lp7-sub">La diferencia es real</p>`;
      html += `<div class="lp7-ba">`;
      html += `<div class="lp7-ba-card lp7-ba-before"><div class="lp7-ba-label" style="color:#dc2626">Antes</div><div class="lp7-ba-text" style="color:#7f1d1d">${bef}</div></div>`;
      html += `<div class="lp7-ba-card lp7-ba-after"><div class="lp7-ba-label" style="color:#15803d">Después</div><div class="lp7-ba-text" style="color:#14532d">${aft}</div></div>`;
      html += `</div></div></div>`;
    }
  }

  // ═══ 12. BUNDLES ═══
  html += `<div class="lp7-sec lp7-fade"><div class="lp7-w">`;
  html += `<div style="text-align:center"><span class="lp7-label">Ofertas especiales</span></div>`;
  html += `<h2 class="lp7-h2">Elige tu <em>paquete ideal</em></h2>`;
  html += `<p class="lp7-sub">Más compras, más ahorras</p>`;
  html += `<div class="lp7-bundles">`;
  // 1x
  html += `<div class="lp7-bundle" onclick="location.href='#shopify-product-form'"><div class="lp7-bundle-qty">1x</div><div style="font-size:12px;color:#71717a;margin-bottom:8px">${pName.slice(0, 30)}</div><div class="lp7-bundle-price">${dp}</div></div>`;
  // 2x popular
  html += `<div class="lp7-bundle lp7-bundle-pop" onclick="location.href='#shopify-product-form'"><div class="lp7-bundle-tag">Más vendido</div><div class="lp7-bundle-qty">2x</div><div style="font-size:12px;color:#71717a;margin-bottom:8px">${pName.slice(0, 30)}</div><div class="lp7-bundle-price">${bundle2Price}</div><div class="lp7-bundle-unit">${unitPrice2} c/u</div><div class="lp7-bundle-save">Ahorras ${save2}%</div></div>`;
  // 3x
  html += `<div class="lp7-bundle" onclick="location.href='#shopify-product-form'"><div class="lp7-bundle-qty">3x</div><div style="font-size:12px;color:#71717a;margin-bottom:8px">${pName.slice(0, 30)}</div><div class="lp7-bundle-price">${bundle3Price}</div><div class="lp7-bundle-unit">${unitPrice3} c/u</div><div class="lp7-bundle-save">Ahorras ${save3}%</div></div>`;
  html += `</div>`;
  // Availability
  html += `<div class="lp7-avail"><span class="lp7-avail-dot"></span><span style="font-size:13px;color:#3f3f46;font-weight:600">${stock} unidades disponibles — se agotan rápido</span></div>`;
  html += `</div></div>`;

  // ═══ 13. COMPARISON TABLE ═══
  if (compareTable?.length > 0) {
    html += `<div class="lp7-sec-alt lp7-fade"><div class="lp7-w">`;
    html += `<div style="text-align:center"><span class="lp7-label">Comparativa</span></div>`;
    html += `<h2 class="lp7-h2">Nosotros vs <em>la competencia</em></h2>`;
    html += `<p class="lp7-sub">Los detalles importan</p>`;
    html += `<div style="overflow-x:auto;border-radius:14px"><table class="lp7-table"><thead><tr><th style="text-align:left;background:#18181b;color:#fff">Característica</th><th style="text-align:center;background:#b45309;color:#fff">${shortName}</th><th style="text-align:center;background:#f4f4f5;color:#71717a">Otros</th></tr></thead><tbody>`;
    compareTable.forEach(row => {
      html += `<tr><td style="font-weight:600">${row.feature}</td><td style="text-align:center;color:#15803d;font-weight:700">${row.ours}</td><td style="text-align:center;color:#a1a1aa">${row.theirs}</td></tr>`;
    });
    html += `</tbody></table></div></div></div>`;
  }

  // ═══ 14. REVIEWS ═══
  html += `<div class="lp7-sec lp7-fade"><div class="lp7-w">`;
  html += `<div style="text-align:center"><span class="lp7-label">Opiniones reales</span></div>`;
  html += `<h2 class="lp7-h2">Lo que dicen nuestros <em>clientes</em></h2>`;
  html += `<p class="lp7-sub">${proof}+ valoraciones verificadas</p>`;
  const revs = testimonials?.length > 0 ? testimonials : [{ name: "Cliente verificado", text: "Excelente producto, superó mis expectativas.", rating: 5 }];
  revs.forEach(t => {
    const init = (t.name || "C")[0].toUpperCase();
    const stars = t.rating || 5;
    html += `<div class="lp7-rev"><div class="lp7-rev-stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div><div class="lp7-rev-txt">"${t.text}"</div><div class="lp7-rev-author"><div class="lp7-rev-avatar">${init}</div><div><div class="lp7-rev-name">${t.name}</div>${t.city ? `<div class="lp7-rev-loc">${flag} ${t.city}</div>` : ''}</div><span class="lp7-rev-badge">✓ Compra verificada</span></div></div>`;
  });
  html += `</div></div>`;

  // ═══ 15. GUARANTEE ═══
  html += `<div class="lp7-sec-alt lp7-fade"><div class="lp7-w">`;
  html += `<div class="lp7-guarantee"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="1.5" style="margin-bottom:12px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" stroke-width="2"/></svg><h3 style="font-size:22px;font-weight:800;margin:0 0 8px;color:#18181b">Garantía de satisfacción — 30 días</h3><p style="font-size:14px;color:#3f3f46;margin:0;line-height:1.8;max-width:480px;display:inline-block">${guaranteeText || 'Si no estás 100% satisfecho, te devolvemos tu dinero. Sin preguntas, sin complicaciones. Tu compra está protegida.'}</p></div>`;
  html += `</div></div>`;

  // ═══ 16. TRUST BADGES ═══
  html += `<div class="lp7-sec lp7-fade"><div class="lp7-w">`;
  const badges = trustBadges || ["Pago 100% seguro", "Envío protegido", "Soporte en español", "Compra verificada"];
  const badgeIcons = [
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  ];
  html += `<div class="lp7-trust">`;
  badges.forEach((b, i) => { html += `<div class="lp7-trust-item">${badgeIcons[i] || badgeIcons[3]}<br>${b}</div>`; });
  html += `</div>`;
  if (countryData?.paymentMethods) html += `<p style="text-align:center;font-size:12px;color:#71717a;margin:16px 0 0">${countryData.paymentMethods}</p>`;
  html += `</div></div>`;

  // ═══ 17. FAQ ═══
  if (faq?.length > 0) {
    html += `<div class="lp7-sec-alt lp7-fade"><div class="lp7-w">`;
    html += `<div style="text-align:center"><span class="lp7-label">Preguntas frecuentes</span></div>`;
    html += `<h2 class="lp7-h2">¿Tienes <em>preguntas</em>?</h2>`;
    html += `<p class="lp7-sub">Aquí las respuestas más comunes</p>`;
    faq.forEach(item => { html += `<details class="lp7-faq"><summary>${item.q}</summary><div class="lp7-faq-a">${item.a}</div></details>`; });
    html += `</div></div>`;
  }

  // ═══ 18. FINAL CTA ═══
  html += `<div class="lp7-sec-dark lp7-fade"><div class="lp7-w" style="text-align:center">`;
  html += `<h2 style="font-size:clamp(24px,5.5vw,32px);font-weight:800;color:#fff;margin:0 0 8px">Tu momento es ahora</h2>`;
  html += `<p style="font-size:14px;color:rgba(255,255,255,.5);margin:0 0 24px;line-height:1.7">Únete a ${proof}+ personas que ya transformaron su experiencia</p>`;
  if (dc && dp) html += `<div style="margin-bottom:20px"><span style="font-size:16px;color:rgba(255,255,255,.4);text-decoration:line-through;margin-right:10px">${dc}</span><span style="font-size:clamp(30px,7vw,44px);font-weight:900;color:#fbbf24">${dp}</span></div>`;
  html += `<a href="#shopify-product-form" class="lp7-btn" style="max-width:400px;background:#b45309">${ctaMain}</a>`;
  html += `<p class="lp7-btn-sub" style="color:rgba(255,255,255,.35)">${ctaSub}</p>`;
  html += `</div></div>`;

  // ═══ 19. STICKY BAR ═══
  html += `<div id="lp7-sticky" class="lp7-sticky"><div class="lp7-sticky-inner"><span class="lp7-sticky-price">${dp}</span><a href="#shopify-product-form">${isCOD ? 'Pedir ahora' : 'Comprar ahora'}</a></div></div>`;

  // ═══ 20. WHATSAPP BUTTON ═══
  if (whatsappNumber) {
    const waMsg = encodeURIComponent(`Hola, me interesa ${pName}`);
    html += `<a id="lp7-wa" class="lp7-wa" href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${waMsg}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>`;
  }

  // ── JavaScript ──
  html += `<script>(function(){`;

  // Gallery navigation + touch swipe
  if (imgs.length > 1) {
    html += `var ii=${JSON.stringify(imgs)},ci=0;`;
    html += `window.lp7S=function(i){ci=i;document.getElementById("lp7-main").src=ii[i];document.querySelectorAll(".lp7-gal-thumb").forEach(function(t,j){t.classList.toggle("active",j===i)})};`;
    html += `window.lp7G=function(d){ci=(ci+d+ii.length)%ii.length;lp7S(ci)};`;
    html += `var g=document.querySelector(".lp7-gal"),sx=0;if(g){g.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});g.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){dx<0?lp7G(1):lp7G(-1)}},{passive:true})}`;
  }

  // Sticky bar on scroll
  html += `var st=document.getElementById("lp7-sticky");if(st){window.addEventListener("scroll",function(){var show=window.scrollY>500;st.style.display=show?"block":"none";var wa=document.getElementById("lp7-wa");if(wa)wa.style.bottom=show?"76px":"16px"},{passive:true})}`;

  // Fade-in on scroll (IntersectionObserver)
  html += `if("IntersectionObserver"in window){var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}})},{threshold:.08,rootMargin:"0px 0px -40px 0px"});document.querySelectorAll(".lp7-fade").forEach(function(el){obs.observe(el)})}else{document.querySelectorAll(".lp7-fade").forEach(function(el){el.classList.add("visible")})}`;

  html += `})();</script></div>`;

  return html;
}
