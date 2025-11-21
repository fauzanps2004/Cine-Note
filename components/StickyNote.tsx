import React, { useState, useRef } from 'react';
import { Trash2, Star, Quote, ImageOff, Share2, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Review } from '../types';
import { STICKY_COLORS, STICKY_ROTATIONS } from '../constants';
import html2canvas from 'html2canvas';

interface StickyNoteProps {
  review: Review;
  onDelete: (id: string) => void;
  index: number;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ review, onDelete, index }) => {
  const rotation = STICKY_ROTATIONS[index % STICKY_ROTATIONS.length];
  const colorClasses = STICKY_COLORS[review.colorVariant];
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const noteRef = useRef<HTMLDivElement>(null);

  const MAX_LENGTH = 150;
  const shouldTruncate = review.content.length > MAX_LENGTH;

  const displayContent = shouldTruncate && !isExpanded 
    ? `${review.content.slice(0, MAX_LENGTH).trim()}...` 
    : review.content;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this review? It will be lost like tears in rain.')) {
      setIsDeleting(true);
      // Wait for animation to complete before removing from data
      setTimeout(() => {
        onDelete(review.id);
      }, 300);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;

    setIsSharing(true);
    
    // Construct fallback text
    const stars = '★'.repeat(review.userRating) + '☆'.repeat(5 - review.userRating);
    const shareText = `🎬 ${review.movieDetails.title} (${review.movieDetails.year})\n${stars}\n\n"${review.content}"\n\n— via CineNote`;

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
        ${isDeleting ? 'opacity-0 scale-90 pointer-events-none translate-y-4' : `${rotation} hover:rotate-0 hover:scale-[1.02] hover:-translate-y-2 hover:z-20`}
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

          <div className="flex items-center gap-1 text-amber-500 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  fill={i < review.userRating ? "currentColor" : "none"} 
                  className={i < review.userRating ? "" : "text-slate-400/50"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body: Review Content */}
      <div className="flex-1 min-h-0 relative group-inner px-1 flex flex-col">
         <Quote className="absolute top-0 right-0 text-black/5 dark:text-white/5 w-12 h-12 rotate-12 pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
          <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-hand whitespace-pre-wrap">
            {displayContent}
          </p>
        </div>

        {shouldTruncate && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 uppercase tracking-wider self-start transition-colors"
            data-html2canvas-ignore // Ignore read more button in screenshot
          >
            {isExpanded ? (
              <>Show Less <ChevronUp size={12} /></>
            ) : (
              <>Read More <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {/* Footer: Meta & Actions */}
      <div className="mt-3 pt-2 border-t border-black/5 flex justify-between items-center shrink-0">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold opacity-60">
           {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        
        <div 
          className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          data-html2canvas-ignore // Don't include action buttons in the screenshot
        >
          <button 
            onClick={handleShare}
            className={`p-1.5 rounded-full transition-all duration-200 ${justShared ? 'bg-green-100 text-green-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/30'}`}
            title="Share image"
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
            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all duration-200"
            title="Delete this entry"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};