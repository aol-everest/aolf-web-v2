import {
  PhoneInputNewCheckout,
  StyledInputNewCheckout,
} from '@components/checkout';
import {
  MESSAGE_EMAIL_VERIFICATION_SUCCESS,
  MODAL_TYPES,
  US_STATES,
} from '@constants';
import { useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { api, phoneRegExp } from '@utils';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import * as Yup from 'yup';
import { DropdownNewCheckout } from '@components/checkout/DropdownNewCheckout';
import { Loader } from '@components';
import { ChangeEmail } from '@components/profile';

export const ChangeProfile = ({ profile = {}, updateCompleteAction }) => {
  const [loading, setLoading] = useState(false);
  const { showModal, hideModal } = useGlobalModalContext();
  const router = useRouter();
  const description = useRef('');

  const submitAction = async (values) => {
    const {
      contactPhone,
      contactAddress,
      contactState,
      contactZip,
      contactCity,
    } = values;
    setLoading(true);
    try {
      const { status, error: errorMessage } = await api.post({
        path: 'updateProfile',
        body: {
          contactPhone,
          contactAddress,
          contactState,
          contactZip,
          contactCity,
        },
      });

      if (status === 400) {
        throw new Error(errorMessage);
      }
      updateCompleteAction({});
    } catch (ex) {
      console.log(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      updateCompleteAction({
        message: message ? `Error: ${message} (${statusCode})` : ex.message,
        isError: true,
      });
    }
    setLoading(false);
  };

  const validateStudentEmail = (email) => {
    if (!email) {
      return false;
    }
    const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
    const isStudentEmail = regex.test(email) && email.indexOf('alumni') < 0;
    return isStudentEmail;
  };

  const handleVerifyStudentEmail = async () => {
    setLoading(true);
    try {
      await api.post({
        path: 'verify-email',
        body: {
          email: email,
        },
      });
    } catch (ex) {
      console.log(ex);
    }
    setLoading(false);
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      title: 'Verification code sent.',
      children: (handleModalToggle) => (
        <div className="alert__modal modal-window modal-window_no-log modal fixed-right fade active show">
          <div className=" modal-dialog modal-dialog-centered active">
            <div className="modal-content">
              <h2 className="modal-content-title !tw-text-2xl">
                {MESSAGE_EMAIL_VERIFICATION_SUCCESS}
              </h2>

              <p className="tw-flex tw-justify-center">
                <a
                  href="#"
                  className="btn btn-lg btn-primary tw-mt-6"
                  onClick={handleModalToggle}
                >
                  Close
                </a>
              </p>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleRequestResult = (
    requestCreated,
    caseAlreadyRegistered = false,
    ccInfoAlreadyDeleted = false,
  ) => {
    if (requestCreated) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/profile/update-profile`,
        query: {
          request: 3,
        },
      });
    } else if (caseAlreadyRegistered || ccInfoAlreadyDeleted) {
      router.push({
        pathname: `/us-en/profile/update-profile`,
        query: {
          request: 5,
        },
      });
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/profile/update-profile`,
        query: {
          request: 4,
        },
      });
    }
  };

  const handleDeletePersonalInformation = async () => {
    setLoading(true);
    try {
      const payload = {
        message: description.current,
        origin: 'Web',
      };

      const { status, error: errorMessage } = await api.post({
        path: 'accountDeletionRequest',
        body: payload,
      });

      if (status === 400 || errorMessage) {
        throw new Error(errorMessage);
      }
      handleRequestResult(true);
    } catch (ex) {
      console.log(ex);
      handleRequestResult(false, true);
    }
    setLoading(false);
    description.current = '';
    hideModal();
  };

  const handleDeletePaymentDetails = async () => {
    setLoading(true);
    try {
      const payload = {
        message: description.current,
        origin: 'Web',
      };

      const { status, error: errorMessage } = await api.post({
        path: 'ccDeletionRequest',
        body: payload,
      });

      if (status === 400 || errorMessage) {
        throw new Error(errorMessage);
      }
      handleRequestResult(true);
    } catch (ex) {
      console.log(ex);
      handleRequestResult(false, false, true);
    }
    setLoading(false);
    description.current = '';
    hideModal();
  };

  const handleDescription = (event) => {
    description.current = event.target.value;
  };

  const handleRemoveInformation = () => {
    description.current = '';
    showModal(MODAL_TYPES.CUSTOM_MODAL, {
      title: 'Delete PII or Remove CC information',
      className: 'course-join-card',
      children: (
        <>
          <div className="course-details-card__list">
            <textarea
              type="text"
              className="form-control tw-min-h-[100px]"
              id="description"
              placeholder="Description"
              onChange={handleDescription}
            />
          </div>
        </>
      ),
      footer: (handleModalToggle) => {
        return (
          <div className="course-details-card__footer">
            <button
              className="btn-secondary link-modal tw-mr-4 !tw-px-7"
              onClick={handleDeletePersonalInformation}
            >
              Delete Personal info
            </button>

            <button
              className="btn-secondary link-modal !tw-px-7"
              onClick={handleDeletePaymentDetails}
            >
              Delete Credit Card info
            </button>
          </div>
        );
      },
    });
  };

  const allowEmailEdit = profile.cognito.UserStatus !== 'EXTERNAL_PROVIDER';

  const editEmailAction = (e) => {
    if (e) e.preventDefault();
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      children: (handleModalToggle) => {
        return (
          <ChangeEmail
            closeDetailAction={handleModalToggle}
            existingEmail={profile.email}
          />
        );
      },
    });
  };

  const {
    first_name,
    last_name,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    personMailingCity,
    email,
    isStudentVerified,
    studentVerificationDate,
    studentVerificationExpiryDate,
  } = profile;

  const isStudentFlowEnabled =
    process.env.NEXT_PUBLIC_ENABLE_STUDENT_FLOW === 'true';

  const showVerifyStudentStatus =
    isStudentFlowEnabled &&
    validateStudentEmail(email) &&
    (!isStudentVerified ||
      (isStudentVerified &&
        dayjs(new Date()).diff(dayjs(studentVerificationDate), 'y', true) > 1 &&
        dayjs(studentVerificationExpiryDate).isAfter(dayjs(new Date()))));

  const initalValue = {
    firstName: first_name || '',
    lastName: last_name || '',
    contactPhone: personMobilePhone || '',
    contactAddress: personMailingStreet || '',
    contactState: personMailingState || '',
    contactCity: personMailingCity || '',
    contactZip: personMailingPostalCode || '',
    email: email,
  };

  return (
    <>
      {loading && <Loader />}
      <Formik
        enableReinitialize
        initialValues={initalValue}
        validationSchema={Yup.object().shape({
          contactPhone: Yup.string()
            .required('Phone number required')
            .matches(phoneRegExp, 'Phone number is not valid'),
          contactAddress: Yup.string().trim().required('Address is required'),
          contactState: Yup.string().required('State is required'),
          contactCity: Yup.string().trim().required('City is required'),
          contactZip: Yup.string()
            .required('Zip is required!')
            .matches(/^[0-9]+$/, { message: 'Zip is invalid' })
            .min(2, 'Zip is invalid')
            .max(10, 'Zip is invalid'),
          email: Yup.string().required('Email is required').email(),
        })}
        onSubmit={async (values, { setValues }) => {
          await submitAction(values);
          setValues(initalValue);
        }}
      >
        {(props) => {
          const { dirty, handleSubmit, isValid, setValues } = props;
          return (
            <form className="profile-form-box" onSubmit={handleSubmit}>
              <div className="profile-form-wrap form-inputs">
                <StyledInputNewCheckout
                  className="form-item col-1-2"
                  placeholder="First Name"
                  formikProps={props}
                  isReadOnly
                  formikKey="firstName"
                  label="First Name"
                ></StyledInputNewCheckout>

                <StyledInputNewCheckout
                  className="form-item col-1-2"
                  placeholder="Last Name"
                  isReadOnly
                  formikProps={props}
                  formikKey="lastName"
                  label="Last Name"
                ></StyledInputNewCheckout>
                <StyledInputNewCheckout
                  className={'form-item col-1-2'}
                  placeholder="Street address"
                  formikProps={props}
                  formikKey="contactAddress"
                  fullWidth
                  label="Street address"
                ></StyledInputNewCheckout>
                <StyledInputNewCheckout
                  className={'form-item col-1-2'}
                  placeholder="City"
                  formikProps={props}
                  formikKey="contactCity"
                  fullWidth
                  label="City"
                ></StyledInputNewCheckout>
                <DropdownNewCheckout
                  placeholder="State"
                  formikProps={props}
                  formikKey="contactState"
                  options={US_STATES}
                  containerClass="state-dropdown col-1-2"
                ></DropdownNewCheckout>
                <StyledInputNewCheckout
                  className={'form-item col-1-2'}
                  placeholder="Zip"
                  formikProps={props}
                  formikKey="contactZip"
                  label="Zip"
                ></StyledInputNewCheckout>

                <StyledInputNewCheckout
                  type="email"
                  isReadOnly={true}
                  className="form-item col-1-2 email-container"
                  placeholder="Email address"
                  formikProps={props}
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
                  onChange={(event) => {
                    event.preventDefault();
                  }}
                  label="Email address"
                  allowEmailEdit={allowEmailEdit}
                  editEmailAction={editEmailAction}
                ></StyledInputNewCheckout>

                <PhoneInputNewCheckout
                  className="second form-item col-1-2"
                  containerClass={`scheduling-modal__content-wrapper-form-list-row`}
                  formikProps={props}
                  formikKey="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="Mobile number"
                  label="Mobile number"
                ></PhoneInputNewCheckout>

                <div className="tw-mt-4 tw-flex tw-flex-1 tw-justify-end">
                  <a
                    href="#"
                    className="link link_gray tw-text-xs"
                    onClick={handleRemoveInformation}
                  >
                    Remove Profile
                  </a>
                </div>
              </div>
              <div className="form-actions col-1-1">
                {showVerifyStudentStatus && (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleVerifyStudentEmail}
                  >
                    Verify Student Status
                  </button>
                )}
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setValues(initalValue)}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={!(isValid && dirty)}
                >
                  Save Changes
                </button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
