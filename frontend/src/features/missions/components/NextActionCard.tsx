import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NextActionCardProps = {
  action: string;
};

export function NextActionCard({ action }: NextActionCardProps) {
  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader>
        <CardTitle className="text-accent">Next best action</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-accent" />
          <p className="text-lg font-medium leading-relaxed">{action}</p>
        </div>
      </CardContent>
    </Card>
  );
}
