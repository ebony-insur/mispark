"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Coins, Printer, Upload, AlertCircle, Users, BookOpen, PenTool, FileText, ShoppingBag, Lock } from "lucide-react";
import Image from "next/image";
import ReviewModal from "@/components/ReviewModal";

export default function Dashboard() {
  const [lessonText, setLessonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  
  // Auth & Student State
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [dateMode, setDateMode] = useState<"this_week" | "next_week" | "custom">("this_week");
  const [customDate, setCustomDate] = useState("");
  const [printMode, setPrintMode] = useState<"all" | "worksheets" | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const currentWordCount = lessonText.trim() === "" ? 0 : lessonText.trim().split(/\s+/).length;
  const isOverLimit = currentWordCount > 750;

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsGuest(!user);

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
  }, []);

  useEffect(() => {
    if (printMode) {
      setTimeout(() => {
        window.print();
        setPrintMode(null);
      }, 100);
    }
  }, [printMode]);

  // --- DRAG AND DROP LOGIC (Unchanged for brevity, assuming standard implementation) --- //
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processPdf(file);
  };
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processPdf(file);
  };

  const processPdf = async (file: File) => {
    setIsUploadingPdf(true);
    toast.loading("Extracting text...", { id: "pdf" });
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setLessonText(data.text);
        toast.success("Extracted successfully!", { id: "pdf" });
      } else throw new Error();
    } catch {
      toast.error("Failed to parse.", { id: "pdf" });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleIgnite = async () => {
    if (!lessonText || isOverLimit) return;
    setIsLoading(true); setGeneratedData(null);
    
    // For guests, we pass a default generic profile to the AI
    const studentProfile = isGuest ? { grade: "3rd Grade", reading_grade: "3rd Grade", focus_duration: "20 mins" } : students.find(s => s.id === selectedStudentId);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonText, studentProfile }),
      });
      const data = await res.json();
      if (res.ok) setGeneratedData({ ...data.data, displayDate: "This Week" });
    } catch {
      toast.error("Generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:py-0 print:px-0">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <Image src="/MiSpark.svg" alt="Logo" width={120} height={40} className="cursor-pointer" onClick={() => router.push("/")} />
        <div className="flex gap-3">
          {isGuest ? (
            <Button onClick={() => router.push("/login?signup=true")} className="bg-orange-500 text-white font-bold">Sign Up to Save</Button>
          ) : (
            <Button onClick={() => router.push("/history")} variant="secondary">My Sparks</Button>
          )}
        </div>
      </div>

      {/* INPUT CARD */}
      <Card className="w-full max-w-4xl shadow-lg border-0 print:hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-800">Ignite Your Curriculum</CardTitle>
          <CardDescription>Paste your weekly topics below. The AI will do the rest.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* GUEST WARNING / STUDENT SELECTOR */}
          {isGuest ? (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-center gap-3 text-orange-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium"><strong>Guest Mode:</strong> You are testing a generic profile. Create a free account to customize grade levels, state standards, and neurodivergent focus profiles!</p>
            </div>
          ) : (
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-sm font-bold text-slate-700">Target Student Profile</label>
              <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-3 rounded-lg border">
                {students.map(s => <option key={s.id} value={s.id}>{s.nickname} (Grade: {s.grade})</option>)}
              </select>
            </div>
          )}

          {/* UPLOAD ZONE WITH STRICT INSTRUCTIONS */}
          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer text-center ${isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-slate-50"}`}>
            <input type="file" accept=".pdf, .png, .jpg, .docx, .txt" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            <Upload className="w-8 h-8 text-teal-500 mx-auto mb-3" />
            <p className="font-bold text-slate-700">Drag & Drop your Syllabus</p>
            
            {/* NEW: STRICT UPLOAD GUIDELINES */}
            <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">⚠️ Upload Guidelines:</p>
              <ul className="text-xs text-slate-600 list-disc pl-5 space-y-1">
                <li><strong>Less is More:</strong> Only upload the specific lesson topics for this week.</li>
                <li><strong>Remove Fluff:</strong> Do not upload entire school handbooks or rule pages, as the AI will try to build lessons out of them.</li>
                <li><strong>Max Size:</strong> Ensure files are under 5MB.</li>
              </ul>
            </div>
          </div>

          <Textarea 
            placeholder="Or type/paste your weekly topics here..." 
            value={lessonText} 
            onChange={(e) => setLessonText(e.target.value)} 
            className="min-h-[150px] text-base p-4" 
          />

          <Button onClick={handleIgnite} disabled={isLoading || !lessonText} className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-xl py-8 shadow-md">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Image src="/plannerspark.svg" alt="Loading..." width={24} height={24} className="animate-pulse" /> Generating Custom Plan...
              </span>
            ) : "Ignite ✨"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTS DASHBOARD */}
      {generatedData && (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in pb-20">
          
          {/* FREE: CORE FRAMEWORK */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader><CardTitle>Daily Framework (Free Preview)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedData.dailyFramework?.map((day: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border"><h4 className="font-extrabold text-blue-600">{day.day}</h4><p className="font-bold">{day.subject}</p></div>
              ))}
            </CardContent>
          </Card>

          {/* PREMIUM CONTENT: BLURRED FOR GUESTS */}
          <div className="relative">
            {/* If Guest, apply blur wrapper */}
            <div className={isGuest ? "blur-md grayscale opacity-40 select-none pointer-events-none space-y-8" : "space-y-8"}>
              
              <Card className="border-t-4 border-t-indigo-500">
                <CardHeader><CardTitle>Curated Reading List</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {generatedData.readingList?.map((book: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border"><h4 className="font-bold">{book.title}</h4></div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-emerald-500">
                <CardHeader><CardTitle>Game Night & Podcasts</CardTitle></CardHeader>
                <CardContent className="h-32 bg-slate-50 rounded-lg border"></CardContent>
              </Card>

              <Card className="border-t-4 border-t-slate-800">
                <CardHeader><CardTitle>Printable Custom Worksheets</CardTitle></CardHeader>
                <CardContent className="h-64 bg-slate-50 rounded-lg border"></CardContent>
              </Card>
            </div>

            {/* GUEST UNLOCK OVERLAY */}
            {isGuest && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-md animate-in slide-in-from-bottom-4">
                  <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Unlock the Magic</h3>
                  <p className="text-slate-600 mb-6 font-medium">Create a free account to instantly unlock customized Reading Lists, Game Nights, and auto-generated Printable Worksheets tailored to your child's exact focus limits.</p>
                  <Button onClick={() => router.push("/login?signup=true")} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-6 shadow-lg">
                    Create Free Account
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </main>
  );
}