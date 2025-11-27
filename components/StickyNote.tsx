
import React, { useState, useRef } from 'react';
import { Trash2, Star, Quote, ImageOff, Share2, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Review, Language } from '../types';
import { STICKY_COLORS, STICKY_ROTATIONS, TRANSLATIONS } from '../constants';
import html2canvas from 'html2canvas';

interface StickyNoteProps {
  review: Review;
  onDelete: (id: string) => void;
  index: number;
  language: Language;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ review, onDelete, index, language }) => {
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
    // Trigger animation immediately without blocking confirm dialog
    setIsDeleting(true);
    
    // Wait for animation (300ms) to complete before removing from data
    setTimeout(() => {
      onDelete(review.id);
    }, 300);
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
      // Try to capture image
      if (noteRef.current) {
        const canvas = await html2canvas(noteRef.current, {
          useCORS: true, // Attempt to load cross-origin images (posters)
          scale: 2, // Higher resolution for retina displays
          backgroundColor: null, // Transparent background
          logging: false,
        });

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `cinenote-${review.movieDetails.title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
            
            // Check if the browser supports sharing files
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Review: ${review.movieDetails.title}`,
                text: shareText,
              });
              setJustShared(true);
            } else {
              // Fallback: Download the image
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
      // Fallback to text sharing
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
        shadow-lg hover:shadow-2xl
        transition-all duration-300 ease-out cursor-default
        border-t-8 font-sans overflow-hidden
      `}
    >
      {/* Tape effect at top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/30 backdrop-blur-sm shadow-sm rotate-1 z-20"></div>

      {/* Header: Poster & Info */}
      <div className="flex gap-3 mb-4 pb-3 border-b border-black/5">
        {/* Poster Thumbnail */}
        <div className="shrink-0 w-20 h-28 bg-slate-200 dark:bg-slate-800 rounded shadow-sm overflow-hidden relative">
          {!imgError && review.movieDetails.posterUrl ? (
            <img 
              src={review.movieDetails.posterUrl} 
              alt={review.movieDetails.title} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              // Note: standard img tag doesn't use crossorigin here to avoid UI breakage if CORS fails,
              // html2canvas will attempt to fetch it with CORS enabled internally via useCORS option.
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ImageOff size={16} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col py-0.5">
          <div>
             <h3 className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100 line-clamp-2 font-hand tracking-wide">
              {review.movieDetails.title}
            </h3>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 block mt-1 opacity-70">
              {review.movieDetails.year}
            </span>
          </div>
          
          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1 mt-2 mb-auto">
             {review.movieDetails.genre.slice(0, 2).map(g => (
               <span key={g} className="text-[10px] px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300 border border-black/5">
                 {g}
               </span>
             ))}
          </div>

          {/* 3D Sticker Style Stars */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  strokeWidth={2.5}
                  className={`
                    transition-all duration-300
                    ${i < review.userRating 
                      ? "fill-yellow-400 text-orange-700 drop-shadow-[0_1.5px_0_rgba(194,65,12,0.4)]" 
                      : "text-slate-300 dark:text-slate-600/50 fill-transparent"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body: Review Content */}
      <div className="flex-1 min-h-0 relative group-inner px-1 flex flex-col">
         {hasContent && (
            <Quote className="absolute top-0 right-0 text-black/5 dark:text-white/5 w-12 h-12 rotate-12 pointer-events-none" />
         )}
        
        <div className={`flex-1 overflow-y-auto scrollbar-thin pr-2 ${!hasContent ? 'flex items-center justify-center' : ''}`}>
          {hasContent ? (
            <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-hand whitespace-pre-wrap">
              {displayContent}
            </p>
          ) : (
             <div className="text-center opacity-40 select-none">
                <span className="text-3xl font-hand -rotate-6 block text-slate-800 dark:text-slate-200">{t.just_watched_watermark}</span>
             </div>
          )}
        </div>

        {shouldTruncate && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 uppercase tracking-wider self-start transition-colors"
            data-html2canvas-ignore // Ignore read more button in screenshot
          >
            {isExpanded ? (
              <>{t.close} <ChevronUp size={12} /></>
            ) : (
              <>{t.read_more} <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {/* Footer: Ticket Stub & Actions */}
      <div className="mt-3 pt-2 flex justify-between items-end shrink-0">
        
        {/* Ticket Stub Date Design */}
        <div className="flex flex-col items-center bg-black/5 dark:bg-black/20 px-3 py-1.5 border-l-2 border-r-2 border-dashed border-black/20 dark:border-white/10 rounded-sm relative overflow-hidden min-w-[80px]">
           {/* Ticket Top Line */}
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-black/5"></div>
           
           <span className="text-[8px] font-black text-slate-500/60 dark:text-slate-400/60 uppercase tracking-[0.2em] mb-0.5">
             {t.watched_label}
           </span>
           <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 tracking-tighter">
             {new Date(review.createdAt).toLocaleDateString(undefined, { year: '2-digit', month: 'short', day: 'numeric' }).toUpperCase()}
           </span>

           {/* Ticket Bottom Line */}
           <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/5"></div>
        </div>
        
        <div 
          className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 mb-1"
          data-html2canvas-ignore // Don't include action buttons in the screenshot
        >
          <button 
            onClick={handleShare}
            className={`p-1.5 rounded-full transition-all duration-200 ${justShared ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/30'}`}
            title={t.share_tooltip}
            disabled={isSharing}
          >
            {isSharing ? (
              <Loader2 size={16} className="animate-spin text-brand-500" />
            ) : justShared ? (
              <Check size={16} />
            ) : (
              <Share2 size={16} />
            )}
          </button>

          <button 
            onClick={handleDelete}
            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            title={t.delete_tooltip}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
