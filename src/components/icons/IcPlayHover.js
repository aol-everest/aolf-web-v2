function SvgIcPlayHover(props) {
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
          id="ic-play-hover_svg__c"
          x1="50%"
          x2="50%"
          y1="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#3D8BE8" />
          <stop offset="100%" stopColor="#89BEEC" />
        </linearGradient>
        <filter
          id="ic-play-hover_svg__a"
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
        <circle id="ic-play-hover_svg__b" cx={30} cy={30} r={30} />
        <rect
          id="ic-play-hover_svg__d"
          width={60}
          height={60}
          x={0}
          y={0}
          rx={30}
        />
      </defs>
      <g fill="none" fillRule="evenodd">
        <g>
          <use
            fill="#000"
            filter="url(#ic-play-hover_svg__a)"
            xlinkHref="#ic-play-hover_svg__b"
          />
          <use fill="#FFF" xlinkHref="#ic-play-hover_svg__b" />
        </g>
        <g>
          <use
            fill="url(#ic-play-hover_svg__c)"
            xlinkHref="#ic-play-hover_svg__d"
          />
          <use
            fill="#FFF"
            fillOpacity={0.2}
            xlinkHref="#ic-play-hover_svg__d"
          />
        </g>
        <path
          fill="#FFF"
          fillRule="nonzero"
          d="M39.494 28.917l-13.05-7.767a.985.985 0 00-.511-.15.935.935 0 00-.928.938H25v16.125h.005c0 .515.417.937.928.937.192 0 .351-.066.525-.16l13.036-7.757a1.415 1.415 0 000-2.166z"
        />
      </g>
    </svg>
  );
}

export default SvgIcPlayHover;
