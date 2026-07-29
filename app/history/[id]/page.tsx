"use client";

import { useEffect, useState } from "react";
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
  MessageCircle, ChevronRight, ChevronsUpDown, Loader2, ExternalLink, Ban 
} from "lucide-react";
import { toast } from "sonner";

// Reusable component for the Include in Portfolio toggle
function ElementPortfolioToggle({ studentId, lessonPlanId, standardText, parentId, supabase }: { studentId: string; lessonPlanId: string; standardText: string; parentId: string; supabase: any }) {
  const [isIncluded, setIsIncluded] = useState(false); // Default to false (Excluded)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !lessonPlanId || !standardText) return;
    const fetchStatus = async () => {
      const { data } = await (supabase as any)
        .from("portfolio_artifacts")
        .select("include_in_portfolio")
        .eq("student_id", studentId)
        .eq("lesson_plan_id", lessonPlanId)
        .eq("standard_text", standardText)
        .maybeSingle();
      
      if (data && data.include_in_portfolio !== null) {
        setIsIncluded(Boolean(data.include_in_portfolio));
      } else {
        setIsIncluded(false); // Default to false if no record exists
      }
      setIsLoading(false);
    };
    fetchStatus();
  }, [studentId, lessonPlanId, standardText, supabase]);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsIncluded(checked);

    // Fail-safe approach: Check if record exists first to avoid upsert constraint errors
    const { data: existing } = await (supabase as any)
      .from("portfolio_artifacts")
      .select("id")
      .eq("student_id", studentId)
      .eq("lesson_plan_id", lessonPlanId)
      .eq("standard_text", standardText)
      .maybeSingle();

    let saveError = null;

    if (existing) {
      // Update existing artifact
      const { error } = await (supabase as any)
        .from("portfolio_artifacts")
        .update({ 
          include_in_portfolio: checked,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);
      saveError = error;
    } else {
      // Insert new artifact
      const { error } = await (supabase as any)
        .from("portfolio_artifacts")
        .insert({
          parent_id: parentId,
          student_id: studentId,
          lesson_plan_id: lessonPlanId,
          standard_text: standardText,
          include_in_portfolio: checked
        });
      saveError = error;
    }

    if (saveError) {
      console.error("Toggle Save Error:", saveError);
      toast.error("Failed to update portfolio status");
      setIsIncluded(!checked); // Revert visually on failure
    } else {
      toast.success(checked ? "Added to state portfolio" : "Removed from state portfolio");
    }
  };

  if (isLoading) return null;

  const safeId = `port-toggle-${standardText.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <div className="flex items-center gap-2 print:hidden mb-1">
      <input 
        type="checkbox" 
        id={safeId}
        checked={isIncluded}
        onChange={handleToggle}
        className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
      />
      <label htmlFor={safeId} className="text-[11px] font-bold text-slate-600 cursor-pointer">
        Include in State Portfolio
      </label>
    </div>
  );
}

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

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [plan, setPlan] = useState<any>(null);
  const [studentName, setStudentName] = useState<string>("Unknown Student");
  const [isLoading, setIsLoading] = useState(true);
  const [allExpanded, setAllExpanded] = useState(true);
  const [printMode, setPrintMode] = useState<boolean>(false);

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
      }

      setIsLoading(false);
    };

    fetchPlanDetails();
  }, [params.id, router, supabase]);

  const handleDoNotRecommend = async (itemText: string) => {
    if (!plan?.student_id) {
      toast.error("Student profile not found for this plan.");
      return;
    }

    const { error } = await (supabase as any)
      .from("student_dislikes")
      .insert({
        student_id: plan.student_id,
        item_text: itemText
      });

    if (error) {
      toast.error("Failed to add to Do Not Recommend list.");
    } else {
      toast.success(`"${itemText}" added to student's Do Not Recommend list.`);
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

  return (
    <main className="flex min-h-screen flex-col justify-between bg-slate-50 print:bg-white print:py-0 print:px-0">
      
      <div className="w-full flex flex-col items-center py-12 px-6 space-y-8">
        <SiteHeader />

        <div className="w-full max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-8 pb-20 print:space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none">
            <Button onClick={() => router.push("/history")} variant="ghost" className="text-slate-500 hover:text-slate-800 -ml-4 mb-4 print:hidden">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
            </Button>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Lesson Plan for {studentName}</h1>
            <p className="text-slate-500 font-bold mt-1">Generated on {dateStr}</p>
          </div>

          <div className="flex justify-between items-center mb-6 print:hidden bg-slate-800 p-3 rounded-2xl text-white shadow-lg">
            <Button variant="ghost" onClick={() => setAllExpanded(!allExpanded)} className="text-slate-300 hover:text-white hover:bg-slate-700 font-bold rounded-xl">
              <ChevronsUpDown className="w-5 h-5 mr-2"/> {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
            <Button onClick={() => setPrintMode(true)} className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm">
              <Printer className="w-4 h-4 mr-2"/> Print Plan
            </Button>
          </div>

          {/* 1. Applicable Standards */}
          <CollapsibleSection title="Applicable Standards" icon={<Lightbulb className="w-6 h-6 text-blue-600"/>} colorClass="border-t-blue-500" forceOpen={allExpanded}>
            <p className="text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-lg">
              {generatedData.assessedFoundation}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {generatedData.outlinedStandards?.map((std: any, idx: number) => {
                const standardText = `Standard Mastery: ${std.subject} - ${std.topic}`;
                return (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800 text-base">{std.subject}</p>
                        <div className="flex flex-col items-end">
                          <ElementPortfolioToggle studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} parentId={plan.parent_id} supabase={supabase} />
                          <button 
                            onClick={() => handleDoNotRecommend(`${std.subject}: ${std.topic}`)}
                            className="text-slate-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors print:hidden"
                            title="Never recommend this standard/topic again"
                          >
                            <Ban className="w-3.5 h-3.5" /> Do Not Recommend
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mt-1">{std.topic}</p>
                    </div>
                    <PortfolioUploader 
                      studentId={plan.student_id} 
                      lessonPlanId={plan.id} 
                      standardText={standardText} 
                    />
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* 2. Tactile & Visual Tools */}
          {generatedData.buyableTools && generatedData.buyableTools.length > 0 && (
            <CollapsibleSection title="Tactile & Visual Tools" icon={<Shapes className="w-6 h-6 text-purple-600"/>} colorClass="border-t-purple-500" forceOpen={allExpanded}>
              <div className="grid md:grid-cols-2 gap-4">
                {generatedData.buyableTools.map((item: any, idx: number) => {
                  const standardText = `Tool Use: ${item.item}`;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-purple-800 text-lg">{item.item}</h4>
                          <div className="flex flex-col items-end">
                            <ElementPortfolioToggle studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} parentId={plan.parent_id} supabase={supabase} />
                            <button 
                              onClick={() => handleDoNotRecommend(`Tool: ${item.item}`)}
                              className="text-slate-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors print:hidden"
                            >
                              <Ban className="w-3.5 h-3.5" /> Do Not Recommend
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{item.howToUse}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <a href={`https://www.amazon.com/s?k=${encodeURIComponent(item.searchQuery || item.item)}&tag=mispark0a-20`} target="_blank" className="text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center print:hidden">
                          Find on Amazon <ExternalLink className="w-3 h-3 ml-1"/>
                        </a>
                        <PortfolioUploader studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* 3. Recommended Reading */}
          {generatedData.readingList && generatedData.readingList.length > 0 && (
            <CollapsibleSection title="Recommended Reading" icon={<BookHeart className="w-6 h-6 text-rose-600"/>} colorClass="border-t-rose-500" forceOpen={allExpanded}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedData.readingList.map((book: any, idx: number) => {
                  const standardText = `Reading Comprehension: ${book.title}`;
                  return (
                    <div key={idx} className="p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-black uppercase text-indigo-500 block bg-indigo-50 w-max px-2 py-1 rounded">{book.type}</span>
                          <div className="flex flex-col items-end">
                            <ElementPortfolioToggle studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} parentId={plan.parent_id} supabase={supabase} />
                            <button 
                              onClick={() => handleDoNotRecommend(`Book: ${book.title}`)}
                              className="text-slate-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors print:hidden"
                            >
                              <Ban className="w-3.5 h-3.5" /> Do Not Recommend
                            </button>
                          </div>
                        </div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{book.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 mb-2 font-medium">&quot;{book.prompt}&quot;</p>
                      </div>
                      <PortfolioUploader 
                        studentId={plan.student_id} 
                        lessonPlanId={plan.id} 
                        standardText={standardText} 
                      />
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* 4. Let's Play */}
          {generatedData.letsPlay && generatedData.letsPlay.length > 0 && (
            <CollapsibleSection title="Let's Play" icon={<Gamepad2 className="w-6 h-6 text-emerald-600"/>} colorClass="border-t-emerald-500" forceOpen={allExpanded}>
              <div className="grid md:grid-cols-2 gap-4">
                {generatedData.letsPlay.map((game: any, idx: number) => {
                  const standardText = `Activity / Game: ${game.gameName}`;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-emerald-800 text-lg">{game.gameName}</h4>
                          <div className="flex flex-col items-end">
                            <ElementPortfolioToggle studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} parentId={plan.parent_id} supabase={supabase} />
                            <button 
                              onClick={() => handleDoNotRecommend(`Game: ${game.gameName}`)}
                              className="text-slate-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors print:hidden"
                            >
                              <Ban className="w-3.5 h-3.5" /> Do Not Recommend
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-emerald-600 mb-2 uppercase bg-emerald-50 inline-block px-2 py-1 rounded">
                          {game.modality} | {game.skillsReinforced}
                        </p>
                        <p className="text-sm text-slate-600 font-medium">{game.description}</p>
                      </div>
                      <PortfolioUploader studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* 5. Hands-On Experiments */}
          {generatedData.householdExperiments && generatedData.householdExperiments.length > 0 && (
            <CollapsibleSection title="Hands-On Experiments" icon={<FlaskConical className="w-6 h-6 text-amber-600"/>} colorClass="border-t-amber-500" forceOpen={allExpanded}>
              <div className="space-y-6">
                {generatedData.householdExperiments.map((exp: any, idx: number) => {
                  const standardText = `Experiment: ${exp.title}`;
                  return (
                    <div key={idx} className="bg-amber-50 p-6 rounded-2xl border border-amber-200 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-amber-900 text-xl">{exp.title}</h4>
                        <div className="flex flex-col items-end">
                          <ElementPortfolioToggle studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} parentId={plan.parent_id} supabase={supabase} />
                          <button 
                            onClick={() => handleDoNotRecommend(`Experiment: ${exp.title}`)}
                            className="text-amber-800/60 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors print:hidden"
                          >
                            <Ban className="w-3.5 h-3.5" /> Do Not Recommend
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-amber-900 font-bold">Materials: <span className="font-medium">{exp.materials}</span></p>
                      <p className="text-base text-amber-950 font-medium leading-relaxed">{exp.instructions}</p>
                      <PortfolioUploader studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* 6. Local Field Trip */}
          {generatedData.outAndAbout && (
            <CollapsibleSection title="Local Field Trip" icon={<MapPin className="w-6 h-6 text-teal-600"/>} colorClass="border-t-teal-500" forceOpen={allExpanded}>
              {(() => {
                const standardText = `Field Trip: ${generatedData.outAndAbout.title}`;
                return (
                  <div className="bg-teal-50 p-6 rounded-2xl border border-teal-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-teal-900 uppercase text-xs bg-teal-200/50 px-2 py-1 rounded">Near You</h4>
                      <div className="flex flex-col items-end">
                        <ElementPortfolioToggle studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} parentId={plan.parent_id} supabase={supabase} />
                        <button 
                          onClick={() => handleDoNotRecommend(`Field Trip: ${generatedData.outAndAbout.title}`)}
                          className="text-teal-800/60 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors print:hidden"
                        >
                          <Ban className="w-3.5 h-3.5" /> Do Not Recommend
                        </button>
                      </div>
                    </div>
                    <p className="font-black text-xl text-teal-950">{generatedData.outAndAbout.title}</p>
                    <p className="text-base text-teal-950 font-medium">{generatedData.outAndAbout.instructions}</p>
                    <p className="text-sm text-teal-800 font-bold">Bring: <span className="font-medium">{generatedData.outAndAbout.supplies.join(", ")}</span></p>
                    <PortfolioUploader studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} />
                  </div>
                );
              })()}
            </CollapsibleSection>
          )}

          {/* 7. Look & Learn */}
          {generatedData.lookAndLearn && generatedData.lookAndLearn.length > 0 && (
            <CollapsibleSection title="Look & Learn" icon={<PlayCircle className="w-6 h-6 text-red-600"/>} colorClass="border-t-red-500" forceOpen={allExpanded}>
              <div className="space-y-4">
                {generatedData.lookAndLearn.map((media: any, idx: number) => {
                  const standardText = `Video Focus: ${media.videoTitle}`;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 text-lg">{media.videoTitle}</p>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Focus: {media.topic}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <ElementPortfolioToggle studentId={plan.student_id} lessonPlanId={plan.id} standardText={standardText} parentId={plan.parent_id} supabase={supabase} />
                        <button 
                          onClick={() => handleDoNotRecommend(`Video: ${media.videoTitle}`)}
                          className="text-slate-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors print:hidden"
                        >
                          <Ban className="w-3.5 h-3.5" /> Do Not Recommend
                        </button>
                        <span className="bg-red-50 text-red-700 font-black text-xs px-3 py-1 rounded-full uppercase mt-1">{media.platform}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* 8. Discussion Prompts */}
          {generatedData.letsTalk && generatedData.letsTalk.length > 0 && (
            <CollapsibleSection title="Discussion Prompts" icon={<MessageCircle className="w-6 h-6 text-indigo-600"/>} colorClass="border-t-indigo-500" forceOpen={allExpanded}>
               <ul className="list-disc pl-6 space-y-4 text-lg text-slate-800 font-medium marker:text-indigo-600">
                  {generatedData.letsTalk.map((prompt: string, idx: number) => (
                    <li key={idx} className="pl-2 leading-relaxed">{prompt}</li>
                  ))}
               </ul>
            </CollapsibleSection>
          )}

          {/* 9. End of Week Review */}
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
                 <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Upload Completed Review</p>
                 <PortfolioUploader 
                   studentId={plan.student_id} 
                   lessonPlanId={plan.id} 
                   standardText={`End of Week Review: ${generatedData.endOfWeekReview.worksheetTitle}`} 
                 />
               </div>
            </CollapsibleSection>
          )}

        </div>
      </div>

      <SiteFooter />
    </main>
  );
}