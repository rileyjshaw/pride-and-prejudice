// Usage: node deconstruct.js ./pride-and-prejudice.txt [outfile]
const fs = require('fs');
const inFile = process.argv[2];
const outFile = process.argv[3] || 'deconstructed.json';
const source = fs.readFileSync(inFile, 'utf8');
const counts = source.split('').reduce((counts, char) => ({
  ...counts,
  [char]: (counts[char] || 0) + 1,
}), {});

// Replace / remove certain characters.
counts['&nbsp;'] = counts[' '];
delete counts[' '];
delete counts['\n'];

fs.writeFile(outFile, JSON.stringify(counts), 'utf8');
