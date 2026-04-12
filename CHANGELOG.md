# CHANGELOG — Landing Page Agent PRO

## 2026-04-10 — Sesión de arquitectura modular + Gemini

### Archivos CREADOS:
- ARCHITECTURE.md — Documento de arquitectura y reglas
- CHANGELOG.md — Este archivo
- lib/gemini_v2.js — Fix de modelos para generación de imágenes

### Archivos MODIFICADOS (solo lo necesario):
- .env.local — Agregadas credenciales Dropi (CR, GT, CO) + Gemini API key
- lib/agent.js — Import de gemini_v2 en vez de gemini

### Archivos NO TOCADOS (funcionan en producción):
- lib/generator.js, lib/shopify.js, lib/scraper.js, lib/currency.js
- lib/images.js, lib/theme.js, lib/dropi.js
- pages/index.js, pages/api/landing.js

## 2026-04-09 — Sesión principal de desarrollo
- Creación del agente completo
- Scraper multi-plataforma
- Copy PRO con Claude AI
- Template Master Escala
- Dashboard oscuro
- Dropi multi-país
- 20 países con moneda local
- Releasit COD integrado
- Facebook Ads Library soporte
- Creación masiva de landings
- Duplicar por país
- Copiar copy al portapapeles
- Webhook entre agentes
