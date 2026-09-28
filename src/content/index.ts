import content from './content';

// Everything the components read. The data comes from ./content.ts (private, not in git);
// the shapes are in ./types.ts.
export * from './types';
export const SITE_URL = content.siteUrl;
export const { profile, projects, experience } = content;
