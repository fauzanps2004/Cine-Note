
import React, { useState, useRef } from 'react';
import { Trash2, Star, Quote, ImageOff, Share2, Check, ChevronDown, ChevronUp, Loader2, Pencil, ScanBarcode } from 'lucide-react';
import { Review, Language } from '../types';
import { STICKY_COLORS, STICKY_ROTATIONS, TRANSLATIONS } from '../constants';
import html2canvas from 'html2canvas';

interface StickyNoteProps {
  review: Review;
  onDelete: (id: string) => void;
  onEdit: (review: Review) => void;
  index: number;
  language: Language;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ review, onDelete, onEdit, index, language }) => {
  const rotation = STICKY_ROTATIONS[index % STICKY_ROTATIONS.length];
  const colorClasses = STICKY_COLORS[review.colorVariant];
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const noteRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  const MAX_LENGTH = 120; // Slightly shorter for ticket format
  const hasContent = review.content && review.content.trim().length > 0;
  const shouldTruncate = hasContent && review.content.length > MAX_LENGTH;

  const displayContent = hasContent 
    ? (shouldTruncate && !isExpanded 
        ? `${review.content.slice(0, MAX_LENGTH).trim()}...` 
        : review.content)
    : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(review.id);
    }, 300);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(review);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;

    setIsSharing(true);
    
    const stars = '★'.repeat(review.userRating) + '☆'.repeat(5 - review.userRating);
    const shareText = hasContent 
        ? `🎬 ${review.movieDetails.title} (${review.movieDetails.year})\n${stars}\n\n"${review.content}"\n\n— ${t.share_via}`
        : `🎬 ${review.movieDetails.title} (${review.movieDetails.year})\n${stars}\n\n${t.just_watched_watermark}`;

    try {
      if (noteRef.current) {
        const canvas = await html2canvas(noteRef.current, {
          useCORS: true,
          scale: 2,
          backgroundColor: null,
          logging: false,
        });

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `ticket-${review.movieDetails.title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Ticket: ${review.movieDetails.title}`,
                text: shareText,
              });
              setJustShared(true);
            } else {
              const link = document.createElement('a');
              link.download = `ticket-${review.movieDetails.title}.png`;
              link.href = canvas.toDataURL();
              link.click();
              setJustShared(true);
            }
          }
          setIsSharing(false);
          setTimeout(() => setJustShared(false), 2000);
        }, 'image/png');
      }
    } catch (err) {
      console.warn('Image share failed', err);
      setIsSharing(false);
    }
  };

  return (
    <div 
      ref={noteRef}
      className={`
        group relative flex flex-col w-full 
        ${colorClasses} 
        ${isDeleting ? 'opacity-0 scale-75 pointer-events-none translate-y-8' : `${rotation} hover:rotate-0 hover:scale-[1.02] hover:-translate-y-2 hover:z-20`}
        shadow-md hover:shadow-2xl hover:shadow-black/10
        transition-all duration-300 ease-out cursor-default
        border border-black/5 dark:border-white/5
        font-sans overflow-hidden rounded-xl h-[400px]
      `}
    >
      {/* TICKET BODY (Top 70%) */}
      <div className="flex-1 p-5 pb-2 flex flex-col relative">
        
        {/* Header Info */}
        <div className="flex gap-4 mb-4">
           {/* Poster Thumbnail */}
          <div className="shrink-0 w-16 h-24 bg-slate-200 dark:bg-slate-800 rounded-md shadow-sm overflow-hidden relative border border-black/10">
            {!imgError && review.movieDetails.posterUrl ? (
              <img 
                src={review.movieDetails.posterUrl} 
                alt={review.movieDetails.title} 
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageOff size={16} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-black text-lg leading-none text-slate-800 dark:text-slate-100 line-clamp-2 uppercase tracking-tight mb-1">
              {review.movieDetails.title}
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              {review.movieDetails.year}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  strokeWidth={2}
                  className={`${i < review.userRating ? "fill-slate-800 text-slate-800 dark:fill-white dark:text-white" : "text-slate-300 dark:text-slate-600"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative border-t-2 border-dotted border-black/10 dark:border-white/10 pt-3">
             <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
                {hasContent ? (
                    <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed font-hand whitespace-pre-wrap">
                    {displayContent}
                    </p>
                ) : (
                    <div className="h-full flex items-center justify-center opacity-30">
                        <span className="text-xl font-bold font-hand -rotate-12 text-slate-800 dark:text-slate-200 border-2 border-slate-800 dark:border-slate-200 px-3 py-1 rounded-lg">
                        {t.just_watched_watermark}
                        </span>
                    </div>
                )}
             </div>

            {shouldTruncate && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="absolute bottom-0 right-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                    {isExpanded ? <>{t.close} <ChevronUp size={10} /></> : <>{t.read_more} <ChevronDown size={10} /></>}
                </button>
            )}
        </div>
      </div>

      {/* PERFORATION LINE / DIVIDER */}
      <div className="relative h-6 flex items-center w-full">
         {/* Left Notch */}
         <div className="absolute left-[-10px] w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 z-10" />
         {/* Dotted Line */}
         <div className="w-full border-b-2 border-dashed border-slate-300 dark:border-slate-600/50 h-px mx-2 opacity-50" />
         {/* Right Notch */}
         <div className="absolute right-[-10px] w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 z-10" />
      </div>

      {/* TICKET STUB (Bottom 30%) */}
      <div className="h-24 px-5 pb-4 pt-1 flex justify-between items-center relative bg-black/5 dark:bg-black/20">
         
         {/* Left: Barcode Aesthetic */}
         <div className="flex flex-col justify-center opacity-40">
            <ScanBarcode size={32} className="text-slate-800 dark:text-slate-200" />
            <span className="text-[8px] font-mono mt-1 tracking-[0.2em] text-slate-600 dark:text-slate-400">
               {review.id.toUpperCase().substring(0, 8)}
            </span>
         </div>

         {/* Center: Date */}
         <div className="flex flex-col items-center">
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                 {t.watched_label}
             </span>
             <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
                {new Date(review.createdAt).toLocaleDateString(undefined, { year: '2-digit', month: 'numeric', day: 'numeric' })}
             </span>
         </div>

         {/* Right: Actions */}
         <div className="flex gap-1" data-html2canvas-ignore>
            <button onClick={handleEdit} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title="Edit">
                <Pencil size={14} />
            </button>
            <button onClick={handleShare} disabled={isSharing} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title={t.share_tooltip}>
                {isSharing ? <Loader2 size={14} className="animate-spin" /> : justShared ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            </button>
            <button onClick={handleDelete} className="p-2 text-slate-500 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title={t.delete_tooltip}>
                <Trash2 size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};
