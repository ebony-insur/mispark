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
  const [includeInPortfolio, setIncludeInPortfolio] = useState(false);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [originalData, setOriginalData] = useState({ 
    rating: 0, 
    enjoyment_rating: 0, 
    notes: "",
    include_in_portfolio: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (existingArtifact) {
      setMasteryRating(existingArtifact.rating || 0);
      setEnjoymentRating(existingArtifact.enjoyment_rating || 0);
      setNotes(existingArtifact.notes || "");
      setIncludeInPortfolio(existingArtifact.include_in_portfolio || false);
      setExistingFiles(existingArtifact.file_urls || (existingArtifact.image_url ? [existingArtifact.image_url] : []));
      
      setOriginalData({
        rating: existingArtifact.rating || 0,
        enjoyment_rating: existingArtifact.enjoyment_rating || 0,
        notes: existingArtifact.notes || "",
        include_in_portfolio: existingArtifact.include_in_portfolio || false
      });
    } else {
      const fetchExistingData = async () => {
        if (!studentId || !standardText) return;
        
        let query = (supabase as any)
          .from("portfolio_artifacts")
          .select("*")
          .eq("student_id", studentId)
          .eq("standard_text", standardText);
          
        if (lessonPlanId) query = query.eq("lesson_plan_id", lessonPlanId);
        else query = query.is("lesson_plan_id", null);

        const { data } = await query.maybeSingle(); 
        
        if (data) {
          setMasteryRating(data.rating || 0);
          setEnjoymentRating(data.enjoyment_rating || 0);
          setNotes(data.notes || "");
          setIncludeInPortfolio(data.include_in_portfolio || false);
          setExistingFiles(data.file_urls || (data.image_url ? [data.image_url] : []));

          setOriginalData({
            rating: data.rating || 0,
            enjoyment_rating: data.enjoyment_rating || 0,
            notes: data.notes || "",
            include_in_portfolio: data.include_in_portfolio || false
          });
        }
      };
      fetchExistingData();
    }
  }, [studentId, lessonPlanId, standardText, existingArtifact, supabase]);

  const handleSave = async () => {
    if (!studentId) {
      toast.error("Missing learner ID.");
      return;
    }

    const currentNotes = notes.trim();
    const originalNotes = originalData.notes.trim();

    const hasChanges = 
      masteryRating !== originalData.rating ||
      enjoymentRating !== originalData.enjoyment_rating ||
      currentNotes !== originalNotes ||
      includeInPortfolio !== originalData.include_in_portfolio ||
      pendingFiles.length > 0;

    if (!hasChanges) {
      toast.info("No changes to save.");
      return; 
    }

    setIsUploading(true);
    let newUploadedUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to save evidence.");

      // 1. Upload new files if any
      if (pendingFiles.length > 0) {
        const uploadPromises = pendingFiles.map(async (file) => {
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

      // 2. Query the single table to see if record exists
      let query = (supabase as any)
        .from("portfolio_artifacts")
        .select("id, feedback_history, notes, rating, created_at")
        .eq("student_id", studentId)
        .eq("standard_text", standardText);
        
      if (lessonPlanId) query = query.eq("lesson_plan_id", lessonPlanId);
      else query = query.is("lesson_plan_id", null);

      const { data: currentRecord } = await query.maybeSingle();

      // 3. Build feedback_history JSON array inside portfolio_artifacts
      let finalHistory = [];
      const textOrRatingChanged = masteryRating !== originalData.rating || currentNotes !== originalNotes;

      if (currentRecord) {
        let previousHistory = currentRecord.feedback_history || [];
        
        if (textOrRatingChanged) {
          if (previousHistory.length === 0 && (currentRecord.notes || currentRecord.rating)) {
            previousHistory.push({
              date: currentRecord.created_at || new Date().toISOString(),
              note: currentRecord.notes,
              rating: currentRecord.rating
            });
          }
          finalHistory = [
            ...previousHistory, 
            { 
              date: new Date().toISOString(), 
              note: notes, 
              rating: masteryRating > 0 ? masteryRating : null 
            }
          ];
        } else {
          finalHistory = previousHistory; 
        }
      } else {
        finalHistory = [{ 
          date: new Date().toISOString(), 
          note: notes, 
          rating: masteryRating > 0 ? masteryRating : null 
        }];
      }

      // Payload strictly matches existing columns (removed updated_at)
      const payload = {
        parent_id: user.id,
        student_id: studentId,
        lesson_plan_id: lessonPlanId || null,
        standard_text: standardText,
        rating: masteryRating > 0 ? masteryRating : null,
        enjoyment_rating: enjoymentRating > 0 ? enjoymentRating : null,
        notes: notes,
        file_urls: finalFileUrls,
        include_in_portfolio: includeInPortfolio,
        feedback_history: finalHistory,
        updated_at: new Date().toISOString()
      };

      let dbError;

      // 4. Update or Insert strictly on portfolio_artifacts
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

      setExistingFiles(finalFileUrls);
      setPendingFiles([]);
      
      setOriginalData({
        rating: masteryRating,
        enjoyment_rating: enjoymentRating,
        notes: notes,
        include_in_portfolio: includeInPortfolio
      });

      setSuccessMessage("Changes saved successfully!");
      toast.success("Evidence saved successfully!");
      
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

      <div 
        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${includeInPortfolio ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
        onClick={() => setIncludeInPortfolio(!includeInPortfolio)}
      >
        <input 
          type="checkbox" 
          checked={includeInPortfolio}
          readOnly
          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 pointer-events-none"
        />
        <div>
          <p className={`text-sm font-bold ${includeInPortfolio ? 'text-teal-900' : 'text-slate-700'}`}>Include in State Portfolio</p>
          <p className={`text-[10px] font-medium leading-tight ${includeInPortfolio ? 'text-teal-700' : 'text-slate-500'}`}>
            Display this assessment and its evidence on compliance reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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