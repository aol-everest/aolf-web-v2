import { ALERT_TYPES, MODAL_TYPES, PAYMENT_MODES, US_STATES } from "@constants";
import { useRouter } from "next/router";
import { api } from "@utils";
import React, { useEffect, useState } from "react";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { AgreementForm, Dropdown, StyledInput } from "@components/checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentFormScheduling from "./paymentFormScheduling";
import { replaceRouteWithUTMQuery } from "@service";
import { useQueryString } from "@hooks";
import { filterAllowedParams } from "@utils/utmParam";

import { useAuth, useGlobalAlertContext } from "@contexts";

const SchedulingWidgetPayment = ({ workshop = {} }) => {
  const router = useRouter();
  // const { user } = useAuth();
  const { showAlert } = useGlobalAlertContext();
  const [mbsy_source] = useQueryString("mbsy_source");
  const [campaignid] = useQueryString("campaignid");
  const [mbsy] = useQueryString("mbsy");

  const [isChangingCard, setIsChangingCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenizeCCFromPayment, setTokenizeCCFromPayment] = useState(null);

  const {
    paymentMethod = {},
    publishableKey = "pk_test_DgstL7pH9HuVK0WRsdRKzW1q",
    complianceQuestionnaire,
  } = workshop;
  const stripePromise = loadStripe(publishableKey);

  const { cardLast4Digit = null } = paymentMethod;

  const questionnaire = complianceQuestionnaire
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

  const toggleCardChangeDetail = (e) => {
    if (e) e.preventDefault();
    setIsChangingCard((isChangingCard) => !isChangingCard);
  };

  const completeEnrollmentAction = async (values) => {
    if (loading) {
      return null;
    }

    const {
      id: productId,
      isCCNotRequired,
      availableTimings,
      isGenericWorkshop,
      addOnProducts,
    } = workshop;

    const {
      questionnaire,
      contactAddress,
      contactCity,
      contactState,
      contactZip,
    } = values;

    const complianceQuestionnaire = questionnaire.reduce(
      (res, current) => ({
        ...res,
        [current.key]: current.value ? "Yes" : "No",
      }),
      {},
    );

    try {
      setLoading(true);

      let tokenizeCC = tokenizeCCFromPayment;

      const selectedAddOn = null;

      let addOnProductsList = addOnProducts
        ? addOnProducts.map((product) => {
            if (!product.isAddOnSelectionRequired) {
              const value = values[product.productName];
              if (value) {
                return product.productSfid;
              } else {
                return null;
              }
            }
            return product.productSfid;
          })
        : [];

      let AddOnProductIds = [selectedAddOn, ...addOnProductsList];

      AddOnProductIds = AddOnProductIds.filter((AddOn) => AddOn !== null);

      const isRegularOrder = values.comboDetailId
        ? values.comboDetailId === productId
        : true;

      const products = isRegularOrder
        ? {
            productType: "workshop",
            productSfId: productId,
            AddOnProductIds: AddOnProductIds,
          }
        : {
            productType: "bundle",
            productSfId: values.comboDetailId,
            childProduct: {
              productType: "workshop",
              productSfId: productId,
              AddOnProductIds: AddOnProductIds,
              complianceQuestionnaire,
            },
          };

      let payLoad = {
        shoppingRequest: {
          tokenizeCC,
          couponCode: "",
          contactAddress: {
            contactPhone: "",
            contactAddress,
            contactCity,
            contactState,
            contactZip,
          },
          billingAddress: {
            billingPhone: "",
            billingAddress: contactAddress,
            billingCity: contactCity,
            billingState: contactState,
            billingZip: contactZip,
          },
          products,
          complianceQuestionnaire,
          isInstalmentOpted: false,
        },
        utm: filterAllowedParams(router.query),
      };

      if (isChangingCard) {
        payLoad = {
          ...payLoad,
          shoppingRequest: {
            ...payLoad.shoppingRequest,
            doNotStoreCC: true,
          },
        };
      }

      if (isGenericWorkshop) {
        const timeSlot =
          availableTimings &&
          Object.values(availableTimings)[0] &&
          Object.values(Object.values(availableTimings)[0])[0][0]
            .genericWorkshopSlotSfid;
        payLoad = {
          ...payLoad,
          shoppingRequest: {
            ...payLoad.shoppingRequest,
            genericWorkshopSlotSfid: timeSlot,
          },
        };
      }

      const {
        data,
        status,
        error: errorMessage,
        isError,
      } = await api.post({
        path: "createAndPayOrder",
        body: payLoad,
      });

      setLoading(false);

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      } else if (data) {
        enrollmentCompletionAction(data);
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

  return (
    <div
      id="widget-modal"
      className="overlaying-popup overlaying-popup_active"
      role="dialog"
    >
      <div
        className="overlaying-popup__overlay"
        role="button"
        tabindex="0"
      ></div>

      <div className="scheduling-modal">
        <div
          role="button"
          aria-label="Close modal"
          className="scheduling-modal__btn-close"
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
            questionnaire: questionnaire,
          }}
          validationSchema={Yup.object().shape({
            firstName: Yup.string().required("First Name is required"),
            lastName: Yup.string().required("Last Name is required"),
            contactAddress: Yup.string().required("Address is required"),
            contactCity: Yup.string(),
            contactState: Yup.string(),
            contactZip: Yup.string()
              //.matches(/^[0-9]+$/, { message: 'Zip is invalid' })
              .min(2, "Zip is invalid")
              .max(10, "Zip is invalid"),
          })}
          onSubmit={async (values, { setSubmitting, isValid, errors }) => {
            // await completeEnrollmentAction(values);
            console.log("values", values);
          }}
        >
          {(formikProps) => {
            const { values, handleSubmit } = formikProps;
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
                          <h1 className="scheduling__title scheduling__title--large mb-2">
                            Get Started
                          </h1>
                          <p className="mb-2">
                            <span className="scheduling__auth-title">
                              Already have an account?
                            </span>
                            <button
                              className="scheduling__btn-aslink scheduling__login"
                              type="button"
                            >
                              Login in here
                            </button>
                          </p>

                          <form className="scheduling__auth">
                            <div className="scheduling__wrapper">
                              <input
                                className="scheduling__input mb-2"
                                placeholder="Name"
                                type="text"
                              />
                              <input
                                className="scheduling__input mb-2"
                                placeholder="Last name"
                                type="text"
                              />
                            </div>

                            <input
                              className="scheduling__input mb-2"
                              placeholder="Email Address"
                              type="text"
                            />
                            <input
                              className="scheduling__input mb-2"
                              placeholder="Password"
                              type="password"
                            />

                            <p
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
                            </p>
                          </form>
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
                              checked
                              id="payment-card"
                            />
                            <label
                              className="d-flex justify-content-between"
                              for="payment-card"
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

                          <form className="scheduling__form-card">
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
                                  cardLast4Digit={cardLast4Digit}
                                  toggleCardChangeDetail={
                                    toggleCardChangeDetail
                                  }
                                  isChangingCard={isChangingCard}
                                  formikValues={values}
                                  setTokenizeCCFromPayment={
                                    setTokenizeCCFromPayment
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
                                      for="get-tickets-country"
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
                                    for="city"
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
                                    for="state"
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
                                    for="zip"
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
                          </form>

                          <div className="reciept">
                            <div className="mt-3 scheduling__wrap-checkbox">
                              <AgreementForm
                                formikProps={formikProps}
                                complianceQuestionnaire={
                                  complianceQuestionnaire
                                }
                                isCorporateEvent={false}
                                screen="DESKTOP"
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
                                src="/img/skybreath-meditation.jpg"
                                alt="skybreath meditation photo"
                              />

                              <div>
                                <h2 className="scheduling__title">
                                  Skybreath Meditation
                                </h2>
                                <p className="scheduling__text">
                                  6 Hour Meditation Course
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
                                  <strong>$295</strong> <i>plus tax</i>
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
                          >
                            buy now
                          </button>

                          <p className="scheduling__text scheduling__text--small  mt-3">
                            By completing this purchase. I agree to YogaRenew`s
                            <a className="scheduling__link" href="#">
                              Terms of Use
                            </a>
                            &
                            <a className="scheduling__link" href="#">
                              Privacy policy
                            </a>
                            .
                            <span className="d-block">
                              and the
                              <a className="scheduling__link" href="#">
                                Terms of Use
                              </a>
                              &
                              <a className="scheduling__link" href="#">
                                Privacy policy
                              </a>
                              of the course platform.
                            </span>
                          </p>
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

SchedulingWidgetPayment.hideHeader = true;

export default SchedulingWidgetPayment;
