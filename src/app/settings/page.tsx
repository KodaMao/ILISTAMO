
"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { Download, Upload } from "lucide-react";

function BackupRestoreSettings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const { exportData, importData, clearAll } = useStore();
  return (
    <div className="flex flex-col gap-2 mt-2">
      <button className="px-4 py-2 rounded border inline-flex items-center gap-2 hover:bg-gray-50" onClick={() => {
        const json = exportData();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ilistamo-${Date.now()}.ilistamo`;
        a.click();
        URL.revokeObjectURL(url);
      }}><Download size={20} /> Backup</button>
      <input ref={fileRef} type="file" className="hidden" accept=".ilistamo,application/json" onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const text = await f.text();
        await importData(text);
        setToast("Data imported successfully");
        setTimeout(() => setToast(null), 2500);
      }} />
      <button className="px-4 py-2 rounded border inline-flex items-center gap-2 hover:bg-gray-50" onClick={() => fileRef.current?.click()}><Upload size={20} /> Restore</button>
      <button className="px-4 py-2 rounded border inline-flex items-center gap-2 hover:bg-red-100 text-red-700 font-semibold mt-4" onClick={() => setShowWarning(true)}>
        Clear All Data
      </button>
      {showWarning && (
        <div className="mt-2 p-4 bg-red-50 border border-red-300 rounded">
          <div className="font-bold text-red-700 mb-2">Warning: This will permanently delete all your data!</div>
          <div className="mb-2 text-sm text-red-600">This action cannot be undone. Make sure you have backed up your data first.</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-red-600 text-white font-semibold" onClick={() => { clearAll(); setShowWarning(false); setToast("All data cleared."); }}>Yes, clear all</button>
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-700" onClick={() => setShowWarning(false)}>Cancel</button>
          </div>
        </div>
      )}
      {toast && (
        <div className="mt-2 bg-green-600 text-white text-sm px-3 py-1 rounded shadow">{toast}</div>
      )}
    </div>
  );
}



export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useStore();
  const [showCurrencyToast, setShowCurrencyToast] = useState(false);
  const currencyOptions = [
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'JPY', label: 'Japanese Yen (¥)' },
    { code: 'AUD', label: 'Australian Dollar (A$)' },
    { code: 'CAD', label: 'Canadian Dollar (C$)' },
    { code: 'CHF', label: 'Swiss Franc (Fr)' },
    { code: 'CNY', label: 'Chinese Yuan (¥)' },
    { code: 'INR', label: 'Indian Rupee (₹)' },
    { code: 'PHP', label: 'Philippine Peso (₱)' },
    // Add more as needed
  ];
  return (
    <div className="flex flex-col h-full min-h-[80vh] p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <ul className="space-y-4">
        <li>
          <button
            className="w-full text-left px-4 py-3 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold"
            onClick={() => router.push("/mycompany")}
          >
            My Company Profile
          </button>
        </li>
        <li>
          <label className="block mb-1 font-medium text-gray-700">Currency</label>
          <select
            className="w-full px-4 py-2 border border-blue-100 rounded-lg bg-blue-50 text-blue-700 font-semibold focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            value={settings.currency || 'USD'}
            onChange={e => {
              updateSettings({ currency: e.target.value });
              setShowCurrencyToast(true);
              setTimeout(() => setShowCurrencyToast(false), 2000);
            }}
          >
            {currencyOptions.map(opt => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </select>
        </li>
        <li>
          <BackupRestoreSettings />
        </li>
        {/* Add more settings options here */}
      </ul>
      {showCurrencyToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          Currency updated!
        </div>
      )}
    </div>
  );
}
