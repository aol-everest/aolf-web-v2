/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { api, trimAndSplitName } from '@utils';
import { useAnalytics } from 'use-analytics';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Yup from 'yup';
import useQuestionnaireSelection from 'src/hooks/useQuestionnaireSelection';
import { useGlobalAlertContext } from '@contexts';
import { ALERT_TYPES } from '@constants';
import { PhoneInputNewCheckout } from '@components/checkout';

const humanizeNumber = (num) => {
  var ones = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  var tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  var numString = num.toString();

  if (num < 0) throw new Error('Negative numbers are not supported.');

  if (num === 0) return 'zero';

  //the case of 1 - 20
  if (num < 20) {
    return ones[num];
  }

  if (numString.length === 2) {
    return tens[numString[0]] + ' ' + ones[numString[1]];
  }

  //100 and more
  if (numString.length == 3) {
    if (numString[1] === '0' && numString[2] === '0')
      return ones[numString[0]] + ' hundred';
    else
      return (
        ones[numString[0]] +
        ' hundred and ' +
        humanizeNumber(+(numString[1] + numString[2]))
      );
  }

  if (numString.length === 4) {
    var end = +(numString[1] + numString[2] + numString[3]);
    if (end === 0) return ones[numString[0]] + ' thousand';
    if (end < 100)
      return ones[numString[0]] + ' thousand and ' + humanizeNumber(end);
    return ones[numString[0]] + ' thousand ' + humanizeNumber(end);
  }
};

const CourseFinder = () => {
  const router = useRouter();
  const { track, page } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlertContext();
  const [value, setValue] = useSessionStorage('center-finder', {});
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(1);
  const [showScientificStudies, setShowScientificStudies] = useState(false);
  const { totalSelectedOptions = [], scientificStudy } = value;

  const { data: questions, isLoading } = useQuery({
    queryKey: 'getOnBoardingQuestions',
    queryFn: async () => {
      const response = await api.get({
        path: 'getOnBoardingQuestions',
      });
      return response.data;
    },
    enabled: true,
  });

  const {
    selectedIds,
    handleOptionSelect,
    currentStepData,
    isMultiStep,
    isMultiSelectQuestion,
    previousStepData,
  } = useQuestionnaireSelection(questions, currentQuestionCount);

  const isUserDetailsForm = currentStepData?.questionType === 'Text';
  const totalStepCount = questions?.reduce((total, element) => {
    const stepCount = element.stepCount !== null ? element.stepCount : 1;
    return total + stepCount;
  }, 0);

  const handleNextStep = () => {
    const answers = currentStepData.options.reduce(
      (accumulator, currentValue) => {
        if (selectedIds.includes(currentValue.optionId)) {
          return [...accumulator, currentValue.optionText];
        }
        return accumulator;
      },
      [],
    );
    track(`question_${humanizeNumber(currentStep)}_click`, {
      answer_chosen: answers.join(', '),
    });
    setCurrentStep((prevCount) => prevCount + 1);

    if (isMultiStep && !showScientificStudies) {
      setShowScientificStudies(true);
    } else {
      setShowScientificStudies(false);
    }

    if (!showScientificStudies) {
      setCurrentQuestionCount(currentQuestionCount + 1);
    }
  };

  const handlePreviousStep = async () => {
    if (currentStep === 1) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder/welcome`,
      });
      return;
    }
    const decreaseStep =
      previousStepData?.stepCount > 1 && !showScientificStudies ? 2 : 1;
    setCurrentStep((prevStep) => prevStep - decreaseStep);
    setCurrentQuestionCount((prevCount) => prevCount - 1);
    setShowScientificStudies(false);
  };

  const submitUserDetails = async (values) => {
    setLoading(true);

    let [firstName = '', lastName = ''] = trimAndSplitName(values?.name || '');

    const payload = {
      user: {
        firstName: firstName,
        lastName: lastName,
        email: values?.email,
        contactMeFurther: values?.guidance,
        contactPhone: values?.contactPhone,
      },
      answers: [...totalSelectedOptions],
    };
    try {
      const {
        status,
        error: errorMessage,
        isError,
        data,
      } = await api.post({
        path: 'getRecommendationsBasedOnQuestions',
        body: payload,
      });
      setLoading(false);
      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }
      if (data || status === 200) {
        await setValue({
          ...value,
          recommendationResponse: data,
        });
        track(`questionnaire_submit`, {});
        pushRouteWithUTMQuery(router, {
          pathname: `/us-en/course-finder/result`,
        });
      }
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
  };

  const userDetails = () => {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          name: '',
          email: '',
          contactPhone: '',
          guidance: false,
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Name is required!'),
          email: Yup.string()
            .email('Email is invalid!')
            .required('Email is required!'),
          contactPhone: Yup.string(),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          await submitUserDetails(values);
        }}
      >
        {(props) => {
          const {
            values,
            touched,
            errors,
            handleSubmit,
            handleChange,
            handleBlur,
            setFieldValue,
          } = props;

          return (
            <form
              name="workshopEnroll"
              onSubmit={handleSubmit}
              className="workshopEnroll"
            >
              <div className="question-box">
                <h1 className="question-title mt-0">
                  Where can we send your personalized recommendation?
                </h1>
                <div className="recommendation-form">
                  <div className="form-item">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className={
                        errors.name && touched.name
                          ? 'form-control error'
                          : 'form-control'
                      }
                      id="name"
                      placeholder=" "
                      value={values.name}
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className="form-item">
                    <label htmlFor="email">Email address</label>
                    <input
                      type="email"
                      className={
                        errors.email && touched.email
                          ? 'form-control error'
                          : 'form-control'
                      }
                      id="email"
                      placeholder=" "
                      value={values.email}
                      name="email"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className="form-item">
                    <PhoneInputNewCheckout
                      className="second form-item required"
                      containerClass={`scheduling-modal__content-wrapper-form-list-row`}
                      formikProps={props}
                      formikKey="contactPhone"
                      name="contactPhone"
                      label=" Mobile number (optional)"
                      placeholder="Mobile number"
                      type="tel"
                    ></PhoneInputNewCheckout>
                  </div>

                  <div className="form-item checkbox">
                    <input
                      type="checkbox"
                      id="guidance"
                      name="guidance"
                      onChange={(ev) => {
                        setFieldValue('guidance', ev.target.checked);
                      }}
                      onBlur={handleBlur}
                    />
                    <label htmlFor="guidance">
                      I'd like a well-being expert to reach out to me for
                      further guidance.
                    </label>
                  </div>
                </div>

                <div className="question-action">
                  <button type="submit" className="btn-register">
                    Continue
                  </button>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    );
  };

  const selectedItem = totalSelectedOptions.find(
    (item) => item?.questionSfid === currentStepData?.questionSfid,
  );

  const stepHighlighters = Array.from(
    { length: totalStepCount },
    (_, index) => index + 1,
  );

  return (
    <>
      {(isLoading || loading) && <div className="cover-spin"></div>}

      <main className="course-finder-questionnaire-question checkout-aol">
        <section className="questionnaire-question">
          <div className="container">
            <div className="back-btn-wrap">
              <button className="back-btn" onClick={handlePreviousStep}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.57 5.93018L3.5 12.0002L9.57 18.0702"
                    stroke="#31364E"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.4999 12H3.66992"
                    stroke="#31364E"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>
            </div>

            {isUserDetailsForm ? (
              userDetails()
            ) : (
              <div className="question-box">
                <div className="question-step-highlighter-wrap">
                  {stepHighlighters?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className={`question-step-highlighter ${
                          currentStep >= item ? 'active' : ''
                        }`}
                      ></div>
                    );
                  })}
                </div>
                {showScientificStudies ? (
                  <>
                    <h1 className="question-title">
                      Scientific Studies are reporting
                    </h1>
                    <div className="question-options">
                      <div className="option-item">
                        <input
                          type="checkbox"
                          id={scientificStudy?.optionId}
                          name={scientificStudy?.optionId}
                          defaultChecked={true}
                          disabled
                        />
                        <label htmlFor={scientificStudy?.optionId}>
                          {scientificStudy?.iconURL && (
                            <img
                              src={scientificStudy?.iconURL}
                              alt={scientificStudy?.optionText}
                              width={24}
                            />
                          )}
                          {scientificStudy?.optionText}
                        </label>
                      </div>
                      <div className="questions-info">
                        <div className="info-text">
                          {scientificStudy?.description}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h1
                      className="question-title"
                      dangerouslySetInnerHTML={{
                        __html: currentStepData?.question,
                      }}
                    ></h1>
                    {isMultiSelectQuestion && (
                      <div className="question-description">
                        * You can select up to 2 options
                      </div>
                    )}

                    <div className="question-options">
                      {currentStepData?.options?.map((answer) => {
                        return (
                          <div className="option-item" key={answer.optionId}>
                            <input
                              type="checkbox"
                              id={answer.optionId}
                              name={answer.optionId}
                              checked={
                                selectedItem?.answer.includes(
                                  answer.optionId,
                                ) || selectedIds.includes(answer.optionId)
                              }
                              onChange={(ev) =>
                                handleOptionSelect(answer.optionId, answer)
                              }
                            />
                            <label htmlFor={answer.optionId}>
                              {answer?.iconURL && (
                                <img
                                  src={answer?.iconURL}
                                  alt={answer.optionText}
                                  width={24}
                                />
                              )}
                              {answer.optionText}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="question-action">
                  <button
                    className="btn-register"
                    onClick={handleNextStep}
                    disabled={
                      !selectedItem?.questionSfid && !showScientificStudies
                    }
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

CourseFinder.hideFooter = true;

export default CourseFinder;
