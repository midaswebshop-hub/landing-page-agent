import { useState, useEffect, useCallback } from "react";

export default function Dashboard() {
  const [tab, setTab] = useState("create");
  const [toast, setToast] = useState(null);

  // Create
  const [mode, setMode] = useState("url"); // url | image | bulk
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

  // Data
  const [stats, setStats] = useState(null);
  const [landings, setLandings] = useState([]);
  const [landingTotal, setLandingTotal] = useState(0);
  const [selectedLanding, setSelectedLanding] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [shopifyOk, setShopifyOk] = useState(null);

  // Improve
  const [improveId, setImproveId] = useState(null);
  const [improveFeedback, setImproveFeedback] = useState("");
  const [improving, setImproving] = useState(false);
  const [regenerating, setRegenerating] = useState(null);
  const [autoCreating, setAutoCreating] = useState(false);

  const C = [
    { c: "CR", f: "\u{1F1E8}\u{1F1F7}", n: "Costa Rica", cur: "CRC", s: "\u20A1" },
    { c: "CO", f: "\u{1F1E8}\u{1F1F4}", n: "Colombia", cur: "COP", s: "$" },
    { c: "GT", f: "\u{1F1EC}\u{1F1F9}", n: "Guatemala", cur: "GTQ", s: "Q" },
    { c: "MX", f: "\u{1F1F2}\u{1F1FD}", n: "Mexico", cur: "MXN", s: "$" },
    { c: "PA", f: "\u{1F1F5}\u{1F1E6}", n: "Panama", cur: "USD", s: "$" },
    { c: "EC", f: "\u{1F1EA}\u{1F1E8}", n: "Ecuador", cur: "USD", s: "$" },
    { c: "PE", f: "\u{1F1F5}\u{1F1EA}", n: "Peru", cur: "PEN", s: "S/" },
    { c: "CL", f: "\u{1F1E8}\u{1F1F1}", n: "Chile", cur: "CLP", s: "$" },
    { c: "HN", f: "\u{1F1ED}\u{1F1F3}", n: "Honduras", cur: "HNL", s: "L" },
    { c: "SV", f: "\u{1F1F8}\u{1F1FB}", n: "El Salvador", cur: "USD", s: "$" },
    { c: "NI", f: "\u{1F1F3}\u{1F1EE}", n: "Nicaragua", cur: "NIO", s: "C$" },
    { c: "DO", f: "\u{1F1E9}\u{1F1F4}", n: "Rep. Dominicana", cur: "DOP", s: "RD$" },
    { c: "AR", f: "\u{1F1E6}\u{1F1F7}", n: "Argentina", cur: "ARS", s: "$" },
    { c: "BR", f: "\u{1F1E7}\u{1F1F7}", n: "Brasil", cur: "BRL", s: "R$" },
    { c: "BO", f: "\u{1F1E7}\u{1F1F4}", n: "Bolivia", cur: "BOB", s: "Bs" },
    { c: "PY", f: "\u{1F1F5}\u{1F1FE}", n: "Paraguay", cur: "PYG", s: "\u20B2" },
    { c: "UY", f: "\u{1F1FA}\u{1F1FE}", n: "Uruguay", cur: "UYU", s: "$U" },
    { c: "VE", f: "\u{1F1FB}\u{1F1EA}", n: "Venezuela", cur: "USD", s: "$" },
    { c: "US", f: "\u{1F1FA}\u{1F1F8}", n: "USA", cur: "USD", s: "$" },
    { c: "ES", f: "\u{1F1EA}\u{1F1F8}", n: "Espana", cur: "EUR", s: "\u20AC" },
  ];
  const sel = C.find((x) => x.c === country) || C[0];
  const store = "hy1jn3-vn";
  const sections = [
    { key: "testimonials", label: "Testimonios" },
    { key: "faq", label: "FAQ" },
    { key: "benefits", label: "Beneficios" },
    { key: "copy", label: "Copy" },
    { key: "ads", label: "Ads" },
    { key: "urgency", label: "Urgencia" },
  ];

  const show = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 5000); };

  const load = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        fetch("/api/landing?action=status").then((r) => r.json()).catch(() => ({})),
        fetch("/api/landing?action=list&page=1").then((r) => r.json()).catch(() => ({ landings: [] })),
      ]);
      setStats(s); setLandings(l.landings || []); setLandingTotal(l.total || 0);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === "config") fetch("/api/landing?action=test-shopify").then(r => r.json()).then(setShopifyOk).catch(() => {}); }, [tab]);

  // Crear desde URL
  async function createFromUrl() {
    if (!url.trim()) return show("Pega una URL", "err");
    setStep("working");
    try {
      const r = await fetch("/api/landing?action=create-from-url", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          countryCode: country,
          currency: sel.cur,
          sellPrice: cfg.price || null,
          comparePrice: cfg.compare || null,
          whatsappNumber: cfg.wa || null,
          facebookPixelId: cfg.fb || null,
          tiktokPixelId: cfg.tk || null,
          // Imágenes extras (para FB Ads Library u otras fuentes)
          extraImages: imgUrl ? imgUrl.split("\n").map(u => u.trim()).filter(u => u.startsWith("http")) : [],
        }),
      });
      const d = await r.json();
      if (d.ok) { setResult(d); setAnalyzed(d.analyzed || null); setStep("done"); show("Landing PRO creada"); load(); }
      else { show("Error: " + d.error, "err"); setStep("idle"); }
    } catch { show("Error de conexion", "err"); setStep("idle"); }
  }

  // Crear desde imagen
  async function createFromImage() {
    if (!imgName.trim()) return show("Escribe el nombre del producto", "err");
    setStep("working");
    try {
      const images = imgUrl.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
      const r = await fetch("/api/landing?action=create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: imgName, category: "General", market: "LATAM", sellPrice: cfg.price || "29.99", comparePrice: cfg.compare || null, description: "", images, countryCode: country, currency: sel.cur, whatsappNumber: cfg.wa || null, facebookPixelId: cfg.fb || null, tiktokPixelId: cfg.tk || null }),
      });
      const d = await r.json();
      if (d.ok) { setResult(d); setStep("done"); show("Landing PRO creada"); load(); }
      else { show("Error: " + d.error, "err"); setStep("idle"); }
    } catch { show("Error de conexion", "err"); setStep("idle"); }
  }

  // Auto-crear desde ganadores
  async function autoCreate() {
    setAutoCreating(true);
    try {
      const r = await fetch("/api/landing?action=auto-create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 3, minScore: 8 }) });
      const d = await r.json();
      if (d.ok) show(`${d.created} landings creadas de ${d.total} ganadores`);
      else show(d.error || d.message || "Error", "err");
    } catch { show("Error de conexion", "err"); }
    setAutoCreating(false); load();
  }

  // Mejorar landing
  async function submitImprove() {
    if (!improveFeedback.trim() || !improveId) return;
    setImproving(true);
    try {
      const r = await fetch("/api/landing?action=improve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: improveId, feedback: improveFeedback }) });
      const d = await r.json();
      if (d.ok) { show("Landing mejorada"); setImproveFeedback(""); setImproveId(null); load(); }
      else show(d.error, "err");
    } catch { show("Error", "err"); }
    setImproving(false);
  }

  // Regenerar seccion
  async function handleRegenerate(id, section) {
    setRegenerating(`${id}-${section}`);
    try {
      const r = await fetch("/api/landing?action=regenerate-section", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, section }) });
      const d = await r.json();
      if (d.ok) { show(`"${section}" regenerada`); load(); } else show(d.error, "err");
    } catch { show("Error", "err"); }
    setRegenerating(null);
  }

  // Crear masivo
  async function createBulk() {
    const urls = bulkUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (urls.length === 0) return show("Pega al menos una URL", "err");
    setStep("working");
    setBulkResults(null);
    try {
      const r = await fetch("/api/landing?action=create-bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, countryCode: country, currency: sel.cur, whatsappNumber: cfg.wa || null, facebookPixelId: cfg.fb || null, tiktokPixelId: cfg.tk || null }),
      });
      const d = await r.json();
      if (d.ok) { setBulkResults(d); setStep("done"); show(`${d.created}/${d.total} landings creadas`); load(); }
      else { show("Error: " + d.error, "err"); setStep("idle"); }
    } catch { show("Error de conexion", "err"); setStep("idle"); }
  }

  // Duplicar para otro país
  async function duplicateLanding(id, targetCountry) {
    const tc = C.find(c => c.c === targetCountry);
    show(`Duplicando para ${tc?.f || ""} ${tc?.n || targetCountry}...`);
    try {
      const r = await fetch("/api/landing?action=duplicate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, countryCode: targetCountry, currency: tc?.cur }),
      });
      const d = await r.json();
      if (d.ok) { show(`Duplicada para ${tc?.f || ""} ${tc?.n || targetCountry}`); load(); }
      else show("Error: " + d.error, "err");
    } catch { show("Error", "err"); }
  }

  // Copiar al portapapeles
  function copyText(text, label) {
    navigator.clipboard.writeText(text).then(() => show(`${label} copiado`)).catch(() => show("No se pudo copiar", "err"));
  }

  function reset() { setUrl(""); setImgUrl(""); setImgName(""); setBulkUrls(""); setStep("idle"); setAnalyzed(null); setResult(null); setBulkResults(null); }
  function pl(r) { try { return JSON.parse(r.landing_data || "{}"); } catch { return {}; } }
  const imgPreviews = imgUrl.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
  const discount = cfg.price && cfg.compare && parseFloat(cfg.compare) > parseFloat(cfg.price) ? Math.round((1 - parseFloat(cfg.price) / parseFloat(cfg.compare)) * 100) : 0;

  const navItems = [
    { id: "create", icon: "🚀", label: "Crear Landing" },
    { id: "panel", icon: "📊", label: "Panel" },
    { id: "landings", icon: "📄", label: "Mis Landings" },
    { id: "config", icon: "⚙️", label: "Configuracion" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", background: "#0F172A", color: "#F8FAFC" }}>
      {toast && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontWeight: 500, fontSize: 14, background: toast.type === "err" ? "#FCEBEB" : "#EAF3DE", color: toast.type === "err" ? "#501313" : "#27500A", border: "1px solid", borderColor: toast.type === "err" ? "#E24B4A" : "#27AE60", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>{toast.msg}</div>}

      {/* Preview Modal */}
      {previewId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPreviewId(null)}>
          <div style={{ background: "#1E293B", borderRadius: 12, padding: 24, width: "90vw", maxWidth: 500, maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, color: "#F8FAFC" }}>Vista previa (mobile)</span>
              <button onClick={() => setPreviewId(null)} style={{ background: "none", border: "none", color: "#E24B4A", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <iframe src={`/api/landing?action=preview&id=${previewId}`} style={{ width: "375px", height: "70vh", border: "1px solid #334155", borderRadius: 8, margin: "0 auto" }} title="Preview" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: 230, background: "#1E293B", borderRight: "1px solid #334155", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "0 8px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#10B981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>L</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>LandingAgent</span>
          <span style={{ fontSize: 10, background: "#10B981", color: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>PRO</span>
        </div>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ background: tab === n.id ? "#334155" : "transparent", border: "none", textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: tab === n.id ? "#F8FAFC" : "#94A3B8", fontWeight: tab === n.id ? 600 : 400, display: "flex", gap: 8, alignItems: "center" }}>
            <span>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid #334155", fontSize: 11, color: "#64748B" }}>
          Shopify + Dropi + Claude AI<br/>Master Escala + Releasit COD
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxWidth: 900 }}>

        {/* ═══ CREAR ═══ */}
        {tab === "create" && (
          <>
            {step === "idle" && (
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#F8FAFC" }}>Crea landing pages en segundos</h1>
                <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Pega URL de competidor o sube imagenes. IA + Master Escala + Releasit COD.</p>
              </div>
            )}
            {step === "idle" && (
              <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "#334155", borderRadius: 8, padding: 3, width: "fit-content" }}>
                <button onClick={() => setMode("url")} style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: mode === "url" ? 700 : 400, background: mode === "url" ? "#27AE60" : "transparent", color: mode === "url" ? "#fff" : "#5F5E5A" }}>Desde URL</button>
                <button onClick={() => setMode("image")} style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: mode === "image" ? 700 : 400, background: mode === "image" ? "#27AE60" : "transparent", color: mode === "image" ? "#fff" : "#5F5E5A" }}>Desde imagen</button>
                <button onClick={() => setMode("bulk")} style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: mode === "bulk" ? 700 : 400, background: mode === "bulk" ? "#27AE60" : "transparent", color: mode === "bulk" ? "#fff" : "#5F5E5A" }}>Masivo</button>
              </div>
            )}

            {mode === "url" && step === "idle" && (
              <div style={S.card}>
                <label style={S.label}>URL del producto o competidor</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...S.input, flex: 1 }} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://aliexpress.com/item/... o facebook.com/ads/library/?q=..." onKeyDown={e => e.key === "Enter" && createFromUrl()} />
                  <button style={S.btn} onClick={createFromUrl}>Crear Landing</button>
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>AliExpress, Amazon, Shopify, Mercado Libre, Facebook Ads Library, cualquier URL</div>

                {/* Si es FB Ads Library, mostrar campo extra de imágenes */}
                {url.includes("facebook.com/ads/library") && (
                  <div style={{ marginTop: 12, padding: 12, background: "#0F172A", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>📘</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Facebook Ads Library detectada</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 8px" }}>
                      El agente extrae la keyword "{(() => { try { return decodeURIComponent(new URL(url).searchParams.get("q") || ""); } catch { return ""; } })()}" y genera la landing. Si tienes imagenes del producto, pegalas abajo para mejor resultado:
                    </p>
                    <textarea
                      style={{ ...S.input, height: 50, fontSize: 11, fontFamily: "monospace" }}
                      value={imgUrl}
                      onChange={e => setImgUrl(e.target.value)}
                      placeholder="(Opcional) URLs de imagenes, una por linea"
                    />
                  </div>
                )}
              </div>
            )}

            {mode === "image" && step === "idle" && (
              <div style={S.card}>
                <label style={S.label}>Nombre del producto *</label>
                <input style={S.input} value={imgName} onChange={e => setImgName(e.target.value)} placeholder="Ej: Cargador inalambrico 5 en 1" />
                <label style={{ ...S.label, marginTop: 10 }}>URLs de imagenes (una por linea)</label>
                <textarea style={{ ...S.input, height: 70, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder={"https://imagen1.jpg\nhttps://imagen2.jpg"} />
                {imgPreviews.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {imgPreviews.slice(0, 8).map((u, i) => <img key={i} src={u} alt="" style={{ width: 55, height: 55, objectFit: "cover", borderRadius: 6, border: "1px solid #334155" }} onError={e => { e.target.style.opacity = 0.3; }} />)}
                    <span style={{ fontSize: 11, color: "#10B981", alignSelf: "center", fontWeight: 600 }}>{imgPreviews.length} imgs</span>
                  </div>
                )}
                <button style={{ ...S.btn, width: "100%", marginTop: 10 }} onClick={createFromImage}>Crear Landing</button>
              </div>
            )}

            {/* Modo MASIVO */}
            {mode === "bulk" && step === "idle" && (
              <div style={S.card}>
                <label style={S.label}>URLs de productos (una por linea, maximo 10)</label>
                <textarea style={{ ...S.input, height: 120, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} placeholder={"https://aliexpress.com/item/123...\nhttps://amazon.com/dp/456...\nhttps://competidor.myshopify.com/products/..."} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{bulkUrls.split("\n").filter(u => u.trim().startsWith("http")).length} URLs detectadas</span>
                  <button style={S.btn} onClick={createBulk}>Crear todas las landings</button>
                </div>
              </div>
            )}

            {/* Resultados masivos */}
            {bulkResults && step === "done" && (
              <div style={{ ...S.card, border: "2px solid #10B981" }}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 40 }}>🚀</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: "8px 0" }}>{bulkResults.created}/{bulkResults.total} landings creadas</h2>
                </div>
                {bulkResults.results?.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #334155", fontSize: 13 }}>
                    <span style={{ color: r.ok ? "#10B981" : "#EF4444" }}>{r.ok ? "✅" : "❌"} {r.title || r.url?.slice(0, 40)}</span>
                    {r.shopifyId && <a href={`https://admin.shopify.com/store/${store}/products/${r.shopifyId}`} target="_blank" rel="noreferrer" style={{ color: "#3B82F6", fontSize: 12 }}>Admin</a>}
                  </div>
                ))}
                <button onClick={reset} style={{ ...S.btn, width: "100%", marginTop: 12 }}>Crear mas</button>
              </div>
            )}

            {step === "idle" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <select style={S.select} value={country} onChange={e => setCountry(e.target.value)}>{C.map(c => <option key={c.c} value={c.c}>{c.f} {c.n} ({c.cur})</option>)}</select>
                <button onClick={() => setShowCfg(!showCfg)} style={{ fontSize: 12, color: "#64748B", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>{showCfg ? "Ocultar" : "Opciones avanzadas"}</button>
                {discount > 0 && <span style={{ fontSize: 12, background: "#EF4444", color: "#fff", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>-{discount}% OFF</span>}
              </div>
            )}
            {showCfg && step === "idle" && (
              <div style={{ ...S.card, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={S.ml}>Precio {sel.cur}</label><input style={S.mi} value={cfg.price} onChange={e => setCfg({ ...cfg, price: e.target.value })} placeholder="Auto" /></div>
                <div><label style={S.ml}>Precio tachado</label><input style={S.mi} value={cfg.compare} onChange={e => setCfg({ ...cfg, compare: e.target.value })} placeholder="Auto" /></div>
                <div><label style={S.ml}>WhatsApp</label><input style={S.mi} value={cfg.wa} onChange={e => setCfg({ ...cfg, wa: e.target.value })} placeholder="+506..." /></div>
                <div><label style={S.ml}>FB Pixel</label><input style={S.mi} value={cfg.fb} onChange={e => setCfg({ ...cfg, fb: e.target.value })} placeholder="123456" /></div>
              </div>
            )}

            {step === "working" && (
              <div style={{ ...S.card, textAlign: "center", padding: "44px 24px" }}>
                <div style={{ width: 44, height: 44, border: "4px solid #e0ddd4", borderTop: "4px solid #27AE60", borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontWeight: 700, fontSize: 17, margin: "0 0 4px" }}>Creando tu landing PRO...</p>
                <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>Scraping + IA + Master Escala + Releasit COD...</p>
              </div>
            )}

            {step === "done" && result && (
              <div style={{ ...S.card, border: "2px solid #27AE60" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 44 }}>🎉</div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0" }}>Landing PRO lista</h2>
                  <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 14px" }}>{result.imagesFound || 0} imgs · {sel.f} {sel.n} · Master Escala{result.templateApplied ? " aplicado" : ""}</p>
                  {analyzed?.images?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "8px 0", marginBottom: 12, justifyContent: "center" }}>
                      {analyzed.images.slice(0, 6).map((img, i) => <img key={i} src={img} alt="" style={{ width: 65, height: 65, objectFit: "cover", borderRadius: 8, border: "1px solid #334155" }} onError={e => { e.target.style.display = "none"; }} />)}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {result.shopifyUrl && <a href={result.shopifyUrl} target="_blank" rel="noreferrer" style={S.link}>Ver tienda</a>}
                    {result.shopifyId && <a href={`https://admin.shopify.com/store/${store}/products/${result.shopifyId}`} target="_blank" rel="noreferrer" style={{ ...S.link, background: "#3B82F6" }}>Shopify Admin</a>}
                    <button onClick={reset} style={{ ...S.link, background: "#10B981" }}>Crear otra</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ PANEL ═══ */}
        {tab === "panel" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Panel de control</h1>
              <button style={{ ...S.btn, fontSize: 13, padding: "8px 16px", opacity: autoCreating ? 0.5 : 1 }} onClick={autoCreate} disabled={autoCreating}>{autoCreating ? "Creando..." : "Auto-crear desde ganadores"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
              {[["Total", stats?.total || 0, "#3B82F6"], ["Publicadas", stats?.published || 0, "#10B981"], ["Borradores", stats?.drafts || 0, "#F59E0B"], ["24h", stats?.last24h || 0, "#8B5CF6"]].map(([l, v, c]) => (
                <div key={l} style={S.card}><div style={{ fontSize: 11, color: "#64748B" }}>{l}</div><div style={{ fontSize: 24, fontWeight: 800, color: c }}>{v}</div></div>
              ))}
            </div>
            <div style={{ ...S.card, borderColor: "#059669" }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Conexion automatica</div>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 8px" }}>Cuando el agente de dropshipping encuentre un producto con score &gt;= 9, se crea landing automaticamente.</p>
              <div style={{ background: "#0F172A", padding: 10, borderRadius: 8, fontFamily: "monospace", fontSize: 11, color: "#64748B" }}>POST /api/landing?action=webhook<br/>{`{ "name":"...", "score":9, "category":"..." }`}</div>
            </div>
            <div style={S.card}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Recientes</div>
              {(stats?.recent || []).slice(0, 5).map(l => {
                const d = pl(l);
                return (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E293B", alignItems: "center" }}>
                    <div><div style={{ fontWeight: 600, fontSize: 13 }}>{l.product_name}</div><div style={{ fontSize: 11, color: "#64748B" }}>{new Date(l.created_at).toLocaleDateString("es-CO")} {d.formatted_price || ""}</div></div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button onClick={() => setPreviewId(l.id)} style={S.sm}>Preview</button>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, fontWeight: 600, background: l.status === "publicado" ? "#065F46" : "#7F1D1D", color: "#fff" }}>{l.status}</span>
                    </div>
                  </div>
                );
              })}
              {(!stats?.recent || stats.recent.length === 0) && <p style={{ color: "#64748B", fontSize: 13 }}>Crea tu primera landing.</p>}
            </div>
          </>
        )}

        {/* ═══ MIS LANDINGS ═══ */}
        {tab === "landings" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Mis landing pages</h1>
              <span style={{ color: "#64748B", fontSize: 13 }}>{landingTotal} total</span>
            </div>
            {landings.map(l => {
              const d = pl(l);
              const expanded = selectedLanding === l.id;
              return (
                <div key={l.id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{l.product_name}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{new Date(l.created_at).toLocaleString("es-CO")} · {d.product_type || ""} {d.formatted_price || ""} {d.country_code ? C.find(c => c.c === d.country_code)?.f || "" : ""}</div>
                      {d.headline && <div style={{ fontSize: 13, marginTop: 4, color: "#CBD5E1" }}>{d.headline}</div>}
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, height: "fit-content", background: l.status === "publicado" ? "#065F46" : "#7F1D1D", color: "#fff" }}>{l.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    <button onClick={() => setPreviewId(l.id)} style={{ ...S.sm, borderColor: "#3B82F6", color: "#3B82F6" }}>Preview</button>
                    {l.shopify_url && <a href={l.shopify_url} target="_blank" rel="noreferrer" style={{ ...S.sm, textDecoration: "none" }}>Tienda</a>}
                    {l.shopify_product_id && <a href={`https://admin.shopify.com/store/${store}/products/${l.shopify_product_id}`} target="_blank" rel="noreferrer" style={{ ...S.sm, textDecoration: "none" }}>Admin</a>}
                    <button onClick={() => setSelectedLanding(expanded ? null : l.id)} style={S.sm}>{expanded ? "Cerrar" : "Detalle"}</button>
                    <button onClick={() => { setImproveId(l.id); setImproveFeedback(""); }} style={{ ...S.sm, borderColor: "#10B981", color: "#10B981" }}>Mejorar</button>
                  </div>

                  {/* Duplicar para otro país */}
                  {expanded && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#64748B" }}>Duplicar para:</span>
                      {C.slice(0, 8).map(c => (
                        <button key={c.c} onClick={() => duplicateLanding(l.id, c.c)} style={{ ...S.sm, fontSize: 11, padding: "3px 8px" }}>{c.f} {c.n}</button>
                      ))}
                    </div>
                  )}

                  {expanded && (
                    <div style={{ marginTop: 14, borderTop: "1px solid #334155", paddingTop: 14 }}>
                      {/* Botones de copiar copy */}
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                        <span style={{ fontSize: 11, color: "#64748B", alignSelf: "center", marginRight: 4 }}>Copiar:</span>
                        {d.ad_copies?.facebook?.[0] && <button onClick={() => copyText(typeof d.ad_copies.facebook[0] === "object" ? d.ad_copies.facebook[0].primary_text : d.ad_copies.facebook[0], "Facebook Ad")} style={{ ...S.sm, fontSize: 11 }}>FB Ad</button>}
                        {(d.tiktok_scripts?.[0] || d.ad_copies?.tiktok_scripts?.[0]) && <button onClick={() => { const tk = d.tiktok_scripts?.[0] || d.ad_copies?.tiktok_scripts?.[0]; copyText(typeof tk === "object" ? tk.full_script : tk, "TikTok Script"); }} style={{ ...S.sm, fontSize: 11 }}>TikTok</button>}
                        {d.email_marketing?.body && <button onClick={() => copyText(`Asunto: ${d.email_marketing.subject}\n\n${d.email_marketing.body}`, "Email")} style={{ ...S.sm, fontSize: 11 }}>Email</button>}
                        {d.description && <button onClick={() => copyText(d.description.replace(/<[^>]+>/g, ""), "Descripcion")} style={{ ...S.sm, fontSize: 11 }}>Descripcion</button>}
                        {d.bullet_points?.length > 0 && <button onClick={() => copyText(d.bullet_points.join("\n"), "Beneficios")} style={{ ...S.sm, fontSize: 11 }}>Beneficios</button>}
                      </div>

                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: "#64748B", alignSelf: "center", marginRight: 4 }}>Regenerar:</span>
                        {sections.map(sec => (
                          <button key={sec.key} disabled={regenerating === `${l.id}-${sec.key}`} onClick={() => handleRegenerate(l.id, sec.key)} style={{ ...S.sm, fontSize: 11, opacity: regenerating === `${l.id}-${sec.key}` ? 0.5 : 1 }}>{sec.label}</button>
                        ))}
                      </div>
                      {d.problem_solution && <div style={{ background: "#f5f5f2", padding: 10, borderRadius: 8, marginBottom: 8, fontSize: 12 }}><strong>Problema:</strong> {d.problem_solution.problem}<br/><strong>Solucion:</strong> {d.problem_solution.solution}</div>}
                      {d.bullet_points?.map((b, i) => <div key={i} style={{ fontSize: 12, padding: "2px 0", color: "#CBD5E1" }}>{b}</div>)}
                      {d.testimonials?.length > 0 && <div style={{ marginTop: 8 }}>{d.testimonials.map((t, i) => <div key={i} style={{ background: "#0F172A", padding: 8, borderRadius: 6, marginBottom: 4, fontSize: 12 }}><strong>{t.name}{t.city ? ` — ${t.city}` : ""}</strong> {"★".repeat(t.rating || 5)}<br/><span style={{ color: "#64748B" }}>"{t.text}"</span></div>)}</div>}
                      {(d.ad_copies?.facebook || []).map((c, i) => <div key={i} style={{ background: "#f5f5f2", padding: 8, borderRadius: 6, margin: "4px 0", fontSize: 12 }}><strong>FB #{i + 1}:</strong> {typeof c === "object" ? c.primary_text : c}</div>)}
                      {d.email_marketing && <div style={{ background: "#0F172A", padding: 8, borderRadius: 6, margin: "4px 0", fontSize: 12 }}><strong>Email:</strong> {d.email_marketing.subject}<br/><span style={{ color: "#64748B" }}>{d.email_marketing.body}</span></div>}
                    </div>
                  )}

                  {improveId === l.id && (
                    <div style={{ marginTop: 10, borderTop: "1px solid #334155", paddingTop: 10 }}>
                      <textarea style={{ ...S.input, height: 50, fontSize: 12 }} value={improveFeedback} onChange={e => setImproveFeedback(e.target.value)} placeholder="Que quieres mejorar? Ej: 'mas urgente', 'tono juvenil', 'mas testimonios'" />
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <button style={{ ...S.btn, fontSize: 12, padding: "6px 14px", opacity: improving ? 0.5 : 1 }} onClick={submitImprove} disabled={improving}>{improving ? "..." : "Aplicar"}</button>
                        <button style={S.sm} onClick={() => setImproveId(null)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {landings.length === 0 && <p style={{ color: "#64748B", textAlign: "center", padding: 30 }}>Crea tu primera landing.</p>}
          </>
        )}

        {/* ═══ CONFIG ═══ */}
        {tab === "config" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 18px" }}>Configuracion</h1>
            <div style={S.card}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Shopify</div>
              {shopifyOk === null ? <p style={{ color: "#64748B", fontSize: 13 }}>Verificando...</p> : shopifyOk?.ok ? (
                <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} /><span style={{ color: "#10B981", fontWeight: 600, fontSize: 13 }}>Conectado</span></div><p style={{ fontSize: 12, color: "#64748B", margin: "2px 0" }}>Tienda: {shopifyOk.name}</p><p style={{ fontSize: 12, color: "#64748B", margin: "2px 0" }}>Dominio: {shopifyOk.domain}</p><p style={{ fontSize: 12, color: "#64748B", margin: "2px 0" }}>Plan: {shopifyOk.plan}</p></div>
              ) : <div><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block", marginRight: 6 }} /><span style={{ color: "#EF4444", fontWeight: 600, fontSize: 13 }}>No conectado</span><p style={{ fontSize: 12, color: "#64748B" }}>{shopifyOk?.error}</p></div>}
            </div>
            <div style={S.card}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Funcionalidades activas</div>
              {[
                ["Scraper de competidores", "Analiza cualquier URL"],
                ["Copy PRO con IA", "PAS/AIDA + hooks emocionales"],
                ["Template Master Escala", "Secciones nativas del tema"],
                ["Releasit COD Form", "Contraentrega integrada en CTAs"],
                ["Dropi multi-pais", "CR, CO, GT, MX, PA, EC, PE, CL"],
                ["Multi-moneda", "20 paises con conversion automatica"],
                ["Facebook/TikTok Ads", "3 variaciones por plataforma"],
                ["Conexion entre agentes", "Score >= 9 = landing automatica"],
                ["Regenerar secciones", "Testimonios, FAQ, copy individual"],
                ["WhatsApp + Pixels", "Boton flotante + tracking"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E293B", fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{k}</span>
                  <span style={{ color: "#64748B", fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  card: { background: "#1E293B", borderRadius: 12, border: "1px solid #334155", padding: "20px 24px", marginBottom: 14 },
  input: { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #334155", borderRadius: 8, background: "#0F172A", color: "#F8FAFC", outline: "none", boxSizing: "border-box" },
  btn: { background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" },
  label: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 5, fontWeight: 600 },
  ml: { display: "block", fontSize: 11, color: "#64748B", marginBottom: 3 },
  mi: { width: "100%", padding: "7px 10px", fontSize: 12, border: "1px solid #334155", borderRadius: 6, background: "#0F172A", color: "#F8FAFC", outline: "none", boxSizing: "border-box" },
  select: { border: "1px solid #334155", borderRadius: 6, padding: "6px 10px", fontSize: 13, background: "#1E293B", color: "#F8FAFC", cursor: "pointer" },
  link: { display: "inline-block", padding: "9px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none", color: "#fff", background: "#3B82F6", cursor: "pointer", border: "none" },
  sm: { fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1px solid #475569", color: "#94A3B8", cursor: "pointer", background: "none" },
};
