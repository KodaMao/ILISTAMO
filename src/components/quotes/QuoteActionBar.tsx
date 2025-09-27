import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Quote } from '@/types';


interface QuoteActionBarProps {
  quote: Quote;
  selected: string[];
  onAdd?: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onClear: () => void;
}


export const QuoteActionBar: React.FC<QuoteActionBarProps> = ({ quote, selected, onAdd, onCopy, onDelete, onClear }) => (
  <div className="mt-8 flex flex-wrap gap-6 justify-center items-center bg-white rounded-xl shadow-sm p-4">
    <div className="flex gap-2">
      {onAdd && (
        <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={onAdd}>
          <Plus size={16} /> Add Item
        </button>
      )}
      <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50" disabled={selected.length === 0} onClick={onCopy}>
        <Copy size={16} /> Copy Item{selected.length > 1 ? 's' : ''}
      </button>
      <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-red-50 text-red-600 disabled:opacity-50" disabled={selected.length === 0} onClick={onDelete}>
        <Trash2 size={16} /> Delete Selected
      </button>
      <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-red-100 text-red-700 disabled:opacity-50" disabled={quote.items.length === 0} onClick={onClear}>
        <Trash2 size={16} /> Clear All
      </button>
    </div>
    <div className="w-px h-8 bg-gray-200 mx-2" />
  </div>
);
