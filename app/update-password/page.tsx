"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; // Adjust to your setup
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Block submission if password isn't strong enough
    if (!isPasswordValid) {
      setShowPasswordWarning(true);
      toast.error("Your password doesn't meet the security requirements.");
      return;
    }

    setIsLoading(true);
    setShowPasswordWarning(false);

    try {
      // Supabase knows who they are based on the secure link they clicked in their email
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      
      // Send them straight to the dashboard now that they are logged in with their new password
      router.push("/dashboard"); 
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create New Password</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Please enter your new secure password below.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">New Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                setShowPasswordWarning(false); // Hide warning once they start typing
              }} 
              required 
              className={`mt-1 ${showPasswordWarning ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
          </div>

          {/* ALWAYS SHOW CRITERIA HERE SO THEY KNOW WHAT TO DO */}
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

          <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 mt-4 shadow-md shadow-emerald-100">
            {isLoading ? "Saving..." : "Save New Password"}
          </Button>
        </form>
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
