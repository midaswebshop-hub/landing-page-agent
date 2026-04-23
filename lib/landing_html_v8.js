// lib/landing_html_v8.js
// ============================================================
// BUILDER HTML v8 — Compliant Landing Page
//
// Basado en v7 (mismo diseño) pero con correcciones:
// 1. Stock REAL de Dropi (no random)
// 2. Footer legal obligatorio (privacy, terms, refund)
// 3. Cookie consent banner
// 4. Pixel disclosure
// 5. Sin urgencia falsa
// 6. Disclaimers de producto
//
// Importa v7 y legal_footer como dependencias.
// NO modifica landing_html_v7.js
//
// Env vars necesarias: ninguna
// ============================================================

import { buildLandingHTML_v7 } from "./landing_html_v7.js";
import { buildLegalFooter, buildPixelDisclosure } from "./legal_footer.js";

/**
 * Genera landing HTML v8 (compliant)
 * @param {Object} landingData - Mismos datos que v7
 * @param {Object} complianceOpts - Opciones de compliance
 * @param {number} complianceOpts.realStock - Stock real de Dropi (no random)
 * @param {string} complianceOpts.storeName - Nombre de la tienda
 * @param {string} complianceOpts.contactEmail - Email de soporte
 * @param {string} complianceOpts.whatsappNumber - WhatsApp soporte
 * @param {number} complianceOpts.returnDays - Días de devolución
 * @returns {string} HTML compliant
 */
export function buildLandingHTML_v8(landingData, complianceOpts = {}) {
  const {
    realStock,
    storeName = "Escala 100K",
    contactEmail = "soporte@escala100k.com",
    whatsappNumber = landingData.whatsappNumber || "",
    returnDays = 30,
  } = complianceOpts;

  // ── 1. Generar HTML base con v7 ──
  let html = buildLandingHTML_v7(landingData);

  // ── 2. Reemplazar stock falso con stock real ──
  if (realStock !== undefined && realStock !== null) {
    // v7 genera: "Solo X unidades disponibles" con X random
    // Reemplazamos con el stock real o un mensaje honesto
    if (realStock > 50) {
      // Mucho stock — no mostrar número, solo que está disponible
      html = html.replace(
        /Solo \d+ unidades disponibles/g,
        "Disponible · Envío inmediato"
      );
    } else if (realStock > 0) {
      // Stock bajo real — mostrar número real
      html = html.replace(
        /Solo \d+ unidades disponibles/g,
        `${realStock} unidades disponibles`
      );
    } else {
      // Sin stock
      html = html.replace(
        /Solo \d+ unidades disponibles/g,
        "Agotado temporalmente"
      );
    }
  }

  // ── 3. Reemplazar "se agotan rápido" si stock > 50 ──
  if (realStock && realStock > 50) {
    html = html.replace(
      /se agotan rápido/g,
      "alta demanda"
    );
  }

  // ── 4. Agregar pixel disclosure antes de los scripts de pixel ──
  const pixelDisclosure = buildPixelDisclosure({
    hasFacebookPixel: !!landingData.facebookPixelId,
    hasTiktokPixel: !!landingData.tiktokPixelId,
  });
  if (pixelDisclosure) {
    // Insertar antes del primer script de pixel
    html = html.replace(
      /(<script>!function\(f,b,e,v)/,
      pixelDisclosure + "\n$1"
    );
  }

  // ── 5. Agregar footer legal antes del cierre ──
  const legalFooter = buildLegalFooter({
    storeName,
    storeUrl: landingData.shopifyUrl || "",
    contactEmail,
    countryName: landingData.countryData?.name || landingData.countryCode || "Costa Rica",
    currency: landingData.countryData?.currency || "CRC",
    hasFacebookPixel: !!landingData.facebookPixelId,
    hasTiktokPixel: !!landingData.tiktokPixelId,
    returnDays,
    whatsappNumber,
  });

  // Insertar footer legal antes del script final y cierre del div
  // v7 termina con: })();</script></div>
  html = html.replace(
    /(})(\(\);)<\/script><\/div>\s*$/,
    "$1$2</script>" + legalFooter + "</div>"
  );

  // Si el regex no matcheó (formato diferente), append al final
  if (!html.includes("lf-cookie")) {
    html += legalFooter;
  }

  // ── 6. Agregar disclaimer general de producto ──
  // Insertar antes de la sección FAQ o del final CTA
  const disclaimer = `<div style="max-width:720px;margin:0 auto;padding:16px 20px;text-align:center;font-size:11px;color:#a1a1aa;line-height:1.6">
    Las imágenes son ilustrativas y pueden variar del producto real. Los testimonios reflejan experiencias individuales; los resultados pueden variar.
    Precios sujetos a disponibilidad. ${landingData.countryData?.contraentrega ? "Pago contra entrega disponible según cobertura del servicio de mensajería." : ""}
  </div>`;

  // Insertar antes del FAQ o del final CTA
  if (html.includes("Preguntas frecuentes")) {
    html = html.replace(
      /(<div class="lp7-sec-alt lp7-fade"><div class="lp7-w">\s*<div style="text-align:center"><span class="lp7-label">Preguntas frecuentes)/,
      disclaimer + "$1"
    );
  } else {
    // Insertar antes del CTA final
    html = html.replace(
      /(<div class="lp7-sec-dark lp7-fade"><div class="lp7-w" style="text-align:center">\s*<h2[^>]*>Tu momento es ahora)/,
      disclaimer + "$1"
    );
  }

  return html;
}
