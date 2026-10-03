export type GuidanceRow = {
  status: string;
  owner_id?: string | null;
  next_action_at?: string | null;
  next_action_type?: string | null;
  last_interaction_at?: string | null;
  stage_entered_at?: string | null;
};

const daysSince = (value: string | null | undefined, now: number) =>
  value ? Math.max(0, (now - Date.parse(value)) / 86400000) : Infinity;

export function nextBestAction(row: GuidanceRow, now = Date.now()) {
  if (row.status !== "open") return null;
  if (!row.owner_id) return { action: "Atribuir responsável", reason: "Esta oportunidade ainda não tem responsável." };
  if (!row.next_action_at) return { action: "Definir próximo passo", reason: "Não há uma ação futura registrada para manter o contato avançando." };
  if (Date.parse(row.next_action_at) < now) return { action: "Reagendar follow-up", reason: "A próxima ação passou do prazo e precisa de uma nova data." };
  if (daysSince(row.last_interaction_at, now) > 7) return { action: "Fazer follow-up", reason: "A última interação registrada foi há mais de sete dias." };
  return null;
}

export function momentum(row: GuidanceRow, now = Date.now()) {
  if (row.status !== "open") return { label: "Estável", reason: "A oportunidade está encerrada; não há movimento aberto para estimar." };
  const interactionDays = daysSince(row.last_interaction_at, now);
  const stageDays = daysSince(row.stage_entered_at, now);
  if (row.next_action_at && Date.parse(row.next_action_at) < now) return { label: "Esfriando", reason: "A próxima ação está atrasada." };
  if (interactionDays <= 2 && row.next_action_at) return { label: "Esquentando", reason: "Houve interação recente e existe um próximo passo agendado." };
  if (interactionDays > 7 || stageDays > 14) return { label: "Esfriando", reason: interactionDays > 7 ? "A última interação está distante." : "A oportunidade está há mais de 14 dias na mesma etapa." };
  return { label: "Estável", reason: row.next_action_at ? "Existe um próximo passo, mas ainda não há sinais recentes suficientes para indicar aceleração." : "Os dados atuais não mostram movimento recente suficiente." };
}
