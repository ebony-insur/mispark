"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
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

  return (
    <header className="w-full max-w-6xl flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 mb-6 print:hidden">
      
      {/* LOGO - Now strictly routes to home page */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image src="/MiSpark.svg" alt="MiSpark Logo" width={120} height={35} priority />
      </Link>

      {/* DYNAMIC NAVIGATION LINKS (Hidden on Mobile) */}
      <nav className="hidden lg:flex items-center gap-5">
        {isLoaded && hasUser ? (
          <>
            <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Planner</Link>
            <Link href="/students" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Learners</Link>
            <Link href="/history" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">History</Link>
            <Link href="/portfolio" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Portfolios</Link>
            <Link href="/help" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Success Guide</Link>
            <Link href="/faq" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">FAQ</Link>
            <Link href="/account" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">My Account</Link>
          </>
        ) : isLoaded ? (
          <>
            <Link href="/features" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Features</Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Live Demo</Link>
            <Link href="/help" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">Success Guide</Link>
            <Link href="/faq" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">FAQ</Link>
          </>
        ) : null}
      </nav>

      {/* AUTH BUTTONS */}
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
            <Link href="/login" className="hidden sm:block">
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