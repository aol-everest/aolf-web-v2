import { Formik } from "formik";
import { useWizard } from "./useWizard";

export const FormikWizard = ({
  activeStepIndex = 0,
  validateOnNext = true,
  steps,
  children,
  ...props
}) => {
  const {
    currentStepIndex,
    isPrevDisabled,
    isFirstStep,
    isLastStep,
    handlePrev,
    handleNext,
  } = useWizard(activeStepIndex, steps, validateOnNext);
  const currentStep = steps[currentStepIndex];
  const { component: StepComponent } = currentStep;

  return (
    <Formik {...props} validationSchema={currentStep.validationSchema}>
      {typeof children === "function"
        ? (formikBag) => {
            const wizardProps = {
              handlePrev: async () => {
                await handlePrev(formikBag)();
                await formikBag.validateForm();
              },
              handleNext: handleNext(formikBag),
              isFirstStep,
              isLastStep,
              currentStepIndex,
              isPrevDisabled,
              isNextDisabled: (validateOnNext && !formikBag.isValid) || false,
              renderComponent: () => (
                <StepComponent
                  {...formikBag}
                  currentStepIndex={currentStepIndex}
                  handleNext={handleNext(formikBag)}
                />
              ),
            };

            return children({
              ...formikBag,
              ...wizardProps,
            });
          }
        : children}
    </Formik>
  );
};
