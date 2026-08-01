  'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import { createStore, useStore } from 'zustand';
import { EditorElement } from '../types';

export type ToolType = 'select' | 'pan' | 'pen' | 'line' | 'arrow' | 'rect' | 'circle' | 'dimension' | 'eraser';

interface EditorState {
  tool: ToolType;
  scale: number;
  position: { x: number; y: number };
  
  elements: EditorElement[];
  selectedIds: string[];
  strokeColor: string;
  strokeWidth: number;
  
  setTool: (tool: ToolType) => void;
  setScale: (scale: number) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  
  addElement: (el: EditorElement) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  
  stageRef: any;
  setStageRef: (ref: any) => void;
  
  history: EditorElement[][];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  commitHistory: () => void;
  loadState: (elements: EditorElement[]) => void;
  getElements: () => EditorElement[];
}

type EditorStore = ReturnType<typeof createEditorStore>;

const createEditorStore = (initialElements: EditorElement[] = []) => createStore<EditorState>((set, get) => ({
  tool: 'select',
  scale: 1,
  position: { x: 0, y: 0 },
  
  elements: initialElements,
  selectedIds: [],
  strokeColor: '#ef4444', // default red for annotations
  strokeWidth: 4,
  
  setTool: (tool) => set({ tool, selectedIds: [] }),
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  
  addElement: (el) => set((state) => ({ elements: [...state.elements, el] })),
  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } as EditorElement : el)),
  })),
  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedIds: state.selectedIds.filter((sid) => sid !== id),
  })),
  
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  
  stageRef: null,
  setStageRef: (stageRef) => set((state) => state.stageRef === stageRef ? state : { stageRef }),
  
  history: [JSON.parse(JSON.stringify(initialElements))],
  historyIndex: 0,
  
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        historyIndex: newIndex,
        elements: state.history[newIndex],
        selectedIds: [],
      };
    }
    return state;
  }),
  
  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        historyIndex: newIndex,
        elements: state.history[newIndex],
        selectedIds: [],
      };
    }
    return state;
  }),
  
  commitHistory: () => set((state) => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.elements))); // Deep copy
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  }),
  
  loadState: (elements) => set({
    elements,
    history: [JSON.parse(JSON.stringify(elements))],
    historyIndex: 0,
    selectedIds: [],
    tool: 'select'
  }),

  getElements: () => get().elements,
}));

const EditorContext = createContext<EditorStore | null>(null);

export function EditorProvider({ children, initialElements = [] }: { children: ReactNode, initialElements?: EditorElement[] }) {
  const storeRef = useRef<EditorStore>(null as any);
  if (!storeRef.current) {
    storeRef.current = createEditorStore(initialElements);
  }
  return <EditorContext.Provider value={storeRef.current}>{children}</EditorContext.Provider>;
}

export function useEditorContext<T = EditorState>(selector?: (state: EditorState) => T): T {
  const store = useContext(EditorContext);
  if (!store) throw new Error('Missing EditorContext.Provider in the tree');
  return selector ? useStore(store, selector) : useStore(store) as any as T;
}

// Temporary compatibility layer for existing code that hasn't been migrated yet
export const useEditorStore = Object.assign(
  function useEditorStoreCompat<T = EditorState>(selector?: (state: EditorState) => T): T {
    try {
      const store = useContext(EditorContext);
      if (!store) throw new Error('not in context');
      return selector ? useStore(store, selector) : useStore(store) as any as T;
    } catch (e) {
      // Fallback if not inside provider - shouldn't happen after we wrap it!
      throw new Error('useEditorStore must be used within EditorProvider now');
    }
  },
  {
    getState: () => {
      // This is a hack, we shouldn't use getState() globally anymore
      throw new Error('useEditorStore.getState() is deprecated. Pass elements up or use EditorContext.');
    },
    subscribe: () => {
      throw new Error('useEditorStore.subscribe is deprecated.');
    }
  }
);
