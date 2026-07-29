import type { SVGProps } from "react";

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      aria-hidden={props["aria-hidden"] ?? true}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M4 6.75h16v10.5H4V6.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4.7 7.5 7.3 5.35 7.3-5.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default MailIcon;
