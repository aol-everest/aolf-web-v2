function SvgIcDinner(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 101 100"
      {...props}
    >
      <defs>
        <linearGradient
          id="ic-dinner_svg__a"
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
        fill="url(#ic-dinner_svg__a)"
        d="M50 19c17.12 0 31 13.88 31 31 0 17.12-13.88 31-31 31-17.12 0-31-13.88-31-31 0-17.12 13.88-31 31-31zm0 2c-16.016 0-29 12.984-29 29s12.984 29 29 29 29-12.984 29-29-12.984-29-29-29zm0 2c14.912 0 27 12.088 27 27S64.912 77 50 77 23 64.912 23 50s12.088-27 27-27zm0 2c-13.807 0-25 11.193-25 25s11.193 25 25 25 25-11.193 25-25-11.193-25-25-25zm-1.5 10a1 1 0 01.993.883L49.5 36v6.5a5.503 5.503 0 01-4.5 5.41V64a1 1 0 01-2 0V47.91a5.504 5.504 0 01-4.496-5.189L38.5 42.5V36a1 1 0 011.993-.117L40.5 36v6.5a3.5 3.5 0 002.5 3.355V36a1 1 0 012 0v9.855a3.502 3.502 0 002.495-3.163l.005-.192V36a1 1 0 011-1zM60 35h.028l.076.005L60 35c.05 0 .1.004.148.01l.068.013.048.012.051.016a.5.5 0 01.05.018c.02.007.038.015.056.024l.045.022.042.024c.02.01.038.023.056.035l.035.025.042.033.042.038.042.041.029.032c.013.014.025.03.037.045.01.012.018.024.027.037l.035.053.031.055.017.033c.029.06.052.122.068.188l.003.012-.003-.012A.904.904 0 0161 36v28a1 1 0 01-2 0v-9.001L56 55a1 1 0 01-.993-.883L55 54V40a5.006 5.006 0 014.776-4.995l.2-.005H60zm-1 2.17l-.152.059A3 3 0 0057 40v13h2V37.17zM60 36v18h-4V40c0-2.21 1.79-4 4-4z"
      />
    </svg>
  );
}

export default SvgIcDinner;
