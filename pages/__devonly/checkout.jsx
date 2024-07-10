'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { api } from '@utils';
import * as Yup from 'yup';
import {
  Elements,
  CardElement,
  useStripe,
  PaymentElement,
  useElements,
} from '@stripe/react-stripe-js';
import dynamic from 'next/dynamic';
import { Button, ButtonGroup, Alert } from 'reactstrap';
import classNames from 'classnames';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), {
  ssr: false,
});

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const generateFields = (properties, path = '') => {
  return Object.keys(properties).map((key) => {
    const field = properties[key];
    const fieldPath = path ? `${path}.${key}` : key;
    let fieldComponent = null;

    if (field.type === 'object' && field.properties) {
      return (
        <div key={fieldPath}>
          <h5>{field.title || key}</h5>
          {generateFields(field.properties, fieldPath)}
        </div>
      );
    }
    switch (field.type) {
      case 'string':
        if (field.format === 'json') {
          fieldComponent = (
            <div className="mb-3" key={fieldPath}>
              <label htmlFor={fieldPath} className="form-label">
                {field.title || key}
              </label>
              <Field
                as="textarea"
                id={fieldPath}
                name={fieldPath}
                className="form-control"
                rows={4}
              />
              <ErrorMessage
                name={fieldPath}
                component="div"
                className="text-danger"
              />
            </div>
          );
        } else {
          fieldComponent = (
            <div className="mb-3" key={fieldPath}>
              <label htmlFor={fieldPath} className="form-label">
                {field.title || key}
              </label>
              <Field
                id={fieldPath}
                name={fieldPath}
                type="text"
                className="form-control"
              />
              <ErrorMessage
                name={fieldPath}
                component="div"
                className="text-danger"
              />
            </div>
          );
        }
        break;
      case 'integer':
        fieldComponent = (
          <div className="mb-3" key={fieldPath}>
            <label htmlFor={fieldPath} className="form-label">
              {field.title || key}
            </label>
            <Field
              id={fieldPath}
              name={fieldPath}
              type="number"
              className="form-control"
            />
            <ErrorMessage
              name={fieldPath}
              component="div"
              className="text-danger"
            />
          </div>
        );
        break;
      case 'boolean':
        fieldComponent = (
          <div className="form-check mb-3" key={fieldPath}>
            <Field
              id={fieldPath}
              name={fieldPath}
              type="checkbox"
              className="form-check-input"
            />
            <label htmlFor={fieldPath} className="form-check-label">
              {field.title || key}
            </label>
            <ErrorMessage
              name={fieldPath}
              component="div"
              className="text-danger"
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

const generateValidationSchema = (properties, requiredFields = []) => {
  const validationSchema = {};

  Object.keys(properties).forEach((key) => {
    const field = properties[key];
    const isRequired = requiredFields.includes(key);
    let validator;

    if (field.type === 'object' && field.properties) {
      validator = generateValidationSchema(
        field.properties,
        field.required || [],
      );
    } else {
      switch (field.type) {
        case 'string':
          validator = Yup.string();
          if (field.minLength) validator = validator.min(field.minLength);
          if (field.maxLength) validator = validator.max(field.maxLength);
          if (field.pattern)
            validator = validator.matches(new RegExp(field.pattern));
          if (isRequired)
            validator = validator.required(`(${key}) is required`);
          break;
        case 'integer':
          validator = Yup.number().integer();
          if (field.minimum) validator = validator.min(field.minimum);
          if (field.maximum) validator = validator.max(field.maximum);
          if (isRequired)
            validator = validator.required(`(${key}) is required`);
          break;
        // Add more cases for other types if needed
        default:
          validator = Yup.mixed();
      }
    }

    validationSchema[key] = validator;
  });

  return Yup.object().shape(validationSchema);
};

const generateInitialValues = (properties) => {
  const initialValues = {};

  Object.keys(properties).forEach((key) => {
    const field = properties[key];
    if (field.properties) {
      initialValues[key] = generateInitialValues(field.properties);
    } else {
      initialValues[key] = field.default || '';
    }
  });

  return initialValues;
};

function tryJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

function CheckoutForm({ formSchema }) {
  const { properties, required = [] } = formSchema;
  const [jsonText, setJsonText] = useState('');
  const [apiName, setApiName] = useState('createIntentForExpressCheckoutPOC');
  const [errorMessage, setErrorMessage] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const paymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
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

  const initialValues = generateInitialValues(properties);

  const validationSchema = generateValidationSchema(properties, required);

  useEffect(() => {
    try {
      setJsonText(JSON.stringify(initialValues, null, 4));
    } catch (error) {
      console.error('Invalid JSON format:', error.message);
    }
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!stripe || !elements) {
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }

    let payload = { ...values };
    let { shoppingRequest } = payload;

    if (
      typeof shoppingRequest.complianceQuestionnaire === 'string' &&
      shoppingRequest.complianceQuestionnaire.trim() !== '' &&
      tryJsonParse(shoppingRequest.complianceQuestionnaire)
    ) {
      shoppingRequest = {
        ...shoppingRequest,
        complianceQuestionnaire: tryJsonParse(
          shoppingRequest.complianceQuestionnaire,
        ),
      };
    }

    let { products } = shoppingRequest;

    if (
      typeof products.AddOnProductIds === 'string' &&
      products.AddOnProductIds.trim() !== '' &&
      tryJsonParse(products.AddOnProductIds)
    ) {
      products = {
        ...products,
        AddOnProductIds: tryJsonParse(products.AddOnProductIds),
      };
    }
    shoppingRequest = {
      ...shoppingRequest,
      products,
      billingAddress: {
        billingPhone: shoppingRequest.contactAddress?.contactPhone,
        billingAddress: shoppingRequest.contactAddress?.contactAddress,
        billingCity: shoppingRequest.contactAddress?.contactCity,
        billingState: shoppingRequest.contactAddress?.contactState,
        billingZip: shoppingRequest.contactAddress?.contactZip,
      },
    };

    payload = {
      ...payload,
      shoppingRequest,
    };

    const {
      stripeIntentObj,
      status,
      orderId,
      data,
      error: errorMessage,
      isError,
    } = await api.post({
      path: apiName,
      body: values,
    });

    if (status === 400 || isError) {
      throw new Error(errorMessage);
    }

    if (data && data.totalOrderAmount > 0) {
      const returnUrl = `${window.location.origin}/__devonly/check-payment/${orderId}`;
      const result = await stripe.confirmPayment({
        //`Elements` instance that was used to create the Payment Element
        elements,
        clientSecret: stripeIntentObj.client_secret,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (result.error) {
        // Show error to your customer (for example, payment details incomplete)
        throw new Error(result.error.message);
      }
    }
    setSubmitting(false);
  };

  const updateValues = (setValues) => (e) => {
    if (e) e.preventDefault();
    try {
      setErrorMessage(null);
      const parsedValues = JSON.parse(jsonText);
      setValues(parsedValues);
    } catch (error) {
      console.error('Invalid JSON format:', error.message);
      setErrorMessage('Invalid JSON format:', error.message);
    }
  };

  const handleChange = (event) => {
    setJsonText(event.target.value);
  };

  const handleChangeApiName = (event) => {
    setApiName(event.target.value);
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
          <div class="form-group">
            <label for="exampleInputEmail1">Api Name</label>
            <input
              type="text"
              value={apiName}
              onChange={handleChangeApiName}
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="exampleInputEmail1">Payload</label>
            <textarea
              value={jsonText}
              onChange={handleChange}
              rows={20}
              className="form-control"
            />
            {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
          </div>

          <div className="tw-my-5">
            <a href="#" onClick={updateValues(setValues)}>
              Update Payload
            </a>
          </div>

          <PaymentElement options={paymentElementOptions} />

          <button
            type="submit"
            className="btn btn-primary tw-mt-5"
            disabled={isSubmitting}
          >
            Submit
          </button>
          <div className="tw-pt-6">{JSON.stringify(errors, null, 2)}</div>
        </Form>
      )}
    </Formik>
  );
}

const StripeComponent = () => {
  const schema = {
    title: 'JSON Schema Form',
    type: 'object',
    properties: {
      user: {
        type: 'object',
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
        },
      },
      shoppingRequest: {
        type: 'object',
        properties: {
          couponCode: {
            type: 'string',
            title: 'Coupon Code',
            default: '',
          },
          isInstalmentOpted: {
            type: 'boolean',
            title: 'isInstalmentOpted',
            default: false,
          },
          isStripeIntentPayment: {
            type: 'boolean',
            title: 'IsStripeIntentPayment',
            default: true,
          },

          contactAddress: {
            type: 'object',
            properties: {
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
                title: 'Contact City',
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
            },
          },
          products: {
            type: 'object',
            properties: {
              productType: {
                type: 'string',
                title: 'Product Type',
                default: 'workshop',
              },
              productSfId: {
                type: 'string',
                title: 'Product SFID',
                default: '',
              },
              AddOnProductIds: {
                type: 'string',
                title: 'AddOn Product Ids',
                format: 'json',
                default: '[]',
              },
            },
          },
        },
      },
    },
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
          <Elements stripe={stripePromise} options={elementsOptions}>
            <CheckoutForm formSchema={schema} />
          </Elements>
        </div>
      </div>
    </div>
  );
};
StripeComponent.noHeader = true;
StripeComponent.hideFooter = true;
export default StripeComponent;
