export default function FollowUpSuggestions({
  questions,
  onSelect,
  disabled = false,
}: Readonly<{
  questions?: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}>) {
  const visibleQuestions = questions?.filter((question) => question.trim());
  if (!visibleQuestions?.length) return null;

  return (
    <div className="mt-3" aria-label="Suggested follow-up questions">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Suggested follow-ups
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
