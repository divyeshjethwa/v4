import type { ImageSourcePropType } from 'react-native';

// The shape of the site's content. The content itself lives in src/content/index.ts, which is
// kept out of git (see .gitignore). A fresh clone gets example.ts instead: see scripts/setup-content.js.

export type LinkIcon = 'about' | 'linkedin' | 'github' | 'x' | 'web' | 'appstore' | 'playstore';

export type ProfileLink = {
  icon: LinkIcon;
  label: string;
  url: string;
};

export type Profile = {
  name: string; // "Hi, I'm {name}"
  title: string; // the line under the name
  intro: string[]; // short paragraphs under the name
  links: ProfileLink[]; // the link list under the intro
  fullName: string; // the big faded name in the footer
  madeIn: string; // footer, small line top left
  funLine: string; // footer, small line top right ('' to hide)
  footerLinks: LinkIcon[]; // which of `links` appear in the footer row
};

// type 'app' → screenshots are shown inside a phone frame (portrait phone screens).
// type 'web' → screenshots are shown inside a browser-window frame (desktop captures).
export type Project = {
  slug: string;
  name: string;
  summary: string; // one line, shown in the collapsed row
  year: string;
  type: 'app' | 'web';
  description: string; // shown when the row is opened
  role?: string;
  stack: string[];
  links: ProfileLink[];
  screens?: ImageSourcePropType[]; // leave out for numbered placeholder screens
  screenAspect?: number; // width / height of the screenshots (defaults below)
  statusBar?: string; // apps only: colour of the strip drawn above screenshots that have no status bar
};

export type Role = {
  company: string;
  title: string;
  years: string; // shown in the left column
  dates: string; // full dates, shown when the role is opened
  place: string;
  stack: string[]; // the faint line under each role
  points: string[];
};

export type Content = {
  siteUrl: string; // the live site; the native app uses it to open links like /resume.pdf
  profile: Profile;
  projects: Project[];
  experience: Role[];
};

export const DEFAULT_ASPECT = { app: 1179 / 2556, web: 1440 / 900 };
