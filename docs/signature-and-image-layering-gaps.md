# 서명/직인 및 글 뒤로 배치(BehindText) 레이어링 결손 보고서
(Technical Audit & Gap Analysis: Signatures, Stamps, and Behind-Text Image Layering)

> **문서 상태:** 활성 추적 및 관리 (Active Tracking)  
> **최초 작성일:** 2026-11-01  
> **기준 대상:** Microsoft Word (Microsoft 365) Mac 16.113.4 / Windows & ECMA-376 DrawingML / VML  
> **검증 도구:** 헤드리스 렌더링 캡처 (`ui_shot`), 엔진 명령 레지스트리 (`crates/engine`), 레이아웃 히트테스트 (`crates/layout/src/hit.rs`)

---

## 1. 개요 및 배경 (Executive Summary)

한국 및 글로벌 비즈니스 환경에서 워드프로세서의 가장 핵심적인 실무 워크플로우 중 하나는 **계약서, 기안서, 품의서 등 문서 하단의 서명란 또는 `(인)` / `(직인)` 위치에 전자 서명 파일이나 도장(스탬프) 이미지를 삽입하고, 글자와 자연스럽게 겹치도록 "글 뒤로 배치(Behind Text)"하는 작업**입니다.

본 보고서는 WordCraft의 현재 코드베이스(`crates/doc`, `crates/layout`, `crates/render`, `crates/engine`, `crates/ui-egui`)를 엄밀히 전수 조사하고, 실제 근로계약서 문서와 투명 PNG 직인, 흰색 배경 JPG 도장 파일을 제작하여 헤드리스 캡처(`ui_shot`)로 실증 테스트를 수행한 결과를 바탕으로 작성되었습니다.

### 핵심 결론 요약
1. **시각적 렌더링(Rendering) 자체는 작동:** 엔진 및 렌더러 수준에서 `Wrap::BehindText` 설정 시 텍스트 아래에 이미지가 정상적으로 깔려 렌더링됩니다.
2. **그러나 치명적인 상호작용 결손(Interaction Blocker) 존재:**
   - 텍스트 아래에 들어간 이미지는 **마우스 클릭으로 선택할 수 없는 "유령 개체(Unselectable Ghost)" 현상** 발생 (`crates/layout/src/hit.rs`의 텍스트 우선 분기 로직).
   - Word에서 이를 보완하는 **"선택 창(Selection Pane)"** 및 **"개체 선택(Select Objects)"** 포인터 모드가 UI에서 완전히 누락됨.
   - 실제 스캔 도장의 90%를 차지하는 흰색 배경 JPG를 처리하는 **"투명한 색 설정(Set Transparent Color)" 스포이드 기능이 전무함**.
   - `Insert › Signature Line (서명란)`은 단순 ASCII 텍스트 `"X ______"`를 삽입하는 목업 상태임.

---

## 2. 실증 테스트 및 헤드리스 캡처 검증 (Headless Proof)

실제 실무 시나리오를 재현하기 위해 다음 3종의 테스트 자산을 생성하여 `ui_shot` 헤드리스 렌더링 검증을 진행하였습니다:
- **문서:** `test_documents/signature_contract_test.docx` (표준 근로계약서 양식, 사업주 및 근로자 서명란 포함)
- **도장 1 (투명 PNG):** `test_documents/stamp_transparent.png` (알파 채널이 포함된 붉은색 "이영우인" 직인)
- **도장 2 (흰색 배경 JPG):** `test_documents/stamp_white_bg.jpg` (일반 스캔본/스마트폰 촬영 형태의 "홍길동인" 도장)

### 실증 캡처 결과

| 검증 시나리오 | 캡처 결과물 | 동작 상태 및 실무 판정 |
|---|---|---|
| **시나리오 A: 투명 PNG 직인 `BehindText`** | `qa_proof_signature_behind_text.png` | 🟡 **부분 성공:** 빨간색 직인 위에 계약서 텍스트("대표이사 이영우 (직인)")가 선명하게 오버레이 렌더링됨. 그러나 직인을 클릭하여 다시 크기 조절/이동하려 하면 텍스트 커서가 잡혀 **선택 불가**. |
| **시나리오 B: 흰색 배경 JPG 도장 `BehindText`** | `qa_proof_signature_white_bg_test.png` | 🔴 **실무 불가:** 스캔된 사각형 흰색 배경이 그대로 남아 투명화 불가. "투명한 색 설정" 스포이드 부재로 실무 사용 시 지저분한 사각형 패치가 노출됨. |

---

## 3. 코드베이스 정밀 분석 (Code Deep Dive)

### 3.1. 치명적 버그: 글 뒤 개체 클릭 선택 차단 (`crates/layout/src/hit.rs`)

`crates/layout/src/hit.rs`의 `object_at` 메서드 (라인 410~427):

```rust
// crates/layout/src/hit.rs:418-426
let text_here = match story {
    StoryRef::Body => text_at(p, page, x, y).is_some(),
    StoryRef::Part(id) => hf_text_at(p, id, x, y),
};
cands
    .iter()
    .find(|o| !o.behind() && grabs(o))
    .or_else(|| if text_here { None } else { cands.iter().find(|o| o.behind() && grabs(o)) })
    .cloned()
```

- **발생 원리:** 마우스 좌표 `(x, y)`에 텍스트가 존재하면 (`text_here == true`), `behind()` 개체는 후보군에서 즉시 `None`으로 폐기됩니다.
- **사용자 경험 결함:** 도장이 `(직인)` 글자 바로 밑에 정확히 배치되면, 도장의 바운딩 박스를 클릭하는 모든 시도가 텍스트 클릭으로 인식되어 텍스트 캐럿(I-beam)만 깜빡입니다.
- **결과:** 사용자가 도장의 크기를 조절(Resize handle)하거나 회전, 삭제, 서식 변경을 하려고 클릭해도 개체가 절대 잡히지 않습니다. (이동의 경우 drag-threshold를 넘겨 강제로 드래그하는 임시 패치만 존재할 뿐, 클릭 선택 및 핸들 노출은 불가능).

---

### 3.2. UI 선택 창(Selection Pane)의 완전 누락 (`crates/ui-egui/src/panes.rs`)

Microsoft Word에서는 글 뒤로 숨겨진 개체를 선택하기 위해 **홈/레이아웃 › "선택 창(Selection Pane)"**을 열어 개체 목록에서 "Picture 1"을 클릭합니다.

WordCraft의 현황:
1. **엔진 수준 (`crates/engine/src/cmd/objects/specs.rs:248`):**
   - `CommandSpec::new("arrange.selectionPane", "Selection Pane", ..., objects_list).pure()`
   - 개체 목록을 JSON 배열로 반환하는 순수 함수는 구현되어 있음.
2. **UI 리본 수준 (`crates/ui-egui/src/ribbon/layout.rs:152`):**
   - 리본 레이아웃 탭에 "Selection Pane" 버튼이 존재하며 `arrange.selectionPane`을 실행함.
3. **UI 작업창(Pane) 구현체 (`crates/ui-egui/src/panes.rs:48-60`):**
   ```rust
   pub enum Pane {
       SmartArtText,
       Navigation,
       Clipboard,
       Styles,
       StyleInspector,
       Accessibility,
       AltText,
       FormatShape,
       RestrictEditing,
       Comments,
   }
   ```
   - **`Pane::Selection`이 열거형(Enum)에 전혀 존재하지 않음!**
   - 사용자가 리본에서 "Selection Pane"을 클릭해도 아무런 사이드바나 창이 열리지 않고 무반응으로 끝남.

---

### 3.3. "투명한 색 설정(Set Transparent Color)" 스포이드 전무

실무에서 사용자가 스캔한 도장이나 서명은 대부분 JPG 형식이며, 도장 주변에 흰색 종이 배경이 포함되어 있습니다.

- **Microsoft Word:** `그림 서식 › 색 › "투명한 색 설정"` 클릭 시 마우스가 스포이드 아이콘으로 변하고, 도장의 흰색 영역을 클릭하면 해당 RGB 색상이 즉시 알파 0(투명)으로 치환됨.
- **WordCraft 현황:**
  - `crates/ui-egui/src/ribbon/picture.rs`: 채도(Saturation), 흑백(Grayscale), 세피아(Sepia), 워시아웃(Washout)만 존재.
  - "투명한 색 설정" 메뉴 및 스포이드 피커 모드가 엔진과 UI 모두에 전혀 구현되어 있지 않음.
  - 엔진에 `picture.removeBackground`(`crates/engine/src/cmd/objects/picture.rs`)가 있으나 단순 코너(0,0) 기준 플러드필 방식이며, 리본 UI에 연결조차 되어 있지 않음.

---

### 3.4. 서명란(Signature Line) 기능의 목업 상태 (`crates/engine/src/cmd/tools/specs.rs`)

Word의 `삽입 › 서명란(Signature Line)`은 전용 VML/DrawingML `o:signatureline` 개체로, 서명자 이름/직책 표시 박스와 더블클릭 시 공인인증서/디지털 서명을 연동하는 기능을 갖추고 있습니다.

- **WordCraft 현황 (`crates/engine/src/cmd/tools/specs.rs:190-205`):**
  ```rust
  CommandSpec::new("insert.signatureLine", "Signature Line", "Insert › Text", |s, v| {
      let signer = p::str(v, "signer").unwrap_or("홍길동");
      let title = p::str(v, "title").unwrap_or("대표이사");
      let text = format!("\nX ______________________________\n{}\n{}\n", signer, title);
      s.run("text.insert", &json!({"text": text}))
  })
  ```
  - 단순히 텍스트 스트링(`"X ______________________________"`)을 문서에 타이핑하는 수준의 목업(Stub)에 불과함.

---

## 4. 5대 핵심 결손 명세표 (The 5 Critical Shortcomings)

| 결손 ID | 결손 항목명 | 심각도 | 영향 받는 실무 시나리오 | 현재 상태 및 근본 원인 |
|:---:|---|:---:|---|---|
| **GAP-SIG-01** | **BehindText 개체 클릭 선택 불가 (Unselectable Ghost)** | 🔴 **P0 (치명적)** | 도장/서명을 텍스트 뒤에 배치한 후 크기 조절, 회전, 이동, 삭제하려는 모든 작업 | `crates/layout/src/hit.rs:424`에서 `text_here`가 참일 경우 `behind()` 개체 히트테스트를 강제 차단하여 텍스트 캐럿만 활성화됨. |
| **GAP-SIG-02** | **UI 선택 창 (Selection Task Pane) 미구현** | 🔴 **P0 (치명적)** | 겹쳐진 개체, 글 뒤 개체 탐색 및 순서(Z-Order) 변경, 숨김/보임 토글 | 엔진 명령(`arrange.selectionPane`)은 있으나 `crates/ui-egui/src/panes.rs`에 `Pane::Selection`이 없어 버튼 클릭 시 창이 열리지 않음. |
| **GAP-SIG-03** | **"개체 선택(Select Objects)" 포인터 도구 누락** | 🟡 **P1 (중대)** | 본문 텍스트를 무시하고 캔버스 상의 모든 부동 개체/도형만 드래그/클릭 선택 | `Home › Editing › Select` 메뉴에 `Select Objects` 모드 토글이 없고, 엔진의 `select.objects`는 인덱스 단발 선택 전용. |
| **GAP-SIG-04** | **"투명한 색 설정 (Set Transparent Color)" 스포이드 전무** | 🟡 **P1 (중대)** | JPG 등 흰색 배경을 가진 스캔 도장/서명 파일을 투명하게 만들어 문서에 날인 | 컬러 서식 탭에 스포이드 투명화 도구가 없어 흰색 네모 박스가 글자나 문서 배경을 가림. |
| **GAP-SIG-05** | **디지털 서명란 (Signature Line) 객체 규격 미지원** | 🔵 **P2 (보통)** | 공공/기업 전자계약서 양식의 표준 서명란(X 표시 및 인증서 필드) 삽입 | 엔진이 순수 아스키 텍스트 `"X ____"` 삽입으로 하드코딩되어 있으며 DrawingML 전자서명 셰이프 미지원. |

---

## 5. 해결 설계 및 로드맵 (Actionable Resolution Roadmap)

### Phase 1: BehindText 선택 인터랙션 및 선택 창 복원 (P0 - 즉각 대응)
1. **`crates/layout/src/hit.rs` 히트테스트 개선:**
   - 마우스가 객체의 경계선(Border/Bounding Box) 8pt 이내에 위치하거나, `Alt+클릭` 또는 더블클릭 시 `text_here`와 무관하게 `BehindText` 객체를 선택할 수 있도록 폴백 우선순위 조정.
2. **`ui-egui` 선택 작업창(Selection Pane) 구현:**
   - `crates/ui-egui/src/panes.rs`에 `Pane::Selection` 추가.
   - 우측 도킹 패널로 열리며, 페이지 내 모든 개체 목록(도장, 이미지, 도형)을 표시하고 클릭 시 즉각 선택(`select.objects`), 눈동자 아이콘(보임/숨김), 위/아래 순서 변경 버튼 제공.

### Phase 2: 스캔 도장 투명화 처리 ("투명한 색 설정") (P1 - Beta 필수)
1. **`picture.setTransparentColor` 명령 구현:**
   - 대상 이미지에서 지정된 RGB(예: 흰색 `#FFFFFF`)와 유사 허용치(Tolerance) 내의 픽셀 알파 채널을 0으로 변환하는 무손실 필터 추가.
2. **UI 스포이드 모드 연결:**
   - `Picture Format › Color › Set Transparent Color` 버튼 추가.
   - 클릭 시 캔버스 마우스 커서가 스포이드로 변경되고, 이미지를 클릭한 픽셀의 색상을 투명화.
3. **`picture.removeBackground` 리본 노출:**
   - 이미 엔진에 구현된 배경 제거 알고리즘을 `Picture Format › Adjust` 맨 좌측에 정식 버튼으로 노출.

### Phase 3: 표준 서명란(Signature Line) DrawingML 규격화 (P2)
1. **OOXML `w:drawing` 기반 `o:signatureline` 지원:**
   - 단순 텍스트 삽입을 폐기하고 전용 서명 컴포넌트로 렌더링.
   - 서명자 이름, 직책, 서명 가이드라인 렌더링 지원.

---

## 6. 결론 및 관리 방침

본 조사를 통해 **"글 뒤로 이미지 배치"의 시각적 렌더링 파이프라인은 정상 작동함**이 실증되었으나, 사용자가 실제로 서명 및 직인을 날인하고 제어하는 **선택(Selection), 제어(Selection Pane), 투명화(Transparency Eyedropper)의 3대 인터랙션 고리가 단절되어 있음**이 명확히 규명되었습니다.

본 보고서의 5대 결손 항목은 즉시 `docs/gaps.md` 및 `docs/word-parity-tracking-dashboard.md`의 관리 지표에 정식 등재되어 완료 시점까지 엄격히 추적 관리됩니다.
