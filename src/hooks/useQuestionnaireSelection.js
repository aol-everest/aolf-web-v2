import { useSessionStorage } from '@uidotdev/usehooks';
import { findExistingQuestionnaire } from '@utils';
import { useState } from 'react';

function useQuestionnaireSelection(questions, sequence) {
  const [value, setValue] = useSessionStorage('center-finder');
  const currentStepData = questions?.find((item) => item.sequence === sequence);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleOptionSelect = (answerId, helpResonse) => {
    console.log('value', value);
    let selectedIdsLocal = [answerId];
    if (sequence === 3) {
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
      scientificStudy: sequence === 1 ? helpResonse : value.scientificStudy,
    });
  };

  return {
    selectedIds,
    handleOptionSelect,
    currentStepData,
  };
}

export default useQuestionnaireSelection;
