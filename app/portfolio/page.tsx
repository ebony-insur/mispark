"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import EvidenceUploader from "@/components/EvidenceUploader"; // NEW: Imported your upgraded uploader
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Calendar, Star, FileText, Loader2, ExternalLink, Award, Edit3, X } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  // Modal State for Editing
  const [editingArtifact, setEditingArtifact] = useState<any | null>(null);
  
  // Default to the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
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

  // 2. Fetch Artifacts logic (extracted so we can refresh after editing)
  const fetchArtifacts = useCallback(async () => {
    if (!selectedStudent || !startDate || !endDate) return;
    setIsFetching(true);
    
    const { data, error } = await (supabase as any)
      .from("portfolio_artifacts")
      .select("*")
      .eq("student_id", selectedStudent)
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setArtifacts(data);
    }
    setIsFetching(false);
  }, [selectedStudent, startDate, endDate, supabase]);

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  // Handle closing the modal and refreshing the data automatically
  const handleCloseEdit = () => {
    setEditingArtifact(null);
    fetchArtifacts();
  };

  const handlePrint = () => {
    if (artifacts.length === 0) {
      toast.error("No evidence to print for this date range.");
      return;
    }
    window.print();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Portfolio...</div>;

  const currentStudentName = students.find(s => s.id === selectedStudent)?.nickname || "Student";
  const formattedStart = new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedEnd = new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:py-0 print:px-0 relative">
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
            <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="p-3 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="p-3 rounded-xl border-2 border-slate-200 font-bold bg-slate-50 outline-none focus:border-teal-500"
            />
          </div>

          <Button 
            onClick={handlePrint}
            className="p-3 h-[52px] bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
          >
            <Printer className="w-5 h-5 mr-2" /> Print Portfolio
          </Button>
        </div>
      </div>

      {/* PRINTABLE PORTFOLIO VIEW */}
      <div className="w-full max-w-5xl space-y-8 pb-20">
        
        {artifacts.length > 0 && (
          <div className="text-center pb-8 border-b-2 border-slate-200 mb-8 print:border-slate-800 print:mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Academic Portfolio</h2>
            <p className="text-2xl font-bold text-slate-700 mt-2">{currentStudentName}</p>
            <p className="text-slate-500 font-medium mt-1">Reporting Period: {formattedStart} - {formattedEnd}</p>
          </div>
        )}

        {isFetching ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" /></div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 print:hidden">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-500">No evidence uploaded for this date range.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {artifacts.map((item) => {
              // Condolidate the legacy image_url and the new file_urls array
              const files: string[] = item.file_urls?.length > 0 ? item.file_urls : (item.image_url ? [item.image_url] : []);
              const hasFiles = files.length > 0;

              return (
                <Card 
                  key={item.id} 
                  onClick={() => setEditingArtifact(item)} // NEW: Triggers the edit modal
                  className="overflow-hidden border-2 border-slate-200 shadow-sm transition-colors cursor-pointer hover:border-teal-400 group print:shadow-none print:border-slate-300 print:break-inside-avoid relative"
                >
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    
                    {/* ONLY render this left column if files exist */}
                    {hasFiles && (
                      <div className="w-full md:w-1/3 bg-slate-100 min-h-[250px] border-b md:border-b-0 md:border-r border-slate-200 flex flex-col gap-4 items-center justify-center p-4">
                        {files.map((url, index) => (
                          <div key={index} className="w-full flex justify-center">
                            {url.includes(".pdf") ? (
                              <a href={url} target="_blank" rel="noreferrer" className="flex flex-col items-center text-teal-600 hover:text-teal-700" onClick={(e) => e.stopPropagation()}>
                                <FileText className="w-16 h-16 mb-2" />
                                <span className="font-bold flex items-center text-sm">View PDF <ExternalLink className="w-3 h-3 ml-1"/></span>
                              </a>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={url} alt={`Evidence ${index + 1}`} className="max-h-[300px] object-contain rounded-lg shadow-sm" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Right Column: Expands to full width if no files exist */}
                    <div className={`${hasFiles ? "w-full md:w-2/3" : "w-full"} p-6 md:p-8 flex flex-col justify-center bg-white relative`}>
                      
                      {/* Hidden hover edit icon for UI feedback */}
                      <div className="absolute top-6 right-6 text-slate-300 group-hover:text-teal-500 transition-colors print:hidden">
                        <Edit3 className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-3">
                        <Calendar className="w-4 h-4" /> 
                        {new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-800 mb-4 leading-snug pr-8">
                        {item.standard_text}
                      </h3>

                      {item.rating && (
                        <div className="flex items-center gap-1 mb-4 bg-amber-50 w-max px-3 py-1.5 rounded-lg border border-amber-100">
                          <span className="text-xs font-black text-amber-700 uppercase mr-1">Mastery:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-4 h-4 ${item.rating >= star ? "fill-amber-500 text-amber-500" : "text-amber-200"}`} />
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs font-black text-slate-500 uppercase mb-1">Educator Notes</p>
                          <p className="text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-wrap">{item.notes}</p>
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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

              {/* Your upgraded EvidenceUploader handling the edit logic */}
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

    </main>
  );
}