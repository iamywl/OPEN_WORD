// Clean-room OOXML (.docx) parser in pure JS without external dependencies
const zlib = require('zlib');

/**
 * Reads a zip buffer and extracts file entries into a dictionary.
 */
function readZip(buffer) {
  const files = {};
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Not a valid ZIP / OOXML package');
  }

  const cdCount = buffer.readUInt16LE(eocdOffset + 10);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  let offset = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(offset + 10);
    const compSize = buffer.readUInt32LE(offset + 20);
    const uncompSize = buffer.readUInt32LE(offset + 24);
    const nameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLen);

    const localNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const rawData = buffer.slice(dataOffset, dataOffset + compSize);

    let decompressed;
    if (method === 0) {
      decompressed = rawData;
    } else if (method === 8) {
      decompressed = zlib.inflateRawSync(rawData);
    } else {
      decompressed = null;
    }

    if (decompressed) {
      files[name] = decompressed;
    }
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

/**
 * Basic XML entity decoding.
 */
function decodeXml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Escapes HTML characters for web rendering.
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parse document metadata from docProps/core.xml.
 */
function parseMetadata(xmlString) {
  if (!xmlString) return {};
  const meta = {};
  const getTag = (tag) => {
    const m = xmlString.match(new RegExp(`<dc:${tag}[^>]*>([\\s\\S]*?)</dc:${tag}>`, 'i')) ||
              xmlString.match(new RegExp(`<cp:${tag}[^>]*>([\\s\\S]*?)</cp:${tag}>`, 'i')) ||
              xmlString.match(new RegExp(`<dcterms:${tag}[^>]*>([\\s\\S]*?)</dcterms:${tag}>`, 'i'));
    return m ? decodeXml(m[1].trim()) : '';
  };
  meta.title = getTag('title');
  meta.creator = getTag('creator');
  meta.lastModifiedBy = getTag('lastModifiedBy');
  meta.created = getTag('created');
  meta.modified = getTag('modified');
  meta.description = getTag('description');
  return meta;
}

/**
 * Parse OOXML document.xml into an array of block elements:
 * - { type: 'heading', level: 1..6, text, runs }
 * - { type: 'paragraph', text, runs, isList, listLevel }
 * - { type: 'table', rows: [ [ { text, runs } ] ] }
 */
function parseDocumentXml(xmlString) {
  if (!xmlString) return [];
  const blocks = [];

  // Match top-level blocks: <w:p>...</w:p> or <w:tbl>...</w:tbl>
  const blockRegex = /<w:(p|tbl)[^>]*>([\s\S]*?)<\/w:\1>/g;
  let match;

  while ((match = blockRegex.exec(xmlString)) !== null) {
    const kind = match[1];
    const content = match[2];

    if (kind === 'p') {
      const p = parseParagraph(content);
      if (p.text.length > 0 || p.hasBreak) {
        blocks.push(p);
      }
    } else if (kind === 'tbl') {
      const tbl = parseTable(content);
      if (tbl.rows.length > 0) {
        blocks.push(tbl);
      }
    }
  }

  return blocks;
}

function parseParagraph(pInner) {
  // Check style / heading
  let level = 0;
  const styleMatch = pInner.match(/<w:pStyle[^>]*w:val="([^"]+)"/);
  if (styleMatch) {
    const style = styleMatch[1].toLowerCase();
    const headingMatch = style.match(/heading\s*(\d)/) || style.match(/h(\d)/) || style.match(/제목\s*(\d)/);
    if (headingMatch) {
      level = parseInt(headingMatch[1], 10);
    } else if (style.includes('title') || style.includes('제목')) {
      level = 1;
    } else if (style.includes('subtitle') || style.includes('소제목')) {
      level = 2;
    }
  }

  // Check list / numbering
  const isList = /<w:numPr[\s\S]*?<\/w:numPr>/.test(pInner);
  let listLevel = 0;
  const ilvlMatch = pInner.match(/<w:ilvl[^>]*w:val="(\d+)"/);
  if (ilvlMatch) {
    listLevel = parseInt(ilvlMatch[1], 10);
  }

  // Check alignment
  let align = 'left';
  const jcMatch = pInner.match(/<w:jc[^>]*w:val="([^"]+)"/);
  if (jcMatch) {
    align = jcMatch[1];
    if (align === 'both') align = 'justify';
  }

  // Parse runs
  const runs = [];
  let fullText = '';
  let hasBreak = false;

  const runRegex = /<w:r[^>]*>([\s\S]*?)<\/w:r>/g;
  let rMatch;
  while ((rMatch = runRegex.exec(pInner)) !== null) {
    const rInner = rMatch[1];
    const isBold = /<w:b(?:\s|>|\/>)/.test(rInner) && !/<w:b[^>]*w:val="(?:0|false|none)"/.test(rInner);
    const isItalic = /<w:i(?:\s|>|\/>)/.test(rInner) && !/<w:i[^>]*w:val="(?:0|false|none)"/.test(rInner);
    const isUnderline = /<w:u(?:\s|>|\/>)/.test(rInner) && !/<w:u[^>]*w:val="(?:0|false|none)"/.test(rInner);
    const isStrike = /<w:strike(?:\s|>|\/>)/.test(rInner);

    // Text color
    let color = null;
    const colorMatch = rInner.match(/<w:color[^>]*w:val="([0-9a-fA-F]{6})"/);
    if (colorMatch && colorMatch[1] !== 'auto') {
      color = '#' + colorMatch[1];
    }

    // Font size in half-points (sz)
    let fontSize = null;
    const szMatch = rInner.match(/<w:sz[^>]*w:val="(\d+)"/);
    if (szMatch) {
      fontSize = parseInt(szMatch[1], 10) / 2; // pt
    }

    // Text content
    let runText = '';
    const tRegex = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(rInner)) !== null) {
      runText += decodeXml(tMatch[1]);
    }

    if (/<w:br(?:\s|>|\/>)/.test(rInner)) {
      hasBreak = true;
      runText += '\n';
    }

    if (runText.length > 0) {
      runs.push({
        text: runText,
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strike: isStrike,
        color,
        fontSize
      });
      fullText += runText;
    }
  }

  if (level > 0) {
    return {
      type: 'heading',
      level: Math.min(Math.max(level, 1), 6),
      text: fullText,
      runs,
      align,
      hasBreak
    };
  }

  return {
    type: 'paragraph',
    text: fullText,
    runs,
    isList,
    listLevel,
    align,
    hasBreak
  };
}

function parseTable(tblInner) {
  const rows = [];
  const trRegex = /<w:tr[^>]*>([\s\S]*?)<\/w:tr>/g;
  let trMatch;

  while ((trMatch = trRegex.exec(tblInner)) !== null) {
    const trInner = trMatch[1];
    const cells = [];
    const tcRegex = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g;
    let tcMatch;

    while ((tcMatch = tcRegex.exec(trInner)) !== null) {
      const tcInner = tcMatch[1];
      const pBlocks = [];
      const pRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
      let pMatch;

      while ((pMatch = pRegex.exec(tcInner)) !== null) {
        const p = parseParagraph(pMatch[1]);
        if (p.text.length > 0) {
          pBlocks.push(p);
        }
      }

      const cellText = pBlocks.map(p => p.text).join(' ');
      cells.push({
        text: cellText,
        paragraphs: pBlocks
      });
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return {
    type: 'table',
    rows
  };
}

/**
 * Converts blocks to clean Markdown.
 */
function blocksToMarkdown(blocks, metadata = {}) {
  let md = '';
  if (metadata.title) {
    md += `# ${metadata.title}\n\n`;
  }

  for (const block of blocks) {
    if (block.type === 'heading') {
      const prefix = '#'.repeat(block.level);
      md += `${prefix} ${block.text.trim()}\n\n`;
    } else if (block.type === 'paragraph') {
      let line = '';
      for (const r of block.runs) {
        let t = r.text;
        if (r.bold && r.italic) t = `***${t}***`;
        else if (r.bold) t = `**${t}**`;
        else if (r.italic) t = `*${t}*`;
        if (r.strike) t = `~~${t}~~`;
        line += t;
      }
      if (block.isList) {
        const indent = '  '.repeat(block.listLevel || 0);
        md += `${indent}- ${line.trim()}\n`;
      } else {
        md += `${line.trim()}\n\n`;
      }
    } else if (block.type === 'table') {
      if (block.rows.length > 0) {
        const header = block.rows[0];
        md += '| ' + header.map(c => c.text.replace(/\|/g, '\\|').trim()).join(' | ') + ' |\n';
        md += '| ' + header.map(() => '---').join(' | ') + ' |\n';
        for (let i = 1; i < block.rows.length; i++) {
          const row = block.rows[i];
          md += '| ' + row.map(c => c.text.replace(/\|/g, '\\|').trim()).join(' | ') + ' |\n';
        }
        md += '\n';
      }
    }
  }
  return md.trim();
}

/**
 * Full parsing pipeline from binary buffer.
 */
function parseDocx(buffer) {
  const files = readZip(buffer);
  const docXml = files['word/document.xml'] ? files['word/document.xml'].toString('utf8') : '';
  const coreXml = files['docProps/core.xml'] ? files['docProps/core.xml'].toString('utf8') : '';

  const metadata = parseMetadata(coreXml);
  const blocks = parseDocumentXml(docXml);

  // Statistics
  let charCount = 0;
  let wordCount = 0;
  let paragraphCount = 0;

  for (const b of blocks) {
    if (b.type === 'heading' || b.type === 'paragraph') {
      paragraphCount++;
      charCount += b.text.length;
      wordCount += (b.text.trim().match(/[\S]+/g) || []).length;
    } else if (b.type === 'table') {
      for (const row of b.rows) {
        for (const cell of row) {
          charCount += cell.text.length;
          wordCount += (cell.text.trim().match(/[\S]+/g) || []).length;
        }
      }
    }
  }

  const markdown = blocksToMarkdown(blocks, metadata);

  return {
    files: Object.keys(files),
    metadata,
    blocks,
    stats: {
      charCount,
      wordCount,
      paragraphCount,
      fileSize: buffer.length
    },
    markdown,
    rawXml: docXml
  };
}

module.exports = {
  readZip,
  parseDocx,
  blocksToMarkdown,
  escapeHtml
};
