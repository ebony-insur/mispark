"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, UserPlus, Lightbulb, FileCheck, ArrowRight, Rocket } from "lucide-react";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6">
      
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 mt-8">
        
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Rocket className="w-10 h-10 text-teal-600 ml-1 mb-1" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Welcome to MiSpark!
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            You are moments away from getting your weekends back. Here are the 3 steps to getting the absolute best results from our curriculum engine.
          </p>
        </div>

        {/* STEP 1 */}
        <Card className="border-t-4 border-t-indigo-500 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
              <UserPlus className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Step 1: Configure Your Learner</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                The AI needs to know who it is teaching. You will set their grade level, specific state standards (like Texas TEKS or Florida B.E.S.T.), their current interests, and sensory needs.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-700">
                <Sparkles className="w-4 h-4 inline text-indigo-500 mr-2"/>
                Pro Tip: Update their interests every month to keep lesson plans fresh!
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STEP 2 */}
        <Card className="border-t-4 border-t-orange-500 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
              <Lightbulb className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Step 2: Master the Prompt</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Our engine thrives on context. The more specific you are about what you want to teach, the better your curriculum will be.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <span className="text-xs font-black text-red-500 uppercase">Too Vague</span>
                  <p className="mt-1 text-slate-700 italic font-medium text-sm">"Teach fractions."</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <span className="text-xs font-black text-emerald-600 uppercase">Just Right</span>
                  <p className="mt-1 text-slate-800 italic font-medium text-sm">"Introduce basic fractions using food. My kid loves baking but struggles sitting still."</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STEP 3 */}
        <Card className="border-t-4 border-t-teal-500 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
              <FileCheck className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Step 3: Build the Portfolio</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Building your end-of-year state report doesn't have to be stressful. By taking photos of their work and logging evidence as you go, your printable portfolio practically builds itself.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CALL TO ACTION */}
        <div className="pt-8 text-center pb-20">
          <Button 
            onClick={() => router.push("/dashboard/students")}
            className="h-16 px-10 text-xl bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl transition-transform hover:-translate-y-1"
          >
            Create My First Learner <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>

      </div>
    </main>
  );
}