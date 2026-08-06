"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ShieldAlert, Zap, CreditCard, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";

export default function BillingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("Free");
  const [sparksRemaining, setSparksRemaining] = useState<number>(0);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push("/login");
        return;
      }
      
      setUserId(user.id);
      setEmail(user.email || ""); 

      const { data } = await (supabase.from("profiles") as any)
        .select("first_name, last_name, subscription_tier, stripe_customer_id, sparks_remaining")
        .eq("id", user.id)
        .single();

      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setSubscriptionTier(data.subscription_tier || "Free");
        setStripeCustomerId(data.stripe_customer_id || null);
        setSparksRemaining(data.sparks_remaining || 0);
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
    } catch {
      toast.error("Checkout service unavailable.");
    } finally {
      setIsLoading(null);
    }
  };

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
    } catch {
      toast.error("Failed to connect to billing portal.");
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone, and all your learner profiles, generated plans, and remaining Sparks will be permanently erased."
    );
    
    if (!confirmed) return;
    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete account");

      toast.success("Your account has been successfully deleted.");
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete account. Please contact support.");
      setIsDeleting(false);
    }
  };

  const isFreeTier = subscriptionTier === "Free" || subscriptionTier === "Free Trial" || subscriptionTier === "free";

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center pb-20">
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader firstName={firstName} /> 
      </div>

      <div className="w-full max-w-5xl px-6 pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Power Up Your Planning</h1>
        </div>

        {/* COMPACT PROFILE SETTINGS CARD */}
        <Card className="border-2 border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
                <div className="inline-flex h-8 px-3 rounded-md bg-amber-50 border border-amber-200 items-center font-black text-amber-800 text-sm">
                  {subscriptionTier}
                </div>
              </div>
              
              <div className="pl-6 border-l border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Spark Balance</p>
                <p className="text-xl font-black text-amber-500 leading-none">⚡ {sparksRemaining}</p>
              </div>
            </div>
            
            {stripeCustomerId && (
               <Button 
                onClick={handleManageBilling} 
                disabled={isPortalLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm w-full md:w-auto"
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
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">First Name</label>
                  <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="font-medium bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Last Name</label>
                  <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="font-medium bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Email Address (Read-Only)</label>
                  <Input type="email" value={email} disabled className="font-medium bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSavingProfile} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 rounded-lg">
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          <Card className="border-2 border-slate-200 relative shadow-sm flex flex-col">
            <CardHeader className="text-center pb-4 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-800">Gold</CardTitle>
              <div className="mt-4 text-3xl font-black text-slate-900">$10.99<span className="text-sm font-medium text-slate-500">/mo</span></div>
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
                {isLoading === "price_1Tx7p1F035PE8L5xqpQM4t3N" ? "Processing..." : "Select Gold"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-500 relative shadow-xl flex flex-col transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap z-10 shadow-sm">
              Most Popular
            </div>
            <CardHeader className="text-center pb-4 border-b border-slate-100 bg-teal-50/30">
              <CardTitle className="text-2xl font-bold text-slate-800">Platinum</CardTitle>
              <div className="mt-4 text-3xl font-black text-slate-900">$15.99<span className="text-sm font-medium text-slate-500">/mo</span></div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <ul className="space-y-3 text-sm text-slate-700 font-medium flex-1">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Up to 5 Learner Profiles</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> 40 Sparks per month</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Sparks accumulate up to 3 months</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0"/> Sparks reload on renewal day</li>
              </ul>
              <Button 
                onClick={() => handleCheckout("price_1Tx7p6F035PE8L5x6tZ4zLYx", "subscription")}
                disabled={!!isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12"
              >
                {isLoading === "price_1Tx7p6F035PE8L5x6tZ4zLYx" ? "Processing..." : "Select Platinum"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 relative shadow-sm flex flex-col">
            <CardHeader className="text-center pb-4 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-800">Classroom</CardTitle>
              <div className="mt-4 text-3xl font-black text-slate-900">$29.99<span className="text-sm font-medium text-slate-500">/mo</span></div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <ul className="space-y-3 text-sm text-slate-700 font-medium flex-1">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> Up to 30 Learner Profiles</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0"/> 240 Pooled Sparks per month</li>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {!isFreeTier ? (
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
          ) : (
            <div className="hidden md:block"></div> 
          )}

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-slate-500" /> Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed">
                To ensure high quality and prevent abuse of the AI generation engine, MiSpark applies a standard Fair Use Limit for Gold and Platinum plans. Generative requests are capped at a maximum of <strong>5 plans per student, per week</strong>. 
                <br/><br/>
                <em>Note: Classroom tier accounts pool their sparks and are exempt from individual Fair Use limits.</em>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* DANGER ZONE - Account Deletion */}
        <div className="pt-8">
          <Card className="border border-rose-200 bg-rose-50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-rose-800 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-sm text-rose-700 leading-relaxed">
                Permanently delete your account and wipe all generated content. This action cannot be undone. Active subscriptions should be cancelled via the billing portal before deletion.
              </p>
              <Button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 font-bold whitespace-nowrap"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}