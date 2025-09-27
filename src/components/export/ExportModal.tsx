'use client';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { templates } from '@/data/templates';
import { downloadBlob } from '@/lib/localForage';
import dynamic from 'next/dynamic';
const GeneratePDF = dynamic(() => import('./GeneratePDF').then(m => m.GeneratePDF), { ssr: false });

export function ExportModal({ quoteId, open, onClose }: { quoteId: string; open: boolean; onClose: () => void }) {
  const { quotes, estimates, clients, setQuoteStatus } = useStore();
  const [busy, setBusy] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Cleanup object URL on unmount or when closing (must be before any conditional returns)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  const quote = quotes.find((q) => q.id === quoteId);
  const estimate = useMemo(() => (quote ? estimates.find((e) => e.id === quote.estimateId) : undefined), [quotes, estimates, quote]);
  // Find client directly from estimate.clientId (no project dependency)
  const client = useMemo(() => (estimate ? clients.find((c) => c.id === estimate.clientId) : undefined), [clients, estimate]);

  if (!open) return null;
  if (!quote || !estimate || !client) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-4 rounded shadow max-w-md w-full">
          <div className="font-medium mb-2">Export Quote</div>
          <div className="text-red-600 text-sm">Missing required data to export this quote. Please ensure the quote, estimate, and client exist.</div>
          <div className="mt-4 flex justify-end"><button className="px-3 py-1 rounded border" onClick={onClose}>Close</button></div>
        </div>
      </div>
    );
  }

  function handleSelect(templateId: string) {
  if (!quote || !estimate || !client) return;
    // reset previous preview
    setPdfBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedTemplateId(templateId);
    setBusy(true);
  }


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow max-w-3xl w-full">
  <div className="font-medium mb-2">Export Quote</div>
        {!busy && !previewUrl && (
          <>
            <p className="text-sm text-gray-600 mb-4">Select a template to generate the PDF:</p>
            <div className="grid gap-3">
              {templates.map((t) => (
                <button key={t.id} disabled={busy} onClick={() => handleSelect(t.id)} className="text-left border rounded p-3 hover:bg-gray-50">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.description}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t pt-3">
              <div className="text-xs text-gray-500 mb-2">Having trouble? Use your browser’s Print to PDF:</div>
              <button
                className="px-3 py-1 rounded border"
                onClick={() => {
                  window.open(`/quotes/${quote.id}/print`, '_blank', 'noopener');
                  onClose();
                }}
              >
                Print (HTML) → Save as PDF
              </button>
            </div>
          </>
        )}
        {busy && <div className="text-sm text-gray-700">Generating PDF…</div>}
        {busy && selectedTemplateId && !previewUrl && (
          <GeneratePDF
            templateId={selectedTemplateId}
            quote={quote}
            estimate={estimate}
            // project removed
            client={client}
            onDone={(blob: Blob) => {
              const url = URL.createObjectURL(blob);
              setPdfBlob(blob);
              setPreviewUrl(url);
              setBusy(false);
            }}
          />
        )}
        {!busy && previewUrl && (
          <div className="space-y-3">
            <div className="h-[70vh] border rounded overflow-hidden">
              <iframe title="PDF Preview" src={previewUrl} className="w-full h-full" />
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Preview generated. You can download or open in a new tab.</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded border"
                  onClick={() => {
                    if (!pdfBlob) return;
                    const name = `${quote.quoteNumber || quote.name}.pdf`;
                    downloadBlob(name, pdfBlob);
                  }}
                >
                  Download PDF
                </button>
                <button
                  className="px-3 py-1 rounded border"
                  onClick={() => {
                    if (previewUrl) window.open(previewUrl, '_blank', 'noopener');
                  }}
                >
                  Open in new tab
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                  onClick={() => {
                    setQuoteStatus(quote.id, 'sent');
                    onClose();
                  }}
                >
                  Mark as sent & Close
                </button>
                <button
                  className="px-3 py-1 rounded border"
                  onClick={() => {
                    // Go back to template selection
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setPdfBlob(null);
                    setSelectedTemplateId(null);
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 rounded border" onClick={onClose} disabled={busy}>Close</button>
        </div>
      </div>
    </div>
  );
}
