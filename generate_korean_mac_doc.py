#!/usr/bin/env python3
import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

OUTPUT_DIR = "/Users/ywlee/sideproejct/word_extention/test_documents"
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILE_PATH = os.path.join(OUTPUT_DIR, "korean_mac_qa_test.docx")

doc = Document()

# Page Margins
for section in doc.sections:
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

# Title
p_title = doc.add_paragraph()
r_title = p_title.add_run("WordCraft macOS 네이티브 종합 QA 검증 보고서")
r_title.bold = True
r_title.font.size = Pt(20)
r_title.font.color.rgb = RGBColor(24, 76, 120)
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

p_sub = doc.add_paragraph()
r_sub = p_sub.add_run("한국어 패치 · 말머리 기호(Bullets) · 번호 매기기(Numbering) · 다단 나누기(Columns)")
r_sub.font.size = Pt(11)
r_sub.font.color.rgb = RGBColor(100, 110, 125)
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Horizontal Divider
p_div = doc.add_paragraph()
r_div = p_div.add_run("―" * 52)
r_div.font.color.rgb = RGBColor(200, 210, 220)
p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER

# 1. 한국어 패치 및 CJK 텍스트 검증
h1 = doc.add_heading("1. 한국어 패치 및 고품질 CJK 폰트 렌더링 검증", level=1)
p1 = doc.add_paragraph(
    "WordCraft는 Apple Silicon(M-series) Mac 환경에서 Metal GPU 가속과 HarfRust 텍스트 셰이핑을 통해 "
    "한글 고유의 완성형 및 복합 자모를 번짐이나 글리프 깨짐 없이 미려하게 렌더링합니다."
)
p1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

p_complex = doc.add_paragraph()
r_c1 = p_complex.add_run("• 복합 자모 및 겹받침 음절 검증: ")
r_c1.bold = True
r_c2 = p_complex.add_run(
    "닭의 모가지를 비틀어도 새벽은 온다. 흙을 밟다. 물건을 훑다. 날씨가 갰다. "
    "똠방각하의 일기. 믜리도 괴리도 업시. 삷, 괾, 곬, 늣, 덪, 뗏목, 뾱뾱이."
)
r_c2.font.color.rgb = RGBColor(180, 40, 40)

# 2. 말머리 기호 및 번호 매기기 (Bullets & Numbering)
doc.add_heading("2. 말머리 기호(Bullets) 및 순서 번호 매기기(Numbering)", level=1)

p_b_intro = doc.add_paragraph("WordCraft 주요 아키텍처 및 핵심 모듈 목록 (글머리 기호):")
p_b_intro.bold = True

doc.add_paragraph("Core Document Model (crates/doc) — 트랜잭션 기반 무손실 문서 트리 구조", style='List Bullet')
doc.add_paragraph("Layout & Pagination Engine (crates/layout) — 고정밀 라인 브레이킹 및 페이지네이션", style='List Bullet')
doc.add_paragraph("HarfRust OpenType Text Shaping (crates/fonts) — 한글 겹받침 및 복합 합자 완벽 조판", style='List Bullet')
doc.add_paragraph("Frosted Glass Ribbon UI (crates/ui-egui) — 1px 스페큘러 경계선과 아크릴 블러 인터페이스", style='List Bullet')

p_n_intro = doc.add_paragraph("단계별 오피스 편집 워크플로우 (순서 번호 매기기):")
p_n_intro.bold = True

doc.add_paragraph("1단계: 새 문서를 생성하거나 기존 ECMA-376 .docx 파일을 무손실로 불러옵니다.", style='List Number')
doc.add_paragraph("2단계: 글꼴(맑은 고딕, 산돌고딕), 크기, 정렬 및 줄 간격을 서식 도구로 지정합니다.", style='List Number')
doc.add_paragraph("3단계: 다단계 목록 또는 표(Table)를 삽입하여 구조화된 보고서를 작성합니다.", style='List Number')
doc.add_paragraph("4단계: 다단 나누기(2단/3단)를 적용하고 Cmd+S로 저장하거나 초고속 PDF로 내보냅니다.", style='List Number')

# 3. 다단 나누기 (Multi-Column Layout)
doc.add_heading("3. 다단 나누기 (2단 분할 레이아웃) 및 컬럼 브레이크 검증", level=1)
p_col_desc = doc.add_paragraph(
    "아래 구역은 2단(Two-Column) 레이아웃으로 분할되어 있으며, 좌측 열과 우측 열 간의 균등한 텍스트 배분과 "
    "열 구분선(Column Separator) 및 단 나누기(Column Break) 동작을 시각적으로 검증합니다."
)

doc.save(FILE_PATH)
print(f"Generated: {FILE_PATH}")
