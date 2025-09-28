"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { downloadBlob } from '@/lib/localForage';
import { Upload, Download, Home, Users, Briefcase, Info } from 'lucide-react';
import { FeedbackButton } from '@/components/FeedbackButton';
import { usePathname, useRouter } from 'next/navigation';


export function Navigation() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { exportData, importData, initialized, init, settings } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [showCompanyWarning, setShowCompanyWarning] = useState(false);

  useEffect(() => {
    if (!initialized) {
      void init();
    }
  }, [initialized, init]);

  // Block navigation if company name is not set
  function handleNav(e: React.MouseEvent, href: string) {
    const mustSetup = ["/", "/estimates", "/quotes", "/clients"];
    if (mustSetup.includes(href) && (!settings.companyInfo.name || settings.companyInfo.name.trim() === "")) {
      e.preventDefault();
      setShowCompanyWarning(true);
      router.push("/mycompany");
    }
  }

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/estimates', label: 'Estimates', icon: <span className="inline-block w-4 h-4 rounded bg-green-300 mr-1" /> },
    { href: '/quotes', label: 'Quotes', icon: <span className="inline-block w-4 h-4 rounded bg-yellow-300 mr-1" /> },
    { href: '/clients', label: 'Clients', icon: <Users size={20} /> },
    { href: '/mycompany', label: 'MyCompany', icon: <span className="inline-block w-4 h-4 rounded-full mr-1" style={{ background: useStore.getState().settings.companyInfo.brandColor || '#2563eb' }} /> },
    { href: '/settings', label: 'Settings', icon: <span className="inline-block w-4 h-4 rounded bg-gray-300 mr-1" /> },
    { href: '/about', label: 'About', icon: <Info size={20} /> },
    { href: '/help', label: 'Help', icon: <span className="inline-block w-4 h-4 rounded bg-blue-200 text-blue-700 flex items-center justify-center font-bold mr-1">?</span> },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col py-8 px-4 shadow-lg sticky top-0 h-screen z-30">
      <Link href="/" className="font-bold text-blue-700 text-xl mb-8">IListaMo</Link>
      <nav className="flex flex-col gap-2 text-base text-gray-700 flex-1">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href as any}
            onClick={e => handleNav(e, link.href)}
            className={`px-4 py-3 rounded flex items-center gap-3 transition-colors duration-150 ${pathname === link.href ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-blue-100 hover:text-blue-700'}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
      {showCompanyWarning && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-3 my-4 text-sm">
          Please set up your company profile before using the app.
        </div>
      )}
      <div className="mt-8">
        <FeedbackButton />
      </div>
    </aside>
  );
}
