import { DashboardClientShell } from '@/components/dashboard/DashboardClientShell';

export default function DashboardPage() {
  // This is a server component; render a thin client subcomponent for data
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">IListaMo Dashboard</h1>
      <p className="text-gray-600 mt-2">Create projects, estimates, and quotes. All data stays on your device.</p>
      {/* Client wrapper */}
      <DashboardClientShell />
    </div>
  );
}
