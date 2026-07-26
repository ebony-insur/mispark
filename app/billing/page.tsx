"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, CreditCard, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [sparksBalance, setSparksBalance] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null); // NEW STATE
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("Free Trial");

  useEffect(() => {
    const fetchBillingData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      // UPGRADE: We are now fetching the stripe_customer_id from the database
      const { data } = await supabase
        .from("profiles")
        .select("sparks_remaining, subscription_tier, stripe_customer_id")
        .eq("id", user.id)
        .single();
        
      if (data) {
        setSparksBalance(data.sparks_remaining || 0);
        if (data.subscription_tier) setSubscriptionTier(data.subscription_tier);
        if (data.stripe_customer_id) setStripeCustomerId(data.stripe_customer_id); // Save the ID!
      }
      setIsLoading(false);
    };

    fetchBillingData();
  }, [router, supabase]);

  const handleManageBilling = async () => {
    if (!stripeCustomerId) {
      toast.error("You don't have an active billing profile yet.");
      return;
    }

    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { // Make sure this path matches your file structure!
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // UPGRADE: Now sending the actual Customer ID!
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Account...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-slate-500 hover:text-slate-800 px-2">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Button>
        <h1 className="font-black text-slate-800 text-xl tracking-tight">Manage Account</h1>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-1">Signed in as</h2>
          <div className="flex items-center gap-2 text-xl font-black text-slate-800">
            <Mail className="w-5 h-5 text-teal-600" /> {userEmail}
          </div>
          <p className="text-slate-500 font-medium mt-2">
            Current Plan: <span className="text-teal-600 font-bold">{subscriptionTier}</span>
          </p>
        </div>
        
        {/* UPGRADE: Button handles missing IDs gracefully */}
        <div className="w-full md:w-auto flex flex-col items-end">
          <Button 
            onClick={handleManageBilling} 
            disabled={isPortalLoading || !stripeCustomerId}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-6 px-6 rounded-xl w-full shadow-sm"
          >
            {isPortalLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting to Stripe...</>
            ) : (
                <><CreditCard className="w-4 h-4 mr-2" /> Manage Billing Details</>
            )}
          </Button>
          {!stripeCustomerId && (
            <p className="text-xs text-slate-400 mt-2 font-medium">Subscribe to unlock billing management.</p>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900 text-white rounded-3xl p-10 md:p-14 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
        <Zap className="w-16 h-16 fill-amber-400 text-amber-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
        <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Available Bank</h2>
        <div className="text-7xl font-black mb-4 tracking-tighter">
          {sparksBalance} <span className="text-3xl text-slate-400">Sparks</span>
        </div>
        <p className="text-slate-400 font-medium max-w-md mx-auto">
          {subscriptionTier === "Family Unlimited" 
            ? "You have Unlimited Sparks! (Fair use limits apply)." 
            : "Each Spark ignites one complete, tailored weekly curriculum."}
        </p>
      </div>
    </main>
  );
}