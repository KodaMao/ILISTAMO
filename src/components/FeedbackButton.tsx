"use client";
import { useState } from "react";
import { useForm, ValidationError } from '@formspree/react';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [state, handleSubmit] = useForm("mnnbrwwk");

  return (
    <>
      <button
        className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 font-semibold mt-4 shadow-sm border border-blue-100 transition"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
      >
        <span className="mr-2">💬</span> Feedback
      </button>
      {open && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm">
          {state.succeeded ? (
            <section className="flex items-center justify-center w-full">
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center border border-blue-50">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-blue-700">Thank you!</h2>
                <p className="text-gray-600">Thanks for reaching out. I'll get back to you soon.</p>
                <button className="mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition" onClick={() => setOpen(false)}>Close</button>
              </div>
            </section>
          ) : (
            <section className="flex items-center justify-center w-full">
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-md w-full border border-blue-50">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Send us your thoughts</h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="w-full px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-blue-50 placeholder:text-blue-300"
                      placeholder="your@email.com"
                      required
                    />
                    <ValidationError
                      prefix="Email"
                      field="email"
                      errors={state.errors}
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-blue-50 placeholder:text-blue-300"
                      placeholder="Your message..."
                      required
                    />
                    <ValidationError
                      prefix="Message"
                      field="message"
                      errors={state.errors}
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={state.submitting}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {state.submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : "Send"}
                    </button>
                  </div>
                </form>
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Or <a href="https://your-portfolio.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">contact the developer</a>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
