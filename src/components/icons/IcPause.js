function SvgIcPause(props) {
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
          id="ic-pause_svg__c"
          x1="50%"
          x2="50%"
          y1="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#3D8BE8" />
          <stop offset="100%" stopColor="#89BEEC" />
        </linearGradient>
        <filter
          id="ic-pause_svg__a"
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
        <circle id="ic-pause_svg__b" cx={30} cy={30} r={30} />
      </defs>
      <g fill="none" fillRule="evenodd">
        <use
          fill="#000"
          filter="url(#ic-pause_svg__a)"
          xlinkHref="#ic-pause_svg__b"
        />
        <use fill="#FFF" xlinkHref="#ic-pause_svg__b" />
        <rect width={60} height={60} fill="url(#ic-pause_svg__c)" rx={30} />
        <rect width={4} height={24} x={23} y={17} fill="#FFF" rx={2} />
        <rect width={4} height={24} x={33} y={17} fill="#FFF" rx={2} />
      </g>
    </svg>
  );
}

export default SvgIcPause;
