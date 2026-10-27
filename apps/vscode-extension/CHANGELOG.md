# Change Log

All notable changes to the "open-word" extension will be documented in this file.

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
