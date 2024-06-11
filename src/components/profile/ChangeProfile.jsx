import {
  Dropdown,
  PhoneInputNewCheckout,
  StyledInput,
  StyledInputNewCheckout,
} from '@components/checkout';
import { ChangeEmail } from '@components/profile';
import {
  MESSAGE_EMAIL_VERIFICATION_SUCCESS,
  MODAL_TYPES,
  US_STATES,
} from '@constants';
import { useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { api, phoneRegExp } from '@utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Field, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import * as Yup from 'yup';
import PhoneInput from './../phoneInputCmp';
import Style from './ChangeProfile.module.scss';
import { DropdownNewCheckout } from '@components/checkout/DropdownNewCheckout';

export const ChangeProfile = ({
  isMobile,
  profile = {},
  updateCompleteAction,
}) => {
  const [loading, setLoading] = useState(false);
  const { showModal, hideModal } = useGlobalModalContext();
  const router = useRouter();
  const description = useRef('');

  const allowEmailEdit = profile.cognito.UserStatus !== 'EXTERNAL_PROVIDER';

  const submitAction = async (values) => {
    const { contactPhone, contactAddress, contactState, contactZip } = values;
    setLoading(true);
    try {
      const { status, error: errorMessage } = await api.post({
        path: 'updateProfile',
        body: {
          contactPhone,
          contactAddress,
          contactState,
          contactZip,
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
        pathname: `/us-en/profile`,
        query: {
          request: 3,
        },
      });
    } else if (caseAlreadyRegistered || ccInfoAlreadyDeleted) {
      router.push({
        pathname: `/us-en/profile`,
        query: {
          request: 5,
        },
      });
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/profile`,
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

  const {
    first_name,
    last_name,
    personMailingCity,
    personMailingCountry,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
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

  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <Formik
        enableReinitialize
        initialValues={{
          firstName: first_name || '',
          lastName: last_name || '',
          contactPhone: personMobilePhone || '',
          contactAddress: personMailingStreet || '',
          contactState: personMailingState || '',
          contactZip: personMailingPostalCode || '',
          email: email,
        }}
        validationSchema={Yup.object().shape({
          contactPhone: Yup.string()
            .required('Phone number required')
            .matches(phoneRegExp, 'Phone number is not valid'),
          contactAddress: Yup.string().required('Address is required'),
          contactState: Yup.string().required('State is required'),
          contactZip: Yup.string()
            .required('Zip is required!')
            .matches(/^[0-9]+$/, { message: 'Zip is invalid' })
            .min(2, 'Zip is invalid')
            .max(10, 'Zip is invalid'),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          await submitAction(values);
        }}
      >
        {(props) => {
          const {
            values,
            touched,
            errors,
            dirty,
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
            handleReset,
            submitCount,
          } = props;
          return (
            <form className="profile-form-box" onSubmit={handleSubmit}>
              <div className="profile-form-wrap">
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
                  className={'form-item col-1-1'}
                  placeholder="Address"
                  formikProps={props}
                  formikKey="contactAddress"
                  fullWidth
                ></StyledInputNewCheckout>
                <DropdownNewCheckout
                  placeholder=""
                  formikProps={props}
                  formikKey="contactState"
                  options={US_STATES}
                  containerClass="form-item form-item col-1-2"
                ></DropdownNewCheckout>
                <StyledInputNewCheckout
                  className={'form-item col-1-2'}
                  placeholder="Zip"
                  formikProps={props}
                  formikKey="contactZip"
                ></StyledInputNewCheckout>

                <StyledInputNewCheckout
                  type="email"
                  isReadOnly={!allowEmailEdit}
                  className="form-item col-1-2"
                  placeholder="Email"
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
                ></StyledInputNewCheckout>

                <PhoneInputNewCheckout
                  className="second form-item col-1-2"
                  containerClass={`scheduling-modal__content-wrapper-form-list-row`}
                  formikProps={props}
                  formikKey="contactPhone"
                  name="contactPhone"
                  type="tel"
                  showLabel={false}
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
                <button className="secondary-btn">Discard Changes</button>
                <button type="submit" className="primary-btn">
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
