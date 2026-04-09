// pages/index.js
// ============================================================
// DASHBOARD — Agente de Landing Pages para Shopify
// ============================================================

import { useState, useEffect, useCallback } from "react";

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [status, setStatus] = useState(null);
  const [landings, setLandings] = useState([]);
  const [landingTotal, setLandingTotal] = useState(0);
  const [landingPage, setLandingPage] = useState(1);
  const [selectedLanding, setSelectedLanding] = useState(null);
  const [shopifyOk, setShopifyOk] = useState(null);
  const [creating, setCreating] = useState(false);
  const [autoCreating, setAutoCreating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [toast, setToast] = useState(null);

  // Formulario nuevo producto
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formPrice, setFormPrice] = useState("29.99");
  const [formComparePrice, setFormComparePrice] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMarket, setFormMarket] = useState("LATAM");

  // Mejora
  const [improveFeedback, setImproveFeedback] = useState("");
  const [improveId, setImproveId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/landing?action=status");
      const d = await r.json();
      setStatus(d);
    } catch { /* ignorar */ }
  }, []);

  const loadLandings = useCallback(async () => {
    const r = await fetch(`/api/landing?action=list&page=${landingPage}`);
    const d = await r.json();
    setLandings(d.landings || []);
    setLandingTotal(d.total || 0);
  }, [landingPage]);

  const testShopify = useCallback(async () => {
    const r = await fetch("/api/landing?action=test-shopify");
    const d = await r.json();
    setShopifyOk(d);
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);
  useEffect(() => { if (tab === "landings") loadLandings(); }, [tab, loadLandings]);
  useEffect(() => { if (tab === "config") testShopify(); }, [tab, testShopify]);

  // Crear landing manual
  async function createManual() {
    if (!formName.trim()) return showToast("Escribe el nombre del producto", "error");
    setCreating(true);
    try {
      const r = await fetch("/api/landing?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          market: formMarket,
          sellPrice: formPrice,
          comparePrice: formComparePrice || null,
          description: formDesc,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        showToast(`✅ Landing creada y publicada en Shopify — ID: ${d.shopifyId}`);
        setFormName(""); setFormDesc("");
        loadStatus();
        if (tab === "landings") loadLandings();
      } else {
        showToast("❌ Error: " + d.error, "error");
      }
    } catch (e) {
      showToast("❌ Error de conexión", "error");
    }
    setCreating(false);
  }

  // Auto-crear desde ganadores
  async function autoCreate() {
    setAutoCreating(true);
    try {
      const r = await fetch("/api/landing?action=auto-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 3 }),
      });
      const d = await r.json();
      if (d.ok) {
        showToast(`✅ ${d.created} landings creadas de ${d.total} productos ganadores`);
        loadStatus();
      } else {
        showToast("❌ " + (d.error || "Error"), "error");
      }
    } catch (e) {
      showToast("❌ Error de conexión", "error");
    }
    setAutoCreating(false);
  }

  // Mejorar landing
  async function submitImprove() {
    if (!improveFeedback.trim() || !improveId) return;
    setImproving(true);
    try {
      const r = await fetch("/api/landing?action=improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: improveId, feedback: improveFeedback }),
      });
      const d = await r.json();
      if (d.ok) {
        showToast("✅ Landing mejorada y actualizada en Shopify");
        setImproveFeedback(""); setImproveId(null);
        loadLandings();
      } else {
        showToast("❌ " + d.error, "error");
      }
    } catch (e) {
      showToast("❌ Error de conexión", "error");
    }
    setImproving(false);
  }

  function parseLandingData(record) {
    try { return JSON.parse(record.landing_data || "{}"); } catch { return {}; }
  }

  return (
    <div style={s.root}>
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#FCEBEB" : "#EAF3DE", color: toast.type === "error" ? "#501313" : "#27500A" }}>
          {toast.msg}
        </div>
      )}

      <div style={s.sidebar}>
        <div style={s.logo}>
          <div style={{ ...s.logoDot, background: "#185FA5" }} />
          <span style={s.logoText}>LandingAgent</span>
        </div>
        {[
          { id: "overview", label: "Panel" },
          { id: "create", label: "Crear Landing" },
          { id: "landings", label: "Mis Landings" },
          { id: "config", label: "Configuración" },
        ].map((t) => (
          <button key={t.id} style={{ ...s.navBtn, ...(tab === t.id ? s.navBtnActive : {}) }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.main}>
        {/* ─── PANEL ─── */}
        {tab === "overview" && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Panel de control</h1>
              <button style={{ ...s.btnPrimary, ...(autoCreating ? s.btnDisabled : {}) }} onClick={autoCreate} disabled={autoCreating}>
                {autoCreating ? "⏳ Creando..." : "🚀 Auto-crear desde ganadores"}
              </button>
            </div>

            <div style={s.statsGrid}>
              <div style={s.statCard}><div style={s.statLabel}>Landings creadas</div><div style={{ ...s.statValue, color: "#185FA5" }}>{status?.total || 0}</div></div>
              <div style={s.statCard}><div style={s.statLabel}>Últimas 24h</div><div style={{ ...s.statValue, color: "#27500A" }}>{status?.recent?.filter((l) => new Date(l.created_at) > new Date(Date.now() - 86400000)).length || 0}</div></div>
              <div style={s.statCard}><div style={s.statLabel}>Publicadas</div><div style={{ ...s.statValue, color: "#854F0B" }}>{status?.recent?.filter((l) => l.status === "publicado").length || 0}</div></div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Landings recientes</div>
              {(status?.recent || []).map((l) => {
                const data = parseLandingData(l);
                return (
                  <div key={l.id} style={s.landingRow}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{l.product_name}</div>
                      <div style={s.muted}>{new Date(l.created_at).toLocaleString("es-CO")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ ...s.badge, background: l.status === "publicado" ? "#EAF3DE" : "#FCEBEB", color: l.status === "publicado" ? "#27500A" : "#501313" }}>
                        {l.status}
                      </span>
                      {l.shopify_url && <a href={l.shopify_url} target="_blank" rel="noreferrer" style={s.link}>Ver →</a>}
                    </div>
                  </div>
                );
              })}
              {(!status?.recent || status.recent.length === 0) && <p style={s.muted}>Crea tu primera landing page.</p>}
            </div>
          </div>
        )}

        {/* ─── CREAR LANDING ─── */}
        {tab === "create" && (
          <div>
            <h1 style={s.pageTitle}>Crear landing page</h1>
            <div style={s.card}>
              <div style={s.cardTitle}>Datos del producto</div>
              <div style={s.formRow}>
                <label style={s.formLabel}>Nombre del producto *</label>
                <input style={s.input} value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej: Masajeador facial LED anti-arrugas" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={s.formRow}>
                  <label style={s.formLabel}>Precio de venta (USD)</label>
                  <input style={s.input} value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="29.99" />
                </div>
                <div style={s.formRow}>
                  <label style={s.formLabel}>Precio comparación (tachado)</label>
                  <input style={s.input} value={formComparePrice} onChange={(e) => setFormComparePrice(e.target.value)} placeholder="59.99" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={s.formRow}>
                  <label style={s.formLabel}>Categoría</label>
                  <select style={s.select} value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    {["General", "Hogar", "Belleza", "Fitness", "Mascotas", "Tecnología", "Moda", "Cocina", "Niños", "Salud"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={s.formRow}>
                  <label style={s.formLabel}>Mercado</label>
                  <select style={s.select} value={formMarket} onChange={(e) => setFormMarket(e.target.value)}>
                    {["LATAM", "Colombia", "México", "Brasil", "USA", "España", "Global"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={s.formRow}>
                <label style={s.formLabel}>Descripción adicional (opcional)</label>
                <textarea style={{ ...s.input, height: 80, resize: "vertical" }} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Descripción del producto del proveedor, características especiales, etc." />
              </div>
              <button style={{ ...s.btnPrimary, marginTop: 16, width: "100%", ...(creating ? s.btnDisabled : {}) }} onClick={createManual} disabled={creating}>
                {creating ? "⏳ Generando landing page..." : "🏷️ Crear landing y publicar en Shopify"}
              </button>
              <p style={{ ...s.muted, marginTop: 8 }}>El producto se crea como BORRADOR en Shopify. Revísalo y publícalo cuando estés listo.</p>
            </div>
          </div>
        )}

        {/* ─── MIS LANDINGS ─── */}
        {tab === "landings" && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Mis landing pages</h1>
              <span style={s.muted}>{landingTotal} total</span>
            </div>

            {landings.map((l) => {
              const data = parseLandingData(l);
              const isExpanded = selectedLanding === l.id;

              return (
                <div key={l.id} style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{l.product_name}</div>
                      <div style={s.muted}>{new Date(l.created_at).toLocaleString("es-CO")} · {data.product_type || ""}</div>
                    </div>
                    <span style={{ ...s.badge, background: l.status === "publicado" ? "#EAF3DE" : "#FCEBEB", color: l.status === "publicado" ? "#27500A" : "#501313" }}>
                      {l.status}
                    </span>
                  </div>

                  {data.headline && <p style={{ margin: "8px 0 4px", fontWeight: 500 }}>{data.headline}</p>}
                  {data.seo_title && <p style={{ ...s.muted, margin: "2px 0" }}>SEO: {data.seo_title}</p>}

                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    {l.shopify_url && <a href={l.shopify_url} target="_blank" rel="noreferrer" style={{ ...s.btnSmall, textDecoration: "none" }}>Ver en tienda →</a>}
                    <button style={s.btnSmall} onClick={() => setSelectedLanding(isExpanded ? null : l.id)}>
                      {isExpanded ? "Cerrar ▲" : "Ver detalle ▼"}
                    </button>
                    <button style={s.btnSmall} onClick={() => { setImproveId(l.id); setImproveFeedback(""); }}>
                      Mejorar ✏️
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 16, borderTop: "1px solid #e0ddd4", paddingTop: 16 }}>
                      {data.bullet_points?.map((b, i) => <p key={i} style={{ margin: "4px 0", fontSize: 14 }}>{b}</p>)}
                      {data.urgency_text && <p style={{ margin: "12px 0", fontWeight: 600, color: "#854F0B" }}>⚡ {data.urgency_text}</p>}
                      {data.faq?.map((f, i) => (
                        <div key={i} style={{ margin: "8px 0", fontSize: 14 }}>
                          <strong>P: {f.q}</strong>
                          <p style={{ margin: "2px 0", color: "#666" }}>R: {f.a}</p>
                        </div>
                      ))}
                      {data.ad_copies?.facebook?.map((c, i) => (
                        <div key={i} style={{ background: "#f8f8f8", padding: 12, borderRadius: 6, margin: "8px 0", fontSize: 13 }}>
                          <strong>Facebook #{i + 1}:</strong> {c}
                        </div>
                      ))}
                      {data.ad_copies?.tiktok_scripts?.map((c, i) => (
                        <div key={i} style={{ background: "#FFF0F5", padding: 12, borderRadius: 6, margin: "8px 0", fontSize: 13 }}>
                          <strong>TikTok #{i + 1}:</strong> {c}
                        </div>
                      ))}
                    </div>
                  )}

                  {improveId === l.id && (
                    <div style={{ marginTop: 12, borderTop: "1px solid #e0ddd4", paddingTop: 12 }}>
                      <textarea style={{ ...s.input, height: 60 }} value={improveFeedback} onChange={(e) => setImproveFeedback(e.target.value)} placeholder="Escribe qué quieres mejorar (ej: 'hazlo más urgente', 'cambia el tono a más juvenil')" />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button style={{ ...s.btnPrimary, ...(improving ? s.btnDisabled : {}) }} onClick={submitImprove} disabled={improving}>
                          {improving ? "Mejorando..." : "Aplicar mejora"}
                        </button>
                        <button style={s.btnSmall} onClick={() => setImproveId(null)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {landings.length === 0 && <p style={s.muted}>Aún no hay landing pages. Crea una desde la pestaña "Crear Landing".</p>}
          </div>
        )}

        {/* ─── CONFIGURACIÓN ─── */}
        {tab === "config" && (
          <div>
            <h1 style={s.pageTitle}>Configuración</h1>
            <div style={s.card}>
              <div style={s.cardTitle}>Conexión con Shopify</div>
              {shopifyOk === null ? (
                <p style={s.muted}>Verificando conexión...</p>
              ) : shopifyOk.ok ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27500A" }} />
                    <span style={{ fontWeight: 600, color: "#27500A" }}>Conectado</span>
                  </div>
                  <p style={s.muted}>Tienda: {shopifyOk.name}</p>
                  <p style={s.muted}>Dominio: {shopifyOk.domain}</p>
                  <p style={s.muted}>Plan: {shopifyOk.plan}</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E24B4A" }} />
                    <span style={{ fontWeight: 600, color: "#E24B4A" }}>No conectado</span>
                  </div>
                  <p style={s.muted}>Error: {shopifyOk.error}</p>
                  <p style={s.muted}>Verifica que SHOPIFY_STORE_DOMAIN y SHOPIFY_ACCESS_TOKEN estén configurados en Render.</p>
                </div>
              )}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Variables de entorno necesarias</div>
              {[
                ["ANTHROPIC_API_KEY", "IA para generar contenido", "#EAF3DE", "#27500A"],
                ["SHOPIFY_STORE_DOMAIN", "Dominio de tu tienda", "#EAF3DE", "#27500A"],
                ["SHOPIFY_ACCESS_TOKEN", "Token de acceso API", "#EAF3DE", "#27500A"],
                ["NEXT_PUBLIC_SUPABASE_URL + KEYS", "Base de datos", "#E6F1FB", "#042C53"],
                ["TELEGRAM_BOT_TOKEN + CHAT_ID", "Notificaciones", "#FAEEDA", "#633806"],
              ].map(([k, v, bg, col]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <code style={{ fontSize: 13, background: "#f5f5f2", padding: "2px 6px", borderRadius: 4 }}>{k}</code>
                  <span style={{ ...s.badge, background: bg, color: col }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#f5f5f2", color: "#1a1a1a" },
  sidebar: { width: 220, background: "#fff", borderRight: "0.5px solid #e0ddd4", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 },
  logo: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24 },
  logoDot: { width: 10, height: 10, borderRadius: "50%" },
  logoText: { fontWeight: 700, fontSize: 16 },
  navBtn: { background: "transparent", border: "none", textAlign: "left", padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#5F5E5A" },
  navBtnActive: { background: "#E6F1FB", color: "#185FA5", fontWeight: 600 },
  main: { flex: 1, padding: 32, maxWidth: 900 },
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: 0 },
  btnPrimary: { background: "#185FA5", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  btnSmall: { background: "#fff", color: "#3d3d3a", border: "0.5px solid #c0bdb4", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 },
  statCard: { background: "#fff", border: "0.5px solid #e0ddd4", borderRadius: 10, padding: "14px 16px" },
  statLabel: { fontSize: 12, color: "#888780", marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 700 },
  card: { background: "#fff", border: "0.5px solid #e0ddd4", borderRadius: 10, padding: "20px 24px", marginBottom: 16 },
  cardTitle: { fontWeight: 600, fontSize: 15, marginBottom: 14 },
  badge: { fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, display: "inline-block" },
  landingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid #f0ede4" },
  link: { fontSize: 13, color: "#185FA5", textDecoration: "none" },
  muted: { color: "#888780", fontSize: 13, margin: 0 },
  formRow: { marginBottom: 12 },
  formLabel: { fontSize: 13, color: "#5F5E5A", display: "block", marginBottom: 4 },
  input: { width: "100%", padding: "8px 12px", border: "0.5px solid #c0bdb4", borderRadius: 8, fontSize: 14, boxSizing: "border-box" },
  select: { width: "100%", padding: "8px 12px", border: "0.5px solid #c0bdb4", borderRadius: 8, fontSize: 14, background: "#fff" },
  toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, border: "0.5px solid", fontWeight: 500, fontSize: 14 },
};
