import React from "react";

const getOffsetTop = (el) => {
  const rect = el?.getBoundingClientRect(),
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return rect?.top + scrollTop;
};

const getOffsetBottom = (el) => {
  const rect = el?.getBoundingClientRect(),
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return rect?.bottom + scrollTop;
};

export class HideOn extends React.Component {
  state = {
    show: false,
  };

  componentDidMount() {
    this.props.showOnPageInit && this.listenToScroll();
    window.addEventListener("scroll", this.listenToScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.listenToScroll);
  }

  listenToScroll = () => {
    const { atHeight, inverse, divID, offset, height } = this.props;

    let div = null;

    if (!atHeight) {
      div = document.querySelector(`#${divID}`);
    }

    let divTopOffset = height ? height || 0 : getOffsetTop(div);
    let divBottomOffset = height ? height || 0 : getOffsetBottom(div);
    console.log(divTopOffset, divBottomOffset);

    if (!height && offset) {
      divTopOffset += offset;
    }

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    if (winScroll >= divTopOffset && winScroll <= divBottomOffset) {
      this.setState({
        show: inverse,
      });
    } else {
      this.setState({
        show: !inverse,
      });
    }
  };

  render() {
    return (
      <React.Fragment>{this.state.show && this.props.children}</React.Fragment>
    );
  }
}
