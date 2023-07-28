function SvgMask(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="1em"
      height="1em"
      viewBox="0 0 153 180"
      {...props}
    >
      <defs>
        <path
          id="mask_svg__a"
          d="M168.637 171.983c-5.946-22.623-35.53-60.619-67.29-35.965-17.112 13.342-22.042 35.24-25.668 61.343-3.625 26.104-53.512 12.037-51.627 53.222 2.03 42.926 77.006 79.761 120.221 41.186 43.216-38.575 32.63-88.317 24.364-119.786z"
        />
      </defs>
      <use
        fill="#F7F5F4"
        xlinkHref="#mask_svg__a"
        fillRule="evenodd"
        transform="translate(-24 -128)"
      />
    </svg>
  );
}

export default SvgMask;
