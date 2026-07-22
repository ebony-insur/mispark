"use client";

import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, FileCheck, Zap, ArrowRight, Sparkles, Image as ImageIcon } from "lucide-react";

export default function HelpPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      <SiteHeader />

      <div className="w-full max-w-4xl space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-800 font-bold text-sm mb-4 border border-teal-200">
            <Sparkles className="w-4 h-4" /> Success Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            How to get the most out of MiSpark
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            A few quick tips to help you save time, generate better lesson plans, and build beautiful state portfolios.
          </p>
        </div>

        {/* Section 1: Prompting the AI */}
        <Card className="border-t-4 border-t-orange-500 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-orange-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <Lightbulb className="w-6 h-6 text-orange-500" /> Writing the Perfect Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700 font-medium leading-relaxed">
              Our AI engine is powerful, but it thrives on context. The more specific you are about what you want to teach, the better your curriculum will be.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-black text-red-500 uppercase tracking-wider">Too Vague</span>
                <p className="mt-2 text-slate-600 italic">"Teach fractions."</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <span className="text-xs font-black text-orange-600 uppercase tracking-wider">Just Right</span>
                <p className="mt-2 text-slate-800 font-medium italic">"Introduce basic fractions (halves and quarters) using visual aids and food. My learner loves baking and struggles with sitting still."</p>
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium mt-4">
              <li><strong>Upload your Syllabus:</strong> Have a PDF from a curriculum provider? Drag and drop it into the dashboard and let us extract the week's topics for you.</li>
              <li><strong>Update Learner Profiles:</strong> Make sure your learner's profile has their current grade and interests filled out. The engine uses this to pick the right books and games!</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2: Portfolios & Evidence */}
        <Card className="border-t-4 border-t-teal-500 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-teal-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <FileCheck className="w-6 h-6 text-teal-600" /> Mastering the Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700 font-medium leading-relaxed">
              Building your end-of-year state report doesn't have to be stressful. By logging evidence as you go, your portfolio practically builds itself.
            </p>
            <div className="space-y-4 mt-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-1">
                  <ImageIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Snap & Upload</h4>
                  <p className="text-slate-600 font-medium text-sm">Take a picture of their completed worksheet, art project, or even a photo of them doing a science experiment. Visual evidence is great for state evaluators.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-1">
                  <Lightbulb className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Use the Hearts & Stars</h4>
                  <p className="text-slate-600 font-medium text-sm">Use the <strong>Stars</strong> to grade their academic mastery (this shows up on the printed portfolio). Use the <strong>Hearts</strong> to tell us if they enjoyed it (this trains the AI to recommend better activities next time!).</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Button onClick={() => router.push("/portfolio")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-6">
                View Your Portfolio <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Understanding Sparks */}
        <Card className="border-t-4 border-t-amber-400 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-amber-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <Zap className="w-6 h-6 text-amber-500" /> How Sparks Work
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-slate-700 font-medium leading-relaxed mb-4">
              <strong>Sparks</strong> are the fuel that powers our AI engine. Every time you click "Ignite Curiosity" and generate a brand new, highly-customized lesson plan, it uses exactly 1 Spark.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
              <li>Free Trial users get 3 Sparks to test out the platform.</li>
              <li>Basic subscribers receive a monthly refill of Sparks.</li>
              <li><strong>Family Unlimited</strong> subscribers have unlimited generations (capped at 5 per student, per day, to prevent AI abuse).</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
