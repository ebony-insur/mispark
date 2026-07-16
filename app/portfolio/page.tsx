"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Calendar, Star, FileText, Loader2, Image as ImageIcon, ExternalLink, Award } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
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
      const { data: studentData } = await supabase
        .from("children_profiles")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (studentData && studentData.length > 0) {
        setStudents(studentData);
        setSelectedStudent(studentData[0].id);
      }
      setIsLoading(false);
    };
    fetchStudents();
  }, [router, supabase]);

  // 2. Fetch Artifacts when dates or student changes
  useEffect(() => {
    const fetchArtifacts = async () => {
      if (!selectedStudent || !startDate || !endDate) return;
      setIsFetching(true);
      
      const { data, error } = await supabase
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
    };

    fetchArtifacts();
  }, [selectedStudent, startDate, endDate, supabase]);

  const handlePrint = () => {
    if (artifacts.length === 0) {
      toast.error("No evidence to print for this date range.");
      return;
    }
    window.print();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Portfolio...</div>;

  const currentStudentName = students.find(s => s.id === selectedStudent)?.nickname || "Student";
  
  // Format for the printed report header
  const formattedStart = new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedEnd = new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8 print:bg-white print:py-0 print:px-0">
      <SiteHeader />

      {/* CONTROLS SECTION (Hidden when printing) */}
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
        
        {/* Official Header (Only shows cleanly when printing or viewing results) */}
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
            {artifacts.map((item) => (
              <Card key={item.id} className="overflow-hidden border-2 border-slate-200 shadow-sm print:shadow-none print:border-slate-300 print:break-inside-avoid">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  
                  {/* Left Column: Image/PDF Preview */}
                  <div className="w-full md:w-1/3 bg-slate-100 min-h-[250px] border-b md:border-b-0 md:border-r border-slate-200 flex items-center justify-center p-4">
                    {item.image_url ? (
                      item.image_url.includes(".pdf") ? (
                        <a href={item.image_url} target="_blank" rel="noreferrer" className="flex flex-col items-center text-teal-600 hover:text-teal-700">
                          <FileText className="w-16 h-16 mb-2" />
                          <span className="font-bold flex items-center text-sm">View Attached PDF <ExternalLink className="w-3 h-3 ml-1"/></span>
                        </a>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt="Evidence" className="max-h-[300px] object-contain rounded-lg shadow-sm" />
                      )
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm font-bold">No Image Attached</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Details & Standards */}
                  <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-center bg-white">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-3">
                      <Calendar className="w-4 h-4" /> 
                      {new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-800 mb-4 leading-snug">
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
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">{item.notes}</p>
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}