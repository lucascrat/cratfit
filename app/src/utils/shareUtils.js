import { GOOGLE_MAPS_API_KEY } from '../constants';

export const getStaticMapUrl = (positions, width = 600, height = 400) => {
    if (!positions || positions.length === 0) return null;

    try {
        const coords = typeof positions === 'string' ? JSON.parse(positions) : positions;
        if (!Array.isArray(coords) || coords.length === 0) return null;

        // Simplify path: take max 80 points to avoid URL length limits
        const step = Math.max(1, Math.floor(coords.length / 80));
        const sampled = coords.filter((_, i) => i % step === 0);

        // Add last point if not included
        if (coords.length > 1 && !sampled.includes(coords[coords.length - 1])) {
            sampled.push(coords[coords.length - 1]);
        }

        const pathStr = sampled.map(p => {
            const lat = Number(p.lat).toFixed(6);
            const lng = Number(p.lng).toFixed(6);
            return `${lat},${lng}`;
        }).join('|');

        // Dark theme styles for Static Maps
        const styles = [
            'element:geometry|color:0x212121',
            'element:labels.icon|visibility:off',
            'element:labels.text.fill|color:0x757575',
            'element:labels.text.stroke|color:0x212121',
            'feature:administrative|element:geometry|color:0x757575',
            'feature:administrative.country|element:labels.text.fill|color:0x9e9e9e',
            'feature:administrative.land_parcel|visibility:off',
            'feature:administrative.locality|element:labels.text.fill|color:0xbdbdbd',
            'feature:poi|element:labels.text.fill|color:0x757575',
            'feature:poi.park|element:geometry|color:0x181818',
            'feature:poi.park|element:labels.text.fill|color:0x616161',
            'feature:road|element:geometry.fill|color:0x2c2c2c',
            'feature:road|element:labels.text.fill|color:0x8a8a8a',
            'feature:road.arterial|element:geometry|color:0x373737',
            'feature:road.highway|element:geometry|color:0x3c3c3c',
            'feature:road.highway.controlled_access|element:geometry|color:0x4e4e4e',
            'feature:road.local|element:labels.text.fill|color:0x616161',
            'feature:transit|element:labels.text.fill|color:0x757575',
            'feature:water|element:geometry|color:0x000000',
            'feature:water|element:labels.text.fill|color:0x3d3d3d'
        ].map(s => `style=${s}`).join('&');

        const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
        return `${baseUrl}?size=${width}x${height}&scale=2&maptype=roadmap&${styles}&path=color:0x1bda67ff|weight:5|${pathStr}&key=${GOOGLE_MAPS_API_KEY}`;
    } catch (e) {
        console.error('Error generating static map url:', e);
        return null;
    }
};

export const generateActivityImage = async (activity) => {
    const {
        route_data: rawPositions = [],
        title: rawTitle = 'Corrida',
        distance_km: rawDistance = 0,
        duration_seconds: rawDuration = 0,
        pace = '--:--',
        calories = 0,
        mapImage: rawMapImage = null
    } = activity;

    let positions = rawPositions;

    const distance = Number(rawDistance) || 0;
    const duration = Number(rawDuration) || 0;
    const title = String(rawTitle);

    const width = 720;
    const height = 1280;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    const mapHeight = 1100;
    const padding = 80;

    // 1. Draw Map Image if provided
    if (rawMapImage) {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
                img.src = rawMapImage;
            });

            if (img.complete && img.naturalWidth > 0) {
                const mapAspect = img.width / img.height;
                const areaAspect = width / mapHeight;
                let drawW, drawH, drawX, drawY;
                if (mapAspect > areaAspect) {
                    drawH = mapHeight;
                    drawW = mapHeight * mapAspect;
                    drawX = (width - drawW) / 2;
                    drawY = 0;
                } else {
                    drawW = width;
                    drawH = width / mapAspect;
                    drawX = 0;
                    drawY = (mapHeight - drawH) / 2;
                }
                ctx.drawImage(img, drawX, drawY, drawW, drawH);

                const gradient = ctx.createLinearGradient(0, 0, 0, mapHeight);
                gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
                gradient.addColorStop(0.7, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, 'rgba(26,26,26,1)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, mapHeight);
            }
        } catch (e) {
            console.warn('Map load failed:', e);
        }
    } else {
        // Fallback: Grid
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * (mapHeight / 20));
            ctx.lineTo(width, i * (mapHeight / 20));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i * (width / 15), 0);
            ctx.lineTo(i * (width / 15), mapHeight);
            ctx.stroke();
        }
    }

    // Logo (Top Left)
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(20, 20, 210, 50, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText('🏃 FITCRAT', 40, 55);

    // Parse route_data if string
    if (typeof positions === 'string') {
        try {
            positions = JSON.parse(positions);
        } catch (e) {
            console.error('Error parsing route_data:', e);
            positions = [];
        }
    }

    // Placeholder if no route
    if (!positions || positions.length < 1) {
        if (!rawMapImage) {
            ctx.fillStyle = '#333';
            ctx.font = 'italic 30px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Atividade sem rota', width / 2, mapHeight / 2);
            ctx.textAlign = 'start';
        }
    }

    // Draw route if positions exist
    if (positions && positions.length > 1) {
        const lats = positions.map(p => p.lat);
        const lngs = positions.map(p => p.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const latRange = maxLat - minLat || 0.01;
        const lngRange = maxLng - minLng || 0.01;

        // Scale to fit in map area with padding
        const mapWidth = width - padding * 2;
        const mapAreaHeight = mapHeight - padding * 2;

        const scaleX = mapWidth / lngRange;
        const scaleY = mapAreaHeight / latRange;
        const scale = Math.min(scaleX, scaleY) * 0.8;

        const centerX = width / 2;
        const centerY = mapHeight / 2;

        // Draw route line
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        positions.forEach((pos, index) => {
            const x = centerX + (pos.lng - (minLng + lngRange / 2)) * scale;
            const y = centerY - (pos.lat - (minLat + latRange / 2)) * scale;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Start marker
        const startPos = positions[0];
        const startX = centerX + (startPos.lng - (minLng + lngRange / 2)) * scale;
        const startY = centerY - (startPos.lat - (minLat + latRange / 2)) * scale;
        ctx.fillStyle = '#1bda67';
        ctx.beginPath();
        ctx.arc(startX, startY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // End marker
        const endPos = positions[positions.length - 1];
        const endX = centerX + (endPos.lng - (minLng + lngRange / 2)) * scale;
        const endY = centerY - (endPos.lat - (minLat + latRange / 2)) * scale;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(endX, endY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // Stats section background (already handled by previous block if we wanted, but let's keep the clear separation)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, mapHeight, width, height - mapHeight);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px system-ui';
    const displayTitle = title.trim() || 'Corrida';
    ctx.fillText(displayTitle, padding, mapHeight + 80);

    // Helper: format time
    const formatTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    // Stats grid
    const statsY = mapHeight + 150;
    const statWidth = (width - padding * 2) / 2;

    // Ritmo
    ctx.fillStyle = '#888';
    ctx.font = '24px system-ui';
    ctx.fillText('Ritmo', padding, statsY);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px system-ui';
    ctx.fillText(`${pace}`, padding, statsY + 70);
    ctx.font = '32px system-ui';
    ctx.fillStyle = '#888';
    ctx.fillText('/km', padding + ctx.measureText(pace).width + 10, statsY + 70);

    // Tempo
    ctx.fillStyle = '#888';
    ctx.font = '24px system-ui';
    ctx.fillText('Tempo', padding + statWidth, statsY);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px system-ui';
    ctx.fillText(formatTime(duration), padding + statWidth, statsY + 70);

    // Distância
    const statsY2 = statsY + 150;
    ctx.fillStyle = '#888';
    ctx.font = '24px system-ui';
    ctx.fillText('Distância', padding, statsY2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px system-ui';
    ctx.fillText(`${Number(distance).toFixed(2)}`, padding, statsY2 + 70);
    ctx.font = '32px system-ui';
    ctx.fillStyle = '#888';
    ctx.fillText(' km', padding + ctx.measureText(Number(distance).toFixed(2)).width + 10, statsY2 + 70);

    // Calorias
    ctx.fillStyle = '#888';
    ctx.font = '24px system-ui';
    ctx.fillText('Calorias', padding + statWidth, statsY2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px system-ui';
    ctx.fillText(`${calories}`, padding + statWidth, statsY2 + 70);
    ctx.font = '32px system-ui';
    ctx.fillStyle = '#888';
    ctx.fillText(' kcal', padding + statWidth + ctx.measureText(String(calories)).width + 10, statsY2 + 70);

    // Footer hashtag
    ctx.fillStyle = '#666';
    ctx.font = '28px system-ui';
    ctx.fillText('#FitCrat #Corrida #Running', padding, height - 100);

    return canvas.toDataURL('image/png');
};
