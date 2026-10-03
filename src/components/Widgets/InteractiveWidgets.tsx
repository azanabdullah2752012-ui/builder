import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { CanvasElement, GuestbookEntry } from '../../types/editor';
import { ChevronDown, ChevronLeft, ChevronRight, Check, Heart, Send } from 'lucide-react';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';
import { databaseService } from '../../services/databaseService';

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

// ============================================================================
// 5. Live Visitor Poll Widget
// ============================================================================

interface PollWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export const PollWidget: React.FC<PollWidgetProps> = ({ element, isInteractive = true }) => {
  const config = element.pollConfig;
  const question = config?.question || 'What feature should we ship next? 🚀';
  const initialOptions = useMemo(() => config?.options || [
    { id: 'opt_1', label: '⚡ Instant AI Publishing', votes: 42 },
    { id: 'opt_2', label: '🎨 3D Motion Canvas', votes: 28 },
    { id: 'opt_3', label: '🤝 Real-Time Multiplayer', votes: 65 },
    { id: 'opt_4', label: '📱 Native Mobile App', votes: 19 },
  ], [config?.options]);

  const storageKey = `studio_poll_${element.id}`;
  const [votedOptionId, setVotedOptionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${storageKey}_voted`);
    } catch {
      return null;
    }
  });

  const [extraVotes, setExtraVotes] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}_counts`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Calculate totals and percentages
  const optionsWithVotes = useMemo(() => {
    return initialOptions.map((opt) => {
      const added = extraVotes[opt.id] || 0;
      return {
        ...opt,
        total: opt.votes + added,
      };
    });
  }, [initialOptions, extraVotes]);

  const totalVotes = useMemo(() => {
    return optionsWithVotes.reduce((acc, curr) => acc + curr.total, 0);
  }, [optionsWithVotes]);

  const handleVote = (optId: string, e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    if (votedOptionId === optId) return; // already voted for this

    playSound('pop');
    triggerConfetti(e.clientX, e.clientY);

    setVotedOptionId(optId);
    setExtraVotes((prev) => {
      const next = { ...prev };
      if (votedOptionId && next[votedOptionId]) {
        next[votedOptionId] = Math.max(0, next[votedOptionId] - 1);
      }
      next[optId] = (next[optId] || 0) + 1;
      try {
        localStorage.setItem(`${storageKey}_voted`, optId);
        localStorage.setItem(`${storageKey}_counts`, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Telemetry to backend submissions
    try {
      const chosen = initialOptions.find((o) => o.id === optId);
      databaseService.submitLead({
        page_slug: 'live-poll',
        form_type: 'Live Poll Vote',
        name: 'Poll Visitor',
        email: 'visitor@poll.vote',
        data: {
          pollQuestion: question,
          selectedOptionId: optId,
          selectedOptionLabel: chosen?.label || optId,
          elementId: element.id,
        },
      }).catch(() => {});
    } catch {}
  };

  const themeColor = config?.themeColor || '#6366f1';
  const s = element.styles || {};

  return (
    <div
      className="w-full h-full flex flex-col p-4 select-none relative overflow-hidden text-left"
      style={{
        fontFamily: s.fontFamily,
        color: s.color || '#ffffff',
      }}
    >
      {/* Header Badge & Question */}
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400">
            Live Poll
          </span>
        </div>
        <span className="text-[11px] font-semibold text-zinc-400">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>

      <h4
        className="font-bold leading-tight mb-3 text-white line-clamp-2 shrink-0"
        style={{ fontSize: s.fontSize ? `${s.fontSize}px` : '15px' }}
      >
        {question}
      </h4>

      {/* Options List */}
      <div className="flex-1 flex flex-col gap-2 justify-center overflow-y-auto pr-1 min-h-[100px]">
        {optionsWithVotes.map((opt) => {
          const isSelected = votedOptionId === opt.id;
          const pct = totalVotes > 0 ? Math.round((opt.total / totalVotes) * 100) : 0;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={(e) => handleVote(opt.id, e)}
              className={`w-full group relative overflow-hidden rounded-xl border text-left p-2.5 transition-all duration-200 cursor-pointer outline-none ${
                isSelected
                  ? 'border-indigo-500/80 bg-indigo-500/10 shadow-sm shadow-indigo-500/20'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              {/* Animated Progress Bar Fill */}
              <div
                className="absolute inset-y-0 left-0 transition-all duration-500 rounded-l-xl opacity-25 group-hover:opacity-35 pointer-events-none"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isSelected ? themeColor : '#a1a1aa',
                }}
              />

              {/* Content Row */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : 'border-zinc-500 group-hover:border-zinc-300'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold text-zinc-100 truncate">
                    {opt.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-zinc-300">
                    {pct}%
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    ({opt.total})
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Canvas design mode shield */}
      {!isInteractive && (
        <div className="absolute inset-0 bg-transparent z-20 cursor-move" />
      )}
    </div>
  );
};

// ============================================================================
// 6. Interactive Guestbook Wall Widget
// ============================================================================

interface GuestbookWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

const AVATAR_EMOJIS = ['🚀', '✨', '🥒', '🍕', '💖', '🐶', '⚡', '🎉'];

export const GuestbookWidget: React.FC<GuestbookWidgetProps> = ({ element, isInteractive = true }) => {
  const config = element.guestbookConfig;
  const title = config?.title || 'Visitor Guestbook & Wall 💌';
  const subtitle = config?.subtitle || 'Leave a shoutout, feedback, or say hi!';

  const storageKey = `studio_guestbook_${element.id}`;

  const defaultEntries: GuestbookEntry[] = useMemo(() => config?.entries || [
    { id: '1', name: 'Sarah Chen', message: 'The interactive widgets are so buttery smooth! Love this! 🔥', avatarEmoji: '🚀', date: 'Just now', likes: 12 },
    { id: '2', name: 'Alex Rivera', message: 'Built and launched my website in under 5 minutes. Incredible work!', avatarEmoji: '✨', date: '2h ago', likes: 8 },
  ], [config?.entries]);

  const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultEntries;
  });

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(AVATAR_EMOJIS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInteractive || !message.trim()) return;

    playSound('pop');
    triggerConfetti();

    const newEntry: GuestbookEntry = {
      id: `entry_${Date.now()}`,
      name: name.trim() || 'Anonymous Friend',
      message: message.trim(),
      avatarEmoji: selectedEmoji,
      date: 'Just now',
      likes: 1,
    };

    const updated = [newEntry, ...entries].slice(0, config?.maxEntries || 30);
    setEntries(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    setMessage('');

    // Telemetry to project database submissions
    databaseService.submitLead({
      page_slug: 'guestbook',
      form_type: 'Guestbook Entry',
      name: newEntry.name,
      email: `${newEntry.name.toLowerCase().replace(/\s+/g, '')}@guestbook.wall`,
      data: {
        message: newEntry.message,
        avatarEmoji: newEntry.avatarEmoji,
        elementId: element.id,
      },
    }).catch(() => {});
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    playSound('pop');
    setEntries((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, likes: (it.likes || 0) + 1 } : it));
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const s = element.styles || {};

  return (
    <div
      className="w-full h-full flex flex-col p-4 select-none relative overflow-hidden text-left"
      style={{
        fontFamily: s.fontFamily,
        color: s.color || '#ffffff',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10 shrink-0">
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
            <span>{title}</span>
          </h4>
          {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
          {entries.length} notes
        </span>
      </div>

      {/* Wall Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1 min-h-[100px]">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">{entry.avatarEmoji || '✨'}</span>
                <span className="text-xs font-semibold text-zinc-200 truncate">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span>{entry.date}</span>
                <button
                  type="button"
                  onClick={(e) => handleLike(entry.id, e)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-400 transition-colors cursor-pointer"
                  title="Like message"
                >
                  <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                  <span>{entry.likes || 0}</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed break-words">{entry.message}</p>
          </div>
        ))}
      </div>

      {/* Interactive Form */}
      {(config?.allowSubmissions ?? true) && (
        <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-white/10 shrink-0 flex flex-col gap-2">
          {/* Avatar selector & Name row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-0.5">
              {AVATAR_EMOJIS.slice(0, 5).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmoji(emoji);
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-transform ${
                    selectedEmoji === emoji ? 'bg-indigo-600 scale-110 shadow' : 'hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Message input + Send */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a friendly note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
            >
              <span>Post</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      )}

      {/* Canvas design mode shield */}
      {!isInteractive && (
        <div className="absolute inset-0 bg-transparent z-20 cursor-move" />
      )}
    </div>
  );
};

// ============================================================================
// 7. Interactive Reaction Button Widget
// ============================================================================

interface ReactionWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export const ReactionWidget: React.FC<ReactionWidgetProps> = ({ element, isInteractive = true }) => {
  const config = element.reactionConfig;
  const emoji = config?.emoji || '🔥';
  const label = config?.label || 'Hype';
  const initialCount = config?.count ?? 128;

  const storageKey = `studio_reaction_${element.id}`;

  const [count, setCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return parseInt(raw, 10);
    } catch {}
    return initialCount;
  });

  const [isBouncing, setIsBouncing] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number }[]>([]);

  const handleTap = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();

    const snd = config?.soundEffect || 'pop';
    if (snd !== 'none') playSound(snd as any);

    if (config?.burstType !== 'none') {
      triggerConfetti(e.clientX, e.clientY);
    }

    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);

    const newId = Date.now();
    setParticles((prev) => [...prev.slice(-3), { id: newId, x: Math.random() * 20 - 10 }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 800);

    setCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(storageKey, next.toString());
      } catch {}
      return next;
    });
  };

  const s = element.styles || {};

  return (
    <div
      onClick={handleTap}
      className={`w-full h-full flex items-center justify-center gap-3 px-4 py-2 select-none relative cursor-pointer rounded-[inherit] transition-transform duration-150 active:scale-95 hover:scale-105 group ${
        isBouncing ? 'animate-bounce' : ''
      }`}
      style={{
        fontFamily: s.fontFamily,
      }}
    >
      {/* Floating +1 badges */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-xs font-black text-emerald-400 pointer-events-none transition-all duration-700 animate-fade-in"
          style={{
            transform: `translate(${p.x}px, -28px)`,
          }}
        >
          +1
        </span>
      ))}

      <span className="text-xl group-hover:scale-125 transition-transform duration-200">
        {emoji}
      </span>
      {label && (
        <span
          className="font-bold tracking-wide text-xs text-white"
          style={{ fontSize: s.fontSize ? `${s.fontSize}px` : '13px' }}
        >
          {label}
        </span>
      )}
      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-extrabold border border-white/15 tabular-nums">
        {count.toLocaleString()}
      </span>

      {/* Canvas design mode shield */}
      {!isInteractive && (
        <div className="absolute inset-0 bg-transparent z-20 cursor-move" />
      )}
    </div>
  );
};

