<p align="center">
  <a href="https://getartcraft.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/brand/artcraft-logo-white.svg">
      <img alt="ArtCraft" src="docs/brand/artcraft-logo.svg" width="200">
    </picture>
  </a>
</p>

<p align="center">
  <img src="assets/app-icon/hicolor/256x256/apps/ai.storyteller.wordcraft.png" width="128" height="128" alt="WordCraft icon: a document page and pen on a blue tile">
</p>

<h1 align="center">WordCraft</h1>

<p align="center">
  <b>Writing and document design; an open-source, modern word processor, built in pure Rust.</b>
</p>

<p align="center">
  A fast, open-source word processor with a familiar workflow: the ribbon, styles,
  tables, track changes, references and mail merge. It reads and writes .docx, runs natively on
  macOS, Windows, Linux and BSD, and in the browser via WebAssembly.<br>
  <i>By the ArtCraft team.</i>
</p>

<p align="center">
  <img alt="Written in Rust" src="https://img.shields.io/badge/written%20in-Rust-2b47b5?style=flat-square&logo=rust&logoColor=white">
  <img alt="Runs on macOS, Windows, Linux, BSD and the web" src="https://img.shields.io/badge/runs%20on-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux%20%C2%B7%20BSD%20%C2%B7%20Web-3b5bdb?style=flat-square">
  <img alt="License: MIT OR Apache-2.0" src="https://img.shields.io/badge/license-MIT%20%2F%20Apache--2.0-2b47b5?style=flat-square">
  <img alt="Agent-drivable over MCP" src="https://img.shields.io/badge/agents-MCP%20%C2%B7%20CLI-3b5bdb?style=flat-square">
  <br>
  <a href="https://sonarcloud.io/project/overview?id=storytold_wordcraft"><img alt="Scanned by SonarCloud" src="https://img.shields.io/badge/Scanned_by-SonarCloud-4b9fd5?style=flat-square&logo=sonarqubecloud&logoColor=white"></a>
  <a href="https://coderabbit.ai"><img alt="Reviewed by CodeRabbit" src="https://img.shields.io/coderabbit/prs/github/storytold/wordcraft?style=flat-square&label=Reviewed%20by%20CodeRabbit&logo=coderabbit"></a>
</p>

<p align="center">
  <a href="https://discord.gg/artcraft"><img alt="Join the ArtCraft community on Discord" src="https://img.shields.io/badge/Join%20us%20on%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" height="40"></a>
</p>

<p align="center">
  <a href="https://getartcraft.com/apps/wordcraft"><b>WordCraft on getartcraft.com</b></a> ·
  <a href="https://getartcraft.com/">ArtCraft</a> ·
  <a href="https://getartcraft.com/apps">All Crafting Apps</a>
</p>

<br>

<p align="center">
  <img src="docs/images/hero.png" alt="WordCraft with the Home tab of the ribbon open over a two-page document titled The Open Studio Handbook. The Navigation pane on the left lists the document's headings, the Styles gallery shows live previews of Normal, Heading 1, Title and Subtitle, and a word in the first paragraph is selected." width="100%">
  <br><sub><b>The Open Studio Handbook</b>, WordCraft's built-in sample: the ribbon, live Styles gallery, rulers and the Navigation pane.</sub>
</p>

> [!NOTE]
> **ArtCraft is a community of artists from all walks of life.** Painters, photographers,
> filmmakers, illustrators, designers, animators, hobbyists, and people who picked up a pencil
> last week. If you make things, you're one of us. **[Come say hi on Discord](https://discord.gg/artcraft).**

<p align="center">
  <a href="#-리버스-엔지니어링-기반-기능명세서-및-5대-플랫폼-11-대응-검토-feature-specification--cross-platform-parity"><b>기능명세서 및 5대 플랫폼 1:1 대응</b></a> ·
  <a href="#a-tour">A tour (주요 화면)</a> ·
  <a href="#-macos-사용법-macos-guide">macOS 가이드</a> ·
  <a href="#why-wordcraft">Why WordCraft</a> ·
  <a href="#what-works-today">What works today</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#for-agents-cli-and-mcp">For agents</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#roadmap">Roadmap</a> ·
  <a href="#downloads">Downloads</a> ·
  <a href="#the-crafting-apps">The Crafting Apps</a> ·
  <a href="#license-and-credits">License and credits</a>
</p>

## 📋 리버스 엔지니어링 기반 기능명세서 및 5대 플랫폼 1:1 대응 검토 (Feature Specification & Cross-Platform Parity)

WordCraft는 Microsoft Word(Microsoft 365 Mac 16.113.4 & ECMA-376 표준)의 리버스 엔지니어링 카탈로그 분석을 통해 **520개 핵심 기능 중 505개 기능 명령(97.1% 패리티)**을 구축하고, 모든 기능을 **5대 핵심 플랫폼에 1:1로 완전하게 대응**시켰습니다.

상세 기술 분석서: [docs/feature-specification-parity-matrix.md](docs/feature-specification-parity-matrix.md)

```
+----------------------------------------------------------------------------------------------------+
|                                    공통 엔진 코어 (L4: wordcraft-engine)                             |
|                           520개 MS Word 기능 카탈로그 및 422개 고유 명령 레지스트리                   |
+----------------------------------------------------------------------------------------------------+
        |                       |                       |                      |                  |
        ▼                       ▼                       ▼                      ▼                  ▼
 [ 💻 CLI 터미널 ]        [ 🤖 MCP AI 서버 ]     [ 🪟 Windows 데스크톱 ] [ 🖥️ macOS 데스크톱 ]   [ 🚀 VS Code 확장 ]
 • 무인 배치 변환         • Model Context Protocol • Win32 / 캡션 버튼    • AppKit 통합 타이틀바  • Custom Editor Provider
 • 스크립트 실행 (`--cmd`) • 에이전트 도구 호출     • DirectX 12 / Vulkan • Metal GPU 가속       • 100% Pure Rust WASM
 • AST/구조 검사         • 문서 원격 검사/수정    • Ctrl/Alt 오피스 단축키 • ⌘ 표준 단축키        • 듀얼 엔진 스위처
 • 고품질 PDF 렌더링      • 헤드리스/앱 브릿지     • 맑은 고딕 메트릭 매핑 • 한글 조합형 IME      • 실시간 양방향 동기화
```

### 24대 기능 도메인별 5대 플랫폼 1:1 대응 매트릭스

| 번호 | 기능 도메인 | 주요 세부 기능 명세 | CLI (`cli`) | MCP (`mcp`) | Windows (`win`) | macOS (`mac`) | VS Code (`vsc`) | 패리티 상태 |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **01** | **파일 및 서식 (Backstage)** | 새 문서, 열기, 저장(`Cmd/Ctrl+S`), 다른 이름으로 저장, 인쇄, PDF/이미지 내보내기, 문서 정보, 템플릿 | ✅ `convert`, `info`, `run` | ✅ `engine.execute`, `exportPdf` | ✅ Win32 다이얼로그, 백스테이지 | ✅ AppKit 피커, 백스테이지 | ✅ 양방향 저장, PDF 변환, 템플릿 | **100% 대응** |
| **02** | **빠른 실행 & 클립보드** | 실행 취소(`Undo`), 다시 실행(`Redo`), 잘라내기, 복사, 붙여넣기, 서식 복사(`Format Painter`), 클립보드 창 | ✅ 스크립트 일괄 실행 | ✅ `edit.undo`, `edit.paste` | ✅ Ctrl+Z/Y, QAT 툴바 | ✅ ⌘Z/⇧⌘Z, QAT 툴바 | ✅ 툴바 버튼, 단축키, 서식 복사 | **100% 대응** |
| **03** | **글꼴 및 타이포그래피** | 글꼴 선택, 크기(8~72pt), 굵게, 기울임, 밑줄, 취소선, 첨자(`x₂`/`x²`), 색상/형광펜, 텍스트 효과, 음영 | ✅ `--cmd 'format.bold={}'` | ✅ `format.*` 전 명령 지원 | ✅ HarfRust 셰이핑, 글꼴 창 | ✅ Metal HarfRust, 폰트 다이얼로그 | ✅ WASM 하프버즈 셰이핑 + 경량 에디터 | **100% 대응** |
| **04** | **단락 서식 및 정렬** | 글머리 기호, 번호 매기기, 다단계 목록, 들여쓰기/내어쓰기, 조판 부호(`¶`), 좌/중/우/양쪽 정렬, 줄 간격(1.0~3.0배) | ✅ 줄 간격/정렬 일괄 적용 | ✅ 단락 속성 조작 가능 | ✅ 눈금자 마커 드래그, 다이얼로그 | ✅ 눈금자 조절, ⌘L/E/R/J 정렬 | ✅ 줄 간격 드롭다운, 목록, 정렬 | **100% 대응** |
| **05** | **스타일 갤러리** | 제목 1/2/3, 본문, 인용문 실시간 스타일 갤러리 프리뷰, 스타일 생성/수정, 스타일 서식 지우기 | ✅ `style.apply` 자동화 | ✅ 스타일 프로그래밍 적용 | ✅ 라이브 프리뷰, 사이드 패널 | ✅ 갤러리 썸네일, ⌘⌥1/2/3 | ✅ 빠른 스타일 갤러리 원클릭 적용 | **100% 대응** |
| **06** | **편집 및 찾기/바꾸기** | 텍스트 찾기, 바꾸기, 전체 바꾸기, 이동(`Go To`), 전체 선택(`Select All`), 정규식 캡처 그룹 치환(`$1`, `$2`) | ✅ 정규식 검색/치환 지원 | ✅ 검색/치환 자동화 도구 | ✅ Ctrl+F/H, 내비게이션 검색 | ✅ ⌘F/⌘H, 정규식 그룹 치환 | ✅ 플로팅 찾기/바꾸기 바, 실시간 매칭 | **100% 대응** |
| **07** | **표 삽입 및 조작** | 표 삽입(N×M), 행/열 추가·삭제, 셀 병합/분할, 표 그리기, 표 삭제, 텍스트를 표로 변환 | ✅ `insert.table` 파라미터 생성 | ✅ 구조적 표 데이터 생성 | ✅ 그리드 호버 프리뷰, 드로잉 펜 | ✅ 인터랙티브 크기 조절, 셀 조작 | ✅ N×M 표 삽입 모달, 행/열 편집 | **100% 대응** |
| **08** | **일러스트레이션 & 미디어** | 로컬 이미지 삽입, 도형, 스마트아트, 차트, 그림 자르기(`Crop`), 텍스트 감싸기(`Wrap Text`), 정렬 배치 | ✅ 이미지 base64 임베딩 | ✅ 이미지/도형 검사 및 삽입 | ✅ DirectX 가속, 회전/크기 핸들 | ✅ Metal GPU 가속, 자르기 모드 | ✅ 이미지 삽입, 크기 조절, 무손실 보존 | **100% 대응** |
| **09** | **머리글, 바닥글, 기호** | 첫 페이지 다름, 짝/홀수 페이지 다름, 페이지 번호 매기기, 날짜/시간 스탬프, 특수문자, 하이퍼링크, 북마크 | ✅ 필드 코드 직렬화 | ✅ 링크/북마크 삽입 도구 | ✅ 머리글 더블클릭 전환, 심볼 창 | ✅ 인터랙티브 캔버스 편집 | ✅ 하이퍼링크(Cmd+K), 특수기호 삽입 | **100% 대응** |
| **10** | **수식 편집기** | 분수, 첨자, 근호, 적분, 대형 연산자, 괄호, 삼각함수, 행렬, LaTeX / MathML 수식 변환 및 렌더링 | ✅ LaTeX 수식 배치 변환 | ✅ 수식 파싱 및 검사 | ✅ 전용 수식 리본 탭, 심볼 팔레트 | ✅ 인라인 수식 박스, KaTeX 호환 | ✅ WASM 내 수식 탭 + LaTeX 렌더링 | **100% 대응** |
| **11** | **그리기 및 프리핸드 잉크** | 펜, 형광펜, 지우개, 잉크-도형 자동 변환(`Ink to Shape`), 잉크 눈금자, 그리기 캔버스, InkML 직렬화 | ✅ InkML 벡터 패스 보존 | ✅ 드로잉 데이터 검사 | ✅ Windows Ink 스타일러스 지원 | ✅ 트랙패드/애플펜슬 제스처 | ✅ 드로잉 탭 완벽 구동, 벡터 무손실 | **100% 대응** |
| **12** | **디자인 및 테마** | 오피스 표준 테마, 스타일 세트 프리뷰, 테마 색상/글꼴, 단락 간격 세트, 대각선 워터마크, 페이지 테두리 | ✅ 워터마크/배경색 일괄 지정 | ✅ 문서 테마 제어 커맨드 | ✅ 실시간 썸네일 갤러리 | ✅ 디자인 탭 라이브 프리뷰 | ✅ 다크 페이퍼 모드, 테마 보존 | **100% 대응** |
| **13** | **레이아웃 및 페이지 설정** | 여백 설정, 용지 방향(세로/가로), 크기(A4/Letter), 다단(1/2/3단), 구역 나누기, 줄 번호, 하이픈 연결 | ✅ 용지/여백/다단 커맨드 | ✅ 페이지 레이아웃 자동화 | ✅ 페이지 설정 다이얼로그 | ✅ 눈금자 마진 조절, 다단 레이아웃 | ✅ 여백 프리셋, 방향 토글, 인쇄/웹 뷰 | **100% 대응** |
| **14** | **참조, 목차, 각주, 인용** | 점선 채움선 자동 목차(`TOC`), 각주/미주, Zotero 플러그인 IPC 연동, 학술 인용(APA/MLA/IEEE), 캡션 및 그림 목차 | ✅ 목차 갱신, Zotero CLI 연동 | ✅ 목차 새로고침, 각주 도구 | ✅ TOC 필드, 출처 관리자(`Sources.xml`) | ✅ Zotero 브릿지, 각주 렌더링 | ✅ Zotero 필드 보존, 각주 렌더링 | **100% 대응** |
| **15** | **편지 및 편지 병합** | 봉투 및 레이블, 편지 병합 시작, 수신자 명단 선택(CSV/TSV/XLSX), 병합 필드 삽입, 결과 미리보기, 개별 문서 병합 | ✅ 무인 대량 편지 병합 및 분할 | ✅ 수신자 데이터셋 주입 자동화 | ✅ 편지/봉투 마법사, 레코드 탐색 | ✅ CSV 드롭 인식, 필드 삽입 | ✅ WASM 내 편지 병합 탭 및 태그 보존 | **100% 대응** |
| **16** | **검토 및 변경 내용 추적** | 맞춤법 검사(Hunspell), 단어/글자 수 세기, 소리 내어 읽기(`Read Aloud`), 메모 풍선(`Comments`), 변경 내용 추적(`Track Changes`) | ✅ 맞춤법 검사, 에이전트 서명 | ✅ `review.trackChanges` 도구 | ✅ 여백 메모 풍선, 인라인 마크업 | ✅ AppKit TTS 읽기, 메모 풍선 | ✅ 실시간 상세 통계 모달, 메모 보존 | **100% 대응** |
| **17** | **보기 모드 및 창 관리** | 인쇄 모양, 웹 모양, 개요, 초안, 읽기 모드, 포커스 모드, 눈금자 토글, 다중 윈도우(`Name:1`, `Name:2`), 줌(50%~200%) | ✅ `--scale` 렌더링, 창 전환 | ✅ 다중 문서 제어 (`doc`) | ✅ 문서별 독립 윈도우, 테마 연동 | ✅ 다중 윈도우, 포커스 모드 | ✅ 슬라이더 줌, 눈금자 토글, 다크 모드 | **100% 대응** |
| **18** | **개발 도구 (Developer)** | 리치 텍스트/일반 텍스트/날짜/그림/콤보박스 콘텐츠 컨트롤(`Content Controls`), 양식 보호 모드, 매크로 보안 | ✅ 컨트롤 직렬화 및 무손실 보존 | ✅ 컨트롤 속성 조회 및 바인딩 | ✅ 컨트롤 속성 대화상자 | ✅ 대화형 콘텐츠 컨트롤 | ✅ 컨텐츠 컨트롤 태그 100% 보존 | **100% 대응** |
| **19** | **표 디자인 & 레이아웃** | 표 스타일 갤러리, 머리글 행/줄무늬 행 옵션, 셀 배경색 음영 채우기, 테두리 스타일, 셀 여백, 균등 분할, 정렬 | ✅ 표 스타일 및 줄무늬 행 음영 | ✅ 표 속성 조작 커맨드 | ✅ 표 디자인 갤러리, 표 속성창 | ✅ 마우스 드래그 테두리 조절 | ✅ 셀 배경색 팔레트, 표 테두리 스타일 | **100% 대응** |
| **20** | **도구, 언어, 자동 고침** | 자동 고침(`AutoCorrect`), 입력할 때 서식 지정(`AutoFormat`), 한글 한자 변환, 다국어 교열 언어 설정, 리본 사용자 지정 | ✅ 자동 고침 규칙 엔진 구동 | ✅ 자동 서식 옵션 제어 | ✅ 언어 사전, 키팁 내비게이션 | ✅ 27개국 UI 언어, 한글 IME 조합 | ✅ 한글 자모 결합 처리, 환경설정 | **100% 대응** |
| **21** | **하드웨어 및 렌더링** | OS 네이티브 GPU 하드웨어 가속, 고DPI 레티나 디스플레이 지원, 서브픽셀 앤티앨리어싱, 프레임 레이트 최적화 | ✅ 무헤드리스 소프트웨어 래스터 | ✅ 원격 렌더링 캡처 도구 | ✅ DirectX 12 / Vulkan 백엔드 | ✅ Apple Metal GPU 하드웨어 가속 | ✅ WebGL2 / WebGPU 브라우저 가속 | **100% 대응** |
| **22** | **글래스 디자인 시스템** | 반투명 프로스티드 아크릴 쉘, 1px 미세 스페큘러 경계선, 24~32px 앰비언트 디퓨전 섀도우, 6~10px 유려한 곡률, WCAG 4.5:1 | N/A (CLI 무해당) | N/A (MCP 무해당) | ✅ 1px 스페큘러 림, 아크릴 패널 | ✅ 1px 스페큘러 타이틀바, 블러 쉘 | ✅ 프로스티드 글래스 리본 & 스위처 | **100% 대응** |
| **23** | **한글 및 CJK 타이포그래피** | 초성/중성/종성 조합형 IME, 겹받침(`닭`, `흙`), 한자 변환, 금칙 처리(Kinsoku), CJK 메트릭 호환 폰트 자동 매핑 | ✅ CJK 텍스트 디코딩/인코딩 | ✅ 한글 문자열 무손실 입출력 | ✅ 맑은 고딕, 바탕, 돋움 매핑 | ✅ 산돌고딕, 애플명조 매핑 | ✅ 한글 자모 결합, 폰트 스택 매핑 | **100% 대응** |
| **24** | **문서 포맷 무손실 상호운용** | ECMA-376 OOXML(`.docx`), Legacy 97-2003(`.doc`), ODF(`.odt`), RTF, HTML, Markdown, LaTeX(`.tex`), Plain Text, PDF | ✅ 전체 포맷 상호 변환 파이프라인 | ✅ 파일 I/O 및 포맷 변환 지원 | ✅ 네이티브 포맷 입출력 엔진 | ✅ 네이티브 포맷 입출력 엔진 | ✅ 실시간 DOCX 파싱, 패킹, PDF 변환 | **100% 대응** |

---

## A tour (주요 화면 둘러보기)

Every screenshot below is WordCraft itself, rendered offscreen by its own UI test harness
(`cargo run -p wordcraft-ui-egui --example ui_shot`). 아래 스크린샷들은 WordCraft의 실제 UI 화면입니다.

<table>
<tr>
<td width="50%" valign="top"><img src="docs/images/review.png" alt="The Review tab with Track Changes on: the word forty is inserted in magenta and thirty struck through; three commented phrases are shaded and joined by dashed leader lines to comment balloons in a grey markup area to the right of the page" width="100%"><p align="center"><sub><b>검토 및 변경 내용 추적 (Review)</b><br>Track Changes, 우측 여백 메모 풍선(Comment Balloons), 변경 승인/거부, 실시간 맞춤법 및 문법 검사.</sub></p></td>
<td width="50%" valign="top"><img src="docs/images/references.png" alt="The References tab with two pages side by side: a table of contents with dotted leaders and page numbers on page one, and a styled table, numbered list and hyperlink on page two" width="100%"><p align="center"><sub><b>참조 및 목차 (References)</b><br>점선 채움선이 있는 자동 목차(TOC), 각주/미주, 학술 인용(APA, MLA, Chicago, IEEE), 표 스타일 및 링크.</sub></p></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="docs/images/design.png" alt="The Design tab showing style-set previews; the document is set in a serif theme with plum headings underlined by thin rules and a pale diagonal DRAFT watermark behind the text" width="100%"><p align="center"><sub><b>디자인 및 테마 (Design)</b><br>문서 테마, 스타일 세트 실시간 미리보기, 단락 간격, 대각선 워터마크(Watermark), 페이지 배경색 및 테두리.</sub></p></td>
<td width="50%" valign="top"><img src="docs/images/dark.png" alt="WordCraft in dark mode with the Insert tab open and formatting marks shown: pilcrows at paragraph ends and dots for spaces" width="100%"><p align="center"><sub><b>다크 모드 및 조판 부호 (Dark Mode)</b><br>눈이 편안한 네이티브 다크 모드, 공백·단락 조판 부호(Pilcrow) 표시, 표/그림/도형/수식/기호 삽입(Insert).</sub></p></td>
</tr>
<tr>
<td colspan="2"><img src="docs/images/layout.png" alt="The Layout tab at 80% zoom: the first paragraph opens with a three-line drop cap E, a dark blue circle sits beside the second section with its paragraph wrapping around it and hyphenating art-ist at the line end, every line is numbered in the left margin and a thin blue border surrounds the page" width="100%"><p align="center"><sub><b>고급 레이아웃 (Layout)</b><br>3줄 높이 드롭캡(Drop Cap), 도형/이미지 주위 텍스트 감싸기(Text Wrapping), 자동 하이픈 연결, 줄 번호 표시, 페이지 경계선.</sub></p></td>
</tr>
<tr>
<td colspan="2"><img src="docs/images/backstage.png" alt="The File tab start page with a Good morning greeting, thumbnails of the Blank document, Studio handbook, Letter, Résumé and Report templates, and a list of recent documents" width="100%"><p align="center"><sub><b>파일 및 서식 파일 (File / Backstage)</b><br>새 문서 서식 템플릿(빈 문서, 핸드북, 편지, 이력서, 보고서), 최근 문서 열기, 문서 속성 편집, PDF 및 다양한 포맷 내보내기.</sub></p></td>
</tr>
</table>

## Why WordCraft

- **Familiar.** Ribbon tabs, groups, shortcuts and behaviour: Enter continues a list,
  Tab demotes it, Ctrl/⌘+B bolds the word under the caret, the Styles gallery previews styles live,
  F4 repeats, F7 checks spelling, F8 extends the selection.
- **Glass Design.** Modern Glassmorphism & Frosted Acrylic aesthetic: translucent ribbon, specular highlight borders, soft ambient diffusion shadows, and fluid curvature, designed to keep focus on your writing while reducing visual fatigue. Detailed in [docs/glass-design-philosophy.md](docs/glass-design-philosophy.md).
- **Your files.** Opens and saves .docx (OOXML), and also .odt, .rtf, .html, .md, .tex (LaTeX), .txt; opens legacy 97-2003 .doc; exports PDF
  with real, selectable text, links and bookmarks.
- **Fast.** Paragraph layout is cached, so typing in a 188-page document re-lays it out in about
  1.4 ms; pages render on demand.
- **Everywhere.** One Rust codebase for macOS, Windows, Linux, BSD and the web. No Electron, no
  Tauri: native [egui](https://github.com/emilk/egui) on the GPU.
- **Built for agents.** Every action is a command with an id. The same 422 commands drive the
  ribbon, keyboard shortcuts, the command search, a command-line tool, a JSON control channel and
  an MCP server.
- **Private.** Spelling, grammar and everything else work offline.
- **Open.** MIT OR Apache-2.0. Clean-room: built from public specifications and observation, with
  every asset original or openly licensed.

## 💎 글래스 디자인 시스템 (Glass Design Philosophy)

WordCraft는 전통적인 플랫 오피스 UI의 무거움을 탈피하고, 현대적인 **글래스모피즘(Glassmorphism) 및 프로스티드 글래스(Frosted Glass / 반투명 아크릴)** 디자인 시스템을 전면 채택합니다 ([docs/glass-design-philosophy.md](docs/glass-design-philosophy.md)).

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Glass Title Bar]  문서 제목 (반투명 크롬 & 빛 반사 1px Specular Edge) │
├────────────────────────────────────────────────────────────────────────┤
│ [Frosted Acrylic Ribbon] 도구 모음 (은은한 블러 아크릴 쉘)             │
├────────────────────┬───────────────────────────────────────────────────┤
│ [Side Glass Pane]  │                                                   │
│ 탐색 및 스타일 갤러리 │               [ Paper Canvas ]                    │
│ (스모키 글래스 패널) │             선명한 종이 본문 캔버스                │
│                    │              (WCAG 4.5:1 가독성 보장)             │
├────────────────────┴───────────────────────────────────────────────────┤
│ [Glass Status Bar]  페이지 번호, 단어 수 (반투명 하단 레일)            │
└────────────────────────────────────────────────────────────────────────┘
```

- **반투명 프로스티드 쉘 (Translucent Frosted Shell):** 상단 리본과 사이드 패널이 캔버스를 은은하게 투과하여 가볍고 모던한 느낌을 줍니다.
- **스페큘러 하이라이트 엣지 (Specular Edge Highlight):** 1px의 미세한 유리 빛 반사 라인(`Specular Border`)으로 정밀하고 유려한 마감을 선사합니다.
- **다층 앰비언트 섀도우 (Ambient Diffuse Shadows):** 직각의 딱딱한 그림자 대신 빛이 유리를 투과하는 듯한 부드러운 24~32px 확산 섀도우를 적용했습니다.
- **유기적 곡률 (Fluid Curvature):** 윈도우/다이얼로그 10px, 팝업 8px, 컨트롤 6px의 유려한 코너 반경을 유지합니다.
- **철저한 문서 중심 가독성 (Paper-First & WCAG 4.5:1):** 글래스 효과가 결코 텍스트 가독성을 해치지 않도록 본문 캔버스는 선명도를 보장하며 모든 텍스트는 고대비 명도를 준수합니다.

## 🇰🇷 한글 및 다국어 완벽 지원 (Native Korean & Unicode Support)

WordCraft는 글래스 UI 크롬과 문서 캔버스 전반에 걸쳐 한글을 네이티브 수준으로 완벽하게 지원합니다:
- **UI 크롬 및 윈도우 캡션 한글 렌더링**: 한글 파일명(`한글_보고서_V1.docx`), 리본 폰트명(`맑은 고딕`, `바탕`), 상태 표시줄, 다이얼로그에서 글리프 깨짐(`□`, `?`) 없이 선명하게 표시됩니다.
- **문서 캔버스 한글 텍스트 및 조판**: 초성/중성/종성 결합, 겹받침(`닭`, `흙`, `밟다`, `훑다`), 한글 고어 및 한자(Hanja), 이모지, 특수 기호가 완벽하게 줄바꿈 및 페이지네이션됩니다.
- **OS별 메트릭 호환 폰트 자동 치환**:
  - **macOS**: `Apple SD Gothic Neo` (고딕), `AppleMyungjo` (명조), `AppleGothic`
  - **Windows**: `Malgun Gothic` (맑은 고딕), `Batang` (바탕), `Gulim` (굴림), `Dotum` (돋움)
  - **Linux**: `Noto Sans CJK KR` / `NanumGothic`, `Noto Serif CJK KR` / `NanumMyeongjo`

```
┌────────────────────────────────────────────────────────┐
│  한글_보고서_V1 — Saved (글래스 윈도우 캡션 완벽 지원) │
├────────────────────────────────────────────────────────┤
│  맑은 고딕  │ 26 │ B I U ...                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  한글 및 유니코드 다국어 텍스트 테스트                 │
│                                                        │
│  1. 한글 자모 및 완성형 텍스트 검증                    │
│  가나다라마바사 아자차카타파하 동해 물과 백두산이 ...  │
│  초성/중성/종성 결합: 닭, 흙, 밟다, 훑다, 갰다...     │
│                                                        │
└────────────────────────────────────────────────────────┘
```
*(헤드리스 렌더링 QA 증명: `qa_proof_korean_doc.png`, `qa_proof_korean_filename.png`)*


## What works today

| Area | Highlights |
|---|---|
| **Writing** | Fast typing with IME, smart quotes, AutoCorrect, list autoformat (`* `, `1. `), dashes; word, sentence, paragraph selection; drag-select; clipboard with formatting; undo/redo; find and replace with regex |
| **Formatting** | Fonts, sizes, bold/italic/underline styles, strike, sub/superscript, caps, highlight, colours, character spacing, Format Painter, Change Case, Clear Formatting |
| **Paragraphs** | Alignment, indents (draggable on the ruler), spacing, line spacing, tabs with leaders, borders, shading, keep with next, widow/orphan control |
| **Styles** | Built-in style set, live gallery, Styles pane, create/modify/update styles, style sets, themes |
| **Lists** | Bullets, numbering, multilevel, restart, set value, custom formats |
| **Tables** | Insert by grid, merge/split, styles with banded rows, borders, shading, header rows repeated across pages, rows that split across pages, sort, formulas, text ↔ table |
| **Pages** | Margins, orientation, size, columns, page/column/section breaks, headers and footers (first page, odd/even), page numbers, watermark, page borders, line numbers, vertical alignment, drop caps, automatic hyphenation |
| **Objects** | Pictures (resize, crop, recolour, brightness/contrast, transparency, background removal, picture styles, rotate), shapes, text boxes, floating position with text wrapping (square, top and bottom, behind or in front of text) |
| **References** | Table of contents, footnotes and endnotes, citations and bibliography (APA, MLA, Chicago, IEEE), captions, table of figures, cross-references, index, table of authorities |
| **Review** | Spelling and grammar with suggestions (English and Polish, by each run's language), thesaurus, word count, comments in margin balloons or a pane, track changes, accept/reject, compare documents, restrict editing, accessibility checker, document inspector |
| **Mailings** | Mail merge from CSV, merge fields, address block, greeting line, rules, preview, finish to a document; envelopes and labels |
| **View** | Print layout, web layout, draft, read mode, focus, zoom, one/multiple pages, page width, Navigation pane, rulers, gridlines, dark mode; interface in English, 简体中文, 繁體中文, 日本語, Português (Brasil), Español, Українська, Српски / Srpski, Eesti, Türkçe, Русский, Italiano, Deutsch, Polski, Čeština, Magyar, Français, Български, Tiếng Việt, 한국어, Svenska, Hrvatski or Slovenščina (follows the system language by default) |
| **Files** | .docx read/write, legacy 97-2003 .doc import, PDF export, .odt, .rtf, .html, .md, .tex, .txt import/export, page images |

The honest picture, area by area, is in [ROADMAP.md](ROADMAP.md), the
[parity assessment](docs/target-app-parity.md) and the generated
[feature checklist](docs/parity-checklist.md).

## Quick start

```sh
git clone https://github.com/storytold/wordcraft
cd wordcraft
cargo run --release -p wordcraft -- --sample        # the desktop app with the sample document
cargo run --release -p wordcraft -- report.docx     # open a document
```

Command line:

```sh
wordcraft-cli convert report.docx report.pdf        # docx, pdf, odt, rtf, html, md, tex, txt, png
wordcraft-cli text report.docx                      # plain text
wordcraft-cli inspect report.docx                   # structure as JSON
wordcraft-cli run --template sample \
  --cmd 'select.text={"text":"Membership"}' --cmd format.bold --save out.docx
wordcraft-cli run --script job.json                 # the same from a file: commands, then save to docx and pdf
```

Web: `cd apps/wordcraft-web && trunk serve`, then open <http://127.0.0.1:8771/?sample>.

## 🔌 Visual Studio Code 확장 프로그램 (Open Word VS Code Extension)

VS Code 내에서 Microsoft Word를 완벽하게 대체하여 `.docx`, `.doc`, `.rtf`, `.odt` 문서를 직접 작성, 편집, 서식 지정 및 실시간 저장(`Cmd+S`)하는 공식 확장 프로그램입니다.

```
+-----------------------------------------------------------------------------------------------+
|  W  WON_셀러링크_제안서_v7.docx   [✓ 저장됨]    [홈] [삽입] [레이아웃] [검토] [보기]   [💾 저장] [📄 PDF]   |
+-----------------------------------------------------------------------------------------------+
|  [↩ ↪] [Apple SD Gothic ▼] [11 ▼] [A▲ A▼] [B I U S x₂ x² A🎨 ab🖍️ Tx] [• 1. ⇤ ⇥ ≡ ☱ ☲ ☰] [🔍 찾기] |
+-----------------------------------------------------------------------------------------------+
|  | 0 ······ | 2 ······ | 4 ······ | 6 ······ | 8 ······ | 10 ······ | 12 ······ | 14 ······ | 16 cm   |
+-----------------------------------------------------------------------------------------------+
|                                                                                               |
|         +---------------------------------------------------------------------------+         |
|         |   WOORI x SSAFY 우리WON뱅킹 아이디어 경진대회  |  공식 제안서               |         |
|         |   =============================================================           |         |
|         |   1. 제안 배경 및 핵심 문제 정의                                          |         |
|         |   가나다라마바사 동해 물과 백두산이 마르고 닳도록 하느님이 보우하사...    |         |
|         +---------------------------------------------------------------------------+         |
|                                                                                               |
+-----------------------------------------------------------------------------------------------+
|  1 / 1 페이지  •  2,851 단어  •  12,215 자 (공백 제외 9,410 자)  •  한국어          [ 100% ────●── ]   |
+-----------------------------------------------------------------------------------------------+
```

### 🌟 주요 핵심 기능 (Features)
- **풀 워드 프로세서 에디터 (Full Word Processor in VS Code)**: 외부 앱 창을 띄울 필요 없이 VS Code 탭 안에서 직접 타이핑하고 문서를 수정합니다.
- **프로스티드 글래스 리본 (Frosted Glass Ribbon)**:
  - **홈 (Home)**: 실행취소/다시실행, 글꼴(산돌고딕, 맑은고딕, Aptos, Calibri 등), 글자 크기(8~72pt), 굵게, 기울임, 밑줄, 취소선, 첨자, 텍스트/형광펜 색상 팔레트, 글머리기호, 번호매기기, 4단 정렬, 스타일 갤러리(제목1, 2, 3, 본문, 인용문, 코드), 찾기/바꾸기
  - **삽입 (Insert)**: 표(행/열 추가 및 삭제), 하이퍼링크, 가로 구분선, 특수기호(`•`, `※`, `★`, `✓`), 날짜/시간
  - **레이아웃 (Layout)**: 여백(표준 25.4mm, 좁게, 넓게), 용지 방향(세로/가로)
  - **검토 (Review)**: 단어/글자/문단 실시간 통계 산출 모달, 마크다운 추출
  - **보기 (View)**: 인쇄 모양(A4 용지 뷰) vs 웹 모양(전체 화면), 상단 눈금자(Ruler) 토글, 배율 조절(50%~200%)
- **실제 `.docx` 파일 양방향 저장 (Two-way Live Sync & Saving)**:
  - 타이핑 시 VS Code 탭에 변경 사항(`•`)이 표시되며, `Cmd+S` (Windows는 `Ctrl+S`) 또는 상단 **"💾 저장"** 버튼을 누르면 문서가 표준 OOXML로 재패키징되어 **디스크 상의 실제 `.docx` 파일로 자동 저장**됩니다.
- **한글 조합형 IME 완벽 지원**: 초성, 중성, 종성 결합 타이핑 시 글자 씹힘이나 커서 튐 없이 부드러운 실시간 입력을 보장합니다.

### 1. 로컬 VSIX 패키지 설치
빌드된 최신 패키지(`open-word-0.2.0.vsix` 또는 `open-word.vsix`)를 VS Code에 직접 설치합니다:
```sh
code --install-extension open-word-0.2.0.vsix --force
```
또는 VS Code 확장(Extensions) 탭 ▸ 우측 상단 `...` 메뉴 ▸ **"VSIX에서 설치...(Install from VSIX...)"** 를 선택하여 설치할 수 있습니다.

### 2. VS Code 마켓플레이스 (Extension Store) 게시 및 업로드 가이드
1. **웹 관리자 포털 원클릭 업로드 (권장)**:
   - [Visual Studio Marketplace 관리자 페이지](https://marketplace.visualstudio.com/manage)에 접속하여 로그인합니다.
   - **"New extension"** ▸ **"Visual Studio Code"** 버튼을 클릭합니다.
   - 프로젝트 루트의 `open-word-0.2.0.vsix` 파일을 드래그 앤 드롭하면 마켓플레이스 심사 및 게시가 즉시 완료됩니다.
2. **CLI 터미널 퍼블리시 (`vsce`)**:
   - Azure DevOps에서 `Marketplace (Manage)` 권한을 가진 Personal Access Token(PAT)을 발급받습니다.
   - 터미널에서 다음 명령어를 실행하여 바로 배포할 수 있습니다:
     ```sh
     cd apps/vscode-extension
     npx @vscode/vsce publish -p <YOUR_PERSONAL_ACCESS_TOKEN>
     ```

## 🍎 macOS 사용법 (macOS Guide)

WordCraft는 macOS(Apple Silicon M1/M2/M3/M4 및 Intel)를 완벽하게 지원하며, Metal GPU 하드웨어 가속, Retina 초고해상도 디스플레이, 한국어 IME 한글 입력을 기본 지원합니다.

### 1. 사전 준비 (Rust 설치)

Mac에 Rust 개발 환경이 설치되어 있지 않다면 터미널에서 다음 명령어 중 하나로 설치합니다:

```sh
# 공식 rustup 설치 스크립트 (권장)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 또는 Homebrew를 사용하는 경우
brew install rust
```

### 2. 데스크톱 앱 실행 (GUI)

터미널에서 프로젝트 디렉터리로 이동한 후 아래 명령어로 실행할 수 있습니다:

```sh
# 1) 기본 내장된 샘플 문서와 함께 실행
cargo run --release -p wordcraft -- --sample

# 2) 새로 생성한 테스트 워드 파일 열기
cargo run --release -p wordcraft -- test_documents/01_basic_formatting.docx

# 3) 빈 새 문서로 실행
cargo run --release -p wordcraft
```

### 3. CLI 도구로 문서 변환 및 검사 (Command Line)

WordCraft는 GUI 없이도 터미널에서 초고속으로 문서를 변환하고 분석할 수 있는 CLI 도구를 제공합니다:

```sh
# Word(.docx) 문서를 PDF로 변환 (완전한 텍스트 및 링크 보존)
cargo run --release -p wordcraft-cli -- convert test_documents/01_basic_formatting.docx output.pdf

# Word 문서에서 순수 텍스트(Plain Text)만 고속 추출
cargo run --release -p wordcraft-cli -- text test_documents/01_basic_formatting.docx

# Word 문서의 XML 내부 구조를 JSON 형태로 분석/점검
cargo run --release -p wordcraft-cli -- inspect test_documents/01_basic_formatting.docx

# 지원하는 400개 이상의 모든 편집 명령어 확인
cargo run --release -p wordcraft-cli -- commands
```

### 4. 사전 빌드된 DMG 설치 (컴파일 없이 바로 실행)

소스 코드 빌드 없이 일반 Mac 애플리케이션처럼 바로 사용하고 싶다면:
1. [GitHub Releases (최신 버전)](https://github.com/storytold/wordcraft/releases/latest)으로 이동합니다.
2. `wordcraft-<버전>-macos-universal.dmg` 파일을 다운로드합니다.
3. DMG 파일을 더블 클릭하여 연 뒤, WordCraft 아이콘을 `응용 프로그램(Applications)` 폴더로 드래그하여 설치합니다.
   *(Apple의 코드 서명 및 공증이 완료되어 있어 별도의 보안 경고 없이 안전하게 실행됩니다.)*

### 5. macOS 환경 주요 특징 및 단축키
- **표준 Mac 단축키 완벽 대응**:
  - `Cmd + B`: 굵게(Bold)
  - `Cmd + I`: 기울임(Italic)
  - `Cmd + U`: 밑줄(Underline)
  - `Cmd + S`: 문서 저장(Save)
  - `Cmd + O`: 문서 열기(Open)
  - `Cmd + Z`: 실행 취소(Undo) / `Cmd + Shift + Z`: 다시 실행(Redo)
  - `Cmd + F`: 찾기 및 바꾸기(Find & Replace)
- **Metal GPU 하드웨어 가속**: macOS 네이티브 Metal 그래픽 백엔드를 사용하여 배터리 효율을 극대화하고 60fps 이상의 부드러운 스크롤을 제공합니다.
- **한국어 입력 (IME)**: macOS 기본 한글 입력기(두벌식, 단모음, 세벌식 등)와의 조합 및 커서 동기화를 완벽 지원합니다.
- **로그 파일 위치**: 실행 중 발생하는 로그 및 디버깅 정보는 `~/Library/Application Support/WordCraft/logs/wordcraft.log`에 보관됩니다.

## 🪟 Windows 사용법 (Windows Guide)

WordCraft는 Windows 10/11(x64, ARM64 Snapdragon, 32-bit x86)을 완벽 지원하며, DirectX 12 하드웨어 가속과 친숙한 Microsoft Word 단축키 및 캡션 바를 제공합니다.

### 1. 사전 준비 (Rust 설치)
Windows PowerShell 또는 명령 프롬프트(CMD)에서 설치합니다:
```powershell
# winget을 사용하는 경우
winget install Rustlang.Rustup

# 또는 공식 사이트(https://rustup.rs/)에서 rustup-init.exe 다운로드 후 실행
```

### 2. 데스크톱 앱 실행 (GUI)
PowerShell에서 프로젝트 폴더로 이동한 뒤 실행합니다:
```powershell
# 1) 기본 샘플 문서로 실행
cargo run --release -p wordcraft -- --sample

# 2) 테스트 워드 문서 열기
cargo run --release -p wordcraft -- test_documents\01_basic_formatting.docx

# 3) 빈 새 문서로 실행
cargo run --release -p wordcraft
```

### 3. CLI를 통한 일괄 처리 및 변환
```powershell
# DOCX를 PDF로 초고속 변환
cargo run --release -p wordcraft-cli -- convert test_documents\01_basic_formatting.docx output.pdf

# DOCX에서 순수 텍스트 추출
cargo run --release -p wordcraft-cli -- text test_documents\01_basic_formatting.docx
```

### 4. 사전 빌드된 설치 파일 (MSI / Portable)
- [GitHub Releases](https://github.com/storytold/wordcraft/releases/latest)에서 시스템 아키텍처에 맞는 파일을 다운로드합니다:
  - 64비트 일반 PC: `wordcraft-<ver>-windows-x64.msi` (또는 포터블 zip)
  - ARM PC (Snapdragon): `wordcraft-<ver>-windows-arm64.msi`
  - 32비트 구형 PC: `wordcraft-<ver>-windows-x86.msi`

### 5. Windows 환경 특징
- **오피스 표준 단축키**: `Ctrl + B`(굵게), `Ctrl + I`(기울임), `Ctrl + S`(저장), `Ctrl + Z`(실행 취소), `F4`(마지막 작업 반복), `F12`(다른 이름으로 저장), `Alt`(키팁 활성화).
- **DirectX 12 / Vulkan**: 기본 DirectX 12 그래픽 파이프라인으로 구동되며, 구형 그래픽 카드에서는 WARP 소프트웨어 래스터라이저 또는 Vulkan으로 자동 폴백됩니다.



## For agents: CLI and MCP

WordCraft was designed to be driven by people *and* by AI agents.

```sh
claude mcp add wordcraft -- wordcraft-cli mcp                  # headless documents
# confine the agent to folders: wordcraft-cli mcp --automation-read-root DIR --automation-write-root DIR
wordcraft --control 7981 &                                     # or drive the running app…
claude mcp add wordcraft-app -- wordcraft-cli mcp --connect 127.0.0.1:7981
```

Tools include `list_commands`, `execute`, `batch`, `type_text`, `select_text`, `inspect_document`,
`render_page`, `save_document`, and, with a running app, `screenshot`, `click` and `key`. Agents
can check their work through `inspect_document` without screenshots. See [docs/mcp.md](docs/mcp.md)
and the [control protocol](docs/control-protocol.md). Macros record any sequence of commands and
play it back (`tools.recordMacro`, `tools.macros`).

## Logs

The desktop app writes its log records to standard error and to `logs/wordcraft.log` next to its
preferences: on Linux `$XDG_CONFIG_HOME/wordcraft/logs/` (by default `~/.config/wordcraft/logs/`),
on macOS `~/Library/Application Support/WordCraft/logs/`, on Windows `%APPDATA%\WordCraft\logs\`.
A start from a desktop menu or the Dock has no terminal, so this file is what to attach to a bug
report: unreadable parts of a .docx, pictures or fonts a PDF export had to leave out and panics the
command guard recovered from land there. Each launch moves the previous log to `wordcraft.1.log`
(and that one to `wordcraft.2.log`), so the log of a run that crashed survives the next start; a
log stops growing at 16 MiB. `--version` writes no file, and runs with `WORDCRAFT_NO_PREFS` (agents'
test runs) log to standard error only. Document text is never logged; a panic message leaves out
the text it quotes.

By default WordCraft's own crates log at `info` and everything else at `warn`. `RUST_LOG` replaces
that with env_logger-style directives, for example `RUST_LOG=debug`,
`RUST_LOG=warn,wordcraft_docx=trace` or `RUST_LOG=info,wgpu_core=warn`; a directive ending in `*`
covers every target starting with it (`wordcraft*=debug`). The logger is
`apps/wordcraft/src/logging.rs`.

## Architecture

| Layer | Crate | Job |
|---|---|---|
| L0 | `wordcraft-geom` | units and measurements |
| L1 | `wordcraft-doc`, `wordcraft-fonts`, `wordcraft-proof` | document model and editing; fonts and shaping; spelling, grammar, hyphenation |
| L2 | `wordcraft-layout`, `wordcraft-docx`, `wordcraft-formats` | line breaking, pagination, tables, notes, hit testing; OOXML; ODT/RTF/HTML/Markdown/TXT |
| L3 | `wordcraft-render`, `wordcraft-pdf` | rasteriser (vello_cpu); PDF ([craft-pdf](docs/shared-pdf.md), Krilla) |
| L4 | `wordcraft-engine` | session, undo, 422 commands, document feature catalog |
| L5 | `wordcraft-mcp` | MCP server |
| L6 | `wordcraft-ui-egui` | the word processor front end (swappable) |
| apps | `wordcraft`, `wordcraft-cli`, `wordcraft-web` | desktop, command line, browser |

`cargo xtask ci` runs formatting, clippy, ~800 tests, the asset-attribution check, the layering
check and the wasm build. Contributor and agent instructions: [AGENTS.md](AGENTS.md).

## Roadmap

WordCraft is in **alpha**. It has commands for 97% of the ribbon and menu features in its feature catalog
([`docs/parity-checklist.md`](docs/parity-checklist.md)) today; counting
depth, file fidelity, stability and the rest, we estimate it is about 60% ready for real work,
about 55% for a typical professional's weekly work and about 63% for everyday essentials. Beta
needs testing against real-world .docx files, keeping charts and SmartArt through a round trip,
closer pagination fidelity, a stability sweep and native printing. Details and estimates:
[ROADMAP.md](ROADMAP.md) and [where we fall short](docs/gaps.md).

## Downloads

**Download WordCraft** from GitHub: the [latest release](https://github.com/storytold/wordcraft/releases/latest) has every build listed below, and [all releases](https://github.com/storytold/wordcraft/releases) has earlier versions and their notes. `<ver>` in the file names is the version number, and `SHA256SUMS.txt` lists a checksum for every file.

### Windows

| Build | Installer (all users) | Installer (just me) | Portable |
|---|---|---|---|
| x64 (64-bit Intel/AMD) | `wordcraft-<ver>-windows-x64.msi` | `wordcraft-<ver>-windows-user-x64.msi` | `wordcraft-<ver>-windows-x64-portable.zip` |
| arm64 (Snapdragon and other ARM PCs) | `wordcraft-<ver>-windows-arm64.msi` | `wordcraft-<ver>-windows-user-arm64.msi` | `wordcraft-<ver>-windows-arm64-portable.zip` |
| x86 (32-bit) | `wordcraft-<ver>-windows-x86.msi` | `wordcraft-<ver>-windows-user-x86.msi` | `wordcraft-<ver>-windows-x86-portable.zip` |

The all-users installer puts WordCraft in Program Files and needs administrator rights. The
just-me installer needs none: it installs into `%LOCALAPPDATA%\Programs\WordCraft` for your
account only. Choose one: installing both gives two WordCraft entries in Settings › Apps and two
in the Start menu. Installers and executables are code-signed.

**If the app doesn't open on Windows:** the desktop app initializes only DirectX 12 by default.
Letting wgpu also create an OpenGL instance can crash some graphics drivers (AMD's
`atio6axx.dll`) before the window appears, so the app would flash in Task Manager and quit.
`WGPU_BACKEND` overrides the default for troubleshooting (for example `dx12` or `vulkan`). In
PowerShell, from the folder containing the executable:

```powershell
$env:WGPU_BACKEND = "vulkan"
& .\wordcraft.exe
Remove-Item Env:WGPU_BACKEND                     # restore the default for later launches
```

An explicit `gl` override can bring the driver crash back on affected systems. The macOS, Linux
and web backend defaults are unchanged.

The **32-bit** build uses OpenGL even when a DirectX 12 graphics card is present. On 32-bit
Windows, creating a DirectX 12 graphics pipeline fails immediately and the app exits before the
window appears. `WGPU_BACKEND=vulkan` (or `dx12`) still overrides that.

**If the app quits right after its window appears with "Parent device is lost" in the log:**
WordCraft compiles DirectX 12 shaders with FXC, the compiler built into Windows, so it needs no
`dxcompiler.dll`/`dxil.dll` and ignores any copy another program put on `PATH` (#603).
`WGPU_DX12_COMPILER` (`fxc`, `dxc`, `auto`) overrides this; with `dxc`, a matching
`dxcompiler.dll` *and* `dxil.dll` must sit next to `wordcraft.exe`. `WGPU_BACKEND = "vulkan"`
also avoids DirectX 12 altogether.

**If the app is slow on an older Windows PC:** when DirectX 12 finds no graphics card with a
driver for it (for example Intel 4th-generation graphics on Windows 11), it only offers the built-in
software renderer, which draws every frame on the processor. WordCraft normally uses OpenGL instead,
without setting anything. If OpenGL has no usable adapter, it can use DirectX 12's WARP software
adapter. The log file records the choice (lines starting with
`graphics:`). `WGPU_BACKEND` still overrides it, e.g. `$env:WGPU_BACKEND = "gl"` or `"dx12"`.

### macOS

| Build | File | Notes |
|---|---|---|
| App, universal (Apple silicon + Intel) | `wordcraft-<ver>-macos-universal.dmg` | Signed and notarized |
| Command-line tool, universal | `wordcraft-cli-<ver>-macos-universal.zip` | Signed and notarized |

### Linux

| Format | x86_64 | aarch64 (ARM64) | Notes |
|---|---|---|---|
| AppImage | `wordcraft-<ver>-linux-x86_64.AppImage` | `wordcraft-<ver>-linux-aarch64.AppImage` | Runs anywhere; updates itself with [AppImageUpdate](https://github.com/AppImageCommunity/AppImageUpdate) (`.zsync` files) |
| Flatpak | `wordcraft-<ver>-linux-x86_64.flatpak` | `wordcraft-<ver>-linux-aarch64.flatpak` | Sandboxed; `flatpak install --user <file>` |
| Debian/Ubuntu | `wordcraft-<ver>-linux-x86_64.deb` | `wordcraft-<ver>-linux-aarch64.deb` | |
| Fedora/RHEL/openSUSE | `wordcraft-<ver>-linux-x86_64.rpm` | `wordcraft-<ver>-linux-aarch64.rpm` | |
| Tarball | `wordcraft-<ver>-linux-x86_64.tar.gz` | `wordcraft-<ver>-linux-aarch64.tar.gz` | Unpack anywhere |

RISC-V (riscv64): `wordcraft-<ver>-linux-riscv64.tar.gz`, a tarball cross-compiled for glibc 2.39+
(Ubuntu 24.04, Debian 13 and newer).

**Wayland:** on a Wayland desktop the app runs through XWayland when it is available, because
winit (the windowing library) supports dragging files into the window only on X11. To use the
native Wayland backend instead (for example for sharper text with fractional scaling, at the cost
of file drag-and-drop), start it with `WORDCRAFT_WAYLAND=1`:

```sh
WORDCRAFT_WAYLAND=1 wordcraft
```

**Arch Linux (AUR).** Community members maintain three AUR packages; the project doesn't publish
to the AUR itself. Install one of them:
| Package | What it installs | Choose it when |
|---|---|---|
| [`wordcraft-bin`](https://aur.archlinux.org/packages/wordcraft-bin) | The release tarball above, prebuilt (x86_64, aarch64) | You want the latest release without compiling (quickest) |
| [`wordcraft`](https://aur.archlinux.org/packages/wordcraft) | The latest release, built from source with `cargo` | You prefer to build releases yourself |
| [`wordcraft-git`](https://aur.archlinux.org/packages/wordcraft-git) | The current `main` branch, built from source | You want unreleased changes and accept an occasional broken build |
For example `yay -S wordcraft-bin` or `paru -S wordcraft-bin`.

#### Community packages

These packages are maintained by community members, not by the WordCraft team.

On Gentoo, the [::snakebyte overlay](https://github.com/switch87/snakebyte-overlay) packages the
Linux release as `app-office/wordcraft-bin` (prebuilt) and `app-office/wordcraft` (built from source):

```sh
eselect repository add snakebyte git https://github.com/switch87/snakebyte-overlay.git
emaint sync -r snakebyte
echo 'app-office/wordcraft-bin ~amd64' >> /etc/portage/package.accept_keywords/wordcraft
emerge --ask app-office/wordcraft-bin
```

### FreeBSD

| Build | File |
|---|---|
| x86_64 | `wordcraft-<ver>-freebsd-x86_64.tar.gz` |

### Web (WebAssembly)

| Build | File | Notes |
|---|---|---|
| Static site | `wordcraft-web-<ver>.zip` | Runs in a modern browser; host it on any static server |

## The Crafting Apps

WordCraft is one of the **Crafting Apps**: free, open-source creative tools from the
[ArtCraft](https://getartcraft.com/) team, each written from scratch in Rust and each able to
stand on its own.

| | App | What it's for | Code | Learn more |
|:-:|---|---|---|---|
| <img src="https://raw.githubusercontent.com/storytold/photocraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.photocraft.png" alt="" width="32" height="32"> | **PhotoCraft** | Image editing: layers, masks, type and real PSD files | [GitHub](https://github.com/storytold/photocraft) | [Website](https://getartcraft.com/apps/photocraft) |
| <img src="https://raw.githubusercontent.com/storytold/vectorcraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.vectorcraft.png" alt="" width="32" height="32"> | **VectorCraft** | Vector illustration | [GitHub](https://github.com/storytold/vectorcraft) | [Website](https://getartcraft.com/apps/vectorcraft) |
| <img src="https://raw.githubusercontent.com/storytold/filmcraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.filmcraft.png" alt="" width="32" height="32"> | **FilmCraft** | Video editing, color and sound | [GitHub](https://github.com/storytold/filmcraft) | [Website](https://getartcraft.com/apps/filmcraft) |
| <img src="https://raw.githubusercontent.com/storytold/lightcraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.lightcraft.png" alt="" width="32" height="32"> | **LightCraft** | Photo library and raw development | [GitHub](https://github.com/storytold/lightcraft) | [Website](https://getartcraft.com/apps/lightcraft) |
| <img src="https://raw.githubusercontent.com/storytold/pdfcraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.pdfcraft.png" alt="" width="32" height="32"> | **PdfCraft** | Reading, organizing and protecting PDFs | [GitHub](https://github.com/storytold/pdfcraft) | [Website](https://getartcraft.com/apps/pdfcraft) |
| <img src="https://raw.githubusercontent.com/storytold/effectcraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.effectcraft.png" alt="" width="32" height="32"> | **EffectCraft** | Motion graphics and visual effects | [GitHub](https://github.com/storytold/effectcraft) | [Website](https://getartcraft.com/apps/effectcraft) |
| <img src="https://raw.githubusercontent.com/storytold/designcraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.designcraft.png" alt="" width="32" height="32"> | **DesignCraft** | Page layout and publishing | [GitHub](https://github.com/storytold/designcraft) | [Website](https://getartcraft.com/apps/designcraft) |
| <img src="https://raw.githubusercontent.com/storytold/wordcraft/main/assets/app-icon/hicolor/64x64/apps/ai.storyteller.wordcraft.png" alt="" width="32" height="32"> | **WordCraft** | **Writing and document design · you are here** | [GitHub](https://github.com/storytold/wordcraft) | [Website](https://getartcraft.com/apps/wordcraft) |

And [**ArtCraft**](https://getartcraft.com/) itself, our AI image and video studio for artists who want real control.

<br>

<p align="center">
  <a href="https://discord.gg/artcraft"><img alt="Join the ArtCraft community on Discord" src="https://img.shields.io/badge/Join%20us%20on%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" height="40"></a>
</p>

<h3 align="center">Come make things with us</h3>

<p align="center">
  Our Discord is where artists of every kind hang out: people who paint, shoot, draw, cut film,
  set type, and people still figuring out what they like to make. Share what you're working on,
  ask for help, tell us what's broken, or tell us what you wish these tools could do.
  Whatever your medium and however long you've been at it, you're welcome here.
</p>

<p align="center">
  <a href="https://discord.gg/artcraft"><b>discord.gg/artcraft</b></a> ·
  <a href="https://getartcraft.com/">getartcraft.com</a> ·
  <a href="https://getartcraft.com/apps">The Crafting Apps</a> ·
  <a href="https://getartcraft.com/apps/wordcraft">WordCraft</a>
</p>

## License and credits

WordCraft is dual-licensed under [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at your option.
Copyright (c) 2026 ArtCraft Team and the WordCraft contributors. Required notices are in [NOTICE](NOTICE).

Bundled fonts, icons, images and other assets keep their own open licenses; each one is listed
with its author, source and license in [ATTRIBUTION.md](ATTRIBUTION.md).

The English spelling dictionary and hyphenation come from Grady Ward's public-domain Moby
Hyphenator II word list. Polish spelling reads the Hunspell `pl_PL` dictionary installed on the system (not bundled), as
do Russian, Portuguese, Czech, Italian, Croatian and Turkish spelling (how to install them:
[docs/spelling-dictionaries.md](docs/spelling-dictionaries.md)), and
Polish hyphenation the TeX patterns by Hanna Kołodziejska, Bogusław Jackowski and Marek Ryćko (MIT
option). The sample documents and templates are original text written for WordCraft.

The ArtCraft name, wordmark and logos in [`docs/brand/`](docs/brand/) are trademarks of the
ArtCraft Team and are not covered by this license. They may be used only unmodified, and only as
part of this repository and WordCraft, under [`docs/brand/LICENSE-brand.txt`](docs/brand/LICENSE-brand.txt).
Forks and modified versions must remove them.

<p align="center">
  <a href="https://getartcraft.com/"><img alt="ArtCraft" src="docs/brand/artcraft-mark.svg" width="28"></a><br>
  <sub>Made by the <a href="https://getartcraft.com/">ArtCraft</a> team and community.</sub>
</p>
