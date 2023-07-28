function SvgIcStarbucks(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 100 100"
      {...props}
    >
      <defs>
        <linearGradient
          id="ic-starbucks_svg__a"
          x1="50%"
          x2="50%"
          y1="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#3D8BE8" />
          <stop offset="100%" stopColor="#89BEEC" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ic-starbucks_svg__a)"
        d="M66 21a1 1 0 011 1v3h3a1 1 0 01.993.883L71 26v6a1 1 0 01-1 1h-2.088l-3.75 41.272a3.003 3.003 0 01-2.81 2.723l-.178.005H38.826a3 3 0 01-2.987-2.728L32.087 33H30a1 1 0 01-.993-.883L29 32v-6a1 1 0 011-1h3v-3a1 1 0 01.883-.993L34 21zm-.095 12H34.094l3.737 41.09a.999.999 0 00.878.903l.117.007h22.348a.998.998 0 00.995-.91L65.905 33zM69 27H31v4h38v-4zm-4-4H35v2h30v-2zM35 59h30v2H35v-2zm-1-14h31v2H34v-2zm1 6h30v4H35v-4z"
      />
    </svg>
  );
}

export default SvgIcStarbucks;
