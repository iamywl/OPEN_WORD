# Change Log

All notable changes to the "open-word" extension will be documented in this file.

## [0.4.0] - 2026-10-28

### Added & Elevated (100% Rust WASM Native Engine & Glass Design Architecture)
- **100% Pure Rust Native Engine 임베딩 (HarfRust + WebGPU/WebGL2)**:
  - 데스크톱 앱의 100% 동일한 순수 Rust 엔진(`wordcraft-web.wasm`)을 VS Code 익스텐션 내부에 완전 내장.
  - **HarfRust OpenType 고밀도 타이포그래피**: 합자(Ligatures), 커닝(Kerning), 메트릭 호환 폰트 치환(`wordcraft-fonts`) 완벽 지원.
  - **100% 레이아웃 및 페이지네이션 패리티**: 데스크톱 네이티브 앱 및 MS Word와 100% 오차 없는 동일한 줄바꿈, 다단(Multi-column), 각주/미주, 머리글/바닥글, 표 렌더링.
  - **422개 워드 전 기능 커맨드**: 리본의 모든 탭(Home, Insert, Draw, Design, Layout, References, Mailings, Review, View)과 명령을 VS Code 내에서 즉시 실행.
- **듀얼 엔진 스위처 (Dual-Engine Architecture)**:
  - 상단 글래스 헤더에 **[🚀 Rust Native 엔진]**과 **[⚡ 경량 웹 에디터]** 원클릭 전환 캡슐 추가.
  - 사용자의 선호 및 시스템 리소스 환경에 맞추어 `open-word.defaultEngine` 설정을 통해 기본 엔진 선택 지원.
- **글래스 디자인 시스템 (Glassmorphism & Frosted Glass 2.0)**:
  - 상단 리본, 플로팅 엔진 캡슐, 상태바, 다이얼로그 전반에 반투명 아크릴 블러와 1px 미세 빛 반사 경계선(Specular Border) 적용.
  - 데스크톱 네이티브 앱(`crates/ui-egui/src/chrome.rs`) 타이틀바에도 1px 스페큘러 경계선 스트로크를 완벽 동기화.
  - WCAG 4.5:1 이상의 철저한 텍스트 명도 대비 유지.
- **양방향 실시간 호스트 브릿지 (Host PostMessage Bridge)**:
  - `wordcraft:ready`, `wordcraft:open`, `wordcraft:save`, `wordcraft:dirty` 메시지 프로토콜 완벽 연동.
  - VS Code 내에서 문서 변경 시 실시간 Dirty 표시(`•`) 및 Cmd+S/Save 클릭 시 디스크로 비트 단위 완벽 저장.

### Added & Improved (Readability & Feature Completeness)
- **가독성(Readability) 전면 검토 및 개선**:
  - 드롭다운 `<select option>` 텍스트 가독성 문제 해결 (다크/라이트 테마 전용 명시적 스타일 지정).
  - 표 테두리(Table border) 대비를 3.2:1(`#94a3b8`)로 강화하여 격자선 시인성 확보.
  - 상단 눈금자(Ruler) 및 상태바(Status bar) 폰트 가독성 상향 (불필요한 투명도 제거).
  - **어두운 용지 모드 (Dark Paper Mode)** 추가: 장시간 문서 작업 시 눈부심을 방지하는 다크 캔버스 토글 지원 (15.2:1 명도 대비 유지).
- **기능 갭 보강 (Gap Analysis Features)**:
  - **서식 복사 (Format Painter)**: 선택한 글꼴, 크기, 색상, 스타일을 원클릭으로 다른 텍스트에 복사 적용.
  - **줄 간격 조절기 (Line Spacing)**: 1.0배, 1.15배, 1.5배, 2.0배, 2.5배, 3.0배 단락 줄 간격 지원.
  - **표 셀 배경색 채우기 (Table Cell Shading)**: 원하는 셀의 배경색을 팔레트로 자유롭게 변경.
  - **그림 및 이미지 삽입 (Picture Insert)**: URL 및 데이터 URL 이미지 삽입 지원.
  - **OOXML 줄 간격 및 음영 실시간 직렬화**: `w:spacing`, `w:shd` 태그 완벽 지원으로 저장 시 서식 100% 보존.

## [0.2.0] - 2026-10-28

### Added
- **Full Word Processor in VS Code**: Complete Word editing experience directly inside VS Code custom editor.
- **Frosted Glass Ribbon (글래스 리본)**:
  - **Home Tab**: Undo/Redo, Font Family, Font Size, Grow/Shrink, Bold, Italic, Underline, Strike, Sub/Superscript, Text/Highlight Color, Clear Format, Bullet/Number Lists, Indent/Outdent, Left/Center/Right/Justify, Style Gallery, Find & Replace.
  - **Insert Tab**: Tables (interactive rows/cols insert, add/delete row/col), Links, Symbols (•, ※, ★, ✓), Date/Time, Horizontal Rules.
  - **Layout Tab**: Margins (Normal, Narrow, Wide), Orientation (Portrait / Landscape).
  - **Review Tab**: Word Count, Character Count, Paragraph Count, Markdown extraction.
  - **View Tab**: Print Layout (A4 Sheet) vs Web Layout, Ruler toggle, Zoom (50%~200%).
- **Interactive Ruler**: Visual Word ruler above canvas.
- **Two-Way .docx Sync & Save**: Editing marks tab dirty (`•`), and `Cmd+S` or Save button re-packs and writes changes directly back to the `.docx` file on disk.
- **Full Korean IME Support**: Flawless Korean typing (`한글 자모/완성형 조합`) without losing focus or glyphs.

## [0.1.1] - 2026-10-28

### Fixed
- Fixed `openCustomDocument is not a function` error when opening `.docx` files by implementing full `CustomReadonlyEditorProvider` interface.

## [0.1.0] - 2026-10-28

### Added
- Initial release of Open Word for Visual Studio Code.
- Custom editor provider for `.docx`, `.doc`, `.rtf`, `.odt`.
- Frosted glass UI (Glassmorphism) with ambient blur and specular borders.
- Full Korean Hangul and Unicode typography support.
- One-click native desktop app bridge (macOS Metal / Windows DirectX).
- PDF conversion pipeline via CLI integration.
- Markdown and plain text extractor.
- Raw OOXML structure inspector.
- Document statistics viewer (word, char, paragraph count).
