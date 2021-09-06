import * as React from "react";

function SvgIcFilter(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="#3D8BE8"
        fillRule="evenodd"
        d="M14 16a1 1 0 010 2h-4a1 1 0 010-2h4zm3-5a1 1 0 010 2H7a1 1 0 010-2h10zm2-5a1 1 0 010 2H5a1 1 0 010-2h14z"
      />
    </svg>
  );
}

export default SvgIcFilter;
