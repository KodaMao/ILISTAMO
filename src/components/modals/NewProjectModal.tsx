"use client";
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { FolderKanban, X, Check } from 'lucide-react';

export function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { clients, addClient, addProject, initialized, init, settings } = useStore();
  const [clientId, setClientId] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [newClientName, setNewClientName] = useState('');


          </div>
        ) : null}
        <div className="mb-3">
          <button
  return null;
            className="px-3 py-2 rounded bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 w-full"
