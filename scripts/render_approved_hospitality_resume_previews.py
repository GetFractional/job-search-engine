from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path("/Users/mattdimock/Documents/Jobs/Job Search")
OUT_DIR = ROOT / "applications" / "hospitality-lanes"

PDF_INK = colors.HexColor("#111827")
PDF_MUTED = colors.HexColor("#4B5563")
PDF_RULE = colors.HexColor("#D1D5DB")
PDF_PANEL = colors.HexColor("#F7F7F5")

CONTACT = "Mount Juliet, TN  |  805-620-2826  |  mattdim805@gmail.com  |  linkedin.com/in/mattdimock/"

BASE_EXPERIENCE = [
    (
        "The Farm House Restaurant",
        "Server / Bar Support",
        "May 2026 - Present",
        [
            "Serve guests and support floor execution in high-volume shifts with 160+ reservations, staying organized across table numbers, seat positions, pacing, side work, and guest flow.",
            "Support bar and service teams by running alcohol, garnishing drinks, pulling ice, stocking supplies, setting tables, bussing, running food, solving small service issues, and helping coworkers protect the guest experience.",
        ],
    ),
    (
        "Get Fractional",
        "Growth Systems Consultant / Owner",
        "Oct 2022 - Present",
        [
            "Own growth and operating-system work for ecommerce and B2B clients, turning messy priorities into campaign calendars, dashboards, vendor coordination, site improvements, and accountable follow-through.",
            "For OC Ramps, manage Shopify growth execution across SEO, email, onsite conversion, reporting, and agency coordination; helped deliver a record December 2025 month and a 39% H2 vs H1 monthly revenue lift after re-engaging campaign management.",
        ],
    ),
    (
        "Prosper Wireless",
        "Director of Growth & Retention",
        "Sept 2023 - Nov 2025",
        [
            "Built training, onboarding, lifecycle, and support systems for a high-volume telecom operation serving roughly 600K+ activations and customers, reducing onboarding burden by about 50%.",
            "Operated as a right-hand systems leader under shifting program, compliance, partner, and customer demands, keeping execution organized when speed and detail both mattered.",
        ],
    ),
    (
        "Dealer Acceleration Group",
        "Co-Founder / Chief Revenue Officer",
        "Jan 2022 - Dec 2022",
        [
            "Co-founded a fast-moving startup, helped raise $300K in seed funding, and directed 3 major pivots in 12 months based on market signal, customer conversations, and unit economics.",
        ],
    ),
    (
        "Affordable Insurance Quotes",
        "Chief Marketing Officer",
        "Jun 2020 - Dec 2021",
        [
            "Helped scale a customer-facing insurance business from about $290K to $2M in 18 months by improving follow-up, sales systems, affiliate operations, and day-to-day operating structure.",
            "Generated 30K+ leads at a 55% conversion rate and helped build the operating framework that expanded the business from 1 to 16 states.",
        ],
    ),
    (
        "Breakthrough Academy",
        "Marketing Operations Manager",
        "Aug 2019 - Jun 2021",
        [
            "Coordinated events, webinars, partners, vendors, and internal teams in a service-driven membership business where timing, presentation, and responsiveness shaped the customer experience.",
            "Built partner-led webinar and event systems that achieved 30%+ conversion rates and outperformed the prior top event channel.",
        ],
    ),
    (
        "SkyFineUSA",
        "Chief Marketing Officer / Head of Growth",
        "Jan 2019 - Aug 2019",
        [
            "Led ecommerce and operational execution in a fast-paced retail business, coordinating priorities across sales, product, reporting, QA, billing, vendor servicing, inventory, and shipping.",
        ],
    ),
    (
        "Bob's Watches",
        "Director of Marketing",
        "Jan 2017 - Dec 2018",
        [
            "Helped grow luxury ecommerce revenue from $20.5M to $45M in 24 months while leading a 9-person team and 15+ vendors in a business where trust, timing, accuracy, and presentation were revenue-critical.",
        ],
    ),
    (
        "Swell Marketing",
        "SEO Manager / SEO Director",
        "Feb 2016 - Jun 2016",
        [
            "Earned promotion to SEO Director within three months while improving SOPs, onboarding, team execution, and client communication in a demanding agency environment.",
        ],
    ),
    (
        "iMarket Solutions",
        "SEO Manager",
        "May 2013 - Jan 2016",
        [
            "Recruited, trained, and managed a five-person team while overseeing 400+ client accounts at the team level and personally managing 45 VIP client relationships.",
        ],
    ),
    (
        "National Positions",
        "SEO Specialist / Director of Special Projects",
        "Sep 2007 - May 2013",
        [
            "Managed more than 120 client accounts per month earlier in tenure, building durable habits around pace, recall, issue tracking, customer communication, and follow-through.",
        ],
    ),
    (
        "Lowe's Home Improvement",
        "Team Leader, Paint Department",
        "Mar 2005 - Feb 2007",
        [
            "Promoted into a team-lead role within six months and helped run a four-person department through customer service, stocking, merchandising, inventory counts, opening, closing, and hands-on floor execution.",
        ],
    ),
    (
        "Boething Treeland Nursery",
        "Guide",
        "Dec 2003 - Aug 2004",
        [
            "Promoted from Loader to Guide within three months, supporting customers, loading, restocking, grounds upkeep, and physically demanding daily operations in a fast-paced retail environment.",
        ],
    ),
]

VARIANTS = [
    {
        "target": "Server | Bartender | Barback",
        "outputs": [
            "Matt Dimock - Hospitality Resume - Farm House Preview.pdf",
            "Matt Dimock - Hospitality Resume.pdf",
        ],
        "summary": (
            "High-ownership hospitality and customer-facing operator with active restaurant floor and bar-support experience, plus 19 years across demanding customers, sales, operations, retail, training, and service-driven environments. "
            "Best fit: server, barback, or bartender-track roles where maturity, fast recall, stamina, calm under pressure, and team-first execution matter. "
            "Open availability, nights and weekends, reliable transportation, and TABC certified."
        ),
        "highlight": (
            "Brings owner-level judgment, high-volume guest service, strong memory, physical stamina, process discipline, and no-ego support for whatever keeps service moving."
        ),
        "skills": [
            ("Guest Service & Sales", "Warm presence; demanding customer communication; recovery judgment; upsell awareness; repeat-guest mindset; polished follow-through."),
            ("Bar & Floor Readiness", "TABC certified; bar support; alcohol running; drink garnishing; stocking; restocking; table setup; bussing; food running; clean handoffs."),
            ("Pace, Memory & Detail", "Fast menu learning; table and seat-number recall; multitasking; checklists; accuracy under pressure; strong attention to small details."),
            ("Reliability & Stamina", "Open availability; nights and weekends; physically fit; 10K+ daily steps; gym-active; heavy-lifting comfort; steady energy."),
            ("Ownership & Team Fit", "No ego; takes direction; communicates clearly; solves problems; supports coworkers; protects the guest experience."),
        ],
    },
    {
        "target": "Barback | Bartender Support | Server",
        "outputs": [
            "Matt Dimock - Barback Resume - Farm House Preview.pdf",
            "Matt Dimock - Barback Resume.pdf",
        ],
        "summary": (
            "High-ownership hospitality and customer-facing operator with active bar-support, floor-support, and guest-service reps in a high-volume restaurant environment, backed by 19 years across demanding customers, sales, operations, retail, training, and service-driven work. "
            "Best fit: barback or bartender-support roles where pace, stamina, clean handoffs, communication, and team-first execution matter. "
            "Open availability, nights and weekends, reliable transportation, and TABC certified."
        ),
        "highlight": (
            "Brings reliable support for bartenders and servers, fast recall, strong physical pace, calm problem-solving, and no-ego execution that keeps service moving."
        ),
        "skills": [
            ("Bar Support", "TABC certified; alcohol running; drink garnishing; ice pulls; stocking; restocking; supply readiness; clean handoffs; bartender support."),
            ("Floor Support", "Table setup; bussing; food running; service-area resets; side work; clean stations; guest-flow awareness; team communication."),
            ("Pace, Memory & Detail", "Fast menu learning; table and seat-number recall; multitasking; checklists; accuracy under pressure; strong attention to small details."),
            ("Reliability & Stamina", "Open availability; nights and weekends; physically fit; 10K+ daily steps; gym-active; heavy-lifting comfort; steady energy."),
            ("Ownership & Team Fit", "No ego; takes direction; communicates clearly; solves problems; supports coworkers; protects the guest experience."),
        ],
    },
]


def add_pdf_header(story, styles, target):
    story.extend(
        [
            Paragraph("Matt Dimock", styles["Name"]),
            Paragraph(target, styles["Target"]),
            Paragraph(CONTACT, styles["Contact"]),
            Table([[""]], colWidths=[7.15 * inch], rowHeights=[0.75], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), PDF_RULE)])),
            Spacer(1, 11),
        ]
    )


def add_pdf_experience(story, styles, entries):
    for company, title, dates, bullets in entries:
        story.append(Paragraph(company, styles["Company"]))
        story.append(Paragraph(f"{title}  |  {dates}", styles["Meta"]))
        for bullet in bullets:
            story.append(Paragraph(bullet, styles["ResumeBullet"], bulletText="-"))


def build_pdf(variant, output_name):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUT_DIR / output_name
    doc = SimpleDocTemplate(
        str(output),
        pagesize=letter,
        rightMargin=0.58 * inch,
        leftMargin=0.58 * inch,
        topMargin=0.52 * inch,
        bottomMargin=0.48 * inch,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("Name", fontName="Helvetica-Bold", fontSize=22.5, leading=23.5, textColor=PDF_INK, spaceAfter=1))
    styles.add(ParagraphStyle("Target", fontName="Helvetica-Bold", fontSize=9.3, leading=10.5, textColor=PDF_MUTED, spaceAfter=1))
    styles.add(ParagraphStyle("Contact", fontName="Helvetica", fontSize=8.0, leading=9.0, textColor=PDF_MUTED, spaceAfter=5))
    styles.add(ParagraphStyle("Section", fontName="Helvetica-Bold", fontSize=8.1, leading=9.0, textColor=PDF_INK, spaceBefore=9, spaceAfter=4))
    styles.add(ParagraphStyle("Body", fontName="Helvetica", fontSize=8.2, leading=9.5, textColor=PDF_INK, spaceAfter=5))
    styles.add(ParagraphStyle("BodyBold", fontName="Helvetica-Bold", fontSize=8.05, leading=9.2, textColor=PDF_INK, spaceAfter=5))
    styles.add(ParagraphStyle("SkillLabel", fontName="Helvetica-Bold", fontSize=7.35, leading=8.2, textColor=PDF_INK, spaceAfter=0))
    styles.add(ParagraphStyle("SkillBody", fontName="Helvetica", fontSize=7.25, leading=8.25, textColor=PDF_INK, spaceAfter=0))
    styles.add(ParagraphStyle("Company", fontName="Helvetica-Bold", fontSize=8.8, leading=9.6, textColor=PDF_INK, spaceBefore=6.0, spaceAfter=0.3))
    styles.add(ParagraphStyle("Meta", fontName="Helvetica-Oblique", fontSize=7.55, leading=8.3, textColor=PDF_MUTED, spaceAfter=0.3))
    styles.add(ParagraphStyle("ResumeBullet", fontName="Helvetica", fontSize=7.55, leading=8.65, textColor=PDF_INK, leftIndent=8, bulletIndent=0, spaceAfter=0.5))

    skill_rows = []
    for label, body in variant["skills"]:
        skill_rows.append([Paragraph(label, styles["SkillLabel"]), Paragraph(body, styles["SkillBody"])])
    skill_table = Table(skill_rows, colWidths=[1.55 * inch, 5.49 * inch])
    skill_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PDF_PANEL),
                ("BOX", (0, 0), (-1, -1), 0.35, PDF_RULE),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, PDF_RULE),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )

    story = []
    add_pdf_header(story, styles, variant["target"])
    story.append(Paragraph("SUMMARY", styles["Section"]))
    story.append(Paragraph(variant["summary"], styles["Body"]))
    story.append(Paragraph(variant["highlight"], styles["BodyBold"]))
    story.append(Paragraph("SKILLS", styles["Section"]))
    story.append(skill_table)
    story.append(Paragraph("EXPERIENCE", styles["Section"]))
    add_pdf_experience(story, styles, BASE_EXPERIENCE[:6])
    story.append(PageBreak())
    add_pdf_header(story, styles, variant["target"])
    story.append(Paragraph("EXPERIENCE", styles["Section"]))
    add_pdf_experience(story, styles, BASE_EXPERIENCE[6:])

    doc.build(story)
    return output


def main():
    for variant in VARIANTS:
        for output_name in variant["outputs"]:
            print(build_pdf(variant, output_name))


if __name__ == "__main__":
    main()
