# Change Log

All notable changes to the "open-word" extension will be documented in this file.

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
