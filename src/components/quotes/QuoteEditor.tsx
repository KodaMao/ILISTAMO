"use client";
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { computeQuoteMetrics } from '@/lib/calculations';
import { ExportModal } from '@/components/export/ExportModal';
import { FileDown, Plus, Trash2, Copy, ChevronDown, ChevronRight } from 'lucide-react';


export function QuoteEditor({ quoteId }: { quoteId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<{[cat: string]: boolean}>({});
  const [showSaved, setShowSaved] = useState(false);
  const quote = useStore((s) => s.quotes.find((q) => q.id === quoteId));
  const estimate = useStore((s) => (quote ? s.estimates.find((e) => e.id === quote.estimateId) : undefined));
  const updateQuote = useStore((s) => s.updateQuote);
  const updateQuoteItems = useStore((s) => s.updateQuoteItems);
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
  const itemsByCategory: {[cat: string]: typeof quote.items} = {};
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





      {/* Items grouped by category, matching EstimateEditor */}
  <div className="rounded-xl overflow-hidden shadow-sm bg-white">
        {allCategories.map(cat => {
          const catSubtotal = itemsByCategory[cat].reduce((sum, it) => {
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
            return sum + it.quantity * price;
          }, 0);
          return (
            <div key={cat} className="my-8 rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden transition-shadow hover:shadow-lg">
              <button
                className="w-full text-left bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 flex items-center gap-2 font-semibold border-b hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                onClick={() => setOpenCategories(o => ({ ...o, [cat]: !o[cat] }))}
              >
                {openCategories[cat] !== false ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {cat} <span className="ml-2 text-xs text-gray-500">({itemsByCategory[cat].length})</span>
              </button>
              {openCategories[cat] !== false && (
                <div>
                  {/* Column headers for alignment */}
                  <div className="flex items-center gap-2 px-2 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-600">
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {/* Select all in this category */}
                          <input
                            type="checkbox"
                            checked={itemsByCategory[cat].every(it => selected.includes(it.id)) && itemsByCategory[cat].length > 0}
                            onChange={e => {
                              const checked = e.target.checked;
                              const ids = itemsByCategory[cat].map(it => it.id);
                              setSelected(checked
                                ? Array.from(new Set([...selected, ...ids]))
                                : selected.filter(id => !ids.includes(id))
                              );
                            }}
                            className="accent-blue-600"
                          />
                        </div>
                    <div className="flex-1 px-1">Description</div>
                    <div className="w-24 px-1">Qty</div>
                    <div className="w-24 px-1">Unit</div>
                    <div className="w-32 px-1">Original Unit Price</div>
                    <div className="w-32 px-1">Markup</div>
                    <div className="w-32 px-1">Markup Price</div>
                    <div className="w-32 px-1 text-right">Line Total</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {itemsByCategory[cat].map((it, idx) => {
                      // Find the global index for selection
                      const globalIdx = quote.items.findIndex(qi => qi.id === it.id);
                      return (
                        <div key={it.id} className="flex items-center gap-2 py-2">
                          <div className="flex-shrink-0 w-8 flex justify-center">
                            <input
                              type="checkbox"
                              checked={selected.includes(it.id)}
                              onChange={e => handleSelect(it.id, e.target.checked)}
                            />
                          </div>
                          <div className="flex-1 px-1">
                            <input className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-200" value={it.description} onChange={(e) => { const items = [...quote.items]; items[globalIdx] = { ...it, description: e.target.value }; updateQuoteItems(quote.id, items); }} placeholder="Description" />
                          </div>
                          <div className="w-24 px-1">
                            <input className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-200" type="number" min={0} step={1} value={it.quantity} onChange={(e) => { const items = [...quote.items]; items[globalIdx] = { ...it, quantity: Number(e.target.value) }; updateQuoteItems(quote.id, items); }} placeholder="Qty" />
                          </div>
                          <div className="w-24 px-1">
                            <input className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-200" value={it.unit} onChange={(e) => { const items = [...quote.items]; items[globalIdx] = { ...it, unit: e.target.value }; updateQuoteItems(quote.id, items); }} placeholder="Unit" />
                          </div>
                          <div className="w-32 px-1">
                            {/* Original Unit Price from estimate, if available */}
                            <div className="flex items-center gap-1">
                              <span>
                                {(() => {
                                  if (!estimate) return '-';
                                  const estItem = estimate.items.find(ei => ei.id === it.id);
                                  return estItem ? estItem.costPerUnit.toFixed(2) : '-';
                                })()}
                              </span>
                            </div>
                          </div>
                          <div className="w-32 px-1">
                            {/* Markup controls per item */}
                            <div className="flex gap-1 items-center">
                              <select
                                className="border rounded px-1 py-1 text-xs focus:ring-2 focus:ring-blue-200"
                                value={it.markupType || 'percentage'}
                                onChange={e => {
                                  const items = [...quote.items];
                                  items[globalIdx] = { ...it, markupType: e.target.value as 'percentage' | 'amount' };
                                  updateQuoteItems(quote.id, items);
                                }}
                              >
                                <option value="percentage">%</option>
                                <option value="amount">Value</option>
                              </select>
                              <input
                                className="w-16 border px-1 py-1 rounded text-xs focus:ring-2 focus:ring-blue-200"
                                type="number"
                                min={0}
                                step={0.01}
                                value={it.markupValue ?? 0}
                                onChange={e => {
                                  const items = [...quote.items];
                                  items[globalIdx] = { ...it, markupValue: Number(e.target.value) };
                                  updateQuoteItems(quote.id, items);
                                }}
                                placeholder="Markup"
                              />
                            </div>
                          </div>
                          <div className="w-32 px-1">
                            {/* Markup Price (calculated) */}
                            <div className="flex items-center gap-1">
                              <span>
                                {(() => {
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
                                  return price.toFixed(2);
                                })()}
                              </span>
                            </div>
                          </div>
                          <div className="w-32 px-1 text-right tabular-nums">
                            {(() => {
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
                              return (it.quantity * price).toFixed(2);
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-t">
                    Subtotal: {catSubtotal.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
  <div className="mt-8 flex flex-wrap gap-6 justify-center items-center bg-white rounded-xl shadow-sm p-4">
        {/* Item actions */}
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={() => {
            const items = [...quote.items, newItem()];
            updateQuoteItems(quote.id, items);
          }}>
            <Plus size={16} /> Add Item
          </button>
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50" disabled={selected.length === 0} onClick={handleCopySelected}>
            <Copy size={16} /> Copy Item{selected.length > 1 ? 's' : ''}
          </button>
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-red-50 text-red-600 disabled:opacity-50" disabled={selected.length === 0} onClick={handleDeleteSelected}>
            <Trash2 size={16} /> Delete Selected
          </button>
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-red-100 text-red-700 disabled:opacity-50" disabled={quote.items.length === 0} onClick={() => { updateQuoteItems(quote.id, []); setSelected([]); }}>
            <Trash2 size={16} /> Clear All
          </button>
        </div>
        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-2" />
        {/* ...existing code... */}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">Notes</h3>
          <textarea className="w-full border rounded px-2 py-1 min-h-24" value={quote.notes} onChange={(e) => updateQuote(quote.id, { notes: e.target.value })} />
        </div>
        <div className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Terms</h3>
            <select
              className="border rounded px-2 py-1 text-sm"
              onChange={(e) => updateQuote(quote.id, { terms: e.target.value })}
              value="__custom__"
            >
              <option value="__custom__">Predefined terms…</option>
              <option value="Payment due within 15 days. Late payments may incur a fee.">Net 15</option>
              <option value="Payment due within 30 days. Thank you for your business.">Net 30</option>
              <option value="50% upfront. Balance due upon completion.">50% upfront</option>
              <option value="This quote is valid for 30 days from the date above.">Validity 30 days</option>
            </select>
          </div>
          <textarea className="w-full border rounded px-2 py-1 min-h-24" value={quote.terms || ''} onChange={(e) => updateQuote(quote.id, { terms: e.target.value })} />
        </div>
      </div>

        <div className="border rounded-xl p-6 mt-10 bg-white shadow-sm">
        <h3 className="font-medium mb-3">Overview</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 rounded border">
            <div className="text-gray-600">Total Amount</div>
            <div className="font-semibold tabular-nums">{fmt.format(metrics.totalAmount)}</div>
          </div>
          <div className="p-2 rounded border">
            <div className="text-gray-600">Discount</div>
            <div className="font-semibold tabular-nums">{fmt.format(metrics.discountAmount)}</div>
          </div>
          <div className="p-2 rounded border">
            <div className="text-gray-600">Subtotal</div>
            <div className="font-semibold tabular-nums">{fmt.format(metrics.subtotal)}</div>
          </div>
          <div className="p-2 rounded border">
            <div className="text-gray-600">Tax</div>
            <div className="font-semibold tabular-nums">{fmt.format(metrics.taxAmount)}</div>
          </div>
          <div className="p-2 rounded border col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">Grand Total</div>
              <div className="font-semibold tabular-nums">{fmt.format(metrics.grandTotal)}</div>
            </div>
          </div>
          <div className="p-2 rounded border">
            <div className="text-gray-600">Cost (from estimate)</div>
            <div className="font-semibold tabular-nums">{fmt.format(metrics.totalCost)}</div>
          </div>
          <div className="p-2 rounded border">
            <div className="text-gray-600">Profit (excl. tax)</div>
            <div className={`font-semibold tabular-nums ${marginColor}`}>{fmt.format(metrics.totalProfit)}</div>
            <div className={`text-xs ${marginColor}`}>{profitPct.toFixed(1)}%</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Margin</span>
            <span className="tabular-nums">{profitPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${Math.max(0, Math.min(100, profitPct))}%` }} />
          </div>
          {metrics.totalProfit < 0 && (
            <div className="mt-2 text-xs text-red-600">Warning: This quote is priced below estimated cost.</div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <label className="text-sm">
            Tax %
            <input className="w-full border px-2 py-1 rounded" type="number" min={0} step={0.01} value={quote.taxRate} onChange={(e) => updateQuote(quote.id, { taxRate: Number(e.target.value) })} />
          </label>
          <div className="grid grid-cols-3 gap-2 items-end col-span-2">
            <label className="text-sm col-span-2">
              Discount {quote.discountType === 'percentage' ? '(%)' : '(amount)'}
              <input className="w-full border px-2 py-1 rounded" type="number" min={0} step={0.01} value={quote.discount} onChange={(e) => updateQuote(quote.id, { discount: Number(e.target.value) })} />
            </label>
            <label className="text-sm">
              Type
              <select className="w-full border px-2 py-1 rounded" value={quote.discountType} onChange={(e) => updateQuote(quote.id, { discountType: e.target.value as 'amount' | 'percentage' })}>
                <option value="amount">Amount</option>
                <option value="percentage">Percent</option>
              </select>
            </label>
          </div>
        </div>
      </div>

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
