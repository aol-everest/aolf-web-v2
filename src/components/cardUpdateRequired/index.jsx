/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES, MEMBERSHIP_TYPES } from "@constants";
import { useQuery } from "react-query";
import { api } from "@utils";

export const CardUpdateRequiredModal = (allSubscriptions) => {
  return (
    <center>
      Your free membership period will be ending soon. Please update credit card
      details in your profile and continue with the Digital Membership at $
      {allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value] &&
        allSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value]
          .activeSubscriptions[0].price}{" "}
      per month.
    </center>
  );
};

export const CardUpdateRequired = () => {
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();

  const { data: subsciptionCategories = [] } = useQuery(
    "subsciption",
    async () => {
      const response = await api.get({
        path: "subsciption",
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (!router.isReady || subsciptionCategories.length === 0) return;
    const allSubscriptions = subsciptionCategories.reduce(
      (accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.sfid]: currentValue,
        };
      },
      {},
    );
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      children: <CardUpdateRequiredModal allSubscriptions={allSubscriptions} />,
      title: "Action required",
    });
  }, [router.isReady, subsciptionCategories]);

  return null;
};
