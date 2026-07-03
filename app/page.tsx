
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sparkles, GraduationCap, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* GLOBAL HEADER */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 rounded-b-xl shadow-sm">
        <div className="text-2xl font-extrabold tracking-tight">
          <span className="text-teal-500">mi</span>
          <span className="text-orange-500">Spark</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated === null ? (
            <div className="w-20 h-8 bg-slate-200 animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <Button onClick={() => router.push("/dashboard")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button onClick={() => router.push("/login")} variant="ghost" className="text-slate-600 font-semibold">
                Sign In
              </Button>
              <Button onClick={() => router.push("/login?signup=true")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm">
                Get Started Free
              </Button>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 text-center space-y-8 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-sm font-extrabold px-4 py-1.5 rounded-full border border-orange-200 shadow-sm animate-bounce">
          <Sparkles className="w-4 h-4" /> Built For Neurodivergent Thinkers
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none max-w-4xl">
          Turn Any Homeschool Topic Into A <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500">Tailored Dynamic Adventure</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl font-medium leading-relaxed">
          Upload your state syllabus or weekly targets. miSpark immediately builds curated game nights, precise reading lists, audio discovery logs, and duration-calibrated worksheets matching your child's exact profile.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
          <Button 
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")} 
            className="w-full sm:w-auto bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-black text-xl py-8 px-12 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
          >
            {isAuthenticated ? "Launch Dashboard ✨" : "Ignite Your Curriculum Free ✨"}
          </Button>
        </div>

        {/* TRUST ACCREDITATION BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full max-w-4xl">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 text-left">
            <GraduationCap className="w-8 h-8 text-teal-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-extrabold text-slate-800">State Standard Aligned</h3>
              <p className="text-xs text-slate-500 mt-1">Calibrates automatically to your home state's strict learning laws.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 text-left">
            <CheckCircle2 className="w-8 h-8 text-orange-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-extrabold text-slate-800">Duration-Calibrated</h3>
              <p className="text-xs text-slate-500 mt-1">Worksheets adapt problem counts directly to student focus bursts.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 text-left">
            <ShieldCheck className="w-8 h-8 text-indigo-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-extrabold text-slate-800">Legal Portfolio Builder</h3>
              <p className="text-xs text-slate-500 mt-1">Upload executed work to auto-compile compliant legal tracking profiles.</p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 text-center text-xs font-bold text-slate-400">
        © {new Date().getFullYear()} miSpark. All Rights Reserved.
      </footer>
    </div>
  );
}