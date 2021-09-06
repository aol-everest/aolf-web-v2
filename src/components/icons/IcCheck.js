import * as React from "react";

function SvgIcCheck(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <path
        fill="#FFF"
        d="M16 4c6.627 0 12 5.373 12 12s-5.373 12-12 12S4 22.627 4 16 9.373 4 16 4zm0 2C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm4.944 6.468l.087.078c.362.362.388.934.078 1.327l-.078.087-6.071 6.07a1 1 0 01-1.327.079l-.087-.078-2.253-2.253a1 1 0 011.327-1.492l.087.078 1.546 1.544 5.364-5.362a1 1 0 011.327-.078z"
      />
    </svg>
  );
}

export default SvgIcCheck;
