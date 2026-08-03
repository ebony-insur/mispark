"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ShieldAlert, Zap, UserCheck, Mail, Award, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";

export default function BillingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  
  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("Free");

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push("/login");
        return;
      }
      
      setUserId(user.id);
      setEmail(user.email || ""); 

      // Fetch the full profile details including the subscription tier and stripe ID
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, subscription_tier, stripe_customer_id")
        .eq("id", user.id)
        .single();

      const profile = data as any;

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setSubscriptionTier(profile.subscription_tier || "Free");
        setStripeCustomerId(profile.stripe_customer_id || null);
      }
    };
    fetchUserAndProfile();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSavingProfile(true);
    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({ first_name: firstName, last_name: lastName })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Account name updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Upgrades and Spark Purchases
  const handleCheckout = async (priceId: string, mode: string) => {
    if (!userId) {
      toast.error("Please wait, securing your session...");
      return;
    }

    setIsLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, priceId, mode }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout.");
      }
    } catch (error) {
      toast.error("Checkout service unavailable.");
    } finally {
      setIsLoading(null);
    }
  };

  // Manage Active Subscriptions (Portal)
  const handleManageBilling = async () => {
    if (!stripeCustomerId) {
      toast.error("You don't have an active billing profile yet.");
      return;
    }

    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: stripeCustomerId }), 
      });
      const data = await res.json();
      
      if (res.ok && data.url) {
        window.location.href = data.url; 
      } else {
        toast.error(data.error || "Could not open billing portal.");
      }
    } catch (err) {
      toast.error("Failed to connect to billing portal.");
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center pb-20">
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader firstName={firstName} /> 
      </div>

      <div className="w-full max-w-5xl px-6 pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900">Manage Your Account</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Update your personal details or upgrade your plan to unlock more capabilities.
          </p>
        </div>

        {/* PROFILE SETTINGS CARD */}
        <Card className="border-2 border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" /> Account Holder Details
            </CardTitle>
            
            {/* NEW PORTAL BUTTON */}
            {stripeCustomerId && (
               <Button 
                onClick={handleManageBilling} 
                disabled={isPortalLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
              >
                {isPortalLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                ) : (
                    <><CreditCard className="w-4 h-4 mr-2" /> Manage Subscription</>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700">First Name</label>
                  <Input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                    className="mt-1 font-medium bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">Last Name</label>
                  <Input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                    className="mt-1 font-medium bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-slate-400"/> Email Address
                  </label>
                  <Input 
                    type="email" 
                    value={email} 
                    disabled 
                    className="font-medium bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-amber-500"/> Current Plan
                  </label>
                  <div className="h-10 px-4 rounded-lg border-2 border-amber-200 bg-amber-50 flex items-center font-black text-amber-800">
                    {subscriptionTier}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 h-12 rounded-xl"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
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
                onClick={() => handleCheckout("price_1Tx7p1F035PE8L5xqpQM4t3N", "subscription")}
                disabled={!!isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12"
              >
                {isLoading === "price_1Tx7p1F035PE8L5xqpQM4t3N" ? "Processing..." : "Select Solo"}
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
                onClick={() => handleCheckout("price_1Tx7p6F035PE8L5x6tZ4zLYx", "subscription")}
                disabled={!!isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12"
              >
                {isLoading === "price_1Tx7p6F035PE8L5x6tZ4zLYx" ? "Processing..." : "Select Family"}
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
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> Pooled Spark logic</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> Sparks accumulate up to 3 months</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> No individual Fair Use limits</li>
              </ul>
              <Button 
                onClick={() => handleCheckout("price_1TxS8KF035PE8L5xuMDlFLVc", "subscription")}
                disabled={!!isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12"
              >
                {isLoading === "price_1TxS8KF035PE8L5xuMDlFLVc" ? "Processing..." : "Select Classroom"}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* ONE-OFF PURCHASES & POLICY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
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
                  <p className="text-xs text-slate-500">$4.99</p>
                </div>
                <Button 
                  onClick={() => handleCheckout("price_1TxS58F035PE8L5xlVgjHpst", "payment")}
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