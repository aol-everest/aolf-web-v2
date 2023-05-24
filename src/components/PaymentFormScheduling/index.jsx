/* eslint-disable react/display-name */
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from "@contexts";

import { filterAllowedParams } from "@utils/utmParam";
import { api, Auth } from "@utils";
import { useRouter } from "next/router";
import { ALERT_TYPES } from "@constants";

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
    formikValues,
    enrollmentCompletionAction,
    workshop,
    setLoading,
    loading,
  } = props;
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();
  const { hideModal } = useGlobalModalContext();

  useImperativeHandle(ref, () => ({
    async completeEnrollmentAction(values) {
      if (loading) {
        return null;
      }

      const {
        id: productId,
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
          name: user?.profile.name
            ? user?.profile.name
            : firstName + " " + lastName,
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
          user: {
            firstName,
            lastName,
            email,
          },
        };

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
          showAlert(ALERT_TYPES.ERROR_ALERT, {
            children: errorMessage,
          });
        } else if (data) {
          hideModal();
          enrollmentCompletionAction(data);
        }
      } catch (ex) {
        console.error(ex);
        if (ex?.response) {
          const data = ex.response?.data;
          const { message, statusCode } = data || {};
          setLoading(false);
          showAlert(ALERT_TYPES.ERROR_ALERT, {
            children: message
              ? `Error: ${message} (${statusCode})`
              : ex.message,
          });
        }
      }
    },
  }));

  return <CardElement options={createOptions} />;
});

export default PaymentFormScheduling;
