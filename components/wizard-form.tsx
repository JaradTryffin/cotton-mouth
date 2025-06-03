"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon: ReactNode;
  content: ReactNode;
  isValid?: boolean | (() => boolean);
  getValidationErrors?: () => string[];
}

interface WizardFormProps {
  steps: WizardStep[];
  onComplete?: (data?: any) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
  initialStep?: number;
  className?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WizardForm({
  steps,
  onComplete,
  onCancel,
  mode = "create",
  initialStep = 0,
  className,
  trigger,
  open,
  onOpenChange,
}: WizardFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  // Use external open state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or next step if current is completed
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    onComplete?.();
    setDialogOpen(false);
    // Reset wizard state when closing
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
  };

  const handleCancel = () => {
    onCancel?.();
    setDialogOpen(false);
    // Reset wizard state when closing
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
  };

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex);
  const isStepCurrent = (stepIndex: number) => stepIndex === currentStep;
  const isStepAccessible = (stepIndex: number) =>
    stepIndex <= currentStep || completedSteps.has(stepIndex - 1);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Handle validation - support both boolean and function
  const getStepValidity = (step: WizardStep) => {
    if (typeof step.isValid === "function") {
      return step.isValid();
    }
    return step.isValid !== false;
  };

  const canProceed = getStepValidity(currentStepData);

  // Get validation errors for current step
  const getValidationErrors = () => {
    if (currentStepData.getValidationErrors) {
      return currentStepData.getValidationErrors();
    }
    return [];
  };

  const validationErrors = getValidationErrors();
  const hasValidationErrors = validationErrors.length > 0;

  const wizardContent = (
    <div className={cn("flex h-full w-full min-h-[600px]", className)}>
      {/* Left Sidebar - Steps */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 flex-shrink-0">
        <div className="space-y-1">
          {steps.map((step, index) => {
            const completed = isStepCompleted(index);
            const current = isStepCurrent(index);
            const accessible = isStepAccessible(index);

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  {
                    "bg-green-100 text-green-800": completed,
                    "bg-blue-100 text-blue-800": current && !completed,
                    "text-gray-600 hover:bg-gray-100":
                      !current && !completed && accessible,
                    "text-gray-400 cursor-not-allowed": !accessible,
                  },
                )}
                onClick={() => accessible && handleStepClick(index)}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                    {
                      "bg-green-500 text-white": completed,
                      "bg-blue-500 text-white": current && !completed,
                      "bg-gray-200 text-gray-600":
                        !current && !completed && accessible,
                      "bg-gray-100 text-gray-400": !accessible,
                    },
                  )}
                >
                  {completed ? <Check className="w-4 h-4" /> : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{step.title}</div>
                  {step.description && (
                    <div className="text-xs opacity-75 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentStepData?.title}
              </h1>
              {currentStepData?.description && (
                <p className="text-gray-600 mt-1 text-sm">
                  {currentStepData.description}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Validation Feedback */}
            {!canProceed && hasValidationErrors && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <div className="text-amber-800">
                    <p className="font-medium mb-2">
                      Please complete the following:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success feedback when step is valid */}
            {canProceed && !isStepCompleted(currentStep) && (
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Great! This step is complete. You can proceed to the next
                  step.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="p-6">
                {currentStepData?.content}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* Validation status indicator */}
              {!canProceed && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Info className="w-4 h-4" />
                  <span>Complete required fields to continue</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {isLastStep ? (
                  <Button
                    onClick={handleComplete}
                    disabled={!canProceed}
                    className="flex items-center gap-2"
                  >
                    {mode === "edit" ? "Save Changes" : "Complete"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (trigger) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-6xl min-w-[90vw] h-[80vh] p-0">
          {wizardContent}
        </DialogContent>
      </Dialog>
    );
  }

  return wizardContent;
}
