"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Brain, Heart, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function AboutFounder() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 overflow-x-hidden">
      
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader />
      </div>

      <section className="w-full max-w-5xl px-6 pt-20 pb-16 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Built by a Mom. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              Coded by a Tech CEO.
            </span>
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            The story behind Mi-Spark and why protecting your child's data is our core operating principle.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-full md:w-1/2 relative aspect-square rounded-3xl overflow-hidden shadow-lg">
                 <Image 
                    src="/1000014005.jpg" 
                    alt="Ebony coding Mi-Spark" 
                    fill 
                    className="object-cover"
                  />
            </div>
            <div className="w-full md:w-1/2 space-y-6">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                    Hi, I'm Ebony.
                </h2>
                <div className="space-y-4 text-lg text-slate-600 font-medium leading-relaxed">
                    <p>
                        I'm a tech founder, a software engineer, and a full-time Black homeschool mom navigating K-12 neurodivergence. 
                    </p>
                    <p>
                        Like many of you, I was drowning in curriculum prep. I wanted to use AI to build custom learning supplements tailored to my daughter's exact attention span and learning style. But as a software developer, I knew the risks. I absolutely refused to expose her identity or cognitive profile to open AI learning models just to make my life easier.
                    </p>
                    <p>
                        So, my team and I built a safe fortress to do it ourselves.
                    </p>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                    From my family to yours.
                </h2>
                <div className="space-y-4 text-lg text-slate-600 font-medium leading-relaxed">
                    <p>
                        Mi-Spark is the exact tool I use every day to reclaim my time and help my daughter thrive. 
                    </p>
                    <p>
                        I decided to open it up so you can use it, too. Whether you are worldschooling, managing an unschooling environment, or a traditional teacher trying to differentiate instruction for a packed classroom—this tool was built to carry the mental load for you.
                    </p>
                    <p className="font-bold text-slate-800">
                        We keep your kids' data private, and we give you your weekends back.
                    </p>
                </div>
                <Button 
                    onClick={() => router.push("/login?signup=true")} 
                    className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg mt-4"
                >
                    Try Mi-Spark For Free <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
            
            <div className="w-full order-1 md:order-2 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg rotate-2">
                 <Image 
                    src="/1000014422.jpg" 
                    alt="Ebony and her daughter" 
                    fill 
                    className="object-cover"
                  />
            </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}