"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, CheckCircle2, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";

interface PortfolioUploaderProps {
  studentId: string;
  lessonPlanId?: string; // Optional if they are just on the dashboard
  standardText: string;
}

export default function PortfolioUploader({ studentId, lessonPlanId, standardText }: PortfolioUploaderProps) {
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // If it's an image, compress it. If it's a PDF, leave it alone.
    if (selectedFile.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 1, // Compress down to max 1MB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(selectedFile, options);
        setFile(compressedFile);
      } catch (error) {
        toast.error("Failed to compress image.");
      }
    } else if (selectedFile.type === "application/pdf") {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("PDFs must be under 5MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!studentId) {
      toast.error("Please select a student first.");
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      let publicUrl = null;

      // 1. Upload file if it exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${studentId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("portfolio_images")
          .upload(fileName, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("portfolio_images")
          .getPublicUrl(fileName);
          
        publicUrl = publicUrlData.publicUrl;
      }

      // 2. Save the database record
      const { error: dbError } = await supabase
        .from("portfolio_artifacts")
        .insert({
          parent_id: user.id,
          student_id: studentId,
          lesson_plan_id: lessonPlanId || null,
          standard_text: standardText,
          rating: rating > 0 ? rating : null,
          notes: notes,
          image_url: publicUrl,
        });

      if (dbError) throw dbError;

      setIsSuccess(true);
      toast.success("Saved to portfolio!");
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to save to portfolio.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-center gap-2 text-teal-700 font-bold print:hidden">
        <CheckCircle2 className="w-5 h-5" /> Added to State Portfolio
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 print:hidden">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-slate-500 mr-2">Rate Mastery:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
              <Star className={`w-6 h-6 ${rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
            </button>
          ))}
        </div>

        {/* File Upload Button */}
        <div>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp, application/pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className={`border-dashed border-2 ${file ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-300 text-slate-600'}`}
          >
            {file ? (
              <><CheckCircle2 className="w-4 h-4 mr-2"/> {file.type.includes('pdf') ? 'PDF Attached' : 'Photo Attached'}</>
            ) : (
              <><Upload className="w-4 h-4 mr-2"/> Attach Evidence</>
            )}
          </Button>
        </div>
      </div>

      {/* Notes & Submit */}
      <div className="flex gap-2">
        <Textarea 
          placeholder="Parent observations or notes for the state report..." 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[40px] h-10 resize-none text-sm"
        />
        <Button 
          onClick={handleSave} 
          disabled={isUploading || (!file && rating === 0 && notes.length === 0)}
          className="bg-slate-800 text-white shrink-0 h-10"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}
