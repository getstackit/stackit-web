"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  fetchView,
  type RepoResponse,
  type StackDetail,
} from "@/lib/api";
import { useSSE } from "@/lib/use-sse";

interface RepoState {
  repo: RepoResponse | null;
  stackDetails: StackDetail[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

const RepoContext = createContext<RepoState | null>(null);

export function useRepo() {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error("useRepo must be used within RepoProvider");
  return ctx;
}

export function RepoProvider({ children }: { children: ReactNode }) {
  const [repo, setRepo] = useState<RepoResponse | null>(null);
  const [stackDetails, setStackDetails] = useState<StackDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const view = await fetchView();
      setRepo(view.repo);
      setStackDetails(view.stacks);

      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // SSE updates trigger refresh
  useSSE(loadData);

  return (
    <RepoContext.Provider
      value={{
        repo,
        stackDetails,
        loading,
        error,
        lastUpdated,
        refresh: loadData,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
}
