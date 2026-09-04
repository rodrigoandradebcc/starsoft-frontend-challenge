import type { SVGProps } from 'react';
export function BagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 33 33"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.2937 29.5627H21.772C25.9881 29.5627 29.2227 28.0397 28.304 21.9105L27.2342 13.6038C26.6678 10.5455 24.7171 9.375 23.0053 9.375H9.00993C7.27309 9.375 5.43557 10.6336 4.78109 13.6038L3.7113 21.9105C2.93099 27.3476 6.07744 29.5627 10.2937 29.5627Z"
      />
      <path d="M10.1047 9.07289C10.1047 5.79204 12.7644 3.13238 16.0452 3.13238C17.6251 3.12568 19.1425 3.7486 20.2621 4.86339C21.3816 5.97817 22.0109 7.493 22.0109 9.07289" />
      <path d="M11.9675 15.2651H12.0305" />
      <path d="M19.9846 15.2651H20.0476" />
    </svg>
  );
}
export function EthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="12" fill="#627EEA" />
      <path fill="#fff" d="m12 3-5 9 5 3 5-3-5-9Zm0 13-5-3 5 8 5-8-5 3Z" />
    </svg>
  );
}
export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      {...props}
    >
      <path d="m15 5-7 7 7 7M8 12h11" />
    </svg>
  );
}
export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5" />
    </svg>
  );
}
