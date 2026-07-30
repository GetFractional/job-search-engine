from __future__ import annotations

import html
import re
from pathlib import Path
from typing import Iterable

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "docs" / "career-platform" / "strategy-system"
OUTPUT_DIR = ROOT / "output" / "pdf"

FULL_OUTPUT = OUTPUT_DIR / "Way_Ahead_Strategy_System_2026-07-29.pdf"
START_OUTPUT = OUTPUT_DIR / "Way_Ahead_Start_Here_2026-07-29.pdf"
RESET_OUTPUT = OUTPUT_DIR / "Way_Ahead_Product_Experience_Reset_2026-07-29.pdf"

SOURCE_FILES = [
    SOURCE_DIR / "00-start-here.md",
    SOURCE_DIR / "01-market-customer-competition.md",
    SOURCE_DIR / "02-audience-positioning-brand-offer.md",
    SOURCE_DIR / "03-full-funnel-product-experience.md",
    SOURCE_DIR / "04-opportunity-intelligence-trust-ai-data.md",
    SOURCE_DIR / "05-business-model-validation-growth.md",
    SOURCE_DIR / "06-delivery-roadmap-founder-dogfooding.md",
    SOURCE_DIR / "07-evidence-source-register.md",
    SOURCE_DIR / "08-measurement-learning-system.md",
    SOURCE_DIR / "09-founder-strategy-center-delivery-control.md",
    SOURCE_DIR / "10-authority-and-artifact-disposition.md",
    SOURCE_DIR / "11-board-ceo-dynamic-expert-operating-graph.md",
    SOURCE_DIR / "12-visual-direction-board-decision-2026-07-19.md",
    SOURCE_DIR / "13-prototype-experience-audit-2026-07-19.md",
    SOURCE_DIR / "14-company-organization-and-prototype-reset-plan-2026-07-19.md",
    SOURCE_DIR / "15-prototype-v2-implementation-and-qa-2026-07-19.md",
    SOURCE_DIR / "16-founder-feedback-product-reset-2026-07-21.md",
    SOURCE_DIR / "17-public-multi-user-alpha-job-supply-and-growth-architecture-2026-07-23.md",
    SOURCE_DIR / "18-career-os-customer-journey-screen-state-and-critical-path-2026-07-23.md",
    SOURCE_DIR / "19-free-ai-foundation-and-provider-gate-2026-07-29.md",
]

RESET_SOURCE_FILES = SOURCE_FILES[13:]

INK = HexColor("#102127")
DEEP = HexColor("#0B171C")
DEEP_2 = HexColor("#153039")
TEAL = HexColor("#3F9A79")
TEAL_DARK = HexColor("#23694F")
MINT = HexColor("#DDF2E9")
PALE = HexColor("#F2F7F5")
PAPER = HexColor("#FBFCFA")
WARM = HexColor("#F3EEE6")
CORAL = HexColor("#D9624A")
GOLD = HexColor("#B2781A")
MUTED = HexColor("#586B72")
LINE = HexColor("#D7E0DD")
WHITE = colors.white

PAGE_W, PAGE_H = letter
MARGIN_X = 0.64 * inch
MARGIN_TOP = 0.66 * inch
MARGIN_BOTTOM = 0.62 * inch
CONTENT_W = PAGE_W - (2 * MARGIN_X)


def register_fonts() -> None:
    font_dir = Path("/System/Library/Fonts/Supplemental")
    fonts = {
        "StrategySans": font_dir / "Arial.ttf",
        "StrategySans-Bold": font_dir / "Arial Bold.ttf",
        "StrategySans-Italic": font_dir / "Arial Italic.ttf",
        "StrategySerif": font_dir / "Georgia.ttf",
        "StrategySerif-Bold": font_dir / "Georgia Bold.ttf",
        "StrategyMono": Path("/System/Library/Fonts/SFNSMono.ttf"),
    }
    for name, path in fonts.items():
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily(
        "StrategySans",
        normal="StrategySans",
        bold="StrategySans-Bold",
        italic="StrategySans-Italic",
        boldItalic="StrategySans-Bold",
    )
    pdfmetrics.registerFontFamily(
        "StrategySerif",
        normal="StrategySerif",
        bold="StrategySerif-Bold",
        italic="StrategySerif",
        boldItalic="StrategySerif-Bold",
    )


def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_kicker": ParagraphStyle(
            "CoverKicker",
            parent=base["Normal"],
            fontName="StrategySans-Bold",
            fontSize=8.8,
            leading=11,
            textColor=MINT,
            tracking=1.35,
            spaceAfter=10,
        ),
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName="StrategySerif-Bold",
            fontSize=31,
            leading=35,
            textColor=WHITE,
            alignment=TA_LEFT,
            spaceAfter=15,
        ),
        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle",
            parent=base["Normal"],
            fontName="StrategySans",
            fontSize=12.5,
            leading=17,
            textColor=HexColor("#DDE9E5"),
            spaceAfter=24,
        ),
        "cover_meta": ParagraphStyle(
            "CoverMeta",
            parent=base["Normal"],
            fontName="StrategySans",
            fontSize=9.2,
            leading=13.4,
            textColor=HexColor("#CAE0D8"),
        ),
        "chapter_label": ParagraphStyle(
            "ChapterLabel",
            parent=base["Normal"],
            fontName="StrategySans-Bold",
            fontSize=8,
            leading=10,
            textColor=TEAL_DARK,
            tracking=1.1,
            spaceAfter=7,
        ),
        "h1": ParagraphStyle(
            "Heading1",
            parent=base["Heading1"],
            fontName="StrategySerif-Bold",
            fontSize=23,
            leading=27,
            textColor=INK,
            spaceBefore=0,
            spaceAfter=16,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName="StrategySerif-Bold",
            fontSize=15.5,
            leading=19,
            textColor=INK,
            spaceBefore=14,
            spaceAfter=7,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "Heading3",
            parent=base["Heading3"],
            fontName="StrategySans-Bold",
            fontSize=10.8,
            leading=14,
            textColor=TEAL_DARK,
            spaceBefore=10,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="StrategySans",
            fontSize=9.25,
            leading=13.1,
            textColor=INK,
            spaceAfter=7,
            splitLongWords=False,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="StrategySans",
            fontSize=7.75,
            leading=10.4,
            textColor=MUTED,
            spaceAfter=5,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName="StrategySans",
            fontSize=9.05,
            leading=12.7,
            textColor=INK,
            leftIndent=11,
            firstLineIndent=0,
            spaceAfter=3.5,
        ),
        "number": ParagraphStyle(
            "Number",
            parent=base["BodyText"],
            fontName="StrategySans",
            fontSize=9.05,
            leading=12.7,
            textColor=INK,
            leftIndent=13,
            firstLineIndent=0,
            spaceAfter=3.5,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontName="StrategySerif-Bold",
            fontSize=13,
            leading=18,
            textColor=DEEP_2,
            alignment=TA_LEFT,
            spaceAfter=0,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["Code"],
            fontName="StrategyMono",
            fontSize=7.2,
            leading=10.1,
            textColor=DEEP_2,
        ),
        "toc_title": ParagraphStyle(
            "TOCTitle",
            parent=base["Heading1"],
            fontName="StrategySerif-Bold",
            fontSize=22,
            leading=26,
            textColor=INK,
            spaceAfter=15,
        ),
        "toc_1": ParagraphStyle(
            "TOC1",
            parent=base["Normal"],
            fontName="StrategySans-Bold",
            fontSize=9.4,
            leading=13,
            textColor=INK,
            leftIndent=0,
            firstLineIndent=0,
            spaceBefore=3,
        ),
        "toc_2": ParagraphStyle(
            "TOC2",
            parent=base["Normal"],
            fontName="StrategySans",
            fontSize=8.2,
            leading=11.2,
            textColor=MUTED,
            leftIndent=14,
            firstLineIndent=0,
        ),
    }


def inline_markup(value: str) -> str:
    escaped = html.escape(value.strip(), quote=True)
    escaped = re.sub(
        r"\[([^\]]+)\]\((https?://[^)]+)\)",
        lambda m: f'<link href="{m.group(2)}" color="#{TEAL_DARK.hexval()[2:]}" underline="1">{m.group(1)}</link>',
        escaped,
    )
    escaped = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"`([^`]+)`", r'<font name="StrategyMono" color="#31505A">\1</font>', escaped)
    return escaped


def is_table_separator(line: str) -> bool:
    stripped = line.strip().strip("|")
    cells = [c.strip() for c in stripped.split("|")]
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", c) for c in cells)


def parse_table(lines: list[str], styles: dict[str, ParagraphStyle]) -> Table:
    rows: list[list[str]] = []
    for line in lines:
        if is_table_separator(line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)

    column_count = max(len(row) for row in rows)
    for row in rows:
        row.extend([""] * (column_count - len(row)))

    lengths = [max(len(row[index]) for row in rows) for index in range(column_count)]
    total = max(sum(lengths), 1)
    if column_count == 2:
        first = max(0.23, min(0.36, lengths[0] / total))
        widths = [CONTENT_W * first, CONTENT_W * (1 - first)]
    elif column_count == 3:
        raw = [max(0.19, length / total) for length in lengths]
        scale = sum(raw)
        widths = [CONTENT_W * value / scale for value in raw]
    elif column_count == 4:
        raw = [max(0.15, length / total) for length in lengths]
        scale = sum(raw)
        widths = [CONTENT_W * value / scale for value in raw]
    else:
        widths = [CONTENT_W / column_count] * column_count

    cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["small"],
        fontName="StrategySans",
        fontSize=7.35 if column_count <= 3 else 6.8,
        leading=9.7 if column_count <= 3 else 8.9,
        textColor=INK,
        spaceAfter=0,
    )
    head_style = ParagraphStyle(
        "TableHead",
        parent=cell_style,
        fontName="StrategySans-Bold",
        textColor=WHITE,
    )
    data = [
        [Paragraph(inline_markup(cell), head_style if row_index == 0 else cell_style) for cell in row]
        for row_index, row in enumerate(rows)
    ]
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), DEEP_2),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for row_index in range(1, len(data)):
        commands.append(("BACKGROUND", (0, row_index), (-1, row_index), PAPER if row_index % 2 else PALE))
    table.setStyle(TableStyle(commands))
    return table


def quote_box(text: str, styles: dict[str, ParagraphStyle]) -> Table:
    body = Paragraph(inline_markup(text), styles["quote"])
    table = Table([[body]], colWidths=[CONTENT_W - 8], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), MINT),
                ("BOX", (0, 0), (-1, -1), 0.7, TEAL),
                ("LINEBEFORE", (0, 0), (0, -1), 4, TEAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 13),
                ("TOPPADDING", (0, 0), (-1, -1), 11),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
            ]
        )
    )
    return table


def code_box(lines: list[str], styles: dict[str, ParagraphStyle]) -> Table:
    value = "<br/>".join(html.escape(line) if line else "&nbsp;" for line in lines)
    body = Paragraph(value, styles["code"])
    table = Table([[body]], colWidths=[CONTENT_W - 8], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), WARM),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def paragraph_block(lines: list[str], styles: dict[str, ParagraphStyle]) -> Paragraph:
    text = " ".join(line.strip() for line in lines)
    return Paragraph(inline_markup(text), styles["body"])


def markdown_to_story(
    paths: Iterable[Path],
    styles: dict[str, ParagraphStyle],
    include_file_breaks: bool = True,
) -> list:
    story: list = []
    chapter_index = 0
    first_h1_seen = False

    for file_index, path in enumerate(paths):
        lines = path.read_text(encoding="utf-8").splitlines()
        index = 0
        while index < len(lines):
            line = lines[index]
            stripped = line.strip()

            if not stripped:
                index += 1
                continue

            if stripped == "<!-- PAGEBREAK -->":
                story.append(PageBreak())
                index += 1
                continue

            if stripped.startswith("# "):
                chapter_index += 1
                if include_file_breaks and first_h1_seen:
                    story.append(PageBreak())
                first_h1_seen = True
                title = stripped[2:].strip()
                label = "STRATEGY CENTER" if chapter_index == 1 else f"CHAPTER {chapter_index - 1:02d}"
                story.append(Paragraph(label, styles["chapter_label"]))
                heading = Paragraph(inline_markup(title), styles["h1"])
                heading._bookmarkName = f"chapter-{chapter_index}"
                story.append(heading)
                index += 1
                continue

            if stripped.startswith("## "):
                title = stripped[3:].strip()
                heading = Paragraph(inline_markup(title), styles["h2"])
                heading._bookmarkName = f"section-{file_index}-{index}"
                story.append(heading)
                index += 1
                continue

            if stripped.startswith("### "):
                story.append(Paragraph(inline_markup(stripped[4:].strip()), styles["h3"]))
                index += 1
                continue

            if stripped.startswith("```"):
                code_lines: list[str] = []
                index += 1
                while index < len(lines) and not lines[index].strip().startswith("```"):
                    code_lines.append(lines[index])
                    index += 1
                index += 1
                story.extend([code_box(code_lines, styles), Spacer(1, 7)])
                continue

            if stripped.startswith("> "):
                quote_lines = [stripped[2:].strip()]
                index += 1
                while index < len(lines) and lines[index].strip().startswith("> "):
                    quote_lines.append(lines[index].strip()[2:].strip())
                    index += 1
                story.extend([quote_box(" ".join(quote_lines), styles), Spacer(1, 8)])
                continue

            if stripped.startswith("|") and index + 1 < len(lines) and is_table_separator(lines[index + 1]):
                table_lines = [line, lines[index + 1]]
                index += 2
                while index < len(lines) and lines[index].strip().startswith("|"):
                    table_lines.append(lines[index])
                    index += 1
                story.extend([parse_table(table_lines, styles), Spacer(1, 8)])
                continue

            bullet_match = re.match(r"^[-*]\s+(.+)$", stripped)
            number_match = re.match(r"^(\d+)\.\s+(.+)$", stripped)
            if bullet_match:
                items: list[ListItem] = []
                while index < len(lines):
                    match = re.match(r"^[-*]\s+(.+)$", lines[index].strip())
                    if not match:
                        break
                    items.append(ListItem(Paragraph(inline_markup(match.group(1)), styles["bullet"]), leftIndent=5))
                    index += 1
                story.append(
                    ListFlowable(
                        items,
                        bulletType="bullet",
                        start="circle",
                        bulletFontName="StrategySans",
                        bulletFontSize=7,
                        bulletColor=TEAL_DARK,
                        leftIndent=15,
                        bulletOffsetY=2,
                        spaceAfter=6,
                    )
                )
                continue
            if number_match:
                items = []
                while index < len(lines):
                    match = re.match(r"^(\d+)\.\s+(.+)$", lines[index].strip())
                    if not match:
                        break
                    items.append(ListItem(Paragraph(inline_markup(match.group(2)), styles["number"]), leftIndent=5))
                    index += 1
                story.append(
                    ListFlowable(
                        items,
                        bulletType="1",
                        start="1",
                        bulletFontName="StrategySans-Bold",
                        bulletFontSize=7.4,
                        bulletColor=TEAL_DARK,
                        leftIndent=18,
                        bulletOffsetY=2,
                        spaceAfter=6,
                    )
                )
                continue

            paragraph_lines = [line]
            index += 1
            while index < len(lines):
                candidate = lines[index]
                candidate_stripped = candidate.strip()
                if not candidate_stripped:
                    break
                if candidate_stripped.startswith(("#", ">", "```", "|")):
                    break
                if re.match(r"^[-*]\s+", candidate_stripped) or re.match(r"^\d+\.\s+", candidate_stripped):
                    break
                paragraph_lines.append(candidate)
                index += 1
            story.append(paragraph_block(paragraph_lines, styles))

    return story


class StrategyDocTemplate(BaseDocTemplate):
    def __init__(self, filename: Path, **kwargs):
        super().__init__(str(filename), **kwargs)
        frame = Frame(
            MARGIN_X,
            MARGIN_BOTTOM,
            CONTENT_W,
            PAGE_H - MARGIN_BOTTOM - MARGIN_TOP,
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
            id="main",
        )
        self.addPageTemplates(
            [
                PageTemplate(id="cover", frames=[frame], onPage=self.draw_cover_page, autoNextPageTemplate="body"),
                PageTemplate(id="body", frames=[frame], onPage=self.draw_body_page),
            ]
        )
        self._heading_count = 0

    def draw_cover_page(self, canvas, doc) -> None:
        canvas.saveState()
        canvas.setFillColor(DEEP)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFillColor(TEAL)
        canvas.rect(0, PAGE_H - 0.13 * inch, PAGE_W, 0.13 * inch, fill=1, stroke=0)
        canvas.setFillColor(HexColor("#16313A"))
        canvas.circle(PAGE_W - 0.85 * inch, 0.8 * inch, 0.47 * inch, fill=1, stroke=0)
        canvas.setStrokeColor(TEAL)
        canvas.setLineWidth(2)
        canvas.circle(PAGE_W - 0.85 * inch, 0.8 * inch, 0.30 * inch, fill=0, stroke=1)
        canvas.restoreState()

    def draw_body_page(self, canvas, doc) -> None:
        canvas.saveState()
        page_number = canvas.getPageNumber()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.45)
        canvas.line(MARGIN_X, PAGE_H - 0.39 * inch, PAGE_W - MARGIN_X, PAGE_H - 0.39 * inch)
        canvas.setFont("StrategySans-Bold", 6.9)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN_X, PAGE_H - 0.29 * inch, "MY WAY AHEAD  /  STRATEGY SYSTEM")
        canvas.setFont("StrategySans", 7.2)
        canvas.drawRightString(PAGE_W - MARGIN_X, 0.34 * inch, f"{page_number - 1}")
        canvas.setStrokeColor(LINE)
        canvas.line(MARGIN_X, 0.48 * inch, PAGE_W - MARGIN_X, 0.48 * inch)
        canvas.restoreState()

    def afterFlowable(self, flowable) -> None:
        if isinstance(flowable, Paragraph) and flowable.style.name in {"Heading1", "Heading2"}:
            level = 0 if flowable.style.name == "Heading1" else 1
            text = flowable.getPlainText()
            key = getattr(flowable, "_bookmarkName", f"heading-{self._heading_count}")
            self._heading_count += 1
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=level, closed=level > 0)
            self.notify("TOCEntry", (level, text, self.page - 1, key))


def cover_story(styles: dict[str, ParagraphStyle], short: bool = False, packet: bool = False) -> list:
    title = "Way Ahead\nStrategy System"
    subtitle = (
        "A self-contained operating strategy for the market, customer, brand, business model, "
        "full funnel, opportunity intelligence, trust, AI, delivery, measurement, founder control, and Matt's founder dogfooding."
    )
    kicker = "FOUNDER REVIEW  /  VERSION 1.4"
    if short:
        title = "Way Ahead\nStart Here"
        subtitle = "The decisions, corrections, standards, authority, and next gates that govern the company and product."
    if packet:
        title = "Way Ahead\nProduct Experience Reset"
        subtitle = (
            "The screenshot-led prototype audit, actual company organization, cross-functional evaluation plan, "
            "offer hypotheses, release gates, and next build sequence."
        )
        kicker = "BOARD OPERATING PACKET  /  JULY 19, 2026"
    return [
        Spacer(1, 1.16 * inch),
        Paragraph(kicker, styles["cover_kicker"]),
        Paragraph(title.replace("\n", "<br/>"), styles["cover_title"]),
        Paragraph(subtitle, styles["cover_subtitle"]),
        Spacer(1, 0.26 * inch),
        Table(
            [
                [Paragraph("Research current through", styles["cover_meta"]), Paragraph("July 29, 2026", styles["cover_meta"])],
                [Paragraph("Working brand", styles["cover_meta"]), Paragraph("Way Ahead; provisional and not legally cleared", styles["cover_meta"])],
                [Paragraph("Founder dogfooding", styles["cover_meta"]), Paragraph("Matt Dimock using the same member product", styles["cover_meta"])],
                [Paragraph("Current build gate", styles["cover_meta"]), Paragraph("Multi-user vertical slice and product experience reset", styles["cover_meta"])],
            ],
            colWidths=[1.55 * inch, 3.75 * inch],
            hAlign="LEFT",
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor("#142B33")),
                    ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#35535C")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.35, HexColor("#35535C")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ]
            ),
        ),
        PageBreak(),
    ]


def build_pdf(output: Path, sources: list[Path], short: bool = False, packet: bool = False) -> None:
    styles = make_styles()
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = StrategyDocTemplate(
        output,
        pagesize=letter,
        title=(
            "Way Ahead Product Experience Reset"
            if packet
            else ("Way Ahead Strategy System" if not short else "Way Ahead Start Here")
        ),
        author="Matt Dimock and Codex expert council",
        subject="Evidence-grounded career opportunity platform strategy",
        creator="Way Ahead Strategy System",
    )
    story = cover_story(styles, short=short, packet=packet)
    if not short and not packet:
        story.append(Paragraph("Contents", styles["toc_title"]))
        toc = TableOfContents()
        toc.levelStyles = [styles["toc_1"], styles["toc_2"]]
        toc.dotsMinLevel = 0
        story.extend([toc, PageBreak()])
    story.extend(markdown_to_story(sources, styles, include_file_breaks=True))
    doc.multiBuild(story)


def main() -> None:
    register_fonts()
    missing = [path for path in SOURCE_FILES if not path.exists()]
    if missing:
        raise SystemExit("Missing strategy sources: " + ", ".join(str(path) for path in missing))
    build_pdf(FULL_OUTPUT, SOURCE_FILES, short=False)
    build_pdf(START_OUTPUT, [SOURCE_FILES[0]], short=True)
    build_pdf(RESET_OUTPUT, RESET_SOURCE_FILES, packet=True)
    print(FULL_OUTPUT)
    print(START_OUTPUT)
    print(RESET_OUTPUT)


if __name__ == "__main__":
    main()
