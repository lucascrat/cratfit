require('dotenv').config();
const { putObject, deleteObject, getPublicUrl } = require('./src/config/r2api');

const testMigration = async () => {
    console.log('--- Starting R2 Token Migration Test ---');
    console.log('Account ID:', process.env.R2_ACCOUNT_ID);
    console.log('Bucket:', process.env.R2_BUCKET_IMAGES);

    const testKey = `test-migration-${Date.now()}.txt`;
    const testContent = Buffer.from('Migration to Bearer Token successful!');

    try {
        console.log(`\n1. Testing Upload of ${testKey}...`);
        await putObject(process.env.R2_BUCKET_IMAGES, testKey, testContent, 'text/plain');
        const url = getPublicUrl(testKey);
        console.log('✅ Upload Success! Public URL:', url);

        console.log(`\n2. Verifying public access...`);
        const response = await fetch(url);
        if (response.ok) {
            const text = await response.text();
            console.log('✅ Public content verified:', text);
        } else {
            console.error('❌ Public access failed:', response.status);
        }

        console.log(`\n3. Testing Delete...`);
        await deleteObject(process.env.R2_BUCKET_IMAGES, testKey);
        console.log('✅ Delete Success!');

    } catch (err) {
        console.error('❌ Migration Test Failed:', err.message);
    }
};

testMigration();
