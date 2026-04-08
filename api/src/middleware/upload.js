const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|webm|mp4|svg/;
        const ext = file.originalname.split('.').pop().toLowerCase();
        if (allowed.test(ext) || allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'));
        }
    },
});

module.exports = { upload };
