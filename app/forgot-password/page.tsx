// VERCEL, WAKE UP AND READ THIS MODULE
// "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; // Adjust to your setup
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      
      setIsSent(true);
      toast.success("Password reset link sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 relative">
        <button 
          onClick={() => router.push("/login")}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mt-4 mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your email address and we'll send you a secure link to create a new password.
          </p>
        </div>

        {isSent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
            <div className="flex justify-center">
              <MailCheck className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="font-bold text-emerald-800 text-lg">Check your inbox!</h3>
            <p className="text-sm text-emerald-700">
              We sent a password reset link to <strong>{email}</strong>. Click the link in that email to create your new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="name@example.com"
                className="mt-1"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6">
              {isLoading ? "Sending Link..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}