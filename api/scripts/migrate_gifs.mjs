import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const R2_ACCOUNT_ID = "b94b59f6ac6870ef08ad4ea5384fc042";
const R2_ACCESS_KEY_ID = "372bdcdff20f2696c0e139f91b04803e";
const R2_SECRET_ACCESS_KEY = "ea84b1e1ade3f2a2cefae64e143171e47232ecc7fce0c2ebe6e8d23fa4a41348";
const BUCKET_NAME = "hldesenvolvedor";
const PREFIX = "treinos_v2/";

const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function ensureBucket() {
    try {
        await client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`Bucket ${BUCKET_NAME} already exists.`);
    } catch (err) {
        console.log(`Creating bucket ${BUCKET_NAME}...`);
        await client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    }
}

async function uploadFile(localPath, r2Key) {
    const fileContent = fs.readFileSync(localPath);
    await client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Key,
        Body: fileContent,
        ContentType: "image/gif",
    }));
}

async function walkDir(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(await walkDir(filePath));
        } else if (file.toLowerCase().endsWith('.gif')) {
            results.push(filePath);
        }
    }
    return results;
}

async function main() {
    const baseDir = path.resolve(__dirname, '../../../gifs_treinos');
    console.log(`Scanning ${baseDir}...`);

    let count = 0;
    const uploadedFiles = [];

    await ensureBucket();
    await walkDir(baseDir).then(async (allFiles) => {
        console.log(`Found ${allFiles.length} files. Starting concurrent upload...`);

        const CONCURRENCY = 20;

        for (let i = 0; i < allFiles.length; i += CONCURRENCY) {
            const chunk = allFiles.slice(i, i + CONCURRENCY);
            await Promise.all(chunk.map(async (localPath) => {
                const relativePath = path.relative(baseDir, localPath).replace(/\\/g, '/');
                const r2Key = PREFIX + relativePath;
                try {
                    await uploadFile(localPath, r2Key);
                    count++;
                    uploadedFiles.push(r2Key);
                } catch (err) {
                    console.error(`Failed to upload ${r2Key}:`, err.message);
                }
            }));
            console.log(`Progress: ${count}/${allFiles.length}`);
        }
    });

    // Save mapping to file
    fs.writeFileSync(path.resolve(__dirname, '../all_gifs.json'), JSON.stringify(uploadedFiles, null, 2));
    console.log(`Done! Total uploaded: ${count}`);
}

main().catch(console.error);
