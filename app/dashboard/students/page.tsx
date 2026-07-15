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
  User, Clock, ArrowLeft, BrainCircuit, HeartHandshake, Sparkles, Target
} from "lucide-react";

// The master list of subscriptions for the Digital Backpack
const SUBSCRIPTION_OPTIONS = [
  { id: "Netflix", icon: <Tv className="w-4 h-4" /> },
  { id: "Disney+", icon: <Tv className="w-4 h-4" /> },
  { id: "Curiosity Stream", icon: <Tv className="w-4 h-4" /> },
  { id: "Amazon Prime Video", icon: <Tv className="w-4 h-4" /> },
  { id: "Hulu", icon: <Tv className="w-4 h-4" /> },
  { id: "ABCMouse", icon: <BookOpen className="w-4 h-4" /> },
  { id: "Prodigy", icon: <BookOpen className="w-4 h-4" /> },
  { id: "Miacademy", icon: <GraduationCap className="w-4 h-4" /> }, // 📍 Added Miacademy
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

export default function StudentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  
  // Student Form State
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [readingGrade, setReadingGrade] = useState("");
  const [focusDuration, setFocusDuration] = useState("");
  const [stateResidence, setStateResidence] = useState("");
  const [zipCode, setZipCode] = useState(""); 
  
  // Learning Profile State
  const [mathMastery, setMathMastery] = useState("On Grade");
  const [readingMastery, setReadingMastery] = useState("On Grade");
  const [scienceMastery, setScienceMastery] = useState("On Grade");
  const [learningStyle, setLearningStyle] = useState("");
  const [sensoryNeeds, setSensoryNeeds] = useState("");
  const [interests, setInterests] = useState(""); // "Anything else?" field
  
  // Household Backpack State
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
  const [isSavingBackpack, setIsSavingBackpack] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: parentData } = await supabase
          .from("parent_profiles")
          .select("subscriptions")
          .eq("id", user.id)
          .single();
          
        if (parentData?.subscriptions) {
          setActiveSubscriptions(parentData.subscriptions);
        }
      }
    };
    loadData();
  }, [supabase]);

  const handleToggleSubscription = (subId: string) => {
    setActiveSubscriptions((prev) => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleSaveBackpack = async () => {
    setIsSavingBackpack(true);
    const { error } = await supabase.from("parent_profiles").update({ subscriptions: activeSubscriptions }).eq("id", user?.id);
    setIsSavingBackpack(false);
    if (error) toast.error("Failed to save backpack.");
    else toast.success("Digital Backpack updated!");
  };

  const handleCreateStudent = async (redirectAfterSave: boolean) => {
    // Strict Validation
    if (!nickname || !grade || !focusDuration || !stateResidence || !zipCode) {
      toast.error("Please fill out all required fields (Nickname, Grade, Focus, State, Zip).");
      return;
    }

    if (!/^\d{5}$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit US Zip Code.");
      return;
    }

    setIsSavingStudent(true);
    const { error } = await supabase.from("children_profiles").insert({
      parent_id: user?.id,
      nickname,
      grade,
      reading_grade: readingGrade,
      focus_duration: focusDuration,
      state_residence: stateResidence,
      zip_code: zipCode,
      math_mastery_level: mathMastery,
      reading_mastery_level: readingMastery,
      science_mastery_level: scienceMastery,
      learning_style: learningStyle,
      sensory_needs: sensoryNeeds,
      interests: interests
    });
    setIsSavingStudent(false);

    if (error) {
      toast.error("Error creating profile.");
    } else {
      toast.success(`${nickname}'s profile created!`);
      if (redirectAfterSave) {
        router.push("/dashboard");
      } else {
        // Reset form to add another
        setNickname(""); setGrade(""); setReadingGrade(""); setFocusDuration(""); setZipCode("");
        setMathMastery("On Grade"); setReadingMastery("On Grade"); setScienceMastery("On Grade");
        setLearningStyle(""); setSensoryNeeds(""); setInterests("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 📍 ADDED: Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-slate-600 hover:text-slate-900 px-0">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="font-extrabold text-xl tracking-tight text-slate-800">
            <span className="text-teal-500">Mi</span><span className="text-orange-500">Spark</span> Profiles
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
        
        {/* 🎒 THE DIGITAL BACKPACK CARD */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
                <Backpack className="text-teal-600 w-6 h-6" /> Household Digital Backpack
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Select what you already own. Our AI will prioritize these to save you money!
              </p>
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

        {/* 🧑‍🎓 ADD STUDENT CARD */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-2">
            <User className="text-blue-600 w-6 h-6" /> Add New Student
          </h2>
          
          <div className="space-y-10">
            
            {/* SECTION 1: BASICS */}
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
                    <option value="Pre-K">Pre-K</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                    <option value="Middle School">Middle School</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: MASTERY LEVELS (HORIZONTAL) */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <Target className="w-4 h-4"/> Academic Mastery
              </h3>
              <div className="space-y-6">
                {/* Math */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Math Level</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {MASTERY_LEVELS.map(level => (
                      <button key={`math-${level}`} onClick={() => setMathMastery(level)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mathMastery === level ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Reading */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Reading Level</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {MASTERY_LEVELS.map(level => (
                      <button key={`read-${level}`} onClick={() => setReadingMastery(level)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${readingMastery === level ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Science */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Science Level</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {MASTERY_LEVELS.map(level => (
                      <button key={`sci-${level}`} onClick={() => setScienceMastery(level)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scienceMastery === level ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: LEARNING PROFILE */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4"/> Learning Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500"/> Focus Duration *</label>
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
                  <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-rose-500"/> Sensory Needs or Accommodations</label>
                  <Input placeholder="e.g. Needs frequent movement breaks, sensitive to loud noises..." value={sensoryNeeds} onChange={(e) => setSensoryNeeds(e.target.value)} className="bg-slate-50" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500"/> Anything else we should know?</label>
                  <Textarea placeholder="Special interests (e.g. loves dinosaurs, trains), specific goals, or concerns to help tailor the lesson..." value={interests} onChange={(e) => setInterests(e.target.value)} className="bg-slate-50 min-h-[100px]" />
                  <p className="text-xs text-slate-500 mt-1 font-medium">The AI uses this to make recommendations hyper-relevant to your child.</p>
                </div>
              </div>
            </div>

            {/* SECTION 4: LOCATION */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Location & Standards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2"><GraduationCap className="w-4 h-4 text-indigo-600"/> Legal State of Residence *</label>
                  <select value={stateResidence} onChange={(e) => setStateResidence(e.target.value)} className="w-full flex h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950">
                    <option value="" disabled>Select State...</option>
                    {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Used strictly for educational standards alignment.</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-600"/> Physical Zip Code *</label>
                  <Input placeholder="e.g. 40245" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={5} className="bg-slate-50" />
                  <p className="text-xs text-slate-500 mt-1 font-medium">Must be 5 digits. Used to find physical field trips near you.</p>
                </div>
              </div>
            </div>

            {/* DUAL SAVE BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
              <Button onClick={() => handleCreateStudent(false)} disabled={isSavingStudent} variant="outline" className="flex-1 py-6 font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50">
                {isSavingStudent ? "Saving..." : "Save & Add Another Kid"}
              </Button>
              <Button onClick={() => handleCreateStudent(true)} disabled={isSavingStudent} className="flex-1 py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold">
                {isSavingStudent ? "Saving..." : "Save & Go to Dashboard"}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}