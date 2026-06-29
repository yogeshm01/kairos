import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Reflection } from "@/types/api";
import { formatDate } from "@/lib/utils";

const reflectionSchema = z.object({
  reflection_date: z.string(),
  completed_summary: z.string().optional(),
  blockers: z.string().optional(),
  confidence: z.coerce.number().min(0).max(100),
  energy: z.coerce.number().min(1).max(5),
  notes: z.string().optional(),
});

type ReflectionForm = z.infer<typeof reflectionSchema>;

type ReflectionPanelProps = {
  reflections: Reflection[];
  onSubmit: (values: ReflectionForm) => Promise<void>;
  isSubmitting?: boolean;
};

export function ReflectionPanel({ reflections, onSubmit, isSubmitting }: ReflectionPanelProps) {
  const today = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, reset } = useForm<ReflectionForm>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: {
      reflection_date: today,
      confidence: 60,
      energy: 3,
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily reflection</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) =>
              void handleSubmit(async (values) => {
                await onSubmit(values);
                reset({ reflection_date: today, confidence: 60, energy: 3 });
              })(e)
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...register("reflection_date")} />
              </div>
              <div className="space-y-2">
                <Label>Energy (1-5)</Label>
                <Input type="number" min={1} max={5} {...register("energy")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>What did you complete?</Label>
              <Textarea {...register("completed_summary")} />
            </div>
            <div className="space-y-2">
              <Label>What blocked you?</Label>
              <Textarea {...register("blockers")} />
            </div>
            <div className="space-y-2">
              <Label>Confidence (0-100)</Label>
              <Input type="number" min={0} max={100} {...register("confidence")} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea {...register("notes")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Submit reflection
            </Button>
          </form>
        </CardContent>
      </Card>

      {reflections.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent reflections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reflections.map((reflection) => (
              <div key={reflection.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{formatDate(reflection.reflection_date)}</p>
                {reflection.ai_insight ? (
                  <p className="mt-1 text-sm text-muted">{reflection.ai_insight}</p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
