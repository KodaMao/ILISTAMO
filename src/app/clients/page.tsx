import { ClientTable } from '@/components/clients/ClientTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ClientsPage() {
  return (
  <div className="flex flex-col h-full min-h-[80vh] p-8 bg-white rounded-xl shadow-lg">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:underline">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Clients</h1>
      <p className="text-gray-600 mb-2">Manage your client directory.</p>
      <div className="mt-6">
        <ClientTable />
      </div>
    </div>
  );
}
