import type { SVGProps } from "react";

function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      aria-hidden={props["aria-hidden"] ?? true}
      viewBox="0 0 86 86"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="43" cy="43" r="37.5" stroke="#00B86B" strokeWidth="4" />
      <circle cx="43" cy="43" r="31.5" stroke="#087B4B" strokeWidth="3.2" />
      <path
        d="M43 73.5V18.5M43 42.5C34.8 39.1 29.6 32.4 30.2 23.7C38.2 25 43.7 32 43 42.5Z"
        stroke="#00B86B"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M43 42.5C51.2 39.1 56.4 32.4 55.8 23.7C47.8 25 42.3 32 43 42.5ZM42.8 56.3C34.3 57.6 27.5 53.2 24.6 45.6C32.5 44.4 39.1 48 42.8 56.3ZM43.2 56.3C51.7 57.6 58.5 53.2 61.4 45.6C53.5 44.4 46.9 48 43.2 56.3Z"
        stroke="#087B4B"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default LogoMark;
