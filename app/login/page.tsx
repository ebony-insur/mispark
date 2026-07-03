"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; // Adjust this import to match your setup
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  // Dynamic Password Validation
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If signing up and password fails, stop them and show the warning!
    if (isSignUp && !isPasswordValid) {
      setShowPasswordWarning(true);
      toast.error("Your password doesn't meet the security requirements.");
      return;
    }

    setIsLoading(true);
    setShowPasswordWarning(false);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-teal-500">mi</span><span className="text-orange-500">Spark</span>
          </h1>
          <p className="text-slate-500 mt-2">
            {isSignUp ? "Create your parent account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Password</label>
              {!isSignUp && (
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-xs text-teal-600 px-0 h-auto"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot password?
                </Button>
              )}
            </div>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                setShowPasswordWarning(false); // Hide warning once they start typing again
              }} 
              required 
              className={`mt-1 ${showPasswordWarning ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
          </div>

          {/* PASSWORD CRITERIA BOX - Only shows on Sign Up or if they triggered the warning */}
          {(isSignUp || showPasswordWarning) && (
            <div className={`p-4 rounded-xl border text-sm space-y-2 transition-colors ${showPasswordWarning ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`font-bold flex items-center gap-2 ${showPasswordWarning ? 'text-red-700' : 'text-slate-700'}`}>
                {showPasswordWarning && <AlertCircle className="w-4 h-4" />}
                Password Requirements:
              </p>
              <ul className="space-y-1">
                <Criterion met={criteria.length} text="At least 8 characters" />
                <Criterion met={criteria.uppercase} text="One uppercase letter" />
                <Criterion met={criteria.number} text="One number" />
                <Criterion met={criteria.special} text="One special character (!@#$)" />
              </ul>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-6 mt-4">
            {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-bold text-teal-600 hover:underline">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </main>
  );
}

// Helper component for the checklist
function Criterion({ met, text }: { met: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 ${met ? 'text-emerald-600' : 'text-slate-500'}`}>
      {met ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-50" />}
      {text}
    </li>
  );
}