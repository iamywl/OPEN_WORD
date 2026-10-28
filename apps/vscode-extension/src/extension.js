const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { parseDocx, readZip } = require('./docx-parser');
const { htmlToDocxBuffer } = require('./docx-packer');
const { renderWebviewHtml } = require('./webview');

/**
 * Custom Document class for .docx files.
 */
class DocxCustomDocument extends vscode.Disposable {
  constructor(uri, buffer, originalZipFiles, docData) {
    super(() => this.dispose());
    this.uri = uri;
    this.originalBuffer = buffer;
    this.originalZipFiles = originalZipFiles;
    this.docData = docData;
    this.currentHtml = null;
    this._isDirty = false;

    this._onDidDispose = new vscode.EventEmitter();
    this.onDidDispose = this._onDidDispose.event;
  }

  dispose() {
    this._onDidDispose.fire();
    super.dispose();
  }
}

/**
 * Locate the compiled WebAssembly distribution if available.
 */
function getWasmConfig(context, webviewPanel) {
  const wasmDir = path.join(context.extensionPath, 'wasm');
  if (!fs.existsSync(wasmDir)) return { available: false };
  const files = fs.readdirSync(wasmDir);
  const wasmFile = files.find(f => f.endsWith('.wasm'));
  const jsFile = files.find(f => f.endsWith('.js') && f.startsWith('wordcraft-web-'));
  if (!wasmFile || !jsFile) return { available: false };

  const config = vscode.workspace.getConfiguration('open-word');
  const defaultEngine = config.get('defaultEngine', 'wasm');

  return {
    available: true,
    defaultEngine,
    wasmBinaryUri: webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(wasmDir, wasmFile))).toString(),
    wasmJsUri: webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(wasmDir, jsFile))).toString(),
  };
}

/**
 * Locate the native WordCraft desktop executable if available.
 */
function findNativeBinary() {
  const config = vscode.workspace.getConfiguration('open-word');
  const customPath = config.get('nativeBinaryPath');
  if (customPath && fs.existsSync(customPath)) return customPath;

  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    for (const folder of folders) {
      const candidates = [
        path.join(folder.uri.fsPath, 'target', 'release', 'wordcraft'),
        path.join(folder.uri.fsPath, 'target', 'release', 'wordcraft.exe'),
        path.join(folder.uri.fsPath, 'target', 'debug', 'wordcraft'),
        path.join(folder.uri.fsPath, 'target', 'debug', 'wordcraft.exe')
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) return cand;
      }
    }
  }

  const macApp = '/Applications/WordCraft.app/Contents/MacOS/wordcraft';
  if (fs.existsSync(macApp)) return macApp;

  return null;
}

/**
 * Locate the WordCraft CLI executable.
 */
function findCliBinary() {
  const config = vscode.workspace.getConfiguration('open-word');
  const customPath = config.get('cliBinaryPath');
  if (customPath && fs.existsSync(customPath)) return customPath;

  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    for (const folder of folders) {
      const candidates = [
        path.join(folder.uri.fsPath, 'target', 'release', 'wordcraft-cli'),
        path.join(folder.uri.fsPath, 'target', 'release', 'wordcraft-cli.exe'),
        path.join(folder.uri.fsPath, 'target', 'debug', 'wordcraft-cli')
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) return cand;
      }
    }
  }
  return null;
}

/**
 * Full Word Custom Editor Provider with interactive editing & saving.
 */
class DocxCustomEditorProvider {
  static register(context) {
    const provider = new DocxCustomEditorProvider(context);
    return vscode.window.registerCustomEditorProvider('open-word.docxEditor', provider, {
      webviewOptions: {
        retainContextWhenHidden: true,
        enableFindWidget: false
      },
      supportsMultipleEditorsPerDocument: false
    });
  }

  constructor(context) {
    this.context = context;
    this._onDidChangeCustomDocument = new vscode.EventEmitter();
    this.onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    this.panels = new Map(); // uri string -> WebviewPanel
  }

  async openCustomDocument(uri, _openContext, _token) {
    try {
      const buffer = fs.readFileSync(uri.fsPath);
      const originalZipFiles = readZip(buffer);
      const docData = parseDocx(buffer);
      return new DocxCustomDocument(uri, buffer, originalZipFiles, docData);
    } catch (err) {
      // In case of error (e.g. empty or newly created file)
      return new DocxCustomDocument(uri, Buffer.alloc(0), {}, { metadata: {}, blocks: [], stats: {} });
    }
  }

  async resolveCustomEditor(document, webviewPanel, _token) {
    const filePath = document.uri.fsPath;
    const fileName = path.basename(filePath);
    this.panels.set(document.uri.toString(), webviewPanel);

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(this.context.extensionPath)
      ]
    };

    const wasmConfig = getWasmConfig(this.context, webviewPanel);

    // Render Full Word Processor Webview (Dual Engine: Rust WASM + Lightweight Fast Mode)
    webviewPanel.webview.html = renderWebviewHtml(document.docData, fileName, filePath, wasmConfig);

    // Handle messages from the Webview
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'wordcraft:ready':
          // The pure Rust WASM engine is initialized and listening! Feed the document bytes.
          webviewPanel.webview.postMessage({
            type: 'wordcraft:open',
            name: fileName,
            bytes: Array.from(document.originalBuffer)
          });
          break;

        case 'wordcraft:save':
          // The pure Rust engine saved the document in full ECMA-376 OOXML fidelity!
          try {
            const buf = Buffer.from(message.bytes);
            fs.writeFileSync(filePath, buf);
            document.originalBuffer = buf;
            document._isDirty = false;
            vscode.window.setStatusBarMessage(`Open Word: ${fileName} 저장 완료 (Rust Native Engine)`, 3000);
          } catch (err) {
            vscode.window.showErrorMessage(`문서 저장 실패: ${err.message}`);
          }
          break;

        case 'wordcraft:dirty':
          document._isDirty = !!message.dirty;
          this._onDidChangeCustomDocument.fire({
            document,
            undo: () => {},
            redo: () => {}
          });
          break;

        case 'wordcraft:failed':
          vscode.window.showWarningMessage(`WordCraft WASM 가속 실행 불가 (${message.error}). 경량 모드로 자동 전환합니다.`);
          break;

        case 'contentChange':
          document.currentHtml = message.html;
          this._onDidChangeCustomDocument.fire({
            document,
            undo: () => {},
            redo: () => {}
          });
          break;

        case 'save':
          if (message.html) {
            document.currentHtml = message.html;
          }
          await this.saveDocumentToDisk(document);
          webviewPanel.webview.postMessage({ type: 'saved' });
          break;

        case 'exportPdf':
          this.convertDocxToPdf(filePath);
          break;

        case 'extractMarkdown':
          this.extractTextToNewDocument(document);
          break;

        case 'openNative':
          this.openInNativeApp(filePath);
          break;
      }
    });

    webviewPanel.onDidDispose(() => {
      this.panels.delete(document.uri.toString());
    });
  }

  /**
   * Save changes back to .docx on disk.
   */
  async saveDocumentToDisk(document) {
    try {
      if (!document.currentHtml) return;
      const newBuffer = htmlToDocxBuffer(document.originalZipFiles, document.currentHtml);
      fs.writeFileSync(document.uri.fsPath, newBuffer);
      document.originalBuffer = newBuffer;
      vscode.window.setStatusBarMessage(`Open Word: ${path.basename(document.uri.fsPath)} 저장 완료`, 3000);
    } catch (err) {
      vscode.window.showErrorMessage(`문서 저장 실패: ${err.message}`);
    }
  }

  async saveCustomDocument(document, _cancellation) {
    await this.saveDocumentToDisk(document);
    const panel = this.panels.get(document.uri.toString());
    if (panel) {
      panel.webview.postMessage({ type: 'saved' });
    }
  }

  async saveCustomDocumentAs(document, targetResource, _cancellation) {
    try {
      if (!document.currentHtml) return;
      const newBuffer = htmlToDocxBuffer(document.originalZipFiles, document.currentHtml);
      fs.writeFileSync(targetResource.fsPath, newBuffer);
      vscode.window.showInformationMessage(`다른 이름으로 저장 완료: ${path.basename(targetResource.fsPath)}`);
    } catch (err) {
      vscode.window.showErrorMessage(`다른 이름으로 저장 실패: ${err.message}`);
    }
  }

  async revertCustomDocument(document, _cancellation) {
    const buffer = fs.readFileSync(document.uri.fsPath);
    document.originalZipFiles = readZip(buffer);
    document.docData = parseDocx(buffer);
    const panel = this.panels.get(document.uri.toString());
    if (panel) {
      panel.webview.html = renderWebviewHtml(document.docData, path.basename(document.uri.fsPath), document.uri.fsPath);
    }
  }

  async backupCustomDocument(document, context, _cancellation) {
    if (document.currentHtml) {
      const newBuffer = htmlToDocxBuffer(document.originalZipFiles, document.currentHtml);
      fs.writeFileSync(context.destination.fsPath, newBuffer);
    } else {
      fs.copyFileSync(document.uri.fsPath, context.destination.fsPath);
    }
    return {
      id: context.destination.fsPath,
      delete: () => {
        try { fs.unlinkSync(context.destination.fsPath); } catch (_) {}
      }
    };
  }

  /**
   * PDF conversion
   */
  convertDocxToPdf(filePath) {
    const cli = findCliBinary();
    const pdfPath = filePath.replace(/\.[^.]+$/, '.pdf');

    if (cli) {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `${path.basename(filePath)}를 PDF로 변환하는 중...`,
        cancellable: false
      }, async () => {
        return new Promise((resolve, reject) => {
          exec(`"${cli}" convert "${filePath}" "${pdfPath}"`, (err, stdout, stderr) => {
            if (err) {
              vscode.window.showErrorMessage(`PDF 변환 실패: ${stderr || err.message}`);
              reject(err);
            } else {
              vscode.window.showInformationMessage(`PDF 변환 완료: ${path.basename(pdfPath)}`, 'PDF 열기').then(sel => {
                if (sel === 'PDF 열기') {
                  vscode.env.openExternal(vscode.Uri.file(pdfPath));
                }
              });
              resolve();
            }
          });
        });
      });
    } else {
      vscode.window.showInformationMessage('PDF 변환은 WordCraft CLI 도구를 통해 즉시 실행할 수 있습니다.', 'CLI 빌드').then(sel => {
        if (sel === 'CLI 빌드') {
          const term = vscode.window.createTerminal('WordCraft CLI Build');
          term.show();
          term.sendText('cargo build --release -p wordcraft-cli');
        }
      });
    }
  }

  /**
   * Markdown extraction
   */
  async extractTextToNewDocument(document) {
    try {
      const buffer = fs.readFileSync(document.uri.fsPath);
      const docData = parseDocx(buffer);
      const doc = await vscode.workspace.openTextDocument({
        language: 'markdown',
        content: docData.markdown
      });
      await vscode.window.showTextDocument(doc);
    } catch (err) {
      vscode.window.showErrorMessage(`마크다운 추출 실패: ${err.message}`);
    }
  }

  /**
   * Open in Native Desktop App
   */
  openInNativeApp(filePath) {
    const binary = findNativeBinary();
    if (binary) {
      vscode.window.showInformationMessage(`네이티브 WordCraft 실행: ${path.basename(filePath)}`);
      try {
        const child = spawn(binary, [filePath], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
      } catch (err) {
        vscode.window.showErrorMessage(`WordCraft 실행 실패: ${err.message}`);
      }
    } else {
      vscode.window.showInformationMessage(
        'WordCraft 네이티브 데스크톱 앱을 실행하려면 먼저 빌드가 필요합니다: `cargo build --release -p wordcraft`',
        '빌드 시작'
      ).then(sel => {
        if (sel === '빌드 시작') {
          const term = vscode.window.createTerminal('WordCraft Build');
          term.show();
          term.sendText('cargo build --release -p wordcraft');
        }
      });
    }
  }
}

function activate(context) {
  // Register full custom editor provider
  context.subscriptions.push(DocxCustomEditorProvider.register(context));

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('open-word.openNative', (uri) => {
      const target = uri || (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri);
      if (target && target.fsPath) {
        new DocxCustomEditorProvider(context).openInNativeApp(target.fsPath);
      }
    }),

    vscode.commands.registerCommand('open-word.convertToPdf', (uri) => {
      const target = uri || (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri);
      if (target && target.fsPath) {
        new DocxCustomEditorProvider(context).convertDocxToPdf(target.fsPath);
      }
    }),

    vscode.commands.registerCommand('open-word.openSample', () => {
      const binary = findNativeBinary();
      if (binary) {
        spawn(binary, ['--sample'], { detached: true, stdio: 'ignore' }).unref();
      } else {
        vscode.window.showInformationMessage('`cargo build --release -p wordcraft` 로 네이티브 앱을 빌드하세요.');
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
