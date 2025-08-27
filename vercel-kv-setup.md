# Vercel KV Database Setup for Form Backup

## Step 1: Install Vercel KV

1. Install Vercel KV in your project:
```bash
npm install @vercel/kv
```

2. Add KV to your Vercel project:
```bash
vercel kv create
```

## Step 2: Configure Environment Variables

Add these environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:

```
KV_REST_API_URL=https://your-project.kv.vercel-storage.com
KV_REST_API_TOKEN=your-kv-token
KV_REST_API_READ_ONLY_TOKEN=your-read-only-token
```

## Step 3: Update vercel.json

Add KV configuration to your `vercel.json`:

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "kv": {
    "database": "your-kv-database-name"
  }
}
```

## Step 4: Create Backup API Endpoint

Create `api/backup-submissions.js`:

```javascript
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all backup submissions
    const keys = await kv.keys('submission_*');
    const submissions = [];

    for (const key of keys) {
      const data = await kv.get(key);
      if (data) {
        submissions.push(JSON.parse(data));
      }
    }

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions: submissions
    });

  } catch (error) {
    console.error('Backup retrieval error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve backups',
      message: error.message
    });
  }
}
```

## Step 5: Deploy to Vercel

```bash
vercel --prod
```

## Step 6: Test the Setup

1. Submit a form
2. Check Vercel logs for backup creation
3. Access backup data via `/api/backup-submissions`

## Benefits of Vercel KV Backup

✅ **Automatic backup** of all form submissions  
✅ **30-day retention** by default  
✅ **Global distribution** for fast access  
✅ **No additional database** setup required  
✅ **Built-in security** and access control  

## Monitoring

Check your Vercel dashboard for:
- KV usage metrics
- API endpoint performance
- Error logs
- Backup creation status

## Cost

Vercel KV pricing:
- Free tier: 100MB storage, 100 requests/day
- Pro tier: 1GB storage, 10,000 requests/day
- Enterprise: Custom limits

## Alternative: Local File Backup

If you prefer not to use Vercel KV, you can create a local file backup system:

```javascript
// In your API endpoint
import fs from 'fs';
import path from 'path';

// Create backup directory
const backupDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Save backup
const backupFile = path.join(backupDir, `submission_${Date.now()}.json`);
fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
```

This setup provides a robust backup system for your form submissions with automatic storage in Vercel KV. 