"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Share2, ThumbsUp, Bookmark, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RewardsPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState(1); // Simulating database token count

  const handleShare = (platform: string) => {
    toast.success(`Redirecting to share on ${platform}! Once posted, your bonus Spark will be credited.`);
    // In production, we trigger the Web Share API or platform intents, then increment tokens
    setTokens((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 flex flex-col items-center space-y-8">
      {/* HEADER NAV */}
      <div className="w-full max-w-4xl flex justify-between items-center">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-slate-600 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <div className="bg-orange-100 text-orange-800 font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-orange-200 shadow-sm">
          <Coins className="w-5 h-5 text-orange-500" />
          <span>{tokens} Sparks Available</span>
        </div>
      </div>

      <div className="w-full max-w-4xl text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900">Sparks Rewards Center</h1>
        <p className="text-slate-600 text-lg max-w-xl mx-auto">
          Manage your balance, buy asset packs, or complete social quests to earn free credits.
        </p>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: BUY SPARKS */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Buy a Bucket
          </h2>
          
          <Card className="border-2 border-slate-200 hover:border-teal-500 transition-all shadow-sm">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800">10 Sparks Pack</h3>
                <p className="text-sm text-slate-500">Perfect for a standard month of planning.</p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6">
                $4.99
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-400 relative overflow-hidden shadow-md bg-orange-50/30">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-bl">BEST VALUE</div>
            <CardContent className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">40 Sparks Pack</h3>
                <p className="text-sm text-slate-600">A full quarter of custom planning.</p>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 shadow">
                $15.00
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: SOCIAL QUESTS */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Social Quests
          </h2>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-500" /> Share on Social Media
              </CardTitle>
              <CardDescription>
                Help other parents reclaim their Sunday nights. Earn 1 free Spark per platform post.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <Button 
                onClick={() => handleShare("Facebook")}
                variant="outline" 
                className="w-full justify-start gap-3 text-slate-700 hover:bg-blue-50 border-slate-200"
              >
                <ThumbsUp className="w-5 h-5 text-blue-600 fill-blue-600" />
                <span>Share Plan on Facebook</span>
                <span className="ml-auto text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">+1 Spark</span>
              </Button>

              <Button 
                onClick={() => handleShare("Pinterest")}
                variant="outline" 
                className="w-full justify-start gap-3 text-slate-700 hover:bg-red-50 border-slate-200"
              >
                <Bookmark className="w-5 h-5 text-red-600 fill-red-600" />
                <span>Pin to Homeschool Board</span>
                <span className="ml-auto text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">+1 Spark</span>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}