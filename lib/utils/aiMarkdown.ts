/** Chuẩn hóa markdown từ AI để render đúng công thức KaTeX và bảng GFM */

export function shortenUrlForDisplay(url: string, maxLength = 48): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    let label = parsed.hostname.replace(/^www\./, '');

    if (parsed.pathname && parsed.pathname !== '/') {
      const path = decodeURIComponent(parsed.pathname);
      label += path.length > 28 ? `${path.slice(0, 25)}…` : path;
    }

    if (label.length > maxLength) {
      return `${label.slice(0, maxLength - 1)}…`;
    }

    return label;
  } catch {
    return url.length > maxLength ? `${url.slice(0, maxLength - 1)}…` : url;
  }
}

export function getLinkDisplayLabel(href: string, label: string): string {
  const trimmedLabel = label.trim();
  const trimmedHref = href.trim();

  if (!trimmedHref) return trimmedLabel;
  if (!trimmedLabel || trimmedLabel === trimmedHref) {
    return shortenUrlForDisplay(trimmedHref);
  }
  if (trimmedLabel.startsWith('http') && trimmedLabel.length > 48) {
    return shortenUrlForDisplay(trimmedLabel);
  }

  return trimmedLabel;
}

function protectCodeBlocks(text: string): { text: string; blocks: string[] } {
  const blocks: string[] = [];
  const protectedText = text.replace(/```[\s\S]*?```/g, (match) => {
    blocks.push(match);
    return `__CODE_BLOCK_${blocks.length - 1}__`;
  });
  return { text: protectedText, blocks };
}

function restoreCodeBlocks(text: string, blocks: string[]): string {
  return text.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => blocks[parseInt(index, 10)] ?? '');
}

function looksLikeLatex(content: string): boolean {
  return /\\[a-zA-Z{([]/.test(content);
}

function normalizeLatexDelimiters(text: string): string {
  let result = text;

  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => `$$${latex.trim()}$$`);
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, latex) => `$${latex.trim()}$`);

  result = result.replace(/\[\s*(\\[\s\S]*?)\s*\]/g, (match, latex) => {
    if (looksLikeLatex(latex)) {
      return `$$${latex.trim()}$$`;
    }
    return match;
  });

  return result;
}

function splitTableCells(line: string): string[] | null {
  if (!line.includes('|')) return null;

  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  const cells = inner.split('|').map((cell) => cell.trim());

  return cells.length >= 2 ? cells : null;
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{2,}:?$/.test(cell));
}

function toTableRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`;
}

function buildSeparator(colCount: number): string {
  return `| ${Array(colCount).fill('---').join(' | ')} |`;
}

function fixMarkdownTables(text: string): string {
  const lines = text.split('\n');
  const output: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const cells = splitTableCells(lines[index]);

    if (!cells) {
      output.push(lines[index]);
      index += 1;
      continue;
    }

    const tableRows: string[][] = [];
    while (index < lines.length) {
      const rowCells = splitTableCells(lines[index]);
      if (!rowCells) break;
      tableRows.push(rowCells);
      index += 1;
    }

    const formatted = tableRows.map(toTableRow);
    const hasSeparator = tableRows.length >= 2 && isSeparatorRow(tableRows[1]);

    if (!hasSeparator) {
      formatted.splice(1, 0, buildSeparator(tableRows[0].length));
    }

    output.push(...formatted);
  }

  return output.join('\n');
}

export function normalizeAiMarkdown(text: string): string {
  if (!text) return text;

  const { text: protectedText, blocks } = protectCodeBlocks(text);
  let result = normalizeLatexDelimiters(protectedText);
  result = fixMarkdownTables(result);
  result = restoreCodeBlocks(result, blocks);

  return result;
}

export function autoWrapSimpleMath(text: string): string {
  let result = text;

  const codeBlocks: string[] = [];
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  result = result.replace(/\\\*/g, '\\times ');
  result = result.replace(/\\\//g, '\\div ');

  const lines = result.split('\n');
  const processedLines = lines.map((line) => {
    if (line.includes('$') || !line.trim()) return line;
    let processed = line.replace(/(\d+[\.,]?\d*\s*[\*\/\^]\s*\d+[\.,]?\d*)/g, '$$$1$$');
    processed = processed.replace(/\b([a-zA-Z]{1,4}\s*=\s*[a-zA-Z]{1,4})\b/g, '$$$1$$');
    return processed;
  });

  result = processedLines.join('\n');
  result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[parseInt(index, 10)] ?? '');

  return result;
}

export function prepareAiMarkdown(content: string, isStreaming = false): string {
  let result = content;

  if (isStreaming) {
    const fenceCount = (result.match(/```/g) || []).length;
    if (fenceCount % 2 === 1) {
      result += '\n```';
    }
    const boldCount = (result.match(/\*\*/g) || []).length;
    if (boldCount % 2 === 1) {
      result += '**';
    }
  }

  result = normalizeAiMarkdown(result);
  result = autoWrapSimpleMath(result);

  return result;
}
