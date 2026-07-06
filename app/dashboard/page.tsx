"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Printer, Upload, AlertCircle, BookOpen, PenTool, FileText, 
  Lock, Calculator, FlaskConical, Globe, Palette, Music, Lightbulb, Gamepad2, PlaySquare
} from "lucide-react";
import Image from "next/image";

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

  const [printMode, setPrintMode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Word Count Constraints
  const currentWordCount = lessonText.trim() === "" ? 0 : lessonText.trim().split(/\s+/).length;
  const isUnderLimit = currentWordCount > 0 && currentWordCount < 15;
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
  }, [supabase]);

  // Targeted Printing Effect
  useEffect(() => {
    if (printMode) {
      setTimeout(() => {
        window.print(); // Triggers browser Print Preview
        setPrintMode(null);
      }, 300);
    }
  }, [printMode]);

  // Subject Icon Mapper (Wrapped in spans to prevent TS errors)
  const getSubjectIcons = (subjects: string[]) => {
    return subjects?.map((sub, idx) => {
      const lower = sub.toLowerCase();
      if (lower.includes('math')) return <span key={idx} title={sub}><Calculator className="w-5 h-5 text-blue-500" /></span>;
      if (lower.includes('science')) return <span key={idx} title={sub}><FlaskConical className="w-5 h-5 text-emerald-500" /></span>;
      if (lower.includes('history') || lower.includes('social')) return <span key={idx} title={sub}><Globe className="w-5 h-5 text-amber-500" /></span>;
      if (lower.includes('art')) return <span key={idx} title={sub}><Palette className="w-5 h-5 text-purple-500" /></span>;
      if (lower.includes('music')) return <span key={idx} title={sub}><Music className="w-5 h-5 text-rose-500" /></span>;
      return <span key={idx} title={sub}><BookOpen className="w-5 h-5 text-indigo-500" /></span>;
    });
  };

  // --- DRAG AND DROP LOGIC --- //
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
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please keep it under 5MB.");
      return;
    }
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
    if (!lessonText || isUnderLimit || isOverLimit) return;
    setIsLoading(true); setGeneratedData(null);
    
    // For guests, pass a default profile
    const studentProfile = isGuest 
      ? { grade: "3rd Grade", focus_duration: "20 mins", math_mastery_level: "Standard", reading_mastery_level: "Standard" } 
      : students.find(s => s.id === selectedStudentId);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonText, studentProfile }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setGeneratedData(data.data);
        
        // SILENTLY SAVE TO DATABASE IF LOGGED IN
        if (!isGuest && user) {
          const { error: saveError } = await supabase.from('lesson_plans').insert({
            parent_id: user.id,
            student_id: selectedStudentId || null,
            original_prompt: lessonText,
            plan_data: data.data
          });
          if (saveError) console.error("Save error:", saveError);
        }

      } else {
        throw new Error();
      }
    } catch {
      toast.error("Generation failed. Please try again.");
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
            <Button onClick={() => router.push("/login?signup=true")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Sign Up to Save</Button>
          ) : (
            <Button onClick={() => router.push("/history")} variant="secondary">My Sparks</Button>
          )}
        </div>
      </div>

      {/* INPUT CARD */}
      <Card className="w-full max-w-4xl shadow-lg border-0 print:hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-800">Ignite Your Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* GUEST WARNING / STUDENT SELECTOR */}
          {isGuest ? (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-center gap-3 text-orange-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium"><strong>Guest Mode:</strong> You are testing a generic profile. Create a free account to customize curriculums and neurodivergent focus profiles!</p>
            </div>
          ) : (
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-sm font-bold text-slate-700">Target Student Profile</label>
              <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-3 rounded-lg border bg-white">
                {students.map(s => <option key={s.id} value={s.id}>{s.nickname} (Grade: {s.grade})</option>)}
              </select>
            </div>
          )}

          {/* UPLOAD ZONE */}
          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer text-center ${isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-slate-50"}`}>
            <input type="file" accept=".pdf, .png, .jpg, .docx, .txt" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            <Upload className="w-8 h-8 text-teal-500 mx-auto mb-3" />
            <p className="font-bold text-slate-700">Drag & Drop your Syllabus</p>
            
            <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">⚠️ Upload Guidelines:</p>
              <ul className="text-xs text-slate-600 list-disc pl-5 space-y-1">
                <li><strong>Less is More:</strong> Only upload the specific lesson topics for this week.</li>
                <li><strong>Remove Fluff:</strong> Do not upload entire school handbooks.</li>
                <li><strong>Max Size:</strong> Ensure files are under 5MB.</li>
              </ul>
            </div>
          </div>

          <div>
            <Textarea 
              placeholder="Or type/paste your weekly topics here (minimum 15 words)..." 
              value={lessonText} 
              onChange={(e) => setLessonText(e.target.value)} 
              className={`min-h-[150px] text-base p-4 ${isUnderLimit || isOverLimit ? 'border-orange-300' : ''}`} 
            />
            <div className="flex justify-between items-center text-xs mt-2 text-slate-500 font-bold">
              <span className={isUnderLimit || isOverLimit ? "text-red-500" : ""}>
                {isUnderLimit && "Please enter at least 15 words to give the AI context."}
                {isOverLimit && "Word limit exceeded. Please shorten to 750 words."}
              </span>
              <span>{currentWordCount} / 750 words</span>
            </div>
          </div>

          <Button 
            onClick={handleIgnite} 
            disabled={isLoading || isUnderLimit || isOverLimit || isUploadingPdf} 
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xl py-8 shadow-md"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Image src="/loading-spark.svg" alt="Loading..." width={24} height={24} className="animate-pulse" /> Generating Custom Plan...
              </span>
            ) : "Ignite ✨"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTS DASHBOARD */}
      {generatedData && (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in pb-20 print:space-y-6">
          
          <div className="flex justify-end gap-3 print:hidden mb-4 border-b pb-4">
             <Button onClick={() => setPrintMode("all")} className="bg-slate-800 text-white"><Printer className="w-4 h-4 mr-2"/> Print Full Plan</Button>
          </div>

          {/* CORE FRAMEWORK & FOUNDATION (Visible to All) */}
          <div className={printMode && printMode !== 'all' && printMode !== 'foundation' ? 'print:hidden' : 'print:block'}>
            <Card className="border-t-4 border-t-blue-500 bg-white">
              <CardHeader className="flex flex-row justify-between items-center print:p-4">
                <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-blue-600"/> Assessed Foundation & Standards</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPrintMode('foundation')} className="print:hidden"><Printer className="w-4 h-4"/></Button>
              </CardHeader>
              <CardContent className="space-y-6 print:p-4">
                <p className="text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  {generatedData.assessedFoundation}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {generatedData.outlinedStandards?.map((day: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <h4 className="font-extrabold text-blue-700 text-sm uppercase">{day.day}</h4>
                      <p className="font-bold text-slate-800 text-sm mt-1">{day.subject}</p>
                      <p className="text-slate-600 text-sm">{day.topic}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* READING LIST (Visible to All) */}
          <div className={printMode && printMode !== 'all' && printMode !== 'reading' ? 'print:hidden' : 'print:block'}>
            <Card className="border-t-4 border-t-indigo-500 bg-white">
              <CardHeader className="flex flex-row justify-between items-center print:p-4">
                <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600"/> Recommended Reading & Writing</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPrintMode('reading')} className="print:hidden"><Printer className="w-4 h-4"/></Button>
              </CardHeader>
              <CardContent className="space-y-6 print:p-4">
                {generatedData.readingList?.map((book: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black uppercase text-indigo-500">{book.type}</span>
                          <div className="flex gap-1">{getSubjectIcons(book.subjects)}</div>
                        </div>
                        <h4 className="font-black text-slate-900 text-lg">{book.title}</h4>
                        <p className="text-sm font-bold text-slate-600 mb-2">by {book.author}</p>
                        <p className="text-sm text-slate-700">{book.description}</p>
                      </div>
                    </div>
                    {/* Writing Prompt */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1">
                        <PenTool className="w-4 h-4 text-orange-500"/> Writing Prompt:
                      </p>
                      <p className="text-sm text-slate-600 italic bg-white p-3 rounded border border-slate-100">"{book.writingPrompt}"</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* LET'S PLAY (Visible to All) */}
          <div className={printMode && printMode !== 'all' && printMode !== 'games' ? 'print:hidden' : 'print:block'}>
            <Card className="border-t-4 border-t-emerald-500 bg-white">
              <CardHeader className="flex flex-row justify-between items-center print:p-4">
                <CardTitle className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-600"/> Let's Play (Game Suggestions)</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPrintMode('games')} className="print:hidden"><Printer className="w-4 h-4"/></Button>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 print:p-4">
                {generatedData.letsPlay?.map((game: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-emerald-800">{game.gameName}</h4>
                    <p className="text-xs font-bold text-emerald-600 mb-2 uppercase">{game.modality} | {game.skillsReinforced}</p>
                    <p className="text-sm text-slate-600">{game.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* PREMIUM CONTENT BLOCK */}
          <div className="relative">
            <div className={isGuest ? "blur-md grayscale opacity-40 select-none pointer-events-none space-y-8" : "space-y-8"}>
              
              {/* LOOK & LEARN */}
              <div className={printMode && printMode !== 'all' && printMode !== 'media' ? 'print:hidden' : 'print:block'}>
                <Card className="border-t-4 border-t-red-500">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><PlaySquare className="w-5 h-5 text-red-600"/> Look & Learn (Media & Docs)</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setPrintMode('media')} className="print:hidden"><Printer className="w-4 h-4"/></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-sm font-medium flex gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0"/> Parent Tip: Pay close attention to the chapter match sections in these videos to align with the worksheets!
                    </div>
                    {generatedData.lookAndLearn?.map((media: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg border">
                        <p className="font-bold text-slate-800">{media.videoTitle}</p>
                        <p className="text-sm text-slate-600">Platform: {media.platform} | Focus: {media.topic}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* HANDS ON LEARNING */}
              <div className={printMode && printMode !== 'all' && printMode !== 'handsOn' ? 'print:hidden' : 'print:block'}>
                <Card className="border-t-4 border-t-amber-500">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5 text-amber-600"/> Hands-On Learning</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setPrintMode('handsOn')} className="print:hidden"><Printer className="w-4 h-4"/></Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Around House */}
                    {generatedData.handsOnLearning?.aroundTheHouse && (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <h4 className="font-black text-amber-900 uppercase text-sm mb-1">Around The House</h4>
                        <p className="font-bold text-lg mb-2">{generatedData.handsOnLearning.aroundTheHouse.title}</p>
                        <p className="text-sm font-medium mb-2"><strong>Supplies:</strong> {generatedData.handsOnLearning.aroundTheHouse.supplies.join(", ")}</p>
                        <p className="text-sm mb-3">{generatedData.handsOnLearning.aroundTheHouse.instructions}</p>
                        <div className="bg-white p-3 rounded border border-amber-100 text-sm">
                          <strong>🗣️ Extended Conversation:</strong> {generatedData.handsOnLearning.aroundTheHouse.extendedConversation}
                        </div>
                      </div>
                    )}
                    {/* Out and About */}
                    {generatedData.handsOnLearning?.outAndAbout && (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <h4 className="font-black text-amber-900 uppercase text-sm mb-1">Out and About</h4>
                        <p className="font-bold text-lg mb-2">{generatedData.handsOnLearning.outAndAbout.title}</p>
                        <p className="text-sm font-medium mb-2"><strong>Supplies:</strong> {generatedData.handsOnLearning.outAndAbout.supplies.join(", ")}</p>
                        <p className="text-sm mb-3">{generatedData.handsOnLearning.outAndAbout.instructions}</p>
                        <div className="bg-white p-3 rounded border border-amber-100 text-sm">
                          <strong>🗣️ Extended Conversation:</strong> {generatedData.handsOnLearning.outAndAbout.extendedConversation}
                        </div>
                      </div>
                    )}
                    {/* Big Ideas */}
                    {generatedData.handsOnLearning?.bigIdeas && (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <h4 className="font-black text-amber-900 uppercase text-sm mb-1">Big Ideas (Capstone)</h4>
                        <p className="font-bold text-lg mb-2">{generatedData.handsOnLearning.bigIdeas.title}</p>
                        <p className="text-sm font-medium mb-2"><strong>Supplies:</strong> {generatedData.handsOnLearning.bigIdeas.supplies.join(", ")}</p>
                        <p className="text-sm mb-3">{generatedData.handsOnLearning.bigIdeas.instructions}</p>
                        <div className="bg-white p-3 rounded border border-amber-100 text-sm">
                          <strong>🗣️ Extended Conversation:</strong> {generatedData.handsOnLearning.bigIdeas.extendedConversation}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* LETS TALK & LETS EXPLORE */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-t-4 border-t-teal-500">
                  <CardHeader><CardTitle>Let's Talk (Kindling)</CardTitle></CardHeader>
                  <CardContent><ul className="list-disc pl-5 space-y-2 text-sm">{generatedData.letsTalk?.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul></CardContent>
                </Card>
                <Card className="border-t-4 border-t-purple-500">
                  <CardHeader><CardTitle>Let's Explore (Illuminations)</CardTitle></CardHeader>
                  <CardContent><ul className="list-disc pl-5 space-y-2 text-sm">{generatedData.letsExplore?.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul></CardContent>
                </Card>
              </div>

              {/* DAILY WORKSHEETS */}
              {generatedData.printableWorksheets && (
                <div className={printMode && printMode !== 'all' && printMode !== 'worksheets' ? 'print:hidden' : 'print:block space-y-8 pt-8'}>
                  <div className="flex justify-between items-center print:hidden border-b pb-4">
                    <h3 className="text-2xl font-black text-slate-800"><FileText className="w-6 h-6 inline mr-2"/> Daily Worksheets</h3>
                    <Button onClick={() => setPrintMode("worksheets")} className="bg-teal-600 text-white"><Printer className="w-4 h-4 mr-2"/> Print Worksheets</Button>
                  </div>
                  
                  {generatedData.printableWorksheets.map((worksheet: any, idx: number) => (
                    <Card key={idx} className="shadow-none border-2 border-slate-200 print:border-none print:page-break-before-always print:m-0 print:p-0">
                      <CardHeader className="bg-slate-50 border-b print:bg-white print:px-0">
                        <p className="text-sm font-extrabold text-teal-600 uppercase">{worksheet.day} | {worksheet.estimatedDuration}</p>
                        <CardTitle className="text-2xl">{worksheet.worksheetTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 print:p-0 print:pt-8">
                        <ol className="list-decimal pl-6 space-y-6 text-lg text-slate-800 font-medium">
                          {worksheet.questions?.map((q: string, qIdx: number) => (
                            <li key={qIdx} className="pl-2">{q}</li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* GUEST UNLOCK OVERLAY */}
            {isGuest && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-md">
                  <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Unlock the Full Teacher Kit</h3>
                  <p className="text-slate-600 mb-6 font-medium">Create a free account to instantly unlock Deep-Dive Conversational Guides, Custom Printable Worksheets, and precise Media Links tailored to your curriculum.</p>
                  <Button onClick={() => router.push("/login?signup=true")} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg py-6 shadow-lg">
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