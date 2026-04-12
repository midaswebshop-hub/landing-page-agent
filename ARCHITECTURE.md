# ARQUITECTURA — Landing Page Agent PRO

## REGLA: Lo que funciona NO se toca. Mejoras = archivo nuevo.

## Estado de módulos

### PRODUCCIÓN (NO TOCAR)
| Archivo | Responsabilidad | Estado |
|---------|----------------|--------|
| lib/agent.js | Orquestador principal | ✅ Funciona |
| lib/generator.js | Copy PRO con Claude AI | ✅ Funciona |
| lib/shopify.js | API Shopify + HTML template | ✅ Funciona |
| lib/scraper.js | Extrae datos de URLs | ✅ Funciona |
| lib/currency.js | Monedas y países (20) | ✅ Funciona |
| lib/images.js | Sistema de imágenes | ✅ Funciona |
| lib/theme.js | Builder templates Master Escala | ✅ Funciona |
| lib/dropi.js | Conexión Dropi multi-país | ✅ Funciona |
| pages/index.js | Dashboard oscuro completo | ✅ Funciona |
| pages/api/landing.js | API principal (create, analyze, bulk, etc.) | ✅ Funciona |

### EN DESARROLLO
| Archivo | Responsabilidad | Estado |
|---------|----------------|--------|
| lib/gemini.js | Generación imágenes con IA | ⚠️ Fixing modelo |
| lib/adspy.js | Ad spy (FB, TikTok, Pinterest) | ❌ Desactivado (basura) |

## Protocolo de cambios

1. **Nuevo feature** → Crear archivo nuevo en lib/ o pages/api/
2. **Mejorar módulo existente** → Crear _v2, probar, swap
3. **Bug en módulo existente** → Solo tocar las líneas del bug
4. **Nunca** modificar más de lo necesario

## Variables de entorno (.env.local)
- ANTHROPIC_API_KEY — Claude AI para copy
- SHOPIFY_STORE_DOMAIN + ACCESS_TOKEN — Shopify API
- SUPABASE_URL + KEYS — Base de datos
- TELEGRAM_BOT_TOKEN + CHAT_ID — Notificaciones
- GEMINI_API_KEY — Generación de imágenes
- DROPI_CR/GT/CO_EMAIL + PASSWORD — Login Dropi por país
