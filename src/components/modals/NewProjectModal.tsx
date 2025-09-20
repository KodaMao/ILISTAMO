"use client";
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { FolderKanban, X, Check } from 'lucide-react';

export function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { clients, addClient, addProject, initialized, init } = useStore();
  const [clientId, setClientId] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [newClientName, setNewClientName] = useState('');

  useEffect(() => {
    if (!initialized) void init();
  }, [initialized, init]);

  const canSubmit = useMemo(() => {
    const hasClient = clientId || newClientName.trim().length > 0;
    return hasClient && projectName.trim().length > 0;
  }, [clientId, newClientName, projectName]);

  if (!open) return null;

  async function handleCreate() {
    let useClientId = clientId;
    if (!useClientId) {
      useClientId = addClient({ name: newClientName.trim() });
    }
    const id = addProject({ clientId: useClientId, name: projectName.trim(), description: projectDesc });
    onClose();
    router.push(`/projects/${id}`);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow max-w-lg w-full">
        <div className="font-medium mb-2 inline-flex items-center gap-2"><FolderKanban size={18} /> New Project</div>
        {clients.length > 0 ? (
          <div className="mb-3">
            <label className="block text-sm mb-1">Client</label>
            <select className="w-full border px-2 py-1 rounded" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Select existing client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">Or add a new client name below.</div>
          </div>
        ) : null}
        <div className="mb-3">
          <label className="block text-sm mb-1">New Client Name</label>
          <input className="w-full border px-2 py-1 rounded" placeholder="Client name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Project Name</label>
          <input className="w-full border px-2 py-1 rounded" placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Description (optional)</label>
          <textarea className="w-full border px-2 py-1 rounded" rows={3} value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={onClose}><X size={16} /> Cancel</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50 inline-flex items-center gap-1" disabled={!canSubmit} onClick={handleCreate}><Check size={16} /> Create Project</button>
        </div>
      </div>
    </div>
  );
}
