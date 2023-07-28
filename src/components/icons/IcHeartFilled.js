function SvgIcHeartFilled(props) {
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
        <path
          fill="#31364E"
          stroke="#31364E"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.254 12.97L12.007 19 5.76 12.97m0 0a3.993 3.993 0 01-1.072-4.116c.465-1.459 1.732-2.54 3.277-2.796a4.216 4.216 0 014.042 1.58 4.216 4.216 0 014.037-1.56c1.54.259 2.8 1.336 3.267 2.79a3.991 3.991 0 01-1.057 4.106"
        />
      </g>
    </svg>
  );
}

export default SvgIcHeartFilled;
