"use client";
import { useStore } from '@/store/useStore';
import { useState, useRef } from 'react';

export default function MyCompanyPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [company, setCompany] = useState(settings.companyInfo);
  const [preparer, setPreparer] = useState(settings.preparerName || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCompany({ ...company, logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  const [saved, setSaved] = useState(false);
  function handleSave() {
    updateSettings({
      ...settings,
      companyInfo: company,
      preparerName: preparer,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
  <div className="flex flex-col h-full min-h-[80vh] p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">My Company Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block mb-3">
            <span className="text-sm font-medium">Company Name</span>
            <input className="w-full border rounded px-3 py-2 mt-1" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium">Address</span>
            <input className="w-full border rounded px-3 py-2 mt-1" value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium">Contact Info</span>
            <input className="w-full border rounded px-3 py-2 mt-1" value={company.contact || ''} onChange={e => setCompany({ ...company, contact: e.target.value })} />
          </label>
        </div>
        <div>
          <label className="block mb-3">
            <span className="text-sm font-medium">Logo (PNG, optional)</span>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="w-full border rounded px-3 py-2 mt-1" onChange={handleLogoUpload} />
            {company.logoBase64 && (
              <div className="mt-2 flex items-center gap-2">
                <img src={company.logoBase64} alt="Logo preview" className="h-12 w-12 rounded border" />
                <button className="text-xs text-red-600 underline" onClick={() => setCompany({ ...company, logoBase64: '' })}>Remove</button>
              </div>
            )}
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium">Brand Color</span>
            <div className="flex items-center gap-3 mt-1">
              <input className="w-16 h-10 border rounded" type="color" value={company.brandColor} onChange={e => setCompany({ ...company, brandColor: e.target.value })} />
              <span className="px-3 py-1 rounded text-white" style={{ background: company.brandColor }}>Live Preview</span>
            </div>
          </label>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Prepared By</h3>
        <input className="w-full border rounded px-3 py-2" value={preparer} onChange={e => setPreparer(e.target.value)} placeholder="Your name" />
      </div>
      <button className="px-5 py-2 rounded bg-blue-600 text-white font-semibold shadow" onClick={handleSave}>Save Company Info</button>
      {saved && (
        <div className="mt-4 text-green-600 font-medium">Company profile saved!</div>
      )}
    </div>
  );
}
