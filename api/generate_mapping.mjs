import fs from 'fs';

// Load R2 files
const r2Files = JSON.parse(fs.readFileSync('r2_files.json', 'utf8'));

// Normalization function
const normalize = (name) => {
    return name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric
};

// Map R2 files by simplified name
const r2Map = {};
r2Files.forEach(path => {
    const filename = path.split('/').pop();
    // Remove timestamp prefix (13 digits + underscore)
    const cleanName = filename.replace(/^\d{13}_/, '');
    const normalized = normalize(cleanName);
    if (!r2Map[normalized]) r2Map[normalized] = [];
    r2Map[normalized].push(path);
});

// Load current exercise data
const content = fs.readFileSync('../app/src/data/exerciseData.js', 'utf8');

// Find all gif: '...' lines
const gifRegex = /gif: '([^']+)'/g;
let match;
const results = [];

while ((match = gifRegex.exec(content)) !== null) {
    const legacyPath = match[1];
    if (legacyPath.startsWith('exercises/176')) {
        continue; // Already correct
    }

    const legacyFilename = legacyPath.split('/').pop();
    const normalizedLegacy = normalize(legacyFilename);
    const possibleMatches = r2Map[normalizedLegacy] || [];

    results.push({
        legacyPath,
        legacyFilename,
        normalizedLegacy,
        match: possibleMatches.length > 0 ? possibleMatches[0] : null,
        allMatches: possibleMatches
    });
}

// Generate Markdown Table
let table = "| Legacy Path | Correct R2 Path | Status |\n|---|---|---|\n";
results.forEach(res => {
    const status = res.match ? "✅ Found" : "❌ Not Found";
    table += `| ${res.legacyPath} | ${res.match || '---'} | ${status} |\n`;
});

fs.writeFileSync('gif_mapping_report.md', table);
console.log("Mapping report generated at gif_mapping_report.md");
console.log(`Total legacy paths found: ${results.length}`);
console.log(`Total matches found: ${results.filter(r => r.match).length}`);
