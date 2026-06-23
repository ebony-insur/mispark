"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Upload, Sparkles, Printer } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center overflow-x-hidden">
      
      {/* HEADER */}
      <header className="w-full max-w-6xl px-6 py-6 flex justify-between items-center bg-transparent z-10 relative">
        <div className="text-3xl font-extrabold tracking-tight flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-teal-500">mi</span>
          <span className="text-orange-500">Spark</span>
        </div>
        <div className="space-x-4">
          <Button 
            onClick={() => router.push("/login")} 
            variant="ghost" 
            className="text-slate-600 hover:text-teal-600 font-semibold"
          >
            Log In
          </Button>
          <Button 
            onClick={() => router.push("/login")} 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-6 shadow-md"
          >
            Get 1 Free Spark
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="w-full max-w-5xl px-6 pt-16 pb-20 flex flex-col items-center text-center space-y-8 relative z-10">
        
        <div className="inline-block bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-2 border border-orange-200">
          THE ANTI-PINTEREST PLANNER
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          Stop losing your Sunday nights to <span className="text-orange-500 underline decoration-teal-400 decoration-8 underline-offset-8">Pinterest.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl leading-relaxed font-medium">
          Whether you use Miacademy, Time4Learning, Abeka, or your own curriculum, drop your weekly schedule here. We instantly map your topics to hands-on experiments, curated podcasts, and practice links.
        </p>

        <div className="pt-8 w-full max-w-md flex flex-col items-center space-y-4">
          <Button 
            onClick={() => router.push("/login")} 
            className="w-full py-8 text-2xl font-bold rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 hover:from-orange-500 hover:to-red-600 shadow-xl hover:shadow-2xl transition-all text-white border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
          >
            Ignite Your Week ✨
          </Button>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-500" /> Includes 1 free generation. No credit card required.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="w-full bg-white py-24 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900">How MiSpark Works</h2>
            <p className="text-xl text-slate-600 font-medium">Zero compliance risks. Zero logins required. Just pure, time-saving magic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-slate-50">
              <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-teal-100 rounded-full text-teal-600 mb-2">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">1. Upload & Analyze</h3>
                <p className="text-slate-600">
                  Export your curriculum's weekly PDF schedule or simply paste your lesson titles into our secure vault.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-slate-50">
              <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-orange-100 rounded-full text-orange-600 mb-2">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">2. Ignite & Enrich</h3>
                <p className="text-slate-600">
                  Our engine instantly maps your core topics to low-prep household experiments and highly-rated educational media.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-slate-50">
              <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-purple-100 rounded-full text-purple-600 mb-2">
                  <Printer className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">3. Print & Play</h3>
                <p className="text-slate-600">
                  Get a beautiful, printable weekly checklist ready for the fridge. No more scrambling for Sunday night ideas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING & SPARKS SECTION */}
      <section className="w-full max-w-5xl px-6 py-24 text-center space-y-8">
        <h2 className="text-4xl font-extrabold text-slate-900">Pay Only For What You Plan</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 font-medium">
          Buy buckets of "Sparks" to use whenever you need them. No sneaky monthly subscriptions dragging you down during summer break.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card className="border-2 border-slate-200 shadow-sm relative overflow-hidden">
            <CardContent className="p-8 space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">10 Sparks</h3>
              <div className="text-5xl font-extrabold text-teal-600">$4.99</div>
              <p className="text-slate-500 font-medium pb-4">Perfect for a quick month of planning.</p>
              <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold" onClick={() => router.push("/login")}>Get Started</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
            <CardContent className="p-8 space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">40 Sparks</h3>
              <div className="text-5xl font-extrabold text-orange-500">$15.00</div>
              <p className="text-slate-500 font-medium pb-4">A full quarter of hands-on learning.</p>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold" onClick={() => router.push("/login")}>Grab the Bucket</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-purple-50 border border-purple-100 rounded-2xl p-8 max-w-3xl mx-auto text-left flex flex-col md:flex-row items-center gap-6">
          <div className="bg-purple-100 p-4 rounded-full shrink-0">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-purple-900 mb-2">Want Free Sparks?</h4>
            <p className="text-purple-800">
              Earn them easily by sharing your generated plans on Facebook or Pinterest! Our social sharing economy rewards you for helping other parents buy back their Sunday nights.
            </p>
          </div>
        </div>
      </section>

      {/* COLOR BAR ACCENT */}
      <div className="w-full h-4 flex mt-auto">
        <div className="h-full flex-1 bg-teal-500"></div>
        <div className="h-full flex-1 bg-green-400"></div>
        <div className="h-full flex-1 bg-orange-400"></div>
        <div className="h-full flex-1 bg-red-500"></div>
        <div className="h-full flex-1 bg-purple-600"></div>
      </div>

    </main>
  );
}