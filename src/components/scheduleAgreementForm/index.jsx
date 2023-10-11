import Link from "@components/linkWithUTM";
import { orgConfig } from "@org";
import classNames from "classnames";
import { Field } from "formik";
import React, { useEffect } from "react";

export const ScheduleAgreementForm = ({
  formikProps,
  complianceQuestionnaire = [],
  isCorporateEvent,
  questionnaireArray,
}) => {
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
          (match.answerShouldBe !== "Yes" && ques.value) ||
          (match.answerShouldBe === "Yes" && !ques.value);
      }
    });
    if (result) {
      error = "Please check the box in order to continue.";
    }
    return error;
  };

  useEffect(() => {
    if (
      formikProps?.values?.questionnaire?.length === 0 &&
      complianceQuestionnaire?.length > 0
    ) {
      formikProps.setFieldValue("questionnaire", questionnaireArray);
    }
  }, [questionnaireArray]);

  const isIahv = orgConfig.name === "IAHV";

  return (
    <>
      <p className="scheduling-modal__content-wrapper-form-checkbox">
        <input
          type="checkbox"
          className={classNames("", {
            error:
              formikProps.errors.ppaAgreement &&
              formikProps.touched.ppaAgreement,
          })}
          id="privacy"
          checked={formikProps.values.ppaAgreement}
          onChange={formikProps.handleChange("ppaAgreement")}
          value={formikProps.values.ppaAgreement}
          name="ppaAgreement"
        />

        <label htmlFor="privacy">
          <span className="agreement__text">
            I agree to the{" "}
            <Link
              prefetch={false}
              href={
                isIahv
                  ? "https://members.us.iahv.org/policy/ppa-course"
                  : isCorporateEvent
                  ? "/policy/ppa-corporate"
                  : "/policy/ppa-course"
              }
              legacyBehavior
            >
              <a target="_blank" rel="noreferrer">
                Program Participant agreement including privacy and cancellation
                policy.
              </a>
            </Link>
          </span>
        </label>
      </p>

      <div className="agreement mt-4">
        {formikProps.errors.ppaAgreement &&
          formikProps.touched.ppaAgreement && (
            <p className="scheduling-modal__content-wrapper-form-checkbox">
              <img
                className="agreement__important-icon"
                src="/img/warning.svg"
                alt="warning"
              />
              Please check the box in order to continue
            </p>
          )}
      </div>
      {complianceQuestionnaire && complianceQuestionnaire.length > 0 && (
        <div className="health-confirmation mt-4">
          {complianceQuestionnaire.map((compliance) => (
            <p
              className="scheduling-modal__content-wrapper-form-checkbox"
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
                      id="health"
                      name="health"
                      className={classNames("", {
                        error:
                          formikProps.errors.questionnaire &&
                          formikProps.touched.questionnaire,
                      })}
                      checked={field.value.find(
                        (v) => v.key === compliance.questionSfid && v.value,
                      )}
                      value={compliance.questionSfid}
                      onChange={() => {
                        const currentValue = field.value.find(
                          (v) => v.key === compliance.questionSfid,
                        );
                        const otherValues = field.value.filter(
                          (v) => v.key !== compliance.questionSfid,
                        );
                        if (currentValue) {
                          currentValue.value = !currentValue.value;
                          const nextValue = [...otherValues, currentValue];

                          form.setFieldValue("questionnaire", nextValue);
                        }
                      }}
                    />
                  );
                }}
              </Field>
              <label htmlFor="health">
                {compliance.question && (
                  <span
                    dangerouslySetInnerHTML={{ __html: compliance.question }}
                  ></span>
                )}
              </label>
            </p>
          ))}
          {formikProps.errors.questionnaire &&
            formikProps.touched.questionnaire && (
              <div className="health-confirmation__important health-confirmation__important_desktop">
                <img
                  className="health-confirmation__important-icon"
                  src="/img/warning.svg"
                  alt="warning"
                />
                Please check the box in order to continue
              </div>
            )}
        </div>
      )}
    </>
  );
};
