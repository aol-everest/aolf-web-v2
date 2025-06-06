function SvgIcMap(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 25"
      {...props}
    >
      <defs>
        <linearGradient id="ic-map_svg__a" x1="50%" x2="50%" y1="100%" y2="0%">
          <stop offset="0%" stopColor="#3D8BE8" />
          <stop offset="100%" stopColor="#89BEEC" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ic-map_svg__a)"
        d="M12 0c5.523 0 10 4.414 10 9.858 0 3.32-2.63 7.618-7.84 13.028l-.746.763-.147.131a2.02 2.02 0 01-2.702-.152l-.358-.365C4.754 17.676 2 13.256 2 9.858 2 4.414 6.477 0 12 0zm0 1.972c-4.418 0-8 3.53-8 7.886 0 2.733 2.53 6.794 7.646 12.036l.353.36.346-.35c5.007-5.13 7.541-9.128 7.651-11.862L20 9.858c0-4.356-3.582-7.886-8-7.886zm0 3.943c2.21 0 4 1.765 4 3.943S14.21 13.8 12 13.8s-4-1.765-4-3.943 1.79-3.943 4-3.943zm0 1.971c-1.105 0-2 .883-2 1.972s.895 1.971 2 1.971 2-.882 2-1.971-.895-1.972-2-1.972z"
        transform="translate(0 .28)"
      />
    </svg>
  );
}

export default SvgIcMap;
