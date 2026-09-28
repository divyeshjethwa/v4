// Runs after `npm install`. The real site content (src/content/content.ts) is kept out of git,
// so on a fresh clone this creates it pointing at the placeholder content in example.ts.
// It never touches an existing content.ts.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'content', 'content.ts');

if (fs.existsSync(file)) {
  console.log('setup-content: src/content/content.ts already exists, leaving it alone.');
} else {
  fs.writeFileSync(
    file,
    [
      '// Your site content. Not committed to git.',
      '// Replace this line with your own object (copy example.ts for the shape).',
      "export { default } from './example';",
      '',
    ].join('\n'),
  );
  console.log('setup-content: created src/content/content.ts from the example content.');
}
