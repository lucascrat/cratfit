const { putObject, deleteObject, getPublicUrl } = require('../config/r2api');

const uploadFile = async (bucket, key, buffer, contentType) => {
    try {
        await putObject(bucket, key, buffer, contentType);
        return getPublicUrl(key);
    } catch (err) {
        console.error('R2 API Upload Error:', err);
        return null;
    }
};

const deleteFile = async (bucket, key) => {
    try {
        await deleteObject(bucket, key);
    } catch (err) {
        console.error('R2 API Delete Error:', err);
    }
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
