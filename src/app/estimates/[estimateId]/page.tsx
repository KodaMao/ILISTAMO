"use client";
import { useParams } from "next/navigation";
import { EstimateEditor } from "@/components/estimates/EstimateEditor";

export default function EstimatePage() {
  const { estimateId } = useParams();
  if (!estimateId || typeof estimateId !== 'string') {
    return <div className="p-8 text-red-600">Estimate not found.</div>;
  }
  return (
    <div className="p-8">
      <EstimateEditor estimateId={estimateId} />
    </div>
  );
}
