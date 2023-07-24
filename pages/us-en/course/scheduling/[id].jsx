import { US_STATES } from "@constants";
import { useRouter } from "next/router";
import { api } from "@utils";
import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { AgreementForm, Dropdown, StyledInput } from "@components/checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { replaceRouteWithUTMQuery } from "@service";
import { useQueryString } from "@hooks";

import { useGlobalModalContext } from "@contexts";
import PaymentFormScheduling from "@components/PaymentFormScheduling";

const SchedulingPayment = () => {
  const router = useRouter();
  const { hideModal } = useGlobalModalContext();
  const [mbsy_source] = useQueryString("mbsy_source");
  const [campaignid] = useQueryString("campaignid");
  const [mbsy] = useQueryString("mbsy");

  const childRef = useRef();

  const [workshop, setSelectedWorkshop] = useState({});
  const [loading, setLoading] = useState(false);
  const { id: workshopId } = router.query;

  useEffect(() => {
    const getWorshopDetails = async () => {
      const response = await api.get({
        path: "workshopDetail",
        param: {
          id: workshopId,
        },
      });
      if (response?.data) {
        setSelectedWorkshop(response?.data);
      }
    };
    if (workshopId) {
      getWorshopDetails();
    }
  }, [workshopId]);

  const { complianceQuestionnaire, title, unitPrice, showPrice } =
    workshop || {};

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const enrollmentCompletionAction = ({ attendeeId }) => {
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/course/thankyou/${attendeeId}`,
      query: {
        ctype: workshop.productTypeId,
        comboId: workshop?.sfid,
        page: "ty",
        type: `local${mbsy_source ? "&mbsy_source=" + mbsy_source : ""}`,
        campaignid,
        mbsy,
      },
    });
  };

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  return (
    <div id="widget-modal" className="overlaying-popup_active" role="dialog">
      <div className="scheduling-modal">
        <div
          role="button"
          aria-label="Close modal"
          className="scheduling-modal__btn-close"
          onClick={hideModal}
        >
          <img src="/img/ic-close-talk.svg" alt="close icon" />
        </div>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            contactAddress: "",
            contactCity: "",
            contactState: "",
            contactZip: "",
            questionnaire: questionnaireArray,
            ppaAgreement: false,
          }}
          validationSchema={Yup.object().shape({
            firstName: Yup.string().required("First Name is required"),
            lastName: Yup.string().required("Last Name is required"),
            email: Yup.string()
              .email("Email is invalid!")
              .required("Email is required!"),
            contactAddress: Yup.string().required("Address is required"),
            contactCity: Yup.string().required("City is required!"),
            contactState: Yup.string().required("State is required!"),
            contactZip: Yup.string()
              //.matches(/^[0-9]+$/, { message: 'Zip is invalid' })
              .min(2, "Zip is invalid")
              .max(10, "Zip is invalid"),
            ppaAgreement: Yup.boolean()
              .label("Terms")
              .test(
                "is-true",
                "Please check the box in order to continue.",
                (value) => value === true,
              ),
          })}
          onSubmit={async (values) => {
            await childRef.current.completeEnrollmentAction(values);
          }}
        >
          {(formikProps) => {
            const { handleSubmit } = formikProps;
            return (
              <div id="scheduling-step-1" className="scheduling-modal__body">
                <div>
                  <div className="scheduling__header">
                    <a href="/" className="logo">
                      <img
                        src="/img/ic-logo.svg"
                        alt="logo"
                        className="logo__image"
                      />
                    </a>
                  </div>

                  <form className="scheduling__auth" onSubmit={handleSubmit}>
                    <div className="row no-gutters ">
                      <div className="col-12 col-md-6">
                        <div className="scheduling__payment">
                          <div className=" mt-2">
                            <div className="scheduling__wrapper">
                              <StyledInput
                                className={`scheduling__input mb-2`}
                                placeholder="First name"
                                formikProps={formikProps}
                                formikKey="firstName"
                                tooltip="Enter given name"
                              ></StyledInput>
                              <StyledInput
                                className={`scheduling__input mb-2`}
                                placeholder="Last name"
                                formikProps={formikProps}
                                formikKey="lastName"
                              ></StyledInput>
                            </div>

                            <StyledInput
                              type="email"
                              className={`scheduling__input mb-2`}
                              placeholder="Email"
                              formikProps={formikProps}
                              formikKey="email"
                              onCut={(event) => {
                                event.preventDefault();
                              }}
                              onCopy={(event) => {
                                event.preventDefault();
                              }}
                              onPaste={(event) => {
                                event.preventDefault();
                              }}
                            ></StyledInput>

                            {/* <p
                              className="scheduling__forgot-password"
                              style={{ display: "none" }}
                            >
                              Forgot your password?
                              <button
                                className="scheduling__btn-aslink"
                                type="button"
                              >
                                Click here to reset
                              </button>
                            </p> */}
                          </div>

                          <h2 className="scheduling__title mt-2">
                            Payment Information
                          </h2>
                          <p className="scheduling__secure">
                            <span className="lock">
                              <img
                                src="/img/ic-lock-secure.svg"
                                alt="lock icon"
                              />
                            </span>
                            <span className="scheduling__secure-title">
                              All transactions are secure and encrypted
                            </span>
                          </p>

                          <div className="scheduling__select">
                            <input
                              className="scheduling__radio custom-radio"
                              type="radio"
                              name="payment"
                              defaultChecked={true}
                              id="payment-card"
                            />
                            <label
                              className="d-flex justify-content-between"
                              htmlFor="payment-card"
                            >
                              <span>Credit or Debit Card</span>
                              <ul className="scheduling__cards-list">
                                <li>
                                  <img
                                    width="20"
                                    height="20"
                                    src="/img/mastercard.svg"
                                    alt="mastercard logo"
                                  />
                                </li>
                                <li>
                                  <img
                                    width="20"
                                    height="20"
                                    src="/img/ic-visa.svg"
                                    alt="visa logo"
                                  />
                                </li>
                                <li>
                                  <img
                                    width="20"
                                    height="20"
                                    src="/img/discover.svg"
                                    alt="discover logo"
                                  />
                                </li>
                                <li>
                                  <img
                                    width="20"
                                    height="20"
                                    src="/img/american_express.svg"
                                    alt="american express logo"
                                  />
                                </li>
                              </ul>
                            </label>
                          </div>

                          <div className="scheduling__form-card">
                            <Elements
                              stripe={stripePromise}
                              fonts={[
                                {
                                  cssSrc:
                                    "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
                                },
                              ]}
                            >
                              <div className="scheduling__card">
                                <PaymentFormScheduling
                                  ref={childRef}
                                  workshop={workshop}
                                  setLoading={setLoading}
                                  loading={loading}
                                  enrollmentCompletionAction={
                                    enrollmentCompletionAction
                                  }
                                />
                              </div>
                            </Elements>

                            <h2 className="scheduling__title ">
                              Billing Address
                            </h2>
                            <div className="scheduling__address">
                              <ul>
                                <li>
                                  <div className="scheduling__wcf-select wcf-select wcf-form__field mb-2">
                                    <label
                                      htmlFor="get-tickets-country"
                                      className="wcf-select__label"
                                    >
                                      Country
                                    </label>

                                    <select
                                      id="get-tickets-country"
                                      name="get-tickets-country"
                                      data-placeholder="Select your country"
                                      className="wcf-select__field"
                                      value={
                                        formikProps.values["contactCountry"]
                                      }
                                      onChange={(ev) => {
                                        formikProps.setFieldValue(
                                          "contactCountry",
                                          ev.target.value,
                                        );
                                      }}
                                    >
                                      <option value="USA">USA</option>
                                      <option value="Argentina">
                                        Argentina
                                      </option>
                                      <option value="Armenia">Armenia</option>
                                      <option value="Australia">
                                        Australia
                                      </option>
                                      <option value="Austria">Austria</option>
                                      <option value="Bangladesh">
                                        Bangladesh
                                      </option>
                                      <option value="Belgium">Belgium</option>
                                      <option value="Bolivia">Bolivia</option>
                                      <option value="Brazil">Brazil</option>
                                      <option value="Bulgaria">Bulgaria</option>
                                      <option value="Canada">Canada</option>
                                      <option value="Chad">Chad</option>
                                      <option value="Chile">Chile</option>
                                      <option value="China">China</option>
                                      <option value="Columbia">Columbia</option>
                                      <option value="Costa Rica">
                                        Costa Rica
                                      </option>
                                      <option value="Cuba">Cuba</option>
                                      <option value="Czech Republic">
                                        Czech Republic
                                      </option>
                                      <option value="Egypt">Egypt</option>
                                      <option value="England">England</option>
                                      <option value="Estonia">Estonia</option>
                                      <option value="Finland">Finland</option>
                                      <option value="France">France</option>
                                      <option value="Gabon">Gabon</option>
                                      <option value="Germany">Germany</option>
                                      <option value="Greece">Greece</option>
                                      <option value="Guinea">Guinea</option>
                                      <option value="Hungary">Hungary</option>
                                      <option value="India">India</option>
                                      <option value="Indonesia">
                                        Indonesia
                                      </option>
                                      <option value="Ireland">Ireland</option>
                                      <option value="Israel">Israel</option>
                                      <option value="Italy">Italy</option>
                                      <option value="Japan">Japan</option>
                                      <option value="Latvia">Latvia</option>
                                      <option value="Lithuania">
                                        Lithuania
                                      </option>
                                      <option value="Luxembourg">
                                        Luxembourg
                                      </option>
                                      <option value="Madagascar">
                                        Madagascar
                                      </option>
                                      <option value="Mali">Mali</option>
                                      <option value="Mexico">Mexico</option>
                                      <option value="Netherlands">
                                        Netherlands
                                      </option>
                                      <option value="Nigeria">Nigeria</option>
                                      <option value="Norway">Norway</option>
                                      <option value="Pakistan">Pakistan</option>
                                      <option value="Peru">Peru</option>
                                      <option value="Philippines">
                                        Philippines
                                      </option>
                                      <option value="Poland">Poland</option>
                                      <option value="Portugal">Portugal</option>
                                      <option value="Puerto Rico">
                                        Puerto Rico
                                      </option>
                                      <option value="Republic of Congo">
                                        Republic of Congo
                                      </option>
                                      <option value="Romania">Romania</option>
                                      <option value="Russia">Russia</option>
                                      <option value="South Korea">
                                        South Korea
                                      </option>
                                      <option value="Spain">Spain</option>
                                      <option value="Sweden">Sweden</option>
                                      <option value="Switzerland">
                                        Switzerland
                                      </option>
                                      <option value="Thailand">Thailand</option>
                                      <option value="Turkey">Turkey</option>
                                      <option value="UK">UK</option>
                                      <option value="Ukraine">Ukraine</option>
                                      <option value="United Arab Emirates">
                                        United Arab Emirates
                                      </option>
                                      <option value="Venezuela">
                                        Venezuela
                                      </option>
                                      <option value="Vietnam">Vietnam</option>
                                      <option value="Yemen">Yemen</option>
                                    </select>
                                  </div>
                                </li>

                                <li>
                                  <label className="scheduling__label">
                                    Street Address
                                  </label>
                                  <StyledInput
                                    className="scheduling__input mb-2"
                                    placeholder="Street"
                                    formikProps={formikProps}
                                    formikKey="contactAddress"
                                    fullWidth
                                  ></StyledInput>
                                </li>
                              </ul>

                              {/* <button className="scheduling__plus" type="button">
                                <img
                                  width="15"
                                  height="15"
                                  src="/img/plus.svg"
                                  alt="icon plus"
                                />
                                Add address line 2
                              </button> */}

                              <div className="row mt-2">
                                <div className="col-4">
                                  <label
                                    className="scheduling__label"
                                    htmlFor="contactCity"
                                  >
                                    City
                                  </label>
                                  <StyledInput
                                    className="scheduling__input mb-2"
                                    placeholder="City"
                                    formikProps={formikProps}
                                    formikKey="contactCity"
                                    fullWidth
                                  ></StyledInput>
                                </div>
                                <div className="col-4">
                                  <label
                                    className="scheduling__label"
                                    htmlFor="contactState"
                                  >
                                    State
                                  </label>
                                  <div className="scheduling__select-box select-box">
                                    <Dropdown
                                      placeholder="State"
                                      formikProps={formikProps}
                                      formikKey="contactState"
                                      options={US_STATES}
                                      innerFullWidth={true}
                                    ></Dropdown>
                                  </div>
                                </div>
                                <div className="col-4">
                                  <label
                                    className="scheduling__label"
                                    htmlFor="contactZip"
                                  >
                                    ZIP Code
                                  </label>
                                  <StyledInput
                                    className="scheduling__input mb-2"
                                    placeholder="Zip"
                                    formikProps={formikProps}
                                    formikKey="contactZip"
                                  ></StyledInput>
                                </div>
                              </div>

                              <div className="scheduling__line mt-3 mb-3"></div>

                              {/* <div>
                                <button className="scheduling__plus" type="button">
                                  <img
                                    width="15"
                                    height="15"
                                    src="/img/plus.svg"
                                    alt="icon plus"
                                  />
                                  <span>
                                    Are you business? Enter your Tax ID (if
                                    applicable)
                                  </span>
                                </button>
                              </div> */}
                            </div>
                          </div>

                          <div className="reciept">
                            <div className="mt-3 scheduling__wrap-checkbox">
                              <AgreementForm
                                formikProps={formikProps}
                                complianceQuestionnaire={
                                  complianceQuestionnaire
                                }
                                isCorporateEvent={false}
                                questionnaireArray={questionnaireArray}
                                screen="DESKTOP"
                              />
                              <AgreementForm
                                formikProps={formikProps}
                                complianceQuestionnaire={
                                  complianceQuestionnaire
                                }
                                questionnaireArray={questionnaireArray}
                                isCorporateEvent={false}
                                screen="MOBILE"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="scheduling__summary">
                          <h2 className="scheduling__title">Order Summary</h2>
                          <div className="scheduling__check">
                            <div className="row no-gutters">
                              <img
                                className="mr-2"
                                src={"/img/skybreath-meditation.jpg"}
                                alt="skybreath meditation photo"
                              />

                              <div>
                                <h2 className="scheduling__title">{title}</h2>
                                <p className="scheduling__text">
                                  9 Hour Meditation Course
                                </p>
                              </div>
                            </div>

                            <h4 className="scheduling__title mt-3">Ext. tax</h4>
                            <div className="scheduling__line mt-3 mb-3"></div>

                            <div className="row no-gutters justify-content-between">
                              <div className="col-4 text-nowrap">
                                <h4 className="scheduling__title">
                                  Build Today (USD)
                                </h4>
                              </div>
                              <div className="col-4 text-right">
                                <p className="scheduling__text-black">
                                  <strong>${unitPrice || 0}</strong>{" "}
                                  <i>plus tax</i>
                                </p>
                              </div>
                            </div>
                          </div>

                          <p className="scheduling__secure mt-3">
                            <span className="lock">
                              <img
                                src="/img/ic-lock-secure.svg"
                                alt="lock icon"
                              />
                            </span>
                            <span className="scheduling__secure-title">
                              This is a secure 128-bit SSL encrypted payment
                            </span>
                          </p>

                          <button
                            type="submit"
                            id="buy-now"
                            className="scheduling__button mt-3"
                            disabled={loading}
                          >
                            buy now
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

SchedulingPayment.hideHeader = true;
SchedulingPayment.hideFooter = true;

export default SchedulingPayment;
