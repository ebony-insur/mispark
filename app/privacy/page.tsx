"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ShieldCheck, Lock, EyeOff, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <div className="w-full flex-1 flex flex-col items-center py-12 px-6 space-y-8 mb-24">
        <SiteHeader />

        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
          <div className="text-center border-b border-slate-100 pb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" /> Family-First Security
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Privacy & Security Policy</h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              We built MiSpark to keep your family's data safe from the open web. Here is exactly how we protect you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <EyeOff className="w-8 h-8 text-teal-600 mb-3" />
              <h3 className="text-lg font-black text-slate-800 mb-2">No Public AI Training</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Unlike public AI chatbots, the data you enter into MiSpark is sent via secure enterprise API endpoints. Your child's profiles, interests, and struggles are <strong>never</strong> used to train public AI models.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <Lock className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="text-lg font-black text-slate-800 mb-2">Strict Data Siloing</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Your account utilizes Row Level Security (RLS). This means your digital backpack, learner profiles, and generated plans are cryptographically locked to your specific user ID. 
              </p>
            </div>
          </div>

          <div className="space-y-8 text-slate-700 font-medium leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">1. Information We Collect</h2>
              <p>To provide our services, we collect minimal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Your email address and secure authentication data.</li>
                <li><strong>Learner Profiles:</strong> We deliberately ask for <em>nicknames</em>, not full legal names. We collect grade levels, focus durations, broad zip codes (for local field trips), and learning preferences to customize your curriculum.</li>
                <li><strong>Feedback Data:</strong> Hearts and stars ratings you provide on generated activities so our system can learn your child's preferences.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">2. Children's Privacy (COPPA)</h2>
              <p>
                MiSpark is designed strictly for use by parents, educators, and legal guardians. It is not intended for use directly by children under the age of 13. By using MiSpark, you represent that you are the parent or legal guardian inputting non-identifying preferences (nicknames) to generate educational materials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">3. Third-Party Services</h2>
              <p>We use trusted, industry-standard infrastructure to run MiSpark:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Supabase:</strong> For secure database hosting and authentication.</li>
                <li><strong>Stripe:</strong> For secure payment processing. We never see or store your credit card information.</li>
                <li><strong>Enterprise LLMs:</strong> We use secure, zero-retention API agreements to generate lesson plans. Your prompts are processed and immediately discarded by the model providers, not saved for training.</li>
              </ul>
            </section>

            {/* SECURITY PATCH: Added explicit data retention standards */}
            <section className="space-y-3 bg-rose-50 border border-rose-100 p-6 rounded-2xl mt-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" /> Your Right to Delete & Data Retention
              </h2>
              <p className="text-slate-700 text-sm">
                You own your data. At any time, you can request a complete deletion of your account, all associated learner profiles, and generated portfolios by contacting support or via your account dashboard. Upon verification of your request, your personal data will be hard-deleted from our active databases within 30 days. Once deleted, this data cannot be recovered. 
              </p>
            </section>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}