"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter"; // NEW: Imported the global site footer
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();
          
        if (profile) setFirstName(profile.first_name);

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
    
    fetchHistory();
  }, [supabase, router]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* INNER CONTENT WRAPPER */}
      <div className="w-full flex-1 flex flex-col items-center pb-24">
        <div className="w-full px-6 pt-6 flex justify-center">
          <SiteHeader firstName={firstName} /> 
        </div>

        <div className="w-full max-w-5xl px-6 pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="flex justify-between items-end border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-slate-900">Plan History</h1>
              <p className="text-slate-600 font-medium">
                Review and access all your previously generated lesson plans.
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
              <p className="text-slate-500 mt-2 mb-6">When you ignite a Spark, your generated plans will be saved here safely.</p>
              <Button onClick={() => router.push("/dashboard")} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">
                      {plan.plan_data?.weekTheme || "Weekly Lesson Plan"}
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(plan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </CardHeader>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-slate-600 line-clamp-3">
                        Plan successfully generated and mapped to state standards.
                      </p>
                    </div>
                    <Button 
                      onClick={() => router.push(`/history/${plan.id}`)}
                      variant="outline" 
                      className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 font-bold"
                    >
                      View Plan <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>

      <SiteFooter />
    </main>
  );
}