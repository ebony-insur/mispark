"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Coins, Printer, Upload, AlertCircle, Users } from "lucide-react";

export default function Dashboard() {
  const [lessonText, setLessonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const currentWordCount = lessonText.trim() === "" ? 0 : lessonText.trim().split(/\s+/).length;
  const isOverLimit = currentWordCount > 750;

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: studentData } = await supabase
          .from("children_profiles")
          .select("*")
          .eq("parent_id", user.id)
          .order("created_at", { ascending: false });

        if (studentData && studentData.length > 0) {
          setStudents(studentData);
          setSelectedStudentId(studentData[0].id);
        }
      }
    };
    fetchUserAndData();

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
    router.push("/");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleIgnite = async () => {
    if (!lessonText) {
      toast.error("Please paste your lesson topics or upload a PDF first!");
      return;
    }

    if (isOverLimit) {
      toast.error("You have exceeded the 750 word limit. Please shorten your text.");
      return;
    }

    setIsLoading(true);
    setGeneratedData(null);
    toast.loading("Igniting your schedule...", { id: "ignite-toast" });

    const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lessonText, 
          studentProfile: selectedStudent 
        }),
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
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 relative print:bg-white print:py-0 print:px-0 print:space-y-4">
      
      {/* AUTHENTICATION NAV BAR - HIDDEN ON PRINT */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <div className="text-2xl font-extrabold tracking-tight cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-teal-500">mi</span>
          <span className="text-orange-500">Spark</span>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button onClick={() => router.push("/dashboard/students")} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hidden sm:flex">
                <Users className="w-4 h-4 mr-2" /> Students
              </Button>
              <Button onClick={() => router.push("/dashboard/rewards")} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hidden sm:flex">
                <Coins className="w-4 h-4 mr-2" /> Earn Sparks
              </Button>
              <Button onClick={() => router.push("/history")} variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                My Sparks
              </Button>
              <Button onClick={handleSignOut} variant="ghost" className="text-slate-600 hover:text-red-600">
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push("/login")} variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
              Sign In to Save
            </Button>
          )}
        </div>
      </div>

      {/* INPUT CARD - HIDDEN ON PRINT */}
      <Card className="w-full max-w-4xl shadow-lg border-0 mt-4 print:hidden">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold text-slate-800">Plan Your Week</CardTitle>
          <CardDescription className="text-base text-slate-600">
            Upload your curriculum PDF or paste your weekly topics below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-2">
          
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group flex flex-col items-center justify-center">
            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-teal-500" />
            </div>
            <p className="text-slate-700 font-bold">Drag & Drop your weekly PDF schedule here</p>
            <p className="text-sm text-slate-500 mt-1">Or click to browse files (File extraction engine coming soon)</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">OR PASTE TEXT</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Target Student Profile</label>
              <Button variant="link" className="text-teal-600 p-0 h-auto text-sm font-bold" onClick={() => router.push('/dashboard/students')}>
                + Manage
              </Button>
            </div>
            
            {students.length === 0 ? (
              <p className="text-sm text-slate-500 bg-white p-3 rounded-md border border-slate-200">
                No profiles found. <span className="text-teal-600 font-bold cursor-pointer" onClick={() => router.push('/dashboard/students')}>Create one here</span> to deeply personalize your plan.
              </p>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-sm"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nickname} ({s.grade})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-3">
            <Textarea 
              placeholder="e.g., Monday: Fractions. Tuesday: The Water Cycle. Wednesday: American Revolution..." 
              className={`min-h-[150px] resize-none text-base p-4 ${isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              disabled={isLoading}
            />
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-red-500 font-medium flex items-center gap-1">
                {isOverLimit && <><AlertCircle className="w-4 h-4" /> Word limit exceeded. Please shorten your text.</>}
              </div>
              <div className={`font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>
                {currentWordCount} / 750 words
              </div>
            </div>
          </div>

          <Button 
            onClick={handleIgnite}
            disabled={isLoading || isOverLimit || currentWordCount === 0 || students.length === 0}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xl py-8 mt-4 transition-all shadow-md"
          >
            {isLoading ? "Igniting..." : "Ignite ✨"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTS DASHBOARD - OPTIMIZED FOR PRINT */}
      {generatedData && (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 print:pb-0 print:space-y-4 print:max-w-none">
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4 print:border-b-4 print:border-slate-800 print:rounded-none print:shadow-none print:p-0 print:pb-4">
            <div>
              <div className="hidden print:flex text-2xl font-extrabold tracking-tight mb-2">
                <span className="text-teal-500">mi</span><span className="text-orange-500">Spark</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 print:text-2xl">{generatedData.weekTheme}</h2>
              <p className="text-teal-700 font-bold bg-teal-50 inline-block px-3 py-1 rounded-md mt-2 text-sm border border-teal-100 print:bg-transparent print:border-none print:px-0 print:text-slate-600">
                {generatedData.studentProfile}
              </p>
            </div>
            <Button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-900 text-white gap-2 shrink-0 print:hidden">
              <Printer className="w-4 h-4" /> Print to Fridge
            </Button>
          </div>

          <Card className="shadow-md border-0 border-t-4 border-t-blue-500 bg-white print:shadow-none print:border-t-2 print:border-blue-500 print:break-inside-avoid">
            <CardHeader className="print:p-4">
              <CardTitle className="text-xl text-slate-800">Daily Framework</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:p-4 print:pt-0">
              {generatedData.dailyFramework.map((day: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 print:border-slate-300 print:bg-white">
                  <h4 className="font-extrabold text-blue-600 uppercase tracking-wide text-sm">{day.day}</h4>
                  <p className="text-base font-bold text-slate-800 mt-1">{day.subject}</p>
                  <p className="text-sm text-slate-600 mt-1">{day.topic}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 border-t-4 border-t-red-500 bg-white print:shadow-none print:border-t-2 print:border-red-500 print:break-inside-avoid">
            <CardHeader className="print:p-4">
              <CardTitle className="text-xl text-slate-800">Media & Exploration</CardTitle>
              <CardDescription className="print:hidden">Curated resources to supplement the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 print:p-4 print:pt-0">
              {generatedData.mediaLinks.map((media: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:border-slate-300 print:bg-white">
                  <div>
                    <p className="font-bold text-slate-800">{media.topicReference}</p>
                    <p className="text-sm text-slate-600 mt-1">Suggested Search: <span className="font-bold text-slate-700">{media.podcastName}</span></p>
                  </div>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(media.youtubeSearchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg text-sm font-bold transition-colors bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 h-10 px-4 py-2 shrink-0 shadow-sm print:hidden"
                  >
                    Search YouTube
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 border-t-4 border-t-orange-500 bg-white print:shadow-none print:border-t-2 print:border-orange-500 print:break-inside-avoid">
            <CardHeader className="print:p-4">
              <CardTitle className="text-xl text-slate-800">Catalysts (Hands-On Sparks)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 print:space-y-4 print:p-4 print:pt-0">
              <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-200 print:bg-white print:border-slate-300 print:p-4 print:break-inside-avoid">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-extrabold text-amber-900 text-lg uppercase tracking-tight print:text-slate-800">Pantry Spark</h4>
                  <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-800">
                    {generatedData.catalysts.pantrySpark.cost}
                  </span>
                </div>
                <p className="font-bold text-amber-950 text-xl mb-4 print:text-slate-900">{generatedData.catalysts.pantrySpark.title}</p>
                <div className="space-y-3 text-sm text-amber-900 print:text-slate-700">
                  <p><strong>Supplies:</strong> {generatedData.catalysts.pantrySpark.supplies.join(", ")}</p>
                  <p className="leading-relaxed"><strong>Instructions:</strong> {generatedData.catalysts.pantrySpark.instructions}</p>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-200 print:bg-white print:border-slate-300 print:p-4 print:break-inside-avoid">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-extrabold text-emerald-900 text-lg uppercase tracking-tight print:text-slate-800">Quick-Trip Spark</h4>
                  <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-800">
                    {generatedData.catalysts.quickTripSpark.cost}
                  </span>
                </div>
                <p className="font-bold text-emerald-950 text-xl mb-4 print:text-slate-900">{generatedData.catalysts.quickTripSpark.title}</p>
                <div className="space-y-3 text-sm text-emerald-900 print:text-slate-700">
                  <p><strong>Supplies:</strong> {generatedData.catalysts.quickTripSpark.supplies.join(", ")}</p>
                  <p className="leading-relaxed"><strong>Instructions:</strong> {generatedData.catalysts.quickTripSpark.instructions}</p>
                </div>
              </div>

              <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-200 print:bg-white print:border-slate-300 print:p-4 print:break-inside-avoid">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-extrabold text-purple-900 text-lg uppercase tracking-tight print:text-slate-800">Capstone Spark</h4>
                  <span className="text-xs font-bold bg-purple-200 text-purple-900 px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-800">
                    {generatedData.catalysts.capstoneSpark.cost}
                  </span>
                </div>
                <p className="font-bold text-purple-950 text-xl mb-4 print:text-slate-900">{generatedData.catalysts.capstoneSpark.title}</p>
                <div className="space-y-3 text-sm text-purple-900 print:text-slate-700">
                  <p><strong>Supplies:</strong> {generatedData.catalysts.capstoneSpark.supplies.join(", ")}</p>
                  <p className="leading-relaxed"><strong>Instructions:</strong> {generatedData.catalysts.capstoneSpark.instructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:break-inside-avoid">
            <Card className="shadow-md border-0 border-t-4 border-t-indigo-500 bg-white print:shadow-none print:border-t-2 print:border-slate-400">
              <CardHeader className="print:p-4">
                <CardTitle className="text-xl text-slate-800">Illuminations</CardTitle>
                <CardDescription className="print:hidden">Deep-dive questions</CardDescription>
              </CardHeader>
              <CardContent className="print:p-4 print:pt-0">
                <ul className="list-disc pl-5 space-y-3 text-slate-700 text-sm font-medium">
                  {generatedData.illuminations.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 border-t-4 border-t-rose-500 bg-white print:shadow-none print:border-t-2 print:border-slate-400">
              <CardHeader className="print:p-4">
                <CardTitle className="text-xl text-slate-800">Kindling</CardTitle>
                <CardDescription className="print:hidden">Dinner table starters</CardDescription>
              </CardHeader>
              <CardContent className="print:p-4 print:pt-0">
                <ul className="list-disc pl-5 space-y-3 text-slate-700 text-sm font-medium">
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