const fs = require('fs');
const dotenv = require('dotenv');

const envs = dotenv.parse(fs.readFileSync('.env'));
const token = process.env.VERCEL_TOKEN; // set via: $env:VERCEL_TOKEN="your-token"
if (!token) { console.error('❌ VERCEL_TOKEN not set'); process.exit(1); }
const projectName = 'fitcrat-api';

async function upload() {
  console.log("Starting to upload environment variables to Vercel API...");

  for (const [key, value] of Object.entries(envs)) {
    if (!value || key === 'PORT') {
      console.log(`⏭️  Skipping ${key} (empty or not needed)`);
      continue;
    }

    let finalValue = value;
    if (key === 'CORS_ORIGIN' && !finalValue.includes('fitcrat-api.vercel.app')) {
        finalValue += ',https://fitcrat-api.vercel.app';
    }

    console.log(`⏳ Adding ${key}...`);
    const res = await fetch(`https://api.vercel.com/v10/projects/${projectName}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: key,
        value: finalValue,
        type: 'encrypted',
        target: ['production']
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✅ ${key} uploaded successfully.`);
    } else {
      if (data.error && data.error.code === 'ENV_ALREADY_EXISTS') {
         console.log(`⚠️  ${key} already exists. Skipping...`);
         // Or we could update it, but let's assume it's fine or already set.
      } else {
         console.error(`❌ Failed ${key}:`, data.error?.message || data);
      }
    }
  }
  console.log("All variables processed!");
}

upload();
