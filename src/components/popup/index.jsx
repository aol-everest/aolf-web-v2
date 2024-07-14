import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { usePopper } from 'react-popper';

export const Popup = (props) => {
  const {
    buttonText,
    tabindex,
    children,
    value,
    containerClassName = '',
    showId,
    parentClassName = '',
    showList = true,
    label,
    hideClearOption = false,
  } = props;

  const [visible, setVisibility] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const arrowRef = useRef(null);

  const { styles, attributes } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: 'bottom',
      modifiers: [
        {
          name: 'arrow',
          enabled: true,
          options: {
            element: arrowRef.current,
          },
        },
        {
          name: 'offset',
          enabled: true,
          options: {
            offset: [0, 10],
          },
        },
      ],
    },
  );
  useEffect(() => {
    // listen for clicks and close dropdown on body
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  function handleDropdownClick() {
    setVisibility(!visible);
  }

  function handleSelectFilter() {
    props.closeEvent(!value ? true : null);
  }

  function handleDocumentClick(event) {
    if (
      referenceRef.current.contains(event.target) ||
      popperRef?.current?.contains(event.target)
    ) {
      return;
    }
    setVisibility(false);
  }

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
      <div
        data-filter="event-type"
        ref={referenceRef}
        tabIndex={tabindex}
        className={classNames('courses-filter', parentClassName, {
          active: visible,
          'with-selected': value,
        })}
      >
        {value && !hideClearOption && (
          <button
            className="courses-filter__remove"
            data-filter="event-type"
            data-placeholder="Online"
            onClick={closeHandler(null)}
          >
            <svg
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="1"
                width="19"
                height="19"
                rx="9.5"
                fill="#ABB1BA"
              />
              <rect
                x="0.5"
                y="1"
                width="19"
                height="19"
                rx="9.5"
                stroke="white"
              />
              <path
                d="M13.5 7L6.5 14"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13.5 14L6.5 7"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        )}
        <label>{label}</label>
        <button
          className={classNames('courses-filter__button', {
            '!tw-text-slate-300': !buttonText,
          })}
          data-filter="event-type"
          onClick={!showList ? handleSelectFilter : handleDropdownClick}
        >
          {buttonText || 'Select...'}
        </button>
        {showList && (
          <div className="courses-filter__wrapper-list">
            <ul
              id={showId ? 'time-tooltip' : ''}
              className={classNames(
                'courses-filter__list',
                containerClassName,
                {
                  active: visible,
                },
              )}
              data-filter="event-type"
              ref={popperRef}
              {...attributes.popper}
            >
              {visible &&
                children({
                  props,
                  closeHandler,
                })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};
