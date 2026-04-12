// lib/shopify.js
// ============================================================
// CONEXIÓN DIRECTA A SHOPIFY — Crea productos, páginas y colecciones
// Usa la Admin API REST + GraphQL de Shopify
// ============================================================

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = "2024-10";

// ─── BASE PARA LLAMADAS A LA API ─────────────────────────────
async function shopifyFetch(endpoint, method = "GET", body = null) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/${endpoint}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    console.error(`[Shopify] Error ${res.status}:`, JSON.stringify(data.errors || data));
    throw new Error(`Shopify API error: ${res.status} — ${JSON.stringify(data.errors || data)}`);
  }

  return data;
}

// ─── CREAR PRODUCTO COMPLETO ─────────────────────────────────
// Crea el producto en Shopify con toda la landing page
export async function createProduct(productData) {
  const {
    title,
    description,
    seoTitle,
    seoDescription,
    price,
    compareAtPrice,
    vendor,
    productType,
    tags,
    images,
    variants,
  } = productData;

  const product = {
    product: {
      title,
      body_html: description,
      vendor: vendor || "Tienda",
      product_type: productType || "General",
      tags: tags || "",
      status: "draft", // Crear como borrador para revisar antes de publicar
      metafields_global_title_tag: seoTitle || title,
      metafields_global_description_tag: seoDescription || "",
      variants: variants || [
        {
          price: price || "0.00",
          compare_at_price: compareAtPrice || (price ? String(Math.round(parseFloat(price) * 2)) : null),
          inventory_management: null,
          requires_shipping: true,
        },
      ],
      images: (images || []).map((url) => {
        if (typeof url === "string" && url.startsWith("data:image/")) {
          // Imagen base64 de Gemini — Shopify acepta attachment
          const base64Data = url.replace(/^data:image\/\w+;base64,/, "");
          return { attachment: base64Data };
        }
        return { src: url };
      }),
    },
  };

  const data = await shopifyFetch("products.json", "POST", product);
  console.log(`[Shopify] Producto creado: ${data.product?.id} — "${title}"`);
  return data.product;
}

// ─── ACTUALIZAR PRODUCTO ─────────────────────────────────────
export async function updateProduct(productId, updates) {
  const data = await shopifyFetch(`products/${productId}.json`, "PUT", {
    product: { id: productId, ...updates },
  });
  return data.product;
}

// ─── OBTENER PRODUCTO ────────────────────────────────────────
export async function getProduct(productId) {
  const data = await shopifyFetch(`products/${productId}.json`);
  return data.product;
}

// ─── LISTAR PRODUCTOS ────────────────────────────────────────
export async function listProducts(limit = 50, status = "any") {
  const data = await shopifyFetch(`products.json?limit=${limit}&status=${status}`);
  return data.products || [];
}

// ─── ELIMINAR PRODUCTO ───────────────────────────────────────
export async function deleteProduct(productId) {
  await shopifyFetch(`products/${productId}.json`, "DELETE");
  return true;
}

// ─── CREAR COLECCIÓN ─────────────────────────────────────────
export async function createCollection(title, description = "", rules = null) {
  if (rules) {
    // Colección inteligente (automática por reglas)
    const data = await shopifyFetch("smart_collections.json", "POST", {
      smart_collection: {
        title,
        body_html: description,
        rules,
        sort_order: "best-selling",
      },
    });
    return data.smart_collection;
  } else {
    // Colección manual
    const data = await shopifyFetch("custom_collections.json", "POST", {
      custom_collection: {
        title,
        body_html: description,
      },
    });
    return data.custom_collection;
  }
}

// ─── AGREGAR PRODUCTO A COLECCIÓN ────────────────────────────
export async function addProductToCollection(collectionId, productId) {
  const data = await shopifyFetch("collects.json", "POST", {
    collect: {
      product_id: productId,
      collection_id: collectionId,
    },
  });
  return data.collect;
}

// ─── CREAR PÁGINA (para landing pages personalizadas) ───────
export async function createPage(title, bodyHtml) {
  const data = await shopifyFetch("pages.json", "POST", {
    page: {
      title,
      body_html: bodyHtml,
      published: true,
    },
  });
  console.log(`[Shopify] Página creada: ${data.page?.id} — "${title}"`);
  return data.page;
}

// ─── CONFIGURAR SEO DE PRODUCTO ──────────────────────────────
export async function updateProductSEO(productId, seoTitle, seoDescription) {
  // Shopify usa metafields para SEO avanzado
  const data = await shopifyFetch(`products/${productId}.json`, "PUT", {
    product: {
      id: productId,
      metafields_global_title_tag: seoTitle,
      metafields_global_description_tag: seoDescription,
    },
  });
  return data.product;
}

// ─── OBTENER INFO DE LA TIENDA ───────────────────────────────
export async function getShopInfo() {
  const data = await shopifyFetch("shop.json");
  return data.shop;
}

// ─── CONSTRUIR HTML DE LANDING PAGE ──────────────────────────
// Genera el HTML completo (alta conversión) de la descripción del producto para Shopify
// Template PRO con 15 secciones optimizadas para mercado LATAM mobile-first
export function buildLandingHTML(landingData) {
  const {
    headline,
    subheadline,
    bulletPoints,
    description,
    features,
    faq,
    urgencyText,
    compareTable,
    testimonials,
    problemSolution,
    guaranteeText,
    trustBadges,
    price,
    comparePrice,
    socialProofCount,
    // Nuevos parámetros — localización, pixels, upsell, WhatsApp
    countryCode,
    countryData,
    formattedPrice,
    formattedCompare,
    savingsText,
    whatsappNumber,
    facebookPixelId,
    tiktokPixelId,
    upsellProducts,
  } = landingData;

  // ─── Precios con fallback ───
  const displayPrice = formattedPrice || (price ? `$${price}` : null);
  const displayCompare = formattedCompare || (comparePrice ? `$${comparePrice}` : null);
  const displaySavings = savingsText || (comparePrice && price ? `$${(parseFloat(comparePrice) - parseFloat(price)).toFixed(0)}` : null);
  const currencyLabel = countryData?.currency || "";
  const countryFlag = countryData?.flag || "";
  const isCOD = countryData?.contraentrega === true;
  const ctaText1 = isCOD ? "&#161;PIDE AHORA Y PAGA AL RECIBIR!" : "&#161;LO QUIERO AHORA &mdash; 50% OFF!";
  const ctaText2 = isCOD ? "&#x1F4E6; PEDIR AHORA &mdash; PAGAS AL RECIBIR" : "&#x1F6D2; APROVECHA EL 50% OFF AHORA";
  const ctaTextFinal = isCOD ? "&#161;S&Iacute;, LO QUIERO &mdash; PAGO AL RECIBIR!" : "&#161;S&Iacute;, LO NECESITO &mdash; COMPRAR AHORA!";
  const ctaSubtext = isCOD ? "Sin tarjeta &bull; Solo llena el formulario &bull; Pagas cuando te llegue" : "Compra 100% segura &bull; Satisfacci&oacute;n garantizada";

  // ─── Paleta de colores ───
  const green = "#27AE60";
  const greenDark = "#219A52";
  const orange = "#F39C12";
  const orangeDark = "#E67E22";
  const dark = "#1a1a2e";
  const gray = "#555";
  const lightBg = "#f9fafb";
  const borderColor = "#e5e7eb";

  // ─── Estilos reutilizables ───
  const ctaBtnStyle = `display:block;width:100%;max-width:480px;margin:0 auto;padding:20px 32px;background:${green};color:#fff;font-size:20px;font-weight:800;text-align:center;text-decoration:none;border:none;border-radius:12px;cursor:pointer;box-shadow:0 4px 14px rgba(39,174,96,0.4);letter-spacing:0.5px;line-height:1.3`;
  const ctaHover = `onmouseover="this.style.background='${greenDark}';this.style.transform='scale(1.02)'" onmouseout="this.style.background='${green}';this.style.transform='scale(1)'"`;
  const sectionWrap = `max-width:700px;margin:0 auto;padding:0 16px`;

  let html = "";

  // ═══════════════════════════════════════════════════════════
  // 0-A. FACEBOOK PIXEL (si se proporciona)
  // ═══════════════════════════════════════════════════════════
  if (facebookPixelId) {
    html += `<script>`;
    html += `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};`;
    html += `if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];`;
    html += `t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)`;
    html += `}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`;
    html += `fbq('init','${facebookPixelId}');`;
    html += `fbq('track','PageView');`;
    html += `fbq('track','ViewContent',{content_name:'${(headline || "").replace(/'/g, "\\'")}',value:${parseFloat(price) || 0},currency:'${countryData?.currency || "USD"}'});`;
    html += `</script>`;
    html += `<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1"/></noscript>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 0-B. TIKTOK PIXEL (si se proporciona)
  // ═══════════════════════════════════════════════════════════
  if (tiktokPixelId) {
    html += `<script>`;
    html += `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];`;
    html += `ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];`;
    html += `ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};`;
    html += `for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);`;
    html += `ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};`;
    html += `ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";`;
    html += `ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};`;
    html += `var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;`;
    html += `var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};`;
    html += `ttq.load('${tiktokPixelId}');ttq.page();`;
    html += `ttq.track('ViewContent',{content_name:'${(headline || "").replace(/'/g, "\\'")}',value:${parseFloat(price) || 0},currency:'${countryData?.currency || "USD"}'});`;
    html += `}(window,document,'ttq');`;
    html += `</script>`;
  }

  html += `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;color:${dark};line-height:1.6;margin:0;padding:0;overflow-x:hidden">`;

  // Selector de país removido — confundía al cliente

  // ═══════════════════════════════════════════════════════════
  // 1. BANNER DE OFERTA — Franja superior
  // ═══════════════════════════════════════════════════════════
  html += `<div style="background:linear-gradient(135deg,${orangeDark},${orange});color:#fff;text-align:center;padding:14px 16px;font-size:15px;font-weight:700;letter-spacing:0.5px">`;
  const shippingBannerText = countryData?.shipping ? countryData.shipping : "Env&iacute;o GRATIS";
  html += `&#128293; OFERTA POR TIEMPO LIMITADO &mdash; 50% OFF &mdash; ${shippingBannerText} &#128293;`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 2. TITULO + PRECIO + BADGE "MAS VENDIDO"
  // ═══════════════════════════════════════════════════════════
  html += `<div style="${sectionWrap};text-align:center;padding-top:32px;padding-bottom:24px">`;
  html += `<div style="display:inline-block;background:${orange};color:#fff;font-size:12px;font-weight:800;padding:6px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">&#11088; M&Aacute;S VENDIDO</div>`;
  if (headline) {
    html += `<h1 style="font-size:32px;font-weight:900;color:${dark};margin:16px 0 8px 0;line-height:1.2">${headline}</h1>`;
  }
  if (subheadline) {
    html += `<p style="font-size:18px;color:${gray};margin:0 0 20px 0;line-height:1.5">${subheadline}</p>`;
  }
  if (displayPrice || displayCompare) {
    html += `<div style="margin:20px 0">`;
    if (displayCompare) {
      html += `<span style="font-size:18px;color:#999;text-decoration:line-through;margin-right:12px">${displayCompare}</span>`;
    }
    if (displayPrice) {
      html += `<span style="font-size:36px;font-weight:900;color:${green}">${displayPrice}</span>`;
    }
    if (displaySavings) {
      html += `<div style="display:inline-block;background:#FDEBD0;color:${orangeDark};font-size:13px;font-weight:700;padding:4px 12px;border-radius:6px;margin-left:12px;vertical-align:middle">Ahorras ${displaySavings}${currencyLabel ? " " + currencyLabel : ""}</div>`;
    }
    html += `</div>`;
    if (countryData?.contraentrega) {
      html += `<div style="display:inline-block;background:#E8F8F0;color:${green};font-size:14px;font-weight:700;padding:8px 16px;border-radius:8px;margin-top:8px">&#128230; Pago contraentrega disponible</div>`;
    }
  }
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 3. CONTADOR DE URGENCIA — JavaScript real
  // ═══════════════════════════════════════════════════════════
  html += `<div style="${sectionWrap};margin-bottom:28px">`;
  html += `<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;padding:20px 16px;text-align:center">`;
  html += `<p style="color:#ccc;font-size:14px;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:1px">&#9200; Esta oferta termina en:</p>`;
  html += `<div id="lp-countdown" style="display:flex;justify-content:center;gap:12px">`;
  const timerBoxStyle = `background:rgba(255,255,255,0.1);border-radius:8px;padding:12px 16px;min-width:60px`;
  const timerNumStyle = `display:block;font-size:28px;font-weight:900;color:#fff;line-height:1`;
  const timerLabelStyle = `display:block;font-size:10px;color:#aaa;text-transform:uppercase;margin-top:4px;letter-spacing:1px`;
  html += `<div style="${timerBoxStyle}"><span id="lp-hours" style="${timerNumStyle}">02</span><span style="${timerLabelStyle}">Horas</span></div>`;
  html += `<div style="${timerBoxStyle}"><span id="lp-mins" style="${timerNumStyle}">45</span><span style="${timerLabelStyle}">Min</span></div>`;
  html += `<div style="${timerBoxStyle}"><span id="lp-secs" style="${timerNumStyle}">33</span><span style="${timerLabelStyle}">Seg</span></div>`;
  html += `</div>`;
  html += `</div>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 4. BOTON DE COMPRA 1
  // ═══════════════════════════════════════════════════════════
  html += `<div style="${sectionWrap};margin-bottom:36px">`;
  html += `<a href="#shopify-product-form" ${ctaHover} style="${ctaBtnStyle}">${ctaText1}</a>`;
  html += `<p style="text-align:center;font-size:13px;color:#999;margin-top:10px">&#128274; Compra 100% segura &bull; Satisfacci&oacute;n garantizada</p>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 5. SECCION PROBLEMA → SOLUCION (Framework PAS)
  // ═══════════════════════════════════════════════════════════
  if (problemSolution || description) {
    html += `<div style="background:${lightBg};padding:40px 0;margin-bottom:0">`;
    html += `<div style="${sectionWrap}">`;
    if (problemSolution?.problem) {
      html += `<div style="margin-bottom:28px">`;
      html += `<h2 style="font-size:24px;font-weight:800;color:${dark};margin:0 0 16px 0;text-align:center">&#129300; &iquest;Te pasa esto?</h2>`;
      html += `<div style="background:#fff;border-left:4px solid #E74C3C;border-radius:0 8px 8px 0;padding:20px;font-size:16px;color:#444;line-height:1.7">${problemSolution.problem}</div>`;
      html += `</div>`;
    }
    if (problemSolution?.agitation) {
      html += `<div style="margin-bottom:28px">`;
      html += `<div style="background:#fff;border-left:4px solid ${orange};border-radius:0 8px 8px 0;padding:20px;font-size:16px;color:#444;line-height:1.7">${problemSolution.agitation}</div>`;
      html += `</div>`;
    }
    if (problemSolution?.solution) {
      html += `<div style="margin-bottom:8px">`;
      html += `<h2 style="font-size:24px;font-weight:800;color:${green};margin:0 0 16px 0;text-align:center">&#10024; Presentamos la soluci&oacute;n</h2>`;
      html += `<div style="background:#fff;border-left:4px solid ${green};border-radius:0 8px 8px 0;padding:20px;font-size:16px;color:#444;line-height:1.7">${problemSolution.solution}</div>`;
      html += `</div>`;
    } else if (description) {
      html += `<div style="font-size:16px;color:#444;line-height:1.8">${description}</div>`;
    }
    html += `</div>`;
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 6. BENEFICIOS CON ICONOS — Grid 2 columnas
  // ═══════════════════════════════════════════════════════════
  if (bulletPoints?.length > 0) {
    html += `<div style="padding:40px 0">`;
    html += `<div style="${sectionWrap}">`;
    html += `<h2 style="font-size:26px;font-weight:800;text-align:center;margin:0 0 28px 0;color:${dark}">&iquest;Por qu&eacute; elegir este producto?</h2>`;
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">`;
    for (const point of bulletPoints) {
      html += `<div style="background:${lightBg};border:1px solid ${borderColor};border-radius:12px;padding:20px;text-align:center">`;
      html += `<p style="font-size:15px;color:#333;margin:0;line-height:1.5">${point}</p>`;
      html += `</div>`;
    }
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 7. PRUEBA SOCIAL — Reviews + contador de clientes
  // ═══════════════════════════════════════════════════════════
  html += `<div style="background:${lightBg};padding:40px 0">`;
  html += `<div style="${sectionWrap}">`;
  const proofCount = socialProofCount || "2,847";
  html += `<div style="text-align:center;margin-bottom:28px">`;
  html += `<div style="font-size:28px;letter-spacing:2px;margin-bottom:8px">&#11088;&#11088;&#11088;&#11088;&#11088;</div>`;
  html += `<p style="font-size:22px;font-weight:800;color:${dark};margin:0">+${proofCount} clientes satisfechos</p>`;
  html += `<p style="font-size:14px;color:${gray};margin:4px 0 0 0">Calificaci&oacute;n promedio: 4.9/5</p>`;
  html += `</div>`;

  const reviewsToRender = (testimonials?.length > 0) ? testimonials : [
    { name: "Carolina M.", city: "Bogot\u00e1, Colombia", text: "Incre\u00edble calidad, lleg\u00f3 r\u00e1pido y bien empacado. 100% recomendado." },
    { name: "Miguel \u00c1.", city: "CDMX, M\u00e9xico", text: "Ya es la segunda vez que compro. El mejor producto que he probado en su categor\u00eda." },
    { name: "Laura P.", city: "Medell\u00edn, Colombia", text: "Estaba esc\u00e9ptica pero super\u00f3 mis expectativas. Lo uso todos los d\u00edas." },
  ];
  for (const t of reviewsToRender) {
    // Determinar bandera del testimonio
    let testimonialFlag = countryFlag || "";
    if (t.countryFlag) testimonialFlag = t.countryFlag;
    else if (t.country === "Colombia" || (t.city && t.city.includes("Colombia"))) testimonialFlag = "&#127464;&#127476;";
    else if (t.country === "México" || t.country === "Mexico" || (t.city && t.city.includes("xico"))) testimonialFlag = "&#127474;&#127485;";
    else if (t.country === "Brasil" || (t.city && t.city.includes("Brasil"))) testimonialFlag = "&#127463;&#127479;";
    else if (t.country === "Chile" || (t.city && t.city.includes("Chile"))) testimonialFlag = "&#127464;&#127473;";
    else if (t.country === "Perú" || t.country === "Peru" || (t.city && t.city.includes("Per"))) testimonialFlag = "&#127477;&#127466;";
    else if (t.country === "Argentina" || (t.city && t.city.includes("Argentina"))) testimonialFlag = "&#127462;&#127479;";

    html += `<div style="background:#fff;border:1px solid ${borderColor};border-radius:12px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04)">`;
    html += `<div style="font-size:14px;color:${orange};margin-bottom:8px">&#11088;&#11088;&#11088;&#11088;&#11088;</div>`;
    html += `<p style="margin:0 0 12px 0;font-size:15px;color:#333;font-style:italic;line-height:1.6">&ldquo;${t.text}&rdquo;</p>`;
    html += `<div style="display:flex;align-items:center;gap:8px">`;
    const initial = (t.name || "C")[0].toUpperCase();
    html += `<div style="width:36px;height:36px;border-radius:50%;background:${green};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${initial}</div>`;
    html += `<div>`;
    html += `<p style="margin:0;font-weight:700;font-size:14px;color:${dark}">${testimonialFlag ? testimonialFlag + " " : ""}${t.name || "Cliente verificado"}</p>`;
    if (t.city) {
      html += `<p style="margin:0;font-size:12px;color:#999">${t.city}</p>`;
    }
    html += `</div>`;
    html += `<div style="margin-left:auto;font-size:11px;color:${green};font-weight:600;background:#E8F8F0;padding:3px 8px;border-radius:4px">&#9989; Compra verificada</div>`;
    html += `</div>`;
    html += `</div>`;
  }
  html += `</div>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 8. TABLA COMPARATIVA
  // ═══════════════════════════════════════════════════════════
  if (compareTable?.length > 0) {
    html += `<div style="padding:40px 0">`;
    html += `<div style="${sectionWrap}">`;
    html += `<h2 style="font-size:26px;font-weight:800;text-align:center;margin:0 0 28px 0;color:${dark}">&#129354; Nuestro producto vs La competencia</h2>`;
    html += `<div style="overflow-x:auto;border-radius:12px;border:1px solid ${borderColor};box-shadow:0 2px 8px rgba(0,0,0,0.04)">`;
    html += `<table style="width:100%;border-collapse:collapse;font-size:15px">`;
    html += `<thead><tr>`;
    html += `<th style="padding:16px;text-align:left;background:${dark};color:#fff;font-weight:700">Caracter&iacute;stica</th>`;
    html += `<th style="padding:16px;text-align:center;background:${green};color:#fff;font-weight:700">&#10024; Nosotros</th>`;
    html += `<th style="padding:16px;text-align:center;background:#ddd;color:#666;font-weight:700">Competencia</th>`;
    html += `</tr></thead><tbody>`;
    let rowIdx = 0;
    for (const row of compareTable) {
      const rowBg = rowIdx % 2 === 0 ? "#fff" : lightBg;
      html += `<tr style="background:${rowBg}">`;
      html += `<td style="padding:14px 16px;border-bottom:1px solid ${borderColor};font-weight:600">${row.feature}</td>`;
      html += `<td style="padding:14px 16px;border-bottom:1px solid ${borderColor};text-align:center;color:${green};font-weight:700">&#9989; ${row.ours}</td>`;
      html += `<td style="padding:14px 16px;border-bottom:1px solid ${borderColor};text-align:center;color:#999">&#10060; ${row.theirs}</td>`;
      html += `</tr>`;
      rowIdx++;
    }
    html += `</tbody></table>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 9. BOTON DE COMPRA 2 (repetir CTA)
  // ═══════════════════════════════════════════════════════════
  html += `<div style="${sectionWrap};margin-top:8px;margin-bottom:40px">`;
  html += `<a href="#shopify-product-form" ${ctaHover} style="${ctaBtnStyle}">${ctaText2}</a>`;
  html += `<p style="text-align:center;font-size:13px;color:#999;margin-top:10px">&#9889; Quedan pocas unidades en stock</p>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 10. CARACTERISTICAS TECNICAS — Grid
  // ═══════════════════════════════════════════════════════════
  if (features?.length > 0) {
    html += `<div style="background:${lightBg};padding:40px 0">`;
    html += `<div style="${sectionWrap}">`;
    html += `<h2 style="font-size:26px;font-weight:800;text-align:center;margin:0 0 28px 0;color:${dark}">&#128295; Caracter&iacute;sticas T&eacute;cnicas</h2>`;
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">`;
    for (const feat of features) {
      html += `<div style="background:#fff;border:1px solid ${borderColor};border-radius:10px;padding:16px;display:flex;align-items:flex-start;gap:10px;box-shadow:0 1px 4px rgba(0,0,0,0.03)">`;
      html += `<span style="color:${green};font-size:18px;flex-shrink:0">&#9989;</span>`;
      html += `<span style="font-size:14px;color:#333;line-height:1.5">${feat}</span>`;
      html += `</div>`;
    }
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 11. GARANTIA DE SATISFACCION
  // ═══════════════════════════════════════════════════════════
  const guarantee = guaranteeText || "Si no est\u00e1s 100% satisfecho con tu compra, te devolvemos tu dinero sin preguntas. As\u00ed de simple.";
  html += `<div style="padding:40px 0">`;
  html += `<div style="${sectionWrap}">`;
  html += `<div style="background:linear-gradient(135deg,#E8F8F0,#D5F5E3);border:2px solid ${green};border-radius:16px;padding:32px 24px;text-align:center">`;
  html += `<div style="font-size:48px;margin-bottom:12px">&#128737;&#65039;</div>`;
  html += `<h3 style="font-size:22px;font-weight:800;color:${dark};margin:0 0 12px 0">&#9989; Garant&iacute;a de Satisfacci&oacute;n 30 D&iacute;as</h3>`;
  html += `<p style="font-size:16px;color:#444;margin:0;line-height:1.6;max-width:500px;display:inline-block">${guarantee}</p>`;
  html += `</div>`;
  html += `</div>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 12. SELLOS DE CONFIANZA
  // ═══════════════════════════════════════════════════════════
  const badges = trustBadges || [
    "&#128274; Pago 100% Seguro",
    "&#128666; Env\u00edo Protegido",
    "&#128172; Soporte 24/7",
    "&#9989; Compra Verificada",
  ];
  html += `<div style="background:${lightBg};padding:32px 0">`;
  html += `<div style="${sectionWrap}">`;
  html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">`;
  for (const badge of badges) {
    html += `<div style="background:#fff;border:1px solid ${borderColor};border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.03)">`;
    html += `<p style="margin:0;font-size:14px;font-weight:700;color:${dark}">${badge}</p>`;
    html += `</div>`;
  }
  html += `</div>`;
  html += `</div>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 12-B. METODOS DE PAGO LOCALES
  // ═══════════════════════════════════════════════════════════
  if (countryData?.paymentMethods) {
    const methods = Array.isArray(countryData.paymentMethods)
      ? countryData.paymentMethods.join(", ")
      : countryData.paymentMethods;
    html += `<div style="padding:20px 0;background:#fff">`;
    html += `<div style="${sectionWrap};text-align:center">`;
    html += `<p style="font-size:15px;color:${gray};margin:0">&#128179; M&eacute;todos de pago: <strong style="color:${dark}">${methods}</strong></p>`;
    html += `</div>`;
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 12-C. SECCION UPSELL — Productos relacionados
  // ═══════════════════════════════════════════════════════════
  if (upsellProducts?.length > 0) {
    html += `<div style="padding:40px 0;background:${lightBg}">`;
    html += `<div style="${sectionWrap}">`;
    html += `<h2 style="font-size:24px;font-weight:800;text-align:center;margin:0 0 24px 0;color:${dark}">&#128717; Clientes tambi&eacute;n compraron</h2>`;
    const upsellCols = upsellProducts.length >= 3 ? "repeat(3,1fr)" : `repeat(${upsellProducts.length},1fr)`;
    html += `<div style="display:grid;grid-template-columns:${upsellCols};gap:16px">`;
    for (const up of upsellProducts) {
      html += `<div style="background:#fff;border:1px solid ${borderColor};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)">`;
      if (up.image) {
        html += `<div style="width:100%;aspect-ratio:1/1;overflow:hidden">`;
        html += `<img src="${up.image}" alt="${up.name || ""}" style="width:100%;height:100%;object-fit:cover"/>`;
        html += `</div>`;
      }
      html += `<div style="padding:12px">`;
      if (up.name) {
        html += `<p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:${dark};line-height:1.3">${up.name}</p>`;
      }
      if (up.price) {
        html += `<p style="margin:0;font-size:16px;font-weight:800;color:${green}">${up.price}</p>`;
      }
      html += `</div>`;
      html += `</div>`;
    }
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 13. FAQ — Acordeon expandible con <details>
  // ═══════════════════════════════════════════════════════════
  if (faq?.length > 0) {
    html += `<div style="padding:40px 0">`;
    html += `<div style="${sectionWrap}">`;
    html += `<h2 style="font-size:26px;font-weight:800;text-align:center;margin:0 0 28px 0;color:${dark}">&#10068; Preguntas Frecuentes</h2>`;
    for (const item of faq) {
      html += `<details style="margin-bottom:12px;border:1px solid ${borderColor};border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.03)">`;
      html += `<summary style="padding:18px 20px;font-weight:700;font-size:16px;cursor:pointer;background:#fff;color:${dark};list-style:none;display:flex;justify-content:space-between;align-items:center">${item.q}<span style="font-size:20px;color:#ccc">+</span></summary>`;
      html += `<div style="padding:0 20px 18px 20px;background:#fff;font-size:15px;color:${gray};line-height:1.7">${item.a}</div>`;
      html += `</details>`;
    }
    html += `</div>`;
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 14. ULTIMO CTA — Seccion oscura de cierre
  // ═══════════════════════════════════════════════════════════
  html += `<div style="background:linear-gradient(135deg,${dark},#16213e);padding:48px 0">`;
  html += `<div style="${sectionWrap};text-align:center">`;
  html += `<h2 style="font-size:28px;font-weight:900;color:#fff;margin:0 0 12px 0">&#128640; No dejes pasar esta oportunidad</h2>`;
  html += `<p style="font-size:16px;color:#ccc;margin:0 0 28px 0">La oferta del 50% puede terminar en cualquier momento</p>`;
  if (displayCompare && displayPrice) {
    html += `<div style="margin-bottom:24px">`;
    html += `<span style="font-size:18px;color:#888;text-decoration:line-through;margin-right:12px">${displayCompare}</span>`;
    html += `<span style="font-size:38px;font-weight:900;color:${green}">${displayPrice}</span>`;
    html += `</div>`;
  }
  html += `<a href="#shopify-product-form" style="${ctaBtnStyle};max-width:420px;font-size:18px;padding:18px 28px" ${ctaHover}>${ctaTextFinal}</a>`;
  html += `<p style="text-align:center;font-size:13px;color:#888;margin-top:14px">${ctaSubtext}</p>`;
  html += `</div>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 15-A. BOTON DE WHATSAPP FLOTANTE (arriba del sticky)
  // ═══════════════════════════════════════════════════════════
  if (whatsappNumber) {
    const waMsg = encodeURIComponent(`Hola, me interesa el producto: ${headline || ""}`);
    html += `<a id="lp-whatsapp-btn" href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${waMsg}" target="_blank" rel="noopener" style="position:fixed;bottom:80px;right:16px;z-index:10000;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(37,211,102,0.45);text-decoration:none;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">`;
    html += `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
    html += `</a>`;
  }

  // ═══════════════════════════════════════════════════════════
  // 15-B. BOTON FLOTANTE — Sticky bottom en mobile
  // ═══════════════════════════════════════════════════════════
  html += `<div id="lp-sticky-btn" style="position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#fff;padding:10px 16px;box-shadow:0 -4px 20px rgba(0,0,0,0.15);display:none">`;
  html += `<a href="#shopify-product-form" style="display:block;width:100%;padding:16px;background:${green};color:#fff;font-size:17px;font-weight:800;text-align:center;text-decoration:none;border-radius:10px;box-shadow:0 3px 10px rgba(39,174,96,0.35)" ${ctaHover}>&#128722; AGREGAR AL CARRITO &mdash; 50% OFF</a>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // 15-C. POPUP DE SALIDA (Exit Intent)
  // ═══════════════════════════════════════════════════════════
  html += `<div id="lp-exit-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.7);align-items:center;justify-content:center">`;
  html += `<div style="background:#fff;border-radius:16px;max-width:420px;width:90%;margin:auto;padding:36px 28px;text-align:center;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.3)">`;
  html += `<div style="font-size:36px;margin-bottom:12px">&#128561;</div>`;
  html += `<h3 style="font-size:22px;font-weight:900;color:${dark};margin:0 0 8px 0">&iexcl;Espera! No te vayas sin tu descuento</h3>`;
  html += `<p style="font-size:15px;color:${gray};margin:0 0 20px 0;line-height:1.5">Te damos <strong style="color:${orange}">10% EXTRA</strong> si compras en los pr&oacute;ximos 15 minutos</p>`;
  html += `<input id="lp-exit-email" type="email" placeholder="Tu correo para recibir el cup&oacute;n" style="width:100%;padding:14px 16px;font-size:15px;border:2px solid ${borderColor};border-radius:10px;outline:none;margin-bottom:14px;box-sizing:border-box;transition:border-color 0.2s" onfocus="this.style.borderColor='${green}'" onblur="this.style.borderColor='${borderColor}'"/>`;
  html += `<a href="#shopify-product-form" onclick="document.getElementById('lp-exit-overlay').style.display='none'" style="${ctaBtnStyle};font-size:16px;padding:16px 24px;max-width:100%">QUIERO MI 10% DE DESCUENTO</a>`;
  html += `<p style="margin:16px 0 0 0"><a href="#" onclick="document.getElementById('lp-exit-overlay').style.display='none';return false" style="font-size:13px;color:#999;text-decoration:underline;cursor:pointer">No gracias, no quiero descuento</a></p>`;
  html += `</div>`;
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════
  // JAVASCRIPT — Contador regresivo + Sticky button
  // ═══════════════════════════════════════════════════════════
  html += `<script>`;
  html += `(function(){`;
  // Contador: persiste en localStorage para que no se reinicie al recargar
  html += `var key="lp_countdown_end";`;
  html += `var stored=localStorage.getItem(key);`;
  html += `var end;`;
  html += `if(stored&&parseInt(stored)>Date.now()){end=parseInt(stored);}`;
  html += `else{end=Date.now()+(2*3600+45*60+33)*1000;localStorage.setItem(key,String(end));}`;
  html += `function pad(n){return n<10?"0"+n:String(n);}`;
  html += `function tick(){`;
  html += `var diff=Math.max(0,end-Date.now());`;
  html += `var h=Math.floor(diff/3600000);diff%=3600000;`;
  html += `var m=Math.floor(diff/60000);diff%=60000;`;
  html += `var s=Math.floor(diff/1000);`;
  html += `var eh=document.getElementById("lp-hours");`;
  html += `var em=document.getElementById("lp-mins");`;
  html += `var es=document.getElementById("lp-secs");`;
  html += `if(eh)eh.textContent=pad(h);`;
  html += `if(em)em.textContent=pad(m);`;
  html += `if(es)es.textContent=pad(s);`;
  html += `if(diff<=0){localStorage.removeItem(key);}`;
  html += `}`;
  html += `tick();setInterval(tick,1000);`;
  // Sticky button: aparece al hacer scroll mas de 600px
  html += `var stickyBtn=document.getElementById("lp-sticky-btn");`;
  html += `if(stickyBtn){`;
  html += `window.addEventListener("scroll",function(){`;
  html += `var show=window.scrollY>600;`;
  html += `stickyBtn.style.display=show?"block":"none";`;
  // Mover WhatsApp button arriba del sticky cuando aparece
  html += `var waBtn=document.getElementById("lp-whatsapp-btn");`;
  html += `if(waBtn){waBtn.style.bottom=show?"80px":"20px";}`;
  html += `});`;
  html += `}`;
  // Spacer para que el sticky no tape contenido al final
  html += `var spacer=document.createElement("div");spacer.style.height="80px";`;
  html += `var stickyEl=document.getElementById("lp-sticky-btn");`;
  html += `if(stickyEl&&stickyEl.parentNode){stickyEl.parentNode.insertBefore(spacer,stickyEl);}`;

  // ── Exit Intent Popup ──
  html += `var exitShown=localStorage.getItem("lp_exit_shown");`;
  html += `var exitOverlay=document.getElementById("lp-exit-overlay");`;
  html += `if(exitOverlay&&!exitShown){`;
  // Desktop: mouseout al salir del viewport
  html += `document.addEventListener("mouseout",function(e){`;
  html += `if(!e.toElement&&!e.relatedTarget&&e.clientY<10){`;
  html += `exitOverlay.style.display="flex";localStorage.setItem("lp_exit_shown","1");`;
  html += `}});`;
  // Mobile: después de 30 segundos
  html += `if(/Mobi|Android/i.test(navigator.userAgent)){`;
  html += `setTimeout(function(){`;
  html += `if(!localStorage.getItem("lp_exit_shown")){`;
  html += `exitOverlay.style.display="flex";localStorage.setItem("lp_exit_shown","1");`;
  html += `}},30000);`;
  html += `}`;
  // Cerrar al hacer clic fuera del card
  html += `exitOverlay.addEventListener("click",function(e){`;
  html += `if(e.target===exitOverlay){exitOverlay.style.display="none";}`;
  html += `});`;
  html += `}`;

  html += `})();`;
  html += `</script>`;

  // Cerrar wrapper principal
  html += `</div>`;

  return html;
}

// ─── VERIFICAR CONEXIÓN ──────────────────────────────────────
export async function testConnection() {
  try {
    const shop = await getShopInfo();
    return {
      ok: true,
      name: shop.name,
      domain: shop.myshopify_domain,
      email: shop.email,
      plan: shop.plan_display_name,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
