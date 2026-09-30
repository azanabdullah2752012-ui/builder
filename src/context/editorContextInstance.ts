import { createContext } from 'react';
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

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

export interface EditorContextType {
  project: ProjectState;
  activePage: Page;
  selectedElementId: string | null;
  selectedElement: CanvasElement | null;
  editorMode: EditorMode;
  viewportMode: ViewportMode;
  zoom: number;
  showGrid: boolean;
  isSaved: boolean;
  lastSavedText: string;
  canUndo: boolean;
  canRedo: boolean;
  toasts: Toast[];

  // Auth User
  currentUser: { name: string; email: string; plan?: string; role?: string } | null;
  setCurrentUser: (user: { name: string; email: string; plan?: string; role?: string } | null) => void;
  logout: () => void;

  // Sidebar Visibility
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setRightSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;

  // Actions
  setEditorMode: (mode: EditorMode) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  zoomToFit: () => void;
  setShowGrid: (show: boolean | ((prev: boolean) => boolean)) => void;
  selectElement: (id: string | null) => void;

  // Element Actions
  addElement: (type: ElementType, customX?: number, customY?: number, parentId?: string | null) => CanvasElement;
  addElements: (elements: CanvasElement[], selectFirst?: boolean) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, recordHistory?: boolean) => void;
  updateElementStyles: (id: string, styles: Partial<ElementStyles>, recordHistory?: boolean) => void;
  updateElementBehavior: (id: string, behavior: Partial<ElementBehavior>, recordHistory?: boolean) => void;
  updateElementLayout: (id: string, layout: Partial<ContainerLayoutConfig>, recordHistory?: boolean) => void;
  updateElementResponsive: (id: string, responsive: Partial<ElementResponsiveConfig>, recordHistory?: boolean) => void;
  toggleResponsiveLock: (id?: string) => void;
  setElementParent: (elementId: string, newParentId: string | null) => void;
  reorderChild: (parentId: string, childId: string, direction: 'up' | 'down') => void;
  deleteElement: (id?: string) => void;
  duplicateElement: (id?: string) => CanvasElement | null;
  copyElement: (id?: string) => void;
  cutElement: (id?: string) => void;
  pasteElement: (targetParentId?: string | null) => CanvasElement | null;
  hasClipboard: boolean;
  toggleLock: (id?: string) => void;
  reorderElement: (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
  alignElement: (id: string, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;

  // Shortcuts Modal
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean | ((prev: boolean) => boolean)) => void;

  // Project & Pages
  setProjectName: (name: string) => void;
  setActivePage: (pageId: string) => void;
  addPage: (name: string) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  updatePageSettings: (pageId: string, settings: Partial<Page>) => void;
  resetToBlank: () => void;
  resetToDefaultDemo: () => void;

  // History
  undo: () => void;
  redo: () => void;

  // Toast
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;
}

export const EditorContext = createContext<EditorContextType | null>(null);
