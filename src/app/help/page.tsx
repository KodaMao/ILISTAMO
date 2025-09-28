"use client";

import Link from "next/link";
import { Rocket, FileText, MessageCircle, Users, Settings, Lightbulb } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-8 md:p-12 my-12">
      <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center flex items-center justify-center gap-2">
        <Lightbulb className="inline-block w-7 h-7 text-blue-400" /> Help & Instructions
      </h1>
      <div className="space-y-10 text-gray-800">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2"><Rocket className="w-5 h-5 text-blue-400" /> Getting Started</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the navigation bar to access <b>Dashboard</b>, <b>Estimates</b>, <b>Quotes</b>, <b>Clients</b>, and <b>Settings</b>.</li>
            <li>Click <span className="font-semibold">Add Client</span> to create a new client profile.</li>
            <li>Click <span className="font-semibold">New Estimate</span> to start a new estimate for a client.</li>
          </ul>
        </section>
        <div className="border-t border-blue-100" />
        <section>
          <h2 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Estimates</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Estimates are created for clients and can include multiple items, grouped by category.</li>
            <li>Use the checkboxes to select items, select-all per category, or clear all selections.</li>
            <li>Edit item details, quantities, and markup as needed.</li>
          </ul>
        </section>
        <div className="border-t border-blue-100" />
        <section>
          <h2 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-400" /> Quotes</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Generate a quote from an estimate with one click.</li>
            <li>Edit the quote number, items, markup, and notes/terms.</li>
            <li>View analytics and totals at the bottom of the quote editor.</li>
            <li>Export quotes to PDF using the Export button.</li>
          </ul>
        </section>
        <div className="border-t border-blue-100" />
        <section>
          <h2 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> Clients</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Manage your client list from the Clients page.</li>
            <li>Click a client to view their estimates and quotes.</li>
          </ul>
        </section>
        <div className="border-t border-blue-100" />
        <section>
          <h2 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2"><Settings className="w-5 h-5 text-blue-400" /> Settings</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Update your company info, branding, and PDF template in Settings.</li>
            <li>Select your preferred currency (USD, EUR, PHP, etc.) in Settings. All monetary values in the app and PDF will use your chosen currency.</li>
            <li>Changing the currency shows a notification and updates all totals instantly.</li>
            <li>Backup or restore your data from the Settings page.</li>
          </ul>
        </section>
        <div className="border-t border-blue-100" />
        <section>
          <h2 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-blue-400" /> Feedback & Support</h2>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex-1">
              <div className="font-semibold text-blue-800 mb-1">We want to hear from you!</div>
              <div className="text-blue-900 text-base mb-2">Click the <span className="font-semibold">Feedback</span> button in the navigation bar to send feedback, suggestions, or contact the developer directly.</div>
              <div className="text-blue-900 text-base">For more help, use the feedback form or visit <a href="https://kodamao.github.io/portfolio2025/" className="underline text-blue-700" target="_blank" rel="noopener noreferrer">the developer's site</a>.</div>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-12 text-center">
        <Link href="/" className="text-blue-600 underline font-medium">Back to Dashboard</Link>
      </div>
    </div>
  );
}
