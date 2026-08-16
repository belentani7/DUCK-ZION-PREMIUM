# -*- coding: utf-8 -*-
"""Gera o Manual Premium das Ferramentas DUCK Studio.
Paleta: cada página um tom de verde firma #B7FF45 -> verde profundo -> rojizo -> vermelho neón.
Última página: foto noiacore (ChatGPT Image 14/08 mais recente).
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import Color, HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import os, math

W, H = A4  # 595 x 842 pt

FOTO = r"C:\Users\USER\Desktop\ChatGPT Image 14 ago 2026, 14_39_54.png"
OUT = r"C:\Users\USER\Desktop\DUCK-HERRAMIENTAS-2026-08\MANUAL-FERRAMENTAS-DUCK-PREMIUM-2026-08-14.pdf"

GALERIA = [
    (r"C:\Users\USER\Desktop\file_000000007a3081f4a91766fc0439581d.png", "NOIA / CORE"),
    (r"C:\Users\USER\Desktop\file_00000000eeec8246a3b99d9b489d6dfb (1).png", "Estúdio · voz"),
    (r"C:\Users\USER\Desktop\file_000000003d507246940e08ea63626196.png", "Arquétipo cósmico"),
    (r"C:\Users\USER\Desktop\file_000000005f3071f4b54a4cb5d66452b8.jpg", "O espaço entre você e eu 2"),
    (r"C:\Users\USER\Desktop\Gemini_Generated_Image_h043unh043unh043.png", "Model sheet · 1,94m"),
    (r"C:\Users\USER\Desktop\ChatGPT Image 14 ago 2026, 14_31_53.png", "Gema Nº 01 · Duck"),
]

VERDE = (0x07, 0x11, 0x0B)      # obsidiana
CREME = (0xF0, 0xEB, 0xDD)      # osso
FIRMA = (0xB7, 0xFF, 0x45)      # verde firma DUCK
ROXO  = (0x35, 0x0F, 0x28)      # roxo escuro (transição)
VERM  = (0xFF, 0x3B, 0x30)      # vermelho neón final


def lerp(t, a, b):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def escurecer(c, fator):
    return tuple(round(v * fator) for v in c)


def paleta(n=9):
    """Degradado verde firma -> verde profundo -> roxo -> vermelho neón."""
    pal = []
    for i in range(n):
        t = i / (n - 1)
        if t < 0.55:
            pal.append(lerp(t / 0.55, FIRMA, VERDE))
        elif t < 0.78:
            pal.append(lerp((t - 0.55) / 0.23, VERDE, ROXO))
        else:
            pal.append(lerp((t - 0.78) / 0.22, ROXO, VERM))
    return pal


def hexstr(c):
    return "#%02X%02X%02X" % c


def fundo(c, col, bandas=3):
    """Fundo premium em faixas com linhas metálicas."""
    r, g, b = col
    base = Color(r / 255, g / 255, b / 255)
    c.setFillColor(base)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    # faixas com luminância diferente
    for i in range(bandas):
        t = (i + 1) / (bandas + 1)
        f = 0.86 + 0.12 * (i % 2)
        c2 = escurecer(col, f)
        c.setFillColor(Color(c2[0] / 255, c2[1] / 255, c2[2] / 255, 0.55))
        y = H * (1 - t)
        c.rect(0, y, W, 2.2, fill=1, stroke=0)
    # linhas métricas finas
    c.setStrokeColor(Color(0.9, 0.9, 0.9, 0.14))
    c.setLineWidth(0.6)
    for i in range(1, 10):
        c.line(0, H * i / 10, W, H * i / 10)


def rodape(c, col, page, total, frase):
    """Frase de transição + número de página."""
    c.setFillColor(Color(1, 1, 1, 0.55))
    c.setFont("Helvetica-Oblique", 8.5)
    c.drawString(40, 26, frase)
    c.drawRightString(W - 40, 26, f"{page:02d} / {total}")


def titulo_pagina(c, col, titulo, sub):
    c.setFillColor(Color(1, 1, 1, 0.92))
    c.setFont("Helvetica-Bold", 26)
    c.drawString(40, H - 90, titulo)
    c.setFillColor(Color(1, 1, 1, 0.65))
    c.setFont("Helvetica", 11)
    c.drawString(40, H - 112, sub)
    c.setStrokeColor(Color(1, 1, 1, 0.35))
    c.setLineWidth(1)
    c.line(40, H - 122, W - 40, H - 122)


def paragrafos(c, col, items, y_inicio):
    """items: lista de tuplas (texto, font, size, cor-alpha, espaço)."""
    y = y_inicio
    for texto, font, size, alpha, gap in items:
        c.setFillColor(Color(1, 1, 1, alpha))
        c.setFont(font, size)
        c.drawString(40, y, texto)
        y -= gap
    return y


FRASES = [
    "Da semente verde ao calor da master… cada faixa amadurece.  →  próxima página",
    "A afinação é o silêncio que sustenta o som.  →  próxima página",
    "A potência se mede antes de gritar.  →  próxima página",
    "Cada harmônico encontra o seu lugar.  →  próxima página",
    "O fluxo desce para o vermelho só quando é definitivo.  →  próxima página",
    "O console respira: do estúdio ao coração.  →  próxima página",
    "Toda ferramenta termina em mãos.  →  a última página",
]

PAGINAS = [
    ("PORTADA", "DUCK STUDIO", None),
    ("VISÃO GERAL", "O console de estúdio local-first do produtor DUCK.", None),
    ("AFINADOR", "Tuner — afinação e escala em tempo real.", None),
    ("DETECTOR DE POTÊNCIA", "Power Detector — mede antes de gritar.", None),
    ("CATÁLOGO HARMÔNICO", "Harmonic Catalog — cada parcial no seu lugar.", None),
    ("MASTERING RACK", "Rack de master — do verde ao vermelho definitivo.", None),
    ("MIXER · SEQUENCER · AGENTE", "Faders, pads e o agente DUCK em português.", None),
]


def main():
    pal = paleta(len(PAGINAS))
    n = len(PAGINAS)
    c = canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("Manual Premium — Ferramentas DUCK Studio")
    c.setAuthor("NOIACORE · Pedro Belentani")
    c.setSubject("Ferramentas DUCK Studio: tuner, power, harmônicos, master, mixer")

    # Páginas de conteúdo
    dados = {
        "VISÃO GERAL": [
            ("Console de estúdio local-first para Windows 11.", "Helvetica", 12, 0.9, 20),
            ("Inicia rápido, opera sem API key e segue útil offline.", "Helvetica", 12, 0.9, 20),
            ("Base de conhecimento PT-BR + motor de rascunho.", "Helvetica", 12, 0.9, 20),
            ("Integração MIDI com FL Studio (host VST3 e render).", "Helvetica", 12, 0.9, 20),
            ("Ollama local opcional: sem chave, sem envio de dados.", "Helvetica", 12, 0.9, 20),
            ("Verdade de estado: detectado, instalado, testado, pronto.", "Helvetica", 12, 0.9, 20),
            ("WCAG 2.2 AA · teclado completo · consentimento explícito.", "Helvetica", 12, 0.9, 20),
        ],
        "AFINADOR": [
            ("Altura e afinação em tempo real para voz e instrumentos.", "Helvetica", 12, 0.9, 20),
            ("Acompanha escala, cents de desvio e referência.", "Helvetica", 12, 0.9, 20),
            ("Visualização por faixa: verde = afinado, âmbar = atenção.", "Helvetica", 12, 0.9, 20),
            ("Entrada mic/Hi-Z com ganho e impedância adequados.", "Helvetica", 12, 0.9, 20),
            ("Regra DUCK: “pare de mixar no escuro” — afinado primeiro.", "Helvetica-Oblique", 11.5, 0.75, 20),
        ],
        "DETECTOR DE POTÊNCIA": [
            ("Mede o nível antes de empurrar o fader.", "Helvetica", 12, 0.9, 20),
            ("Indica headroom, clipping e zona segura de mix.", "Helvetica", 12, 0.9, 20),
            ("Vermelho só para gravação, clipping e ação destrutiva.", "Helvetica", 12, 0.9, 20),
            ("Âmbar para atenção; verde para sinal e foco.", "Helvetica", 12, 0.9, 20),
            ("Medição honesta: nada de 60 fps, latência ou RAM inventadas.", "Helvetica", 12, 0.9, 20),
        ],
        "CATÁLOGO HARMÔNICO": [
            ("Mapa de parciais e séries harmônicas do material.", "Helvetica", 12, 0.9, 20),
            ("Cada harmônico encontra o seu lugar na faixa.", "Helvetica", 12, 0.9, 20),
            ("Base de conhecimento especialista offline em PT-BR.", "Helvetica", 12, 0.9, 20),
            ("Busca textual local (FTS5) para consulta imediata.", "Helvetica", 12, 0.9, 20),
            ("Proveniência: nenhum material sem licença comprovada.", "Helvetica", 12, 0.9, 20),
        ],
        "MASTERING RACK": [
            ("Cadeia final de master com controle explícito.", "Helvetica", 12, 0.9, 20),
            ("Do verde (dinâmica) ao vermelho definitivo (assinatura).", "Helvetica", 12, 0.9, 20),
            ("Medidores de dB, BPM e tempo com tipografia DM Mono.", "Helvetica", 12, 0.9, 20),
            ("Exportação local controlada pelo usuário.", "Helvetica", 12, 0.9, 20),
            ("Regra: nenhuma função central depende de API paga.", "Helvetica", 12, 0.9, 20),
        ],
        "MIXER · SEQUENCER · AGENTE": [
            ("Faders verticais com trilho, escala em dB e cap tátil.", "Helvetica", 12, 0.9, 20),
            ("Pads e sequenciador para rascunhos rápidos.", "Helvetica", 12, 0.9, 20),
            ("Agente flutuante DUCK em português brasileiro.", "Helvetica", 12, 0.9, 20),
            ("Controle bidirecional com FL Studio por MIDI virtual.", "Helvetica", 12, 0.9, 20),
            ("Estética: preto profundo, creme técnico, verde elétrico.", "Helvetica", 12, 0.9, 20),
        ],
    }
    for idx, (titulo, sub, foto) in enumerate(PAGINAS):
        col = pal[idx]
        fundo(c, col)
        if idx == 0:
            # PORTADA
            c.setFillColor(Color(0.02, 0.05, 0.03))
            c.setFont("Helvetica-Bold", 40)
            c.drawCentredString(W / 2, H - 250, "DUCK STUDIO")
            c.setFillColor(Color(0.02, 0.05, 0.03, 0.8))
            c.setFont("Helvetica", 16)
            c.drawCentredString(W / 2, H - 280, "MANUAL PREMIUM DAS FERRAMENTAS")
            c.drawCentredString(W / 2, H - 302, "produtor · engenheiro · artista")
            c.setFillColor(Color(1, 1, 1, 0.85))
            c.setFont("Helvetica-Bold", 22)
            c.drawCentredString(W / 2, H - 380, "NOIACORE")
            c.setFillColor(Color(0.02, 0.05, 0.03, 0.85))
            c.setFont("Helvetica", 11)
            c.drawCentredString(W / 2, H - 402, "© 2026 Pedro Belentani · Aracaju · Sergipe · Brasil")
            rodape(c, col, 1, n, "Abra a primeira ferramenta.  →  próximo")
            c.showPage()
        else:
            titulo_pagina(c, col, titulo, sub)
            y = H - 150
            for texto, font, size, alpha, gap in dados.get(titulo, [("", "Helvetica", 12, 0.9, 20)]):
                c.setFillColor(Color(1, 1, 1, alpha))
                c.setFont(font, size)
                c.drawString(42, y, texto)
                y -= gap
            rodape(c, col, idx + 1, n, FRASES[idx - 1])
            c.showPage()

    # Páginas galería full-bleed (uma imagem por página, ocupando quase todo o espaço)
    total_paginas = len(PAGINAS) + len(GALERIA) + 1
    m = len(PAGINAS)
    for gi, (path, label) in enumerate(GALERIA):
        col = pal[m + gi] if (m + gi) < len(pal) else pal[-1]
        fundo(c, col)
        if os.path.exists(path):
            try:
                img = ImageReader(path)
                iw, ih = img.getSize()
                # ocupar todo o espaço útil (margem pequena), mantendo proporção
                margem = 16
                escalaw = (W - 2 * margem) / iw
                escalah = (H - 2 * margem) / ih
                escala = min(escalaw, escalah)
                dw = iw * escala
                dh = ih * escala
                x = (W - dw) / 2
                y = (H - dh) / 2
                # marco premium full-bleed
                c.setStrokeColor(Color(1, 1, 1, 0.35))
                c.setLineWidth(1)
                c.rect(x - 3, y - 3, dw + 6, dh + 6, fill=0, stroke=1)
                c.drawImage(img, x, y, dw, dh, preserveAspectRatio=True)
            except Exception as e:
                c.setFillColor(Color(1, 1, 1, 0.8))
                c.setFont("Helvetica", 12)
                c.drawCentredString(W / 2, H / 2, f"imagem não carregada: {path} ({e})")
        # rótulo + numeração
        c.setFillColor(Color(0.02, 0.05, 0.03, 0.75))
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(W / 2, 34, label)
        c.setFillColor(Color(1, 1, 1, 0.55))
        c.setFont("Helvetica", 8.5)
        c.drawRightString(W - 40, 26, f"{m + gi + 1:02d} / {total_paginas}")
        c.showPage()

    # Página final: NOIACORE (última imagem da galeria em full-bleed)
    col = pal[-1]
    fundo(c, col)
    ultima = GALERIA[-1][0]
    if os.path.exists(ultima):
        try:
            img = ImageReader(ultima)
            iw, ih = img.getSize()
            margem = 16
            escala = min((W - 2 * margem) / iw, (H - 2 * margem) / ih)
            dw = iw * escala
            dh = ih * escala
            x = (W - dw) / 2
            y = (H - dh) / 2
            c.setStrokeColor(Color(1, 1, 1, 0.35))
            c.setLineWidth(1)
            c.rect(x - 3, y - 3, dw + 6, dh + 6, fill=0, stroke=1)
            c.drawImage(img, x, y, dw, dh, preserveAspectRatio=True)
        except Exception as e:
            pass
    c.setFillColor(Color(0.02, 0.05, 0.03, 0.75))
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(W / 2, 34, "NOIACORE · PEDRO BELENTANI")
    c.setFillColor(Color(1, 1, 1, 0.55))
    c.setFont("Helvetica", 8.5)
    c.drawRightString(W - 40, 26, f"{total_paginas:02d} / {total_paginas}")
    c.showPage()

    c.save()
    print("OK:", OUT)
    print("TAMANHO:", os.path.getsize(OUT), "bytes,", total_paginas, "páginas")


if __name__ == "__main__":
    main()
