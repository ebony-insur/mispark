"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Auto-switch to Sign Up if they came from the "Start Free Trial" button
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // SIGN UP FLOW
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        // The Supabase Email Enumeration Trick:
        // If identities is empty, the user already exists.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setIsSignUp(false);
        } else {
          toast.success("Check your email to confirm your account!");
          setEmail("");
          setPassword("");
        }
      } else {
        // SIGN IN FLOW
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Incorrect email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
          throw error;
        }

        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-slate-600 font-medium">
          {isSignUp ? "Start saving hours on curriculum planning today." : "Log in to your MiSpark dashboard."}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        
        {/* GOOGLE BUTTON */}
        <Button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 mb-6 flex items-center justify-center gap-3"
        >
          {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute border-t border-slate-200 w-full"></div>
          <span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase relative z-10">or continue with email</span>
        </div>

        {/* EMAIL FORM */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
              <Input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Password</label>
              {!isSignUp && (
                <button type="button" onClick={() => toast.info("Password reset coming soon!")} className="text-xs font-bold text-teal-600 hover:text-teal-700">
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
        </form>
      </div>

      <div className="text-center text-sm font-medium text-slate-600">
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="font-bold text-teal-600 hover:text-teal-700"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 py-12 px-6">
      <Button 
        onClick={() => router.push("/")} 
        variant="ghost" 
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
      </Button>
      
      <div className="mb-8 cursor-pointer" onClick={() => router.push("/")}>
        <Image src="/MiSpark.svg" alt="MiSpark Logo" width={160} height={50} />
      </div>

      {/* Suspense is required by Next.js when using useSearchParams() */}
      <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-teal-500"/></div>}>
        <AuthContent />
      </Suspense>
    </main>
  );
}