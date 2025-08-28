import { useState } from 'react';

// Multi-step form hook
export const useMultiStepForm = (steps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const previous = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goTo = (step) => {
    setCurrentStep(Math.max(0, Math.min(step, steps.length - 1)));
  };

  const reset = () => {
    setCurrentStep(0);
  };

  return {
    currentStep,
    step: steps[currentStep],
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    next,
    previous,
    goTo,
    reset,
    totalSteps: steps.length,
    progress: ((currentStep + 1) / steps.length) * 100,
  };
};
