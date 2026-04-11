/**
 * R2 Native Cloudflare API Helper
 * Replaces legacy S3-compatible client with Bearer Token authentication.
 */

const getR2Config = () => ({
    accountId: process.env.R2_ACCOUNT_ID,
    apiToken: process.env.R2_API_TOKEN,
    publicUrl: process.env.R2_PUBLIC_URL
});

const putObject = async (bucket, key, buffer, contentType) => {
    const { accountId, apiToken } = getR2Config();
    if (!apiToken || !accountId) {
        throw new Error('R2_API_TOKEN or R2_ACCOUNT_ID not configured');
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': contentType || 'application/octet-stream'
        },
        body: buffer
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`R2 API Upload Error: ${JSON.stringify(error)}`);
    }

    return response.json();
};

const deleteObject = async (bucket, key) => {
    const { accountId, apiToken } = getR2Config();
    if (!apiToken || !accountId) return;

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`;
    
    await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    });

    return true;
};

const getPublicUrl = (key) => {
    const base = process.env.R2_PUBLIC_URL;
    if (!base) return null;
    return `${base}/${key}`;
};

module.exports = { putObject, deleteObject, getPublicUrl };
