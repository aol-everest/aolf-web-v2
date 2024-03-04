import { findExistingQuestionnaire } from '@utils';
import { useState, useEffect } from 'react';

function useQuestionnaireSelection(value, questions, sequence) {
  const currentStepData = questions?.find((item) => item.sequence === sequence);
  const [updatedOptions, setUpdatedOptions] = useState([]);
  const [selectedHelpType, setSelectedHelpType] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (
      value?.totalSelectedOptions &&
      !selectedIds?.length &&
      currentStepData &&
      !updatedOptions?.length
    ) {
      setUpdatedOptions(value?.totalSelectedOptions);
      const selectedOption = value?.totalSelectedOptions.find(
        (item) => item?.questionSfid === currentStepData?.questionSfid,
      );
      if (selectedOption?.answer) {
        setSelectedIds([...selectedOption.answer]);
      }
    }
  }, [currentStepData]);

  const handleOptionSelect = (answerId, helpResonse) => {
    if (sequence === 1) {
      setSelectedHelpType(helpResonse);
    }
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
    setUpdatedOptions(updatedOptions);
  };

  return {
    updatedOptions,
    selectedHelpType,
    selectedIds,
    setSelectedIds,
    handleOptionSelect,
    currentStepData,
  };
}

export default useQuestionnaireSelection;
