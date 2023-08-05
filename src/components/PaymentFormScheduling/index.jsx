/* eslint-disable react/display-name */
import { useGlobalAlertContext, useGlobalModalContext } from "@contexts";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { forwardRef, useImperativeHandle } from "react";

import { ALERT_TYPES } from "@constants";
import { filterAllowedParams } from "@utils/utmParam";
import Axios from "axios";
import { useRouter } from "next/router";
import queryString from "query-string";

const createOptions = {
  style: {
    base: {
      fontSize: "16px",
      lineHeight: 2,
      fontWeight: 200,
      fontStyle: "normal",
      color: "#303650",
      fontFamily: "Work Sans, sans-serif",
      "::placeholder": {
        color: "#9598a6",
        fontFamily: "Work Sans, sans-serif",
        fontSize: "16px",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const PaymentFormScheduling = forwardRef((props, ref) => {
  const {
    enrollmentCompletionAction,
    workshop,
    setLoading,
    loading,
    discount: couponCode = "",
  } = props;
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();
  const { hideModal } = useGlobalModalContext();

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : "http://localhost:3000";

  const axiosClient = Axios.create({
    baseURL: SERVER_URL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  useImperativeHandle(ref, () => ({
    async completeEnrollmentAction(values) {
      if (loading) {
        return null;
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
        let tokenizeCC = null;
        const cardElement = elements?.getElement(CardElement);
        let createTokenRespone = await stripe.createToken(cardElement, {
          name: firstName + " " + lastName,
        });
        let { error, token } = createTokenRespone;
        if (error) {
          throw error;
        }
        tokenizeCC = token;

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
            doNotStoreCC: true,
            tokenizeCC,
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
          },
          utm: filterAllowedParams(router.query),
          user: {
            firstName,
            lastName,
            email,
          },
        };

        const qs = queryString.stringify({
          org: process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
        });

        try {
          const result = await axiosClient.post(
            SERVER_URL + "createAndPayOrder?" + qs,
            payLoad,
          );
          const { data, isError, status, error } = result?.data || {};
          if (isError && status === 400) {
            showAlert(ALERT_TYPES.ERROR_ALERT, {
              children: error,
            });
          } else if (data) {
            hideModal();
            enrollmentCompletionAction(data);
          }
        } catch (orderError) {
          const { isError, error = "" } = orderError?.response?.data || {};
          if (isError) {
            showAlert(ALERT_TYPES.ERROR_ALERT, {
              children: error,
            });
          }
        }
        setLoading(false);
      } catch (ex) {
        console.error("ex--->", ex);
        if (ex?.response) {
          const data = ex.response?.data;
          const { message, statusCode } = data || {};
          setLoading(false);
          showAlert(ALERT_TYPES.ERROR_ALERT, {
            children: message
              ? `Error: ${message} (${statusCode})`
              : ex.message,
          });
        } else if (ex?.message) {
          setLoading(false);
          showAlert(ALERT_TYPES.ERROR_ALERT, {
            children: ex.message,
          });
        }
      }
    },
  }));

  return <CardElement options={createOptions} />;
});

export default PaymentFormScheduling;
