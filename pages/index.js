import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

export default function Dashboard() {
  const [tab, setTab] = useState("create");
  const [toast, setToast] = useState(null);
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkResults, setBulkResults] = useState(null);
  const [imgUrl, setImgUrl] = useState("");
  const [imgName, setImgName] = useState("");
  const [country, setCountry] = useState("CR");
  const [step, setStep] = useState("idle");
  const [analyzed, setAnalyzed] = useState(null);
  const [result, setResult] = useState(null);
  const [showCfg, setShowCfg] = useState(false);
  const [cfg, setCfg] = useState({ price: "", compare: "", wa: "", fb: "", tk: "" });
  const [stats, setStats] = useState(null);
  const [landings, setLandings] = useState([]);
  const [landingTotal, setLandingTotal] = useState(0);
  const [selectedLanding, setSelectedLanding] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [shopifyOk, setShopifyOk] = useState(null);
  const [improveId, setImproveId] = useState(null);
  const [improveFeedback, setImproveFeedback] = useState("");
  const [improving, setImproving] = useState(false);
  const [regenerating, setRegenerating] = useState(null);
  const [autoCreating, setAutoCreating] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const C = [
    { c: "CR", f: "\u{1F1E8}\u{1F1F7}", n: "Costa Rica", cur: "CRC" },
    { c: "CO", f: "\u{1F1E8}\u{1F1F4}", n: "Colombia", cur: "COP" },
    { c: "GT", f: "\u{1F1EC}\u{1F1F9}", n: "Guatemala", cur: "GTQ" },
    { c: "MX", f: "\u{1F1F2}\u{1F1FD}", n: "Mexico", cur: "MXN" },
    { c: "PA", f: "\u{1F1F5}\u{1F1E6}", n: "Panama", cur: "USD" },
    { c: "EC", f: "\u{1F1EA}\u{1F1E8}", n: "Ecuador", cur: "USD" },
    { c: "PE", f: "\u{1F1F5}\u{1F1EA}", n: "Peru", cur: "PEN" },
    { c: "CL", f: "\u{1F1E8}\u{1F1F1}", n: "Chile", cur: "CLP" },
    { c: "HN", f: "\u{1F1ED}\u{1F1F3}", n: "Honduras", cur: "HNL" },
    { c: "SV", f: "\u{1F1F8}\u{1F1FB}", n: "El Salvador", cur: "USD" },
    { c: "NI", f: "\u{1F1F3}\u{1F1EE}", n: "Nicaragua", cur: "NIO" },
    { c: "DO", f: "\u{1F1E9}\u{1F1F4}", n: "Rep. Dominicana", cur: "DOP" },
    { c: "AR", f: "\u{1F1E6}\u{1F1F7}", n: "Argentina", cur: "ARS" },
    { c: "BR", f: "\u{1F1E7}\u{1F1F7}", n: "Brasil", cur: "BRL" },
    { c: "BO", f: "\u{1F1E7}\u{1F1F4}", n: "Bolivia", cur: "BOB" },
    { c: "PY", f: "\u{1F1F5}\u{1F1FE}", n: "Paraguay", cur: "PYG" },
    { c: "UY", f: "\u{1F1FA}\u{1F1FE}", n: "Uruguay", cur: "UYU" },
    { c: "VE", f: "\u{1F1FB}\u{1F1EA}", n: "Venezuela", cur: "USD" },
    { c: "US", f: "\u{1F1FA}\u{1F1F8}", n: "USA", cur: "USD" },
    { c: "ES", f: "\u{1F1EA}\u{1F1F8}", n: "Espana", cur: "EUR" },
  ];
  const sel = C.find(x => x.c === country) || C[0];
  const store = "hy1jn3-vn";
  const sects = [
    { key: "testimonials", label: "Testimonios" },
    { key: "faq", label: "FAQ" },
    { key: "benefits", label: "Beneficios" },
    { key: "copy", label: "Copy" },
    { key: "ads", label: "Ads" },
    { key: "urgency", label: "Urgencia" },
  ];

  const show = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        fetch("/api/landing?action=status").then(r => r.json()).catch(() => ({})),
        fetch("/api/landing?action=list&page=1").then(r => r.json()).catch(() => ({ landings: [] })),
      ]);
      setStats(s); setLandings(l.landings || []); setLandingTotal(l.total || 0);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === "config") fetch("/api/landing?action=test-shopify").then(r => r.json()).then(setShopifyOk).catch(() => {}); }, [tab]);

  // Timer para loading
  useEffect(() => {
    if (step !== "working") { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [step]);

  async function createFromUrl() {
    if (!url.trim()) return show("Pega una URL", "err");
    setStep("working"); setElapsed(0);
    try {
      const r = await fetch("/api/landing?action=create-from-url", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, countryCode: country, currency: sel.cur, sellPrice: cfg.price || null, comparePrice: cfg.compare || null, whatsappNumber: cfg.wa || null, facebookPixelId: cfg.fb || null, tiktokPixelId: cfg.tk || null, extraImages: imgUrl ? imgUrl.split("\n").map(u => u.trim()).filter(u => u.startsWith("http")) : [] }),
      });
      const d = await r.json();
      if (d.ok) { setResult(d); setAnalyzed(d.analyzed || null); setStep("done"); show("Landing creada"); load(); }
      else { show(d.error || "Error", "err"); setStep("idle"); }
    } catch { show("Error de conexion", "err"); setStep("idle"); }
  }

  async function createFromImage() {
    if (!imgName.trim()) return show("Nombre del producto requerido", "err");
    setStep("working"); setElapsed(0);
    try {
      const images = imgUrl.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
      const r = await fetch("/api/landing?action=create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: imgName, category: "General", market: "LATAM", sellPrice: cfg.price || "29.99", comparePrice: cfg.compare || null, description: "", images, countryCode: country, currency: sel.cur, whatsappNumber: cfg.wa || null, facebookPixelId: cfg.fb || null, tiktokPixelId: cfg.tk || null }),
      });
      const d = await r.json();
      if (d.ok) { setResult(d); setStep("done"); show("Landing creada"); load(); }
      else { show(d.error || "Error", "err"); setStep("idle"); }
    } catch { show("Error de conexion", "err"); setStep("idle"); }
  }

  async function createBulk() {
    const urls = bulkUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (!urls.length) return show("Agrega URLs", "err");
    setStep("working"); setElapsed(0);
    try {
      const r = await fetch("/api/landing?action=create-bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls, countryCode: country, currency: sel.cur, whatsappNumber: cfg.wa || null, facebookPixelId: cfg.fb || null, tiktokPixelId: cfg.tk || null }) });
      const d = await r.json();
      if (d.ok) { setBulkResults(d); setStep("done"); show(`${d.created}/${d.total} creadas`); load(); }
      else { show(d.error || "Error", "err"); setStep("idle"); }
    } catch { show("Error de conexion", "err"); setStep("idle"); }
  }

  async function autoCreate() {
    setAutoCreating(true);
    try {
      const r = await fetch("/api/landing?action=auto-create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 3, minScore: 8 }) });
      const d = await r.json();
      if (d.ok) show(`${d.created} landings creadas`); else show(d.error || d.message || "Error", "err");
    } catch { show("Error de conexion", "err"); }
    setAutoCreating(false); load();
  }

  async function submitImprove() {
    if (!improveFeedback.trim() || !improveId) return;
    setImproving(true);
    try {
      const r = await fetch("/api/landing?action=improve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: improveId, feedback: improveFeedback }) });
      const d = await r.json();
      if (d.ok) { show("Mejorada"); setImproveFeedback(""); setImproveId(null); load(); } else show(d.error, "err");
    } catch { show("Error", "err"); }
    setImproving(false);
  }

  async function handleRegenerate(id, section) {
    setRegenerating(`${id}-${section}`);
    try {
      const r = await fetch("/api/landing?action=regenerate-section", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, section }) });
      const d = await r.json();
      if (d.ok) { show(`${section} regenerada`); load(); } else show(d.error, "err");
    } catch { show("Error", "err"); }
    setRegenerating(null);
  }

  async function duplicateLanding(id, tc) {
    const t = C.find(c => c.c === tc);
    show(`Duplicando para ${t?.f} ${t?.n}...`);
    try {
      const r = await fetch("/api/landing?action=duplicate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, countryCode: tc, currency: t?.cur }) });
      const d = await r.json();
      if (d.ok) { show(`Duplicada para ${t?.f} ${t?.n}`); load(); } else show(d.error, "err");
    } catch { show("Error", "err"); }
  }

  function cp(text, label) { navigator.clipboard.writeText(text).then(() => show(`${label} copiado`)).catch(() => show("Error", "err")); }
  function reset() { setUrl(""); setImgUrl(""); setImgName(""); setBulkUrls(""); setStep("idle"); setAnalyzed(null); setResult(null); setBulkResults(null); setElapsed(0); }
  function pl(r) { try { return JSON.parse(r.landing_data || "{}"); } catch { return {}; } }
  const imgs = imgUrl.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
  const disc = cfg.price && cfg.compare && parseFloat(cfg.compare) > parseFloat(cfg.price) ? Math.round((1 - parseFloat(cfg.price) / parseFloat(cfg.compare)) * 100) : 0;

  const steps = [
    { t: 5, label: "Analizando URL...", sub: "Extrayendo datos del producto" },
    { t: 15, label: "Buscando imagenes...", sub: "Dropi + Google + proveedores" },
    { t: 30, label: "Generando copy PRO...", sub: "Gemini AI creando contenido" },
    { t: 45, label: "Publicando en Shopify...", sub: "Creando producto + template" },
    { t: 55, label: "Finalizando...", sub: "Telegram + base de datos" },
  ];
  const currentStep = steps.filter(s => elapsed >= s.t).pop() || steps[0];
  const progress = Math.min(95, (elapsed / 60) * 100);

  return (
    <>
      <Head><title>Landing Agent PRO</title></Head>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: [
        "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }",
        "body { background: #090E1A; color: #CBD5E1; font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; -webkit-font-smoothing: antialiased }",
        "::selection { background: #059669; color: #fff }",
        "input:focus, textarea:focus, select:focus { outline: none; border-color: #10B981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,.15) }",
        "::-webkit-scrollbar { width: 6px } ::-webkit-scrollbar-track { background: transparent } ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px }",
        "@keyframes spin { to { transform: rotate(360deg) } }",
        "@keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }",
        "@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }",
        "@keyframes shimmer { 0% { background-position: -200px 0 } 100% { background-position: calc(200px + 100%) 0 } }",
        ".au { animation: fadeUp .35s ease both }",
        ".au1 { animation-delay: .05s } .au2 { animation-delay: .1s } .au3 { animation-delay: .15s } .au4 { animation-delay: .2s }",
      ].join("\n") }} />

      {/* TOAST */}
      {toast && <div className="au" style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: toast.type === "err" ? "rgba(239,68,68,.15)" : "rgba(16,185,129,.15)", color: toast.type === "err" ? "#FCA5A5" : "#6EE7B7", border: `1px solid ${toast.type === "err" ? "rgba(239,68,68,.3)" : "rgba(16,185,129,.3)"}`, backdropFilter: "blur(12px)" }}><span style={{ fontSize: 16 }}>{toast.type === "err" ? "✕" : "✓"}</span>{toast.msg}</div>}

      {/* PREVIEW MODAL */}
      {previewId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(8px)" }} onClick={() => setPreviewId(null)}>
          <div className="au" style={{ background: "#111827", borderRadius: 20, padding: 24, width: "90vw", maxWidth: 440, maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid #1F2937", boxShadow: "0 25px 50px rgba(0,0,0,.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: "#10B981" }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>Preview Mobile</span>
              </div>
              <button onClick={() => setPreviewId(null)} style={{ background: "#1F2937", border: "none", color: "#64748B", cursor: "pointer", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ background: "#000", borderRadius: 14, padding: 4, flex: 1 }}>
              <iframe src={`/api/landing?action=preview&id=${previewId}`} style={{ width: "100%", height: "65vh", border: "none", borderRadius: 12, background: "#fff" }} title="Preview" />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* ═══ SIDEBAR ═══ */}
        <div style={{ width: 240, background: "#0F1629", borderRight: "1px solid rgba(255,255,255,.06)", padding: "24px 14px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 8px", marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#10B981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20, boxShadow: "0 4px 12px rgba(16,185,129,.3)" }}>L</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#F8FAFC", letterSpacing: "-.02em" }}>Landing Agent</div>
              <div style={{ fontSize: 10, color: "#10B981", fontWeight: 700, letterSpacing: ".05em" }}>PRO v2</div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { id: "create", icon: "plus-circle", label: "Crear Landing", emoji: "✦" },
              { id: "panel", icon: "bar-chart", label: "Panel", emoji: "◆" },
              { id: "landings", icon: "layers", label: "Mis Landings", emoji: "◇" },
              { id: "config", icon: "settings", label: "Configuracion", emoji: "○" },
            ].map(n => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{
                background: tab === n.id ? "rgba(16,185,129,.1)" : "transparent",
                border: "none", textAlign: "left", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13,
                color: tab === n.id ? "#10B981" : "#64748B", fontWeight: tab === n.id ? 700 : 500,
                display: "flex", gap: 10, alignItems: "center", transition: "all .15s",
                borderLeft: tab === n.id ? "2px solid #10B981" : "2px solid transparent",
              }}>
                <span style={{ fontSize: 10, opacity: tab === n.id ? 1 : .4 }}>{n.emoji}</span>{n.label}
              </button>
            ))}
          </div>

          {/* Stats mini */}
          {stats && (
            <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Resumen</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Total", stats.total || 0, "#3B82F6"], ["Activas", stats.published || 0, "#10B981"], ["Borrador", stats.drafts || 0, "#F59E0B"], ["Hoy", stats.last24h || 0, "#8B5CF6"]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 4, textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "auto", padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,.06)", fontSize: 10, color: "#334155", lineHeight: 1.8 }}>
            Gemini AI + Shopify<br />Master Escala + Releasit COD<br />Dropi Multi-pais
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            {/* ═══ TAB: CREAR ═══ */}
            {tab === "create" && (
              <>
                {step === "idle" && (
                  <div className="au">
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.03em" }}>Crear Landing Page</h1>
                    <p style={{ color: "#475569", fontSize: 15, marginTop: 6, marginBottom: 28 }}>Pega una URL o sube imagenes. La IA genera todo el copy de venta.</p>

                    {/* Mode tabs */}
                    <div style={{ display: "inline-flex", gap: 2, marginBottom: 20, background: "#111827", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,.06)" }}>
                      {[["url", "URL"], ["image", "Manual"], ["bulk", "Masivo"]].map(([m, l]) => (
                        <button key={m} onClick={() => setMode(m)} style={{
                          padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
                          fontWeight: mode === m ? 700 : 500,
                          background: mode === m ? "#10B981" : "transparent",
                          color: mode === m ? "#fff" : "#64748B", transition: "all .15s",
                        }}>{l}</button>
                      ))}
                    </div>

                    {/* URL mode */}
                    {mode === "url" && (
                      <div className="au au1" style={S.card}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                          <input style={{ ...S.input, flex: 1, fontSize: 15 }} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://app.dropi.cr/... o cualquier URL de producto" onKeyDown={e => e.key === "Enter" && createFromUrl()} />
                          <button style={{ ...S.btn, padding: "12px 28px" }} onClick={createFromUrl}>Crear</button>
                        </div>
                        <div style={{ fontSize: 12, color: "#334155" }}>Soporta: Dropi, AliExpress, Amazon, Shopify, MercadoLibre, Facebook Ads Library</div>

                        {/* Imagenes */}
                        <div style={{ marginTop: 16, padding: 16, background: "rgba(16,185,129,.04)", borderRadius: 12, border: "1px dashed rgba(16,185,129,.2)" }}>
                          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Imagenes del producto <span style={{ color: "#475569", fontWeight: 400 }}>(pega URLs para mejor resultado)</span></div>
                          <textarea style={{ ...S.input, height: 56, fontSize: 12, fontFamily: "monospace", resize: "vertical" }} value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://imagen1.jpg&#10;https://imagen2.jpg" />
                          {imgs.length > 0 && (
                            <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                              {imgs.slice(0, 8).map((u, i) => <img key={i} src={u} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "2px solid #1F2937", flexShrink: 0 }} onError={e => { e.target.style.opacity = 0.15; }} />)}
                              <span style={{ fontSize: 11, color: "#10B981", alignSelf: "center", fontWeight: 700, whiteSpace: "nowrap" }}>{imgs.length} imgs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image mode */}
                    {mode === "image" && (
                      <div className="au au1" style={S.card}>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 6 }}>Nombre del producto *</div>
                          <input style={S.input} value={imgName} onChange={e => setImgName(e.target.value)} placeholder="Ej: Cargador inalambrico 5 en 1" />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 6 }}>Imagenes (una URL por linea)</div>
                          <textarea style={{ ...S.input, height: 80, fontFamily: "monospace", fontSize: 12, resize: "vertical" }} value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder={"https://imagen1.jpg\nhttps://imagen2.jpg"} />
                        </div>
                        {imgs.length > 0 && (
                          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
                            {imgs.slice(0, 8).map((u, i) => <img key={i} src={u} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "2px solid #1F2937" }} onError={e => { e.target.style.opacity = 0.15; }} />)}
                          </div>
                        )}
                        <button style={{ ...S.btn, width: "100%", padding: "13px" }} onClick={createFromImage}>Crear Landing</button>
                      </div>
                    )}

                    {/* Bulk mode */}
                    {mode === "bulk" && (
                      <div className="au au1" style={S.card}>
                        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 6 }}>URLs (una por linea, max 10)</div>
                        <textarea style={{ ...S.input, height: 130, fontFamily: "monospace", fontSize: 12, resize: "vertical" }} value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} placeholder={"https://app.dropi.cr/...\nhttps://aliexpress.com/..."} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <span style={{ fontSize: 12, color: "#475569" }}>{bulkUrls.split("\n").filter(u => u.trim().startsWith("http")).length} URLs detectadas</span>
                          <button style={S.btn} onClick={createBulk}>Crear todas</button>
                        </div>
                      </div>
                    )}

                    {/* Country + config */}
                    <div className="au au2" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                      <select style={S.select} value={country} onChange={e => setCountry(e.target.value)}>{C.map(c => <option key={c.c} value={c.c}>{c.f} {c.n} ({c.cur})</option>)}</select>
                      <button onClick={() => setShowCfg(!showCfg)} style={{ fontSize: 12, color: "#475569", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>{showCfg ? "Ocultar" : "Opciones avanzadas"}</button>
                      {disc > 0 && <span style={{ fontSize: 11, background: "rgba(239,68,68,.15)", color: "#FCA5A5", padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>-{disc}%</span>}
                    </div>
                    {showCfg && (
                      <div className="au" style={{ ...S.card, marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div><div style={S.ml}>Precio {sel.cur}</div><input style={S.mi} value={cfg.price} onChange={e => setCfg({ ...cfg, price: e.target.value })} placeholder="Auto" /></div>
                        <div><div style={S.ml}>Tachado</div><input style={S.mi} value={cfg.compare} onChange={e => setCfg({ ...cfg, compare: e.target.value })} placeholder="Auto (x2)" /></div>
                        <div><div style={S.ml}>WhatsApp</div><input style={S.mi} value={cfg.wa} onChange={e => setCfg({ ...cfg, wa: e.target.value })} placeholder="+506..." /></div>
                        <div><div style={S.ml}>FB Pixel</div><input style={S.mi} value={cfg.fb} onChange={e => setCfg({ ...cfg, fb: e.target.value })} placeholder="ID..." /></div>
                      </div>
                    )}
                  </div>
                )}

                {/* LOADING STATE — con progreso real */}
                {step === "working" && (
                  <div className="au" style={{ ...S.card, textAlign: "center", padding: "48px 32px" }}>
                    <div style={{ width: 56, height: 56, border: "3px solid #1F2937", borderTop: "3px solid #10B981", borderRadius: "50%", margin: "0 auto 20px", animation: "spin .8s linear infinite" }} />
                    <p style={{ fontWeight: 700, fontSize: 18, color: "#F8FAFC", marginBottom: 4 }}>{currentStep.label}</p>
                    <p style={{ color: "#475569", fontSize: 13, marginBottom: 20 }}>{currentStep.sub}</p>
                    {/* Progress bar */}
                    <div style={{ width: "100%", maxWidth: 320, height: 4, background: "#1F2937", borderRadius: 2, margin: "0 auto", overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#10B981,#059669)", borderRadius: 2, transition: "width 1s ease" }} />
                    </div>
                    <p style={{ color: "#334155", fontSize: 12, marginTop: 10 }}>{elapsed}s</p>
                  </div>
                )}

                {/* SUCCESS STATE */}
                {step === "done" && result && !bulkResults && (
                  <div className="au" style={{ ...S.card, border: "1px solid rgba(16,185,129,.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✓</div>
                      <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC" }}>Landing creada</h2>
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <span style={S.tag}>{result.imagesFound || 0} imgs</span>
                          <span style={S.tag}>{sel.f} {sel.n}</span>
                          <span style={S.tag}>{Math.round((result.duration || 0) / 1000)}s</span>
                        </div>
                      </div>
                    </div>

                    {result.landing?.headline && (
                      <div style={{ background: "#0F1629", borderRadius: 10, padding: 16, marginBottom: 16, borderLeft: "3px solid #10B981" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", lineHeight: 1.4 }}>{result.landing.headline}</div>
                        {result.landing.subheadline && <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{result.landing.subheadline}</div>}
                      </div>
                    )}

                    {analyzed?.images?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
                        {analyzed.images.slice(0, 6).map((img, i) => <img key={i} src={img} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, border: "2px solid #1F2937", flexShrink: 0 }} onError={e => { e.target.style.display = "none"; }} />)}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {result.shopifyUrl && <a href={result.shopifyUrl} target="_blank" rel="noreferrer" style={{ ...S.link, background: "#059669" }}>Ver en tienda</a>}
                      {result.shopifyId && <a href={`https://admin.shopify.com/store/${store}/products/${result.shopifyId}`} target="_blank" rel="noreferrer" style={S.link}>Shopify Admin</a>}
                      <button onClick={reset} style={{ ...S.link, background: "#1F2937", color: "#94A3B8" }}>Crear otra</button>
                    </div>
                  </div>
                )}

                {/* BULK RESULTS */}
                {bulkResults && step === "done" && (
                  <div className="au" style={{ ...S.card, border: "1px solid rgba(16,185,129,.3)" }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", marginBottom: 16 }}>{bulkResults.created}/{bulkResults.total} landings creadas</h2>
                    {bulkResults.results?.map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13 }}>
                        <span style={{ color: r.ok ? "#6EE7B7" : "#FCA5A5" }}>{r.ok ? "✓" : "✕"} {r.title || r.url?.slice(0, 40)}</span>
                        {r.shopifyId && <a href={`https://admin.shopify.com/store/${store}/products/${r.shopifyId}`} target="_blank" rel="noreferrer" style={{ color: "#3B82F6", fontSize: 12 }}>Admin</a>}
                      </div>
                    ))}
                    <button onClick={reset} style={{ ...S.btn, width: "100%", marginTop: 14 }}>Crear mas</button>
                  </div>
                )}
              </>
            )}

            {/* ═══ TAB: PANEL ═══ */}
            {tab === "panel" && (
              <>
                <div className="au" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                  <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.03em" }}>Panel</h1>
                    <p style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>Estado del sistema</p>
                  </div>
                  <button style={{ ...S.btn, fontSize: 13, opacity: autoCreating ? 0.5 : 1 }} onClick={autoCreate} disabled={autoCreating}>{autoCreating ? "Creando..." : "Auto-crear"}</button>
                </div>

                <div className="au au1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                  {[["Total", stats?.total || 0, "#3B82F6"], ["Publicadas", stats?.published || 0, "#10B981"], ["Borradores", stats?.drafts || 0, "#F59E0B"], ["Hoy", stats?.last24h || 0, "#8B5CF6"]].map(([l, v, c]) => (
                    <div key={l} style={{ ...S.card, textAlign: "center", padding: 20 }}>
                      <div style={{ fontSize: 32, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 6, textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
                    </div>
                  ))}
                </div>

                <div className="au au2" style={S.card}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#F8FAFC", marginBottom: 14 }}>Recientes</div>
                  {(stats?.recent || []).slice(0, 6).map(l => {
                    const d = pl(l);
                    return (
                      <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.06)", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#E2E8F0" }}>{l.product_name}</div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{new Date(l.created_at).toLocaleDateString("es-CO")} {d.formatted_price || ""}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button onClick={() => setPreviewId(l.id)} style={S.sm}>Preview</button>
                          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 700, background: l.status === "publicado" ? "rgba(16,185,129,.15)" : "rgba(245,158,11,.15)", color: l.status === "publicado" ? "#6EE7B7" : "#FCD34D" }}>{l.status}</span>
                        </div>
                      </div>
                    );
                  })}
                  {(!stats?.recent || stats.recent.length === 0) && <p style={{ color: "#334155", textAlign: "center", padding: 24 }}>Sin landings aun</p>}
                </div>
              </>
            )}

            {/* ═══ TAB: LANDINGS ═══ */}
            {tab === "landings" && (
              <>
                <div className="au" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.03em" }}>Mis Landings</h1>
                  <span style={{ fontSize: 12, color: "#475569", background: "rgba(255,255,255,.04)", padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)" }}>{landingTotal} total</span>
                </div>
                {landings.map((l, idx) => {
                  const d = pl(l);
                  const expanded = selectedLanding === l.id;
                  return (
                    <div key={l.id} className={`au au${Math.min(idx + 1, 4)}`} style={S.card}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#E2E8F0" }}>{l.product_name}</div>
                          <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{new Date(l.created_at).toLocaleString("es-CO")} · {d.product_type || ""} {d.formatted_price || ""} {d.country_code ? C.find(c => c.c === d.country_code)?.f || "" : ""}</div>
                          {d.headline && <div style={{ fontSize: 13, marginTop: 6, color: "#64748B", fontStyle: "italic" }}>{d.headline}</div>}
                        </div>
                        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 8, fontWeight: 700, height: "fit-content", background: l.status === "publicado" ? "rgba(16,185,129,.15)" : "rgba(245,158,11,.15)", color: l.status === "publicado" ? "#6EE7B7" : "#FCD34D" }}>{l.status}</span>
                      </div>

                      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                        <button onClick={() => setPreviewId(l.id)} style={S.sm}>Preview</button>
                        {l.shopify_url && <a href={l.shopify_url} target="_blank" rel="noreferrer" style={{ ...S.sm, textDecoration: "none" }}>Tienda</a>}
                        {l.shopify_product_id && <a href={`https://admin.shopify.com/store/${store}/products/${l.shopify_product_id}`} target="_blank" rel="noreferrer" style={{ ...S.sm, textDecoration: "none" }}>Admin</a>}
                        <button onClick={() => setSelectedLanding(expanded ? null : l.id)} style={S.sm}>{expanded ? "Cerrar" : "Detalle"}</button>
                        <button onClick={() => { setImproveId(l.id); setImproveFeedback(""); }} style={{ ...S.sm, borderColor: "rgba(16,185,129,.3)", color: "#10B981" }}>Mejorar</button>
                      </div>

                      {expanded && (
                        <div style={{ marginTop: 14, padding: 16, background: "#0F1629", borderRadius: 12, border: "1px solid rgba(255,255,255,.06)" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                            <span style={{ fontSize: 11, color: "#475569", alignSelf: "center", marginRight: 4 }}>Duplicar:</span>
                            {C.slice(0, 8).map(c => <button key={c.c} onClick={() => duplicateLanding(l.id, c.c)} style={{ ...S.sm, fontSize: 11, padding: "3px 8px" }}>{c.f}</button>)}
                          </div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                            <span style={{ fontSize: 11, color: "#475569", alignSelf: "center", marginRight: 4 }}>Copiar:</span>
                            {d.ad_copies?.facebook?.[0] && <button onClick={() => cp(typeof d.ad_copies.facebook[0] === "object" ? d.ad_copies.facebook[0].primary_text : d.ad_copies.facebook[0], "FB Ad")} style={{ ...S.sm, fontSize: 11 }}>FB Ad</button>}
                            {(d.tiktok_scripts?.[0] || d.ad_copies?.tiktok_scripts?.[0]) && <button onClick={() => { const tk = d.tiktok_scripts?.[0] || d.ad_copies?.tiktok_scripts?.[0]; cp(typeof tk === "object" ? tk.full_script : tk, "TikTok"); }} style={{ ...S.sm, fontSize: 11 }}>TikTok</button>}
                            {d.email_marketing?.body && <button onClick={() => cp(`Asunto: ${d.email_marketing.subject}\n\n${d.email_marketing.body}`, "Email")} style={{ ...S.sm, fontSize: 11 }}>Email</button>}
                            {d.bullet_points?.length > 0 && <button onClick={() => cp(d.bullet_points.join("\n"), "Beneficios")} style={{ ...S.sm, fontSize: 11 }}>Beneficios</button>}
                          </div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: "#475569", alignSelf: "center", marginRight: 4 }}>Regenerar:</span>
                            {sects.map(sec => <button key={sec.key} disabled={regenerating === `${l.id}-${sec.key}`} onClick={() => handleRegenerate(l.id, sec.key)} style={{ ...S.sm, fontSize: 11, opacity: regenerating === `${l.id}-${sec.key}` ? 0.3 : 1 }}>{sec.label}</button>)}
                          </div>
                          {d.problem_solution && <div style={{ background: "#111827", padding: 12, borderRadius: 8, marginBottom: 8, fontSize: 12, lineHeight: 1.7 }}><span style={{ color: "#EF4444" }}>Problema:</span> {d.problem_solution.problem}<br /><span style={{ color: "#10B981" }}>Solucion:</span> {d.problem_solution.solution}</div>}
                          {d.bullet_points?.map((b, i) => <div key={i} style={{ fontSize: 12, padding: "3px 0", color: "#64748B" }}>{b}</div>)}
                          {d.testimonials?.length > 0 && <div style={{ marginTop: 8 }}>{d.testimonials.map((t, i) => <div key={i} style={{ background: "#111827", padding: 10, borderRadius: 8, marginBottom: 4, fontSize: 12 }}><strong style={{ color: "#E2E8F0" }}>{t.name}{t.city ? ` — ${t.city}` : ""}</strong><span style={{ color: "#F59E0B", marginLeft: 6 }}>{"★".repeat(t.rating || 5)}</span><br /><span style={{ color: "#475569" }}>{t.text}</span></div>)}</div>}
                        </div>
                      )}

                      {improveId === l.id && (
                        <div style={{ marginTop: 12, padding: 14, background: "#0F1629", borderRadius: 12, border: "1px solid rgba(16,185,129,.2)" }}>
                          <textarea style={{ ...S.input, height: 60, fontSize: 12 }} value={improveFeedback} onChange={e => setImproveFeedback(e.target.value)} placeholder="Que quieres mejorar? Ej: mas urgente, tono juvenil..." />
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            <button style={{ ...S.btn, fontSize: 12, padding: "8px 16px", opacity: improving ? 0.5 : 1 }} onClick={submitImprove} disabled={improving}>{improving ? "..." : "Aplicar"}</button>
                            <button style={S.sm} onClick={() => setImproveId(null)}>Cancelar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {landings.length === 0 && <p style={{ color: "#334155", textAlign: "center", padding: 40 }}>Sin landings</p>}
              </>
            )}

            {/* ═══ TAB: CONFIG ═══ */}
            {tab === "config" && (
              <>
                <h1 className="au" style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.03em", marginBottom: 24 }}>Configuracion</h1>

                <div className="au au1" style={S.card}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#F8FAFC", marginBottom: 14 }}>Shopify</div>
                  {shopifyOk === null ? <div style={{ color: "#475569", fontSize: 13 }}>Verificando...</div> : shopifyOk?.ok ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,.5)" }} />
                        <span style={{ color: "#10B981", fontWeight: 700, fontSize: 14 }}>Conectado</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {[["Tienda", shopifyOk.name], ["Dominio", shopifyOk.domain], ["Plan", shopifyOk.plan]].map(([k, v]) => (
                          <div key={k} style={{ fontSize: 12, color: "#475569" }}><span style={{ color: "#64748B" }}>{k}:</span> <span style={{ color: "#94A3B8" }}>{v}</span></div>
                        ))}
                      </div>
                    </div>
                  ) : <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: "#EF4444" }} /><span style={{ color: "#FCA5A5", fontWeight: 600 }}>No conectado</span></div>}
                </div>

                <div className="au au2" style={S.card}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#F8FAFC", marginBottom: 14 }}>Stack</div>
                  {[
                    ["IA", "Gemini 2.5 Flash (gratis)"],
                    ["Scraper", "Multi-plataforma"],
                    ["Template", "Master Escala v2"],
                    ["COD", "Releasit COD Form"],
                    ["Dropi", "CR, CO, GT"],
                    ["Monedas", "20 paises"],
                    ["Ads", "Facebook + TikTok + Email"],
                    ["Webhook", "Score >= 9 = auto"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.04)", fontSize: 13 }}>
                      <span style={{ color: "#94A3B8", fontWeight: 600 }}>{k}</span>
                      <span style={{ color: "#475569" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

const S = {
  card: { background: "#111827", borderRadius: 14, border: "1px solid rgba(255,255,255,.06)", padding: "22px 24px", marginBottom: 14 },
  input: { width: "100%", padding: "11px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, background: "rgba(255,255,255,.04)", color: "#E2E8F0", outline: "none", boxSizing: "border-box", transition: "all .15s" },
  btn: { background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", padding: "11px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s", boxShadow: "0 2px 8px rgba(16,185,129,.2)" },
  select: { border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 12px", fontSize: 13, background: "#111827", color: "#E2E8F0", cursor: "pointer", outline: "none" },
  link: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none", color: "#fff", background: "#3B82F6", cursor: "pointer", border: "none", transition: "all .15s" },
  sm: { fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", color: "#64748B", cursor: "pointer", background: "transparent", transition: "all .15s" },
  ml: { fontSize: 11, color: "#475569", marginBottom: 4, fontWeight: 600 },
  mi: { width: "100%", padding: "8px 12px", fontSize: 12, border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, background: "rgba(255,255,255,.04)", color: "#E2E8F0", outline: "none", boxSizing: "border-box" },
  tag: { fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,.06)", color: "#64748B", fontWeight: 600 },
};
