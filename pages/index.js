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
  // Spy
  const [spyQuery, setSpyQuery] = useState("");
  const [spyCountry, setSpyCountry] = useState("ALL");
  const [spyResults, setSpyResults] = useState(null);
  const [spyLoading, setSpyLoading] = useState(false);
  const [spyProducts, setSpyProducts] = useState([]);
  const [spyExpanded, setSpyExpanded] = useState(null);

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

  async function runSpy(query) {
    if (!query?.trim()) return show("Escribe el producto a espiar", "err");
    setSpyLoading(true); setSpyResults(null);
    try {
      const r = await fetch("/api/landing?action=spy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, country: spyCountry }) });
      const d = await r.json();
      if (d.ok) { setSpyResults(d); show(`${d.results?.length || 0} competidores encontrados`); }
      else show(d.error || "Error", "err");
    } catch { show("Error de conexion", "err"); }
    setSpyLoading(false);
  }

  async function loadSpyProducts() {
    try {
      const r = await fetch("/api/landing?action=spy-products").then(r => r.json());
      if (r.ok) setSpyProducts(r.products || []);
    } catch {}
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
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
        body { background: #060A13; color: #CBD5E1; font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; -webkit-font-smoothing: antialiased }
        ::selection { background: #059669; color: #fff }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #10B981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,.18), 0 0 16px rgba(16,185,129,.08) !important }
        ::-webkit-scrollbar { width: 6px } ::-webkit-scrollbar-track { background: transparent } ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px }

        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
        @keyframes shimmer { 0% { background-position: -200px 0 } 100% { background-position: calc(200px + 100%) 0 } }
        @keyframes glow { 0%,100%{box-shadow:0 0 5px var(--accent,#10B981)} 50%{box-shadow:0 0 20px var(--accent,#10B981)} }
        @keyframes borderGlow { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes slideDown { from{opacity:0;max-height:0;transform:translateY(-8px)} to{opacity:1;max-height:2000px;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes orbFloat { 0%{transform:translate(0,0)} 33%{transform:translate(10px,-10px)} 66%{transform:translate(-5px,5px)} 100%{transform:translate(0,0)} }

        .au { animation: fadeUp .3s ease both }
        .au1 { animation-delay: .05s } .au2 { animation-delay: .1s } .au3 { animation-delay: .15s } .au4 { animation-delay: .2s }

        /* ── Glass card PRO ── */
        .glass-card { position:relative; border-radius:16px; overflow:hidden; transition:all .3s cubic-bezier(.4,0,.2,1) }
        .glass-card::before { content:''; position:absolute; inset:0; border-radius:16px; padding:1px; background:linear-gradient(135deg,#10B981,transparent 60%); -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; opacity:.3; transition:opacity .3s }
        .glass-card:hover::before { opacity:.8 }
        .glass-card:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(16,185,129,.1) }
        .glass-card.expanded { box-shadow:0 12px 48px rgba(16,185,129,.12) }
        .glass-card.expanded::before { opacity:1 }
        .glass-expand { animation:slideDown .35s ease both; overflow:hidden }

        /* ── Glow dot ── */
        .glow-dot { width:8px; height:8px; border-radius:50%; display:inline-block; animation: pulse 2s ease-in-out infinite }
        .glow-dot.green { background:#10B981; box-shadow:0 0 8px rgba(16,185,129,.6) }
        .glow-dot.yellow { background:#F59E0B; box-shadow:0 0 8px rgba(245,158,11,.6) }
        .glow-dot.red { background:#EF4444; box-shadow:0 0 8px rgba(239,68,68,.6) }
        .glow-dot.blue { background:#3B82F6; box-shadow:0 0 8px rgba(59,130,246,.6) }
        .glow-dot.purple { background:#8B5CF6; box-shadow:0 0 8px rgba(139,92,246,.6) }

        /* ── Landing card PRO ── */
        .land-card { position:relative; border-radius:16px; overflow:hidden; transition:all .3s cubic-bezier(.4,0,.2,1); background:#0F172A }
        .land-card::before { content:''; position:absolute; inset:0; border-radius:16px; padding:1px; background:linear-gradient(135deg,#10B981,transparent 60%); -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; opacity:0; transition:opacity .3s }
        .land-card:hover::before { opacity:.7 }
        .land-card:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(16,185,129,.08) }

        /* ── Action buttons ── */
        .land-btn { padding:7px 16px; border-radius:10px; border:1px solid #1E293B; background:rgba(15,23,42,.8); backdrop-filter:blur(8px); color:#94A3B8; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:5px }
        .land-btn:hover { border-color:#10B981; color:#6EE7B7; transform:translateY(-1px) }
        .land-btn.green { border-color:rgba(16,185,129,.4); color:#10B981 }
        .land-btn.green:hover { border-color:#10B981; background:rgba(16,185,129,.08); box-shadow:0 0 16px rgba(16,185,129,.15) }
        .land-btn.blue { border-color:rgba(59,130,246,.4); color:#60A5FA }
        .land-btn.blue:hover { border-color:#3B82F6; background:rgba(59,130,246,.08); box-shadow:0 0 16px rgba(59,130,246,.15) }
        .land-btn.cta { padding:9px 22px; border:none; background:linear-gradient(135deg,#10B981,#059669); color:#fff; font-weight:700; box-shadow:0 4px 16px rgba(16,185,129,.25) }
        .land-btn.cta:hover { box-shadow:0 8px 28px rgba(16,185,129,.35); transform:translateY(-2px) }

        /* ── Activity row ── */
        .activity-row { transition:all .2s; border-radius:10px; margin:0 -8px; padding:12px 8px }
        .activity-row:hover { background:rgba(16,185,129,.04) }

        /* ── System card ── */
        .sys-card { position:relative; overflow:hidden; border-radius:14px; padding:18px; text-align:center; background:rgba(15,23,42,.6); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.06); transition:all .3s }
        .sys-card:hover { border-color:rgba(16,185,129,.2); transform:translateY(-1px) }

        /* ── Nav button ── */
        .nav-btn { border:none; text-align:left; padding:11px 14px; border-radius:12px; cursor:pointer; font-size:13px; display:flex; gap:10px; align-items:center; transition:all .2s; position:relative; overflow:hidden }
        .nav-btn:hover { background:rgba(16,185,129,.06) }
      ` }} />

      {/* TOAST */}
      {toast && <div className="au" style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "14px 22px", borderRadius: 12, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: toast.type === "err" ? "rgba(239,68,68,.12)" : "rgba(16,185,129,.12)", color: toast.type === "err" ? "#FCA5A5" : "#6EE7B7", border: `1px solid ${toast.type === "err" ? "rgba(239,68,68,.25)" : "rgba(16,185,129,.25)"}`, backdropFilter: "blur(16px)", boxShadow: toast.type === "err" ? "0 8px 32px rgba(239,68,68,.1)" : "0 8px 32px rgba(16,185,129,.1)" }}><span style={{ fontSize: 16 }}>{toast.type === "err" ? "\u2715" : "\u2713"}</span>{toast.msg}</div>}

      {/* PREVIEW MODAL */}
      {previewId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(12px)" }} onClick={() => setPreviewId(null)}>
          <div className="au" style={{ background: "linear-gradient(135deg,#0F172A,#111827)", borderRadius: 24, padding: 24, width: "90vw", maxWidth: 440, maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid rgba(16,185,129,.15)", boxShadow: "0 25px 60px rgba(0,0,0,.6), 0 0 40px rgba(16,185,129,.05)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="glow-dot green" />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#E2E8F0", letterSpacing: "-.01em" }}>Preview Mobile</span>
              </div>
              <button onClick={() => setPreviewId(null)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "#64748B", cursor: "pointer", width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all .2s" }}>\u2715</button>
            </div>
            <div style={{ background: "#000", borderRadius: 16, padding: 4, flex: 1, boxShadow: "inset 0 2px 8px rgba(0,0,0,.3)" }}>
              <iframe src={`/api/landing?action=preview&id=${previewId}`} style={{ width: "100%", height: "65vh", border: "none", borderRadius: 14, background: "#fff" }} title="Preview" />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* ═══ SIDEBAR ═══ */}
        <div style={{ width: 250, background: "linear-gradient(180deg,#0B1120,#0F172A)", borderRight: "1px solid rgba(255,255,255,.06)", padding: "24px 14px", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          {/* Ambient orb */}
          <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,.06), transparent 70%)", pointerEvents: "none", animation: "orbFloat 15s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,.04), transparent 70%)", pointerEvents: "none", animation: "orbFloat 20s ease-in-out infinite reverse" }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 8px", marginBottom: 36, position: "relative" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#10B981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, boxShadow: "0 4px 20px rgba(16,185,129,.35), 0 0 40px rgba(16,185,129,.1)", animation: "float 4s ease-in-out infinite" }}>L</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#F8FAFC", letterSpacing: "-.03em" }}>Landing Agent</div>
              <div style={{ fontSize: 10, color: "#10B981", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>PRO v3</div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
            {[
              { id: "create", label: "Crear Landing", emoji: "\u2726" },
              { id: "panel", label: "Panel", emoji: "\u25C6" },
              { id: "landings", label: "Mis Landings", emoji: "\u25C7" },
              { id: "spy", label: "Spy Competencia", emoji: "\u25C9" },
              { id: "config", label: "Configuracion", emoji: "\u25CB" },
            ].map(n => (
              <button key={n.id} onClick={() => setTab(n.id)} className="nav-btn" style={{
                background: tab === n.id ? "rgba(16,185,129,.08)" : "transparent",
                color: tab === n.id ? "#10B981" : "#64748B", fontWeight: tab === n.id ? 700 : 500,
                borderLeft: tab === n.id ? "3px solid #10B981" : "3px solid transparent",
                boxShadow: tab === n.id ? "inset 0 0 20px rgba(16,185,129,.04)" : "none",
              }}>
                <span style={{ fontSize: 11, opacity: tab === n.id ? 1 : .4, transition: "opacity .2s" }}>{n.emoji}</span>{n.label}
              </button>
            ))}
          </div>

          {/* Stats mini — glassmorphism */}
          {stats && (
            <div style={{ marginTop: 28, padding: 18, background: "rgba(16,185,129,.03)", backdropFilter: "blur(12px)", borderRadius: 14, border: "1px solid rgba(16,185,129,.1)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,.08), transparent 70%)", pointerEvents: "none" }} />
              <div style={{ fontSize: 10, color: "#10B981", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 14, fontWeight: 700, opacity: .7 }}>Resumen</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Total", stats.total || 0, "#3B82F6"], ["Activas", stats.published || 0, "#10B981"], ["Borrador", stats.drafts || 0, "#F59E0B"], ["Hoy", stats.last24h || 0, "#8B5CF6"]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center", padding: "8px 4px", background: "rgba(255,255,255,.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,.04)" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: c, lineHeight: 1, textShadow: `0 0 20px ${c}33` }}>{v}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 5, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "auto", padding: "18px 8px", borderTop: "1px solid rgba(255,255,255,.04)", fontSize: 10, color: "#334155", lineHeight: 1.8, position: "relative" }}>
            <span style={{ color: "#10B981", fontWeight: 600 }}>Gemini AI</span> + Shopify<br />Master Escala + Releasit COD<br />Dropi Multi-pais
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto", position: "relative" }}>
          {/* Ambient background orbs */}
          <div style={{ position: "fixed", top: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,.03), transparent 70%)", pointerEvents: "none", animation: "orbFloat 25s ease-in-out infinite" }} />
          <div style={{ position: "fixed", bottom: "10%", left: "40%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,.02), transparent 70%)", pointerEvents: "none", animation: "orbFloat 30s ease-in-out infinite reverse" }} />

          <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>

            {/* ═══ TAB: CREAR ═══ */}
            {tab === "create" && (
              <>
                {step === "idle" && (
                  <div className="au">
                    <h1 style={{ fontSize: 34, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.04em", lineHeight: 1.1 }}>Crear Landing Page</h1>
                    <p style={{ color: "#475569", fontSize: 15, marginTop: 8, marginBottom: 32, letterSpacing: "-.01em" }}>Pega una URL o sube imagenes. La IA genera todo el copy de venta.</p>

                    {/* Mode tabs */}
                    <div style={{ display: "inline-flex", gap: 2, marginBottom: 22, background: "rgba(15,23,42,.8)", borderRadius: 12, padding: 4, border: "1px solid rgba(255,255,255,.06)", backdropFilter: "blur(8px)" }}>
                      {[["url", "URL"], ["image", "Manual"], ["bulk", "Masivo"]].map(([m, l]) => (
                        <button key={m} onClick={() => setMode(m)} style={{
                          padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13,
                          fontWeight: mode === m ? 700 : 500,
                          background: mode === m ? "linear-gradient(135deg,#10B981,#059669)" : "transparent",
                          color: mode === m ? "#fff" : "#64748B", transition: "all .2s",
                          boxShadow: mode === m ? "0 2px 12px rgba(16,185,129,.25)" : "none",
                        }}>{l}</button>
                      ))}
                    </div>

                    {/* URL mode */}
                    {mode === "url" && (
                      <div className="au au1 glass-card" style={{ background: "#0F172A", padding: "24px 26px", marginBottom: 14 }}>
                        {/* Gradient top bar */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10B981, #059669, transparent 80%)" }} />
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                          <input style={{ ...S.input, flex: 1, fontSize: 15 }} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://app.dropi.cr/... o cualquier URL de producto" onKeyDown={e => e.key === "Enter" && createFromUrl()} />
                          <button className="land-btn cta" onClick={createFromUrl}>Crear</button>
                        </div>
                        <div style={{ fontSize: 12, color: "#334155" }}>Soporta: Dropi, AliExpress, Amazon, Shopify, MercadoLibre, Facebook Ads Library</div>

                        {/* Imagenes */}
                        <div style={{ marginTop: 16, padding: 16, background: "rgba(16,185,129,.03)", borderRadius: 12, border: "1px dashed rgba(16,185,129,.15)" }}>
                          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Imagenes del producto <span style={{ color: "#475569", fontWeight: 400 }}>(pega URLs para mejor resultado)</span></div>
                          <textarea style={{ ...S.input, height: 56, fontSize: 12, fontFamily: "monospace", resize: "vertical" }} value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://imagen1.jpg&#10;https://imagen2.jpg" />
                          {imgs.length > 0 && (
                            <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                              {imgs.slice(0, 8).map((u, i) => <img key={i} src={u} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 10, border: "2px solid #1E293B", flexShrink: 0, transition: "transform .2s" }} onError={e => { e.target.style.opacity = 0.15; }} />)}
                              <span style={{ fontSize: 11, color: "#10B981", alignSelf: "center", fontWeight: 700, whiteSpace: "nowrap" }}>{imgs.length} imgs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image mode */}
                    {mode === "image" && (
                      <div className="au au1 glass-card" style={{ background: "#0F172A", padding: "24px 26px", marginBottom: 14 }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #F59E0B, #EAB308, transparent 80%)" }} />
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
                            {imgs.slice(0, 8).map((u, i) => <img key={i} src={u} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 10, border: "2px solid #1E293B" }} onError={e => { e.target.style.opacity = 0.15; }} />)}
                          </div>
                        )}
                        <button className="land-btn cta" style={{ width: "100%", padding: "13px", justifyContent: "center" }} onClick={createFromImage}>Crear Landing</button>
                      </div>
                    )}

                    {/* Bulk mode */}
                    {mode === "bulk" && (
                      <div className="au au1 glass-card" style={{ background: "#0F172A", padding: "24px 26px", marginBottom: 14 }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #8B5CF6, #7C3AED, transparent 80%)" }} />
                        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 6 }}>URLs (una por linea, max 10)</div>
                        <textarea style={{ ...S.input, height: 130, fontFamily: "monospace", fontSize: 12, resize: "vertical" }} value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} placeholder={"https://app.dropi.cr/...\nhttps://aliexpress.com/..."} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <span style={{ fontSize: 12, color: "#475569" }}>{bulkUrls.split("\n").filter(u => u.trim().startsWith("http")).length} URLs detectadas</span>
                          <button className="land-btn cta" onClick={createBulk}>Crear todas</button>
                        </div>
                      </div>
                    )}

                    {/* Country + config */}
                    <div className="au au2" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                      <select style={S.select} value={country} onChange={e => setCountry(e.target.value)}>{C.map(c => <option key={c.c} value={c.c}>{c.f} {c.n} ({c.cur})</option>)}</select>
                      <button onClick={() => setShowCfg(!showCfg)} style={{ fontSize: 12, color: "#475569", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "8px 16px", cursor: "pointer", transition: "all .2s", backdropFilter: "blur(8px)" }}>{showCfg ? "Ocultar" : "Opciones avanzadas"}</button>
                      {disc > 0 && <span style={{ fontSize: 11, background: "rgba(239,68,68,.12)", color: "#FCA5A5", padding: "5px 12px", borderRadius: 8, fontWeight: 700, border: "1px solid rgba(239,68,68,.15)" }}>-{disc}%</span>}
                    </div>
                    {showCfg && (
                      <div className="au glass-card" style={{ background: "#0F172A", padding: "22px 24px", marginTop: 10, marginBottom: 14 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div><div style={S.ml}>Precio {sel.cur}</div><input style={S.mi} value={cfg.price} onChange={e => setCfg({ ...cfg, price: e.target.value })} placeholder="Auto" /></div>
                          <div><div style={S.ml}>Tachado</div><input style={S.mi} value={cfg.compare} onChange={e => setCfg({ ...cfg, compare: e.target.value })} placeholder="Auto (x2)" /></div>
                          <div><div style={S.ml}>WhatsApp</div><input style={S.mi} value={cfg.wa} onChange={e => setCfg({ ...cfg, wa: e.target.value })} placeholder="+506..." /></div>
                          <div><div style={S.ml}>FB Pixel</div><input style={S.mi} value={cfg.fb} onChange={e => setCfg({ ...cfg, fb: e.target.value })} placeholder="ID..." /></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LOADING STATE — con progreso real */}
                {step === "working" && (
                  <div className="au glass-card" style={{ background: "#0F172A", textAlign: "center", padding: "52px 32px", position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10B981, #059669, transparent 80%)" }} />
                    {/* Ambient orb */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,.06), transparent 70%)", pointerEvents: "none" }} />
                    <div style={{ width: 60, height: 60, border: "3px solid #1E293B", borderTop: "3px solid #10B981", borderRadius: "50%", margin: "0 auto 24px", animation: "spin .8s linear infinite", boxShadow: "0 0 20px rgba(16,185,129,.15)" }} />
                    <p style={{ fontWeight: 800, fontSize: 20, color: "#F8FAFC", marginBottom: 6, letterSpacing: "-.02em", position: "relative" }}>{currentStep.label}</p>
                    <p style={{ color: "#475569", fontSize: 13, marginBottom: 24, position: "relative" }}>{currentStep.sub}</p>
                    {/* Progress bar */}
                    <div style={{ width: "100%", maxWidth: 340, height: 5, background: "rgba(255,255,255,.06)", borderRadius: 3, margin: "0 auto", overflow: "hidden", position: "relative" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#10B981,#059669)", borderRadius: 3, transition: "width 1s ease", boxShadow: "0 0 12px rgba(16,185,129,.3)" }} />
                    </div>
                    <p style={{ color: "#334155", fontSize: 12, marginTop: 12, position: "relative" }}>{elapsed}s</p>
                  </div>
                )}

                {/* SUCCESS STATE */}
                {step === "done" && result && !bulkResults && (
                  <div className="au glass-card" style={{ background: "#0F172A", padding: "26px 28px", border: "1px solid rgba(16,185,129,.2)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10B981, #059669)" }} />
                    {/* Success orb */}
                    <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,.08), transparent 70%)", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, position: "relative" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,rgba(16,185,129,.15),rgba(5,150,105,.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "1px solid rgba(16,185,129,.2)", boxShadow: "0 0 24px rgba(16,185,129,.1)" }}>\u2713</div>
                      <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.02em" }}>Landing creada</h2>
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                          <span style={S.tag}>{result.imagesFound || 0} imgs</span>
                          <span style={S.tag}>{sel.f} {sel.n}</span>
                          <span style={S.tag}>{Math.round((result.duration || 0) / 1000)}s</span>
                        </div>
                      </div>
                    </div>

                    {result.landing?.headline && (
                      <div style={{ background: "rgba(16,185,129,.04)", borderRadius: 12, padding: 18, marginBottom: 18, borderLeft: "3px solid #10B981", position: "relative" }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#F8FAFC", lineHeight: 1.4, letterSpacing: "-.01em" }}>{result.landing.headline}</div>
                        {result.landing.subheadline && <div style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>{result.landing.subheadline}</div>}
                      </div>
                    )}

                    {analyzed?.images?.length > 0 && (
                      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
                        {analyzed.images.slice(0, 6).map((img, i) => <img key={i} src={img} alt="" style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 12, border: "2px solid #1E293B", flexShrink: 0, transition: "transform .2s" }} onError={e => { e.target.style.display = "none"; }} />)}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {result.shopifyUrl && <a href={result.shopifyUrl} target="_blank" rel="noreferrer" className="land-btn cta" style={{ textDecoration: "none" }}>Ver en tienda</a>}
                      {result.shopifyId && <a href={`https://admin.shopify.com/store/${store}/products/${result.shopifyId}`} target="_blank" rel="noreferrer" className="land-btn blue" style={{ textDecoration: "none" }}>Shopify Admin</a>}
                      <button onClick={reset} className="land-btn">Crear otra</button>
                    </div>
                  </div>
                )}

                {/* BULK RESULTS */}
                {bulkResults && step === "done" && (
                  <div className="au glass-card" style={{ background: "#0F172A", padding: "26px 28px", border: "1px solid rgba(16,185,129,.2)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10B981, #059669)" }} />
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", marginBottom: 18, letterSpacing: "-.02em", position: "relative" }}>{bulkResults.created}/{bulkResults.total} landings creadas</h2>
                    {bulkResults.results?.map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)", fontSize: 13 }}>
                        <span style={{ color: r.ok ? "#6EE7B7" : "#FCA5A5", display: "flex", alignItems: "center", gap: 8 }}><span className={`glow-dot ${r.ok ? "green" : "red"}`} style={{ width: 6, height: 6 }} />{r.title || r.url?.slice(0, 40)}</span>
                        {r.shopifyId && <a href={`https://admin.shopify.com/store/${store}/products/${r.shopifyId}`} target="_blank" rel="noreferrer" style={{ color: "#3B82F6", fontSize: 12 }}>Admin</a>}
                      </div>
                    ))}
                    <button className="land-btn cta" onClick={reset} style={{ width: "100%", marginTop: 16, justifyContent: "center" }}>Crear mas</button>
                  </div>
                )}
              </>
            )}

            {/* ═══ TAB: PANEL ═══ */}
            {tab === "panel" && (
              <>
                <div className="au" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                  <div>
                    <h1 style={{ fontSize: 30, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.04em" }}>Panel de Control</h1>
                    <p style={{ fontSize: 14, color: "#475569", marginTop: 6, letterSpacing: "-.01em" }}>Metricas y estado del sistema</p>
                  </div>
                  <button className="land-btn cta" style={{ fontSize: 13, opacity: autoCreating ? 0.5 : 1 }} onClick={autoCreate} disabled={autoCreating}>{autoCreating ? "Creando..." : "Auto-crear desde Score 8+"}</button>
                </div>

                {/* KPIs principales — glassmorphism */}
                <div className="au au1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                  {[
                    ["Total Landings", stats?.total || 0, "#3B82F6", "Todas las creadas", "\u{1F4CA}"],
                    ["Publicadas", stats?.published || 0, "#10B981", "Activas en Shopify", "\u{1F680}"],
                    ["Borradores", stats?.drafts || 0, "#F59E0B", "Pendientes de publicar", "\u{1F4DD}"],
                    ["Hoy", stats?.last24h || 0, "#8B5CF6", "Ultimas 24 horas", "\u26A1"],
                  ].map(([l, v, c, sub, icon]) => (
                    <div key={l} className="glass-card" style={{ background: "#0F172A", textAlign: "center", padding: "22px 18px", position: "relative" }}>
                      {/* Gradient top bar */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c}, ${c}66, transparent 80%)` }} />
                      {/* Ambient orb */}
                      <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${c}0A, transparent 70%)`, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", top: 12, right: 14, fontSize: 20, opacity: 0.1 }}>{icon}</div>
                      <div style={{ fontSize: 40, fontWeight: 900, color: c, lineHeight: 1, position: "relative", textShadow: `0 0 30px ${c}22`, letterSpacing: "-.03em" }}>{v}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, fontWeight: 700, position: "relative", letterSpacing: "-.01em" }}>{l}</div>
                      <div style={{ fontSize: 10, color: "#475569", marginTop: 3, position: "relative" }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Tasa de conversion estimada + Ratio publicacion */}
                <div className="au au2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
                  <div className="glass-card" style={{ background: "#0F172A", padding: "22px 24px" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10B981, #059669, transparent 80%)" }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#F8FAFC", marginBottom: 16, letterSpacing: "-.01em", position: "relative" }}>Ratio de Publicacion</div>
                    {(() => {
                      const total = stats?.total || 0;
                      const pub = stats?.published || 0;
                      const pct = total > 0 ? Math.round((pub / total) * 100) : 0;
                      return (
                        <div style={{ position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                            <span style={{ fontSize: 48, fontWeight: 900, color: pct >= 50 ? "#10B981" : "#F59E0B", lineHeight: 1, letterSpacing: "-.04em", textShadow: pct >= 50 ? "0 0 30px rgba(16,185,129,.15)" : "0 0 30px rgba(245,158,11,.15)" }}>{pct}%</span>
                            <span style={{ fontSize: 13, color: "#475569" }}>publicadas</span>
                          </div>
                          <div style={{ height: 8, background: "rgba(255,255,255,.04)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 50 ? "linear-gradient(90deg,#10B981,#059669)" : "linear-gradient(90deg,#F59E0B,#EAB308)", borderRadius: 4, transition: "width 1s", boxShadow: pct >= 50 ? "0 0 12px rgba(16,185,129,.25)" : "0 0 12px rgba(245,158,11,.25)" }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#475569" }}>
                            <span>{pub} publicadas</span>
                            <span>{total - pub} pendientes</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="glass-card" style={{ background: "#0F172A", padding: "22px 24px" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #8B5CF6, #7C3AED, transparent 80%)" }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#F8FAFC", marginBottom: 16, letterSpacing: "-.01em", position: "relative" }}>Paises Cubiertos</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, position: "relative" }}>
                      {(() => {
                        const countries = {};
                        (stats?.recent || []).forEach(l => {
                          try {
                            const d = JSON.parse(l.landing_data || "{}");
                            if (d.country_code) {
                              const c = C.find(x => x.c === d.country_code);
                              if (c) countries[c.c] = (countries[c.c] || 0) + 1;
                            }
                          } catch {}
                        });
                        const entries = Object.entries(countries);
                        if (entries.length === 0) return <span style={{ color: "#475569", fontSize: 13 }}>Sin datos de paises aun</span>;
                        return entries.sort((a, b) => b[1] - a[1]).map(([code, count]) => {
                          const c = C.find(x => x.c === code);
                          return (
                            <div key={code} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: "10px 14px", textAlign: "center", backdropFilter: "blur(8px)", transition: "all .2s" }}>
                              <div style={{ fontSize: 22 }}>{c?.f}</div>
                              <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 800, marginTop: 2 }}>{count}</div>
                              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600 }}>{c?.n}</div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Estado del sistema — glassmorphism cards with pulse */}
                <div className="au au3 glass-card" style={{ background: "#0F172A", padding: "22px 24px", marginBottom: 22 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10B981, #3B82F6, transparent 80%)" }} />
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#F8FAFC", marginBottom: 18, letterSpacing: "-.01em", position: "relative" }}>Estado del Sistema</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, position: "relative" }}>
                    {[
                      ["Gemini AI", "Activo", true, "Generacion de copy"],
                      ["Shopify", shopifyOk?.ok ? "Conectado" : "Verificando...", shopifyOk?.ok, "Publicacion automatica"],
                      ["Webhook", "Score >= 9", true, "Auto-crear landings"],
                      ["HTML", "v3 PRO", true, "Galeria + animaciones"],
                    ].map(([name, status, ok, desc]) => (
                      <div key={name} className="sys-card">
                        {/* Ambient glow per card */}
                        <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 60, height: 60, borderRadius: "50%", background: ok ? "radial-gradient(circle, rgba(16,185,129,.08), transparent 70%)" : "radial-gradient(circle, rgba(245,158,11,.08), transparent 70%)", pointerEvents: "none" }} />
                        <span className={`glow-dot ${ok ? "green" : "yellow"}`} style={{ margin: "0 auto 10px", display: "block" }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", position: "relative" }}>{name}</div>
                        <div style={{ fontSize: 11, color: ok ? "#10B981" : "#F59E0B", fontWeight: 700, marginTop: 3, position: "relative" }}>{status}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 5, position: "relative" }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actividad reciente — with hover effects */}
                <div className="au au4 glass-card" style={{ background: "#0F172A", padding: "22px 24px" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #059669, #10B981, transparent 80%)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, position: "relative" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#F8FAFC", letterSpacing: "-.01em" }}>Actividad Reciente</div>
                    <span style={{ fontSize: 11, color: "#10B981", background: "rgba(16,185,129,.08)", padding: "4px 12px", borderRadius: 8, fontWeight: 700, border: "1px solid rgba(16,185,129,.12)" }}>{(stats?.recent || []).length} registros</span>
                  </div>
                  {(stats?.recent || []).slice(0, 8).map((l, idx) => {
                    const d = pl(l);
                    const countryInfo = d.country_code ? C.find(c => c.c === d.country_code) : null;
                    return (
                      <div key={l.id} className="activity-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: idx < 7 ? "1px solid rgba(255,255,255,.03)" : "none", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          {/* Icon circle with gradient background */}
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: l.status === "publicado" ? "linear-gradient(135deg,rgba(16,185,129,.12),rgba(5,150,105,.06))" : "linear-gradient(135deg,rgba(245,158,11,.12),rgba(234,179,8,.06))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: l.status === "publicado" ? "1px solid rgba(16,185,129,.12)" : "1px solid rgba(245,158,11,.12)" }}>
                            {countryInfo?.f || "\u{1F4E6}"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#E2E8F0", letterSpacing: "-.01em" }}>{l.product_name}</div>
                            <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>
                              {new Date(l.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              {d.formatted_price ? ` \u00B7 ${d.formatted_price}` : ""}
                              {countryInfo ? ` \u00B7 ${countryInfo.n}` : ""}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button onClick={() => setPreviewId(l.id)} className="land-btn">Preview</button>
                          {l.shopify_url && <a href={l.shopify_url} target="_blank" rel="noreferrer" className="land-btn blue" style={{ textDecoration: "none" }}>Tienda</a>}
                          <span style={{ fontSize: 10, padding: "5px 12px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, background: l.status === "publicado" ? "rgba(16,185,129,.1)" : "rgba(245,158,11,.1)", color: l.status === "publicado" ? "#6EE7B7" : "#FCD34D", border: l.status === "publicado" ? "1px solid rgba(16,185,129,.15)" : "1px solid rgba(245,158,11,.15)" }}>
                            <span className={`glow-dot ${l.status === "publicado" ? "green" : "yellow"}`} style={{ width: 6, height: 6 }} />
                            {l.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {(!stats?.recent || stats.recent.length === 0) && (
                    <div style={{ textAlign: "center", padding: 48, position: "relative" }}>
                      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>\u{1F4CA}</div>
                      <p style={{ color: "#475569", fontSize: 14, fontWeight: 600 }}>Sin landings aun</p>
                      <p style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>Crea tu primera landing para ver estadisticas.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ═══ TAB: LANDINGS ═══ */}
            {tab === "landings" && (
              <>
                <div className="au" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <h1 style={{ fontSize: 30, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.04em" }}>Mis Landings</h1>
                  <span style={{ fontSize: 12, color: "#10B981", background: "rgba(16,185,129,.08)", padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(16,185,129,.12)", fontWeight: 700 }}>{landingTotal} total</span>
                </div>
                {landings.map((l, idx) => {
                  const d = pl(l);
                  const expanded = selectedLanding === l.id;
                  const countryInfo = d.country_code ? C.find(c => c.c === d.country_code) : null;
                  return (
                    <div key={l.id} className={`land-card au au${Math.min(idx + 1, 4)}${expanded ? " expanded" : ""}`} style={{ marginBottom: 16, "--accent": "#10B981" }}>
                      {/* Gradient accent bar */}
                      <div style={{ height: 3, background: l.status === "publicado" ? "linear-gradient(90deg, #10B981, #059669, transparent 80%)" : "linear-gradient(90deg, #F59E0B, #EAB308, transparent 80%)" }} />

                      <div style={{ padding: "20px 24px 16px", position: "relative" }}>
                        {/* Background glow orb */}
                        <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: l.status === "publicado" ? "radial-gradient(circle, rgba(16,185,129,.06), transparent 70%)" : "radial-gradient(circle, rgba(245,158,11,.06), transparent 70%)", pointerEvents: "none" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                          <div style={{ flex: 1, display: "flex", gap: 14, alignItems: "flex-start" }}>
                            {/* Icon circle */}
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,rgba(16,185,129,.1),rgba(5,150,105,.05))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: "1px solid rgba(16,185,129,.1)" }}>
                              {countryInfo?.f || "\u{1F4E6}"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 16, color: "#E2E8F0", letterSpacing: "-.01em" }}>{l.product_name}</div>
                              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{new Date(l.created_at).toLocaleString("es-CO")} \u00B7 {d.product_type || ""} {d.formatted_price || ""}</div>
                              {d.headline && <div style={{ fontSize: 13, marginTop: 8, color: "#64748B", fontStyle: "italic", lineHeight: 1.5 }}>{d.headline}</div>}
                            </div>
                          </div>
                          {/* Status badge with glow dot */}
                          <span style={{ fontSize: 10, padding: "5px 12px", borderRadius: 20, fontWeight: 700, height: "fit-content", display: "inline-flex", alignItems: "center", gap: 6, background: l.status === "publicado" ? "rgba(16,185,129,.1)" : "rgba(245,158,11,.1)", color: l.status === "publicado" ? "#6EE7B7" : "#FCD34D", border: l.status === "publicado" ? "1px solid rgba(16,185,129,.15)" : "1px solid rgba(245,158,11,.15)" }}>
                            <span className={`glow-dot ${l.status === "publicado" ? "green" : "yellow"}`} style={{ width: 6, height: 6 }} />
                            {l.status}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", position: "relative" }}>
                          <button onClick={() => setPreviewId(l.id)} className="land-btn">\u{1F441} Preview</button>
                          {l.shopify_url && <a href={l.shopify_url} target="_blank" rel="noreferrer" className="land-btn blue" style={{ textDecoration: "none" }}>\u{1F6CD} Tienda</a>}
                          {l.shopify_product_id && <a href={`https://admin.shopify.com/store/${store}/products/${l.shopify_product_id}`} target="_blank" rel="noreferrer" className="land-btn" style={{ textDecoration: "none" }}>\u2699 Admin</a>}
                          <button onClick={() => setSelectedLanding(expanded ? null : l.id)} className="land-btn">{expanded ? "\u2715 Cerrar" : "\u25BC Detalle"}</button>
                          <button onClick={() => { setImproveId(l.id); setImproveFeedback(""); }} className="land-btn green">\u2728 Mejorar</button>
                        </div>
                      </div>

                      {expanded && (
                        <div className="glass-expand" style={{ padding: "0 24px 20px" }}>
                          <div style={{ padding: 18, background: "rgba(15,23,42,.6)", backdropFilter: "blur(12px)", borderRadius: 14, border: "1px solid rgba(255,255,255,.06)" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                              <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, alignSelf: "center", marginRight: 4 }}>Duplicar:</span>
                              {C.slice(0, 8).map(c => <button key={c.c} onClick={() => duplicateLanding(l.id, c.c)} className="land-btn" style={{ fontSize: 11, padding: "4px 10px" }}>{c.f}</button>)}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                              <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, alignSelf: "center", marginRight: 4 }}>Copiar:</span>
                              {d.ad_copies?.facebook?.[0] && <button onClick={() => cp(typeof d.ad_copies.facebook[0] === "object" ? d.ad_copies.facebook[0].primary_text : d.ad_copies.facebook[0], "FB Ad")} className="land-btn" style={{ fontSize: 11 }}>FB Ad</button>}
                              {(d.tiktok_scripts?.[0] || d.ad_copies?.tiktok_scripts?.[0]) && <button onClick={() => { const tk = d.tiktok_scripts?.[0] || d.ad_copies?.tiktok_scripts?.[0]; cp(typeof tk === "object" ? tk.full_script : tk, "TikTok"); }} className="land-btn" style={{ fontSize: 11 }}>TikTok</button>}
                              {d.email_marketing?.body && <button onClick={() => cp(`Asunto: ${d.email_marketing.subject}\n\n${d.email_marketing.body}`, "Email")} className="land-btn" style={{ fontSize: 11 }}>Email</button>}
                              {d.bullet_points?.length > 0 && <button onClick={() => cp(d.bullet_points.join("\n"), "Beneficios")} className="land-btn" style={{ fontSize: 11 }}>Beneficios</button>}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                              <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, alignSelf: "center", marginRight: 4 }}>Regenerar:</span>
                              {sects.map(sec => <button key={sec.key} disabled={regenerating === `${l.id}-${sec.key}`} onClick={() => handleRegenerate(l.id, sec.key)} className="land-btn" style={{ fontSize: 11, opacity: regenerating === `${l.id}-${sec.key}` ? 0.3 : 1 }}>{sec.label}</button>)}
                            </div>
                            {d.problem_solution && <div style={{ background: "rgba(255,255,255,.02)", padding: 14, borderRadius: 10, marginBottom: 10, fontSize: 12, lineHeight: 1.7, border: "1px solid rgba(255,255,255,.04)" }}><span style={{ color: "#EF4444", fontWeight: 700 }}>Problema:</span> {d.problem_solution.problem}<br /><span style={{ color: "#10B981", fontWeight: 700 }}>Solucion:</span> {d.problem_solution.solution}</div>}
                            {d.bullet_points?.map((b, i) => <div key={i} style={{ fontSize: 12, padding: "4px 0", color: "#64748B" }}>{b}</div>)}
                            {d.testimonials?.length > 0 && <div style={{ marginTop: 10 }}>{d.testimonials.map((t, i) => <div key={i} style={{ background: "rgba(255,255,255,.02)", padding: 12, borderRadius: 10, marginBottom: 6, fontSize: 12, border: "1px solid rgba(255,255,255,.04)" }}><strong style={{ color: "#E2E8F0" }}>{t.name}{t.city ? ` \u2014 ${t.city}` : ""}</strong><span style={{ color: "#F59E0B", marginLeft: 8 }}>{"\u2605".repeat(t.rating || 5)}</span><br /><span style={{ color: "#475569", marginTop: 4, display: "inline-block" }}>{t.text}</span></div>)}</div>}
                          </div>
                        </div>
                      )}

                      {improveId === l.id && (
                        <div style={{ padding: "0 24px 20px" }}>
                          <div style={{ padding: 16, background: "rgba(16,185,129,.03)", borderRadius: 14, border: "1px solid rgba(16,185,129,.15)", backdropFilter: "blur(8px)" }}>
                            <textarea style={{ ...S.input, height: 60, fontSize: 12 }} value={improveFeedback} onChange={e => setImproveFeedback(e.target.value)} placeholder="Que quieres mejorar? Ej: mas urgente, tono juvenil..." />
                            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                              <button className="land-btn cta" style={{ fontSize: 12, opacity: improving ? 0.5 : 1 }} onClick={submitImprove} disabled={improving}>{improving ? "..." : "Aplicar"}</button>
                              <button className="land-btn" onClick={() => setImproveId(null)}>Cancelar</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {landings.length === 0 && (
                  <div style={{ textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.15 }}>\u{1F3E0}</div>
                    <p style={{ color: "#475569", fontSize: 15, fontWeight: 600 }}>Sin landings</p>
                    <p style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>Crea tu primera landing para verla aqui.</p>
                  </div>
                )}
              </>
            )}

            {/* ═══ TAB: SPY COMPETENCIA ═══ */}
            {tab === "spy" && (
              <>
                <div className="au" style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: "#F8FAFC", letterSpacing: "-.03em" }}>Spy Competencia</h1>
                  <p style={{ color: "#475569", fontSize: 14, marginTop: 6 }}>Busca como otros venden el mismo producto — copies, precios, angulos, landings reales</p>
                </div>

                {/* Search bar */}
                <div className="au au1 glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <input className="input" style={{ flex: 1, fontSize: 15 }} value={spyQuery} onChange={e => setSpyQuery(e.target.value)} placeholder="Nombre del producto a espiar... Ej: soporte magnetico celular" onKeyDown={e => e.key === "Enter" && runSpy(spyQuery)} />
                    <select style={{ ...S.select, minWidth: 120 }} value={spyCountry} onChange={e => setSpyCountry(e.target.value)}>
                      <option value="ALL">Todos</option>
                      {C.slice(0, 12).map(c => <option key={c.c} value={c.c}>{c.f} {c.n}</option>)}
                    </select>
                    <button className="land-btn cta" onClick={() => runSpy(spyQuery)} disabled={spyLoading} style={{ padding: "12px 28px", opacity: spyLoading ? 0.5 : 1 }}>
                      {spyLoading ? "Buscando..." : "Espiar"}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>Busca en: Facebook Ads Library, Google, DuckDuckGo, tiendas Shopify</div>
                </div>

                {/* Quick buttons from winning products */}
                {spyProducts.length === 0 && <div style={{ display: "none" }}>{setTimeout(() => loadSpyProducts(), 0) && ""}</div>}
                {spyProducts.length > 0 && (
                  <div className="au au2" style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Productos ganadores (score 8+)</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {spyProducts.slice(0, 10).map(p => (
                        <button key={p.id} className="land-btn" onClick={() => { setSpyQuery(p.name); runSpy(p.name); }} style={{ fontSize: 12 }}>
                          🔍 {p.name.substring(0, 35)}{p.name.length > 35 ? "..." : ""} <span style={{ color: "#10B981", marginLeft: 4 }}>{p.score}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading */}
                {spyLoading && (
                  <div className="au glass-card" style={{ padding: 48, textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, border: "3px solid #1E293B", borderTop: "3px solid #10B981", borderRadius: "50%", margin: "0 auto 16px", animation: "spin .8s linear infinite" }} />
                    <p style={{ fontWeight: 700, fontSize: 16, color: "#F8FAFC" }}>Espiando competidores...</p>
                    <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Facebook Ads Library + Google + Shopify stores</p>
                  </div>
                )}

                {/* Results */}
                {spyResults && !spyLoading && (
                  <div className="au">
                    {/* Summary */}
                    <div className="glass-card" style={{ padding: 20, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{spyResults.results?.length || 0} competidores encontrados</span>
                        <span style={{ fontSize: 12, color: "#475569", marginLeft: 12 }}>para &quot;{spyResults.query}&quot;</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[
                          ["FB Ads", spyResults.sources?.facebook || 0, "#3B82F6"],
                          ["Google", spyResults.sources?.google || 0, "#10B981"],
                          ["DuckDuckGo", spyResults.sources?.duckduckgo || 0, "#F59E0B"],
                          ["Shopify", spyResults.sources?.shopify || 0, "#A855F7"],
                        ].map(([label, count, color]) => (
                          <span key={label} style={{ fontSize: 11, color, background: `${color}15`, padding: "4px 10px", borderRadius: 8, fontWeight: 600, border: `1px solid ${color}25` }}>{label}: {count}</span>
                        ))}
                      </div>
                    </div>

                    {/* Competitor cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {(spyResults.results || []).map((r, i) => {
                        const isExp = spyExpanded === i;
                        const sourceColors = { facebook_ads: "#3B82F6", google: "#10B981", duckduckgo: "#F59E0B", shopify_store: "#A855F7" };
                        const sourceLabels = { facebook_ads: "Facebook Ads", google: "Google", duckduckgo: "DuckDuckGo", shopify_store: "Shopify Store" };
                        const accent = sourceColors[r.source] || "#64748B";
                        return (
                          <div key={i} className="land-card au" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}66, transparent 80%)` }} />
                            <div style={{ padding: "18px 22px" }}>
                              <div style={{ display: "flex", gap: 16 }}>
                                {/* Image */}
                                {(r.image || r.images?.[0]) && (
                                  <img src={r.image || r.images[0]} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", border: "1px solid #1E293B", flexShrink: 0 }} onError={e => { e.target.style.display = "none"; }} />
                                )}
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: accent, background: `${accent}15`, padding: "3px 10px", borderRadius: 6, fontWeight: 700, border: `1px solid ${accent}25` }}>{sourceLabels[r.source] || r.source}</span>
                                    {r.platform && <span style={{ fontSize: 11, color: "#64748B", background: "rgba(255,255,255,.04)", padding: "3px 8px", borderRadius: 6 }}>{r.platform}</span>}
                                    {r.price && <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700 }}>${r.price}</span>}
                                  </div>
                                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || r.domain || new URL(r.url).hostname}</h3>
                                  <div style={{ fontSize: 12, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description?.substring(0, 120) || r.url}</div>
                                  {r.adText && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6, fontStyle: "italic", lineHeight: 1.5 }}>&quot;{r.adText.substring(0, 150)}{r.adText.length > 150 ? "..." : ""}&quot;</div>}
                                </div>
                              </div>

                              {/* Actions */}
                              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="land-btn blue" style={{ textDecoration: "none" }}>Visitar landing</a>
                                <button className="land-btn" onClick={() => setSpyExpanded(isExp ? null : i)}>{isExp ? "Cerrar" : "Ver detalles"}</button>
                                <button className="land-btn green" onClick={() => { setUrl(r.url); setTab("create"); setMode("url"); show("URL copiada al creador"); }}>Crear mi version</button>
                                {r.adText && <button className="land-btn" onClick={() => cp(r.adText, "Ad copy")}>Copiar ad copy</button>}
                              </div>

                              {/* Expanded details */}
                              {isExp && (
                                <div style={{ marginTop: 16, padding: 18, background: "rgba(15,23,42,.6)", borderRadius: 14, border: "1px solid #1E293B", animation: "fadeUp .3s ease" }}>
                                  {/* Copy snippets */}
                                  {r.copySnippets?.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Copy de venta encontrado</div>
                                      {r.copySnippets.map((s, j) => (
                                        <div key={j} style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.7, padding: "8px 12px", background: "rgba(16,185,129,.04)", borderRadius: 8, marginBottom: 6, borderLeft: "3px solid rgba(16,185,129,.3)", cursor: "pointer" }} onClick={() => cp(s, "Copy")}>
                                          {s}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {/* Features */}
                                  {r.features?.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Beneficios / Features</div>
                                      {r.features.slice(0, 6).map((f, j) => (
                                        <div key={j} style={{ fontSize: 12, color: "#94A3B8", padding: "4px 0" }}>• {f}</div>
                                      ))}
                                    </div>
                                  )}
                                  {/* Images */}
                                  {r.images?.length > 0 && (
                                    <div>
                                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Imagenes ({r.images.length})</div>
                                      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                                        {r.images.slice(0, 6).map((img, j) => (
                                          <img key={j} src={img} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: "1px solid #1E293B", flexShrink: 0 }} onError={e => { e.target.style.display = "none"; }} />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Full URL */}
                                  <div style={{ marginTop: 12, fontSize: 11, color: "#475569", wordBreak: "break-all" }}>
                                    URL: <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA" }}>{r.url}</a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {spyResults.results?.length === 0 && (
                      <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🔍</div>
                        <p style={{ color: "#64748B", fontSize: 14 }}>No se encontraron competidores para &quot;{spyResults.query}&quot;</p>
                        <p style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>Intenta con otro nombre o palabras clave</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ═══ TAB: CONFIG ═══ */}
            {tab === "config" && (
              <>
                <h1 className="au" style={{ fontSize: 30, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-.04em", marginBottom: 28 }}>Configuracion</h1>

                <div className="au au1 glass-card" style={{ background: "#0F172A", padding: "22px 24px", marginBottom: 16 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10B981, #059669, transparent 80%)" }} />
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#F8FAFC", marginBottom: 16, letterSpacing: "-.01em", position: "relative" }}>Shopify</div>
                  {shopifyOk === null ? <div style={{ color: "#475569", fontSize: 13, position: "relative" }}>Verificando...</div> : shopifyOk?.ok ? (
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <span className="glow-dot green" />
                        <span style={{ color: "#10B981", fontWeight: 700, fontSize: 14 }}>Conectado</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[["Tienda", shopifyOk.name], ["Dominio", shopifyOk.domain], ["Plan", shopifyOk.plan]].map(([k, v]) => (
                          <div key={k} style={{ fontSize: 12, color: "#475569", padding: "8px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,.04)" }}><span style={{ color: "#64748B", fontWeight: 600 }}>{k}:</span> <span style={{ color: "#94A3B8" }}>{v}</span></div>
                        ))}
                      </div>
                    </div>
                  ) : <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}><span className="glow-dot red" /><span style={{ color: "#FCA5A5", fontWeight: 600 }}>No conectado</span></div>}
                </div>

                <div className="au au2 glass-card" style={{ background: "#0F172A", padding: "22px 24px", marginBottom: 16 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #3B82F6, #2563EB, transparent 80%)" }} />
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#F8FAFC", marginBottom: 16, letterSpacing: "-.01em", position: "relative" }}>Stack</div>
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
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.03)", fontSize: 13, position: "relative" }}>
                      <span style={{ color: "#94A3B8", fontWeight: 700 }}>{k}</span>
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
  input: { width: "100%", padding: "12px 16px", fontSize: 14, border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, background: "rgba(255,255,255,.03)", color: "#E2E8F0", outline: "none", boxSizing: "border-box", transition: "all .2s", backdropFilter: "blur(4px)" },
  select: { border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "9px 14px", fontSize: 13, background: "#0F172A", color: "#E2E8F0", cursor: "pointer", outline: "none", transition: "all .2s" },
  link: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: "none", color: "#fff", background: "linear-gradient(135deg,#3B82F6,#2563EB)", cursor: "pointer", border: "none", transition: "all .2s", boxShadow: "0 4px 16px rgba(59,130,246,.2)" },
  ml: { fontSize: 11, color: "#475569", marginBottom: 5, fontWeight: 700, letterSpacing: ".02em" },
  mi: { width: "100%", padding: "9px 14px", fontSize: 12, border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, background: "rgba(255,255,255,.03)", color: "#E2E8F0", outline: "none", boxSizing: "border-box", transition: "all .2s" },
  tag: { fontSize: 11, padding: "4px 12px", borderRadius: 8, background: "rgba(16,185,129,.06)", color: "#10B981", fontWeight: 700, border: "1px solid rgba(16,185,129,.1)" },
};
