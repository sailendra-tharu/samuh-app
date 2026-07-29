import type { SVGProps } from "react";

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      aria-hidden={props["aria-hidden"] ?? true}
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect x="5.5" y="10" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 10V7.75a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default LockIcon;
