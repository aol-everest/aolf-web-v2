import React from "react";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import renderHTML from "react-render-html";
import Select from "react-select";
import classNames from "classnames";

const questionRender = (formikProps) => (question, index) => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setFieldValue,
  } = formikProps;
  const options = question.options__c
    ? question.options__c
        .split(";")
        .map((option) => ({ value: option, label: option }))
    : [];
  const key = "q-" + index;
  switch (question.questiontype__c) {
    case "Multi Select Picklist":
      return (
        <div
          className={classNames("volonteer-content__item item-volonteer", {
            required: question.is_required__c,
          })}
        >
          <label class="item-volonteer__label" for={key}>
            {question.question && renderHTML(question.question)}
          </label>
          <Field name={key} class="form-control">
            {({ field }) => {
              return (
                <Select
                  name={key}
                  options={options}
                  isMulti
                  {...field}
                  value={
                    options
                      ? options.find((option) => option.value === field.value)
                      : ""
                  }
                  onChange={(option) => {
                    if (option) {
                      setFieldValue(
                        field.name,
                        option.map((o) => o.value).join(";"),
                      );
                    } else {
                      setFieldValue(field.name, "");
                    }
                  }}
                  className={classNames({
                    "is-invalid": errors[key] && formikProps.touched[key],
                  })}
                />
              );
            }}
          </Field>
          {errors[key] && formikProps.touched[key] && (
            <div class="invalid-feedback">{errors[key]}</div>
          )}
        </div>
      );
    case "Picklist":
      return (
        <div
          className={classNames("volonteer-content__item item-volonteer", {
            required: question.is_required__c,
          })}
        >
          <label class="item-volonteer__label" for={key}>
            {question.question && renderHTML(question.question)}
          </label>
          <Field name={key} class="form-control">
            {({ field }) => (
              <Select
                name={key}
                options={options}
                {...field}
                value={
                  options
                    ? options.find((option) => option.value === field.value)
                    : ""
                }
                onChange={(option) => {
                  if (option) {
                    setFieldValue(field.name, option.value);
                  } else {
                    setFieldValue(field.name, "");
                  }
                }}
                className={classNames({
                  "is-invalid": errors[key] && formikProps.touched[key],
                })}
              />
            )}
          </Field>
          {errors[key] && formikProps.touched[key] && (
            <div class="invalid-feedback">{errors[key]}</div>
          )}
        </div>
      );
    case "Yes/No":
      return (
        <div
          className={classNames("volonteer-content__item item-volonteer", {
            required: question.is_required__c,
          })}
        >
          <label class="item-volonteer__label" for={key}>
            {question.question && renderHTML(question.question)}
          </label>
          <div class="form-check">
            <Field
              class="form-check-input"
              type="radio"
              name={key}
              value="Yes"
              id="yes"
            />
            <label class="form-check-label" for="yes">
              Yes
            </label>
          </div>
          <div class="form-check">
            <Field
              class="form-check-input"
              type="radio"
              name={key}
              value="No"
              id="no"
            />
            <label class="form-check-label" for="no">
              No
            </label>
          </div>
          {errors[key] && formikProps.touched[key] && (
            <div class="invalid-feedback tw-block">{errors[key]}</div>
          )}
        </div>
      );
    case "Boolean":
      return (
        <div
          className={classNames("volonteer-content__item item-volonteer", {
            required: question.is_required__c,
          })}
        >
          <div class="form-check form-check-inline checkbox">
            <div>
              <Field
                class="form-check-input"
                type="checkbox"
                name={key}
                value="Yes"
                id={key}
              />
              <label class="item-volonteer__label" for="inlineRadio1">
                {question.question && renderHTML(question.question)}
              </label>
            </div>
            {errors[key] && formikProps.touched[key] && (
              <div class="invalid-feedback">{errors[key]}</div>
            )}
          </div>
        </div>
      );
    case "Text":
      return (
        <div
          className={classNames("volonteer-content__item item-volonteer", {
            required: question.is_required__c,
          })}
        >
          <label class="item-volonteer__label" for={key}>
            {question.question && renderHTML(question.question)}
          </label>
          <Field name={key}>
            {({ field }) => (
              <input
                type="text"
                {...field}
                onChange={handleChange}
                className={classNames("form-control", {
                  "is-invalid": errors[key] && formikProps.touched[key],
                })}
              />
            )}
          </Field>
          {errors[key] && formikProps.touched[key] && (
            <div class="invalid-feedback">{errors[key]}</div>
          )}
        </div>
      );
    case "Number":
      return (
        <div
          className={classNames("volonteer-content__item item-volonteer", {
            required: question.is_required__c,
          })}
        >
          <label class="form-label" for={key}>
            {question.question && renderHTML(question.question)}
          </label>
          <Field name={key}>
            {({ field }) => (
              <input
                type="number"
                {...field}
                onChange={handleChange}
                className={classNames("form-control", {
                  "is-invalid": errors[key] && formikProps.touched[key],
                })}
              />
            )}
          </Field>
        </div>
      );

    default:
      return <div>Unsupported field</div>;
  }
};

export const ProgramQuestionnaire = ({
  programName,
  questions,
  closeModalAction,
  submitResult,
}) => {
  const questionMap = questions.reduce((acc, question, index) => {
    acc = { ...acc, ["q-" + index]: question };
    return acc;
  }, {});

  const initialValues = questions.reduce((acc, question, index) => {
    acc = { ...acc, ["q-" + index]: "" };
    return acc;
  }, {});

  const validation = questions.reduce((acc, question, index) => {
    let field = Yup.string();
    if (question.is_required__c) {
      field = Yup.string().required("Question is required");
    }
    acc = { ...acc, ["q-" + index]: field };
    return acc;
  }, {});

  const validationSchema = Yup.object().shape(validation);

  const onSubmit = (fields) => {
    const result = Object.entries(fields).reduce((acc, [key, value]) => {
      acc = [
        ...acc,
        {
          QuestionId: questionMap[key].questionSfid,
          Question: (questionMap[key].question || "").replace(
            /(<([^>]+)>)/gi,
            "",
          ),
          Response: value,
        },
      ];
      return acc;
    }, []);
    submitResult(result);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formikProps) => {
        return (
          <form onSubmit={formikProps.handleSubmit}>
            <div class={classNames("volonteer-modal _active-modal")}>
              <div class="volonteer-modal__body">
                <div class="volonteer-modal__wrapper">
                  <button
                    type="button"
                    onClick={closeModalAction}
                    on
                    class="volonteer-modal__close"
                  >
                    <img src="/img/ic-cross.svg" alt="close" title="close" />
                  </button>
                  <div class="volonteer-modal__header volonteer-header">
                    <h5 class="volonteer-header__title">{programName}</h5>
                    {/* <div class="volonteer-header__description">
                      We would like to learn more about you as one of our
                      volunteers. Please answer the following questions to
                      accompany your application.
                    </div> */}
                  </div>
                  <div
                    class="volonteer-content"
                    data-select2-id="select2-data-16-e1rv"
                  >
                    {questions.map(questionRender(formikProps))}
                  </div>
                  <div class="volonteer-modal__footer">
                    <button class="btn btn-secondary" type="submit">
                      Continue Checkout
                    </button>
                  </div>

                  <div
                    class="close-modal d-md-flex d-none"
                    onClick={closeModalAction}
                  >
                    <div class="close-line"></div>
                    <div class="close-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};
