import { COURSE_TYPES } from "@constants";
import classNames from "classnames";
import { Field, Formik } from "formik";
import Select from "react-select";
import * as Yup from "yup";

const checkBoxQuestion = ({
  formikProps,
  field,
  label,
  name,
  id,
  value,
  ...props
}) => {
  const handleChange = (e) => {
    const { checked } = e.target;
    if (checked) {
      formikProps.setFieldValue(id, "Yes");
    } else {
      formikProps.setFieldValue(id, "No");
    }
  };
  return (
    <input
      type="checkbox"
      className="form-check-input"
      value={value}
      name={id}
      id={id}
      {...field}
      {...props}
      checked={field.value === "Yes"}
      onChange={handleChange}
    />
  );
};

// eslint-disable-next-line react/display-name
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
          {question.question && (
            <label
              className="item-volonteer__label"
              htmlFor={key}
              dangerouslySetInnerHTML={{ __html: question.question }}
            ></label>
          )}
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
            <div className="invalid-feedback">{errors[key]}</div>
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
          {question.question && (
            <label
              className="item-volonteer__label"
              htmlFor={key}
              dangerouslySetInnerHTML={{ __html: question.question }}
            ></label>
          )}
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
            <div className="invalid-feedback">{errors[key]}</div>
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
          {question.question && (
            <label
              className="item-volonteer__label"
              htmlFor={key}
              dangerouslySetInnerHTML={{ __html: question.question }}
            ></label>
          )}
          <div className="form-check">
            <Field
              class="form-check-input"
              type="radio"
              name={key}
              value="Yes"
              id="yes"
            />
            <label className="form-check-label" htmlFor="yes">
              Yes
            </label>
          </div>
          <div className="form-check">
            <Field
              class="form-check-input"
              type="radio"
              name={key}
              value="No"
              id="no"
            />
            <label className="form-check-label" htmlFor="no">
              No
            </label>
          </div>
          {errors[key] && formikProps.touched[key] && (
            <div className="invalid-feedback tw-block">{errors[key]}</div>
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
          <div className="form-check form-check-inline checkbox">
            <div>
              <Field
                class="form-check-input"
                name={key}
                component={checkBoxQuestion}
                id={key}
                formikProps={formikProps}
              />
              {question.question && (
                <label
                  className="item-volonteer__label"
                  htmlFor={key}
                  dangerouslySetInnerHTML={{ __html: question.question }}
                ></label>
              )}
            </div>
            {errors[key] && formikProps.touched[key] && (
              <div className="invalid-feedback">{errors[key]}</div>
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
          {question.question && (
            <label
              className="item-volonteer__label"
              htmlFor={key}
              dangerouslySetInnerHTML={{ __html: question.question }}
            ></label>
          )}
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
            <div className="invalid-feedback">{errors[key]}</div>
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
          {question.question && (
            <label
              className="item-volonteer__label"
              htmlFor={key}
              dangerouslySetInnerHTML={{ __html: question.question }}
            ></label>
          )}
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
  productTypeId = null,
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

  const isVolunteerTrainingProgram =
    COURSE_TYPES.VOLUNTEER_TRAINING_PROGRAM.value.indexOf(productTypeId) >= 0;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formikProps) => {
        return (
          <form onSubmit={formikProps.handleSubmit}>
            <div className={classNames("volonteer-modal _active-modal")}>
              <div className="volonteer-modal__body tw-max-h-[682px]">
                <div className="volonteer-modal__wrapper tw-max-h-[682px]">
                  <button
                    type="button"
                    onClick={closeModalAction}
                    on
                    className="volonteer-modal__close"
                  >
                    <img src="/img/ic-cross.svg" alt="close" title="close" />
                  </button>
                  <div className="volonteer-modal__header volonteer-header">
                    <h5 className="volonteer-header__title">{programName}</h5>
                    {isVolunteerTrainingProgram && (
                      <div className="volonteer-header__description">
                        We would like to learn more about you as one of our
                        volunteers. Please answer the following questions to
                        accompany your application.
                      </div>
                    )}
                  </div>
                  <div
                    className="volonteer-content"
                    data-select2-id="select2-data-16-e1rv"
                  >
                    {questions.map(questionRender(formikProps))}
                  </div>
                  <div className="volonteer-modal__footer">
                    <button className="btn btn-secondary" type="submit">
                      Continue Checkout
                    </button>
                  </div>

                  <div
                    className="close-modal d-md-flex d-none"
                    onClick={closeModalAction}
                  >
                    <div className="close-line"></div>
                    <div className="close-line"></div>
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
