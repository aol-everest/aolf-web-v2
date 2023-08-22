import {
  AgreementForm,
  DiscountCodeInput,
  StyledInput,
} from "@components/checkout";
import { PageLoading } from "@components";
import { US_STATES, ALERT_TYPES } from "@constants";
import { useQueryString } from "@hooks";
import queryString from "query-string";
import { useGlobalAlertContext, useGlobalModalContext } from "@contexts";
import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { api, priceCalculation } from "@utils";
import { Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import ErrorPage from "next/error";
import { useQuery } from "react-query";
import { filterAllowedParams, removeNull } from "@utils/utmParam";
import { iframeRouteWithUTMQuery, replaceRouteWithUTMQuery } from "@service";

const SchedulingPayment = () => {
  const router = useRouter();
  const { hideModal } = useGlobalModalContext();
  const [mbsy_source] = useQueryString("mbsy_source");
  const [campaignid] = useQueryString("campaignid");
  const [mbsy] = useQueryString("mbsy");
  const [discount] = useQueryString("discountCode");
  const [discountResponse, setDiscountResponse] = useState(null);
  const { id: workshopId } = router.query;

  const {
    data: workshop,
    isLoading,
    isError,
    error,
  } = useQuery(
    "workshopDetail",
    async () => {
      const response = await api.get({
        path: "workshopDetail",
        param: {
          id: workshopId,
          rp: "checkout",
        },
        isUnauthorized: true,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const { fee, delfee } = priceCalculation({
    workshop,
    discount: discountResponse,
  });

  const {
    complianceQuestionnaire,
    title,
    id: productId,
    addOnProducts,
  } = workshop || {};

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const enrollmentCompletionAction = ({ attendeeId }) => {
    if (window.self !== window.top) {
      iframeRouteWithUTMQuery(router, {
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
    } else {
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
    }
  };

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

  const elementsOptions = {
    mode: "payment",
    amount: 1099,
    currency: "usd",
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0570de",
        colorBackground: "#ffffff",
        colorText: "#30313d",
        colorDanger: "#df1b41",
        fontFamily: '"Work Sans",Ideal Sans, system-ui, sans-serif',
        spacingUnit: "2px",
        borderRadius: "4px",
      },
      rules: {
        ".Block": {
          backgroundColor: "var(--colorBackground)",
          boxShadow: "none",
          padding: "12px",
        },
        ".Input": {
          padding: "12px",
        },
        ".Input:disabled, .Input--invalid:disabled": {
          color: "lightgray",
        },
        ".Tab": {
          padding: "10px 12px 8px 12px",
          border: "none",
        },
        ".Tab:hover": {
          border: "none",
          boxShadow:
            "0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)",
        },
        ".Tab--selected, .Tab--selected:focus, .Tab--selected:hover": {
          border: "1px solid #89beec",
          backgroundColor: "#fff",
          boxShadow: "0 2px 25px 0 rgba(61,139,232,.2)",
        },
        ".Label": {
          fontWeight: "500",
        },
      },
    },
  };

  return (
    <>
      {workshop && (
        <div
          id="widget-modal"
          className="overlaying-popup_active"
          role="dialog"
        >
          <div className="scheduling-modal">
            <div
              role="button"
              aria-label="Close modal"
              className="scheduling-modal__btn-close"
              onClick={hideModal}
            >
              <img src="/img/ic-close-talk.svg" alt="close icon" />
            </div>

            <Elements stripe={stripePromise} options={elementsOptions}>
              <SchedulingPaymentForm
                workshop={workshop}
                applyDiscount={applyDiscount}
                discount={discount}
                discountResponse={discountResponse}
                fee={fee}
                delfee={delfee}
                router={router}
              />
            </Elements>
          </div>
        </div>
      )}
    </>
  );
};

const SchedulingPaymentForm = ({
  workshop,
  applyDiscount,
  discount,
  discountResponse,
  fee,
  delfee,
  router,
}) => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [mbsy_source] = useQueryString("mbsy_source", {
    defaultValue: null,
  });
  const [campaignid] = useQueryString("campaignid", {
    defaultValue: null,
  });
  const [mbsy] = useQueryString("mbsy", {
    defaultValue: null,
  });

  const { showAlert } = useGlobalAlertContext();

  const {
    complianceQuestionnaire,
    title,
    id: productId,
    addOnProducts,
  } = workshop;
  console.log(workshop);

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const completeEnrollmentAction = async (values) => {
    if (loading) {
      return null;
    }

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }

    const { id: productId, addOnProducts } = workshop;

    const {
      questionnaire,
      contactAddress,
      contactCity,
      contactState,
      contactZip,
      firstName,
      lastName,
      email,
      couponCode,
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
          couponCode: couponCode || "",
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
          isStripeIntentPayment: true,
        },
        utm: filterAllowedParams(router.query),
      };

      if (workshop.isCCNotRequired) {
        payLoad.shoppingRequest.isStripeIntentPayment = false;
      }

      payLoad = {
        ...payLoad,
        user: {
          lastName: lastName,
          firstName: firstName,
          email: email,
        },
      };

      //token.saveCardForFuture = true;
      const {
        stripeIntentObj,
        status,
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: "createAndPayOrder",
        body: payLoad,
        isUnauthorized: true,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      if (data && data.totalOrderAmount > 0) {
        let filteredParams = {
          ctype: workshop.productTypeId,
          page: "ty",
          type: `local${mbsy_source ? "&mbsy_source=" + mbsy_source : ""}`,
          campaignid,
          mbsy,
          ...filterAllowedParams(router.query),
        };
        filteredParams = removeNull(filteredParams);
        const returnUrl = `${window.location.origin}/us-en/course/thankyou/${
          data.attendeeId
        }?${queryString.stringify(filteredParams)}`;
        const result = await stripe.confirmPayment({
          //`Elements` instance that was used to create the Payment Element
          elements,
          clientSecret: stripeIntentObj.client_secret,
          confirmParams: {
            return_url: returnUrl,
          },
        });
        console.log(result);

        if (result.error) {
          // Show error to your customer (for example, payment details incomplete)
          throw new Error(result.error.message);
        }
      }

      setLoading(false);
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

  const formikOnChange = (values) => {
    if (!stripe || !elements) {
      return;
    }
    let finalPrice = fee;
    if (values.comboDetailId && values.comboDetailId !== workshop.id) {
      const selectedBundle = workshop.availableBundles.find(
        (b) => b.comboProductSfid === values.comboDetailId,
      );
      if (selectedBundle) {
        finalPrice = selectedBundle.comboUnitPrice;
      }
    }
    console.log(finalPrice);
    if (finalPrice > 0) {
      elements.update({
        amount: finalPrice * 100,
      });
    }
    const paymentElement = elements.getElement(PaymentElement);
    if (paymentElement) {
      paymentElement.update({
        defaultValues: {
          billingDetails: {
            email: values.email,
            name: (values.firstName || "") + (values.lastName || ""),
            phone: values.contactPhone,
          },
        },
      });
    }
  };

  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          contactAddress: "",
          contactCity: "",
          contactState: "AL",
          contactZip: "",
          contactCountry: "USA",
          questionnaire: questionnaireArray,
          ppaAgreement: false,
          couponCode: discount ? discount : "",
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().required("First Name is required"),
          lastName: Yup.string().required("Last Name is required"),
          email: Yup.string()
            .email("Email is invalid!")
            .required("Email is required!"),
          contactCountry: Yup.string().required("Country is required"),
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
          await completeEnrollmentAction(values);
        }}
      >
        {(formikProps) => {
          const { values, handleSubmit } = formikProps;
          formikOnChange(values);
          return (
            <div id="scheduling-step-1" className="scheduling-modal__body">
              <div>
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
                          <div className="scheduling__card">
                            <PaymentElement />
                            <div class="scheduling-discount">
                              <label
                                class="scheduling__label"
                                for="discount-code"
                              ></label>
                              <DiscountCodeInput
                                placeholder="Discount Code"
                                formikProps={formikProps}
                                formikKey="couponCode"
                                product={productId}
                                applyDiscount={applyDiscount}
                                addOnProducts={addOnProducts}
                                containerClass="scheduling__input"
                              ></DiscountCodeInput>
                            </div>
                          </div>

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
                                    value={formikProps.values["contactCountry"]}
                                    onChange={(ev) => {
                                      formikProps.setFieldValue(
                                        "contactCountry",
                                        ev.target.value,
                                      );
                                    }}
                                  >
                                    <option value="USA">USA</option>
                                    <option value="Argentina">Argentina</option>
                                    <option value="Armenia">Armenia</option>
                                    <option value="Australia">Australia</option>
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
                                    <option value="Indonesia">Indonesia</option>
                                    <option value="Ireland">Ireland</option>
                                    <option value="Israel">Israel</option>
                                    <option value="Italy">Italy</option>
                                    <option value="Japan">Japan</option>
                                    <option value="Latvia">Latvia</option>
                                    <option value="Lithuania">Lithuania</option>
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
                                    <option value="Venezuela">Venezuela</option>
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

                              <li>
                                <div className="scheduling__wcf-select wcf-select wcf-form__field mb-2">
                                  <label
                                    htmlFor="get-tickets-country"
                                    className="wcf-select__label"
                                  >
                                    State
                                  </label>

                                  <select
                                    id="get-tickets-country"
                                    name="get-tickets-country"
                                    data-placeholder="Select your state"
                                    className="wcf-select__field"
                                    value={formikProps.values["contactState"]}
                                    placeholder="State"
                                    onChange={(ev) => {
                                      formikProps.setFieldValue(
                                        "contactState",
                                        ev.target.value,
                                      );
                                    }}
                                  >
                                    {US_STATES.map((item, key) => {
                                      return (
                                        <option key={key} value={item.value}>
                                          {item.label}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
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
                              <div className="col-6">
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

                              <div className="col-6">
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
                              complianceQuestionnaire={complianceQuestionnaire}
                              isCorporateEvent={false}
                              questionnaireArray={questionnaireArray}
                              screen="DESKTOP"
                            />
                            <AgreementForm
                              formikProps={formikProps}
                              complianceQuestionnaire={complianceQuestionnaire}
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
                                Billed Today (USD)
                              </h4>
                            </div>
                            <div className="col-4 text-right">
                              <p className="scheduling__text-black">
                                {discountResponse && delfee && (
                                  <span className="discount">${delfee}</span>
                                )}{" "}
                                <strong>${fee || 0}</strong> <i>plus tax</i>
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
    </>
  );
};

SchedulingPayment.hideHeader = true;
SchedulingPayment.hideFooter = true;

export default SchedulingPayment;
