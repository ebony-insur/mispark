"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, CheckCircle2, CreditCard, Sparkles, User, Users } from "lucide-react";

// Replace these with your actual Stripe Payment Link URLs once created
const STRIPE_SOLO_URL = "https://buy.stripe.com/test_..."; 
const STRIPE_FAMILY_URL = "https://buy.stripe.com/test_...";
const STRIPE_CUSTOMER_PORTAL = "https://billing.stripe.com/p/login/test_...";

export default function BillingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [sparksBalance, setSparksBalance] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("Free Trial");

  useEffect(() => {
    const fetchBillingData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("parent_profiles")
        .select("sparks_balance, subscription_tier") // Assuming we track this now
        .eq("id", user.id)
        .single();
        
      if (data) {
        setSparksBalance(data.sparks_balance || 0);
        if (data.subscription_tier) setSubscriptionTier(data.subscription_tier);
      }
      setIsLoading(false);
    };

    fetchBillingData();
  }, [router, supabase]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50">Loading Billing...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-slate-500 hover:text-slate-800 px-2">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wide hidden sm:block">
            Current Plan: <span className="text-teal-600">{subscriptionTier}</span>
          </span>
          <Button onClick={() => window.open(STRIPE_CUSTOMER_PORTAL, '_blank')} variant="outline" className="font-bold border-slate-200">
            <CreditCard className="w-4 h-4 mr-2" /> Manage Billing
          </Button>
        </div>
      </div>

      {/* BALANCE HERO */}
      <div className="w-full max-w-4xl bg-slate-900 text-white rounded-3xl p-10 md:p-14 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
        <Zap className="w-16 h-16 fill-amber-400 text-amber-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
        <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Available Bank</h2>
        <div className="text-7xl font-black mb-4 tracking-tighter">
          {sparksBalance} <span className="text-3xl text-slate-400">Sparks</span>
        </div>
        <p className="text-slate-400 font-medium max-w-md mx-auto">
          {subscriptionTier === "Family Unlimited" 
            ? "You have Unlimited Sparks! (Fair use: 5 daily plans per student)." 
            : "Each Spark ignites one complete, tailored weekly curriculum. You don't lose Sparks for failed generations."}
        </p>
      </div>

      {/* PRICING OPTIONS */}
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        
        {/* SOLO SCHOLAR */}
        <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 flex flex-col hover:border-slate-300 transition-colors">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2"><User className="w-6 h-6 text-indigo-500" /> Solo Scholar</h3>
            <p className="text-slate-500 font-medium mt-1">Perfect for teaching one child.</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900">$10</span>
            <span className="text-slate-500 font-bold"> / month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex gap-2 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> 1 Student Profile</li>
            <li className="flex gap-2 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> 10 Sparks per month</li>
            <li className="flex gap-2 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> Unused Sparks rollover (up to 30)</li>
            <li className="flex gap-2 text-slate-600 font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> Premium AI Generation</li>
          </ul>
          <a 
            href={`${STRIPE_SOLO_URL}?prefilled_email=${userEmail}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-4 rounded-xl transition-colors"
          >
            Subscribe Solo
          </a>
        </div>

        {/* FAMILY UNLIMITED */}
        <div className="bg-amber-50 p-8 rounded-2xl border-2 border-amber-300 flex flex-col relative shadow-sm">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-500 text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Best Value
          </div>
          <div className="mb-6">
            <h3 className="text-2xl font-black text-amber-900 flex items-center gap-2"><Users className="w-6 h-6 text-amber-600" /> Family Unlimited</h3>
            <p className="text-amber-700 font-medium mt-1">For active homeschooling families.</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-black text-amber-950">$15</span>
            <span className="text-amber-700 font-bold"> / month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex gap-2 text-amber-900 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" /> Unlimited Student Profiles</li>
            <li className="flex gap-2 text-amber-900 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" /> Infinite Sparks generation*</li>
            <li className="flex gap-2 text-amber-900 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" /> Shared Household Backpack</li>
            <li className="flex gap-2 text-amber-900 font-medium text-sm italic">*Fair use limit: 5 plans per day, per student.</li>
          </ul>
          <a 
            href={`${STRIPE_FAMILY_URL}?prefilled_email=${userEmail}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full block text-center bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Go Unlimited
          </a>
        </div>

      </div>
    </main>
  );
}