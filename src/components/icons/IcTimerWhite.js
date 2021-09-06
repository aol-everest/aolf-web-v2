import * as React from "react";

function SvgIcTimerWhite(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <g fill="#fff">
        <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2z" />
        <path d="M8 4.29c.513 0 .936.385.993.882L9 5.29V7.5l1.5.001a1 1 0 01.993.883l.007.117a1 1 0 01-.883.993L10.5 9.5H8a1 1 0 01-.993-.883L7 8.5V5.29a1 1 0 011-1z" />
      </g>
    </svg>
  );
}

export default SvgIcTimerWhite;
