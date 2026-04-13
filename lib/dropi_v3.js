// lib/dropi_v3.js
// ============================================================
// DROPI SCRAPER v3 — Extracción de imágenes REALES con Puppeteer
// Abre la SPA Angular de Dropi como un browser real,
// hace login, navega al producto y extrae las imágenes del DOM.
// Fallback: Google Images con queries específicas.
// NO TOCAR dropi_v2.js — esta es versión nueva
// ============================================================

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const CLOUDFRONT_BASE = "https://d3sk39qh2f4j46.cloudfront.net";

const DROPI_COUNTRIES = {
  CR: { name: "Costa Rica", currency: "CRC", symbol: "₡", web: "https://app.dropi.cr" },
  GT: { name: "Guatemala", currency: "GTQ", symbol: "Q", web: "https://app.dropi.gt" },
  CO: { name: "Colombia", currency: "COP", symbol: "$", web: "https://app.dropi.co" },
};

// Credenciales web del dashboard (no las de integración)
const WEB_EMAIL = process.env.DROPI_WEB_EMAIL || "zionyxshop.web@gmail.com";
const WEB_PASSWORD = process.env.DROPI_WEB_PASSWORD || "Web.shop.@055";

// ─── EXTRAER PRODUCTO DE URL DE DROPI ───────────────────────
export async function extractDropiProductFromUrl(dropiUrl) {
  try {
    const urlObj = new URL(dropiUrl);
    const host = urlObj.hostname;

    let country = "CR";
    if (host.includes("dropi.gt")) country = "GT";
    else if (host.includes("dropi.co")) country = "CO";

    const idMatch = dropiUrl.match(/product-details\/(\d+)/);
    const slugMatch = dropiUrl.match(/product-details\/\d+\/(.+)/);
    const productId = idMatch ? idMatch[1] : null;
    const productName = slugMatch ? slugMatch[1].replace(/-/g, " ") : "Producto";
    const countryConfig = DROPI_COUNTRIES[country];

    console.log(`[Dropi v3] Extrayendo "${productName}" (ID:${productId}) de ${countryConfig.name}`);

    // Estrategia 1: Puppeteer — abrir la SPA como browser real
    let images = [];
    let productData = null;

    try {
      const puppeteerResult = await scrapeWithPuppeteer(dropiUrl, country, productName);
      images = puppeteerResult.images;
      productData = puppeteerResult.product;
      if (images.length > 0) {
        console.log(`[Dropi v3] Puppeteer: ${images.length} imágenes reales extraídas`);
      }
    } catch (err) {
      console.log(`[Dropi v3] Puppeteer no disponible: ${err.message}`);
    }

    // Estrategia 2: Interceptar XHR — buscar imágenes en network requests
    if (images.length === 0) {
      console.log(`[Dropi v3] Intentando interceptar XHR de la SPA...`);
      const xhrImages = await interceptXhrImages(dropiUrl, productId, country);
      if (xhrImages.length > 0) {
        images = xhrImages;
        console.log(`[Dropi v3] XHR intercept: ${images.length} imágenes`);
      }
    }

    // Estrategia 3: Google Images con query MUY específica
    if (images.length === 0) {
      console.log(`[Dropi v3] Buscando en Google Images...`);
      images = await searchGoogleImages(productName, countryConfig.name);
    }

    console.log(`[Dropi v3] Total: ${images.length} imágenes para "${productName}"`);

    return {
      found: images.length > 0 || !!productData,
      dropiCountry: countryConfig.name,
      dropiCurrency: countryConfig.currency,
      product: {
        name: productData?.name || productName,
        description: productData?.description || "",
        price_local: productData?.price || null,
        currency: countryConfig.currency,
        country,
        compare_price_local: productData?.comparePrice || null,
        stock: productData?.stock || null,
        category: productData?.category || "",
        sku: "",
        url: dropiUrl,
      },
      images,
      allResults: [],
    };
  } catch (err) {
    console.error(`[Dropi v3] Error:`, err.message);
    return { found: false, product: null, images: [] };
  }
}

// ─── ESTRATEGIA 1: PUPPETEER ────────────────────────────────
async function scrapeWithPuppeteer(dropiUrl, country, productName) {
  let browser = null;
  const result = { images: [], product: null };

  try {
    const puppeteer = await import("puppeteer");
    browser = await puppeteer.default.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
      timeout: 30000,
    });

    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 1280, height: 800 });

    // Interceptar requests de API para capturar datos del producto
    const apiResponses = [];
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/") && url.includes("product") && response.status() === 200) {
        try {
          const json = await response.json();
          apiResponses.push(json);
        } catch {}
      }
    });

    // Ir al login de Dropi
    const config = DROPI_COUNTRIES[country];
    console.log(`[Dropi v3] Puppeteer: navegando a login...`);
    await page.goto(`${config.web}/login`, { waitUntil: "networkidle2", timeout: 30000 });

    // Llenar formulario de login
    await page.waitForSelector('input[type="email"], input[formcontrolname="email"], input[name="email"]', { timeout: 10000 });
    await page.type('input[type="email"], input[formcontrolname="email"], input[name="email"]', WEB_EMAIL, { delay: 50 });
    await page.type('input[type="password"], input[formcontrolname="password"], input[name="password"]', WEB_PASSWORD, { delay: 50 });

    // Click login button
    const loginBtn = await page.$('button[type="submit"], button.btn-login, .login-btn');
    if (loginBtn) await loginBtn.click();

    // Esperar a que cargue el dashboard
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));

    // Navegar al producto
    console.log(`[Dropi v3] Puppeteer: navegando al producto...`);
    await page.goto(dropiUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000)); // Esperar a que la SPA cargue los datos

    // Extraer imágenes del DOM
    const domImages = await page.evaluate(() => {
      const imgs = new Set();

      // Buscar todas las imágenes en la página
      document.querySelectorAll("img").forEach((img) => {
        const src = img.src || img.getAttribute("data-src") || img.getAttribute("ng-src");
        if (src && src.startsWith("http") && !src.includes("logo") && !src.includes("avatar") && !src.includes("icon")) {
          // Solo imágenes grandes (producto)
          if (img.naturalWidth > 100 || img.width > 100 || !img.naturalWidth) {
            imgs.add(src);
          }
        }
      });

      // Buscar imágenes en background-image
      document.querySelectorAll("[style*='background-image']").forEach((el) => {
        const match = el.style.backgroundImage.match(/url\(["']?(https?:\/\/[^"')]+)/);
        if (match && !match[1].includes("logo")) imgs.add(match[1]);
      });

      // Buscar en galleries/carousels de Angular
      document.querySelectorAll("[src], [data-image], [data-src]").forEach((el) => {
        const src = el.getAttribute("src") || el.getAttribute("data-image") || el.getAttribute("data-src");
        if (src && src.startsWith("http") && src.includes("cloudfront")) imgs.add(src);
      });

      return [...imgs];
    });

    // Filtrar imágenes del producto (no UI, no logos)
    result.images = domImages.filter((url) => {
      const lower = url.toLowerCase();
      return (
        !lower.includes("logo") &&
        !lower.includes("icon") &&
        !lower.includes("avatar") &&
        !lower.includes("favicon") &&
        !lower.includes("banner") &&
        !lower.includes("unicons") &&
        !lower.includes("flags/") &&
        url.length > 30
      );
    }).slice(0, 10);

    // Extraer datos del producto de las respuestas XHR interceptadas
    for (const apiData of apiResponses) {
      const obj = apiData?.objects || apiData?.data;
      if (obj && typeof obj === "object" && (obj.name || obj.title)) {
        result.product = {
          name: obj.name || obj.title,
          description: obj.description || obj.dropi_app_description || "",
          price: obj.sale_price || obj.price || null,
          comparePrice: obj.suggested_price || obj.compare_price || null,
          stock: obj.stock || null,
          category: obj.categories?.[0]?.name || "",
        };

        // Extraer imágenes adicionales del objeto API
        const apiImgs = extractImagesFromProduct(obj);
        if (apiImgs.length > 0) {
          result.images = [...new Set([...apiImgs, ...result.images])];
        }
        break;
      }
    }

    // Extraer datos del DOM si no vinieron de la API
    if (!result.product) {
      const domData = await page.evaluate(() => {
        const name = document.querySelector("h1, .product-name, .product-title")?.textContent?.trim();
        const price = document.querySelector(".price, .sale-price, .product-price")?.textContent?.trim();
        return { name, price };
      });
      if (domData.name) {
        result.product = { name: domData.name, description: "", price: domData.price };
      }
    }

    console.log(`[Dropi v3] Puppeteer: ${result.images.length} imágenes del DOM, producto: ${result.product?.name || "no"}`);

  } catch (err) {
    console.error(`[Dropi v3] Puppeteer error: ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  return result;
}

// ─── ESTRATEGIA 2: INTERCEPTAR XHR ─────────────────────────
async function interceptXhrImages(dropiUrl, productId, country) {
  // Intentar scrapear la página buscando datos pre-renderizados
  try {
    const res = await fetch(dropiUrl, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const images = new Set();

    // Buscar URLs de CloudFront
    const patterns = [
      /https?:\/\/d3sk39qh2f4j46\.cloudfront\.net\/[^"'\s\\]+/gi,
      /https?:\/\/[a-z0-9]+\.cloudfront\.net\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp)[^"'\s\\]*/gi,
      /https?:\/\/res\.cloudinary\.com\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imgUrl = match[0].replace(/\\/g, "").replace(/&amp;/g, "&");
        if (isValidProductImage(imgUrl)) images.add(imgUrl);
      }
    }

    // Buscar paths de imagen en JSON embebido
    const pathPattern = /"(?:image|img|photo|gallery_url|url_image)"\s*:\s*"([^"]+)"/gi;
    let match;
    while ((match = pathPattern.exec(html)) !== null) {
      const path = match[1].replace(/\\/g, "");
      if (path.startsWith("http") && isValidProductImage(path)) {
        images.add(path);
      } else if (path.includes("/") && !path.startsWith("http")) {
        const fullUrl = `${CLOUDFRONT_BASE}/${path}`;
        images.add(fullUrl);
      }
    }

    return [...images].slice(0, 10);
  } catch {
    return [];
  }
}

// ─── ESTRATEGIA 3: GOOGLE IMAGES ────────────────────────────
async function searchGoogleImages(productName, countryName) {
  try {
    const queries = [
      `"${productName}" producto`,
      `${productName} dropshipping`,
    ];

    const allImages = [];

    for (const q of queries) {
      if (allImages.length >= 5) break;

      const query = encodeURIComponent(q);
      const res = await fetch(`https://www.google.com/search?q=${query}&tbm=isch&hl=es`, {
        headers: { "User-Agent": UA, "Accept": "text/html" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Imágenes de alta calidad
      const imgPattern = /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",(\d+),(\d+)\]/gi;
      let match;
      while ((match = imgPattern.exec(html)) !== null && allImages.length < 8) {
        const url = match[1].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&");
        const width = parseInt(match[2]);
        const height = parseInt(match[3]);

        if (width >= 300 && height >= 300 && isValidProductImage(url) && !url.includes("gstatic")) {
          allImages.push(url);
        }
      }
    }

    console.log(`[Dropi v3] Google Images: ${allImages.length} encontradas`);
    return [...new Set(allImages)].slice(0, 6);
  } catch {
    return [];
  }
}

// ─── EXTRAER IMÁGENES DE OBJETO PRODUCTO ────────────────────
function extractImagesFromProduct(obj) {
  if (!obj) return [];
  const images = new Set();

  if (obj.image && typeof obj.image === "string") {
    images.add(obj.image.startsWith("http") ? obj.image : `${CLOUDFRONT_BASE}/${obj.image}`);
  }

  const arrayKeys = ["gallery", "url_images", "multimedia", "images", "photos", "product_images"];
  for (const key of arrayKeys) {
    const val = obj[key];
    if (!Array.isArray(val)) continue;
    for (const item of val) {
      if (typeof item === "string" && item.length > 5) {
        images.add(item.startsWith("http") ? item : `${CLOUDFRONT_BASE}/${item}`);
      } else if (item?.src) images.add(item.src.startsWith("http") ? item.src : `${CLOUDFRONT_BASE}/${item.src}`);
      else if (item?.url) images.add(item.url.startsWith("http") ? item.url : `${CLOUDFRONT_BASE}/${item.url}`);
      else if (item?.image) images.add(item.image.startsWith("http") ? item.image : `${CLOUDFRONT_BASE}/${item.image}`);
    }
  }

  if (Array.isArray(obj.variations)) {
    for (const v of obj.variations) {
      if (v.image) images.add(v.image.startsWith("http") ? v.image : `${CLOUDFRONT_BASE}/${v.image}`);
    }
  }

  return [...images].filter(isValidProductImage);
}

// ─── VALIDAR IMAGEN ─────────────────────────────────────────
function isValidProductImage(url) {
  if (!url || typeof url !== "string" || url.length < 30) return false;
  const lower = url.toLowerCase();
  if (lower.includes("logo") || lower.includes("icon") || lower.includes("avatar")) return false;
  if (lower.includes("favicon") || lower.includes("banner") || lower.includes("placeholder")) return false;
  if (lower.includes("1x1") || lower.includes("pixel") || lower.endsWith(".svg")) return false;
  if (lower.includes("user/") && lower.includes("/logo/")) return false;
  if (lower.includes("flags/") || lower.includes("unicons")) return false;
  return true;
}
