"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Star, Heart, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";

export default function EvidenceUploader({ 
  studentId, 
  lessonPlanId, 
  standardText, 
  existingArtifact = null 
}: any) {
  const [masteryRating, setMasteryRating] = useState<number>(0);
  const [enjoymentRating, setEnjoymentRating] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // useMemo prevents unnecessary re-renders
  const supabase = useMemo(() => createClient(), []);

  // Automatically fetch existing data if this component is rendered on the history page
  useEffect(() => {
    if (existingArtifact) {
      setMasteryRating(existingArtifact.rating || 0);
      setEnjoymentRating(existingArtifact.enjoyment_rating || 0);
      setNotes(existingArtifact.notes || "");
      setExistingFiles(existingArtifact.file_urls || (existingArtifact.image_url ? [existingArtifact.image_url] : []));
    } else {
      const fetchExistingData = async () => {
        if (!studentId || !lessonPlanId || !standardText) return;
        const { data } = await (supabase as any)
          .from("portfolio_artifacts")
          .select("*")
          .eq("student_id", studentId)
          .eq("lesson_plan_id", lessonPlanId)
          .eq("standard_text", standardText)
          .maybeSingle(); // Safe fetch that won't throw errors if missing
        
        if (data) {
          setMasteryRating(data.rating || 0);
          setEnjoymentRating(data.enjoyment_rating || 0);
          setNotes(data.notes || "");
          setExistingFiles(data.file_urls || (data.image_url ? [data.image_url] : []));
        }
      };
      fetchExistingData();
    }
  }, [studentId, lessonPlanId, standardText, existingArtifact, supabase]);

  const handleSave = async () => {
    if (!studentId || !lessonPlanId) {
      toast.error("Missing learner or plan ID.");
      return;
    }

    setIsUploading(true);
    let newUploadedUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to save evidence.");

      // 1. Upload new files if any were selected
      if (pendingFiles.length > 0) {
        const uploadPromises = pendingFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const fileName = `${Math.random().toString(36).substring(2)}_${safeOriginalName}`;
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

      const finalFileUrls = [...existingFiles, ...newUploadedUrls];

      const payload = {
        parent_id: user.id,
        student_id: studentId,
        lesson_plan_id: lessonPlanId,
        standard_text: standardText,
        rating: masteryRating > 0 ? masteryRating : null,
        enjoyment_rating: enjoymentRating > 0 ? enjoymentRating : null,
        notes: notes,
        file_urls: finalFileUrls,
        include_in_portfolio: true // Ensure it gets included when they leave a rating/note
      };

      // 2. Foolproof Check: See if a row already exists (e.g. from the checkbox toggle)
      const { data: currentRecord } = await (supabase as any)
        .from("portfolio_artifacts")
        .select("id")
        .eq("student_id", studentId)
        .eq("lesson_plan_id", lessonPlanId)
        .eq("standard_text", standardText)
        .maybeSingle();

      let dbError;

      // 3. Update if exists, Insert if new (Bypasses all constraint errors)
      if (currentRecord) {
        const { error } = await (supabase as any)
          .from("portfolio_artifacts")
          .update(payload)
          .eq("id", currentRecord.id);
        dbError = error;
      } else {
        const { error } = await (supabase as any)
          .from("portfolio_artifacts")
          .insert(payload);
        dbError = error;
      }

      if (dbError) throw dbError;

      // 4. Update UI State
      setExistingFiles(finalFileUrls);
      setPendingFiles([]);
      setSuccessMessage("Changes saved successfully!");
      toast.success("Evidence saved successfully!");
      
      // Hide success banner after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save evidence.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 print:hidden space-y-4">
      
      {successMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center text-teal-700 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" /> {successMessage}
        </div>
      )}

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
            Current: {enjoymentRating > 0 ? `${enjoymentRating}/5` : "Not rated"}
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
            Current: {masteryRating > 0 ? `${masteryRating}/5` : "Not rated"}
          </span>
        </div>
      </div>

      <Textarea 
        placeholder="Educator Notes (e.g., Learner grasped this concept quickly...)" 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full mb-4 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-teal-500 resize-none h-20"
      />

      {/* File Roster */}
      {(existingFiles.length > 0 || pendingFiles.length > 0) && (
        <div className="mb-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Attached Files</span>
          <div className="flex flex-wrap gap-2">
            {existingFiles.map((url, i) => {
               let fileName = url.split('/').pop()?.split('?')[0] || `File ${i + 1}`;
               fileName = fileName.replace(/^[0-9a-z]+_/, ''); 
               return (
                 <div key={`existing-${i}`} className="flex items-center text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200" title={fileName}>
                   <ImageIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> 
                   <span className="truncate max-w-[180px] font-medium">{fileName}</span>
                 </div>
               );
            })}
            {pendingFiles.map((file, i) => (
               <div key={`pending-${i}`} className="flex items-center text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200" title={file.name}>
                 <Upload className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> 
                 <span className="truncate max-w-[180px] font-bold">{file.name}</span>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <input 
          type="file" 
          multiple 
          accept="image/*, application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => {
            if(e.target.files && e.target.files.length > 0) {
              setPendingFiles(Array.from(e.target.files));
            }
          }} 
        />
        
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
          variant="outline" 
          className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-bold rounded-xl"
        >
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {existingFiles.length > 0 || pendingFiles.length > 0 ? "Select More Files" : "Attach Files"}
        </Button>

        <Button 
          onClick={() => handleSave()} 
          disabled={isUploading}
          className="flex-1 bg-teal-600/90 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
        >
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Save Updates
        </Button>
      </div>
    </div>
  );
}