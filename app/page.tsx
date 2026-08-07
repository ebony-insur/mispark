"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Target, 
  HeartHandshake, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Camera, 
  UploadCloud,
  Brain,
  Activity,
  FileText,
  Award
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 overflow-x-hidden">
      
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader />
      </div>

      {/* HERO SECTION */}
      <section className="w-full max-w-6xl px-6 pt-12 pb-16 flex flex-col md:flex-row items-center justify-between gap-12 animate-in fade-in slide-in-from-bottom-8">
        <div className="w-full md:w-[60%] flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-900 font-bold text-sm mb-8 border border-teal-200">
            <Lock className="w-4 h-4" /> 100% Private, Zero-PII AI Engine
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            You bring the curriculum. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
              We build the plan.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mb-10 leading-relaxed">
            The secure AI sidekick engineered for educators and parents to instantly adapt any lesson to a child's unique learning style. 
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 w-full justify-center md:justify-start flex-wrap">
            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => router.push("/login?signup=true")} 
                className="h-16 px-8 w-full text-xl bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Start Free Trial <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                No Credit Card Required
              </span>
            </div>
            
            <Button 
              onClick={() => router.push("/why-spark")} 
              variant="outline"
              className="h-16 px-8 w-full sm:w-auto text-xl border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-100"
            >
              See How It Works
            </Button>
          </div>
        </div>

        <div className="w-full md:w-[40%] flex justify-center md:justify-end">
          {/* FIX: Replaced the logo with a dedicated hero image placeholder. Change the src filename to your actual hero graphic! */}
          <Image 
            src="/heroside.png" 
            alt="Mi-Spark Inclusive AI Learning" 
            width={600} 
            height={600} 
            className="w-full max-w-[500px] h-auto drop-shadow-2xl"
            priority
          />
        </div>
      </section>

      {/* VALUE PROP DIVIDER */}
      <div className="w-full bg-slate-900 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Hours Saved Weekly", value: "10+" },
            { label: "Data Exposed", value: "ZERO" },
            { label: "Learning Styles", value: "Infinite" },
            { label: "Portfolio Creation", value: "Instant" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</span>
              <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-STEP VISUAL ACTIVATION */}
      <section className="w-full bg-slate-50 pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">From messy materials to master plans in seconds.</h2>
              <p className="text-xl text-slate-600 font-medium">No typing required. Just use your phone camera or upload a file, and let our multi-model AI do the heavy lifting.</p>
            </div>

            {/* Step 1: Snap It */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 order-2 md:order-1 relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <Image src="/screenshots/snapit.png" alt="Snap a picture of a worksheet" fill className="object-cover" />
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2 space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">1. Snap It.</h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Take a picture of any dry textbook page, handwritten notes, or standard worksheet. Our enterprise vision models can instantly read and extract the core concepts from almost any image.
                </p>
              </div>
            </div>

            {/* Step 2: Drop It */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500 text-white shadow-lg">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">2. Drop It.</h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Drop it into the Mi-Spark engine and select your learner. We instantly translate the dry material into a custom-tailored, highly engaging lesson plan based on their specific neurodivergence and interests.
                </p>
              </div>
              <div className="w-full md:w-1/2 relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <Image src="/screenshots/DropIt.png" alt="Drop it into the Mi-Spark interface" fill className="object-cover" />
              </div>
            </div>
        </div>
      </section>

      {/* NEW: WHAT YOU GET BANNER */}
      <section className="w-full bg-teal-700 py-16 px-6 border-y border-teal-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-10">Personalized Results That Learn What You Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "Neuro-Adapted Pacing", desc: "Automatic micro-steps and adjusted language processing for ADHD, Autism, and PDA learners." },
              { icon: Activity, title: "Sensory Integration", desc: "Built-in brain breaks and physical activities to keep active learners engaged and regulated." },
              { icon: FileText, title: "IEP Accommodations", desc: "Instantly generated visual aids, simplified text, and structured time modifications." },
              { icon: Award, title: "Standard Aligned", desc: "Every output maps to legal portfolio, state standard, and transcript requirements." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-teal-800/50 border border-teal-600/50 p-8 rounded-3xl text-left shadow-lg hover:bg-teal-800 transition-colors">
                <feature.icon className="w-10 h-10 text-teal-300 mb-5" />
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-teal-100 font-medium text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE 4 PILLARS OF MEMBERSHIP */}
      <section className="w-full max-w-6xl px-6 py-24 space-y-32">
         {/* Pillar 1: Curated by Feedback */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center">
              <HeartHandshake className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">An engine that learns what your students love.</h2>
            <p className="text-xl text-slate-600 font-medium">Rate how much your learners enjoyed an activity. Our AI feedback loop ensures that every recommended book, game, and video is a hit moving forward.</p>
          </div>
          <div className="flex-1 w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
            <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
              <span className="text-slate-400 font-bold absolute z-0">Screenshot: Dual Rating Hearts & Stars</span>
              <Image src="/screenshots/feedback-loop.png" alt="Curated by Feedback" fill className="object-cover relative z-10" />
            </div>
          </div>
        </div>
        
        {/* Pillar 2: State Aligned */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">Never guess if you are hitting the standards.</h2>
            <p className="text-xl text-slate-600 font-medium">We map every activity directly to your specific state's educational requirements. Have absolute peace of mind knowing your curriculum is fully compliant.</p>
          </div>
          <div className="flex-1 w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
            <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
              <span className="text-slate-400 font-bold absolute z-0">Screenshot: Applicable Standards Section</span>
              <Image src="/screenshots/state-aligned.png" alt="State Standards" fill className="object-cover relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY SECTION */}
      <section className="w-full max-w-5xl px-6 pb-24 pt-12 mx-auto">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-teal-400 font-bold text-xs uppercase tracking-wider mb-6">
                <ShieldCheck className="w-4 h-4" /> Enterprise-Grade Privacy
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                Why not just use ChatGPT?
              </h2>
              <p className="text-lg text-slate-400 font-medium">
                Public AI models aggregate everything you type into the open web. Mi-Spark was engineered to keep your family and classroom data strictly segmented.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl">
                <h3 className="text-xl font-black text-slate-300 mb-6 flex items-center gap-2">Public AI Tools</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-slate-500">❌</span>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">Your student's data can be used to train public models.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-slate-500">❌</span>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">Requires massive, exhausting prompts every time.</p>
                  </li>
                </ul>
              </div>

              <div className="bg-teal-900/40 border border-teal-700/50 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 bg-teal-500 h-full"></div>
                <h3 className="text-xl font-black text-teal-300 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> The Mi-Spark Architecture
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5"/>
                    <p className="text-teal-50 font-medium text-sm leading-relaxed"><span className="font-bold">Zero PII:</span> We only ask for nicknames. Data never trains public models.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5"/>
                    <p className="text-teal-50 font-medium text-sm leading-relaxed"><span className="font-bold">One-Click Scaling:</span> Profiles save sensory needs securely. Just type a topic and hit go.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="w-full bg-teal-900 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to streamline your lesson planning?</h2>
          <div className="flex flex-col items-center gap-3">
            <Button 
              onClick={() => router.push("/login?signup=true")} 
              className="h-16 px-10 text-xl bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto"
            >
              Set up your secure workspace ✨
            </Button>
            <span className="text-sm font-bold text-teal-200/70 uppercase tracking-wide">
              No Credit Card Required
            </span>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}