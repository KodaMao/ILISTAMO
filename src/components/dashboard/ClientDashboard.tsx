"use client";
import { useEffect, useState } from 'react';
// import { ProjectGrid } from './ProjectGrid';
import { useStore } from '@/store/useStore';
import { DashboardSummary } from './DashboardSummary';
import Link from 'next/link';

export function ClientDashboard({ search }: { search: string }) {
  const { quotes, clients, estimates, init, initialized } = useStore();
  useEffect(() => {
    if (!initialized) void init();
  }, [initialized, init]);



  // Filter estimates and quotes by search
  const lower = search.toLowerCase();
  const filteredEstimates = estimates.filter(e => {
    const client = clients.find(c => c.id === e.clientId);
    return (
      e.name.toLowerCase().includes(lower) ||
      (client?.name?.toLowerCase() || "").includes(lower)
    );
  });
  const filteredQuotes = quotes.filter(q => {
    const estimate = estimates.find(e => e.id === q.estimateId);
    const client = estimate ? clients.find(c => c.id === estimate.clientId) : undefined;
    return (
      q.name.toLowerCase().includes(lower) ||
      (client?.name?.toLowerCase() || "").includes(lower)
    );
  });

  return (
    <div className="mt-6">
      <DashboardSummary />
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex gap-2">
          <Link href="/clients" className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Add Client</Link>
          <Link href="/estimates" className="px-4 py-2 rounded bg-blue-600 text-white">New Estimate</Link>
          <Link href="/settings" className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Backup/Restore</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold mb-2">Recent Estimates</h2>
          <table className="min-w-full border rounded bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Estimate Name</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Modified</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEstimates.slice(0, 5).map(estimate => {
                const client = clients.find(c => c.id === estimate.clientId);
                return (
                  <tr key={estimate.id} className="border-b">
                    <td className="px-4 py-2">{estimate.name || "Untitled Estimate"}</td>
                    <td className="px-4 py-2">{client?.name || "Unknown"}</td>
                    <td className="px-4 py-2">{new Date(estimate.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <Link href={`/estimates/${estimate.id}`} className="text-blue-600 hover:underline">Open</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2">Recent Quotes</h2>
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
              {filteredQuotes.slice(0, 5).map(quote => {
                const estimate = estimates.find(e => e.id === quote.estimateId);
                const client = estimate ? clients.find(c => c.id === estimate.clientId) : undefined;
                return (
                  <tr key={quote.id} className="border-b">
                    <td className="px-4 py-2">{quote.name || "Untitled Quote"}</td>
                    <td className="px-4 py-2">{client?.name || "Unknown"}</td>
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
        </div>
      </div>
    </div>
  );
}
