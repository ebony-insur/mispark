"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, BookOpen, User as UserIcon, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function HistoryPage() {
  const [historyByStudent, setHistoryByStudent] = useState<Record<string, any[]>>({});
  const [students, setStudents] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch students to map IDs to names
      const { data: studentData } = await supabase.from("children_profiles").select("id, nickname").eq("parent_id", user.id);
      const studentMap: Record<string, string> = {};
      if (studentData) {
        studentData.forEach(s => { studentMap[s.id] = s.nickname; });
      }
      setStudents(studentMap);

      // Fetch lesson plans
      const { data: plans } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (plans) {
        const grouped: Record<string, any[]> = {};
        plans.forEach(plan => {
          const sId = plan.student_id || "unassigned";
          if (!grouped[sId]) grouped[sId] = [];
          grouped[sId].push(plan);
        });
        setHistoryByStudent(grouped);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [router, supabase]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading History...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      
      {/* TEMP HEADER (Will be replaced by Universal Navbar in Step 3) */}
     return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      
      <Navbar />

      <div className="w-full max-w-4xl space-y-10">
        
      </div>
      <div className="w-full max-w-4xl space-y-10">
        {Object.keys(historyByStudent).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-500">No curriculum history yet!</p>
          </div>
        ) : (
          Object.entries(historyByStudent).map(([studentId, plans]) => (
            <div key={studentId} className="space-y-4">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 border-b-2 border-slate-200 pb-2">
                <UserIcon className="w-6 h-6 text-teal-600" /> 
                {students[studentId] || "General / Unassigned"}
              </h2>
              
              <div className="grid gap-4">
                {plans.map((plan) => {
                  const dateObj = new Date(plan.created_at);
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  
                  // Extract a short summary from the assessed foundation or standards
                  const summary = plan.plan_data?.assessedFoundation 
                    ? plan.plan_data.assessedFoundation.substring(0, 120) + "..."
                    : "Custom curriculum generation.";

                  return (
                    <Card key={plan.id} className="hover:border-teal-300 transition-colors cursor-pointer" onClick={() => router.push(`/history/${plan.id}`)}>
                      <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                            <Clock className="w-4 h-4" /> {dateStr} at {timeStr}
                          </div>
                          <p className="text-slate-700 font-medium text-sm leading-relaxed">{summary}</p>
                        </div>
                        <Button variant="outline" className="shrink-0 font-bold text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100">
                          View Plan
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}