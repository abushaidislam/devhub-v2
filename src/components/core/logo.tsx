import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="DevHub home">
      <svg className="logo-mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="devhub-mark-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#d4d4d4" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="18" height="18" rx="5" fill="url(#devhub-mark-bg)" />
        <path d="M6.2 4.25h4.05c3.3 0 5.55 2.28 5.55 5.75 0 3.47-2.25 5.75-5.55 5.75H6.2V4.25Zm2.15 2.1v7.3h1.9c2.18 0 3.48-1.2 3.48-3.65 0-2.46-1.3-3.65-3.48-3.65h-1.9Z" fill="#090909" />
        <circle cx="15.25" cy="14.25" r="1.1" fill="#090909" />
      </svg>
      <span>DevHub</span>
    </Link>
  );
}
