// Small original inline-SVG icon set. Kept as plain functions (not a UI
// library) so there's no external icon-font/package dependency — each icon
// takes a `size` and `color` and renders a single-color line icon.

const base = (size, color, children) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// Shield with a check — Super Admin (oversight / authority)
export const IconShield = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ));

// Badge/star — Traffic Police (duty, service)
export const IconBadge = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.2 13.5L7 21l5-2.5 5 2.5-1.2-7.5" />
    </>
  ));

// Car front — User / citizen (their vehicle)
export const IconCar = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <path d="M4 16l1.2-5A2 2 0 017.1 9.5h9.8A2 2 0 0119 11l1.2 5" />
      <rect x="3" y="16" width="18" height="4" rx="1.2" />
      <circle cx="7.5" cy="20" r="1.2" />
      <circle cx="16.5" cy="20" r="1.2" />
    </>
  ));

// Document/ticket — citation
export const IconTicket = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v1a2 2 0 000 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1a2 2 0 000-4V8z" />
      <path d="M9 6v12" strokeDasharray="2 2" />
    </>
  ));

// Coin/rupee — money / fines
export const IconCoin = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9h3.2a1.8 1.8 0 010 3.6H9.5m0-3.6v7.2m0-3.6h3.5M9.5 9V7" />
    </>
  ));

// Users group — staff/user management
export const IconUsers = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M15.5 14.2c2.4.4 4.5 2.5 4.5 5.8" />
    </>
  ));

// Warning triangle — violations/danger
export const IconWarning = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill={color} stroke="none" />
    </>
  ));

// Gavel — disputes/appeals
export const IconGavel = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <path d="M14 4l6 6" />
      <path d="M10.5 7.5l6 6" />
      <path d="M3 21l7-7" />
      <path d="M6.5 10.5l-3 3 4 4 3-3" />
    </>
  ));

// Clipboard-check — approvals/monitoring
export const IconClipboard = ({ size = 20, color = 'currentColor' }) =>
  base(size, color, (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4a1.5 1.5 0 003 0h1a1.5 1.5 0 003 0" transform="translate(0 -1.5)" />
      <path d="M9 12l2 2 4-4" />
    </>
  ));
