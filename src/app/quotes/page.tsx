"use client";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useState } from "react";

export default function QuotesPage() {
  const { quotes, estimates, clients, addQuote, settings } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState("");
  const [quoteName, setQuoteName] = useState("");

  function getClientName(quote: any) {
    const estimate = estimates.find(e => e.id === quote.estimateId);
    if (!estimate) return "Unknown";
    const client = clients.find(c => c.id === estimate.clientId);
    return client ? client.name : "Unknown";
  }

  function handleCreateQuote() {
    const estimate = estimates.find(e => e.id === selectedEstimate);
    if (!estimate) return;
    const id = addQuote({
      estimateId: estimate.id,
      name: quoteName || "Untitled Quote",
      items: estimate.items.map(item => ({
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        description: item.description,
        category: item.category || "",
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.costPerUnit
      })),
      status: "draft",
      discountType: "amount",
      discount: 0,
      taxRate: settings?.defaultTaxRate ?? 0,
      expiryDays: settings?.defaultExpiryDays ?? 30,
      notes: "",
      terms: "",
      companyInfo: settings?.companyInfo ?? { name: "", address: "", brandColor: "#2563eb" },
      quoteNumber: `Q-${new Date().getFullYear()}-${(quotes.length + 1).toString().padStart(3, '0')}`
    });
    setShowModal(false);
    setSelectedEstimate("");
    setQuoteName("");
    window.location.href = `/quotes/${id}`;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Quotes</h1>
      <button className="mb-6 px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setShowModal(true)}>New Quote</button>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Quote</h2>
            <label className="block mb-2">Estimate</label>
            <select className="border rounded px-2 py-1 w-full mb-4" value={selectedEstimate} onChange={e => setSelectedEstimate(e.target.value)}>
              <option value="">Select an estimate</option>
              {estimates.map(e => (
                <option key={e.id} value={e.id}>{e.name || "Untitled Estimate"}</option>
              ))}
            </select>
            <label className="block mb-2">Quote Name</label>
            <input className="border rounded px-2 py-1 w-full mb-4" value={quoteName} onChange={e => setQuoteName(e.target.value)} placeholder="Quote name" />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" disabled={!selectedEstimate} onClick={handleCreateQuote}>Create</button>
            </div>
          </div>
        </div>
      )}
      {quotes.length === 0 ? (
        <div className="text-gray-500">No quotes found.</div>
      ) : (
        <table className="min-w-full border rounded bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Quote Name</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Modified</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => {
              const estimate = estimates.find(e => e.id === quote.estimateId);
              return (
                <tr key={quote.id} className="border-b">
                  <td className="px-4 py-2">{quote.name || "Untitled Quote"}</td>
                  <td className="px-4 py-2">{getClientName(quote)}</td>
                  <td className="px-4 py-2">{quote.status}</td>
                  <td className="px-4 py-2">{new Date(quote.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <Link href={`/quotes/${quote.id}`} className="text-blue-600 hover:underline">Open</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
