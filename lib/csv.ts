/** Bounded RFC4180 parsing. Values stay strings until domain validation. */
export function parseCsv(input: string): string[][] {
  if (new TextEncoder().encode(input).length > 1_000_000) throw new Error('Arquivo excede 1 MB.');
  const text = input.replace(/^\uFEFF/, '');
  const delimiter = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], value = '', quoted = false, ended = false;
  const cell = () => { row.push(value); value = ''; ended = false; };
  const line = () => { cell(); if (row.some(v => v.length)) rows.push(row); row = []; if (rows.length > 501) throw new Error('Limite de 500 registros.'); };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { value += '"'; i++; } else { quoted = false; ended = true; } }
      else value += ch;
    } else if (ch === '"') {
      if (value || ended) throw new Error('Aspas inválidas no CSV.');
      quoted = true;
    } else if (ch === delimiter) cell();
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; line(); }
    else { if (ended) throw new Error('Texto após fechamento de aspas.'); value += ch; }
  }
  if (quoted) throw new Error('Aspas não fechadas no CSV.');
  if (value || row.length || ended) line();
  if (!rows.length) throw new Error('Arquivo vazio.');
  if (rows.some(r => r.length !== rows[0].length)) throw new Error('Quantidade de colunas inconsistente.');
  return rows;
}

export function exportCsv(headers: string[], rows: unknown[][]): string {
  const cell = (value: unknown) => {
    let text = value == null ? '' : String(value);
    // Spreadsheet software also evaluates formulas preceded by whitespace.
    if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(';')).join('\r\n');
}
