"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Printer, Upload, BookOpen, FileText, 
  FlaskConical, Lightbulb, Gamepad2, PlayCircle, 
  BookHeart, ExternalLink, Zap, User as UserIcon, ChevronDown, 
  Loader2, Plus, Shapes, ChevronRight, ChevronsUpDown
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

// Helper functions for smart search links
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

const LOADING_MESSAGES = [
  "Analyzing applicable state standards...",
  "Curating tactile learning resources...",
  "Searching local area for field trips...",
  "Drafting the end-of-week review...",
  "Finalizing your curriculum..."
];

// Reusable Collapsible Section Component
const CollapsibleSection = ({ title, icon, children, colorClass, forceOpen }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  
  useEffect(() => {
    setIsOpen(forceOpen);
  }, [forceOpen]);

  return (
    <Card className={`border-t-4 ${colorClass} bg-white rounded-2xl shadow-sm overflow-hidden mb-6 print:border-none print:shadow-none print:mb-6`}>
      <CardHeader 
        className="bg-slate-50/50 cursor-pointer print:p-4 hover:bg-slate-100 transition-colors flex flex-row items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
          {icon} {title}
        </CardTitle>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""} print:hidden`} />
      </CardHeader>
      {isOpen && (
        <CardContent className="p-6 print:p-0 print:pt-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default function Dashboard() {
  const [lessonText, setLessonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [generatedData, setGeneratedData] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [isGuest, setIsGuest] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
  const [sparksBalance, setSparksBalance] = useState<number>(0);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("Free Trial");
  const [printMode, setPrintMode] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(true);

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

  // Dynamic Loading Message Cycle
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (printMode) {
      setAllExpanded(true); // Ensure everything is open before printing
      setTimeout(() => { window.print(); setPrintMode(null); }, 500);
    }
  }, [printMode]);

  const processPdf = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("File is too large (max 5MB)."); return; }
    setIsUploadingPdf(true); toast.loading("Extracting text...", { id: "pdf" });
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) { 
        setLessonText((prev) => prev + "\n" + data.text); 
        toast.success("Extracted successfully!", { id: "pdf" }); 
      }
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

    setIsLoading(true); setGeneratedData(null); setAllExpanded(true);
    const studentProfile = isGuest ? { grade: "3rd Grade", focus_duration: "20 mins", state_residence: "General US", zip_code: "12345", interests: "General", sensory_needs: "None" } : students.find(s => s.id === selectedStudentId);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonText, studentProfile, subscriptions: isGuest ? ["YouTube"] : activeSubscriptions }),
      });
      const data = await res.json();
      
      if (res.ok && data.data) {
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
    } catch { toast.error("Generation failed. Please try again."); } 
    finally { setIsLoading(false); }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:py-0 print:px-0">
      
      <SiteHeader />

      {/* INPUT AREA */}
      <div className="w-full max-w-5xl space-y-6 print:hidden">
        
        {/* Student Selector */}
        {!isGuest && (
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 items-center justify-between">
            <div className="flex items-center gap-4 w-full">
              <label className="text-sm font-extrabold text-slate-700 uppercase whitespace-nowrap">Teaching:</label>
              <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold bg-slate-50">
                {students.length === 0 ? <option value="" disabled>No students found. Add one!</option> : students.map(s => <option key={s.id} value={s.id}>{s.nickname} (Grade: {s.grade})</option>)}
              </select>
              <Button onClick={() => router.push("/dashboard/students")} className="px-4 bg-slate-800 text-white rounded-xl"><Plus className="w-5 h-5" /></Button>
            </div>
          </div>
        )}

        {/* Side-by-Side Inputs */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Drag and Drop */}
          <div 
            onDragOver={(e) => {e.preventDefault(); setIsDragging(true)}} 
            onDragLeave={() => setIsDragging(false)} 
            onDrop={(e) => {e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processPdf(f)}} 
            onClick={() => fileInputRef.current?.click()} 
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px] transition-colors ${isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-white hover:bg-slate-50"}`}
          >
            <input type="file" accept=".pdf, .png, .jpg, .docx, .txt" className="hidden" ref={fileInputRef} onChange={(e) => {const f = e.target.files?.[0]; if(f) processPdf(f)}} />
            <Upload className="w-12 h-12 mb-4 text-slate-400" />
            <p className="font-extrabold text-xl text-slate-700 mb-2">Drag &amp; Drop Syllabus</p>
            <p className="text-sm text-slate-500 font-medium max-w-[200px]">Upload a PDF or image to extract weekly topics automatically.</p>
          </div>

          {/* Text Area */}
          <div className="flex flex-col bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm">
            <Textarea 
              placeholder="Or type/paste weekly topics, math concepts, or history subjects here..." 
              value={lessonText} 
              onChange={(e) => setLessonText(e.target.value)} 
              className="flex-1 min-h-[200px] p-4 rounded-xl border-0 focus-visible:ring-0 text-lg resize-none" 
            />
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl mt-2 text-xs text-slate-500 font-bold border border-slate-100">
              <span className={isUnderLimit || isOverLimit ? "text-red-500" : ""}>{isUnderLimit && "Min 15 words required."}{isOverLimit && "Max 750 words."}</span>
              <span>{currentWordCount} / 750 words</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={() => setLessonText("")} 
            variant="outline"
            disabled={isLoading || lessonText.length === 0}
            className="w-1/3 py-8 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-100"
          >
            Clear Lesson
          </Button>
          <Button 
            onClick={handleIgnite} 
            disabled={isLoading || isUnderLimit || isOverLimit || isUploadingPdf || (!isGuest && students.length === 0)} 
            className="w-2/3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-2xl py-8 rounded-2xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 relative overflow-hidden"
          >
            {isLoading ? (
              <span className="flex items-center gap-3 relative z-10">
                <Loader2 className="w-6 h-6 animate-spin" /> {LOADING_MESSAGES[loadingMsgIdx]}
              </span>
            ) : "Ignite Curiosity ✨"}
          </Button>
        </div>
      </div>

      {/* RESULTS DASHBOARD */}
      {generatedData && (
        <div className="w-full max-w-5xl space-y-2 animate-in fade-in slide-in-from-bottom-8 pb-20 print:space-y-6">
          
          {/* Controls */}
          <div className="flex justify-between items-center mb-6 print:hidden bg-slate-800 p-3 rounded-2xl text-white shadow-lg">
            <Button variant="ghost" onClick={() => setAllExpanded(!allExpanded)} className="text-slate-300 hover:text-white hover:bg-slate-700 font-bold rounded-xl">
              <ChevronsUpDown className="w-5 h-5 mr-2"/> {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
            <Button onClick={() => setPrintMode("all")} className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm">
              <Printer className="w-4 h-4 mr-2"/> Print Plan
            </Button>
          </div>

          <CollapsibleSection title="Applicable Standards" icon={<Lightbulb className="w-6 h-6 text-blue-600"/>} colorClass="border-t-blue-500" forceOpen={allExpanded}>
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
          </CollapsibleSection>

          {generatedData.tactileResources && (
            <CollapsibleSection title="Tactile & Visual Tools" icon={<Shapes className="w-6 h-6 text-purple-600"/>} colorClass="border-t-purple-500" forceOpen={allExpanded}>
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>
            </CollapsibleSection>
          )}

          {generatedData.readingList && (
            <CollapsibleSection title="Recommended Reading" icon={<BookHeart className="w-6 h-6 text-rose-600"/>} colorClass="border-t-rose-500" forceOpen={allExpanded}>
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
            </CollapsibleSection>
          )}

          <CollapsibleSection title="Let's Play" icon={<Gamepad2 className="w-6 h-6 text-emerald-600"/>} colorClass="border-t-emerald-500" forceOpen={allExpanded}>
            <div className="grid md:grid-cols-2 gap-4">
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
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Look & Learn" icon={<PlayCircle className="w-6 h-6 text-red-600"/>} colorClass="border-t-red-500" forceOpen={allExpanded}>
            <div className="space-y-4">
              {generatedData.lookAndLearn?.map((media: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-800 text-lg">{media.videoTitle}</p>
                    <p className="text-sm text-slate-600 font-medium mt-1">Focus: {media.topic}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-50 text-red-700 font-black text-xs px-3 py-1 rounded-full uppercase">{media.platform}</span>
                    {media.platform.toLowerCase().includes("youtube") && (
                      <a href={generateSearchLink(media.videoTitle, "youtube")} target="_blank" className="text-red-600 hover:text-red-700 transition-colors print:hidden group flex items-center">
                        <PlayCircle className="w-10 h-10 group-hover:scale-110 transition-transform"/>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Hands-On Learning" icon={<FlaskConical className="w-6 h-6 text-amber-600"/>} colorClass="border-t-amber-500" forceOpen={allExpanded}>
            <div className="space-y-6">
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
            </div>
          </CollapsibleSection>

          {(generatedData.endOfWeekReview || (generatedData.printableWorksheets && generatedData.printableWorksheets[0])) && (
            <CollapsibleSection title="End of Week Review" icon={<FileText className="w-6 h-6 text-teal-600"/>} colorClass="border-t-teal-500" forceOpen={allExpanded}>
               <h3 className="text-3xl font-black text-slate-800 mb-8 border-b-2 border-slate-100 pb-4">
                  {generatedData.endOfWeekReview?.worksheetTitle || generatedData.printableWorksheets[0].worksheetTitle}
               </h3>
               <ol className="list-decimal pl-6 space-y-8 text-xl text-slate-800 font-medium marker:font-black marker:text-teal-600">
                  {(generatedData.endOfWeekReview?.questions || generatedData.printableWorksheets[0].questions).map((q: string, qIdx: number) => (
                    <li key={qIdx} className="pl-3 leading-relaxed">{q}</li>
                  ))}
               </ol>
            </CollapsibleSection>
          )}

        </div>
      )}
    </main>
  );
}
//Force Updates