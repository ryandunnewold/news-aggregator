"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function RunAggregationButton() {
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    try {
      const res = await fetch("/api/aggregate", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success(
          `Briefing refreshed — ${data.storiesGenerated} ${data.storiesGenerated === 1 ? "story" : "stories"} generated`
        );
        window.location.reload();
      } else {
        toast.error(data.error ?? "Aggregation failed");
      }
    } catch {
      toast.error("Failed to reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRun}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        fontWeight: 500,
        color: loading ? "#9e9a90" : "#1a1a18",
        background: "#ffffff",
        border: "1px solid #e8e4dc",
        borderRadius: "100px",
        padding: "8px 18px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "border-color 0.2s ease",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <RefreshCw
        style={{
          width: "13px",
          height: "13px",
          animation: loading ? "spin 1s linear infinite" : "none",
        }}
      />
      {loading ? "Running…" : "Run Now"}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
