import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  CanvasElement,
  ElementType,
  ProjectState,
  EditorMode,
  ViewportMode,
  ElementStyles,
  ElementBehavior,
  ContainerLayoutConfig,
  ElementResponsiveConfig,
  Page,
} from '../types/editor';
import {
  INITIAL_PROJECT,
  STORAGE_KEY,
  createElement,
  generateId,
  CANVAS_DEFAULT_WIDTH,
  CANVAS_DEFAULT_HEIGHT,
} from '../constants/defaults';
import { EditorContext } from './editorContextInstance';
import type { Toast, EditorContextType } from './editorContextInstance';

import { normalizeProjectState } from '../utils/projectNormalization';
import { databaseService } from '../services/databaseService';


export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage if available
  const [project, setProject] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pages && parsed.pages.length > 0) {
          return normalizeProjectState(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved project from localStorage:', e);
    }
    return normalizeProjectState(INITIAL_PROJECT);
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>('el_primary_cta');
  
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
        hash.includes('editor') ||
        hash.includes('access_token')
      ) {
        return 'design';
      }
      try {
        const saved = localStorage.getItem('craft_auth_user');
        if (saved) {
          const u = JSON.parse(saved);
          if (u && (u.email || u.name)) return 'design';
        }
      } catch {}
    }
    return 'landing';
  });

  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [lastSavedText, setLastSavedText] = useState<string>('Saved locally');
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  // Authenticated Creator Session
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; plan?: string; role?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('craft_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSetCurrentUser = useCallback((user: { name: string; email: string; plan?: string; role?: string } | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem('craft_auth_user', JSON.stringify(user));
      } else {
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
        const rawParams = new URLSearchParams(search || hash.replace('#', '?'));
        const desc = rawParams.get('error_description') || 'External authentication exchange was unable to complete.';
        const cleanDesc = decodeURIComponent(desc.replace(/\+/g, ' '));
        showToast(`⚠️ ${cleanDesc}. Use 1-Click Demo or sign up with email to enter the editor.`, 'warning');
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
        handleSetCurrentUser({ name, email, plan: 'Pro Studio' });
        setEditorMode('design');
      }
    });

    // 2. Subscribe to auth changes (e.g. redirect back from Google OAuth)
    const { data: authListener } = databaseService.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const u = session.user;
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Google User';
        const email = u.email || '';
        handleSetCurrentUser({ name, email, plan: 'Pro Studio' });
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

  // Bubble Studio Sidebars (collapsible for maximum canvas breathing room)
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

  // Currently selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return activePage.elements.find((el) => el.id === selectedElementId) || null;
  }, [activePage.elements, selectedElementId]);

  // Auto-save to LocalStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setIsSaved(true);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedText(`Saved at ${timeStr}`);
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [project]);

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
        styles: { ...el.styles },
        behavior: { ...el.behavior },
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

  // Select Element
  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      setRightSidebarOpen(true);
    }
  }, []);

  // Add Element to Canvas or into a Section/Container
  const addElement = useCallback((type: ElementType, customX?: number, customY?: number, parentId?: string | null): CanvasElement => {
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
    showToast(`Added ${type} element to canvas`, 'info');
    return newEl!;
  }, [pushHistory, showToast]);

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
                  styles: { ...el.styles, ...styles },
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
                  behavior: { ...el.behavior, ...behavior },
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

    // Optional native clipboard writing
    try {
      if (target.content) {
        navigator.clipboard?.writeText(target.content);
      } else {
        navigator.clipboard?.writeText(JSON.stringify({ type: 'studio-element', name: target.name }));
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

  // Paste Element
  const pasteElement = useCallback((targetParentId?: string | null): CanvasElement | null => {
    if (!clipboard) {
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
        e.preventDefault();
        pasteElement();
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

      // Select All / Cycle: Cmd + A
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const active = project.pages.find((p) => p.id === project.activePageId);
        const rootElements = active?.elements.filter((el) => !el.parentId) || [];
        if (rootElements.length > 0) {
          const currentIndex = rootElements.findIndex((el) => el.id === selectedElementId);
          const nextIndex = (currentIndex + 1) % rootElements.length;
          setSelectedElementId(rootElements[nextIndex].id);
          showToast(`Selected "${rootElements[nextIndex].name}" (Cmd+A)`, 'info');
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

      if (e.key === 'Escape') {
        setSelectedElementId(null);
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedElementId && selectedElement && !selectedElement.locked) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElement && !selectedElement.locked) {
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
  ]);

  const value: EditorContextType = {
    project,
    activePage,
    selectedElementId,
    selectedElement,
    editorMode,
    viewportMode,
    zoom,
    showGrid,
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

    setEditorMode,
    setViewportMode,
    setZoom,
    zoomToFit,
    setShowGrid,
    selectElement,

    addElement,
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
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    updatePageSettings,
    resetToBlank,
    resetToDefaultDemo,

    undo,
    redo,
    showToast,
    removeToast,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export type { Toast, EditorContextType } from './editorContextInstance';
