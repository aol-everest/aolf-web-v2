function SvgIcShrink2(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <defs>
        <filter
          id="ic-shrink2_svg__a"
          width="200%"
          height="200%"
          x="-50%"
          y="-43.8%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={2} in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
            stdDeviation={5}
          />
          <feColorMatrix
            in="shadowBlurOuter1"
            values="0 0 0 0 0.239215686 0 0 0 0 0.545098039 0 0 0 0 0.909803922 0 0 0 0.1 0"
          />
        </filter>
        <rect
          id="ic-shrink2_svg__b"
          width={32}
          height={32}
          x={0}
          y={0}
          rx={16}
        />
      </defs>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(-8)">
          <use
            fill="#000"
            filter="url(#ic-shrink2_svg__a)"
            xlinkHref="#ic-shrink2_svg__b"
          />
          <use fill="#FFF" xlinkHref="#ic-shrink2_svg__b" />
        </g>
        <g stroke="#6F7283" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth={1.667} d="M2.167 13.5H5.5v-3.333M.5 8.5l5 5" />
          <path
            strokeWidth={2}
            d="M2.167 18.5H5.5v3.333M.5 23.5l5-5m8.333-5H10.5v-3.333m0 3.333l5-5m-1.667 10H10.5v3.333m0-3.333l5 5"
          />
        </g>
      </g>
    </svg>
  );
}

export default SvgIcShrink2;
