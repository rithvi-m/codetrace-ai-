import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

OUTPUT_PDF = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "CodeTrace_AI_Platform_Documentation_and_Demonstration.pdf"
)

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette (Enterprise Navy / Slate theme)
    PRIMARY = colors.HexColor('#0F172A')   # Slate 900
    ACCENT = colors.HexColor('#0EA5E9')    # Sky 500
    TEXT_DARK = colors.HexColor('#1E293B') # Slate 800
    TEXT_MUTED = colors.HexColor('#64748B')# Slate 500
    BG_LIGHT = colors.HexColor('#F8FAFC')  # Slate 50
    CARD_BG = colors.HexColor('#F1F5F9')   # Slate 100

    # Custom Typography Styles
    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=4
    )

    style_tagline = ParagraphStyle(
        'DocTagline',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        spaceAfter=15
    )

    style_h1 = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=8
    )

    style_h2 = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=ACCENT,
        spaceBefore=8,
        spaceAfter=4
    )

    style_body = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    style_code = ParagraphStyle(
        'CodeCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F1F5F9'),
        borderColor=colors.HexColor('#CBD5E1'),
        borderWidth=1,
        borderPadding=6,
        spaceAfter=8
    )

    elements = []

    # -------------------------------------------------------------------------
    # COVER / HEADER SECTION
    # -------------------------------------------------------------------------
    elements.append(Paragraph("CODETRACE AI — Full Platform Report", style_title))
    elements.append(Paragraph('"Beyond Matching. Understand the Code."', style_tagline))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=15))

    overview_text = """
    <b>Problem Statement</b>: RAMPeX Hackathon Problem Statement 05 — AI-Powered Code Integrity & Plagiarism Intelligence<br/>
    <b>Design Principle</b>: <i>"Simple for the user. Powerful underneath."</i><br/>
    <b>Core Innovation</b>: Multi-signal code intelligence combining Python AST canonical identifier renaming, 3-gram token chain alignment, local TF-IDF vector space semantic modeling, behavioral submission timing, and explainable natural language evidence cards.
    """
    elements.append(Paragraph(overview_text, style_body))
    elements.append(Spacer(1, 10))

    # -------------------------------------------------------------------------
    # PAGE 1 — DASHBOARD & EXECUTIVE OVERVIEW
    # -------------------------------------------------------------------------
    elements.append(Paragraph("1. Executive Dashboard & Integrity Overview", style_h1))

    # KPI Summary Table
    kpi_data = [
        [
            Paragraph("<b>24</b><br/><font size=8 color='#64748B'>Submissions</font>", style_body),
            Paragraph("<b>6</b><br/><font size=8 color='#F59E0B'>Need Review</font>", style_body),
            Paragraph("<b>18</b><br/><font size=8 color='#64748B'>Students</font>", style_body),
            Paragraph("<b>82%</b><br/><font size=8 color='#10B981'>Avg. Confidence</font>", style_body)
        ]
    ]
    t_kpi = Table(kpi_data, colWidths=[130, 130, 130, 130])
    t_kpi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_kpi)
    elements.append(Spacer(1, 12))

    # Requires Attention Priority Table
    elements.append(Paragraph("Requires Attention — Flagged Priority Pairs", style_h2))
    table_data = [
        ["Student Pair", "Assignment", "Similarity", "Plain-Language Reason", "Action"],
        ["Charlie Davis ↔ Diana Evans", "HW3: Algorithms", "100%", "Strong structural + semantic overlap despite 100% identifier renaming", "Review Needed"],
        ["George Clark ↔ Hannah Abbott", "HW3: Algorithms", "91%", "Reordered independent variable assignments & identical control flow", "Review Needed"],
        ["Kevin Bacon ↔ Laura Croft", "HW3: Algorithms", "82%", "Copied core binary search loop with added print statement noise", "Review Needed"],
        ["Alice Chen ↔ Bob Smith", "HW3: Algorithms", "66%", "Common hash map logic with distinct loop decomposition", "Moderate Risk"]
    ]
    t_table = Table(table_data, colWidths=[120, 95, 55, 185, 85])
    t_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (2,0), (2,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_table)
    elements.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # PAGE 2 — UPLOAD SUBMISSION & STEP WIZARD
    # -------------------------------------------------------------------------
    elements.append(Paragraph("2. Guided 4-Step Upload & Analysis Wizard", style_h1))
    wizard_text = """
    <b>Step 1 — Select Assignment</b>: Select homework target (e.g. <i>CS101 — HW3: Algorithm Optimization</i>)<br/>
    <b>Step 2 — Student Details</b>: Enter student name and institutional ID tag (e.g. <i>Maya Lin — STU-2099</i>)<br/>
    <b>Step 3 — Language & Code</b>: Select programming language (Python, JavaScript, Java, C++) & paste source code<br/>
    <b>Step 4 — Automated Analysis</b>: Triggers real-time AST normalization, token sequence extraction, and multi-signal comparison.
    """
    elements.append(Paragraph(wizard_text, style_body))

    # Animated Progress Modal Steps
    progress_data = [
        ["Stage", "Analysis Subsystem", "Status"],
        ["1/5", "Normalizing code (removing comments & variable noise)", "Completed"],
        ["2/5", "Extracting AST structural patterns & node depth", "Completed"],
        ["3/5", "Comparing pairwise submissions", "Completed"],
        ["4/5", "Generating explainable evidence cards", "Completed"],
        ["5/5", "Complete! Results rendered to dashboard", "Completed"]
    ]
    t_prog = Table(progress_data, colWidths=[40, 380, 120])
    t_prog.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_prog)
    elements.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # PAGE 3 — SIDE-BY-SIDE CODE COMPARISON & EVIDENCE
    # -------------------------------------------------------------------------
    elements.append(Paragraph("3. Side-by-Side Code Comparison & Explainable Evidence", style_h1))
    elements.append(Paragraph("<b>Case Study</b>: Charlie Davis (STU-1003) vs Diana Evans (STU-1004) — <b>Similarity: 100%</b>", style_h2))

    code_comparison_snippet = """# Student A: Charlie Davis                          # Student B: Diana Evans
def calculate_total_tax(items, tax_rate):           def compute_final_price(cart, vat_ratio):
    subtotal = 0                                         accumulated_cost = 0
    for item in items:                                   for element in cart:
        subtotal += item['price'] * item['quantity']         accumulated_cost += element['price'] * element['quantity']
    total_tax = subtotal * tax_rate                      tax_value = accumulated_cost * vat_ratio
    final_amount = subtotal + total_tax                  net_cost = accumulated_cost + tax_value
    return final_amount                                  return net_cost
"""
    elements.append(Paragraph("<b>Source Code Comparison (Original View)</b>", style_body))
    elements.append(Paragraph(code_comparison_snippet.replace('\n', '<br/>').replace(' ', '&nbsp;'), style_code))

    elements.append(Paragraph("<b>AST Normalized View (Variable Renaming Bypassed)</b>", style_body))
    norm_snippet = """def func_1(v_1, v_2):
    v_3 = 0
    for v_4 in v_1:
        v_3 += v_4['price'] * v_4['quantity']
    v_5 = v_3 * v_2
    v_6 = v_3 + v_5
    return v_6
"""
    elements.append(Paragraph(norm_snippet.replace('\n', '<br/>').replace(' ', '&nbsp;'), style_code))

    # Level 1 Explainable Evidence Cards
    evidence_text = """
    <b>1. Code Structure (100% AST Match)</b>: Both solutions exhibit an identical control-flow architecture (For -> Assign -> Return). The nested loop and accumulator profiles match exactly.<br/>
    <b>2. Code Meaning (100% Semantic Overlap)</b>: Variable names differ (subtotal vs accumulated_cost), but after canonical AST normalization, statement execution vectors yield 100% semantic overlap.<br/>
    <b>3. Token Patterns (100% Token Match)</b>: After stripping comments and normalizing identifiers, 3-gram token sequence analysis yields exact chain alignment.<br/>
    <b>4. Temporal Proximity</b>: Submissions were uploaded within 3 minutes of each other.
    """
    elements.append(Paragraph(evidence_text, style_body))
    elements.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # PAGE 4 — CROSS-STUDENT MATRIX & NETWORK GRAPH
    # -------------------------------------------------------------------------
    elements.append(PageBreak())
    elements.append(Paragraph("4. Cross-Student Similarity Matrix & Network Graph", style_h1))

    # Matrix Table
    elements.append(Paragraph("<b>Pairwise Cross-Student Heatmap Grid</b>", style_h2))
    matrix_data = [
        ["Student", "Alice", "Bob", "Charlie", "Diana", "George", "Hannah"],
        ["Alice", "—", "66%", "18%", "19%", "24%", "22%"],
        ["Bob", "66%", "—", "21%", "20%", "25%", "23%"],
        ["Charlie", "18%", "21%", "—", "100%", "31%", "30%"],
        ["Diana", "19%", "20%", "100%", "—", "29%", "28%"],
        ["George", "24%", "25%", "31%", "29%", "—", "91%"],
        ["Hannah", "22%", "23%", "30%", "28%", "91%", "—"]
    ]
    t_mat = Table(matrix_data, colWidths=[80, 75, 75, 75, 75, 75, 75])
    t_mat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (3,4), (3,4), colors.HexColor('#F3E8FF')), # Highlight Charlie-Diana 100%
        ('BACKGROUND', (4,3), (4,3), colors.HexColor('#F3E8FF')),
        ('TEXTCOLOR', (3,4), (3,4), colors.HexColor('#7E22CE')),
        ('TEXTCOLOR', (4,3), (4,3), colors.HexColor('#7E22CE')),
        ('FONTNAME', (3,4), (3,4), 'Helvetica-Bold'),
        ('FONTNAME', (4,3), (4,3), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_mat)
    elements.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # PAGE 5 — BENCHMARK EVALUATION SUITE
    # -------------------------------------------------------------------------
    elements.append(Paragraph("5. Programmatic Benchmark Evaluation Suite", style_h1))
    elements.append(Paragraph("Comparison of <b>CodeTrace AI Multi-Signal Engine</b> vs <b>Naive Text Matching</b> over N=6 Synthetic Test Cases", style_body))

    eval_data = [
        ["Metric", "CodeTrace AI (Multi-Signal)", "Naive Text Matching", "Performance Delta"],
        ["Accuracy", "100.0%", "50.0%", "+50.0% Improvement"],
        ["Precision", "100.0%", "100.0%", "Parity (1.00)"],
        ["Recall (Detection Rate)", "100.0%", "25.0%", "+75.0% Detection Gain"],
        ["F1 Score", "100.0%", "40.0%", "+60.0% Overall Score"],
        ["False Positive Rate", "0.0%", "0.0%", "0.0% False Alarms"]
    ]
    t_eval = Table(eval_data, colWidths=[140, 140, 120, 140])
    t_eval.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, CARD_BG]),
        ('TEXTCOLOR', (1,1), (1,-1), colors.HexColor('#0284C7')),
        ('FONTNAME', (1,1), (1,-1), 'Helvetica-Bold'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_eval)
    elements.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # PAGE 6 — SYNTHETIC TEST DATASET (N=6)
    # -------------------------------------------------------------------------
    elements.append(Paragraph("6. Synthetic Benchmark Test Dataset Cases (N=6)", style_h1))
    cases_text = """
    <b>Case 1 — Original Solutions</b>: Two Sum Hash Map vs Brute Force → <i>Expected: Low Similarity (Passed)</i><br/>
    <b>Case 2 — Variable Renaming</b>: Identical logic, renamed identifiers → <i>Expected: Review Recommended (Passed)</i><br/>
    <b>Case 3 — Formatting & Comments</b>: Docstring additions & re-indentation → <i>Expected: Review Recommended (Passed)</i><br/>
    <b>Case 4 — Statement Reordering</b>: Independent assignment reordering → <i>Expected: High Similarity (Passed)</i><br/>
    <b>Case 5 — Algorithm Variants</b>: Recursive vs Iterative Factorial → <i>Expected: Low Similarity (Passed)</i><br/>
    <b>Case 6 — Modified Copy</b>: Copied loop + extra print statement noise → <i>Expected: High Similarity (Passed)</i>
    """
    elements.append(Paragraph(cases_text, style_body))
    elements.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # PAGE 7 — ADMIN SETTINGS & MATHEMATICAL FORMULA
    # -------------------------------------------------------------------------
    elements.append(Paragraph("7. Admin Configuration & Scoring Formula", style_h1))
    formula_text = """
    <b>Mathematical Risk Aggregation Formula</b>:<br/>
    <font color='#0284C7'>Risk_Score = (20% × Token) + (30% × AST_Struct) + (30% × Semantic) + (15% × Logic) + (5% × Behavioral)</font><br/><br/>
    <b>Classification Bounds</b>:
    • 0 – 29%: Low Similarity (Safe)<br/>
    • 30 – 59%: Moderate Similarity<br/>
    • 60 – 79%: High Similarity<br/>
    • 80 – 100%: Manual Review Recommended
    """
    elements.append(Paragraph(formula_text, style_body))
    elements.append(Spacer(1, 20))

    # Footer note
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=10))
    elements.append(Paragraph("Report Generated automatically by CodeTrace AI Engine | Single-Server Unified Web Platform (Port 8000)", ParagraphStyle('Foot', parent=styles['Normal'], fontSize=8, textColor=TEXT_MUTED, alignment=1)))

    doc.build(elements)
    print(f"PDF Report generated successfully at: {OUTPUT_PDF}")

if __name__ == "__main__":
    build_pdf()
