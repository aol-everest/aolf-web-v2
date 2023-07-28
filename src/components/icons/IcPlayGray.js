function SvgIcPlayGray(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 60 60"
      {...props}
    >
      <g fillRule="nonzero" fill="none">
        <rect width={60} height={60} fill="#E9E9E9" rx={30} />
        <path
          fill="#FFF"
          d="M39.494 28.917l-13.05-7.767a.985.985 0 00-.511-.15.935.935 0 00-.928.938H25v16.125h.005c0 .515.417.937.928.937.192 0 .351-.066.525-.16l13.036-7.757a1.415 1.415 0 000-2.166z"
        />
      </g>
    </svg>
  );
}

export default SvgIcPlayGray;
