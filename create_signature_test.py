#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

OUTPUT_DIR = "/Users/ywlee/sideproejct/word_extention/test_documents"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Create Transparent Stamp Image (RGBA)
img_size = 200
stamp = Image.new("RGBA", (img_size, img_size), (255, 255, 255, 0))
draw = ImageDraw.Draw(stamp)

# Red circular border
border_color = (220, 40, 40, 230)
draw.ellipse([10, 10, img_size - 10, img_size - 10], outline=border_color, width=6)
draw.ellipse([18, 18, img_size - 18, img_size - 18], outline=border_color, width=2)

# Stamp text
try:
    font = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 36)
except Exception:
    font = ImageFont.load_default()

text = "홍길동인"
draw.text((38, 76), text, fill=border_color, font=font)

stamp_png_path = os.path.join(OUTPUT_DIR, "stamp_transparent.png")
stamp.save(stamp_png_path, "PNG")

# 2. Create JPG version with white background (common user scan)
stamp_jpg = Image.new("RGB", (img_size, img_size), (255, 255, 255))
draw_jpg = ImageDraw.Draw(stamp_jpg)
draw_jpg.ellipse([10, 10, img_size - 10, img_size - 10], outline=border_color, width=6)
draw_jpg.ellipse([18, 18, img_size - 18, img_size - 18], outline=border_color, width=2)
draw_jpg.text((38, 76), text, fill=border_color, font=font)
stamp_jpg_path = os.path.join(OUTPUT_DIR, "stamp_white_bg.jpg")
stamp_jpg.save(stamp_jpg_path, "JPEG")

print("Created stamps:", stamp_png_path, stamp_jpg_path)

# 3. Create Contract / Certificate Document
doc = Document()

p_title = doc.add_paragraph()
r_title = p_title.add_run("표 준 근 로 계 약 서")
r_title.bold = True
r_title.font.size = Pt(22)
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph()
doc.add_paragraph("사업주 (주)워드크래프트(이하 '갑'이라 함)과 근로자 홍길동(이하 '을'이라 함)은 다음과 같이 근로계약을 체결한다.")
doc.add_paragraph("1. 근로계약기간: 2026년 11월 1일부터 2027년 10월 31일까지")
doc.add_paragraph("2. 근무장소: 서울특별시 강남구 테헤란로 워드크래프트 연구소")
doc.add_paragraph("3. 업무의 내용: 순수 Rust 기반 고성능 워드프로세서 코어 엔진 개발")
doc.add_paragraph("4. 소정근로시간: 09시 00분부터 18시 00분까지 (휴게시간 1시간 포함)")
doc.add_paragraph()
doc.add_paragraph("위 계약 사실을 증명하기 위하여 본 계약서 2통을 작성하여 각자 1통씩 보관한다.")
doc.add_paragraph()
doc.add_paragraph("2026년 11월 01일")
doc.add_paragraph()

# Signature section with placeholder for stamp
p_sig = doc.add_paragraph()
p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r_sig1 = p_sig.add_run("사업주: (주)워드크래프트 대표이사 이 영 우  (직인)      \n\n")
r_sig1.font.size = Pt(13)
r_sig1.bold = True

r_sig2 = p_sig.add_run("근로자: 성명  홍  길  동  (서명 또는 인)")
r_sig2.font.size = Pt(13)
r_sig2.bold = True

docx_path = os.path.join(OUTPUT_DIR, "signature_contract_test.docx")
doc.save(docx_path)
print("Created document:", docx_path)
