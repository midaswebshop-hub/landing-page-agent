// lib/seo_microdata.js
// ============================================================
// SEO MICRODATA — JSON-LD Structured Data para productos
//
// Genera markup Schema.org que Google usa para:
// - Rich snippets con precio en resultados de búsqueda
// - Estrellitas de rating (si hay reviews reales)
// - Disponibilidad de stock
// - Breadcrumbs de navegación
//
// Mejora CTR orgánico sin costo — se pone una vez y trabaja solo
//
// Archivo nuevo — NO modifica ningún archivo existente
// ============================================================

// ─── PRODUCT SCHEMA ─────────────────────────────────────────
// Schema.org/Product — lo que Google necesita para rich snippets
export function buildProductSchema(productData) {
  const {
    name,
    description,
    price,
    comparePrice,
    currency = "CRC",
    images = [],
    sku,
    brand = "Escala 100K",
    stock,
    shopifyUrl,
    countryCode = "CR",
  } = productData;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || name,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      url: shopifyUrl || "",
      priceCurrency: currency,
      price: parseFloat(price) || 0,
      availability: stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: brand,
      },
    },
  };

  // Add compare price as original price
  if (comparePrice && parseFloat(comparePrice) > parseFloat(price)) {
    schema.offers.priceValidUntil = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString().slice(0, 10);
  }

  // Add images
  if (images.length > 0) {
    schema.image = images.length === 1 ? images[0] : images;
  }

  // Add SKU
  if (sku) {
    schema.sku = sku;
  }

  // Shipping details per country
  const shippingMap = {
    CR: { country: "CR", currency: "CRC", days: "3-5" },
    GT: { country: "GT", currency: "GTQ", days: "3-7" },
    CO: { country: "CO", currency: "COP", days: "2-5" },
  };

  const shipping = shippingMap[countryCode] || shippingMap.CR;
  schema.offers.shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: shipping.country,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 2,
        unitCode: "d",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: parseInt(shipping.days.split("-")[0]),
        maxValue: parseInt(shipping.days.split("-")[1]),
        unitCode: "d",
      },
    },
  };

  return schema;
}

// ─── BREADCRUMB SCHEMA ──────────────────────────────────────
export function buildBreadcrumbSchema(productName, categoryName = "Productos", shopifyUrl = "") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: shopifyUrl ? shopifyUrl.split("/products")[0] : "",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: shopifyUrl ? shopifyUrl.split("/products")[0] + "/collections/all" : "",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
      },
    ],
  };
}

// ─── ORGANIZATION SCHEMA ────────────────────────────────────
export function buildOrganizationSchema(opts = {}) {
  const {
    name = "Escala 100K",
    url = "",
    contactEmail = "",
    whatsappNumber = "",
  } = opts;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
  };

  if (contactEmail) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      email: contactEmail,
      contactType: "customer service",
    };
  }

  return schema;
}

// ─── GENERAR SCRIPT TAG CON TODOS LOS SCHEMAS ───────────────
// Returns an HTML <script> tag ready to inject in the landing
export function buildSEOScriptTag(productData) {
  const schemas = [
    buildProductSchema(productData),
    buildBreadcrumbSchema(
      productData.name,
      productData.category || "Productos",
      productData.shopifyUrl
    ),
  ];

  return schemas
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    )
    .join("\n");
}
