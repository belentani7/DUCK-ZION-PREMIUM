# PROMPT MAESTRO · DUCK / BELENTANI — CANAL ZION

> Pequeña plataforma de prompts maestros para reconstruir o continuar la entrega
> CANAL ZION PREMIUM de forma reproducible con cualquier IA (Claude, Gemini, DeepSeek).

**Autoría:** Pedro Belentani · **Edición:** 14.08.2026
**Canon:** GEMA Nº 01 · FREQUÊNCIA NARRATIVA ORIGINAL · CANAL ZION · STATUS OPERACIONAL

---

## Cómo usar estos prompts

1. Copia el prompt completo de una sección y pégalo en tu agente IA.
2. El agente debe **primero inspeccionar el workspace** (nunca inventar rutas).
3. Regla de oro: **no reemplazar lo que ya funciona**; integrar.
4. Los secretos (SMTP, Stripe, API keys) van SOLO en `.env`, nunca en el código ni en el prompt.

---

## PROMPT 1 · RECONOCIMIENTO TOTAL

```text
Actúa como TECH LEAD. Antes de tocar nada, inspecciona y reporta:

1. Todas las carpetas y ZIPs relacionados con: DUCK, BELENTANI, CANAL ZION,
   GEMA Nº 01, NOIACORE, portal-clientes, noiacore, duck-studio, duck-ecosystem.
2. Para cada proyecto encontrado, reporta: stack (package.json / pom.xml),
   comandos de arranque (scripts), endpoints API, base de datos, y estado
   (completo / parcial / scaffold).
3. Ubica el canal de clientes (portal-clientes) y las herramientas de
   producción DUCK (duck-studio-delivery, DUCK-STUDIO-LOCAL-WIN11).
4. Devuelve un MAPA DE INVENTARIO en Markdown, sin modificar archivos.

NO inventes rutas. Si algo no existe, dilo.
```

---

## PROMPT 2 · CONSTRUIR CANAL ZION (herramienta real de producción)

```text
Construye una herramienta de producción musical real (NO una landing):

FRONTEND: React + TypeScript + Vite (o stack existente coherente).
BACKEND: Node + TypeScript, API REST, persistencia local, listo para SQLite/Postgres.
AUDIO: Web Audio API (analyzer, spectrum, RMS, peak, LUFS estimado etiquetado,
       stereo width, phase correlation).
MIX BUS: gain in/out, compresión visual, medidor gain reduction, sidechain visual,
         aviso de clipping.
MASTER: LUFS target, peak, headroom, dynamics, limiter, loudness history.
EQ: gráfico de frecuencia con nodos arrastrables (low, low-mid, mid, high-mid, high).
STEMS: VOCAL, BASS, DRUMS, SYNTH, FX.
PRESETS: guardar, cargar, duplicar, eliminar, exportar/importar JSON.
CANAL ZION: terminal interno [SIGNAL.IN] [SPECTRUM.ACTIVE] [MIX.BUS] [MASTER.ON]
            [ZION.CHANNEL] [STATUS.OK].
FRAGMENTOS: 01 A Onda Grave (ATIVO), 02 O Eco das Montanhas, 03 A Frequência
            Estelar, 04 O Núcleo Vulcânico, 05 O Vórtice Temporal (bloqueados).
MODOS: PRODUCER (limpio) / MYTH (revela lore progresivamente).

NO finjas procesamiento que no exista: si es visual, etiqueta preview/simulation.
Nada de cyberpunk genérico, HUD militar ni neón exagerado: negro profundo,
verde esmeralda controlado, blanco cristalino, monoespaciada técnica.
```

---

## PROMPT 3 · EXPERIENCIA INMERSIVA DE ENTRADA

```text
Crea la entrada premium: pantalla negra, aparece una frecuencia, un waveform
mínimo, después CANAL_ZION // CONNECTION, la interfaz despierta y la GEMA Nº 01
aparece lentamente (60-70% de la altura de la pieza principal).

Tono: luxury audio laboratory + mastering suite + artefacto imposible +
instrumento profesional. La gema es el centro; la interfaz la rodea sin taparla.
El lore se descubre por microcopys, logs, estados, eventos, fragmentos y mensajes
de transmisión. Si hay silencio: [ZION.CHANNEL] waiting for signal... Si hay
audio: [SIGNAL.IN] frequency detected. Nunca explicar el lore en bloque.
```

---

## PROMPT 4 · EMAIL PROFESIONAL + PLAN + SEGURIDAD

```text
Backend de contacto: endpoint POST /api/contact con validación (nombre, email,
asunto, mensaje), rate limiting, sanitización, CORS correcto. Plantilla de email
"[DUCK / BELENTANI] Nova transmissão" con cuerpo CANAL ZION. SMTP SOLO en .env
(.env.example con SMTP_HOST/PORT/USER/PASSWORD/MAIL_FROM/MAIL_TO).

Plan FREE/PRO/PREMIUM preparado por arquitectura. Stripe SOLO mediante
abstracciones/interfaces, checkout DESACTIVADO sin claves reales. Nunca
hardcodear Stripe keys, SMTP passwords, API keys ni tokens.

Seguridad: Helmet, rate limiting, input validation, CSP razonable, secrets en
.env, .gitignore correcto.
```

---

## PROMPT 5 · ENTREGA + PWA + AUTODESPLIEGUE

```text
Prepara para producción: Dockerfile, docker-compose.yml, .env.example, README.md,
DEPLOY.md, BUILD_REPORT.md, endpoint GET /api/health que devuelva:
{ "status":"ok", "channel":"ZION", "version":"...", "environment":"..." }.

PWA: manifest, icons, service worker, offline shell, instalable como app de
escritorio. npm install + npm run dev; producción npm run build + npm run start;
docker compose up --build.

Al terminar: tests, build, lint, levantar servidor, comprobar /api/health,
frontend, responsive, email, que ningún secret esté en git. Generar
BUILD_REPORT.md. Crear dist/ release/ docs/ y ZIP final
DUCK_BELENTANI_ZION_PREMIUM_v1.zip SIN node_modules, .git, .env, secretos,
cache ni logs privados. Solo imprimir BUILD PASS / TESTS PASS / HEALTH PASS /
PACKAGE CREATED cuando todo esté verificado.
```

---

## PROMPT 6 · INTEGRAR HERENCIAS SIN ROMPER

```text
Integra en el nuevo paquete las piezas reales ya existentes, conservándolas:

1. duck-studio-delivery (Next.js + Prisma, 35 endpoints API, manual PDF).
2. portal-clientes (Next.js 16 + Prisma + Socket.io + shadcn, 1002 datos seed,
   login admin/cliente, kanban, facturas, mensajes en tiempo real, export).
3. NOIACORE (Spring Boot 4.1 / Java 17, Dockerfile, puerto 8099).
4. DUCK-STUDIO-LOCAL-WIN11 (base de conocimiento de productor PT-BR).
5. _ENTREGA_FINAL regalos (DUCK-ECOSYSTEM tRPC, VOZ-PRO Python, suite HTML DAW,
   FOTOS de la gema).

CRITERIO: primero inspeccionar, después integrar, después construir, después
probar, después corregir, después empaquetar. No declares terminado hasta
BUILD PASS + TESTS PASS + HEALTH PASS + PACKAGE CREATED.
```

---

## Contraseña de ZIPs heredados (contexto, NO para incrustar)

Algunos ZIPs antiguos del ecosistema pueden estar protegidos con la contraseña
`dreamingisnotagame`. Si se encuentra uno: hacer una COPIA DE TRABAJO, extraer
con esa contraseña, analizar qué es reutilizable y NUNCA sobrescribir el ZIP
original. Si la contraseña no funciona, no inventar otra; dejar constancia en
BUILD_REPORT.md.
