function SvgIcPlayActive(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="1em"
      height="1em"
      viewBox="0 0 60 60"
      {...props}
    >
      <defs>
        <linearGradient
          id="ic-play-active_svg__c"
          x1="50%"
          x2="50%"
          y1="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#1374E8" />
          <stop offset="100%" stopColor="#70BAFA" />
        </linearGradient>
        <filter
          id="ic-play-active_svg__a"
          width="153.3%"
          height="153.3%"
          x="-26.7%"
          y="-23.3%"
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
            values="0 0 0 0 0.239215686 0 0 0 0 0.545098039 0 0 0 0 0.909803922 0 0 0 0.2 0"
          />
        </filter>
        <circle id="ic-play-active_svg__b" cx={30} cy={30} r={30} />
      </defs>
      <g fill="none" fillRule="evenodd">
        <use
          fill="#000"
          filter="url(#ic-play-active_svg__a)"
          xlinkHref="#ic-play-active_svg__b"
        />
        <use fill="#FFF" xlinkHref="#ic-play-active_svg__b" />
        <rect
          width={60}
          height={60}
          fill="url(#ic-play-active_svg__c)"
          rx={30}
        />
        <path
          fill="#FFF"
          fillRule="nonzero"
          d="M40.029 28.89l-13.385-7.967a1.008 1.008 0 00-.524-.154.96.96 0 00-.952.962h-.005v16.538h.005c0 .53.428.962.952.962.197 0 .36-.068.539-.164l13.37-7.956a1.445 1.445 0 000-2.221z"
          opacity={0.8}
        />
      </g>
    </svg>
  );
}

export default SvgIcPlayActive;
