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
  StateVariant,
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
  selectedElementIds: string[];
  selectedElements: CanvasElement[];
  selectElements: (ids: string[]) => void;
  toggleSelectElement: (id: string, multi?: boolean) => void;
  groupSelectedElements: () => CanvasElement | null;
  ungroupSelectedElements: () => void;
  alignSelectedElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelectedElements: (direction: 'horizontal' | 'vertical') => void;
  moveSelectedElements: (dx: number, dy: number) => void;
  batchDeleteSelected: () => void;
  editorMode: EditorMode;
  viewportMode: ViewportMode;
  previewStateVariant: StateVariant;
  setPreviewStateVariant: (variant: StateVariant) => void;
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  setShowRulers: (show: boolean | ((prev: boolean) => boolean)) => void;
  toggleRulers: () => void;
  snapToObjects: boolean;
  setSnapToObjects: (snap: boolean | ((prev: boolean) => boolean)) => void;
  snapToGuides: boolean;
  setSnapToGuides: (snap: boolean | ((prev: boolean) => boolean)) => void;
  userGuides: import('../types/editor').UserGuide[];
  addUserGuide: (orientation: 'horizontal' | 'vertical', position: number) => void;
  updateUserGuide: (id: string, position: number) => void;
  removeUserGuide: (id: string) => void;
  clearUserGuides: () => void;
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

  // Editor Complexity Mode (Simple vs Pro)
  editorComplexity: 'simple' | 'pro';
  setEditorComplexity: (complexity: 'simple' | 'pro') => void;
  toggleEditorComplexity: () => void;

  // Guided Onboarding Walkthrough
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean | ((prev: boolean) => boolean)) => void;

  // Actions
  setEditorMode: (mode: EditorMode) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  zoomToFit: () => void;
  setShowGrid: (show: boolean | ((prev: boolean) => boolean)) => void;
  selectElement: (id: string | null) => void;

  // Element Actions
  addElement: (
    type: ElementType,
    customX?: number,
    customY?: number,
    parentId?: string | null,
    initialOverrides?: Partial<CanvasElement>
  ) => CanvasElement;
  insertCustomImage: (dataUrlOrUrl: string, name?: string, customX?: number, customY?: number) => CanvasElement;
  insertShape: (shapeKind: import('../types/editor').ShapeKind, name?: string, customX?: number, customY?: number) => CanvasElement;
  insertEmoji: (emoji: string, customX?: number, customY?: number) => CanvasElement;
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
  updateProjectSettings: (settings: Partial<ProjectState>) => void;
  setActivePage: (pageId: string) => void;
  addPage: (name: string) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  updatePageSettings: (pageId: string, settings: Partial<Page>) => void;
  resetToBlank: () => void;
  resetToDefaultDemo: () => void;

  // Cloud Persistence & Multi-Project Management
  cloudSyncStatus: import('../types/editor').CloudSyncStatus;
  lastCloudSavedAt: string | null;
  cloudProjects: import('../types/editor').ProjectSummary[];
  isProjectManagerOpen: boolean;
  setIsProjectManagerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isVersionHistoryOpen: boolean;
  setIsVersionHistoryOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  revisions: import('../types/editor').ProjectRevision[];
  saveToCloud: (manual?: boolean) => Promise<boolean>;
  loadCloudProject: (id: string) => Promise<boolean>;
  createNewProject: (name?: string, templateType?: 'blank' | 'landing') => void;
  duplicateCurrentProject: () => Promise<string | null>;
  deleteCloudProject: (id: string) => Promise<boolean>;
  createSnapshot: (name?: string) => Promise<boolean>;
  restoreRevision: (revision: import('../types/editor').ProjectRevision) => void;
  refreshCloudProjects: () => Promise<void>;
  refreshRevisions: () => Promise<void>;

  // History
  undo: () => void;
  redo: () => void;

  // Toast
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;
}

// Ensure EditorContext is a resilient singleton across Vite HMR module re-evaluations
const GLOBAL_EDITOR_CONTEXT_KEY = Symbol.for('craft.studio.editorContext');
const GLOBAL_EDITOR_LATEST_VALUE_KEY = Symbol.for('craft.studio.latestContextValue');

interface GlobalEditorStore {
  [GLOBAL_EDITOR_CONTEXT_KEY]?: React.Context<EditorContextType | null>;
  [GLOBAL_EDITOR_LATEST_VALUE_KEY]?: EditorContextType | null;
}

const getGlobalEditorStore = (): GlobalEditorStore => {
  if (typeof globalThis !== 'undefined') return globalThis as unknown as GlobalEditorStore;
  if (typeof window !== 'undefined') return window as unknown as GlobalEditorStore;
  return {} as GlobalEditorStore;
};

const globalEditorStore = getGlobalEditorStore();

if (!globalEditorStore[GLOBAL_EDITOR_CONTEXT_KEY]) {
  globalEditorStore[GLOBAL_EDITOR_CONTEXT_KEY] = createContext<EditorContextType | null>(null);
}

export const EditorContext = globalEditorStore[GLOBAL_EDITOR_CONTEXT_KEY]!;

export const setLatestEditorContextValue = (val: EditorContextType | null): void => {
  globalEditorStore[GLOBAL_EDITOR_LATEST_VALUE_KEY] = val;
};

export const getLatestEditorContextValue = (): EditorContextType | null => {
  return globalEditorStore[GLOBAL_EDITOR_LATEST_VALUE_KEY] || null;
};

