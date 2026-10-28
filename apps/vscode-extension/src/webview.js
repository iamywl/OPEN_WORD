// Full Word Processor Webview Generator for Visual Studio Code (Open Word)
const { escapeHtml } = require('./docx-parser');

function renderWebviewHtml(docData, fileName, filePath) {
  const { metadata, blocks, stats } = docData;
  const title = metadata.title || fileName || 'Document';

  // Render initial document blocks into editable HTML content
  let initialHtml = '';
  if (blocks && blocks.length > 0) {
    for (const block of blocks) {
      if (block.type === 'heading') {
        const tag = `h${block.level}`;
        const runsHtml = renderRunsToHtml(block.runs);
        initialHtml += `<${tag} style="text-align: ${block.align || 'left'};">${runsHtml}</${tag}>\n`;
      } else if (block.type === 'paragraph') {
        const runsHtml = renderRunsToHtml(block.runs);
        if (block.isList) {
          initialHtml += `<ul><li>${runsHtml}</li></ul>\n`;
        } else {
          initialHtml += `<p style="text-align: ${block.align || 'left'};">${runsHtml || '<br/>'}</p>\n`;
        }
      } else if (block.type === 'table') {
        initialHtml += '<table class="word-table">\n';
        block.rows.forEach((row, rIdx) => {
          initialHtml += '  <tr>\n';
          row.forEach(cell => {
            const cellTag = rIdx === 0 ? 'th' : 'td';
            const cellText = cell.paragraphs && cell.paragraphs.length > 0
              ? cell.paragraphs.map(p => renderRunsToHtml(p.runs)).join('<br/>')
              : escapeHtml(cell.text);
            initialHtml += `    <${cellTag}>${cellText || '<br/>'}</${cellTag}>\n`;
          });
          initialHtml += '  </tr>\n';
        });
        initialHtml += '</table>\n';
      }
    }
  } else {
    initialHtml = '<h1>새 문서</h1><p>여기에 내용을 입력하세요.</p>';
  }

  function renderRunsToHtml(runs) {
    if (!runs || runs.length === 0) return '';
    return runs.map(r => {
      let t = escapeHtml(r.text);
      if (r.bold) t = `<strong>${t}</strong>`;
      if (r.italic) t = `<em>${t}</em>`;
      if (r.underline) t = `<u>${t}</u>`;
      if (r.strike) t = `<del>${t}</del>`;
      const inlineStyles = [];
      if (r.color) inlineStyles.push(`color: ${r.color}`);
      if (r.fontSize) inlineStyles.push(`font-size: ${r.fontSize}pt`);
      if (r.fontFamily) inlineStyles.push(`font-family: ${r.fontFamily}`);
      if (inlineStyles.length > 0) {
        t = `<span style="${inlineStyles.join('; ')}">${t}</span>`;
      }
      return t;
    }).join('');
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Open Word</title>
  <style>
    :root {
      --glass-bg: rgba(255, 255, 255, 0.08);
      --glass-panel: rgba(25, 30, 42, 0.78);
      --glass-border: rgba(255, 255, 255, 0.14);
      --glass-specular: rgba(255, 255, 255, 0.28);
      --glass-blur: blur(24px) saturate(190%);
      --glass-shadow: 0 10px 32px 0 rgba(0, 0, 0, 0.38);
      --accent: #2b7fff;
      --accent-hover: #3b82f6;
      --paper-bg: #ffffff;
      --paper-color: #1e293b;
      --paper-shadow: 0 14px 45px rgba(0, 0, 0, 0.45);
      --ruler-bg: rgba(0, 0, 0, 0.15);
      --radius-sm: 6px;
      --radius-md: 10px;
      --font-stack: "Apple SD Gothic Neo", "Malgun Gothic", "NanumGothic", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    }

    body.vscode-light {
      --glass-bg: rgba(255, 255, 255, 0.75);
      --glass-panel: rgba(248, 250, 252, 0.88);
      --glass-border: rgba(0, 0, 0, 0.1);
      --glass-specular: rgba(255, 255, 255, 0.95);
      --glass-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      --paper-bg: #ffffff;
      --paper-color: #0f172a;
      --paper-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      --ruler-bg: #f1f5f9;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-stack);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }

    /* Ambient background gradient */
    .ambient-glow {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: 
        radial-gradient(circle at 10% 10%, rgba(43, 127, 255, 0.07) 0%, transparent 40%),
        radial-gradient(circle at 90% 90%, rgba(139, 92, 246, 0.07) 0%, transparent 40%);
      pointer-events: none;
      z-index: 0;
    }

    /* Top Frosted Glass Ribbon Header */
    .word-ribbon {
      position: relative;
      z-index: 50;
      background: var(--glass-panel);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      display: flex;
      flex-direction: column;
    }

    /* Ribbon Top Row: Title, Tabs & Quick Actions */
    .ribbon-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .word-icon {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 800;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(29, 78, 216, 0.45);
    }

    .doc-name {
      font-size: 13px;
      font-weight: 600;
      max-width: 260px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .save-indicator {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .save-indicator.saved {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .save-indicator.dirty {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Tab Buttons */
    .ribbon-tabs {
      display: flex;
      gap: 2px;
      margin-left: 20px;
    }

    .ribbon-tab-btn {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.75;
      font-size: 12px;
      font-weight: 500;
      padding: 5px 14px;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .ribbon-tab-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.08);
    }

    .ribbon-tab-btn.active {
      opacity: 1;
      background: rgba(255, 255, 255, 0.16);
      font-weight: 600;
      border-bottom: 2px solid var(--accent);
    }

    .quick-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-action {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-specular);
      color: inherit;
      font-size: 12px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-action:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-1px);
    }

    .btn-save {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* Ribbon Toolbar Panels */
    .ribbon-panel {
      display: none;
      padding: 8px 14px;
      background: rgba(0, 0, 0, 0.08);
      overflow-x: auto;
      white-space: nowrap;
    }

    .ribbon-panel.active {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .toolbar-group {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding-right: 14px;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .toolbar-group:last-child {
      border-right: none;
    }

    .tool-btn {
      background: transparent;
      border: 1px solid transparent;
      color: inherit;
      padding: 5px 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .tool-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: var(--glass-border);
    }

    .tool-btn.active {
      background: rgba(43, 127, 255, 0.25);
      border-color: var(--accent);
      color: #3b82f6;
      font-weight: 700;
    }

    .tool-select {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--glass-border);
      color: inherit;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      height: 28px;
      cursor: pointer;
      font-family: inherit;
      outline: none;
    }

    .tool-select:focus {
      border-color: var(--accent);
    }

    .color-picker-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
    }

    .color-input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: pointer;
    }

    /* Horizontal Word Ruler */
    .word-ruler {
      position: relative;
      z-index: 40;
      height: 20px;
      background: var(--ruler-bg);
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: inherit;
      opacity: 0.7;
    }

    .ruler-marks {
      width: 820px;
      display: flex;
      justify-content: space-between;
      padding: 0 40px;
    }

    /* Find and Replace Bar */
    .find-replace-bar {
      display: none;
      position: absolute;
      top: 86px;
      right: 24px;
      z-index: 100;
      background: var(--glass-panel);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-specular);
      border-radius: var(--radius-md);
      box-shadow: var(--glass-shadow);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .find-input {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--glass-border);
      color: inherit;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      width: 130px;
      outline: none;
    }

    /* Main Scrollable Canvas Area */
    .canvas-scroll-container {
      position: relative;
      z-index: 10;
      flex: 1;
      overflow: auto;
      padding: 30px 20px 80px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .paper-zoom-wrapper {
      transform-origin: top center;
      transition: transform 0.15s ease-out;
    }

    /* The Authentic Word Paper Page (contenteditable) */
    .paper-page {
      width: 820px;
      min-height: 1160px;
      background: var(--paper-bg);
      color: var(--paper-color);
      box-shadow: var(--paper-shadow);
      border-radius: 2px;
      padding: 72px 84px;
      font-size: 11pt;
      line-height: 1.7;
      word-wrap: break-word;
      outline: none;
      cursor: text;
      user-select: text;
      font-family: var(--font-stack);
    }

    .paper-page:focus {
      box-shadow: 0 0 0 2px var(--accent), var(--paper-shadow);
    }

    /* Typography inside Paper */
    .paper-page h1 { font-size: 20pt; font-weight: 700; margin: 20px 0 10px 0; line-height: 1.3; }
    .paper-page h2 { font-size: 15pt; font-weight: 600; margin: 16px 0 8px 0; line-height: 1.35; }
    .paper-page h3 { font-size: 12.5pt; font-weight: 600; margin: 14px 0 6px 0; }
    .paper-page p { margin-bottom: 10px; min-height: 1.2em; }
    .paper-page ul, .paper-page ol { margin-left: 28px; margin-bottom: 10px; }
    .paper-page li { margin-bottom: 4px; }
    
    .paper-page .word-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }

    .paper-page .word-table th, .paper-page .word-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      min-width: 40px;
    }

    .paper-page .word-table th {
      background: #f1f5f9;
      font-weight: 600;
    }

    /* Bottom Frosted Glass Status Bar */
    .word-status-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 26px;
      background: var(--glass-panel);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-top: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-size: 11px;
      z-index: 50;
      opacity: 0.9;
    }

    .status-left, .status-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .zoom-slider-container {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .zoom-slider {
      width: 80px;
      accent-color: var(--accent);
      cursor: pointer;
    }

    /* Dialog Modals */
    .glass-modal {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--glass-panel);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-specular);
      border-radius: var(--radius-md);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      padding: 24px;
      z-index: 200;
      min-width: 320px;
    }

    .modal-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 14px;
    }

    .modal-body {
      font-size: 13px;
      line-height: 1.8;
      margin-bottom: 18px;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>

  <!-- Top Word Ribbon -->
  <header class="word-ribbon">
    <!-- Ribbon Row 1: Brand, Tabs, Save & Quick Actions -->
    <div class="ribbon-top-row">
      <div class="brand-group">
        <div class="word-icon">W</div>
        <div class="doc-name">${escapeHtml(title)}</div>
        <div id="save-badge" class="save-indicator saved">✓ 저장됨</div>
      </div>

      <!-- Word Ribbon Tabs -->
      <nav class="ribbon-tabs">
        <button class="ribbon-tab-btn active" onclick="switchRibbonTab('panel-home')">홈 (Home)</button>
        <button class="ribbon-tab-btn" onclick="switchRibbonTab('panel-insert')">삽입 (Insert)</button>
        <button class="ribbon-tab-btn" onclick="switchRibbonTab('panel-layout')">레이아웃 (Layout)</button>
        <button class="ribbon-tab-btn" onclick="switchRibbonTab('panel-review')">검토 (Review)</button>
        <button class="ribbon-tab-btn" onclick="switchRibbonTab('panel-view')">보기 (View)</button>
      </nav>

      <!-- Quick Action Buttons -->
      <div class="quick-actions">
        <button class="btn-action btn-save" onclick="triggerSave()" title="문서 저장 (Cmd+S / Ctrl+S)">
          <span>💾 저장 (Save)</span>
        </button>
        <button class="btn-action" onclick="exportPdf()" title="PDF 문서로 내보내기">
          <span>📄 PDF 변환</span>
        </button>
        <button class="btn-action" onclick="launchNativeApp()" title="macOS Metal / Windows DirectX 네이티브 데스크톱 앱에서 열기">
          <span>🚀 네이티브 앱</span>
        </button>
      </div>
    </div>

    <!-- Ribbon Panel 1: 홈 (Home) -->
    <div id="panel-home" class="ribbon-panel active">
      <!-- 실행 취소 / 다시 실행 -->
      <div class="toolbar-group">
        <button class="tool-btn" onclick="execCmd('undo')" title="실행 취소 (Cmd+Z)">↩</button>
        <button class="tool-btn" onclick="execCmd('redo')" title="다시 실행 (Cmd+Y)">↪</button>
      </div>

      <!-- 글꼴 선택 -->
      <div class="toolbar-group">
        <select class="tool-select" id="font-family-select" onchange="applyFontFamily(this.value)" title="글꼴 변경">
          <option value="Apple SD Gothic Neo">애플 산돌고딕 (Apple SD Gothic)</option>
          <option value="Malgun Gothic">맑은 고딕 (Malgun Gothic)</option>
          <option value="NanumGothic">나눔고딕 (NanumGothic)</option>
          <option value="Aptos">Aptos (MS 오피스 표준)</option>
          <option value="Calibri">Calibri</option>
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>

        <select class="tool-select" id="font-size-select" style="width: 54px;" onchange="applyFontSize(this.value)" title="글꼴 크기">
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11" selected>11</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
          <option value="32">32</option>
          <option value="36">36</option>
          <option value="48">48</option>
          <option value="72">72</option>
        </select>

        <button class="tool-btn" onclick="changeFontSize(1)" title="글꼴 크기 키우기">A▲</button>
        <button class="tool-btn" onclick="changeFontSize(-1)" title="글꼴 크기 줄이기">A▼</button>
      </div>

      <!-- 굵게, 기울임, 밑줄, 취소선, 색상 -->
      <div class="toolbar-group">
        <button class="tool-btn" id="btn-bold" onclick="execCmd('bold')" title="굵게 (Cmd+B)"><b>B</b></button>
        <button class="tool-btn" id="btn-italic" onclick="execCmd('italic')" title="기울임꼴 (Cmd+I)"><i>I</i></button>
        <button class="tool-btn" id="btn-underline" onclick="execCmd('underline')" title="밑줄 (Cmd+U)"><u>U</u></button>
        <button class="tool-btn" id="btn-strike" onclick="execCmd('strikeThrough')" title="취소선"><s>S</s></button>
        <button class="tool-btn" onclick="execCmd('subscript')" title="아래 첨자">x₂</button>
        <button class="tool-btn" onclick="execCmd('superscript')" title="위 첨자">x²</button>

        <!-- 텍스트 색상 -->
        <label class="tool-btn color-picker-btn" title="글자 색상">
          <span style="border-bottom: 3px solid #2b7fff; font-weight: 700;">A</span>
          <input type="color" class="color-input" value="#000000" onchange="execCmd('foreColor', this.value)" />
        </label>

        <!-- 형광펜 색상 -->
        <label class="tool-btn color-picker-btn" title="텍스트 강조 색 (형광펜)">
          <span style="background: #fef08a; color: #000; padding: 0 2px; font-weight: 700;">ab</span>
          <input type="color" class="color-input" value="#ffff00" onchange="execCmd('hiliteColor', this.value)" />
        </label>

        <button class="tool-btn" onclick="execCmd('removeFormat')" title="서식 지우기">Tx</button>
      </div>

      <!-- 단락: 목록, 들여쓰기, 정렬 -->
      <div class="toolbar-group">
        <button class="tool-btn" onclick="execCmd('insertUnorderedList')" title="글머리 기호 목록">• ☰</button>
        <button class="tool-btn" onclick="execCmd('insertOrderedList')" title="번호 매기기 목록">1. ☰</button>
        <button class="tool-btn" onclick="execCmd('outdent')" title="내어쓰기 (Shift+Tab)">⇤</button>
        <button class="tool-btn" onclick="execCmd('indent')" title="들여쓰기 (Tab)">⇥</button>
        <button class="tool-btn" id="btn-align-left" onclick="execCmd('justifyLeft')" title="왼쪽 맞춤">≡</button>
        <button class="tool-btn" id="btn-align-center" onclick="execCmd('justifyCenter')" title="가운데 맞춤">☱</button>
        <button class="tool-btn" id="btn-align-right" onclick="execCmd('justifyRight')" title="오른쪽 맞춤">☲</button>
        <button class="tool-btn" id="btn-align-justify" onclick="execCmd('justifyFull')" title="양쪽 맞춤">☰</button>
      </div>

      <!-- 스타일 선택 -->
      <div class="toolbar-group">
        <select class="tool-select" id="heading-style-select" onchange="applyStyle(this.value)" title="문단 서식 스타일">
          <option value="p">표준 (Normal)</option>
          <option value="h1">제목 1 (Heading 1)</option>
          <option value="h2">제목 2 (Heading 2)</option>
          <option value="h3">제목 3 (Heading 3)</option>
          <option value="blockquote">인용문 (Quote)</option>
          <option value="pre">코드 (Code)</option>
        </select>
      </div>

      <!-- 찾기 및 바꾸기 -->
      <div class="toolbar-group">
        <button class="tool-btn" onclick="toggleFindReplace()" title="찾기 및 바꾸기 (Ctrl+F)">🔍 찾기</button>
      </div>
    </div>

    <!-- Ribbon Panel 2: 삽입 (Insert) -->
    <div id="panel-insert" class="ribbon-panel">
      <!-- 표 삽입 및 제어 -->
      <div class="toolbar-group">
        <button class="btn-action" onclick="insertTable(3, 3)" title="3x3 표 삽입">📊 표 삽입 (3x3)</button>
        <button class="tool-btn" onclick="addTableRow()" title="선택된 표에 행 추가">+ 행 추가</button>
        <button class="tool-btn" onclick="deleteTableRow()" title="선택된 행 삭제">- 행 삭제</button>
        <button class="tool-btn" onclick="addTableColumn()" title="선택된 표에 열 추가">+ 열 추가</button>
        <button class="tool-btn" onclick="deleteTableColumn()" title="선택된 열 삭제">- 열 삭제</button>
      </div>

      <!-- 링크, 가로줄, 기호, 이미지 -->
      <div class="toolbar-group">
        <button class="btn-action" onclick="insertLinkPrompt()" title="하이퍼링크 삽입">🔗 링크</button>
        <button class="tool-btn" onclick="execCmd('insertHorizontalRule')" title="구분선 삽입">― 가로선</button>
        <button class="tool-btn" onclick="insertSymbol('•')" title="글머리 기호 삽입">•</button>
        <button class="tool-btn" onclick="insertSymbol('※')" title="참고 기호 삽입">※</button>
        <button class="tool-btn" onclick="insertSymbol('★')" title="별 기호 삽입">★</button>
        <button class="tool-btn" onclick="insertSymbol('✓')" title="체크 기호 삽입">✓</button>
        <button class="tool-btn" onclick="insertCurrentDate()" title="현재 날짜/시간 삽입">📅 날짜/시간</button>
      </div>
    </div>

    <!-- Ribbon Panel 3: 레이아웃 (Layout) -->
    <div id="panel-layout" class="ribbon-panel">
      <div class="toolbar-group">
        <span style="font-size: 12px; opacity: 0.8;">여백:</span>
        <button class="tool-btn" onclick="setMargins('72px 84px')" title="표준 여백 (25.4mm)">표준</button>
        <button class="tool-btn" onclick="setMargins('40px 48px')" title="좁은 여백 (12.7mm)">좁게</button>
        <button class="tool-btn" onclick="setMargins('100px 120px')" title="넓은 여백 (38.1mm)">넓게</button>
      </div>

      <div class="toolbar-group">
        <span style="font-size: 12px; opacity: 0.8;">방향:</span>
        <button class="tool-btn active" id="btn-orient-port" onclick="setOrientation('portrait')">세로</button>
        <button class="tool-btn" id="btn-orient-land" onclick="setOrientation('landscape')">가로</button>
      </div>
    </div>

    <!-- Ribbon Panel 4: 검토 (Review) -->
    <div id="panel-review" class="ribbon-panel">
      <div class="toolbar-group">
        <button class="btn-action" onclick="showStatsModal()">📊 단어 및 글자 수 통계</button>
        <button class="btn-action" onclick="extractMarkdown()">📝 마크다운 추출</button>
      </div>
    </div>

    <!-- Ribbon Panel 5: 보기 (View) -->
    <div id="panel-view" class="ribbon-panel">
      <div class="toolbar-group">
        <button class="tool-btn active" id="btn-view-print" onclick="setViewMode('print')">인쇄 모양 (A4)</button>
        <button class="tool-btn" id="btn-view-web" onclick="setViewMode('web')">웹 모양 (전체 화면)</button>
      </div>
      <div class="toolbar-group">
        <button class="tool-btn" onclick="toggleRuler()">눈금자 토글</button>
      </div>
      <div class="toolbar-group">
        <button class="tool-btn" onclick="setZoom(0.75)">75%</button>
        <button class="tool-btn" onclick="setZoom(1.0)">100%</button>
        <button class="tool-btn" onclick="setZoom(1.25)">125%</button>
        <button class="tool-btn" onclick="setZoom(1.5)">150%</button>
      </div>
    </div>
  </header>

  <!-- Horizontal Word Ruler -->
  <div class="word-ruler" id="word-ruler">
    <div class="ruler-marks">
      <span>| 0</span>
      <span>·</span>
      <span>| 2</span>
      <span>·</span>
      <span>| 4</span>
      <span>·</span>
      <span>| 6</span>
      <span>·</span>
      <span>| 8</span>
      <span>·</span>
      <span>| 10</span>
      <span>·</span>
      <span>| 12</span>
      <span>·</span>
      <span>| 14</span>
      <span>·</span>
      <span>| 16 cm</span>
    </div>
  </div>

  <!-- Inline Find & Replace Bar -->
  <div class="find-replace-bar" id="find-replace-bar">
    <input type="text" id="find-input" class="find-input" placeholder="찾을 단어..." onkeydown="if(event.key==='Enter')findNext()" />
    <input type="text" id="replace-input" class="find-input" placeholder="바꿀 단어..." />
    <button class="tool-btn" onclick="findNext()" title="다음 찾기">다음</button>
    <button class="tool-btn" onclick="replaceOne()" title="현재 항목 바꾸기">바꾸기</button>
    <button class="tool-btn" onclick="replaceAll()" title="모두 바꾸기">모두</button>
    <button class="tool-btn" onclick="toggleFindReplace()" title="닫기">✕</button>
  </div>

  <!-- Main Document Scroll Container -->
  <main class="canvas-scroll-container">
    <div class="paper-zoom-wrapper" id="paper-zoom-wrapper">
      <!-- Real WYSIWYG Editable Word Canvas -->
      <article
        id="editor-canvas"
        class="paper-page"
        contenteditable="true"
        spellcheck="false"
        role="textbox"
        aria-multiline="true"
      >${initialHtml}</article>
    </div>
  </main>

  <!-- Bottom Word Status Bar -->
  <footer class="word-status-bar">
    <div class="status-left">
      <div class="status-item">
        <span id="page-count">1 / 1 페이지</span>
      </div>
      <div class="status-item">
        <span id="word-count">0 단어</span>
      </div>
      <div class="status-item">
        <span id="char-count">0 자 (공백 제외 0 자)</span>
      </div>
      <div class="status-item">
        <span>한국어 (대한민국)</span>
      </div>
    </div>

    <div class="status-right">
      <div class="zoom-slider-container">
        <span id="zoom-text" style="min-width: 42px; text-align: right;">100%</span>
        <input type="range" class="zoom-slider" min="50" max="200" value="100" id="zoom-slider" oninput="setZoom(this.value / 100)" />
      </div>
      <div class="status-item">
        <span style="font-weight: 600; color: #3b82f6;">WordCraft Engine</span>
      </div>
    </div>
  </footer>

  <!-- Statistics Modal Dialog -->
  <div id="stats-modal" class="glass-modal">
    <div class="modal-title">📊 단어 및 글자 수 세기</div>
    <div class="modal-body" id="stats-modal-body">
      계산 중...
    </div>
    <div style="text-align: right;">
      <button class="btn-action" onclick="closeStatsModal()">닫기</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const canvas = document.getElementById('editor-canvas');
    let isDirty = false;
    let currentZoom = 1.0;
    let autoSaveTimer = null;

    // Switch Top Ribbon Tab
    function switchRibbonTab(panelId) {
      document.querySelectorAll('.ribbon-tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.ribbon-panel').forEach(panel => panel.classList.remove('active'));
      
      const activeBtn = Array.from(document.querySelectorAll('.ribbon-tab-btn'))
        .find(btn => btn.getAttribute('onclick').includes(panelId));
      if (activeBtn) activeBtn.classList.add('active');

      const targetPanel = document.getElementById(panelId);
      if (targetPanel) targetPanel.classList.add('active');
    }

    // Execute standard formatting commands
    function execCmd(command, value = null) {
      document.execCommand(command, false, value);
      canvas.focus();
      updateToolbarState();
      markDirty();
    }

    function applyFontFamily(font) {
      document.execCommand('fontName', false, font);
      canvas.focus();
      markDirty();
    }

    function applyFontSize(sizePt) {
      // Wrap selection in font-size span
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      document.execCommand('fontSize', false, '3');
      const fontTags = canvas.querySelectorAll('font[size="3"]');
      fontTags.forEach(el => {
        el.removeAttribute('size');
        el.style.fontSize = sizePt + 'pt';
      });
      canvas.focus();
      markDirty();
    }

    function changeFontSize(delta) {
      const select = document.getElementById('font-size-select');
      let curr = parseInt(select.value, 10) || 11;
      let next = Math.max(8, Math.min(72, curr + delta));
      select.value = next;
      applyFontSize(next);
    }

    function applyStyle(tag) {
      if (tag === 'p') {
        document.execCommand('formatBlock', false, '<p>');
      } else {
        document.execCommand('formatBlock', false, '<' + tag + '>');
      }
      canvas.focus();
      markDirty();
    }

    function insertTable(rows, cols) {
      let tableHtml = '<table class="word-table"><tbody>';
      for (let r = 0; r < rows; r++) {
        tableHtml += '<tr>';
        for (let c = 0; c < cols; c++) {
          const tag = r === 0 ? 'th' : 'td';
          tableHtml += \`<\${tag}>셀 \${r + 1}-\${c + 1}</\${tag}>\`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table><p><br/></p>';
      document.execCommand('insertHTML', false, tableHtml);
      markDirty();
    }

    function addTableRow() {
      const sel = window.getSelection();
      let node = sel.anchorNode;
      while (node && node !== canvas && node.nodeName !== 'TR') {
        node = node.parentNode;
      }
      if (node && node.nodeName === 'TR') {
        const table = node.closest('table');
        const colCount = node.children.length;
        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
          const td = document.createElement('td');
          td.innerHTML = '&nbsp;';
          newRow.appendChild(td);
        }
        node.parentNode.insertBefore(newRow, node.nextSibling);
        markDirty();
      } else {
        alert('추가할 표의 행을 먼저 클릭하세요.');
      }
    }

    function deleteTableRow() {
      const sel = window.getSelection();
      let node = sel.anchorNode;
      while (node && node !== canvas && node.nodeName !== 'TR') {
        node = node.parentNode;
      }
      if (node && node.nodeName === 'TR') {
        node.remove();
        markDirty();
      }
    }

    function addTableColumn() {
      const sel = window.getSelection();
      let node = sel.anchorNode;
      while (node && node !== canvas && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
        node = node.parentNode;
      }
      if (node) {
        const table = node.closest('table');
        const cellIndex = node.cellIndex;
        Array.from(table.rows).forEach((row, idx) => {
          const tag = idx === 0 ? 'th' : 'td';
          const newCell = document.createElement(tag);
          newCell.innerHTML = '&nbsp;';
          if (node.nextSibling) {
            row.insertBefore(newCell, row.children[cellIndex + 1]);
          } else {
            row.appendChild(newCell);
          }
        });
        markDirty();
      } else {
        alert('추가할 표의 열을 먼저 클릭하세요.');
      }
    }

    function deleteTableColumn() {
      const sel = window.getSelection();
      let node = sel.anchorNode;
      while (node && node !== canvas && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
        node = node.parentNode;
      }
      if (node) {
        const table = node.closest('table');
        const cellIndex = node.cellIndex;
        Array.from(table.rows).forEach(row => {
          if (row.children[cellIndex]) {
            row.children[cellIndex].remove();
          }
        });
        markDirty();
      }
    }

    function insertLinkPrompt() {
      const url = prompt('삽입할 웹 주소(URL)를 입력하세요:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
        markDirty();
      }
    }

    function insertSymbol(sym) {
      document.execCommand('insertText', false, sym);
      markDirty();
    }

    function insertCurrentDate() {
      const now = new Date();
      const str = now.getFullYear() + '년 ' + (now.getMonth() + 1) + '월 ' + now.getDate() + '일';
      document.execCommand('insertText', false, str);
      markDirty();
    }

    function setMargins(m) {
      canvas.style.padding = m;
      markDirty();
    }

    function setOrientation(orient) {
      if (orient === 'landscape') {
        canvas.style.width = '1160px';
        canvas.style.minHeight = '820px';
        document.getElementById('btn-orient-land').classList.add('active');
        document.getElementById('btn-orient-port').classList.remove('active');
      } else {
        canvas.style.width = '820px';
        canvas.style.minHeight = '1160px';
        document.getElementById('btn-orient-port').classList.add('active');
        document.getElementById('btn-orient-land').classList.remove('active');
      }
    }

    function setViewMode(mode) {
      if (mode === 'web') {
        canvas.style.width = '100%';
        canvas.style.boxShadow = 'none';
        canvas.style.borderRadius = '0';
        document.getElementById('btn-view-web').classList.add('active');
        document.getElementById('btn-view-print').classList.remove('active');
      } else {
        canvas.style.width = '820px';
        canvas.style.boxShadow = 'var(--paper-shadow)';
        canvas.style.borderRadius = '2px';
        document.getElementById('btn-view-print').classList.add('active');
        document.getElementById('btn-view-web').classList.remove('active');
      }
    }

    function toggleRuler() {
      const ruler = document.getElementById('word-ruler');
      ruler.style.display = ruler.style.display === 'none' ? 'flex' : 'none';
    }

    function setZoom(val) {
      currentZoom = Math.min(2.0, Math.max(0.5, parseFloat(val)));
      document.getElementById('paper-zoom-wrapper').style.transform = 'scale(' + currentZoom + ')';
      document.getElementById('zoom-text').innerText = Math.round(currentZoom * 100) + '%';
      document.getElementById('zoom-slider').value = Math.round(currentZoom * 100);
    }

    // Find and Replace
    function toggleFindReplace() {
      const bar = document.getElementById('find-replace-bar');
      const isVisible = bar.style.display === 'flex';
      bar.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) document.getElementById('find-input').focus();
    }

    function findNext() {
      const text = document.getElementById('find-input').value;
      if (text && window.find) {
        window.find(text, false, false, true);
      }
    }

    function replaceOne() {
      const findText = document.getElementById('find-input').value;
      const replaceText = document.getElementById('replace-input').value;
      const sel = window.getSelection();
      if (sel && sel.toString() === findText) {
        document.execCommand('insertText', false, replaceText);
        markDirty();
      }
      findNext();
    }

    function replaceAll() {
      const findText = document.getElementById('find-input').value;
      const replaceText = document.getElementById('replace-input').value;
      if (!findText) return;
      let count = 0;
      canvas.focus();
      while (window.find(findText, false, false, true)) {
        document.execCommand('insertText', false, replaceText);
        count++;
        if (count > 500) break;
      }
      markDirty();
      alert(count + '개의 항목을 바꾸었습니다.');
    }

    // Live Toolbar State Syncing
    function updateToolbarState() {
      document.getElementById('btn-bold').classList.toggle('active', document.queryCommandState('bold'));
      document.getElementById('btn-italic').classList.toggle('active', document.queryCommandState('italic'));
      document.getElementById('btn-underline').classList.toggle('active', document.queryCommandState('underline'));
      document.getElementById('btn-strike').classList.toggle('active', document.queryCommandState('strikeThrough'));
      document.getElementById('btn-align-left').classList.toggle('active', document.queryCommandState('justifyLeft'));
      document.getElementById('btn-align-center').classList.toggle('active', document.queryCommandState('justifyCenter'));
      document.getElementById('btn-align-right').classList.toggle('active', document.queryCommandState('justifyRight'));
      document.getElementById('btn-align-justify').classList.toggle('active', document.queryCommandState('justifyFull'));

      updateWordStats();
    }

    // Live Word & Char Counting
    function updateWordStats() {
      const text = canvas.innerText || '';
      const words = (text.trim().match(/[\\S]+/g) || []).length;
      const chars = text.length;
      const charsNoSpace = text.replace(/\\s+/g, '').length;

      document.getElementById('word-count').innerText = words.toLocaleString() + ' 단어';
      document.getElementById('char-count').innerText = chars.toLocaleString() + ' 자 (공백 제외 ' + charsNoSpace.toLocaleString() + ' 자)';
    }

    function showStatsModal() {
      const text = canvas.innerText || '';
      const words = (text.trim().match(/[\\S]+/g) || []).length;
      const chars = text.length;
      const charsNoSpace = text.replace(/\\s+/g, '').length;
      const paragraphs = canvas.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, tr').length || 1;

      document.getElementById('stats-modal-body').innerHTML = \`
        <div>• 페이지 수: 1</div>
        <div>• 단어 수: <b>\${words.toLocaleString()}</b> 개</div>
        <div>• 글자 수 (공백 포함): <b>\${chars.toLocaleString()}</b> 자</div>
        <div>• 글자 수 (공백 제외): <b>\${charsNoSpace.toLocaleString()}</b> 자</div>
        <div>• 단락(문단) 수: <b>\${paragraphs}</b> 개</div>
      \`;
      document.getElementById('stats-modal').style.display = 'block';
    }

    function closeStatsModal() {
      document.getElementById('stats-modal').style.display = 'none';
    }

    // Document Dirty & Save State Management
    function markDirty() {
      isDirty = true;
      const badge = document.getElementById('save-badge');
      badge.className = 'save-indicator dirty';
      badge.innerText = '● 변경됨 (저장 필요)';

      // Inform VS Code extension host of content change
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        vscode.postMessage({
          type: 'contentChange',
          html: canvas.innerHTML
        });
      }, 300);
    }

    function markSaved() {
      isDirty = false;
      const badge = document.getElementById('save-badge');
      badge.className = 'save-indicator saved';
      badge.innerText = '✓ 저장됨';
    }

    function triggerSave() {
      vscode.postMessage({
        type: 'save',
        html: canvas.innerHTML
      });
    }

    function exportPdf() {
      vscode.postMessage({ type: 'exportPdf' });
    }

    function extractMarkdown() {
      vscode.postMessage({
        type: 'extractMarkdown',
        html: canvas.innerHTML
      });
    }

    function launchNativeApp() {
      vscode.postMessage({ type: 'openNative' });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFindReplace();
      }
    });

    // Content Editable Input Listener (with Korean IME composition handling)
    canvas.addEventListener('input', () => {
      markDirty();
      updateWordStats();
    });

    canvas.addEventListener('keyup', () => {
      updateToolbarState();
    });

    canvas.addEventListener('mouseup', () => {
      updateToolbarState();
    });

    // Listen to messages from VS Code Extension Host
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'saved') {
        markSaved();
      } else if (msg.type === 'requestSaveContent') {
        vscode.postMessage({
          type: 'saveContentResponse',
          html: canvas.innerHTML
        });
      }
    });

    // Initial update
    updateWordStats();
  </script>
</body>
</html>`;
}

module.exports = {
  renderWebviewHtml
};
