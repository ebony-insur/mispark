import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// SEO Metadata Configuration
export const metadata: Metadata = {
  title: "Meet Ebony | The Story Behind Mi-Spark",
  description: "Learn how a tech CEO and homeschool mom built Mi-Spark to generate custom, AI-driven learning supplements while keeping student data 100% private.",
  openGraph: {
    title: "Meet Ebony | The Story Behind Mi-Spark",
    description: "Built by a Mom. Coded by a Tech CEO. Discover why protecting your child's data is our core operating principle.",
    url: "https://www.mi-spark.com/about",
    siteName: "Mi-Spark",
    images: [
      {
        url: "/screenshots/InsurSuccess-659-Edit.jpg",
        width: 1200,
        height: 630,
        alt: "Ebony, Tech CEO and Homeschool Mom",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function AboutFounder() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 overflow-x-hidden">
      
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader />
      </div>

      <article className="w-full max-w-5xl px-6 pt-20 pb-16 mx-auto">
        {/* HEADER SECTION */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Built by a Mom. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              Coded by a Tech CEO.
            </span>
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            The story behind Mi-Spark and why protecting your child's data is our core operating principle.
          </p>
        </header>

        {/* THE KITCHEN COUNTER FOUNDER SECTION */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-full md:w-1/2 relative aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-slate-50">
                 <Image 
                    src="/screenshots/InsurSuccess-659-Edit.jpg" 
                    alt="Ebony, Mi-Spark Founder, working at her kitchen counter" 
                    fill 
                    className="object-cover"
                    priority
                  />
            </div>
            <div className="w-full md:w-1/2 space-y-6">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                    Hi, I'm Ebony.
                </h2>
                <div className="space-y-4 text-lg text-slate-600 font-medium leading-relaxed">
                    <p>
                        I'm a tech founder, a software engineer, and a full-time Black homeschool mom navigating K-12 neurodivergence right from my kitchen counter. 
                    </p>
                    <p>
                        Like many of you, I was drowning in curriculum prep. I wanted to use AI to build custom learning supplements tailored to my daughter's exact attention span. But as a software developer, I knew the risks. I absolutely refused to expose her identity or cognitive profile to open AI models just to make my life easier.
                    </p>
                    <p>
                        So, my team and I built a safe fortress to do it ourselves.
                    </p>
                </div>
            </div>
        </section>

        {/* THE FAMILY ANCHOR SECTION */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
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
                
                {/* SEO Friendly Link Button */}
                <div className="mt-4">
                  <Button asChild className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-all hover:-translate-y-1">
                      <Link href="/login?signup=true">
                        Try Mi-Spark For Free <ChevronRight className="w-5 h-5 ml-2" />
                      </Link>
                  </Button>
                </div>
            </div>
            
            <div className="w-full order-1 md:order-2 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg rotate-2 hover:rotate-0 transition-all duration-300">
                 <Image 
                    src="/screenshots/EbonySykesFamily2025-265-Edit.jpg" 
                    alt="Ebony and her daughter representing the Mi-Spark mission" 
                    fill 
                    className="object-cover"
                  />
            </div>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}