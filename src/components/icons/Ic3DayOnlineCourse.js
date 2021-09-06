import * as React from "react";

function SvgIc3DayOnlineCourse(props) {
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
          id="ic-3-day-online-course_svg__a"
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
          fill="url(#ic-3-day-online-course_svg__a)"
          fillRule="nonzero"
          d="M21 48a1 1 0 010-2h3v-6H13a2.001 2.001 0 01-1.995-1.85L11 38V16a2 2 0 012-2h34a2 2 0 012 2v22a2 2 0 01-2 2H36v6h3a1 1 0 010 2H21zm13-8h-8v6h8v-6zm13-24H13v22h34V16zm-17.5 7.964c.265 0 .52.106.707.293l2.536 2.536a1 1 0 010 1.414l-2.536 2.536a1 1 0 01-1.707-.707v-5.072a1 1 0 011-1z"
        />
      </g>
    </svg>
  );
}

export default SvgIc3DayOnlineCourse;
