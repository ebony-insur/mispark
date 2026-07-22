"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Sparkles, BookHeart, Gamepad2, Loader2, 
  ExternalLink, ArrowRight, Gift 
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

// Your affiliate link generator
const generateSearchLink = (query: string, platform: "amazon-book" | "amazon-game") => {
  const encoded = encodeURIComponent(query);
  const AMAZON_TAG = "mispark0a-20"; // Your actual tag
  
  if (platform === "amazon-book") {
    return `https://www.amazon.com/s?k=${encoded}+book&tag=${AMAZON_TAG}`;
  }
  return `https://www.amazon.com/s?k=${encoded}+game+toy+educational&tag=${AMAZON_TAG}`;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [grade, setGrade] = useState("3rd Grade");
  const [interest, setInterest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!interest) {
      toast.error("Please enter an interest or topic!");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, interest }),
      });
      
      const data = await res.json();
      if (res.ok && data.results) {
        setResults(data.results);
      } else {
        throw new Error("Failed to generate");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 overflow-x-hidden pb-20">
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader />
      </div>

      {/* LEAD MAGNET HERO */}
      <section className="w-full max-w-3xl px-6 pt-12 pb-8 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-800 font-bold text-sm mb-6 border border-rose-200">
          <Gift className="w-4 h-4" /> Free Idea Generator
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Discover hands-on learning ideas in seconds.
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          Tell us what your child is into right now, and our AI will find the perfect books and educational toys to match.
        </p>
      </section>

      {/* INPUT FORM */}
      <section className="w-full max-w-2xl px-6 mb-12">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
          <select 
            value={grade} 
            onChange={(e) => setGrade(e.target.value)}
            className="p-4 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none focus:border-teal-500 md:w-1/3"
          >
            {["Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade"].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <Input 
            placeholder="e.g. Dinosaurs, Fractions, Volcanoes, Baking..."
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="flex-1 h-[56px] text-lg px-4 rounded-xl border-2 border-slate-200 focus-visible:ring-teal-500 font-medium"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isLoading || !interest}
          className="w-full mt-4 h-16 text-xl bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-lg transition-all"
        >
          {isLoading ? <><Loader2 className="w-6 h-6 mr-2 animate-spin"/> Searching...</> : <><Sparkles className="w-6 h-6 mr-2"/> Reveal Ideas</>}
        </Button>
      </section>

      {/* RESULTS & UPSELL */}
      {results && (
        <section className="w-full max-w-4xl px-6 space-y-12 animate-in fade-in slide-in-from-bottom-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Books Column */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-6">
                <BookHeart className="w-6 h-6 text-rose-500" /> Top Book Picks
              </h3>
              {results.books.map((book: any, i: number) => (
                <Card key={i} className="border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-rose-300 transition-colors">
                  <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                    <div>
                      <h4 className="font-black text-lg text-slate-900 leading-tight">{book.title}</h4>
                      <p className="text-sm text-slate-600 font-medium mt-2">{book.reason}</p>
                    </div>
                    <a href={generateSearchLink(book.title, "amazon-book")} target="_blank" rel="noreferrer" className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm text-center rounded-xl transition-colors flex justify-center items-center">
                      Find on Amazon <ExternalLink className="w-4 h-4 ml-2"/>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Toys Column */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-6">
                <Gamepad2 className="w-6 h-6 text-emerald-500" /> Hands-On Tools
              </h3>
              {results.toys.map((toy: any, i: number) => (
                <Card key={i} className="border-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-emerald-300 transition-colors">
                  <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                    <div>
                      <h4 className="font-black text-lg text-slate-900 leading-tight">{toy.name}</h4>
                      <p className="text-sm text-slate-600 font-medium mt-2">{toy.reason}</p>
                    </div>
                    <a href={generateSearchLink(toy.name, "amazon-game")} target="_blank" rel="noreferrer" className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm text-center rounded-xl transition-colors flex justify-center items-center">
                      Find on Amazon <ExternalLink className="w-4 h-4 ml-2"/>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* THE UPSELL */}
          <div className="w-full bg-teal-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl mt-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 text-teal-500 opacity-50">
              <Sparkles className="w-40 h-40" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 relative z-10">Turn these ideas into a full week of lessons.</h2>
            <p className="text-teal-100 font-medium text-lg max-w-2xl mx-auto mb-8 relative z-10">
              MiSpark can instantly map these topics to state standards, generate hands-on activities, and build printable worksheets for your learner.
            </p>
            <Button 
              onClick={() => router.push("/login?signup=true")}
              className="h-16 px-10 text-xl bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg transition-transform hover:-translate-y-1 relative z-10"
            >
              Get 3 Free Plans <ArrowRight className="w-6 h-6 ml-2"/>
            </Button>
          </div>

        </section>
      )}
    </main>
  );
}
