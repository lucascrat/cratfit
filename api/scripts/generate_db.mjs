import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allGifsPath = path.resolve(__dirname, '../all_gifs.json');
const outputPath = path.resolve(__dirname, '../../app/src/data/exerciseDatabase_new.js');

// Map directory names to muscle group IDs used in the app
const categoryMap = {
    'Peitoral': 'peitoral',
    'Abdominal': 'abdomen',
    'Biceps': 'biceps',
    'Cardio': 'cardio',
    'Costas': 'costas',
    'Ombros': 'ombros',
    'Triceps': 'triceps',
    'Pernas': 'pernas',
    'gluteos': 'gluteos',
    'ALONGAMENTOS E MOBILIDADE': 'alongamentos',
    'Eretores da espinha': 'eretores',
    'Membros Inferiores (53)': 'membros_inf',
    'Panturrilhas': 'panturrilhas',
    'Trapezio': 'trapezio',
    'antebraco': 'antebraco'
};

function generateId(filename) {
    return filename
        .toLowerCase()
        .replace(/\.gif$/, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function cleanName(filename) {
    return filename
        .replace(/\.gif$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function main() {
    if (!fs.existsSync(allGifsPath)) {
        console.error("all_gifs.json not found. Run migration first.");
        return;
    }

    const allGifs = JSON.parse(fs.readFileSync(allGifsPath, 'utf8'));
    const database = {};

    allGifs.forEach(gifPath => {
        const parts = gifPath.split('/');
        if (parts.length < 2) return;

        const dirName = parts[0];
        const fileName = parts[1];
        const categoryId = categoryMap[dirName] || dirName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

        if (!database[categoryId]) database[categoryId] = [];

        database[categoryId].push({
            id: generateId(fileName),
            name: cleanName(fileName),
            equipment: 'vários', // default
            difficulty: 'iniciante', // default
            primaryMuscle: categoryId,
            secondaryMuscles: [],
            gif: gifPath,
            description: `Exercício de ${dirName.toLowerCase()}.`
        });
    });

    const fileContent = `// Auto-generated exercise database from R2 migration
export const exerciseDatabase = ${JSON.stringify(database, null, 4)};

export const muscleGroups = ${JSON.stringify(Object.keys(database).map(id => ({
    id,
    name: Object.keys(categoryMap).find(k => categoryMap[k] === id) || id,
    icon: 'fitness_center',
    color: 'from-blue-500 to-indigo-500'
})), null, 4)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Generated database with ${allGifs.length} exercises to ${outputPath}`);
}

main().catch(console.error);
