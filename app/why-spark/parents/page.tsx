import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function TraditionalParentsPage() {
  const problems = [
    { title: "The 'New Math' Meltdown", desc: "Get 3-4 alternative ways to explain a specific academic concept the school taught, customized to your child's visual or story-based learning style." },
    { title: "Homework Refusals", desc: "Take the core concepts from a boring school worksheet and turn them into a 15-minute interactive game or verbal discussion to reduce nightly arguments." },
    { title: "Advocacy Preparation", desc: "Translate your at-home observations into professional, actionable accommodation requests you can confidently bring to a parent-teacher conference." },
    { title: "Safe Digital Tutoring", desc: "Generate unlimited, highly targeted practice materials inside a secure environment. Get an AI tutor without sacrificing your family's digital footprint." },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50">
      <div className="w-full px-6 pt-6 flex justify-center"><SiteHeader /></div>

      <div className="w-full max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-sm">For Traditional School Parents</div>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">Stop the after-school homework battles.</h1>
          <p className="text-xl text-slate-600 font-medium">Translate what they are learning in the classroom into the way their brain actually processes information at home.</p>
          <Button asChild className="h-14 px-8 text-lg bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg mt-4">
            <Link href="/login?signup=true">Start Free Trial <ChevronRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
        <div className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <Image src="/screenshots/HomeworkTable2Tiny.png" alt="Homework Help" fill className="object-cover" priority />
        </div>
      </div>

      <div className="w-full max-w-4xl px-6 py-16 mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">Your After-School Secret Weapon</h2>
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