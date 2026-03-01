"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
          `Aggregation complete — ${data.storiesGenerated} stories generated (${data.period})`
        );
        // Reload the page so the new digest appears
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
    <Button
      variant="outline"
      size="sm"
      onClick={handleRun}
      disabled={loading}
      className="gap-1.5"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Running…" : "Run Now"}
    </Button>
  );
}
