"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowVerificationMessage(false);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/dashboard");

      } else {
        // --- SIGNUP LOGIC ---
        if (!firstName || !lastName) {
          toast.error("Please provide both your first and last name.");
          setIsLoading(false);
          return;
        }

        // Safely determine the redirect URL whether in dev or production
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const redirectUrl = process.env.NEXT_PUBLIC_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
          : `${origin}/auth/callback`;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        // Reset form and show verification message
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setIsLogin(true);
        setShowVerificationMessage(true);
        toast.success("Account created! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 tracking-tight">
            MiSpark
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isLogin ? "Sign in to your account" : "Create your parent account"}
          </p>
        </div>

        {/* Verification Success Box */}
        {showVerificationMessage && (
          <div className="mb-6 bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-teal-800">Check your email</h3>
              <p className="text-sm text-teal-700 mt-1">
                We've sent a verification link to your email address. Please click it to activate your account before logging in.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Show First/Last Name ONLY on Signup */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-700">First Name</label>
                <Input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required={!isLogin} 
                  className="mt-1"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">Last Name</label>
                <Input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required={!isLogin} 
                  className="mt-1"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="mt-1"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mt-1">
              <label className="text-sm font-bold text-slate-700">Password</label>
              {isLogin && (
                <button 
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="mt-1"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 mt-4"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Processing...</>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setShowVerificationMessage(false);
            }} 
            className="font-bold text-teal-600 hover:text-teal-700 transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

      </div>
    </main>
  );
}
