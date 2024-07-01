'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Elements,
  CardElement,
  useStripe,
  PaymentElement,
  useElements,
} from '@stripe/react-stripe-js';
import dynamic from 'next/dynamic';
import { Button, ButtonGroup } from 'reactstrap';
import classNames from 'classnames';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), {
  ssr: false,
});

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const generateFields = (schema) => {
  return Object.keys(schema.properties).map((key) => {
    const field = schema.properties[key];
    let fieldComponent;

    switch (field.type) {
      case 'string':
        fieldComponent = (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{field.title || key}</label>
            <Field
              name={key}
              type={field.format === 'password' ? 'password' : 'text'}
              className="form-control"
            />
            <ErrorMessage
              name={key}
              component="div"
              className="invalid-feedback d-inline-block"
            />
          </div>
        );
        break;
      case 'integer':
        fieldComponent = (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{field.title || key}</label>
            <Field name={key} type="number" className="form-control" />
            <ErrorMessage
              name={key}
              component="div"
              className="invalid-feedback"
            />
          </div>
        );
        break;
      // Add more cases for other types if needed
      default:
        fieldComponent = null;
    }

    return fieldComponent;
  });
};

const generateValidationSchema = (schema) => {
  const validationSchema = {};

  Object.keys(schema.properties).forEach((key) => {
    const field = schema.properties[key];
    let validator;

    switch (field.type) {
      case 'string':
        validator = Yup.string();
        if (field.minLength) validator = validator.min(field.minLength);
        if (field.maxLength) validator = validator.max(field.maxLength);
        if (field.pattern)
          validator = validator.matches(new RegExp(field.pattern));
        break;
      case 'integer':
        validator = Yup.number().integer();
        if (field.minimum) validator = validator.min(field.minimum);
        if (field.maximum) validator = validator.max(field.maximum);
        break;
      // Add more cases for other types if needed
      default:
        validator = Yup.mixed();
    }

    if (schema.required && schema.required.includes(key)) {
      validator = validator.required(`(${key}) is required`);
    }

    validationSchema[key] = validator;
  });

  return Yup.object().shape(validationSchema);
};

function CheckoutForm({ formSchema }) {
  const [rSelected, setRSelected] = useState(1);
  const stripe = useStripe();
  const elements = useElements();

  const paymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: true,
      radios: true,
      spacedAccordionItems: false,
    },
    defaultValues: {
      // billingDetails: {
      //   email: email || '',
      //   name: (first_name || '') + (last_name || ''),
      //   phone: personMobilePhone || '',
      // },
    },
  };

  const initialValues = Object.keys(formSchema.properties).reduce(
    (acc, key) => {
      acc[key] = formSchema.properties[key].default || '';
      return acc;
    },
    {},
  );

  const validationSchema = generateValidationSchema(formSchema);

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Form data:', values);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
    } else {
      console.log(paymentMethod);
    }
    setSubmitting(false);
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ errors, touched, isSubmitting, values, setValues }) => (
        <Form>
          <ButtonGroup aria-label="Basic example">
            <Button
              outline
              variant="primary"
              onClick={() => setRSelected(1)}
              active={rSelected === 1}
            >
              JSON
            </Button>
            <Button
              outline
              variant="primary"
              onClick={() => setRSelected(2)}
              active={rSelected === 2}
            >
              HTML
            </Button>
          </ButtonGroup>

          <div className={classNames({ 'tw-hidden': rSelected === 1 })}>
            {generateFields(formSchema)}
          </div>
          <div className={classNames({ 'tw-hidden': rSelected === 2 })}>
            <ReactJson
              src={values}
              onEdit={(edit) => {
                const updatedValues = {
                  ...values,
                  [edit.name]: edit.updated_src[edit.name],
                };
                setValues(updatedValues);
              }}
              onAdd={(add) => {
                const updatedValues = { ...values, [add.name]: add.new_value };
                setValues(updatedValues);
              }}
              onDelete={(del) => {
                const updatedValues = { ...values };
                delete updatedValues[del.name];
                setValues(updatedValues);
              }}
            />
          </div>
          <PaymentElement options={paymentElementOptions} />

          <button
            type="submit"
            className="btn btn-primary tw-mt-5"
            disabled={isSubmitting}
          >
            Submit
          </button>
          <div className="tw-pt-6">
            {Object.keys(errors).length > 0 && (
              <div className="alert alert-danger">
                <h4 className="alert-heading">Form Errors</h4>
                <ul className="mb-0">
                  {Object.keys(errors).map(
                    (key) => touched[key] && <li key={key}>{errors[key]}</li>,
                  )}
                </ul>
              </div>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}

const JsonInputForm = ({ formSchema, updateSchema }) => {
  const initialValues = {
    jsonData: JSON.stringify(formSchema, null, 4),
  };

  const validationSchema = Yup.object({
    jsonData: Yup.string()
      .required('JSON data is required')
      .test('is-json', 'Invalid JSON', (value) => {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return false;
        }
      }),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    console.log(JSON.parse(values.jsonData));
    setSubmitting(false);
    updateSchema(JSON.parse(values.jsonData));
  };

  return (
    <div className="container mt-5">
      <h2>Form customize</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="jsonData">JSON Schema</label>
              <Field
                as="textarea"
                name="jsonData"
                id="jsonData"
                className={`form-control ${errors.jsonData && touched.jsonData ? 'is-invalid' : ''}`}
                rows="10"
              />
              {errors.jsonData && touched.jsonData ? (
                <div className="invalid-feedback">{errors.jsonData}</div>
              ) : null}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const StripeComponent = () => {
  const schema = {
    required: ['email', 'lastName'],
    properties: {
      firstName: {
        type: 'string',
        title: 'First Name',
        default: 'John',
        minLength: 3,
      },
      lastName: {
        type: 'string',
        title: 'Last Name',
        default: 'Doe',
        minLength: 3,
      },
      email: {
        type: 'string',
        title: 'Email',
        default: '',
        minLength: 3,
      },
      contactPhone: {
        type: 'string',
        title: 'Phone',
        default: '',
      },
      contactAddress: {
        type: 'string',
        title: 'Contact Address',
        default: '',
      },
      contactCity: {
        type: 'string',
        title: 'Contact Address',
        default: '',
      },
      contactState: {
        type: 'string',
        title: 'Contact State',
        default: '',
      },
      contactZip: {
        type: 'string',
        title: 'Contact Zip',
        default: '',
      },
      couponCode: {
        type: 'string',
        title: 'Coupon Code',
        default: '',
      },
    },
  };
  const [formSchema, setFormSchema] = useState(schema);
  const updateSchema = (_schema) => {
    setFormSchema(_schema);
  };
  const elementsOptions = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: '"Work Sans",Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
      },
      rules: {
        '.Block': {
          backgroundColor: 'var(--colorBackground)',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input': {
          padding: '12px',
        },
        '.Input:disabled, .Input--invalid:disabled': {
          color: 'lightgray',
        },
        '.Tab': {
          padding: '10px 12px 8px 12px',
          border: 'none',
        },
        '.Tab:hover': {
          border: 'none',
          boxShadow:
            '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)',
        },
        '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
          border: '1px solid #89beec',
          backgroundColor: '#fff',
          boxShadow: '0 2px 25px 0 rgba(61,139,232,.2)',
        },
        '.Label': {
          fontWeight: '500',
        },
      },
    },
  };
  return (
    <div class="container">
      <div class="row">
        <div class="col-sm">
          <JsonInputForm formSchema={formSchema} updateSchema={updateSchema} />
        </div>
        <div class="col-sm">
          <Elements stripe={stripePromise} options={elementsOptions}>
            <CheckoutForm formSchema={formSchema} />
          </Elements>
        </div>
      </div>
    </div>
  );
};
StripeComponent.noHeader = true;
StripeComponent.hideFooter = true;
export default StripeComponent;
