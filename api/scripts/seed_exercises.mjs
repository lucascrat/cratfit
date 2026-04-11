/**
 * Seed script: populates muscle_groups + exercises tables from R2 GIF listing.
 * Run:  node scripts/seed_exercises.mjs
 */
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});

// Mapping: R2 folder name → muscle group record
const MUSCLE_GROUPS = [
    { id: 'peitoral',      folder: 'Peitoral',                  name: 'Peitoral',            icon: 'keyboard_double_arrow_left', color: 'from-red-500 to-orange-500' },
    { id: 'costas',         folder: 'Costas',                    name: 'Costas',              icon: 'keyboard_double_arrow_right', color: 'from-blue-500 to-cyan-500' },
    { id: 'ombros',         folder: 'Ombros',                    name: 'Ombros',              icon: 'expand_less',                 color: 'from-purple-500 to-pink-500' },
    { id: 'biceps',         folder: 'Biceps',                    name: 'Bíceps',              icon: 'fitness_center',              color: 'from-orange-500 to-yellow-500' },
    { id: 'triceps',        folder: 'Triceps',                   name: 'Tríceps',             icon: 'fitness_center',              color: 'from-green-500 to-emerald-500' },
    { id: 'pernas',         folder: 'Pernas',                    name: 'Pernas',              icon: 'directions_walk',             color: 'from-indigo-500 to-purple-500' },
    { id: 'gluteos',        folder: 'gluteos',                   name: 'Glúteos',             icon: 'accessibility_new',           color: 'from-pink-500 to-rose-500' },
    { id: 'abdomen',        folder: 'Abdominal',                 name: 'Abdômen',             icon: 'local_fire_department',        color: 'from-amber-500 to-red-500' },
    { id: 'cardio',         folder: 'Cardio',                    name: 'Cardio',              icon: 'favorite',                    color: 'from-rose-500 to-red-500' },
    { id: 'trapezio',       folder: 'Trapezio',                  name: 'Trapézio',            icon: 'swap_vert',                   color: 'from-teal-500 to-cyan-500' },
    { id: 'antebraco',      folder: 'antebraco',                 name: 'Antebraço',           icon: 'pan_tool',                    color: 'from-slate-500 to-gray-500' },
    { id: 'alongamentos',   folder: 'ALONGAMENTOS E MOBILIDADE', name: 'Alongamentos',        icon: 'self_improvement',            color: 'from-cyan-500 to-teal-500' },
    { id: 'eretores',       folder: 'Eretores da espinha',       name: 'Eretores da Espinha', icon: 'straighten',                  color: 'from-amber-500 to-orange-500' },
    { id: 'membros_inf',    folder: 'Membros Inferiores (53)',   name: 'Membros Inferiores',  icon: 'directions_walk',             color: 'from-violet-500 to-purple-500' },
    { id: 'panturrilhas',   folder: 'Panturrilhas',              name: 'Panturrilhas',        icon: 'airline_seat_legroom_normal',  color: 'from-rose-500 to-pink-500' },
];

// Build reverse lookup: folder → muscle group id
const folderToGroup = {};
MUSCLE_GROUPS.forEach(g => { folderToGroup[g.folder] = g.id; });

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 95);
}

function cleanExerciseName(filename) {
    // Remove .gif extension and any leading timestamps
    let name = filename.replace(/\.gif$/i, '');
    // Remove leading numbers/timestamps like "1768273343462_"
    name = name.replace(/^\d+_/, '');
    // Replace hyphens and underscores with spaces
    name = name.replace(/[-_]+/g, ' ').trim();
    return name;
}

function guessEquipment(name) {
    const lower = name.toLowerCase();
    if (lower.includes('barra') || lower.includes('smith')) return 'barra';
    if (lower.includes('halter') || lower.includes('haltre') || lower.includes('dumbbell')) return 'halteres';
    if (lower.includes('maquina') || lower.includes('máquina') || lower.includes('leg press') || lower.includes('polia') || lower.includes('gravitron')) return 'maquina';
    if (lower.includes('cabo') || lower.includes('cross') || lower.includes('corda') || lower.includes('polia')) return 'cabo';
    if (lower.includes('banco') && !lower.includes('com')) return 'banco';
    if (lower.includes('corpo') || lower.includes('flexao') || lower.includes('apoio') || lower.includes('prancha') || lower.includes('isometri') || lower.includes('escalador') || lower.includes('mountain') || lower.includes('paralela') || lower.includes('barra fixa')) return 'corpo';
    return 'vários';
}

function guessDifficulty(name) {
    const lower = name.toLowerCase();
    if (lower.includes('avancad') || lower.includes('avançad') || lower.includes('pesado') || lower.includes('unilateral')) return 'avancado';
    if (lower.includes('iniciante') || lower.includes('assistid') || lower.includes('maquina') || lower.includes('máquina') || lower.includes('prancha')) return 'iniciante';
    return 'intermediario';
}

async function main() {
    const client = await pool.connect();

    try {
        // Load GIF listing
        const gifsPath = path.join(__dirname, '..', 'r2_gifs_full.json');
        const gifs = JSON.parse(fs.readFileSync(gifsPath, 'utf8'));

        await client.query('SET search_path TO fttcrat');
        await client.query('BEGIN');

        // 1. Insert muscle groups
        console.log('Inserting muscle groups...');
        for (const mg of MUSCLE_GROUPS) {
            await client.query(
                `INSERT INTO muscle_groups (id, name, icon, color)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id) DO UPDATE SET name = $2, icon = $3, color = $4`,
                [mg.id, mg.name, mg.icon, mg.color]
            );
        }
        console.log(`  ✓ ${MUSCLE_GROUPS.length} muscle groups`);

        // 2. Insert exercises
        let total = 0;
        const seenIds = new Set();

        for (const [folder, files] of Object.entries(gifs)) {
            const groupId = folderToGroup[folder];
            if (!groupId) {
                console.warn(`  ⚠ Unknown folder: ${folder} — skipping ${files.length} files`);
                continue;
            }

            console.log(`Processing ${folder} (${files.length} exercises)...`);

            for (const filename of files) {
                const name = cleanExerciseName(filename);
                let id = slugify(name);

                // Ensure unique ID
                if (seenIds.has(id)) {
                    id = `${id}_${total}`;
                }
                seenIds.add(id);

                const gifPath = `${folder}/${filename}`;
                const equipment = guessEquipment(name);
                const difficulty = guessDifficulty(name);

                await client.query(
                    `INSERT INTO exercises (id, name, muscle_group_id, equipment, difficulty, primary_muscle, secondary_muscles, gif_path, description, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
                     ON CONFLICT (id) DO UPDATE SET name=$2, muscle_group_id=$3, equipment=$4, difficulty=$5, primary_muscle=$6, gif_path=$8, description=$9`,
                    [id, name, groupId, equipment, difficulty, groupId, '{}', gifPath, `Exercício de ${MUSCLE_GROUPS.find(g => g.id === groupId)?.name || groupId}.`]
                );
                total++;
            }
        }

        await client.query('COMMIT');
        console.log(`\n✅ Seeded ${total} exercises across ${MUSCLE_GROUPS.length} muscle groups`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        client.release();
        pool.end();
    }
}

main();
