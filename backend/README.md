# UGC AI Backend

Backend API for the UGC AI Platform - AI-powered video content generation.

## Quick Start

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
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
- `GET /api/jobs/:id` - Get job status
- `GET /api/jobs/user/history` - User job history
- `POST /api/jobs/:id/callback` - Job callback

### Generation
- `POST /api/generate/chat` - Chat generation (Free)
- `POST /api/generate/image` - Image generation (Free)
- `POST /api/generate/image-to-video` - Image to video (100-200 credits)
- `POST /api/generate/text-to-speech` - Text to speech (100 credits)
- `POST /api/generate/audio-to-video` - Audio to video (100/min)
- `POST /api/generate/ugc-video` - UGC video (200-400 credits)

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Payment webhook
- `GET /api/payments/history` - Payment history

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

This backend is configured for Render deployment. Push to GitHub and connect to Render for auto-deployment.

## Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** Supabase Auth + JWT
- **AI Services:** OpenRouter, Fal AI
- **Payments:** Razorpay
- **Storage:** Cloudinary
- **Deployment:** Render