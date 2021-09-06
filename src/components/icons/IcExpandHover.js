import * as React from "react";

function SvgIcExpandHover(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect width={23} height={23} x={0.5} y={0.5} stroke="#2465B3" rx={4} />
        <path
          stroke="#6F7283"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 13v4a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4"
        />
        <path
          fill="#6F7283"
          fillRule="nonzero"
          d="M19 4h.02c.023 0 .046.002.07.004L19 4c.05 0 .1.004.149.011l.052.01a.762.762 0 01.065.015l.046.014.06.021.051.023.061.03.037.022a1.2 1.2 0 01.074.05l.022.017c.063.05.12.107.17.17l-.08-.09a.927.927 0 01.147.186l.021.037c.011.02.022.04.031.06l.023.053.021.06.014.045.016.065.009.053.004.031.003.03.003.055L20 5v4a1 1 0 01-1.993.117L18 9V7.414l-3.293 3.293a1 1 0 01-1.497-1.32l.083-.094L16.584 6H15a1 1 0 01-.993-.883L14 5a1 1 0 01.883-.993L15 4h4z"
        />
      </g>
    </svg>
  );
}

export default SvgIcExpandHover;
