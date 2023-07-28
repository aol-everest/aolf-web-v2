function SvgIcExpand2(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect width={23} height={23} x={0.5} y={0.5} stroke="#89BEEC" rx={4} />
        <path d="M2 2h20v20H2z" />
        <path
          stroke="#6F7283"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.333 5.333h3.334v3.334m-5 1.666l5-5m-10 13.334H5.333v-3.334m0 3.334l5-5m5 5h3.334v-3.334m-5-1.666l5 5m-10-13.334H5.333v3.334m0-3.334l5 5"
        />
      </g>
    </svg>
  );
}

export default SvgIcExpand2;
