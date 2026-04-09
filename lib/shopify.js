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
          compare_at_price: compareAtPrice || null,
          inventory_management: null,
          requires_shipping: true,
        },
      ],
      images: (images || []).map((url) => ({ src: url })),
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
// Genera el HTML completo de la descripción del producto para Shopify
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
  } = landingData;

  let html = "";

  // Encabezado principal
  if (headline) {
    html += `<div style="text-align:center;margin-bottom:24px">`;
    html += `<h2 style="font-size:28px;font-weight:bold;margin-bottom:8px">${headline}</h2>`;
    if (subheadline) {
      html += `<p style="font-size:18px;color:#666;margin:0">${subheadline}</p>`;
    }
    html += `</div>`;
  }

  // Urgencia / escasez
  if (urgencyText) {
    html += `<div style="background:#FFF3CD;border:1px solid #FFC107;border-radius:8px;padding:12px 16px;margin-bottom:20px;text-align:center">`;
    html += `<strong>⚡ ${urgencyText}</strong>`;
    html += `</div>`;
  }

  // Descripción principal
  if (description) {
    html += `<div style="margin-bottom:24px;line-height:1.7;font-size:16px">${description}</div>`;
  }

  // Beneficios / bullet points
  if (bulletPoints?.length > 0) {
    html += `<div style="margin-bottom:24px">`;
    html += `<h3 style="font-size:20px;margin-bottom:12px">¿Por qué elegir este producto?</h3>`;
    html += `<ul style="list-style:none;padding:0">`;
    for (const point of bulletPoints) {
      html += `<li style="padding:8px 0;font-size:16px;border-bottom:1px solid #f0f0f0">${point}</li>`;
    }
    html += `</ul></div>`;
  }

  // Características técnicas
  if (features?.length > 0) {
    html += `<div style="margin-bottom:24px">`;
    html += `<h3 style="font-size:20px;margin-bottom:12px">Características</h3>`;
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">`;
    for (const feat of features) {
      html += `<div style="background:#f8f8f8;padding:10px;border-radius:6px;font-size:14px">${feat}</div>`;
    }
    html += `</div></div>`;
  }

  // Tabla comparativa
  if (compareTable?.length > 0) {
    html += `<div style="margin-bottom:24px">`;
    html += `<h3 style="font-size:20px;margin-bottom:12px">Comparación</h3>`;
    html += `<table style="width:100%;border-collapse:collapse;font-size:14px">`;
    html += `<tr style="background:#f0f0f0"><th style="padding:10px;text-align:left">Característica</th><th style="padding:10px;text-align:center">Nuestro producto</th><th style="padding:10px;text-align:center">Competencia</th></tr>`;
    for (const row of compareTable) {
      html += `<tr style="border-bottom:1px solid #eee"><td style="padding:10px">${row.feature}</td><td style="padding:10px;text-align:center;color:#27500A">✅ ${row.ours}</td><td style="padding:10px;text-align:center;color:#999">❌ ${row.theirs}</td></tr>`;
    }
    html += `</table></div>`;
  }

  // Testimonios
  if (testimonials?.length > 0) {
    html += `<div style="margin-bottom:24px">`;
    html += `<h3 style="font-size:20px;margin-bottom:12px">Lo que dicen nuestros clientes</h3>`;
    for (const t of testimonials) {
      html += `<div style="background:#f8f8f8;padding:16px;border-radius:8px;margin-bottom:8px">`;
      html += `<p style="margin:0 0 8px 0;font-style:italic">"${t.text}"</p>`;
      html += `<p style="margin:0;font-weight:bold;font-size:14px">— ${t.name} ⭐⭐⭐⭐⭐</p>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // FAQ
  if (faq?.length > 0) {
    html += `<div style="margin-bottom:24px">`;
    html += `<h3 style="font-size:20px;margin-bottom:12px">Preguntas frecuentes</h3>`;
    for (const item of faq) {
      html += `<details style="margin-bottom:8px;border:1px solid #eee;border-radius:6px;padding:12px">`;
      html += `<summary style="font-weight:bold;cursor:pointer">${item.q}</summary>`;
      html += `<p style="margin:8px 0 0 0;color:#555">${item.a}</p>`;
      html += `</details>`;
    }
    html += `</div>`;
  }

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
