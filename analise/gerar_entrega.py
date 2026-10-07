from __future__ import annotations

import json
from collections import Counter
from html import escape
from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import Drawing, Line, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable, Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "analise" / "evidencias"
DELIVERY = ROOT / "entrega"
PDF_DIR = ROOT / "output" / "pdf"
AUDIT = json.loads((EVIDENCE / "auditoria_calculos.json").read_text(encoding="utf-8"))
PARAMS = {p["column"]: p for p in AUDIT["parameters"]}
PAGE_WIDTH, PAGE_HEIGHT = A4
CONTENT_WIDTH = PAGE_WIDTH - 88
INK = colors.HexColor("#242B2C")
GREEN = colors.HexColor("#146B50")
RED = colors.HexColor("#A44232")
MUTED = colors.HexColor("#596365")
RULE = colors.HexColor("#D9DFDC")
LIGHT = colors.HexColor("#F1F4F2")


def num(value, digits=4):
    if value is None:
        return "nao avaliavel"
    if isinstance(value, str):
        return value if value else "vazio"
    if abs(value) > 1e8 or (value != 0 and abs(value) < 1e-8):
        return f"{value:.5e}".replace(".", ",")
    return f"{value:.{digits}f}".rstrip("0").rstrip(".").replace(".", ",")


def generate_audit():
    template = (ROOT / "analise" / "conteudo_auditoria.md").read_text(encoding="utf-8")
    dates = []
    for i, r in enumerate(PARAMS["F"]["records"]):
        row = AUDIT["summary"]["collection_rows"][i]
        text_count = sum(p["records"][i]["tratamento"] == "texto_decimal" for p in PARAMS.values())
        absent = sum(p["records"][i]["tratamento"] == "ausente" for p in PARAMS.values())
        dates.append(f"| {row} | {r['data']} | {41-text_count-absent} | {text_count} | {absent} |")
    collections = "\n".join([
        "| Linha | Data | Numeros nativos | Textos decimais | Ausentes |",
        "| --- | --- | --- | --- | --- |", *dates,
    ])
    rows = [
        "| Coluna / parametro | Unidade | LI | LS | N interpretado | Textos | Media | Desvio pop. | Cp arit. | Cpk arit. |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    details = []
    for p in PARAMS.values():
        m = p["normalized_math"]
        types = p["types"]
        counts = p["counts_against_file_limits"]
        rows.append(
            f"| {p['column']} / {p['name']} | {p['unit']} | {num(p['low'])} | {num(p['high'])} | "
            f"{m['n']} | {types.get('texto_decimal', 0)} | {num(m['mean'])} | "
            f"{num(m['sd_population'])} | {num(m['cp_arithmetic'])} | {num(m['cpk_arithmetic'])} |"
        )
        issues = "; ".join(p["issues"]) or "nenhum problema de tipo/limite/zero desvio identificado nesta coluna"
        if p["low"] is not None and p["high"] is not None and p["low"] >= p["high"]:
            interpretation = "Faixa degenerada/invertida: os indices acima sao apenas reproducao da conta, sem interpretacao de capacidade."
        elif p["low"] is None or p["high"] is None:
            interpretation = "Limite unilateral ou incompleto: nenhum Cp bilateral foi inventado."
        else:
            interpretation = "Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo."
        details.extend([
            f"#### {p['column']} | {p['name']} | identificador {p['source_number']}", "",
            f"- Origem: `{p['column']}9:{p['column']}12` e `{p['column']}17:{p['column']}33`; unidade: {p['unit']}; limites cadastrados: {num(p['low'])} / {num(p['high'])}.",
            f"- Tipos: {types.get('numero', 0)} numeros nativos, {types.get('texto_decimal', 0)} textos decimais, {types.get('ausente', 0)} ausentes.",
            f"- Interpretados: n={m['n']}; minimo={num(m['min'], 10)}; maximo={num(m['max'], 10)}; media={num(m['mean'], 10)}; desvio populacional={num(m['sd_population'], 10)}; desvio amostral={num(m['sd_sample'], 10)}.",
            f"- Salvos no arquivo: media={num(p['cached']['mean'], 10)}; desvio populacional={num(p['cached']['sd_population'], 10)}; Cp={num(p['cached']['cp_arithmetic'], 10)}; Cpk={num(p['cached']['cpk_arithmetic'], 10)}; status={p['cached']['status']!r}.",
            f"- Conta interpretada: Cp={num(m['cp_arithmetic'], 10)}; Cpk={num(m['cpk_arithmetic'], 10)}. {interpretation}",
            f"- Comparacao inclusiva com a faixa do arquivo: {counts.get('dentro', 0)} dentro, {counts.get('abaixo', 0)} abaixo, {counts.get('acima', 0)} acima, {counts.get('nao_avaliado', 0)} nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.",
            f"- Soma de frequencias salvas do histograma: {num(p['histogram_saved_sum'])}; numeros nativos disponiveis: {types.get('numero', 0)}. Revisar caudas/limites antes de interpretar a figura.",
            f"- Observacoes: {issues}.", "",
        ])
    generated = template.replace("{{COLETAS}}", collections).replace("{{TABELA_PARAMETROS}}", "\n".join(rows)).replace("{{DETALHE_PARAMETROS}}", "\n".join(details))
    assert "{{" not in generated
    (DELIVERY / "AUDITORIA_TECNICA_MSA.md").write_text(generated, encoding="utf-8")


class Graphic(Flowable):
    def __init__(self, drawing):
        super().__init__()
        self.drawing = drawing
        self.width = drawing.width
        self.height = drawing.height

    def draw(self):
        renderPDF.draw(self.drawing, self.canv, 0, 0)


def history_chart():
    width, height = CONTENT_WIDTH, 195
    d = Drawing(width, height)
    left, right, bottom, top = 36, width - 12, 32, height - 22
    for value in range(0, 41, 10):
        y = bottom + (top-bottom) * value / 40
        d.add(Line(left, y, right, y, strokeColor=RULE, strokeWidth=0.5))
        d.add(String(left-7, y-3, str(value), fontName="Arial", fontSize=8, textAnchor="end", fillColor=MUTED))
    d.add(String(0, top+4, "s", fontName="Arial", fontSize=9, fillColor=MUTED))
    for col, color in [("BD", GREEN), ("BT", RED)]:
        points = [(left + (right-left)*i/16, bottom + (top-bottom)*r["valor_interpretado"]/40)
                  for i, r in enumerate(PARAMS[col]["records"])]
        for a, b in zip(points, points[1:]):
            d.add(Line(*a, *b, strokeColor=color, strokeWidth=2))
        for x, y in points:
            d.add(Line(x-2, y, x+2, y, strokeColor=color, strokeWidth=3))
    for index, label in [(0, "25/08"), (9, "31/08"), (10, "17/09"), (16, "29/09")]:
        x = left + (right-left)*index/16
        d.add(String(x, 13, label, fontName="Arial", fontSize=8, textAnchor="middle", fillColor=MUTED))
    d.add(String(left, height-8, "BD | Tempo de Resfriamento", fontName="Arial-Bold", fontSize=9, fillColor=GREEN))
    d.add(String(left+230, height-8, "BT | Retardo resfriamento", fontName="Arial-Bold", fontSize=9, fillColor=RED))
    return Graphic(d)


def generate_pdf():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))
    pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold", italic="Arial", boldItalic="Arial-Bold")
    styles = {
        "title": ParagraphStyle("title", fontName="Arial-Bold", fontSize=22, leading=27, textColor=INK, spaceAfter=12),
        "deck": ParagraphStyle("deck", fontName="Arial", fontSize=12, leading=17, textColor=MUTED, spaceAfter=15),
        "h": ParagraphStyle("h", fontName="Arial-Bold", fontSize=12, leading=16, textColor=GREEN, spaceBefore=10, spaceAfter=6, keepWithNext=True),
        "body": ParagraphStyle("body", fontName="Arial", fontSize=10.5, leading=15, textColor=INK, spaceAfter=7),
        "small": ParagraphStyle("small", fontName="Arial", fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=5),
        "cell": ParagraphStyle("cell", fontName="Arial", fontSize=9, leading=12, textColor=INK),
        "thead": ParagraphStyle("thead", fontName="Arial-Bold", fontSize=9, leading=12, textColor=GREEN),
        "question": ParagraphStyle("question", fontName="Arial", fontSize=10.5, leading=15, textColor=INK, leftIndent=10, borderColor=RULE, borderWidth=0.6, borderPadding=8, spaceBefore=5, spaceAfter=12),
    }
    story = []

    def p(text, style="body"):
        story.append(Paragraph(text, styles[style]))

    def h(text):
        p(text, "h")

    def q(text):
        p(text, "question")

    def title(number, text, deck):
        if number > 1:
            story.append(PageBreak())
        p(f"{number:02d} / {text}", "title")
        p(deck, "deck")

    def table(headers, rows, widths=None):
        content = [[Paragraph(escape(str(v)), styles["thead"]) for v in headers]]
        content.extend([[Paragraph(escape(str(v)).replace("\n", "<br/>"), styles["cell"]) for v in row] for row in rows])
        t = Table(content, colWidths=widths or [CONTENT_WIDTH/len(headers)]*len(headers), repeatRows=1, hAlign="LEFT")
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
            ("LINEBELOW", (0, 0), (-1, 0), 0.7, GREEN),
            ("LINEBELOW", (0, 1), (-1, -1), 0.4, RULE),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        story.extend([t, Spacer(1, 8)])

    title(1, "A entrevista que define o MVP", "MSA / SENAI | 06 de outubro de 2026\n<br/>Roteiro de levantamento, com evidências dos materiais recebidos.")
    h("O objetivo da reunião")
    p("Entender como uma coleta vira uma decisão, identificar necessidades não explícitas e combinar um piloto verificável. <b>Amanhã não é a apresentação final do protótipo.</b>")
    q('"Estudamos os materiais e queremos validar o fluxo com vocês. O que uma solução realmente útil precisa mudar no dia a dia, além do que já está escrito no desafio?"')
    h("Cinco perguntas essenciais")
    for text in [
        "<b>1. Prioridade:</b> qual problema precisa melhorar primeiro, o que falta no desafio e como reconheceremos sucesso?",
        "<b>2. Caso real:</b> contem a última coleta e liberação, do operador à Engenharia, incluindo divergências e retrabalho.",
        "<b>3. Piloto:</b> qual máquina, processo, produto e receita devemos usar? Quais materiais representam o mesmo fluxo?",
        "<b>4. Regras:</b> quais campos são ajuste ou medição; quem aprova unidades, limites, método de análise e liberação?",
        "<b>5. Viabilidade:</b> em qual aparelho/rede será usado, qual acesso é permitido e o que deve ser demonstrado ao final?",
    ]:
        p(text)
    h("Como usar o tempo")
    table(["Duração", "Foco"], [
        ["15 min", "Cinco perguntas, um exemplo BF e confirmação das decisões."],
        ["30 min", "3 contexto + 7 fluxo + 8 regras + 7 produção/uso + 5 fechamento."],
        ["45 min", "Acrescentar exceções e viabilidade de acesso com TI/manutenção."],
    ], [65, CONTENT_WIDTH-65])
    p("Uma pessoa conduz, uma registra, uma acompanha o tempo. Confirmar antes se fotos/anotações são permitidas. Começar verificando se o XLSX é uma cópia didática ou o método operacional real.", "small")

    title(2, "Uma evidência para levar", "Tempo destacar | aba Selo, coluna BF | exemplo de até 90 segundos.")
    table(["Material auditado", "Quantidade"], [
        ["Parâmetros / coletas", "41 / 17"],
        ["Campos preenchidos / possíveis", "683 / 697"],
        ["Números / textos numéricos", "562 / 121 (17,7% dos preenchidos)"],
        ["Resumos comparáveis verificados", "224 / 224 coincidem com o cálculo sobre os números nativos"],
    ], [CONTENT_WIDTH*0.55, CONTENT_WIDTH*0.45])
    h("O que muda em BF17:BF33")
    table(["Grandeza", "Somente números nativos", "17 valores interpretados"], [
        ["Valores utilizados", "7 números: todos 0,9", "7 em 0,8 + 10 em 0,9"],
        ["Média (s)", "0,9", "0,8588235294"],
        ["Desvio populacional (s)", "Zero matemático; resíduo salvo ~1,11e-16", "0,0492152957"],
        ["Cp / Cpk aritméticos", "~1,50 x 10^14 / -0,3333", "0,3386 / 0,2789"],
    ], [105, (CONTENT_WIDTH-105)/2, (CONTENT_WIDTH-105)/2])
    p("A fórmula de referência ignora textos decimais. Nas linhas 25 e 26, <b>as 41 entradas de cada coleta</b> são texto: duas coletas inteiras de 31/08 ficam fora dos resumos. As fontes não foram alteradas.")
    q('"Como vocês querem validar vírgula/ponto e mostrar quais observações entraram na análise? Esses tempos são setpoints ou valores realmente medidos?"')
    h("A conclusão correta")
    p("O Cp gigantesco vem de divisão por resíduo numérico em dados constantes. Não é qualidade extraordinária. Interpretar os textos mostra uma diferença aritmética, mas <b>não homologa um estudo de capacidade</b>.")
    p("Todos os 17 valores de BF estão na faixa cadastrada 0,8:0,9 s. Estar dentro dessa faixa não demonstra, sozinho, capacidade futura. Não afirmar que a máquina é incapaz ou que o processo industrial está errado.", "small")
    p('Base: XLSX, BF17:BF33 e BF69:BF75. <link href="https://support.microsoft.com/en-au/excel/functions/stdevp-function" color="#146B50">Microsoft: STDEVP e tratamento de textos em referências.</link>', "small")

    title(3, "Regras antes dos indicadores", "Perguntas para Engenharia / qualidade. Não automatizar um limite ambíguo.")
    table(["Evidência na cópia", "O que confirmar"], [
        ["BH10:BH11 = 80 / 75 s", "Limites trocados, receita diferente ou outra semântica? Não inverter sozinho."],
        ["Z1, Z9, Z10, Z18 com 0 / 0", "Zona inativa, regra especial ou limite não cadastrado?"],
        ["Pressão 6,5 bar; vácuo -600 mm/Hg; outro limite vazio", "Regra unilateral? Qual desigualdade, unidade e referência?"],
        ["AZ, BP e CD constantes", "Setpoint ou medição? Resolução/precisão? Não dividir por zero."],
        ["CF17 / CH17 vazios, mas 10 registros posteriores", "O resumo deve procurar dados válidos, não depender da primeira linha."],
    ], [CONTENT_WIDTH*0.43, CONTENT_WIDTH*0.57])
    h("Normalidade: pedir um caso completo")
    p("Na aba de teste, B10:B1009 está vazio; n=0. K5 é um resultado literal e AC tem <b>1.000 células numéricas sem fórmula</b> para a CDF reversa. O <b>OK de G93 é texto</b>, sem ligação calculada com o teste. A cópia não comprova normalidade automática.")
    q('"O teste é feito aqui ou em outro software? Podem fornecer dados, método, resultado e decisão de um estudo validado pela Engenharia?"')
    h("O protocolo que falta definir")
    p("Característica de qualidade versus ajuste; frequência e subgrupos; estabilidade; estimador de sigma; normalidade; dados suficientes; arredondamento; limites por receita; regra de exclusão e responsável técnico. A meta 1,33 aparece em U6: confirmar sua aplicabilidade.")
    p("Não trocar STDEVP por STDEV e chamar isso de correção completa. Não confundir limite de especificação com limite estatístico de controle. A decisão de liberação precisa de regra, contexto e responsável.", "small")
    p('Referências: <link href="https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm" color="#146B50">NIST: capacidade</link>; <link href="https://www.itl.nist.gov/div898/handbook/eda/section3/eda35e.htm" color="#146B50">NIST: Anderson-Darling</link>; <link href="https://blog.minitab.com/en/blog/process-capability-statistics-cpk-vs-ppk" color="#146B50">Minitab: variação dentro e global</link>.', "small")

    title(4, "O contexto muda a leitura", "Os registros mudam entre agosto e setembro. O motivo ainda não foi informado.")
    story.append(history_chart())
    p("Eixo horizontal: ordem das 17 coletas, não tempo proporcional. Os textos decimais foram interpretados para incluir as duas linhas de 31/08. Fonte: BD17:BD33 e BT17:BT33.", "small")
    table(["Período", "Resfriamento BD", "Retardo BT"], [
        ["10 coletas de agosto", "35 s", "4 s"],
        ["17/09", "20 s", "7 s"],
        ["6 coletas seguintes", "15 s", "30 s"],
        ["Faixa cadastrada", "35:36 s", "4:5 s"],
    ], [CONTENT_WIDTH/3]*3)
    q('"O que mudou? Produto, receita, condição da máquina ou forma de registrar? Como aquecimento e setup são separados de produção estável?"')
    h("Outros sinais para contextualizar")
    p("Em 21/09, Z13 registra 94 °C e Z14, 101 °C, abaixo dos demais registros dessas colunas. A foto de aquecimento mostra duas colunas coloridas e valores muito diferentes; a legenda e a fase precisam ser confirmadas. Não apagar observações por parecerem estranhas.")
    p("Material, espessura, % Scrap e lote estão vazios nas 17 linhas. Não há horário, operador ou receita em cada coleta. Sem essas chaves, não é defensável juntar tudo como um único processo estável.")
    h("Pergunta sobre o histórico")
    q('"Quando um limite ou receita muda, os dados antigos continuam ligados à versão original? Quem registra a mudança e decide quando é necessária nova análise/liberação?"')

    title(5, "Produção, paradas e perdas", "Perguntas para operação / liderança. As fotos mostram mais de uma fonte e contexto.")
    img = Image(str(EVIDENCE / "pitch_board_detalhe.png"))
    aspect = img.imageHeight / img.imageWidth
    img.drawWidth = CONTENT_WIDTH * 0.84
    img.drawHeight = img.drawWidth * aspect
    img.hAlign = "LEFT"
    story.append(img)
    p("Trecho do Pitch Board de 01/10. Realizado legível: 72 + 216 + 180 + 144 + 180 + 72 + 108 + 180 = <b>1.152 peças</b>. Planejado parcialmente ambíguo; não foi calculado percentual de atingimento.", "small")
    h("Contagem: o denominador precisa existir")
    p("A IHM Vacuum Center mostra 18 ciclos; outra tela, zero aprovadas/reprovadas. Confirmar peças por ciclo/cavidades, período, reset e se 'produzido' é bruto ou bom. Zero na foto não significa zero no turno; campo vazio não significa zero confirmado.")
    h("Parada: um episódio, vários sinais")
    p("A tela Siemens apresenta seis alarmes. Alarmes próximos podem ser da mesma parada. Perguntar qual sinal marca início/fim, como tratar estação versus linha, setup, pausas planejadas, pequenas paradas, sobreposição e motivo ainda desconhecido.")
    h("Perdas: não misturar unidades")
    p("O formulário de 28/09 registra 0,200 kg. Não subtrair kg de peças nem calcular percentual sem produção válida. Separar perda de material, refugo e retrabalho, evitando dupla contagem.")
    q('"Podem mostrar uma parada encerrada e um apontamento de perda, com início/fim, motivo, unidade e ligação à ordem/produto? Quem corrige um registro incompleto?"')
    p("Fontes: fotos 12.13.44, 12.14.06, 12.17.22 e 12.20.02. Observações manuscritas ambíguas permanecem pendentes de confirmação.", "small")

    title(6, "Uso real e acesso permitido", "Perguntas para operador, manutenção e TI. A integração deve respeitar a operação.")
    h("Onde o sistema será usado?")
    q('"Tablet compartilhado, celular ou computador? Há rede no posto? Quem se identifica e o que precisa funcionar quando a conexão cai?"')
    p("Confirmar permissões de operador/liderança/Engenharia; tempo disponível para apontamento; necessidade de correção auditada; sincronização sem duplicar; resolução de conflito; acesso ao histórico; retenção, backup e suporte.")
    h("O que podemos ler, sem interferir no controle?")
    p("As fotos mostram Siemens e KVIEW, mas não comprovam protocolo ou API. Pedir modelos exatos, tags autorizadas, exportações/históricos existentes, arquitetura de rede e responsável pela liberação de acesso somente leitura.")
    q('"Já existe exportação ou integração autorizada? Para o MVP, a empresa prefere leitura direta, arquivo importado ou entrada digital validada? Quem acompanha o teste?"')
    h("Unidade e origem são parte do dado")
    p("Na foto do manômetro, a escala parece kgf/cm², mas está parcialmente encoberta; a planilha usa bar. Se confirmado, 6,6 kgf/cm² = 6,472389 bar. É um exemplo condicional, não prova de desvio. Confirmar instrumento, unidade, referência, sentido do vácuo, resolução e calibração.")
    p('Conversão: <link href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8" color="#146B50">NIST, fatores de unidades</link>. Leitura da foto é aproximada e não substitui medição.', "small")
    h("OCR: revisão, não aprovação automática")
    p("Confirmar se fotos industriais podem ser armazenadas ou enviadas à nuvem. Uma leitura precisa de campo, unidade, evidência e revisão quando ambígua. Guardar valor original e alteração; nunca liberar produção só porque o OCR conseguiu ler uma tela.")
    h("Promessa defensável")
    p("Demonstrar o fluxo com entrada validada/importação é viável sem confirmar acesso ao CLP. OCR e coleta direta podem ser diferenciais se houver autorização, exemplos e tempo para validá-los. Não prometer comandos de máquina.")

    title(7, "O que entra no MVP", "Recomendação provisória: confirmar com MSA/SENAI, não tratar sugestões como requisitos aprovados.")
    h("O mínimo escrito no desafio")
    p("Cadastros de máquina/processo/produto e parâmetros; limites/metas; registro digital; quantidade e período; paradas com duração/motivo; refugos/perdas/motivo; armazenamento estruturado; vínculos; histórico; dashboard; desvios visuais; fluxo demonstrado por protótipo. São <b>13 itens mínimos</b> identificados nas imagens.")
    h("Os opcionais são escolhas, não uma obrigação de fazer tudo")
    p("OCR, CLP/IHM, IoT, QR, três tipos de alertas, análise de motivos, liberação pela Engenharia e seu histórico, mobile, tempo real, comparação, exportação, IA e API. Confirmar quais diferenciais têm peso na avaliação.")
    h("Um fluxo prioritário para validar")
    table(["Etapa", "Decisão a combinar"], [
        ["1. Identificar", "Máquina > processo > produto/receita/ordem, conforme o piloto."],
        ["2. Registrar", "Valores, unidade, origem, autor, instante e versão do limite."],
        ["3. Validar", "Separar inválido/ausente, desvio e estudo não avaliável."],
        ["4. Analisar", "Histórico temporal e fila de análise, sem misturar condições."],
        ["5. Decidir", "Objeto liberado, responsável, justificativa e registro da decisão."],
    ], [85, CONTENT_WIDTH-85])
    q('"O objeto liberado é máquina, receita, início de produção, ordem ou lote? Quem pode aprovar? O que exige nova análise? Que exceção precisa existir?"')
    h("Aceite: exemplos que vocês podem combinar")
    p("Vírgula/ponto equivalentes; vazio não vira zero; primeira linha vazia não esconde dados; limite invertido bloqueia avaliação; desvio zero é explicado; receita nova preserva histórico; reset não gera quantidade negativa; alarmes não multiplicam uma parada; correção fica rastreável.")
    p("Não adicionar OEE/IA só para impressionar. Antes, validar dados e definições. Economia e ROI dependem de baseline medido, não de percentuais inventados.", "small")

    title(8, "Sair com decisões, não suposições", "Últimos minutos: repetir o entendimento e registrar o que ficou pendente.")
    q('"Para confirmar: o piloto será ____, o fluxo prioritário será ____, a Engenharia validará ____, e demonstraremos ____ até ____. O que entendemos errado ou deixamos de fora?"')
    table(["Decisão", "Resposta / responsável / prazo"], [
        ["Dor prioritária e sucesso", "___________________________________\n___________________________________"],
        ["Máquina / produto / receita-piloto", "___________________________________\n___________________________________"],
        ["Campos, unidades e limites", "___________________________________\n___________________________________"],
        ["Análise e liberação", "___________________________________\n___________________________________"],
        ["Quantidade, paradas e perdas", "___________________________________\n___________________________________"],
        ["Usuários / aparelhos / offline / acesso", "___________________________________\n___________________________________"],
        ["Escopo, diferencial e aceite final", "___________________________________\n___________________________________"],
        ["Exemplo de dados / próxima validação", "___________________________________\n___________________________________"],
    ], [CONTENT_WIDTH*0.43, CONTENT_WIDTH*0.57])
    h("Pedir um exemplo anonimizado completo")
    p("Coleta com contexto, receita/limites, parada encerrada, perda, estudo e decisão. Confirmar prazo final, duração da demonstração, critérios/pesos de avaliação e se dados importados/simulados identificados são aceitos.")
    p("Pendência precisa de dono e prazo. Não transformar resposta ausente em requisito inventado.")
    p("Material de apoio: AUDITORIA_TECNICA_MSA.md; auditoria_41_parametros.csv; medicoes_697_campos.csv; ROTEIRO_ENTREVISTA_MSA.md (editável). Auditoria em 05/10/2026, sobre a cópia recebida. Dois PDFs anteriores e nove fotos foram revisados. Arquivos de origem preservados; cálculos não equivalem a homologação industrial.", "small")

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.6)
        canvas.line(44, 40, PAGE_WIDTH-44, 40)
        canvas.setFillColor(MUTED)
        canvas.setFont("Arial", 8)
        canvas.drawString(44, 25, "MSA / SENAI | Preparação da entrevista | análise em 05/10/2026")
        canvas.drawRightString(PAGE_WIDTH-44, 25, str(doc.page))
        canvas.setFillColor(GREEN)
        canvas.setFont("Arial-Bold", 8)
        canvas.drawString(44, PAGE_HEIGHT-30, "EVIDÊNCIAS > PERGUNTAS > DECISÕES")
        canvas.restoreState()

    path = PDF_DIR / "Preparacao_Entrevista_MSA_06-10-2026.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=44, leftMargin=44,
                            topMargin=54, bottomMargin=54,
                            title="Preparação da entrevista MSA / SENAI - 06/10/2026",
                            author="Preparação de Kauan", subject="Auditoria de materiais e levantamento de requisitos")
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(path)


if __name__ == "__main__":
    generate_audit()
    generate_pdf()
