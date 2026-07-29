"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EvidenceUploader from "@/components/EvidenceUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Calendar, Star, FileText, Loader2, ExternalLink, Award, Edit3, X, History, Filter } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  // Controls state
  const [showFeedbackDate, setShowFeedbackDate] = useState<boolean>(true);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  
  // Modal State for Editing
  const [editingArtifact, setEditingArtifact] = useState<any | null>(null);
  
  const [artifacts, setArtifacts] = useState<any[]>([]);

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

  // 2. Fetch Artifacts & Map Week Assigned
  const fetchArtifacts = useCallback(async () => {
    if (!selectedStudent) return;
    setIsFetching(true);
    
    // Fetch all portfolio artifacts for this student
    const { data: artData, error: artError } = await (supabase as any)
      .from("portfolio_artifacts")
      .select("*")
      .eq("student_id", selectedStudent)
      .order("created_at", { ascending: true });

    if (!artError && artData) {
      const enriched = await Promise.all(
        artData.map(async (art: any) => {
          let weekAssigned = "General Weekly Assignments";
          let planCreatedAt = art.created_at;

          if (art.lesson_plan_id) {
            const { data: planData } = await (supabase as any)
              .from("lesson_plans")
              .select("created_at, plan_data")
              .eq("id", art.lesson_plan_id)
              .single();
            
            if (planData) {
              planCreatedAt = planData.created_at;
              if (planData.plan_data?.weekAssigned) {
                weekAssigned = planData.plan_data.weekAssigned;
              } else if (planData.plan_data?.weekTheme) {
                weekAssigned = planData.plan_data.weekTheme;
              }
            }
          }

          return {
            ...art,
            plan_created_at: planCreatedAt,
            week_assigned: weekAssigned
          };
        })
      );

      setArtifacts(enriched);

      // Extract unique weeks for the filter dropdown
      const uniqueWeeks = Array.from(new Set(enriched.map((item: any) => item.week_assigned))) as string[];
      setAvailableWeeks(uniqueWeeks);
      setSelectedWeek("all"); // Reset filter on student change
    }
    setIsFetching(false);
  }, [selectedStudent, supabase]);

  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  const handleCloseEdit = () => {
    setEditingArtifact(null);
    fetchArtifacts();
  };

  const handlePrint = () => {
    if (artifacts.length === 0) {
      toast.error("No evidence to print.");
      return;
    }
    window.print();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Portfolio...</div>;

  const currentStudentName = students.find(s => s.id === selectedStudent)?.nickname || "Student";

  // Filter artifacts by selected week
  const filteredArtifacts = selectedWeek === "all" 
    ? artifacts 
    : artifacts.filter(item => item.week_assigned === selectedWeek);

  // Group filtered artifacts by Week Assigned
  const groupedByWeek = filteredArtifacts.reduce((acc: any, item: any) => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-teal-600" /> Filter by Week Assigned
              </label>
              <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(e.target.value)} 
                className="p-3 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none focus:border-teal-500"
              >
                <option value="all">All Weeks ({artifacts.length} Total)</option>
                {availableWeeks.map(week => (
                  <option key={week} value={week}>{week}</option>
                ))}
              </select>
            </div>

            <Button 
              onClick={handlePrint}
              className="p-3 h-[52px] bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
            >
              <Printer className="w-5 h-5 mr-2" /> Print Portfolio
            </Button>
          </div>

          {/* TOGGLE CONTROLS */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
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
        </div>

        {/* PRINTABLE PORTFOLIO VIEW */}
        <div className="w-full max-w-5xl space-y-12 pb-20 print:pb-0">
          
          {filteredArtifacts.length > 0 && (
            <div className="text-center pb-8 border-b-2 border-slate-200 mb-8 print:border-slate-800 print:mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Academic Portfolio</h2>
              <p className="text-2xl font-bold text-slate-700 mt-2">{currentStudentName}</p>
              <p className="text-slate-500 font-medium mt-1">Viewing: {selectedWeek === "all" ? "All Assigned Weeks" : selectedWeek}</p>
            </div>
          )}

          {isFetching ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" /></div>
          ) : filteredArtifacts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 print:hidden">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-500">No evidence found for this selection.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedByWeek).map(([weekTitle, weekItems]: [string, any]) => (
                <div key={weekTitle} className="space-y-6 print:break-inside-avoid">
                  
                  {/* WEEK / LEARNING HEADER */}
                  <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex justify-between items-center print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
                    <h3 className="text-xl font-black">{weekTitle}</h3>
                    <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-teal-400 px-3 py-1 rounded-full print:bg-white print:text-slate-700">
                      {weekItems.length} Assignment{weekItems.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* ASSIGNMENTS GROUPED UNDER THIS WEEK */}
                  <div className="space-y-6">
                    {weekItems.map((item: any) => {
                      const files: string[] = item.file_urls?.length > 0 ? item.file_urls : (item.image_url ? [item.image_url] : []);
                      const hasFiles = files.length > 0;
                      const planDateStr = item.plan_created_at ? new Date(item.plan_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

                      const feedbackHistory = item.feedback_history || [
                        { date: item.updated_at || item.created_at, note: item.notes, rating: item.rating }
                      ];

                      return (
                        <Card 
                          key={item.id} 
                          onClick={() => setEditingArtifact(item)}
                          className="overflow-hidden border-2 border-slate-200 shadow-sm transition-colors cursor-pointer hover:border-teal-400 group print:shadow-none print:border-slate-300 print:break-inside-avoid relative bg-white"
                        >
                          <CardContent className="p-6 md:p-8 space-y-6">
                            
                            <div className="absolute top-6 right-6 text-slate-300 group-hover:text-teal-500 transition-colors print:hidden">
                              <Edit3 className="w-5 h-5" />
                            </div>

                            {/* PLAN CREATED DATE & FEEDBACK TIMESTAMP */}
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 border-b border-slate-100 pb-3">
                              {planDateStr && (
                                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                  <Calendar className="w-3.5 h-3.5 text-teal-600" /> Plan Created: {planDateStr}
                                </span>
                              )}
                              {showFeedbackDate && (
                                <span className="flex items-center gap-1.5">
                                  <History className="w-3.5 h-3.5 text-slate-400" /> Feedback Recorded: {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            
                            {/* STANDARD ASSESSED */}
                            <h4 className="text-xl font-black text-slate-800 leading-snug pr-8">
                              {item.standard_text}
                            </h4>

                            {/* WRITTEN ASSESSMENTS / MASTERY RATING */}
                            {item.rating && (
                              <div className="flex items-center gap-1 bg-amber-50 w-max px-3 py-1.5 rounded-lg border border-amber-100">
                                <span className="text-xs font-black text-amber-700 uppercase mr-1">Mastery:</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`w-4 h-4 ${item.rating >= star ? "fill-amber-500 text-amber-500" : "text-amber-200"}`} />
                                ))}
                              </div>
                            )}

                            {/* EDUCATOR FEEDBACK AS A PROGRESSION */}
                            <div className="space-y-3">
                              <p className="text-xs font-black text-slate-500 uppercase">Educator Feedback Progression</p>
                              <div className="space-y-3 border-l-2 border-teal-500 pl-4 py-1">
                                {feedbackHistory.map((historyItem: any, hIdx: number) => (
                                  <div key={hIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[11px] font-bold text-teal-700 uppercase">Update #{hIdx + 1}</span>
                                      <span className="text-[11px] text-slate-400 font-medium">
                                        {new Date(historyItem.date || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                    </div>
                                    <p className="text-slate-700 font-medium text-sm leading-relaxed">{historyItem.note || item.notes || "No notes logged for this update."}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* FILE ARTIFACTS: MEDIUM ICONS TILED & GROUPED AFTER ASSESSMENTS */}
                            {hasFiles && (
                              <div className="pt-4 border-t border-slate-100 space-y-3">
                                <p className="text-xs font-black text-slate-500 uppercase">Attached Evidence & File Artifacts</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  {files.map((url, index) => (
                                    <div key={index} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:border-teal-500 transition-all">
                                      {url.includes(".pdf") ? (
                                        <a href={url} target="_blank" rel="noreferrer" className="flex flex-col items-center text-teal-600 hover:text-teal-700 py-4" onClick={(e) => e.stopPropagation()}>
                                          <FileText className="w-12 h-12 mb-1" />
                                          <span className="font-bold text-xs flex items-center">PDF File <ExternalLink className="w-3 h-3 ml-1"/></span>
                                        </a>
                                      ) : (
                                        <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-200">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* EDIT MODAL OVERLAY */}
      {editingArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl relative border border-slate-200">
            
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Edit Portfolio Entry</h2>
              <button 
                onClick={handleCloseEdit}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-black text-slate-500 uppercase block mb-1">Standard Assessed</span>
                <p className="text-slate-800 font-bold">{editingArtifact.standard_text}</p>
              </div>

              <EvidenceUploader 
                studentId={editingArtifact.student_id} 
                lessonPlanId={editingArtifact.lesson_plan_id}
                standardText={editingArtifact.standard_text}
                existingArtifact={editingArtifact}
              />
            </div>

          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}