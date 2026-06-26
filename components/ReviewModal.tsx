"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, BookOpen, Headphones, Gamepad2, PlaySquare, Coins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation {
  title: string;
  category: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  studentId: string;
  userId: string;
  recommendations: Recommendation[];
  onFeedbackSubmitted: (sparks: number) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  scheduleId,
  studentId,
  userId,
  recommendations,
  onFeedbackSubmitted,
}: ReviewModalProps) {
  // Track status: "none", "started", or "finished" for each item by title
  const [statusMap, setStatusMap] = useState<Record<string, "none" | "started" | "finished">>(({}));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      const initialMap: Record<string, "none" | "started" | "finished"> = {};
      recommendations.forEach(r => {
        initialMap[r.title] = "none";
      });
      setStatusMap(initialMap);
    }
  }, [isOpen, recommendations]);

  if (!isOpen) return null;

  const handleStatusChange = (title: string, newStatus: "none" | "started" | "finished") => {
    setStatusMap(prev => ({
      ...prev,
      [title]: prev[title] === newStatus ? "none" : newStatus // Toggle off if clicked again
    }));
  };

  const calculateSparks = () => {
    let total = 10; // Base 10 sparks just for reviewing!
    Object.values(statusMap).forEach(status => {
      if (status === "started") total += 10;
      if (status === "finished") total += 25;
    });
    return total;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Calculate final sparks
    const earnedSparks = calculateSparks();

    // NOTE: In a future step, we can add a Supabase call here to save this exact array 
    // to a "progress_tracking" table and update their total Spark balance.
    // For now, we fire the success callback to the dashboard!

    setTimeout(() => {
      onFeedbackSubmitted(earnedSparks);
      setIsSubmitting(false);
    }, 1000);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "Book": return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case "Game Night": return <Gamepad2 className="w-5 h-5 text-emerald-500" />;
      case "Audio/Podcast": return <Headphones className="w-5 h-5 text-cyan-500" />;
      default: return <PlaySquare className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> Track Progress
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Mark what you've started or finished to earn Sparks!
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shadow-sm relative z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {recommendations.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No trackable items for this week.</p>
          ) : (
            recommendations.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-200 hover:bg-teal-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    {getIcon(item.category)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                    <p className="font-bold text-slate-800 line-clamp-2">{item.title}</p>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleStatusChange(item.title, "started")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all flex items-center gap-1 ${
                      statusMap[item.title] === "started" || statusMap[item.title] === "finished"
                        ? "bg-teal-100 border-teal-200 text-teal-800"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {(statusMap[item.title] === "started" || statusMap[item.title] === "finished") && <CheckCircle className="w-4 h-4" />}
                    Started
                  </button>
                  <button
                    onClick={() => handleStatusChange(item.title, "finished")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all flex items-center gap-1 ${
                      statusMap[item.title] === "finished"
                        ? "bg-amber-100 border-amber-300 text-amber-900"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {statusMap[item.title] === "finished" && <CheckCircle className="w-4 h-4" />}
                    Finished
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Spark Calculation */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <Coins className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Potential Sparks</p>
              <p className="text-2xl font-black text-amber-600">+{calculateSparks()}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-6 px-8 text-lg shadow-md"
          >
            {isSubmitting ? "Claiming..." : "Claim My Sparks!"}
          </Button>
        </div>

      </div>
    </div>
  );
}