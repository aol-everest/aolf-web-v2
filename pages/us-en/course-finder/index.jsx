/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { api, trimAndSplitName } from '@utils';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import * as Yup from 'yup';
import useQuestionnaireSelection from 'src/hooks/useQuestionnaireSelection';
import { useGlobalAlertContext } from '@contexts';
import { ALERT_TYPES } from '@constants';
import { PhoneInputNewCheckout } from '@components/checkout';

const Step1 = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlertContext();
  const [value, setValue] = useSessionStorage('center-finder', {});
  const [currentStep, setCurrentStep] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const [captureUserDetails, setCaptureUserDetails] = useState(false);
  const { totalSelectedOptions = [] } = value;

  const { data: questions, isLoading } = useQuery(
    'getOnBoardingQuestions',
    async () => {
      const response = await api.get({
        path: 'getOnBoardingQuestions',
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: true,
    },
  );

  const {
    updatedOptions,
    selectedHelpType,
    selectedIds,
    handleOptionSelect,
    currentStepData,
  } = useQuestionnaireSelection(value, questions, currentStep);

  const handleNextStep = () => {
    if (currentStep + 1 === questions.length) {
      setCaptureUserDetails(true);
    } else if (currentStep === 1 && !showReport) {
      setShowReport(true);
      if (!showReport) {
        setValue({
          ...value,
          totalSelectedOptions: updatedOptions || [],
          questions,
          selectedHelpType,
        });
      }
    } else {
      if (showReport) {
        setShowReport(false);
      }
      setValue({
        ...value,
        totalSelectedOptions: updatedOptions || [],
        questions,
        selectedHelpType,
      });
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = async () => {
    if (currentStep === 1) {
      await setValue({});
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder/welcome`,
      });
    } else {
      if (!captureUserDetails) {
        setCurrentStep(currentStep - 1);
      }
      if (captureUserDetails) {
        setCaptureUserDetails(false);
      }
    }
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
            {captureUserDetails ? (
              userDetails()
            ) : (
              <div className="question-box">
                <div className="question-step-highlighter-wrap">
                  {questions?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className={`question-step-highlighter ${
                          currentStep >= item.sequence ? 'active' : ''
                        }`}
                      ></div>
                    );
                  })}
                </div>
                {showReport ? (
                  <>
                    <h1 className="question-title">
                      Scientific Studies are reporting
                    </h1>
                    <div className="question-options">
                      <div className="option-item">
                        <input
                          type="checkbox"
                          id={selectedHelpType.optionId}
                          name={selectedHelpType.optionId}
                          defaultChecked={true}
                          disabled
                        />
                        <label htmlFor={selectedHelpType.optionId}>
                          {selectedHelpType?.iconURL && (
                            <img
                              src={selectedHelpType?.iconURL}
                              alt={selectedHelpType.optionText}
                              width={24}
                            />
                          )}
                          {selectedHelpType.optionText}
                        </label>
                      </div>
                      <div className="questions-info">
                        <div className="info-text">
                          {selectedHelpType.description}
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
                    {currentStep === 3 && (
                      <div className="question-description">
                        * You can select up to 2 options
                      </div>
                    )}

                    <div className="question-options">
                      {currentStepData?.options?.map((answer) => {
                        const selectedItem = totalSelectedOptions.find(
                          (item) =>
                            item.questionSfid === currentStepData.questionSfid,
                        );

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
                    disabled={!selectedIds.length}
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

export default Step1;
