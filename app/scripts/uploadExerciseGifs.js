/**
 * Script para upload de GIFs de exercícios para Supabase Storage
 * Execute: node scripts/uploadExerciseGifs.js
 * 
 * IMPORTANTE: Para reduzir o tamanho do app, após executar este script:
 * 1. Delete a pasta public/gifs
 * 2. No arquivo src/data/exerciseData.js, mude USE_SUPABASE_GIFS para true
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const SUPABASE_URL = 'https://srv1192656.hstgr.cloud';
const SUPABASE_SERVICE_KEY = 'SUA_SERVICE_KEY_AQUI'; // Use a service_role key para upload

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Pasta fonte dos GIFs
const SOURCE_DIR = path.join(__dirname, '..', 'public', 'gifs');
const BUCKET_NAME = 'exercise-gifs';

// Contador
let uploaded = 0;
let failed = 0;
let skipped = 0;

/**
 * Upload de um único arquivo
 */
async function uploadFile(filePath, relativePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = relativePath.replace(/\\/g, '/');

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, fileBuffer, {
                contentType: 'image/gif',
                upsert: true
            });

        if (error) {
            console.error(`❌ Erro no upload de ${fileName}:`, error.message);
            failed++;
        } else {
            console.log(`✅ Uploaded: ${fileName}`);
            uploaded++;
        }
    } catch (err) {
        console.error(`❌ Erro ao processar ${relativePath}:`, err.message);
        failed++;
    }
}

/**
 * Processa recursivamente uma pasta
 */
async function processDirectory(dirPath, baseDir = '') {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.join(baseDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await processDirectory(fullPath, relativePath);
        } else if (item.toLowerCase().endsWith('.gif')) {
            await uploadFile(fullPath, relativePath);
            // Pequeno delay para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 100));
        } else {
            console.log(`⏭️ Ignorando (não é GIF): ${item}`);
            skipped++;
        }
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('🚀 Iniciando upload de GIFs para Supabase Storage...\n');
    console.log(`📁 Pasta fonte: ${SOURCE_DIR}`);
    console.log(`🪣 Bucket: ${BUCKET_NAME}\n`);

    if (SUPABASE_SERVICE_KEY === 'SUA_SERVICE_KEY_AQUI') {
        console.error('❌ ERRO: Configure a SUPABASE_SERVICE_KEY no script!');
        console.log('\n💡 Encontre sua service_role key em:');
        console.log('   Supabase Dashboard > Project Settings > API > service_role key');
        process.exit(1);
    }

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ ERRO: Pasta não encontrada: ${SOURCE_DIR}`);
        process.exit(1);
    }

    // Primeiro, executar o SQL para criar o bucket (se ainda não existir)
    console.log('📋 Criando bucket (se necessário)...\n');

    const startTime = Date.now();

    await processDirectory(SOURCE_DIR);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DO UPLOAD');
    console.log('='.repeat(50));
    console.log(`✅ Uploads bem-sucedidos: ${uploaded}`);
    console.log(`❌ Falhas: ${failed}`);
    console.log(`⏭️ Ignorados: ${skipped}`);
    console.log(`⏱️ Tempo total: ${duration}s`);
    console.log('='.repeat(50));

    if (uploaded > 0 && failed === 0) {
        console.log('\n🎉 Todos os GIFs foram enviados com sucesso!');
        console.log('\n📝 PRÓXIMOS PASSOS:');
        console.log('1. Execute: npm run build');
        console.log('2. Delete a pasta public/gifs para economizar espaço');
        console.log('3. Em src/data/exerciseData.js, mude USE_SUPABASE_GIFS para true');
        console.log('4. Execute: npm run build && npx cap sync android');
    }
}

main().catch(console.error);
