export type NoteSuggestion = {
  actionType: "Aguardar cliente";
  dueAt: string;
  reason: string;
  suggestedStage: "Aguardando decisão";
  context: string;
} | null;

export function suggestFromNote(note: string, now = new Date()): NoteSuggestion {
  const text = note.toLocaleLowerCase("pt-BR");
  if (!/(sócio|socia|decisor|diretor)/.test(text)) return null;
  const due = new Date(now);
  const friday = text.includes("sexta");
  if (friday) {
    const days = (5 - due.getDay() + 7) % 7 || 7;
    due.setDate(due.getDate() + days);
  } else due.setDate(due.getDate() + 1);
  due.setHours(10, 0, 0, 0);
  return {
    actionType: "Aguardar cliente",
    dueAt: due.toISOString(),
    suggestedStage: "Aguardando decisão",
    context: "Decisor adicional mencionado na anotação.",
    reason: friday
      ? "A anotação menciona um retorno na sexta após falar com o decisor."
      : "A anotação menciona uma decisão com outra pessoa.",
  };
}
