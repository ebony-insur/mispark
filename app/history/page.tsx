"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If not logged in, kick them back to the login page
      if (!user) {
        router.push("/login");
        return;
      }

      // Securely fetch only THIS user's schedules, newest first
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setSchedules(data);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium animate-pulse">Loading your sparks...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      <div className="w-full max-w-4xl flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-800">My Saved Sparks</h1>
        <Button onClick={() => router.push("/")} variant="outline" className="text-slate-600">
          Back to Generator
        </Button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedules.length === 0 ? (
          <p className="text-slate-600">You haven't ignited any schedules yet!</p>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="shadow-sm border-0 border-t-4 border-t-orange-500 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  {schedule.generated_data.weekTheme}
                </CardTitle>
                <CardDescription>
                  {new Date(schedule.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-bold text-orange-900 bg-orange-100 inline-block px-3 py-1 rounded-full mb-4">
                  {schedule.generated_data.studentProfile}
                </p>
                <div className="bg-slate-100 p-3 rounded text-sm text-slate-600 line-clamp-3 italic">
                  "{schedule.lesson_text}"
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
