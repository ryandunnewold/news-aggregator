"use client";

import { useEffect, useState } from "react";

interface BriefingGeneratedAtProps {
  generatedAt: string;
}

function formatAbsolute(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function BriefingGeneratedAt({ generatedAt }: BriefingGeneratedAtProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const date = new Date(generatedAt);
      const now = new Date();
      setLabel(`Generated ${formatAbsolute(date)} · ${formatRelative(date, now)}`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [generatedAt]);

  return (
    <span
      suppressHydrationWarning
      style={{ fontSize: "13px", color: "#9e9a90" }}
      title={new Date(generatedAt).toLocaleString()}
    >
      {label ?? " "}
    </span>
  );
}
