import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" }); // Assuming .env is in correcrat root or adjust path

const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        const response = await client.send(new ListBucketsCommand({}));
        console.log("Buckets:", response.Buckets.map(b => b.Name));
    } catch (err) {
        console.error("Error listing buckets:", err);
    }
}

run();
