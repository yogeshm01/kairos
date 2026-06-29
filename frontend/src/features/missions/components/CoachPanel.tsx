import { MessageCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { CoachMessageResponse } from "@/types/api";

type CoachPanelProps = {
  coach?: CoachMessageResponse;
  isLoading?: boolean;
};

export function CoachPanel({ coach, isLoading }: CoachPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <MessageCircle className="h-5 w-5 text-accent" />
        <CardTitle>AI Coach</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Spinner />
        ) : coach ? (
          <>
            <p className="text-sm leading-relaxed">{coach.message}</p>
            <p className="text-sm text-muted">{coach.risk_insight}</p>
            <p className="text-sm font-medium text-accent">{coach.recommended_action}</p>
          </>
        ) : (
          <p className="text-sm text-muted">Coach message unavailable.</p>
        )}
      </CardContent>
    </Card>
  );
}
