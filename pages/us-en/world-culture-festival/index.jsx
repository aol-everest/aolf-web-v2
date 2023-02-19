/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import {
  StepWelcome,
  StepAuth,
  StepContactDetail,
} from "@components/worldCultureFestival";
import { FormikWizard } from "@components";
import { useLocalStorage } from "react-use";
import * as Yup from "yup";
import { useQueryString } from "@hooks";

const DATA_STORAGE_KEY = "wcf-data-store-2";
const INITIAL_VALUES = {
  ticketCount: 0,
  sessionsAttending: [],
  country: null,
  state: null,
  phoneNumber: null,
  agreement: true,
};

const useIsSsr = () => {
  // we always start off in "SSR mode", to ensure our initial browser render
  // matches the SSR render
  const [isSsr, setIsSsr] = useState(true);

  useEffect(() => {
    // `useEffect` never runs on the server, so we must be on the client if
    // we hit this block
    setIsSsr(false);
  }, []);

  return isSsr;
};

function WorldCultureFestival() {
  const isSsr = useIsSsr();
  const [localState, setLocalState] = useLocalStorage(
    DATA_STORAGE_KEY,
    INITIAL_VALUES,
  );
  const [activeStep] = useQueryString("s", {
    defaultValue: 0,
  });
  console.log(activeStep);
  console.log(localState);
  const handleSubmit = useCallback((values) => {
    console.log("Submitting form!!!!");
  }, []);

  if (isSsr) {
    return null;
  }
  const onStepChange = (values, formikBag, currentStepIndex) => {
    setLocalState(values);
    // setActiveState(currentStepIndex + 1);
    return Promise.resolve();
  };
  return (
    <main>
      <Head>
        <title>World culture festival</title>
      </Head>
      <div id="wcfSelect" className="wcf-select__dropdown"></div>
      <FormikWizard
        initialValues={localState}
        onSubmit={(values) => console.log(values)}
        validateOnNext
        activeStepIndex={activeStep}
        steps={[
          {
            component: StepWelcome,
            validationSchema: Yup.object().shape({
              ticketCount: Yup.number()
                .label("No of Tickets")
                .integer()
                .min(1)
                .max(4)
                .required(),
              sessionsAttending: Yup.array()
                .label("Sessions Attending")
                .min(1, "Sessions Attending is required"),
            }),
            beforeNext: onStepChange,
            beforePrev: onStepChange,
          },
          {
            component: StepAuth,
            beforeNext: onStepChange,
            beforePrev: onStepChange,
          },
          {
            component: StepContactDetail,
            validationSchema: Yup.object().shape({
              country: Yup.string()
                .label("Country")
                .required("Country is required"),
              state: Yup.string().label("State").required("State is required"),
            }),
            beforeNext: onStepChange,
            beforePrev: onStepChange,
          },
        ]}
      >
        {({ renderComponent }) => <>{renderComponent()}</>}
      </FormikWizard>
      {/* <StepWelcome></StepWelcome> */}
      {/* <StepAuth></StepAuth> */}
      {/* <StepContactDetail></StepContactDetail> */}
    </main>
  );
}
WorldCultureFestival.hideHeader = true;
WorldCultureFestival.hideFooter = true;
WorldCultureFestival.wcfHeader = true;

export default WorldCultureFestival;
