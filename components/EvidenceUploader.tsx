"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Star, Heart, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";

export default function EvidenceUploader({ 
  studentId, 
  lessonPlanId, 
  standardText, 
  existingArtifact = null // NEW: Pass an existing row here to trigger Edit Mode
}: any) {
  const [masteryRating, setMasteryRating] = useState<number>(0);
  const [enjoymentRating, setEnjoymentRating] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Populate state if an existing artifact is passed in
  useEffect(() => {
    if (existingArtifact) {
      setMasteryRating(existingArtifact.rating || 0);
      setEnjoymentRating(existingArtifact.enjoyment_rating || 0);
      setNotes(existingArtifact.notes || "");
      setExistingFiles(existingArtifact.file_urls || (existingArtifact.image_url ? [existingArtifact.image_url] : []));
    }
  }, [existingArtifact]);

  const handleSave = async (files?: FileList | null) => {
    if (!studentId || !lessonPlanId) {
      toast.error("Missing learner or plan ID.");
      return;
    }

    setIsUploading(true);
    let newUploadedUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to save evidence.");

      // Handle Multiple File Uploads Concurrently
      if (files && files.length > 0) {
        const uploadPromises = Array.from(files).map(async (file) => {
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

          return publicUrlData.publicUrl;
        });

        newUploadedUrls = await Promise.all(uploadPromises);
      }

      // Combine previous files with any new ones uploaded
      const finalFileUrls = [...existingFiles, ...newUploadedUrls];

      const payload = {
        parent_id: user.id,
        student_id: studentId,
        lesson_plan_id: lessonPlanId,
        standard_text: standardText,
        rating: masteryRating > 0 ? masteryRating : null,
        enjoyment_rating: enjoymentRating > 0 ? enjoymentRating : null,
        notes: notes,
        file_urls: finalFileUrls // Using our new database array column
      };

      let dbError;

      if (existingArtifact?.id) {
        // EDIT MODE: Update the existing row
        const { error } = await (supabase as any).from("portfolio_artifacts")
          .update(payload)
          .eq("id", existingArtifact.id);
        dbError = error;
      } else {
        // CREATE MODE: Insert a new row
        const { error } = await (supabase as any).from("portfolio_artifacts").insert(payload);
        dbError = error;
      }

      if (dbError) throw dbError;

      setIsSaved(true);
      toast.success(existingArtifact ? "Evidence updated!" : "Evidence saved securely!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save evidence.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isSaved) {
    return (
      <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center text-teal-700 font-bold print:hidden cursor-pointer" onClick={() => setIsSaved(false)}>
        <CheckCircle2 className="w-5 h-5 mr-2" /> 
        {existingArtifact ? "Update Saved Successfully" : "Evidence Attached Successfully"} 
        <span className="text-xs ml-2 text-teal-500 font-normal">(Click to edit again)</span>
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

      <Textarea 
        placeholder="Educator Notes (e.g., Learner grasped this concept quickly...)" 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full mb-4 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-teal-500 resize-none h-20"
      />

      {/* Show indicator if files are already attached to this entry */}
      {existingFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 w-full">Attached Files:</span>
          {existingFiles.map((url, i) => (
             <div key={i} className="flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
               <ImageIcon className="w-3 h-3 mr-1" /> File {i + 1}
             </div>
          ))}
        </div>
      )}

      {/* Upload and Save Controls */}
      <div className="flex gap-3">
        {/* NEW: Added 'multiple' attribute to allow multi-file selection */}
        <input 
          type="file" 
          multiple 
          accept="image/*, application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => {
            const files = e.target.files; 
            if(files && files.length > 0) handleSave(files);
          }} 
        />
        
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
          variant="outline" 
          className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-bold rounded-xl"
        >
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {existingFiles.length > 0 ? "Add More Files" : "Attach Files"}
        </Button>

        <Button 
          onClick={() => handleSave()} 
          disabled={isUploading || (!notes && masteryRating === 0 && enjoymentRating === 0 && existingFiles.length === 0)}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
        >
          {existingArtifact ? "Save Updates" : "Save Text Only"}
        </Button>
      </div>
    </div>
  );
}