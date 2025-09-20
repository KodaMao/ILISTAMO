'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import type { Estimate, Quote } from '@/types';
import { ExternalLink, FilePlus2 } from 'lucide-react';
import { computeEstimateCost, computeQuoteMetrics } from '@/lib/calculations';

export function ProjectTabs({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { estimates, quotes, initialized, init, createQuoteFromEstimate, updateQuote } = useStore();
  const [tab, setTab] = useState<'estimates' | 'quotes'>('estimates');

  useEffect(() => {
    if (!initialized) void init();
  }, [initialized, init]);

  const projectEstimates = useMemo(
    () => estimates.filter((e: Estimate) => e.projectId === projectId).sort((a, b) => b.createdAt - a.createdAt),
    [estimates, projectId]
  );
  const estimateIdSet = useMemo(() => new Set(projectEstimates.map((e) => e.id)), [projectEstimates]);
  const projectQuotes = useMemo(
    () => quotes.filter((q: Quote) => estimateIdSet.has(q.estimateId)).sort((a, b) => b.createdAt - a.createdAt),
    [quotes, estimateIdSet]
  );

  function StatusBadge({ status }: { status: Quote['status'] }) {
    const map: Record<Quote['status'], string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>{status}</span>;
  }

  return (
    <div>
      <div className="border-b mb-4 flex gap-2">
        <button className={`px-3 py-2 ${tab === 'estimates' ? 'border-b-2 border-blue-600' : ''}`} onClick={() => setTab('estimates')}>Estimates</button>
        <button className={`px-3 py-2 ${tab === 'quotes' ? 'border-b-2 border-blue-600' : ''}`} onClick={() => setTab('quotes')}>Quotes</button>
      </div>

      {tab === 'estimates' ? (
        <div className="space-y-2">
          {projectEstimates.length === 0 ? (
            <div className="text-gray-600">No estimates yet. Use the New Estimate button above to create one.</div>
          ) : (
            <ul className="divide-y rounded border">
              {projectEstimates.map((e) => (
                <li key={e.id} className="p-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{e.name || 'Untitled Estimate'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{new Date(e.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>Total: {computeEstimateCost(e).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 text-sm rounded border inline-flex items-center gap-1 hover:bg-gray-50"
                      onClick={() => router.push(`/projects/${projectId}/estimates/${e.id}`)}
                    >
                      <ExternalLink size={14} /> Open
                    </button>
                    <button
                      className="px-2 py-1 text-sm rounded bg-blue-600 text-white inline-flex items-center gap-1"
                      onClick={() => {
                        const qid = createQuoteFromEstimate(e.id);
                        if (qid) router.push(`/quotes/${qid}`);
                      }}
                    >
                      <FilePlus2 size={14} /> Create Quote
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {projectQuotes.length === 0 ? (
            <div className="text-gray-600">No quotes yet. Create one from an estimate.</div>
          ) : (
            <ul className="divide-y rounded border">
              {projectQuotes.map((q) => (
                <li key={q.id} className="p-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{q.name || 'Untitled Quote'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>#{q.quoteNumber}</span>
                      <span>•</span>
                      <span>{new Date(q.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>Grand: {computeQuoteMetrics(q, estimates.find(e => e.id === q.estimateId)).grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block"><StatusBadge status={q.status} /></div>
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={q.status}
                      onChange={(e) => updateQuote(q.id, { status: e.target.value as Quote['status'] })}
                      aria-label="Quote status"
                    >
                      <option value="draft">draft</option>
                      <option value="sent">sent</option>
                      <option value="accepted">accepted</option>
                      <option value="declined">declined</option>
                    </select>
                    <button
                      className="px-2 py-1 text-sm rounded border inline-flex items-center gap-1 hover:bg-gray-50"
                      onClick={() => router.push(`/quotes/${q.id}`)}
                    >
                      <ExternalLink size={14} /> Open
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
