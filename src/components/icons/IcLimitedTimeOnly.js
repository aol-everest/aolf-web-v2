import * as React from "react";

function SvgIcLimitedTimeOnly(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 60 60"
      {...props}
    >
      <defs>
        <linearGradient
          id="ic-limited-time-only_svg__a"
          x1="50%"
          x2="50%"
          y1="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#3D8BE8" />
          <stop offset="100%" stopColor="#89BEEC" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <circle cx={30} cy={30} r={30} fill="#4191E9" opacity={0.05} />
        <path
          fill="url(#ic-limited-time-only_svg__a)"
          fillRule="nonzero"
          d="M30 11c10.493 0 19 8.507 19 19s-8.507 19-19 19-19-8.507-19-19 8.507-19 19-19zm0 2c-9.389 0-17 7.611-17 17s7.611 17 17 17 17-7.611 17-17-7.611-17-17-17zm0 2c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15zm0 2c-7.18 0-13 5.82-13 13s5.82 13 13 13 13-5.82 13-13-5.82-13-13-13zm-1 5a1 1 0 01.993.883L30 23v7h4a1 1 0 01.993.883L35 31a1 1 0 01-.883.993L34 32h-5a1 1 0 01-.993-.883L28 31v-8a1 1 0 011-1z"
        />
      </g>
    </svg>
  );
}

export default SvgIcLimitedTimeOnly;
