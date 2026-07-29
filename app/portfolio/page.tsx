"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EvidenceUploader from "@/components/EvidenceUploader";
import { Button } from "@/components/ui/button";
import { Star, FileText, Loader2, ExternalLink, Award, Edit3, X, ChevronsUpDown, ChevronRight, Printer } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  // Controls state
  const [showFeedbackDate, setShowFeedbackDate] = useState<boolean>(false); // Default off
  
  // Date range filters for portfolio creation
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(todayStr);

  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [allExpanded, setAllExpanded] = useState<boolean>(false); // Default collapsed

  // 1. Fetch Students on load
  useEffect(() => {
    const fetchStudents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const { data: studentData } = await (supabase as any)
        .from("children_profiles")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (studentData && studentData.length > 0) {
        setStudents(studentData);
        setSelectedStudent((studentData[0] as any).id);
      }
      setIsLoading(false);
    };
    fetchStudents();
  }, [router, supabase]);

  // 2. Fetch and Generate Report based on date range overlap and include_in_portfolio flag
  const handleGenerateReport = useCallback(async () => {
    if (!selectedStudent || !startDate || !endDate) return;
    setIsFetching(true);
    
    // Explicitly filter for items flagged for portfolio inclusion on the database side
    const { data: artData, error: artError } = await (supabase as any)
      .from("portfolio_artifacts")
      .select("*")
      .eq("student_id", selectedStudent)
      .eq("include_in_portfolio", true);

    if (!artError && artData) {
      const enriched = await Promise.all(
        artData.map(async (art: any) => {
          let weekAssigned = "General Weekly Assignments";
          let weekStart = null;
          let weekEnd = null;
          let planData = null;

          if (art.lesson_plan_id) {
            const { data: planRecord } = await (supabase as any)
              .from("lesson_plans")
              .select("created_at, plan_data")
              .eq("id", art.lesson_plan_id)
              .single();
            
            if (planRecord) {
              planData = planRecord.plan_data;
              if (planRecord.plan_data?.weekAssigned) {
                weekAssigned = planRecord.plan_data.weekAssigned;
              }
              if (planRecord.plan_data?.weekStartDate) {
                weekStart = planRecord.plan_data.weekStartDate;
              }
              if (planRecord.plan_data?.weekEndDate) {
                weekEnd = planRecord.plan_data.weekEndDate;
              }
            }
          }

          return {
            ...art,
            week_assigned: weekAssigned,
            week_start: weekStart || art.created_at.split('T')[0],
            week_end: weekEnd || art.created_at.split('T')[0],
            plan_data: planData
          };
        })
      );

      // Filter: date overlap only (inclusion status handled by DB)
      const filtered = enriched.filter((item: any) => {
        const sDate = item.week_start;
        const eDate = item.week_end;
        return (sDate >= startDate && sDate <= endDate) || 
               (eDate >= startDate && eDate <= endDate) || 
               (sDate <= startDate && eDate >= endDate);
      });

      filtered.sort((a: any, b: any) => {
        if (a.week_assigned.includes("General")) return -1;
        if (b.week_assigned.includes("General")) return 1;
        return a.week_start.localeCompare(b.week_start);
      });

      setArtifacts(filtered);
      setHasGenerated(true);
    }
    setIsFetching(false);
  }, [selectedStudent, startDate, endDate, supabase]);

  const [editingArtifact, setEditingArtifact] = useState<any | null>(null);

  const handleCloseEdit = () => {
    setEditingArtifact(null);
    handleGenerateReport();
  };

  const handlePrint = () => {
    if (artifacts.length === 0) {
      toast.error("No evidence to print.");
      return;
    }
    setAllExpanded(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Portfolio...</div>;

  const currentStudentName = students.find(s => s.id === selectedStudent)?.nickname || "Student";
  const formattedStart = new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedEnd = new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const groupedByWeek = artifacts.reduce((acc: any, item: any) => {
    const weekKey = item.week_assigned || "General Weekly Assignments";
    if (!acc[weekKey]) acc[weekKey] = [];
    acc[weekKey].push(item);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between print:bg-white print:py-0 print:px-0 relative">
      
      <div className="w-full flex-1 flex flex-col items-center py-12 px-6 space-y-8 mb-24 print:mb-0 print:px-0 print:py-0">
        <SiteHeader />

        {/* CONTROLS SECTION */}
        <div className="w-full max-w-5xl bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
          <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-teal-600" /> State Compliance Portfolio Builder
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Student</label>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)} 
                className="p-3 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none focus:border-teal-500"
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.nickname}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Start Date Range</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="p-3 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">End Date Range</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="p-3 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none focus:border-teal-500"
              />
            </div>

            <Button 
              onClick={handleGenerateReport}
              className="p-3 h-[52px] bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
            >
              Generate Report
            </Button>
          </div>

          {/* TOGGLE CONTROLS */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="toggleFeedbackDate" 
                checked={showFeedbackDate} 
                onChange={(e) => setShowFeedbackDate(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="toggleFeedbackDate" className="text-sm font-bold text-slate-700 cursor-pointer">
                Show Feedback Recorded Timestamp on Report
              </label>
            </div>

            {hasGenerated && artifacts.length > 0 && (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAllExpanded(!allExpanded)}
                  className="font-bold text-slate-700"
                >
                  <ChevronsUpDown className="w-4 h-4 mr-1.5" /> {allExpanded ? "Collapse All" : "Expand All"}
                </Button>
                <Button 
                  onClick={handlePrint}
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  <Printer className="w-4 h-4 mr-1.5" /> Print Portfolio
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* PRINTABLE PORTFOLIO VIEW */}
        <div className="w-full max-w-5xl space-y-12 pb-20 print:pb-0">
          
          {hasGenerated && artifacts.length > 0 && (
            <div className="text-center pb-8 border-b-2 border-slate-200 mb-8 print:border-slate-800 print:mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Academic Portfolio</h2>
              <p className="text-2xl font-bold text-slate-700 mt-2">{currentStudentName}</p>
              <p className="text-slate-500 font-medium mt-1">Reporting Period: {formattedStart} - {formattedEnd}</p>
            </div>
          )}

          {isFetching ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" /></div>
          ) : !hasGenerated ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 print:hidden">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-600">Select your date range and click "Generate Report".</p>
            </div>
          ) : artifacts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 print:hidden">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-500">No included portfolio evidence found within this date range.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByWeek).map(([weekTitle, weekItems]: [string, any]) => (
                <WeekSection 
                  key={weekTitle} 
                  weekTitle={weekTitle} 
                  weekItems={weekItems} 
                  allExpanded={allExpanded} 
                  showFeedbackDate={showFeedbackDate}
                  setEditingArtifact={setEditingArtifact}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* EDIT MODAL OVERLAY WITH INCLUDE IN PORTFOLIO TOGGLE */}
      {editingArtifact && (
        <EditArtifactModal 
          artifact={editingArtifact} 
          onClose={handleCloseEdit} 
          supabase={supabase} 
        />
      )}

      <SiteFooter />
    </main>
  );
}

// Edit Modal Component featuring the explicit Portfolio Toggle
function EditArtifactModal({ artifact, onClose, supabase }: any) {
  const [includeInPortfolio, setIncludeInPortfolio] = useState(artifact.include_in_portfolio ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleChange = async (checked: boolean) => {
    setIncludeInPortfolio(checked);
    setIsUpdating(true);
    const { error } = await supabase
      .from("portfolio_artifacts")
      .update({ include_in_portfolio: checked })
      .eq("id", artifact.id);

    if (error) {
      toast.error("Failed to update portfolio status.");
    } else {
      toast.success(checked ? "Included in state portfolio" : "Excluded from state portfolio");
    }
    setIsUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl relative border border-slate-200">
        
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Edit Portfolio Entry</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-black text-slate-500 uppercase block mb-1">Standard Assessed</span>
            <p className="text-slate-800 font-bold">{artifact.standard_text}</p>
          </div>

          {/* Explicit Include in Portfolio Toggle */}
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-black text-teal-900 text-sm">Include in State Portfolio Report</p>
              <p className="text-xs text-teal-700 font-medium">Toggle on to display this item on generated compliance reports.</p>
            </div>
            <input 
              type="checkbox" 
              checked={includeInPortfolio} 
              disabled={isUpdating}
              onChange={(e) => handleToggleChange(e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          <EvidenceUploader 
            studentId={artifact.student_id} 
            lessonPlanId={artifact.lesson_plan_id}
            standardText={artifact.standard_text}
            existingArtifact={artifact}
          />
        </div>

      </div>
    </div>
  );
}

// Week Section Component
function WeekSection({ weekTitle, weekItems, allExpanded, showFeedbackDate, setEditingArtifact }: any) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(allExpanded);
  }, [allExpanded]);

  const plansMap = new Map();
  weekItems.forEach((item: any) => {
    const planKey = item.lesson_plan_id || `standalone-${item.id}`;
    if (!plansMap.has(planKey)) {
      plansMap.set(planKey, {
        planData: item.plan_data,
        items: []
      });
    }
    plansMap.get(planKey).items.push(item);
  });

  const groupedPlans = Array.from(plansMap.values());

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:border-slate-300 print:shadow-none print:break-inside-avoid">
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300"
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? "rotate-90" : ""} print:hidden`} />
          <h3 className="text-xl font-black">{weekTitle}</h3>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-teal-400 px-3 py-1 rounded-full print:bg-white print:text-slate-700">
          {groupedPlans.length} Lesson Plan{groupedPlans.length === 1 ? '' : 's'}
        </span>
      </div>

      {isOpen && (
        <div className="p-6 md:p-8 space-y-8">
          {groupedPlans.map((planGroup: any, pIdx: number) => {
            const samplePlanData = planGroup.planData;
            const planItems = planGroup.items;

            return (
              <div key={pIdx} className="space-y-6 pb-8 border-b border-slate-200 last:border-none last:pb-0">
                
                {samplePlanData?.assessedFoundation && (
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-400 uppercase">Topics Covered & Foundational Standard Alignment</span>
                    <p className="text-slate-700 font-medium leading-relaxed">{samplePlanData.assessedFoundation}</p>
                  </div>
                )}

                {/* STANDARDS ASSESSED */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-teal-700 uppercase tracking-wider">Standards Mastery & All Recorded Updates</h4>
                  
                  {planItems.map((item: any) => {
                    const files: string[] = item.file_urls?.length > 0 ? item.file_urls : (item.image_url ? [item.image_url] : []);
                    const hasFiles = files.length > 0;
                    const feedbackHistory = item.feedback_history || [
                      { date: item.updated_at || item.created_at, note: item.notes, rating: item.rating }
                    ];

                    return (
                      <div 
                        key={item.id} 
                        onClick={() => setEditingArtifact(item)}
                        className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-400 cursor-pointer transition-all shadow-sm space-y-4 group print:break-inside-avoid print:border-slate-300 print:shadow-none"
                      >
                        <h5 className="text-base font-black text-slate-800">{item.standard_text}</h5>

                        <div className="space-y-4">
                          {feedbackHistory.map((historyItem: any, hIdx: number) => (
                            <div key={hIdx} className="flex flex-col md:flex-row gap-6 items-start justify-between border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                              
                              {/* Left Side: Mastery & Evidence next to each other */}
                              <div className="w-full md:w-5/12 flex items-start gap-8">
                                <div className="space-y-1 shrink-0">
                                  <span className="text-[11px] font-black text-slate-400 uppercase block tracking-wider">Mastery Level</span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} className={`w-4 h-4 ${(historyItem.rating || item.rating) >= star ? "fill-amber-500 text-amber-500" : "text-amber-200"}`} />
                                    ))}
                                  </div>
                                </div>

                                {hasFiles && hIdx === 0 && (
                                  <div className="space-y-1">
                                    <span className="text-[11px] font-black text-slate-400 uppercase block tracking-wider">Evidence</span>
                                    <div className="flex flex-wrap gap-2">
                                      {files.map((url, index) => (
                                        <div key={index} className="h-10 w-14 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                          {url.includes(".pdf") ? (
                                            <FileText className="w-4 h-4 text-teal-600" />
                                          ) : (
                                            <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right Side: Update Record, Date, Edit Button, Notes */}
                              <div className="w-full md:w-7/12 space-y-1.5">
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Update Record #{hIdx + 1}</span>
                                  <div className="flex items-center gap-2">
                                    {showFeedbackDate && (
                                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                                        Feedback Recorded: {new Date(historyItem.date || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                    )}
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setEditingArtifact(item); }} 
                                      className="text-slate-300 hover:text-teal-500 transition-colors print:hidden ml-1"
                                      title="Edit Record"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-700 font-medium text-sm leading-relaxed">{historyItem.note || item.notes || "No notes logged for this update."}</p>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ADDITIONAL ASSESSED SECTIONS */}
                {samplePlanData && (
                  <div className="space-y-4 pt-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Assessed Learning Tools & Activities</h4>
                    
                    {samplePlanData.readingList && samplePlanData.readingList.map((book: any, rIdx: number) => (
                      <div key={rIdx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md uppercase">Recommended Reading</span>
                          <span className="text-xs font-bold text-slate-700">{book.title}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{book.prompt || book.type}</p>
                      </div>
                    ))}

                    {samplePlanData.letsPlay && samplePlanData.letsPlay.map((game: any, gIdx: number) => (
                      <div key={gIdx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md uppercase">Let's Play Activity</span>
                          <span className="text-xs font-bold text-slate-700">{game.gameName}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{game.description}</p>
                      </div>
                    ))}

                    {samplePlanData.householdExperiments && samplePlanData.householdExperiments.map((exp: any, eIdx: number) => (
                      <div key={eIdx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md uppercase">Hands-On Experiment</span>
                          <span className="text-xs font-bold text-slate-700">{exp.title}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{exp.instructions}</p>
                      </div>
                    ))}

                    {samplePlanData.outAndAbout && (
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md uppercase">Local Field Trip</span>
                          <span className="text-xs font-bold text-slate-700">{samplePlanData.outAndAbout.title}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{samplePlanData.outAndAbout.instructions}</p>
                      </div>
                    )}

                    {samplePlanData.endOfWeekReview && (
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md uppercase">End of Week Review</span>
                          <span className="text-xs font-bold text-slate-700">{samplePlanData.endOfWeekReview.worksheetTitle}</span>
                        </div>
                        <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-1">
                          {samplePlanData.endOfWeekReview.questions.map((q: string, qIdx: number) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}