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
    formikProps.handleChange('ppaAgreement')(e);
    // formikProps.setFieldTouched('ppaAgreement', true);
  };

  return (
    <>
      <div className="form-item checkbox">
        <input
          type="checkbox"
          className={classNames('', {
            error:
              formikProps.errors.ppaAgreement &&
              formikProps.touched.ppaAgreement,
          })}
          id="privacy"
          checked={formikProps.values.ppaAgreement}
          onChange={onChangeHandler}
          value={formikProps.values.ppaAgreement}
          name="ppaAgreement"
        />

        <label htmlFor="privacy" className="events-news">
          I agree to the{' '}
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
              Program Participant agreement including privacy and cancellation
              policy.
            </a>
          </Link>
        </label>
      </div>

      {!hideValidation && (
        <div className="agreement">
          {formikProps.errors.ppaAgreement &&
            formikProps.touched.ppaAgreement && (
              <div className="agreement__important">
                <img
                  className="agreement__important-icon"
                  src="/img/warning.svg"
                  alt="warning"
                />
                Please check the box in order to continue
              </div>
            )}
        </div>
      )}
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
                    />
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
