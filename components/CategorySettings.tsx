"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ALL_CATEGORIES, DEFAULT_CATEGORIES } from "@/lib/types";
import type { NewsCategory } from "@/lib/types";

interface CategorySettingsProps {
  initialCategories: NewsCategory[];
}

export function CategorySettings({ initialCategories }: CategorySettingsProps) {
  const [selected, setSelected] = useState<Set<NewsCategory>>(
    new Set(initialCategories)
  );
  const [isPending, startTransition] = useTransition();

  function toggle(cat: NewsCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size <= 1) return prev;
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: Array.from(selected) }),
      });

      if (res.ok) {
        toast.success("Settings saved", {
          description: "Your category preferences have been updated.",
        });
      } else {
        toast.error("Failed to save settings");
      }
    });
  }

  function reset() {
    setSelected(new Set(DEFAULT_CATEGORIES));
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e8e4dc",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #e8e4dc" }}>
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#1a1a18",
            marginBottom: "6px",
          }}
        >
          News Categories
        </h2>
        <p style={{ fontSize: "13px", color: "#6b6860", margin: 0 }}>
          Choose which categories to include in your news digests. At least one
          category must be selected.
        </p>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {ALL_CATEGORIES.map(({ value, label }) => {
            const isChecked = selected.has(value);
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: isChecked ? "1px solid #1a1a18" : "1px solid #e8e4dc",
                  background: isChecked ? "#1a1a18" : "#ffffff",
                  color: isChecked ? "#faf8f4" : "#1a1a18",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    border: isChecked ? "1px solid rgba(250,248,244,0.4)" : "1px solid #e8e4dc",
                    background: isChecked ? "rgba(250,248,244,0.2)" : "#faf8f4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "10px",
                    color: isChecked ? "#faf8f4" : "transparent",
                  }}
                >
                  ✓
                </span>
                {label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid #e8e4dc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={reset}
              style={{
                fontSize: "13px",
                color: "#6b6860",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
              }}
            >
              Reset to defaults
            </button>
            <span style={{ fontSize: "12px", color: "#9e9a90" }}>
              {selected.size} of {ALL_CATEGORIES.length} selected
            </span>
          </div>
          <button
            onClick={save}
            disabled={isPending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#faf8f4",
              background: isPending ? "#6b6860" : "#1a1a18",
              border: "none",
              borderRadius: "100px",
              padding: "8px 20px",
              cursor: isPending ? "not-allowed" : "pointer",
              transition: "background 0.2s ease",
            }}
          >
            {isPending ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
