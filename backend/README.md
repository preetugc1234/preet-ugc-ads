# UGC AI Backend (FastAPI)

Backend API for the UGC AI Platform - AI-powered video content generation using FastAPI and Python.

## Quick Start

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Start development server
uvicorn main:app --reload --port 8000

# Or use the run script
python main.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/credits` - Get user credits
- `POST /api/users/credits/add` - Add credits

### Jobs
- `POST /api/jobs/create` - Create new job
- `GET /api/jobs/{job_id}` - Get job status
- `GET /api/jobs/user/history` - User job history
- `POST /api/jobs/{job_id}/callback` - Job callback

### Generation
- `POST /api/generate/chat` - Chat generation (Free)
- `POST /api/generate/image` - Image generation (Free)
- `POST /api/generate/image-to-video` - Image to video (100-200 credits)
- `POST /api/generate/text-to-speech` - Text to speech (100 credits)
- `POST /api/generate/audio-to-video` - Audio to video (100/min)
- `POST /api/generate/ugc-video` - UGC video (200-400 credits)

### Payments (Razorpay Demo)
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Payment webhook
- `GET /api/payments/history` - Payment history

## Environment Variables

See `.env.example` for all required environment variables.

## Docker Deployment

```bash
# Build Docker image
docker build -t ugc-ai-backend .

# Run container
docker run -p 8000:8000 --env-file .env ugc-ai-backend
```

## Render Deployment

For Render deployment:
1. **Environment**: Python 3.11
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Root Directory**: `backend`

## Tech Stack

- **Framework:** FastAPI (Python 3.11+)
- **Database:** MongoDB with Motor (async)
- **Auth:** Supabase Auth + JWT
- **AI Services:** OpenRouter, Fal AI
- **Payments:** Razorpay (Demo mode)
- **Storage:** Cloudinary
- **Deployment:** Render (Dockerized)

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc