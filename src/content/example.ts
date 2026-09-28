import type { Content } from './types';

// Placeholder content, committed to the repo so a fresh clone builds and runs.
// Your real content goes in src/content/index.ts (not committed). To start one from this file:
//   npm run setup-content
// then replace `export { default } from './example'` in index.ts with your own object.

const content: Content = {
  siteUrl: 'https://example.com',

  profile: {
    name: 'Alex',
    title: 'Software Engineer',
    intro: [
      'A short line about what you do.',
      'A sentence or two about your most recent role and what you built there.',
      'Something you made on the side.',
    ],
    links: [
      { icon: 'about', label: 'learn a little bit about me', url: '/resume.pdf' },
      { icon: 'linkedin', label: 'linkedin.com/in/your-handle', url: 'https://www.linkedin.com/' },
      { icon: 'github', label: 'github.com/your-handle', url: 'https://github.com/' },
      { icon: 'x', label: 'x.com/your-handle', url: 'https://x.com/' },
    ],
    fullName: 'Alex Example',
    madeIn: 'Made somewhere nice',
    funLine: 'A fun fact about you',
    footerLinks: ['linkedin', 'github', 'x'],
  },

  projects: [
    {
      slug: 'sample-app',
      name: 'Sample App',
      summary: 'One line about the app.',
      year: '2026',
      type: 'app',
      description: 'Two or three sentences on what it does and the part you are proudest of.',
      role: 'Design and development',
      stack: ['React Native', 'Expo'],
      links: [{ icon: 'github', label: 'View source', url: 'https://github.com/' }],
    },
    {
      slug: 'sample-site',
      name: 'Sample Site',
      summary: 'One line about the website.',
      year: '2025',
      type: 'web',
      description: 'Two or three sentences on what it does and the part you are proudest of.',
      stack: ['React', 'TypeScript'],
      links: [{ icon: 'web', label: 'Visit site', url: 'https://example.com' }],
    },
  ],

  experience: [
    {
      company: 'Company',
      title: 'Software Engineer',
      years: '2023 – now',
      dates: 'Jan 2023 – Present',
      place: 'Remote',
      stack: ['TypeScript', 'React'],
      points: ['What you built.', 'What changed because of it.'],
    },
  ],
};

export default content;
