"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  firstName?: string;
}

export default function SiteHeader({ firstName }: SiteHeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
      {/* Branding */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => router.push("/")}
      >
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 tracking-tight">
          MiSpark
        </span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-600">
        <Link href="/dashboard" className="hover:text-teal-600 transition-colors">
          Create A Plan
        </Link>
        <Link href="/dashboard/students" className="hover:text-teal-600 transition-colors">
          Learner Profiles
        </Link>
        <Link href="/portfolio" className="hover:text-teal-600 transition-colors">
          Portfolios
        </Link>
        <Link href="/history" className="hover:text-teal-600 transition-colors">
          Plan History
        </Link>
      </nav>

      {/* Account Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-slate-800">
          {firstName ? `Welcome, ${firstName}` : "Welcome"}
        </span>
        <Button 
          variant="outline" 
          onClick={() => router.push("/billing")}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          My Account
        </Button>
      </div>
    </header>
  );
}