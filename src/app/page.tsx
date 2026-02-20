"use client";

import { useState } from "react";
import { useRepo } from "@/components/providers/repo-provider";
import { StackColumn } from "@/components/stack-column";
import { BranchDetail } from "@/components/branch-detail/branch-detail";
import { Separator } from "@/components/ui/separator";
import type { BranchResponse } from "@/lib/api";

export default function Home() {
  const { repo, stackDetails, loading, error, lastUpdated, refresh } =
    useRepo();
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(
    null
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          Make sure stackit-web is running on{" "}
          {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"}
        </p>
        <button
          onClick={refresh}
          className="text-sm underline text-muted-foreground hover:text-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">stackit</span>
          {repo && (
            <span className="text-sm text-muted-foreground font-mono">
              {repo.owner}/{repo.repo}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              <TimeAgo date={lastUpdated} />
            </span>
          )}
          <button
            onClick={refresh}
            className="text-xs text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            &#x21BB;
          </button>
        </div>
      </header>

      {/* Main content: stacks on left, detail on right */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          {stackDetails.length > 0 ? (
            <div className="flex flex-col min-h-full">
              <div className="flex gap-6 p-6 pb-0 items-end flex-1">
                {stackDetails.map((stack) => (
                  <StackColumn
                    key={stack.rootBranch}
                    stack={stack}
                    selectedBranch={selectedBranch?.name ?? null}
                    onSelectBranch={setSelectedBranch}
                  />
                ))}
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
                  <span className="text-xs font-mono text-muted-foreground">{repo?.trunk}</span>
                  <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No stacks found
            </div>
          )}
        </div>

        {/* Right: branch detail */}
        {selectedBranch && (
          <>
            <Separator orientation="vertical" />
            <div className="w-[400px] shrink-0 overflow-auto p-4">
              <BranchDetail branch={selectedBranch} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TimeAgo({ date }: { date: Date }) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return <>just now</>;
  if (seconds < 60) return <>{seconds}s ago</>;
  const minutes = Math.floor(seconds / 60);
  return <>{minutes}m ago</>;
}
