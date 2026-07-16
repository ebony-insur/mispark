"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PortfolioUploader from "@/components/PortfolioUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Printer, ArrowLeft, Lightbulb, Shapes, BookHeart, 
  Gamepad2, PlayCircle, FlaskConical, FileText, 
  ChevronRight, ChevronsUpDown, Loader2, ExternalLink 
} from "lucide-react";
import { toast } from "sonner";

// Reusable Collapsible Section (Mirrors Dashboard UI)
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

      // Fetch the specific lesson plan
      const { data: planData, error } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("id", params.id)
        .eq("parent_id", user.id)
        .single();

      if (error || !planData) {
        toast.error("Lesson plan not found.");
        router.push("/history");
        return;
      }

      setPlan(planData);

      // Fetch the student's name
      if (planData.student_id) {
        const { data: studentData } = await supabase
          .from("children_profiles")
          .select("nickname")
          .eq("id", planData.student_id)
          .single();
          
        if (studentData) {
          setStudentName(studentData.nickname);
        }
      }

      setIsLoading(false);
    };

    fetchPlanDetails();
  }, [params.id, router, supabase]);

  // Handle Print formatting
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
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:py-0 print:px-0">
      
      {/* Universal Navbar */}
      <Navbar />

      <div className="w-full max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-8 pb-20 print:space-y-6">
        
        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none">
          <Button onClick={() => router.push("/history")} variant="ghost" className="text-slate-500 hover:text-slate-800 -ml-4 mb-4 print:hidden">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
          </Button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Lesson Plan for {studentName}</h1>
          <p className="text-slate-500 font-bold mt-1">Generated on {dateStr}</p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6 print:hidden bg-slate-800 p-3 rounded-2xl text-white shadow-lg">
          <Button variant="ghost" onClick={() => setAllExpanded(!allExpanded)} className="text-slate-300 hover:text-white hover:bg-slate-700 font-bold rounded-xl">
            <ChevronsUpDown className="w-5 h-5 mr-2"/> {allExpanded ? "Collapse All" : "Expand All"}
          </Button>
          <Button onClick={() => setPrintMode(true)} className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm">
            <Printer className="w-4 h-4 mr-2"/> Print Plan
          </Button>
        </div>

        {/* --- CURRICULUM SECTIONS --- */}

        {/* 1. Standards (With Uploader) */}
        <CollapsibleSection title="Applicable Standards" icon={<Lightbulb className="w-6 h-6 text-blue-600"/>} colorClass="border-t-blue-500" forceOpen={allExpanded}>
          <p className="text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-lg">
            {generatedData.assessedFoundation}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {generatedData.outlinedStandards?.map((std: any, idx: number) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-base">{std.subject}</p>
                  <p className="text-slate-600 text-sm mt-1">{std.topic}</p>
                </div>
                {/* INJECTED UPLOADER */}
                <PortfolioUploader 
                  studentId={plan.student_id} 
                  lessonPlanId={plan.id} 
                  standardText={`Standard Mastery: ${std.subject} - ${std.topic}`} 
                />
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* 2. Reading List (With Uploader) */}
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
                  {/* INJECTED UPLOADER */}
                  <PortfolioUploader 
                    studentId={plan.student_id} 
                    lessonPlanId={plan.id} 
                    standardText={`Reading Comprehension: ${book.title}`} 
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 3. Hands-On Learning (With Uploader) */}
        <CollapsibleSection title="Hands-On Learning" icon={<FlaskConical className="w-6 h-6 text-amber-600"/>} colorClass="border-t-amber-500" forceOpen={allExpanded}>
          <div className="space-y-6">
            {generatedData.handsOnLearning?.aroundTheHouse && (
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                <h4 className="font-black text-amber-900 uppercase text-xs mb-2 bg-amber-200/50 w-max px-2 py-1 rounded">Around The House</h4>
                <p className="font-black text-xl mb-3 text-amber-950">{generatedData.handsOnLearning.aroundTheHouse.title}</p>
                <p className="text-base text-amber-950 font-medium mb-4">{generatedData.handsOnLearning.aroundTheHouse.instructions}</p>
                {/* INJECTED UPLOADER */}
                <PortfolioUploader 
                  studentId={plan.student_id} 
                  lessonPlanId={plan.id} 
                  standardText={`Activity: ${generatedData.handsOnLearning.aroundTheHouse.title}`} 
                />
              </div>
            )}
            
            {generatedData.handsOnLearning?.outAndAbout && (
              <div className="bg-teal-50 p-6 rounded-2xl border border-teal-200">
                <h4 className="font-black text-teal-900 uppercase text-xs mb-2 bg-teal-200/50 w-max px-2 py-1 rounded">Local Field Trip</h4>
                <p className="font-black text-xl mb-3 text-teal-950">{generatedData.handsOnLearning.outAndAbout.title}</p>
                <p className="text-base text-teal-950 font-medium mb-4">{generatedData.handsOnLearning.outAndAbout.instructions}</p>
                {/* INJECTED UPLOADER */}
                <PortfolioUploader 
                  studentId={plan.student_id} 
                  lessonPlanId={plan.id} 
                  standardText={`Field Trip: ${generatedData.handsOnLearning.outAndAbout.title}`} 
                />
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* 4. End of Week Review (With Uploader) */}
        {(generatedData.endOfWeekReview || (generatedData.printableWorksheets && generatedData.printableWorksheets[0])) && (
          <CollapsibleSection title="End of Week Review" icon={<FileText className="w-6 h-6 text-teal-600"/>} colorClass="border-t-teal-500" forceOpen={allExpanded}>
              <h3 className="text-3xl font-black text-slate-800 mb-8 border-b-2 border-slate-100 pb-4">
                {generatedData.endOfWeekReview?.worksheetTitle || generatedData.printableWorksheets[0].worksheetTitle}
              </h3>
              <ol className="list-decimal pl-6 space-y-8 text-xl text-slate-800 font-medium marker:font-black marker:text-teal-600 mb-6">
                {(generatedData.endOfWeekReview?.questions || generatedData.printableWorksheets[0].questions).map((q: string, qIdx: number) => (
                  <li key={qIdx} className="pl-3 leading-relaxed">{q}</li>
                ))}
              </ol>
              
              <div className="mt-8 pt-6 border-t-2 border-slate-100">
                <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Upload Completed Worksheet</p>
                {/* INJECTED UPLOADER */}
                <PortfolioUploader 
                  studentId={plan.student_id} 
                  lessonPlanId={plan.id} 
                  standardText={`End of Week Review: ${generatedData.endOfWeekReview?.worksheetTitle}`} 
                />
              </div>
          </CollapsibleSection>
        )}

      </div>
    </main>
  );
}