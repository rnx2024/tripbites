import type { AnswerMode } from "../lib/schemas";

const MODE_DETAILS: Record<AnswerMode, { label: string; icon: string }> = {
  journey_planning: { label: "Journey Assessment", icon: "🛫" },
  destination_brief: { label: "Destination Brief", icon: "📍" },
};

export default function AnswerModeBadge({
  answerMode,
}: Readonly<{ answerMode?: AnswerMode }>) {
  if (!answerMode) return null;
  const details = MODE_DETAILS[answerMode];
  return (
    <span
      aria-label={`Answer mode: ${details.label}`}
      className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800"
    >
      <span aria-hidden="true">{details.icon}</span>
      {details.label}
    </span>
  );
}
