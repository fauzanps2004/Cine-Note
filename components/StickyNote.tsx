
import React, { useState, useRef } from 'react';
import { Trash2, Star, Quote, ImageOff, Share2, Check, ChevronDown, ChevronUp, Loader2, Pencil } from 'lucide-react';
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

  const MAX_LENGTH = 150;
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
    
    // Construct fallback text
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
            const file = new File([blob], `cinenote-${review.movieDetails.title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Review: ${review.movieDetails.title}`,
                text: shareText,
              });
              setJustShared(true);
            } else {
              const link = document.createElement('a');
              link.download = `review-${review.movieDetails.title}.png`;
              link.href = canvas.toDataURL();
              link.click();
              setJustShared(true);
            }
          } else {
            throw new Error('Canvas blob generation failed');
          }
          setIsSharing(false);
          setTimeout(() => setJustShared(false), 2000);
        }, 'image/png');
      }
    } catch (err) {
      console.warn('Image generation failed, falling back to text share:', err);
      try {
        if (navigator.share) {
          await navigator.share({
            title: `Review: ${review.movieDetails.title}`,
            text: shareText,
          });
        } else {
          await navigator.clipboard.writeText(shareText);
        }
        setJustShared(true);
      } catch (shareErr) {
        console.error('Share failed:', shareErr);
      }
      setIsSharing(false);
      setTimeout(() => setJustShared(false), 2000);
    }
  };

  return (
    <div 
      ref={noteRef}
      className={`
        group relative flex flex-col p-5 h-96 w-full 
        ${colorClasses} 
        ${isDeleting ? 'opacity-0 scale-75 pointer-events-none translate-y-8' : `${rotation} hover:rotate-0 hover:scale-[1.02] hover:-translate-y-2 hover:z-20`}
        shadow-lg hover:shadow-2xl hover:shadow-black/10
        transition-all duration-300 ease-out cursor-default
        border border-black/5 dark:border-white/5
        font-sans overflow-hidden rounded-sm
      `}
    >
      {/* Refined Tape Effect - Less jarring */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/40 shadow-sm rotate-1 z-20 backdrop-blur-[1px] opacity-80"></div>

      {/* Header: Poster & Info */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-black/5">
        <div className="shrink-0 w-20 aspect-[2/3] bg-slate-200 dark:bg-slate-800 rounded-sm shadow-sm overflow-hidden relative">
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

        <div className="flex-1 min-w-0 flex flex-col pt-1">
          <div>
             <h3 className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100 line-clamp-2 tracking-tight">
              {review.movieDetails.title}
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mt-1">
              {review.movieDetails.year}
            </span>
          </div>
          
          <div className="mt-auto">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  strokeWidth={2}
                  className={`
                    transition-all duration-300
                    ${i < review.userRating 
                      ? "fill-amber-400 text-amber-500 drop-shadow-[0_1px_0_rgba(180,83,9,0.2)]" 
                      : "text-slate-400/30 fill-transparent"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body: Review Content */}
      <div className="flex-1 min-h-0 relative px-1 flex flex-col">
        {/* Quote Icon watermark */}
         {hasContent && (
            <Quote className="absolute -top-2 -right-2 text-black/5 dark:text-white/5 w-16 h-16 pointer-events-none" />
         )}
        
        <div className={`flex-1 overflow-y-auto scrollbar-thin pr-2 ${!hasContent ? 'flex items-center justify-center' : ''}`}>
          {hasContent ? (
            <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-hand whitespace-pre-wrap">
              {displayContent}
            </p>
          ) : (
             <div className="text-center opacity-40 select-none">
                <span className="text-2xl font-bold font-hand -rotate-6 block text-slate-800 dark:text-slate-200 border-2 border-slate-800 dark:border-slate-200 px-4 py-2 rounded-lg opacity-50">
                  {t.just_watched_watermark}
                </span>
             </div>
          )}
        </div>

        {shouldTruncate && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="mt-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 uppercase tracking-widest self-start transition-colors"
            data-html2canvas-ignore
          >
            {isExpanded ? (
              <>{t.close} <ChevronUp size={10} /></>
            ) : (
              <>{t.read_more} <ChevronDown size={10} /></>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 flex justify-between items-center shrink-0 border-t border-black/5">
        
        <div className="flex flex-col">
           <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
             {t.watched_label}
           </span>
           <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
             {new Date(review.createdAt).toLocaleDateString(undefined, { year: '2-digit', month: 'short', day: 'numeric' })}
           </span>
        </div>
        
        <div 
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          data-html2canvas-ignore
        >
          <button
             onClick={handleEdit}
             className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-black/5 rounded-full transition-colors"
             title="Edit"
          >
             <Pencil size={14} />
          </button>

          <button 
            onClick={handleShare}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${justShared ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-black/5'}`}
            title={t.share_tooltip}
            disabled={isSharing}
          >
            {isSharing ? <Loader2 size={14} className="animate-spin" /> : justShared ? <Check size={14} /> : <Share2 size={14} />}
          </button>

          <button 
            onClick={handleDelete}
            className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title={t.delete_tooltip}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
