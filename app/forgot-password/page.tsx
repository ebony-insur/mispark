"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <Button variant="ghost" onClick={() => router.push("/login")} className="text-slate-500 hover:text-slate-800 px-0 mb-6">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Login
        </Button>
        
        <h1 className="text-2xl font-black text-slate-800 mb-2">Reset Password</h1>
        <p className="text-slate-500 mb-8 font-medium">Enter your email address and we will send you a link to reset your password.</p>

        {isSuccess ? (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold p-6 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            <p>If an account exists for {email}, a reset link has been sent. Please check your inbox!</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}