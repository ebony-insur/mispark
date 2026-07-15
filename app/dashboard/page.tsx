"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { 
  Printer, Upload, AlertCircle, BookOpen, FileText, 
  Lock, FlaskConical, Lightbulb, Gamepad2, PlaySquare, 
  BookHeart, ExternalLink, Zap, User as UserIcon, ChevronDown, LogOut, Loader2, Plus, Shapes
} from "lucide-react";

// Updated Helper functions for smart search links
const generateSearchLink = (query: string, platform: "amazon-book" | "amazon-game" | "walmart" | "thriftbooks" | "bookshop" | "youtube") => {
  const encoded = encodeURIComponent(query);
  switch(platform) {
    case "amazon-book": return `https://www.amazon.com/s?k=${encoded}+book`;
    case "amazon-game": return `https://www.amazon.com/s?k=${encoded}+game+toy`;
    case "walmart": return `https://www.walmart.com/search?q=${encoded}`;
    case "thriftbooks": return `https://www.thriftbooks.com/browse/?b.search=${encoded}#b.s=mostPopular-desc&b.p=1&b.pp=30&b.oos`;
    case "bookshop": return `https://bookshop.org/search?keywords=${encoded}`;
    case "youtube": return `https://www.youtube.com/results?search_query=${encoded}`;
    default: return "#";
  }
};

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_aB1cD2...";

export default function Dashboard() {
  const [lessonText, setLessonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [generatedData, setGeneratedData] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [isGuest, setIsGuest] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
  const [sparksBalance, setSparksBalance] = useState<number>(0);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("Free Trial");
  const [printMode, setPrintMode] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const currentWordCount = lessonText.trim() === "" ? 0 : lessonText.trim().split(/\s+/).length;
  const isUnderLimit = currentWordCount > 0 && currentWordCount < 15;
  const isOverLimit = currentWordCount > 750;

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsGuest(!user);

      if (user) {
        const { data: parentProfile } = await supabase.from("parent_profiles").select("subscriptions, sparks_balance, subscription_tier").eq("id", user.id).single();
        if (parentProfile) {
          setActiveSubscriptions(parentProfile.subscriptions || []);
          setSparksBalance(parentProfile.sparks_balance || 0);
          if (parentProfile.subscription_tier) setSubscriptionTier(parentProfile.subscription_tier);
        }

        const { data: studentData } = await supabase.from("children_profiles").select("*").eq("parent_id", user.id).order("created_at", { ascending: false });
        if (studentData && studentData.length > 0) {
          setStudents(studentData);
          setSelectedStudentId(studentData[0].id);
        }
      }
    };
    fetchUserAndData();
  }, [supabase]);

  useEffect(() => {
    if (printMode) {
      setTimeout(() => { window.print(); setPrintMode(null); }, 300);
    }
  }, [printMode]);

  const processPdf = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("File is too large (max 5MB)."); return; }
    setIsUploadingPdf(true); toast.loading("Extracting text...", { id: "pdf" });
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) { setLessonText(data.text); toast.success("Extracted successfully!", { id: "pdf" }); }
    } catch { toast.error("Failed to parse.", { id: "pdf" }); } 
    finally { setIsUploadingPdf(false); }
  };

  const handleIgnite = async () => {
    if (!isGuest) {
      if (subscriptionTier === "Family Unlimited") {
        const todayStr = new Date().toISOString().split('T')[0];
        const { count } = await supabase.from("lesson_plans").select("*", { count: "exact", head: true })
          .eq("student_id", selectedStudentId).gte("created_at", `${todayStr}T00:00:00Z`);
        if (count !== null && count >= 5) { toast.error("Daily limit reached for this student."); return; }
      } else if (sparksBalance <= 0) {
        toast.error("Out of Sparks! Please upgrade."); return;
      }
    }

    setIsLoading(true); setGeneratedData(null);
    const studentProfile = isGuest ? { grade: "3rd Grade", focus_duration: "20 mins", state_residence: "General US", zip_code: "12345", interests: "General", sensory_needs: "None" } : students.find(s => s.id === selectedStudentId);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonText, studentProfile, subscriptions: isGuest ? ["YouTube"] : activeSubscriptions }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setGeneratedData(data.data);
        if (!isGuest && user) {
          if (subscriptionTier !== "Family Unlimited") {
            const newBalance = sparksBalance - 1;
            await supabase.from("parent_profiles").update({ sparks_balance: newBalance }).eq("id", user.id);
            setSparksBalance(newBalance); 
          }
          await supabase.from('lesson_plans').insert({ parent_id: user.id, student_id: selectedStudentId || null, original_prompt: lessonText, plan_data: data.data });
        }
      } else throw new Error();
    } catch { toast.error("Generation failed."); } 
    finally { setIsLoading(false); }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:py-0 print:px-0">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <Image src="/MiSpark.svg" alt="Logo" width={120} height={40} className="cursor-pointer" onClick={() => router.push("/")} />
        <div className="flex gap-3 items-center">
          {isGuest ? (
            <Button onClick={() => router.push("/login?signup=true")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Sign Up to Save</Button>
          ) : (
            <>
              <button onClick={() => router.push("/billing")} className="flex items-center gap-1 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg border border-amber-200 font-bold text-sm">
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" /> {subscriptionTier === "Family Unlimited" ? "Unlimited" : `${sparksBalance} Sparks`}
              </button>
              <div className="relative">
                <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} onBlur={() => setTimeout(() => setIsAccountMenuOpen(false), 200)} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg font-bold text-slate-700">
                  <UserIcon className="w-4 h-4" /> Account <ChevronDown className="w-4 h-4" />
                </button>
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                    <button onClick={() => router.push("/dashboard/students")} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">My Students</button>
                    <button onClick={() => router.push("/history")} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">My History</button>
                    <button onClick={() => router.push("/billing")} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Billing</button>
                    <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Sign Out</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* INPUT CARD */}
      <Card className="w-full max-w-4xl shadow-lg border-0 print:hidden">
        <CardHeader className="text-center pb-2"><CardTitle className="text-4xl font-black text-slate-800">Ignite Curiosity</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          
          {isGuest ? (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-800"><AlertCircle className="w-5 h-5 shrink-0" /> Guest Mode: Create an account to customize!</div>
          ) : (
            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <label className="text-sm font-extrabold text-slate-700 uppercase">Student</label>
              <div className="flex gap-2">
                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-4 rounded-xl border-2 border-slate-200 font-bold">
                  {students.length === 0 ? <option value="" disabled>No students found. Add one!</option> : students.map(s => <option key={s.id} value={s.id}>{s.nickname} (Grade: {s.grade})</option>)}
                </select>
                <Button onClick={() => router.push("/dashboard/students")} className="px-4 bg-slate-800 text-white rounded-xl"><Plus className="w-5 h-5" /></Button>
              </div>
            </div>
          )}

          <div onDragOver={(e) => {e.preventDefault(); setIsDragging(true)}} onDragLeave={() => setIsDragging(false)} onDrop={(e) => {e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processPdf(f)}} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-slate-50"}`}>
            <input type="file" accept=".pdf, .png, .jpg, .docx, .txt" className="hidden" ref={fileInputRef} onChange={(e) => {const f = e.target.files?.[0]; if(f) processPdf(f)}} />
            <Upload className="w-10 h-10 mx-auto mb-4 text-slate-400" />
            <p className="font-extrabold text-lg text-slate-700">Drag &amp; Drop your Syllabus</p>
          </div>

          <div>
            <Textarea placeholder="Type/paste weekly topics here (min 15 words)..." value={lessonText} onChange={(e) => setLessonText(e.target.value)} className="min-h-[150px] p-4 rounded-xl border-2" />
            <div className="flex justify-between items-center text-xs mt-2 text-slate-500 font-bold">
              <span className={isUnderLimit || isOverLimit ? "text-red-500" : ""}>{isUnderLimit && "Min 15 words required."}{isOverLimit && "Max 750 words."}</span>
              <span>{currentWordCount} / 750 words</span>
            </div>
          </div>

          <Button onClick={handleIgnite} disabled={isLoading || isUnderLimit || isOverLimit || isUploadingPdf || (!isGuest && students.length === 0)} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-2xl py-8 rounded-2xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-1">
            {isLoading ? <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /> Igniting...</span> : "Ignite Curiosity ✨"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTS DASHBOARD */}
      {generatedData && (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 pb-20 print:space-y-6">
          <div className="flex justify-end gap-3 print:hidden border-b pb-4">
             <Button onClick={() => setPrintMode("all")} className="bg-slate-800 text-white font-bold rounded-xl"><Printer className="w-4 h-4 mr-2"/> Print Full Plan</Button>
          </div>

          {/* 📍 NEW: Applicable Standards (No Schedule) */}
          <Card className="border-t-4 border-t-blue-500 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 print:p-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800"><Lightbulb className="w-6 h-6 text-blue-600"/> Applicable Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 print:p-4">
              <p className="text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-lg">
                {generatedData.assessedFoundation}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {generatedData.outlinedStandards?.map((std: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 text-base">{std.subject}</p>
                    <p className="text-slate-600 text-sm mt-1">{std.topic}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 📍 NEW: Tactile Resources */}
          {generatedData.tactileResources && (
            <Card className="border-t-4 border-t-purple-500 bg-white rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 print:p-4">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800"><Shapes className="w-6 h-6 text-purple-600"/> Tactile &amp; Visual Tools</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 p-6 print:p-4">
                {generatedData.tactileResources.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-purple-800 text-lg">{item.item}</h4>
                      <p className="text-sm text-slate-600 font-medium mt-2">{item.howToUse}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 print:hidden flex gap-2">
                      <a href={generateSearchLink(item.item, "amazon-game")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Amazon <ExternalLink className="w-3 h-3 ml-1"/></a>
                      <a href={generateSearchLink(item.item, "walmart")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Walmart <ExternalLink className="w-3 h-3 ml-1"/></a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Books with Amazon */}
          {generatedData.readingList && (
            <Card className="border-t-4 border-t-rose-500 bg-white rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50"><CardTitle className="flex items-center gap-2 text-xl font-black"><BookHeart className="w-6 h-6 text-rose-600"/> Recommended Reading</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedData.readingList.map((book: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-black uppercase text-indigo-500 block bg-indigo-50 w-max px-2 py-1 rounded mb-2">{book.type}</span>
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{book.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 mb-4 font-medium">&quot;{book.prompt}&quot;</p>
                      </div>
                      <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 print:hidden">
                        <a href={generateSearchLink(book.title, "amazon-book")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">Amazon</a>
                        <a href={generateSearchLink(book.title, "thriftbooks")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">Used</a>
                        <a href={generateSearchLink(book.title, "bookshop")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">Local</a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Games with Amazon/Walmart */}
          <Card className="border-t-4 border-t-emerald-500 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50"><CardTitle className="flex items-center gap-2 text-xl font-black"><Gamepad2 className="w-6 h-6 text-emerald-600"/> Let&apos;s Play</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 p-6">
              {generatedData.letsPlay?.map((game: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-emerald-800 text-lg">{game.gameName}</h4>
                    <p className="text-xs font-bold text-emerald-600 mb-2 uppercase bg-emerald-50 w-max px-2 py-1 rounded mt-2">{game.modality} | {game.skillsReinforced}</p>
                    <p className="text-sm text-slate-600 font-medium">{game.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 print:hidden flex gap-2">
                    <a href={generateSearchLink(game.gameName, "amazon-game")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Amazon <ExternalLink className="w-3 h-3 ml-1"/></a>
                    <a href={generateSearchLink(game.gameName, "walmart")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Walmart <ExternalLink className="w-3 h-3 ml-1"/></a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 📍 NEW: YouTube Search Buttons */}
          <Card className="border-t-4 border-t-red-500 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50"><CardTitle className="flex items-center gap-2 text-xl font-black"><PlaySquare className="w-6 h-6 text-red-600"/> Look &amp; Learn</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              {generatedData.lookAndLearn?.map((media: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-800 text-lg">{media.videoTitle}</p>
                    <p className="text-sm text-slate-600 font-medium mt-1">Focus: {media.topic}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-50 text-red-700 font-black text-xs px-3 py-1 rounded-full uppercase">{media.platform}</span>
                    {media.platform.toLowerCase().includes("youtube") && (
                      <a href={generateSearchLink(media.videoTitle, "youtube")} target="_blank" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center print:hidden">
                        Search YouTube <ExternalLink className="w-3 h-3 ml-1"/>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-amber-500 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50"><CardTitle className="flex items-center gap-2 text-xl font-black"><FlaskConical className="w-6 h-6 text-amber-600"/> Hands-On Learning</CardTitle></CardHeader>
            <CardContent className="space-y-6 p-6">
              {generatedData.handsOnLearning?.aroundTheHouse && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                  <h4 className="font-black text-amber-900 uppercase text-xs mb-2 bg-amber-200/50 w-max px-2 py-1 rounded">Around The House</h4>
                  <p className="font-black text-xl mb-3 text-amber-950">{generatedData.handsOnLearning.aroundTheHouse.title}</p>
                  <p className="text-base text-amber-950 font-medium mb-4">{generatedData.handsOnLearning.aroundTheHouse.instructions}</p>
                </div>
              )}
              {generatedData.handsOnLearning?.outAndAbout && (
                <div className="bg-teal-50 p-6 rounded-2xl border border-teal-200">
                  <h4 className="font-black text-teal-900 uppercase text-xs mb-2 bg-teal-200/50 w-max px-2 py-1 rounded">Local Field Trip</h4>
                  <p className="font-black text-xl mb-3 text-teal-950">{generatedData.handsOnLearning.outAndAbout.title}</p>
                  <p className="text-base text-teal-950 font-medium mb-4">{generatedData.handsOnLearning.outAndAbout.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 📍 NEW: End of Week Review (Single Worksheet) */}
          {(generatedData.endOfWeekReview || (generatedData.printableWorksheets && generatedData.printableWorksheets[0])) && (
            <Card className="shadow-sm border-2 border-slate-200 rounded-2xl overflow-hidden print:border-none print:shadow-none print:page-break-before-always">
              <CardHeader className="bg-teal-50 border-b border-teal-200 p-6">
                <p className="text-sm font-black text-teal-600 uppercase tracking-wider mb-1">End of Week Review</p>
                <CardTitle className="text-3xl font-black text-slate-800">
                  {generatedData.endOfWeekReview?.worksheetTitle || generatedData.printableWorksheets[0].worksheetTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ol className="list-decimal pl-6 space-y-8 text-xl text-slate-800 font-medium marker:font-black marker:text-teal-600">
                  {(generatedData.endOfWeekReview?.questions || generatedData.printableWorksheets[0].questions).map((q: string, qIdx: number) => (
                    <li key={qIdx} className="pl-3 leading-relaxed">{q}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </main>
  );
}