"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Settings2, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
        if (next.size <= 1) return prev; // Keep at least one
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <CardTitle>News Categories</CardTitle>
        </div>
        <CardDescription>
          Choose which categories to include in your news digests. At least one
          category must be selected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_CATEGORIES.map(({ value, label }) => {
            const isChecked = selected.has(value);
            return (
              <div
                key={value}
                className={`flex items-center space-x-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${
                  isChecked
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => toggle(value)}
              >
                <Checkbox
                  id={value}
                  checked={isChecked}
                  onCheckedChange={() => toggle(value)}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={value}
                  className="cursor-pointer font-medium text-sm"
                >
                  {label}
                </Label>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset to defaults
          </Button>
          <Button onClick={save} disabled={isPending}>
            {isPending ? (
              "Saving..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Save settings
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {selected.size} of {ALL_CATEGORIES.length} categories selected. Changes take
          effect on the next scheduled digest.
        </p>
      </CardContent>
    </Card>
  );
}
