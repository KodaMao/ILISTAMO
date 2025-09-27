import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, X } from 'lucide-react';

export function AddClientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addClient } = useStore();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');

  const handleAdd = () => {
    if (!name) return;
  addClient({ name, contact, email, address, company });
  setName(''); setContact(''); setEmail(''); setAddress(''); setCompany('');
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold mb-4">Add New Client</h2>
        <div className="flex flex-col gap-3">
          <input className="border px-2 py-1 rounded" placeholder="Client name*" value={name} onChange={e => setName(e.target.value)} />
          <input className="border px-2 py-1 rounded" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
          <input className="border px-2 py-1 rounded" placeholder="Contact" value={contact} onChange={e => setContact(e.target.value)} />
          <input className="border px-2 py-1 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="border px-2 py-1 rounded" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <button className="mt-5 px-4 py-2 rounded bg-blue-600 text-white inline-flex items-center gap-2 w-full justify-center" onClick={handleAdd}>
          <Plus size={18} /> Add Client
        </button>
      </div>
    </div>
  );
}
