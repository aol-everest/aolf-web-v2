function SvgIcInfo(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 25"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path
          stroke="#9598A6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 11v5"
        />
        <circle cx={12} cy={8} r={1} fill="#9598A6" />
        <circle cx={12} cy={12} r={9} stroke="#9598A6" strokeWidth={2} />
      </g>
    </svg>
  );
}

export default SvgIcInfo;
