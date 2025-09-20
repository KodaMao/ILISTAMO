"use client";
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [company, setCompany] = useState(settings.companyInfo);
  const [preparer, setPreparer] = useState(settings.preparerName || '');

  function handleSave() {
    updateSettings({
      ...settings,
      companyInfo: company,
      preparerName: preparer,
    });
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Company Information</h2>
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm">Company Name</span>
          <input className="w-full border rounded px-2 py-1" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm">Address</span>
          <input className="w-full border rounded px-2 py-1" value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm">Contact Info</span>
          <input className="w-full border rounded px-2 py-1" value={company.contact || ''} onChange={e => setCompany({ ...company, contact: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm">Brand Color</span>
          <input className="w-32 border rounded px-2 py-1" type="color" value={company.brandColor} onChange={e => setCompany({ ...company, brandColor: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm">Logo (base64, optional)</span>
          <input className="w-full border rounded px-2 py-1" value={company.logoBase64 || ''} onChange={e => setCompany({ ...company, logoBase64: e.target.value })} />
        </label>
      </div>
      <h2 className="text-xl font-bold mt-6 mb-4">Prepared By</h2>
      <label className="block mb-4">
        <span className="text-sm">Name</span>
        <input className="w-full border rounded px-2 py-1" value={preparer} onChange={e => setPreparer(e.target.value)} />
      </label>
      <button className="px-4 py-2 rounded bg-blue-600 text-white font-medium" onClick={handleSave}>Save</button>
    </div>
  );
}
