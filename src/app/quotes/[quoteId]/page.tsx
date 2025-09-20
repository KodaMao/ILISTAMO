import { QuoteEditor } from '@/components/quotes/QuoteEditor';

export default async function QuoteEditorPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Quote {quoteId}</h1>
      <div className="mt-6">
        <QuoteEditor quoteId={quoteId} />
      </div>
    </div>
  );
}
