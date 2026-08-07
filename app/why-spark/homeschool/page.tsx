import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function HomeschoolPage() {
  const problems = [
    { title: "The 'Sunday Night Scramble'", desc: "Generating complete, structured, week-long curriculum supplements takes 60 seconds. Get your weekends back while keeping total control." },
    { title: "The Neurodivergent Gap", desc: "Custom-tune every output to your child's specific brain. Mi-Spark adjusts language, creates micro-steps, and integrates necessary breaks." },
    { title: "The Rabbit Hole Dilemma", desc: "Instantly turn sudden hyper-fixations into structured educational units, weaving core subjects into the exact topic your child is obsessed with right now." },
    { title: "The Multi-Age Juggle", desc: "Take one core topic and instantly generate distinct, age-appropriate lesson plans so your kids can learn together at their individual levels." },
    { title: "Transcript Paralysis", desc: "Automatically translate hands-on, unconventional unschooling activities into formal 'State Standard' language for legal portfolios and transcripts." },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50">
      <div className="w-full px-6 pt-6 flex justify-center"><SiteHeader /></div>

      <div className="w-full max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">For Homeschool & Unschooling</div>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">Reclaim your weekends. Honor their learning style.</h1>
          <p className="text-xl text-slate-600 font-medium">Built by a homeschool mom for homeschool families. Stop forcing boxed curriculum onto unique brains.</p>
          <Button asChild className="h-14 px-8 text-lg bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg mt-4">
            <Link href="/login?signup=true">Start Free Trial <ChevronRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <Image src="/screenshots/Homeschool Tiny.png" alt="Homeschool Learning" fill className="object-cover" priority />
        </div>
      </div>

      <div className="w-full max-w-4xl px-6 py-16 mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">How Mi-Spark Solves the Hardest Parts of Home Education</h2>
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