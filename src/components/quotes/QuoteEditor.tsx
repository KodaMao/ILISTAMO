"use client";
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { computeQuoteMetrics } from '@/lib/calculations';
import { ExportModal } from '@/components/export/ExportModal';
import { FileDown, Plus, Trash2 } from 'lucide-react';

export function QuoteEditor({ quoteId }: { quoteId: string }) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="grid grid-cols-1 gap-4">
      <ExportModal quoteId={quoteId} open={open} onClose={() => setOpen(false)} />

      {/* Analytics on top */}
      <div className="border rounded p-3">
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
          <label className="text-sm">
            Markup %
            <input className="w-full border px-2 py-1 rounded" type="number" min={0} step={0.1} value={quote.markupPercent || 0} onChange={(e) => updateQuote(quote.id, { markupPercent: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      {/* Items grouped by category */}
      <div className="border rounded p-3">
        <h3 className="font-medium mb-2">Items</h3>
        {(() => {
          // Group items by category
          const itemsByCat: Record<string, typeof quote.items> = {};
          quote.items.forEach((it) => {
            const cat = it.category?.trim() || "Items";
            if (!itemsByCat[cat]) itemsByCat[cat] = [];
            itemsByCat[cat].push(it);
          });
          return Object.entries(itemsByCat).map(([cat, items]) => {
            const subtotal = items.reduce((sum, it) => {
              const effectiveUnit = it.unitPrice * (1 + (quote.markupPercent || 0) / 100);
              return sum + it.quantity * effectiveUnit;
            }, 0);
            return (
              <div key={cat} className="mb-6">
                <div className="font-semibold text-base mb-2 mt-2 text-center">{cat}</div>
                <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600 mb-1">
                  <div className="col-span-2 flex items-center">Description</div>
                  <div className="flex items-center">Unit</div>
                  <div className="flex items-center">Qty</div>
                  <div className="flex items-center">Base / Marked Unit</div>
                  <div className="flex items-center justify-end">Line Total</div>
                  <div className="flex items-center justify-end">Actions</div>
                </div>
                {items.map((it, idx) => {
                  const effectiveUnit = it.unitPrice * (1 + (quote.markupPercent || 0) / 100);
                  const globalIdx = quote.items.findIndex(qi => qi.id === it.id);
                  return (
                    <div key={it.id} className="grid grid-cols-7 gap-2 items-center mb-2 min-h-[40px]">
                      <input className="col-span-2 border px-2 py-1 rounded" value={it.description} onChange={(e) => { const items = [...quote.items]; items[globalIdx] = { ...it, description: e.target.value }; updateQuoteItems(quote.id, items); }} />
                      <input
                        className="border px-2 py-1 rounded"
                        value={it.unit}
                        placeholder="Unit"
                        onChange={e => {
                          const items = [...quote.items];
                          items[globalIdx] = { ...it, unit: e.target.value };
                          updateQuoteItems(quote.id, items);
                        }}
                      />
                      <input
                        className="border px-2 py-1 rounded"
                        type="number"
                        min={0}
                        step={1}
                        value={it.quantity}
                        onChange={e => {
                          const items = [...quote.items];
                          items[globalIdx] = { ...it, quantity: Number(e.target.value) };
                          updateQuoteItems(quote.id, items);
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <input className="w-full border px-2 py-1 rounded" type="number" min={0} step={0.01} value={it.unitPrice} onChange={(e) => { const items = [...quote.items]; items[globalIdx] = { ...it, unitPrice: Number(e.target.value) }; updateQuoteItems(quote.id, items); }} />
                        <span className="text-xs text-gray-600 whitespace-nowrap">= {fmt.format(effectiveUnit)}</span>
                      </div>
                      <div className="text-right tabular-nums">{fmt.format(it.quantity * effectiveUnit)}</div>
                      <div className="flex justify-end items-center h-full">
                        <button
                          className="p-1 rounded-full border border-transparent hover:border-red-200 hover:bg-red-50 text-red-600 flex items-center justify-center"
                          style={{ width: 28, height: 28 }}
                          title="Delete item"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              const items = quote.items.filter((_, i) => i !== globalIdx);
                              updateQuoteItems(quote.id, items);
                            }
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm font-medium">
                    <span className="mr-2">{cat} Subtotal:</span>
                    <span className="tabular-nums">{fmt.format(subtotal)}</span>
                  </div>
                  <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={() => {
                    const items = [...quote.items, { ...newItem(), category: cat }];
                    updateQuoteItems(quote.id, items);
                  }}>
                    <Plus size={16} /> Add item
                  </button>
                </div>
              </div>
            );
          });
        })()}
        <div className="mt-2 flex justify-between items-center">
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={() => {
            const items = [...quote.items, newItem()];
            updateQuoteItems(quote.id, items);
          }}>
            <Plus size={16} /> Add item
          </button>
          <div className="text-sm font-medium">Current Total: {fmt.format(quote.items.reduce((s, it) => {
            const up = it.unitPrice * (1 + (quote.markupPercent || 0) / 100);
            return s + it.quantity * up;
          }, 0))}</div>
        </div>
        <div className="mt-4 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{fmt.format(metrics.totalAmount)}</span></div>
          <div className="flex justify-between"><span>Discount {quote.discountType === 'percentage' ? `(${quote.discount}%)` : ''}</span><span className="tabular-nums">- {fmt.format(metrics.discountAmount)}</span></div>
          <div className="flex justify-between"><span>Tax ({quote.taxRate}%)</span><span className="tabular-nums">{fmt.format(metrics.taxAmount)}</span></div>
          <div className="flex justify-between font-semibold text-base mt-1"><span>Total</span><span className="tabular-nums">{fmt.format(metrics.grandTotal)}</span></div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      <div className="flex justify-end">
        <button className="mt-2 px-3 py-1 rounded bg-blue-600 text-white inline-flex items-center gap-1" onClick={() => setOpen(true)}>
          <FileDown size={16} /> ExportaMo
        </button>
      </div>
    </div>
  );
}
