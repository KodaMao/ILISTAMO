"use client";
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export function NewEstimateButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const addEstimate = useStore((s) => s.addEstimate);
  return (
    <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => {
      const estimateId = addEstimate({ clientId, name: 'Untitled Estimate', items: [] });
      router.push(`/estimates/${estimateId}`);
    }}>New Estimate</button>
  );
}
