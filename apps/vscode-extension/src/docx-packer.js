// OOXML (.docx) packer and HTML-to-OOXML serializer
const zlib = require('zlib');

// CRC32 table
const crcTable = (() => {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

/**
 * Creates a valid ZIP buffer from a dictionary of file paths to Buffer/string contents.
 */
function writeZip(files) {
  const localHeaders = [];
  const cdHeaders = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBuf = Buffer.from(name, 'utf8');
    const rawBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const compressed = zlib.deflateRawSync(rawBuf);
    const crc = crc32(rawBuf);

    // Local file header (30 bytes + filename)
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0); // signature
    lh.writeUInt16LE(20, 4);         // version needed: 2.0
    lh.writeUInt16LE(0, 6);          // flags
    lh.writeUInt16LE(8, 8);          // compression: deflate
    lh.writeUInt16LE(0, 10);         // mod time
    lh.writeUInt16LE(0, 12);         // mod date
    lh.writeUInt32LE(crc, 14);       // crc-32
    lh.writeUInt32LE(compressed.length, 18); // compressed size
    lh.writeUInt32LE(rawBuf.length, 22);     // uncompressed size
    lh.writeUInt16LE(nameBuf.length, 26);    // file name length
    lh.writeUInt16LE(0, 28);                 // extra field length
    nameBuf.copy(lh, 30);

    localHeaders.push(lh, compressed);

    // Central directory header (46 bytes + filename)
    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0); // signature
    cd.writeUInt16LE(20, 4);         // version made by
    cd.writeUInt16LE(20, 6);         // version needed
    cd.writeUInt16LE(0, 8);          // flags
    cd.writeUInt16LE(8, 10);         // compression: deflate
    cd.writeUInt16LE(0, 12);         // mod time
    cd.writeUInt16LE(0, 14);         // mod date
    cd.writeUInt32LE(crc, 16);       // crc-32
    cd.writeUInt32LE(compressed.length, 20); // compressed size
    cd.writeUInt32LE(rawBuf.length, 24);     // uncompressed size
    cd.writeUInt16LE(nameBuf.length, 28);    // file name length
    cd.writeUInt16LE(0, 30);                 // extra field length
    cd.writeUInt16LE(0, 32);                 // file comment length
    cd.writeUInt16LE(0, 34);                 // disk number start
    cd.writeUInt16LE(0, 36);                 // internal file attributes
    cd.writeUInt32LE(0, 38);                 // external file attributes
    cd.writeUInt32LE(offset, 42);            // relative offset of local header
    nameBuf.copy(cd, 46);

    cdHeaders.push(cd);
    offset += lh.length + compressed.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const cdh of cdHeaders) {
    cdSize += cdh.length;
  }

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);      // signature
  eocd.writeUInt16LE(0, 4);               // number of this disk
  eocd.writeUInt16LE(0, 6);               // disk where central directory starts
  eocd.writeUInt16LE(cdHeaders.length, 8); // entries in central directory on this disk
  eocd.writeUInt16LE(cdHeaders.length, 10);// total entries in central directory
  eocd.writeUInt32LE(cdSize, 12);         // size of central directory
  eocd.writeUInt32LE(cdOffset, 16);       // offset of start of central directory
  eocd.writeUInt16LE(0, 20);              // comment length

  return Buffer.concat([...localHeaders, ...cdHeaders, eocd]);
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts rich HTML content into standard OOXML word/document.xml.
 */
function htmlToDocxXml(html) {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n` +
    `<w:body>\n`;

  // Clean HTML
  let cleanHtml = html
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim();

  // Split into block chunks: p, h1-h6, table, ul, ol, div, blockquote
  const blockRegex = /<(p|h[1-6]|table|ul|ol|blockquote|div)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let hasBlocks = false;
  let match;

  while ((match = blockRegex.exec(cleanHtml)) !== null) {
    hasBlocks = true;
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const inner = match[3];

    if (tag.startsWith('h')) {
      const level = tag.substring(1);
      const align = getAlignFromAttrs(attrs);
      xml += `  <w:p>\n    <w:pPr>\n      <w:pStyle w:val="Heading${level}"/>\n`;
      if (align) xml += `      <w:jc w:val="${align}"/>\n`;
      xml += `    </w:pPr>\n`;
      xml += parseRunsToXml(inner, { bold: true });
      xml += `  </w:p>\n`;
    } else if (tag === 'table') {
      xml += parseTableToXml(inner);
    } else if (tag === 'ul' || tag === 'ol') {
      const isOrdered = tag === 'ol';
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(inner)) !== null) {
        xml += `  <w:p>\n    <w:pPr>\n`;
        xml += `      <w:numPr><w:ilvl w:val="0"/><w:numId w:val="${isOrdered ? 2 : 1}"/></w:numPr>\n`;
        xml += `    </w:pPr>\n`;
        xml += parseRunsToXml(liMatch[1]);
        xml += `  </w:p>\n`;
      }
    } else {
      // Paragraph or div or blockquote
      const align = getAlignFromAttrs(attrs);
      xml += `  <w:p>\n`;
      if (align) {
        xml += `    <w:pPr><w:jc w:val="${align}"/></w:pPr>\n`;
      }
      xml += parseRunsToXml(inner);
      xml += `  </w:p>\n`;
    }
  }

  // Fallback if no block tags matched
  if (!hasBlocks && cleanHtml.length > 0) {
    const lines = cleanHtml.split(/\n+/);
    for (const line of lines) {
      if (line.trim().length > 0) {
        xml += `  <w:p>\n`;
        xml += parseRunsToXml(line);
        xml += `  </w:p>\n`;
      }
    }
  }

  // Section properties (A4 size: 11906 x 16838 dxa, standard margins: 1440 dxa = 1 inch)
  xml += `  <w:sectPr>\n` +
    `    <w:pgSz w:w="11906" w:h="16838"/>\n` +
    `    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>\n` +
    `  </w:sectPr>\n` +
    `</w:body>\n</w:document>`;

  return xml;
}

function getAlignFromAttrs(attrs) {
  if (!attrs) return null;
  if (/text-align:\s*center/i.test(attrs) || /align="center"/i.test(attrs)) return 'center';
  if (/text-align:\s*right/i.test(attrs) || /align="right"/i.test(attrs)) return 'right';
  if (/text-align:\s*justify/i.test(attrs) || /align="justify"/i.test(attrs)) return 'both';
  return null;
}

function parseTableToXml(tblInner) {
  let xml = `  <w:tbl>\n` +
    `    <w:tblPr>\n` +
    `      <w:tblW w:w="0" w:type="auto"/>\n` +
    `      <w:tblBorders>\n` +
    `        <w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>\n` +
    `        <w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>\n` +
    `        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>\n` +
    `        <w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>\n` +
    `        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n` +
    `        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n` +
    `      </w:tblBorders>\n` +
    `    </w:tblPr>\n`;

  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(tblInner)) !== null) {
    xml += `    <w:tr>\n`;
    const cellRegex = /<(td|th)([^>]*)>([\s\S]*?)<\/\1>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(trMatch[1])) !== null) {
      const isHeader = cellMatch[1].toLowerCase() === 'th';
      const cellContent = cellMatch[3];
      xml += `      <w:tc>\n        <w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>\n`;
      xml += `        <w:p>\n`;
      xml += parseRunsToXml(cellContent, { bold: isHeader });
      xml += `        </w:p>\n      </w:tc>\n`;
    }
    xml += `    </w:tr>\n`;
  }
  xml += `  </w:tbl>\n`;
  return xml;
}

function parseRunsToXml(htmlSnippet, defaults = {}) {
  let xml = '';
  // Tokenize text and inline tags: strong, b, em, i, u, s, del, span, font, sub, sup
  const runTokens = tokenizeInline(htmlSnippet, defaults);
  for (const t of runTokens) {
    if (!t.text) continue;
    xml += `    <w:r>\n      <w:rPr>\n`;
    if (t.bold) xml += `        <w:b/>\n`;
    if (t.italic) xml += `        <w:i/>\n`;
    if (t.underline) xml += `        <w:u w:val="single"/>\n`;
    if (t.strike) xml += `        <w:strike/>\n`;
    if (t.color) {
      const hex = t.color.replace('#', '').toUpperCase();
      if (/^[0-9A-F]{6}$/.test(hex)) {
        xml += `        <w:color w:val="${hex}"/>\n`;
      }
    }
    if (t.fontSize) {
      const szHalfPt = Math.round(t.fontSize * 2);
      xml += `        <w:sz w:val="${szHalfPt}"/>\n`;
    }
    if (t.fontFamily) {
      xml += `        <w:rFonts w:ascii="${escapeXml(t.fontFamily)}" w:hAnsi="${escapeXml(t.fontFamily)}" w:eastAsia="${escapeXml(t.fontFamily)}"/>\n`;
    }
    if (t.sub) xml += `        <w:vertAlign w:val="subscript"/>\n`;
    if (t.sup) xml += `        <w:vertAlign w:val="superscript"/>\n`;
    xml += `      </w:rPr>\n`;
    xml += `      <w:t xml:space="preserve">${escapeXml(t.text)}</w:t>\n`;
    xml += `    </w:r>\n`;
  }
  return xml;
}

function tokenizeInline(htmlSnippet, defaults) {
  // Simple regex parser for inline HTML elements
  const tokens = [];
  const tagRegex = /<(\/?[a-z0-9]+)([^>]*)>|([^<]+)/gi;
  let match;

  const styleStack = [{
    bold: !!defaults.bold,
    italic: !!defaults.italic,
    underline: false,
    strike: false,
    color: null,
    fontSize: null,
    fontFamily: null,
    sub: false,
    sup: false
  }];

  while ((match = tagRegex.exec(htmlSnippet)) !== null) {
    if (match[3]) {
      // Text node
      const current = { ...styleStack[styleStack.length - 1] };
      current.text = match[3];
      tokens.push(current);
    } else if (match[1]) {
      const tagWithSlash = match[1].toLowerCase();
      const attrs = match[2];

      if (tagWithSlash.startsWith('/')) {
        if (styleStack.length > 1) {
          styleStack.pop();
        }
      } else {
        const parent = styleStack[styleStack.length - 1];
        const next = { ...parent };
        if (tagWithSlash === 'strong' || tagWithSlash === 'b') next.bold = true;
        if (tagWithSlash === 'em' || tagWithSlash === 'i') next.italic = true;
        if (tagWithSlash === 'u') next.underline = true;
        if (tagWithSlash === 's' || tagWithSlash === 'del' || tagWithSlash === 'strike') next.strike = true;
        if (tagWithSlash === 'sub') next.sub = true;
        if (tagWithSlash === 'sup') next.sup = true;

        if (attrs) {
          const colorMatch = attrs.match(/color:\s*(#[0-9a-f]{3,6}|rgb\([^)]+\)|[a-z]+)/i);
          if (colorMatch) next.color = parseColor(colorMatch[1]);
          const fontMatch = attrs.match(/font-family:\s*([^;"]+)/i);
          if (fontMatch) next.fontFamily = fontMatch[1].replace(/['"]/g, '').trim();
          const sizeMatch = attrs.match(/font-size:\s*(\d+(?:\.\d+)?)(pt|px)/i);
          if (sizeMatch) {
            let pt = parseFloat(sizeMatch[1]);
            if (sizeMatch[2].toLowerCase() === 'px') pt = pt * 0.75;
            next.fontSize = pt;
          }
        }
        styleStack.push(next);
      }
    }
  }

  return tokens;
}

function parseColor(c) {
  if (!c) return null;
  c = c.trim().toLowerCase();
  if (c.startsWith('#')) {
    if (c.length === 4) {
      return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    }
    return c;
  }
  if (c.startsWith('rgb')) {
    const parts = c.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0], 10).toString(16).padStart(2, '0');
      const g = parseInt(parts[1], 10).toString(16).padStart(2, '0');
      const b = parseInt(parts[2], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return null;
}

/**
 * Re-packs a docx buffer from original zip files with new HTML content.
 */
function htmlToDocxBuffer(originalZipFiles, htmlContent) {
  const files = { ...originalZipFiles };
  const updatedXml = htmlToDocxXml(htmlContent);
  files['word/document.xml'] = Buffer.from(updatedXml, 'utf8');
  return writeZip(files);
}

module.exports = {
  writeZip,
  htmlToDocxXml,
  htmlToDocxBuffer
};
