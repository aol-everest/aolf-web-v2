/* eslint-disable react/no-unescaped-entities */
import { ALERT_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { api } from '@utils';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';

const Step6 = () => {
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useSessionStorage('center-finder', {});
  const { totalSelectedOptions = [], questions = [] } = value;

  useEffect(() => {
    if (questions.length === 0) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder`,
      });
    }
  }, []);

  const NavigateToStep7 = async (values) => {
    setLoading(true);

    const payload = {
      user: {
        firstName: values?.firstName,
        lastName: values?.lastName,
        email: values?.email,
        contactMeFurther: values?.guidance,
        contactPhone: values?.contactPhone,
      },
      answers: [...totalSelectedOptions],
    };
    try {
      const {
        status,
        error: errorMessage,
        isError,
        data,
      } = await api.post({
        path: 'getRecommendationsBasedOnQuestions',
        body: payload,
      });
      setLoading(false);
      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }
      if (data || status === 200) {
        await setValue({
          ...value,
          recommendationResponse: data,
        });
        pushRouteWithUTMQuery(router, {
          pathname: `/us-en/course-finder/result`,
        });
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
    <>
      {loading && <div className="cover-spin"></div>}

      <main className="course-finder-questionnaire-question">
        <section className="questionnaire-question">
          <div className="container">
            <div className="back-btn-wrap">
              <button className="back-btn" onClick={router.back}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.57 5.93018L3.5 12.0002L9.57 18.0702"
                    stroke="#31364E"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M20.4999 12H3.66992"
                    stroke="#31364E"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Back
              </button>
            </div>
            <Formik
              enableReinitialize
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                contactPhone: '',
                guidance: false,
              }}
              validationSchema={Yup.object().shape({
                firstName: Yup.string().required('First Name is required!'),
                lastName: Yup.string().required('Last Name is required!'),
                email: Yup.string()
                  .email('Email is invalid!')
                  .required('Email is required!'),
                contactPhone: Yup.string(),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                await NavigateToStep7(values);
              }}
            >
              {(props) => {
                const {
                  values,
                  touched,
                  errors,
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                } = props;

                return (
                  <form
                    name="workshopEnroll"
                    onSubmit={handleSubmit}
                    className="workshopEnroll"
                  >
                    <div className="question-box">
                      <h1 className="question-title mt-0">
                        Where can we send your personalized recommendation?
                      </h1>
                      <div className="recommendation-form">
                        <div className="form-item">
                          <label htmlFor="firstName">First name</label>
                          <input
                            type="text"
                            className={
                              errors.firstName && touched.firstName
                                ? 'form-control error'
                                : 'form-control'
                            }
                            id="firstName"
                            placeholder=" "
                            value={values.firstName}
                            name="firstName"
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div className="form-item">
                          <label htmlFor="lastName">Last name</label>
                          <input
                            type="text"
                            className={
                              errors.lastName && touched.lastName
                                ? 'form-control error'
                                : 'form-control'
                            }
                            id="lastName"
                            placeholder=" "
                            value={values.lastName}
                            name="lastName"
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div className="form-item">
                          <label htmlFor="email">Email address</label>
                          <input
                            type="email"
                            className={
                              errors.email && touched.email
                                ? 'form-control error'
                                : 'form-control'
                            }
                            id="email"
                            placeholder=" "
                            value={values.email}
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div className="form-item">
                          <label htmlFor="contactPhone">
                            Mobile number (optional)
                          </label>
                          <input
                            type="tel"
                            className={
                              errors.contactPhone && touched.contactPhone
                                ? 'form-control error'
                                : 'form-control'
                            }
                            id="contactPhone"
                            placeholder=" "
                            value={values.contactPhone}
                            name="contactPhone"
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div className="form-item checkbox">
                          <input
                            type="checkbox"
                            id="guidance"
                            name="guidance"
                            onChange={(ev) => {
                              setFieldValue('guidance', ev.target.checked);
                            }}
                            onBlur={handleBlur}
                          />
                          <label htmlFor="guidance">
                            I'd like a well-being expert to reach out to me for
                            further guidance.
                          </label>
                        </div>
                      </div>

                      <div className="question-action">
                        <button type="submit" className="btn-register">
                          Continue
                        </button>
                      </div>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        </section>
      </main>
    </>
  );
};

export default Step6;
