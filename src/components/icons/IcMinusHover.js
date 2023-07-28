function SvgIcMinusHover(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect
          width={39}
          height={39}
          x={0.5}
          y={0.5}
          fill="#FFF"
          stroke="#F7C250"
          rx={19.5}
        />
        <path
          stroke="#ED994E"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 20h14"
        />
      </g>
    </svg>
  );
}

export default SvgIcMinusHover;
