import { useContext } from 'react';
import { EditorContext, getLatestEditorContextValue } from './editorContextInstance';
import type { EditorContextType } from './editorContextInstance';
import { INITIAL_PROJECT } from '../constants/defaults';

let cachedFallbackContext: EditorContextType | null = null;

function getSafeFallbackContext(): EditorContextType {
  if (cachedFallbackContext) return cachedFallbackContext;

  const noop = () => {};
  const asyncNoop = async () => {};

  cachedFallbackContext = {
    project: INITIAL_PROJECT,
    activePage: INITIAL_PROJECT.pages[0],
    selectedElementId: null,
    selectedElement: null,
    selectedElementIds: [],
    selectedElements: [],
    selectElements: noop,
    toggleSelectElement: noop,
    groupSelectedElements: () => null,
    ungroupSelectedElements: noop,
    alignSelectedElements: noop,
    distributeSelectedElements: noop,
    moveSelectedElements: noop,
    batchDeleteSelected: noop,
    editorMode: 'design',
    viewportMode: 'desktop',
    previewStateVariant: 'default',
    setPreviewStateVariant: noop,
    zoom: 1,
    showGrid: true,
    showRulers: false,
    setShowRulers: noop,
    toggleRulers: noop,
    snapToObjects: true,
    setSnapToObjects: noop,
    snapToGuides: true,
    setSnapToGuides: noop,
    userGuides: [],
    addUserGuide: noop,
    updateUserGuide: noop,
    removeUserGuide: noop,
    clearUserGuides: noop,
    isSaved: true,
    lastSavedText: 'Saved locally',
    canUndo: false,
    canRedo: false,
    historyCount: 0,
    futureCount: 0,
    toasts: [],
    currentUser: null,
    setCurrentUser: noop,
    logout: noop,
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    setLeftSidebarOpen: noop,
    setRightSidebarOpen: noop,
    toggleLeftSidebar: noop,
    toggleRightSidebar: noop,
    editorComplexity: 'pro',
    setEditorComplexity: noop,
    toggleEditorComplexity: noop,
    showOnboarding: false,
    setShowOnboarding: noop,
    setEditorMode: noop,
    setViewportMode: noop,
    setZoom: noop,
    zoomToFit: noop,
    setShowGrid: noop,
    selectElement: noop,
    addElement: () => ({ ...INITIAL_PROJECT.pages[0].elements[0] }),
    insertCustomImage: () => ({ ...INITIAL_PROJECT.pages[0].elements[0] }),
    insertShape: () => ({ ...INITIAL_PROJECT.pages[0].elements[0] }),
    insertEmoji: () => ({ ...INITIAL_PROJECT.pages[0].elements[0] }),
    addElements: noop,
    updateElement: noop,
    updateElementStyles: noop,
    updateElementBehavior: noop,
    updateElementLayout: noop,
    updateElementResponsive: noop,
    toggleResponsiveLock: noop,
    setElementParent: noop,
    reorderChild: noop,
    deleteElement: noop,
    duplicateElement: () => null,
    copyElement: noop,
    cutElement: noop,
    pasteElement: () => null,
    hasClipboard: false,
    toggleLock: noop,
    reorderElement: noop,
    alignElement: noop,
    showShortcutsModal: false,
    setShowShortcutsModal: noop,
    setProjectName: noop,
    updateProjectSettings: noop,
    setActivePage: noop,
    addPage: noop,
    duplicatePage: noop,
    deletePage: noop,
    updatePageSettings: noop,
    resetToBlank: noop,
    resetToDefaultDemo: noop,
    cloudSyncStatus: 'idle',
    lastCloudSavedAt: null,
    cloudProjects: [],
    isProjectManagerOpen: false,
    setIsProjectManagerOpen: noop,
    isVersionHistoryOpen: false,
    setIsVersionHistoryOpen: noop,
    isAuthModalOpen: false,
    setIsAuthModalOpen: noop,
    revisions: [],
    saveToCloud: async () => false,
    loadCloudProject: async () => false,
    createNewProject: noop,
    duplicateCurrentProject: async () => null,
    deleteCloudProject: async () => false,
    createSnapshot: async () => false,
    restoreRevision: noop,
    refreshCloudProjects: asyncNoop,
    refreshRevisions: asyncNoop,
    undo: noop,
    redo: noop,
    showToast: noop,
    removeToast: noop,
  };

  return cachedFallbackContext;
}

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context) {
    return context;
  }

  // Resilient fallback during Vite HMR module reloads or transient renders
  const latest = getLatestEditorContextValue();
  if (latest) {
    return latest;
  }

  // Gracefully fallback instead of throwing an unhandled crash in the studio
  if (import.meta.env?.DEV) {
    console.warn(
      '[useEditor] Editor context temporarily unavailable; returning safe fallback to prevent studio crash.'
    );
  }
  return getSafeFallbackContext();
};
