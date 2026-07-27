"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldAlert, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // You would fetch this from your Supabase auth context
  const mockUserId = "user-id-here"; 

  const handleCheckout = async (priceId: string, mode: string) => {
    setIsLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: mockUserId, priceId, mode }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start checkout.");
      }
    } catch (error) {
      toast.error("Checkout service unavailable.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center pb-20">
      <div className="w-full px-6 pt-6 flex justify-center">
        {/* Pass actual first name from context in production */}
        <SiteHeader firstName="Account Holder" /> 
      </div>

      <div className="w-full max-w-5xl px-6 pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900">Manage Your Account</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Upgrade your membership to unlock more Sparks and support more Learner Profiles.
          </p>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          
          {/* SOLO PLAN */}
          <Card className="border-2 border-slate-200 relative shadow-sm flex flex-col">
            <CardHeader className="text-center pb-4 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-800">Solo Scholar</CardTitle>
              <div className="mt-4 text-3xl font-black text-slate-900">$9.99<span className="text-sm font-medium text-slate-500">/mo</span></div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <ul className="space-y-3 text-sm text-slate-700 font-medium flex-1">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> 1 Learner Profile</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> 8 Sparks per month</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Sparks accumulate up to 3 months</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Option to buy additional 4-Spark Packs</li>
              </ul>
              <Button 
                onClick={() => handleCheckout("price_solo_id", "subscription")}
                disabled={!!isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12"
              >
                {isLoading === "price_solo_id" ? "Processing..." : "Select Solo"}
              </Button>
            </CardContent>
          </Card>

          {/* FAMILY PLAN */}
          <Card className="border-2 border-teal-500 relative shadow-xl flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <CardHeader className="text-center pb-4 border-b border-slate-100 bg-teal-50/30">
              <CardTitle className="text-2xl font-bold text-slate-800">Family Plan</CardTitle>
              <div className="mt-4 text-3xl font-black text-slate-900">$19.99<span className="text-sm font-medium text-slate-500">/mo</span></div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <ul className="space-y-3 text-sm text-slate-700 font-medium flex-1">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Up to 5 Learner Profiles</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> 8 Sparks per student per month</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Sparks accumulate up to 3 months</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Sparks reload on your subscription renewal day</li>
              </ul>
              <Button 
                onClick={() => handleCheckout("price_family_id", "subscription")}
                disabled={!!isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12"
              >
                {isLoading === "price_family_id" ? "Processing..." : "Select Family"}
              </Button>
            </CardContent>
          </Card>

          {/* CLASSROOM PLAN */}
          <Card className="border-2 border-slate-200 relative shadow-sm flex flex-col">
            <CardHeader className="text-center pb-4 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-800">Classroom</CardTitle>
              <div className="mt-4 text-3xl font-black text-slate-900">$49.99<span className="text-sm font-medium text-slate-500">/mo</span></div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <ul className="space-y-3 text-sm text-slate-700 font-medium flex-1">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> Up to 30 Learner Profiles</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> Pooled Spark logic (Sparks can be used for any learner)</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> Sparks accumulate up to 3 months</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> No individual Fair Use limits</li>
              </ul>
              <Button 
                onClick={() => handleCheckout("prod_UxMsst5r7iZfnl", "subscription")}
                disabled={!!isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12"
              >
                {isLoading === "prod_UxMsst5r7iZfnl" ? "Processing..." : "Select Classroom"}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* ONE-OFF PURCHASES & POLICY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          
          <Card className="border border-orange-200 bg-orange-50/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" /> Need More Sparks Now?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Running low before your monthly reset? Buy a top-up pack to keep planning.
              </p>
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800">4 Spark Pack</h4>
                  <p className="text-xs text-slate-500">$3.99</p>
                </div>
                <Button 
                  onClick={() => handleCheckout("prod_UxMoASRnl4acGz", "payment")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-slate-500" /> Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed">
                To ensure high quality and prevent abuse of the AI generation engine, MiSpark applies a standard Fair Use Limit for Solo and Family plans. Generative requests are capped at a maximum of <strong>5 plans per student, per week</strong>. 
                <br/><br/>
                <em>Note: Classroom and Platinum tier accounts pool their sparks and are exempt from individual Fair Use limits.</em>
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </main>
  );
}