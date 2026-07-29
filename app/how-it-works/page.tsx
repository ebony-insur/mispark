"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import GlobalAffiliateBanner from "@/components/GlobalAffiliateBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Upload, 
  Sliders, 
  Award, 
  HelpCircle, 
  ChevronDown, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  HeartHandshake, 
  ShieldCheck, 
  Compass, 
  ArrowRight 
} from "lucide-react";

export default function HowItWorksPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "What are 'Sparks' and how do they work?",
      a: "Sparks are generation credits used to turn your weekly topics or uploaded PDFs into fully customized, multi-sensory lesson plans. Subscribed members enjoy unlimited plan generation, while free account users receive monthly Sparks or can redeem bonus codes."
    },
    {
      q: "How does MiSpark handle state compliance and educational standards?",
      a: "When you configure a Learner Profile, you select your state of residence. Our AI automatically maps generated lesson plans, discussion prompts, and activities directly to official state frameworks (such as Texas TEKS, Florida B.E.S.T., or Common Core) so you can document coverage effort-free."
    },
    {
      q: "How do I build and print state portfolio reviews?",
      a: "As your child completes lessons, use the Evidence Uploader to record academic mastery (stars), learner enjoyment (hearts), educator notes, and photos or PDFs of completed work. You can then navigate to your Portfolio page, filter by date range, and click 'Print Portfolio' to generate an evaluator-ready document."
    },
    {
      q: "Can I manage multiple children under one account?",
      a: "Yes! You can create individual profiles for each learner in your household. Each profile stores unique settings for grade level, focus duration, sensory needs, and personal interests, allowing you to generate tailored plans for each child independently."
    },
    {
      q: "Are the recommended books, games, and tools affiliate links?",
      a: "Some recommended physical resources include affiliate search links (e.g., Amazon, ThriftBooks, Bookshop.org). If you choose to purchase a recommended tactile tool or book through those links, we may earn a small commission at no additional cost to you, which helps support platform development."
    },
    {
      q: "What if my child has unique attention spans or sensory needs?",
      a: "MiSpark is built specifically to accommodate neurodiverse and hands-on learners. In your learner's settings, you can adjust focus durations down to short micro-bursts (e.g., 10–15 minutes) and specify tactile, auditory, or visual preferences so every activity matches their capacity."
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-12 print:bg-white print:py-0 print:px-0">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="w-full max-w-5xl text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-teal-600" /> Empowering Personalized Homeschooling
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          How MiSpark Works & Why Homeschoolers Love It
        </h1>
        <p className="text-lg md:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
          Transform raw topics, worksheets, or PDFs into personalized, hands-on learning experiences mapped directly to your state standards.
        </p>
      </section>

      {/* SECTION 1: HOW TO USE MISPARK (STEP-BY-STEP) */}
      <section className="w-full max-w-5xl space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">4 Simple Steps to Stress-Free Planning</h2>
          <p className="text-slate-500 font-medium mt-1">From topic prompt to evaluator-ready portfolio in minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Step 1 */}
          <Card className="border-2 border-slate-200 bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 font-black text-xl flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-600" /> Set Up Learner Profiles
                </h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                  Configure individual learner profiles for each child. Input their grade level, state residence, focus duration, sensory preferences, and topics they are passionate about.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="border-2 border-slate-200 bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" /> Input Topics or Drop a PDF
                </h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                  Type in your weekly math, science, or history goals—or upload a textbook chapter or PDF. MiSpark instantly extracts key concepts to build your lesson plan.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="border-2 border-slate-200 bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 font-black text-xl flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" /> Ignite Custom Curriculum
                </h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                  Click <span className="font-bold text-orange-600">Ignite Curiosity ✨</span> to receive tailored reading lists, tactile games, household science experiments, local field trip ideas, and end-of-week review worksheets.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 4 */}
          <Card className="border-2 border-slate-200 bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black text-xl flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" /> Capture Evidence & Print
                </h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                  Attach photos of completed projects, record mastery ratings, and type educator notes. Generate a clean, printable PDF portfolio for end-of-year state evaluations.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </section>

      {/* SECTION 2: WHY MISPARK IS USEFUL (VALUE PROPOSITION) */}
      <section className="w-full max-w-5xl bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900">Why Educators & Parents Trust MiSpark</h2>
          <p className="text-slate-500 font-medium mt-2">Designed to eliminate decision fatigue, support neurodiverse learning, and keep you legally compliant.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Saves 10+ Hours Every Week</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              No more late nights hunting for worksheets or matching topics to state guidelines. Get complete, multi-modal weekly units in seconds.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Adapts to Sensory & Attention Needs</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Every child learns differently. Tailor activity duration, tactile tools, and game styles to align with what naturally ignites your child&apos;s interest.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Effortless State Compliance</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Stay confident during review time. Track progress with timestamped artifact logging, rating indicators, and one-click printable academic portfolios.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 3: FREQUENTLY ASKED QUESTIONS (FAQS) */}
      <section className="w-full max-w-5xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-teal-600" /> Frequently Asked Questions
          </h2>
          <p className="text-slate-500 font-medium mt-1">Everything you need to know about plans, compliance, and evidence tracking</p>
        </div>

        <div className="space-y-4 pt-2">
          {faqData.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <Card 
                key={index} 
                className="border-2 border-slate-200 bg-white rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-black text-lg text-slate-800 leading-snug">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-teal-600" : ""}`} />
                </button>
                {isOpen && (
                  <CardContent className="px-6 pb-6 pt-0 text-slate-600 font-medium text-base leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="w-full max-w-5xl bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-lg">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Ready to Ignite Your Learner&apos;s Curiosity?</h2>
        <p className="text-slate-300 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          Create your free account today to configure learner profiles and generate personalized, hands-on lesson plans in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link href="/login?signup=true" className="w-full sm:w-auto">
            <Button 
              className="bg-teal-500 hover:bg-teal-600 text-white font-black text-lg px-8 py-6 rounded-2xl shadow-sm w-full"
            >
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 font-bold text-lg px-8 py-6 rounded-2xl w-full"
            >
              Try Live Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER AFFILIATE DISCLAIMER */}
      <div className="w-full max-w-5xl">
        <GlobalAffiliateBanner />
      </div>

    </main>
  );
}