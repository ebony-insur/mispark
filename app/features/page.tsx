"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import { 
  Target, Sparkles, FileCheck, HeartHandshake, 
  CheckCircle2, ArrowRight, BrainCircuit, Library, Blocks 
} from "lucide-react";

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 overflow-x-hidden">
      
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader />
      </div>

      {/* SEO HERO SECTION */}
      <section className="w-full max-w-4xl px-6 pt-12 pb-16 text-center animate-in fade-in slide-in-from-bottom-8">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Everything You Need to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
            Homeschool with Confidence
          </span>
        </h1>
        <p className="text-xl text-slate-600 font-medium leading-relaxed">
          Explore the powerful features behind MiSpark's AI curriculum planner. Designed to save you hours of prep time while keeping your learner engaged and your state evaluator happy.
        </p>
      </section>

      {/* DEEP DIVE: STATE STANDARDS */}
      <section className="w-full max-w-5xl px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs uppercase tracking-wider">
                <Target className="w-4 h-4" /> State Compliance
              </div>
              <h2 className="text-3xl font-black text-slate-900">Automated State Standards Mapping</h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                One of the most stressful parts of homeschooling is ensuring your curriculum meets local legal requirements. MiSpark completely removes this burden. When you generate a lesson plan, our AI automatically cross-references your topics with your state's specific educational standards.
              </p>
              <ul className="space-y-4 text-slate-700 font-bold">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0"/> 
                  <span><strong>Subject-Specific Breakdown:</strong> Easily see exactly which math, reading, or science standard your lesson satisfies.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0"/> 
                  <span><strong>Evaluator-Ready Vocabulary:</strong> We translate standard educational concepts into the official terminology state evaluators look for.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center min-h-[300px]">
              <Library className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">SEO Optimization: Search engines index this rich text to rank you for "homeschool state standards planner."</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE: PERSONALIZED LEARNING */}
      <section className="w-full max-w-5xl px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Learner Aligned
              </div>
              <h2 className="text-3xl font-black text-slate-900">Hyper-Personalized Curriculum Design</h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Generic workbooks lead to frustration. MiSpark takes your learner's unique profile—their grade level, attention span, interests, and sensory needs—and crafts a multi-sensory lesson plan designed specifically for how their brain works.
              </p>
              <ul className="space-y-4 text-slate-700 font-bold">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0"/> 
                  <span><strong>Tactile & Visual Tools:</strong> Get specific recommendations for manipulatives and sensory tools to cement learning.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0"/> 
                  <span><strong>Multi-Modality:</strong> Every plan includes reading lists, hands-on activities, board game suggestions, and curated videos.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center min-h-[300px]">
              <Blocks className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">SEO Optimization: Ranks for "customized homeschool curriculum" and "neurodivergent lesson planner."</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE: PORTFOLIOS */}
      <section className="w-full max-w-5xl px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-bold text-xs uppercase tracking-wider">
                <FileCheck className="w-4 h-4" /> Portfolios
              </div>
              <h2 className="text-3xl font-black text-slate-900">Instant, Printable Homeschool Portfolios</h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Stop scrambling at the end of the year to organize a binder. With MiSpark's evidence uploader, you can snap a photo of your learner's work and instantly attach it to a specific state standard. When it's time for your review, generate a professional portfolio with one click.
              </p>
              <ul className="space-y-4 text-slate-700 font-bold">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-500 shrink-0"/> 
                  <span><strong>Secure Cloud Storage:</strong> Keep all your academic evidence safe and organized by date and subject.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-500 shrink-0"/> 
                  <span><strong>Evaluator-Approved Formatting:</strong> Clean, distraction-free printouts that clearly display standard mastery and educator notes.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center min-h-[300px]">
              <FileCheck className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">SEO Optimization: Ranks for "homeschool portfolio app" and "state evaluator report builder."</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE: AI FEEDBACK LOOP */}
      <section className="w-full max-w-5xl px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4" /> Smart Engine
              </div>
              <h2 className="text-3xl font-black text-slate-900">An Engine That Learns With You</h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                MiSpark isn't just a static planner. Our proprietary dual-rating system allows you to log both your learner's academic mastery (for the state) and their enjoyment level (for the AI). If a kid loves a specific game or book, MiSpark learns to recommend similar activities in the future.
              </p>
              <ul className="space-y-4 text-slate-700 font-bold">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-rose-500 shrink-0"/> 
                  <span><strong>Continuous Improvement:</strong> The longer you use MiSpark, the more accurate and engaging the lesson plans become.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center min-h-[300px]">
              <BrainCircuit className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">SEO Optimization: Ranks for "adaptive homeschool curriculum AI."</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="w-full bg-teal-900 py-24 px-6 text-center mt-12">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Experience the Features Live</h2>
        <p className="text-xl text-teal-100 font-medium mb-10 max-w-2xl mx-auto">Create your first personalized, state-aligned lesson plan in under 60 seconds.</p>
        <Button 
          onClick={() => router.push("/login?signup=true")} 
          className="h-16 px-10 text-xl bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          Start Your Free Trial ✨
        </Button>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-slate-900 py-8 px-6 text-center border-t border-slate-800">
        <div className="flex justify-center gap-6 mb-4">
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
            Home
          </button>
          <button onClick={() => router.push("/help")} className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
            Help & Best Practices
          </button>
          <a href="mailto:support@mispark.com" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
            Contact Support
          </a>
        </div>
        <p className="text-slate-600 text-sm font-medium">© {new Date().getFullYear()} MiSpark. All rights reserved.</p>
      </footer>

    </main>
  );
}