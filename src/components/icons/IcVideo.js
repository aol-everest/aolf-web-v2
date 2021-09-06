import * as React from "react";

function SvgIcVideo(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        stroke="#9598A6"
        strokeWidth={2}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1.001 1.001 0 01-1.447.894L15 14v-4z" />
        <rect width={12} height={12} x={3} y={6} rx={2} />
      </g>
    </svg>
  );
}

export default SvgIcVideo;
