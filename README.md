# v4 (Expo / React Native portfolio)

A minimal, project-first portfolio built with Expo and Expo Router, exported as a static website
and also runnable as an iOS/Android app. Light/dark toggle, projects in phone or browser frames,
an experience timeline and a footer.

## Run it

```bash
npm install          # also creates src/content/content.ts from the example if it's missing
npm run web          # dev server in the browser
npx expo start       # dev server for Expo Go / simulators
npm run build:web    # static export into dist/
```

## Content (kept out of git)

Every word, link and screenshot on the site lives in `src/content/content.ts` and
`src/content/assets/`. Both are in `.gitignore`, along with `public/resume.pdf`, so the repo holds
only code.

| File | What it is | In git? |
| --- | --- | --- |
| `src/content/content.ts` | Your real content: profile, projects, experience | No |
| `src/content/assets/` | Project screenshots, required from content.ts | No |
| `src/content/example.ts` | Placeholder content with the same shape | Yes |
| `src/content/types.ts` | The shape of the content | Yes |
| `src/content/index.ts` | What the components import | Yes |

On a fresh clone, `npm install` runs `scripts/setup-content.js`, which creates a `content.ts` that
points at the example, so the project builds straight away. It never overwrites an existing file.
Keep a backup of your real `content.ts` and `assets/` folder somewhere other than the repo.

## Where the code lives

| File | What it does |
| --- | --- |
| `src/app/index.tsx` | The page: hero, projects, experience, footer |
| `src/app/+html.tsx` | Web-only HTML shell; sets light/dark before first paint |
| `src/theme.tsx` | Colours, the theme toggle logic, and the native circular reveal |
| `src/reveal.web.ts` | The web circular reveal (View Transitions) |
| `src/components/` | ThemeToggle, LinkList, ProjectList, ScreenPager, DeviceFrame, ExperienceList, Footer |
| `src/motion.ts` | Shared hover/press animation helpers |
| `src/scale.ts` | The hero's 1.3x scale (CSS zoom on the web) |

## Deploying to the VPS

`npm run build:web` produces `dist/`, a folder of static files that already includes your content.
Build on your Mac (where `content.ts` exists), copy `dist/` to the server, and point an Nginx
`server` block's `root` at it with `try_files $uri $uri.html $uri/ =404;`.
If you build on the server from a git clone instead, copy `src/content/content.ts` and
`src/content/assets/` there first, or it will build the example content.
