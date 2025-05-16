import Link from '@components/linkWithUTM';
import { orgConfig } from '@org';
import classNames from 'classnames';
import { Field } from 'formik';
import React, { useEffect } from 'react';
import { useAnalytics } from 'use-analytics';

export const ScheduleAgreementForm = ({
  formikProps,
  complianceQuestionnaire = [],
  isCorporateEvent,
  questionnaireArray,
  workshop,
  parentClass = 'mt-4',
  hideValidation = false,
  isBoonSanyamCourse = false,
}) => {
  const { track, page } = useAnalytics();
  const validateQuestionnaire = (complianceQuestionnaire) => (value) => {
    let error;
    let result = false;
    value.forEach((ques) => {
      const match = complianceQuestionnaire.find(
        (current) => current.questionSfid === ques.key,
      );
      if (match) {
        result =
          result ||
          (match.answerShouldBe !== 'Yes' && ques.value) ||
          (match.answerShouldBe === 'Yes' && !ques.value);
      }
    });
    if (result) {
      error = 'Please check the box in order to continue.';
    }
    return error;
  };

  useEffect(() => {
    if (
      formikProps?.values?.questionnaire?.length === 0 &&
      complianceQuestionnaire?.length > 0
    ) {
      formikProps.setFieldValue('questionnaire', questionnaireArray);
    }
  }, [questionnaireArray]);

  const isIahv = orgConfig.name === 'IAHV';

  const onChangeHandler = (e) => {
    track('ppa_button_click', {
      program_id: workshop?.id,
      program_name: workshop?.title,
      program_date: workshop?.eventStartDate,
      program_time: workshop?.eventStartTime,
      category: 'All',
    });
  };

  return (
    <>
      <Field name="ppaAgreement">
        {({ field, meta }) => (
          <>
            <div className="form-item checkbox">
              <input
                type="checkbox"
                id="privacy"
                className={classNames('', {
                  error: meta.touched && meta.error,
                })}
                {...field} // Includes `name`, `value`, `checked`, and `onChange`
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e); // Formik's default onChange handler
                  onChangeHandler(e); // Custom tracking logic
                }}
              />

              <label htmlFor="privacy" className="events-news">
                I agree to the{' '}
                {!isBoonSanyamCourse ? (
                  <Link
                    prefetch={false}
                    href={
                      isIahv
                        ? 'https://members.us.iahv.org/policy/ppa-course'
                        : isCorporateEvent
                          ? '/policy/ppa-corporate'
                          : '/policy/ppa-course'
                    }
                    legacyBehavior
                  >
                    <a target="_blank" rel="noreferrer">
                      Program Participant agreement including privacy and
                      cancellation policy.
                    </a>
                  </Link>
                ) : (
                  <Link
                    prefetch={false}
                    href="https://artoflivingretreatcenter.org/program-participant-agreement/?__hstc=80379463.98ac18cff5c2221f10208903490cef0b.1729531142586.1747310941158.1747342458226.382&__hssc=80379463.4.1747342458226&__hsfp=4009502119"
                    legacyBehavior
                  >
                    <a target="_blank" rel="noreferrer">
                      Program Participant agreement.
                    </a>
                  </Link>
                )}
              </label>
            </div>
            {!hideValidation && meta.touched && meta.error && (
              <div className="agreement">
                {formikProps.errors.ppaAgreement &&
                  formikProps.touched.ppaAgreement && (
                    <div className="agreement__important">
                      <img
                        className="agreement__important-icon"
                        src="/img/warning.svg"
                        alt="warning"
                      />{' '}
                      Please check the box in order to continue
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </Field>

      {complianceQuestionnaire && complianceQuestionnaire.length > 0 && (
        <div className={`health-confirmation ${parentClass}`}>
          {complianceQuestionnaire.map((compliance) => (
            <div
              className="form-item checkbox mb-2"
              key={compliance.questionSfid}
            >
              <Field
                name="questionnaire"
                validate={validateQuestionnaire(complianceQuestionnaire)}
              >
                {({ field, form }) => {
                  return (
                    <input
                      type="checkbox"
                      id={`health${compliance.questionSfid}`}
                      name="health"
                      className={classNames({
                        error:
                          formikProps.errors.questionnaire &&
                          formikProps.touched.questionnaire,
                      })}
                      checked={field.value.find(
                        (v) => v.key === compliance.questionSfid && v.value,
                      )}
                      value={compliance.questionSfid}
                      onClick={() => {
                        track('health_agreement_button_click', {
                          program_id: workshop?.id,
                          program_name: workshop?.title,
                          program_date: workshop?.eventStartDate,
                          program_time: workshop?.eventStartTime,
                          category: 'All',
                        });
                        const currentValue = field.value.find(
                          (v) => v.key === compliance.questionSfid,
                        );
                        const otherValues = field.value.filter(
                          (v) => v.key !== compliance.questionSfid,
                        );
                        if (currentValue) {
                          currentValue.value = !currentValue.value;
                          const nextValue = [...otherValues, currentValue];

                          form.setFieldValue('questionnaire', nextValue);
                          formikProps.setFieldTouched('questionnaire', true);
                        }
                      }}
                    />
                  );
                }}
              </Field>
              <label
                htmlFor={`health${compliance.questionSfid}`}
                className="events-news"
              >
                {compliance.question && (
                  <span
                    dangerouslySetInnerHTML={{ __html: compliance.question }}
                  ></span>
                )}
              </label>
            </div>
          ))}
          {!hideValidation && (
            <>
              {formikProps.errors.questionnaire &&
                formikProps.touched.questionnaire && (
                  <div className="agreement__important">
                    <img
                      className="agreement__important-icon"
                      src="/img/warning.svg"
                      alt="warning"
                    />{' '}
                    Please check the box in order to continue
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </>
  );
};
