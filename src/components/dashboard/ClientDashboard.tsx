"use client";
import { useEffect } from 'react';
import { ProjectGrid } from './ProjectGrid';
import { useStore } from '@/store/useStore';

export function ClientDashboard({ search = "" }: { search?: string }) {
  const { projects, quotes, clients, estimates, init, initialized } = useStore();
  useEffect(() => {
    if (!initialized) void init();
  }, [initialized, init]);

  // Filter projects and clients by search term
  const lower = search.toLowerCase();
  const filteredProjects = projects.filter(p => {
    const clientName = clients?.find(c => c.id === p.clientId)?.name || "";
    return (
      p.name.toLowerCase().includes(lower) ||
      clientName.toLowerCase().includes(lower)
    );
  });

  return (
    <div className="mt-6">
      <ProjectGrid projects={filteredProjects} quotes={quotes} clients={clients} estimates={estimates} />
    </div>
  );
}
