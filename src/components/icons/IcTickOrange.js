function SvgIcTickOrange(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      {...props}
    >
      <g stroke="#ED994E" strokeWidth={2} fill="none" fillRule="evenodd">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.124 8.125l-3.75 3.75L7.5 10.001"
        />
        <circle cx={10} cy={10} r={9} />
      </g>
    </svg>
  );
}

export default SvgIcTickOrange;
