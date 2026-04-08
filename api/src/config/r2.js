const { S3Client } = require('@aws-sdk/client-s3');

let s3Client = null;

if (process.env.R2_ENDPOINT) {
    s3Client = new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
}

const getPublicUrl = (key) => {
    const base = process.env.R2_PUBLIC_URL;
    if (!base) return null;
    return `${base}/${key}`;
};

module.exports = { s3Client, getPublicUrl };
