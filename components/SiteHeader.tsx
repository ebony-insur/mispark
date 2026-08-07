"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface SiteHeaderProps {
  firstName?: string;
}

export default function SiteHeader({ firstName }: SiteHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [dbFirstName, setDbFirstName] = useState<string>(firstName || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setHasUser(true);
        if (!firstName) {
          const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("first_name")
            .eq("id", user.id)
            .single();
            
          if (profile?.first_name) {
            setDbFirstName(profile.first_name);
          }
        }
      }
      setIsLoaded(true);
    };
    checkUser();
  }, [supabase, firstName]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  const WhySparkDropdown = () => (
    <div className="relative group z-50">
      <button className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors py-2">
        Why Spark <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </button>
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border border-slate-200 shadow-xl rounded-xl p-2 flex flex-col gap-1">
        <Link href="/about" className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-lg transition-colors">
          Meet Ebony (Founder Story)
        </Link>
        <div className="h-px bg-slate-100 my-1 mx-2"></div>
        <Link href="/why-spark/homeschool" className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-lg transition-colors">
          For Homeschoolers
        </Link>
        <Link href="/why-spark/teachers" className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-lg transition-colors">
          For Teachers & IEPs
        </Link>
        <Link href="/why-spark/coops" className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-lg transition-colors">
          For Co-op Leaders
        </Link>
        <Link href="/why-spark/parents" className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-lg transition-colors">
          For Traditional Parents
        </Link>
      </div>
    </div>
  );

  return (
    <header className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 mb-6 print:hidden">
      
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image src="/MiSpark.svg" alt="MiSpark Logo" width={120} height={35} priority />
      </Link>

      <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-5 order-last w-full lg:w-auto lg:order-none">
        {isLoaded && hasUser ? (
          <>
            <WhySparkDropdown />
            <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Planner</Link>
            <button onClick={() => router.push("/dashboard/students")} className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Learners</button>
            <Link href="/history" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">History</Link>
            <Link href="/portfolio" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Portfolios</Link>
            <Link href="/help" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Success Guide</Link>
            <button onClick={() => router.push("/billing")} className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">My Account</button>
          </>
        ) : isLoaded ? (
          <>
            <WhySparkDropdown />
            <Link href="/features" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Features</Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Live Demo</Link>
            <Link href="/faq" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">FAQ</Link>
          </>
        ) : null}
      </nav>

      <div className="flex items-center gap-4 shrink-0">
        {isLoaded && hasUser ? (
          <div className="flex items-center gap-3">
            {dbFirstName && (
              <span className="text-sm font-extrabold text-slate-700 hidden sm:inline">
                Hello, {dbFirstName}!
              </span>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm" 
              className="border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
            >
              <LogOut className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : isLoaded ? (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-slate-600 hover:text-slate-900">
                Log In
              </Button>
            </Link>
            <Link href="/login?signup=true">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm">
                Sign Up Free
              </Button>
            </Link>
          </div>
        ) : (
          <div className="h-9 w-24 animate-pulse bg-slate-100 rounded-xl"></div>
        )}
      </div>
    </header>
  );
}