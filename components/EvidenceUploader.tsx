"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Star, Heart, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";

export default function EvidenceUploader({ studentId, lessonPlanId, standardText }: any) {
  const [masteryRating, setMasteryRating] = useState<number>(0);
  const [enjoymentRating, setEnjoymentRating] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleSave = async (file?: File) => {
    if (!studentId || !lessonPlanId) {
      toast.error("Missing learner or plan ID.");
      return;
    }

    setIsUploading(true);
    let imageUrl = null;

    try {
      // Image Upload Logic
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${studentId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio_images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('portfolio_images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // Save to Database (Now including enjoyment_rating)
      const { error } = await supabase.from("portfolio_artifacts").insert({
        student_id: studentId,
        lesson_plan_id: lessonPlanId,
        standard_text: standardText,
        rating: masteryRating > 0 ? masteryRating : null,
        enjoyment_rating: enjoymentRating > 0 ? enjoymentRating : null,
        notes: notes,
        image_url: imageUrl
      });

      if (error) throw error;

      setIsSaved(true);
      toast.success("Evidence saved securely!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save evidence.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isSaved) {
    return (
      <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center text-teal-700 font-bold print:hidden">
        <CheckCircle2 className="w-5 h-5 mr-2" /> Evidence Attached Successfully
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 print:hidden">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* 1. AI Feedback: Learner Enjoyment */}
        <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex flex-col items-center">
          <span className="text-xs font-black text-rose-800 uppercase mb-2">Learner Enjoyment</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((heart) => (
              <Heart 
                key={heart} 
                onClick={() => setEnjoymentRating(heart)}
                className={`w-6 h-6 cursor-pointer transition-colors ${enjoymentRating >= heart ? "fill-rose-500 text-rose-500" : "text-rose-200 hover:text-rose-300"}`} 
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-rose-400 mt-2 uppercase text-center leading-tight">
            Helps MiSpark tailor future recommendations
          </span>
        </div>

        {/* 2. State Compliance: Academic Mastery */}
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex flex-col items-center">
          <span className="text-xs font-black text-amber-800 uppercase mb-2">Academic Mastery</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                onClick={() => setMasteryRating(star)}
                className={`w-6 h-6 cursor-pointer transition-colors ${masteryRating >= star ? "fill-amber-500 text-amber-500" : "text-amber-200 hover:text-amber-300"}`} 
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-amber-400 mt-2 uppercase text-center leading-tight">
            Appears on printable state portfolios
          </span>
        </div>
      </div>

      {/* Educator Notes */}
      <Textarea 
        placeholder="Educator Notes (e.g., Learner grasped this concept quickly...)" 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full mb-4 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-teal-500 resize-none h-20"
      />

      {/* Upload and Save Controls */}
      <div className="flex gap-3">
        <input 
          type="file" 
          accept="image/*, application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => {
            const f = e.target.files?.[0]; 
            if(f) handleSave(f);
          }} 
        />
        
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
          variant="outline" 
          className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-bold rounded-xl"
        >
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          Attach File
        </Button>

        <Button 
          onClick={() => handleSave()} 
          disabled={isUploading || (!notes && masteryRating === 0 && enjoymentRating === 0)}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
        >
          Save Text Only
        </Button>
      </div>
    </div>
  );
}