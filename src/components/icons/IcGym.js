function SvgIcGym(props) {
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
          id="ic-gym_svg__a"
          x1="19.333%"
          x2="87.471%"
          y1="76.695%"
          y2="27.778%"
        >
          <stop offset="0%" stopColor="#3D8BE8" />
          <stop offset="100%" stopColor="#89BEEC" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ic-gym_svg__a)"
        fillRule="evenodd"
        d="M33.945 29.867a1 1 0 011 1l-.001 16.545h30V30.867a1 1 0 01.884-.993l.117-.007h6a1 1 0 011 1l-.001 3h3a1 1 0 01.994.883l.007.117-.001 12.545 1.189.001a2 2 0 110 4l-1.189-.001v13.455a.998.998 0 01-.882.993l-.117.007h-3.001v3a.998.998 0 01-.882.993l-.117.007h-6a1 1 0 01-1-1l-.001-17.455h-30v17.455a.998.998 0 01-.882.993l-.117.007h-6a1 1 0 01-1-1l-.001-3h-3a.999.999 0 01-.992-.883l-.007-.117-.001-13.455-.811.001a2 2 0 110-4l.811-.001V34.867a1 1 0 01.884-.993l.117-.007h2.999v-3a1 1 0 01.884-.993l.117-.007zm-1 2h-4v36h4v-36zm38 0h-4v36h4v-36zm-44 4h-2v28h2v-28zm48 0h-2v28h2v-28z"
        transform="rotate(-45 50.133 49.867)"
      />
    </svg>
  );
}

export default SvgIcGym;
