interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  fill?: boolean;
}

export type IconName =
  | "map"
  | "grid"
  | "camera"
  | "bulb"
  | "home"
  | "pin"
  | "boot"
  | "route"
  | "search"
  | "heart"
  | "share"
  | "trash"
  | "close"
  | "flip"
  | "image"
  | "record"
  | "check"
  | "sort"
  | "plus"
  | "chevron"
  | "sparkles"
  | "locate";

// Clean line icons drawn on a 24x24 grid, using currentColor.
const PATHS: Record<IconName, JSX.Element> = {
  map: (
    <>
      <path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4Z" />
      <path d="M9 4v13M15 7v13" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a2 2 0 0 0 1.7-1l.5-.8A2 2 0 0 1 10.6 3h2.8a2 2 0 0 1 1.7 1l.5.8a2 2 0 0 0 1.7 1h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-8Z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8.9.9 1.5l.1.7h5.2l.1-.7c.1-.6.4-1.1.9-1.5A6 6 0 0 0 12 3Z" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4-4.5 6.5-8 6.5-11a6.5 6.5 0 1 0-13 0c0 3 2.5 6.5 6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  boot: (
    <>
      <path d="M7 3h3v9l6 3.5c1.5.9 2.5 1.7 2.5 3.5H7c-1.5 0-2.5-1-2.5-2.5V3H7Z" />
      <path d="M4.5 16.5h13" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.4 6H14a3.5 3.5 0 0 1 0 7H9a3.5 3.5 0 0 0 0 7h6.6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.3-9.2-8.4C1.2 8.3 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 4.8 3.3 3.2 6.6C19 15.7 12 20 12 20Z" />
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6 7v12.5A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  flip: (
    <>
      <path d="M4 8a8 8 0 0 1 13.3-3.3L20 7" />
      <path d="M20 16A8 8 0 0 1 6.7 19.3L4 17" />
      <path d="M20 3v4h-4M4 21v-4h4" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21" />
    </>
  ),
  record: <circle cx="12" cy="12" r="6" />,
  check: <path d="M5 12.5 10 17.5 19 7" />,
  sort: (
    <>
      <path d="M7 4v16M7 20l-3-3M7 4l3 3" />
      <path d="M17 20V4M17 4l3 3M17 20l-3-3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  sparkles: (
    <>
      <path d="M12 3.5 13.7 9l5.3 1.7L13.7 12.4 12 18l-1.7-5.6L5 10.7 10.3 9 12 3.5Z" />
      <path d="M18.5 15.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
    </>
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
};

const FILLED = new Set<IconName>(["record"]);

export default function Icon({
  name,
  size = 24,
  className,
  strokeWidth = 1.9,
  fill,
}: IconProps) {
  const filled = fill ?? FILLED.has(name);
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
