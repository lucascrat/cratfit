const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, getPublicUrl } = require('../config/r2');

const uploadFile = async (bucket, key, buffer, contentType) => {
    if (!s3Client) {
        // Fallback: no R2 configured, return null
        console.warn('R2 not configured, skipping upload');
        return null;
    }

    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    }));

    return getPublicUrl(key);
};

const deleteFile = async (bucket, key) => {
    if (!s3Client) return;
    await s3Client.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    }));
};

const uploadAvatar = async (userId, file) => {
    const ext = file.originalname?.split('.').pop() || 'jpg';
    const key = `avatars/${userId}/avatar-${Date.now()}.${ext}`;
    return uploadFile(
        process.env.R2_BUCKET_IMAGES || 'fitcrat-images',
        key,
        file.buffer,
        file.mimetype
    );
};

const uploadActivityImage = async (userId, file) => {
    const key = `activities/${userId}/${Date.now()}-map.png`;
    return uploadFile(
        process.env.R2_BUCKET_IMAGES || 'fitcrat-images',
        key,
        file.buffer,
        file.mimetype || 'image/png'
    );
};

const uploadGeneric = async (bucket, folder, file) => {
    const safe = (file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '');
    const key = `${folder}/${Date.now()}_${safe}`;
    return uploadFile(bucket, key, file.buffer, file.mimetype);
};

module.exports = { uploadFile, deleteFile, uploadAvatar, uploadActivityImage, uploadGeneric };
