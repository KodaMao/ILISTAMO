"use client";
import { useState } from 'react';
import { ClientDashboard } from './ClientDashboard';
export function DashboardClientShell() {
  const [search, setSearch] = useState("");
  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Your business pipeline</div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients, estimates, or quotes..."
          className="border rounded px-2 py-1 w-full max-w-sm"
        />
      </div>
      <ClientDashboard search={search} />
    </div>
  );
}
