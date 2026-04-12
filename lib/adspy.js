// lib/adspy.js
// ============================================================
// AD SPY PRO — Extrae creativos, imágenes y videos de ads de
// múltiples plataformas GRATIS (sin API keys)
// Fuentes: Facebook Ads Library, TikTok Creative Center,
//          Google, Pinterest, y scraping directo
// ============================================================

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// ─── FUNCIÓN PRINCIPAL: BUSCAR CREATIVOS DE PRODUCTO ────────
// Busca en todas las fuentes disponibles y retorna imágenes PRO
export async function spyProductAds(productName, options = {}) {
  const { country = "CR", count = 10 } = options;
  const countryMap = { CR: "CR", CO: "CO", GT: "GT", MX: "MX", PA: "PA", EC: "EC", PE: "PE", CL: "CL", AR: "AR", BR: "BR", US: "US", ES: "ES" };
  const cc = countryMap[country] || "ALL";

  console.log(`[AdSpy] Buscando creativos para "${productName}" en ${cc}...`);

  // Buscar en paralelo en todas las fuentes
  const [fbImages, tiktokImages, pinterestImages, googleImages] = await Promise.all([
    searchFacebookAdsLibrary(productName, cc).catch(() => []),
    searchTikTokCreativeCenter(productName).catch(() => []),
    searchPinterestAds(productName).catch(() => []),
    searchGoogleShoppingImages(productName).catch(() => []),
  ]);

  // Combinar y eliminar duplicados
  const all = [...fbImages, ...tiktokImages, ...pinterestImages, ...googleImages];
  const unique = [...new Set(all.filter(u => typeof u === "string" && u.startsWith("http")))];

  console.log(`[AdSpy] Total: ${unique.length} creativos (FB:${fbImages.length} TK:${tiktokImages.length} PIN:${pinterestImages.length} G:${googleImages.length})`);

  return unique.slice(0, count);
}

// ─── FACEBOOK ADS LIBRARY (público, sin API key) ────────────
async function searchFacebookAdsLibrary(query, country) {
  try {
    // La biblioteca de anuncios de Facebook es pública
    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encodeURIComponent(query)}&media_type=image`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "es-419,es;q=0.9",
      },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const images = new Set();

    // Extraer imágenes de ads de los datos embebidos
    // Facebook embebe las imágenes en varios formatos
    const patterns = [
      // Imágenes de creativos en el HTML
      /https?:\/\/scontent[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi,
      // Imágenes de external_url
      /"image_url"\s*:\s*"(https?:\/\/[^"]+)"/g,
      // Previews
      /data-imgurl="(https?:\/\/[^"]+)"/gi,
      // og:image
      /content="(https?:\/\/scontent[^"]+)"/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imgUrl = (match[1] || match[0]).replace(/&amp;/g, "&").replace(/\\u0025/g, "%").replace(/\\/g, "");
        if (imgUrl.includes("scontent") && !imgUrl.includes("emoji") && !imgUrl.includes("_s.") && !imgUrl.includes("_t.")) {
          images.add(imgUrl);
        }
      }
    }

    console.log(`[AdSpy] Facebook Ads Library: ${images.size} imágenes`);
    return [...images].slice(0, 8);
  } catch (err) {
    console.error("[AdSpy] Error FB Ads Library:", err.message);
    return [];
  }
}

// ─── TIKTOK CREATIVE CENTER (público) ───────────────────────
async function searchTikTokCreativeCenter(query) {
  try {
    const url = `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?keyword=${encodeURIComponent(query)}&period=30&region=all`;

    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const images = new Set();

    // TikTok embebe thumbnails de videos
    const patterns = [
      /https?:\/\/p\d+-sign[^"'\s]+\.(?:jpeg|jpg|png|webp)[^"'\s]*/gi,
      /"cover_url"\s*:\s*"(https?:\/\/[^"]+)"/g,
      /"thumbnail"\s*:\s*"(https?:\/\/[^"]+)"/g,
      /https?:\/\/[^"'\s]*tiktokcdn[^"'\s]*\.(?:jpeg|jpg|png|webp)[^"'\s]*/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imgUrl = (match[1] || match[0]).replace(/\\u002F/g, "/").replace(/\\/g, "");
        if (imgUrl.startsWith("http") && !imgUrl.includes("avatar") && !imgUrl.includes("icon")) {
          images.add(imgUrl);
        }
      }
    }

    console.log(`[AdSpy] TikTok Creative Center: ${images.size} imágenes`);
    return [...images].slice(0, 6);
  } catch (err) {
    console.error("[AdSpy] Error TikTok:", err.message);
    return [];
  }
}

// ─── PINTEREST ADS (búsqueda pública) ──────────────────────
async function searchPinterestAds(query) {
  try {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query + " product ad")}&rs=typed`;

    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const images = new Set();

    // Pinterest embebe imágenes en formato específico
    const patterns = [
      /https?:\/\/i\.pinimg\.com\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi,
      /"image_large_url"\s*:\s*"(https?:\/\/[^"]+)"/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let imgUrl = (match[1] || match[0]).replace(/\\u002F/g, "/").replace(/\\/g, "");
        // Convertir a versión grande
        imgUrl = imgUrl.replace("/236x/", "/736x/").replace("/474x/", "/736x/");
        if (imgUrl.startsWith("http")) images.add(imgUrl);
      }
    }

    console.log(`[AdSpy] Pinterest: ${images.size} imágenes`);
    return [...images].slice(0, 6);
  } catch (err) {
    console.error("[AdSpy] Error Pinterest:", err.message);
    return [];
  }
}

// ─── GOOGLE SHOPPING IMAGES (público) ───────────────────────
async function searchGoogleShoppingImages(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop&hl=es`;

    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html", "Accept-Language": "es-419,es;q=0.9" },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const images = new Set();

    // Google Shopping embebe imágenes en data URIs y URLs
    const patterns = [
      /https?:\/\/encrypted-tbn\d\.gstatic\.com\/shopping[^"'\s>]+/gi,
      /"ou"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
      /https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imgUrl = (match[1] || match[0]).replace(/&amp;/g, "&");
        if (imgUrl.startsWith("http") && imgUrl.length > 50 && !imgUrl.includes("logo") && !imgUrl.includes("icon") && !imgUrl.includes("gstatic.com/images")) {
          images.add(imgUrl);
        }
      }
    }

    console.log(`[AdSpy] Google Shopping: ${images.size} imágenes`);
    return [...images].slice(0, 6);
  } catch (err) {
    console.error("[AdSpy] Error Google Shopping:", err.message);
    return [];
  }
}

// ─── BUSCAR GIFS DEL PRODUCTO ───────────────────────────────
export async function searchProductGifs(productName) {
  try {
    // Buscar GIFs en Tenor (gratis, no necesita API key para búsqueda web)
    const url = `https://tenor.com/search/${encodeURIComponent(productName + " product")}-gifs`;

    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const gifs = new Set();
    const pattern = /https?:\/\/media[^"'\s]*tenor[^"'\s]*\.gif/gi;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      gifs.add(match[0]);
    }

    console.log(`[AdSpy] Tenor GIFs: ${gifs.size} encontrados`);
    return [...gifs].slice(0, 5);
  } catch (err) {
    console.error("[AdSpy] Error buscando GIFs:", err.message);
    return [];
  }
}
