import * as React from "react";

function SvgWarning(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <filter id="warning_svg__a">
          <feColorMatrix
            in="SourceGraphic"
            values="0 0 0 0 0.933333 0 0 0 0 0.521569 0 0 0 0 0.521569 0 0 0 1.000000 0"
          />
        </filter>
      </defs>
      <g filter="url(#warning_svg__a)" fill="none" fillRule="evenodd">
        <g fill="#000" fillRule="nonzero">
          <path d="M10 0C4.473 0 0 4.473 0 10s4.473 10 10 10 10-4.473 10-10S15.527 0 10 0zm0 18.438A8.433 8.433 0 011.562 10 8.433 8.433 0 0110 1.562 8.433 8.433 0 0118.438 10 8.433 8.433 0 0110 18.438z" />
          <path d="M10 5.034a.781.781 0 00-.781.782v5.03a.781.781 0 101.562 0v-5.03A.781.781 0 0010 5.034z" />
          <circle cx={10} cy={13.639} r={1.055} />
        </g>
      </g>
    </svg>
  );
}

export default SvgWarning;
