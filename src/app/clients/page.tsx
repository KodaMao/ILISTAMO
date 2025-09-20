import { ClientTable } from '@/components/clients/ClientTable';

export default function ClientsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <p className="text-gray-600 mt-2">Manage your client directory.</p>
      <div className="mt-6">
        <ClientTable />
      </div>
    </div>
  );
}
