const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadAvatar, uploadActivityImage, uploadGeneric } = require('../services/storageService');

const router = Router();

// POST /upload/avatar
router.post('/avatar', requireAuth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const url = await uploadAvatar(req.user.id, req.file);
        res.json({ data: url, error: null });
    } catch (err) { next(err); }
});

// POST /upload/activity-image
router.post('/activity-image', requireAuth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const url = await uploadActivityImage(req.user.id, req.file);
        res.json({ publicUrl: url, error: null });
    } catch (err) { next(err); }
});

// POST /upload/exercise-gif
router.post('/exercise-gif', requireAuth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const url = await uploadGeneric('fitcrat-exercises', 'exercise-gifs', req.file);
        res.json({ data: url, error: null });
    } catch (err) { next(err); }
});

// POST /upload/sponsor-image
router.post('/sponsor-image', requireAuth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const url = await uploadGeneric('fitcrat-app', 'sponsors', req.file);
        res.json({ data: url, error: null });
    } catch (err) { next(err); }
});

// POST /upload/gym-image
router.post('/gym-image', requireAuth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const url = await uploadGeneric('fitcrat-app', 'gym', req.file);
        res.json({ data: url, error: null });
    } catch (err) { next(err); }
});

module.exports = router;
