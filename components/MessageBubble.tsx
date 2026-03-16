// components/MessageBubble.tsx
type Props = {
  role: "user" | "assistant";
  text: string;
  riskLevel?: string;
  travelAdvice?: string[];
  sources?: { type: string }[];
};

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;

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
        <div className="space-y-2">{renderMessageText(text, isUser)}</div>
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

function renderMessageText(text: string, isUser: boolean) {
  return text.split("\n").map((line, lineIndex) => (
    <p key={`line-${lineIndex}`}>{renderInlineLinks(line, isUser, lineIndex)}</p>
  ));
}

function renderInlineLinks(text: string, isUser: boolean, lineIndex: number) {
  const nodes: Array<string | React.JSX.Element> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const raw = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const markdownLabel = match[1];
    const markdownUrl = match[2];
    const rawUrl = match[3];

    if (markdownLabel && markdownUrl) {
      nodes.push(
        <a
          key={`link-${lineIndex}-${start}`}
          href={markdownUrl}
          target="_blank"
          rel="noreferrer"
          className={isUser ? "underline underline-offset-2 text-white" : "underline underline-offset-2 text-sky-700"}
        >
          {markdownLabel}
        </a>
      );
    } else if (rawUrl) {
      const trimmedUrl = trimTrailingPunctuation(rawUrl);
      const trailing = rawUrl.slice(trimmedUrl.length);
      nodes.push(
        <a
          key={`link-${lineIndex}-${start}`}
          href={trimmedUrl}
          target="_blank"
          rel="noreferrer"
          className={isUser ? "underline underline-offset-2 text-white" : "underline underline-offset-2 text-sky-700"}
        >
          {trimmedUrl}
        </a>
      );
      if (trailing) {
        nodes.push(trailing);
      }
    }

    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function trimTrailingPunctuation(url: string) {
  return url.replace(/[),.!?:;]+$/g, "");
}
