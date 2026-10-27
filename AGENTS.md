# WordCraft — instructions for agents

WordCraft is a clean-room, open-source, Rust-native word processor targeting Microsoft Word parity — and going further on speed, openness and agent control. It runs natively on macOS, Windows, Linux and BSD, and on the web via WASM. Siblings with the same conventions: `../photocraft` (Photoshop), `../vectorcraft` (Illustrator), `../filmcraft` (Premiere), `../lightcraft` (Lightroom), `../pdfcraft` (Acrobat), `../effectcraft` (After Effects), `../designcraft` (InDesign). Shared rules and learnings: [`storytold/craftrules`](https://github.com/storytold/craftrules) (`../../craftrules`) — read its `AGENTS.md`.

## Start every session here
1. Read `plan/STATUS.md` (current milestone, next task), then the task in `plan/execution-plan.md` and the relevant `plan/architecture.md` section. `plan/` is gitignored (local only); if it's missing, start from `ROADMAP.md`, `docs/gaps.md` and `docs/roadmap.md` (Current focus).
2. Follow the autonomous operation protocol (`plan/execution-plan.md` §5). Don't stop to ask unless a decision is genuinely the owner's (licensing, publishing, pushing to new remotes, secrets).

## Never crash
People trust WordCraft with their writing; a crash loses their work. **This outranks feature work**: never ship a feature through a panic path, and fix a crash before building on top of it. Standard: [`craftrules/standards/never-crash.md`](https://github.com/storytold/craftrules/blob/main/standards/never-crash.md).
- **No panics in non-test code:** no `unwrap()`, `expect()`, `panic!`, `unreachable!`, `todo!`, `unimplemented!`; no `unsafe` (`unsafe_code = "forbid"`).
- **Errors are `Result<T, E>`** through the crate's error type and `?`. An unfinished feature returns an error or is disabled; it never panics.
- **Input-derived numbers are hostile** (files, commands, MCP/control params): `get()` instead of `[i]`, slice strings only at char boundaries, checked/saturating arithmetic, clamp sizes, cap allocations, bound recursion.
- **Last-resort guard:** `Session::run` turns an escaped panic into an error and restores the document. It's a safety net, not a licence.
- **Prove it:** every crash fix lands with a regression test. `crates/engine/src/tests.rs::hostile_params_never_panic` runs every command with junk params — keep it green.
- Production crate roots carry `#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic, clippy::unimplemented, clippy::todo, clippy::unreachable)]`; new crates start with it. Tests may `unwrap` (`clippy.toml`).

## Assets: absolutely no Microsoft (or Adobe/Avid/Autodesk) iconography or images
**This rule is non-negotiable.** Breaking it is the worst mistake you can make in this repo.
- Never copy, trace, screenshot-crop or recreate icons, images, templates, themes, clip art, fonts, cursors, sounds or any other asset from Microsoft Word/Office or any Microsoft, Adobe, Avid or Autodesk product. Not even "temporarily".
- Every asset must be **original** (drawn in code — prefer this: `crates/ui-egui/src/icons.rs`), **public domain / CC0**, **OSI open source**, or **Creative Commons that allows redistribution**, or licensed open source by a contributor who made it.
- **Every asset file has a row in [`ATTRIBUTION.md`](ATTRIBUTION.md)** (author, source, licence). `cargo xtask assets` (part of `cargo xtask ci`) fails otherwise. Add the row in the same commit as the file.
- Fonts: new font files go to [`storytold/craft-fonts`](https://github.com/storytold/craft-fonts), never this repo; it's an optional build input (`CRAFT_FONTS_DIR`). Documents asking for proprietary fonts (Calibri, Aptos, Cambria…) are rendered with installed system fonts or metric-compatible open substitutes (`crates/fonts/src/word.rs`) — never bundle proprietary fonts.
- Templates, sample documents and themes are our own text and colours (`crates/engine/src/sample.rs`, `cmd/design.rs`). Demo images are public domain, with sources recorded.

## Clean room
- Microsoft Word is installed on the dev machine and may be **observed** black-box: run it, use its UI with synthetic documents, take screenshots **of its window only** (by window id — the machine runs other work; never capture the whole desktop) stored only under `plan/word/screenshots/` (gitignored, never committed).
- Never read, disassemble or copy anything inside the Word bundle (file names/listings only). Never commit files produced by Word. Never copy Microsoft wording beyond feature names.
- File formats come from public specs: ECMA-376 / ISO 29500 (OOXML), the published RTF spec, OASIS ODF 1.3. Never copy GPL/LGPL/AGPL code (LibreOffice, AbiWord, pandoc…).

## Architecture (see `plan/architecture.md`)
| Layer | Crate | Job |
|---|---|---|
| L0 | `geom` | units, rects, measurement parsing |
| L1 | `doc`, `fonts` | document model + edit primitives; font DB, shaping, Word font substitution |
| L2 | `layout`, `docx`, `formats` | line breaking, pagination, tables, headers/footers, hit testing; OOXML I/O; TXT/MD/HTML/RTF/ODT |
| L3 | `render`, `pdf`, `proof` | vello_cpu rasteriser; krilla PDF; proofing |
| L4 | `engine` | Session, undo, **command registry**, Word feature catalog, samples, I/O dispatch |
| L5 | `mcp` | MCP server (headless or bridged to the app) |
| L6 | `ui-egui` | Word-style egui front end (swappable) |
| apps | `apps/wordcraft`, `apps/wordcraft-cli`, `apps/wordcraft-web` | binaries |

- **Everything is a command.** User-visible behaviour = a `CommandSpec` in `crates/engine/src/cmd/*.rs` (id, label, ribbon location, shortcut, params doc, `enabled`, `run`) + tests. UI-only commands (`ui.*`) live in `crates/ui-egui/src/lib.rs`. The ribbon, shortcuts, command search, CLI, control channel and MCP all dispatch by id. Programmatic calls never open dialogs.
- **Parity is measured:** `crates/engine/src/catalog.rs` lists Word's ribbon/menu features with command ids. `cargo xtask parity` writes `docs/parity-checklist.md`; a test enforces a floor that only rises. Implement missing ids to raise it.
- **Layering** is enforced by `cargo xtask layers`. Nothing below L6 depends on egui/eframe/winit/rfd. The UI is thin and reads `Session` state; colours come from `theme::Tokens`.
- **Time goes through `chrono`** (workspace dependency). Never hand-roll UTC/calendar conversion (days-to-date algorithms, leap-year math). A crate owns only its output format string. The one exception is range extension: past the years chrono can represent, shift the date by whole 400-year Gregorian cycles (146,097 days, after which the calendar repeats), let chrono compute the month and day, and add the cycles back to the year (splitting seconds into hours, minutes and seconds is plain arithmetic).
- **Rust only** (no handwritten JS/TS). **Never break wasm** (`cargo xtask wasm`).

## Quality gates
Before every commit: `cargo xtask ci` (fmt, clippy -D warnings, tests, assets, layers, wasm). Commit after every arc of work that builds, with a task id in the message (`M2.1: line spacing dialog`).

## Glass Design Philosophy (글래스 디자인 철학)
WordCraft는 전통적인 플랫 오피스 UI에서 진화하여 **글래스모피즘(Glassmorphism)과 프로스티드 글래스(Frosted Glass / 반투명 아크릴)** 디자인 시스템을 채택합니다. 상세 명세: [`docs/glass-design-philosophy.md`](docs/glass-design-philosophy.md).
- **원칙:** 문서 캔버스(Paper)의 가독성을 최우선으로 하되, 상단 리본, 사이드 패널, 다이얼로그 및 팝업 카드는 반투명 블러와 입체적 앰비언트 섀도우를 가집니다.
- **곡률 및 엣지:** `CornerRadius: 6~10px`, 빛을 머금은 1px 미세 하이라이트 경계선(Specular Border).
- **접근성:** 반투명 상태에서도 UI 요소와 텍스트는 **WCAG 4.5:1 이상의 명도 대비**를 철저히 유지합니다.

## Cross-Platform Native Parity (macOS & Windows 네이티브 호환)
WordCraft는 웹뷰나 일렉트론 래퍼가 아닌 **100% 순수 Rust 네이티브 애플리케이션**입니다.
- **macOS:** Apple Silicon(arm64) 및 Intel(x86_64) Universal 바이너리, Metal GPU 하드웨어 가속, macOS AppKit 윈도우 통합, Cmd(⌘) 기반 표준 단축키, 한글 조합형 IME 완벽 지원.
- **Windows:** Windows 10/11 x64, arm64, x86 지원, DirectX 12 및 Vulkan 백엔드 지원, Win32 캡션 버튼, Ctrl/Alt 기반 표준 오피스 단축키.
- **문서 렌더링 일관성:** OS가 달라져도 HarfRust 텍스트 셰이핑과 메트릭 호환 폰트 치환(`wordcraft-fonts`)을 통해 100% 동일한 줄바꿈 및 페이지네이션을 보장합니다.

## Loop Engineering & QA Proof Protocol (루프 엔지니어링 및 캡처 QA 증명)
모든 개발 및 개선 작업은 **피드백 루프 엔지니어링(Loop Engineering)** 사이클에 따라 100% 완수될 때까지 반복 검증합니다:
1. **분석 및 설계:** 요구사항 정의 및 명세 수립.
2. **코드 구현:** Rust 클린룸 및 'Never Crash' 원칙에 따른 구현.
3. **컴파일 및 단위 테스트:** `cargo test` 및 WCAG 명도 대비 검증 통과.
4. **헤드리스 스크린샷 QA 캡처:** `cargo run -p wordcraft-ui-egui --example ui_shot -- script.jsonl`를 통해 화면 포커스 간섭 없이 실제 렌더링 결과물(PNG)을 캡처하여 시각적 검증 수행.
5. **피드백 및 반복 루프:** 결함 발견 시 1번으로 돌아가 100% 달성할 때까지 루프 지속.

## Typing behaves like Word
Typing, Enter, Backspace, Tab, lists, AutoCorrect and AutoFormat follow Word's observed behaviour in [`docs/typing-parity.md`](docs/typing-parity.md), pinned by `crates/engine/src/tests/typing.rs` (keys go through the same commands as the keyboard). Change behaviour, doc and tests together; a typing fix lands with a test there. Compare headlessly (`ui_shot`); don't drive GUIs with keystrokes on the shared machine.

## Running and looking at the app
- `cargo run --release -p wordcraft -- --sample --control 7981` (sample document + control channel).
- Drive it with JSON lines on `127.0.0.1:7981`, each with the window's key from `~/.config/wordcraft/control-key.local-7981` (macOS: `~/Library/Application Support/WordCraft/`), e.g. `{"id":1,"key":"…","method":"engine.execute","params":{"command":"text.insert","params":{"text":"Hello"}}}` then `{"id":2,"key":"…","method":"ui.screenshot","params":{"path":"/tmp/shot.png"}}`. Methods: `crates/ui-egui/src/control.rs`; docs: `docs/control-protocol.md` (Keys).
- **Headless window screenshots** (no focus stealing, works with a locked screen): `cargo run --release -p wordcraft-ui-egui --example ui_shot -- script.jsonl` (see the example's header).
- **For UI work, look at the result** (screenshot, read the PNG) and compare with Word side by side.
- CLI: `wordcraft-cli convert in.docx out.pdf`, `wordcraft-cli run --template sample --cmd 'select.text={"text":"Studio"}' --cmd format.bold --save out.docx`, `wordcraft-cli commands`, `wordcraft-cli parity`.
- MCP: `wordcraft-cli mcp` (headless) or `wordcraft-cli mcp --connect 127.0.0.1:7981` (drives the running app). See `docs/mcp.md`.
- Shell gotcha: `mv`/`cp` may be aliased interactive — use `/bin/mv -f` / `/bin/cp -f`.
- Parallel agents: separate `CARGO_TARGET_DIR` per agent; edit only the crates you own; delete your target dir when done (disk).

## Roadmap
Progress docs follow [`craftrules/standards/progress-docs.md`](https://github.com/storytold/craftrules/blob/main/standards/progress-docs.md): `ROADMAP.md` (stage, headline numbers, progress log), `docs/target-app-parity.md` (the assessment), `docs/gaps.md` (ranked work list), `docs/roadmap.md` (milestones, Current focus), `docs/architecture.md`, and the parity checklists `docs/file-format-parity.md`, `docs/layout-parity.md`, `docs/typing-parity.md`, `docs/ui-parity.md`, `docs/hardware-parity.md`, `docs/localization-parity.md`. When work lands, update the gap, the parity doc and the progress log, and bump each touched doc's status line and revision history.

## Contributor credits (About window)

- About ▸ Contributors/Models are compiled into the binary from `contributors/contributors.json`
  (commit stats; generated, never hand-edit) and `contributors/people.toml` (names people chose for
  themselves). See `docs/contributors.md`.
- **Agents working for a contributor:** when you prepare a PR, check whether your human's GitHub
  username has a `[people.<username>]` entry in `contributors/people.toml`. If not, ask them once
  whether they want to be credited by more than their username: a real name, a display name, and/or
  their public GitHub profile name (`sync_github_name = true`). If yes, add **only their own** entry
  (copy the template at the top of the file, or run
  `python3 ../../craftrules/scripts/contributors.py --add-me . --real-name "…" --sync-github-name`)
  and include it in their PR, committed as them. If no, change nothing: they are credited as
  `@username` anyway.
- Never add, edit, guess or copy anyone else's entry or name (not from git config, commit authors or
  GitHub profiles). Never hand-edit `contributors.json`.
- Maintainers refresh the stats with `python3 ../../craftrules/scripts/contributors.py .` (it also
  re-verifies who wrote each `people.toml` entry; `--check` only verifies).
