
// Basic max heart rate calculation (Tanaka formula is often better for active people)
export const calculateMaxHeartRate = (age) => {
    return 208 - (0.7 * age);
};

// Karvonen formula for heart rate zones
export const calculateHeartRateZones = (maxHeartRate, restingHeartRate = 60) => {
    const reserve = maxHeartRate - restingHeartRate;

    // Professional 5-zone system (Garmin/Strava style)
    // Z1: Warm Up / Recovery (50-60%)
    // Z2: Easy / Fat Burn (60-70%)
    // Z3: Aerobic / Endurance (70-80%)
    // Z4: Threshold (80-90%)
    // Z5: Maximum / V02 Max (90-100%)

    const calcBpm = (percent) => Math.round(((percent / 100) * reserve) + restingHeartRate);

    // If resting heart rate is default/unknown, use simple % of MaxHR
    if (restingHeartRate === 60) { // Assuming 60 is generic fallback
        const simpleBpm = (percent) => Math.round((percent / 100) * maxHeartRate);
        return [
            { zone: 1, name: 'Recuperação', min: simpleBpm(50), max: simpleBpm(60), color: '#9ca3af', desc: 'Aquecimento, relaxamento' },
            { zone: 2, name: 'Aeróbico Leve', min: simpleBpm(60), max: simpleBpm(70), color: '#3b82f6', desc: 'Queima de gordura, resistência base' },
            { zone: 3, name: 'Aeróbico', min: simpleBpm(70), max: simpleBpm(80), color: '#22c55e', desc: 'Melhora cardio, ritmo moderado' },
            { zone: 4, name: 'Limiar', min: simpleBpm(80), max: simpleBpm(90), color: '#f59e0b', desc: 'Performance, resistência alta' },
            { zone: 5, name: 'Anaeróbico', min: simpleBpm(90), max: maxHeartRate, color: '#ef4444', desc: 'Esforço máximo, sprints' }
        ];
    }

    return [
        { zone: 1, name: 'Recuperação', min: calcBpm(50), max: calcBpm(60), color: '#9ca3af', desc: 'Aquecimento, relaxamento' },
        { zone: 2, name: 'Aeróbico Leve', min: calcBpm(60), max: calcBpm(70), color: '#3b82f6', desc: 'Queima de gordura, resistência base' },
        { zone: 3, name: 'Aeróbico', min: calcBpm(70), max: calcBpm(80), color: '#22c55e', desc: 'Melhora cardio, ritmo moderado' },
        { zone: 4, name: 'Limiar', min: calcBpm(80), max: calcBpm(90), color: '#f59e0b', desc: 'Performance, resistência alta' },
        { zone: 5, name: 'Anaeróbico', min: calcBpm(90), max: maxHeartRate, color: '#ef4444', desc: 'Esforço máximo, sprints' }
    ];
};

// Calculate Training Paces based on a recent reference run (e.g. current 5k/10k pace)
// Using Jack Daniels' VDOT simplified logic
export const calculateTrainingPaces = (averagePaceSeconds, distanceKm) => {
    // Normalize performance to a VDOT score (very rough approximation)
    // We assume the run was a "hard" effort for simplicity, or we treat avg pace as "Easy" pace if distance > 5km
    // Better: Just project zones relative to the current average pace if it's a decent run.

    // Let's assume the user ran at "Moderate" pace.
    // Easy Pace = Avg * 1.15
    // Tempo Pace = Avg * 0.95
    // Interval Pace = Avg * 0.85
    // Repetition Pace = Avg * 0.80

    const format = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.round(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    return [
        { name: 'Regenerativo (Z1)', pace: format(averagePaceSeconds * 1.25) + ' - ' + format(averagePaceSeconds * 1.15), color: '#9ca3af' },
        { name: 'Longo/Fácil (Z2)', pace: format(averagePaceSeconds * 1.15) + ' - ' + format(averagePaceSeconds * 1.05), color: '#3b82f6' },
        { name: 'Maratona/Tempo (Z3)', pace: format(averagePaceSeconds * 1.05) + ' - ' + format(averagePaceSeconds * 0.95), color: '#22c55e' },
        { name: 'Limiar (Z4)', pace: format(averagePaceSeconds * 0.95) + ' - ' + format(averagePaceSeconds * 0.88), color: '#f59e0b' },
        { name: 'VO2Max (Z5)', pace: format(averagePaceSeconds * 0.88) + ' - ' + format(averagePaceSeconds * 0.82), color: '#ef4444' }
    ];
};

export const estimateVO2Max = (distanceKm, durationMinutes, heartRateAvg, age) => {
    // Simple estimation (e.g., Cooper test for 12 min run, but adapted)
    // VO2max = (Distance covered in metres - 504.9) / 44.73
    // Generalized for non-max efforts using %HR if available

    if (distanceKm < 1) return null;

    // Projected 12 min distance
    const speedKmh = distanceKm / (durationMinutes / 60);
    const projected12MinDist = speedKmh * (12 / 60) * 1000; // in meters

    let vo2 = (projected12MinDist - 504.9) / 44.73;

    // Adjust for heart rate if it wasn't max effort
    // If AvgHR was 70% of MaxHR, the VO2 is likely higher than calculated
    const maxHr = 208 - (0.7 * age);
    const effort = heartRateAvg / maxHr;

    if (effort > 0.5 && effort < 1.0) {
        vo2 = vo2 / effort;
    }

    return Math.min(85, Math.max(15, Math.round(vo2)));
};

// Calculate Basal Metabolic Rate (Harris-Benedict Equation)
export const calculateBMR = (weight, height, age, gender) => {
    // weight in kg, height in cm, age in years
    let bmr;

    if (gender === 'female') {
        // Women: 655 + (9.6 × weight) + (1.8 × height) - (4.7 × age)
        bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    } else {
        // Men: 66 + (13.7 × weight) + (5.0 × height) - (6.8 × age)
        bmr = 66 + (13.7 * weight) + (5.0 * height) - (6.8 * age);
    }

    return Math.round(bmr);
};

// Calculate METs based on speed (km/h) for running/walking
export const getMETsFromSpeed = (speedKmh, activityType = 'running') => {
    if (activityType === 'cycling') {
        if (speedKmh < 16) return 4.0;
        if (speedKmh < 20) return 6.0;
        if (speedKmh < 24) return 8.0;
        if (speedKmh < 30) return 10.0;
        return 12.0;
    }

    // Walking/Running METs estimation
    if (speedKmh < 1) return 1.0; // Rest
    if (speedKmh < 4) return 2.5; // Slow walk
    if (speedKmh < 6) return 3.5; // Fast walk

    // Running formula approximation: METs ~= speed (km/h)
    // Adjusted slightly for accuracy
    if (speedKmh < 8) return 6.0;  // Jogging
    if (speedKmh < 10) return 9.0;
    if (speedKmh < 12) return 10.5;
    if (speedKmh < 14) return 11.8;
    if (speedKmh < 16) return 12.8;
    return 14.5;
};

// Calculate Calories using BMR and METs
// Formula: Calories = (BMR / 24) * MET * Duration(hours)
export const calculateCaloriesWithBMR = (bmr, mets, durationSeconds) => {
    const durationHours = durationSeconds / 3600;
    const bmrPerHour = bmr / 24;
    return Math.round(bmrPerHour * mets * durationHours);
};

// Legacy/Fallback simple calculator
export const calculateCalories = (distanceKm, durationSeconds) => {
    // Simple constant roughly 60-70 kcal per km for average runner
    return Math.round(distanceKm * 65);
};

