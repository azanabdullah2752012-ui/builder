import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useEditor } from '../../context/useEditor';
import type { CanvasElement } from '../../types/editor';
import {
  Search,
  Replace,
  ChevronDown,
  ChevronUp,
  X,
  CaseSensitive,
  WholeWord,
} from 'lucide-react';
import { playSound } from '../../utils/interactiveEffects';

interface MatchItem {
  key: string;
  pageId: string;
  pageName: string;
  elementId: string;
  elementName: string;
  elementType: string;
  field: string;
  fieldLabel: string;
  originalText: string;
  matchStart: number;
  matchEnd: number;
  preview: string;
}

interface CanvasFindReplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CanvasFindReplace: React.FC<CanvasFindReplaceProps> = ({ isOpen, onClose }) => {
  const {
    project,
    activePage,
    setActivePage,
    selectElement,
    updateElement,
    showToast,
  } = useEditor();

  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [scope, setScope] = useState<'page' | 'all'>('page');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 60);
    }
  }, [isOpen]);

  // Extract searchable strings from any CanvasElement
  const extractSearchableFields = useCallback((el: CanvasElement): { field: string; label: string; text: string }[] => {
    const fields: { field: string; label: string; text: string }[] = [];

    if (el.name) fields.push({ field: 'name', label: 'Layer Name', text: el.name });
    if (el.content) fields.push({ field: 'content', label: 'Content', text: el.content });
    if (el.type) fields.push({ field: 'type', label: 'Type', text: el.type });

    // Widget custom configurations
    const formConfig = (el as unknown as { formConfig?: { placeholder?: string; fieldName?: string; successMessage?: string } }).formConfig;
    if (formConfig) {
      if (formConfig.placeholder) fields.push({ field: 'formConfig.placeholder', label: 'Placeholder', text: formConfig.placeholder });
      if (formConfig.fieldName) fields.push({ field: 'formConfig.fieldName', label: 'Field Name', text: formConfig.fieldName });
      if (formConfig.successMessage) fields.push({ field: 'formConfig.successMessage', label: 'Success Message', text: formConfig.successMessage });
    }

    const accordionConfig = (el as unknown as { accordionConfig?: { items?: { title: string; content: string }[] } }).accordionConfig;
    if (accordionConfig?.items) {
      accordionConfig.items.forEach((item, idx) => {
        if (item.title) fields.push({ field: `accordionConfig.items[${idx}].title`, label: `FAQ #${idx + 1} Title`, text: item.title });
        if (item.content) fields.push({ field: `accordionConfig.items[${idx}].content`, label: `FAQ #${idx + 1} Content`, text: item.content });
      });
    }

    const productConfig = (el as unknown as { productConfig?: { title?: string; badge?: string } }).productConfig;
    if (productConfig) {
      if (productConfig.title) fields.push({ field: 'productConfig.title', label: 'Product Title', text: productConfig.title });
      if (productConfig.badge) fields.push({ field: 'productConfig.badge', label: 'Product Badge', text: productConfig.badge });
    }

    const testimonialConfig = (el as unknown as { testimonialConfig?: { quote?: string; author?: string; company?: string; role?: string } }).testimonialConfig;
    if (testimonialConfig) {
      if (testimonialConfig.quote) fields.push({ field: 'testimonialConfig.quote', label: 'Review Quote', text: testimonialConfig.quote });
      if (testimonialConfig.author) fields.push({ field: 'testimonialConfig.author', label: 'Review Author', text: testimonialConfig.author });
      if (testimonialConfig.company) fields.push({ field: 'testimonialConfig.company', label: 'Company', text: testimonialConfig.company });
    }

    const pollConfig = (el as unknown as { pollConfig?: { question?: string; options?: { label: string }[] } }).pollConfig;
    if (pollConfig) {
      if (pollConfig.question) fields.push({ field: 'pollConfig.question', label: 'Poll Question', text: pollConfig.question });
      if (pollConfig.options) {
        pollConfig.options.forEach((opt, idx) => {
          if (opt.label) fields.push({ field: `pollConfig.options[${idx}].label`, label: `Option #${idx + 1}`, text: opt.label });
        });
      }
    }

    const guestbookConfig = (el as unknown as { guestbookConfig?: { title?: string; subtitle?: string } }).guestbookConfig;
    if (guestbookConfig) {
      if (guestbookConfig.title) fields.push({ field: 'guestbookConfig.title', label: 'Guestbook Title', text: guestbookConfig.title });
      if (guestbookConfig.subtitle) fields.push({ field: 'guestbookConfig.subtitle', label: 'Guestbook Subtitle', text: guestbookConfig.subtitle });
    }

    const audioConfig = (el as unknown as { audioConfig?: { title?: string; artist?: string } }).audioConfig;
    if (audioConfig) {
      if (audioConfig.title) fields.push({ field: 'audioConfig.title', label: 'Audio Title', text: audioConfig.title });
      if (audioConfig.artist) fields.push({ field: 'audioConfig.artist', label: 'Artist', text: audioConfig.artist });
    }

    return fields;
  }, []);

  // Compute all matches across active page or entire project
  const matches = useMemo((): MatchItem[] => {
    if (!searchQuery.trim()) return [];

    const pagesToSearch = scope === 'all'
      ? project.pages
      : project.pages.filter((p) => p.id === activePage.id);

    const results: MatchItem[] = [];

    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regex: RegExp;
    try {
      const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
      regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      return [];
    }

    for (const page of pagesToSearch) {
      for (const el of page.elements) {
        const fields = extractSearchableFields(el);
        for (const f of fields) {
          regex.lastIndex = 0;
          let match: RegExpExecArray | null;
          let matchNum = 0;
          while ((match = regex.exec(f.text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            const previewStart = Math.max(0, start - 15);
            const previewEnd = Math.min(f.text.length, end + 15);
            const snippet =
              (previewStart > 0 ? '…' : '') +
              f.text.slice(previewStart, previewEnd) +
              (previewEnd < f.text.length ? '…' : '');

            results.push({
              key: `${page.id}-${el.id}-${f.field}-${matchNum}`,
              pageId: page.id,
              pageName: page.name,
              elementId: el.id,
              elementName: el.name || el.type,
              elementType: el.type,
              field: f.field,
              fieldLabel: f.label,
              originalText: f.text,
              matchStart: start,
              matchEnd: end,
              preview: snippet,
            });
            matchNum++;
            if (!regex.global) break;
          }
        }
      }
    }

    return results;
  }, [searchQuery, matchCase, wholeWord, scope, project.pages, activePage.id, extractSearchableFields]);

  // Keep currentMatchIndex in bounds
  useEffect(() => {
    if (matches.length === 0) {
      setCurrentMatchIndex(0);
    } else if (currentMatchIndex >= matches.length) {
      setCurrentMatchIndex(matches.length - 1);
    }
  }, [matches.length, currentMatchIndex]);

  // Highlight and scroll to matched element
  const focusMatch = useCallback((index: number) => {
    if (matches.length === 0) return;
    const match = matches[index];
    if (!match) return;

    if (match.pageId !== activePage.id) {
      setActivePage(match.pageId);
    }

    selectElement(match.elementId);

    // Smooth scroll canvas to element
    setTimeout(() => {
      const elNode =
        document.getElementById(`canvas-element-${match.elementId}`) ||
        document.querySelector(`[data-element-id="${match.elementId}"]`);
      if (elNode) {
        elNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        // Add a temporary pulsing glow ring to the target element
        elNode.classList.add('search-highlight-pulse');
        setTimeout(() => elNode.classList.remove('search-highlight-pulse'), 1400);
      }
    }, 80);
  }, [matches, activePage.id, setActivePage, selectElement]);

  const handleNext = useCallback(() => {
    if (matches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIdx);
    focusMatch(nextIdx);
    playSound('pop');
  }, [matches.length, currentMatchIndex, focusMatch]);

  const handlePrev = useCallback(() => {
    if (matches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIdx);
    focusMatch(prevIdx);
    playSound('pop');
  }, [matches.length, currentMatchIndex, focusMatch]);

  // When match index changes via click or enter, trigger focus
  useEffect(() => {
    if (matches.length > 0 && isOpen) {
      focusMatch(currentMatchIndex);
    }
  }, [currentMatchIndex, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Replace single occurrence
  const handleReplaceCurrent = useCallback(() => {
    if (matches.length === 0) return;
    const match = matches[currentMatchIndex];
    if (!match) return;

    // We can directly replace in content or name
    if (match.field === 'content' || match.field === 'name') {
      const newText =
        match.originalText.slice(0, match.matchStart) +
        replaceQuery +
        match.originalText.slice(match.matchEnd);

      updateElement(match.elementId, { [match.field]: newText }, true);
      playSound('pop');
      showToast(`Replaced text in "${match.elementName}" ✏️`, 'success');
    } else {
      showToast(`Field "${match.fieldLabel}" is configuration-managed. Opened element to edit.`, 'info');
    }
  }, [matches, currentMatchIndex, replaceQuery, updateElement, showToast]);

  // Replace All occurrences in content and name
  const handleReplaceAll = useCallback(() => {
    if (matches.length === 0) return;

    let replacedCount = 0;
    const affectedElements = new Set<string>();

    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
    const regex = new RegExp(pattern, matchCase ? 'g' : 'gi');

    // Group matches by elementId
    const elementMatchMap = new Map<string, MatchItem[]>();
    for (const m of matches) {
      const list = elementMatchMap.get(m.elementId) || [];
      list.push(m);
      elementMatchMap.set(m.elementId, list);
    }

    elementMatchMap.forEach((_elMatches, elementId) => {
      const el = activePage.elements.find((e) => e.id === elementId);
      if (!el) return;

      const updates: Partial<CanvasElement> = {};
      let changed = false;

      if (el.content && regex.test(el.content)) {
        const occurrences = (el.content.match(regex) || []).length;
        updates.content = el.content.replace(regex, replaceQuery);
        replacedCount += occurrences;
        changed = true;
      }

      if (el.name && regex.test(el.name)) {
        const occurrences = (el.name.match(regex) || []).length;
        updates.name = el.name.replace(regex, replaceQuery);
        replacedCount += occurrences;
        changed = true;
      }

      if (changed) {
        updateElement(elementId, updates, true);
        affectedElements.add(elementId);
      }
    });

    if (replacedCount > 0) {
      playSound('pop');
      showToast(`Replaced ${replacedCount} occurrence${replacedCount > 1 ? 's' : ''} across ${affectedElements.size} element${affectedElements.size > 1 ? 's' : ''} ✨`, 'success');
    } else {
      showToast('No replaceable text content matches found', 'warning');
    }
  }, [matches, searchQuery, replaceQuery, matchCase, wholeWord, activePage.elements, updateElement, showToast]);

  // Global keydown handler inside Find & Replace
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  if (!isOpen) return null;

  const currentMatch = matches[currentMatchIndex];

  return (
    <div
      role="search"
      aria-label="Canvas Find and Replace"
      style={{
        position: 'absolute',
        top: 14,
        right: 18,
        zIndex: 90,
        width: 370,
        backgroundColor: '#101510',
        border: '1px solid #354331',
        borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,243,107,0.18)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        animation: 'findBarSlideDown 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
      }}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes findBarSlideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .search-highlight-pulse {
          outline: 3px solid #B8F36B !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 24px rgba(184, 243, 107, 0.5) !important;
          transition: outline 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>

      {/* Row 1: Search Input & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderBottom: '1px solid #252F23' }}>
        <button
          type="button"
          onClick={() => setShowReplace((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: showReplace ? '#B8F36B' : '#71717a',
            cursor: 'pointer',
            padding: 3,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 4,
          }}
          title={showReplace ? 'Hide Replace' : 'Show Replace'}
        >
          <Replace size={14} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1C241B',
            border: '1px solid #354331',
            borderRadius: 6,
            padding: '0 8px',
            flex: 1,
            height: 28,
            gap: 6,
          }}
        >
          <Search size={13} color="#B8F36B" style={{ flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Find in canvas (Cmd+F)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: '#F4F5EF',
              fontSize: 12,
              outline: 'none',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 11, padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Match counter badge */}
        <span
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 600,
            color: matches.length > 0 ? '#B8F36B' : '#71717a',
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: matches.length > 0 ? '#252F23' : '#1C241B',
            whiteSpace: 'nowrap',
          }}
        >
          {matches.length > 0
            ? `${currentMatchIndex + 1}/${matches.length}`
            : searchQuery
            ? '0/0'
            : 'Find'}
        </span>

        {/* Stepper buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            type="button"
            disabled={matches.length === 0}
            onClick={handlePrev}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: '1px solid #354331',
              backgroundColor: '#1C241B',
              color: matches.length > 0 ? '#F4F5EF' : '#52525b',
              cursor: matches.length > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Previous Match (Shift+Enter)"
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            disabled={matches.length === 0}
            onClick={handleNext}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: '1px solid #354331',
              backgroundColor: '#1C241B',
              color: matches.length > 0 ? '#F4F5EF' : '#52525b',
              cursor: matches.length > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Next Match (Enter)"
          >
            <ChevronDown size={13} />
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            border: 'none',
            background: 'none',
            color: '#71717a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* Row 2: Replace Input & Actions (if open) */}
      {showReplace && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', backgroundColor: '#0d110d', borderBottom: '1px solid #252F23' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1C241B',
              border: '1px solid #354331',
              borderRadius: 6,
              padding: '0 8px',
              flex: 1,
              height: 28,
              gap: 6,
            }}
          >
            <Replace size={12} color="#A0A99A" style={{ flexShrink: 0 }} />
            <input
              ref={replaceInputRef}
              type="text"
              placeholder="Replace with…"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: '#F4F5EF',
                fontSize: 12,
                outline: 'none',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="button"
            disabled={matches.length === 0}
            onClick={handleReplaceCurrent}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              border: '1px solid #354331',
              backgroundColor: matches.length > 0 ? '#1C241B' : '#141416',
              color: matches.length > 0 ? '#F4F5EF' : '#52525b',
              cursor: matches.length > 0 ? 'pointer' : 'default',
              fontSize: 11,
              fontWeight: 500,
            }}
            title="Replace current match"
          >
            Replace
          </button>

          <button
            type="button"
            disabled={matches.length === 0}
            onClick={handleReplaceAll}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              border: 'none',
              backgroundColor: matches.length > 0 ? '#B8F36B' : '#252F23',
              color: matches.length > 0 ? '#101510' : '#52525b',
              cursor: matches.length > 0 ? 'pointer' : 'default',
              fontSize: 11,
              fontWeight: 700,
            }}
            title="Replace all matching occurrences"
          >
            All
          </button>
        </div>
      )}

      {/* Row 3: Search Modifiers & Scope Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          fontSize: 10,
          color: '#A0A99A',
          backgroundColor: '#121812',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Match Case */}
          <button
            type="button"
            onClick={() => setMatchCase((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 5px',
              borderRadius: 4,
              border: matchCase ? '1px solid #B8F36B' : '1px solid #354331',
              backgroundColor: matchCase ? '#252F23' : 'transparent',
              color: matchCase ? '#B8F36B' : '#71717a',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: matchCase ? 600 : 400,
            }}
            title="Match Case (Aa)"
          >
            <CaseSensitive size={12} />
            <span>Case</span>
          </button>

          {/* Whole Word */}
          <button
            type="button"
            onClick={() => setWholeWord((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 5px',
              borderRadius: 4,
              border: wholeWord ? '1px solid #B8F36B' : '1px solid #354331',
              backgroundColor: wholeWord ? '#252F23' : 'transparent',
              color: wholeWord ? '#B8F36B' : '#71717a',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: wholeWord ? 600 : 400,
            }}
            title="Match Whole Word (\b)"
          >
            <WholeWord size={12} />
            <span>Word</span>
          </button>
        </div>

        {/* Scope Switcher: Active Page vs All Pages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: '#1C241B', padding: 2, borderRadius: 5, border: '1px solid #354331' }}>
          <button
            type="button"
            onClick={() => setScope('page')}
            style={{
              padding: '2px 6px',
              borderRadius: 3,
              border: 'none',
              backgroundColor: scope === 'page' ? '#252F23' : 'transparent',
              color: scope === 'page' ? '#B8F36B' : '#71717a',
              cursor: 'pointer',
              fontSize: 9.5,
              fontWeight: scope === 'page' ? 600 : 400,
            }}
          >
            This Page
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            style={{
              padding: '2px 6px',
              borderRadius: 3,
              border: 'none',
              backgroundColor: scope === 'all' ? '#252F23' : 'transparent',
              color: scope === 'all' ? '#B8F36B' : '#71717a',
              cursor: 'pointer',
              fontSize: 9.5,
              fontWeight: scope === 'all' ? 600 : 400,
            }}
          >
            All Pages ({project.pages.length})
          </button>
        </div>
      </div>

      {/* Row 4: Match Detail Preview Snippet (when match is active) */}
      {currentMatch && (
        <div
          style={{
            padding: '6px 10px',
            backgroundColor: '#0c0f0c',
            borderTop: '1px solid #1C241B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 10.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
            <span style={{ color: '#B8F36B', fontWeight: 600, textTransform: 'uppercase', fontSize: 9 }}>
              {currentMatch.elementType}
            </span>
            <span style={{ color: '#52525b' }}>•</span>
            <span style={{ color: '#A0A99A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentMatch.elementName}
            </span>
            <span style={{ color: '#52525b' }}>•</span>
            <span style={{ color: '#F4F5EF', fontFamily: 'monospace', fontSize: 10 }} title={currentMatch.preview}>
              {currentMatch.preview}
            </span>
          </div>

          {scope === 'all' && (
            <span style={{ color: '#71717a', fontSize: 9, marginLeft: 8, whiteSpace: 'nowrap' }}>
              📄 {currentMatch.pageName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
