"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Zap, User as UserIcon, ChevronDown, ArrowLeft } from "lucide-react";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [sparksBalance, setSparksBalance] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState("Free Trial");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    const fetchAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsGuest(!user);

      if (user) {
        const { data } = await supabase
          .from("parent_profiles")
          .select("sparks_balance, subscription_tier")
          .eq("id", user.id)
          .single();
        if (data) {
          setSparksBalance(data.sparks_balance || 0);
          setSubscriptionTier(data.subscription_tier || "Free Trial");
        }
      }
    };
    fetchAuth();
  }, [supabase]);

  const userFirstName = user?.email 
    ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1).toLowerCase() 
    : "Parent";
    
  const isDashboard = pathname === "/dashboard";

  return (
    <div className="w-full max-w-5xl flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden mb-8">
      <div className="flex items-center gap-4">
        {!isDashboard && (
          <Button 
            onClick={() => router.push("/dashboard")} 
            variant="ghost" 
            className="text-slate-500 hover:text-slate-800 px-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
          </Button>
        )}
        <Image 
          src="/MiSpark.svg" 
          alt="MiSpark Logo" 
          width={120} 
          height={40} 
          className="cursor-pointer" 
          onClick={() => router.push("/")} 
        />
      </div>

      <div className="flex gap-3 items-center">
        {isGuest ? (
          <Button 
            onClick={() => router.push("/login?signup=true")} 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            Sign Up to Save
          </Button>
        ) : (
          <>
            <button 
              onClick={() => router.push("/billing")} 
              className="flex items-center gap-1 bg-amber-50 text-amber-800 px-4 py-2 rounded-xl border border-amber-200 font-bold text-sm transition-colors hover:bg-amber-100"
            >
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" /> 
              {subscriptionTier === "Family Unlimited" ? "Unlimited" : `${sparksBalance} Sparks`}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} 
                onBlur={() => setTimeout(() => setIsAccountMenuOpen(false), 200)} 
                className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <UserIcon className="w-4 h-4" /> Hi, {userFirstName}! <ChevronDown className="w-4 h-4" />
              </button>
              
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <button 
                    onClick={() => router.push("/dashboard")} 
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => router.push("/dashboard/students")} 
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    My Learners
                  </button>
                  {/* UPDATED TERMINOLOGY BELOW */}
                  <button 
                    onClick={() => router.push("/history")} 
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Plan History
                  </button>
                  <button 
                    onClick={() => router.push("/portfolio")} 
                    className="w-full text-left px-4 py-3 text-sm font-black text-teal-700 hover:bg-teal-50"
                  >
                    Portfolios
                  </button>
                  <button 
                    onClick={() => router.push("/billing")} 
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Account
                  </button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button 
                    onClick={() => { supabase.auth.signOut(); router.push("/"); }} 
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}