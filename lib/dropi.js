// lib/dropi.js
// ============================================================
// DROPI API — Conexión directa con login por país
// CR, GT, CO — extrae productos con fotos y precios reales
// ============================================================

const DROPI_COUNTRIES = {
  CR: { api: "https://api.dropi.cr", email: process.env.DROPI_CR_EMAIL, password: process.env.DROPI_CR_PASSWORD, name: "Costa Rica", currency: "CRC", symbol: "₡" },
  GT: { api: "https://api.dropi.gt", email: process.env.DROPI_GT_EMAIL, password: process.env.DROPI_GT_PASSWORD, name: "Guatemala", currency: "GTQ", symbol: "Q" },
  CO: { api: "https://api.dropi.co", email: process.env.DROPI_CO_EMAIL, password: process.env.DROPI_CO_PASSWORD, name: "Colombia", currency: "COP", symbol: "$" },
};

// Cache de tokens para no hacer login cada vez
const tokenCache = {};

// ─── LOGIN EN DROPI ─────────────────────────────────────────
async function getToken(countryCode) {
  const cc = countryCode.toUpperCase();
  const config = DROPI_COUNTRIES[cc];
  if (!config || !config.email) {
    console.log(`[Dropi] No hay credenciales para ${cc}`);
    return null;
  }

  // Usar cache si el token no ha expirado (4 horas)
  if (tokenCache[cc] && tokenCache[cc].expires > Date.now()) {
    return tokenCache[cc].token;
  }

  try {
    console.log(`[Dropi] Login en Dropi ${config.name}...`);
    const res = await fetch(`${config.api}/integrations/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        email: config.email,
        password: config.password,
        white_brand_id: 1,
      }),
    });

    const data = await res.json();
    if (data.isSuccess && data.token) {
      tokenCache[cc] = { token: data.token, expires: Date.now() + 4 * 60 * 60 * 1000 };
      console.log(`[Dropi] Login exitoso en ${config.name}`);
      return data.token;
    }

    console.error(`[Dropi] Login fallido en ${config.name}:`, data.message);
    return null;
  } catch (err) {
    console.error(`[Dropi] Error login ${config.name}:`, err.message);
    return null;
  }
}

// ─── BUSCAR PRODUCTO POR ID ─────────────────────────────────
export async function getDropiProduct(productId, countryCode = "CR") {
  const cc = countryCode.toUpperCase();
  const config = DROPI_COUNTRIES[cc];
  if (!config) return null;

  const token = await getToken(cc);
  if (!token) return null;

  try {
    // Intentar obtener detalles del producto
    const res = await fetch(`${config.api}/product/photos/${productId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "dropi-integration-key": token,
        "Accept": "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[Dropi] Error obteniendo producto ${productId}:`, err.message);
    return null;
  }
}

// ─── BUSCAR PRODUCTOS POR NOMBRE ────────────────────────────
export async function searchDropiProducts(query, options = {}) {
  const { country = "CR", limit = 10 } = options;
  const cc = country.toUpperCase();
  const config = DROPI_COUNTRIES[cc];
  if (!config) {
    console.log(`[Dropi] País ${cc} no soportado`);
    return [];
  }

  const token = await getToken(cc);
  if (!token) return [];

  try {
    console.log(`[Dropi ${config.name}] Buscando "${query}"...`);

    // Intentar POST a integrations/products
    const res = await fetch(`${config.api}/integrations/products`, {
      method: "POST",
      headers: {
        "dropi-integration-key": token,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ page: 1, per_page: limit, search: query }),
    });

    if (!res.ok) {
      console.log(`[Dropi ${config.name}] products endpoint: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.isSuccess) {
      console.log(`[Dropi ${config.name}] ${data.message || "Error"}`);
      return [];
    }

    const products = data.data?.data || data.data || [];
    console.log(`[Dropi ${config.name}] ${products.length} productos encontrados`);

    return products.map(normalizeProduct).filter(Boolean);
  } catch (err) {
    console.error(`[Dropi ${config.name}] Error buscando:`, err.message);
    return [];
  }
}

// ─── NORMALIZAR PRODUCTO DE DROPI ───────────────────────────
function normalizeProduct(raw) {
  if (!raw) return null;

  const images = [];
  // Extraer imágenes de diferentes campos posibles
  if (raw.images && Array.isArray(raw.images)) {
    for (const img of raw.images) {
      if (typeof img === "string") images.push(img);
      else if (img.src || img.url) images.push(img.src || img.url);
    }
  }
  if (raw.gallery && Array.isArray(raw.gallery)) {
    for (const img of raw.gallery) {
      if (typeof img === "string") images.push(img);
      else if (img.src || img.url) images.push(img.src || img.url);
    }
  }
  if (raw.url_images && Array.isArray(raw.url_images)) {
    images.push(...raw.url_images.filter(u => typeof u === "string"));
  }
  if (raw.image) images.push(typeof raw.image === "string" ? raw.image : raw.image.src || "");
  if (raw.img) images.push(raw.img);
  if (raw.gallery_url) images.push(raw.gallery_url);

  return {
    id: raw.id,
    name: raw.name || raw.title || "",
    description: raw.description || raw.desc || "",
    price_local: raw.price || raw.sale_price || null,
    compare_price_local: raw.compare_price || raw.regular_price || null,
    images: images.filter(u => u && typeof u === "string" && u.startsWith("http")),
    category: raw.category || raw.category_name || "",
    stock: raw.stock || raw.quantity || null,
    sku: raw.sku || raw.reference || "",
    weight: raw.weight || null,
    source: "dropi-api",
  };
}

// ─── FUNCIÓN PRINCIPAL: ENRIQUECER CON DROPI ────────────────
export async function enrichWithDropi(productName, options = {}) {
  const { country = "CR" } = options;

  try {
    const results = await searchDropiProducts(productName, { country, limit: 5 });

    if (results.length === 0) {
      return { found: false, product: null, images: [], dropiCountry: DROPI_COUNTRIES[country.toUpperCase()]?.name };
    }

    const best = results[0];

    const cc = country.toUpperCase();
    const countryConfig = DROPI_COUNTRIES[cc];
    return {
      found: true,
      dropiCountry: countryConfig?.name || country,
      dropiCurrency: countryConfig?.currency || "",
      product: {
        name: best.name,
        description: best.description,
        price_local: best.price_local,
        currency: countryConfig?.currency || "",
        country: cc,
        compare_price_local: best.compare_price_local,
        stock: best.stock,
        category: best.category,
        sku: best.sku,
        url: null,
      },
      images: best.images || [],
      allResults: results,
    };
  } catch (err) {
    console.error(`[Dropi] Error enriqueciendo "${productName}":`, err.message);
    return { found: false, product: null, images: [] };
  }
}

// ─── EXTRAER IMÁGENES DE URL DE DROPI ───────────────────────
// Cuando el usuario pega una URL tipo app.dropi.XX/dashboard/product-details/ID
export async function extractDropiProductFromUrl(dropiUrl) {
  try {
    const urlObj = new URL(dropiUrl);
    const host = urlObj.hostname; // app.dropi.cr, app.dropi.gt, etc.

    // Extraer país del dominio
    let country = "CR";
    if (host.includes("dropi.gt")) country = "GT";
    else if (host.includes("dropi.co")) country = "CO";
    else if (host.includes("dropi.cr")) country = "CR";

    // Extraer product ID de la URL
    const idMatch = dropiUrl.match(/product-details\/(\d+)/);
    if (!idMatch) {
      // Intentar buscar por nombre del slug
      const slugMatch = dropiUrl.match(/product-details\/\d+\/(.+)/);
      const searchTerm = slugMatch ? slugMatch[1].replace(/-/g, " ") : "";
      if (searchTerm) {
        console.log(`[Dropi] Buscando producto por nombre: "${searchTerm}" en ${country}`);
        return enrichWithDropi(searchTerm, { country });
      }
      return { found: false, product: null, images: [] };
    }

    const productId = idMatch[1];
    console.log(`[Dropi] Extrayendo producto ${productId} de Dropi ${country}`);

    // Buscar el producto por nombre (extraído del slug de la URL)
    const slugMatch = dropiUrl.match(/product-details\/\d+\/(.+)/);
    const searchTerm = slugMatch ? slugMatch[1].replace(/-/g, " ") : `product ${productId}`;

    return enrichWithDropi(searchTerm, { country });
  } catch (err) {
    console.error(`[Dropi] Error extrayendo de URL:`, err.message);
    return { found: false, product: null, images: [] };
  }
}
