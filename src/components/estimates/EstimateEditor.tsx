'use client';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import type { EstimateItem } from '@/types';
import { FilePlus2, Plus, Trash2 } from 'lucide-react';

export function EstimateEditor({ estimateId }: { estimateId: string }) {
  const router = useRouter();
  const estimate = useStore((s) => s.estimates.find((e) => e.id === estimateId));
  const updateEstimateItems = useStore((s) => s.updateEstimateItems);
  const createQuoteFromEstimate = useStore((s) => s.createQuoteFromEstimate);
  if (!estimate) return <div className="text-red-600">Estimate not found</div>;
  const setItems = (items: EstimateItem[]) => updateEstimateItems(estimateId, items);
  function newItem(): EstimateItem {
    return {
      id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
      description: '',
      category: '',
      quantity: 1,
      unit: 'unit',
      costPerUnit: 0,
    };
  }
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button className="px-3 py-1 rounded bg-blue-600 text-white inline-flex items-center gap-1" onClick={() => {
          const id = createQuoteFromEstimate(estimateId) as string | null;
          if (id) router.push(`/quotes/${id}`);
        }}><FilePlus2 size={16} /> Create Quote from Estimate</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Description</th>
            <th className="py-2">Category</th>
            <th className="py-2">Qty</th>
            <th className="py-2">Unit</th>
            <th className="py-2">Cost/Unit</th>
            <th className="py-2 text-right">Line Total</th>
            <th className="py-2 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {estimate.items.map((it, idx) => (
            <tr key={it.id} className="border-b">
              <td><input className="w-full border px-2 py-1 rounded" value={it.description} onChange={(e) => { const items = [...estimate.items]; items[idx] = { ...it, description: e.target.value }; setItems(items); }} /></td>
              <td><input className="w-full border px-2 py-1 rounded" value={it.category} onChange={(e) => { const items = [...estimate.items]; items[idx] = { ...it, category: e.target.value }; setItems(items); }} /></td>
              <td><input className="w-full border px-2 py-1 rounded" type="number" min={0} step={1} value={it.quantity} onChange={(e) => { const items = [...estimate.items]; items[idx] = { ...it, quantity: Number(e.target.value) }; setItems(items); }} /></td>
              <td><input className="w-full border px-2 py-1 rounded" value={it.unit} onChange={(e) => { const items = [...estimate.items]; items[idx] = { ...it, unit: e.target.value }; setItems(items); }} /></td>
              <td><input className="w-full border px-2 py-1 rounded" type="number" min={0} step={0.01} value={it.costPerUnit} onChange={(e) => { const items = [...estimate.items]; items[idx] = { ...it, costPerUnit: Number(e.target.value) }; setItems(items); }} /></td>
              <td className="text-right tabular-nums">{(it.quantity * it.costPerUnit).toFixed(2)}</td>
              <td className="text-right">
                <button className="px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-red-50 text-red-600" onClick={() => {
                  const items = estimate.items.filter((_, i) => i !== idx);
                  setItems(items);
                }}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex justify-end text-sm font-medium">
        <div>
          Subtotal: {estimate.items.reduce((sum, it) => sum + it.quantity * it.costPerUnit, 0).toFixed(2)}
        </div>
      </div>
      <div className="mt-3">
        <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={() => {
          const items = [...estimate.items, newItem()];
          setItems(items);
        }}>
          <Plus size={16} /> Add item
        </button>
      </div>
    </div>
  );
}
