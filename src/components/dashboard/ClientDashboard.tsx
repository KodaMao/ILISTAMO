"use client";
import { useEffect } from 'react';
import { ProjectGrid } from './ProjectGrid';
import { useStore } from '@/store/useStore';

export function ClientDashboard() {
  const { projects, quotes, clients, estimates, init, initialized } = useStore();
  useEffect(() => {
    if (!initialized) void init();
  }, [initialized, init]);
  return (
    <div className="mt-6">
      <ProjectGrid projects={projects} quotes={quotes} clients={clients} estimates={estimates} />
    </div>
  );
}
