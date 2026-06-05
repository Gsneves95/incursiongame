// Shared SVG icon set (line style, editorial). Ported from the prototype's
// icons.jsx — 16x16 viewBox, stroke based, currentColor.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base: P = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" };
const fill: P = { viewBox: "0 0 16 16", fill: "currentColor" };

export const Icon = {
  Home: (p: P) => (<svg {...base} {...p}><path d="M2.5 7 8 2.5 13.5 7v6a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V7Z" /><path d="M6 13.5V9.5h4v4" /></svg>),
  Survey: (p: P) => (<svg {...base} {...p}><rect x="3" y="2" width="10" height="12" rx="1.5" /><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" /></svg>),
  Test: (p: P) => (<svg {...base} {...p}><rect x="2" y="3" width="12" height="8" rx="1" /><path d="M5.5 13.5h5M8 11v2.5" /><circle cx="8" cy="7" r="1.5" /></svg>),
  Insight: (p: P) => (<svg {...base} {...p}><path d="M8 1.5a4.5 4.5 0 0 0-3 7.85V11h6V9.35A4.5 4.5 0 0 0 8 1.5Z" /><path d="M6 13h4M6.5 14.5h3" /></svg>),
  Library: (p: P) => (<svg {...base} {...p}><path d="M3 2.5h2.5v11H3zM5.5 2.5H8v11H5.5zM9 4l2.4-.65 2.6 9.7L11.6 13.6Z" /></svg>),
  People: (p: P) => (<svg {...base} {...p}><circle cx="6" cy="6" r="2.5" /><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" /><circle cx="11.5" cy="5.5" r="1.8" /><path d="M10.5 9.2c2 .2 3.5 1.9 3.5 3.8" /></svg>),
  Settings: (p: P) => (<svg {...base} {...p}><circle cx="8" cy="8" r="2" /><path d="M13 8a5 5 0 0 0-.1-1l1.4-1-1.4-2.4-1.7.6a5 5 0 0 0-1.7-1L9.2 1.5H6.8L6.5 3.2a5 5 0 0 0-1.7 1l-1.7-.6L1.7 6l1.4 1A5 5 0 0 0 3 8c0 .3 0 .7.1 1l-1.4 1L3.1 12.4l1.7-.6a5 5 0 0 0 1.7 1l.3 1.7h2.4l.3-1.7a5 5 0 0 0 1.7-1l1.7.6 1.4-2.4-1.4-1c.1-.3.1-.7.1-1Z" /></svg>),
  Plus: (p: P) => (<svg {...base} strokeWidth={1.6} {...p}><path d="M8 3v10M3 8h10" /></svg>),
  Search: (p: P) => (<svg {...base} {...p}><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>),
  Bell: (p: P) => (<svg {...base} {...p}><path d="M4 12h8l-1.2-1.4V7a2.8 2.8 0 1 0-5.6 0v3.6L4 12Z" /><path d="M6.5 13.5c.2.6.8 1 1.5 1s1.3-.4 1.5-1" /></svg>),
  Chevron: (p: P) => (<svg {...base} {...p}><path d="m6 4 4 4-4 4" /></svg>),
  ChevronDown: (p: P) => (<svg {...base} {...p}><path d="m4 6 4 4 4-4" /></svg>),
  Arrow: (p: P) => (<svg {...base} {...p}><path d="M3 8h10M9 4l4 4-4 4" /></svg>),
  Copy: (p: P) => (<svg {...base} {...p}><rect x="5" y="5" width="8" height="9" rx="1" /><path d="M11 5V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h1" /></svg>),
  Link: (p: P) => (<svg {...base} {...p}><path d="M9.5 6.5a3 3 0 0 1 0 4.2l-2 2a3 3 0 0 1-4.2-4.2l1-1" /><path d="M6.5 9.5a3 3 0 0 1 0-4.2l2-2a3 3 0 0 1 4.2 4.2l-1 1" /></svg>),
  Sparkle: (p: P) => (<svg {...base} {...p}><path d="m8 2 1.3 3.7L13 7l-3.7 1.3L8 12l-1.3-3.7L3 7l3.7-1.3L8 2Z" /><path d="M13 11.5 13.6 13l1.5.5-1.5.5L13 15.5 12.5 14l-1.5-.5 1.5-.5L13 11.5Z" /></svg>),
  Play: (p: P) => (<svg {...fill} {...p}><path d="M5 3.5v9l8-4.5-8-4.5Z" /></svg>),
  Pause: (p: P) => (<svg {...fill} {...p}><path d="M5 3h2v10H5zM9 3h2v10H9z" /></svg>),
  Record: (p: P) => (<svg {...fill} {...p}><circle cx="8" cy="8" r="4" /></svg>),
  Globe: (p: P) => (<svg {...base} {...p}><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c1.8 2 2.8 4 2.8 6S9.8 12 8 14M8 2c-1.8 2-2.8 4-2.8 6S6.2 12 8 14" /></svg>),
  Drag: (p: P) => (<svg {...fill} {...p}><circle cx="6" cy="4" r="1" /><circle cx="10" cy="4" r="1" /><circle cx="6" cy="8" r="1" /><circle cx="10" cy="8" r="1" /><circle cx="6" cy="12" r="1" /><circle cx="10" cy="12" r="1" /></svg>),
  Check: (p: P) => (<svg {...base} strokeWidth={1.6} {...p}><path d="m3 8 3.5 3.5L13 4.5" /></svg>),
  Trash: (p: P) => (<svg {...base} {...p}><path d="M3 4.5h10M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 4.5l.5 8a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1l.5-8" /></svg>),
  Mail: (p: P) => (<svg {...base} {...p}><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="m2.5 4.5 5.5 4 5.5-4" /></svg>),
  Lock: (p: P) => (<svg {...base} {...p}><rect x="3.5" y="7" width="9" height="6.5" rx="1.5" /><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" /><path d="M8 9.5v1.5" /></svg>),
  Shield: (p: P) => (<svg {...base} {...p}><path d="M8 1.8 13 3.5v4c0 3.2-2.1 5.6-5 6.7-2.9-1.1-5-3.5-5-6.7v-4L8 1.8Z" /><path d="m6 7.7 1.5 1.5L10.5 6" /></svg>),
  EyeOff: (p: P) => (<svg {...base} {...p}><path d="M6.4 4A6 6 0 0 1 8 3.5c4 0 6.5 4.5 6.5 4.5a11 11 0 0 1-1.7 2.2M3.2 5.3A11 11 0 0 0 1.5 8s2.5 4.5 6.5 4.5c.9 0 1.7-.2 2.4-.5" /><path d="M6.6 6.6a2 2 0 0 0 2.8 2.8" /><path d="m2.5 2.5 11 11" /></svg>),
  Monitor: (p: P) => (<svg {...base} {...p}><rect x="2" y="2.5" width="12" height="8" rx="1" /><path d="M6 13.5h4M8 10.5v3" /></svg>),
  Phone: (p: P) => (<svg {...base} {...p}><rect x="4.5" y="1.5" width="7" height="13" rx="1.5" /><path d="M7 12.5h2" /></svg>),
  MapPin: (p: P) => (<svg {...base} {...p}><path d="M8 14.5s4.5-3.8 4.5-7.5a4.5 4.5 0 0 0-9 0c0 3.7 4.5 7.5 4.5 7.5Z" /><circle cx="8" cy="7" r="1.6" /></svg>),
  LogOut: (p: P) => (<svg {...base} {...p}><path d="M10 2.5H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6" /><path d="M11 5.5 13.5 8 11 10.5M6 8h7.5" /></svg>),
  Building: (p: P) => (<svg {...base} {...p}><rect x="3" y="2" width="10" height="12" rx="1" /><path d="M6 5h1M9 5h1M6 8h1M9 8h1M6.5 14v-2.5h3V14" /></svg>),
  ArrowLeft: (p: P) => (<svg {...base} {...p}><path d="M13 8H3M7 4 3 8l4 4" /></svg>),
  Key: (p: P) => (<svg {...base} {...p}><circle cx="5.5" cy="5.5" r="3" /><path d="m7.6 7.6 4.4 4.4M10 10l1.5-1.5M11.5 11.5 13 10" /></svg>),
  X: (p: P) => (<svg {...base} strokeWidth={1.5} {...p}><path d="m4 4 8 8M12 4l-8 8" /></svg>),
  Figma: (p: P) => (<svg {...fill} {...p}><path d="M8 1H5.3a2 2 0 0 0 0 4H8V1Z" opacity=".9" /><path d="M8 5H5.3a2 2 0 0 0 0 4H8V5Z" opacity=".7" /><path d="M8 9H5.3a2 2 0 1 0 0 4 2 2 0 0 0 2-2V9Z" opacity=".55" /><path d="M8 1h2.7a2 2 0 0 1 0 4H8V1Z" opacity=".85" /><circle cx="10.7" cy="7" r="2" opacity=".6" /></svg>),
  BarChart: (p: P) => (<svg {...base} strokeWidth={1.6} {...p}><path d="M3 13V8M7 13V4M11 13V10M13.5 13H2.5" /></svg>),
  Filter: (p: P) => (<svg {...base} {...p}><path d="M2.5 3.5h11l-4 5v4l-3 1.5v-5.5l-4-5Z" /></svg>),
  Eye: (p: P) => (<svg {...base} {...p}><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" /><circle cx="8" cy="8" r="2" /></svg>),
  Clock: (p: P) => (<svg {...base} {...p}><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" /></svg>),
  Target: (p: P) => (<svg {...base} {...p}><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="3" /><circle cx="8" cy="8" r="1" fill="currentColor" /></svg>),
  Lightbulb: (p: P) => (<svg {...base} {...p}><path d="M6 11.5h4M6.5 13.5h3M5.5 9.5A4 4 0 1 1 10.5 9.5L10 11h-4L5.5 9.5Z" /></svg>),
  Alert: (p: P) => (<svg {...base} {...p}><path d="M8 2 14 13H2L8 2ZM8 6.5v3.5M8 11.5v.5" /></svg>),
  Trend: (p: P) => (<svg {...base} {...p}><path d="M2 11 6 7l3 3 5-5M10 5h4v4" /></svg>),
  Quote: (p: P) => (<svg {...fill} {...p}><path d="M3 5h3.5v3.5C6.5 10.5 5 11.5 3 12v-1.5c1 0 1.5-.5 1.5-1.5H3V5ZM9 5h3.5v3.5C12.5 10.5 11 11.5 9 12v-1.5c1 0 1.5-.5 1.5-1.5H9V5Z" /></svg>),
  Heart: (p: P) => (<svg {...base} {...p}><path d="M8 13s-5-3-5-7a2.5 2.5 0 0 1 5-1 2.5 2.5 0 0 1 5 1c0 4-5 7-5 7Z" /></svg>),
  Flow: (p: P) => (<svg {...base} {...p}><circle cx="3" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" /><circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="13" r="1.5" /><path d="M4.5 8h7M8 4.5v7" /></svg>),
  Sun: (p: P) => (<svg {...base} {...p}><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.7M8 12.8v1.7M14.5 8h-1.7M3.2 8H1.5M12.6 3.4l-1.2 1.2M4.6 11.4l-1.2 1.2M12.6 12.6l-1.2-1.2M4.6 4.6 3.4 3.4" /></svg>),
  Moon: (p: P) => (<svg {...base} {...p}><path d="M13.5 9.5A5.5 5.5 0 1 1 6.5 2.5a4.5 4.5 0 0 0 7 7Z" /></svg>),
};

export type IconName = keyof typeof Icon;
