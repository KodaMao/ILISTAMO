"use client";
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { computeQuoteMetrics } from '@/lib/calculations';
import { ExportModal } from '@/components/export/ExportModal';

import { FileDown, Plus, Trash2, Copy } from 'lucide-react';
import { CategoryGroup } from './CategoryGroup';
import { QuoteOverview } from './QuoteOverview';
import { QuoteNotesTerms } from './QuoteNotesTerms';
import { QuoteActionBar } from './QuoteActionBar';


export function QuoteEditor({ quoteId }: { quoteId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<{[cat: string]: boolean}>({});
  const [showSaved, setShowSaved] = useState(false);
  const quote = useStore((s) => s.quotes.find((q) => q.id === quoteId));
  const estimate = useStore((s) => (quote ? s.estimates.find((e) => e.id === quote.estimateId) : undefined));
  const updateQuote = useStore((s) => s.updateQuote);
  const updateQuoteItems = useStore((s) => s.updateQuoteItems);
  const setQuoteStatus = useStore((s) => s.setQuoteStatus);
  if (!quote) return <div className="text-red-600">Quote not found</div>;

  const metrics = computeQuoteMetrics(quote, estimate);
  const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const profitPct = metrics.subtotal > 0 ? (metrics.totalProfit / metrics.subtotal) * 100 : 0;
  const marginColor = metrics.totalProfit < 0 ? 'text-red-600' : profitPct < 5 ? 'text-amber-600' : 'text-emerald-600';
  const barColor = metrics.totalProfit < 0 ? 'bg-red-500' : profitPct < 5 ? 'bg-amber-500' : 'bg-emerald-500';

  function newItem() {
    return {
      id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
      description: '',
      category: '',
      quantity: 1,
      unit: 'unit',
      unitPrice: 0,
    };
  }
  function handleSelect(id: string, checked: boolean) {
    setSelected(checked ? [...selected, id] : selected.filter((s: string) => s !== id));
  }
  function handleDeleteSelected() {
    if (!quote) return;
    updateQuoteItems(quote.id, quote.items.filter(it => !selected.includes(it.id)));
    setSelected([]);
  }
  function handleCopySelected() {
    if (!quote) return;
    const toCopy = quote.items.filter(it => selected.includes(it.id));
    const copies = toCopy.map(it => ({ ...it, id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) }));
    updateQuoteItems(quote.id, [...quote.items, ...copies]);
    setSelected([]);
  }


  // Group items by category
  const itemsByCategory: { [cat: string]: typeof quote.items } = {};
  for (const item of quote.items) {
    const cat = item.category?.trim() || 'Uncategorized';
    if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
    itemsByCategory[cat].push(item);
  }
  const allCategories = Object.keys(itemsByCategory);

  return (
    <div className="relative pb-8 h-[calc(100vh-80px)] overflow-y-auto bg-gray-50">
      {/* Editable Quote Title */}
      <div className="pt-8 pb-2 text-left">
        <input
          className="text-2xl font-bold bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none px-2 py-1 w-full text-left"
          value={quote.quoteNumber}
          onChange={e => updateQuote(quote.id, { quoteNumber: e.target.value })}
          placeholder="Quote Number"
        />
        {estimate && (
          <div className="text-sm text-gray-500 mt-1 pl-1 text-left">Based on estimate: <span className="font-medium text-gray-700">{estimate.name}</span></div>
        )}
      </div>
      <ExportModal quoteId={quoteId} open={open} onClose={() => setOpen(false)} />

      {/* Items grouped by category, modularized */}
      <div className="rounded-xl overflow-hidden shadow-sm bg-white">
        {allCategories.map(cat => (
          <CategoryGroup
            key={cat}
            category={cat}
            items={itemsByCategory[cat]}
            selected={selected}
            onSelect={(idOrIds, checked) => {
              // idOrIds can be a single id or comma-separated ids
              const ids = idOrIds.split(',');
              if (checked) {
                setSelected(Array.from(new Set([...selected, ...ids])));
              } else {
                        setSelected(selected.filter(id => !ids.includes(id)));
                      }
                    }}
                    open={openCategories[cat] !== false}
                    setOpen={open => setOpenCategories(o => ({ ...o, [cat]: open }))}
                    estimate={estimate}
                    updateQuoteItems={updateQuoteItems}
                    quote={quote}
                  />
                ))}
              </div>

              {/* Total calculation below categories */}
              <div className="mt-4 flex justify-end text-lg font-bold">
                <div>
                  Total: {allCategories.reduce((sum, cat) => {
                    return sum + itemsByCategory[cat].reduce((s, it) => {
                      let base = 0;
                      if (estimate) {
                        const estItem = estimate.items.find(ei => ei.id === it.id);
                        base = estItem ? estItem.costPerUnit : 0;
                      }
                      const markupType = it.markupType || 'percentage';
                      const markupValue = it.markupValue ?? 0;
                      let price = base;
                      if (markupType === 'percentage') {
                        price = base * (1 + markupValue / 100);
                      } else {
                        price = base + markupValue;
                      }
                      return s + it.quantity * price;
                    }, 0);
                  }, 0).toFixed(2)}
                </div>
              </div>
                

      {/* Grouped action bar below table */}
      <QuoteActionBar
        quote={quote}
        selected={selected}
        onCopy={handleCopySelected}
        onDelete={handleDeleteSelected}
        onClear={() => { updateQuoteItems(quote.id, []); setSelected([]); }}
      />


      {/* Notes and Terms section */}
      <QuoteNotesTerms quote={quote} updateQuote={updateQuote} />


      {/* Overview section */}
      <QuoteOverview quote={quote} estimate={estimate} />

      {/* Bottom action bar: Export Quote and Save */}
  <div className="flex justify-end gap-3 mt-10">
        <button
          className="px-4 py-2 rounded border bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <FileDown size={16} /> Export Quote
        </button>
        <button
          className="px-4 py-2 rounded border bg-emerald-600 text-white font-semibold flex items-center gap-2 hover:bg-emerald-700"
          onClick={() => {
            updateQuote(quote.id, { ...quote });
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 1800);
          }}
        >
          Save
        </button>
      {/* Save notification */}
      {showSaved && (
        <div className="fixed bottom-8 right-8 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          Quote saved!
        </div>
      )}
      </div>
    </div>
  );
}
