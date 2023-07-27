import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";

export const InputDropDown = (props) => {
  const [visible, setVisibility] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const arrowRef = useRef(null);

  const {
    children,
    containerClass = "",
    formikProps,
    formikKey,
    placeholder,
  } = props;

  useEffect(() => {
    // listen for clicks and close dropdown on body
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const { styles, attributes } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: "bottom",
      modifiers: [
        {
          name: "arrow",
          enabled: true,
          options: {
            element: arrowRef.current,
          },
        },
        {
          name: "offset",
          enabled: true,
          options: {
            offset: [0, 10],
          },
        },
      ],
    },
  );

  function handleDocumentClick(event) {
    if (
      referenceRef.current.contains(event.target) ||
      popperRef.current.contains(event.target)
    ) {
      return;
    }
    setVisibility(false);
  }

  const onFocusAction = () => {
    setVisibility(true);
  };

  function closeHandler(value) {
    return function () {
      if (props.closeEvent) {
        props.closeEvent(value);
      }
      setVisibility(false);
    };
  }

  return (
    <>
      <input
        ref={referenceRef}
        type="text"
        id={formikKey}
        onFocus={onFocusAction}
        value={formikProps.values[formikKey]}
        name={formikKey}
        placeholder={placeholder}
        autoComplete="off"
      />

      <ul
        className={classNames("tooltip-block", containerClass, {
          active: visible,
        })}
        ref={popperRef}
        style={styles.popper}
        {...attributes.popper}
      >
        {visible &&
          children({
            props,
            closeHandler,
          })}
        <div
          ref={arrowRef}
          className="tooltip-arrow"
          style={styles.arrow}
        ></div>
      </ul>
    </>
  );
};
