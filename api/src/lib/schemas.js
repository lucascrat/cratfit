const { z } = require('zod');

// ---- Auth schemas ----

exports.registerSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .toLowerCase(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long'),
    name: z.string().trim().min(1).max(100).optional(),
    country: z.string().length(2).default('BR').optional(),
});

exports.loginSchema = z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

exports.googleAuthSchema = z.object({
    id_token: z.string().optional(),
    email: z.string().email('Valid email required').toLowerCase(),
    name: z.string().trim().max(100).optional(),
    photo: z.string().url().optional().or(z.literal('')),
});

exports.appleAuthSchema = z.object({
    identity_token: z.string().optional(),
    email: z.string().email('Valid email required').toLowerCase(),
    name: z.string().trim().max(100).optional(),
});

exports.refreshSchema = z.object({
    refresh_token: z.string({ required_error: 'Refresh token required' }).min(1),
});

// ---- User schemas ----

exports.updateUserSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    avatar_url: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    country: z.string().length(2).optional(),
}).strict();

// ---- Activity schemas ----

exports.activitySchema = z.object({
    title: z.string().trim().max(200).optional(),
    type: z.enum(['running', 'walking', 'cycling', 'gym']),
    distance_km: z.number().min(0).max(10000).default(0),
    duration_seconds: z.number().int().min(0).default(0),
    pace: z.string().max(10).optional(),
    calories: z.number().int().min(0).default(0),
    elevation_gain_m: z.number().min(0).optional(),
    route_data: z.array(z.object({
        lat: z.number(),
        lng: z.number(),
        timestamp: z.number(),
        speed: z.number().optional(),
        altitude: z.number().optional(),
    })).optional(),
    map_image_url: z.string().url().optional(),
    is_public: z.boolean().default(true),
    description: z.string().max(2000).optional(),
    effort_level: z.number().int().min(1).max(5).optional(),
    notes: z.string().max(1000).optional(),
});

// ---- Middleware helper ----

/**
 * Valida req.body com um schema Zod.
 * Em caso de erro retorna 400 com a lista de problemas.
 * Em caso de sucesso, substitui req.body pelos dados validados/transformados (ex: email em lowercase).
 */
exports.validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({ error: errors[0]?.message || 'Validation error', errors });
    }
    req.body = result.data;
    next();
};
