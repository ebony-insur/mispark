"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, User, Clock, Calculator, BookOpen, FlaskConical, MapPin } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [focusDuration, setFocusDuration] = useState("");
  const [stateResidence, setStateResidence] = useState("");
  const [mathMastery, setMathMastery] = useState("");
  const [readingMastery, setReadingMastery] = useState("");
  const [scienceMastery, setScienceMastery] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchStudents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("children_profiles")
          .select("*")
          .eq("parent_id", user.id)
          .order("created_at", { ascending: false });
        
        if (data) setStudents(data);
      }
    };
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("children_profiles")
        .insert({
          parent_id: user.id,
          nickname,
          grade,
          focus_duration: focusDuration,
          state_residence: stateResidence,
          math_mastery_level: mathMastery,
          reading_mastery_level: readingMastery,
          science_mastery_level: scienceMastery
        })
        .select();

      if (error) throw error;

      toast.success("Student profile created successfully!");
      if (data) setStudents([data[0], ...students]);
      
      // Reset form
      setIsCreating(false);
      setNickname("");
      setGrade("");
      setFocusDuration("");
      setStateResidence("");
      setMathMastery("");
      setReadingMastery("");
      setScienceMastery("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-slate-500 hover:text-slate-800 px-2">
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-extrabold text-slate-800">Student Profiles</h1>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        )}
      </div>

      {/* CREATE STUDENT FORM */}
      {isCreating && (
        <Card className="w-full max-w-4xl shadow-lg border-0 border-t-4 border-t-teal-500 animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">Create New Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStudent} className="space-y-8">
              
              {/* CORE INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><User className="w-4 h-4 text-teal-600"/> Nickname / First Name</label>
                  <Input required placeholder="e.g. Leo" value={nickname} onChange={(e) => setNickname(e.target.value)} className="bg-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-indigo-600"/> Official Grade Level</label>
                  <Input required placeholder="e.g. 3rd Grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="bg-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-orange-600"/> Max Focus Duration</label>
                  <Input required placeholder="e.g. 20 mins" value={focusDuration} onChange={(e) => setFocusDuration(e.target.value)} className="bg-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-rose-600"/> State of Residence</label>
                  <Input placeholder="e.g. Texas (For standards alignment)" value={stateResidence} onChange={(e) => setStateResidence(e.target.value)} className="bg-white" />
                </div>
              </div>

              {/* PROGRESSIVE MASTERY SECTION */}
              <div className="space-y-6">
                <h3 className="font-extrabold text-slate-800 text-lg border-b pb-2">Progressive Mastery Tracking</h3>
                <p className="text-sm text-slate-500">Tell the AI exactly what your child has mastered and what they are currently struggling with to prevent lesson regression.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><Calculator className="w-4 h-4 text-blue-600"/> Math Mastery</label>
                    <Textarea 
                      placeholder="e.g., Mastered 2-digit addition. Currently struggling with borrowing/carrying numbers." 
                      value={mathMastery} 
                      onChange={(e) => setMathMastery(e.target.value)} 
                      className="bg-slate-50 min-h-[80px]" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-emerald-600"/> Reading & Writing Mastery</label>
                    <Textarea 
                      placeholder="e.g., Reads at a 4th-grade level. Hates physically writing but excels at verbal storytelling." 
                      value={readingMastery} 
                      onChange={(e) => setReadingMastery(e.target.value)} 
                      className="bg-slate-50 min-h-[80px]" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><FlaskConical className="w-4 h-4 text-purple-600"/> Science / Other Interests</label>
                    <Textarea 
                      placeholder="e.g., Obsessed with marine biology and space. Dislikes geology." 
                      value={scienceMastery} 
                      onChange={(e) => setScienceMastery(e.target.value)} 
                      className="bg-slate-50 min-h-[80px]" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="w-full">Cancel</Button>
                <Button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold">
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* STUDENT LIST */}
      {!isCreating && (
        <div className="w-full max-w-4xl space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">No Profiles Yet</h3>
              <p className="text-slate-500 mt-2">Create a profile to generate tailored lesson plans.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <Card key={student.id} className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="flex justify-between items-center text-xl text-slate-800">
                      {student.nickname}
                      <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                        {student.grade}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="text-sm flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-semibold">Focus Limit:</span>
                      <span className="font-bold text-slate-800">{student.focus_duration}</span>
                    </div>
                    {student.state_residence && (
                      <div className="text-sm flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-500 font-semibold">State Align:</span>
                        <span className="font-bold text-slate-800">{student.state_residence}</span>
                      </div>
                    )}
                    {(student.math_mastery_level || student.reading_mastery_level) && (
                      <div className="mt-4 pt-2 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mastery Notes Included</p>
                        <div className="flex gap-2">
                          {student.math_mastery_level && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-bold border border-blue-100">Math</span>}
                          {student.reading_mastery_level && <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-bold border border-emerald-100">Reading</span>}
                          {student.science_mastery_level && <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded font-bold border border-purple-100">Science</span>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}