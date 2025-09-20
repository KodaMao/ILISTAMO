"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { downloadBlob } from '@/lib/localForage';
import { Upload, Download, Home, Users } from 'lucide-react';

export function Navigation() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { exportData, importData, initialized, init } = useStore();
  useEffect(() => {
    if (!initialized) {
      void init();
    }
  }, [initialized, init]);
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-4">
        <Link href="/" className="font-semibold text-blue-700">IListaMo</Link>
        <nav className="flex items-center gap-3 text-sm text-gray-700">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-700">
            <Home size={16} /> Dashboard
          </Link>
          <Link href="/clients" className="inline-flex items-center gap-1 hover:text-blue-700">
            <Users size={16} /> Clients
          </Link>
          <Link href="/mycompany" className="inline-flex items-center gap-1 hover:text-blue-700">
            <span className="inline-block w-4 h-4 rounded-full mr-1" style={{ background: useStore.getState().settings.companyInfo.brandColor || '#2563eb' }} />
            MyCompany
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={() => {
            const json = exportData();
            downloadBlob(`ilistamo-${Date.now()}.ilistamo`, json);
          }}><Download size={16} /> BackupaMo</button>
          <input ref={fileRef} type="file" className="hidden" accept=".ilistamo,application/json" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const text = await f.text();
            await importData(text);
            setToast('Data imported successfully');
            setTimeout(() => setToast(null), 2500);
          }} />
          <button className="px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-gray-50" onClick={() => fileRef.current?.click()}><Upload size={16} /> RestoraMo</button>
        </div>
      </div>
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 top-14 bg-green-600 text-white text-sm px-3 py-1 rounded shadow">{toast}</div>
      )}
    </header>
  );
}
