import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

import { Table } from "./Table";
import { dayjs } from "./utils";

import CalendarBody from "./CalendarBody";
import CalendarHead from "./CalendarHead";
import PickerUI from "./PickerUI";

class LinkedCalendar extends React.Component {
  static propTypes = {
    opens: PropTypes.string,
    position: PropTypes.string,
    toLeft: PropTypes.bool,
    noFooter: PropTypes.bool,
    noInfo: PropTypes.bool,
    noCancel: PropTypes.bool,
  };

  static defaultProps = {
    position: "left",
    opens: "left",
  };

  constructor(props) {
    super(props);

    const leftCalendar = dayjs().subtract(props.toLeft ? 1 : 0, "month");
    const rightCalendar = leftCalendar.add(1, "month");

    this.state = { leftCalendar, rightCalendar };

    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);
  }

  handlePrev(leftCalendar) {
    const rightCalendar = leftCalendar.add(1, "month");

    this.setState({ leftCalendar, rightCalendar });
  }

  handleNext(rightCalendar) {
    const leftCalendar = rightCalendar.subtract(1, "month");

    this.setState({ rightCalendar, leftCalendar });
  }

  renderTable() {
    const { leftCalendar, rightCalendar } = this.state;
    const leftState = Object.assign({}, this.props, { calendar: leftCalendar });
    const rightState = Object.assign({}, this.props, {
      calendar: rightCalendar,
    });
    const className = classNames("drp-calendar", "left");

    return [
      <div className={className} key={0}>
        <div className="calendar-table">
          <Table className="table-condensed">
            <CalendarHead
              handlePrev={this.handlePrev}
              handleNext={() => {}}
              handleSelected={this.handlePrev}
              showNext={false}
              {...leftState}
            />

            <CalendarBody
              handlePrev={this.handlePrev}
              handleNext={() => {}}
              handleSelected={this.handlePrev}
              showNext={false}
              {...leftState}
            />
          </Table>
        </div>
      </div>,
      <div className={className} key={1}>
        <div className="calendar-table">
          <Table className="table-condensed">
            <CalendarHead
              showPrev={false}
              handlePrev={() => {}}
              handleNext={this.handleNext}
              handleSelected={this.handleNext}
              {...rightState}
            />

            <CalendarBody
              showPrev={false}
              handlePrev={() => {}}
              handleNext={this.handleNext}
              handleSelected={this.handleNext}
              {...rightState}
            />
          </Table>
        </div>
      </div>,
    ];
  }
  render() {
    const { opens, children, className } = this.props;
    const classNameObj = classNames(
      "daterangepicker ltr auto-apply show-calendar openscenter",
      className,
    );
    const styles = {
      left: "auto",
      display: "block",
    };

    return (
      <div className={classNameObj} style={styles}>
        {this.renderTable()}
        {children}
      </div>
    );
  }
}

export default class LinkedCalendarUI extends React.Component {
  render() {
    const uiProps = { ...this.props, component: LinkedCalendar };

    return <PickerUI {...uiProps} />;
  }
}
