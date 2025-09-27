"use client";

import { FeedbackButton } from '@/components/FeedbackButton';

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full min-h-[80vh] p-8 bg-white rounded-xl shadow-lg items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-extrabold mb-4 text-blue-700">About IListaMo</h1>
        <div className="text-lg text-gray-700 leading-relaxed bg-blue-50 rounded-lg p-6 shadow-sm mb-6">
          <p className="mb-4">
            <span className="font-semibold text-blue-800">IListaMo</span> was created to solve a problem that almost every freelancer and small business owner knows: the frustration of keeping track of clients, estimates, and quotes using scattered spreadsheets, emails, and documents. Important details get lost, things look inconsistent, and too much time is wasted on repetitive paperwork.
          </p>
          <p className="mb-4">
            IListaMo brings everything together in one place, so you can stay organized and look professional—without the stress. It’s designed to help you focus on your work and your clients, knowing your documents are always clear, consistent, and ready to send.
          </p>
          <p className="mb-2">
            Our goal is simple: to give you confidence, save you time, and help you present your business at its best. No more mess, no more hassle—just a smoother way to run your business.
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:gap-4 mt-6">
          <div className="flex-1">
            <div className="font-semibold text-yellow-800 mb-1">Help us improve!</div>
            <div className="text-yellow-900 text-base mb-2">Your feedback makes IListaMo better. If you have suggestions, ideas, or spot something that could be improved, please let us know.</div>
            <div className="text-yellow-900 text-base">
              If you love the app and want to support its growth—or are interested in investing or collaborating—feel free to reach out! Every bit of help makes a difference. <span className="text-yellow-700">😊</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <FeedbackButton />
          </div>
        </div>
      </div>
    </div>
  );
}
