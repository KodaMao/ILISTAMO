import { DashboardClientShell } from '@/components/dashboard/DashboardClientShell';

export default function DashboardPage() {
  return (
  <div className="flex flex-col h-full min-h-[80vh] p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">IListaMo Dashboard</h1>
      <p className="text-gray-600 mb-2">Create projects, estimates, and quotes. All data stays on your device.</p>
      <div className="mt-6">
        <DashboardClientShell />
      </div>
    </div>
  );
}
