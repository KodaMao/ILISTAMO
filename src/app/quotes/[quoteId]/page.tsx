import { QuoteEditor } from '@/components/quotes/QuoteEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function QuoteEditorPage({ params }: { params: { quoteId: string } }) {
  const { quoteId } = params;
  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:underline">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Quote {quoteId}</h1>
      <div className="mt-6">
        <QuoteEditor quoteId={quoteId} />
      </div>
    </div>
  );
}
