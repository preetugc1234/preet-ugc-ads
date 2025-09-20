# Supabase Edge Functions Deployment

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

## Setup Project

1. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

2. Set environment variables in your Supabase project:
   - Go to Project Settings > Edge Functions
   - Add the following secrets:
     - `BACKEND_URL`: https://preet-ugc-ads.onrender.com
     - `WORKER_HMAC_SECRET`: your-worker-hmac-secret-key
     - `OPENROUTER_API_KEY`: your-openrouter-api-key
     - `FAL_API_KEY`: your-fal-api-key
     - `CLOUDINARY_CLOUD_NAME`: your-cloudinary-cloud-name

## Deploy Edge Function

```bash
# Deploy the AI worker function
supabase functions deploy ai-worker

# Test the function
supabase functions invoke ai-worker --data '{"jobId":"test","module":"chat","params":{"prompt":"Hello"},"userId":"test-user"}'
```

## Function URLs

Once deployed, your Edge Function will be available at:
- Production: `https://your-project.supabase.co/functions/v1/ai-worker`
- Local: `http://localhost:54321/functions/v1/ai-worker`

## Environment Variables for Backend

Add these to your Render backend environment:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
WORKER_HMAC_SECRET=your-worker-hmac-secret-key
```

## Testing Integration

1. Create a job through the API:
```bash
curl -X POST https://preet-ugc-ads.onrender.com/api/jobs/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"module":"chat","params":{"prompt":"Hello world"}}'
```

2. Check job status:
```bash
curl https://preet-ugc-ads.onrender.com/api/jobs/{job-id}/status \
  -H "Authorization: Bearer your-jwt-token"
```

The job should progress through: `queued` → `processing` → `preview_ready` → `completed`