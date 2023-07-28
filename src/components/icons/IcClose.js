function SvgIcClose(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="#31364E" fillRule="evenodd">
        <rect
          width={2}
          height={20}
          x={11}
          y={2}
          rx={1}
          transform="rotate(-45 12 12)"
        />
        <rect
          width={2}
          height={20}
          x={11}
          y={2}
          rx={1}
          transform="rotate(45 12 12)"
        />
      </g>
    </svg>
  );
}

export default SvgIcClose;
