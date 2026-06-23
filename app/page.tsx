"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Home() {
  const [lessonText, setLessonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully.");
  };

  const handleIgnite = async () => {
    if (!lessonText) {
      toast.error("Please paste your lesson topics or upload a PDF first!");
      return;
    }

    setIsLoading(true);
    setGeneratedData(null);
    toast.loading("Igniting your schedule...", { id: "ignite-toast" });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonText }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedData(data.data);
        
        if (user) {
          const { error: dbError } = await supabase.from("schedules").insert({
            user_id: user.id,
            lesson_text: lessonText,
            generated_data: data.data
          });

          if (dbError) {
            toast.error("Ignited, but failed to save to your account.", { id: "ignite-toast" });
          } else {
            toast.success("Schedule ignited and securely saved!", { id: "ignite-toast" });
          }
        } else {
          toast.success("Schedule ignited! (Sign in to save)", { id: "ignite-toast" });
        }

      } else {
        toast.error(data.error || "Something went wrong.", { id: "ignite-toast" });
      }
    } catch (error) {
      toast.error("Failed to connect to the server.", { id: "ignite-toast" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 relative">
      
      {/* AUTHENTICATION NAV BAR */}
      <div className="absolute top-4 right-6 flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
              {user?.email}
            </span>
            <Button onClick={() => router.push("/history")} variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
              My Sparks
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="text-slate-600">
              Sign Out
            </Button>
          </>
        ) : (
          <Button onClick={() => router.push("/login")} variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
            Sign In to Save
          </Button>
        )}
      </div>

      {/* INPUT CARD */}
      <Card className="w-full max-w-4xl shadow-lg border-0 mt-8">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-extrabold text-orange-500">MiSpark</CardTitle>
          <CardDescription className="text-base text-slate-600">
            Paste your weekly lesson topics below to plan your week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Paste Lesson Topics</label>
            <Textarea 
              placeholder="e.g., Monday: Fractions. Tuesday: The Water Cycle. Wednesday: American Revolution..." 
              className="min-h-[150px] resize-none"
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleIgnite}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-6 mt-4 transition-all"
          >
            {isLoading ? "Igniting..." : "Ignite"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTS DASHBOARD */}
      {generatedData && (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-800">{generatedData.weekTheme}</h2>
            <p className="text-slate-600 font-medium bg-orange-100 inline-block px-4 py-1 rounded-full">
              {generatedData.studentProfile}
            </p>
          </div>

          <Card className="shadow-md border-0 border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Daily Framework</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedData.dailyFramework.map((day: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-blue-600">{day.day}</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{day.subject}</p>
                  <p className="text-sm text-slate-600">{day.topic}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Media Links */}
          <Card className="shadow-md border-0 border-t-4 border-t-red-500">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Media & Exploration</CardTitle>
              <CardDescription>Curated resources to supplement the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedData.mediaLinks.map((media: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-800">{media.topicReference}</p>
                    <p className="text-sm text-slate-600">Suggested Podcast: <span className="font-semibold text-slate-800">{media.podcastName}</span></p>
                  </div>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(media.youtubeSearchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 shrink-0 shadow-sm"
                  >
                    Search YouTube
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 border-t-4 border-t-orange-500">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Catalysts (Hands-On Sparks)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <div className="flex justify-between items-center mb-2 border-b border-amber-200 pb-2">
                  <h4 className="font-bold text-amber-900 text-lg">Pantry Spark</h4>
                  <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
                    {generatedData.catalysts.pantrySpark.cost}
                  </span>
                </div>
                <p className="font-semibold text-amber-950 mb-3">{generatedData.catalysts.pantrySpark.title}</p>
                <div className="space-y-2 text-sm text-amber-900">
                  <p><strong>Supplies:</strong> {generatedData.catalysts.pantrySpark.supplies.join(", ")}</p>
                  <p><strong>Instructions:</strong> {generatedData.catalysts.pantrySpark.instructions}</p>
                </div>
              </div>

              <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
                <div className="flex justify-between items-center mb-2 border-b border-emerald-200 pb-2">
                  <h4 className="font-bold text-emerald-900 text-lg">Quick-Trip Spark</h4>
                  <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full">
                    {generatedData.catalysts.quickTripSpark.cost}
                  </span>
                </div>
                <p className="font-semibold text-emerald-950 mb-3">{generatedData.catalysts.quickTripSpark.title}</p>
                <div className="space-y-2 text-sm text-emerald-900">
                  <p><strong>Supplies:</strong> {generatedData.catalysts.quickTripSpark.supplies.join(", ")}</p>
                  <p><strong>Instructions:</strong> {generatedData.catalysts.quickTripSpark.instructions}</p>
                </div>
              </div>

              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                <div className="flex justify-between items-center mb-2 border-b border-purple-200 pb-2">
                  <h4 className="font-bold text-purple-900 text-lg">Capstone Spark</h4>
                  <span className="text-xs font-bold bg-purple-200 text-purple-900 px-3 py-1 rounded-full">
                    {generatedData.catalysts.capstoneSpark.cost}
                  </span>
                </div>
                <p className="font-semibold text-purple-950 mb-3">{generatedData.catalysts.capstoneSpark.title}</p>
                <div className="space-y-2 text-sm text-purple-900">
                  <p><strong>Supplies:</strong> {generatedData.catalysts.capstoneSpark.supplies.join(", ")}</p>
                  <p><strong>Instructions:</strong> {generatedData.catalysts.capstoneSpark.instructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md border-0 border-t-4 border-t-indigo-500">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Illuminations</CardTitle>
                <CardDescription>Deep-dive questions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-3 text-slate-700 text-sm">
                  {generatedData.illuminations.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 border-t-4 border-t-rose-500">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Kindling</CardTitle>
                <CardDescription>Dinner table starters</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-3 text-slate-700 text-sm">
                  {generatedData.kindling.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </main>
  );
}