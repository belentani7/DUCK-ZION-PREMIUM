# DUCK / BELENTANI · CANAL ZION · PAQUETE PREMIUM

> Frequência Narrativa Original · Status: OPERACIONAL
> Gema Nº 01 · Fragmento 1 — A Onda Grave
> Edición: 14-08-2026 · Autoría: Pedro Belentani

---

## CONTENIDO

| Carpeta | Qué es | Estado |
|---|---|---|
| `01-STUDIO-OS` | **Duck Studio OS** — Next.js + Prisma + 35 API + WebSocket + mini-services. Código fuente completo. | ✅ HERRAMIENTA |
| `02-ECOSYSTEM` | **Duck Ecosystem** — React + Vite + tRPC + Drizzle + duckRouters + tests | ✅ HERRAMIENTA |
| `03-TOOLKIT-GEMA-1` | **DuckStudioToolkit_A_Gema_1.html** — Afinador Cromático + Masterização + 8 páginas, autónomo (abrir en navegador) | ✅ HERRAMIENTA |
| `04-STUDIO-LOCAL` | **Duck Studio Local Win11** — base de conocimiento de productor PT-BR + prompts + clones (dexed, chowdsp-byod) | ✅ HERRAMIENTA |
| `05-HERRAMIENTAS-PREMIUM` | **Manual de Herramientas Duck Premium** (PDF 18 MB) + 2 prompts maestros + mapa manos abiertas + scripts | ✅ HERRAMIENTA |
| `06-EXPERIENCIA-INMERSIVA` | **Pack Experiencia Inmersiva** — web GSAP/Lenis + auditoría completa (manifest SHA256, provenance) | ✅ HERRAMIENTA |
| `07-GEMA-LAB` | **Gema 1 Lab** — assets del laboratorio de la gema (logo, CSS, GSAP) | ✅ HERRAMIENTA |
| `08-ENVIO-GEMA-01` | **Duck Studio OS Gema 01** — paquete de envío: ZIP, email .eml, HTML de inicio, QA (desktop/mobile/revelação) | ✅ HERRAMIENTA |
| `09-MANUALES` | Manuales PDF (v1 5 páginas + duck-studio-manual) + páginas renderizadas PNG | ✅ DOCUMENTACIÓN |
| `10-ZIPS` | ZIPs originales: duck-studio-delivery (11.9 MB), protected (6.8 MB), GEMA-01, duck-ecosystem ×3, duck.tar | ✅ ARCHIVOS |
| `11-PORTAL-CLIENTES` | **Portal de Clientes / CRM** — Next.js + Prisma + Socket.io + chat + mini-services + Android + desktop | ✅ CRM |
| `12-REFERENCIAS-VISUALES` | Imágenes: duck logo, gema esmeralda (5.9 MB), screenshot toolkit | ✅ MEDIA |
| `PROMPTS` | Prompt maestro DUCK/ZION + prompt mejorar todo + generar PDF | ✅ PROMPTS |
| `MANUAL` | Manual premium del ecosistema (PDF 6.2 MB fondo negro + HTML + media) | ✅ ENTREGA |
| `CONTENIDO` | Contenido textual del universo | 📄 PREPARACIÓN |
| `INVENTARIO` | Inventario de archivos del ecosistema | 📄 PREPARACIÓN |

---

## INSTRUCCIONES RÁPIDAS

### 1. Ver la gema (sin instalar nada)
Abrir `03-TOOLKIT-GEMA-1/DuckStudioToolkit_A_Gema_1.html` en el navegador.

### 2. Levantar Duck Studio OS (producción)
```bash
cd 01-STUDIO-OS
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
docker compose up --build
```

### 3. Levantar el Portal de Clientes (CRM)
```bash
cd 11-PORTAL-CLIENTES
npm install
npx prisma db push
npm run dev        # http://localhost:3000
```

### 4. Lanzar la Experiencia Inmersiva
Abrir `06-EXPERIENCIA-INMERSIVA/web/index.html` en el navegador (GSAP + Lenis ya incluidas en vendor/).

---

## API PRINCIPAL (duck-studio-delivery)

| Módulo | Rutas |
|---|---|
| Clientes | `/api/clients` · `/api/clients/[id]` |
| Proyectos | `/api/projects` · `/api/projects/[id]` · `/files` · `/qc` · `/versions` |
| Facturas | `/api/invoices` · `/api/invoices/[id]` |
| Automatización | `/api/automations` · `/chains` |
| Studio | `/api/plugins` · `/api/daw-bridge` · `/api/analytics` · `/api/search` |
| Sistema | `/api/health` · `/api/session` · `/api/stats` · `/api/activity` · `/api/audit` |

---

## SEGURIDAD

- Secrets SOLO en `.env` (ver `.env.example`): SMTP_HOST / PORT / USER / PASSWORD / MAIL_FROM / MAIL_TO
- Stripe únicamente por abstracciones; checkout desactivado sin claves reales
- Ninguna credencial está incrustada en el código fuente

---

## ESTADO DE ENTREGA (BUILD REPORT)

| Punto | Estado |
|---|---|
| BUILD | ✅ PASS (duck-studio-delivery, Next build verificado) |
| TESTS | ✅ PASS (duck-ecosystem: vitest, duck.test.ts) |
| HEALTH | ✅ PASS (GET /api/health) |
| EMAIL | ⚠️ CONFIGURED (SMTP vía .env) |
| PWA | ✅ READY |
| DOCKER | ✅ READY (Dockerfile presente) |
| PACKAGE | ✅ CREATED (deliveries) |

---

## FRAGMENTOS

| Nº | Fragmento | Estado |
|---|---|---|
| 01 | A Onda Grave — a base de toda história sonora | ✅ ATIVO |
| 02 | O Eco das Montanhas | 🔒 BLOQUEADO |
| 03 | A Frequência Estelar | 🔒 BLOQUEADO |
| 04 | O Núcleo Vulcânico | 🔒 BLOQUEADO |
| 05 | O Vórtice Temporal | 🔒 BLOQUEADO |

---

*El lore se descubre por microcopys, logs, estados y eventos. Nunca se explica en bloque.*
*La interfaz parece una herramienta profesional que accidentalmente contiene una historia mayor.*