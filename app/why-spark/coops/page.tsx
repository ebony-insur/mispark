import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function CoopsPage() {
  const problems = [
    { title: "The Volunteer Skill Gap", desc: "Empower non-educator parents with simple, structured facilitator guides that tell volunteers exactly what to say and how to manage the time block." },
    { title: "Mixed-Cohort Chaos", desc: "From a single prompt, generate beginner, intermediate, and advanced activity sets based on the same core lesson for blended age groups." },
    { title: "Syllabus Standardization", desc: "Standardize all volunteer lesson outputs into a clean, cohesive format for the 12-week term." },
    { title: "Automated Supply Chain", desc: "Instantly aggregate the necessary physical supplies needed for a specific lesson block across multiple volunteers." },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50">
      <div className="w-full px-6 pt-6 flex justify-center"><SiteHeader /></div>

      <div className="w-full max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">For Homeschool Co-ops</div>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">Bring order to collaborative learning.</h1>
          <p className="text-xl text-slate-600 font-medium">Empower parent volunteers and standardize your community's syllabus without stifling creativity.</p>
          <Button asChild className="h-14 px-8 text-lg bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg mt-4">
            <Link href="/login?signup=true">Start Free Trial <ChevronRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
        <div className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <Image src="/screenshots/Coop Image3 Tiny.png" alt="Coop Learning" fill className="object-cover" priority />
        </div>
      </div>

      <div className="w-full max-w-4xl px-6 py-16 mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Scale Your Co-op with Confidence</h2>
        <div className="space-y-6">
          {problems.map((prob, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-teal-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{prob.title}</h3>
                <p className="text-slate-600">{prob.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}