import type { SVGProps } from "react";

type EyeIconProps = SVGProps<SVGSVGElement> & {
  hidden?: boolean;
};

function EyeIcon({ hidden = false, ...props }: EyeIconProps) {
  return hidden ? (
    <svg
      {...props}
      aria-hidden={props["aria-hidden"] ?? true}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="m4 4 16 16M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.2 6.3C4.8 7.4 3.7 8.8 3 10.7c1.4 3.5 4.8 5.8 9 5.8 1.1 0 2.2-.2 3.2-.6M9.9 5.2c.7-.2 1.4-.3 2.1-.3 4.2 0 7.6 2.3 9 5.8-.5 1.3-1.2 2.4-2.1 3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg
      {...props}
      aria-hidden={props["aria-hidden"] ?? true}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M3 10.7c1.4-3.5 4.8-5.8 9-5.8s7.6 2.3 9 5.8c-1.4 3.5-4.8 5.8-9 5.8s-7.6-2.3-9-5.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="10.7" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default EyeIcon;
