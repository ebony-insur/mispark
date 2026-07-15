"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { 
  ArrowLeft, Clock, FileText, User, ChevronDown, ChevronUp, Printer, 
  Star, Image as ImageIcon, UploadCloud, BookHeart, Gamepad2, PlaySquare, 
  FlaskConical, CheckCircle2, Trash2, ExternalLink
} from "lucide-react";

// --- TYPESCRIPT INTERFACES --- //
interface PlanData {
  assessedFoundation?: string;
  outlinedStandards?: { day: string; subject: string; topic: string }[];
  readingList?: { type: string; title: string; prompt: string }[];
  letsPlay?: { gameName: string; modality: string; skillsReinforced: string; description: string }[];
  lookAndLearn?: { videoTitle: string; platform: string; topic: string }[];
  handsOnLearning?: {
    aroundTheHouse?: { title: string; supplies: string[]; instructions: string; extendedConversation: string };
    outAndAbout?: { title: string; supplies: string[]; instructions: string; extendedConversation: string };
    bigIdeas?: { title: string; supplies: string[]; instructions: string; extendedConversation: string };
  };
  letsTalk?: string[];
  letsExplore?: string[];
  printableWorksheets?: { day: string; estimatedDuration: string; worksheetTitle: string; questions: string[] }[];
}

interface SavedPlan {
  id: string;
  student_id: string;
  parent_id: string;
  created_at: string;
  original_prompt: string;
  plan_data: PlanData;
  rating?: number;
  feedback_notes?: string;
  portfolio_image_url?: string;
}

export default function HistoryPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [students, setStudents] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);
  
  // Feedback State
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [ratingState, setRatingState] = useState<Record<string, number>>({});
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  // Portfolio State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Students
      const { data: studentData } = await supabase.from("children_profiles").select("id, nickname");
      if (studentData) {
        const studentMap: Record<string, string> = {};
        studentData.forEach(s => studentMap[s.id] = s.nickname);
        setStudents(studentMap);
      }

      // Fetch Lesson Plans
      const { data: planData } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (planData) {
        setPlans(planData as SavedPlan[]);
        const initialRatings: Record<string, number> = {};
        const initialNotes: Record<string, string> = {};
        planData.forEach(p => {
          if (p.rating) initialRatings[p.id] = p.rating;
          if (p.feedback_notes) initialNotes[p.id] = p.feedback_notes;
        });
        setRatingState(initialRatings);
        setNotesState(initialNotes);
      }
    };
    fetchHistory();
  }, [router, supabase]);

  useEffect(() => {
    if (printMode) {
      setTimeout(() => {
        window.print();
        setPrintMode(false);
      }, 300);
    }
  }, [printMode]);

  // --- HANDLERS --- //
  const handleSaveFeedback = async (planId: string) => {
    setIsSavingFeedback(true);
    const rating = ratingState[planId] || 0;
    const notes = notesState[planId] || "";

    try {
      const { error } = await supabase
        .from("lesson_plans")
        .update({ rating, feedback_notes: notes })
        .eq("id", planId);

      if (error) throw error;
      toast.success("Feedback saved! This helps us improve future plans.");
      
      // Update local state to reflect save
      setPlans(plans.map(p => p.id === planId ? { ...p, rating, feedback_notes: notes } : p));
    } catch (err: any) {
      console.warn("Feedback save error:", err);
      toast.error("Failed to save feedback."); 
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>, plan: SavedPlan) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please keep images under 5MB.");
      return;
    }

    toast.loading("Uploading to portfolio...", { id: "upload" });

    try {
      // 1. Create a unique file path: parent_id/plan_id-timestamp.ext
      const fileExt = file.name.split('.').pop();
      const fileName = `${plan.id}-${Date.now()}.${fileExt}`;
      const filePath = `${plan.parent_id}/${fileName}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("student_portfolios")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("student_portfolios")
        .getPublicUrl(filePath);

      // 4. Save URL to the database
      const { error: dbError } = await supabase
        .from("lesson_plans")
        .update({ portfolio_image_url: publicUrl })
        .eq("id", plan.id);

      if (dbError) throw dbError;

      // 5. Update UI
      setPlans(plans.map(p => p.id === plan.id ? { ...p, portfolio_image_url: publicUrl } : p));
      toast.success("Photo added to portfolio!", { id: "upload" });

    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload photo.", { id: "upload" });
    }
  };

  const handleRemovePhoto = async (planId: string) => {
    try {
      // We are just removing the link from the DB to keep it simple for the user.
      const { error } = await supabase
        .from("lesson_plans")
        .update({ portfolio_image_url: null })
        .eq("id", planId);
        
      if (error) throw error;
      
      setPlans(plans.map(p => p.id === planId ? { ...p, portfolio_image_url: undefined } : p));
      toast.success("Photo removed from portfolio.");
    } catch (err) {
      toast.error("Failed to remove photo.");
    }
  };

  const generateBookSearchLink = (title: string, store: string) => {
    const encodedTitle = encodeURIComponent(title);
    if (store === "thriftbooks") return `https://www.thriftbooks.com/browse/?b.search=${encodedTitle}#b.s=mostPopular-desc&b.p=1&b.pp=30&b.oos`;
    return `https://bookshop.org/search?keywords=${encodedTitle}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:p-0">
      
      {/* HEADER */}
      <div className={`w-full max-w-4xl flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden ${printMode ? 'hidden' : ''}`}>
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-slate-500 hover:text-slate-800 px-2 mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-500" /> Archive &amp; Portfolios
        </h1>
      </div>

      {/* PLAN LIST */}
      <div className={`w-full max-w-4xl space-y-4 ${printMode ? 'print:block' : ''}`}>
        {plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm print:hidden">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No History Yet</h3>
            <p className="text-slate-500 mt-2">Go to your dashboard to ignite your first curriculum!</p>
          </div>
        ) : (
          plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`shadow-sm border-slate-200 overflow-hidden ${printMode && expandedId !== plan.id ? 'hidden' : ''} ${printMode ? 'border-none shadow-none' : ''}`}
            >
              {/* COMPACT VIEW BAR */}
              <div 
                className={`bg-white p-5 flex justify-between items-center cursor-pointer transition-colors print:hidden ${expandedId === plan.id ? 'bg-slate-50 border-b border-slate-200' : 'hover:bg-slate-50'}`}
                onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600"/> 
                    {students[plan.student_id] || "Unknown Student"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex text-amber-400 mr-2">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-3 h-3 ${(ratingState[plan.id] || plan.rating || 0) >= star ? "fill-amber-400" : "text-slate-200"}`} />
                    ))}
                  </div>
                  {expandedId === plan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* EXPANDED DETAILED VIEW */}
              {expandedId === plan.id && (
                <CardContent className="bg-slate-50 p-6 md:p-8 space-y-10 print:p-0 print:bg-white">
                  
                  {/* UTILITY BAR */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
                    <p className="text-sm font-bold text-slate-500">Plan Viewer</p>
                    <Button onClick={() => setPrintMode(true)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg">
                      <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
                    </Button>
                  </div>

                  {/* --- FULL PLAN RENDER --- */}
                  <div className="space-y-8">
                    {/* Foundation */}
                    {plan.plan_data.assessedFoundation && (
                      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <h4 className="font-black text-blue-800 uppercase tracking-wide text-xs mb-3">Assessed Foundation</h4>
                        <p className="text-slate-800 font-medium leading-relaxed">{plan.plan_data.assessedFoundation}</p>
                      </div>
                    )}

                    {/* Worksheets */}
                    {plan.plan_data.printableWorksheets && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                         <h4 className="font-black text-teal-800 uppercase tracking-wide text-xs mb-4 flex items-center gap-2">
                           <FileText className="w-4 h-4" /> Worksheets Generated
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {plan.plan_data.printableWorksheets.map((ws, i) => (
                             <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                               <p className="font-bold text-slate-800">{ws.worksheetTitle}</p>
                               <p className="text-sm text-slate-500">{ws.day} • {ws.questions?.length} Questions</p>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                    
                    {/* Hands On */}
                    {plan.plan_data.handsOnLearning?.aroundTheHouse && (
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                        <h4 className="font-black text-amber-900 uppercase text-xs tracking-wider mb-2 flex items-center gap-2">
                          <FlaskConical className="w-4 h-4" /> Primary Experiment
                        </h4>
                        <p className="font-black text-lg mb-2 text-amber-950">{plan.plan_data.handsOnLearning.aroundTheHouse.title}</p>
                        <p className="text-base text-amber-950 font-medium">{plan.plan_data.handsOnLearning.aroundTheHouse.instructions}</p>
                      </div>
                    )}
                  </div>

                  {/* PORTFOLIO & FEEDBACK SECTION */}
                  <div className="grid md:grid-cols-2 gap-6 pt-8 border-t-2 border-slate-200 print:hidden">
                    
                    {/* FEEDBACK COLUMN */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                      <h4 className="font-black text-slate-800 text-lg mb-1 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Rate This Plan
                      </h4>
                      <p className="text-sm text-slate-500 mb-4 font-medium">What worked well? What should we change next time?</p>
                      
                      <div className="flex gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            onClick={() => setRatingState(prev => ({ ...prev, [plan.id]: star }))}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star className={`w-8 h-8 transition-colors ${
                              (hoveredStar || ratingState[plan.id] || 0) >= star 
                                ? "text-amber-400 fill-amber-400" 
                                : "text-slate-200 fill-slate-50"
                            }`} />
                          </button>
                        ))}
                      </div>

                      <Textarea 
                        placeholder="e.g. Leo loved the volcano experiment, but the reading was a bit too long..." 
                        value={notesState[plan.id] || ""}
                        onChange={(e) => setNotesState(prev => ({ ...prev, [plan.id]: e.target.value }))}
                        className="flex-1 min-h-[100px] bg-slate-50 border-slate-200 focus-visible:ring-teal-500 mb-4"
                      />
                      
                      <Button 
                        onClick={() => handleSaveFeedback(plan.id)}
                        disabled={isSavingFeedback}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
                      >
                        {isSavingFeedback ? "Saving..." : "Save Feedback"}
                      </Button>
                    </div>

                    {/* PORTFOLIO COLUMN */}
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 shadow-sm flex flex-col h-full">
                      <h4 className="font-black text-emerald-900 text-lg mb-1 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" /> Student Portfolio
                      </h4>
                      <p className="text-sm text-emerald-700 mb-4 font-medium">Upload photos of completed worksheets or experiments to build their end-of-year portfolio.</p>
                      
                      {plan.portfolio_image_url ? (
                        <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-300 flex-1 min-h-[200px]">
                          <Image 
                            src={plan.portfolio_image_url} 
                            alt="Student Portfolio" 
                            fill 
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" onClick={() => handleRemovePhoto(plan.id)} className="font-bold">
                              <Trash2 className="w-4 h-4 mr-2" /> Remove Photo
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
                          onDragLeave={() => setIsDragging(false)} 
                          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handlePortfolioUpload({ target: { files: e.dataTransfer.files } } as any, plan); }} 
                          onClick={() => fileInputRef.current?.click()} 
                          className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all min-h-[200px] ${
                            isDragging ? "border-emerald-500 bg-emerald-100/50 scale-[1.02]" : "border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/50"
                          }`}
                        >
                          <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={(e) => handlePortfolioUpload(e, plan)} />
                          <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${isDragging ? "text-emerald-600" : "text-emerald-400"}`} />
                          <p className="font-bold text-emerald-900">Click to Upload Photo</p>
                          <p className="text-xs font-medium text-emerald-600 mt-1">or drag and drop (Max 5MB)</p>
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </main>
  );
}