import React from 'react';
import { QuoteItem, Estimate, Quote } from '@/types';

interface QuoteItemRowProps {
  item: QuoteItem;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  estimate?: Estimate;
  updateQuoteItems: (quoteId: string, items: QuoteItem[]) => void;
  quote: Quote;
}

export const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
  item,
  selected,
  onSelect,
  estimate,
  updateQuoteItems,
  quote,
}) => {
  const globalIdx = quote.items.findIndex(qi => qi.id === item.id);
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex-shrink-0 w-8 flex justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(item.id, e.target.checked)}
        />
      </div>
      <div className="flex-1 px-1">
        <input
          className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-200"
          value={item.description}
          onChange={e => {
            const items = [...quote.items];
            items[globalIdx] = { ...item, description: e.target.value };
            updateQuoteItems(quote.id, items);
          }}
          placeholder="Description"
        />
      </div>
      <div className="w-24 px-1">
        <input
          className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-200"
          type="number"
          min={0}
          step={1}
          value={item.quantity}
          onChange={e => {
            const items = [...quote.items];
            items[globalIdx] = { ...item, quantity: Number(e.target.value) };
            updateQuoteItems(quote.id, items);
          }}
          placeholder="Qty"
        />
      </div>
      <div className="w-24 px-1">
        <input
          className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-200"
          value={item.unit}
          onChange={e => {
            const items = [...quote.items];
            items[globalIdx] = { ...item, unit: e.target.value };
            updateQuoteItems(quote.id, items);
          }}
          placeholder="Unit"
        />
      </div>
      <div className="w-32 px-1">
        {/* Original Unit Price from estimate, if available */}
        <div className="flex items-center gap-1">
          <span>
            {(() => {
              if (!estimate) return '-';
              const estItem = estimate.items.find(ei => ei.id === item.id);
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
            value={item.markupType || 'percentage'}
            onChange={e => {
              const items = [...quote.items];
              items[globalIdx] = { ...item, markupType: e.target.value as 'percentage' | 'amount' };
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
            value={item.markupValue ?? 0}
            onChange={e => {
              const items = [...quote.items];
              items[globalIdx] = { ...item, markupValue: Number(e.target.value) };
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
                const estItem = estimate.items.find(ei => ei.id === item.id);
                base = estItem ? estItem.costPerUnit : 0;
              }
              const markupType = item.markupType || 'percentage';
              const markupValue = item.markupValue ?? 0;
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
            const estItem = estimate.items.find(ei => ei.id === item.id);
            base = estItem ? estItem.costPerUnit : 0;
          }
          const markupType = item.markupType || 'percentage';
          const markupValue = item.markupValue ?? 0;
          let price = base;
          if (markupType === 'percentage') {
            price = base * (1 + markupValue / 100);
          } else {
            price = base + markupValue;
          }
          return (item.quantity * price).toFixed(2);
        })()}
      </div>
    </div>
  );
};
