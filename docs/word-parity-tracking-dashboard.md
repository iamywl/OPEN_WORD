# WordCraft UI 및 기능 정의서 & 패리티 추적 관리 대시보드
(Microsoft Word UI & Feature Definition and Parity Tracking Dashboard)

> **기준 대상:** Microsoft Word (Microsoft 365) Mac 16.113.4 & Windows / ECMA-376 (OOXML) 표준  
> **최종 지표 측정일:** 2026-11-01 · **상태:** Alpha (Beta 진입 전 7대 블로커 집중 추적 중)  
> **검증 도구:** `python3 scripts/parity_metrics.py` 및 `cargo run -p xtask -- parity`  
> **단일 진실 원천(SSOT):** `crates/engine/src/catalog.rs` (520개 기능 카탈로그) & `crates/ui-egui` (UI 구현부)  
> **종합 실증 감사 보고서:** [`docs/qa-audit-and-verification-report.md`](qa-audit-and-verification-report.md) · **서명/직인 결손 보고서:** [`docs/signature-and-image-layering-gaps.md`](signature-and-image-layering-gaps.md)

---

## 1. 종합 핵심 지표 스코어카드 (Executive Metrics Scorecard)

WordCraft는 Microsoft Word와의 정량적 패리티를 **4대 핵심 지표(KPI)**로 수치화하여 매 빌드마다 추적 관리합니다.

| 지표명 (KPI) | 측정 공식 및 산출 기준 | 현재 지표 | 상태 판정 |
|---|---|:---:|:---:|
| **CPI (Catalog Parity Index)**<br>카탈로그 구현 지표 | $\frac{\text{Live Commands (505)}}{\text{Catalog Items (520)}} \times 100$ | **97.12%** | 🟢 최우수 (Floor: 90.4%) |
| **UCI (UI Completeness Index)**<br>UI 구성요소 완성도 지표 | 10대 UI 컴포넌트(리본, 다이얼로그, 패널, 캔버스 등) 가중 합산 | **79.75%** | 🟡 양호 (Beta 목표: 85%) |
| **FDI (Feature Domain Depth Index)**<br>기능 도메인 실무 심도 지표 | 24대 도메인별 세부 옵션, 한계 케이스, 실무 완성도 가중합 | **68.00%** | 🟡 보통 (Beta 목표: 75%) |
| **PPI (Platform Parity Index)**<br>5대 플랫폼 패리티 지표 | CLI, MCP, Windows, macOS, VS Code(WASM) 동등성 평균 | **98.26%** | 🟢 최우수 (코어 100% 동일) |

* **활성 엔진 명령 총합 (`Registry`):** **648개** (카탈로그 505개 + 텍스트/캐럿 편집 프리미티브 143개)
* **모달 대화상자 (Modal Dialogs):** **51개 열거형(Variant) / 63개 대화상자 흐름** (Word ~100개 기준 대비 63.0%)
* **작업창 (Task Panes):** **10개 전수 프레즌스 구현** (기능 심도 70.0%)
* **미구현 카탈로그 결손 항목:** **정확히 15개** (2.88%)

---

## 2. Word UI 아키텍처 정의 및 구현/미구현 지표

Microsoft Word의 UI를 10대 영역으로 명확히 정의하고, 각 영역의 구현 상태 및 미구현 결손(Gap)을 정량화합니다.

```
+---------------------------------------------------------------------------------------------------------+
| [QAT: 💾 ↩ ↪ 🔄]  WordCraft - Document.docx  [🔍 기능 검색 (Tell Me)]            [— ⤢ ✕]                 |
+---------------------------------------------------------------------------------------------------------+
| [파일]  홈  삽입  그리기  디자인  레이아웃  참조  편지  검토  보기  도움말  | [테이블 디자인] [수식] (상황별)   |
| [붙여넣기] [맑은 고딕 ▾] [11 ▾] [B I U] [글머리 기호 ▾] [정렬] [스타일 갤러리: 표준, 제목1, 제목2] [찾기]       |
+---------------------------------------------------------------------------------------------------------+
| [눈금자: · · · 1 · · · 2 · · · 3 · · · 4 · · · 5 · · · 6 · · · 7 · · · 8 · · · 9 · · · 10 · · ·]       |
+---------------------+-------------------------------------------------------------+---------------------+
| [작업창 (좌측)]      |  ┌───────────────────────────────────────────────────────┐  | [작업창 (우측)]      |
| • 탐색 (Navigation) |  │ 문서 캔버스 (WYSIWYG Paper Canvas)                     │  | • 스타일 (Styles)   |
| • 클립보드          |  │                                                       │  | • 메모 (Comments)   |
| • 스마트아트 텍스트  |  │  여백, 머리글/바닥글, 인라인/부동 객체, 캐럿 글라이드    │  | • 도형 서식          |
|                     |  │  A4 규격 페이지 렌더링, 15.2:1 고대비 다크 페이퍼       │  | • 접근성/서식검사기   |
|                     |  └───────────────────────────────────────────────────────┘  | • 편집 제한          |
+---------------------+-------------------------------------------------------------+---------------------+
| 페이지: 1/5 | 단어 수: 1,420 | 한국어 | [인쇄 모양] [웹 모양] [개요] [읽기 모드] | ────○──── 100%       |
+---------------------------------------------------------------------------------------------------------+
```

### 10대 UI 영역별 세부 현황표 (가중합 $\text{UCI} = 79.75\%$)

| 번호 | UI 영역 | 세부 정의 및 기능 범위 | 구현 완료 (Live) | 미구현 / 결손 (Gap) | 영역 완성도 |
|:---:|---|---|---|---|:---:|
| **01** | **타이틀 바 & QAT** | 빠른 실행 도구(저장, 실행취소, 다시실행, 자동저장), 창 캡션, 검색(Tell me) | • QAT 버튼 추가/제거/재정렬<br>• 실행취소 드롭다운 히스토리<br>• Alt+Q Tell Me 기능 검색 | • 검색창 내 즉각 실행 프리뷰 미비 | **92.0%** |
| **02** | **리본 바 시스템** | 25개 탭, 그룹, 스플릿 버튼, 갤러리 썸네일, Alt/F10 KeyTips, 리본 축소 | • 25개 전 탭 구조 탑재<br>• 실시간 스타일/표 갤러리<br>• Alt KeyTips 내비게이션<br>• ⌘⌥R/Ctrl+F1 리본 토글 | • 리본 사용자 지정 가져오기/내보내기 파일 미지원<br>• 일부 드롭다운 오버플로우 애니메이션 | **97.1%** |
| **03** | **문서 캔버스** | WYSIWYG A4/Letter 페이지 렌더링, 여백, 머리글/바닥글, 선택 바, 캐럿 글라이드 | • 하프버즈/메트릭 폰트 렌더링<br>• 좌측 마진 선택 바(클릭/드래그)<br>• 100ms 캐럿 글라이딩 애니메이션<br>• 머리글/바닥글 더블클릭 전환 | • **[P0 결손] BehindText 개체 클릭 선택 불가** (`hit.rs` 텍스트 우선 로직으로 도장/서명 클릭 불가)<br>• 우측 마진 선택 바(RTL 전용)<br>• 페이지 경계 부드러운 분할선 드래그 | **84.0%** |
| **04** | **수평/수직 눈금자** | 들여쓰기 마커(첫 줄, 내어쓰기, 좌/우), 탭 스톱(좌/중/우/소수점/줄), 표 경계 조절 | • 들여쓰기 4종 마커 드래그<br>• 5종 탭 스톱 배치 및 삭제<br>• 눈금자 위 표 열/행 크기 조절<br>• 더블클릭 시 탭 대화상자 호출 | • 세로 눈금자 마진 미세조정 단축키(Alt) 가이드 수치 표기 미비 | **92.0%** |
| **05** | **플로팅 UI & 메뉴** | 텍스트 선택 시 미니 서식 툴바, 우클릭 콘텍스트 메뉴, 객체 빠른 레이아웃 옵션 | • 선택 시 2열 미니 서식 툴바<br>• 문맥 인식 우클릭 메뉴(텍스트/표/그림)<br>• 맞춤법 교정 제안 메뉴 | • 표 우클릭 메뉴 내 테두리 스타일 간이 팔레트 미비<br>• 붙여넣기 직후 스마트 태그 버튼 | **85.0%** |
| **06** | **작업창 (Task Panes)** | 도킹/플로팅 사이드 패널 (10대 패널) | • 10개 패널 구현 (`Pane` enum)<br>• Navigation, Styles, Comments, FormatShape 등 양방향 연동 | • **[P0 결손] 선택 창(Selection Pane) UI 누락** (`Pane` enum에 없어 리본 클릭 시 무반응)<br>• FormatShape 내 선/효과/3D 상세 탭 미완<br>• 작업창 분리(Undock) 플로팅 모드 | **67.0%** |
| **07** | **모달 대화상자** | 심층 서식 및 환경설정 대화상자 (표준 약 100여 개) | • 51개 열거형 / 63개 대화상자 구현 (글꼴, 단락, 표속성, 페이지설정 등) | • 워드 표준 100여 개 중 37개 미구현 (고급 옵션 탭, 복합 매크로 설정 등) | **63.0%** |
| **08** | **상태 표시줄** | 페이지 번호, 단어/글자 수, 교열 언어, 5대 보기 모드 스위처, 줌 슬라이더 | • 실시간 쪽 번호/총 쪽수/단어 수<br>• 교열 언어 원클릭 변경<br>• 5대 보기 모드 (인쇄, 웹, 개요, 초안, 읽기)<br>• 50%~200% 줌 슬라이더 | • 줌 슬라이더 100% 틱 스냅 미비<br>• 매크로 기록 상태 아이콘 | **85.0%** |
| **09** | **백스테이지 뷰** | File 메뉴 전체화면 전환 (홈, 새로 만들기, 열기, 정보, 인쇄, 내보내기, 옵션) | • 템플릿 갤러리 시작 화면<br>• 최근 문서 목록 및 고정(Pin)<br>• PDF/PNG 고속 내보내기<br>• 문서 속성 검사기 (Inspect) | • 클라우드 OneDrive/SharePoint 연동<br>• 서식 파일 온라인 검색 | **68.0%** |
| **10** | **글래스 디자인 시스템** | 프로스티드 글래스(반투명 아크릴), 1px 스페큘러 경계선, 앰비언트 섀도우 | • 상단 리본/패널 아크릴 블러<br>• 1px 미세 빛 반사 스페큘러 보더<br>• 15.2:1 다크 페이퍼 고대비 (WCAG 준수) | • 리눅스 특정 윈도우 매니저 블러 폴백 | **90.0%** |

---

## 3. Word 기능(Features) 정의 및 24대 도메인별 구현 지표

엔진의 24대 핵심 도메인별 구현 기능과 미구현 갭을 추적합니다.

| 번호 | 기능 도메인 | 구현 완료 기능 명세 (Live Features) | 미구현 결손 명세 (Gap Items) | 도메인 심도 |
|:---:|---|---|---|:---:|
| **01** | **파일 및 서식 (Backstage)** | 새 문서, 열기, 저장, 다른이름 저장, 인쇄, PDF/이미지 내보내기, 문서 검사, 버전 복구 | 온라인 서식 검색, OneDrive 동기화 | **85%** |
| **02** | **클립보드 & 실행취소** | 무제한 Undo/Redo, 서식 복사(`Format Painter`), 클립보드 히스토리 작업창, 선택 붙여넣기 | 붙여넣기 옵션 인라인 스마트 태그 | **88%** |
| **03** | **글꼴 및 타이포그래피** | HarfRust 오픈타입 셰이핑, 굵게/기울임/밑줄/취소선/첨자, 텍스트 효과, 음영, 폰트 다이얼로그 | 고급 오픈타입 합자/스타일 세트 세부 체크박스 | **82%** |
| **04** | **단락 서식 및 정렬** | 좌/중/우/양쪽 정렬, 줄 간격(1.0~3.0배), 다단계 목록, 조판 부호(`¶`), 들여쓰기/내어쓰기 | 단락 첫 줄 자동 공백 고급 규칙 | **80%** |
| **05** | **스타일 갤러리** | 제목 1~4, 본문, 인용문 실시간 갤러리 프리뷰, 스타일 생성/수정/상속/서식 지우기 | 스타일 세트 내보내기 패키징 | **78%** |
| **06** | **편집 및 찾기/바꾸기** | 텍스트 찾기/바꾸기, 정규식 캡처 그룹 치환(`$1`), 전체 선택, 와일드카드 매칭 | 서식 기준 찾기(특정 글꼴/색상 검색) | **85%** |
| **07** | **표 삽입 및 조작** | N×M 표 삽입, 셀 병합/분할, 행/열 추가/삭제, 표 그리기, 텍스트를 표로 변환, 표 속성 | 복합 중첩 표 페이지 경계 자동 분할 심도 | **76%** |
| **08** | **일러스트레이션 & 도형** | 로컬 이미지 삽입, 도형, 스마트아트, 차트 렌더링, 그림 자르기(`Crop`), 텍스트 감싸기 | 온라인 그림 검색(`onlinePicture`), 3D 모델(`model3d`), **[P1] 투명한 색 설정(스포이드) 부재, [P2] 서명란 단순 텍스트 목업** | **58%** |
| **09** | **머리글, 바닥글, 기호** | 첫 페이지 다름, 홀/짝수 다름, 페이지 번호 매기기, 날짜/시간, 특수기호, 하이퍼링크 | 워터마크 마법사 3D 워드아트 프리셋 | **75%** |
| **10** | **수식 편집기** | 분수, 첨자, 근호, 적분, 대형 연산자, 행렬, LaTeX 및 MathML 파싱/렌더링 | 스타일러스 필기 수식 OCR (`inkEquation`) | **75%** |
| **11** | **그리기 및 프리핸드 잉크** | 펜, 형광펜, 지우개, 잉크-도형 변환(`Ink to Shape`), 잉크 리플레이, InkML 보존 | 필기 수식 변환(`inkToMath`), 압력 감지 세밀도 | **70%** |
| **12** | **디자인 및 테마** | 오피스 표준 테마, 스타일 세트 프리뷰, 테마 색상/글꼴, 대각선 워터마크, 페이지 테두리 | 사용자 정의 XML 테마 임베딩 | **74%** |
| **13** | **레이아웃 및 페이지 설정** | 여백(표준/좁게/넓게), 방향(세로/가로), 크기(A4/Letter), 다단, 구역 나누기, 줄 번호 | Aptos 메트릭 완전 일치, 열 균등 분할 세부 옵션 | **70%** |
| **14** | **참조, 목차, 각주, 인용** | 점선 채움선 자동 목차(`TOC`), 각주/미주, Zotero 플러그인 IPC, 학술 인용(APA/MLA) | EndNote/Mendeley 데스크톱 다이렉트 플러그인 | **65%** |
| **15** | **편지 및 편지 병합** | 봉투/레이블, 수신자 명단 선택(CSV/TSV/XLSX), 병합 필드 삽입, 미리보기, 대량 병합 | Outlook 연락처 직접 쿼리, 이메일 직접 발송 | **70%** |
| **16** | **검토 및 변경 내용 추적** | Hunspell 맞춤법 검사, 단어 수 세기, 소리 내어 읽기(`TTS`), 메모 풍선, 변경 추적, 문서 비교 | 클라우드 기계 번역(`translate`), 공동 편집자 차단 | **72%** |
| **17** | **보기 모드 및 창 관리** | 인쇄 모양, 웹 모양, 개요, 초안, 읽기 모드, 포커스 모드, 다중 창(`Name:1`, `Name:2`) | OS 창 자동 바둑판 배열(`arrangeAll`), 나란히 보기 | **72%** |
| **18** | **개발 도구 (Developer)** | 리치 텍스트/날짜/그림 콘텐츠 컨트롤(`Content Controls`), 양식 보호 모드, 매크로 보존 | VBA 매크로 인터프리터 실행 (보존은 100%) | **60%** |
| **19** | **표 디자인 & 레이아웃** | 표 스타일 갤러리, 머리글 행/줄무늬 행 스타일 옵션, 셀 배경색 음영 채우기, 테두리 스타일 | 엑셀 스타일 실시간 수식 재계산 (`SUM(ABOVE)`) | **76%** |
| **20** | **도구, 언어, 자동 고침** | 자동 고침(`AutoCorrect`), 입력 시 서식 지정(`AutoFormat`), 한자 변환, 27개국 UI 언어 | 음성 받아쓰기(`dictate`), 동의어 사전(Thesaurus) 언어 수 | **65%** |
| **21** | **하드웨어 가속 & 렌더링** | Apple Metal GPU, DirectX 12 / Vulkan 백엔드, 서브픽셀 앤티앨리어싱, 고DPI | HDR 디스플레이 톤 매핑 | **75%** |
| **22** | **글래스 디자인 시스템** | 1px 스페큘러 경계선, 24~32px 앰비언트 블러/섀도우, 6~10px 곡률, WCAG 4.5:1 | 구형 OS Fallback CSS 에뮬레이션 | **90%** |
| **23** | **한글 및 CJK 타이포그래피** | 초성/중성/종성 조합형 IME, 겹받침(`닭`), 금칙 처리(Kinsoku), 한자 변환, 메트릭 치환 | 세로 쓰기 시 특수문자 회전 각도 세밀도 | **80%** |
| **24** | **문서 포맷 무손실 상호운용** | DOCX(ECMA-376 완전 왕복), PDF 내보내기, ODT, RTF, HTML, Markdown, LaTeX, TXT | 레거시 바이너리 `.doc` 저장 (읽기는 완료), PDF Reflow | **75%** |

---

## 4. 25개 전 리본 탭별 구현 지표표 (505 / 520 = 97.12%)

| 탭 이름 (Tab) | 구현 수 (Live) | 전체 항목 (Total) | 구현율 (Rate) | 상태 | 결손 항목 (Missing Items) |
|---|:---:|:---:|:---:|:---:|---|
| **File** | 23 | 23 | **100.0%** | 🟢 완료 | 없음 |
| **Quick Access** | 5 | 5 | **100.0%** | 🟢 완료 | 없음 |
| **Title Bar** | 1 | 1 | **100.0%** | 🟢 완료 | 없음 |
| **Home** | 104 | 105 | **99.0%** | 🟡 부분 | Voice › Dictate (`tools.dictate`) |
| **Insert** | 47 | 53 | **88.7%** | 🟡 부분 | Online Pictures, 3D Models, Screenshot, Get Add-ins, Online Video, Ink Equation |
| **Draw** | 10 | 11 | **90.9%** | 🟡 부분 | Convert › Ink to Math (`draw.inkToMath`) |
| **Design** | 10 | 10 | **100.0%** | 🟢 완료 | 없음 |
| **Layout** | 22 | 22 | **100.0%** | 🟢 완료 | 없음 |
| **References** | 25 | 25 | **100.0%** | 🟢 완료 | 없음 |
| **Mailings** | 23 | 23 | **100.0%** | 🟢 완료 | 없음 |
| **Review** | 29 | 31 | **93.5%** | 🟡 부분 | Language › Translate (`review.translate`), Protect › Block Authors (`review.blockAuthors`) |
| **View** | 26 | 29 | **89.7%** | 🟡 부분 | Window › Arrange All, View Side by Side, Synchronous Scrolling |
| **Read Mode** | 2 | 3 | **66.7%** | 🟡 부분 | View › Layout (`view.readLayout`) |
| **Developer** | 11 | 11 | **100.0%** | 🟢 완료 | 없음 |
| **Table Design** | 8 | 8 | **100.0%** | 🟢 완료 | 없음 |
| **Table Layout** | 33 | 33 | **100.0%** | 🟢 완료 | 없음 |
| **Equation** | 21 | 22 | **95.5%** | 🟡 부분 | Tools › Ink Equation (`insert.inkEquation`) |
| **Outlining** | 13 | 13 | **100.0%** | 🟢 완료 | 없음 |
| **Picture Format** | 14 | 14 | **100.0%** | 🟢 완료 | 없음 |
| **Shape Format** | 13 | 13 | **100.0%** | 🟢 완료 | 없음 |
| **SmartArt Design** | 7 | 7 | **100.0%** | 🟢 완료 | 없음 |
| **Chart Design** | 5 | 5 | **100.0%** | 🟢 완료 | 없음 |
| **Header & Footer** | 5 | 5 | **100.0%** | 🟢 완료 | 없음 |
| **Editing** | 41 | 41 | **100.0%** | 🟢 완료 | 없음 |
| **Tools** | 7 | 7 | **100.0%** | 🟢 완료 | 없음 |
| **합계** | **505** | **520** | **97.12%** | — | **총 15개 결손** |

---

## 5. 미구현 카탈로그 결손 항목 (15개) 전수 추적 관리대장

카탈로그 520개 중 미구현된 15개 항목의 원인, 대체재, 해결 로드맵을 투명하게 관리합니다.

| 결손 ID | 탭 및 기능명 | 결손 사유 코드 | 우선순위 | 미구현 상세 원인 및 기술적 분석 | 대체재 및 해결 로드맵 |
|---|---|:---:|:---:|---|---|
| `tools.dictate` | Home › Voice › Dictate | `DEP_CLOUD` | P2 | Microsoft Azure 음성인식 클라우드 API 의존 | OS 로컬 음성인식 API(Whisper.cpp / Apple Speech) 연동 검토 |
| `insert.onlinePicture` | Insert › Illustrations › Online Pictures | `DEP_CLOUD` | P3 | Bing 이미지 검색 API 및 MS 계정 인증 의존 | 로컬 파일 삽입(`insert.picture`) 완비 / Unsplash API 연동 옵션 |
| `insert.model3d` | Insert › Illustrations › 3D Models | `TODO_ENGINE` | P3 | GLTF/GLB 3D 렌더링 래스터 파이프라인 미탑재 | 2D 그림 및 다이어그램으로 대체 / v0.6 3D 뷰어 검토 |
| `insert.screenshot` | Insert › Illustrations › Screenshot | `DEP_OS` | P2 | OS 화면 캡처 및 윈도우 선택 시스템 API 미연동 | 시스템 스크린샷 단축키 후 붙여넣기(Cmd+V) 100% 지원 |
| `addins.get` | Insert › Add-ins › Get Add-ins | `DEP_CLOUD` | P3 | Microsoft AppSource 웹 스토어 의존 | 오픈소스 플러그인 레지스트리 아키텍처 수립 후 연동 |
| `insert.video` | Insert › Media › Online Video | `DEP_WEB` | P3 | YouTube/Vimeo iframe 비디오 스트리밍 임베딩 미탑재 | 로컬 하이퍼링크 삽입(`insert.hyperlink`)으로 연결 |
| `insert.inkEquation` | Insert › Symbols › Ink Equation | `DEP_HW` | P2 | 터치/펜 필기 수식의 MathML 변환 OCR 모델 미탑재 | 내장 수식 편집기 및 LaTeX / MathML 직접 입력 100% 지원 |
| `draw.inkToMath` | Draw › Convert › Ink to Math | `DEP_HW` | P2 | 잉크 벡터 패스의 심볼 파싱 AI 모델 미탑재 | `insert.inkEquation`과 동일 로드맵으로 통합 추진 |
| `review.translate` | Review › Language › Translate | `DEP_CLOUD` | P2 | Microsoft Translator 클라우드 기계 번역 API 의존 | 로컬 온디바이스 번역 모델(Bergamot) 또는 LLM MCP 도구 연동 |
| `review.blockAuthors` | Review › Protect › Block Authors | `DEP_CLOUD` | P3 | SharePoint / OneDrive 동시 편집자 권한 차단 기능 | 단일 문서 암호화 보호(`file.encrypt`, `file.protect`)로 대체 |
| `view.arrangeAll` | View › Window › Arrange All | `OS_WINDOW` | P1 | 여러 창을 화면에 자동 바둑판식 배열하는 윈도우 매니저 API | `View › New Window` 및 다중 창 독립 렌더링은 완료 / 타일링 구현 예정 |
| `view.sideBySide` | View › Window › View Side by Side | `OS_WINDOW` | P1 | 두 문서를 좌우 50% 분할 배치하는 창 관리 API | 위와 동일 |
| `view.syncScroll` | View › Window › Sync Scroll | `OS_WINDOW` | P1 | 두 윈도우 간 스크롤 이벤트 IPC 동기화 미구현 | 두 윈도우 간 뷰포트 오프셋 브로드캐스트 IPC 추가 예정 |
| `view.readLayout` | Read Mode › View › Layout | `STANDALONE` | P2 | 읽기 모드 전용 다단/페이지 레이아웃 전환 뷰 모드 | 일반 인쇄 모양(Print Layout) 및 읽기 모드 기본 뷰로 대체 |
| `insert.inkEquation` | Equation › Tools › Ink Equation | `DEP_HW` | P2 | 수식 전용 탭의 필기 수식 OCR (중복 항목) | Insert 탭의 `insert.inkEquation`과 단일 엔진 공유 |

---

## 6. 실무 심도 결손 (Beta 차단 7대 과제 포함 Gaps #1~#29)

`docs/gaps.md`에 명시된 29대 실무 갭 중, **Beta 진입을 차단하는 7대 과제(Blocking Beta)** 현황입니다.

| 순위 | 결손 과제 (Gap) | 차단 | 현황 및 해결 진척 | 잔여 공수 (Opus h) |
|:---:|---|:---:|---|:---:|
| **#1** | **DOCX 실제 파일 코퍼스 대량 검증** | **B** | 실세계 복잡한 DOCX 파일(Google Docs, Word, LibreOffice)과의 페이지 단위 비주얼 회귀 테스트 체계 구축 중 | 30–50 h |
| **#2** | **Word 네이티브 잉크 렌더링 & OLE 보존** | **B** | InkML 벡터 패스 무손실 저장 완료, 차트/스마트아트 기본 렌더링 완료, OLE 패키지 무손실 보존 완료 | 45–70 h |
| **#3** | **필드 크래시/프리즈 방지 (Never Crash)** | **B** | Intel GPU 크래시, 메모리 누수 해결, 안전 임시파일 원자적 저장 완료, 잔여 GPU 이슈 추적 | 20–30 h |
| **#4** | **페이지네이션 및 Aptos 메트릭 일치** | **B** | HarfRust 기반 줄바꿈 일치, 섹션 연속 페이지 계산 완료, Aptos 메트릭 대체 폰트 튜닝 진행 중 | 30–50 h |
| **#5** | **콘텐츠 컨트롤 (Content Controls)** | **B** | `w:sdt` 읽기/쓰기 완료, 디자인 모드 속성 편집 지원, 이동 추적(`w:moveTo/From`) 완료 | 5–8 h |
| **#6** | **인쇄 대화상자 심도 (Print Dialog Depth)** | **B** | 데스크톱 `craft-print` 엔진 기반 프린터 선택, 매수, 양면/단면, 그레이스케일 완료 | 5–8 h |
| **#7** | **모달 대화상자 심도 (Dialog Depth)** | **B** | 51개 열거형 / 63개 대화상자 구현 완료 (Drop Cap, Split Cells, Format Page Numbers 추가 완료) | 11–19 h |

---

## 7. 5대 플랫폼별 1:1 패리티 매트릭스

| 플랫폼 | 런타임 환경 | 엔진 패리티 | UI 패리티 | 플랫폼별 특화 기능 및 대응 상태 |
|---|---|:---:|:---:|---|
| **CLI** (`wordcraft-cli`) | 네이티브 바이너리 (터미널) | **100% (648개 명령)** | N/A (무헤드리스) | • 무인 배치 포맷 변환 (DOCX ↔ PDF, ODT, HTML 등)<br>• 스크립트 실행(`--cmd`, `--script`), AST 검사 |
| **MCP Server** (`wordcraft-mcp`) | Stdio JSON-RPC (에이전트) | **100% (648개 명령)** | 원격 렌더링 | • LLM AI 에이전트 문서 검사 및 조작 도구<br>• 실행 중인 데스크톱 앱과 실시간 제어 브릿지(`--connect`) |
| **macOS 데스크톱** (`WordCraft.app`) | AppKit + Metal GPU | **97.12% (505개)** | **92.0%** | • Apple Silicon Metal GPU 가속<br>• AppKit 통합 타이틀바, 창 신호등 버튼<br>• Cmd(⌘) 오피스 단축키, macOS 한글 조합형 IME |
| **Windows 데스크톱** (`wordcraft.exe`) | Win32 + DirectX 12 | **97.12% (505개)** | **92.0%** | • DirectX 12 고속 렌더링, Win32 캡션<br>• Ctrl/Alt 키팁 내비게이션, 맑은 고딕 메트릭 매핑 |
| **VS Code 확장** (`open-word`) | **듀얼 엔진 아키텍처** | **97.12% (WASM)**<br>**35.0% (DOM)** | **88.0%** | • **[🚀 Rust Native WASM 모드]:** 505개 전 카탈로그, HarfRust 오픈타입, 데스크톱과 100% 동일 레이아웃<br>• **[⚡ 초고속 DOM 에디터 모드]:** 빠른 메모 및 실시간 인라인 편집용 경량 모드 |

---

## 8. 지속적 추적 관리 및 검증 프로토콜 (Loop Protocol)

모든 개발 및 패리티 개선 작업은 아래의 자동화 명령을 통해 실시간 검증하고 지표를 갱신합니다.

1. **자동 지표 측정:**
   ```bash
   python3 scripts/parity_metrics.py
   # JSON 형태 출력
   python3 scripts/parity_metrics.py --json
   ```
2. **카탈로그 패리티 및 바닥선 검증:**
   ```bash
   cargo run -p xtask -- parity
   cargo test -p wordcraft-engine catalog::tests::parity_floor
   ```
3. **헤드리스 비주얼 UI 캡처 QA:**
   ```bash
   cargo run --release -p wordcraft-ui-egui --example ui_shot -- script.jsonl
   ```
4. **품질 게이트 통합 검사 (CI):**
   ```bash
   cargo xtask ci
   ```

---

## 9. 서명/직인 및 글 뒤로 배치(BehindText) 집중 관리 항목

상세 분석 전문: [`docs/signature-and-image-layering-gaps.md`](signature-and-image-layering-gaps.md)

| 결손 ID | 결손 항목명 | 심각도 | 영역 | 현재 상태 및 원인 | 해결 방안 |
|:---:|---|:---:|:---:|---|---|
| **GAP-SIG-01** | BehindText 개체 클릭 선택 불가 | 🔴 **P0** | 캔버스 히트테스트 | `crates/layout/src/hit.rs:424`에서 텍스트 감지 시 Behind 객체 선택 제외 | 경계선 8pt 히트테스트 및 Alt+클릭 강제 선택 추가 |
| **GAP-SIG-02** | UI 선택 작업창(Selection Pane) 부재 | 🔴 **P0** | 작업창 (Task Pane) | 엔진 `arrange.selectionPane`은 있으나 `crates/ui-egui/src/panes.rs`에 미등록 | `Pane::Selection` 추가 및 개체 목록/순서/숨김 패널 구현 |
| **GAP-SIG-03** | "개체 선택" 포인터 도구 누락 | 🟡 **P1** | 홈 리본 / 포인터 | `Home › Editing › Select` 메뉴 내 개체 전용 선택 포인터 모드 부재 | 캔버스 포인터 모드 및 리본 메뉴 토글 추가 |
| **GAP-SIG-04** | "투명한 색 설정" 스포이드 전무 | 🟡 **P1** | 그림 서식 리본 | JPG 스캔 도장의 흰색 배경을 투명화하는 단일 색 알파 치환 도구 부재 | `picture.setTransparentColor` 엔진 및 UI 스포이드 추가 |
| **GAP-SIG-05** | 디지털 서명란 규격 미지원 | 🔵 **P2** | 삽입 / 서명란 | `insert.signatureLine`이 단순 아스키 텍스트 `"X ____"` 출력 목업 | DrawingML 인터랙티브 서명 컴포넌트 규격화 |
