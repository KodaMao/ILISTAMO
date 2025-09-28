"use client";


import { FeedbackButton } from '@/components/FeedbackButton';
import { Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border border-blue-100 p-8 md:p-12 my-12">
      <h1 className="text-3xl font-extrabold mb-2 text-blue-700 flex items-center gap-2">
        <Lightbulb className="text-4xl text-blue-400" /> About IListaMo
      </h1>
      <div className="border-t border-blue-100 mb-6" />
      <div className="bg-white/80 border border-blue-100 rounded-lg p-6 shadow-sm flex flex-col gap-4 mb-6">
        <div className="text-lg text-gray-700 leading-relaxed">
          <p className="mb-4">
            <span className="font-semibold text-blue-800">IListaMo</span> was built by a developer (me!) to solve my own real-world problem: keeping track of clients, estimates, and quotes without the chaos of scattered spreadsheets and emails. I wanted a tool that would make my freelance and business life easier, more organized, and more professional.
          </p>
          <p className="mb-4">
            <span className="font-semibold text-blue-700">This app is a work in progress, and your feedback makes IListaMo better for everyone.</span> If you have suggestions, ideas, or spot something that could be improved, please let me know! If you love the app and want to support its growth—or are interested in investing or collaborating—feel free to reach out. Every bit of help makes a difference. <span className="text-yellow-700">😊</span>
          </p>
        </div>
        <div className="mt-6 flex flex-col items-center">
          <span className="text-base text-blue-700 font-medium mb-2">Send feedback or get in touch:</span>
          <FeedbackButton />
        </div>
      </div>
    </div>
  );
}
