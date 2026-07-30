"use client";

import { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Star, Heart, CheckCircle2, Image as ImageIcon, X, FileText } from "lucide-react";

const EvidenceUploader = forwardRef(({ 
  studentId, 
  lessonPlanId, 
  standardText, 
  existingArtifact = null 
}: any, ref) => {
  const [masteryRating, setMasteryRating] = useState<number>(0);
  const [enjoymentRating, setEnjoymentRating] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [includeInPortfolio, setIncludeInPortfolio] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [originalData, setOriginalData] = useState({ 
    rating: 0, 
    enjoyment_rating: 0, 
    notes: "",
    include_in_portfolio: false,
    is_skipped: false,
    file_urls: [] as string[]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  useEffect(() => {
    if (existingArtifact) {
      const initialFiles = existingArtifact.file_urls || (existingArtifact.image_url ? [existingArtifact.image_url] : []);
      setMasteryRating(existingArtifact.rating || 0);
      setEnjoymentRating(existingArtifact.enjoyment_rating || 0);
      setNotes(existingArtifact.notes || "");
      setIncludeInPortfolio(existingArtifact.include_in_portfolio || false);
      setIsSkipped(existingArtifact.is_skipped || false);
      setExistingFiles(initialFiles);
      
      setOriginalData({
        rating: existingArtifact.rating || 0,
        enjoyment_rating: existingArtifact.enjoyment_rating || 0,
        notes: existingArtifact.notes || "",
        include_in_portfolio: existingArtifact.include_in_portfolio || false,
        is_skipped: existingArtifact.is_skipped || false,
        file_urls: initialFiles
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
          const initialFiles = data.file_urls || (data.image_url ? [data.image_url] : []);
          setMasteryRating(data.rating || 0);
          setEnjoymentRating(data.enjoyment_rating || 0);
          setNotes(data.notes || "");
          setIncludeInPortfolio(data.include_in_portfolio || false);
          setIsSkipped(data.is_skipped || false);
          setExistingFiles(initialFiles);

          setOriginalData({
            rating: data.rating || 0,
            enjoyment_rating: data.enjoyment_rating || 0,
            notes: data.notes || "",
            include_in_portfolio: data.include_in_portfolio || false,
            is_skipped: data.is_skipped || false,
            file_urls: initialFiles
          });
        }
      };
      fetchExistingData();
    }
  }, [studentId, lessonPlanId, standardText, existingArtifact, supabase]);

  const hasChanges = 
    masteryRating !== originalData.rating ||
    enjoymentRating !== originalData.enjoyment_rating ||
    notes.trim() !== originalData.notes.trim() ||
    includeInPortfolio !== originalData.include_in_portfolio ||
    isSkipped !== originalData.is_skipped ||
    pendingFiles.length > 0 ||
    existingFiles.length !== originalData.file_urls.length;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const MAX_SIZE = 5 * 1024 * 1024; 

    files.forEach(file => {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" failed to load. File exceeds the 5MB limit.`);
      } else if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error(`"${file.name}" failed to load. Only Images and PDFs are supported.`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...validFiles]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePreview = (urlOrFile: string | File) => {
    if (typeof urlOrFile === 'string') {
      setPreviewUrl(urlOrFile);
    } else {
      setPreviewUrl(URL.createObjectURL(urlOrFile));
    }
  };

  const handleSave = async () => {
    if (!studentId) return;
    if (!hasChanges) return; 

    let newUploadedUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to save evidence.");

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

      let query = (supabase as any)
        .from("portfolio_artifacts")
        .select("id, feedback_history, notes, rating, created_at")
        .eq("student_id", studentId)
        .eq("standard_text", standardText);
        
      if (lessonPlanId) query = query.eq("lesson_plan_id", lessonPlanId);
      else query = query.is("lesson_plan_id", null);

      const { data: currentRecord } = await query.maybeSingle();

      let finalHistory = [];
      const textOrRatingChanged = masteryRating !== originalData.rating || notes.trim() !== originalData.notes.trim();

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
        is_skipped: isSkipped,
        feedback_history: finalHistory,
        updated_at: new Date().toISOString()
      };

      let dbError;

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
        include_in_portfolio: includeInPortfolio,
        is_skipped: isSkipped,
        file_urls: finalFileUrls
      });
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save evidence.");
    }
  };

  const safeId = `toggle-${standardText.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 print:hidden space-y-4">
      
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 print:hidden" onClick={() => setPreviewUrl(null)}>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">File Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4">
               {previewUrl.includes('.pdf') || previewUrl.startsWith('blob:') ? (
                 <iframe src={previewUrl} className="w-full h-[70vh] rounded-lg shadow-sm border border-slate-200 bg-white" />
               ) : (
                 <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm" />
               )}
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO & SKIPPED TOGGLES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-slate-100/70 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id={safeId}
            checked={includeInPortfolio}
            onChange={(e) => setIncludeInPortfolio(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
          <label htmlFor={safeId} className="text-sm font-black text-slate-700 cursor-pointer select-none">
            Include in State Portfolio
          </label>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <input 
            type="checkbox" 
            id={`${safeId}-skip`}
            checked={isSkipped}
            onChange={(e) => setIsSkipped(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor={`${safeId}-skip`} className="text-sm font-black text-amber-700 cursor-pointer select-none">
            Didn't Attempt (Skip Assessment)
          </label>
        </div>
      </div>

      {/* ASSESSMENT AREA (Fades out if element was skipped) */}
      <div className={`space-y-4 transition-opacity duration-200 ${isSkipped ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
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
          </div>
        </div>

        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-4 mb-3">
            <input 
              type="file" 
              multiple 
              accept="image/*, application/pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              size="sm"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-bold rounded-lg h-8"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Attach Files
            </Button>
            <span className="text-xs font-black text-slate-800 uppercase">Educator Notes</span>
          </div>
          
          <Textarea 
            placeholder="Learner grasped this concept quickly..." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border-slate-200 rounded-lg focus-visible:ring-teal-500 resize-none h-20 shadow-sm"
          />
        </div>

        {(existingFiles.length > 0 || pendingFiles.length > 0) && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {existingFiles.map((url, i) => {
                 let fileName = url.split('/').pop()?.split('?')[0] || `File ${i + 1}`;
                 fileName = fileName.replace(/^[0-9a-z]+_/, ''); 
                 const isPdf = url.includes('.pdf');
                 return (
                   <div key={`existing-${i}`} className="flex items-center text-xs bg-slate-100 text-slate-700 pl-3 pr-1 py-1 rounded-lg border border-slate-200 group">
                     <div className="flex items-center cursor-pointer hover:text-teal-600 mr-2" onClick={() => handlePreview(url)} title="Click to view file">
                       {isPdf ? <FileText className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> : <ImageIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />}
                       <span className="truncate max-w-[150px] font-medium">{fileName}</span>
                     </div>
                     <button onClick={() => setExistingFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors" title="Delete file">
                       <X className="w-3 h-3" />
                     </button>
                   </div>
                 );
              })}
              {pendingFiles.map((file, i) => (
                 <div key={`pending-${i}`} className="flex items-center text-xs bg-teal-50 text-teal-800 pl-3 pr-1 py-1 rounded-lg border border-teal-200 group">
                   <div className="flex items-center cursor-pointer hover:text-teal-900 mr-2" onClick={() => handlePreview(file)} title="Click to view file">
                     {file.type === 'application/pdf' ? <FileText className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> : <ImageIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />}
                     <span className="truncate max-w-[150px] font-bold">{file.name}</span>
                   </div>
                   <button onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-teal-100 text-teal-600 hover:text-red-500 transition-colors" title="Remove pending file">
                     <X className="w-3 h-3" />
                   </button>
                 </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {includeInPortfolio && (
        <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center">
          <p className="text-sm font-bold text-teal-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            This element is saved to the state portfolio.
          </p>
        </div>
      )}
    </div>
  );
});

EvidenceUploader.displayName = "EvidenceUploader";
export default EvidenceUploader;