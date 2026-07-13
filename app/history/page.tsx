"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; // Updated to match standard client import
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, FileText, User, ChevronDown, ChevronUp } from "lucide-react";

// --- TYPESCRIPT INTERFACES --- //
interface PlanData {
  assessedFoundation?: string;
  outlinedStandards?: { day: string; subject: string; topic: string }[];
  readingList?: { type: string; title: string; prompt: string }[];
  // Additional fields exist in the DB, but these are the ones rendered in the history preview
}

interface SavedPlan {
  id: string;
  student_id: string;
  parent_id: string;
  created_at: string;
  original_prompt: string;
  plan_data: PlanData;
}

export default function HistoryPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [students, setStudents] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Students for Name Mapping
      const { data: studentData } = await supabase
        .from("children_profiles")
        .select("id, nickname");
      
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
        // Assert the type coming from the database matches our interface
        setPlans(planData as SavedPlan[]);
      }
    };

    fetchHistory();
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-slate-500 hover:text-slate-800 px-2 mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-500" /> My Sparks (History)
        </h1>
      </div>

      {/* PLAN LIST */}
      <div className="w-full max-w-4xl space-y-4">
        {plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No Sparks Yet</h3>
            <p className="text-slate-500 mt-2">Go to your dashboard to ignite your first curriculum!</p>
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="shadow-sm border-slate-200 overflow-hidden">
              {/* COMPACT VIEW */}
              <div 
                className="bg-white p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600"/> 
                    {students[plan.student_id] || "Unknown Student"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Created on {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="text-xs font-bold uppercase truncate max-w-[150px] hidden sm:block">
                    &quot;{plan.original_prompt.substring(0, 30)}...&quot;
                  </span>
                  {expandedId === plan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* EXPANDED VIEW */}
              {expandedId === plan.id && (
                <CardContent className="bg-slate-50 border-t border-slate-100 p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wide mb-2">Original Prompt</h4>
                    <p className="text-sm bg-white p-3 rounded-lg border border-slate-200 italic text-slate-600">
                      {plan.original_prompt}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-500 uppercase tracking-wide mb-2">Assessed Foundation</h4>
                    <p className="text-sm text-slate-800 font-medium">
                      {plan.plan_data.assessedFoundation || "No foundation data available."}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-bold text-indigo-600 mb-2">Books Suggested</h4>
                      <ul className="text-sm list-disc pl-4 space-y-1 text-slate-700">
                        {plan.plan_data.readingList ? (
                          plan.plan_data.readingList.map((book, i) => (
                            <li key={i}>{book.title}</li>
                          ))
                        ) : (
                          <li className="text-slate-400 list-none italic">No books listed.</li>
                        )}
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-bold text-teal-600 mb-2">Topics Covered</h4>
                      <ul className="text-sm list-disc pl-4 space-y-1 text-slate-700">
                        {plan.plan_data.outlinedStandards ? (
                          plan.plan_data.outlinedStandards.map((std, i) => (
                            <li key={i}>{std.day}: {std.topic}</li>
                          ))
                        ) : (
                          <li className="text-slate-400 list-none italic">No topics listed.</li>
                        )}
                      </ul>
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
//update information