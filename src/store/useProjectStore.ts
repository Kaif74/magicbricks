import { create } from "zustand";
import { Project } from "@/types";

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  addProject: (project: Project) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  isLoading: false,
  error: null,
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ projects: [], isLoading: false, error: null }),
}));
