import * as React from "react";

function SvgIcFail(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path
          stroke="#FA5A67"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6v5"
        />
        <circle cx={10} cy={14} r={1} fill="#FA5A67" />
        <circle cx={10} cy={10} r={9} stroke="#FA5A67" strokeWidth={2} />
      </g>
    </svg>
  );
}

export default SvgIcFail;
