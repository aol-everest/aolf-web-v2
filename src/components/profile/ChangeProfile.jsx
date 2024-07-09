import { Dropdown, StyledInput } from '@components/checkout';
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
import { Loader } from '@components';

const PhoneNumberInputField = ({ isMobile, field, form, ...props }) => {
  const onChangeAction = (value, data, event, formattedValue) => {
    form.setFieldValue(field.name, formattedValue);
  };
  return (
    <PhoneInput
      {...field}
      {...props}
      placeholder="Phone Number"
      country="us"
      inputClass={classNames({
        validate: form.errors.contactPhone,
        'w-100': isMobile,
      })}
      countryCodeEditable={true}
      onChange={onChangeAction}
    />
  );
};

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
      {loading && <Loader />}
      <Formik
        enableReinitialize
        initialValues={{
          firstName: first_name || '',
          lastName: last_name || '',
          contactPhone: personMobilePhone || '',
          contactAddress: personMailingStreet || '',
          contactState: personMailingState || '',
          contactZip: personMailingPostalCode || '',
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
            <form className="profile-update__form" onSubmit={handleSubmit}>
              {!isMobile && <h6 className="profile-update__title">Profile:</h6>}
              <div className="profile-update__card order__card">
                <StyledInput
                  containerClass={classNames(Style.address, 'tw-mt-0')}
                  className={classNames(Style.address, 'tw-mt-0 !tw-w-full')}
                  placeholder="Address"
                  formikProps={props}
                  formikKey="contactAddress"
                  fullWidth
                ></StyledInput>
                <Dropdown
                  containerClass={classNames({ 'w-100': isMobile })}
                  placeholder="State"
                  formikProps={props}
                  formikKey="contactState"
                  options={US_STATES}
                ></Dropdown>
                <StyledInput
                  containerClass={classNames({ 'w-100': isMobile })}
                  className="zip"
                  placeholder="Zip"
                  formikProps={props}
                  formikKey="contactZip"
                ></StyledInput>

                <div
                  className={classNames('input-block', {
                    'w-100': isMobile,
                  })}
                >
                  <input
                    type="text"
                    readOnly={true}
                    placeholder="First Name"
                    className={classNames({
                      'w-100': isMobile,
                    })}
                    value={values.firstName}
                    name="firstName"
                  />
                </div>

                <div
                  className={classNames('input-block', {
                    'w-100': isMobile,
                  })}
                >
                  <input
                    type="text"
                    readOnly={true}
                    className={classNames({
                      'w-100': isMobile,
                    })}
                    placeholder="Last Name"
                    value={values.lastName}
                    name="lastName"
                  />
                </div>

                <div
                  className={classNames(
                    'input-block inline-edit-input-container',
                    {
                      'w-100': isMobile,
                    },
                  )}
                >
                  <input
                    readOnly={true}
                    value={email}
                    className={classNames({
                      'w-100': isMobile,
                    })}
                    type="email"
                    placeholder="Email"
                  />
                  {allowEmailEdit && (
                    <a className="icon" href="#" onClick={editEmailAction}>
                      <FaRegEdit />
                    </a>
                  )}
                </div>
                <div
                  className={classNames('input-block', {
                    'w-100': isMobile,
                  })}
                >
                  <Field
                    name="contactPhone"
                    component={PhoneNumberInputField}
                    isMobile={isMobile}
                  />
                  {/* <MaskedInput
                    placeholder="Phone Number"
                    mask={phoneNumberMask}
                    type="tel"
                    name="contactPhone"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contactPhone}
                    className={classNames({
                      validate: errors.contactPhone && touched.contactPhone,
                      "w-100": isMobile,
                    })}
                  /> */}

                  {errors.contactPhone && (
                    <p className="validation-input">{errors.contactPhone}</p>
                  )}
                </div>
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
              <div className="tw-mt-6 tw-flex tw-justify-end">
                {showVerifyStudentStatus && (
                  <button
                    type="button"
                    className="btn-primary ml-auto v2"
                    onClick={handleVerifyStudentEmail}
                  >
                    Verify Student Status
                  </button>
                )}
                <button type="submit" className="btn-primary d-block ml-4 v2">
                  Update Profile
                </button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
