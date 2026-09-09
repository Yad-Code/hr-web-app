import { z } from "zod";

export const GoalSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(["High", "Medium", "Low"]),
  due_date: z.string(),
});

export const SelfAssessmentSchema = z.object({
  achievements: z.string().min(1, "Please enter your achievements"),
  challenges: z.string().min(1, "Please enter your challenges"),
  future_goals: z.string().min(1, "Please enter your future goals"),
});

export type GoalFormValues = z.infer<typeof GoalSchema>;
export type SelfAssessmentFormValues = z.infer<typeof SelfAssessmentSchema>;
