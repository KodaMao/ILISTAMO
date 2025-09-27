"use client";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="flex justify-center items-start min-h-[80vh] bg-blue-50/40 py-12 px-2 overflow-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 p-8 md:p-12 overflow-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">Help & Instructions</h1>
        <div className="space-y-8 text-gray-800">
          <section>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Getting Started</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the navigation bar to access Dashboard, Estimates, Quotes, Clients, and Settings.</li>
              <li>Click <span className="font-semibold">Add Client</span> to create a new client profile.</li>
              <li>Click <span className="font-semibold">New Estimate</span> to start a new estimate for a client.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Estimates</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Estimates are created for clients and can include multiple items, grouped by category.</li>
              <li>Use the checkboxes to select items, select-all per category, or clear all selections.</li>
              <li>Edit item details, quantities, and markup as needed.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Quotes</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generate a quote from an estimate with one click.</li>
              <li>Edit the quote number, items, markup, and notes/terms.</li>
              <li>View analytics and totals at the bottom of the quote editor.</li>
              <li>Export quotes to PDF using the Export button.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Clients</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Manage your client list from the Clients page.</li>
              <li>Click a client to view their estimates and quotes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Settings</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Update your company info, branding, and PDF template in Settings.</li>
              <li>Backup or restore your data from the Settings page.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Feedback & Support</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Click the <span className="font-semibold">Feedback</span> button in the navigation bar to send feedback or contact the developer.</li>
              <li>For more help, contact us via the feedback form or visit <a href="https://your-portfolio.com" className="underline text-blue-700" target="_blank" rel="noopener noreferrer">the developer's site</a>.</li>
            </ul>
          </section>
        </div>
        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 underline font-medium">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
