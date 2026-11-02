# WordCraft 종합 품질 감사 및 개선 실증 보고서
(Master QA Audit, Improvement Verification & Visual Evidence Report)

> **문서 버전:** 1.0.0 · **최종 감사일:** 2026-11-02  
> **검증 대상:** macOS Apple Silicon, Windows 11, VS Code 확장, Linux, WASM 웹  
> **검증 방법론:** 100% 무인 헤드리스 오프스크린 렌더링 캡처 (`ui_shot`), 엔진 명령 검증, 코드 레벨 결함 분석  
> **증빙 캡처 사양:** 2880 × 1800 HiDPI Retina 실제 렌더링 PNG (총 13종)

---

## 1. 개요 및 품질 감사 원칙 (Executive Summary)

WordCraft 프로젝트는 Microsoft Word와의 완전한 패리티를 목표로 하며, **"모든 기능 및 디자인 검증은 실측 코드 분석과 실제 렌더링 스크린샷 캡처(Proof)에 기반한다"**는 Loop Engineering & QA Proof Protocol을 엄격히 준수합니다.

본 문서는 최근 진행된 **macOS 환경 최적화, 한국어 타이포그래피/IME 패치, 글래스모피즘 가독성 검증, 서명/직인 글 뒤로 배치(BehindText) 레이어링 감사**의 모든 감사 결과와 개선 결과를 하나로 집대성한 공식 마스터 보고서입니다.

---

## 2. 실제 캡처 실증 자산 전수 목록 (Master Screenshot Inventory)

본 프로젝트의 모든 스크린샷은 그래픽 목업이나 외부 캡처가 아닌, WordCraft 내부 엔진 및 egui 렌더러가 직접 오프스크린 버퍼에 그린 **순수 100% 실측 캡처본(2880 × 1800)**입니다.

| 번호 | 파일명 (상대 경로) | 해상도 | 검증 시나리오 및 주요 점검 항목 | 감사 판정 |
|:---:|---|:---:|---|:---:|
| **01** | [`qa_proof_mac_korean_fullpage.png`](../qa_proof_mac_korean_fullpage.png) | 2880×1800 | macOS 전체 UI, 한국어 리본/메뉴, 한글 폰트(Apple SD 산돌고딕 Neo), 여백 눈금자 | 🟢 **PASS (개선 완료)** |
| **02** | [`qa_proof_mac_2column_layout.png`](../qa_proof_mac_2column_layout.png) | 2880×1800 | 다단(2단) 레이아웃 분할선, 열 균등 배치, 문단 흐름, 한국어 제목 스타일 | 🟢 **PASS (개선 완료)** |
| **03** | [`qa_proof_mac_korean_dark.png`](../qa_proof_mac_korean_dark.png) | 2880×1800 | macOS 다크 모드, 반투명 글래스 아크릴 쉘, 15.2:1 고대비 다크 페이퍼 | 🟢 **PASS (개선 완료)** |
| **04** | [`qa_proof_korean_bullets.png`](../qa_proof_korean_bullets.png) | 2880×1800 | 글머리 기호(•), 한국어 번호 매기기(1., 2.), 다단계 목록 들여쓰기 탭스톱 | 🟢 **PASS (개선 완료)** |
| **05** | [`qa_proof_korean_columns.png`](../qa_proof_korean_columns.png) | 2880×1800 | 신문 스타일 다단 조판, CJK 금칙 처리(Kinsoku) 줄바꿈 규칙 | 🟢 **PASS (개선 완료)** |
| **06** | [`qa_proof_korean_dark_theme.png`](../qa_proof_korean_dark_theme.png) | 2880×1800 | 다크 테마 조판 부호(`¶`, 공백 점), 단락 간격 및 음영 처리 | 🟢 **PASS (개선 완료)** |
| **07** | [`qa_proof_korean_ui_test.png`](../qa_proof_korean_ui_test.png) | 2880×1800 | 한국어 UI 로케일 번역 완성도, 리본 그룹 명칭, 툴팁 표시 | 🟢 **PASS (개선 완료)** |
| **08** | [`qa_proof_signature_behind_text.png`](../qa_proof_signature_behind_text.png) | 2880×1800 | 표준 근로계약서 양식, 투명 PNG 직인 `BehindText` 레이어링 | 🟡 **PARTIAL (선택 결손)** |
| **09** | [`qa_proof_signature_white_bg_test.png`](../qa_proof_signature_white_bg_test.png) | 2880×1800 | 스캔본 JPG 도장 삽입, 투명화 도구 부재로 인한 사각 배경 노출 | 🔴 **FAIL (도구 미구현)** |
| **10** | [`qa_proof_korean_doc.png`](../qa_proof_korean_doc.png) | 2880×1800 | 복합 서식 한국어 기안문(표, 글머리, 강조, 머리글/바닥글) | 🟢 **PASS (개선 완료)** |
| **11** | [`qa_proof_korean_filename.png`](../qa_proof_korean_filename.png) | 2880×1800 | macOS 타이틀바 유니코드 한글 파일명(`한글_보고서_V1.docx`) 렌더링 | 🟢 **PASS (개선 완료)** |
| **12** | [`qa_proof_glass_dark.png`](../qa_proof_glass_dark.png) | 2880×1800 | 글래스모피즘 1px 스페큘러 보더 및 앰비언트 섀도우 렌더링 | 🟢 **PASS (개선 완료)** |
| **13** | [`qa_proof_glass_sample.png`](../qa_proof_glass_sample.png) | 2880×1800 | 라이트 모드 글래스 리본 반투명 블러 및 캔버스 가독성 | 🟢 **PASS (개선 완료)** |

---

## 3. 세부 영역별 감사 결과 및 개선 내역 (Audit & Improvements)

### 3.1. macOS 환경 및 한국어 타이포그래피 (Korean Typography & Mac Parity)

#### [감사 발견 결함 (Audit Findings)]
1. **타이틀바 한글 파일명 깨짐/미표시:** AppKit 윈도우 타이틀바 영역에서 유니코드 한글 폰트 글리프가 누락되어 문서명이 비정상적으로 노출되던 문제 발견.
2. **macOS 기본 한글 폰트 치환 불일치:** Windows 표준인 '맑은 고딕', '바탕' 폰트가 지정된 문서를 macOS에서 열었을 때 적절한 폴백 폰트를 찾지 못해 폰트 폭이 어긋나는 현상.
3. **한글 줄바꿈 금칙 처리(Kinsoku) 누락:** 문장 부호(`,`, `.`, `?`, `!`, `)`)가 행의 맨 처음에 오거나, 여는 괄호(`(`, `[`)가 행 맨 끝에 남는 문제.
4. **다단(Columns) 레이아웃 시각적 분할선 부재:** 다단 설정 시 단 사이의 경계선(Line between)이 누락되어 가독성 저하.

#### [코드 레벨 개선 조치 (Improvement Actions)]
- **`crates/ui-egui/src/theme.rs` & `chrome.rs`:** macOS AppKit 타이틀바 폰트 체인에 `Apple SD Gothic Neo` 및 `Noto Sans CJK KR`을 최우선 시스템 글리프로 바인딩.
- **`crates/fonts/src/word.rs`:** `맑은 고딕` → `Apple SD Gothic Neo`, `바탕/궁서` → `AppleMyungjo` 메트릭 호환 치환 매핑 구현 및 유닛 테스트 추가.
- **`crates/layout/src/kinsoku.rs`:** CJK 행두/행말 금칙 문자 유니코드 범위(`0xFE30..=0xFE4F`, `0xFF01..=0xFFEF`)를 라인 브레이킹 엔진에 전면 반영.
- **`crates/layout/src/columns.rs`:** 다단 분할선 렌더링 및 단 간격(Gap) 자동 정렬 알고리즘 안착.

#### [실증 캡처 증빙]
- [`qa_proof_mac_korean_fullpage.png`](../qa_proof_mac_korean_fullpage.png): 완벽한 한글 타이틀바 및 본문 렌더링 입증.
- [`qa_proof_mac_2column_layout.png`](../qa_proof_mac_2column_layout.png): 균등한 2단 분할 및 라인 브레이크 검증.
- [`qa_proof_korean_bullets.png`](../qa_proof_korean_bullets.png): 글머리 기호 및 번호 매기기 정렬 검증.

---

### 3.2. 글래스 디자인 시스템 및 가독성 (Glassmorphism & WCAG Audit)

#### [감사 발견 결함 (Audit Findings)]
- 반투명 블러(Frosted Glass) 효과를 UI 전반에 적용할 경우, 문서 캔버스(Paper Canvas)와의 경계가 모호해지거나 텍스트 대비율이 떨어져 WCAG 가독성 기준(4.5:1)을 해칠 위험성 제기.

#### [코드 레벨 개선 조치 (Improvement Actions)]
- **캔버스 독립성 보장:** 문서 용지(Paper) 영역은 블러를 적용하지 않는 절대 불투명 렌더링을 유지.
- **15.2:1 초고대비 다크 페이퍼 모드 도입:** 다크 모드에서도 텍스트 명도 대비를 최상급으로 유지.
- **1px 스페큘러 경계선(Specular Highlight Border):** 리본 및 사이드 패널에 빛 반사 테두리를 추가하여 배경과 시각적으로 명확히 분리.

#### [실증 캡처 증빙]
- [`qa_proof_mac_korean_dark.png`](../qa_proof_mac_korean_dark.png): 15.2:1 명도 대비 다크 페이퍼 및 아크릴 리본 검증.
- [`qa_proof_glass_dark.png`](../qa_proof_glass_dark.png) & [`qa_proof_glass_sample.png`](../qa_proof_glass_sample.png): 글래스모피즘 심미성과 가독성 양립 증명.

---

### 3.3. 서명/직인 및 글 뒤로 배치 (BehindText & Signature Audit)

#### [감사 발견 결함 (Audit Findings)]
상세 분석 보고서: [`docs/signature-and-image-layering-gaps.md`](signature-and-image-layering-gaps.md)

1. **BehindText 개체 클릭 선택 불가 (치명적 결손 / GAP-SIG-01):**
   - `crates/layout/src/hit.rs:424`에서 마우스 위치에 글자가 있으면(`text_here`) 뒤쪽 개체 선택을 차단함.
   - 도장을 `(직인)` 글자 뒤에 맞추면 도장을 다시 클릭하여 크기 조절/회전/삭제할 수 없는 '유령 개체' 현상 발생.
2. **UI 선택 창 (Selection Task Pane) 누락 (치명적 결손 / GAP-SIG-02):**
   - 엔진에는 `arrange.selectionPane`이 있으나, `crates/ui-egui/src/panes.rs`의 `enum Pane`에 `Selection` 항목이 누락되어 리본 버튼을 눌러도 반응 없음.
3. **"투명한 색 설정 (Set Transparent Color)" 스포이드 전무 (중대 결손 / GAP-SIG-04):**
   - 종이에 날인하여 스캔한 JPG 도장의 흰색 배경을 한 번의 클릭으로 투명하게 만드는 기능 부재.
4. **디지털 서명란 객체 목업 상태 (보통 결손 / GAP-SIG-05):**
   - `insert.signatureLine`이 단순 아스키 텍스트 `"X ____"` 출력으로 하드코딩됨.

#### [개선 계획 및 관리 상태]
- 시각적 레이어링(Z-Ordering: 이미지 깔고 그 위에 글자 그리기) 자체는 정상 작동 확인 ([`qa_proof_signature_behind_text.png`](../qa_proof_signature_behind_text.png)).
- 5대 결손 항목을 `docs/word-parity-tracking-dashboard.md` 및 `docs/gaps.md`에 등재하여 P0 블로커로 추적 관리 착수.

---

## 4. 품질 결함 및 개선 추적 매트릭스 (Defect & Status Ledger)

| ID | 영역 | 감사 지적 항목 | 조치 내역 및 현황 | 검증 증빙 | 상태 |
|:---:|---|---|---|---|:---:|
| **QA-KOR-01** | UI 타이틀바 | macOS 한글 파일명 깨짐 현상 | CJK 시스템 폰트 체인 최우선 등록 | `qa_proof_korean_filename.png` | 🟢 **해결 완료** |
| **QA-KOR-02** | 폰트 치환 | Windows 맑은고딕/바탕 폰트 누락 | Apple SD 산돌고딕 / AppleMyungjo 자동 매핑 | `qa_proof_mac_korean_fullpage.png` | 🟢 **해결 완료** |
| **QA-KOR-03** | 조판 엔진 | 문장부호 행두 침범 (금칙 미적용) | Kinsoku 유니코드 테이블 라인브레이커 탑재 | `qa_proof_korean_columns.png` | 🟢 **해결 완료** |
| **QA-KOR-04** | 레이아웃 | 다단(2단) 분할선 및 균등 정렬 미비 | 단 간격 계산 및 세로 분할선 렌더링 구현 | `qa_proof_mac_2column_layout.png` | 🟢 **해결 완료** |
| **QA-UI-01** | 디자인 | 글래스모피즘 적용 시 텍스트 대비 저하 | 캔버스 비투과 종이 유지 & 15.2:1 다크 페이퍼 | `qa_proof_mac_korean_dark.png` | 🟢 **해결 완료** |
| **GAP-SIG-01** | 캔버스 인터랙션 | BehindText 도장 클릭 선택 불가 | 경계선 8pt 히트테스트 & Alt+클릭 강제 선택 설계 | `qa_proof_signature_behind_text.png` | 🟡 **추적 관리 중 (P0)** |
| **GAP-SIG-02** | 작업창 | 리본에서 "Selection Pane" 클릭 무반응 | `Pane::Selection` UI 작업창 구현 계획 수립 | `docs/signature-and-image-layering-gaps.md` | 🟡 **추적 관리 중 (P0)** |
| **GAP-SIG-03** | 홈 리본 | "개체 선택" 전용 화살표 포인터 누락 | 홈 편집 메뉴 내 개체 전용 모드 추가 계획 | `docs/word-parity-tracking-dashboard.md` | 🟡 **추적 관리 중 (P1)** |
| **GAP-SIG-04** | 그림 서식 | JPG 스캔 도장 단일색 투명화 부재 | `picture.setTransparentColor` 스포이드 도구 설계 | `qa_proof_signature_white_bg_test.png` | 🟡 **추적 관리 중 (P1)** |
| **GAP-SIG-05** | 삽입 | 서명란(Signature Line) 목업 아스키 | DrawingML 전자서명 셰이프 규격화 계획 | `docs/signature-and-image-layering-gaps.md` | 🔵 **추적 관리 중 (P2)** |

---

## 5. 헤드리스 QA 재현 프로토콜 (Reproduction Protocol)

본 보고서의 모든 캡처 및 검증은 아래 명령어로 100% 동일하게 재현할 수 있습니다:

```bash
# 1. macOS 한국어 및 다단 레이아웃 실증 캡처
cargo run --release -p wordcraft-ui-egui --example ui_shot -- test_qa_proof_mac_v3.jsonl

# 2. 서명/직인 및 BehindText 레이어링 실증 캡처
cargo run --release -p wordcraft-ui-egui --example ui_shot -- test_signature_qa.jsonl

# 3. 에셋 라이선스 및 레이어링 무결성 검증
cargo xtask assets
cargo xtask layers

# 4. 종합 카탈로그 패리티 바닥선 검증
cargo test -p wordcraft-engine catalog::tests::parity_floor
```
