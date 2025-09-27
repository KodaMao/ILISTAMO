"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { downloadBlob } from '@/lib/localForage';
import { Upload, Download, Home, Users, Briefcase } from 'lucide-react';
import { usePathname } from 'next/navigation';


export function Navigation() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { exportData, importData, initialized, init } = useStore();
  const pathname = usePathname();
  useEffect(() => {
    if (!initialized) {
      void init();
    }
  }, [initialized, init]);
  const navLinks = [
    { href: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/estimates', label: 'Estimates', icon: <span className="inline-block w-4 h-4 rounded bg-green-300 mr-1" /> },
    { href: '/quotes', label: 'Quotes', icon: <span className="inline-block w-4 h-4 rounded bg-yellow-300 mr-1" /> },
    { href: '/clients', label: 'Clients', icon: <Users size={20} /> },
    { href: '/mycompany', label: 'MyCompany', icon: <span className="inline-block w-4 h-4 rounded-full mr-1" style={{ background: useStore.getState().settings.companyInfo.brandColor || '#2563eb' }} /> },
    { href: '/settings', label: 'Settings', icon: <span className="inline-block w-4 h-4 rounded bg-gray-300 mr-1" /> },
  ];
  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col py-8 px-4 shadow-lg">
      <Link href="/" className="font-bold text-blue-700 text-xl mb-8">IListaMo</Link>
      <nav className="flex flex-col gap-2 text-base text-gray-700 flex-1">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href as any}
            className={`px-4 py-3 rounded flex items-center gap-3 transition-colors duration-150 ${pathname === link.href ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-blue-100 hover:text-blue-700'}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
      {/* Backup/Restore moved to Settings page */}
    </aside>
  );
}
