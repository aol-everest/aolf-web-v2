import { findExistingQuestionnaire } from '@utils';
import { useState, useEffect } from 'react';

function useQuestionnaireSelection(value, questions, sequence) {
  const currentStepData = questions?.find((item) => item.sequence === sequence);
  const [updatedOptions, setUpdatedOptions] = useState([]);
  const [selectedOptionName, setSelectedOptionName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (
      value?.totalSelectedOptions &&
      !selectedIds?.length &&
      currentStepData &&
      !updatedOptions?.length
    ) {
      setUpdatedOptions(value?.totalSelectedOptions);
      setSelectedOptionName(value.type);
      const selectedOption = value?.totalSelectedOptions.find(
        (item) => item?.questionSfid === currentStepData?.questionSfid,
      );
      console.log('selectedOption', selectedOption);
      if (selectedOption?.answer) {
        setSelectedIds([...selectedOption.answer]);
      }
    }
  }, [currentStepData]);

  const handleOptionSelect = (answerId, answerName) => {
    setSelectedOptionName(answerName);
    let selectedIdsLocal = [answerId];
    if (sequence === 4) {
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
    selectedOptionName,
    selectedIds,
    setSelectedIds,
    handleOptionSelect,
    currentStepData,
  };
}

export default useQuestionnaireSelection;
