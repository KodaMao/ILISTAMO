"use client";
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export function NewEstimateButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const addEstimate = useStore((s) => s.addEstimate);
  const projects = useStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);
  const label = project ? `New Estimate for ${project.name}` : 'New Estimate';
  return (
    <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => {
      const estimateId = addEstimate({ projectId, name: 'Untitled Estimate', items: [] });
      router.push(`/projects/${projectId}/estimates/${estimateId}`);
    }}>{label}</button>
  );
}
