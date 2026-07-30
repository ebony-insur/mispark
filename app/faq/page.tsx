"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, HelpCircle, Upload, Sparkles, BookOpen } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Uploading & Files",
    question: "Why did my file upload fail? (Size and Type limits)",
    answer: "Uploads are strictly limited to a maximum file size of 5MB, and files must be in JPG, PNG, or PDF format. If your file is larger than 5MB or saved in an unsupported format (like HEIC from an iPhone or a heavy Word document), the uploader will block it and display a notification."
  },
  {
    category: "Uploading & Files",
    question: "How do I troubleshoot or compress large PDFs and images?",
    answer: "If your file fails due to size, you can easily compress it: \n• On iPhone/Mac: Open the image or PDF, tap share or print, and use a free online compressor like ILovePDF or TinyPNG.\n• Screenshots: Take a screenshot of the document rather than scanning a high-DPI PDF, as images compress much smaller.\n• Format conversion: Convert HEIC phone photos to standard JPG format before uploading."
  },
  {
    category: "Plans & Curriculum",
    question: "How do I give my lesson plan a custom title?",
    answer: "When generating a new plan on the Dashboard, use the 'Plan Title' input field right above the topic box. By default, it names your plan using today's date, but you can type any custom title (e.g., 'Ancient Rome & Mosaics') before hitting 'Spark Curiosity'."
  },
  {
    category: "Plans & Curriculum",
    question: "What is the difference between 'Didn't Attempt' on a plan vs. an element?",
    answer: "Marking an entire plan as 'Didn't Attempt' removes it from your current assessment reminders without penalizing future recommendations. Marking a specific element (like an individual book or experiment) as 'Didn't Attempt' temporarily skips it from grading queues while keeping it eligible for future AI recommendations if it proves valuable later."
  },
  {
    category: "Plans & Curriculum",
    question: "What is the difference between 'Didn't Attempt' and 'Do Not Recommend'?",
    answer: "A 'Didn't Attempt' status is fully reversible and simply means you skipped an activity this week. A 'Do Not Recommend' toggle permanently blocks a specific book, tool, or topic so the AI never suggests it to that student again."
  },
  {
    category: "Account & Billing",
    question: "How do promo codes work?",
    answer: "When you enter a valid promo code on your dashboard, it will instantly add Sparks to your balance and display a success message showing how many Sparks were credited. If the code is invalid, the system will notify you immediately."
  }
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="w-full flex-1 flex flex-col items-center pb-24">
        <div className="w-full px-6 pt-6 flex justify-center">
          <SiteHeader />
        </div>

        <div className="w-full max-w-4xl px-6 pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-bold text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" /> Help Center & Knowledge Base
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h1>
            <p className="text-slate-600 font-medium max-w-xl mx-auto">
              Find answers, troubleshooting steps, and guidance on how to make the most of every MiSpark feature.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <Input 
              type="text"
              placeholder="Search questions (e.g., upload limit, promo code, titles)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-white border-slate-200 rounded-2xl shadow-sm text-base focus-visible:ring-teal-500"
            />
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4 pt-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 font-medium">No matching questions found. Try searching for something else!</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase text-teal-600 tracking-wider bg-teal-50 px-2 py-0.5 rounded">
                          {faq.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800">{faq.question}</h3>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-slate-600 font-medium leading-relaxed border-t border-slate-100 whitespace-pre-line text-sm">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      <SiteFooter />
    </main>
  );
}