"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Printer, Upload, FileText, FlaskConical, Lightbulb, 
  Gamepad2, PlayCircle, BookHeart, ExternalLink, Loader2, 
  Plus, Shapes, ChevronRight, ChevronsUpDown, XCircle, 
  Sparkles, MapPin, MessageCircle, Lock, Settings
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

// Affiliate Search Link Generator
const generateSearchLink = (query: string, platform: "amazon-book" | "amazon-game" | "walmart" | "thriftbooks" | "bookshop" | "youtube") => {
  const encoded = encodeURIComponent(query);
  const AMAZON_TAG = "mispark0a-20"; 
  
  switch(platform) {
    case "amazon-book": return `https://www.amazon.com/s?k=${encoded}+book&tag=${AMAZON_TAG}`;
    case "amazon-game": return `https://www.amazon.com/s?k=${encoded}&tag=${AMAZON_TAG}`;
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

const CollapsibleSection = ({ title, icon, children, colorClass, forceOpen }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => { setIsOpen(forceOpen); }, [forceOpen]);

  return (
    <Card className={`border-t-4 ${colorClass} bg-white rounded-2xl shadow-sm overflow-hidden mb-6 print:border-none print:shadow-none print:mb-6`}>
      <CardHeader className="bg-slate-50/50 cursor-pointer print:p-4 hover:bg-slate-100 transition-colors flex flex-row items-center justify-between" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">{icon} {title}</CardTitle>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""} print:hidden`} />
      </CardHeader>
      {isOpen && <CardContent className="p-6 print:p-0 print:pt-4">{children}</CardContent>}
    </Card>
  );
};

export default function Dashboard() {
  const [lessonText, setLessonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  
  const [generatedData, setGeneratedData] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [isGuest, setIsGuest] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [allExpanded, setAllExpanded] = useState(true);
  const [printMode, setPrintMode] = useState<string | null>(null);

  // New Account & Billing State
  const [sparks, setSparks] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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
        // Fetch User Profile for Sparks & Sub Status
        const { data: profile } = await supabase.from("profiles").select("sparks_remaining, is_subscribed").eq("id", user.id).single();
        if (profile) {
          setSparks(profile.sparks_remaining);
          setIsSubscribed(profile.is_subscribed);
        }

        // Fetch Students
        const { data: studentData } = await supabase.from("children_profiles")
          .select("*")
          .eq("parent_id", user.id)
          .order("created_at", { ascending: false });
          
        if (studentData && studentData.length > 0) {
          setStudents(studentData);
          setSelectedStudentId(studentData[0].id);
        } else {
          window.location.href = "/onboarding";
        }
      }
    };
    fetchUserAndData();
  }, [supabase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => { setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length); }, 3000);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (printMode) {
      setAllExpanded(true);
      setTimeout(() => { window.print(); setPrintMode(null); }, 500);
    }
  }, [printMode]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      toast.info("Generation stopped. You can edit your plan and try again.");
    }
  };

  const processPdf = async (file: File) => {
    setIsUploadingPdf(true); toast.loading("Extracting text...", { id: "pdf" });
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) { setLessonText((prev) => prev + "\n" + data.text); toast.success("Extracted successfully!", { id: "pdf" }); }
    } catch { toast.error("Failed to parse.", { id: "pdf" }); } 
    finally { setIsUploadingPdf(false); }
  };

  const handleRedeem = async () => {
    setIsRedeeming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ code: promoCode })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message);
        setSparks(6); // Visually update the UI
        setPromoCode("");
      } else {
        toast.error(data.error || "Failed to apply promo.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, email: user?.email })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Checkout failed to load. Please try again.");
      setIsUpgrading(false);
    }
  };

  const handleIgnite = async () => {
    setIsLoading(true); setGeneratedData(null); setAllExpanded(true);
    abortControllerRef.current = new AbortController();
    
    const studentProfile = isGuest 
      ? { grade: "3rd Grade", focus_duration: "20 mins", state_residence: "General US", zip_code: "12345" } 
      : students.find(s => s.id === selectedStudentId);
    
    try {
      // Pass the session token so the API knows who is requesting (and deducting)
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": session ? `Bearer ${session.access_token}` : ""
        },
        body: JSON.stringify({ lessonText, studentProfile }),
        signal: abortControllerRef.current.signal
      });
      
      const data = await res.json();
      
      if (res.ok && data.data) {
        setGeneratedData(data.data);
        // Visually deduct a spark for free users
        if (!isGuest && !isSubscribed && sparks !== null && sparks > 0) {
          setSparks(sparks - 1);
        }
      } else {
        throw new Error(data.error || "Failed to generate");
      }
    } catch (err: any) { 
      if (err.name !== "AbortError") toast.error(err.message || "Generation failed."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const outOfSparks = !isGuest && !isSubscribed && sparks !== null && sparks <= 0;

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:py-0 print:px-0">
      <SiteHeader />

      <div className="w-full max-w-5xl space-y-6 print:hidden">
        
        {/* DEMO UPSELL BANNER */}
        {isGuest && (
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-teal-600 shrink-0"/>
              <div>
                <p className="font-black text-teal-900">You are using the Live Demo</p>
                <p className="text-sm text-teal-800 font-medium">Create a free account to unlock lesson plans that automatically adapt to what your child loves. Pro tip: The more specific your prompt below, the better the AI performs!</p>
              </div>
            </div>
            <Button onClick={() => router.push("/login?signup=true")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold whitespace-nowrap px-6">
              Sign Up Free
            </Button>
          </div>
        )}

        {/* ACCOUNT STATUS & STUDENT SELECTOR */}
        {!isGuest && (
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Student Selector */}
            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
              <label className="text-xs font-extrabold text-slate-500 uppercase mb-2">Current Learner</label>
              <div className="flex items-center gap-3">
                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-2 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none">
                  {students.length === 0 ? <option value="" disabled>No learners found.</option> : students.map(s => <option key={s.id} value={s.id}>{s.nickname} (Grade: {s.grade})</option>)}
                </select>
                <Button onClick={() => router.push("/dashboard/students")} className="px-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700"><Plus className="w-5 h-5" /></Button>
              </div>
            </div>

            {/* Spark Count & Promo (Hidden if subscribed) */}
            {!isSubscribed && sparks !== null && (
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500 uppercase">Sparks Remaining</span>
                  <span className={`text-lg font-black ${sparks > 0 ? 'text-orange-500' : 'text-red-500'}`}>{sparks}</span>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter Promo Code" 
                    value={promoCode} 
                    onChange={(e) => setPromoCode(e.target.value)} 
                    className="h-9 text-sm font-medium border-slate-200" 
                  />
                  <Button 
                    onClick={handleRedeem} 
                    disabled={!promoCode || isRedeeming} 
                    className="h-9 px-4 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INPUT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => fileInputRef.current?.click()} className="md:col-span-1 border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[125px]">
            <input type="file" accept=".pdf, .png, .jpg, .docx, .txt" className="hidden" ref={fileInputRef} onChange={(e) => {const f = e.target.files?.[0]; if(f) processPdf(f)}} />
            <Upload className="w-8 h-8 mb-2 text-slate-400" />
            <p className="font-extrabold text-lg text-slate-700 leading-tight">Upload PDF</p>
            <p className="text-xs text-slate-500 font-medium">Extract topics instantly</p>
          </div>

          <div className="md:col-span-2 flex flex-col bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm">
            <Textarea placeholder="Type weekly topics, math concepts, or history subjects here..." value={lessonText} onChange={(e) => setLessonText(e.target.value)} className="flex-1 min-h-[125px] p-4 rounded-xl border-0 focus-visible:ring-0 text-base resize-none" />
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl mt-2 text-xs text-slate-500 font-bold border border-slate-100">
              <span className={isUnderLimit || isOverLimit ? "text-red-500" : ""}>{isUnderLimit && "Min 15 words required."}{isOverLimit && "Max 750 words."}</span>
              <span>{currentWordCount} / 750 words</span>
            </div>
          </div>
        </div>

        {/* MOBILE FRIENDLY LARGE LOADING TEXT */}
        {isLoading && (
          <div className="w-full bg-slate-800 text-white p-6 rounded-2xl text-center shadow-lg animate-pulse border border-slate-700">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-teal-400" />
            <p className="text-xl md:text-2xl font-black leading-tight text-teal-50">{LOADING_MESSAGES[loadingMsgIdx]}</p>
          </div>
        )}

        {/* ACTION BUTTONS (WITH PAYWALL) */}
        <div className="flex gap-6">
          <Button onClick={() => setLessonText("")} variant="outline" disabled={isLoading || lessonText.length === 0} className="w-1/3 py-8 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-100">
            Clear
          </Button>
          
          {outOfSparks ? (
            <Button onClick={handleUpgrade} disabled={isUpgrading} className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl md:text-2xl py-8 rounded-2xl border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all">
              {isUpgrading ? <Loader2 className="w-6 h-6 animate-spin mr-2"/> : <><Lock className="w-6 h-6 mr-2" /> Upgrade to Continue</>}
            </Button>
          ) : isLoading ? (
            <Button onClick={handleStop} className="w-2/3 bg-red-500 hover:bg-red-600 text-white font-black text-xl md:text-2xl py-8 rounded-2xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1">
              <XCircle className="w-6 h-6 mr-2" /> Stop Generation
            </Button>
          ) : (
            <Button onClick={handleIgnite} disabled={isUnderLimit || isOverLimit || isUploadingPdf} className="w-2/3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-xl md:text-2xl py-8 rounded-2xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 overflow-hidden">
              Ignite Curiosity ✨
            </Button>
          )}
        </div>
      </div>

      {/* RESULTS AREA */}
      {generatedData && (
        <div className="w-full max-w-5xl space-y-2 animate-in fade-in slide-in-from-bottom-8 pb-20 print:space-y-6">
          
          <div className="flex justify-between items-center mb-6 print:hidden bg-slate-800 p-3 rounded-2xl text-white shadow-lg">
            <Button variant="ghost" onClick={() => setAllExpanded(!allExpanded)} className="text-slate-300 hover:text-white hover:bg-slate-700 font-bold rounded-xl">
              <ChevronsUpDown className="w-5 h-5 mr-2"/> {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
            <Button onClick={() => setPrintMode("all")} className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm">
              <Printer className="w-4 h-4 mr-2"/> Print Plan
            </Button>
          </div>

          {/* GUEST VISUAL PREVIEW OF LEARNER PROFILE */}
          {isGuest && (
            <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 md:p-8 shadow-md mb-8 flex flex-col md:flex-row items-center gap-8 print:hidden">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" /> Member Feature
                </div>
                <h3 className="text-3xl font-black text-slate-900 leading-tight">Unlock the Customization Engine</h3>
                <p className="text-slate-600 font-medium text-lg">
                  This demo generated a generic lesson plan. When you create a free account, you configure a <span className="font-bold text-indigo-600">Learner Profile</span>. Our AI uses these settings to instantly curate books, games, and state standards tailored exactly to your child.
                </p>
                <Button onClick={() => router.push("/login?signup=true")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-xl text-lg mt-2">
                  Create Free Account
                </Button>
              </div>
              
              {/* CSS-based Mock Learner Profile Card */}
              <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Settings className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg">Learner Profile</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">Settings Preview</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-bold text-sm">State Standards</span>
                    <span className="text-slate-800 font-black text-sm bg-slate-100 px-2 py-1 rounded">Texas (TEKS)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-bold text-sm">Focus Duration</span>
                    <span className="text-slate-800 font-black text-sm bg-slate-100 px-2 py-1 rounded">15 Minutes</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-bold text-sm">Interests</span>
                    <span className="text-slate-800 font-black text-sm bg-slate-100 px-2 py-1 rounded">Dinosaurs, Space</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-bold text-sm">Sensory Needs</span>
                    <span className="text-slate-800 font-black text-sm bg-slate-100 px-2 py-1 rounded">Tactile / Hands-on</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CollapsibleSection title="Applicable Standards" icon={<Lightbulb className="w-6 h-6 text-blue-600"/>} colorClass="border-t-blue-500" forceOpen={allExpanded}>
            <p className="text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-lg">
              {generatedData.assessedFoundation}
            </p>
            
            {isGuest && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3 print:hidden">
                <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                  <span className="font-bold">Member Benefit:</span> Full members map this directly to their specific state's requirements (e.g., Texas TEKS, Florida B.E.S.T.) for stress-free compliance and evaluator reporting.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {generatedData.outlinedStandards?.map((std: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 text-base">{std.subject}</p>
                  <p className="text-slate-600 text-sm mt-1">{std.topic}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {generatedData.buyableTools && generatedData.buyableTools.length > 0 && (
            <CollapsibleSection title="Tactile & Visual Tools" icon={<Shapes className="w-6 h-6 text-purple-600"/>} colorClass="border-t-purple-500" forceOpen={allExpanded}>
              <div className="grid md:grid-cols-2 gap-4">
                {generatedData.buyableTools.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-purple-800 text-lg">{item.item}</h4>
                      <p className="text-sm text-slate-600 font-medium mt-2">{item.howToUse}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 print:hidden">
                      <a href={generateSearchLink(item.searchQuery || item.item, "amazon-game")} target="_blank" className="w-full flex justify-center text-xs font-bold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                        Find on Amazon <ExternalLink className="w-3 h-3 ml-1"/>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.readingList && generatedData.readingList.length > 0 && (
            <CollapsibleSection title="Recommended Reading" icon={<BookHeart className="w-6 h-6 text-rose-600"/>} colorClass="border-t-rose-500" forceOpen={allExpanded}>
              {isGuest && (
                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3 print:hidden">
                  <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                    <span className="font-bold">Member Benefit:</span> This generic list was generated for a 3rd grader. As a member, our AI considers your child's exact reading level and specific interests to curate books they will actually want to read.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedData.readingList.map((book: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-indigo-500 inline-block bg-indigo-50 px-2 py-1 rounded mb-2 max-w-full break-words">{book.type}</span>
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

          {generatedData.letsPlay && generatedData.letsPlay.length > 0 && (
            <CollapsibleSection title="Let's Play" icon={<Gamepad2 className="w-6 h-6 text-emerald-600"/>} colorClass="border-t-emerald-500" forceOpen={allExpanded}>
              {isGuest && (
                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3 print:hidden">
                  <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                    <span className="font-bold">Member Benefit:</span> Activities are perfectly scaled to match your learner's focus duration and sensory needs. Plus, use our Hearts & Stars rating system to teach the AI which games your child loves most!
                  </p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {generatedData.letsPlay.map((game: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-emerald-800 text-lg">{game.gameName}</h4>
                      <p className="text-xs font-bold text-emerald-600 mb-2 uppercase bg-emerald-50 inline-block px-2 py-1 rounded mt-2 max-w-full break-words">
                        {game.modality} | {game.skillsReinforced}
                      </p>
                      <p className="text-sm text-slate-600 font-medium">{game.description}</p>
                    </div>
                    {game.isBuyable && (
                      <div className="mt-4 pt-4 border-t border-slate-100 print:hidden flex gap-2">
                        <a href={generateSearchLink(game.searchQuery || game.gameName, "amazon-game")} target="_blank" className="flex-1 flex justify-center text-xs font-bold py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                          Find on Amazon <ExternalLink className="w-3 h-3 ml-1"/>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.householdExperiments && generatedData.householdExperiments.length > 0 && (
            <CollapsibleSection title="Hands-On Experiments" icon={<FlaskConical className="w-6 h-6 text-amber-600"/>} colorClass="border-t-amber-500" forceOpen={allExpanded}>
              <div className="space-y-4">
                {generatedData.householdExperiments.map((exp: any, idx: number) => (
                  <div key={idx} className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                    <h4 className="font-black text-amber-950 text-xl mb-2">{exp.title}</h4>
                    <p className="text-sm text-amber-900 font-bold mb-3">Materials: <span className="font-medium">{exp.materials}</span></p>
                    <p className="text-base text-amber-950 font-medium leading-relaxed">{exp.instructions}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.outAndAbout && (
            <CollapsibleSection title="Local Field Trip" icon={<MapPin className="w-6 h-6 text-teal-600"/>} colorClass="border-t-teal-500" forceOpen={allExpanded}>
              <div className="bg-teal-50 p-6 rounded-2xl border border-teal-200">
                <h4 className="font-black text-teal-900 uppercase text-xs mb-2 bg-teal-200/50 inline-block px-2 py-1 rounded max-w-full break-words">Near You</h4>
                <p className="font-black text-xl mb-3 text-teal-950">{generatedData.outAndAbout.title}</p>
                <p className="text-base text-teal-950 font-medium mb-4 leading-relaxed">{generatedData.outAndAbout.instructions}</p>
                <p className="text-sm text-teal-800 font-bold mt-2">Bring: <span className="font-medium">{generatedData.outAndAbout.supplies.join(", ")}</span></p>
              </div>
            </CollapsibleSection>
          )}

          {generatedData.lookAndLearn && generatedData.lookAndLearn.length > 0 && (
            <CollapsibleSection title="Look & Learn" icon={<PlayCircle className="w-6 h-6 text-red-600"/>} colorClass="border-t-red-500" forceOpen={allExpanded}>
              <div className="space-y-4">
                {generatedData.lookAndLearn.map((media: any, idx: number) => (
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
          )}

          {generatedData.letsTalk && generatedData.letsTalk.length > 0 && (
            <CollapsibleSection title="Discussion Prompts" icon={<MessageCircle className="w-6 h-6 text-indigo-600"/>} colorClass="border-t-indigo-500" forceOpen={allExpanded}>
               <ul className="list-disc pl-6 space-y-4 text-lg text-slate-800 font-medium marker:text-indigo-600">
                  {generatedData.letsTalk.map((prompt: string, idx: number) => (
                    <li key={idx} className="pl-2 leading-relaxed">{prompt}</li>
                  ))}
               </ul>
            </CollapsibleSection>
          )}

          {generatedData.endOfWeekReview && (
            <CollapsibleSection title="End of Week Review" icon={<FileText className="w-6 h-6 text-slate-600"/>} colorClass="border-t-slate-500" forceOpen={allExpanded}>
               <h3 className="text-3xl font-black text-slate-800 mb-8 border-b-2 border-slate-100 pb-4">
                  {generatedData.endOfWeekReview.worksheetTitle}
               </h3>
               <ol className="list-decimal pl-6 space-y-8 text-xl text-slate-800 font-medium marker:font-black marker:text-slate-600">
                  {generatedData.endOfWeekReview.questions.map((q: string, qIdx: number) => (
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