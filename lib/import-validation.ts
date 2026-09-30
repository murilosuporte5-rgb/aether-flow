import { ACTION_TYPES, normalizePhone } from './execution.ts';
import { parseCsv } from './csv.ts';
export const CSV_COLUMNS = ['nome','telefone','empresa','oportunidade','valor','estágio','origem','próxima_acao','data_proxima_acao'];
type Stage = { id: string; name: string; kind: string };
export function validateImport(text: string, stages: Stage[], mapping?: Record<string, number>) {
  const [headers, ...rows] = parseCsv(text);
  const canonical = (s: string) => s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const positions = mapping || Object.fromEntries(CSV_COLUMNS.map(name => [name, headers.findIndex(h => canonical(h) === canonical(name))]));
  for (const name of ['nome','telefone','oportunidade','estágio']) if (!Number.isInteger(positions[name]) || positions[name] < 0 || positions[name] >= headers.length) throw new Error(`Mapeie a coluna ${name}.`);
  const errors: string[] = [];
  const commands = rows.map((row, index) => {
    const get = (name: string) => (row[positions[name]] || '').trim();
    const error = (message: string) => errors.push(`Linha ${index + 2}: ${message}`);
    const contactName = get('nome'), phone = get('telefone'), title = get('oportunidade');
    if (contactName.length < 1 || contactName.length > 100 || title.length < 1 || title.length > 160) error('nome ou oportunidade inválidos.');
    if (!normalizePhone(phone)) error('telefone inválido.');
    const matches = stages.filter(s => canonical(s.name) === canonical(get('estágio')) && s.kind === 'open');
    if (matches.length !== 1) error('estágio deve identificar uma etapa aberta.');
    const amount = get('valor');
    // Explicit BRL: 1.234,56 or 1234,56. Dot-only decimal also accepted.
    const numeric = amount.includes(',') ? amount.replaceAll('.', '').replace(',', '.') : amount;
    if (amount && (!/^\d+(\.\d{1,2})?$/.test(numeric) || Number(numeric) > 999999999999.99)) error('valor inválido; use 1234,56 ou 1234.56.');
    const actionType = get('próxima_acao'), date = get('data_proxima_acao');
    if (actionType && !(ACTION_TYPES as readonly string[]).includes(actionType)) error('tipo de próxima ação inválido.');
    // Local timestamps are Bahia; explicit offset/Z preserves the supplied instant.
    let dueAt: string | null = null;
    if (date) {
      const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(date) ? date + '-03:00' : date;
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(iso) || !Number.isFinite(Date.parse(iso))) error('data deve ser ISO com hora, ex.: 2026-10-01T10:00 (Bahia).');
      else dueAt = new Date(iso).toISOString();
    }
    if (!!actionType !== !!date) error('próxima ação e data são obrigatórias em conjunto.');
    const organization = get('empresa'), source = get('origem');
    if (organization.length > 100 || source.length > 80) error('empresa ou origem excede o limite.');
    return { contactName, phone, title, organization, source, stageId: matches[0]?.id, value: amount ? numeric : '', actionType, dueAt };
  });
  if (!commands.length) errors.push('Arquivo sem registros.');
  return { headers, commands, errors };
}
