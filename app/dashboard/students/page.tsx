"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  MapPin, Backpack, GraduationCap, Tv, Library, BookOpen, 
  User, Clock, ArrowLeft, BrainCircuit, HeartHandshake, Sparkles, Target, 
  Plus, Edit, Zap, Users, Lock
} from "lucide-react";

const SUBSCRIPTION_OPTIONS = [
  { id: "Netflix", icon: <Tv className="w-4 h-4" /> },
  { id: "Disney+", icon: <Tv className="w-4 h-4" /> },
  { id: "Curiosity Stream", icon: <Tv className="w-4 h-4" /> },
  { id: "Amazon Prime Video", icon: <Tv className="w-4 h-4" /> },
  { id: "Hulu", icon: <Tv className="w-4 h-4" /> },
  { id: "ABCMouse", icon: <BookOpen className="w-4 h-4" /> },
  { id: "Prodigy", icon: <BookOpen className="w-4 h-4" /> },
  { id: "Miacademy", icon: <GraduationCap className="w-4 h-4" /> }, 
  { id: "Local Library Card", icon: <Library className="w-4 h-4" /> },
];

const MASTERY_LEVELS = ["Below Grade", "On Grade", "Above Grade"];
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const GRADES = [
  "Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", 
  "6th Grade", "7th Grade", "8th Grade", "9th Grade (Freshman)", "10th Grade (Sophomore)", 
  "11th Grade (Junior)", "12th Grade (Senior)"
];

export default function StudentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Roster vs Form View State
  const [viewMode, setViewMode] = useState<"roster" | "form">("roster");
  const [students, setStudents] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("Free Trial");
  
  // Student Form State
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [focusDuration, setFocusDuration] = useState("");
  const [stateResidence, setStateResidence] = useState("");
  const [zipCode, setZipCode] = useState(""); 
  const [mathMastery, setMathMastery] = useState("On Grade");
  const [readingMastery, setReadingMastery] = useState("On Grade");
  const [scienceMastery, setScienceMastery] = useState("On Grade");
  const [learningStyle, setLearningStyle] = useState("");
  const [sensoryNeeds, setSensoryNeeds] = useState("");
  const [interests, setInterests] = useState(""); 
  
  // Household Backpack State
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
  const [isSavingBackpack, setIsSavingBackpack] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: parentData } = await supabase.from("parent_profiles").select("subscriptions, subscription_tier").eq("id", user.id).single();
      if (parentData?.subscriptions) setActiveSubscriptions(parentData.subscriptions);
      if (parentData?.subscription_tier) setSubscriptionTier(parentData.subscription_tier);

      const { data: studentData } = await supabase.from("children_profiles").select("*").eq("parent_id", user.id).order("created_at", { ascending: true });
      if (studentData) {
        setStudents(studentData);
        if (studentData.length === 0) setViewMode("form");
      }
    }
    setIsLoading(false);
  };

  const handleToggleSubscription = (subId: string) => {
    setActiveSubscriptions((prev) => prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]);
  };

  const handleSaveBackpack = async () => {
    setIsSavingBackpack(true);
    const { error } = await supabase.from("parent_profiles").update({ subscriptions: activeSubscriptions }).eq("id", user?.id);
    setIsSavingBackpack(false);
    if (error) toast.error("Failed to save backpack.");
    else toast.success("Digital Backpack updated!");
  };

  const openFormForEdit = (student: any) => {
    setEditingId(student.id);
    setNickname(student.nickname || "");
    setGrade(student.grade || "");
    setFocusDuration(student.focus_duration || "");
    setStateResidence(student.state_residence || "");
    setZipCode(student.zip_code || "");
    setMathMastery(student.math_mastery_level || "On Grade");
    setReadingMastery(student.reading_mastery_level || "On Grade");
    setScienceMastery(student.science_mastery_level || "On Grade");
    setLearningStyle(student.learning_style || "");
    setSensoryNeeds(student.sensory_needs || "");
    setInterests(student.interests || "");
    setViewMode("form");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFormForNew = () => {
    // 📍 RULE 1: SOLO SCHOLAR PROFILES CHECK
    if (subscriptionTier === "Solo Scholar" && students.length >= 1) {
      toast.error("Solo Scholar limit reached", {
        description: "Your plan includes 1 student profile. Upgrade to Family Unlimited to add more kids!"
      });
      router.push("/billing");
      return;
    }
    setEditingId(null);
    setNickname(""); setGrade(""); setFocusDuration(""); setZipCode("");
    setMathMastery("On Grade"); setReadingMastery("On Grade"); setScienceMastery("On Grade");
    setLearningStyle(""); setSensoryNeeds(""); setInterests("");
    setViewMode("form");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudent = async (redirectAfterSave: boolean) => {
    if (!nickname || !grade || !focusDuration || !stateResidence || !zipCode) {
      toast.error("Please fill out all required fields.");
      return;
    }
    if (!/^\d{5}$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit US Zip Code.");
      return;
    }

    setIsSavingStudent(true);
    
    const payload = {
      parent_id: user?.id, nickname, grade, focus_duration: focusDuration, 
      state_residence: stateResidence, zip_code: zipCode, math_mastery_level: mathMastery, 
      reading_mastery_level: readingMastery, science_mastery_level: scienceMastery, 
      learning_style: learningStyle, sensory_needs: sensoryNeeds, interests: interests
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from("children_profiles").update(payload).eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("children_profiles").insert(payload);
      error = insertError;
    }

    setIsSavingStudent(false);

    if (error) {
      toast.error("Error saving profile.");
    } else {
      toast.success(`${nickname}'s profile saved!`);
      await fetchData();
      if (redirectAfterSave) {
        router.push("/dashboard");
      } else {
        setViewMode("roster");
      }
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Loading roster...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-slate-600 hover:text-slate-900 px-0">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="font-extrabold text-xl tracking-tight text-slate-800">Household Profiles</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
        
        {/* BACKPACK */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
                <Backpack className="text-teal-600 w-6 h-6" /> Household Digital Backpack
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Select what you already own. We will prioritize these to save you money!</p>
            </div>
            <Button onClick={handleSaveBackpack} disabled={isSavingBackpack} className="bg-teal-600 hover:bg-teal-700 font-bold shrink-0">
              {isSavingBackpack ? "Saving..." : "Save Backpack"}
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SUBSCRIPTION_OPTIONS.map((sub) => {
              const isActive = activeSubscriptions.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => handleToggleSubscription(sub.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                    isActive ? "bg-teal-50 border-teal-500 text-teal-800 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-slate-50"
                  }`}
                >
                  {sub.icon} {sub.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- ROSTER VIEW --- */}
        {viewMode === "roster" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Users className="text-blue-600 w-6 h-6" /> My Students
              </h2>
              
              {/* 📍 UPGRADE CALLOUT SHORTCUT FOR SOLO SCHOLAR */}
              {subscriptionTier === "Solo Scholar" && students.length >= 1 ? (
                <Button onClick={() => router.push("/billing")} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md hover:opacity-90">
                  <Lock className="w-4 h-4 mr-2" /> Upgrade to Add Kids
                </Button>
              ) : (
                <Button onClick={openFormForNew} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Add Student
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {students.map(student => (
                <div key={student.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-xl text-slate-800 mb-1">{student.nickname}</h3>
                    <p className="text-sm font-bold text-slate-500">{student.grade} • {student.focus_duration}</p>
                    {student.interests && <p className="text-xs text-slate-400 mt-2 line-clamp-2">Loves: {student.interests}</p>}
                  </div>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                    <Button onClick={() => openFormForEdit(student)} variant="outline" className="flex-1 font-bold border-slate-200 hover:bg-slate-50">
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                    <Button onClick={() => router.push("/history")} variant="secondary" className="flex-1 font-bold bg-amber-50 text-amber-700 hover:bg-amber-100">
                      <Zap className="w-4 h-4 mr-2 fill-amber-500 text-amber-500" /> History
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FORM VIEW (ADD/EDIT) --- */}
        {viewMode === "form" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <User className="text-blue-600 w-6 h-6" /> {editingId ? "Edit Student Profile" : "Add New Student"}
              </h2>
              {students.length > 0 && (
                <Button variant="ghost" onClick={() => setViewMode("roster")} className="text-slate-500">Cancel</Button>
              )}
            </div>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Student Nickname *</label>
                    <Input placeholder="e.g. Leo" value={nickname} onChange={(e) => setNickname(e.target.value)} className="bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Age / Overall Grade *</label>
                    <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full flex h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950">
                      <option value="" disabled>Select Grade...</option>
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                  <Target className="w-4 h-4"/> Academic Mastery
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Math Level</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {MASTERY_LEVELS.map(level => (
                        <button type="button" key={`math-${level}`} onClick={() => setMathMastery(level)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mathMastery === level ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Reading Level</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {MASTERY_LEVELS.map(level => (
                        <button type="button" key={`read-${level}`} onClick={() => setReadingMastery(level)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${readingMastery === level ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Science Level</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {MASTERY_LEVELS.map(level => (
                        <button type="button" key={`sci-${level}`} onClick={() => setScienceMastery(level)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scienceMastery === level ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4"/> Learning Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500"/> Focus Duration *</label>
                    <select value={focusDuration} onChange={(e) => setFocusDuration(e.target.value)} className="w-full flex h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950">
                      <option value="" disabled>Select Attention Span...</option>
                      <option value="10 mins">10 Minutes (Short bursts)</option>
                      <option value="20 mins">20 Minutes (Standard)</option>
                      <option value="45 mins">45 Minutes (Deep dive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Primary Learning Style</label>
                    <select value={learningStyle} onChange={(e) => setLearningStyle(e.target.value)} className="w-full flex h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950">
                      <option value="">Mixed / Not Sure</option>
                      <option value="Visual">Visual (Seeing)</option>
                      <option value="Auditory">Auditory (Hearing)</option>
                      <option value="Kinesthetic">Kinesthetic (Hands-on)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-rose-500"/> Sensory Needs or Accommodations</label>
                    <Input placeholder="e.g. Needs frequent movement breaks..." value={sensoryNeeds} onChange={(e) => setSensoryNeeds(e.target.value)} className="bg-slate-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500"/> Anything else we should know?</label>
                    <Textarea placeholder="Special interests, specific goals, or concerns..." value={interests} onChange={(e) => setInterests(e.target.value)} className="bg-slate-50 min-h-[100px]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Location & Standards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-indigo-600"/> Legal State of Residence *</label>
                    <select value={stateResidence} onChange={(e) => setStateResidence(e.target.value)} className="w-full flex h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950">
                      <option value="" disabled>Select State...</option>
                      {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-600"/> Physical Zip Code *</label>
                    <Input placeholder="e.g. 40245" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={5} className="bg-slate-50" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <Button onClick={() => handleSaveStudent(false)} disabled={isSavingStudent} variant="outline" className="flex-1 py-6 font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50">
                  Save &amp; View Roster
                </Button>
                <Button onClick={() => handleSaveStudent(true)} disabled={isSavingStudent} className="flex-1 py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  Save &amp; Go to Dashboard
                </Button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}