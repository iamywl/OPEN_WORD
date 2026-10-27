# Open Word / WordCraft for Visual Studio Code

<p align="center">
  <img src="icon.png" width="128" height="128" alt="Open Word Logo" />
</p>

<p align="center">
  <strong>Clean-Room, High-Performance Native & Web Word Processor for Visual Studio Code</strong><br>
  Instant <code>.docx</code>, <code>.doc</code>, <code>.rtf</code> preview with frosted glass UI, PDF export, Markdown extraction, and one-click launch into native macOS Metal & Windows DirectX desktop app.
</p>

---

## ✨ Features

- 📑 **Instant `.docx` Preview in VS Code**: Click any `.docx`, `.doc`, `.rtf`, or `.odt` file in the Explorer to preview it directly inside VS Code without needing Microsoft Word installed.
- 🪟 **Glass Design System (Frosted Glass / Glassmorphism)**: Elegant translucent ribbon, specular highlight borders, ambient drop shadows, and high-contrast typography adhering to WCAG 4.5:1 standards.
- 🇰🇷 **100% Hangul & Unicode Typography**: Perfect glyph shaping and rendering for Korean (Malgun Gothic, Apple SD Gothic Neo, NanumGothic) and East Asian CJK typography.
- 🚀 **1-Click Native Desktop App Bridge**: Seamlessly launch the 100% Rust-native desktop app powered by macOS Metal / Windows DirectX hardware acceleration with 120fps smooth scrolling.
- 📄 **Export to PDF**: Convert documents to clean vector PDFs with embedded font subsets.
- 📝 **Markdown & Text Extraction**: Extract document text into clean Markdown files with headings, tables, and bullet points preserved.
- 🧩 **OOXML Structure Inspection**: Inspect raw `word/document.xml` structure directly inside VS Code with syntax highlighting.

---

## 🚀 Getting Started

### 1. View Documents
Simply click on any `.docx` file in your VS Code Explorer. Open Word will open as the default custom editor with a clean, frosted glass document canvas.

### 2. Launch Native Hardware-Accelerated App
Click the **"🚀 Open Native Desktop"** button on the glass ribbon or right-click any `.docx` file and choose **"Open Word: Open in Native Desktop App"**.
If the native binary is built in your workspace (`target/release/wordcraft`), it launches instantly with native GPU acceleration.

To build the native desktop app locally:
```bash
cargo build --release -p wordcraft
```

### 3. Export to PDF
Click **"📄 Export PDF"** on the ribbon or run the command:
`Open Word: Convert to PDF`

---

## ⌨️ Commands

| Command | Title | Description |
|---|---|---|
| `open-word.openNative` | `Open Word: Open in Native Desktop App` | Launches macOS Metal / Windows DirectX app |
| `open-word.convertToPdf` | `Open Word: Convert to PDF` | Exports current document as PDF |
| `open-word.extractText` | `Open Word: Extract Document Text / Markdown` | Extracts Markdown into a new editor tab |
| `open-word.inspectDocx` | `Open Word: Inspect OOXML Structure` | Opens raw `word/document.xml` |
| `open-word.openSample` | `Open Word: Launch Desktop App with Sample Document` | Opens native app with demo template |

---

## ⚙️ Configuration Settings

- `open-word.nativeBinaryPath`: Custom path to `wordcraft` or `wordcraft.exe` executable.
- `open-word.cliBinaryPath`: Custom path to `wordcraft-cli` or `wordcraft-cli.exe` executable.

---

## 🔒 Privacy & Open Source Clean-Room

- **100% Offline & Private**: Your documents are processed entirely locally on your machine. No telemetry, no external cloud API calls.
- **Pure Clean-Room**: Open Word contains no proprietary Microsoft assets or code. All format parsers and renderers are clean-room open-source implementations.

---

## 📄 License

MIT OR Apache-2.0
