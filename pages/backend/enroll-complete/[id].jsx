import React, { useState } from "react";
import { Formik } from "formik";
import { useRouter } from "next/router";
import classNames from "classnames";
import { api } from "@utils";
import { ALERT_TYPES } from "@constants";
import { useGlobalAlertContext } from "@contexts";
import { Radiobox } from "@components/backendPaymentForm/Radiobox";
import { BackendRegisterationDetail } from "@components/backendRegisterationDetail";

import Style from "./Complete.module.scss";

export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { id } = query;

  const { data, attendeeRecord } = await api.get({
    path: "getWorkshopByAttendee",
    param: {
      aid: id,
      skipcheck: 1,
    },
  });
  return {
    props: {
      workshop: data,
      attendeeRecord,
    },
  };
};

const BackEndCheckoutComplete = ({ workshop = {}, attendeeRecord = {} }) => {
  const [inlineLoading, setInlineLoading] = useState(false);
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();

  const { complianceQuestionnaire, productTypeId } = workshop;

  const {
    ammountPaid,
    first_name,
    last_name,
    email: personemail,
    isInstalmentPayment,
  } = attendeeRecord;

  const completeRegisterationStep2 = async (values) => {
    try {
      if (!inlineLoading) {
        setInlineLoading(true);
        const { password, questionnaire } = values;
        const complianceQuestionnaire = questionnaire.reduce(
          (res, current) => ({
            ...res,
            [current.key]: current.value ? "Yes" : "No",
          }),
          {},
        );

        const results = await api.post({
          path: "completeRegisteration",
          body: {
            complianceQuestionnaire,
            password,
            attendeeRecordId: attendeeRecord.sfid,
          },
        });

        const { status } = results;

        if (status === "error" || status === 400) {
          throw new Error(results.message);
        }
        setInlineLoading(false);

        router.replace({
          pathname: `/us-en/course/thankyou/${attendeeRecord.sfid}`,
          query: {
            ctype: productTypeId,
            page: "ty",
          },
        });
      }
    } catch (ex) {
      console.log(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
      setInlineLoading(false);
    }
  };

  const _renderAlternativeSearch = (questionnaire, complianceQuestionnaire) => {
    let showAlternativeSearch = false;
    questionnaire.forEach((ques) => {
      const match = complianceQuestionnaire.find(
        (current) => current.questionSfid === ques.key,
      );
      if (match) {
        showAlternativeSearch =
          showAlternativeSearch ||
          (match.answerShouldBe !== "Yes" && ques.value) ||
          (match.answerShouldBe === "Yes" && !ques.value);
      }
    });

    return showAlternativeSearch;
  };

  const getPriceView = () => {
    return <p>Fee: ${ammountPaid || "0"}</p>;
  };

  const questionnaire = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const priceToShow = getPriceView();

  return (
    <main className="body_wrapper backend-reg-body">
      <div className="container">
        <div className="row">
          <BackendRegisterationDetail
            workshop={workshop}
            priceToShow={priceToShow}
          />
          <div className="col-md-6 col-sm-6 col-xs-12 form_right_wrap">
            <Formik
              enableReinitialize
              initialValues={{
                firstName: first_name,
                lastName: last_name,
                email: personemail,
                questionnaire: questionnaire,
                agreement: "agreement",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                await completeRegisterationStep2(values);
              }}
            >
              {(props) => {
                const { values, touched, errors, handleSubmit } = props;

                return (
                  <form
                    name="workshopEnroll"
                    onSubmit={handleSubmit}
                    className="workshopEnroll"
                  >
                    <div className="row">
                      <div className="col-sm-12 heading_info">
                        <p>User Information:</p>
                      </div>
                      <div className="col-sm-6">
                        <div
                          className={classNames(
                            "input-group inputLabel_place",
                            {
                              "text-input-error":
                                errors.firstName && touched.firstName,
                            },
                          )}
                        >
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            placeholder=" "
                            value={values.firstName}
                            name="firstName"
                            readOnly
                          />
                          <label htmlFor="firstName">
                            {errors.firstName && touched.firstName
                              ? errors.firstName
                              : "First Name"}
                          </label>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div
                          className={classNames(
                            "input-group inputLabel_place",
                            {
                              "text-input-error":
                                errors.lastName && touched.lastName,
                            },
                          )}
                        >
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            placeholder=" "
                            value={values.lastName}
                            name="lastName"
                            readOnly
                          />
                          <label htmlFor="lastName">
                            {errors.lastName && touched.lastName
                              ? errors.lastName
                              : "Last Name"}
                          </label>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div
                          className={classNames(
                            "input-group inputLabel_place",
                            {
                              "text-input-error": errors.email && touched.email,
                            },
                          )}
                        >
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder=" "
                            value={values.email}
                            name="email"
                            readOnly
                          />
                          <label htmlFor="email">
                            {errors.email && touched.email
                              ? errors.email
                              : "Email"}
                          </label>
                        </div>
                      </div>

                      {complianceQuestionnaire &&
                        complianceQuestionnaire.length > 0 && (
                          <>
                            <div className="col-sm-12 heading_info">
                              <p>Health Information:</p>
                            </div>
                            <div className="col-sm-12">
                              {complianceQuestionnaire.map((compliance) => (
                                <>
                                  <p className="wrap-p">
                                    <Radiobox
                                      name="questionnaire"
                                      value={compliance.questionSfid}
                                    />
                                    {"   "}
                                    <div
                                      className={Style.wrapNote}
                                      dangerouslySetInnerHTML={{
                                        __html: compliance.question,
                                      }}
                                    ></div>
                                  </p>
                                </>
                              ))}
                              <p className="alrtCondi !tw-mt-[30px] !tw-font-semibold">
                                For other support related questions, please
                                contact us at{" "}
                                <a href="mailto:app.support@us.artofliving.org">
                                  app.support@us.artofliving.org
                                </a>
                              </p>
                              <p className="alrtCondi tw-mt-4">
                                For any health related questions, please contact
                                us at{" "}
                                <a href="mailto:healthinfo@us.artofliving.org">
                                  healthinfo@us.artofliving.org.
                                </a>
                              </p>
                            </div>
                          </>
                        )}
                      <div className="col-sm-12">
                        <div>
                          {/* {isInstalmentPayment && (
                            <p className={Style.agreementNote}>
                              <Radiobox
                                name="installment"
                                value={"installment"}
                                dtype={1}
                              />
                              I agree to be charged monthly payment for{" "}
                              {workshop.instalmentTenure} months. I understand
                              that this monthly payment will recur for{" "}
                              {workshop.instalmentTenure} months and subscribe
                              to these terms.
                            </p>
                          )} */}
                          <p className={Style.agreementNote}>
                            <Radiobox
                              name="agreement"
                              value={"agreement"}
                              dtype={1}
                            />
                            I agree to{" "}
                            <a href="/us/ts-cs" target="_blank">
                              Program Participant agreement including privacy
                              policy
                            </a>
                            .
                          </p>
                        </div>
                      </div>

                      <div className="col-sm-12 complete_subs">
                        <button
                          type="submit"
                          className="btn btn-color"
                          disabled={
                            !values.agreement ||
                            (!values.installment && isInstalmentPayment) ||
                            _renderAlternativeSearch(
                              values.questionnaire,
                              complianceQuestionnaire,
                            )
                          }
                        >
                          {inlineLoading && (
                            <div className="loaded">
                              <div className="loader">
                                <div className="loader-inner ball-clip-rotate">
                                  <div />
                                </div>
                              </div>
                            </div>
                          )}
                          {!inlineLoading && `Complete Enrollment`}
                        </button>
                      </div>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </main>
  );
};
BackEndCheckoutComplete.hideHeader = false;

export default BackEndCheckoutComplete;
