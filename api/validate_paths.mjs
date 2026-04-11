import fs from 'fs';

const r2Files = new Set(JSON.parse(fs.readFileSync('r2_files.json', 'utf8')));
const content = fs.readFileSync('../app/src/data/exerciseData.js', 'utf8');

const gifRegex = /gif: '([^']+)'/g;
let match;
let invalid = [];
let total = 0;

while ((match = gifRegex.exec(content)) !== null) {
    const path = match[1];
    total++;
    if (!r2Files.has(path)) {
        invalid.push(path);
    }
}

console.log(`Validation Results:`);
console.log(`Total GIF paths checked: ${total}`);
console.log(`Total invalid paths found: ${invalid.length}`);

if (invalid.length > 0) {
    console.log(`\nInvalid paths:`);
    invalid.forEach(p => console.log(`- ${p}`));
} else {
    console.log(`\n✅ All GIF paths are valid!`);
}
