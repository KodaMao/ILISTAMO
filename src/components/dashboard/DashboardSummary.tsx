"use client";
import { useStore } from "@/store/useStore";

export function DashboardSummary() {
  const { estimates, quotes, clients } = useStore();

  // Status counts for quotes
  const statusCounts = quotes.reduce(
    (acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    },
    { draft: 0, sent: 0, accepted: 0, declined: 0 } as Record<string, number>
  );

  // Profit snapshot (accepted quotes)
  const acceptedQuotes = quotes.filter(q => q.status === "accepted");
  const totalAccepted = acceptedQuotes.reduce((sum, q) => sum + q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);
  // For profit, you may want to compare to estimate cost if available
  // Here, we just show total for simplicity

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded shadow p-4">
        <div className="text-sm text-gray-500 mb-1">Quotes by Status</div>
        <div className="flex gap-3">
          <span className="inline-block bg-gray-100 rounded px-2 py-1 text-xs">Draft: {statusCounts.draft}</span>
          <span className="inline-block bg-blue-100 rounded px-2 py-1 text-xs">Sent: {statusCounts.sent}</span>
          <span className="inline-block bg-green-100 rounded px-2 py-1 text-xs">Accepted: {statusCounts.accepted}</span>
          <span className="inline-block bg-red-100 rounded px-2 py-1 text-xs">Declined: {statusCounts.declined}</span>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <div className="text-sm text-gray-500 mb-1">Total Accepted Quotes</div>
        <div className="text-2xl font-bold text-green-700">${totalAccepted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <div className="text-sm text-gray-500 mb-1">Clients</div>
        <div className="text-2xl font-bold">{clients.length}</div>
      </div>
    </div>
  );
}
