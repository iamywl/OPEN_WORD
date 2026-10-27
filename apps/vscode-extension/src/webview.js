// HTML/CSS/JS generator for the Open Word Glass-themed Custom Editor Webview
const { escapeHtml } = require('./docx-parser');

function renderWebviewHtml(docData, fileName, filePath) {
  const { metadata, blocks, stats, markdown, rawXml } = docData;

  const title = metadata.title || fileName || 'Document';

  // Render blocks to HTML
  let contentHtml = '';
  for (const block of blocks) {
    if (block.type === 'heading') {
      const tag = `h${block.level}`;
      const text = renderRuns(block.runs);
      contentHtml += `<${tag} class="doc-heading doc-h${block.level}">${text}</${tag}>`;
    } else if (block.type === 'paragraph') {
      const text = renderRuns(block.runs);
      if (block.isList) {
        const indent = (block.listLevel || 0) * 24;
        contentHtml += `<div class="doc-list-item" style="margin-left: ${indent}px;"><span class="bullet">•</span><span>${text}</span></div>`;
      } else {
        contentHtml += `<p class="doc-paragraph" style="text-align: ${block.align};">${text}</p>`;
      }
    } else if (block.type === 'table') {
      contentHtml += '<div class="table-container"><table class="doc-table">';
      block.rows.forEach((row, rIdx) => {
        contentHtml += '<tr>';
        row.forEach((cell) => {
          const cellTag = rIdx === 0 ? 'th' : 'td';
          const cellContent = cell.paragraphs && cell.paragraphs.length > 0
            ? cell.paragraphs.map(p => renderRuns(p.runs)).join('<br/>')
            : escapeHtml(cell.text);
          contentHtml += `<${cellTag}>${cellContent || '&nbsp;'}</${cellTag}>`;
        });
        contentHtml += '</tr>';
      });
      contentHtml += '</table></div>';
    }
  }

  function renderRuns(runs) {
    if (!runs || runs.length === 0) return '';
    return runs.map(r => {
      let t = escapeHtml(r.text);
      if (r.bold) t = `<strong>${t}</strong>`;
      if (r.italic) t = `<em>${t}</em>`;
      if (r.underline) t = `<u>${t}</u>`;
      if (r.strike) t = `<del>${t}</del>`;
      const styles = [];
      if (r.color) styles.push(`color: ${r.color}`);
      if (r.fontSize) styles.push(`font-size: ${r.fontSize}pt`);
      if (styles.length > 0) {
        t = `<span style="${styles.join('; ')}">${t}</span>`;
      }
      return t;
    }).join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Open Word</title>
  <style>
    :root {
      --glass-bg: rgba(255, 255, 255, 0.08);
      --glass-border: rgba(255, 255, 255, 0.16);
      --glass-specular: rgba(255, 255, 255, 0.28);
      --glass-blur: blur(24px) saturate(190%);
      --glass-shadow: 0 12px 36px 0 rgba(0, 0, 0, 0.35);
      --accent-color: #2b7fff;
      --accent-gradient: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      --paper-bg: #ffffff;
      --paper-text: #1a1a1a;
      --paper-shadow: 0 12px 48px rgba(0, 0, 0, 0.45);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --app-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", Roboto, Helvetica, Arial, sans-serif;
    }

    body.vscode-light {
      --glass-bg: rgba(255, 255, 255, 0.72);
      --glass-border: rgba(0, 0, 0, 0.08);
      --glass-specular: rgba(255, 255, 255, 0.85);
      --glass-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      --paper-bg: #ffffff;
      --paper-text: #1e1e1e;
      --paper-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--app-font);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      user-select: text;
    }

    /* Ambient background gradient to accentuate frosted glass blur */
    .ambient-bg {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      pointer-events: none;
      background: 
        radial-gradient(circle at 15% 15%, rgba(43, 127, 255, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.08) 0%, transparent 45%);
    }

    /* Top Frosted Glass Ribbon */
    .glass-ribbon {
      position: sticky;
      top: 12px;
      margin: 0 16px 16px 16px;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-specular);
      border-radius: var(--radius-lg);
      box-shadow: var(--glass-shadow);
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      z-index: 100;
      flex-wrap: wrap;
    }

    .ribbon-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-badge {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #2563eb, #1e40af);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 800;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
    }

    .doc-meta-title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doc-badge-format {
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 6px;
      background: rgba(43, 127, 255, 0.2);
      color: #3b82f6;
      border: 1px solid rgba(43, 127, 255, 0.35);
      border-radius: 4px;
      font-weight: 700;
    }

    .ribbon-tabs {
      display: flex;
      background: rgba(0, 0, 0, 0.15);
      padding: 3px;
      border-radius: var(--radius-md);
      gap: 4px;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.75;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.18s ease;
      font-family: inherit;
    }

    .tab-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.08);
    }

    .tab-btn.active {
      opacity: 1;
      background: rgba(255, 255, 255, 0.18);
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .ribbon-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .glass-btn {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-specular);
      color: inherit;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.18s ease;
      font-family: inherit;
    }

    .glass-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .glass-btn-primary {
      background: var(--accent-gradient);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }

    .glass-btn-primary:hover {
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.6);
      transform: translateY(-1px);
    }

    .zoom-control {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.15);
      border-radius: var(--radius-sm);
      padding: 2px;
    }

    .zoom-btn {
      background: transparent;
      border: none;
      color: inherit;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 11px;
      opacity: 0.8;
      border-radius: 4px;
    }

    .zoom-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }

    .zoom-label {
      font-size: 11px;
      font-weight: 600;
      padding: 0 6px;
      min-width: 44px;
      text-align: center;
    }

    /* Main View Container */
    .view-container {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 24px 60px 24px;
    }

    .tab-content {
      width: 100%;
      display: none;
    }

    .tab-content.active {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Paper Canvas */
    .paper-wrapper {
      transform-origin: top center;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .paper-canvas {
      width: 820px;
      min-height: 1160px;
      background: var(--paper-bg);
      color: var(--paper-text);
      box-shadow: var(--paper-shadow);
      border-radius: 4px;
      padding: 72px 84px;
      font-size: 11pt;
      line-height: 1.65;
      position: relative;
      word-wrap: break-word;
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", "NanumGothic", "Segoe UI", Roboto, sans-serif;
    }

    .paper-canvas h1.doc-heading {
      font-size: 20pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 24px;
      margin-bottom: 14px;
      line-height: 1.3;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .paper-canvas h2.doc-heading {
      font-size: 15pt;
      font-weight: 600;
      color: #1e293b;
      margin-top: 20px;
      margin-bottom: 10px;
      line-height: 1.35;
    }

    .paper-canvas h3.doc-heading {
      font-size: 12.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .paper-canvas p.doc-paragraph {
      margin-bottom: 12px;
      color: #1e293b;
    }

    .doc-list-item {
      display: flex;
      gap: 10px;
      margin-bottom: 6px;
      color: #1e293b;
    }

    .doc-list-item .bullet {
      color: #2563eb;
      font-weight: 700;
    }

    /* Table styling */
    .table-container {
      margin: 18px 0;
      overflow-x: auto;
    }

    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      border: 1px solid #cbd5e1;
    }

    .doc-table th {
      background: #f1f5f9;
      font-weight: 600;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }

    .doc-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      color: #334155;
    }

    .doc-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Metadata Tab Card */
    .card-glass {
      width: 100%;
      max-width: 820px;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-specular);
      border-radius: var(--radius-lg);
      box-shadow: var(--glass-shadow);
      padding: 28px 32px;
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .grid-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-box {
      background: rgba(0, 0, 0, 0.12);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.75;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .meta-table td {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .meta-table td:first-child {
      font-weight: 600;
      width: 160px;
      opacity: 0.8;
    }

    /* XML / Markdown Viewer */
    .code-viewer {
      width: 100%;
      max-width: 820px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 18px;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow: auto;
      max-height: 650px;
      white-space: pre-wrap;
    }

    /* Floating Status Bar */
    .glass-footer {
      position: fixed;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-specular);
      border-radius: 30px;
      box-shadow: var(--glass-shadow);
      padding: 6px 20px;
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 12px;
      z-index: 100;
      white-space: nowrap;
    }

    .footer-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
  </style>
</head>
<body>
  <div class="ambient-bg"></div>

  <!-- Top Glass Ribbon -->
  <header class="glass-ribbon">
    <div class="ribbon-brand">
      <div class="brand-badge">W</div>
      <div>
        <div class="doc-meta-title">${escapeHtml(title)}</div>
        <span class="doc-badge-format">Open Word .docx</span>
      </div>
    </div>

    <!-- View Mode Tabs -->
    <div class="ribbon-tabs">
      <button class="tab-btn active" onclick="switchTab('tab-preview')">📄 Document Preview</button>
      <button class="tab-btn" onclick="switchTab('tab-meta')">📊 Stats & Meta</button>
      <button class="tab-btn" onclick="switchTab('tab-markdown')">📝 Markdown</button>
      <button class="tab-btn" onclick="switchTab('tab-xml')">🧩 OOXML</button>
    </div>

    <!-- Quick Action Glass Buttons -->
    <div class="ribbon-actions">
      <div class="zoom-control">
        <button class="zoom-btn" onclick="changeZoom(-0.1)">−</button>
        <span class="zoom-label" id="zoom-label">100%</span>
        <button class="zoom-btn" onclick="changeZoom(0.1)">+</button>
      </div>

      <button class="glass-btn glass-btn-primary" onclick="action('openNative')" title="Launch Native WordCraft desktop app with macOS Metal / Windows DirectX GPU acceleration">
        <span>🚀 Open Native Desktop</span>
      </button>

      <button class="glass-btn" onclick="action('convertToPdf')" title="Export document to high-quality PDF">
        <span>📄 Export PDF</span>
      </button>

      <button class="glass-btn" onclick="action('extractText')" title="Extract text into new editor">
        <span>📝 Extract</span>
      </button>
    </div>
  </header>

  <!-- Main View Container -->
  <main class="view-container">
    <!-- Tab 1: Preview Canvas -->
    <div id="tab-preview" class="tab-content active">
      <div class="paper-wrapper" id="paper-wrapper">
        <article class="paper-canvas">
          ${contentHtml || '<p style="color: #64748b; font-style: italic;">Document is empty.</p>'}
        </article>
      </div>
    </div>

    <!-- Tab 2: Metadata & Stats -->
    <div id="tab-meta" class="tab-content">
      <div class="card-glass">
        <div class="card-title">📊 Document Statistics</div>
        <div class="grid-stats">
          <div class="stat-box">
            <div class="stat-number">${stats.wordCount.toLocaleString()}</div>
            <div class="stat-label">Words</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${stats.charCount.toLocaleString()}</div>
            <div class="stat-label">Characters</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${stats.paragraphCount.toLocaleString()}</div>
            <div class="stat-label">Paragraphs</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${(stats.fileSize / 1024).toFixed(1)} KB</div>
            <div class="stat-label">File Size</div>
          </div>
        </div>

        <div class="card-title" style="margin-top: 16px;">📋 OOXML Metadata</div>
        <table class="meta-table">
          <tr><td>Title</td><td>${escapeHtml(metadata.title || '(None)')}</td></tr>
          <tr><td>Creator</td><td>${escapeHtml(metadata.creator || '(None)')}</td></tr>
          <tr><td>Last Modified By</td><td>${escapeHtml(metadata.lastModifiedBy || '(None)')}</td></tr>
          <tr><td>Created</td><td>${escapeHtml(metadata.created || '(Unknown)')}</td></tr>
          <tr><td>Modified</td><td>${escapeHtml(metadata.modified || '(Unknown)')}</td></tr>
          <tr><td>File Path</td><td><code>${escapeHtml(filePath)}</code></td></tr>
        </table>
      </div>
    </div>

    <!-- Tab 3: Markdown -->
    <div id="tab-markdown" class="tab-content">
      <div class="card-glass">
        <div class="card-title">📝 Extracted Markdown Representation</div>
        <pre class="code-viewer">${escapeHtml(markdown)}</pre>
      </div>
    </div>

    <!-- Tab 4: Raw XML -->
    <div id="tab-xml" class="tab-content">
      <div class="card-glass">
        <div class="card-title">🧩 OOXML word/document.xml</div>
        <pre class="code-viewer">${escapeHtml(rawXml.slice(0, 50000))}${rawXml.length > 50000 ? '\n\n... (truncated)' : ''}</pre>
      </div>
    </div>
  </main>

  <!-- Bottom Frosted Glass Status Bar -->
  <footer class="glass-footer">
    <div class="footer-dot" title="Document Engine Ready"></div>
    <span>Open Word Glass Preview</span>
    <span>•</span>
    <span>${stats.wordCount.toLocaleString()} words</span>
    <span>•</span>
    <span>${(stats.fileSize / 1024).toFixed(1)} KB</span>
    <span>•</span>
    <span>100% Rust-Native WordCraft Engine</span>
  </footer>

  <script>
    const vscode = acquireVsCodeApi();
    let currentZoom = 1.0;

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
    }

    function changeZoom(delta) {
      currentZoom = Math.min(Math.max(currentZoom + delta, 0.5), 2.0);
      document.getElementById('zoom-label').innerText = Math.round(currentZoom * 100) + '%';
      const wrapper = document.getElementById('paper-wrapper');
      if (wrapper) {
        wrapper.style.transform = 'scale(' + currentZoom + ')';
      }
    }

    function action(commandName) {
      vscode.postMessage({
        command: commandName,
        path: ${JSON.stringify(filePath)}
      });
    }
  </script>
</body>
</html>`;
}

module.exports = {
  renderWebviewHtml
};
