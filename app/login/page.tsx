"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Target, FileCheck, HeartHandshake, Sparkles } from "lucide-react";
import Image from "next/image";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignUpDefault = searchParams.get("signup") === "true";

  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        
        if (error) throw error;

        // SUPABASE EXISTING USER CHECK: 
        // If identities array is empty, the email is already registered.
        if (data?.user && data.user.identities && data.user.identities.length === 0) {
          toast.error("An account with this email already exists. Please log in.");
          setIsLoading(false);
          return; 
        }

        toast.success("Success! Please check your email for the confirmation link.");
        // Optional: clear form
        setEmail(""); setPassword(""); setConfirmPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        // Force a hard reload to ensure Supabase auth cookies are perfectly synced
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200">
      <div className="flex justify-center mb-8 md:hidden">
        <Image src="/MiSpark.svg" alt="MiSpark Logo" width={140} height={40} />
      </div>

      <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-2">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h2>
      <p className="text-slate-500 text-center mb-8 font-medium">
        {isSignUp ? "Start generating customized lesson plans today." : "Log in to view your plans and portfolios."}
      </p>

      <form onSubmit={handleAuth} className="space-y-5">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">Email Address</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="you@example.com"
            className="h-14 text-lg rounded-xl border-slate-200 focus-visible:ring-teal-500"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            className="h-14 text-lg rounded-xl border-slate-200 focus-visible:ring-teal-500"
          />
          {/* PASSWORD REQUIREMENTS - ONLY SHOWS ON SIGNUP */}
          {isSignUp && (
            <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-teal-500' : 'bg-slate-300'}`}></span>
              Must be at least 6 characters long
            </p>
          )}
        </div>
        
        {isSignUp && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-bold text-slate-700 mb-1 block">Confirm Password</label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              className="h-14 text-lg rounded-xl border-slate-200 focus-visible:ring-teal-500"
            />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-14 text-xl bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl mt-6 shadow-md transition-transform active:scale-[0.98]"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? "Create Account" : "Log In")}
        </Button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-slate-100">
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="text-slate-500 hover:text-teal-700 font-bold text-base transition-colors"
        >
          {isSignUp ? "Already have an account? Log in here." : "Need an account? Sign up free."}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* LEFT COLUMN: MARKETING & FEATURES */}
      <div className="w-full md:w-5/12 lg:w-1/2 bg-teal-900 text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-800 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-lg mx-auto md:mx-0">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-12 -ml-4 text-teal-100 hover:text-white hover:bg-teal-800">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>

          <div className="hidden md:block mb-10">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              Homeschooling, <br/>
              <span className="text-teal-300">simplified.</span>
            </h1>
            <p className="text-teal-100 text-lg font-medium">Create your free account to unlock the full power of MiSpark's AI curriculum engine.</p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="bg-orange-500/20 p-3 rounded-2xl shrink-0">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Custom Learner Profiles</h3>
                <p className="text-teal-100/80 font-medium text-sm leading-relaxed">The AI curates books and hands-on activities based on your child's specific grade, interests, and sensory needs.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-blue-500/20 p-3 rounded-2xl shrink-0">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Automatic State Standards</h3>
                <p className="text-teal-100/80 font-medium text-sm leading-relaxed">Never guess if you are compliant. We automatically map your topics directly to your state's specific educational requirements.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-rose-500/20 p-3 rounded-2xl shrink-0">
                <FileCheck className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Printable Portfolios</h3>
                <p className="text-teal-100/80 font-medium text-sm leading-relaxed">Snap a photo of their work, track their progress, and generate evaluator-approved end-of-year reports instantly.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-emerald-500/20 p-3 rounded-2xl shrink-0">
                <HeartHandshake className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Smart Feedback Loop</h3>
                <p className="text-teal-100/80 font-medium text-sm leading-relaxed">Rate the activities as you go. The engine learns exactly what your child loves and adapts future lesson plans to match.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AUTH FORM */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 py-12 md:p-12 relative z-10">
        <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-teal-600" />}>
          <AuthForm />
        </Suspense>
      </div>

    </main>
  );
}