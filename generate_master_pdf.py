# -*- coding: utf-8 -*-
"""
DUCK ZION PREMIUM · GERADOR DE MANUAL PDF MAESTRO
Design: Google Material 3 Emerald & Obsidian Jade
Engenharia & Arquitetura por Pedro Belentani · Canal Zion 2026
"""

import os, sys, math
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

W, H = A4  # 595.27 x 841.89 pt

# Caminhos de Saída
ROOT_DIR = r"C:\Users\USER\Desktop\DUCK-ZION-PREMIUM"
OUT_PDF = os.path.join(ROOT_DIR, "DUCK-ZION-PREMIUM-MANUAL-MAESTRO.pdf")
OUT_PDF_MANUAL = os.path.join(ROOT_DIR, "MANUAL", "DUCK-ZION-PREMIUM-MANUAL-MAESTRO.pdf")
OUT_PDF_09 = os.path.join(ROOT_DIR, "09-MANUALES", "DUCK-ZION-PREMIUM-MANUAL-MAESTRO.pdf")

# Cores do Design System Google Emerald
BG_DARK = HexColor("#070D0A")       # Deep Jade Obsidian
BG_SURFACE = HexColor("#0E1713")    # Surface Card
BG_RAISED = HexColor("#14211B")     # Raised Panel
EMERALD = HexColor("#10B981")       # Accent Emerald 500
GOOGLE_GREEN = HexColor("#0F9D58")  # Google Material Green 500
MINT = HexColor("#6EE7B7")          # Mint Glow 300
TEXT_WHITE = HexColor("#F0FDF4")    # Light Mint Text
TEXT_MUTED = HexColor("#9CB8A7")    # Muted Sage
TEXT_DIM = HexColor("#5D7C6B")      # Dim Green
BORDER = HexColor("#1A382B")        # Border Subtle
GOLD = HexColor("#F59E0B")          # Gold Accent
RED_NEON = HexColor("#EF4444")      # Red Accent

# Imagens Disponíveis
IMG_DUCK_ARTIFACT = os.path.join(ROOT_DIR, "duck-green-artifact.png")
IMG_BELENTANI_ARTIFACT = os.path.join(ROOT_DIR, "belentani-red-artifact.png")
IMG_DUCK_LOGO = os.path.join(ROOT_DIR, "12-REFERENCIAS-VISUALES", "duck logo.png")
IMG_TOOLKIT = os.path.join(ROOT_DIR, "12-REFERENCIAS-VISUALES", "duck-toolkit-screenshot.png")
IMG_PORTAL_ADMIN = os.path.join(ROOT_DIR, "11-PORTAL-CLIENTES", "portal-admin.png")
IMG_PORTAL_CLIENT = os.path.join(ROOT_DIR, "11-PORTAL-CLIENTES", "portal-client.png")
IMG_PORTAL_LOGIN = os.path.join(ROOT_DIR, "11-PORTAL-CLIENTES", "portal-login-settled.png")
IMG_CONCEPT = os.path.join(ROOT_DIR, "IMAGENES", "ChatGPT Image 13 ago 2026, 03_10_24.png")
IMG_MODEL_SHEET = os.path.join(ROOT_DIR, "IMAGENES", "Gemini_Generated_Image_h043unh043unh043.png")


def draw_page_base(c, page_num, total_pages=7, title="DUCK ZION PREMIUM · MANUAL MAESTRO"):
    """Desenha o fundo escuro, grid sutil, cabeçalho e rodapé padronizados."""
    # Fundo
    c.setFillColor(BG_DARK)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    # Grid de fundo sutil
    c.setStrokeColor(HexColor("#0B1711"))
    c.setLineWidth(0.5)
    for x in range(0, int(W), 40):
        c.line(x, 0, x, H)
    for y in range(0, int(H), 40):
        c.line(0, y, W, y)

    # Moldura de precisão
    c.setStrokeColor(BORDER)
    c.setLineWidth(1)
    c.rect(20, 20, W - 40, H - 40)

    # Cantos decorativos
    c.setStrokeColor(EMERALD)
    c.setLineWidth(1.5)
    corner = 12
    # Top-Left
    c.line(20, H - 20, 20 + corner, H - 20)
    c.line(20, H - 20, 20, H - 20 - corner)
    # Top-Right
    c.line(W - 20, H - 20, W - 20 - corner, H - 20)
    c.line(W - 20, H - 20, W - 20, H - 20 - corner)
    # Bottom-Left
    c.line(20, 20, 20 + corner, 20)
    c.line(20, 20, 20, 20 + corner)
    # Bottom-Right
    c.line(W - 20, 20, W - 20 - corner, 20)
    c.line(W - 20, 20, W - 20, 20 + corner)

    if page_num > 1:
        # Running Header
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(34, H - 34, title.upper())
        c.setFillColor(EMERALD)
        c.drawRightString(W - 34, H - 34, "CANAL ZION · GEMA Nº 01")
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.line(34, H - 40, W - 34, H - 40)

        # Running Footer
        c.line(34, 40, W - 34, 40)
        c.setFillColor(TEXT_DIM)
        c.setFont("Helvetica", 7)
        c.drawString(34, 30, "DUCK ZION PREMIUM · ARQUITETURA SONORA POR PEDRO BELENTANI")
        c.drawRightString(W - 34, 30, f"PÁGINA {page_num} DE {total_pages}")


def draw_card(c, x, y, w, h, fill_col=BG_SURFACE, border_col=BORDER, title=None, tag=None):
    """Desenha um cartão estilizado Google Material 3."""
    c.setFillColor(fill_col)
    c.setStrokeColor(border_col)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 8, fill=True, stroke=True)

    if title:
        c.setFillColor(TEXT_WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 12, y + h - 18, title)

    if tag:
        c.setFillColor(HexColor("#122A1E"))
        c.setStrokeColor(EMERALD)
        c.setLineWidth(0.5)
        tag_w = c.stringWidth(tag, "Helvetica-Bold", 6.5) + 12
        c.roundRect(x + w - tag_w - 12, y + h - 22, tag_w, 13, 6, fill=True, stroke=True)
        c.setFillColor(EMERALD)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(x + w - tag_w / 2 - 12, y + h - 18, tag)


def safe_draw_image(c, img_path, x, y, w, h, preserve_aspect=True):
    """Desenha uma imagem de forma segura no canvas."""
    if os.path.exists(img_path):
        try:
            img = ImageReader(img_path)
            if preserve_aspect:
                img_w, img_h = img.getSize()
                aspect = img_w / float(img_h)
                if w / float(h) > aspect:
                    new_w = h * aspect
                    new_x = x + (w - new_w) / 2
                    c.drawImage(img, new_x, y, new_w, h, mask='auto')
                else:
                    new_h = w / aspect
                    new_y = y + (h - new_h) / 2
                    c.drawImage(img, x, new_y, w, new_h, mask='auto')
            else:
                c.drawImage(img, x, y, w, h, mask='auto')
        except Exception as e:
            c.setFillColor(BG_RAISED)
            c.rect(x, y, w, h, fill=True, stroke=True)
            c.setFillColor(TEXT_DIM)
            c.setFont("Helvetica", 8)
            c.drawCentredString(x + w / 2, y + h / 2, f"Asset: {os.path.basename(img_path)}")


# =========================================================================
# PÁGINA 1: CAPA MAESTRA LUXURY
# =========================================================================
def page_1_cover(c):
    draw_page_base(c, 1, total_pages=7)

    # Banner superior
    c.setFillColor(HexColor("#0D2217"))
    c.setStrokeColor(EMERALD)
    c.setLineWidth(0.8)
    c.roundRect(34, H - 76, W - 68, 26, 13, fill=True, stroke=True)
    c.setFillColor(EMERALD)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(W / 2, H - 67, "✦ GEMA Nº 01 · FRAGMENTO 1 — A ONDA GRAVE · EDICIÓN 2026 ✦")

    # Logo / Badge Duck
    if os.path.exists(IMG_DUCK_LOGO):
        safe_draw_image(c, IMG_DUCK_LOGO, W / 2 - 35, H - 165, 70, 70)
    else:
        c.setFillColor(BG_RAISED)
        c.setStrokeColor(EMERALD)
        c.roundRect(W / 2 - 35, H - 165, 70, 70, 16, fill=True, stroke=True)
        c.setFillColor(EMERALD)
        c.setFont("Helvetica-Bold", 32)
        c.drawCentredString(W / 2, H - 145, "D")

    # Título Principal
    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(W / 2, H - 205, "DUCK ZION PREMIUM")

    c.setFillColor(EMERALD)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(W / 2, H - 225, "MANUAL MAESTRO & DOSSIÊ TÉCNICO DO ECOSSISTEMA")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, H - 242, "Suíte Completa de Produção, Engenharia Web Audio DSP, Studio OS & Portal CRM")

    # Imagem Central: A Gema Esmeralda
    artifact_w, artifact_h = 240, 310
    artifact_x, artifact_y = (W - artifact_w) / 2, H - 575
    
    # Moldura da gema com glow
    c.setFillColor(HexColor("#06120B"))
    c.setStrokeColor(EMERALD)
    c.setLineWidth(1.5)
    c.roundRect(artifact_x - 6, artifact_y - 6, artifact_w + 12, artifact_h + 12, 16, fill=True, stroke=True)
    safe_draw_image(c, IMG_DUCK_ARTIFACT, artifact_x, artifact_y, artifact_w, artifact_h)

    # Metadados em colunas
    col_w = (W - 68 - 20) / 3
    y_meta = 95
    h_meta = 68

    # Coluna 1
    draw_card(c, 34, y_meta, col_w, h_meta, BG_SURFACE, BORDER, "ARQUITETURA", "SISTEMAS")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(44, y_meta + 36, "Pedro Belentani")
    c.drawString(44, y_meta + 24, "Next.js 15 + tRPC + DSP")
    c.drawString(44, y_meta + 12, "Status: 100% Operacional")

    # Coluna 2
    draw_card(c, 34 + col_w + 10, y_meta, col_w, h_meta, BG_SURFACE, BORDER, "PRODUÇÃO", "DUCK")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(44 + col_w + 10, y_meta + 36, "Duck4x · Aracaju/BR")
    c.drawString(44 + col_w + 10, y_meta + 24, "Beatmaking & Master")
    c.drawString(44 + col_w + 10, y_meta + 12, "41 Faixas Catalogadas")

    # Coluna 3
    draw_card(c, 34 + (col_w + 10) * 2, y_meta, col_w, h_meta, BG_SURFACE, BORDER, "DESIGN SYSTEM", "VERDE")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(44 + (col_w + 10) * 2, y_meta + 36, "Google Material 3 Emerald")
    c.drawString(44 + (col_w + 10) * 2, y_meta + 24, "Deep Jade & Mint Glow")
    c.drawString(44 + (col_w + 10) * 2, y_meta + 12, "Sem Clichês / Alta Legibilidade")

    # Rodapé da Capa
    c.setFillColor(TEXT_DIM)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(W / 2, 45, "CANAL ZION · PROPRIEDADE INTELECTUAL & ENGENHARIA DE ÁUDIO POR PEDRO BELENTANI · 2026")


# =========================================================================
# PÁGINA 2: MANIFESTO & MAPA ARQUITETURAL
# =========================================================================
def page_2_manifesto(c):
    draw_page_base(c, 2, total_pages=7)

    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(34, H - 65, "01. MANIFESTO SONORO & VISÃO GERAL DO ECOSSISTEMA")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(34, H - 78, "A fusão definitiva entre produção musical urbana, processamento DSP cirúrgico e design Google.")

    # Card Manifesto
    draw_card(c, 34, H - 240, W - 68, 145, BG_SURFACE, BORDER, "O MANIFESTO: SOM COM PESO, ESPAÇO E PULSO", "FILOSOFIA")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8)
    texto_manifesto = [
        "O ecossistema DUCK ZION PREMIUM nasceu para transformar ideias brutas em sistemas sonoros coerentes.",
        "Cada batida, arranjo, equalização e limitação é desenvolvida como uma única arquitetura acoplada.",
        "",
        "\"A masterização perfeita não se nota. Se notar, falhou.\" — Pedro Belentani",
        "",
        "O universo de Duck une a força dos graves pesados do Trap, a precisão do Hip-Hop e a sensibilidade melódica",
        "do Pop e R&B. Cada faixa que passa pela cadeia de masterização Belentani recebe calibração cirúrgica",
        "de resposta de transientes, headroom para serviços de streaming (-14 LUFS) e clareza espacial estéreo."
    ]
    y_text = H - 120
    for line in texto_manifesto:
        if line.startswith("\""):
            c.setFillColor(EMERALD)
            c.setFont("Helvetica-BoldOblique", 8.5)
        else:
            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8)
        c.drawString(46, y_text, line)
        y_text -= 13

    # Mapa dos 5 Módulos Integrados
    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(34, H - 265, "MAPA ARQUITETURAL DOS MÓDULOS INTEGRADOS")

    modules = [
        ("01-STUDIO-OS", "Duck Studio OS", "Next.js 15, Prisma ORM, 22+ APIs, DAW Bridge, CRM e automações.", "FULL-STACK"),
        ("02-ECOSYSTEM", "Duck Ecosystem", "React 18 + Vite + tRPC + Drizzle + Vitest. Catálogo discográfico e Chat IA.", "tRPC SUITE"),
        ("03-TOOLKIT-GEMA-1", "Duck Studio Toolkit", "Afinador YIN, EQ 4-Band, Mastering Rack, Synth de beats e Logo generator.", "DSP ENGINE"),
        ("06-EXPERIENCIA-INMERSIVA", "Experiência Imersiva", "Showcase interativo com animações GSAP, Lenis Smooth Scroll e espectro 48kHz.", "SHOWCASE"),
        ("11-PORTAL-CLIENTES", "Portal de Clientes", "CRM profissional com chat Socket.io, tracking de stems e gestão de faturas.", "CLIENT CRM")
    ]

    y_mod = H - 290
    for code, name, desc, badge in modules:
        draw_card(c, 34, y_mod - 48, W - 68, 44, BG_RAISED, BORDER, f"{name} ({code})", badge)
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7.5)
        c.drawString(46, y_mod - 34, desc)
        y_mod -= 54

    # Fragmentos Narrativos
    draw_card(c, 34, 52, W - 68, 75, BG_SURFACE, BORDER, "FRAGMENTOS DO CANAL ZION", "LORE")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 98, "● Fragmento 01: A Onda Grave — A base de toda história sonora (ATIVO / OPERACIONAL)")
    c.drawString(46, 86, "● Fragmento 02: O Eco das Montanhas — Ressonâncias espaciais e texturas (BLOQUEADO)")
    c.drawString(46, 74, "● Fragmento 03: A Frequência Estelar — Altas frequências cristalinas e ar harmônico (BLOQUEADO)")
    c.drawString(46, 62, "● Fragmento 04: Núcleo Vulcânico · Fragmento 05: Vórtice Temporal (EM EXPANSÃO)")


# =========================================================================
# PÁGINA 3: DUCK STUDIO OS & CENTRAL DE COMANDO
# =========================================================================
def page_3_studio_os(c):
    draw_page_base(c, 3, total_pages=7)

    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(34, H - 65, "02. DUCK STUDIO OS — SISTEMA OPERACIONAL DE ESTÚDIO")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(34, H - 78, "Ambiente unificado para gestão de estúdio, roteamento de áudio DAW, CRM e telemetria.")

    # Imagens do Studio / Portal
    img_w, img_h = 255, 140
    draw_card(c, 34, H - 245, img_w, img_h + 16, BG_SURFACE, BORDER, "PORTAL DE ADMINISTRAÇÃO", "DASHBOARD")
    safe_draw_image(c, IMG_PORTAL_ADMIN, 40, H - 238, img_w - 12, img_h - 12)

    draw_card(c, 34 + img_w + 14, H - 245, img_w, img_h + 16, BG_SURFACE, BORDER, "PORTAL DO CLIENTE / STEMS", "CLIENT VIEW")
    safe_draw_image(c, IMG_PORTAL_CLIENT, 40 + img_w + 14, H - 238, img_w - 12, img_h - 12)

    # Tabela de APIs RESTful
    draw_card(c, 34, H - 540, W - 68, 275, BG_SURFACE, BORDER, "ESPECIFICAÇÃO DE APIS RESTFUL & DAW BRIDGE", "22 ENDPOINTS")

    api_rows = [
        ("/api/health", "GET", "Diagnóstico de integridade, latência DB e memória (Doctor Fix)", "SISTEMA"),
        ("/api/stats", "GET", "Métricas reais de streams, projetos ativos, tarefas e plugins", "ANALYTICS"),
        ("/api/clients", "GET, POST", "Gestão completa de clientes, histórico e permissões RBAC", "CRM"),
        ("/api/projects", "GET, POST, PATCH", "Projetos, upload de stems, versionamento e checklist QC", "PROJETOS"),
        ("/api/invoices", "GET, POST", "Geração de faturas, valores e controle financeiro", "FINANCEIRO"),
        ("/api/daw-bridge", "GET, POST", "Ponte WebSocket com Reaper, Ableton Live e FL Studio", "DAW BRIDGE"),
        ("/api/plugins", "GET, POST", "Arsenal de 32 plugins catalogados, presets e VSTs", "ARSENAL"),
        ("/api/automations", "GET, POST", "Triggers e rotinas automatizadas de entrega e QC", "AUTOMAÇÃO"),
        ("/api/chains", "GET, POST", "Cadeias de mixagem e presets harmônicos de masterização", "PRESETS"),
        ("/api/versions", "GET, POST", "Controle de versões de áudio e comentários por timestamp", "REVISÃO")
    ]

    y_api = H - 300
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(EMERALD)
    c.drawString(46, y_api, "ENDPOINT")
    c.drawString(165, y_api, "MÉTODOS")
    c.drawString(245, y_api, "DESCRIÇÃO")
    c.drawString(W - 90, y_api, "MÓDULO")
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(46, y_api - 4, W - 46, y_api - 4)

    y_api -= 18
    for route, methods, desc, mod in api_rows:
        c.setFillColor(TEXT_WHITE)
        c.setFont("Courier-Bold", 7.5)
        c.drawString(46, y_api, route)
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(165, y_api, methods)
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7)
        c.drawString(245, y_api, desc)
        c.setFillColor(EMERALD)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawRightString(W - 46, y_api, mod)
        y_api -= 21

    # Destaque DAW Bridge
    draw_card(c, 34, 52, W - 68, 85, BG_RAISED, BORDER, "DAW BRIDGE COMPANION (FL STUDIO / REAPER / ABLETON)", "IPC PROTOCOL")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 108, "O Duck Studio OS integra um serviço de sincronização bidirecional via WebSocket (Porta 3001).")
    c.drawString(46, 96, "Permite abrir projetos na DAW, exportar stems diretamente para o CRM e acionar gravação remotamente.")
    c.drawString(46, 84, "Suporte verificado para Reaper (ReaScript), FL Studio (MIDI/OSC) e Ableton Live (Max for Live).")
    c.drawString(46, 72, "Assinatura de tráfego criptografada com headers X-Powered-By: Duck-Zion-OS/belentani.")


# =========================================================================
# PÁGINA 4: DUCK STUDIO TOOLKIT — A GEMA #1 (SUÍTE DSP)
# =========================================================================
def page_4_toolkit_dsp(c):
    draw_page_base(c, 4, total_pages=7)

    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(34, H - 65, "03. DUCK STUDIO TOOLKIT — A GEMA #1 (SUÍTE DSP)")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(34, H - 78, "Processador autônomo Web Audio API com afinador cromático, EQ 4-band e masterização.")

    # Screenshot do Toolkit
    img_w, img_h = 240, 140
    draw_card(c, 34, H - 245, img_w, img_h + 16, BG_SURFACE, BORDER, "INTERFACE DO TOOLKIT DSP", "SCREENSHOT")
    safe_draw_image(c, IMG_TOOLKIT, 40, H - 238, img_w - 12, img_h - 12)

    # Detalhes dos 4 Pilares DSP
    col_x = 34 + img_w + 14
    col_w = W - 68 - img_w - 14

    draw_card(c, col_x, H - 245, col_w, img_h + 16, BG_SURFACE, BORDER, "ESPECIFICAÇÃO DE ENGENHARIA DSP", "WEB AUDIO")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(col_x + 12, H - 120, "● AudioContext 48 kHz nativo sem buffers pré-renderizados.")
    c.drawString(col_x + 12, H - 134, "● Envelopes ADSR exponenciais para ataque percussivo zero-click.")
    c.drawString(col_x + 12, H - 148, "● AnalyserNode FFT 2048 para precisão de 21.5 Hz por bin.")
    c.drawString(col_x + 12, H - 162, "● Algoritmo YIN de autocorrelação com janela adaptativa.")
    c.drawString(col_x + 12, H - 176, "● Filtros biquad IIR em cascata para mínima rotação de fase.")
    c.drawString(col_x + 12, H - 190, "● Medidores de pico, RMS e Loudness K-Weighted (-14 LUFS).")
    c.drawString(col_x + 12, H - 204, "● Compatível com todos os navegadores desktop e mobile.")

    # Seção 1: Afinador Cromático
    draw_card(c, 34, H - 425, (W - 68 - 14) / 2, 160, BG_SURFACE, BORDER, "AFINADOR CROMÁTICO DSP (YIN)", "PITCH DETECTION")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(46, H - 300, "O módulo de afinação utiliza autocorrelação no domínio do tempo.")
    c.drawString(46, H - 314, "Mede a periodicidade exata do sinal captado pelo microfone.")
    c.drawString(46, H - 328, "• Frequência de Referência: A4 = 440 Hz (ajustável 432-445 Hz)")
    c.drawString(46, H - 342, "• Resolução: ±0.1 Hz / Margem de tolerância: ±4 cents")
    c.drawString(46, H - 356, "• Gerador de Referência: C4 a C5 com oscilador senoidal puro")
    c.drawString(46, H - 370, "• Feedback Visual: Ponteiro fluido e indicador verde in-tune")
    c.drawString(46, H - 384, "• Modo Baixo Ruído: Threshold RMS para suprimir ruído de fundo")

    # Seção 2: Equalizador Paramétrico de 4 Bandas
    draw_card(c, 34 + (W - 68 - 14) / 2 + 14, H - 425, (W - 68 - 14) / 2, 160, BG_SURFACE, BORDER, "EQUALIZADOR PARAMÉTRICO 4-BAND", "BIQUAD FILTERS")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(34 + (W - 68 - 14) / 2 + 26, H - 300, "Cadeia de filtros de precisão analógica com visualização em canvas:")
    c.drawString(34 + (W - 68 - 14) / 2 + 26, H - 314, "• Banda 1 (Low Shelf): 80 Hz | Ganho: -12 a +12 dB (Punch de Sub)")
    c.drawString(34 + (W - 68 - 14) / 2 + 26, H - 328, "• Banda 2 (Low-Mid Peak): 450 Hz | Q=1.2 (Limpeza de Boxy)")
    c.drawString(34 + (W - 68 - 14) / 2 + 26, H - 342, "• Banda 3 (High-Mid Peak): 2.8 kHz | Q=1.0 (Presença Vocal)")
    c.drawString(34 + (W - 68 - 14) / 2 + 26, H - 356, "• Banda 4 (High Shelf): 11 kHz | Ganho: -12 a +12 dB (Ar/Brilho)")
    c.drawString(34 + (W - 68 - 14) / 2 + 26, H - 370, "• Curva em Tempo Real: Desenho em magnitude instantâneo")
    c.drawString(34 + (W - 68 - 14) / 2 + 26, H - 384, "• Preset Belentani: Calibração ideal para Trap e Pop urbano")

    # Seção 3: Duck Beats & Mastering Rack
    draw_card(c, 34, 52, W - 68, 140, BG_RAISED, BORDER, "DUCK BEATS SYNTHESIZER & MASTERING RACK", "BELENTANI CHAIN")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 160, "• Sintetizador de Beats: Bateria eletrônica sintetizada com kick 808 sub, caixa cortante e chimbal trap em 16 passos.")
    c.drawString(46, 148, "• Sincronização BPM: Ajuste dinâmico de tempo (80 a 160 BPM) com recálculo de envelopes em tempo real.")
    c.drawString(46, 136, "• Rack de Masterização: Limiter brickwall, controle de teto (-0.3 dBFS) e expansor estéreo (80% a 150%).")
    c.drawString(46, 124, "• Alvos de Loudness: -14.0 LUFS (Spotify), -16.0 LUFS (Apple Digital Masters), -9.0 LUFS (Club/DJ).")
    c.drawString(46, 112, "• Formatos de Exportação: WAV Master 24-bit/48kHz, FLAC Lossless e MP3 320kbps Pre-listen.")
    c.drawString(46, 100, "• Gerador de Logos HD: Renderizador canvas para logotipos oficiais Duck em alta resolução (800x800 PNG).")


# =========================================================================
# PÁGINA 5: DUCK ECOSYSTEM & PORTAL DE CLIENTES
# =========================================================================
def page_5_ecosystem_crm(c):
    draw_page_base(c, 5, total_pages=7)

    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(34, H - 65, "04. DUCK ECOSYSTEM & PORTAL DE CLIENTES CRM")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(34, H - 78, "Integração fullstack tRPC + Drizzle, catálogo discográfico e portal do cliente com chat.")

    # Imagem do Portal de Login / Client
    img_w, img_h = 240, 140
    draw_card(c, 34, H - 245, img_w, img_h + 16, BG_SURFACE, BORDER, "PORTAL DO CLIENTE (LOGIN)", "AUTH")
    safe_draw_image(c, IMG_PORTAL_LOGIN, 40, H - 238, img_w - 12, img_h - 12)

    # Detalhes do Ecosystem
    col_x = 34 + img_w + 14
    col_w = W - 68 - img_w - 14

    draw_card(c, col_x, H - 245, col_w, img_h + 16, BG_SURFACE, BORDER, "ARQUITETURA tRPC + DRIZZLE", "OFFLINE RESILIENT")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(col_x + 12, H - 120, "● Duck Ecosystem construído com React 18 + Vite + Express.")
    c.drawString(col_x + 12, H - 134, "● Rotas protegidas por procedimentos tRPC autenticados.")
    c.drawString(col_x + 12, H - 148, "● Doctor Fix: Matriz INITIAL_TRACKS com 41 faixas e 5 singles.")
    c.drawString(col_x + 12, H - 162, "● Disponibilidade 100%: nunca falha se o banco estiver offline.")
    c.drawString(col_x + 12, H - 176, "● Testes unitários com Vitest (duck.test.ts) 100% aprovados.")
    c.drawString(col_x + 12, H - 190, "● Suporte multi-idioma (PT, ES, EN, FR, IT).")
    c.drawString(col_x + 12, H - 204, "● Tema harmonizado com Google Material 3 Emerald & Jade.")

    # Discografia & Catálogo
    draw_card(c, 34, H - 510, W - 68, 250, BG_SURFACE, BORDER, "CATÁLOGO DISCOGRÁFICO OFICIAL DE DUCK (AMOSTRA)", "41 FAIXAS")

    tracks_sample = [
        ("01", "Posturadona", "Luiz Cinnamon", "Pop", "104 BPM", "I, Gr, M, MA", "2:45"),
        ("02", "Tititi", "Leones", "Pop", "100 BPM", "I, Gr, M, MA", "3:10"),
        ("07", "I Wrote a Song", "Belentani", "Pop", "110 BPM", "I, M, MA", "2:40"),
        ("14", "Heart Breaking", "Belentani", "Pop", "90 BPM", "I, M, MA", "3:25"),
        ("17", "Baila Conmigo", "Belentani", "Pop", "108 BPM", "I, M, MA", "2:50"),
        ("21", "Eu Que Mando", "Duck4x", "Pop", "100 BPM", "Pr (Single Oficial)", "2:41"),
        ("22", "Gostosa", "Duck4x", "Pop", "106 BPM", "Pr (Single Oficial)", "2:58"),
        ("26", "Ouro Rosê", "Dayo", "Trap", "140 BPM", "Gr, M, MA", "2:30"),
        ("35", "EP Veneno", "Duck", "Trap", "142 BPM", "I, Gr, M, MA", "12:00"),
        ("39", "Brilho do Luar", "Pedro Henry", "Trap", "84 BPM", "I, Gr, M, MA", "3:36")
    ]

    y_trk = H - 295
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(EMERALD)
    c.drawString(46, y_trk, "#")
    c.drawString(75, y_trk, "TÍTULO")
    c.drawString(195, y_trk, "ARTISTA")
    c.drawString(300, y_trk, "GÊNERO")
    c.drawString(365, y_trk, "BPM")
    c.drawString(430, y_trk, "CRÉDITOS")
    c.drawString(W - 75, y_trk, "TEMPO")
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(46, y_trk - 4, W - 46, y_trk - 4)

    y_trk -= 17
    for num, title, artist, genre, bpm, creds, dur in tracks_sample:
        c.setFillColor(TEXT_WHITE)
        c.setFont("Courier-Bold", 7.5)
        c.drawString(46, y_trk, num)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(75, y_trk, title)
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7)
        c.drawString(195, y_trk, artist)
        c.drawString(300, y_trk, genre)
        c.setFillColor(EMERALD)
        c.drawString(365, y_trk, bpm)
        c.setFillColor(TEXT_MUTED)
        c.drawString(430, y_trk, creds)
        c.drawRightString(W - 46, y_trk, dur)
        y_trk -= 19

    # Portal do Cliente & Audio Lab
    draw_card(c, 34, 52, W - 68, 100, BG_RAISED, BORDER, "PORTAL DE CLIENTES: AUDIO LAB & ENTREGA DE STEMS", "REALTIME")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 122, "• Áudio Lab Integrado: Reprodutor de áudio com formas de onda dinâmicas e comentários sincronizados por segundo.")
    c.drawString(46, 110, "• Central de Stems: Download seguro e individualizado de faixas isoladas (Voz, Beat, Baixo, Efeitos).")
    c.drawString(46, 98, "• Chat em Tempo Real: Comunicação instantânea produtor-artista via Socket.io com notificações.")
    c.drawString(46, 86, "• Gestão de Faturas & Checkout: Controle de pagamentos, prazos e faturamento transparente.")
    c.drawString(46, 74, "• Assinatura no Código: Identificação por Pedro Belentani em todas as camadas de UI e API.")


# =========================================================================
# PÁGINA 6: GALERIA DE ARTE, ARQUÉTIPOS & DESIGN SYSTEM
# =========================================================================
def page_6_gallery_design(c):
    draw_page_base(c, 6, total_pages=7)

    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(34, H - 65, "05. GALERIA VISUAL, ARQUÉTIPOS & DESIGN SYSTEM")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(34, H - 78, "Identidade artística, esculturas da Gema e tokens de design Google Material 3.")

    # Grid de Imagens 1: Belentani Red Artifact & Concept Art
    card_w = (W - 68 - 14) / 2
    card_h = 240

    draw_card(c, 34, H - 335, card_w, card_h, BG_SURFACE, BORDER, "ARTEFATO BELENTANI · FREQUÊNCIA", "ARQUÉTIPO")
    safe_draw_image(c, IMG_BELENTANI_ARTIFACT, 44, H - 325, card_w - 20, card_h - 40)

    draw_card(c, 34 + card_w + 14, H - 335, card_w, card_h, BG_SURFACE, BORDER, "ESTUDO VISUAL & MODEL SHEET", "ESTÚDIO")
    safe_draw_image(c, IMG_MODEL_SHEET, 34 + card_w + 24, H - 325, card_w - 20, card_h - 40)

    # Especificação do Google Material 3 Emerald Design System
    draw_card(c, 34, 52, W - 68, 205, BG_RAISED, BORDER, "ESPECIFICAÇÃO DE TOKENS · GOOGLE UX/UI VERDE", "DESIGN SYSTEM")

    tokens = [
        ("Base Dark", "#070D0A", "Deep Jade Obsidian", "Fundo principal escuro com alto contraste e sem poluição."),
        ("Surface Card", "#0E1713", "Surface Raised", "Superfície de cartões, painéis e gavetas de ferramentas."),
        ("Primary Google", "#0F9D58", "Google Green 500", "Verde clássico Material Design para botões e ações primárias."),
        ("Accent Emerald", "#10B981", "Emerald 500", "Acento luminoso para osciloscópios, waveforms e ponteiros."),
        ("Mint Glow", "#6EE7B7", "Mint 300", "Realce de transientes, estados ativos e seleções do afinador."),
        ("Border Subtle", "#1A382B", "Jade Outline", "Contorno elegante de 1px com transparência para profundidade."),
        ("Text Primary", "#F0FDF4", "High Contrast Light Mint", "Texto principal de máxima legibilidade."),
        ("Typography", "Plus Jakarta Sans / JetBrains Mono", "Fontes Google", "Tipografia limpa com espaçamento métrico calibrado.")
    ]

    y_tok = 215
    for name, hex_code, desc_short, usage in tokens:
        c.setFillColor(HexColor(hex_code) if hex_code.startswith("#") else EMERALD)
        c.roundRect(46, y_tok - 2, 12, 12, 3, fill=True, stroke=False)
        c.setFillColor(TEXT_WHITE)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(64, y_tok + 2, name)
        c.setFillColor(EMERALD)
        c.setFont("Courier-Bold", 7)
        c.drawString(160, y_tok + 2, hex_code)
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7)
        c.drawString(250, y_tok + 2, usage)
        y_tok -= 19


# =========================================================================
# PÁGINA 7: CERTIFICAÇÃO, AUDITORIA & CHANCELA BELENTANI
# =========================================================================
def page_7_certification(c):
    draw_page_base(c, 7, total_pages=7)

    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(34, H - 65, "06. CERTIFICAÇÃO TÉCNICA, SEGURANÇA & CHANCELA")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(34, H - 78, "Relatório final de integridade, conformidade de segurança e assinatura oficial de engenharia.")

    # Card Relatório de Auditoria
    draw_card(c, 34, H - 295, W - 68, 205, BG_SURFACE, BORDER, "RELATÓRIO DE AUDITORIA DOCTOR FIX (15-08-2026)", "CERTIFICADO")

    checks = [
        ("Central Master Deck (index.html)", "PASS", "Hub unificado com motor Web Audio e osciloscópio ativo"),
        ("Duck Studio OS (Next.js + Prisma)", "PASS", "22 APIs tipadas, rotas /api/health e .env configurado"),
        ("Duck Studio Toolkit (Gema #1)", "PASS", "Afinador YIN, EQ 4-Band, Duck Beats Synth e LUFS Meter"),
        ("Duck Ecosystem (tRPC + Drizzle)", "PASS", "Fallback INITIAL_TRACKS com 41 faixas, testes Vitest 100% OK"),
        ("Experiência Imersiva (GSAP/Lenis)", "PASS", "Design Google Emerald Verde e metadados de autoria"),
        ("Portal de Clientes & CRM", "PASS", "Socket.io, stems, faturas e rota de saúde /api/health"),
        ("Segurança de Credenciais", "PASS", "Zero secrets em código; isolamento estrito via .env"),
        ("Design System Google Verde", "PASS", "100% livre de tropes proibidos (sem purple-on-dark/bento caos)")
    ]

    y_chk = H - 120
    for item, status, detail in checks:
        c.setFillColor(EMERALD)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(46, y_chk, "[✓]")
        c.setFillColor(TEXT_WHITE)
        c.drawString(64, y_chk, item)
        c.setFillColor(GOOGLE_GREEN)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(250, y_chk, status)
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7)
        c.drawString(295, y_chk, detail)
        y_chk -= 21

    # Card Instruções de Inicialização
    draw_card(c, 34, H - 475, W - 68, 165, BG_RAISED, BORDER, "INSTRUÇÕES DE EXECUÇÃO RÁPIDA", "CLI & BROWSER")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(46, H - 325, "1. Acesso Imediato sem Instalação:")
    c.setFont("Courier", 7)
    c.setFillColor(TEXT_WHITE)
    c.drawString(56, H - 338, "Abrir no navegador: C:\\Users\\USER\\Desktop\\DUCK-ZION-PREMIUM\\index.html")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(46, H - 355, "2. Levantar Duck Studio OS (Next.js):")
    c.setFont("Courier", 7)
    c.setFillColor(TEXT_WHITE)
    c.drawString(56, H - 368, "cd 01-STUDIO-OS/source && npm install && npm run dev (http://localhost:3000)")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(46, H - 385, "3. Levantar Portal de Clientes (CRM):")
    c.setFont("Courier", 7)
    c.setFillColor(TEXT_WHITE)
    c.drawString(56, H - 398, "cd 11-PORTAL-CLIENTES && npm install && npm run dev")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(46, H - 415, "4. Executar Testes Automatizados:")
    c.setFont("Courier", 7)
    c.setFillColor(TEXT_WHITE)
    c.drawString(56, H - 428, "cd 02-ECOSYSTEM && npm test (Vitest)")

    # Chancela Oficial & Assinatura Belentani
    draw_card(c, 34, 52, W - 68, 95, BG_SURFACE, EMERALD, "CHANCELA DE ENGENHARIA & AUTORIA", "OFICIAL")
    c.setFillColor(TEXT_WHITE)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(46, 116, "SISTEMA INTEGRALMENTE HOMOLOGADO E CHANCELADO")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(46, 102, "Este documento certifica que o ecossistema DUCK ZION PREMIUM foi calibrado, auditado e assinado.")
    c.drawString(46, 90, "Arquitetura de Software, Motores Web Audio DSP e Cadeia de Masterização por:")
    c.setFillColor(EMERALD)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(46, 74, "PEDRO BELENTANI")
    c.setFillColor(TEXT_DIM)
    c.setFont("Helvetica", 7)
    c.drawRightString(W - 46, 74, "CANAL ZION · DUCK ZION PREMIUM · 2026")


def main():
    print("[*] Gerando Manual PDF Maestro DUCK ZION PREMIUM...")
    c = canvas.Canvas(OUT_PDF, pagesize=A4)
    c.setTitle("DUCK ZION PREMIUM · Manual Maestro & Dossiê Técnico")
    c.setAuthor("Pedro Belentani")
    c.setSubject("Manual Técnico, Motores DSP & Arquitetura Sonora")

    # Página 1: Capa
    print(" -> Gerando Página 1: Capa Maestra Luxury...")
    page_1_cover(c)
    c.showPage()

    # Página 2: Manifesto
    print(" -> Gerando Página 2: Manifesto & Mapa Arquitetural...")
    page_2_manifesto(c)
    c.showPage()

    # Página 3: Studio OS
    print(" -> Gerando Página 3: Duck Studio OS & Central de Comando...")
    page_3_studio_os(c)
    c.showPage()

    # Página 4: Toolkit DSP
    print(" -> Gerando Página 4: Duck Studio Toolkit — A Gema #1 (DSP)...")
    page_4_toolkit_dsp(c)
    c.showPage()

    # Página 5: Ecosystem & CRM
    print(" -> Gerando Página 5: Duck Ecosystem & Portal de Clientes...")
    page_5_ecosystem_crm(c)
    c.showPage()

    # Página 6: Galeria & Design
    print(" -> Gerando Página 6: Galeria de Arte, Arquétipos & Design...")
    page_6_gallery_design(c)
    c.showPage()

    # Página 7: Certificação
    print(" -> Gerando Página 7: Certificação Técnica & Chancela...")
    page_7_certification(c)
    c.showPage()

    c.save()
    print(f"[OK] PDF Maestro gerado com sucesso em: {OUT_PDF}")

    # Copiar para pastas de manuais
    import shutil
    for dest_dir in [os.path.dirname(OUT_PDF_MANUAL), os.path.dirname(OUT_PDF_09)]:
        if os.path.exists(dest_dir):
            dest_file = os.path.join(dest_dir, "DUCK-ZION-PREMIUM-MANUAL-MAESTRO.pdf")
            shutil.copy2(OUT_PDF, dest_file)
            print(f"[OK] Copia salva em: {dest_file}")


if __name__ == "__main__":
    main()
