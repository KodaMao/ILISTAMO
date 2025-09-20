import { EstimateEditor } from '@/components/estimates/EstimateEditor';

export default async function EstimateEditorPage({ params }: { params: Promise<{ projectId: string; estimateId: string }> }) {
  const { estimateId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Estimate {estimateId}</h1>
      <div className="mt-6">
        <EstimateEditor estimateId={estimateId} />
      </div>
    </div>
  );
}
