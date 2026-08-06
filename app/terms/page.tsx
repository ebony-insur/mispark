"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Scale, AlertTriangle } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <div className="w-full flex-1 flex flex-col items-center py-12 px-6 space-y-8 mb-24">
        <SiteHeader />

        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
          <div className="text-center border-b border-slate-100 pb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider mb-4">
              <Scale className="w-4 h-4" /> Legal Agreement
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Terms of Service</h1>
            <p className="text-slate-500 font-medium">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="space-y-8 text-slate-700 font-medium leading-relaxed">
            
            <section className="space-y-3 bg-amber-50 border border-amber-200 p-6 rounded-2xl">
              <h2 className="text-xl font-black text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> Educational Disclaimer
              </h2>
              <p className="text-amber-800 text-sm">
                MiSpark is an AI-powered curriculum generation tool designed to assist parents and educators. <strong>We do not guarantee compliance with any specific local, state, or federal homeschooling laws.</strong> It is the sole responsibility of the parent or legal guardian to review generated lesson plans, ensure they are factually accurate, and verify that they meet the legal educational requirements of their specific jurisdiction.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By accessing and using MiSpark, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            {/* SECURITY PATCH: Added Acceptable Use Policy */}
            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">2. Acceptable Use Policy (AUP)</h2>
              <p>
                You agree not to use MiSpark to generate, store, or transmit content that is illegal, sexually explicit, highly provocative, promotes self-harm, or is otherwise dangerous. We reserve the right to immediately suspend or terminate accounts that attempt to bypass AI safety guardrails or violate this Acceptable Use Policy without refund.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">3. Affiliate Links & Monetization</h2>
              <p>
                To help support the platform, MiSpark dynamically generates affiliate links to third-party retailers (such as Amazon) for recommended books, games, and tactile tools. 
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>As an Amazon Associate, MiSpark earns from qualifying purchases.</li>
                <li>You are under no obligation to purchase resources through these links.</li>
                <li>MiSpark is not responsible for the fulfillment, quality, or safety of physical products purchased through third-party vendors.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">4. Subscriptions, Sparks, and Refunds</h2>
              <p>
                MiSpark operates on a combination of recurring subscriptions and generation credits ("Sparks"). 
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Free trials or promotional Sparks have no cash value.</li>
                <li>Subscriptions are billed on a recurring basis. You may cancel at any time through your account dashboard, and you will retain access through the end of your current billing period.</li>
                <li>Because server compute costs are incurred immediately upon generating a lesson plan, we generally do not offer refunds for past usage.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">5. Limitation of Liability</h2>
              <p>
                In no event shall MiSpark, its developers, or its affiliates be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
              </p>
            </section>

          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}