'use client';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import type { EstimateItem } from '@/types';
import { FilePlus2, Plus, Trash2, Copy, ChevronDown, ChevronRight } from 'lucide-react';

export function EstimateEditor({ estimateId }: { estimateId: string }) {
  const router = useRouter();
  const estimate = useStore((s) => s.estimates.find((e) => e.id === estimateId));
  const updateEstimateItems = useStore((s) => s.updateEstimateItems);
  const updateEstimate = useStore((s) => s.updateEstimate);
  const createQuoteFromEstimate = useStore((s) => s.createQuoteFromEstimate);
  const [selected, setSelected] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<{[cat: string]: boolean}>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (showSaved) {
      const t = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showSaved]);
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
  function handleSelect(id: string, checked: boolean) {
    setSelected(checked ? [...selected, id] : selected.filter((s: string) => s !== id));
  }
  function handleSelectAll(checked: boolean) {
    if (!estimate) return;
    setSelected(checked ? estimate.items.map(it => it.id) : []);
  }
  function handleDeleteSelected() {
    if (!estimate) return;
    setItems(estimate.items.filter(it => !selected.includes(it.id)));
    setSelected([]);
  }
  function handleCopySelected() {
    if (!estimate) return;
    const toCopy = estimate.items.filter(it => selected.includes(it.id));
    const copies = toCopy.map(it => ({ ...it, id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) }));
    setItems([...estimate.items, ...copies]);
    setSelected([]);
  }
  const itemsByCategory: {[cat: string]: EstimateItem[]} = {};
  for (const item of estimate.items) {
    const cat = item.category?.trim() || 'Uncategorized';
    if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
    itemsByCategory[cat].push(item);
  }
  const allCategories = Object.keys(itemsByCategory);

  return (
    <div className="relative pb-8 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="mb-4">
        <input
          className="border px-2 py-1 rounded text-lg font-semibold w-full max-w-md"
          value={estimate.name}
          onChange={e => updateEstimate(estimateId, { name: e.target.value })}
          placeholder="Estimate Title"
        />
      </div>
  <div className="rounded overflow-hidden">
        {/* Category groups */}
        {allCategories.map(cat => {
          const catSubtotal = itemsByCategory[cat].reduce((sum, it) => sum + it.quantity * it.costPerUnit, 0);
          return (
            <div key={cat} className="my-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <button
                className="w-full text-left bg-gray-50 px-4 py-2 flex items-center gap-2 font-semibold border-b"
                onClick={() => setOpenCategories(o => ({ ...o, [cat]: !o[cat] }))}
              >
                {openCategories[cat] !== false ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {cat} <span className="ml-2 text-xs text-gray-500">({itemsByCategory[cat].length})</span>
              </button>
              {openCategories[cat] !== false && (
                <div>
                  {/* Column headers for alignment */}
                  <div className="flex items-center gap-2 px-1 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-600">
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {/* Select all in this category */}
                          <input
                            type="checkbox"
                            checked={itemsByCategory[cat].every(it => selected.includes(it.id)) && itemsByCategory[cat].length > 0}
                            indeterminate={itemsByCategory[cat].some(it => selected.includes(it.id)) && !itemsByCategory[cat].every(it => selected.includes(it.id))}
                            onChange={e => {
                              const checked = e.target.checked;
                              const ids = itemsByCategory[cat].map(it => it.id);
                              setSelected(checked
                                ? Array.from(new Set([...selected, ...ids]))
                                : selected.filter(id => !ids.includes(id))
                              );
                            }}
                          />
                        </div>
                    <div className="flex-1 px-1">Description</div>
                    <div className="w-24 px-1">Qty</div>
                    <div className="w-24 px-1">Unit</div>
                    <div className="w-32 px-1">Cost/Unit</div>
                    <div className="w-32 px-1 text-right">Line Total</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {itemsByCategory[cat].map((it, idx) => {
                      // Find the global index for selection
                      const globalIdx = estimate.items.findIndex(ei => ei.id === it.id);
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
                            <input className="w-full border px-2 py-1 rounded" value={it.description} onChange={(e) => { const items = [...estimate.items]; items[globalIdx] = { ...it, description: e.target.value }; setItems(items); }} placeholder="Description" />
                          </div>
                          <div className="w-24 px-1">
                            <input className="w-full border px-2 py-1 rounded" type="number" min={0} step={1} value={it.quantity} onChange={(e) => { const items = [...estimate.items]; items[globalIdx] = { ...it, quantity: Number(e.target.value) }; setItems(items); }} placeholder="Qty" />
                          </div>
                          <div className="w-24 px-1">
                            <input className="w-full border px-2 py-1 rounded" value={it.unit} onChange={(e) => { const items = [...estimate.items]; items[globalIdx] = { ...it, unit: e.target.value }; setItems(items); }} placeholder="Unit" />
                          </div>
                          <div className="w-32 px-1">
                            <input className="w-full border px-2 py-1 rounded" type="number" min={0} step={0.01} value={it.costPerUnit} onChange={(e) => { const items = [...estimate.items]; items[globalIdx] = { ...it, costPerUnit: Number(e.target.value) }; setItems(items); }} placeholder="Cost/Unit" />
                          </div>
                          <div className="w-32 px-1 text-right tabular-nums">
                            {(it.quantity * it.costPerUnit).toFixed(2)}
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
      <div className="mt-2 flex justify-end text-lg font-bold">
        <div>
          Total: {allCategories.reduce((sum, cat) => sum + itemsByCategory[cat].reduce((s, it) => s + it.quantity * it.costPerUnit, 0), 0).toFixed(2)}
        </div>
      </div>
      {/* Grouped action bar below table */}
      <div className="mt-6 flex flex-wrap gap-6 justify-center items-center">
        {/* Item actions */}
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={() => {
            const items = [...estimate.items, newItem()];
            setItems(items);
          }}>
            <Plus size={16} /> Add Item
          </button>
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50" disabled={selected.length === 0} onClick={handleCopySelected}>
            <Copy size={16} /> Copy Item{selected.length > 1 ? 's' : ''}
          </button>
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-red-50 text-red-600 disabled:opacity-50" disabled={selected.length === 0} onClick={handleDeleteSelected}>
            <Trash2 size={16} /> Delete Selected
          </button>
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-red-100 text-red-700 disabled:opacity-50" disabled={estimate.items.length === 0} onClick={() => { setItems([]); setSelected([]); }}>
            <Trash2 size={16} /> Clear All
          </button>
        </div>
        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-2" />
        {/* Category actions */}
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-blue-50 text-blue-700" onClick={() => setShowCategoryModal(true)}>
            + Add Category
          </button>
        </div>
        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-2" />
        {/* Estimate actions */}
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-green-600 text-white inline-flex items-center gap-1" onClick={() => {
            updateEstimate(estimateId, { ...estimate });
            setShowSaved(true);
          }}>Save</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white inline-flex items-center gap-1" onClick={() => {
            const id = createQuoteFromEstimate(estimateId) as string | null;
            if (id) router.push(`/quotes/${id}`);
          }}><FilePlus2 size={16} /> Create Quote from Estimate</button>
        </div>
        {showSaved && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded shadow-lg z-50 transition-all">Estimate saved!</div>
        )}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-xs">
              <h2 className="text-lg font-bold mb-4">Add Category</h2>
              <input
                className="border rounded px-2 py-1 w-full mb-4"
                placeholder="Category name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button className="px-3 py-1 rounded bg-gray-200" onClick={() => { setShowCategoryModal(false); setNewCategoryName(""); }}>Cancel</button>
                <button className="px-3 py-1 rounded bg-blue-600 text-white" disabled={!newCategoryName.trim()} onClick={() => {
                  const cat = newCategoryName.trim();
                  if (cat) {
                    const items = [...estimate.items, { ...newItem(), category: cat }];
                    setItems(items);
                  }
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                }}>Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EstimateEditor;
