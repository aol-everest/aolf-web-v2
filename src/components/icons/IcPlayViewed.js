import * as React from "react";

function SvgIcPlayViewed(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 60 60"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect
          width={59}
          height={59}
          x={0.5}
          y={0.5}
          stroke="#9598A6"
          rx={29.5}
        />
        <path
          stroke="#31364E"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M38.264 23.95L26.95 35.264 22 30.314"
        />
      </g>
    </svg>
  );
}

export default SvgIcPlayViewed;
