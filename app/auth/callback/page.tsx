"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=auth-failed");
      } else {
        router.push("/dashboard");
      }
    };
    handleCallback();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center flex flex-col items-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Verifying your account...</h2>
        <p className="text-slate-500 mt-2">Loading your dashboard.</p>
      </div>
    </div>
  );
}
