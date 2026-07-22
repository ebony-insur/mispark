"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Target, FileCheck, HeartHandshake, ChevronRight, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 overflow-x-hidden">
      
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader />
      </div>

      {/* HERO SECTION (70/30 Split) */}
      <section className="w-full max-w-6xl px-6 pt-12 pb-24 flex flex-col md:flex-row items-center justify-between gap-12 animate-in fade-in slide-in-from-bottom-8">
        
        {/* 70% Text Column */}
        <div className="w-full md:w-[70%] flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-800 font-bold text-sm mb-8 border border-teal-200">
            <Sparkles className="w-4 h-4" /> Stop planning. Start teaching.
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            You bring the topics. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              We build the plan.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mb-10 leading-relaxed">
            Upload your syllabus or type a few topics, and MiSpark instantly generates a flexible, state-aligned curriculum tailored exactly to your learner's needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center md:justify-start">
            <Button 
              onClick={() => router.push("/login?signup=true")} 
              className="h-16 px-8 text-xl bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Start Your Free Trial <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
            <Button 
              onClick={() => router.push("/dashboard")} 
              variant="outline"
              className="h-16 px-8 text-xl border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-100"
            >
              View Live Demo
            </Button>
          </div>
        </div>

        {/* 30% Image Column */}
        <div className="w-full md:w-[30%] flex justify-center md:justify-end">
          <Image 
            src="/heroside.svg" 
            alt="MiSpark Hero" 
            width={400} 
            height={400} 
            className="w-full max-w-[350px] h-auto drop-shadow-xl"
            priority
          />
        </div>

      </section>

      {/* VALUE PROP DIVIDER */}
      <div className="w-full bg-slate-900 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Hours Saved Weekly", value: "10+" },
            { label: "State Standards", value: "Aligned" },
            { label: "Portfolio Creation", value: "Instant" },
            { label: "Learner Engagement", value: "Curated" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</span>
              <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* THE 4 PILLARS OF MEMBERSHIP */}
      <section className="w-full max-w-6xl px-6 py-24 space-y-32">
        
        {/* Pillar 1: State Aligned */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">Never guess if you are hitting the standards.</h2>
            <p className="text-xl text-slate-600 font-medium">We map every activity directly to your specific state's educational requirements. Have absolute peace of mind knowing your curriculum is fully compliant.</p>
            <ul className="space-y-3 text-slate-700 font-bold">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500"/> Core foundation mapping</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500"/> Subject-specific standard breakdowns</li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
            <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
              <span className="text-slate-400 font-bold absolute z-0">Screenshot: Applicable Standards Section</span>
              <Image src="/screenshots/state-aligned.png" alt="State Standards" fill className="object-cover relative z-10" />
            </div>
          </div>
        </div>

        {/* Pillar 2: Learner Aligned */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">Every child is different. Their plan should be too.</h2>
            <p className="text-xl text-slate-600 font-medium">Lessons are automatically scaled to your learner's specific grade level, attention span, interests, and sensory needs. No more fighting through generic workbooks.</p>
            <ul className="space-y-3 text-slate-700 font-bold">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500"/> Tactile & visual tool recommendations</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500"/> Video, reading, and hands-on modalities</li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
            <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
              <span className="text-slate-400 font-bold absolute z-0">Screenshot: Learner Profile / Let's Play Section</span>
              <Image src="/screenshots/learner-plans.png" alt="Learner Aligned" fill className="object-cover relative z-10" />
            </div>
          </div>
        </div>

        {/* Pillar 3: Portfolios */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">Save time reviewing progress with easy-to-use portfolios.</h2>
            <p className="text-xl text-slate-600 font-medium">Snap a picture of their work, tap a star rating, and we automatically build a fully compliant, beautifully formatted state report for you to print at the end of the year.</p>
            <ul className="space-y-3 text-slate-700 font-bold">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-500"/> Instant printable compliance reports</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-500"/> Secure evidence & image storage</li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
            <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
              <span className="text-slate-400 font-bold absolute z-0">Screenshot: The Print Portfolio Page</span>
              <Image src="/screenshots/portfolio-view.png" alt="Automated Portfolios" fill className="object-cover relative z-10" />
            </div>
          </div>
        </div>

        {/* Pillar 4: Curated by Feedback */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center">
              <HeartHandshake className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">An engine that learns what your child loves.</h2>
            <p className="text-xl text-slate-600 font-medium">Rate how much your learner enjoyed an activity. Our AI feedback loop ensures that every recommended book, game, and video is a hit moving forward.</p>
          </div>
          <div className="flex-1 w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
            <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
              <span className="text-slate-400 font-bold absolute z-0">Screenshot: Dual Rating Hearts & Stars</span>
              <Image src="/screenshots/feedback-loop.png" alt="Curated by Feedback" fill className="object-cover relative z-10" />
            </div>
          </div>
        </div>

      </section>

      {/* BOTTOM CTA */}
      <section className="w-full bg-teal-900 py-24 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to get your weekends back?</h2>
        <p className="text-xl text-teal-100 font-medium mb-10 max-w-2xl mx-auto">Join the families using MiSpark to turn hours of curriculum planning into minutes of joyful learning.</p>
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
          <button onClick={() => router.push("/features")} className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
            Features
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