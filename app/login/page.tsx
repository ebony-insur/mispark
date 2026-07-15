"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; // Adjust this import to match your setup
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Added toggle state
  
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
            
            {/* Password Input with Reveal Toggle */}
            <div className="relative mt-1">
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowPasswordWarning(false); // Hide warning once they start typing again
                }} 
                required 
                className={`pr-10 ${showPasswordWarning ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
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
}"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image"; // For the Google logo

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Loading and UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Prevents double-clicks and shows success state
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Note: Supabase handles the redirect automatically here
    } catch (error: any) {
      toast.error(error.message || "Google authentication failed.");
      setIsGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        
        setIsSuccess(true);
        toast.success("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        setIsSuccess(true);
        toast.success("Welcome back! Redirecting...");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed.");
      setIsLoading(false); // Only unlock the form if it fails
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {/* 📍 FIXED: Capitalized the 'M' */}
            <span className="text-teal-500">Mi</span><span className="text-orange-500">Spark</span>
          </h1>
          <p className="text-slate-500 mt-2">
            {isSuccess 
              ? (isSignUp ? "Account created!" : "Redirecting...")
              : (isSignUp ? "Create your parent account" : "Sign in to your account")}
          </p>
        </div>

        {/* 📍 ADDED: Google Login Button */}
        {!isSuccess && (
          <div className="mb-6 space-y-4">
            <Button 
              type="button"
              variant="outline"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleLogin}
              className="w-full font-bold py-6 border-2 flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              {isGoogleLoading ? (
                "Connecting to Google..."
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.34H19.3C21.39 18.41 22.56 15.59 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.3 20.34L15.73 17.57C14.73 18.24 13.48 18.65 12 18.65C9.12 18.65 6.69 16.7 5.81 14.07H2.13V16.92C3.96 20.55 7.69 23 12 23Z" fill="#34A853"/>
                    <path d="M5.81 14.07C5.58 13.4 5.46 12.71 5.46 12C5.46 11.29 5.58 10.6 5.81 9.93V7.08H2.13C1.37 8.59 0.94 10.24 0.94 12C0.94 13.76 1.37 15.41 2.13 16.92L5.81 14.07Z" fill="#FBBC05"/>
                    <path d="M12 5.35C13.62 5.35 15.06 5.9 16.2 7.01L19.39 3.82C17.45 2.01 14.97 0.94 12 0.94C7.69 0.94 3.96 3.45 2.13 7.08L5.81 9.93C6.69 7.3 9.12 5.35 12 5.35Z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-bold">Or continue with email</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading || isSuccess} // Lock input during loading/success
              className="mt-1 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Password</label>
              {!isSignUp && !isSuccess && (
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
            
            <div className="relative mt-1">
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowPasswordWarning(false);
                }} 
                required 
                disabled={isLoading || isSuccess} // Lock input during loading/success
                className={`pr-10 disabled:opacity-50 ${showPasswordWarning ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <button
                type="button"
                disabled={isLoading || isSuccess}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none disabled:opacity-50"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {(isSignUp || showPasswordWarning) && !isSuccess && (
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

          {/* 📍 SUCCESS / LOADING SHIELD */}
          {isSuccess ? (
            <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-6 mt-4 rounded-lg flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> 
              {isSignUp ? "Check your email!" : "Success! Loading Dashboard..."}
            </div>
          ) : (
            <Button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-6 mt-4">
              {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          )}
        </form>

        {!isSuccess && (
          <div className="mt-6 text-center text-sm text-slate-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              disabled={isLoading}
              className="ml-1 font-bold text-teal-600 hover:underline disabled:opacity-50"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Criterion({ met, text }: { met: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 ${met ? 'text-emerald-600' : 'text-slate-500'}`}>
      {met ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-50" />}
      {text}
    </li>
  );
}