"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PortfolioUploader from "@/components/EvidenceUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Printer, ArrowLeft, Lightbulb, Shapes, BookHeart, 
  Gamepad2, PlayCircle, FlaskConical, FileText, MapPin, 
  MessageCircle, ChevronRight, ChevronsUpDown, Loader2, Ban, SaveAll 
} from "lucide-react";
import { toast } from "sonner";

const CollapsibleSection = ({ title, icon, children, colorClass, forceOpen }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  
  useEffect(() => {
    setIsOpen(forceOpen);
  }, [forceOpen]);

  return (
    <Card className={`border-t-4 ${colorClass} bg-white rounded-2xl shadow-sm overflow-hidden mb-6 print:border-none print:border-t-0 print:shadow-none print:mb-8 print:break-inside-avoid`}>
      <CardHeader 
        className="bg-slate-50/50 cursor-pointer print:bg-transparent print:p-0 print:pb-2 hover:bg-slate-100 transition-colors flex flex-row items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800 print:text-2xl print:border-b-2 print:border-slate-200 print:w-full print:pb-2">
          <span className="print:hidden">{icon}</span> {title}
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

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [plan, setPlan] = useState<any>(null);
  const [studentName, setStudentName] = useState<string>("Unknown Student");
  const [dislikes, setDislikes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [allExpanded, setAllExpanded] = useState(true);
  const [printMode, setPrintMode] = useState<boolean>(false);

  const uploaderRefs = useRef<any[]>([]);
  uploaderRefs.current = []; 

  const addRef = (el: any) => {
    if (el && !uploaderRefs.current.includes(el)) {
      uploaderRefs.current.push(el);
    }
  };

  useEffect(() => {
    const fetchPlanDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: planData, error } = await (supabase as any)
        .from("lesson_plans")
        .select("*")
        .eq("id", params.id as string)
        .eq("parent_id", user.id)
        .single();

      if (error || !planData) {
        toast.error("Lesson plan not found.");
        router.push("/history");
        return;
      }

      setPlan(planData);

      if ((planData as any).student_id) {
        const { data: studentData } = await (supabase as any)
          .from("children_profiles")
          .select("nickname")
          .eq("id", (planData as any).student_id)
          .single();
          
        if (studentData) {
          setStudentName((studentData as any).nickname);
        }

        // Fetch user's existing "Do Not Recommend" list for this student
        const { data: dislikeData } = await (supabase as any)
          .from("student_dislikes")
          .select("item_text")
          .eq("student_id", (planData as any).student_id);
        
        if (dislikeData) {
          setDislikes(new Set(dislikeData.map((d: any) => d.item_text)));
        }
      }

      setIsLoading(false);
    };

    fetchPlanDetails();
  }, [params.id, router, supabase]);

  const toggleDoNotRecommend = async (itemText: string) => {
    if (!plan?.student_id) {
      toast.error("Student profile not found.");
      return;
    }

    const isDisliked = dislikes.has(itemText);

    if (isDisliked) {
      const { error } = await (supabase as any)
        .from("student_dislikes")
        .delete()
        .match({ student_id: plan.student_id, item_text: itemText });

      if (error) {
        toast.error("Failed to remove from Do Not Recommend list.");
      } else {
        setDislikes(prev => { const next = new Set(prev); next.delete(itemText); return next; });
        toast.success(`Removed "${itemText}". It may be recommended again.`);
      }
    } else {
      const { error } = await (supabase as any)
        .from("student_dislikes")
        .insert({
          student_id: plan.student_id,
          item_text: itemText
        });

      if (error) {
        toast.error("Failed to add to Do Not Recommend list.");
      } else {
        setDislikes(prev => { const next = new Set(prev); next.add(itemText); return next; });
        toast.success(`"${itemText}" will not be recommended in future plans.`);
      }
    }
  };

  const handleGlobalSave = async () => {
    setIsSavingAll(true);
    toast.info("Saving all plan updates...");
    try {
      const savePromises = uploaderRefs.current.map((ref) => {
        if (ref && ref.save) {
          return ref.save(); 
        }
      });
      await Promise.all(savePromises);
      toast.success("All changes saved successfully!");
    } catch (error) {
      console.error("Global save error:", error);
    } finally {
      setIsSavingAll(false);
    }
  };

  useEffect(() => {
    if (printMode) {
      setAllExpanded(true);
      setTimeout(() => { 
        window.print(); 
        setPrintMode(false); 
      }, 500);
    }
  }, [printMode]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Lesson Plan...</div>;
  }

  const generatedData = plan.plan_data;
  const dateStr = new Date(plan.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const planTitle = generatedData.weekAssigned || generatedData.weekTheme || "Weekly Lesson Plan";

  return (
    <main className="flex min-h-screen flex-col justify-between bg-slate-50 print:bg-white print:py-0 print:px-0">
      
      <div className="hidden print:block fixed bottom-4 left-6 right-6 border-t border-slate-300 pt-2 text-xs font-bold text-slate-500 bg-white z-50 print:opacity-100">
        {planTitle} | {studentName} | {dateStr}
      </div>

      <div className="w-full flex flex-col items-center py-12 px-6 space-y-8 print:py-0">
        <div className="print:hidden w-full max-w-5xl">
          <SiteHeader />
        </div>

        <div className="w-full max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-8 pb-20 print:space-y-6 print:pb-0">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 print:mb-12">
            <Button onClick={() => router.push("/history")} variant="ghost" className="text-slate-500 hover:text-slate-800 -ml-4 mb-4 print:hidden">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
            </Button>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight print:text-5xl">{planTitle}</h1>
            <h2 className="text-xl font-bold text-slate-600 mt-2 print:text-2xl">{studentName}</h2>
            <p className="text-slate-500 font-bold mt-1 print:text-lg">Generated on {dateStr}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 print:hidden bg-slate-800 p-4 rounded-2xl text-white shadow-lg">
            <Button variant="ghost" onClick={() => setAllExpanded(!allExpanded)} className="text-slate-300 hover:text-white hover:bg-slate-700 font-bold rounded-xl w-full sm:w-auto">
              <ChevronsUpDown className="w-5 h-5 mr-2"/> {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                onClick={handleGlobalSave} 
                disabled={isSavingAll}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm flex-1 sm:flex-none"
              >
                {isSavingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SaveAll className="w-4 h-4 mr-2"/>}
                Save All Updates
              </Button>
              <Button onClick={() => setPrintMode(true)} className="bg-slate-100 text-slate-800 hover:bg-white font-bold rounded-xl shadow-sm flex-1 sm:flex-none">
                <Printer className="w-4 h-4 mr-2"/> Print Plan
              </Button>
            </div>
          </div>

          <CollapsibleSection title="Applicable Standards" icon={<Lightbulb className="w-6 h-6 text-blue-600"/>} colorClass="border-t-blue-500" forceOpen={allExpanded}>
            <p className="text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-lg print:border-none print:p-0 print:bg-transparent print:text-black">
              {generatedData.assessedFoundation}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 print:gap-6 print:block">
              {generatedData.outlinedStandards?.map((std: any, idx: number) => {
                const standardText = `Standard Mastery: ${std.subject} - ${std.topic}`;
                return (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4 print:mb-4 print:bg-white print:border-slate-300 print:break-inside-avoid">
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800 text-base">{std.subject}</p>
                      </div>
                      <p className="text-slate-600 text-sm mt-1">{std.topic}</p>
                    </div>
                    <PortfolioUploader 
                      ref={addRef}
                      studentId={plan.student_id} 
                      lessonPlanId={plan.id} 
                      standardText={standardText} 
                    />
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          {generatedData.buyableTools && generatedData.buyableTools.length > 0 && (
            <CollapsibleSection title="Tactile & Visual Tools" icon={<Shapes className="w-6 h-6 text-purple-600"/>} colorClass="border-t-purple-500" forceOpen={allExpanded}>
              <div className="grid md:grid-cols-2 gap-4 print:block">
                {generatedData.buyableTools.map((item: any, idx: number) => {
                  const standardText = `Tool Use: ${item.item}`;
                  const isDisliked = dislikes.has(`Tool: ${item.item}`);
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 print:mb-4 print:shadow-none print:border-slate-300 print:break-inside-avoid">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-purple-800 text-lg">{item.item}</h4>
                          <button 
                            onClick={() => toggleDoNotRecommend(`Tool: ${item.item}`)}
                            className={`text-xs font-bold flex items-center gap-1 transition-colors print:hidden ${isDisliked ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                            title={isDisliked ? "Click to restore recommendations for this element." : "Selecting this will ensure this element will not be recommended in future plans for this student."}
                          >
                            <Ban className="w-3.5 h-3.5" /> {isDisliked ? "Not Recommended (Undo)" : "Do Not Recommend"}
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{item.howToUse}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <PortfolioUploader ref={addRef} studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.readingList && generatedData.readingList.length > 0 && (
            <CollapsibleSection title="Recommended Reading" icon={<BookHeart className="w-6 h-6 text-rose-600"/>} colorClass="border-t-rose-500" forceOpen={allExpanded}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block">
                {generatedData.readingList.map((book: any, idx: number) => {
                  const standardText = `Reading Comprehension: ${book.title}`;
                  const isDisliked = dislikes.has(`Book: ${book.title}`);
                  return (
                    <div key={idx} className="p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4 print:mb-4 print:border-slate-300 print:break-inside-avoid">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-black uppercase text-indigo-500 block bg-indigo-50 w-max px-2 py-1 rounded print:border print:border-indigo-200 print:bg-white">{book.type}</span>
                          <button 
                            onClick={() => toggleDoNotRecommend(`Book: ${book.title}`)}
                            className={`text-xs font-bold flex items-center gap-1 transition-colors print:hidden ${isDisliked ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                            title={isDisliked ? "Click to restore recommendations for this element." : "Selecting this will ensure this element will not be recommended in future plans for this student."}
                          >
                            <Ban className="w-3.5 h-3.5" /> {isDisliked ? "Not Recommended (Undo)" : "Do Not Recommend"}
                          </button>
                        </div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{book.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 mb-2 font-medium">&quot;{book.prompt}&quot;</p>
                      </div>
                      <PortfolioUploader ref={addRef} studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.letsPlay && generatedData.letsPlay.length > 0 && (
            <CollapsibleSection title="Let's Play" icon={<Gamepad2 className="w-6 h-6 text-emerald-600"/>} colorClass="border-t-emerald-500" forceOpen={allExpanded}>
              <div className="grid md:grid-cols-2 gap-4 print:block">
                {generatedData.letsPlay.map((game: any, idx: number) => {
                  const standardText = `Activity / Game: ${game.gameName}`;
                  const isDisliked = dislikes.has(`Game: ${game.gameName}`);
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 print:mb-4 print:shadow-none print:border-slate-300 print:break-inside-avoid">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-emerald-800 text-lg">{game.gameName}</h4>
                          <button 
                            onClick={() => toggleDoNotRecommend(`Game: ${game.gameName}`)}
                            className={`text-xs font-bold flex items-center gap-1 transition-colors print:hidden ${isDisliked ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                            title={isDisliked ? "Click to restore recommendations for this element." : "Selecting this will ensure this element will not be recommended in future plans for this student."}
                          >
                            <Ban className="w-3.5 h-3.5" /> {isDisliked ? "Not Recommended (Undo)" : "Do Not Recommend"}
                          </button>
                        </div>
                        <p className="text-xs font-bold text-emerald-600 mb-2 uppercase bg-emerald-50 inline-block px-2 py-1 rounded print:border print:border-emerald-200 print:bg-white">
                          {game.modality} | {game.skillsReinforced}
                        </p>
                        <p className="text-sm text-slate-600 font-medium">{game.description}</p>
                      </div>
                      <PortfolioUploader ref={addRef} studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.householdExperiments && generatedData.householdExperiments.length > 0 && (
            <CollapsibleSection title="Hands-On Experiments" icon={<FlaskConical className="w-6 h-6 text-amber-600"/>} colorClass="border-t-amber-500" forceOpen={allExpanded}>
              <div className="space-y-6">
                {generatedData.householdExperiments.map((exp: any, idx: number) => {
                  const standardText = `Experiment: ${exp.title}`;
                  const isDisliked = dislikes.has(`Experiment: ${exp.title}`);
                  return (
                    <div key={idx} className="bg-amber-50 p-6 rounded-2xl border border-amber-200 space-y-3 print:bg-white print:border-slate-300 print:break-inside-avoid">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-amber-900 text-xl print:text-black">{exp.title}</h4>
                        <button 
                          onClick={() => toggleDoNotRecommend(`Experiment: ${exp.title}`)}
                          className={`text-xs font-bold flex items-center gap-1 transition-colors print:hidden ${isDisliked ? 'text-red-600' : 'text-amber-800/60 hover:text-red-600'}`}
                          title={isDisliked ? "Click to restore recommendations for this element." : "Selecting this will ensure this element will not be recommended in future plans for this student."}
                        >
                          <Ban className="w-3.5 h-3.5" /> {isDisliked ? "Not Recommended (Undo)" : "Do Not Recommend"}
                        </button>
                      </div>
                      <p className="text-sm text-amber-900 font-bold print:text-slate-800">Materials: <span className="font-medium">{exp.materials}</span></p>
                      <p className="text-base text-amber-950 font-medium leading-relaxed print:text-black">{exp.instructions}</p>
                      <PortfolioUploader ref={addRef} studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.outAndAbout && (
            <CollapsibleSection title="Local Field Trip" icon={<MapPin className="w-6 h-6 text-teal-600"/>} colorClass="border-t-teal-500" forceOpen={allExpanded}>
              {(() => {
                const standardText = `Field Trip: ${generatedData.outAndAbout.title}`;
                const isDisliked = dislikes.has(`Field Trip: ${generatedData.outAndAbout.title}`);
                return (
                  <div className="bg-teal-50 p-6 rounded-2xl border border-teal-200 space-y-3 print:bg-white print:border-slate-300 print:break-inside-avoid">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-teal-900 uppercase text-xs bg-teal-200/50 px-2 py-1 rounded print:border print:border-slate-300 print:bg-white print:text-black">Near You</h4>
                      <button 
                        onClick={() => toggleDoNotRecommend(`Field Trip: ${generatedData.outAndAbout.title}`)}
                        className={`text-xs font-bold flex items-center gap-1 transition-colors print:hidden ${isDisliked ? 'text-red-600' : 'text-teal-800/60 hover:text-red-600'}`}
                        title={isDisliked ? "Click to restore recommendations for this element." : "Selecting this will ensure this element will not be recommended in future plans for this student."}
                      >
                        <Ban className="w-3.5 h-3.5" /> {isDisliked ? "Not Recommended (Undo)" : "Do Not Recommend"}
                      </button>
                    </div>
                    <p className="font-black text-xl text-teal-950 print:text-black">{generatedData.outAndAbout.title}</p>
                    <p className="text-base text-teal-950 font-medium print:text-black">{generatedData.outAndAbout.instructions}</p>
                    <p className="text-sm text-teal-800 font-bold print:text-slate-800">Bring: <span className="font-medium">{generatedData.outAndAbout.supplies.join(", ")}</span></p>
                    <PortfolioUploader ref={addRef} studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                  </div>
                );
              })()}
            </CollapsibleSection>
          )}

          {generatedData.lookAndLearn && generatedData.lookAndLearn.length > 0 && (
            <CollapsibleSection title="Look & Learn" icon={<PlayCircle className="w-6 h-6 text-red-600"/>} colorClass="border-t-red-500" forceOpen={allExpanded}>
              <div className="space-y-4">
                {generatedData.lookAndLearn.map((media: any, idx: number) => {
                  const standardText = `Video Focus: ${media.videoTitle}`;
                  const isDisliked = dislikes.has(`Video: ${media.videoTitle}`);
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:shadow-none print:border-slate-300 print:break-inside-avoid">
                      <div className="space-y-1 w-full">
                        <div className="flex justify-between items-start">
                          <p className="font-black text-slate-800 text-lg">{media.videoTitle}</p>
                          <button 
                            onClick={() => toggleDoNotRecommend(`Video: ${media.videoTitle}`)}
                            className={`text-xs font-bold flex items-center gap-1 transition-colors print:hidden ${isDisliked ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                            title={isDisliked ? "Click to restore recommendations for this element." : "Selecting this will ensure this element will not be recommended in future plans for this student."}
                          >
                            <Ban className="w-3.5 h-3.5" /> {isDisliked ? "Not Recommended (Undo)" : "Do Not Recommend"}
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Focus: {media.topic}</p>
                        <span className="inline-block bg-red-50 text-red-700 font-black text-xs px-3 py-1 rounded-full uppercase mt-1 print:border print:border-red-200 print:bg-white">{media.platform}</span>
                        <div className="pt-2 w-full">
                          <PortfolioUploader ref={addRef} studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {generatedData.letsTalk && generatedData.letsTalk.length > 0 && (
            <CollapsibleSection title="Discussion Prompts" icon={<MessageCircle className="w-6 h-6 text-indigo-600"/>} colorClass="border-t-indigo-500" forceOpen={allExpanded}>
               <ul className="list-disc pl-6 space-y-4 text-lg text-slate-800 font-medium marker:text-indigo-600 print:marker:text-black">
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
               <ol className="list-decimal pl-6 space-y-8 text-xl text-slate-800 font-medium marker:font-black marker:text-slate-600 mb-6">
                  {generatedData.endOfWeekReview.questions.map((q: string, qIdx: number) => (
                    <li key={qIdx} className="pl-3 leading-relaxed">{q}</li>
                  ))}
               </ol>
               <div className="mt-8 pt-6 border-t-2 border-slate-100">
                 <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide print:hidden">Upload Completed Review</p>
                 <PortfolioUploader 
                   ref={addRef}
                   studentId={plan.student_id} 
                   lessonPlanId={plan.id} 
                   standardText={`End of Week Review: ${generatedData.endOfWeekReview.worksheetTitle}`} 
                 />
               </div>
            </CollapsibleSection>
          )}

        </div>
      </div>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </main>
  );
}