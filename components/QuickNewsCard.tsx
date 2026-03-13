// components/QuickNewsCard.tsx
"use client";

import { useState, type FormEvent } from "react";
import { newsRequest } from "../lib/api";

type NewsItem = {
  id: string; // ✅ added for stable React keys
  title: string;
  source?: string;
  date?: string;
  link?: string;
};

export default function QuickNewsCard() {
  const [place, setPlace] = useState("Vigan");
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [travelRelevance, setTravelRelevance] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = place.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setItems(null);
    setTravelRelevance(null);
    setNote(null);

    try {
      const res = await newsRequest(trimmed);
      const normalized: NewsItem[] = (res.items ?? []).map((it: Omit<NewsItem, "id">) => ({
        ...it,
        id: crypto.randomUUID(),
      }));
      setItems(normalized);
      setTravelRelevance(res.travel_relevance ?? null);
      setNote(res.note ?? null);
    } catch (err: any) {
      setError(err?.message ?? "News request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-sky-100 p-4 shadow-md space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Local Updates</h2>
        <p className="text-xs text-slate-500">Recent developments that may affect travelers.</p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs placeholder-slate-400 focus:border-[#3399FF] focus:outline-none focus:ring-2 focus:ring-[#3399FF]/30"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="e.g. Vigan"
        />
        <button
          type="submit"
          disabled={loading || !place.trim()}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#5ba5efff" }}
        >
          {loading ? "..." : "Fetch"}
        </button>
      </form>

      <div className="min-h-[3rem] space-y-1 text-xs text-slate-700">
        {error && <p className="text-red-600">{error}</p>}

        {!error && items && items.length > 0 && (
          <div className="space-y-2">
            <ul className="space-y-1">
              {items.slice(0, 3).map((item) => (
                <li key={item.id} className="leading-snug">
                  <span className="font-medium">{item.title}</span>
                  {item.source && <span className="text-slate-500"> · {item.source}</span>}
                  {item.date && <span className="text-slate-400"> · {item.date}</span>}
                </li>
              ))}
            </ul>
            {travelRelevance && <p className="text-slate-500">{travelRelevance}</p>}
            {note && <p className="text-slate-400">{note}</p>}
          </div>
        )}

        {!error && items?.length === 0 && !loading && (
          <p className="text-slate-400">No recent local updates found.</p>
        )}

        {!error && !items && !loading && <p className="text-slate-400">No local updates queried yet.</p>}
      </div>
    </section>
  );
}
