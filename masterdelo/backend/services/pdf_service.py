import os
import io
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fonts")

_FONT_REGULAR = "Helvetica"
_FONT_BOLD = "Helvetica-Bold"
_fonts_registered = False

_SYSTEM_FONT_CANDIDATES = [
    ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"),
]


def _register_fonts():
    global _fonts_registered, _FONT_REGULAR, _FONT_BOLD
    if _fonts_registered:
        return

    # Try custom fonts directory first (DejaVuSans preferred for full Cyrillic)
    regular = os.path.join(FONTS_DIR, "DejaVuSans.ttf")
    bold = os.path.join(FONTS_DIR, "DejaVuSans-Bold.ttf")
    if os.path.exists(regular) and os.path.exists(bold):
        pdfmetrics.registerFont(TTFont("CustomRegular", regular))
        pdfmetrics.registerFont(TTFont("CustomBold", bold))
        _FONT_REGULAR = "CustomRegular"
        _FONT_BOLD = "CustomBold"
        _fonts_registered = True
        return

    # Try system fonts
    for reg_path, bold_path in _SYSTEM_FONT_CANDIDATES:
        if os.path.exists(reg_path) and os.path.exists(bold_path):
            pdfmetrics.registerFont(TTFont("CustomRegular", reg_path))
            pdfmetrics.registerFont(TTFont("CustomBold", bold_path))
            _FONT_REGULAR = "CustomRegular"
            _FONT_BOLD = "CustomBold"
            _fonts_registered = True
            return

    _fonts_registered = True


def _get_styles():
    _register_fonts()
    base = _FONT_REGULAR
    bold = _FONT_BOLD

    styles = {
        "title": ParagraphStyle("title", fontName=bold, fontSize=14, spaceAfter=6, alignment=1),
        "h2": ParagraphStyle("h2", fontName=bold, fontSize=11, spaceAfter=4),
        "normal": ParagraphStyle("normal", fontName=base, fontSize=10, spaceAfter=3),
        "small": ParagraphStyle("small", fontName=base, fontSize=9, spaceAfter=2),
        "bold": ParagraphStyle("bold", fontName=bold, fontSize=10, spaceAfter=3),
        "total": ParagraphStyle("total", fontName=bold, fontSize=12, spaceAfter=6),
    }
    return styles


def _fmt_money(n) -> str:
    try:
        val = float(n)
    except (TypeError, ValueError):
        val = 0.0
    return f"{val:,.2f} руб.".replace(",", " ")


def _fmt_qty(n) -> str:
    try:
        val = float(n)
    except (TypeError, ValueError):
        val = 0.0
    if val == int(val):
        return str(int(val))
    return f"{val:.3f}".rstrip("0")


def generate_invoice(order, user, client) -> bytes:
    """Генерация счёта на оплату"""
    _register_fonts()
    styles = _get_styles()
    buf = io.BytesIO()

    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
    )

    story = []
    today = date.today().strftime("%d.%m.%Y")
    doc_num = order.id[:8].upper()

    story.append(Paragraph(f"СЧЁТ НА ОПЛАТУ №{doc_num} от {today}", styles["title"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black))
    story.append(Spacer(1, 4 * mm))

    # Исполнитель
    executor_lines = [f"<b>Исполнитель:</b> {user.full_name or '—'}"]
    if user.company_name:
        executor_lines.append(user.company_name)
    if user.inn:
        executor_lines.append(f"ИНН: {user.inn}")
    if user.phone:
        executor_lines.append(f"Тел: {user.phone}")
    story.append(Paragraph("<br/>".join(executor_lines), styles["normal"]))

    # Заказчик
    client_lines = [f"<b>Заказчик:</b> {client.name if client else '—'}"]
    if client and client.phone:
        client_lines.append(f"Тел: {client.phone}")
    story.append(Paragraph("<br/>".join(client_lines), styles["normal"]))

    story.append(Spacer(1, 4 * mm))

    # Описание
    story.append(Paragraph(f"<b>Работы:</b> {order.title}", styles["normal"]))
    if order.description:
        story.append(Paragraph(order.description, styles["small"]))

    story.append(Spacer(1, 4 * mm))

    # Таблица позиций
    items = list(order.items) if order.items else []
    total_cost = sum(float(item.cost) * float(item.quantity) for item in items)
    labor = float(order.price) - total_cost

    table_data = [["Наименование", "Кол-во", "Ед.", "Цена", "Сумма"]]
    for item in items:
        qty = float(item.quantity)
        cost = float(item.cost)
        table_data.append([
            item.name,
            _fmt_qty(qty),
            item.unit or "шт",
            _fmt_money(cost),
            _fmt_money(qty * cost),
        ])

    if total_cost > 0:
        table_data.append(["Итого по материалам", "", "", "", _fmt_money(total_cost)])
    if labor > 0:
        table_data.append(["Работа и услуги", "", "", "", _fmt_money(labor)])

    table_data.append(["ИТОГО К ОПЛАТЕ", "", "", "", _fmt_money(order.price)])

    col_widths = [85 * mm, 20 * mm, 15 * mm, 30 * mm, 30 * mm]
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("FONTNAME", (0, 0), (-1, 0), _FONT_BOLD),
        ("FONTNAME", (0, 1), (-1, -2), _FONT_REGULAR),
        ("FONTNAME", (0, -1), (-1, -1), _FONT_BOLD),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -2), 0.5, colors.grey),
        ("BOX", (0, -1), (-1, -1), 1, colors.black),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(table)
    story.append(Spacer(1, 4 * mm))

    prepayment = float(order.prepayment)
    balance = float(order.price) - prepayment

    if prepayment > 0:
        story.append(Paragraph(f"Получен аванс: {_fmt_money(prepayment)}", styles["normal"]))

    story.append(Paragraph(f"К доплате: {_fmt_money(balance)}", styles["total"]))

    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(f"_________________________ {user.full_name or ''}", styles["normal"]))

    doc.build(story)
    return buf.getvalue()


def generate_act(order, user, client) -> bytes:
    """Генерация акта выполненных работ"""
    _register_fonts()
    styles = _get_styles()
    buf = io.BytesIO()

    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
    )

    story = []
    today = date.today().strftime("%d.%m.%Y")
    doc_num = order.id[:8].upper()

    story.append(Paragraph(f"АКТ ВЫПОЛНЕННЫХ РАБОТ №{doc_num} от {today}", styles["title"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black))
    story.append(Spacer(1, 4 * mm))

    executor_lines = [f"<b>Исполнитель:</b> {user.full_name or '—'}"]
    if user.company_name:
        executor_lines.append(user.company_name)
    if user.inn:
        executor_lines.append(f"ИНН: {user.inn}")
    if user.phone:
        executor_lines.append(f"Тел: {user.phone}")
    story.append(Paragraph("<br/>".join(executor_lines), styles["normal"]))

    client_lines = [f"<b>Заказчик:</b> {client.name if client else '—'}"]
    if client and client.phone:
        client_lines.append(f"Тел: {client.phone}")
    story.append(Paragraph("<br/>".join(client_lines), styles["normal"]))

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(
        "Исполнитель выполнил, а Заказчик принял следующие работы:",
        styles["bold"],
    ))
    story.append(Spacer(1, 2 * mm))

    items = list(order.items) if order.items else []
    total_cost = sum(float(item.cost) * float(item.quantity) for item in items)
    labor = float(order.price) - total_cost

    table_data = [["Наименование", "Кол-во", "Ед.", "Цена", "Сумма"]]
    for item in items:
        qty = float(item.quantity)
        cost = float(item.cost)
        table_data.append([
            item.name,
            _fmt_qty(qty),
            item.unit or "шт",
            _fmt_money(cost),
            _fmt_money(qty * cost),
        ])

    if labor > 0:
        table_data.append(["Работа и услуги", "", "", "", _fmt_money(labor)])

    table_data.append(["ИТОГО", "", "", "", _fmt_money(order.price)])

    col_widths = [85 * mm, 20 * mm, 15 * mm, 30 * mm, 30 * mm]
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("FONTNAME", (0, 0), (-1, 0), _FONT_BOLD),
        ("FONTNAME", (0, 1), (-1, -2), _FONT_REGULAR),
        ("FONTNAME", (0, -1), (-1, -1), _FONT_BOLD),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -2), 0.5, colors.grey),
        ("BOX", (0, -1), (-1, -1), 1, colors.black),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(table)
    story.append(Spacer(1, 6 * mm))

    story.append(Paragraph(
        "Работы выполнены в полном объёме, в установленные сроки, претензий нет.",
        styles["normal"],
    ))

    story.append(Spacer(1, 10 * mm))

    sign_data = [
        [
            Paragraph("<b>ИСПОЛНИТЕЛЬ</b>", styles["small"]),
            Paragraph("<b>ЗАКАЗЧИК</b>", styles["small"]),
        ],
        [
            Paragraph(f"{user.full_name or ''}", styles["small"]),
            Paragraph(f"{client.name if client else '—'}", styles["small"]),
        ],
        [
            Paragraph("Подпись: _________________________", styles["small"]),
            Paragraph("Подпись: _________________________", styles["small"]),
        ],
        [
            Paragraph("Дата: ___________________________", styles["small"]),
            Paragraph("Дата: ___________________________", styles["small"]),
        ],
    ]
    sign_table = Table(sign_data, colWidths=[90 * mm, 90 * mm])
    sign_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(sign_table)

    doc.build(story)
    return buf.getvalue()
