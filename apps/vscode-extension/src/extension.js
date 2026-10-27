const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { parseDocx } = require('./docx-parser');
const { renderWebviewHtml } = require('./webview');

/**
 * Locate the native WordCraft desktop executable.
 */
function findNativeBinary() {
  const config = vscode.workspace.getConfiguration('open-word');
  const customPath = config.get('nativeBinaryPath');
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }

  // Check workspace target/release/wordcraft
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

  // macOS App Bundle
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
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }

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
 * Open document in native WordCraft desktop application.
 */
function openInNativeApp(filePath) {
  const binary = findNativeBinary();
  if (binary) {
    vscode.window.showInformationMessage(`Launching Native WordCraft: ${path.basename(filePath)}`);
    try {
      const child = spawn(binary, [filePath], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to launch WordCraft: ${err.message}`);
    }
  } else {
    vscode.window.showWarningMessage(
      'Native WordCraft desktop binary not found. Build it with `cargo build --release -p wordcraft` to enjoy Metal/DirectX 120fps hardware acceleration!',
      'Build Native App',
      'Learn More'
    ).then(selection => {
      if (selection === 'Build Native App') {
        const term = vscode.window.createTerminal('WordCraft Build');
        term.show();
        term.sendText('cargo build --release -p wordcraft');
      } else if (selection === 'Learn More') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/iamywl/OPEN_WORD'));
      }
    });
  }
}

/**
 * Convert document to PDF using CLI.
 */
function convertDocxToPdf(filePath) {
  const cli = findCliBinary();
  const pdfPath = filePath.replace(/\.[^.]+$/, '.pdf');

  if (cli) {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Converting ${path.basename(filePath)} to PDF...`,
      cancellable: false
    }, async () => {
      return new Promise((resolve, reject) => {
        exec(`"${cli}" convert "${filePath}" "${pdfPath}"`, (err, stdout, stderr) => {
          if (err) {
            vscode.window.showErrorMessage(`PDF conversion failed: ${stderr || err.message}`);
            reject(err);
          } else {
            vscode.window.showInformationMessage(`Converted to PDF: ${path.basename(pdfPath)}`, 'Open PDF').then(sel => {
              if (sel === 'Open PDF') {
                vscode.env.openExternal(vscode.Uri.file(pdfPath));
              }
            });
            resolve();
          }
        });
      });
    });
  } else {
    vscode.window.showWarningMessage(
      'WordCraft CLI binary not found. Build it with `cargo build --release -p wordcraft-cli`.',
      'Build CLI'
    ).then(sel => {
      if (sel === 'Build CLI') {
        const term = vscode.window.createTerminal('WordCraft CLI Build');
        term.show();
        term.sendText('cargo build --release -p wordcraft-cli');
      }
    });
  }
}

/**
 * Extract Markdown to a new editor tab.
 */
async function extractTextToNewDocument(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const docData = parseDocx(buffer);
    const doc = await vscode.workspace.openTextDocument({
      language: 'markdown',
      content: docData.markdown
    });
    await vscode.window.showTextDocument(doc);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to extract text: ${err.message}`);
  }
}

/**
 * Inspect raw XML.
 */
async function inspectDocxStructure(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const docData = parseDocx(buffer);
    const doc = await vscode.workspace.openTextDocument({
      language: 'xml',
      content: docData.rawXml
    });
    await vscode.window.showTextDocument(doc);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to read document structure: ${err.message}`);
  }
}

/**
 * Custom Editor Provider for .docx files.
 */
class DocxCustomEditorProvider {
  static register(context) {
    const provider = new DocxCustomEditorProvider(context);
    return vscode.window.registerCustomEditorProvider('open-word.docxEditor', provider, {
      webviewOptions: {
        retainContextWhenHidden: true
      },
      supportsMultipleEditorsPerDocument: true
    });
  }

  constructor(context) {
    this.context = context;
  }

  async resolveCustomEditor(document, webviewPanel, _token) {
    const filePath = document.uri.fsPath;
    const fileName = path.basename(filePath);

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(this.context.extensionPath)
      ]
    };

    const updateWebview = () => {
      try {
        const buffer = fs.readFileSync(filePath);
        const docData = parseDocx(buffer);
        webviewPanel.webview.html = renderWebviewHtml(docData, fileName, filePath);
      } catch (err) {
        webviewPanel.webview.html = `
          <!DOCTYPE html>
          <html>
            <body style="padding: 40px; font-family: sans-serif; color: var(--vscode-editor-foreground); background: var(--vscode-editor-background);">
              <h2>⚠️ Unable to Preview Document</h2>
              <p>${err.message}</p>
              <button onclick="acquireVsCodeApi().postMessage({command:'openNative'})" style="padding: 8px 16px; margin-top: 16px; cursor: pointer;">
                Open in Native Desktop App
              </button>
            </body>
          </html>
        `;
      }
    };

    // Initial render
    updateWebview();

    // Watch for file updates
    const watcher = vscode.workspace.createFileSystemWatcher(document.uri.fsPath);
    watcher.onDidChange(() => updateWebview());
    webviewPanel.onDidDispose(() => watcher.dispose());

    // Handle messages from the webview
    webviewPanel.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'openNative':
          openInNativeApp(filePath);
          break;
        case 'convertToPdf':
          convertDocxToPdf(filePath);
          break;
        case 'extractText':
          extractTextToNewDocument(filePath);
          break;
        case 'inspectDocx':
          inspectDocxStructure(filePath);
          break;
      }
    });
  }
}

function activate(context) {
  // Register custom editor
  context.subscriptions.push(DocxCustomEditorProvider.register(context));

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('open-word.openNative', (uri) => {
      const targetUri = uri || (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri);
      if (targetUri && targetUri.fsPath) {
        openInNativeApp(targetUri.fsPath);
      } else {
        vscode.window.showErrorMessage('No document selected to open in Native WordCraft.');
      }
    }),

    vscode.commands.registerCommand('open-word.convertToPdf', (uri) => {
      const targetUri = uri || (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri);
      if (targetUri && targetUri.fsPath) {
        convertDocxToPdf(targetUri.fsPath);
      } else {
        vscode.window.showErrorMessage('No document selected to convert to PDF.');
      }
    }),

    vscode.commands.registerCommand('open-word.extractText', (uri) => {
      const targetUri = uri || (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri);
      if (targetUri && targetUri.fsPath) {
        extractTextToNewDocument(targetUri.fsPath);
      } else {
        vscode.window.showErrorMessage('No document selected.');
      }
    }),

    vscode.commands.registerCommand('open-word.inspectDocx', (uri) => {
      const targetUri = uri || (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri);
      if (targetUri && targetUri.fsPath) {
        inspectDocxStructure(targetUri.fsPath);
      } else {
        vscode.window.showErrorMessage('No document selected.');
      }
    }),

    vscode.commands.registerCommand('open-word.openSample', () => {
      const binary = findNativeBinary();
      if (binary) {
        spawn(binary, ['--sample'], { detached: true, stdio: 'ignore' }).unref();
        vscode.window.showInformationMessage('Launched Native WordCraft with Sample Document.');
      } else {
        vscode.window.showInformationMessage('Please build the native app first: `cargo build --release -p wordcraft`');
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
