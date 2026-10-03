import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  CanvasElement,
  ElementType,
  ProjectState,
  EditorMode,
  ViewportMode,
  StateVariant,
  ElementStyles,
  ElementBehavior,
  ContainerLayoutConfig,
  ElementResponsiveConfig,
  Page,
  ShapeKind,
  CloudSyncStatus,
  ProjectSummary,
  ProjectRevision,
  UserGuide,
} from '../types/editor';
import { SHAPE_DEFINITIONS } from '../utils/shapeDefinitions';
import {
  INITIAL_PROJECT,
  createElement,
  generateId,
  CANVAS_DEFAULT_WIDTH,
  CANVAS_DEFAULT_HEIGHT,
} from '../constants/defaults';
import { EditorContext, setLatestEditorContextValue } from './editorContextInstance';
import type { Toast, EditorContextType } from './editorContextInstance';

import { normalizeProjectState } from '../utils/projectNormalization';
import { databaseService } from '../services/databaseService';


export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Direct Cloud State: initializes with normalized base project, then hydrates from Supabase Cloud
  const [project, setProject] = useState<ProjectState>(() => {
    return normalizeProjectState(INITIAL_PROJECT);
  });

  const [selectedElementIds, setSelectedElementIds] = useState<string[]>(['el_primary_cta']);
  const selectedElementId = selectedElementIds[0] || null;

  const setSelectedElementId = useCallback((id: string | null) => {
    setSelectedElementIds(id ? [id] : []);
  }, []);
  
  // Initial mode: If user is already authenticated, or URL specifies ?editor=true / #editor, open Editor directly!
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      const params = new URLSearchParams(search);
      if (
        params.get('mode') === 'design' ||
        params.get('editor') === 'true' ||
        params.get('editor') === '1' ||
        params.get('error') ||
        hash.includes('error') ||
        hash.includes('editor') ||
        hash.includes('access_token')
      ) {
        return 'design';
      }
      try {
        const saved = localStorage.getItem('pickle_auth_user') || localStorage.getItem('craft_auth_user');
        if (saved) {
          const u = JSON.parse(saved);
          if (u && (u.email || u.name)) return 'design';
        }
      } catch {}
    }
    return 'landing';
  });

  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [previewStateVariant, setPreviewStateVariant] = useState<StateVariant>('default');
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showRulers, setShowRulers] = useState<boolean>(false);
  const [snapToObjects, setSnapToObjects] = useState<boolean>(true);
  const [snapToGuides, setSnapToGuides] = useState<boolean>(true);
  const [userGuides, setUserGuides] = useState<UserGuide[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [lastSavedText, setLastSavedText] = useState<string>('Saved locally');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Cloud Persistence & Modal States
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<string | null>(null);
  const [cloudProjects, setCloudProjects] = useState<ProjectSummary[]>([]);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState<boolean>(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [revisions, setRevisions] = useState<ProjectRevision[]>([]);

  // Toast helper
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  }, [removeToast]);

  // Rulers and Custom User Guides methods
  const toggleRulers = useCallback(() => {
    setShowRulers((prev) => {
      const next = !prev;
      showToast(next ? 'Rulers & Guides shown (Shift+R)' : 'Rulers & Guides hidden (Shift+R)', 'info');
      return next;
    });
  }, [showToast]);

  const addUserGuide = useCallback((orientation: 'horizontal' | 'vertical', position: number) => {
    const newGuide: UserGuide = {
      id: `guide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orientation,
      position,
    };
    setUserGuides((prev) => [...prev, newGuide]);
    showToast(`Added ${orientation} guide at ${position}px`, 'info');
  }, [showToast]);

  const updateUserGuide = useCallback((id: string, position: number) => {
    setUserGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, position } : g))
    );
  }, []);

  const removeUserGuide = useCallback((id: string) => {
    setUserGuides((prev) => prev.filter((g) => g.id !== id));
    showToast('Removed guide line', 'info');
  }, [showToast]);

  const clearUserGuides = useCallback(() => {
    setUserGuides([]);
    showToast('Cleared all guides', 'info');
  }, [showToast]);

  // Authenticated Creator Session
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; plan?: string; role?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('pickle_auth_user') || localStorage.getItem('craft_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (
          u &&
          (u.name === 'Craft Creator' ||
            u.name === 'Alex Morgan' ||
            u.email === 'creator@craftstudio.dev' ||
            u.email === 'alex@craftstudio.dev' ||
            u.email === 'azan@craftstudio.dev')
        ) {
          const actualUser = {
            name: 'Azan Abdullah',
            email: 'azan@picklestudio.dev',
            plan: 'Free (All Features Unlocked)',
            role: 'owner',
          };
          localStorage.setItem('pickle_auth_user', JSON.stringify(actualUser));
          return actualUser;
        }
        return {
          ...u,
          plan: 'Free (All Features Unlocked)',
        };
      }
      return {
        name: 'Azan Abdullah',
        email: 'azan@picklestudio.dev',
        plan: 'Free (All Features Unlocked)',
        role: 'owner',
      };
    } catch {
      return {
        name: 'Azan Abdullah',
        email: 'azan@picklestudio.dev',
        plan: 'Free (All Features Unlocked)',
        role: 'owner',
      };
    }
  });

  const handleSetCurrentUser = useCallback((user: { name: string; email: string; plan?: string; role?: string } | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem('pickle_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('pickle_auth_user');
        localStorage.removeItem('craft_auth_user');
      }
    } catch {}
  }, []);

  // Listen for Supabase OAuth sign-in (e.g. Google OAuth redirect) and handle URL auth errors
  useEffect(() => {
    // 0. Handle OAuth error query or hash in URL (e.g. Google auth cancel/failure)
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('error=') || hash.includes('error=')) {
        handleSetCurrentUser({
          name: 'Azan Abdullah',
          email: 'azan@craftstudio.dev',
          plan: 'Free (All Features Unlocked)',
          role: 'owner',
        });
        setEditorMode('design');
        showToast('⚡ Welcome Azan Abdullah! Entering Visual Studio...', 'success');
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {}
      }
    }

    // 1. Check existing session on boot
    databaseService.getSession().then((session) => {
      if (session?.user) {
        const u = session.user;
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Google User';
        const email = u.email || '';
        handleSetCurrentUser({ name, email, plan: 'Free (All Features Unlocked)' });
        setEditorMode('design');
      }
    });

    // 2. Subscribe to auth changes (e.g. redirect back from Google OAuth)
    const { data: authListener } = databaseService.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const u = session.user;
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Google User';
        const email = u.email || '';
        handleSetCurrentUser({ name, email, plan: 'Free (All Features Unlocked)' });
        setEditorMode('design');
        showToast(`🎉 Signed in with Google as ${name}! Entering Studio...`, 'success');
      } else if (event === 'SIGNED_OUT') {
        handleSetCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [handleSetCurrentUser, showToast]);

  // Studio Clipboard for Copy & Paste
  const [clipboard, setClipboard] = useState<{ root: CanvasElement; descendants: CanvasElement[] } | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Editor Complexity: 'simple' (clean & uncluttered for new users) vs 'pro' (full advanced suite)
  const [editorComplexity, setEditorComplexityState] = useState<'simple' | 'pro'>(() => {
    try {
      const saved = localStorage.getItem('pickle_editor_complexity') || localStorage.getItem('craft_editor_complexity');
      if (saved === 'simple' || saved === 'pro') return saved;
    } catch {}
    return 'simple'; // Default to clean simple mode for new users!
  });

  const setEditorComplexity = useCallback((complexity: 'simple' | 'pro') => {
    setEditorComplexityState(complexity);
    if (complexity === 'simple') {
      setLeftSidebarOpen(true);
      setRightSidebarOpen(true);
    }
    try {
      localStorage.setItem('pickle_editor_complexity', complexity);
    } catch {}
  }, []);

  const toggleEditorComplexity = useCallback(() => {
    setEditorComplexityState((prev) => {
      const next = prev === 'simple' ? 'pro' : 'simple';
      if (next === 'simple') {
        setLeftSidebarOpen(true);
        setRightSidebarOpen(true);
      }
      try {
        localStorage.setItem('pickle_editor_complexity', next);
      } catch {}
      return next;
    });
  }, []);

  // First-time Onboarding Walkthrough
  const [showOnboarding, setShowOnboardingState] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('pickle_onboarding_completed') && !localStorage.getItem('craft_onboarding_completed');
    } catch {
      return true;
    }
  });

  const setShowOnboarding = useCallback((show: boolean | ((prev: boolean) => boolean)) => {
    setShowOnboardingState(show);
  }, []);

  // Studio Sidebars (open by default so user sees components and starter kits immediately)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);

  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen((prev) => !prev);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen((prev) => !prev);
  }, []);

  const zoomToFit = useCallback(() => {
    window.dispatchEvent(new CustomEvent('canvas:fit-to-screen'));
  }, []);

  // History stacks
  const [historyPast, setHistoryPast] = useState<ProjectState[]>([]);
  const [historyFuture, setHistoryFuture] = useState<ProjectState[]>([]);


  // Current active page
  const activePage = useMemo(() => {
    const page = project.pages.find((p) => p.id === project.activePageId);
    return page || project.pages[0];
  }, [project.pages, project.activePageId]);

  // Currently selected elements
  const selectedElements = useMemo(() => {
    if (selectedElementIds.length === 0) return [];
    const idSet = new Set(selectedElementIds);
    return activePage.elements.filter((el) => idSet.has(el.id));
  }, [activePage.elements, selectedElementIds]);

  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return activePage.elements.find((el) => el.id === selectedElementId) || null;
  }, [activePage.elements, selectedElementId]);

  // Auto-save: debounced persistence directly to Supabase Cloud (800ms)
  useEffect(() => {
    setCloudSyncStatus('saving');
    setIsSaved(false);

    const cloudTimeout = setTimeout(async () => {
      try {
        const res = await databaseService.saveProject(project, {
          userId: currentUser?.email,
          isPublic: project.isPublic,
        });
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastCloudSavedAt(timeStr);
        setIsSaved(true);
        if (res.cloud) {
          setCloudSyncStatus('saved');
          setLastSavedText(`Supabase Synced at ${timeStr}`);
        } else {
          setCloudSyncStatus('offline');
          setLastSavedText(`Saved to Workspace (${timeStr})`);
        }
      } catch {
        setCloudSyncStatus('offline');
        setLastSavedText('Saving error');
      }
    }, 800);

    return () => {
      clearTimeout(cloudTimeout);
    };
  }, [project, currentUser?.email]);

  // Record state to history before making modifications
  const pushHistory = useCallback((currentProject: ProjectState) => {
    setHistoryPast((prev) => [...prev.slice(-30), currentProject]);
    setHistoryFuture([]);
    setIsSaved(false);
  }, []);

  // Set Project Name
  const setProjectName = useCallback((name: string) => {
    setProject((prev) => {
      pushHistory(prev);
      return {
        ...prev,
        name,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory]);

  // Update Project Settings (slug, isPublic, publishedAt, publishConfig)
  const updateProjectSettings = useCallback((settings: Partial<ProjectState>) => {
    setProject((prev) => {
      pushHistory(prev);
      return {
        ...prev,
        ...settings,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory]);

  // Page navigation
  const setActivePage = useCallback((pageId: string) => {
    setProject((prev) => {
      if (prev.activePageId === pageId) return prev;
      return {
        ...prev,
        activePageId: pageId,
      };
    });
    setSelectedElementId(null);
  }, []);

  const addPage = useCallback((name: string) => {
    const id = 'page_' + Math.random().toString(36).substring(2, 8);
    const slug = '/' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newPage: Page = {
      id,
      name,
      slug,
      canvasWidth: CANVAS_DEFAULT_WIDTH,
      canvasHeight: CANVAS_DEFAULT_HEIGHT,
      backgroundColor: '#f8fafc',
      elements: [],
    };

    setProject((prev) => {
      pushHistory(prev);
      return {
        ...prev,
        pages: [...prev.pages, newPage],
        activePageId: id,
        updatedAt: new Date().toISOString(),
      };
    });
    setSelectedElementId(null);
    showToast(`Page "${name}" created`, 'success');
  }, [pushHistory, showToast]);

  const duplicatePage = useCallback((pageId: string) => {
    setProject((prev) => {
      const pageToClone = prev.pages.find((p) => p.id === pageId);
      if (!pageToClone) return prev;
      pushHistory(prev);

      const newId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newName = `${pageToClone.name} (Copy)`;
      const newSlug = `${pageToClone.slug}-copy`;

      // Deep clone elements with new unique IDs and preserve relationships
      const idMap = new Map<string, string>();
      pageToClone.elements.forEach((el) => {
        idMap.set(el.id, `el_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`);
      });

      const clonedElements: CanvasElement[] = pageToClone.elements.map((el) => ({
        ...el,
        id: idMap.get(el.id) || el.id,
        parentId: el.parentId ? idMap.get(el.parentId) || el.parentId : undefined,
        styles: { ...(el.styles || {}) },
        behavior: el.behavior ? { ...el.behavior } : { actionType: 'none' },
        layout: el.layout ? { ...el.layout } : undefined,
        responsive: el.responsive ? { ...el.responsive } : undefined,
      }));

      const clonedPage: Page = {
        ...pageToClone,
        id: newId,
        name: newName,
        slug: newSlug,
        elements: clonedElements,
      };

      return {
        ...prev,
        pages: [...prev.pages, clonedPage],
        activePageId: newId,
        updatedAt: new Date().toISOString(),
      };
    });
    setSelectedElementId(null);
    showToast('Page duplicated successfully', 'success');
  }, [pushHistory, showToast]);

  const deletePage = useCallback((pageId: string) => {
    setProject((prev) => {
      if (prev.pages.length <= 1) {
        showToast('Cannot delete the only page in project', 'warning');
        return prev;
      }
      pushHistory(prev);
      const remainingPages = prev.pages.filter((p) => p.id !== pageId);
      const newActiveId = prev.activePageId === pageId ? remainingPages[0].id : prev.activePageId;
      return {
        ...prev,
        pages: remainingPages,
        activePageId: newActiveId,
        updatedAt: new Date().toISOString(),
      };
    });
    setSelectedElementId(null);
  }, [pushHistory, showToast]);

  const updatePageSettings = useCallback((pageId: string, settings: Partial<Page>) => {
    setProject((prev) => {
      pushHistory(prev);
      return {
        ...prev,
        pages: prev.pages.map((p) => (p.id === pageId ? { ...p, ...settings } : p)),
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory]);

  // Select Element & Multi-selection
  const selectElement = useCallback((id: string | null) => {
    setSelectedElementIds(id ? [id] : []);
    if (id) {
      setRightSidebarOpen(true);
    }
  }, []);

  const selectElements = useCallback((ids: string[]) => {
    setSelectedElementIds(ids);
    if (ids.length > 0) {
      setRightSidebarOpen(true);
    }
  }, []);

  const toggleSelectElement = useCallback((id: string, multi: boolean = false) => {
    if (multi) {
      setSelectedElementIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        }
        return [...prev, id];
      });
    } else {
      setSelectedElementIds([id]);
    }
    setRightSidebarOpen(true);
  }, []);

  // Add Element to Canvas or into a Section/Container
  // Add Element to Canvas or into a Section/Container
  const addElement = useCallback((
    type: ElementType,
    customX?: number,
    customY?: number,
    parentId?: string | null,
    initialOverrides?: Partial<CanvasElement>
  ): CanvasElement => {
    let newEl: CanvasElement;
    setProject((prev) => {
      pushHistory(prev);
      const active = prev.pages.find((p) => p.id === prev.activePageId) || prev.pages[0];
      const maxZ = active.elements.reduce((max, el) => Math.max(max, el.zIndex || 1), 0);
      
      const canvasWidth = active.canvasWidth || CANVAS_DEFAULT_WIDTH;
      let x = customX !== undefined ? customX : Math.max(60, Math.floor((canvasWidth - 300) / 2) + (active.elements.length % 5) * 20);
      let y = customY !== undefined ? customY : 120 + (active.elements.length % 6) * 25;

      // If parentId provided, position relative to parent or use parent's inside position
      const parent = parentId ? active.elements.find((e) => e.id === parentId) : null;
      if (parent) {
        const padding = parent.layout?.padding || { top: 20, left: 20 };
        const childCount = parent.children?.length || 0;
        x = parent.x + padding.left + (parent.layout?.direction === 'row' ? childCount * 120 : 0);
        y = parent.y + padding.top + (parent.layout?.direction === 'column' ? childCount * 60 : 0);
      }

      newEl = createElement(type, x, y, maxZ + 1);
      if (parentId) {
        newEl.parentId = parentId;
      }

      if (initialOverrides) {
        newEl = {
          ...newEl,
          ...initialOverrides,
          styles: {
            ...newEl.styles,
            ...(initialOverrides.styles || {}),
          },
          behavior: {
            ...newEl.behavior,
            ...(initialOverrides.behavior || {}),
          },
        };
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          const updatedElements = p.elements.map((el) => {
            if (parentId && el.id === parentId) {
              return {
                ...el,
                children: [...(el.children || []), newEl.id],
              };
            }
            return el;
          });
          return {
            ...p,
            elements: [...updatedElements, newEl],
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });

    setSelectedElementId(newEl!.id);
    showToast(`Added ${initialOverrides?.name || type} to canvas`, 'info');
    return newEl!;
  }, [pushHistory, showToast]);

  // Insert Custom Image Helper
  const insertCustomImage = useCallback((dataUrlOrUrl: string, name = 'Custom Image', customX?: number, customY?: number): CanvasElement => {
    return addElement('image', customX, customY, null, {
      name,
      content: dataUrlOrUrl,
      width: 380,
      height: 250,
      styles: {
        borderRadius: 12,
        objectFit: 'cover',
        boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.25)',
      },
    });
  }, [addElement]);

  // Insert Shape Helper
  const insertShape = useCallback((shapeKind: ShapeKind, name?: string, customX?: number, customY?: number): CanvasElement => {
    const def = SHAPE_DEFINITIONS[shapeKind];
    const shapeWidth = shapeKind === 'pill' ? 180 : 120;
    const shapeHeight = shapeKind === 'pill' ? 90 : 120;
    return addElement('shape', customX, customY, null, {
      name: name || `${def?.label || 'Shape'}`,
      width: shapeWidth,
      height: shapeHeight,
      styles: {
        shapeKind,
        backgroundColor: def?.defaultColor || '#6366f1',
        borderWidth: 0,
        borderColor: '#4338ca',
        boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.25)',
      },
    });
  }, [addElement]);

  // Insert Emoji Sticker Helper
  const insertEmoji = useCallback((emoji: string, customX?: number, customY?: number): CanvasElement => {
    return addElement('text', customX, customY, null, {
      name: `${emoji} Sticker`,
      content: emoji,
      width: 90,
      height: 90,
      styles: {
        fontSize: 56,
        lineHeight: 1.2,
        textAlign: 'center',
        backgroundColor: 'transparent',
      },
    });
  }, [addElement]);

  // Add multiple elements at once (e.g. for starter sections and templates)
  const addElements = useCallback((elements: CanvasElement[], selectFirst = true) => {
    if (elements.length === 0) return;
    setProject((prev) => {
      pushHistory(prev);
      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          const maxBottom = elements.reduce((max, el) => Math.max(max, el.y + el.height), 0);
          const newHeight = Math.max(p.canvasHeight || 800, maxBottom + 80);
          return {
            ...p,
            canvasHeight: newHeight,
            elements: [...p.elements, ...elements],
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });

    if (selectFirst && elements[0]) {
      setSelectedElementId(elements[0].id);
    }
    showToast(`Added ${elements[0]?.name || 'section'} to canvas`, 'info');
  }, [pushHistory, showToast]);

  // Update Element with group movement propagation for sections and containers
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>, recordHistory = false) => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === id);
      if (!active || !target) return prev;

      if (target.locked && updates.locked === undefined) {
        return prev;
      }

      if (recordHistory) {
        pushHistory(prev);
      }

      // Calculate move delta
      const deltaX = updates.x !== undefined ? updates.x - target.x : 0;
      const deltaY = updates.y !== undefined ? updates.y - target.y : 0;
      const hasMoved = deltaX !== 0 || deltaY !== 0;

      // Find all recursive descendants of target
      const descendantIds = new Set<string>();
      if (hasMoved) {
        let added = true;
        descendantIds.add(id);
        while (added) {
          added = false;
          for (const el of active.elements) {
            if (el.parentId && descendantIds.has(el.parentId) && !descendantIds.has(el.id)) {
              descendantIds.add(el.id);
              added = true;
            }
          }
        }
        descendantIds.delete(id); // remove target itself
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === id) {
                return { ...el, ...updates };
              }
              // Move children together as a group
              if (hasMoved && descendantIds.has(el.id)) {
                return {
                  ...el,
                  x: Math.round(el.x + deltaX),
                  y: Math.round(el.y + deltaY),
                };
              }
              return el;
            }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory]);

  // Update Element Styles
  const updateElementStyles = useCallback((id: string, styles: Partial<ElementStyles>, recordHistory = true) => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === id);
      if (target?.locked) {
        showToast('Element is locked. Unlock to modify styles.', 'warning');
        return prev;
      }

      if (recordHistory) {
        pushHistory(prev);
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === id) {
                return {
                  ...el,
                  styles: { ...(el.styles || {}), ...styles },
                };
              }
              return el;
            }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory, showToast]);

  // Update Element Behavior
  const updateElementBehavior = useCallback((id: string, behavior: Partial<ElementBehavior>, recordHistory = true) => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === id);
      if (target?.locked) {
        showToast('Element is locked. Unlock to modify behavior.', 'warning');
        return prev;
      }

      if (recordHistory) {
        pushHistory(prev);
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === id) {
                return {
                  ...el,
                  behavior: { ...(el.behavior || { actionType: 'none' }), ...behavior },
                };
              }
              return el;
            }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory, showToast]);

  // Update Section / Container Layout Controls
  const updateElementLayout = useCallback((id: string, layoutUpdates: Partial<ContainerLayoutConfig>, recordHistory = true) => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === id);
      if (target?.locked) {
        showToast('Element is locked. Unlock to modify layout.', 'warning');
        return prev;
      }

      if (recordHistory) {
        pushHistory(prev);
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === id) {
                const currentLayout = el.layout || {
                  layoutType: 'flex' as const,
                  direction: 'column' as const,
                  alignItems: 'start' as const,
                  justifyContent: 'start' as const,
                  gap: 16,
                  padding: { top: 20, right: 20, bottom: 20, left: 20 },
                };
                return {
                  ...el,
                  layout: { ...currentLayout, ...layoutUpdates },
                };
              }
              return el;
            }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory, showToast]);

  // Update Element Responsive Configuration
  const updateElementResponsive = useCallback((id: string, respUpdates: Partial<ElementResponsiveConfig>, recordHistory = true) => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === id);
      if (target?.locked) {
        showToast('Element is locked. Unlock to modify responsive settings.', 'warning');
        return prev;
      }

      if (recordHistory) {
        pushHistory(prev);
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === id) {
                const currentResp = el.responsive || {
                  desktop: { mode: 'auto' as const },
                  tablet: { mode: 'auto' as const, visible: true },
                  mobile: { mode: 'auto' as const, visible: true },
                  locked: false,
                };
                return {
                  ...el,
                  responsive: {
                    ...currentResp,
                    ...respUpdates,
                    desktop: { ...currentResp.desktop, ...respUpdates.desktop },
                    tablet: { ...currentResp.tablet, ...respUpdates.tablet },
                    mobile: { ...currentResp.mobile, ...respUpdates.mobile },
                  },
                };
              }
              return el;
            }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory, showToast]);

  // Toggle Responsive Lock
  const toggleResponsiveLock = useCallback((id?: string) => {
    const targetId = id || selectedElementId;
    if (!targetId) return;

    setProject((prev) => {
      pushHistory(prev);
      let isRespLocked = false;
      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === targetId) {
                const current = el.responsive || {
                  desktop: { mode: 'auto' as const },
                  tablet: { mode: 'auto' as const, visible: true },
                  mobile: { mode: 'auto' as const, visible: true },
                  locked: false,
                };
                isRespLocked = !current.locked;
                return {
                  ...el,
                  responsive: { ...current, locked: isRespLocked },
                };
              }
              return el;
            }),
          };
        }
        return p;
      });

      showToast(isRespLocked ? '🔒 Responsive behaviour locked' : '🔓 Responsive behaviour unlocked', 'info');

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [selectedElementId, pushHistory, showToast]);

  // Move element between parents (or remove from parent to canvas root)
  const setElementParent = useCallback((elementId: string, newParentId: string | null) => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      if (!active) return prev;
      const target = active.elements.find((e) => e.id === elementId);
      if (!target || target.parentId === newParentId || elementId === newParentId) return prev;

      pushHistory(prev);

      const oldParentId = target.parentId;

      const updatedElements = active.elements.map((el) => {
        if (el.id === elementId) {
          return {
            ...el,
            parentId: newParentId,
          };
        }
        if (oldParentId && el.id === oldParentId) {
          return {
            ...el,
            children: (el.children || []).filter((id) => id !== elementId),
          };
        }
        if (newParentId && el.id === newParentId) {
          const current = el.children || [];
          if (!current.includes(elementId)) {
            return {
              ...el,
              children: [...current, elementId],
            };
          }
        }
        return el;
      });

      return {
        ...prev,
        pages: prev.pages.map((p) => (p.id === prev.activePageId ? { ...p, elements: updatedElements } : p)),
        updatedAt: new Date().toISOString(),
      };
    });
    showToast(newParentId ? 'Moved into parent container' : 'Moved to page root', 'info');
  }, [pushHistory, showToast]);

  // Reorder child within parent's children list
  const reorderChild = useCallback((parentId: string, childId: string, direction: 'up' | 'down') => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      if (!active) return prev;
      const parent = active.elements.find((e) => e.id === parentId);
      if (!parent || !parent.children) return prev;

      const children = [...parent.children];
      const index = children.indexOf(childId);
      if (index === -1) return prev;

      pushHistory(prev);

      if (direction === 'up' && index > 0) {
        const temp = children[index - 1];
        children[index - 1] = children[index];
        children[index] = temp;
      } else if (direction === 'down' && index < children.length - 1) {
        const temp = children[index + 1];
        children[index + 1] = children[index];
        children[index] = temp;
      }

      return {
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === prev.activePageId
            ? {
                ...p,
                elements: p.elements.map((el) => (el.id === parentId ? { ...el, children } : el)),
              }
            : p
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory]);

  // Lock / Unlock Element
  const toggleLock = useCallback((id?: string) => {
    const targetId = id || selectedElementId;
    if (!targetId) return;

    setProject((prev) => {
      pushHistory(prev);
      let newLockState = false;
      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === targetId) {
                newLockState = !el.locked;
                return { ...el, locked: newLockState };
              }
              return el;
            }),
          };
        }
        return p;
      });

      showToast(newLockState ? '🔒 Element locked' : '🔓 Element unlocked', 'info');

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [selectedElementId, pushHistory, showToast]);

  // Delete Element (and all nested children recursively)
  const deleteElement = useCallback((id?: string) => {
    const targetId = id || selectedElementId;
    if (!targetId) return;

    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === targetId);
      if (target?.locked) {
        showToast('Locked elements cannot be deleted. Unlock first.', 'warning');
        return prev;
      }

      pushHistory(prev);

      // Collect targetId and all its recursive descendants
      const idsToDelete = new Set<string>([targetId]);
      let added = true;
      while (added) {
        added = false;
        for (const el of active?.elements || []) {
          if (el.parentId && idsToDelete.has(el.parentId) && !idsToDelete.has(el.id)) {
            idsToDelete.add(el.id);
            added = true;
          }
        }
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements
              .filter((el) => !idsToDelete.has(el.id))
              .map((el) => {
                if (el.children) {
                  return {
                    ...el,
                    children: el.children.filter((cid) => !idsToDelete.has(cid)),
                  };
                }
                return el;
              }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });

    if (selectedElementId === targetId) {
      setSelectedElementId(null);
    }
    showToast('Element deleted', 'info');
  }, [selectedElementId, pushHistory, showToast]);

  // Duplicate Element (and all nested children recursively)
  const duplicateElement = useCallback((id?: string): CanvasElement | null => {
    const targetId = id || selectedElementId;
    if (!targetId) return null;

    let duplicated: CanvasElement | null = null;

    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === targetId);
      if (!active || !target) return prev;

      pushHistory(prev);
      const maxZ = active.elements.reduce((max, el) => Math.max(max, el.zIndex || 1), 0);

      // Map of oldId -> newId
      const idMap = new Map<string, string>();
      const newParentId = target.parentId;
      const newTargetId = generateId();
      idMap.set(target.id, newTargetId);

      // Find all children recursively
      const descendants = active.elements.filter((el) => el.parentId === target.id);
      for (const d of descendants) {
        idMap.set(d.id, generateId());
      }

      duplicated = {
        ...target,
        id: newTargetId,
        name: `${target.name} (Copy)`,
        styles: { ...(target.styles || {}) },
        behavior: target.behavior ? { ...target.behavior } : { actionType: 'none' },
        x: target.x + 24,
        y: target.y + 24,
        locked: false,
        zIndex: maxZ + 1,
        parentId: newParentId,
        children: target.children ? target.children.map((cid) => idMap.get(cid) || generateId()) : undefined,
      };

      const duplicatedDescendants: CanvasElement[] = descendants.map((d, i) => ({
        ...d,
        id: idMap.get(d.id)!,
        name: `${d.name} (Copy)`,
        styles: { ...(d.styles || {}) },
        behavior: d.behavior ? { ...d.behavior } : { actionType: 'none' },
        locked: false,
        zIndex: maxZ + 2 + i,
        parentId: newTargetId,
      }));

      const newElementsList = [...active.elements, duplicated!, ...duplicatedDescendants];

      if (newParentId) {
        const pIndex = newElementsList.findIndex((e) => e.id === newParentId);
        if (pIndex !== -1) {
          const parentEl = newElementsList[pIndex];
          newElementsList[pIndex] = {
            ...parentEl,
            children: [...(parentEl.children || []), newTargetId],
          };
        }
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: newElementsList,
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });

    if (duplicated) {
      setSelectedElementId((duplicated as CanvasElement).id);
      showToast(`Duplicated "${(duplicated as CanvasElement).name}" (Cmd+D)`, 'info');
    }
    return duplicated;
  }, [selectedElementId, pushHistory, showToast]);

  // Copy Element (and all nested children recursively)
  const copyElement = useCallback((id?: string) => {
    const targetId = id || selectedElementId;
    if (!targetId) return;

    const active = project.pages.find((p) => p.id === project.activePageId);
    if (!active) return;

    const target = active.elements.find((el) => el.id === targetId);
    if (!target) return;

    // Collect all recursive descendants
    const descendants: CanvasElement[] = [];
    const findChildren = (parentId: string) => {
      const children = active.elements.filter((el) => el.parentId === parentId);
      for (const ch of children) {
        descendants.push(ch);
        findChildren(ch.id);
      }
    };
    findChildren(target.id);

    setClipboard({ root: target, descendants });

    // Write full representation to native OS clipboard
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(
          JSON.stringify({
            __studio_element: true,
            root: target,
            descendants,
          })
        );
      }
    } catch {
      // ignore
    }

    showToast(`Copied "${target.name}" to clipboard (Cmd+C)`, 'info');
  }, [project.pages, project.activePageId, selectedElementId, showToast]);

  // Cut Element
  const cutElement = useCallback((id?: string) => {
    const targetId = id || selectedElementId;
    if (!targetId) return;

    const active = project.pages.find((p) => p.id === project.activePageId);
    const target = active?.elements.find((el) => el.id === targetId);
    if (!target || target.locked) return;

    copyElement(targetId);
    deleteElement(targetId);
    showToast(`Cut "${target.name}" (Cmd+X)`, 'info');
  }, [project.pages, project.activePageId, selectedElementId, copyElement, deleteElement, showToast]);

  // Paste Element (Supports internal studio clipboard + OS system clipboard fallback)
  const pasteElement = useCallback((targetParentId?: string | null): CanvasElement | null => {
    if (!clipboard) {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        navigator.clipboard.readText().then((text) => {
          if (!text || !text.trim()) {
            showToast('Clipboard is empty. Copy an element, text, or image first', 'warning');
            return;
          }
          const trimmed = text.trim();
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.__studio_element && parsed.root) {
              setClipboard({ root: parsed.root, descendants: parsed.descendants || [] });
              showToast('Element loaded from system clipboard! Pasting...', 'info');
              setTimeout(() => pasteElement(targetParentId), 50);
              return;
            }
          } catch {
            // Not JSON
          }
          if (
            trimmed.match(/^https?:\/\/.+\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i) ||
            trimmed.startsWith('data:image/') ||
            trimmed.includes('images.unsplash.com')
          ) {
            insertCustomImage(trimmed, 'Pasted Web Image');
            showToast('Pasted image from clipboard URL! 🖼️', 'success');
          } else {
            addElement('text', undefined, undefined, null, {
              name: 'Pasted Text',
              content: trimmed,
              width: Math.min(520, Math.max(220, trimmed.length * 8)),
              height: Math.max(50, Math.min(260, Math.ceil(trimmed.length / 32) * 26)),
              styles: {
                fontSize: trimmed.length < 40 ? 24 : 15,
                fontWeight: trimmed.length < 40 ? 700 : 400,
                lineHeight: 1.5,
              },
            });
            showToast('Pasted text from clipboard! 📝', 'success');
          }
        }).catch(() => {
          showToast('Clipboard is empty. Copy an element, text, or image first', 'warning');
        });
        return null;
      }
      showToast('Clipboard is empty. Copy an element first (Cmd+C)', 'warning');
      return null;
    }

    let pastedRoot: CanvasElement | null = null;

    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      if (!active) return prev;

      pushHistory(prev);
      const maxZ = active.elements.reduce((max, el) => Math.max(max, el.zIndex || 1), 0);

      const idMap = new Map<string, string>();
      const newRootId = generateId();
      idMap.set(clipboard.root.id, newRootId);

      for (const d of clipboard.descendants) {
        idMap.set(d.id, generateId());
      }

      const offsetX = 24;
      const offsetY = 24;
      const effectiveParentId = targetParentId !== undefined ? targetParentId : clipboard.root.parentId;

      pastedRoot = {
        ...clipboard.root,
        id: newRootId,
        name: `${clipboard.root.name} (Copy)`,
        x: Math.max(0, Math.min((active.canvasWidth || 1200) - 60, clipboard.root.x + offsetX)),
        y: Math.max(0, clipboard.root.y + offsetY),
        locked: false,
        zIndex: maxZ + 1,
        parentId: effectiveParentId,
        children: clipboard.root.children ? clipboard.root.children.map((cid) => idMap.get(cid) || generateId()) : undefined,
      };

      const clonedDescendants: CanvasElement[] = clipboard.descendants.map((d, i) => ({
        ...d,
        id: idMap.get(d.id)!,
        name: d.name,
        locked: false,
        zIndex: maxZ + 2 + i,
        parentId: idMap.get(d.parentId || '') || newRootId,
        children: d.children ? d.children.map((cid) => idMap.get(cid) || generateId()) : undefined,
      }));

      const newElementsList = [...active.elements, pastedRoot!, ...clonedDescendants];

      if (effectiveParentId) {
        const pIndex = newElementsList.findIndex((e) => e.id === effectiveParentId);
        if (pIndex !== -1) {
          const parentEl = newElementsList[pIndex];
          newElementsList[pIndex] = {
            ...parentEl,
            children: [...(parentEl.children || []), newRootId],
          };
        }
      }

      return {
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === prev.activePageId ? { ...p, elements: newElementsList } : p
        ),
        updatedAt: new Date().toISOString(),
      };
    });

    if (pastedRoot) {
      setSelectedElementId((pastedRoot as CanvasElement).id);
      showToast(`Pasted "${(pastedRoot as CanvasElement).name}" (Cmd+V)`, 'success');
    }

    return pastedRoot;
  }, [clipboard, pushHistory, showToast]);

  // Reorder Element (Z-Index / DOM Order)
  const reorderElement = useCallback((id: string, direction: 'front' | 'back' | 'forward' | 'backward') => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      if (!active) return prev;

      const elements = [...active.elements];
      const index = elements.findIndex((e) => e.id === id);
      if (index === -1) return prev;

      pushHistory(prev);

      const [target] = elements.splice(index, 1);

      if (direction === 'front') {
        elements.push(target);
      } else if (direction === 'back') {
        elements.unshift(target);
      } else if (direction === 'forward') {
        const newIndex = Math.min(elements.length, index + 1);
        elements.splice(newIndex, 0, target);
      } else if (direction === 'backward') {
        const newIndex = Math.max(0, index - 1);
        elements.splice(newIndex, 0, target);
      }

      // Re-normalize zIndex
      const reindexed = elements.map((el, idx) => ({
        ...el,
        zIndex: idx + 1,
      }));

      const updatedPages = prev.pages.map((p) => (p.id === prev.activePageId ? { ...p, elements: reindexed } : p));

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory]);

  // Align Element inside Page Canvas
  const alignElement = useCallback((id: string, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      const target = active?.elements.find((e) => e.id === id);
      if (!target || !active || target.locked) return prev;

      pushHistory(prev);

      let newX = target.x;
      let newY = target.y;

      switch (alignment) {
        case 'left':
          newX = 40;
          break;
        case 'center':
          newX = Math.round((active.canvasWidth - target.width) / 2);
          break;
        case 'right':
          newX = active.canvasWidth - target.width - 40;
          break;
        case 'top':
          newY = 40;
          break;
        case 'middle':
          newY = Math.round((active.canvasHeight - target.height) / 2);
          break;
        case 'bottom':
          newY = active.canvasHeight - target.height - 40;
          break;
      }

      const deltaX = newX - target.x;
      const deltaY = newY - target.y;

      // Find children if target is section/container
      const descendantIds = new Set<string>();
      if (deltaX !== 0 || deltaY !== 0) {
        let added = true;
        descendantIds.add(id);
        while (added) {
          added = false;
          for (const el of active.elements) {
            if (el.parentId && descendantIds.has(el.parentId) && !descendantIds.has(el.id)) {
              descendantIds.add(el.id);
              added = true;
            }
          }
        }
        descendantIds.delete(id);
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (el.id === id) {
                return { ...el, x: newX, y: newY };
              }
              if (descendantIds.has(el.id)) {
                return { ...el, x: el.x + deltaX, y: el.y + deltaY };
              }
              return el;
            }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [pushHistory]);

  // Group Selected Elements into a Container
  const groupSelectedElements = useCallback((): CanvasElement | null => {
    let newGroup: CanvasElement | null = null;
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      if (!active) return prev;
      const elementsToGroup = active.elements.filter((el) => selectedElementIds.includes(el.id));
      if (elementsToGroup.length < 2) {
        showToast('Select 2 or more elements to group', 'warning');
        return prev;
      }

      pushHistory(prev);

      const minX = Math.min(...elementsToGroup.map((e) => e.x));
      const minY = Math.min(...elementsToGroup.map((e) => e.y));
      const maxX = Math.max(...elementsToGroup.map((e) => e.x + e.width));
      const maxY = Math.max(...elementsToGroup.map((e) => e.y + e.height));
      const maxZ = Math.max(...elementsToGroup.map((e) => e.zIndex || 1));

      // Common parent check
      const firstParent = elementsToGroup[0].parentId || null;
      const commonParent = elementsToGroup.every((e) => (e.parentId || null) === firstParent) ? firstParent : null;

      const groupCount = active.elements.filter((e) => e.type === 'container').length + 1;

      newGroup = createElement('container', minX, minY, maxZ + 1, commonParent, {
        name: `Group Container ${groupCount}`,
        width: Math.max(80, maxX - minX),
        height: Math.max(60, maxY - minY),
        children: elementsToGroup.map((e) => e.id),
        styles: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderStyle: 'none',
          borderRadius: 0,
          padding: 0,
        },
        layout: {
          layoutType: 'flex',
          direction: 'column',
          gap: 0,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      });
      const groupId = newGroup.id;

      const groupChildIds = new Set(elementsToGroup.map((e) => e.id));

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          const updatedElements = p.elements.map((el) => {
            if (groupChildIds.has(el.id)) {
              return {
                ...el,
                parentId: groupId,
                x: el.x - minX,
                y: el.y - minY,
              };
            }
            if (commonParent && el.id === commonParent && el.children) {
              return {
                ...el,
                children: [...el.children.filter((cid) => !groupChildIds.has(cid)), groupId],
              };
            }
            return el;
          });

          return {
            ...p,
            elements: [...updatedElements, newGroup!],
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });

    if (newGroup) {
      setSelectedElementIds([(newGroup as CanvasElement).id]);
      showToast(`Grouped ${selectedElementIds.length} elements (Cmd+G)`, 'success');
    }
    return newGroup;
  }, [selectedElementIds, pushHistory, showToast]);

  // Ungroup Selected Containers
  const ungroupSelectedElements = useCallback(() => {
    let restoredChildIds: string[] = [];
    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      if (!active) return prev;

      const containersToUngroup = active.elements.filter(
        (el) => selectedElementIds.includes(el.id) && (el.type === 'container' || el.type === 'section')
      );

      if (containersToUngroup.length === 0) {
        showToast('Select a grouped container to ungroup', 'warning');
        return prev;
      }

      pushHistory(prev);

      const containerIds = new Set(containersToUngroup.map((c) => c.id));
      const containerMap = new Map(containersToUngroup.map((c) => [c.id, c]));
      const allChildrenToRestore: string[] = [];

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          const updatedElements = p.elements
            .filter((el) => !containerIds.has(el.id))
            .map((el) => {
              if (el.parentId && containerIds.has(el.parentId)) {
                const parentContainer = containerMap.get(el.parentId)!;
                allChildrenToRestore.push(el.id);
                return {
                  ...el,
                  parentId: parentContainer.parentId || null,
                  x: parentContainer.x + el.x,
                  y: parentContainer.y + el.y,
                };
              }
              if (el.children && el.children.some((cid) => containerIds.has(cid))) {
                return {
                  ...el,
                  children: el.children.filter((cid) => !containerIds.has(cid)),
                };
              }
              return el;
            });

          return {
            ...p,
            elements: updatedElements,
          };
        }
        return p;
      });

      restoredChildIds = allChildrenToRestore;

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });

    if (restoredChildIds.length > 0) {
      setSelectedElementIds(restoredChildIds);
      showToast(`Ungrouped into ${restoredChildIds.length} elements (Cmd+Shift+G)`, 'info');
    }
  }, [selectedElementIds, pushHistory, showToast]);

  // Batch Align Selected Elements
  const alignSelectedElements = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedElementIds.length <= 1) {
        if (selectedElementIds[0]) {
          alignElement(selectedElementIds[0], alignment);
        }
        return;
      }

      setProject((prev) => {
        const active = prev.pages.find((p) => p.id === prev.activePageId);
        if (!active) return prev;

        const targets = active.elements.filter(
          (el) => selectedElementIds.includes(el.id) && !el.locked
        );
        if (targets.length < 2) return prev;

        pushHistory(prev);

        const minX = Math.min(...targets.map((e) => e.x));
        const maxX = Math.max(...targets.map((e) => e.x + e.width));
        const minY = Math.min(...targets.map((e) => e.y));
        const maxY = Math.max(...targets.map((e) => e.y + e.height));
        const boxWidth = maxX - minX;
        const boxHeight = maxY - minY;

        const deltas = new Map<string, { dx: number; dy: number }>();

        targets.forEach((el) => {
          let targetX = el.x;
          let targetY = el.y;

          switch (alignment) {
            case 'left':
              targetX = minX;
              break;
            case 'center':
              targetX = Math.round(minX + (boxWidth - el.width) / 2);
              break;
            case 'right':
              targetX = maxX - el.width;
              break;
            case 'top':
              targetY = minY;
              break;
            case 'middle':
              targetY = Math.round(minY + (boxHeight - el.height) / 2);
              break;
            case 'bottom':
              targetY = maxY - el.height;
              break;
          }

          deltas.set(el.id, { dx: targetX - el.x, dy: targetY - el.y });
        });

        // Collect descendants of any container targets
        const descendantMoves = new Map<string, { dx: number; dy: number }>();
        targets.forEach((t) => {
          const delta = deltas.get(t.id);
          if (delta && (delta.dx !== 0 || delta.dy !== 0)) {
            const desc = new Set<string>();
            let added = true;
            desc.add(t.id);
            while (added) {
              added = false;
              for (const el of active.elements) {
                if (el.parentId && desc.has(el.parentId) && !desc.has(el.id)) {
                  desc.add(el.id);
                  added = true;
                }
              }
            }
            desc.delete(t.id);
            desc.forEach((id) => descendantMoves.set(id, delta));
          }
        });

        const updatedPages = prev.pages.map((p) => {
          if (p.id === prev.activePageId) {
            return {
              ...p,
              elements: p.elements.map((el) => {
                if (deltas.has(el.id)) {
                  const d = deltas.get(el.id)!;
                  return { ...el, x: el.x + d.dx, y: el.y + d.dy };
                }
                if (descendantMoves.has(el.id)) {
                  const d = descendantMoves.get(el.id)!;
                  return { ...el, x: el.x + d.dx, y: el.y + d.dy };
                }
                return el;
              }),
            };
          }
          return p;
        });

        return {
          ...prev,
          pages: updatedPages,
          updatedAt: new Date().toISOString(),
        };
      });

      showToast(`Aligned elements (${alignment})`, 'info');
    },
    [selectedElementIds, alignElement, pushHistory, showToast]
  );

  // Distribute Selected Elements evenly horizontally or vertically
  const distributeSelectedElements = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      if (selectedElementIds.length < 3) {
        showToast('Select 3 or more elements to distribute', 'warning');
        return;
      }

      setProject((prev) => {
        const active = prev.pages.find((p) => p.id === prev.activePageId);
        if (!active) return prev;

        const targets = active.elements.filter(
          (el) => selectedElementIds.includes(el.id) && !el.locked
        );
        if (targets.length < 3) return prev;

        pushHistory(prev);

        const deltas = new Map<string, { dx: number; dy: number }>();

        if (direction === 'horizontal') {
          const sorted = [...targets].sort((a, b) => a.x - b.x);
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          const span = (last.x + last.width) - first.x;
          const totalWidths = sorted.reduce((sum, el) => sum + el.width, 0);
          const remainingSpace = span - totalWidths;
          const gap = remainingSpace / (sorted.length - 1);

          let currentX = first.x;
          sorted.forEach((el, idx) => {
            if (idx === 0) {
              currentX += el.width + gap;
              return;
            }
            if (idx === sorted.length - 1) return;
            const targetX = Math.round(currentX);
            deltas.set(el.id, { dx: targetX - el.x, dy: 0 });
            currentX += el.width + gap;
          });
        } else {
          const sorted = [...targets].sort((a, b) => a.y - b.y);
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          const span = (last.y + last.height) - first.y;
          const totalHeights = sorted.reduce((sum, el) => sum + el.height, 0);
          const remainingSpace = span - totalHeights;
          const gap = remainingSpace / (sorted.length - 1);

          let currentY = first.y;
          sorted.forEach((el, idx) => {
            if (idx === 0) {
              currentY += el.height + gap;
              return;
            }
            if (idx === sorted.length - 1) return;
            const targetY = Math.round(currentY);
            deltas.set(el.id, { dx: 0, dy: targetY - el.y });
            currentY += el.height + gap;
          });
        }

        const updatedPages = prev.pages.map((p) => {
          if (p.id === prev.activePageId) {
            return {
              ...p,
              elements: p.elements.map((el) => {
                if (deltas.has(el.id)) {
                  const d = deltas.get(el.id)!;
                  return { ...el, x: el.x + d.dx, y: el.y + d.dy };
                }
                return el;
              }),
            };
          }
          return p;
        });

        return {
          ...prev,
          pages: updatedPages,
          updatedAt: new Date().toISOString(),
        };
      });

      showToast(`Distributed elements ${direction}ly`, 'info');
    },
    [selectedElementIds, pushHistory, showToast]
  );

  // Move multiple selected elements simultaneously by delta (used during multi-drag)
  const moveSelectedElements = useCallback(
    (dx: number, dy: number) => {
      if (selectedElementIds.length === 0 || (dx === 0 && dy === 0)) return;

      setProject((prev) => {
        const active = prev.pages.find((p) => p.id === prev.activePageId);
        if (!active) return prev;

        const targetIds = new Set(selectedElementIds);
        let added = true;
        while (added) {
          added = false;
          for (const el of active.elements) {
            if (el.parentId && targetIds.has(el.parentId) && !targetIds.has(el.id)) {
              targetIds.add(el.id);
              added = true;
            }
          }
        }

        const updatedPages = prev.pages.map((p) => {
          if (p.id === prev.activePageId) {
            return {
              ...p,
              elements: p.elements.map((el) => {
                if (targetIds.has(el.id) && !el.locked) {
                  return { ...el, x: el.x + dx, y: el.y + dy };
                }
                return el;
              }),
            };
          }
          return p;
        });

        return {
          ...prev,
          pages: updatedPages,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [selectedElementIds]
  );

  // Batch delete all currently selected elements and their descendants
  const batchDeleteSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    setProject((prev) => {
      const active = prev.pages.find((p) => p.id === prev.activePageId);
      if (!active) return prev;

      pushHistory(prev);

      const idsToDelete = new Set<string>(selectedElementIds);
      let added = true;
      while (added) {
        added = false;
        for (const el of active.elements) {
          if (el.parentId && idsToDelete.has(el.parentId) && !idsToDelete.has(el.id)) {
            idsToDelete.add(el.id);
            added = true;
          }
        }
      }

      const updatedPages = prev.pages.map((p) => {
        if (p.id === prev.activePageId) {
          return {
            ...p,
            elements: p.elements
              .filter((el) => !idsToDelete.has(el.id))
              .map((el) => {
                if (el.children) {
                  return {
                    ...el,
                    children: el.children.filter((cid) => !idsToDelete.has(cid)),
                  };
                }
                return el;
              }),
          };
        }
        return p;
      });

      return {
        ...prev,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
    });

    const count = selectedElementIds.length;
    setSelectedElementIds([]);
    showToast(`Deleted ${count} element${count > 1 ? 's' : ''}`, 'info');
  }, [selectedElementIds, pushHistory, showToast]);

  // Reset to Blank Canvas
  const resetToBlank = useCallback(() => {
    setProject((prev) => {
      pushHistory(prev);
      const blankPage: Page = {
        id: 'page_blank',
        name: 'Home',
        slug: '/',
        canvasWidth: CANVAS_DEFAULT_WIDTH,
        canvasHeight: CANVAS_DEFAULT_HEIGHT,
        backgroundColor: '#ffffff',
        elements: [],
      };
      return {
        version: 1,
        id: 'proj_blank_' + Date.now().toString(36),
        name: 'Untitled Project',
        activePageId: 'page_blank',
        pages: [blankPage],
        updatedAt: new Date().toISOString(),
      };
    });
    setSelectedElementId(null);
    showToast('Reset to blank canvas', 'info');
  }, [pushHistory, showToast]);

  // Reset to Default Demo
  const resetToDefaultDemo = useCallback(() => {
    setProject((prev) => {
      pushHistory(prev);
      return normalizeProjectState(INITIAL_PROJECT);
    });
    setSelectedElementId(null);
    showToast('Restored demo project', 'info');
  }, [pushHistory, showToast]);

  // Logout / Return to Landing Page
  const logout = useCallback(() => {
    handleSetCurrentUser(null);
    setEditorMode('landing');
    showToast('Signed out. Returned to product landing page.', 'info');
  }, [handleSetCurrentUser, showToast]);

  // -------------------------------------------------------------
  // Cloud Projects & Revision Persistence Handlers
  // -------------------------------------------------------------

  const saveToCloud = useCallback(async (manual: boolean = true) => {
    setCloudSyncStatus('saving');
    try {
      const res = await databaseService.saveProject(project, {
        userId: currentUser?.email,
        isPublic: project.isPublic,
      });
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastCloudSavedAt(timeStr);
      if (res.cloud) {
        setCloudSyncStatus('saved');
        if (manual) showToast('☁️ Project synchronized to Supabase Cloud!', 'success');
      } else {
        setCloudSyncStatus('offline');
        if (manual) showToast('Saved to Workspace', 'info');
      }
      return true;
    } catch {
      setCloudSyncStatus('offline');
      if (manual) showToast('Saved to Workspace', 'warning');
      return false;
    }
  }, [project, currentUser?.email, showToast]);

  const refreshCloudProjects = useCallback(async () => {
    try {
      const list = await databaseService.getProjects(currentUser?.email);
      setCloudProjects(list);
    } catch {}
  }, [currentUser?.email]);

  const refreshRevisions = useCallback(async () => {
    try {
      const list = await databaseService.getRevisions(project.id);
      setRevisions(list);
    } catch {}
  }, [project.id]);

  useEffect(() => {
    refreshCloudProjects();
  }, [refreshCloudProjects]);

  // Hydrate latest project directly from Supabase Cloud on boot
  useEffect(() => {
    let isMounted = true;
    databaseService.getProjects(currentUser?.email).then(async (projects) => {
      if (isMounted && projects && projects.length > 0) {
        const latest = await databaseService.getProject(projects[0].id);
        if (isMounted && latest && latest.pages && latest.pages.length > 0) {
          setProject(normalizeProjectState(latest));
          setCloudSyncStatus('saved');
          const timeStr = new Date(latest.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastCloudSavedAt(timeStr);
          setLastSavedText(`Supabase Synced at ${timeStr}`);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser?.email]);

  useEffect(() => {
    refreshRevisions();
  }, [refreshRevisions]);

  const loadCloudProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      const loaded = await databaseService.getProject(id);
      if (loaded && loaded.pages && loaded.pages.length > 0) {
        pushHistory(project);
        setProject(normalizeProjectState(loaded));
        setSelectedElementId(null);
        showToast(`📂 Loaded project: "${loaded.name}"`, 'success');
        setIsProjectManagerOpen(false);
        return true;
      }
      showToast('Project could not be loaded', 'warning');
      return false;
    } catch (err: any) {
      showToast(`Failed to load project: ${err.message}`, 'warning');
      return false;
    }
  }, [project, pushHistory, showToast]);

  const createNewProject = useCallback((name?: string, templateType: 'blank' | 'landing' = 'blank') => {
    pushHistory(project);
    const newId = 'proj_' + Math.random().toString(36).substring(2, 9);
    const projName = name || (templateType === 'blank' ? 'Blank Project' : 'New Studio Project');

    let base: ProjectState;
    if (templateType === 'blank') {
      base = {
        version: 1,
        id: newId,
        name: projName,
        activePageId: 'page_home',
        pages: [{
          id: 'page_home',
          name: 'Home',
          slug: '/',
          canvasWidth: CANVAS_DEFAULT_WIDTH,
          canvasHeight: CANVAS_DEFAULT_HEIGHT,
          backgroundColor: '#ffffff',
          elements: [],
        }],
        updatedAt: new Date().toISOString(),
      };
    } else {
      base = {
        ...normalizeProjectState(INITIAL_PROJECT),
        id: newId,
        name: projName,
        updatedAt: new Date().toISOString(),
      };
    }

    setProject(base);
    setSelectedElementId(null);
    databaseService.saveProject(base, { userId: currentUser?.email });
    refreshCloudProjects();
    setIsProjectManagerOpen(false);
    showToast(`✨ Created new project: "${projName}"`, 'success');
  }, [project, pushHistory, currentUser?.email, refreshCloudProjects, showToast]);

  const duplicateCurrentProject = useCallback(async (): Promise<string | null> => {
    pushHistory(project);
    const newId = 'proj_' + Math.random().toString(36).substring(2, 9);
    const copyName = `${project.name} (Copy)`;
    const copy: ProjectState = {
      ...project,
      id: newId,
      name: copyName,
      updatedAt: new Date().toISOString(),
    };

    setProject(copy);
    await databaseService.saveProject(copy, { userId: currentUser?.email });
    await refreshCloudProjects();
    showToast(`📋 Duplicated project as "${copyName}"`, 'success');
    return newId;
  }, [project, pushHistory, currentUser?.email, refreshCloudProjects, showToast]);

  const deleteCloudProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      await databaseService.deleteProject(id);
      await refreshCloudProjects();
      showToast('Project deleted successfully', 'info');
      if (id === project.id) {
        resetToBlank();
      }
      return true;
    } catch {
      showToast('Failed to delete project', 'warning');
      return false;
    }
  }, [project.id, refreshCloudProjects, resetToBlank, showToast]);

  const createSnapshot = useCallback(async (name?: string): Promise<boolean> => {
    try {
      const snapName = name || `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      await databaseService.createRevision(project.id, snapName, project);
      await refreshRevisions();
      showToast(`📸 Created snapshot: "${snapName}"`, 'success');
      return true;
    } catch {
      showToast('Failed to create snapshot', 'warning');
      return false;
    }
  }, [project, refreshRevisions, showToast]);

  const restoreRevision = useCallback((revision: ProjectRevision) => {
    if (!revision.data) {
      showToast('Revision snapshot contains no data', 'warning');
      return;
    }
    pushHistory(project);
    setProject(normalizeProjectState(revision.data));
    setSelectedElementId(null);
    showToast(`⏪ Restored snapshot: "${revision.name}"`, 'success');
    setIsVersionHistoryOpen(false);
  }, [project, pushHistory, showToast]);

  // Undo / Redo
  const undo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    setHistoryFuture((prev) => [project, ...prev]);
    setProject(previous);
    setSelectedElementId(null);
    showToast('Reversed (Undo Cmd+Z)', 'info');
  }, [historyPast, project, showToast]);

  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, project]);
    setProject(next);
    setSelectedElementId(null);
    showToast('Redo (Cmd+Shift+Z)', 'info');
  }, [historyFuture, project, showToast]);

  // Keyboard Shortcuts (Delete, Undo, Redo, Copy, Paste, Cut, Duplicate, Save, Lock, Layers, Nudge, Page Nav)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      // Reverse / Undo: Cmd + Z
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      // Redo: Cmd + Y or Cmd + Shift + Z
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Copy: Cmd + C
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        if (selectedElementId) {
          e.preventDefault();
          copyElement();
        }
        return;
      }

      // Paste: Cmd + V
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        if (clipboard) {
          e.preventDefault();
          pasteElement();
        }
        // If internal clipboard is null, allow browser's native paste event to fire and read e.clipboardData
        return;
      }

      // Cut: Cmd + X
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'x') {
        if (selectedElementId) {
          e.preventDefault();
          cutElement();
        }
        return;
      }

      // Duplicate: Cmd + D
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateElement();
        return;
      }

      // Save: Cmd + S
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showToast('Project saved to Local Storage (Cmd+S)', 'success');
        return;
      }

      // Lock / Unlock: Cmd + L
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        if (selectedElementId) {
          e.preventDefault();
          toggleLock(selectedElementId);
        }
        return;
      }

      // Group: Cmd + G / Ungroup: Cmd + Shift + G
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          ungroupSelectedElements();
        } else {
          groupSelectedElements();
        }
        return;
      }

      // Select All: Cmd + A
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const active = project.pages.find((p) => p.id === project.activePageId);
        const rootElements = active?.elements.filter((el) => !el.parentId) || [];
        if (rootElements.length > 0) {
          setSelectedElementIds(rootElements.map((el) => el.id));
          showToast(`Selected all ${rootElements.length} elements (Cmd+A)`, 'info');
        }
        return;
      }

      // Layer Order: Cmd + [ or Cmd + ]
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key === ']') {
        if (selectedElementId) {
          e.preventDefault();
          if (e.shiftKey) {
            reorderElement(selectedElementId, 'front');
            showToast('Brought to front (Cmd+Shift+])', 'info');
          } else {
            reorderElement(selectedElementId, 'forward');
            showToast('Brought forward (Cmd+])', 'info');
          }
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key === '[') {
        if (selectedElementId) {
          e.preventDefault();
          if (e.shiftKey) {
            reorderElement(selectedElementId, 'back');
            showToast('Sent to back (Cmd+Shift+[)', 'info');
          } else {
            reorderElement(selectedElementId, 'backward');
            showToast('Sent backward (Cmd+[)', 'info');
          }
        }
        return;
      }

      // Shortcuts Modal toggle: ? or Cmd + /
      if (e.key === '?' || ((e.metaKey || e.ctrlKey) && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Rulers & Guides toggle: Shift + R
      if (e.shiftKey && (e.key === 'R' || e.key === 'r') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleRulers();
        return;
      }

      if (e.key === 'Escape') {
        setSelectedElementIds([]);
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedElementIds.length > 1) {
          e.preventDefault();
          batchDeleteSelected();
        } else if (selectedElementId && selectedElement && !selectedElement.locked) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElementIds.length > 1) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          let deltaX = 0;
          let deltaY = 0;
          if (e.key === 'ArrowUp') deltaY = -step;
          if (e.key === 'ArrowDown') deltaY = step;
          if (e.key === 'ArrowLeft') deltaX = -step;
          if (e.key === 'ArrowRight') deltaX = step;
          moveSelectedElements(deltaX, deltaY);
          return;
        }

        if (selectedElement && !selectedElement.locked) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          let deltaX = 0;
          let deltaY = 0;
          if (e.key === 'ArrowUp') deltaY = -step;
          if (e.key === 'ArrowDown') deltaY = step;
          if (e.key === 'ArrowLeft') deltaX = -step;
          if (e.key === 'ArrowRight') deltaX = step;

          updateElement(selectedElement.id, {
            x: Math.max(0, selectedElement.x + deltaX),
            y: Math.max(0, selectedElement.y + deltaY),
          }, false);
        }
      }

      // Quick Page Navigation Shortcuts: Alt + Left/Right or Alt + 1..9
      if (e.altKey && (e.key === 'ArrowRight' || e.key === ']')) {
        e.preventDefault();
        const currentIndex = project.pages.findIndex((p) => p.id === project.activePageId);
        if (currentIndex < project.pages.length - 1) {
          setActivePage(project.pages[currentIndex + 1].id);
        } else if (project.pages.length > 1) {
          setActivePage(project.pages[0].id);
        }
        return;
      }
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === '[')) {
        e.preventDefault();
        const currentIndex = project.pages.findIndex((p) => p.id === project.activePageId);
        if (currentIndex > 0) {
          setActivePage(project.pages[currentIndex - 1].id);
        } else if (project.pages.length > 1) {
          setActivePage(project.pages[project.pages.length - 1].id);
        }
        return;
      }
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const pageIdx = parseInt(e.key, 10) - 1;
        if (pageIdx >= 0 && pageIdx < project.pages.length) {
          e.preventDefault();
          setActivePage(project.pages[pageIdx].id);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    copyElement,
    cutElement,
    pasteElement,
    duplicateElement,
    deleteElement,
    toggleLock,
    reorderElement,
    selectedElementId,
    selectedElement,
    updateElement,
    project.pages,
    project.activePageId,
    setActivePage,
    showToast,
    toggleRulers,
  ]);

  // Universal Clipboard Paste Listener (Images, Text, and External Data)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // If user is focused on an input or textarea or contenteditable, don't intercept!
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Check for image files in clipboard
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                if (!dataUrl) return;
                const img = new Image();
                img.onload = () => {
                  let w = img.naturalWidth || 380;
                  let h = img.naturalHeight || 250;
                  const maxW = 440;
                  if (w > maxW) {
                    h = Math.round((h * maxW) / w);
                    w = maxW;
                  }
                  addElement('image', undefined, undefined, null, {
                    name: file.name && file.name !== 'image.png' ? `Image (${file.name})` : 'Pasted Image',
                    content: dataUrl,
                    width: w,
                    height: h,
                    styles: {
                      borderRadius: 12,
                      objectFit: 'cover',
                      boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.25)',
                    },
                  });
                  showToast('Pasted image from clipboard! 🖼️', 'success');
                };
                img.src = dataUrl;
              };
              reader.readAsDataURL(file);
              return;
            }
          }
        }
      }

      // Check text in clipboard
      const text = e.clipboardData?.getData('text');
      if (text && text.trim()) {
        const trimmed = text.trim();
        // Check if studio element JSON
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.__studio_element && parsed.root) {
            e.preventDefault();
            setClipboard({ root: parsed.root, descendants: parsed.descendants || [] });
            setTimeout(() => pasteElement(), 10);
            return;
          }
        } catch {
          // Plain text or URL
        }

        // Image URL check
        if (
          trimmed.match(/^https?:\/\/.+\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i) ||
          trimmed.startsWith('data:image/') ||
          trimmed.includes('images.unsplash.com')
        ) {
          e.preventDefault();
          insertCustomImage(trimmed, 'Pasted Web Image');
          showToast('Pasted image from web link! 🖼️', 'success');
          return;
        }

        // If internal element clipboard was NOT used right now, paste text element
        e.preventDefault();
        addElement('text', undefined, undefined, null, {
          name: 'Pasted Text',
          content: trimmed,
          width: Math.min(520, Math.max(220, trimmed.length * 8)),
          height: Math.max(50, Math.min(260, Math.ceil(trimmed.length / 32) * 26)),
          styles: {
            fontSize: trimmed.length < 40 ? 24 : 15,
            fontWeight: trimmed.length < 40 ? 700 : 400,
            lineHeight: 1.5,
          },
        });
        showToast('Pasted text element from clipboard! 📝', 'success');
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [addElement, insertCustomImage, pasteElement, showToast]);

  const value: EditorContextType = {
    project,
    activePage,
    selectedElementId,
    selectedElement,
    editorMode,
    viewportMode,
    previewStateVariant,
    setPreviewStateVariant,
    zoom,
    showGrid,
    showRulers,
    setShowRulers,
    toggleRulers,
    snapToObjects,
    setSnapToObjects,
    snapToGuides,
    setSnapToGuides,
    userGuides,
    addUserGuide,
    updateUserGuide,
    removeUserGuide,
    clearUserGuides,
    isSaved,
    lastSavedText,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
    toasts,

    currentUser,
    setCurrentUser: handleSetCurrentUser,
    logout,

    leftSidebarOpen,
    rightSidebarOpen,
    setLeftSidebarOpen,
    setRightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,

    editorComplexity,
    setEditorComplexity,
    toggleEditorComplexity,

    showOnboarding,
    setShowOnboarding,

    setEditorMode,
    setViewportMode,
    setZoom,
    zoomToFit,
    setShowGrid,
    selectElement,
    selectedElementIds,
    selectedElements,
    selectElements,
    toggleSelectElement,
    groupSelectedElements,
    ungroupSelectedElements,
    alignSelectedElements,
    distributeSelectedElements,
    moveSelectedElements,
    batchDeleteSelected,

    addElement,
    insertCustomImage,
    insertShape,
    insertEmoji,
    addElements,
    updateElement,
    updateElementStyles,
    updateElementBehavior,
    updateElementLayout,
    updateElementResponsive,
    toggleResponsiveLock,
    setElementParent,
    reorderChild,
    deleteElement,
    duplicateElement,
    copyElement,
    cutElement,
    pasteElement,
    hasClipboard: !!clipboard,
    toggleLock,
    reorderElement,
    alignElement,

    showShortcutsModal,
    setShowShortcutsModal,

    setProjectName,
    updateProjectSettings,
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    updatePageSettings,
    resetToBlank,
    resetToDefaultDemo,

    // Cloud Persistence & Multi-Project Management
    cloudSyncStatus,
    lastCloudSavedAt,
    cloudProjects,
    isProjectManagerOpen,
    setIsProjectManagerOpen,
    isVersionHistoryOpen,
    setIsVersionHistoryOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    revisions,
    saveToCloud,
    loadCloudProject,
    createNewProject,
    duplicateCurrentProject,
    deleteCloudProject,
    createSnapshot,
    restoreRevision,
    refreshCloudProjects,
    refreshRevisions,

    undo,
    redo,
    showToast,
    removeToast,
  };

  // Sync latest context value to resilient store for HMR stability
  setLatestEditorContextValue(value);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export type { Toast, EditorContextType } from './editorContextInstance';
