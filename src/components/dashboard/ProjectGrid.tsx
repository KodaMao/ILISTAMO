import Link from 'next/link';
import type { Client, Estimate, Project, Quote } from '@/types';
import { FolderKanban } from 'lucide-react';

export function ProjectGrid({ projects, quotes, clients, estimates }: { projects: Project[]; quotes: Quote[]; clients?: Client[]; estimates?: Estimate[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Link key={p.id} href={`/projects/${p.id}`} className="border rounded p-4 hover:shadow transition-shadow">
          <div className="flex items-center gap-2 font-medium"><FolderKanban size={18} /> {p.name}</div>
          <div className="text-sm text-gray-500 mt-0.5">Client: {clients?.find(c => c.id === p.clientId)?.name || p.clientId}</div>
          <div className="mt-2 text-xs">
            {renderStatusBadge(p, quotes, estimates)}
          </div>
        </Link>
      ))}
    </div>
  );
}

function renderStatusBadge(project: Project, quotes: Quote[], estimates?: Estimate[]) {
  const estIds = estimates?.filter(e => e.projectId === project.id).map(e => e.id) || [];
  const q = quotes.find(q => estIds.includes(q.estimateId));
  const status = q?.status || 'draft';
  const classes = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  } as const;
  return <span className={`px-2 py-0.5 rounded font-medium ${classes[status]}`}>{status}</span>;
}
