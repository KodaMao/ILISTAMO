import React from 'react';
import { Quote } from '@/types';

interface QuoteNotesTermsProps {
  quote: Quote;
  updateQuote: (id: string, changes: Partial<Quote>) => void;
}

export const QuoteNotesTerms: React.FC<QuoteNotesTermsProps> = ({ quote, updateQuote }) => (
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
);
