"use client";

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <div className="w-full">
      <ol className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <li key={index} className="relative">
              <div
                className={cn(
                  "group flex cursor-pointer flex-col border-l-4 py-2 pl-4 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : isCompleted
                      ? "border-primary/50 text-primary/50 hover:border-primary/80 hover:text-primary/80"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 hover:text-muted-foreground/80",
                )}
                onClick={() => onStepClick?.(index)}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  {isCompleted ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20 text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
