function SvgIcLockCard(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect width={24} height={24} fill="#FFF" opacity={0.6} rx={4} />
        <rect
          width={11.667}
          height={8.333}
          x={6.167}
          y={11}
          stroke="#31364E"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          rx={1.667}
        />
        <circle cx={12} cy={15} r={1.5} fill="#31364E" />
        <path
          stroke="#31364E"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 11V8a3 3 0 116 0v3"
        />
      </g>
    </svg>
  );
}

export default SvgIcLockCard;
