// components/MessageBubble.tsx
type Props = {
  role: "user" | "assistant";
  text: string;
  riskLevel?: string;
  travelAdvice?: string[];
  sources?: { type: string }[];
};

export default function MessageBubble(
  { role, text, riskLevel, travelAdvice, sources }: Readonly<Props>
) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? "text-white shadow-sm"
            : "bg-white text-slate-900 shadow-sm border border-slate-200"
        }`}
        style={isUser ? { backgroundColor: "#0066CC" } : undefined}
      >
        <p>{text}</p>
        {!isUser && riskLevel && (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-700">
            Risk level: {riskLevel}
          </p>
        )}
        {!isUser && travelAdvice && travelAdvice.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {travelAdvice.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        )}
        {!isUser && sources && sources.length > 0 && (
          <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
            Sources: {sources.map((source) => source.type).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
