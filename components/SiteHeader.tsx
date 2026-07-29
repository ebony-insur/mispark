"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface SiteHeaderProps {
  firstName?: string;
}

export default function SiteHeader({ firstName }: SiteHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [dbFirstName, setDbFirstName] = useState<string>(firstName || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setHasUser(true);
        if (!firstName) {
          const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("first_name")
            .eq("id", user.id)
            .single();
            
          if (profile?.first_name) {
            setDbFirstName(profile.first_name);
          }
        }
      }
      setIsLoaded(true);
    };
    checkUser();
  }, [supabase, firstName]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="w-full max-w-5xl flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 mb-6 print:hidden">
      <Link href={hasUser ? "/dashboard" : "/"} className="flex items-center gap-2">
        <Image src="/MiSpark.svg" alt="MiSpark Logo" width={120} height={35} priority />
      </Link>

      <div className="flex items-center gap-4">
        {isLoaded && hasUser ? (
          <div className="flex items-center gap-3">
            {dbFirstName && (
              <span className="text-sm font-extrabold text-slate-700 hidden sm:inline">
                Hello, {dbFirstName}!
              </span>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm" 
              className="border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        ) : isLoaded ? (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-slate-600 hover:text-slate-900">
                Log In
              </Button>
            </Link>
            <Link href="/login?signup=true">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm">
                Sign Up Free
              </Button>
            </Link>
          </div>
        ) : (
          <div className="h-9 w-24 animate-pulse bg-slate-100 rounded-xl"></div>
        )}
      </div>
    </header>
  );
}