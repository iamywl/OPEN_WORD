import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

OUTPUT_DIR = "/Users/ywlee/sideproejct/word_extention/test_documents"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def set_cell_background(cell, hex_color):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

# ---------------------------------------------------------------------------
# 1. 01_basic_formatting.docx
# ---------------------------------------------------------------------------
def make_01_basic_formatting():
    doc = Document()
    doc.add_heading("문서 서식 및 텍스트 스타일 테스트", level=0)

    p_intro = doc.add_paragraph("이 문서는 다양한 텍스트 서식, 글꼴 크기, 색상, 단락 정렬 및 줄 간격을 테스트하기 위한 문서입니다.")
    
    # 텍스트 스타일
    doc.add_heading("1. 텍스트 강조 및 스타일", level=1)
    p = doc.add_paragraph()
    r = p.add_run("이 텍스트는 일반 텍스트입니다. ")
    
    r_bold = p.add_run("이 텍스트는 굵게(Bold) 처리되었습니다. ")
    r_bold.bold = True
    
    r_italic = p.add_run("이 텍스트는 기울임(Italic) 처리되었습니다. ")
    r_italic.italic = True
    
    r_underline = p.add_run("이 텍스트는 밑줄(Underline) 처리되었습니다. ")
    r_underline.underline = True
    
    r_strike = p.add_run("이 텍스트는 취소선(Strike) 처리되었습니다. ")
    r_strike.font.strike = True
    
    # 색상 및 크기
    doc.add_heading("2. 글꼴 색상 및 크기", level=1)
    p2 = doc.add_paragraph()
    
    r_color1 = p2.add_run("빨간색 텍스트(Red) ")
    r_color1.font.color.rgb = RGBColor(220, 53, 69)
    r_color1.font.size = Pt(14)
    
    r_color2 = p2.add_run("파란색 텍스트(Blue) ")
    r_color2.font.color.rgb = RGBColor(13, 110, 253)
    r_color2.font.size = Pt(16)
    
    r_color3 = p2.add_run("초록색 텍스트(Green) ")
    r_color3.font.color.rgb = RGBColor(25, 135, 84)
    r_color3.font.size = Pt(12)

    # 단락 정렬
    doc.add_heading("3. 단락 정렬 (Paragraph Alignment)", level=1)
    
    p_left = doc.add_paragraph("왼쪽 정렬(Left Aligned): 일반적인 문서 본문 배치입니다.")
    p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    p_center = doc.add_paragraph("가운데 정렬(Center Aligned): 표제나 강조 문구에 적합합니다.")
    p_center.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p_right = doc.add_paragraph("오른쪽 정렬(Right Aligned): 날짜나 서명 표시에 주로 사용됩니다.")
    p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    p_justified = doc.add_paragraph(
        "양쪽 정렬(Justified): 텍스트의 양쪽 끝을 가지런하게 맞추어 신문이나 책처럼 정돈된 느낌을 줍니다. "
        "WordCraft와 같은 워드프로세서에서 워드 랩(Word wrapping)과 글자 간격 분배 알고리즘을 테스트하는 데 유용합니다."
    )
    p_justified.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.save(os.path.join(OUTPUT_DIR, "01_basic_formatting.docx"))
    print("Generated: 01_basic_formatting.docx")


# ---------------------------------------------------------------------------
# 2. 02_lists_and_numbering.docx
# ---------------------------------------------------------------------------
def make_02_lists_and_numbering():
    doc = Document()
    doc.add_heading("목록 및 번호 매기기 테스트", level=0)

    doc.add_heading("1. 글머리 기호 목록 (Bulleted List)", level=1)
    doc.add_paragraph("프로젝트 주요 컴포넌트:", style='Normal')
    doc.add_paragraph("Core Document Model (crates/doc)", style='List Bullet')
    doc.add_paragraph("Layout & Line Breaking Engine (crates/layout)", style='List Bullet')
    doc.add_paragraph("OOXML / DOCX Parser & Serializer (crates/docx)", style='List Bullet')
    doc.add_paragraph("Command & Session Management (crates/engine)", style='List Bullet')
    doc.add_paragraph("Egui Frontend Ribbon UI (crates/ui-egui)", style='List Bullet')

    doc.add_heading("2. 순서가 있는 번호 목록 (Numbered List)", level=1)
    doc.add_paragraph("빌드 및 실행 단계:", style='Normal')
    doc.add_paragraph("필요한 의존성 도구(Rust, Cargo) 확인 및 설치", style='List Number')
    doc.add_paragraph("cargo test 실행을 통한 단위 테스트 확인", style='List Number')
    doc.add_paragraph("cargo run -p wordcraft 앱 실행", style='List Number')
    doc.add_paragraph("명령어 팔레트 및 단축키 검증", style='List Number')

    doc.add_heading("3. 중첩된 계층 구조 (Nested / Hierarchical)", level=1)
    doc.add_paragraph("상위 항목 1: 시스템 아키텍처", style='List Bullet')
    doc.add_paragraph("하위 항목 1-1: L0 단위 및 기하학 (geom)", style='List 2')
    doc.add_paragraph("하위 항목 1-2: L1 폰트 DB 및 텍스트 셰이핑 (fonts)", style='List 2')
    doc.add_paragraph("세부 항목 1-2-1: OpenType 폰트 메트릭 매핑", style='List 3')
    doc.add_paragraph("상위 항목 2: 외부 인터페이스", style='List Bullet')
    doc.add_paragraph("하위 항목 2-1: Headless CLI 지원", style='List 2')
    doc.add_paragraph("하위 항목 2-2: MCP (Model Context Protocol) 서버", style='List 2')

    doc.save(os.path.join(OUTPUT_DIR, "02_lists_and_numbering.docx"))
    print("Generated: 02_lists_and_numbering.docx")


# ---------------------------------------------------------------------------
# 3. 03_tables_and_grids.docx
# ---------------------------------------------------------------------------
def make_03_tables_and_grids():
    doc = Document()
    doc.add_heading("표(Table) 및 레이아웃 테스트", level=0)

    doc.add_paragraph("표 렌더링, 셀 테두리, 배경 음영 및 정렬을 검증하기 위한 테스트 문서입니다.")

    doc.add_heading("1. 기능 비교 표 (기본 스타일 및 음영)", level=1)
    
    headers = ["모듈명", "역할", "상태", "비고"]
    data = [
        ["crates/doc", "문서 트리 및 편집 프리미티브", "안정화 (Stable)", "메모리 안전성 확보"],
        ["crates/docx", "ECMA-376 OOXML I/O", "진행중 (In-progress)", "테이블/스타일 지원"],
        ["crates/layout", "라인 브레이킹 및 페이지네이션", "안정화 (Stable)", "A4/Letter 자동 대응"],
        ["crates/render", "vello_cpu 기반 소프트웨어 래스터라이저", "고도화 (Advanced)", "GPU 독립적 렌더링"],
        ["crates/engine", "세션, 실행 취소(Undo), 명령 카탈로그", "완료 (Ready)", "Word 단축키 매핑"],
    ]

    table = doc.add_table(rows=1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "1F497D") # Navy blue
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for row_idx, row_data in enumerate(data):
        row_cells = table.add_row().cells
        bg_color = "F2F2F2" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = cell_value
            set_cell_background(row_cells[col_idx], bg_color)
            p = row_cells[col_idx].paragraphs[0]
            if col_idx in [0, 2]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_heading("2. 셀 병합(Merged Cells) 테스트", level=1)
    merge_table = doc.add_table(rows=3, cols=3)
    merge_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # 0행 0열과 0행 1열 병합
    merge_table.cell(0, 0).merge(merge_table.cell(0, 1))
    merge_table.cell(0, 0).text = "가로 병합된 셀 (Row 0, Col 0-1)"
    set_cell_background(merge_table.cell(0, 0), "D9E1F2")
    merge_table.cell(0, 2).text = "단일 셀 (Row 0, Col 2)"

    merge_table.cell(1, 0).text = "단일 셀"
    merge_table.cell(1, 1).text = "단일 셀"
    merge_table.cell(1, 2).text = "단일 셀"

    # 1열 0행과 2열 0행 세로 병합 (1,0 와 2,0)
    merge_table.cell(1, 0).merge(merge_table.cell(2, 0))
    merge_table.cell(1, 0).text = "세로 병합된 셀\n(Row 1-2, Col 0)"
    set_cell_background(merge_table.cell(1, 0), "E2EFDA")
    merge_table.cell(2, 1).text = "Row 2, Col 1"
    merge_table.cell(2, 2).text = "Row 2, Col 2"

    doc.save(os.path.join(OUTPUT_DIR, "03_tables_and_grids.docx"))
    print("Generated: 03_tables_and_grids.docx")


# ---------------------------------------------------------------------------
# 4. 04_multipage_report.docx
# ---------------------------------------------------------------------------
def make_04_multipage_report():
    doc = Document()
    
    # Header & Footer
    section = doc.sections[0]
    header = section.header
    hp = header.paragraphs[0]
    hp.text = "WordCraft Project Evaluation Report | Confidential"
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.text = "Page 1 of Evaluation Document — Generated for Word Processor Testing"
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Page 1: Title and Executive Summary
    doc.add_heading("2026 워드프로세서 엔진 평가 보고서", level=0)
    doc.add_paragraph("작성자: Antigravity AI Pair Programmer")
    doc.add_paragraph("일자: 2026년 10월")

    doc.add_heading("개요 (Executive Summary)", level=1)
    doc.add_paragraph(
        "본 문서는 다중 페이지 레이아웃, 머리글/바닥글 렌더링, 페이지 나눔(Page Break), "
        "단락 간격 및 문서 메타데이터의 정확성을 검증하기 위해 제작된 테스트 보고서입니다."
    )
    doc.add_paragraph(
        "WordCraft는 고성능 오픈소스 워드프로세서로서 Microsoft Word(OOXML)와의 높은 호환성을 목표로 합니다. "
        "이를 입증하기 위해 연속된 여러 페이지 간의 페이지네이션과 플로우 제어가 필수적입니다."
    )

    # Page Break to Page 2
    doc.add_page_break()

    # Page 2: Detailed Analysis
    doc.add_heading("상세 기술 분석 (Technical Analysis)", level=1)
    doc.add_paragraph(
        "페이지 2에서는 복합 서식과 장문 단락의 분할 처리를 점검합니다. "
        "Rust의 메모리 안전성과 고성능 라인 브레이킹 엔진을 결합하여, 실시간 대규모 문서 편집 환경에서도 "
        "60fps 이상의 매끄러운 스크롤과 지연 없는 타이핑 인터랙션을 제공하는 것이 목표입니다."
    )
    
    doc.add_heading("주요 성능 지표", level=2)
    doc.add_paragraph("• 100페이지 문서 로딩 시간: 50ms 미만")
    doc.add_paragraph("• 키 입력 응답 시간(Typing Latency): 16ms 이내 (1 프레임)")
    doc.add_paragraph("• 메모리 사용량: 대형 문서 기준 80MB 이하 유지")

    # Page Break to Page 3
    doc.add_page_break()

    # Page 3: Conclusion & Next Steps
    doc.add_heading("결론 및 권장사항 (Conclusion)", level=1)
    doc.add_paragraph(
        "테스트 결과, ECMA-376 표준 파서와 레이아웃 엔진 간의 데이터 교환이 원활하게 작동함을 확인했습니다. "
        "향후 서식 호환성과 다국어 폰트 폴백(Font Fallback) 기능의 고도화를 추천합니다."
    )

    doc.save(os.path.join(OUTPUT_DIR, "04_multipage_report.docx"))
    print("Generated: 04_multipage_report.docx")


# ---------------------------------------------------------------------------
# 5. 05_korean_and_unicode.docx
# ---------------------------------------------------------------------------
def make_05_korean_and_unicode():
    doc = Document()
    doc.add_heading("한글 및 유니코드 다국어 텍스트 테스트", level=0)

    doc.add_heading("1. 한글 자모 및 완성형 텍스트 검증", level=1)
    doc.add_paragraph(
        "가나다라마바사 아자차카타파하 "
        "동해 물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세. "
        "무궁화 삼천리 화려 강산 대한 사람 대한으로 길이 보전하세."
    )
    doc.add_paragraph(
        "초성/중성/종성 결합 테스트: 닭, 흙, 밟다, 훑다, 갰다, 똠방각하, 믜리도 괴리도 업시. "
        "고어 및 현대어 조합에서도 글리프 깨짐 현상 없이 올바르게 표현되어야 합니다."
    )

    doc.add_heading("2. 다국어 혼용 (CJK & Western Languages)", level=1)
    doc.add_paragraph("• 한국어: 모든 사람은 태어날 때부터 자유롭고 존엄하며 평등하다.")
    doc.add_paragraph("• 영어: All human beings are born free and equal in dignity and rights.")
    doc.add_paragraph("• 일본어: すべての人間は、生まれながらにして自由であり、かつ、尊厳と権利とについて平等である。")
    doc.add_paragraph("• 중국어(간체): 人人生而自由，在尊严和权利上一律平等。")
    doc.add_paragraph("• 프랑스어: Tous les êtres humains naissent libres et égaux en dignité et en droits.")
    doc.add_paragraph("• 독일어: Alle Menschen sind frei und gleich an Würde und Rechten geboren.")

    doc.add_heading("3. 특수 문자, 수식 기호 및 이모지", level=1)
    doc.add_paragraph("수학 및 통계 기호: ∑, ∏, ∫, √, ∞, ≈, ≠, ≤, ≥, ±, ×, ÷, ∈, ∉, ⊂, ⊆, ∪, ∩")
    doc.add_paragraph("통화 기호: ₩ (KRW), $ (USD), € (EUR), ¥ (JPY/CNY), £ (GBP), ₿ (BTC)")
    doc.add_paragraph("이모지(Emoji) 렌더링: 🚀 💻 📝 🎨 ⚡ 🌍 🔥 ✨ ☕ 📦 🎉 🛠️ 💡 📊")

    doc.save(os.path.join(OUTPUT_DIR, "05_korean_and_unicode.docx"))
    print("Generated: 05_korean_and_unicode.docx")


if __name__ == "__main__":
    make_01_basic_formatting()
    make_02_lists_and_numbering()
    make_03_tables_and_grids()
    make_04_multipage_report()
    make_05_korean_and_unicode()
    print("All test documents generated successfully!")
