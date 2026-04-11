import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import fs from 'fs';

async function listFiles() {
    const client = new S3Client({
        region: "auto",
        endpoint: "https://b94b59f6ac6870ef08ad4ea5384fc042.r2.cloudflarestorage.com",
        credentials: {
            accessKeyId: "372bdcdff20f2696c0e139f91b04803e",
            secretAccessKey: "ea84b1e1ade3f2a2cefae64e143171e47232ecc7fce0c2ebe6e8d23fa4a41348",
        },
    });

    const command = new ListObjectsV2Command({
        Bucket: "hldesenvolvedor",
        Prefix: "exercises/",
    });

    try {
        let isTruncated = true;
        let contents = [];

        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
            contents.push(...Contents);
            isTruncated = IsTruncated;
            command.input.ContinuationToken = NextContinuationToken;
        }

        const filenames = contents.map(c => c.Key);
        fs.writeFileSync('r2_files.json', JSON.stringify(filenames, null, 2));
        console.log(`Successfully listed ${filenames.length} files.`);
    } catch (err) {
        console.error(err);
    }
}

listFiles();
