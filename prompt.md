Table of contents (36 chapters)

System Summary & Goals

High-level Architecture Diagram

User Experience & Preview-First Flow (global rules)

Credits & Billing Design (subscriptions + one-time via Razorpay)

Job Lifecycle: API, Worker, Callbacks & Idempotency

History Feature (30-item rolling) — design & deletion lifecycle

Data Models (Mongo collections + indexes)

Admin Panel & Real-time Events (gift credits, refunds, analytics)

Model Mapping & Provider Integration (OpenRouter + Fal AI)

Worker Design (Supabase Edge + robust upload/callback flow)

Security & Anti-abuse (Auth0/Supabase, HMAC, rate limits)

Performance, Latency, +10s Buffer Strategy & UX tips

Deployment & Scaling Strategy (free-tier friendly + future growth)

Top 10 Deployment Problems + Best Solutions

Operational Playbook: Monitoring, Backups, Testing, Releases

Chat / Text Gen workflow (OpenRouter)

Text → Image workflow (OpenRouter / Gemini)

Image → Video (no audio) workflow (Kling v2 pro — Fal AI)

Text → Speech (TTS) workflow (11Labs via Fal AI)

Image → Video (with audio, custom UGC) workflow (Kling v1 pro)

Audio → Video (UGC via veed) workflow

Frontend Architecture & UI/UX tech stack (Next.js, React Query, Tailwind)

Dashboard Shell, Sidebar & Editor UX patterns

History UI, eviction UX & user feedback patterns

Billing UI & Razorpay checkout flow (client & backend)

WebSocket & Realtime event routing (user/admin channels)

Cloudinary usage patterns (previews vs finals, naming, transforms)

Mongo best practices (indexes, transactions, connection pools)

Worker scaling strategy & error-handling policies

Deletion queue & safe deletion flows for assets

Ledger & auditing model (immutable accounting)

HMAC signing & verification specification (workers & webhooks)

Idempotency, retries and “exactly once” considerations

Testing & QA: unit, integration, E2E and load tests

Cost control & optimization tactics for API-heavy apps

Tech Stack for the app

🖼️ Tech Stack Diagram (Free-Tier Setup)
flowchart TD

%% ==== FRONTEND ====
subgraph Frontend [Frontend Layer]
  A1[Next.js + Tailwind CSS] --> A2[Lovable Deployment (Free Tier)]
  A1 --> A3[Framer Motion + ShadCN UI]
end

%% ==== BACKEND ====
subgraph Backend [Backend Layer]
  B1[FastAPI Backend (Python)]
  B2[Dockerized Services]
  B3[Render Free Tier Deployment]
  B1 --> B2 --> B3
end

%% ==== DATABASE & AUTH ====
subgraph Data_Auth [Database + Auth]
  C1[MongoDB Atlas (Free Cluster)]
  C2[Supabase Auth (Free Tier)]
  C3[Supabase Functions (Background Jobs)]
end

%% ==== STORAGE ====
subgraph Storage [File & Media Storage]
  D1[Cloudinary Free Tier CDN]
  D2[Supabase Storage (Backup, 5GB Free)]
end

%% ==== PAYMENT ====
subgraph Payments [Payment System]
  E1[Razorpay API]
  E2[Webhook Endpoint -> FastAPI]
end

%% ==== MONITORING ====
subgraph Monitoring [Monitoring & Logs]
  F1[Sentry (Errors)]
  F2[UptimeRobot (Free Monitoring)]
end

%% ==== CONNECTIONS ====
A2 --> B1
B1 --> C1
B1 --> C2
B1 --> C3
B1 --> D1
B1 --> D2
B1 --> E2
E1 --> E2
B1 --> F1
B1 --> F2


✅ Flow Explained Quickly

Frontend (Next.js) runs on Lovable (free).

Backend (FastAPI) is Dockerized + deployed on Render.

Auth & Functions via Supabase.

Database in MongoDB Atlas free cluster.

Storage/CDN with Cloudinary + Supabase backup.

Payments managed by Razorpay + webhook to FastAPI.

Monitoring with Sentry + UptimeRobot.

Now I’ll expand each chapter — diagrams, in-depth details, example code (where useful), and exact tech recommendations (free-first). Where we referenced Stripe previously, everything now uses Razorpay (checkout + subscriptions + webhooks). Razorpay supports Checkout and webhooks, so flows are the same.

1 — System Summary & Goals

One-sentence: Build an all-in-one multimodal AI SaaS (chat, images, image→video, TTS, audio→video, custom UGC) that is preview-first, credit-based, affordable, and runs using free-tier infrastructure (you pay only the model APIs).

Goals (non-negotiable):

Generate = immediate credit deduction (user pays when they click Generate). Previews are part of generation and therefore paid.

Download free after final is generated.

History capped at 30 items per user (automatic eviction).

Free-tier infra: Next.js (Lovable/Vercel), FastAPI on Render, Supabase Edge for workers, MongoDB Atlas free, Cloudinary free tier, Razorpay for payments, Auth0 or Supabase Auth.

Secure & auditable: HMAC-signed worker callbacks, immutable ledger, webhooks verification.

Scalable UX: streaming for text, progressive audio playback, preview-first approach with finalization in background.

2 — High-level Architecture Diagram (visual + narrative)
                               User (browser / mobile app)
                                        |
                 +----------------------+-----------------------+
                 |                      |                       |
            Next.js UI             WebSocket Client         Learning Center
         (Lovable/Vercel)              (WS/SSE)                    |
                 |                      |                       |
                 +---------- HTTPS / JWT ----------+------------+
                                        |
                                FastAPI Backend (Render)
           +----------------------------+------------------------+----------------+
           |                            |                        |                |
       Auth (Auth0)                 Jobs API              Razorpay Webhooks   Admin APIs
                                    / Billing                 (payments)       |
           |                            |                        |                |
           +----------------------------+------------------------+----------------+
                                        |
                                  MongoDB Atlas (Atlas Free)
      (users, jobs, generations, credit_ledger, deletion_queue, audit logs, configs)
                                        |
           +----------------------------+----------------------------------------+
           |                            |                                        |
    Supabase Edge Functions     Cloudinary (previews & final assets)      WebSocket server (Railway)
      (workers invoking models)        (CDN)                                   pushes events
           |                            |
           |                            |
 +--------------------+       +-----------------+     +-----------------+
 | OpenRouter (models)|       | Fal AI (models) | ... | Other providers |
 | - GPT-4o-mini      |       | - Kling v2/1    |     | (11Labs, veed)  |
 +--------------------+       +-----------------+     +-----------------+


Narrative: Frontend sends job creation requests to backend. Backend deducts credits, writes a job record and invokes a Supabase Edge function (worker). Worker calls the model provider (OpenRouter or Fal AI), uploads preview and final to Cloudinary, then posts HMAC-signed callbacks to backend. Backend finalizes job, inserts generation record in generations, runs eviction (if necessary), and notifies clients via WebSocket. Payments go through Razorpay; their webhook triggers add credits and ledger entries.

3 — User Experience & Preview-First Flow (global rules)

Core UX rules

Generate = immediate deduction: When the user confirms a generation, backend performs atomic deduction and records ledger entry.

Preview is part of Generate: Worker produces a low-res/low-bitrate preview as the first output; delivered quickly and shown to the user.

Final produced in same job: Worker continues producing final HQ asset (may take longer). Downloading final is free.

TTS special case: full-length preview is provided (charge still applied once at Generate).

30-item history: each completed job creates a generation entry; when user’s count exceeds 30, oldest generation deleted server-side.

+10s buffer: set UI ETA = modelAvg + 10s; prefer worker heartbeats to avoid timeouts.

Why preview-first?

Reduces perceived wait time, improves trust, reduces wasted full renders if user rejects early.

4 — Credits & Billing Design (Razorpay subscriptions + one-time purchases)
Pricing & plans (your model)

Free: $0 → 500 credits/month + daily free allowances (5 text, 2 images)

Pro: multi-tiered monthly plans: 1000→64000 credits (user picks pack), monthly/yearly toggle (yearly = monthly ×12).

Enterprise: custom (contact).

One-time credits: $2.75 per 100 credits → 0.0275 USD per credit. Min 100 credits, max 90,000 per purchase. Two-way input UI: enter credits or amount — conversion rules below.

Two-way conversion & rounding

price = credits × 0.0275 (rounded to 2 decimals)

rawCredits = price / 0.0275

rounding rule: fractional part < 0.5 → floor; ≥ 0.5 → ceil (so 200.4→200, 200.5→201)

Razorpay flow (checkout + webhooks)

Frontend → POST /api/razorpay/create-order (backend creates Razorpay order or Checkout session). Include userId & metadata.

User pays on Razorpay Checkout.

Razorpay posts payment.captured, order.paid, subscription.charged events to your backend webhook.

Backend validates signature (Razorpay provides X-Razorpay-Signature) and updates credit_ledger & users.credits.

Razorpay webhooks are free to receive — you just need a public endpoint.

Credit handling rules (immediate deduction)

On Generate: backend computes cost and runs atomic decrement. If insufficient credits → return 402 / show upgrade modal.

On purchase webhook: backend adds credits; create ledger purchase.

Subscription renewals: backend receives Razorpay subscription invoice succeeded webhook, adds plan credits (top-up or reset depending on policy). Recommended: top-up (accumulate), but include UI notes for expiry if you want transient credits.

5 — Job Lifecycle: API, Worker, Callbacks & Idempotency
API endpoints (core)

POST /api/jobs/create — create job, reserve/deduct credits, return jobId. (Requires JWT)

GET /api/jobs/:id/status — get job status, preview/final URLs

POST /api/jobs/:id/callback — worker callback (HMAC-signed) with final asset metadata

POST /api/jobs/:id/preview_ready — worker notifies preview ready

POST /api/admin/users/:id/gift — admin gifts credits

POST /api/razorpay/webhook — Razorpay webhook handler

Create job flow (detailed)

Frontend sends POST /jobs/create with clientJobId, module, params.

Backend verifies JWT, computes cost = estimateCost(module, params).

Atomic step: findOneAndUpdate({ _id:userId, credits: { $gte: cost } }, { $inc: { credits: -cost } }). If fails: return insufficient credits.

Insert credit_ledger entry {userId, change:-cost, balanceAfter, reason:'generate', clientJobId}.

Insert jobs doc (status: queued).

Return jobId and invoke worker with signed token. Emit WS job_queued.

Worker flow

Worker validates invocation token.

Generate preview → upload preview to Cloudinary → POST /jobs/:id/preview_ready (HMAC).

Generate final → upload final(s) to Cloudinary → POST /jobs/:id/callback (HMAC), including usedCredits (if cost differs) or additional metadata.

Backend updates job: set status=completed, attach assets/generations, run eviction.

Idempotency

Use clientJobId to avoid duplicate jobs. Save clientJobId on job creation and reject duplicates with the same id.

Worker callbacks must be idempotent: verify job status; if job already completed, return 200 without re-applying changes.

6 — History Feature (30-item rolling) — design & deletion lifecycle
Policy

Each user can store up to 30 generations. When the 31st is created, backend deletes the oldest one (both DB doc and Cloudinary assets).

Data structure (generations)
{
  "_id": ObjectId,
  "userId": ObjectId,
  "jobId": ObjectId,
  "type": "chat|image|audio|video",
  "previewUrl": "https://res.cloudinary/...",
  "finalUrls": ["..."],
  "createdAt": ISODate,
  "sizeBytes": 12345
}

Eviction algorithm (robust)

After job completed and generation inserted:

count = db.generations.count_documents({userId})

If count > 30: n = count - 30.

Get oldest = find({userId}).sort({createdAt:1}).limit(n)

For each old: mark deletionInProgress=true then attempt Cloudinary delete for preview+final. On success delete DB doc and insert deletion_ledger. On failure insert into deletion_queue to retry with exponential backoff.

Notify user via WS: history_evicted (brief toast).

Why mark-then-delete? If the deletion step fails (Cloudinary unreachable), we avoid losing trace of assets; deletion_queue ensures retries.

7 — Data Models (Mongo collections + indexes)
users
{
  "_id", "authProviderId", "email", "name", "isAdmin", "plan", "credits", "stripeCustomerId"/"razorpayCustomerId", "createdAt"
}


Indexes: authProviderId unique, email unique.

jobs
{
  "_id","clientJobId","userId","module","params","usedCredits","status","previewUrl","finalUrls","workerMeta","createdAt","updatedAt"
}


Indexes: clientJobId unique, userId, status.

generations (history)

(as above)

Index: { userId:1, createdAt:-1 }.

credit_ledger
{ "_id", "userId", "change", "balanceAfter", "reason", "jobId", "razorpayOrderId", "adminId", "createdAt" }


Immutable audit trail.

deletion_queue
{ "_id", "generationDoc", "attempts", "nextTryAt", "createdAt" }

8 — Admin Panel & Real-time Events

Admin features:

View users: name, email, plan, credits, last activity.

Gift credits: POST /admin/users/:id/gift (atomic $inc + ledger entry).

Fix webhooks: re-process missed Razorpay events.

View deletion_queue and manually re-run deletions.

Analytics: MRR, credits sold, jobs per model.

Realtime events: WebSocket channels:

user:{userId} — job_* events, credits_added, history_evicted

admin:dashboard — purchases, refunds, alerts

Implementation note:

WebSocket server is lightweight (Node or FastAPI with websockets) hosted on Railway or Render free tier. For scale use Supabase Realtime or Pusher.

9 — Model Mapping & Provider Integration (OpenRouter + Fal AI)

OpenRouter

chat-4o-mini — chat/text generation (streaming).

gemini-2.5-flash — fast image preview / text→image preview.

Fal AI (your chosen Fal models)

Kling v2.1 pro — image→video (no audio).

11Labs v2.5 — TTS (text→speech).

veed — audio→video UGC.

Kling v1 pro ai avtar — image→video with audio (custom UGC).

Adapter layer

Implement a modelAdapter that normalizes parameters, handles preview_params vs final_params, has estimateTime, and exposes generatePreview() and generateFinal() functions. This isolates provider changes.

10 — Worker Design (Supabase Edge + robust upload/callback flow)
Why Supabase Edge?

Free-tier serverless functions, fast cold-starts, no infra to manage. Good for calling provider APIs and uploading assets.

Worker steps (very practical)

Receive invocation (with signed token).

Validate token.

If input files are needed, worker requests signed upload URLs or fetch directly from Cloudinary (if user previously uploaded).

Call modelAdapter.generatePreview() → get preview binary or URL.

Upload preview to Cloudinary with path user_{userId}/job_{jobId}/preview_v1.

POST /api/jobs/:id/preview_ready with HMAC.

Call modelAdapter.generateFinal() → upload final(s) to Cloudinary.

POST /api/jobs/:id/callback with finalUrls + usedCredits (HMAC).

Log and metrics: timeTakenPreview, timeTakenFinal.

Pseudocode (node)
// worker.js (Supabase Edge)
import { signHMAC } from './hmac'
export default async function handler(req) {
  verifyInvocationToken(req.headers['x-job-token'])
  const { jobId, jobPayload } = req.json()
  const preview = await modelAdapter.generatePreview(jobPayload)
  const previewUrl = await cloudinary.upload(preview, path)
  await backend.post(`/api/jobs/${jobId}/preview_ready`, { previewUrl }, { 'X-Signature': signHMAC(...) })
  const final = await modelAdapter.generateFinal(jobPayload)
  const finalUrl = await cloudinary.upload(final, pathFinal)
  await backend.post(`/api/jobs/${jobId}/callback`, { finalUrl }, { 'X-Signature': signHMAC(...) })
}

Retry policy

Retry provider calls 3× with exponential backoff (500ms → 2s → 8s).

If upload fails, retry 5× with backoff then insert deletion queue or job failure.

11 — Security & Anti-Abuse (detailed checklist)

Auth: Use Auth0 (free tier) or Supabase Auth for Google SSO. Backend verifies JWT on every request.

Secrets: store in Render environment variables and in Supabase function secrets.

HMAC: workers sign callbacks; backend verifies with secret + timestamp to prevent replay.

Webhooks: verify Razorpay signature header.

Rate limits: enforce per-user (e.g., 1 heavy job concurrently), per-IP limits.

CORS & CSP: strict policies.

DB access control: only backend servers allowed (Atlas IP allowlist).

Upload validation: server generates signed Cloudinary upload params & upload presets for allowed types and size limits.

reCAPTCHA: use on signup and payment forms to block bots.

Monitoring & alerting: Sentry and logs for suspicious spikes.

12 — Performance, Latency, +10s Buffer Strategy & UX tips
+10s buffer rule

displayETA = modelAvgTime + 10s

Model average times are stored per model in modelProfiles. UI uses displayETA for preview ETA.

UX performance tactics

Stream tokens for chat (immediate perceived progress).

Progressive audio: play audio chunks as they are generated.

Preview first: worker uploads preview early and notifies UI.

Signed direct uploads: user uploads go direct to Cloudinary with signed params.

Caching: prompt+params caching (sha256) — return cached asset if found.

CDN: Cloudinary + f_auto,q_auto,w_auto.

Backend performance

Keep backend stateless and light. Heavy tasks are in workers.

Use connection pooling for Mongo (pymongo with maxPoolSize config).

Use Redis only if you need very tight rate-limiting or fast ephemeral counters (optional, paid).

13 — Deployment & Scaling Strategy (free-first)

Initial (MVP, free-tier)

Frontend: Next.js on Lovable / Vercel free tier.

Backend: FastAPI on Render free tier.

Workers: Supabase Edge functions (free).

DB: MongoDB Atlas free cluster.

Storage: Cloudinary free tier.

Realtime: small WebSocket on Railway free or a Render service.

Scaling path

Increase Render instance size / count.

Move WebSocket to managed service (Pusher/Supabase Realtime).

For heavy local processing (FFmpeg), use a small pool of Render background workers or a cloud VM (GPU) only when needed.

14 — Top 10 Deployment Problems + Best Solutions (summary)

Webhook verification issues → Use signature verification & idempotency keys.

DB connection pool exhaustion → reuse single client, configure pool size.

Provider 429s → rate-limit and exponential backoff.

Duplicate jobs → clientJobId dedupe.

Cloudinary caching issues → unique file keys per job.

Worker timeout → implement heartbeat & background re-try logic.

Auth token expiry → refresh tokens & clear UX messages.

High storage costs → history eviction & compress previews.

WebSocket scaling → shard channels, use managed realtime.

Race DELETE/INSERT during eviction → mark-then-delete + deletion_queue.

15 — Operational Playbook: Monitoring, Backups, Testing, Releases

Monitoring

Error reporting: Sentry.

Metrics: job_latency, jobs_per_model, queue_length, credits_consumed.

Alerts: webhook failures, queue spike, provider error spike.

Backups

Mongo Atlas built-in backups (schedule daily).

Cloudinary: rely on cloud retention + optionally store small metadata for regenerate.

Testing

Unit tests for adapters.

Integration tests for worker callbacks.

E2E Playwright tests for UI flows.

Load tests for job create + worker.

Releases

CI/CD: GitHub Actions → push build → Render & Vercel auto-deploy.

Use feature flags and canary releases for big model changes.

16 → 21 — Per-model workflows & in-depth diagrams (condensed per model)

For each below: I include an ASCII diagram, step-by-step flow, credits math, ETA logic, common failure modes & mitigations.

16 — Chat / Text Gen (OpenRouter chat-4o-mini)
User -> /jobs/create (module=text)
Backend: deduct 0 credit (recorded), create job
Backend -> Worker -> OpenRouter chat-4o-mini (stream)
Worker -> Backend via WS -> stream to UI
Backend -> save transcript -> generations -> eviction if needed


Cost: 0 credits (but counts to daily free quota).

UX: streaming tokens, allow copy/download DOCX.

ETA: near-instant; still show buffer for long responses.

17 — Text → Image (OpenRouter Gemini 2.5 Flash)
User -> /jobs/create (module=image)
Backend: deduct 0 credit if policy says so, else compute
Worker -> Gemini preview (720) -> upload preview -> /preview_ready
Worker -> final -> final upload -> /callback
Backend: save, generation, eviction


Cost: 0 credits per your rule (but counts toward daily image quota).

Use seed + prompt caching.

18 — Image → Video (no audio) — Kling v2 pro (Fal AI)
User -> /jobs/create (module=img2vid_noaudio, duration)
Backend: cost = 100*(duration/5) credits -> deduct
Worker -> Kling v2 preview (low bitrate) -> preview upload -> preview_ready
Worker -> Kling final -> upload -> callback
Backend: finalize, insert generation, eviction -> WS notify


Credits: 100/5s; 200/10s.

ETA formula: previewAvg + 10s, finalAvg + 10s.

UI: show preview then finalizing badge.

19 — Text → Speech (11Labs v2.5 via Fal)
User -> /jobs/create (module=tts, text<=5000 chars)
Backend: cost = 100 credits -> deduct
Worker -> 11Labs TTS (generate full-length preview) -> upload -> preview_ready
Worker -> optional re-encode for higher bitrate & upload -> callback
Backend: finalize, generations, eviction


Constraints: max 5000 chars per generation; charge 100 credits per generation.

UX: progressive audio playback.

20 — Image → Video (with audio) — Kling v1 pro (custom UGC)
User -> /jobs/create (module=img2vid_audio, duration)
Backend: cost = 200/5s or 400/10s -> deduct
Worker -> generate preview with embedded audio -> upload -> preview_ready
Worker -> final HQ -> upload -> callback
Backend -> finalize + eviction


Credits: 200/5s or 400/10s

Sync audio/video carefully (ffmpeg flags, model parameters).

21 — Audio → Video (UGC via veed)
User -> /jobs/create (audio upload or select)
Backend: cost = 100 * ceil(duration_min) -> deduct
Worker -> veed preview -> upload -> preview_ready
Worker -> veed final -> upload -> callback
Backend -> finalize, record generation, eviction


Credits: 100 per minute (round up).

For long audio, chunking strategies or background batch processing recommended.

22 — Frontend Architecture & UI/UX tech stack

Recommended stack (free-first):

Next.js (React, SSG/SSR).

Tailwind CSS for rapid design system.

React Query (TanStack Query) for data fetching and cache.

Framer Motion for animations.

Auth0 or Supabase Auth for OAuth (Google).

Cloudinary for images/videos.

WebSocket client (native or socket.io client).

React Player / audio player for previews.

Vercel / Lovable for hosting front-end static & SSR.

State & UI patterns

Use React Query for job status polling and optimistic updates.

Keep local optimistic deduction of credits, but always refresh from server on job completion/failure.

23 — Dashboard Shell, Sidebar & Editor UX patterns

Sidebar with tools, history, billing, admin (if allowed).

Editor: left input pane, center action area, right preview pane.

Progressive rendering & skeleton loaders for slow networks.

Mobile: single column with bottom navigation.

24 — History UI, eviction UX & user feedback patterns

Keep history grid with filters and pagination (max 30 visible).

Eviction: show toast “Saved — your oldest item was removed to keep history under 30 items.”

Allow export as paid feature later.

25 — Billing UI & Razorpay checkout flow

One-modal for buy credits: two-way calculator, validate min/max.

For subscriptions: plan cards with monthly/yearly toggle → backend creates Razorpay subscription checkout.

Backend endpoint example (Razorpay create order):

# FastAPI pseudo
@app.post("/api/razorpay/create-order")
def create_order(payload):
    # payload: {userId, credits, amount}
    order = razorpay_client.order.create({"amount": int(amount*100), "currency":"INR", "receipt": str(uuid4()), "notes": {...}})
    saveOrderReference()
    return {"orderId": order['id'], "razorpayKey": RAZORPAY_KEY}


Webhook verify example (Razorpay signature):

@app.post("/api/razorpay/webhook")
async def razorpay_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get('x-razorpay-signature')
    if not verify_razorpay_signature(payload, signature, RAZORPAY_WEBHOOK_SECRET): abort(400)
    event = json.loads(payload)
    # handle events: payment.captured, subscription.charged, etc

26 — WebSocket & Realtime event routing

Use WS server with channels keyed by user:{userId} and admin:dashboard.

Backend emits events: job_queued, preview_ready, job_completed, credits_added, history_evicted.

Fallback: client polls GET /api/jobs/:id/status when WS unavailable.

27 — Cloudinary usage patterns

Naming: user_{userId}/job_{jobId}/preview_v1.jpg and .../final_v1.mp4.

Transforms: q_auto, f_auto for web delivery.

Signed uploads: server returns signature for direct client uploads.

Deletes: call Cloudinary API, handle errors by queuing deletion for retry.

28 — Mongo best practices

Use single MongoClient per process (connection pooling).

Use transactions when updating multiple docs (users + ledger + jobs) in one operation.

Indexes: clientJobId, userId + createdAt, job.status.

Keep ledgers append-only.

29 — Worker scaling strategy & error-handling policies

Use Supabase Edge functions for most work.

Build retry & exponential backoff for provider network errors.

Provide fallbacks: if a model is down, fallback to another model or return informative error to user.

30 — Deletion queue & safe deletion flows for assets

Put failed deletions into deletion_queue with attempts and nextTryAt.

A scheduled job (cron) retries deletion_queue.

Keep deletion_ledger for audit.

31 — Ledger & auditing model

credit_ledger is authoritative for billing. All changes to users.credits must have accompanying ledger entry.

For refunds and admin gifts, record adminId and reason.

Never mutate ledger entries.

32 — HMAC signing & verification specification

Worker → Backend signature

worker computes signature: HMAC_SHA256(secret, jobId + '|' + timestamp + '|' + payloadHash)

backend verifies timestamp within tolerance (e.g., 120s) to prevent replay.

header: X-Worker-Signature and X-Worker-Timestamp.

Razorpay webhook verification

Use Razorpay's x-razorpay-signature header and their verification method (HMAC_SHA256 comparing payload and webhook secret).

33 — Idempotency, retries and “exactly once” considerations

Idempotency keys: clientJobId on job create; razorpay_order_id on purchase.

Worker callbacks: mark job as completed only once; accept duplicates without double actions.

Webhook idempotency: store processed webhook id to avoid re-processing.

34 — Testing & QA

Unit: modelAdapter mocks.

Integration: worker → backend callback flows (simulate HMAC).

E2E: Playwright tests for full create → preview → final → history flow.

Load: simulate concurrent creations to test rate limits.

35 — Cost control & optimization tactics

Cache repeated prompts; reuse cached assets.

Preview-only quick renders: low bitrate to reduce API calls cost.

Evict aggressively (30 cap).

Use spot instances for expensive GPUs later, but avoid for MVP.

Monitor per-model cost and set per-user quotas.

For UI/UX

5 — Auth, Onboarding & Profile / Settings

Screens:

Login / Signup modal or dedicated route (Auth0 or Supabase).

Onboarding wizard (first run): ask name, reason for usage, select default voice/style—stores in profile.

Profile settings page: name, email, password change, theme toggler, language, 2FA (optional).

Subscription page: current plan, next billing date, change plan, billing receipts.

Purchase credits quick modal.

Auth flow diagram:

Client -> Auth0/Supabase (OAuth) -> Auth returns JWT -> Backend verify -> Create/fetch user in Mongo -> store authProviderId link


Implementation details:

Use Auth0 (free plan) or Supabase Auth for Google SSO — both support social login and free quotas.

Store tokens in HttpOnly Secure cookie set by backend (/auth/callback) to avoid XSS leak.

Session renewal: refresh token flow via backend if needed.

Security:

Email verification for important actions.

Use SameSite=Lax cookie for sessions.

6 — Dashboard Shell & Sidebar

Left column (sidebar) — persistent:

[Logo]
[Profile mini] -> opens settings
Tools:
 - Chat
 - Image
 - Image→Video (no audio)
 - TTS
 - Image→Video (with audio, custom UGC)
 - Audio→Video (UGC)
History
Billing & Credits
Admin (if isAdmin)


Top right:

Notification icon (bell), Learning icon (book), Avatar -> dropdown.

Main area:

Contextual workspace (tool editor) + right-hand panel (preview & job status)

Desktop wireframe:

+--------------------------------------------------+
| Sidebar | Tool workspace (editor) | Preview pane |
+--------------------------------------------------+


Mobile:

Sidebar collapses into bottom tab bar or hamburger.

Backend connection:

Dashboard uses secure APIs:

GET /users/me

GET /users/:id/credits

POST /jobs/create

GET /jobs/:id/status

GET /users/:id/history

WebSocket listens to user:{userId} for job updates and notifications.

UI rules:

Default dashboard theme = dark; landing theme = light. Add a theme toggle in header. Persist user preference in user profile (backend) and in localStorage for unauthenticated preview.

7 — Tool Editor UI pattern (shared for all 6 tools)

Design pattern: single reusable Editor component with slight variations per tool.

Shared layout:

[Top bar with tool name + cost estimator]
[Left pane: inputs (prompts, files, options, templates)]
[Center: action area (Generate button + examples)]
[Right: Preview pane (preview media, progress, accept/download)]
[Bottom: History quick row]


Per-tool specifics (quick):

Chat: textarea + model selector + temperature slider; streamed response in preview pane.

Image: prompt input, aspect ratio, style presets, seed, number of images; show tiled results.

Image→Video (no audio): upload images or prompt; duration selector (5s/10s); quality toggle; show time estimate + credits.

Text→Speech: textarea, voice selector, pitch, speed; show waveform player on preview.

Image→Video with audio (custom UGC): image inputs + upload audio or TTS integration; sync controls.

Audio→Video: upload audio + template chooser; preview thumbnails for snapshots.

Generate button behavior:

On click: show confirmation modal with cost, ETA, used credits (clear)

Optimistic UI: immediately add queued card to History and decrement credits in frontend state (but final authority is backend). If backend fails, restore credits in UI.

Preview pane UI:

Show Preview tag (small), Play button, Accept/Re-generate/Delete.

If final not ready, show Finalizing… progress bar and a small ETA (preview ETA + 10s buffer).

Accessibility:

Keyboard shortcuts for generate (Ctrl+Enter), cancel (Esc), next/previous result.

Animations:

Use Framer Motion for subtle transitions: result cards fade in + scale, progress bars animate smoothly.

8 — History, eviction, previews and downloads (user experience)

History screen wireframe:

[Filter tabs: All | Chat | Images | Audio | Video]
[List/Grid of last 30 items - newest first]
Each item: thumbnail (img/video), small meta (type/date/credits), actions: Play/View | Download | Delete
Footer: "You have X/30 saved" & CTA "Buy more storage (future)"


Eviction UX:

Eviction is automatic and silent by default, but show a subtle toast:
“Saved — oldest entry removed to keep history to 30 items.”

Option: Admin or PRO feature: enable “Archive” or export before eviction (paid future feature).

Frontend eviction flow (diagram):

User generates -> backend completes job -> backend inserts generation -> backend checks count -> if >30, backend deletes oldest files from Cloudinary and DB -> backend emits WS event `history_evicted` -> frontend updates UI


Implementation notes:

Avoid race conditions: backend does eviction server-side after job finalization (not client).

Show a “Recently removed” banner for 10 seconds with Undo only if you implement temporary retention (adds storage).

Storage management:

Previews & final stored in Cloudinary; naming convention:
/user_{userId}/job_{jobId}/preview_v1.jpg
/user_{userId}/job_{jobId}/final_v1.mp4

Deletion: backend calls Cloudinary delete API then removes DB doc (or mark for retry if deletion fails).

9 — Billing & Credits UI (subscription + one-time purchase)

Key screens:

Plans grid (Free / Pro tiers droplist / Enterprise contact)

Plan detail modal with credits chart & monthly/yearly toggle

One-time purchase modal (input credits OR amount — bidirectional calc)

Checkout flow: open Stripe Checkout from backend; show spinner until session created.

Purchase UX:

User clicks Buy Credits or Upgrade -> show modal with validation rules (min 100, max 90000).

Show calculated price and credits (two-way input). Use integer rounding rules as you defined.

Click Pay -> call backend POST /stripe/create-checkout-session with metadata (userId, credits).

On checkout.session.completed Stripe webhook -> backend adds credits, emits WS event credits_added.

Frontend receives WS credits_added and updates credit balance in real-time.

Subscription UX:

Plans with monthly/yearly toggle.

Subscribed users see “Next invoice” and “Cancel Subscription” (calls backend which hits Stripe API).

UI microcopy:

Always show “Credits will be deducted on Generate” under generate buttons and in modals.

Show current credits, used today, monthly usage, estimated days left for Pro users.

Security:

Do not embed Stripe keys in frontend. Backend creates session & returns session URL redirected to Stripe.

10 — Notifications, Learning Center, Admin & Integration UX

Notifications:

Bell icon with unread count, dropdown of latest events (job_ready, credit_added, payment succeeded).

Real-time via WebSocket. Each notification linked to job or page.

Learning Center:

Lightweight docs: “How to get best prompts”, FAQ video tutorials, templates gallery.

Link directly from tools (contextual tips).

Optional inline coach tips (small tooltip next to inputs).

Admin Panel:

Accessible only to users with isAdmin.

Admin features: view users, gift credits modal, revenue summary, job failure log.

Realtime feed of payments and history_eviction.

Integration diagrams (end-to-end) — 3 key flows:

Generate job

User (UI) --POST /jobs/create--> Backend (FastAPI) 
    Backend -> MongoDB (reserve credits & create job)
    Backend -> Worker (Supabase) with signed token
    Worker -> Model provider (OpenRouter/Fal)
    Worker -> Cloudinary (upload preview)
    Worker --POST--> Backend /jobs/:id/preview_ready (HMAC)
    Backend -> WebSocket -> UI (preview ready)
    Worker -> Cloudinary (upload final)
    Worker --POST--> Backend /jobs/:id/callback (HMAC)
    Backend -> MongoDB (job completed), score ledger, emit completed


Purchase credits

User (UI) -> Backend /create-checkout-session -> Stripe (Checkout)
Stripe -> Backend (webhook: checkout.session.completed) -> Backend adds credits -> WebSocket notify -> UI update


History eviction

Backend (after job complete) -> check count -> if >30 -> delete oldest(s) from Cloudinary -> delete DB record -> create deletion_ledger -> emit 'history_evicted' -> UI update

Cross-cutting Technical Recommendations (free-first, scale-safe)

Frontend tech:

Next.js (React) — hosted on Lovable/Vercel free tier.

Tailwind CSS for utility styling (free).

Framer Motion for animation (free).

Headless UI or shadcn/ui for accessible components (free).

lucide-react for icons (free).

Use next/image or Cloudinary transformations for optimized images.

State & data:

React Query (TanStack Query) for caching API requests, optimistic updates and retries.

SWR or React Query both free — I recommend React Query for complex workflows.

Local store: prefer React Context + React Query; keep sensitive tokens on cookies.

Real-time:

Simple WebSocket server on Railway (free) or use Supabase Realtime (if you migrate to Postgres).

Use event channels by userId for secure event routing.

Security:

Store session token in HttpOnly cookie set by backend after OAuth handshake.

For uploads use signed Cloudinary upload presets; do not expose upload secrets.

HMAC sign worker callbacks.

Performance & UX:

Skeleton loaders for previews; stream text & partial audio for perceived speed.

Code split per tool route (Next.js dynamic imports).

Use CDN for static assets.

Lazy-load history thumbnails.

Accessibility:

All interactive elements keyboard accessible.

Provide alt text for images; captions for videos; transcript for audio.

Testing & QA:

Unit test components with Jest + React Testing Library.

End-to-end tests with Playwright for critical flows (generate -> preview -> final -> history).

Final checklist to hand to designer & dev (actionable)

Create a design system: color tokens, spacing scale, typography scale, icon set.

Build reusable components: Sidebar, TopBar, Card, Modal, Toast, ResultCard, Player.

Implement Auth first (Auth0/Supabase) and profile flow.

Implement Credits display + simple mock POST /jobs/create to test UI flows.

Implement Worker stub that returns preview after X seconds to simulate pipeline.

Implement History UI & eviction demo (simulate older items deletion).

Integrate Stripe Checkout last after flows are stable.


Important Note: Replace word stripe with razorpay. cause in india there is only razorpay avalable. 
and i will also use supabase for auth0. as the structure, system design and architecture build perfect app. 
see my razorpay is not approve so i will give you demo account api of razorpay for how api, pricing 
and credit system and all that works with our app. as you know its not include real money its just a
demo checkout system with razorpay. make it perfect and make it like you are expert software developer in google.