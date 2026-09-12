import type { JourneyContext } from "../lib/schemas";

export default function JourneyContextPanel({
  context,
}: Readonly<{ context?: JourneyContext }>) {
  const origin = context?.origin?.trim();
  const destination = context?.destination?.trim();
  if (!origin && !destination) return null;

  return (
    <div
      aria-label="Journey context"
      className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-950"
    >
      <p className="font-semibold uppercase tracking-wide text-indigo-700">
        Journey context
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {origin && <span>{origin}</span>}
        {origin && destination && (
          <span aria-hidden="true" className="text-indigo-500">
            →
          </span>
        )}
        {destination && <span>{destination}</span>}
      </div>
    </div>
  );
}
