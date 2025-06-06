import React from 'react';
import { getDefaultState, interval } from './utils';

export default class PickerUI extends React.Component {
  state = getDefaultState();
  onDayMouseEnter = (day) => {
    const { startDate, endDate } = this.state;
    const range = day >= startDate ? endDate || day : startDate;
    this.setState({ range });
  };

  onDayClick = (day) => {
    const isOpen = this.state.closedOrOpen === interval.OPEN;
    const startDate = isOpen ? this.state.startDate : day;
    const endDate = isOpen && day >= startDate ? day : null;
    const range = endDate || startDate;
    const closedOrOpen =
      isOpen && day >= startDate ? interval.CLOSED : interval.OPEN;
    this.setState({
      startDate,
      endDate,
      closedOrOpen,
      range,
    });
    const { onDatesChange, autoApply } = this.props;
    if (isOpen && autoApply) {
      onDatesChange({ startDate, endDate })();
    }
  };

  onApply = () => {
    const { startDate, endDate } = this.state;
    const { onDatesChange } = this.props;
    if (onDatesChange && startDate && endDate) {
      onDatesChange({ startDate, endDate });
    }
  };

  dateLabel = () => {
    const { startDate, endDate } = this.state;
    return startDate && endDate
      ? `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`
      : '';
  };

  render() {
    const { onDayClick, onDayMouseEnter } = this;
    const props = {
      onDayClick,
      onDayMouseEnter,
      ...this.state,
      ...this.props,
    };
    const { component: Component, noFooter, noInfo, noCancel } = this.props;

    return (
      <Component {...props}>
        <div className="ranges" />
        {!noFooter && (
          <div className="drp-buttons">
            {!noInfo && (
              <span className="drp-selected">{this.dateLabel()}</span>
            )}
            {!noCancel && (
              <button
                className="cancelBtn btn btn-sm btn-default"
                type="button"
              >
                Cancel
              </button>
            )}
            <button
              className="applyBtn btn btn-sm btn-primary"
              type="button"
              onClick={this.onApply}
            >
              Apply
            </button>
          </div>
        )}
      </Component>
    );
  }
}
