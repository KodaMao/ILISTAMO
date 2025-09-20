"use client";
import { useState } from 'react';
import { ClientDashboard } from './ClientDashboard';
import { NewProjectModal } from '@/components/modals/NewProjectModal';
import { Plus } from 'lucide-react';

export function DashboardClientShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Your projects</div>
        <button className="px-3 py-1 rounded bg-blue-600 text-white inline-flex items-center gap-1" onClick={() => setOpen(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>
      <ClientDashboard />
      <NewProjectModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
