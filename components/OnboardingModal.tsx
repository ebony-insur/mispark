"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingModal({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Data State
  const [userEmail, setUserEmail] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userId, setUserId] = useState("");

  // Form State
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("");
  const [hasConsented, setHasConsented] = useState(false);

  // Options
  const tierOptions = ["Solo", "Modern Family", "Classroom", "Prefer not to say"];
  const focusOptions = ["Neurodivergent", "Hands-On", "Traditional Support", "Prefer not to say"];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || "");
        
        // Grab first name from profiles if available
        const { data } = await (supabase as any)
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();
          
        // Explicitly cast to 'any' to bypass TypeScript's 'never' inference
        const profile = data as any;
          
        if (profile?.first_name) {
          setUserFirstName(profile.first_name);
        }
      }
    };
    fetchUser();
  }, [supabase]);

  const handleComplete = async () => {
    if (!selectedFocus || !hasConsented) {
      toast.error("Please select a focus and agree to the terms.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save data to Supabase profiles table using correct schema columns
      const { error: dbError } = await (supabase as any)
        .from("profiles")
        .update({
          learner_tier: selectedTier,
          primary_focus: selectedFocus,
          marketing_opt_in: hasConsented
        })
        .eq("id", userId);

      if (dbError) throw dbError;

      // 2. Trigger MailerLite sync
      try {
        await fetch("/api/mailerlite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            firstName: userFirstName,
            learnerTier: selectedTier,
            primaryFocus: selectedFocus,
          }),
        });
        console.log("Marketing sync triggered!");
      } catch (mlError) {
        console.error("Failed to trigger marketing sync:", mlError);
        // Fail silently so the user isn't blocked from the app
      }

      toast.success("Welcome to MiSpark!");
      setIsOpen(false);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-teal-600 p-6 text-white text-center">
          <h2 className="text-2xl font-black tracking-tight">Welcome to MiSpark</h2>
          <p className="text-teal-100 font-medium mt-1">Let's personalize your experience.</p>
        </div>

        <div className="p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">How do you primarily teach?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tierOptions.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`p-4 border-2 rounded-xl text-sm font-bold transition-all text-left flex items-center justify-between ${
                        selectedTier === tier 
                          ? "border-teal-600 bg-teal-50 text-teal-900" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {tier}
                      {selectedTier === tier && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedTier}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">What is your primary learning focus?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {focusOptions.map((focus) => (
                    <button
                      key={focus}
                      onClick={() => setSelectedFocus(focus)}
                      className={`p-4 border-2 rounded-xl text-sm font-bold transition-all text-left flex items-center justify-between ${
                        selectedFocus === focus 
                          ? "border-teal-600 bg-teal-50 text-teal-900" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {focus}
                      {selectedFocus === focus && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="consent" className="text-sm font-medium text-slate-600 cursor-pointer">
                  I consent to receiving educational resources and product updates from MiSpark. I understand I can opt out at any time.
                </label>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(1)} 
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-600 font-bold h-12 rounded-xl"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleComplete} 
                  disabled={!selectedFocus || !hasConsented || isSubmitting}
                  className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}