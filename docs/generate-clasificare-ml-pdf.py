#!/usr/bin/env python3
"""Generează docs/Clasificare-ML.pdf — stil identic cu HL7-FHIR.pdf."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT = Path(__file__).resolve().parent / "Clasificare-ML.pdf"


def register_fonts():
    fonts = {
        "regular": "Helvetica",
        "bold": "Helvetica-Bold",
        "italic": "Helvetica-Oblique",
        "mono": "Courier",
    }

    candidates = [
        ("Calibri", "calibri.ttf", "calibrib.ttf", "calibrii.ttf"),
        ("Arial", "arial.ttf", "arialbd.ttf", "ariali.ttf"),
    ]
    base = Path("C:/Windows/Fonts")
    for family, reg, bold, ital in candidates:
        if (base / reg).exists():
            pdfmetrics.registerFont(TTFont(family, str(base / reg)))
            fonts["regular"] = family
            if (base / bold).exists():
                pdfmetrics.registerFont(TTFont(f"{family}-Bold", str(base / bold)))
                fonts["bold"] = f"{family}-Bold"
            if (base / ital).exists():
                pdfmetrics.registerFont(TTFont(f"{family}-Italic", str(base / ital)))
                fonts["italic"] = f"{family}-Italic"
            pdfmetrics.registerFontFamily(
                family,
                normal=family,
                bold=fonts["bold"],
                italic=fonts["italic"],
            )
            break

    mono_candidates = [("Consolas", "consola.ttf"), ("CourierNew", "cour.ttf")]
    for family, reg in mono_candidates:
        if (base / reg).exists():
            pdfmetrics.registerFont(TTFont(family, str(base / reg)))
            fonts["mono"] = family
            break

    return fonts


FONTS = register_fonts()


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName=FONTS["bold"],
            fontSize=20,
            leading=24,
            alignment=TA_LEFT,
            textColor=colors.black,
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontName=FONTS["regular"],
            fontSize=11,
            leading=15,
            alignment=TA_LEFT,
            textColor=colors.black,
            spaceAfter=14,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName=FONTS["bold"],
            fontSize=14,
            leading=18,
            spaceBefore=12,
            spaceAfter=6,
            textColor=colors.black,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName=FONTS["bold"],
            fontSize=12,
            leading=16,
            spaceBefore=8,
            spaceAfter=4,
            textColor=colors.black,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName=FONTS["regular"],
            fontSize=10.5,
            leading=14,
            alignment=TA_LEFT,
            textColor=colors.black,
            spaceAfter=6,
        ),
        "td_label": ParagraphStyle(
            "TDLabel",
            parent=base["Normal"],
            fontName=FONTS["bold"],
            fontSize=10.5,
            leading=14,
            textColor=colors.black,
        ),
        "td": ParagraphStyle(
            "TD",
            parent=base["Normal"],
            fontName=FONTS["regular"],
            fontSize=10.5,
            leading=14,
            textColor=colors.black,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["Code"],
            fontName=FONTS["mono"],
            fontSize=8.5,
            leading=11.5,
            backColor=colors.HexColor("#f4f4f4"),
            borderPadding=6,
            textColor=colors.black,
            spaceAfter=8,
            spaceBefore=4,
        ),
        "pagefoot": ParagraphStyle(
            "PageFoot",
            parent=base["Normal"],
            fontName=FONTS["regular"],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.black,
        ),
    }


styles = build_styles()


def info_block(rows):
    """Identification block: bold label + tab + value, like HL7-FHIR.pdf."""
    data = [
        [Paragraph(f"<b>{k}</b>", styles["td_label"]), Paragraph(v, styles["td"])]
        for k, v in rows
    ]
    table = Table(data, colWidths=[5.0 * cm, 11.5 * cm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    return table


def data_table(rows, headers=("Atribut", "Valoare"), widths=(5.0 * cm, 11.5 * cm)):
    """Simple two-column table like in HL7-FHIR.pdf — bold header row, thin separators."""
    data = [[Paragraph(f"<b>{h}</b>", styles["td_label"]) for h in headers]]
    for r in rows:
        data.append([Paragraph(c, styles["td"]) for c in r])

    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.black),
                ("LINEBELOW", (0, 1), (-1, -2), 0.25, colors.HexColor("#bbbbbb")),
            ]
        )
    )
    return table


def code_block(text):
    return Preformatted(text, styles["code"])


class FooterDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, **kw)
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="normal",
        )
        self.addPageTemplates([PageTemplate(id="all", frames=frame, onPage=self._draw_footer)])
        self._page_total = 0

    def _draw_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setFont(FONTS["regular"], 10)
        canvas.setFillColor(colors.black)
        text = f"-- {doc.page} of {self._page_total} --" if self._page_total else f"-- {doc.page} --"
        canvas.drawCentredString(A4[0] / 2, 1.2 * cm, text)
        canvas.restoreState()


def build_story():
    s = []

    s.append(Paragraph("Clasificare automată ML", styles["title"]))
    s.append(
        Paragraph(
            "SeniorWatch – Clasificarea stării de sănătate a pacienților pe baza datelor senzoriale",
            styles["subtitle"],
        )
    )

    s.append(Paragraph("Identificarea Documentului", styles["h2"]))
    s.append(
        info_block(
            [
                ("Cod proiect:", "MPSAM-2026-AAL-01"),
                (
                    "Titlu proiect:",
                    "SeniorWatch – Sistem de Teleasistență la Domiciliu a Persoanelor în Vârstă",
                ),
                ("Versiune document:", "1.0"),
                ("Data lansării:", "17.06.2026"),
                ("Modul:", "Clasificare automată (Machine Learning) – TensorFlow / CSV"),
                ("Set de date:", "Pacienti.csv (4 caracteristici, 3 clase)"),
                ("Client:", "Fundația „Bătrânii sunt ai noștri”"),
            ]
        )
    )
    s.append(PageBreak())

    # ---------- Page 2 ----------
    s.append(Paragraph("Clasificare automată a stării pacienților", styles["title"]))

    s.append(Paragraph("1. Pipeline ML (arhitectura modulului)", styles["h1"]))
    s.append(
        Paragraph(
            "SeniorWatch folosește un pipeline supervised learning în care datele senzoriale "
            "ale pacienților sunt persistate în Cloud printr-un API REST, exportate "
            "din portalul administratorului ca fișier CSV (format Iris) și folosite ca date "
            "de antrenare pentru un model TensorFlow rulat offline.",
            styles["body"],
        )
    )

    s.append(Paragraph("1.1. Sursă de date și export (frontend Web)", styles["h2"]))
    s.append(
        data_table(
            [
                ("Tehnologie", "React 18 (SPA), modul src/web/src/utils/patientCsvBuilder.js"),
                ("Pagină", "/admin/admincsv (admin – export global toți pacienții activi)"),
                ("API consumat", "GET /api/patients – include latestSample per pacient"),
                ("Format emis", "CSV (text/csv), fișier Pacienti-YYYY-MM-DD.csv"),
                ("Coloane", "Id, Puls, SpO2, Temperatura, Umiditate, StareSanatate"),
                ("Valori lipsă", "exportate ca 0; etichetarea ignoră câmpurile absente"),
            ]
        )
    )

    s.append(Paragraph("1.2. Antrenare și predicție (Python offline)", styles["h2"]))
    s.append(
        data_table(
            [
                ("Tehnologie", "Python 3, TensorFlow 2.x (API compat v1), pandas, numpy"),
                ("Script", "src/clasificare/.../tutorial-pacienti-exemplu.py"),
                ("Model", "Regresie logistică multiclasă – softmax(W·x + b)"),
                ("Optimizator", "Adam (learning rate 0.01), 2000 epoci"),
                ("Împărțire date", "70% antrenare / 30% test (după amestecare aleatoare)"),
            ]
        )
    )
    s.append(
        Paragraph(
            "Fluxul: administratorul autentificat → /admin/admincsv → PatientCsvBuilder "
            "agregă latestSample per pacient → fișier Pacienti.csv → "
            "tutorial-pacienti-exemplu.py antrenează modelul softmax → predicție pe setul "
            "de test + acuratețe.",
            styles["body"],
        )
    )
    s.append(PageBreak())

    # ---------- Page 3 ----------
    s.append(Paragraph("2. Utilizare în aplicație", styles["h1"]))

    s.append(Paragraph("2.1. Export CSV – interfața administratorului (/admin/admincsv)", styles["h2"]))
    s.append(
        Paragraph(
            "Administratorul accesează din meniul lateral pagina <b>Export CSV</b>. "
            "Pagina încarcă automat toți pacienții activi, generează previzualizarea "
            "fișierului Pacienti.csv și permite copierea sau descărcarea fișierului "
            "pentru antrenarea modelului ML.",
            styles["body"],
        )
    )
    s.append(Paragraph("Pași de utilizare (administrator):", styles["body"]))
    s.append(
        Paragraph(
            "1. Autentificare în portal cu cont de administrator.<br/>"
            "2. Meniu lateral → <b>Export CSV</b>.<br/>"
            "3. Verificare previzualizare CSV în panoul inferior.<br/>"
            "4. <b>Descarcă Pacienti.csv</b> sau <b>Copiază CSV</b>.<br/>"
            "5. Copiere fișier în <i>src/clasificare/Algoritmi de clasificare-20260617/</i>.<br/>"
            "6. Rulare: <font face=\"%s\">python tutorial-pacienti-exemplu.py</font>" % FONTS["mono"],
            styles["body"],
        )
    )

    s.append(Paragraph("2.2. Afișare stare în portalul medicului", styles["h2"]))
    s.append(
        Paragraph(
            "Aceleași reguli de clasificare (<i>src/web/src/utils/healthStatus.js</i>) "
            "alimentează etichetele <b>Stabil</b>, <b>Observație</b>, <b>Alertă</b> "
            "din pagina Pacienți (/medic/pacienti). Exportul CSV folosește "
            "echivalentul Stare-stabil / Stare-observatie / Stare-alerta pentru "
            "antrenarea modelului.",
            styles["body"],
        )
    )
    s.append(PageBreak())

    # ---------- Page 4 ----------
    s.append(Paragraph("3. Format date – analogia cu Iris", styles["h1"]))
    s.append(
        Paragraph(
            "Setul de date Iris (150 flori, 4 caracteristici numerice, 3 clase) este folosit "
            "ca tutorial de referință (<i>tutorial-iris-exemplu.py</i>, fișier Iris.csv). "
            "SeniorWatch mapează aceeași structură pe datele pacienților, pentru a refolosi "
            "același tip de model softmax fără modificări de arhitectură.",
            styles["body"],
        )
    )
    s.append(
        data_table(
            [
                ("SepalLengthCm", "Puls (bpm)"),
                ("SepalWidthCm", "SpO2 (%)"),
                ("PetalLengthCm", "Temperatura (°C)"),
                ("PetalWidthCm", "Umiditate (%)"),
                ("Species (3 clase)", "StareSanatate (3 clase)"),
            ],
            headers=("Coloană Iris.csv", "Coloană Pacienti.csv"),
        )
    )

    s.append(Paragraph("3.1. Exemplu Pacienti.csv (export real)", styles["h2"]))
    s.append(
        code_block(
            "Id,Puls,SpO2,Temperatura,Umiditate,StareSanatate\n"
            "1,50,0,36.9,0,Stare-stabil\n"
            "2,75,0,36.2,0,Stare-stabil\n"
            "3,60,0,37.8,0,Stare-observatie\n"
            "4,84,0,24.8,52,Stare-alerta\n"
            "5,90,0,36.6,0,Stare-stabil\n"
            "6,63,0,35.5,0,Stare-stabil\n"
            "7,67,0,39.0,0,Stare-alerta"
        )
    )
    s.append(PageBreak())

    # ---------- Page 5 ----------
    s.append(Paragraph("4. Reguli de etichetare StareSanatate", styles["h1"]))
    s.append(
        Paragraph(
            "Coloana StareSanatate este generată automat la export "
            "(<i>src/web/src/utils/healthStatus.js</i>). Pragurile sunt aliniate cu "
            "logica de alertare folosită în portalul medicului.",
            styles["body"],
        )
    )

    s.append(Paragraph("Stare-alerta – dacă oricare condiție (cu valoare prezentă):", styles["body"]))
    s.append(
        Paragraph(
            "• Puls &gt; 110 bpm<br/>"
            "• Temperatură &gt; 38 °C sau &lt; 35 °C<br/>"
            "• SpO2 &lt; 92 %<br/>"
            "• Umiditate &gt; 80 %",
            styles["body"],
        )
    )

    s.append(Paragraph("Stare-observatie – altfel, dacă oricare condiție:", styles["body"]))
    s.append(
        Paragraph(
            "• Puls &gt; 95 bpm<br/>"
            "• Temperatură &gt; 37.5 °C<br/>"
            "• SpO2 &lt; 95 %<br/>"
            "• Umiditate &gt; 70 %",
            styles["body"],
        )
    )

    s.append(
        Paragraph(
            "Stare-stabil – în rest, sau când lipsesc toate măsurătorile.",
            styles["body"],
        )
    )

    s.append(Paragraph("4.1. Codificare one-hot pentru TensorFlow", styles["h2"]))
    s.append(
        code_block(
            "Stare-stabil     -> [1, 0, 0]\n"
            "Stare-observatie -> [0, 1, 0]\n"
            "Stare-alerta     -> [0, 0, 1]"
        )
    )
    s.append(PageBreak())

    # ---------- Page 6 ----------
    s.append(Paragraph("5. Algoritm de clasificare (TensorFlow)", styles["h1"]))
    s.append(
        Paragraph(
            "Scriptul <i>tutorial-pacienti-exemplu.py</i> implementează o rețea neuronală "
            "simplă, fără straturi ascunse – echivalent regresie logistică multiclasă "
            "cu funcție softmax la ieșire.",
            styles["body"],
        )
    )

    s.append(Paragraph("5.1. Pași algoritm", styles["h2"]))
    s.append(
        Paragraph(
            "1. Citire <i>Pacienti.csv</i> (index_col=0 pe coloana Id).<br/>"
            "2. Mapare StareSanatate → vectori one-hot [1,0,0], [0,1,0], [0,0,1].<br/>"
            "3. Amestecare aleatoare a rândurilor (<font face=\"%s\">np.random.permutation</font>).<br/>"
            "4. Împărțire 70%% antrenare / 30%% test.<br/>"
            "5. Definire placeholders x [None,4] și y [None,3].<br/>"
            "6. Model: y = softmax(x·W + b), W ∈ R^4×3, b ∈ R^3.<br/>"
            "7. Funcție de pierdere: cross-entropy medie.<br/>"
            "8. Antrenare Adam, 2000 iterații; afișare loss la fiecare 500 pași.<br/>"
            "9. Predicție pe setul de test + calcul acuratețe."
            % FONTS["mono"],
            styles["body"],
        )
    )

    s.append(Paragraph("5.2. Compatibilitate TensorFlow 2.x", styles["h2"]))
    s.append(
        Paragraph(
            "Tutorialul original (TF 1.x) a fost adaptat pentru TensorFlow 2.x: "
            "<font face=\"%s\">tf.compat.v1.disable_eager_execution()</font>, "
            "<font face=\"%s\">tf.compat.v1.placeholder</font>, "
            "<font face=\"%s\">tf.compat.v1.Variable</font>, "
            "<font face=\"%s\">axis=1</font> în loc de "
            "<font face=\"%s\">reduction_indices=[1]</font>, "
            "feed_dict cu array-uri NumPy <font face=\"%s\">float32</font>."
            % tuple([FONTS["mono"]] * 6),
            styles["body"],
        )
    )
    s.append(PageBreak())

    # ---------- Page 7 ----------
    s.append(Paragraph("6. Exemplu cod – fragment model pacienți", styles["h1"]))
    s.append(
        code_block(
            "# 4 intrari, 3 clase de iesire\n"
            "x  = tf.compat.v1.placeholder(tf.float32, shape=[None, 4])\n"
            "y_ = tf.compat.v1.placeholder(tf.float32, shape=[None, 3])\n"
            "\n"
            "W = tf.compat.v1.Variable(tf.zeros([4, 3]))\n"
            "b = tf.compat.v1.Variable(tf.zeros([3]))\n"
            "y = tf.nn.softmax(tf.matmul(x, W) + b)\n"
            "\n"
            "cross_entropy = tf.reduce_mean(\n"
            "    -tf.reduce_sum(y_ * tf.math.log(y), axis=1))\n"
            "train_step = tf.compat.v1.train.AdamOptimizer(0.01) \\\n"
            "                   .minimize(cross_entropy)"
        )
    )

    s.append(Paragraph("6.1. Exemplu ieșire predicție", styles["h2"]))
    s.append(
        code_block(
            "Pentru valorile:\n"
            "  [[75.   0.  36.2   0. ]]\n"
            "Starea prezisa este: Stare-stabil\n"
            "\n"
            "Pentru valorile:\n"
            "  [[67.   0.  39.0   0. ]]\n"
            "Starea prezisa este: Stare-alerta\n"
            "\n"
            "Acuratetea generala este:\n"
            "0.6666667"
        )
    )

    return s


def main():
    # First pass: count pages
    doc1 = FooterDoc(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
        title="Clasificare automată ML - SeniorWatch",
        author="Echipa SeniorWatch - UPT",
    )
    doc1.build(build_story())
    total = doc1.page

    # Second pass: write again with total page count
    doc2 = FooterDoc(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
        title="Clasificare automată ML - SeniorWatch",
        author="Echipa SeniorWatch - UPT",
    )
    doc2._page_total = total
    doc2.build(build_story())

    print(f"Generated: {OUTPUT} ({total} pages)")


if __name__ == "__main__":
    main()
