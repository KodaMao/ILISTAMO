'use client';
import { useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { computeQuoteMetrics } from '@/lib/calculations';
import { useParams } from 'next/navigation';

export default function QuotePrintPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const { quotes, estimates, projects, clients, initialized, init } = useStore();
  useEffect(() => { if (!initialized) void init(); }, [initialized, init]);
  const quote = quotes.find(q => q.id === quoteId);
  const estimate = useMemo(() => quote ? estimates.find(e => e.id === quote.estimateId) : undefined, [quote, estimates]);
  const project = useMemo(() => estimate ? projects.find(p => p.id === estimate.projectId) : undefined, [estimate, projects]);
  const client = useMemo(() => project ? clients.find(c => c.id === project.clientId) : undefined, [project, clients]);
  const m = quote && estimate ? computeQuoteMetrics(quote, estimate) : null;

  useEffect(() => {
    const id = setTimeout(() => window.print(), 300);
    return () => clearTimeout(id);
  }, []);

  if (!quote || !estimate || !project || !client || !m) {
    return <div style={{ padding: 24 }}>Missing data. Close and try again.</div>;
  }

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ fontFamily: 'system-ui, Segoe UI, Roboto, Arial', padding: 24 }}>
      <style>{`@media print { @page { size: A4; margin: 16mm; } } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #e5e7eb; padding: 6px; font-size: 12px; } th { background: #f9fafb; text-align: left; } .totals { width: 280px; margin-left: auto; } .totals td { border: none; } .title { text-align: center; color: #6b7280; margin: 16px 0; } .subtle { color: #6b7280; font-size: 12px; }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{quote.companyInfo.name}</div>
          <div className="subtle">{quote.companyInfo.address}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>Quote #: {quote.quoteNumber}</div>
          <div>Date: {new Date(quote.createdAt).toLocaleDateString()}</div>
          <div>Client: {client.name}</div>
        </div>
      </div>
      <h2 className="title">QUOTE</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ textAlign: 'right', width: 80 }}>Qty</th>
            <th style={{ width: 100 }}>Unit</th>
            <th style={{ textAlign: 'right', width: 120 }}>Unit Price</th>
            <th style={{ textAlign: 'right', width: 140 }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map(it => (
            <tr key={it.id}>
              <td>{it.description || '—'}</td>
              <td style={{ textAlign: 'right' }}>{it.quantity}</td>
              <td>{it.unit}</td>
              <td style={{ textAlign: 'right' }}>{fmt(it.unitPrice)}</td>
              <td style={{ textAlign: 'right' }}>{fmt(it.quantity * it.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="totals" style={{ marginTop: 12 }}>
        <tbody>
          <tr><td>Subtotal</td><td style={{ textAlign: 'right' }}>{fmt(m.subtotal)}</td></tr>
          <tr><td>Tax ({quote.taxRate}%)</td><td style={{ textAlign: 'right' }}>{fmt(m.taxAmount)}</td></tr>
          <tr><td style={{ fontWeight: 700 }}>Grand Total</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(m.grandTotal)}</td></tr>
        </tbody>
      </table>

      {quote.notes && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Notes</div>
          <div className="subtle">{quote.notes}</div>
        </div>
      )}
    </div>
  );
}
