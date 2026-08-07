import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function TeachersPage() {
  const problems = [
    { title: "IEP Exhaustion", desc: "Input your standard lesson and generate modified versions (simplified text, visual-heavy, extended time markers) to meet specific IEP requirements in minutes." },
    { title: "FERPA/COPPA Compliance", desc: "Our zero-retention architecture ensures that generating targeted interventions does not violate student data privacy laws. You are legally safe." },
    { title: "Emergency Substitute Prep", desc: "Build highly detailed, step-by-step facilitation guides for substitutes who have no prior context of your classroom's current progress in under ten minutes." },
    { title: "The One-Size-Fits-None Mandate", desc: "Translate dry district curriculum requirements into modern, culturally responsive scenarios that resonate with your diverse students." },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50">
      <div className="w-full px-6 pt-6 flex justify-center"><SiteHeader /></div>

      <div className="w-full max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">For Teachers & IEP Facilitators</div>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">Scale differentiation without burning out.</h1>
          <p className="text-xl text-slate-600 font-medium">You are legally mandated to differentiate for a diverse classroom, but given zero extra prep time. Mi-Spark changes that safely.</p>
          <Button asChild className="h-14 px-8 text-lg bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg mt-4">
            <Link href="/login?signup=true">Start Free Trial <ChevronRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
        <div className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <Image src="/screenshots/Classroom2Tiny.png" alt="Classroom Differentiated Learning" fill className="object-cover" priority />
        </div>
      </div>

      <div className="w-full max-w-4xl px-6 py-16 mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Your Institutional AI Partner</h2>
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