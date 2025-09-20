'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Trash2 } from 'lucide-react';

export function ClientTable() {
  const { clients, addClient, deleteClient } = useStore();
  const [name, setName] = useState('');
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input className="border px-2 py-1 rounded flex-1" placeholder="New client name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="px-3 py-1 rounded bg-blue-600 text-white inline-flex items-center gap-1" onClick={() => { if (!name) return; addClient({ name }); setName(''); }}>
          <Plus size={16} /> Add
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td className="py-2">
                <button className="px-2 py-1 rounded border text-red-600 inline-flex items-center gap-1 hover:bg-red-50" onClick={() => deleteClient(c.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
