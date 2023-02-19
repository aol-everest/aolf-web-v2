import { useState, useCallback } from "react";

const isFunction = (obj) => typeof obj === "function";

const useWizard = (activeStepIndex, steps, validateOnNext) => {
  const total = steps.length;
  const [currentStep, setCurrentStep] = useState(activeStepIndex);
  const isPrevDisabled = currentStep === 0;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep >= total - 1;
  const goToPrev = useCallback(
    () => setCurrentStep(Math.max(0, currentStep - 1)),
    [setCurrentStep, currentStep],
  );
  const goToNext = useCallback(
    () => setCurrentStep(Math.min(currentStep + 1, total - 1)),
    [setCurrentStep, currentStep, total],
  );
  const stepObj = steps[currentStep];
  const { beforePrev, beforeNext } = stepObj;

  const handlePrev = useCallback(
    (formikBag) => async () => {
      let isValid = true;

      if (isFunction(beforePrev)) {
        try {
          await beforePrev(formikBag.values, formikBag, currentStep);
        } catch (error) {
          isValid = false;
        }
      }

      if (isValid) {
        goToPrev();
      }
    },
    [goToPrev, currentStep, beforePrev],
  );

  const handleNext = useCallback(
    (formikBag) => async () => {
      let isValid = false;

      if (validateOnNext) {
        const errors = await formikBag.validateForm();
        isValid = Object.keys(errors).length === 0;
      }

      if (
        ((validateOnNext && isValid) || !validateOnNext) &&
        isFunction(beforeNext)
      ) {
        try {
          await beforeNext(formikBag.values, formikBag, currentStep);
          isValid = true;
        } catch (error) {
          isValid = false;
        }
      }

      if (isValid) {
        isLastStep ? formikBag.submitForm() : goToNext();
      }
    },
    [goToNext, currentStep, beforeNext, isLastStep, validateOnNext],
  );

  return {
    currentStepIndex: currentStep,
    isPrevDisabled,
    isFirstStep,
    isLastStep,
    goToPrev,
    goToNext,
    handlePrev,
    handleNext,
  };
};

export { useWizard };
