"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, GraduationCap, CheckCircle2, ShieldCheck, ArrowRight, 
  ChevronDown, Users, CreditCard, FolderClock, LogOut 
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAccountMenuOpen(false);
    toast.success("Signed out successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* GLOBAL HEADER */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center px-6 py-2 md:py-3 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 rounded-b-xl shadow-sm">
        
        {/* ENLARGED CUSTOM LOGO IN NAVBAR */}
        <div className="cursor-pointer shrink-0 transition-transform hover:scale-105 flex items-center" onClick={() => router.push("/")}>
          <Image 
            src="/MiSpark.svg" 
            alt="miSpark Logo" 
            width={240} 
            height={70} 
            priority 
            className="w-auto h-12 md:h-16 object-contain"
          />
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated === null ? (
            <div className="w-20 h-8 bg-slate-200 animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            // LOGGED IN NAVIGATION
            <>
              <div className="relative">
                <Button 
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} 
                  variant="ghost" 
                  className="text-slate-600 font-semibold flex items-center gap-1 hover:bg-slate-100"
                >
                  My Account <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />
                </Button>

                {/* DROPDOWN MENU */}
                {isAccountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button onClick={() => router.push('/dashboard/students')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium text-slate-700 transition-colors">
                        <Users className="w-4 h-4 text-teal-600" /> Student Profiles
                      </button>
                      <button onClick={() => router.push('/dashboard/billing')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium text-slate-700 transition-colors">
                        <CreditCard className="w-4 h-4 text-indigo-600" /> Payment & Plans
                      </button>
                      <button onClick={() => router.push('/history')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium text-slate-700 transition-colors">
                        <FolderClock className="w-4 h-4 text-orange-600" /> Previous Plans
                      </button>
                      <hr className="my-2 border-slate-100" />
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-sm font-bold text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <Button onClick={() => router.push("/dashboard")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm transition-colors">
                Create Plan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            // PUBLIC NAVIGATION
            <>
              <Button onClick={() => router.push("/login")} variant="ghost" className="text-slate-600 font-semibold hover:bg-slate-100 hidden sm:flex">
                Login
              </Button>
              <Button onClick={() => router.push("/login?signup=true")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm transition-colors">
                Create Plan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col justify-center space-y-16">
        
        {/* TOP SPLIT: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT COLUMN: Text & Buttons */}
          <div className="space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* NEW: EXPLICITLY CENTERED LOGO AND TAGLINE WRAPPER */}
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              <Image 
                src="/MiSpark.svg" 
                alt="miSpark" 
                width={400} 
                height={120} 
                priority 
                className="w-auto h-20 md:h-28 lg:h-32 object-contain"
              />

              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-sm font-extrabold px-4 py-1.5 rounded-full border border-orange-200 shadow-sm animate-bounce">
                <Sparkles className="w-4 h-4" /> Built to Support Curious Learners
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-2xl">
              Turn Any Topic Into A <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500">Tailored Dynamic Adventure</span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
              Upload your state syllabus or weekly targets. miSpark immediately builds curated game nights, precise reading lists, audio discovery logs, and duration-calibrated worksheets matching your child's exact profile.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full lg:justify-start justify-center">
              <Button 
                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")} 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-black text-xl py-8 px-10 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                Create Plan ✨
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Custom Graphic */}
          <div className="flex justify-center lg:justify-end w-full relative">
            <Image 
              src="/heroside.svg" 
              alt="miSpark Dynamic Learning" 
              width={800} 
              height={800} 
              priority 
              className="w-full max-w-xl lg:max-w-2xl h-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* BOTTOM: TRUST ACCREDITATION BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 text-left hover:border-teal-300 transition-colors">
            <GraduationCap className="w-10 h-10 text-teal-500 shrink-0" />
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">State Standard Aligned</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">Calibrates automatically to your home state's strict learning laws.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 text-left hover:border-orange-300 transition-colors">
            <CheckCircle2 className="w-10 h-10 text-orange-500 shrink-0" />
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Duration-Calibrated</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">Worksheets adapt problem counts directly to student focus bursts.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 text-left hover:border-indigo-300 transition-colors">
            <ShieldCheck className="w-10 h-10 text-indigo-500 shrink-0" />
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Legal Portfolio Builder</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">Upload executed work to auto-compile compliant legal tracking profiles.</p>
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