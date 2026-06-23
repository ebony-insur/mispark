"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Users } from "lucide-react";

export default function ManageStudents() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [interests, setInterests] = useState("");
  const [sensoryNeeds, setSensoryNeeds] = useState("");
  const [focusDuration, setFocusDuration] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchStudents(user.id);
      } else {
        router.push("/login");
      }
    };
    loadData();
  }, [router]);

  const fetchStudents = async (userId: string) => {
    const { data, error } = await supabase
      .from("children_profiles")
      .select("*")
      .eq("parent_id", userId) // Updated to map to parent_id
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStudents(data);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !grade) {
      toast.error("Nickname and Grade are required.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Saving profile...", { id: "save-student" });

    const { error } = await supabase.from("children_profiles").insert({
      parent_id: user.id, // Updated to map to parent_id
      nickname,
      grade,
      learning_style: learningStyle,
      interests,
      sensory_needs: sensoryNeeds,
      focus_duration: focusDuration
    });

    if (error) {
      toast.error("Failed to save profile.", { id: "save-student" });
      console.error(error);
    } else {
      toast.success("Student profile added successfully!", { id: "save-student" });
      // Reset form
      setNickname("");
      setGrade("");
      setLearningStyle("");
      setInterests("");
      setSensoryNeeds("");
      setFocusDuration("");
      // Refresh list
      fetchStudents(user.id);
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 flex flex-col items-center space-y-8">
      
      {/* HEADER NAV */}
      <div className="w-full max-w-4xl flex justify-between items-center">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-slate-600 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="w-full max-w-4xl text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900">Manage Students</h1>
        <p className="text-slate-600 text-lg max-w-xl mx-auto">
          Create secure profiles for your children. We use these details to heavily personalize their hands-on experiments and learning paces.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ADD STUDENT FORM */}
        <Card className="shadow-md border-t-4 border-t-teal-500 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-slate-800">
              <UserPlus className="w-6 h-6 text-teal-500" /> Add a Profile
            </CardTitle>
            <CardDescription>Use initials or a nickname for privacy.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nickname *</label>
                  <Input placeholder="e.g., J.M. or Buddy" value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Grade Level *</label>
                  <Input placeholder="e.g., 4th Grade" value={grade} onChange={(e) => setGrade(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Learning Style</label>
                <Input placeholder="e.g., Visual, Kinesthetic" value={learningStyle} onChange={(e) => setLearningStyle(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Current Fixations / Interests</label>
                <Input placeholder="e.g., Dinosaurs, Space, Minecraft" value={interests} onChange={(e) => setInterests(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Sensory Needs</label>
                <Textarea placeholder="e.g., Avoid messy textures, needs movement breaks" className="resize-none" value={sensoryNeeds} onChange={(e) => setSensoryNeeds(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Focus Duration</label>
                <Input placeholder="e.g., Short 15-min bursts" value={focusDuration} onChange={(e) => setFocusDuration(e.target.value)} disabled={isSubmitting} />
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold mt-2" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* EXISTING STUDENTS LIST */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-orange-500" /> Saved Profiles
          </h2>
          
          {students.length === 0 ? (
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              No student profiles saved yet. Create your first one to the left!
            </div>
          ) : (
            students.map((student) => (
              <Card key={student.id} className="shadow-sm border border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{student.nickname}</h3>
                      <p className="text-sm font-bold text-orange-600">{student.grade}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-slate-600">
                    <p><strong className="text-slate-800">Interests:</strong> {student.interests || "None specified"}</p>
                    <p><strong className="text-slate-800">Sensory:</strong> {student.sensory_needs || "None specified"}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
