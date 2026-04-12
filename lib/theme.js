// lib/theme.js
// ============================================================
// BUILDER DE TEMPLATES PARA TEMA MASTER ESCALA
// Genera templates de producto (.json) usando secciones nativas
// del tema Master Escala para landing pages PRO
// ============================================================

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = "2024-10";
const THEME_ID = null; // Se obtiene dinámicamente

// ─── OBTENER TEMA ACTIVO ────────────────────────────────────
async function getActiveThemeId() {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/themes.json`,
    { headers: { "X-Shopify-Access-Token": SHOPIFY_TOKEN, "Content-Type": "application/json" } }
  );
  const data = await res.json();
  const active = (data.themes || []).find((t) => t.role === "main");
  if (!active) throw new Error("No se encontró tema activo");
  console.log(`[Theme] Tema activo: "${active.name}" (ID: ${active.id})`);
  return active.id;
}

// ─── SUBIR TEMPLATE AL TEMA ─────────────────────────────────
async function uploadTemplate(themeId, templateKey, templateJson) {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/themes/${themeId}/assets.json`,
    {
      method: "PUT",
      headers: { "X-Shopify-Access-Token": SHOPIFY_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({
        asset: { key: templateKey, value: JSON.stringify(templateJson, null, 2) },
      }),
    }
  );
  const data = await res.json();
  if (data.errors) throw new Error(`Error subiendo template: ${JSON.stringify(data.errors)}`);
  console.log(`[Theme] Template subido: ${templateKey}`);
  return data.asset;
}

// ─── GENERAR ID ÚNICO PARA SECCIONES ────────────────────────
function uid() {
  return Math.random().toString(36).substring(2, 8);
}

// ─── CONSTRUIR TEMPLATE DE LANDING PAGE ─────────────────────
// Genera un template product.landing-{handle}.json que usa
// secciones nativas del tema Master Escala
export function buildLandingTemplate(landing, options = {}) {
  const {
    countryData = {},
    formattedPrice = "",
    formattedCompare = "",
    whatsappNumber = "",
  } = options;

  const sections = {};
  const order = [];

  // ─── 1. BARRA DE URGENCIA SUPERIOR ─────────────────────────
  const barId = `bar_${uid()}`;
  const topBlocks = {};
  const topOrder = [];
  const topTexts = [
    `🔥 ${landing.urgency_text || "OFERTA POR TIEMPO LIMITADO — 50% OFF"}`,
    `📦 ${countryData.shipping || "Envío GRATIS a todo el país"}`,
    `⭐ +${landing.social_proof_count || "1,847"} clientes satisfechos en ${countryData.name || "LATAM"}`,
  ];
  for (const txt of topTexts) {
    const tId = `text_${uid()}`;
    topBlocks[tId] = { type: "text", settings: { title: txt } };
    topOrder.push(tId);
  }
  sections[barId] = {
    type: "escala-announcemnt-bar",
    blocks: topBlocks,
    block_order: topOrder,
    settings: {
      visibility: "always-display",
      speed: 3,
      mobile_spacing: 60,
      desktop_spacing: 100,
      bg_color: "#1a1a2e",
      text_color: "#ffffff",
      mobile_text_size: 14,
      desktop_text_size: 16,
      bold_text: true,
      uppercase_text: false,
      margin_top: 0,
      margin_bottom: 0,
      mobile_padding_top: 10,
      mobile_padding_bottom: 10,
      desktop_padding_top: 12,
      desktop_padding_bottom: 12,
    },
  };
  order.push(barId);

  // ─── 2. PRODUCTO PRINCIPAL ────────────────────────────────
  const mainId = "main";
  sections[mainId] = {
    type: "main-product",
    blocks: {
      title: { type: "title", settings: {} },
      [`reviews_${uid()}`]: { type: "reviews", settings: {} },
      price: {
        type: "price",
        settings: {
          show_skala_price: true,
          border_radius_percent: 14,
          border_percent_color: "#27AE60",
          save_bg_color: "#df0101",
          save_text_color: "#ffffff",
          price_color: "#006172",
          comparation_price_color: "#8a8f9b",
        },
      },
      [`info_${uid()}`]: {
        type: "information-price-escala",
        settings: {
          "show-free-shipping": true,
          "icon-information-1": "Compra Garantizada",
          "text-information-1": landing.guarantee_text || "30 días de garantía",
          "icon-information-2": "Más vendido en " + (countryData.name || "LATAM"),
          "text-information-2": "Entre los productos de esta categoría",
          background_color_information: "#f5feff",
          subtitle_color_information: "#006172",
          text_color_information: "#121212",
        },
      },
      [`variant_${uid()}`]: {
        type: "variant_picker",
        settings: { picker_type: "button", swatch_shape: "circle" },
      },
      buy_buttons: {
        type: "buy_buttons",
        settings: { show_dynamic_checkout: true, show_gift_card_recipient: false },
      },
      [`desc_${uid()}`]: { type: "description", settings: {} },
    },
    block_order: [],
    settings: {
      enable_sticky_info: true,
      color_scheme: "scheme-1",
      media_size: "large",
      constrain_to_viewport: true,
      media_fit: "contain",
      gallery_layout: "stacked",
      media_position: "left",
      image_zoom: "lightbox",
      mobile_thumbnails: "hide",
      hide_variants: true,
      enable_video_looping: false,
      padding_top: 36,
      padding_bottom: 12,
    },
  };
  sections[mainId].block_order = Object.keys(sections[mainId].blocks);
  order.push(mainId);

  // ─── 3. BENEFICIOS PRINCIPALES ────────────────────────────
  if (landing.bullet_points?.length > 0) {
    const benId = `beneficios_${uid()}`;
    const blocks = {};
    const blockOrder = [];
    for (const bp of landing.bullet_points.slice(0, 6)) {
      const bId = `benefit_${uid()}`;
      blocks[bId] = { type: "benefit", settings: { text: bp.replace(/^[✅🔥⭐💪🎯📦]\s?/, ""), icon_size: "30" } };
      blockOrder.push(bId);
    }
    sections[benId] = {
      type: "escala-beneficios-caracteristicas",
      blocks,
      block_order: blockOrder,
      settings: {
        section_title: "¿Por qué elegir este producto?",
        title_format: "h2",
        alignment: "left",
        background_color: "#ffffff",
        text_color: "#333333",
        text_size: "large",
        bold_text: false,
        italic_text: false,
      },
    };
    order.push(benId);
  }

  // ─── 4. PORCENTAJES DE SATISFACCIÓN ──────────────────────
  const pctId = `porcentajes_${uid()}`;
  sections[pctId] = {
    type: "escala-porcentajes",
    settings: {
      titulo: `¿Por qué miles confían en este producto?`,
      descripcion: `Descubre por qué +${landing.social_proof_count || "2,847"} personas en ${countryData.name || "LATAM"} ya lo tienen`,
      color_fondo: "#f8f8f8",
      color_texto: "#333333",
      beneficio_1_texto: "Satisfacción de los clientes",
      beneficio_1_porcentaje: 97,
      beneficio_2_texto: "Lo recomiendan a amigos y familia",
      beneficio_2_porcentaje: 95,
      beneficio_3_texto: "Volverían a comprarlo",
      beneficio_3_porcentaje: 98,
      color_circulo: "#27AE60",
    },
  };
  order.push(pctId);

  // ─── 5. TABLA COMPARATIVA ─────────────────────────────────
  if (landing.compare_table?.length > 0) {
    const tabId = `tabla_${uid()}`;
    const blocks = {};
    const blockOrder = [];
    for (const row of landing.compare_table) {
      const fId = `feature_${uid()}`;
      blocks[fId] = { type: "feature", settings: { feature_text: row.feature } };
      blockOrder.push(fId);
    }
    sections[tabId] = {
      type: "tabla-comparativa",
      blocks,
      block_order: blockOrder,
      settings: {
        border_width: 1,
        border_color: "#E0E0E0",
        table_radius: 12,
        check_color: "#27AE60",
        x_color: "#FF5252",
        brand_bg_color: "#E8F5E9",
        brand_text_color: "#000000",
        feature_text_color: "#333333",
        hover_bg_color: "#f9f9f9",
      },
    };
    order.push(tabId);
  }

  // ─── 6. REVIEWS CON FOTOS ─────────────────────────────────
  if (landing.testimonials?.length > 0) {
    const revId = `reviews_${uid()}`;
    const blocks = {};
    const blockOrder = [];
    for (const t of landing.testimonials.slice(0, 6)) {
      const rId = `review_${uid()}`;
      blocks[rId] = {
        type: "review",
        settings: {
          name: `${t.name}${t.city ? " — " + t.city : ""}`,
          verified: true,
          verified_text: "Compra verificada",
          rating: t.rating || 5,
          text: t.text,
          time_ago: "hace " + (Math.floor(Math.random() * 14) + 1) + " días",
        },
      };
      blockOrder.push(rId);
    }
    sections[revId] = {
      type: "reviews-buider",
      blocks,
      block_order: blockOrder,
      settings: {
        title: "Lo que dicen nuestros clientes",
        title_size: 22,
        avg_override: 5,
        count_override: parseInt(landing.social_proof_count?.replace(/,/g, "") || "2847"),
        dist_5: Math.max(landing.testimonials.length - 1, 1),
        dist_4: 1,
        dist_3: 0,
        dist_2: 0,
        dist_1: 0,
        show_photo_grid: true,
        accent: "#F5A623",
        bg: "#FFFFFF",
        card_bg: "#FFFFFF",
      },
    };
    order.push(revId);
  }

  // ─── 7. CARRUSEL DE RESEÑAS (MARQUESINA) ─────────────────
  if (landing.testimonials?.length > 0) {
    const carId = `carrusel_${uid()}`;
    const blocks = {};
    const blockOrder = [];
    for (const t of landing.testimonials.slice(0, 4)) {
      const cId = `review_${uid()}`;
      blocks[cId] = {
        type: "review",
        settings: {
          text: `"${t.text}" — ${t.name}`,
          author: `${countryData.flag || ""} ${t.name}${t.city ? ", " + t.city : ""}`,
          stars: t.rating || 5,
          verified: true,
        },
      };
      blockOrder.push(cId);
    }
    sections[carId] = {
      type: "carrusel-de-resenas",
      blocks,
      block_order: blockOrder,
      settings: {
        speed: 35,
        pause_hover: true,
        bg_color: "#ffffff",
        card_bg: "#1a1a2e",
        card_text: "#ffffff",
        padding_top: 20,
        padding_bottom: 20,
      },
    };
    order.push(carId);
  }

  // ─── 8. CARACTERÍSTICAS (segundo bloque de beneficios) ────
  if (landing.features?.length > 0) {
    const featId = `caract_${uid()}`;
    const blocks = {};
    const blockOrder = [];
    for (const f of landing.features.slice(0, 6)) {
      const fId = `benefit_${uid()}`;
      blocks[fId] = { type: "benefit", settings: { text: f.replace(/^[📐📏⚖️🎨📦🛡️]\s?/, ""), icon_size: "30" } };
      blockOrder.push(fId);
    }
    sections[featId] = {
      type: "escala-beneficios-caracteristicas",
      blocks,
      block_order: blockOrder,
      settings: {
        section_title: "Características técnicas",
        title_format: "h2",
        alignment: "left",
        background_color: "#f8fafa",
        text_color: "#333333",
        text_size: "large",
        bold_text: false,
        italic_text: false,
      },
    };
    order.push(featId);
  }

  // ─── 9. FAQ (CONTENIDO COLAPSABLE) ────────────────────────
  if (landing.faq?.length > 0) {
    const faqId = `faq_${uid()}`;
    const blocks = {};
    const blockOrder = [];
    for (const item of landing.faq) {
      const qId = `q_${uid()}`;
      blocks[qId] = {
        type: "collapsible_row",
        settings: {
          heading: item.q,
          icon: "question_mark",
          row_content: `<p>${item.a}</p>`,
        },
      };
      blockOrder.push(qId);
    }
    sections[faqId] = {
      type: "collapsible-content",
      blocks,
      block_order: blockOrder,
      settings: {
        heading: "Preguntas frecuentes",
        heading_size: "h1",
        heading_alignment: "center",
        layout: "none",
        color_scheme: "scheme-1",
        open_first_collapsible_row: true,
        padding_top: 36,
        padding_bottom: 36,
      },
    };
    order.push(faqId);
  }

  // ─── 10. SELLOS DE CONFIANZA (CAJA DE ICONOS) ────────────
  const iconId = `iconos_${uid()}`;
  const trustBlocks = {};
  const trustOrder = [];
  const badges = landing.trust_badges || ["Pago 100% Seguro", "Envío Protegido", "Soporte 24/7", "Compra Verificada"];
  for (const badge of badges.slice(0, 4)) {
    const bId = `icon_${uid()}`;
    trustBlocks[bId] = {
      type: "icon-card",
      settings: { icon_box_title: badge, icon_box_text: "" },
    };
    trustOrder.push(bId);
  }
  sections[iconId] = {
    type: "escala-caja-iconos",
    blocks: trustBlocks,
    block_order: trustOrder,
    settings: { icon_box_background_color: "#f8fafa", icon_box_text_color: "#333333" },
  };
  order.push(iconId);

  // ─── 11. BARRA DE MÉTODOS DE PAGO ──────────────────────────
  const bar2Id = `bar2_${uid()}`;
  const payBlocks = {};
  const payOrder = [];
  const payTexts = [
    `🛒 ${countryData.paymentMethods || "Todos los métodos de pago"}`,
    countryData.contraentrega ? "📦 ¡Paga al recibir! Contraentrega disponible" : `💳 Pago 100% seguro`,
    `🚚 ${countryData.shipping || "Envío gratis"}`,
  ];
  for (const txt of payTexts) {
    const tId = `text_${uid()}`;
    payBlocks[tId] = { type: "text", settings: { title: txt } };
    payOrder.push(tId);
  }
  sections[bar2Id] = {
    type: "escala-announcemnt-bar",
    blocks: payBlocks,
    block_order: payOrder,
    settings: {
      visibility: "always-display",
      speed: 3,
      bg_color: "#059669",
      text_color: "#ffffff",
      bold_text: true,
      mobile_text_size: 14,
      desktop_text_size: 16,
      mobile_padding_top: 10,
      mobile_padding_bottom: 10,
      desktop_padding_top: 12,
      desktop_padding_bottom: 12,
    },
  };
  order.push(bar2Id);

  // ─── 12. BARRA FINAL DE URGENCIA ──────────────────────────
  const bar3Id = `bar3_${uid()}`;
  const urgBlocks = {};
  const urgOrder = [];
  const urgTexts = [
    `⚡ ${landing.urgency_text || "OFERTA POR TIEMPO LIMITADO"}`,
    `🔥 +${landing.social_proof_count || "1,847"} personas ya lo compraron en ${countryData.name || "LATAM"}`,
    `✅ Garantía de satisfacción 30 días`,
  ];
  for (const txt of urgTexts) {
    const tId = `text_${uid()}`;
    urgBlocks[tId] = { type: "text", settings: { title: txt } };
    urgOrder.push(tId);
  }
  sections[bar3Id] = {
    type: "escala-announcemnt-bar",
    blocks: urgBlocks,
    block_order: urgOrder,
    settings: {
      visibility: "always-display",
      speed: 3,
      bg_color: "#DC2626",
      text_color: "#ffffff",
      bold_text: true,
      mobile_text_size: 14,
      desktop_text_size: 16,
      mobile_padding_top: 10,
      mobile_padding_bottom: 10,
      desktop_padding_top: 12,
      desktop_padding_bottom: 12,
    },
  };
  order.push(bar3Id);

  // ─── 13. BLOCK CLICK (anti right-click) ───────────────────
  const blockId = `block_${uid()}`;
  sections[blockId] = {
    type: "escala-block-click",
    settings: {},
  };
  order.push(blockId);

  return { sections, order };
}

// ─── CREAR Y SUBIR TEMPLATE PARA UN PRODUCTO ───────────────
export async function createProductTemplate(landing, handle, options = {}) {
  try {
    const themeId = await getActiveThemeId();
    const template = buildLandingTemplate(landing, options);
    const templateKey = `templates/product.landing-${handle}.json`;

    await uploadTemplate(themeId, templateKey, template);

    console.log(`[Theme] Template creado: ${templateKey}`);
    return {
      ok: true,
      templateKey,
      templateSuffix: `landing-${handle}`,
      sectionsCount: Object.keys(template.sections).length,
    };
  } catch (err) {
    console.error(`[Theme] Error creando template:`, err.message);
    return { ok: false, error: err.message };
  }
}

// ─── ASIGNAR TEMPLATE A PRODUCTO ────────────────────────────
export async function assignTemplateToProduct(productId, templateSuffix) {
  try {
    const res = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/products/${productId}.json`,
      {
        method: "PUT",
        headers: { "X-Shopify-Access-Token": SHOPIFY_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { id: productId, template_suffix: templateSuffix },
        }),
      }
    );
    const data = await res.json();
    if (data.errors) throw new Error(JSON.stringify(data.errors));
    console.log(`[Theme] Producto ${productId} asignado a template: ${templateSuffix}`);
    return { ok: true };
  } catch (err) {
    console.error(`[Theme] Error asignando template:`, err.message);
    return { ok: false, error: err.message };
  }
}
