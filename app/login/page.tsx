"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";

// We extract the form into its own component so we can wrap it in <Suspense>
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignUpDefault = searchParams.get("signup") === "true";

  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
      
      <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 -ml-4 text-slate-500">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Button>

      <div className="flex justify-center mb-8">
        <Image src="/MiSpark.svg" alt="MiSpark Logo" width={150} height={50} />
      </div>

      <h1 className="text-2xl font-black text-slate-900 text-center mb-2">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="text-slate-500 text-center mb-8 font-medium">
        {isSignUp ? "Start generating lesson plans today." : "Log in to view your plans and portfolios."}
      </p>

      <Button 
        onClick={handleGoogleSignIn} 
        disabled={isGoogleLoading || isLoading}
        variant="outline" 
        className="w-full h-12 text-base font-bold mb-6 border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        {isGoogleLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </Button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-slate-400 text-sm font-bold uppercase">Or use email</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">Email Address</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="h-12 rounded-xl border-slate-200"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="h-12 rounded-xl border-slate-200"
          />
        </div>
        
        {isSignUp && (
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1 block">Confirm Password</label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className="h-12 rounded-xl border-slate-200"
            />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || isGoogleLoading}
          className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl mt-4"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Sign Up" : "Log In")}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="text-slate-500 hover:text-teal-600 font-bold text-sm transition-colors"
        >
          {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

// The main page wraps the form in a Suspense boundary
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-teal-600" />}>
        <AuthForm />
      </Suspense>
    </main>
  );
}