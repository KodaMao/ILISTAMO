import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { QuoteItemRow } from './QuoteItemRow';
import { Quote, Estimate, QuoteItem } from '@/types';

interface CategoryGroupProps {
  category: string;
  items: QuoteItem[];
  selected: string[];
  onSelect: (id: string, checked: boolean) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  estimate?: Estimate;
  updateQuoteItems: (quoteId: string, items: QuoteItem[]) => void;
  quote: Quote;
}

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  items,
  selected,
  onSelect,
  open,
  setOpen,
  estimate,
  updateQuoteItems,
  quote,
}) => {
  const catSubtotal = items.reduce((sum, it) => {
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
    <div className="my-8 rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <button
        className="w-full text-left bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 flex items-center gap-2 font-semibold border-b hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {category} <span className="ml-2 text-xs text-gray-500">({items.length})</span>
      </button>
      {open && (
        <div>
          {/* Column headers for alignment */}
          <div className="flex items-center gap-2 px-2 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-600">
            <div className="flex-shrink-0 w-8 flex justify-center">
              {/* Select all in this category */}
              <input
                type="checkbox"
                checked={items.every(it => selected.includes(it.id)) && items.length > 0}
                onChange={e => {
                  const checked = e.target.checked;
                  const ids = items.map(it => it.id);
                  if (checked) {
                    // Add all
                    onSelect(ids.join(','), true);
                  } else {
                    // Remove all
                    onSelect(ids.join(','), false);
                  }
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
            {items.map((it, idx) => (
              <QuoteItemRow
                key={it.id}
                item={it}
                selected={selected.includes(it.id)}
                onSelect={onSelect}
                estimate={estimate}
                updateQuoteItems={updateQuoteItems}
                quote={quote}
              />
            ))}
          </div>
          <div className="flex justify-between items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-t">
            <span>Subtotal: {catSubtotal.toFixed(2)}</span>
            <button
              className="px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50"
              onClick={() => {
                const items = [...quote.items, {
                  id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
                  description: '',
                  category,
                  quantity: 1,
                  unit: 'unit',
                  unitPrice: 0,
                }];
                updateQuoteItems(quote.id, items);
              }}
            >
              <Plus size={14} /> Add Item to {category}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
