import { Newspaper, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PERIOD_LABELS, PERIOD_TIMES } from "@/lib/types";

export function EmptyFeed() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Newspaper className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No digests yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            News digests are automatically generated three times a day. The first
            digest will appear here once generated.
          </p>
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            {(["morning", "midday", "evening"] as const).map((period) => (
              <div
                key={period}
                className="flex flex-col items-center p-3 rounded-lg bg-muted/50"
              >
                <span className="text-xs font-medium">{PERIOD_LABELS[period]}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {PERIOD_TIMES[period]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
