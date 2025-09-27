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

import { CheckCircle2, XCircle, Send, FileText } from 'lucide-react';

function renderStatusBadge(project: Project, quotes: Quote[], estimates?: Estimate[]) {
  const ests = estimates?.filter(e => e.projectId === project.id) || [];
  const estIds = ests.map(e => e.id);
  const q = quotes.find(q => estIds.includes(q.estimateId));
  let status: string;
  if (!ests.length) {
    status = 'noestimate';
  } else if (!q) {
    status = 'estimate';
  } else if (q.status === 'draft') {
    status = 'forapproval';
  } else if (q.status === 'accepted') {
    status = 'completed';
  } else if (q.status === 'declined') {
    status = 'closed';
  } else if (q.status === 'sent') {
    status = 'forapproval';
  } else {
    status = q.status;
  }
  const badgeMap = {
    noestimate: {
      icon: <FileText size={14} className="mr-1" />,
      label: 'No Estimate',
      className: 'bg-gray-50 text-gray-800 border border-gray-200',
    },
    estimate: {
      icon: <FileText size={14} className="mr-1" />,
      label: 'Estimate',
      className: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    },
    forapproval: {
      icon: <Send size={14} className="mr-1" />,
      label: 'For Approval',
      className: 'bg-blue-50 text-blue-800 border border-blue-200',
    },
    closed: {
      icon: <XCircle size={14} className="mr-1" />,
      label: 'Closed',
      className: 'bg-red-50 text-red-800 border border-red-200',
    },
    completed: {
      icon: <CheckCircle2 size={14} className="mr-1" />,
      label: 'Completed',
      className: 'bg-green-50 text-green-800 border border-green-200',
    },
  } as const;
  const badge = badgeMap[status as keyof typeof badgeMap] || badgeMap.noestimate;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-xs ${badge.className}`}
      title={badge.label}
    >
      {badge.icon}
      {badge.label}
    </span>
  );
}
