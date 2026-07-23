#!/usr/bin/env python3
"""Build the claim-safe Seso founder application PDFs used by Way Ahead."""

from __future__ import annotations

import shutil
import hashlib
import json
from pathlib import Path

from reportlab import rl_config
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "prototypes" / "worthward-mobile" / "public" / "founder-assets"
RESUME_NAME = "Seso - Director of Revenue Operations - Matt Dimock - Resume.pdf"
COVER_NAME = "Seso - Director of Revenue Operations - Matt Dimock - Cover Letter.pdf"

INK = colors.HexColor("#152725")
MUTED = colors.HexColor("#52615E")
ACCENT = colors.HexColor("#147A70")
PALE = colors.HexColor("#E9F4F1")
RULE = colors.HexColor("#C7D7D3")

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
rl_config.invariant = 1
pdfmetrics.registerFont(TTFont("WA-Regular", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("WA-Bold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(TTFont("WA-Italic", str(FONT_DIR / "Arial Italic.ttf")))
pdfmetrics.registerFont(TTFont("WA-BoldItalic", str(FONT_DIR / "Arial Bold Italic.ttf")))
pdfmetrics.registerFontFamily(
    "WA-Regular",
    normal="WA-Regular",
    bold="WA-Bold",
    italic="WA-Italic",
    boldItalic="WA-BoldItalic",
)


def _styles():
    styles = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "Name",
            parent=styles["Title"],
            fontName="WA-Bold",
            fontSize=21,
            leading=23,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=2,
        ),
        "target": ParagraphStyle(
            "Target",
            parent=styles["Normal"],
            fontName="WA-Bold",
            fontSize=10.5,
            leading=13,
            textColor=ACCENT,
            spaceAfter=3,
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=styles["Normal"],
            fontName="WA-Regular",
            fontSize=8.4,
            leading=10.5,
            textColor=MUTED,
            spaceAfter=8,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=styles["Heading2"],
            fontName="WA-Bold",
            fontSize=9,
            leading=11,
            textColor=ACCENT,
            uppercase=True,
            borderColor=RULE,
            borderWidth=0,
            borderPadding=0,
            spaceBefore=6,
            spaceAfter=3,
        ),
        "summary": ParagraphStyle(
            "Summary",
            parent=styles["BodyText"],
            fontName="WA-Regular",
            fontSize=8.7,
            leading=11.2,
            textColor=INK,
            spaceAfter=3,
        ),
        "skills": ParagraphStyle(
            "Skills",
            parent=styles["BodyText"],
            fontName="WA-Regular",
            fontSize=7.8,
            leading=10.2,
            textColor=INK,
            backColor=PALE,
            borderPadding=(5, 7, 5, 7),
            spaceAfter=5,
        ),
        "role": ParagraphStyle(
            "Role",
            parent=styles["Heading3"],
            fontName="WA-Bold",
            fontSize=8.8,
            leading=10.8,
            textColor=INK,
            spaceBefore=4,
            spaceAfter=0,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=styles["Normal"],
            fontName="WA-Italic",
            fontSize=7.5,
            leading=9.5,
            textColor=MUTED,
            spaceAfter=1,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=styles["BodyText"],
            fontName="WA-Regular",
            fontSize=7.7,
            leading=9.75,
            leftIndent=9,
            firstLineIndent=-6,
            bulletIndent=0,
            textColor=INK,
            spaceAfter=1.25,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontName="WA-Regular",
            fontSize=7,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
        "letter_name": ParagraphStyle(
            "LetterName",
            parent=styles["Title"],
            fontName="WA-Bold",
            fontSize=18,
            leading=21,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=3,
        ),
        "letter_body": ParagraphStyle(
            "LetterBody",
            parent=styles["BodyText"],
            fontName="WA-Regular",
            fontSize=10.1,
            leading=14.4,
            textColor=INK,
            spaceAfter=10,
        ),
    }


def _header(story, s):
    story.extend(
        [
            Paragraph("Matt Dimock", s["name"]),
            Paragraph("DIRECTOR OF REVENUE OPERATIONS", s["target"]),
            Paragraph(
                "Mount Juliet, TN &nbsp; | &nbsp; 805-620-2826 &nbsp; | &nbsp; "
                "mattdim805@gmail.com &nbsp; | &nbsp; linkedin.com/in/mattdimock/",
                s["contact"],
            ),
        ]
    )


def _section(story, title, s):
    story.append(Paragraph(title.upper(), s["section"]))


def _role(story, title, company, dates, location, bullets, s):
    block = [
        Paragraph(f"{title} | {company}", s["role"]),
        Paragraph(f"{dates} | {location}", s["meta"]),
    ]
    block.extend(Paragraph(f"- {bullet}", s["bullet"]) for bullet in bullets)
    story.append(KeepTogether(block))


def _resume_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.2)
    canvas.line(0.58 * inch, 0.48 * inch, 7.92 * inch, 0.48 * inch)
    canvas.setFont("WA-Regular", 7)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(4.25 * inch, 0.29 * inch, f"Matt Dimock | Seso | Page {doc.page}")
    canvas.restoreState()


def build_resume(path: Path):
    s = _styles()
    doc = BaseDocTemplate(
        str(path),
        pagesize=LETTER,
        leftMargin=0.58 * inch,
        rightMargin=0.58 * inch,
        topMargin=0.48 * inch,
        bottomMargin=0.62 * inch,
        title="Matt Dimock - Director of Revenue Operations Resume",
        author="Matt Dimock",
        subject="Application for Seso Director of Revenue Operations",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="resume")
    doc.addPageTemplates([PageTemplate(id="resume", frames=[frame], onPage=_resume_page)])
    story = []
    _header(story, s)
    _section(story, "Professional Summary", s)
    story.append(
        Paragraph(
            "Systems-driven growth and revenue operator with 18+ years building CRM, lifecycle, enablement, reporting, and automation infrastructure across telecom, insurance, ecommerce, education, and startup environments. Strongest where a company has traction but needs cleaner GTM handoffs, better operating visibility, scalable execution, and practical AI-assisted workflows.",
            s["summary"],
        )
    )
    _section(story, "Core Strengths", s)
    story.append(
        Paragraph(
            "Revenue Operations and GTM Systems &nbsp; | &nbsp; CRM, Lifecycle, and Marketing Automation &nbsp; | &nbsp; AI-Assisted Workflow Design &nbsp; | &nbsp; Reporting, Dashboards, and Funnel Visibility &nbsp; | &nbsp; Process Design and Systems Integration &nbsp; | &nbsp; Onboarding, Enablement, and Adoption &nbsp; | &nbsp; Cross-Functional Handoffs &nbsp; | &nbsp; Operating Cadence and Change Leadership",
            s["skills"],
        )
    )
    _section(story, "Selected Impact", s)
    for bullet in [
        "Built HireHawk's RevOps and HRIS stack and designed AI-assisted recruiting workflows that reduced time-to-fill from 60+ days to under 21 days.",
        "Built lifecycle, enablement, partner, and reporting systems at Prosper Wireless that supported scale from roughly $45 million to $120 million-plus in a sales-led environment and reduced onboarding burden by about 50 percent.",
        "Led marketing, technology, and operations at Affordable Insurance Quotes, where a proprietary Zoho-based AMS helped cut policy sell time in half and supported growth from about $290,000 to $2 million in 18 months.",
    ]:
        story.append(Paragraph(f"- {bullet}", s["bullet"]))

    _section(story, "Professional Experience", s)
    _role(
        story,
        "Growth Systems Consultant / Owner",
        "Get Fractional",
        "Oct 2022 to Present",
        "Remote, part-time consulting",
        [
            "Lead selective growth-systems and operating-infrastructure work across ecommerce and B2B businesses, emphasizing lifecycle, CRO, measurement, automation, and execution quality.",
            "Build connected workflows, measurement systems, campaign structures, and operating rhythms that reduce manual work and improve decision visibility.",
            "Use AI-assisted research, structured evaluation, and automation systems to improve decision quality and accelerate execution.",
        ],
        s,
    )
    _role(
        story,
        "Director of Growth and Retention",
        "Prosper Wireless",
        "Sept 2023 to Nov 2025",
        "Remote",
        [
            "Built onboarding, training, certification, compliance, lifecycle, partner, and reporting systems in a high-volume, sales-led telecom environment.",
            "Supported lifecycle and operating infrastructure across 600,000-plus activations or customers.",
            "Reduced agent onboarding burden by about 50 percent through training, enablement, and compliance systems.",
            "Co-developed Metabase dashboards and reporting infrastructure that improved leadership visibility.",
            "Structured 20-plus affiliate offers with CPA terms up to $300 per order and supported partner-performance tracking.",
        ],
        s,
    )
    _role(
        story,
        "Venture Lead, Internal Venture",
        "HireHawk",
        "Mar 2025 to Nov 2025",
        "Remote",
        [
            "Led the internal venture build across positioning, website, RevOps and HRIS architecture, workflow design, and operating cadence.",
            "Designed AI-assisted workflows for profile generation, job-description creation, ATS publishing, sourcing, and screening using Workable, n8n, CrewAI, and related tools.",
            "Integrated Zoho One, Deel, Workable, and supporting automation into a repeatable recruiting operating system.",
            "Reduced time-to-fill from 60-plus days to under 21 days.",
        ],
        s,
    )

    story.append(PageBreak())
    _header(story, s)
    _section(story, "Professional Experience, Continued", s)
    _role(
        story,
        "Chief Marketing Officer",
        "Affordable Insurance Quotes",
        "Jun 2020 to Dec 2021",
        "Nashville, TN",
        [
            "Led marketing, technology, and operations for a non-standard auto-insurance agency with fragmented funnel and operating infrastructure.",
            "Developed a proprietary Zoho One-based agency management system spanning sales pipeline, customer records, affiliate payouts, BI dashboards, reporting, support, HR, compliance, and finance.",
            "Built an affiliate-led GTM motion and coordinated the call-center, partner, and systems work required to scale.",
            "Helped scale revenue from about $290,000 to $2 million in 18 months and generated 30,000-plus leads; built operating infrastructure that helped expand the business from one to 16 states and cut policy sell time in half.",
        ],
        s,
    )
    _role(
        story,
        "Marketing Operations Manager",
        "Breakthrough Academy",
        "Aug 2019 to Jun 2021",
        "Vancouver, BC",
        [
            "Led the marketing department and coordinated internal specialists and external vendors across CRM, web, funnel, content, event, and reporting work.",
            "Led the migration from Keap and Infusionsoft to Zoho One to connect marketing, sales, customer experience, finance, and reporting.",
            "Built webinar, funnel, partner, and operating systems that reduced dependence on founder-led travel.",
            "Recruited, trained, coached, and led the marketing team while managing KPI and P&amp;L reporting to leadership.",
            "Helped build a weekly partner-led webinar strategy that achieved 30 percent-plus conversion and outperformed the prior top event channel.",
        ],
        s,
    )
    _role(
        story,
        "Director of Marketing",
        "Bob's Watches",
        "Jan 2017 to Dec 2018",
        "Orange County, CA",
        [
            "Led a nine-person team and more than 15 vendors across CRM, analytics, web, design, SEO, paid media, content, and lifecycle execution.",
            "Led implementation and optimization of Microsoft Dynamics 365 for marketing automation and pipeline management.",
            "Built BI dashboards for acquisition, lifecycle, SQL, and margin visibility and used Jira to strengthen delivery cadence.",
            "Helped grow revenue from $20.5 million to $45 million in 24 months while orders, site sessions, email-driven sessions, and sales-qualified leads for the purchasing team increased.",
            "Grew the email list 225 percent to more than 250,000 subscribers through shared lifecycle and acquisition leadership.",
        ],
        s,
    )
    _section(story, "Additional Systems and Venture Leadership", s)
    story.extend(
        [
            Paragraph(
                "Dealer Acceleration Group, Co-Founder / Chief Revenue Officer | 2022 &nbsp; | &nbsp; SkyFineUSA, Chief Marketing Officer / Head of Growth | 2019 &nbsp; | &nbsp; Agency leadership beginning in 2007",
                s["meta"],
            ),
            Paragraph(
                "- Led product, unit-economics, partnership, operating-system, and pivot work in a venture-backed fintech and insurance startup.",
                s["bullet"],
            ),
            Paragraph(
                "- Led requirements, wireframes, vendor coordination, and operating design for a deployed cloud ERP spanning accounting, manufacturing, inventory, subscriptions, shipping, and servicing.",
                s["bullet"],
            ),
        ]
    )
    _section(story, "Tools and Systems", s)
    story.append(
        Paragraph(
            "<b>CRM and customer systems:</b> Zoho One, Microsoft Dynamics 365, HubSpot, Keap / Infusionsoft, Braze, Salesforce familiarity<br/>"
            "<b>Automation and AI:</b> n8n, Zapier, Make.com, CrewAI, ChatGPT, Claude, Codex, custom GPTs<br/>"
            "<b>Analytics and operations:</b> Metabase, Tableau, Excel, Google Sheets, GA4, Google Tag Manager, ClickUp, Jira, Asana, Workable, Deel",
            s["skills"],
        )
    )
    doc.build(story)


def _letter_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.2)
    canvas.line(0.68 * inch, 0.53 * inch, 7.82 * inch, 0.53 * inch)
    canvas.setFont("WA-Regular", 7)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(4.25 * inch, 0.34 * inch, "Matt Dimock | Seso | Director of Revenue Operations")
    canvas.restoreState()


def build_cover_letter(path: Path):
    s = _styles()
    doc = SimpleDocTemplate(
        str(path),
        pagesize=LETTER,
        leftMargin=0.72 * inch,
        rightMargin=0.72 * inch,
        topMargin=0.62 * inch,
        bottomMargin=0.7 * inch,
        title="Matt Dimock - Seso Cover Letter",
        author="Matt Dimock",
        subject="Application for Seso Director of Revenue Operations",
    )
    story = [
        Paragraph("Matt Dimock", s["letter_name"]),
        Paragraph(
            "Mount Juliet, TN &nbsp; | &nbsp; 805-620-2826 &nbsp; | &nbsp; mattdim805@gmail.com &nbsp; | &nbsp; linkedin.com/in/mattdimock/",
            s["contact"],
        ),
        Spacer(1, 0.1 * inch),
        Paragraph("July 22, 2026", s["letter_body"]),
        Paragraph("Seso Hiring Team", s["letter_body"]),
        Paragraph("Dear Seso Hiring Team,", s["letter_body"]),
        Paragraph(
            "Seso's mission and the Director of Revenue Operations mandate draw me in: the company is applying software and services to a consequential workforce problem, and the role calls for connecting GTM systems, reporting, handoffs, and practical AI adoption.",
            s["letter_body"],
        ),
        Paragraph(
            "I build the systems behind measurable growth. At Prosper Wireless, I developed lifecycle, enablement, partner, and reporting infrastructure that supported scale from roughly $45 million to $120 million-plus in a sales-led environment. The systems supported more than 600,000 activations or customers and reduced agent onboarding burden by about 50 percent. My contribution was to remove friction, improve visibility, and make execution more scalable while the sales organization drove the commercial result.",
            s["letter_body"],
        ),
        Paragraph(
            "At HireHawk, I led the operating build for an internal venture, including the RevOps and HRIS stack and AI-assisted recruiting workflows across profile generation, job-description creation, ATS publishing, sourcing, and screening. That work helped reduce time-to-fill from 60+ days to under 21 days. It also reinforced my view that AI creates value when it is attached to a clear workflow, a measurable constraint, and human quality control.",
            s["letter_body"],
        ),
        Paragraph(
            "My deepest CRM implementation leadership has been in Zoho One and Microsoft Dynamics 365. I also bring HubSpot and Salesforce familiarity, plus hands-on work across lifecycle platforms, analytics, and automation. I have repeatedly translated fragmented business needs into connected workflows, dashboards, operating cadence, and adoption. At Seso, I would bring that systems perspective while partnering closely with the dedicated Salesforce administrator, marketing operations contractor, GTM leaders, and Finance.",
            s["letter_body"],
        ),
        Paragraph(
            "I would welcome the chance to discuss the current state of Seso's GTM stack, the highest-priority reporting and handoff problems, and where the team sees the strongest near-term opportunity for responsible AI leverage.",
            s["letter_body"],
        ),
        Paragraph("Best,<br/><br/><b>Matt Dimock</b>", s["letter_body"]),
    ]
    doc.build(story, onFirstPage=_letter_page, onLaterPages=_letter_page)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    resume = OUTPUT_DIR / RESUME_NAME
    cover = OUTPUT_DIR / COVER_NAME
    build_resume(resume)
    build_cover_letter(cover)
    shutil.copy2(resume, PUBLIC_DIR / RESUME_NAME)
    shutil.copy2(cover, PUBLIC_DIR / COVER_NAME)
    manifest = {
        "version": 1,
        "reviewedAt": "2026-07-22",
        "assets": [
            {
                "type": "resume",
                "filename": RESUME_NAME,
                "pageCount": 2,
                "fileSha256": hashlib.sha256(resume.read_bytes()).hexdigest(),
                "reviewState": "claim_safe",
            },
            {
                "type": "cover_letter",
                "filename": COVER_NAME,
                "pageCount": 1,
                "fileSha256": hashlib.sha256(cover.read_bytes()).hexdigest(),
                "reviewState": "claim_safe",
            },
        ],
    }
    manifest_text = json.dumps(manifest, indent=2) + "\n"
    (OUTPUT_DIR / "seso-application-asset-manifest.json").write_text(manifest_text, encoding="utf-8")
    (PUBLIC_DIR / "manifest.json").write_text(manifest_text, encoding="utf-8")
    print(resume)
    print(cover)


if __name__ == "__main__":
    main()
