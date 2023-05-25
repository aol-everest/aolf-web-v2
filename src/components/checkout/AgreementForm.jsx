import React, { useEffect } from "react";
import { Field } from "formik";
import classNames from "classnames";
import Link from "@components/linkWithUTM";

export const AgreementForm = ({
  formikProps,
  complianceQuestionnaire = [],
  isCorporateEvent,
  screen = "MOBILE",
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

  if (screen !== "MOBILE") {
    return (
      <>
        <div className="agreement mt-4 d-none d-lg-block">
          <div className="agreement__group agreement__group_important agreement__group_important_desktop">
            <input
              type="checkbox"
              className={classNames("custom-checkbox", {
                error:
                  formikProps.errors.ppaAgreement &&
                  formikProps.touched.ppaAgreement,
              })}
              placeholder=" "
              checked={formikProps.values.ppaAgreement}
              onChange={formikProps.handleChange("ppaAgreement")}
              value={formikProps.values.ppaAgreement}
              name="ppaAgreement"
            />
            <label htmlFor="program"></label>
            <p className="agreement__text">
              I agree to the{" "}
              <Link
                prefetch={false}
                href={
                  isCorporateEvent
                    ? "/policy/ppa-corporate"
                    : "/policy/ppa-course"
                }
                legacyBehavior
              >
                <a target="_blank" rel="noreferrer">
                  Program Participant agreement including privacy and
                  cancellation policy.
                </a>
              </Link>
            </p>
          </div>
          {formikProps.errors.ppaAgreement &&
            formikProps.touched.ppaAgreement && (
              <div className="agreement__important agreement__important_desktop">
                <img
                  className="agreement__important-icon"
                  src="/img/warning.svg"
                  alt="warning"
                />
                Please check the box in order to continue
              </div>
            )}
        </div>
        {complianceQuestionnaire && complianceQuestionnaire.length > 0 && (
          <div className="health-confirmation mt-4 d-none d-lg-block">
            {complianceQuestionnaire.map((compliance) => (
              <div
                key={compliance.questionSfid}
                className="health-confirmation__group health-confirmation__group_important health-confirmation__group_important_desktop"
              >
                <Field
                  name="questionnaire"
                  validate={validateQuestionnaire(complianceQuestionnaire)}
                >
                  {({ field, form }) => {
                    return (
                      <input
                        type="checkbox"
                        className={classNames("custom-checkbox", {
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
                <label htmlFor="health-confirmation"></label>
                {compliance.question && (
                  <p
                    className="health-confirmation__text"
                    dangerouslySetInnerHTML={{ __html: compliance.question }}
                  ></p>
                )}
              </div>
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

            <div className="health-confirmation__group health-confirmation__group_important health-confirmation__group_important_desktop">
              <p className="health-confirmation__text">
                <br />
                <br />
                For any health related questions, please contact us at{" "}
                <a href="mailto:healthinfo@us.artofliving.org">
                  healthinfo@us.artofliving.org
                </a>
              </p>
            </div>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <div className="agreement v2 mt-4 d-block d-lg-none">
        <div className="agreement__group">
          <input
            type="checkbox"
            className={classNames("custom-checkbox", {
              error:
                formikProps.errors.ppaAgreement &&
                formikProps.touched.ppaAgreement,
            })}
            placeholder=" "
            checked={formikProps.values.ppaAgreement}
            onChange={formikProps.handleChange("ppaAgreement")}
            value={formikProps.values.ppaAgreement}
            name="ppaAgreement"
          />
          <label htmlFor="ppaAgreement"></label>
          <p className="agreement__text">
            I agree to the{" "}
            <Link
              prefetch={false}
              href={
                isCorporateEvent
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
          </p>
        </div>
        {formikProps.errors.ppaAgreement &&
          formikProps.touched.ppaAgreement && (
            <div className="agreement__important agreement__important_desktop">
              <img
                className="agreement__important-icon"
                src="/img/warning.svg"
                alt="warning"
              />
              {formikProps.errors.ppaAgreement}
            </div>
          )}
        {complianceQuestionnaire && complianceQuestionnaire.length > 0 && (
          <>
            {complianceQuestionnaire.map((compliance) => (
              <React.Fragment key={compliance.questionSfid}>
                <div className="agreement__group mt-3">
                  <Field
                    name="questionnaire"
                    validate={validateQuestionnaire(complianceQuestionnaire)}
                  >
                    {({ field, form }) => {
                      return (
                        <input
                          type="checkbox"
                          className={classNames("custom-checkbox", {
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
                  <label htmlFor="health"></label>
                  {compliance.question && (
                    <p
                      className="agreement__text"
                      dangerouslySetInnerHTML={{ __html: compliance.question }}
                    ></p>
                  )}
                </div>
                {formikProps.errors.questionnaire &&
                  formikProps.touched.questionnaire && (
                    <div className="agreement__important agreement__important_desktop">
                      <img
                        className="agreement__important-icon"
                        src="/img/warning.svg"
                        alt="warning"
                      />
                      {formikProps.errors.questionnaire}
                    </div>
                  )}
              </React.Fragment>
            ))}
            <div className="agreement__group tw-mt-3 tw-pl-3">
              <p className="agreement__text">
                For any health related questions, please contact the health info
                desk at{" "}
                <a href={`mailto:healthinfo@us.artofliving.org`}>
                  healthinfo@us.artofliving.org
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};
