import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { CanvasElement } from '../../types/editor';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================================================
// 1. FAQ Accordion Widget Component
// ============================================================================

interface AccordionWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export const AccordionWidget: React.FC<AccordionWidgetProps> = ({ element, isInteractive = true }) => {
  const config = element.accordionConfig;
  const items = useMemo(() => config?.items || [
    { id: '1', title: 'How does it work?', content: 'Everything runs in real-time in the browser and cloud.', isOpen: true },
    { id: '2', title: 'Can I export clean code?', content: 'Yes, full semantic code export is supported.', isOpen: false },
  ], [config?.items]);

  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    items.forEach((item) => {
      if (item.isOpen) initial.add(item.id);
    });
    if (initial.size === 0 && items.length > 0) initial.add(items[0].id);
    return initial;
  });

  const toggleItem = (id: string, e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    setOpenIds((prev) => {
      const next = new Set(config?.allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const s = element.styles || {};

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-auto divide-y divide-[#262f44] text-left select-none"
      style={{
        fontFamily: s.fontFamily,
        color: s.color || '#ffffff',
      }}
    >
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} className="transition-colors group">
            <button
              type="button"
              onClick={(e) => toggleItem(item.id, e)}
              className="w-full py-3.5 px-4 flex items-center justify-between gap-3 text-left font-semibold hover:bg-white/[0.03] transition-all cursor-pointer outline-none"
              style={{ fontSize: s.fontSize ? `${s.fontSize}px` : '14px' }}
            >
              <span className="truncate">{item.title}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-300 text-indigo-400 ${
                  isOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div
                className="px-4 pb-4 pt-1 text-zinc-300 text-xs leading-relaxed animate-fade-in"
                style={{ fontSize: s.fontSize ? `${Math.max(11, s.fontSize - 2)}px` : '12px' }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 2. Image Carousel / Slider Widget Component
// ============================================================================

interface CarouselWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export const CarouselWidget: React.FC<CarouselWidgetProps> = ({ element, isInteractive = true }) => {
  const config = element.carouselConfig;
  const slides = useMemo(() => config?.slides || [
    { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', caption: 'Neo Workspace' },
    { id: '2', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80', caption: 'Creative Flow' },
    { id: '3', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80', caption: 'Digital Canvas' },
  ], [config?.slides]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isInteractive || !config?.autoplay || isPaused || slides.length <= 1) return;
    const intervalSec = (config.interval || 4) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, intervalSec);
    return () => clearInterval(timer);
  }, [isInteractive, config?.autoplay, config?.interval, isPaused, slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-[inherit] select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Image */}
      {currentSlide && (
        <img
          key={currentSlide.id || currentIndex}
          src={currentSlide.url}
          alt={currentSlide.caption || 'Slide'}
          className="w-full h-full object-cover transition-opacity duration-500 animate-fade-in"
          loading="lazy"
        />
      )}

      {/* Caption Overlay */}
      {currentSlide?.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-left pointer-events-none">
          <p className="text-white text-xs font-medium tracking-wide drop-shadow-md">
            {currentSlide.caption}
          </p>
        </div>
      )}

      {/* Navigation Arrows */}
      {(config?.showArrows ?? true) && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
            title="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {(config?.showDots ?? true) && slides.length > 1 && (
        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-auto">
          {slides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-white shadow-md'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. Video Embed Widget Component (YouTube, Vimeo, MP4)
// ============================================================================

interface VideoWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export function parseVideoEmbedUrl(url: string, autoplay = false, controls = true, loop = false, muted = false) {
  if (!url) return null;

  // 1. YouTube Matchers
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const vid = ytMatch[1];
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: controls ? '1' : '0',
      loop: loop ? '1' : '0',
      mute: muted ? '1' : '0',
      playlist: loop ? vid : '',
      rel: '0',
    });
    return { type: 'youtube' as const, embedUrl: `https://www.youtube.com/embed/${vid}?${params.toString()}` };
  }

  // 2. Vimeo Matchers
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const vid = vimeoMatch[1];
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: loop ? '1' : '0',
      muted: muted ? '1' : '0',
    });
    return { type: 'vimeo' as const, embedUrl: `https://player.vimeo.com/video/${vid}?${params.toString()}` };
  }

  // 3. Direct HTML5 Video (mp4, webm, ogg)
  return { type: 'mp4' as const, embedUrl: url };
}

export const VideoWidget: React.FC<VideoWidgetProps> = ({ element, isInteractive = true }) => {
  const config = element.videoConfig;
  const rawUrl = config?.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const embed = useMemo(() => {
    return parseVideoEmbedUrl(
      rawUrl,
      config?.autoplay ?? false,
      config?.controls ?? true,
      config?.loop ?? false,
      config?.muted ?? false
    );
  }, [rawUrl, config?.autoplay, config?.controls, config?.loop, config?.muted]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[inherit] bg-black">
      {embed?.type === 'youtube' || embed?.type === 'vimeo' ? (
        <iframe
          src={embed.embedUrl}
          title={element.name || 'Video Player'}
          className="w-full h-full border-0 rounded-[inherit]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video
          src={embed?.embedUrl || rawUrl}
          controls={config?.controls ?? true}
          autoPlay={config?.autoplay ?? false}
          loop={config?.loop ?? false}
          muted={config?.muted ?? false}
          poster={config?.posterUrl}
          className="w-full h-full object-cover rounded-[inherit]"
        />
      )}

      {/* Canvas design mode shield: prevents iframe click trapping during drag/selection */}
      {!isInteractive && (
        <div className="absolute inset-0 bg-transparent z-10 cursor-move" />
      )}
    </div>
  );
};

// ============================================================================
// 4. Animated Stat Counter Widget Component
// ============================================================================

interface CounterWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export const CounterWidget: React.FC<CounterWidgetProps> = ({ element }) => {
  const config = element.counterConfig;
  const targetValue = config?.targetValue ?? 99.9;
  const startValue = config?.startValue ?? 0;
  const prefix = config?.prefix ?? '';
  const suffix = config?.suffix ?? '%';
  const label = config?.label ?? 'Uptime Reliability';
  const durationSec = config?.duration ?? 2;
  const decimals = config?.decimals ?? (targetValue % 1 !== 0 ? 1 : 0);

  const [currentVal, setCurrentVal] = useState<number>(startValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    let startTime: number | null = null;
    const durationMs = durationSec * 1000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // Ease-out cubic calculation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = startValue + (targetValue - startValue) * easeProgress;
      setCurrentVal(val);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCurrentVal(targetValue);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, startValue, durationSec]);

  const s = element.styles || {};
  const formattedVal = currentVal.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center p-3 select-none text-center"
      style={{
        fontFamily: s.fontFamily,
      }}
    >
      <div
        className="font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent flex items-baseline justify-center"
        style={{
          fontSize: s.fontSize ? `${s.fontSize * 1.6}px` : '36px',
        }}
      >
        {prefix && <span className="text-[0.7em] mr-0.5 opacity-90">{prefix}</span>}
        <span>{formattedVal}</span>
        {suffix && <span className="text-[0.7em] ml-0.5 text-indigo-400 font-bold">{suffix}</span>}
      </div>
      {label && (
        <div
          className="text-zinc-400 font-medium tracking-wide mt-2 text-xs truncate max-w-full"
          style={{
            fontSize: s.fontSize ? `${Math.max(10, s.fontSize * 0.45)}px` : '12px',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
