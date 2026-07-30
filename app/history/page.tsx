"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, XCircle, Eye, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const fetchHistoryAndStudents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch parent first name
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();
          
        if (profile) setFirstName(profile.first_name);

        // Fetch children profiles to map IDs to Nicknames
        const { data: studentsData } = await (supabase as any)
          .from("children_profiles")
          .select("id, nickname")
          .eq("parent_id", user.id);
          
        const mappedStudents: Record<string, string> = {};
        if (studentsData) {
          studentsData.forEach((s: any) => {
            mappedStudents[s.id] = s.nickname;
          });
        }
        setStudentsMap(mappedStudents);

        // Fetch plan history
        const { data: historyData } = await (supabase as any)
          .from("lesson_plans") 
          .select("*")
          .eq("parent_id", user.id)
          .order("created_at", { ascending: false });
        
        if (historyData) setPlans(historyData);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };
    
    fetchHistoryAndStudents();
  }, [supabase, router]);

  // Handler for marking a plan as "Didn't Attempt" (Reversible)
  const toggleSkipPlan = async (planId: string, currentSkippedState: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSkippedState = !currentSkippedState;
    
    const { error } = await (supabase as any)
      .from("lesson_plans")
      .update({ is_skipped: newSkippedState }) 
      .eq("id", planId);

    if (error) {
      toast.error("Failed to update plan status.");
    } else {
      if (newSkippedState) {
        toast.success("Plan marked as skipped. It has been removed from assessment queues.");
      } else {
        toast.success("Plan restored! It will now appear in your assessment queues.");
      }
      // Update local state to reflect change instantly
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, is_skipped: newSkippedState } : p));
    }
  };

  // Group plans by Student Nickname
  const groupedPlans = plans.reduce((acc, plan) => {
    const studentName = plan.student_id && studentsMap[plan.student_id] 
      ? studentsMap[plan.student_id] 
      : "General / Unassigned";
      
    if (!acc[studentName]) acc[studentName] = [];
    acc[studentName].push(plan);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <div className="w-full flex-1 flex flex-col items-center pb-24">
        <div className="w-full px-6 pt-6 flex justify-center">
          <SiteHeader firstName={firstName} /> 
        </div>

        <div className="w-full max-w-5xl px-6 pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="flex justify-between items-end border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-slate-900">Plan History</h1>
              <p className="text-slate-600 font-medium">
                Review and assess all your previously generated lesson plans.
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold hidden md:flex">
              Create New Plan
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal-600" />
              <p className="font-medium">Loading your history...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">No plans generated yet</h3>
              <p className="text-slate-500 mt-2 mb-6">When you spark curiosity, your generated plans will be saved here safely.</p>
              <Button onClick={() => router.push("/dashboard")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                Create Your First Plan
              </Button>
            </div>
          ) : (
          <div className="space-y-12">
              {Object.entries(groupedPlans).map(([studentName, studentPlans]: [string, any[]]) => (
                <div key={studentName} className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-800 border-b-2 border-slate-200 pb-2">
                    {studentName}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentPlans.map((plan) => {
                      const isSkipped = plan.is_skipped;
                      const summaryText = plan.plan_data?.assessedFoundation || "Plan successfully generated and mapped to state standards.";

                      return (
                        <Card key={plan.id} className={`border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col relative overflow-hidden ${isSkipped ? 'opacity-75 bg-slate-50/50 grayscale-[20%]' : ''}`}>
                          
                          {isSkipped && (
                            <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                              Didn't Attempt
                            </div>
                          )}

                          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/80">
                            <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1 pr-16">
                              {plan.plan_data?.weekAssigned || plan.plan_data?.weekTheme || "Weekly Lesson Plan"}
                            </CardTitle>
                            <p className="text-xs text-slate-500 font-medium">
                              {new Date(plan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </CardHeader>
                          
                          <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                {summaryText}
                              </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100 mt-auto">
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => router.push(`/history/${plan.id}`)}
                                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold"
                                  size="sm"
                                >
                                  <ClipboardCheck className="w-4 h-4 mr-1.5" /> Assess
                                </Button>
                                <Button 
                                  onClick={() => router.push(`/history/${plan.id}?mode=view`)}
                                  variant="outline" 
                                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                                  size="sm"
                                >
                                  <Eye className="w-4 h-4 mr-1.5" /> View
                                </Button>
                              </div>

                              <button 
                                onClick={(e) => toggleSkipPlan(plan.id, isSkipped, e)}
                                className={`w-full text-center text-xs font-bold transition-colors py-1.5 flex items-center justify-center gap-1.5 rounded-lg ${isSkipped ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'text-slate-400 hover:text-red-600 hover:bg-slate-50'}`}
                              >
                                <XCircle className="w-3.5 h-3.5" /> {isSkipped ? "Undo 'Didn't Attempt'" : "Mark as Didn't Attempt"}
                              </button>
                            </div>
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

      <SiteFooter />
    </main>
  );
}