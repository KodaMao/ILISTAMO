'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Trash2 } from 'lucide-react';
import { AddClientModal } from './AddClientModal';

export function ClientTable() {
  const { clients, deleteClient } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div>
      <button className="mb-4 px-4 py-2 rounded bg-blue-600 text-white inline-flex items-center gap-2" onClick={() => setModalOpen(true)}>
        <Plus size={18} /> Add Client
      </button>
      <AddClientModal open={modalOpen} onClose={() => setModalOpen(false)} />
  <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Company</th>
            <th className="py-2">Contact</th>
            <th className="py-2">Email</th>
            <th className="py-2">Address</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td className="py-2">{c.company || ''}</td>
              <td className="py-2">{c.contact || ''}</td>
              <td className="py-2">{c.email || ''}</td>
              <td className="py-2">{c.address || ''}</td>
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
