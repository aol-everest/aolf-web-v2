import { useSessionStorage } from '@uidotdev/usehooks';
import { findExistingQuestionnaire } from '@utils';
import { useState } from 'react';

function useQuestionnaireSelection(questions, sequence) {
  const [value, setValue] = useSessionStorage('center-finder');
  const currentStepData = questions?.find((item) => item.sequence === sequence);
  const previousStepData = questions?.find(
    (item) => item.sequence === sequence - 1,
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const isMultiSelectQuestion = currentStepData?.isMultiselectQuestion;
  const isMultiStep = currentStepData?.stepCount > 1;

  const handleOptionSelect = (answerId, helpResonse) => {
    let selectedIdsLocal = [answerId];
    if (isMultiSelectQuestion) {
      selectedIdsLocal = [...selectedIds, answerId];
      selectedIdsLocal = selectedIdsLocal.slice(-2);
    }
    setSelectedIds(selectedIdsLocal);
    const updatedOptions = findExistingQuestionnaire(
      value?.totalSelectedOptions || [],
      currentStepData,
      selectedIdsLocal,
    );
    setValue({
      ...value,
      totalSelectedOptions: updatedOptions || [],
      questions,
      scientificStudy: isMultiStep ? helpResonse : value.scientificStudy,
    });
  };

  return {
    selectedIds,
    handleOptionSelect,
    currentStepData,
    isMultiSelectQuestion,
    isMultiStep,
    previousStepData,
  };
}

export default useQuestionnaireSelection;
