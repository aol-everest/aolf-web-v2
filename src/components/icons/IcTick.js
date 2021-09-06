import * as React from "react";

function SvgIcTick(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      {...props}
    >
      <path
        fill="#FFF"
        d="M14.45 7.278a1 1 0 01.077 1.327l-.077.087-5.071 5.071a1 1 0 01-1.327.078l-.088-.078-2.07-2.07A1 1 0 017.22 10.2l.088.078 1.364 1.364 4.364-4.364a1.002 1.002 0 011.327-.078l.087.078z"
      />
    </svg>
  );
}

export default SvgIcTick;
