"use client";

import React, { useState } from "react";
import { X, Star, Sparkles, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  studentId: string;
  userId: string;
  recommendations: Array<{ title: string; category: string }>;
  onFeedbackSubmitted: (sparksAwarded: number) => void;
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
  const [reviews, setReviews] = useState<Record<string, { wasUsed: boolean; rating: number; notes: string }>>(
    recommendations.reduce((acc, rec) => ({
      ...acc,
      [rec.title]: { wasUsed: false, rating: 5, notes: "" }
    }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggleUsed = (title: string) => {
    setReviews(prev => ({
      ...prev,
      [title]: { ...prev[title], wasUsed: !prev[title].wasUsed }
    }));
  };

  const handleRatingChange = (title: string, value: number) => {
    setReviews(prev => ({
      ...prev,
      [title]: { ...prev[title], rating: value }
    }));
  };

  const handleNotesChange = (title: string, value: string) => {
    setReviews(prev => ({
      ...prev,
      [title]: { ...prev[title], notes: value }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedItems = Object.entries(reviews).map(([title, data]) => ({
        title,
        category: recommendations.find(r => r.title === title)?.category || "General",
        wasUsed: data.wasUsed,
        rating: data.wasUsed ? data.rating : null,
        notes: data.notes
      }));

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          studentId,
          scheduleId,
          feedbackItems: formattedItems,
        }),
      });

      if (!res.ok) throw new Error("Failed to save reviews");
      
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => {
        onFeedbackSubmitted(data.sparksAwarded);
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-6 rounded-xl shadow-2xl">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Review Submitted!</DialogTitle>
            <p className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              +10 Free Sparks deposited into your vault!
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  ✨ Weekly Review & Reward
                </DialogTitle>
              </div>
              <DialogDescription className="text-slate-500 mt-1">
                Tell us what worked! Earn <strong className="text-amber-600">10 Free Sparks</strong> and tune your engine to prevent duplicate recommendations.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6 divide-y divide-slate-100">
              {recommendations.map((rec, i) => {
                const current = reviews[rec.title];
                return (
                  <div key={i} className={`pt-4 first:pt-0 flex flex-col space-y-3 transition-opacity ${!current?.wasUsed ? 'opacity-70' : 'opacity-100'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600 mb-1 inline-block">
                          {rec.category}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base">{rec.title}</h4>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg select-none hover:bg-slate-100 transition">
                        <input
                          type="checkbox"
                          checked={current?.wasUsed || false}
                          onChange={() => handleToggleUsed(rec.title)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-slate-700">We Tried This</span>
                      </label>
                    </div>

                    {current?.wasUsed && (
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(rec.title, star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    star <= current.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          placeholder="Tell us what they liked or hated (e.g., 'Too fast-paced' or 'Loved the visual logic puzzle format')"
                          value={current.notes}
                          onChange={(e) => handleNotesChange(rec.title, e.target.value)}
                          className="bg-white border-slate-200 text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-slate-600 hover:bg-slate-50">
                Skip
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md shadow-emerald-100"
              >
                {isSubmitting ? "Saving..." : "Submit Review & Claim Sparks 🪙"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}