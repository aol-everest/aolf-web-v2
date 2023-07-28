function SvgIcCollapse(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <defs>
        <filter
          id="ic-collapse_svg__a"
          width="340.6%"
          height="340.6%"
          x="-120.3%"
          y="-114.1%"
          filterUnits="objectBoundingBox"
        >
          <feOffset dy={2} in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
            stdDeviation={12.5}
          />
          <feColorMatrix
            in="shadowBlurOuter1"
            values="0 0 0 0 0.239215686 0 0 0 0 0.545098039 0 0 0 0 0.909803922 0 0 0 0.1 0"
          />
        </filter>
        <filter
          id="ic-collapse_svg__c"
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
        <circle id="ic-collapse_svg__b" cx={16} cy={16} r={16} />
        <circle id="ic-collapse_svg__d" cx={16} cy={16} r={16} />
      </defs>
      <g fill="none" fillRule="evenodd">
        <use
          fill="#000"
          filter="url(#ic-collapse_svg__a)"
          xlinkHref="#ic-collapse_svg__b"
        />
        <use
          fill="#000"
          filter="url(#ic-collapse_svg__c)"
          xlinkHref="#ic-collapse_svg__d"
        />
        <use fill="#FFF" xlinkHref="#ic-collapse_svg__d" />
        <rect
          width={12}
          height={12}
          x={8}
          y={12}
          stroke="#6F7283"
          strokeWidth={2}
          rx={3}
        />
        <rect width={14} height={14} x={11} y={7} fill="#6F7283" rx={2} />
        <path
          fill="#FAFAFA"
          fillRule="nonzero"
          d="M21 10a1 1 0 01.993.883L22 11v5a1 1 0 01-1.993.117L20 16v-2.586l-4.293 4.293a1 1 0 01-1.497-1.32l.083-.094L18.584 12H16a1 1 0 01-.993-.883L15 11a1 1 0 01.883-.993L16 10h5z"
        />
      </g>
    </svg>
  );
}

export default SvgIcCollapse;
