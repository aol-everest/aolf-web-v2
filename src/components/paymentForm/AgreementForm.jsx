import React, { Fragment } from "react";
import { Field, ErrorMessage } from "formik";
import classNames from "classnames";
import renderHTML from "react-render-html";

export const AgreementForm = ({
  formikProps,
  complianceQuestionnaire,
  isCorporateEvent,
  screen = "MOBILE",
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
  if (screen !== "MOBILE") {
    return (
      <>
        <div class="agreement mt-4 d-none d-lg-block">
          <div class="agreement__group agreement__group_important agreement__group_important_desktop">
            <input
              type="checkbox"
              class={classNames("custom-checkbox", {
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
            <label for="program"></label>
            <p class="agreement__text">
              I agree to the{" "}
              <a
                href={isCorporateEvent ? "/us/ts-cs" : "/us/workshop-ppa"}
                target="_blank"
              >
                Program Participant agreement including privacy and cancellation
                policy.
              </a>
            </p>
          </div>
          {formikProps.errors.ppaAgreement && formikProps.touched.ppaAgreement && (
            <div class="agreement__important agreement__important_desktop">
              <img
                class="agreement__important-icon"
                src="/img/warning.svg"
                alt="warning"
              />
              Please check the box in order to continue
            </div>
          )}
        </div>
        {complianceQuestionnaire && complianceQuestionnaire.length > 0 && (
          <div class="health-confirmation mt-4 d-none d-lg-block">
            {complianceQuestionnaire.map((compliance) => (
              <div class="health-confirmation__group health-confirmation__group_important health-confirmation__group_important_desktop">
                <Field
                  name="questionnaire"
                  validate={validateQuestionnaire(complianceQuestionnaire)}
                >
                  {({ field, form }) => {
                    return (
                      <input
                        type="checkbox"
                        class={classNames("custom-checkbox", {
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
                <label for="health-confirmation"></label>
                <p class="health-confirmation__text">
                  {renderHTML(compliance.question)}
                </p>
              </div>
            ))}
            {formikProps.errors.questionnaire &&
              formikProps.touched.questionnaire && (
                <div class="health-confirmation__important health-confirmation__important_desktop">
                  <img
                    class="health-confirmation__important-icon"
                    src="/img/warning.svg"
                    alt="warning"
                  />
                  Please check the box in order to continue
                </div>
              )}

            <div class="health-confirmation__group health-confirmation__group_important health-confirmation__group_important_desktop">
              <p class="health-confirmation__text">
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
      <div class="agreement v2 mt-4 d-block d-lg-none">
        <div class="agreement__group">
          <input
            type="checkbox"
            class={classNames("custom-checkbox", {
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
          <label for="ppaAgreement"></label>
          <p class="agreement__text">
            I agree to the{" "}
            <a
              href={isCorporateEvent ? "/us/ts-cs" : "/us/workshop-ppa"}
              target="_blank"
            >
              Program Participant agreement including privacy and cancellation
              policy.
            </a>
          </p>
        </div>
        {formikProps.errors.ppaAgreement && formikProps.touched.ppaAgreement && (
          <div class="agreement__important agreement__important_desktop">
            <img
              class="agreement__important-icon"
              src="/img/warning.svg"
              alt="warning"
            />
            {formikProps.errors.ppaAgreement}
          </div>
        )}
        {complianceQuestionnaire && complianceQuestionnaire.length > 0 && (
          <>
            {complianceQuestionnaire.map((compliance) => (
              <>
                <div class="agreement__group mt-3">
                  <Field
                    name="questionnaire"
                    validate={validateQuestionnaire(complianceQuestionnaire)}
                  >
                    {({ field, form }) => {
                      return (
                        <input
                          type="checkbox"
                          class={classNames("custom-checkbox", {
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
                  <label for="health"></label>
                  <p class="agreement__text">
                    {renderHTML(compliance.question)}
                  </p>
                </div>
                {formikProps.errors.questionnaire &&
                  formikProps.touched.questionnaire && (
                    <div class="agreement__important agreement__important_desktop">
                      <img
                        class="agreement__important-icon"
                        src="/img/warning.svg"
                        alt="warning"
                      />
                      {formikProps.errors.questionnaire}
                    </div>
                  )}
              </>
            ))}
            <div class="agreement__group mt-3" style={{ paddingLeft: "19px" }}>
              <p class="agreement__text">
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
