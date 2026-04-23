// lib/legal_footer.js
// ============================================================
// FOOTER LEGAL — Privacy, Terms, Refund Policy, Disclaimers
//
// Módulo nuevo e independiente. Se importa desde cualquier
// template (v7, v8, futuros) sin modificar archivos existentes.
//
// Genera HTML compliant con Meta Ads policies:
// - Privacy Policy (tracking disclosure)
// - Términos y condiciones
// - Política de devoluciones
// - Datos de contacto reales
// - Cookie consent banner (GDPR/CCPA ready)
//
// Env vars necesarias: ninguna (datos se pasan como parámetro)
// ============================================================

/**
 * Genera el footer legal completo para una landing page
 * @param {Object} opts
 * @param {string} opts.storeName - Nombre de la tienda (ej: "Escala 100K")
 * @param {string} opts.storeUrl - URL de la tienda
 * @param {string} opts.contactEmail - Email de contacto
 * @param {string} opts.countryName - País (ej: "Costa Rica")
 * @param {string} opts.currency - Moneda (ej: "CRC")
 * @param {boolean} opts.hasFacebookPixel - Si usa pixel de Facebook
 * @param {boolean} opts.hasTiktokPixel - Si usa pixel de TikTok
 * @param {number} opts.returnDays - Días para devolución (default 30)
 * @param {string} opts.whatsappNumber - WhatsApp de soporte
 * @returns {string} HTML del footer + cookie banner + modals
 */
export function buildLegalFooter(opts = {}) {
  const {
    storeName = "Escala 100K",
    storeUrl = "",
    contactEmail = "soporte@escala100k.com",
    countryName = "Costa Rica",
    currency = "CRC",
    hasFacebookPixel = false,
    hasTiktokPixel = false,
    returnDays = 30,
    whatsappNumber = "",
  } = opts;

  const year = new Date().getFullYear();
  const trackingList = [];
  if (hasFacebookPixel) trackingList.push("Facebook/Meta Pixel");
  if (hasTiktokPixel) trackingList.push("TikTok Pixel");
  const trackingText = trackingList.length > 0
    ? `Utilizamos ${trackingList.join(" y ")} para medir el rendimiento de nuestros anuncios y mejorar tu experiencia de compra.`
    : "";

  let html = "";

  // ── COOKIE CONSENT BANNER ──
  html += `
<div id="lf-cookie" style="display:none;position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;color:#e0e0e0;padding:14px 20px;font-size:12px;z-index:9999;border-top:1px solid #333;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
  <span>Este sitio usa cookies para mejorar tu experiencia. ${trackingText} <a href="#" onclick="document.getElementById('lf-privacy').style.display='flex';return false" style="color:#fbbf24;text-decoration:underline">Política de privacidad</a></span>
  <button onclick="document.getElementById('lf-cookie').style.display='none';localStorage.setItem('cookie_ok','1')" style="background:#fbbf24;color:#000;border:none;padding:8px 20px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px">Aceptar</button>
</div>
<script>if(localStorage.getItem('cookie_ok')==='1')document.getElementById('lf-cookie').style.display='none';else document.getElementById('lf-cookie').style.display='flex';</script>`;

  // ── FOOTER ──
  html += `
<footer style="background:#0a0a1a;color:#888;padding:40px 20px 24px;font-size:12px;line-height:1.7;margin-top:40px">
  <div style="max-width:720px;margin:0 auto;text-align:center">
    <div style="font-size:14px;font-weight:700;color:#ccc;margin-bottom:12px">${storeName}</div>
    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:16px">
      <a href="#" onclick="document.getElementById('lf-privacy').style.display='flex';return false" style="color:#fbbf24;text-decoration:none">Política de Privacidad</a>
      <a href="#" onclick="document.getElementById('lf-terms').style.display='flex';return false" style="color:#fbbf24;text-decoration:none">Términos y Condiciones</a>
      <a href="#" onclick="document.getElementById('lf-refund').style.display='flex';return false" style="color:#fbbf24;text-decoration:none">Devoluciones</a>
    </div>
    <p style="margin:0 0 8px">Contacto: <a href="mailto:${contactEmail}" style="color:#fbbf24">${contactEmail}</a>${whatsappNumber ? ` · <a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}" style="color:#fbbf24">WhatsApp</a>` : ""}</p>
    <p style="margin:0;color:#555">© ${year} ${storeName} · ${countryName} · Todos los derechos reservados</p>
    <p style="margin:8px 0 0;color:#444;font-size:10px">Los resultados pueden variar. Las imágenes son ilustrativas. Precios en ${currency}, sujetos a cambio sin previo aviso.</p>
  </div>
</footer>`;

  // ── MODAL: PRIVACY POLICY ──
  html += `
<div id="lf-privacy" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:10000;align-items:center;justify-content:center;padding:20px" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#1a1a2e;color:#ddd;max-width:640px;width:100%;max-height:80vh;overflow-y:auto;border-radius:12px;padding:32px;font-size:13px;line-height:1.8;position:relative">
    <button onclick="this.parentElement.parentElement.style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#888;font-size:20px;cursor:pointer">&times;</button>
    <h2 style="color:#fff;font-size:20px;margin-top:0">Política de Privacidad</h2>
    <p><strong>${storeName}</strong> ("nosotros") respeta tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.</p>
    <h3 style="color:#fbbf24;font-size:14px">Información que recopilamos</h3>
    <ul>
      <li><strong>Datos de contacto:</strong> nombre, teléfono, dirección de entrega (proporcionados por ti al realizar un pedido)</li>
      <li><strong>Datos de navegación:</strong> páginas visitadas, tiempo en el sitio, dispositivo utilizado</li>
      ${hasFacebookPixel ? "<li><strong>Facebook/Meta Pixel:</strong> recopila datos de tu visita para medir el rendimiento de nuestros anuncios y mostrarte anuncios relevantes en Facebook e Instagram</li>" : ""}
      ${hasTiktokPixel ? "<li><strong>TikTok Pixel:</strong> recopila datos de tu visita para medir el rendimiento de nuestros anuncios en TikTok</li>" : ""}
    </ul>
    <h3 style="color:#fbbf24;font-size:14px">Cómo usamos tu información</h3>
    <ul>
      <li>Procesar y enviar tu pedido</li>
      <li>Comunicarnos contigo sobre tu compra</li>
      <li>Mejorar nuestros productos y servicios</li>
      <li>Mostrar anuncios relevantes en redes sociales</li>
    </ul>
    <h3 style="color:#fbbf24;font-size:14px">Compartir información</h3>
    <p>No vendemos tu información personal. Compartimos datos únicamente con:</p>
    <ul>
      <li>Nuestro proveedor de fulfillment (para enviar tu pedido)</li>
      <li>Plataformas de anuncios (Facebook, TikTok) mediante pixels de seguimiento</li>
      <li>Shopify (nuestra plataforma de comercio)</li>
    </ul>
    <h3 style="color:#fbbf24;font-size:14px">Tus derechos</h3>
    <p>Puedes solicitar acceso, corrección o eliminación de tus datos personales escribiéndonos a <a href="mailto:${contactEmail}" style="color:#fbbf24">${contactEmail}</a>.</p>
    <h3 style="color:#fbbf24;font-size:14px">Cookies</h3>
    <p>Utilizamos cookies esenciales para el funcionamiento del sitio y cookies de seguimiento para medir el rendimiento de nuestros anuncios. Puedes desactivar las cookies en la configuración de tu navegador.</p>
    <p style="color:#666;font-size:11px">Última actualización: ${new Date().toLocaleDateString("es", { year: "numeric", month: "long" })}</p>
  </div>
</div>`;

  // ── MODAL: TERMS ──
  html += `
<div id="lf-terms" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:10000;align-items:center;justify-content:center;padding:20px" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#1a1a2e;color:#ddd;max-width:640px;width:100%;max-height:80vh;overflow-y:auto;border-radius:12px;padding:32px;font-size:13px;line-height:1.8;position:relative">
    <button onclick="this.parentElement.parentElement.style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#888;font-size:20px;cursor:pointer">&times;</button>
    <h2 style="color:#fff;font-size:20px;margin-top:0">Términos y Condiciones</h2>
    <p>Al realizar una compra en <strong>${storeName}</strong>, aceptas los siguientes términos:</p>
    <h3 style="color:#fbbf24;font-size:14px">Pedidos y envíos</h3>
    <ul>
      <li>Los pedidos se procesan en 1-3 días hábiles</li>
      <li>El tiempo de entrega varía según tu ubicación (3-10 días hábiles en ${countryName})</li>
      <li>Los tiempos de envío son estimados y pueden variar por factores externos</li>
    </ul>
    <h3 style="color:#fbbf24;font-size:14px">Pago contra entrega (COD)</h3>
    <ul>
      <li>El pago se realiza al momento de recibir el producto</li>
      <li>Debes tener el monto exacto disponible al momento de la entrega</li>
      <li>Si no estás disponible para recibir, se intentará un segundo envío</li>
    </ul>
    <h3 style="color:#fbbf24;font-size:14px">Precios</h3>
    <ul>
      <li>Todos los precios están en ${currency} e incluyen impuestos aplicables</li>
      <li>Nos reservamos el derecho de modificar precios sin previo aviso</li>
      <li>Las promociones y descuentos tienen vigencia limitada</li>
    </ul>
    <h3 style="color:#fbbf24;font-size:14px">Responsabilidad</h3>
    <p>Las imágenes del producto son ilustrativas. El producto real puede variar ligeramente en color o presentación. No nos hacemos responsables por uso inadecuado del producto.</p>
    <p style="color:#666;font-size:11px">Última actualización: ${new Date().toLocaleDateString("es", { year: "numeric", month: "long" })}</p>
  </div>
</div>`;

  // ── MODAL: REFUND POLICY ──
  html += `
<div id="lf-refund" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:10000;align-items:center;justify-content:center;padding:20px" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#1a1a2e;color:#ddd;max-width:640px;width:100%;max-height:80vh;overflow-y:auto;border-radius:12px;padding:32px;font-size:13px;line-height:1.8;position:relative">
    <button onclick="this.parentElement.parentElement.style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#888;font-size:20px;cursor:pointer">&times;</button>
    <h2 style="color:#fff;font-size:20px;margin-top:0">Política de Devoluciones</h2>
    <h3 style="color:#fbbf24;font-size:14px">Garantía de ${returnDays} días</h3>
    <p>Si no estás satisfecho con tu compra, tienes <strong>${returnDays} días</strong> a partir de la fecha de entrega para solicitar una devolución.</p>
    <h3 style="color:#fbbf24;font-size:14px">Condiciones</h3>
    <ul>
      <li>El producto debe estar en su empaque original</li>
      <li>No debe presentar daños por mal uso</li>
      <li>Debes contactarnos a <a href="mailto:${contactEmail}" style="color:#fbbf24">${contactEmail}</a> con tu número de pedido</li>
    </ul>
    <h3 style="color:#fbbf24;font-size:14px">Proceso</h3>
    <ol>
      <li>Contáctanos por email o WhatsApp con tu número de pedido</li>
      <li>Te indicaremos cómo devolver el producto</li>
      <li>Una vez recibido y verificado, procesaremos tu reembolso en 5-10 días hábiles</li>
    </ol>
    <h3 style="color:#fbbf24;font-size:14px">Excepciones</h3>
    <p>No se aceptan devoluciones de productos con daño por mal uso, productos sin empaque original, o después de los ${returnDays} días del período de garantía.</p>
    <p style="color:#666;font-size:11px">Última actualización: ${new Date().toLocaleDateString("es", { year: "numeric", month: "long" })}</p>
  </div>
</div>`;

  return html;
}

/**
 * Genera solo el texto de disclosure para pixels (para insertar cerca del pixel script)
 */
export function buildPixelDisclosure(opts = {}) {
  const lines = [];
  if (opts.hasFacebookPixel) lines.push("Facebook/Meta Pixel para medir anuncios");
  if (opts.hasTiktokPixel) lines.push("TikTok Pixel para medir anuncios");
  if (lines.length === 0) return "";
  return `<!-- Tracking Disclosure: Este sitio utiliza ${lines.join(" y ")}. Ver Política de Privacidad. -->`;
}
