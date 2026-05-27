from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path("/Users/mattdimock/Documents/Jobs/Job Search")
OUT = ROOT / "applications" / "hospitality-lanes" / "Matt Dimock - Broadway Barback Master - Resume.pdf"

NAVY = colors.HexColor("#18354D")
ACCENT = colors.HexColor("#B66F37")
TEXT = colors.HexColor("#1C1F24")
MUTED = colors.HexColor("#5F6871")

SUMMARY = (
    "Reliable, team-first operator pursuing barback work in downtown Nashville. Brings hands-on retail leadership in stocking, "
    "restocking, inventory counts, opening and closing, customer support, and physical floor work, plus years of operating experience "
    "built around clean handoffs, calm execution, and doing the unglamorous work that keeps a busy team moving. Ready to earn trust "
    "quickly in a high-volume bar, entertainment, or restaurant environment."
)

READINESS = [
    "Immediate availability for nights, weekends, holidays, and high-volume downtown shifts",
    "Comfortable with long shifts, constant movement, lifting, stocking, and support work",
    "Strong follow-through, clear communication, and low-ego team support",
    "Fast learner with strong memory for standards, routines, floor layouts, and manager preferences",
    "Professional with guests and steady under pressure",
    "Ready to complete TABC-certified alcohol awareness training immediately",
]

EXPERIENCE = [
    ("Get Fractional", "Growth Systems Consultant / Owner", "Oct 2022-Present", []),
    ("Prosper Wireless", "Director of Growth & Retention", "Sept 2023-Nov 2025", []),
    ("Dealer Acceleration Group", "Co-Founder / Chief Revenue Officer", "Jan 2022-Dec 2022", []),
    ("Affordable Insurance Quotes", "Chief Marketing Officer", "Jun 2020-Dec 2021", []),
    ("Breakthrough Academy", "Marketing Operations Manager", "Aug 2019-Jun 2021", []),
    ("SkyFineUSA", "Chief Marketing Officer / Head of Growth", "Jan 2019-Aug 2019", []),
    ("Bob's Watches", "Director of Marketing", "Jan 2017-Dec 2018", []),
    ("Swell Marketing", "SEO Manager / SEO Director", "Feb 2016-Jun 2016", []),
    ("iMarket Solutions", "SEO Manager", "May 2013-Jan 2016", []),
    ("National Positions", "SEO Specialist / Director of Special Projects", "Sep 2007-May 2013", []),
    (
        "Lowe's Home Improvement",
        "Team Leader, Paint Department",
        "Mar 2005-Feb 2007",
        [
            "Promoted into a team-lead role within six months and supported customer service, merchandising, stocking, inventory counts, opening and closing, and day-to-day department execution for a four-person team in a fast-paced retail environment.",
        ],
    ),
    (
        "Boething Treeland Nursery",
        "Guide",
        "Dec 2003-Aug 2004",
        [
            "Promoted from Loader to Guide within three months, supporting customers, loading purchases, restocking product areas, maintaining grounds, and keeping daily operations moving in a physical retail environment.",
        ],
    ),
]

BEST_FIT = [
    "Broadway barback, bar support, venue support, restaurant support, entertainment hospitality",
    "Strong fit for teams that need reliability, stamina, coachability, and no-drama support during rush periods",
]


def bullet_text(items):
    return "<br/>".join(f"- {item}" for item in items)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        rightMargin=0.52 * inch,
        leftMargin=0.52 * inch,
        topMargin=0.4 * inch,
        bottomMargin=0.38 * inch,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("ResumeName", fontName="Helvetica-Bold", fontSize=21, leading=22, textColor=NAVY, spaceAfter=0))
    styles.add(ParagraphStyle("ResumeTitle", fontName="Helvetica-Bold", fontSize=10.5, leading=11, textColor=ACCENT, spaceAfter=1))
    styles.add(ParagraphStyle("ResumeContact", fontName="Helvetica", fontSize=8.5, leading=9.5, textColor=MUTED, spaceAfter=4))
    styles.add(ParagraphStyle("ResumeSection", fontName="Helvetica-Bold", fontSize=8.7, leading=9.5, textColor=NAVY, spaceBefore=4, spaceAfter=2))
    styles.add(ParagraphStyle("ResumeBody", fontName="Helvetica", fontSize=8.15, leading=9.25, textColor=TEXT, spaceAfter=2))
    styles.add(ParagraphStyle("ResumeBullet", fontName="Helvetica", fontSize=7.95, leading=8.8, textColor=TEXT, leftIndent=7, firstLineIndent=-7, spaceAfter=0))
    styles.add(ParagraphStyle("ResumeCompany", fontName="Helvetica-Bold", fontSize=8.3, leading=8.9, textColor=TEXT, spaceBefore=1, spaceAfter=0))
    styles.add(ParagraphStyle("ResumeMeta", fontName="Helvetica", fontSize=7.65, leading=8.3, textColor=MUTED, spaceAfter=0))

    story = [
        Paragraph("Matt Dimock", styles["ResumeName"]),
        Paragraph("Barback | Broadway Bar Support", styles["ResumeTitle"]),
        Paragraph("Mount Juliet, TN  |  805-620-2826  |  mattdim805@gmail.com  |  linkedin.com/in/mattdimock/", styles["ResumeContact"]),
        Table([[""]], colWidths=[7.46 * inch], rowHeights=[1.0], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), ACCENT)])),
        Spacer(1, 2),
        Paragraph("PROFESSIONAL SUMMARY", styles["ResumeSection"]),
        Paragraph(SUMMARY, styles["ResumeBody"]),
        Paragraph("BAR READINESS", styles["ResumeSection"]),
        Paragraph(bullet_text(READINESS), styles["ResumeBullet"]),
        Paragraph("WORK EXPERIENCE", styles["ResumeSection"]),
    ]

    for company, title, dates, bullets in EXPERIENCE:
        story.append(Paragraph(company, styles["ResumeCompany"]))
        story.append(Paragraph(f"{title}  |  {dates}", styles["ResumeMeta"]))
        if bullets:
            story.append(Paragraph(bullet_text(bullets), styles["ResumeBullet"]))

    story.extend(
        [
            Paragraph("BEST FIT", styles["ResumeSection"]),
            Paragraph(bullet_text(BEST_FIT), styles["ResumeBullet"]),
        ]
    )

    doc.build(story)
    print(OUT)


if __name__ == "__main__":
    build()
