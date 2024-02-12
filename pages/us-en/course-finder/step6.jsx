/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import * as Yup from 'yup';

const Step6 = () => {
  const router = useRouter();

  const NavigateToStep7 = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/questionnaire/step7`,
    });
  };

  return (
    <main className="course-finder-questionnaire-question">
      <section className="questionnaire-question">
        <div className="container">
          <div className="back-btn-wrap">
            <button className="back-btn" onClick={() => router.back()}>
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
              email: '',
              contactPhone: '',
              guidance: false,
            }}
            validationSchema={Yup.object().shape({
              firstName: Yup.string().required('First Name is required!'),
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
  );
};

export default Step6;
