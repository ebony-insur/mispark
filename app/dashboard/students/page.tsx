"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Backpack, GraduationCap, Tv, Library, BookOpen, User, Clock } from "lucide-react";

// The master list of subscriptions for the Digital Backpack
const SUBSCRIPTION_OPTIONS = [
  { id: "Netflix", icon: <Tv className="w-4 h-4" /> },
  { id: "Disney+", icon: <Tv className="w-4 h-4" /> },
  { id: "Curiosity Stream", icon: <Tv className="w-4 h-4" /> },
  { id: "Amazon Prime Video", icon: <Tv className="w-4 h-4" /> },
  { id: "Hulu", icon: <Tv className="w-4 h-4" /> },
  { id: "ABCMouse", icon: <BookOpen className="w-4 h-4" /> },
  { id: "Prodigy", icon: <BookOpen className="w-4 h-4" /> },
  { id: "Local Library Card", icon: <Library className="w-4 h-4" /> },
];

export default function StudentsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  
  // Student Form State
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [focusDuration, setFocusDuration] = useState("");
  const [stateResidence, setStateResidence] = useState("");
  const [zipCode, setZipCode] = useState(""); // 📍 Physical Location
  
  // Household Backpack State
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
  const [isSavingBackpack, setIsSavingBackpack] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch Parent Profile (Digital Backpack)
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

  // --- HANDLERS ---

  const handleToggleSubscription = (subId: string) => {
    setActiveSubscriptions((prev) => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleSaveBackpack = async () => {
    setIsSavingBackpack(true);
    const { error } = await supabase
      .from("parent_profiles")
      .update({ subscriptions: activeSubscriptions })
      .eq("id", user?.id);

    setIsSavingBackpack(false);
    if (error) toast.error("Failed to save backpack.");
    else toast.success("Digital Backpack updated!");
  };

  const handleCreateStudent = async () => {
    if (!nickname || !grade || !focusDuration || !stateResidence || !zipCode) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const { error } = await supabase
      .from("children_profiles")
      .insert({
        parent_id: user?.id,
        nickname,
        grade,
        focus_duration: focusDuration,
        state_residence: stateResidence,
        zip_code: zipCode, // 📍 Saves to DB
      });

    if (error) toast.error("Error creating profile.");
    else {
      toast.success("Student added successfully!");
      setNickname("");
      setGrade("");
      setFocusDuration("");
      setStateResidence("");
      setZipCode("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      
      {/* 🎒 THE DIGITAL BACKPACK CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Backpack className="text-teal-600" /> Household Digital Backpack
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select what you already own. Our AI will prioritize these to save you money!
            </p>
          </div>
          <Button onClick={handleSaveBackpack} disabled={isSavingBackpack} className="bg-teal-600 hover:bg-teal-700">
            {isSavingBackpack ? "Saving..." : "Save Backpack"}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {SUBSCRIPTION_OPTIONS.map((sub) => {
            const isActive = activeSubscriptions.includes(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => handleToggleSubscription(sub.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-teal-50 border-teal-500 text-teal-800 shadow-sm" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300"
                }`}
              >
                {sub.icon} {sub.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🧑‍🎓 ADD STUDENT CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Student</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* BASIC INFO */}
          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600"/> Student Nickname
            </label>
            <Input 
              placeholder="e.g. Leo" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-emerald-600"/> Grade Level
            </label>
            <select 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)}
              className="w-full flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
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

          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500"/> Focus Duration
            </label>
            <select 
              value={focusDuration} 
              onChange={(e) => setFocusDuration(e.target.value)}
              className="w-full flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select Attention Span...</option>
              <option value="10 mins">10 Minutes (Short bursts)</option>
              <option value="20 mins">20 Minutes (Standard)</option>
              <option value="45 mins">45 Minutes (Deep dive)</option>
            </select>
          </div>
          
          <div className="hidden md:block"></div> {/* Spacer for grid alignment */}

          {/* THE ROADSCHOOLING SPLIT */}
          <div className="space-y-4 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
            <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Location & Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600"/> Legal State of Residence
                </label>
                <Input 
                  placeholder="e.g. Texas" 
                  value={stateResidence} 
                  onChange={(e) => setStateResidence(e.target.value)} 
                />
                <p className="text-xs text-slate-500 mt-1">Used strictly for educational standards alignment.</p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-rose-600"/> Current Physical Zip Code
                </label>
                <Input 
                  placeholder="e.g. 40245" 
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)} 
                />
                <p className="text-xs text-slate-500 mt-1">Used to find physical field trips near your current location.</p>
              </div>
              
            </div>
          </div>
        </div>

        <Button onClick={handleCreateStudent} className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white">
          Create Student Profile
        </Button>
      </div>

    </div>
  );
}