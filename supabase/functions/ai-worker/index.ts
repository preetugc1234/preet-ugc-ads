/**
 * Supabase Edge Function for AI model processing
 * Handles all 6 AI workflows with HMAC-signed callbacks
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Configuration
const BACKEND_URL = Deno.env.get('BACKEND_URL') || 'https://preet-ugc-ads.onrender.com'
const HMAC_SECRET = Deno.env.get('WORKER_HMAC_SECRET') || 'your-worker-hmac-secret-key'
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const FAL_API_KEY = Deno.env.get('FAL_API_KEY')

// Types
interface JobPayload {
  jobId: string
  module: string
  params: Record<string, any>
  userId: string
}

interface ModelConfig {
  name: string
  provider: string
  model: string
  avg_time_seconds: number
}

// Module configurations (matching backend)
const MODULE_CONFIGS: Record<string, ModelConfig> = {
  "chat": {
    name: "Chat/Text Generation",
    provider: "openrouter",
    model: "openai/gpt-4o-mini",
    avg_time_seconds: 5
  },
  "image": {
    name: "Text to Image",
    provider: "openrouter",
    model: "google/gemini-flash-1.5",
    avg_time_seconds: 15
  },
  "img2vid_noaudio": {
    name: "Image to Video (No Audio)",
    provider: "fal",
    model: "fal-ai/kling-video-v1/pro/image-to-video",
    avg_time_seconds: 45
  },
  "tts": {
    name: "Text to Speech",
    provider: "fal",
    model: "fal-ai/elevenlabs-text-to-speech",
    avg_time_seconds: 10
  },
  "img2vid_audio": {
    name: "Image to Video (With Audio)",
    provider: "fal",
    model: "fal-ai/kling-video-v1/image-to-video",
    avg_time_seconds: 60
  },
  "audio2vid": {
    name: "Audio to Video",
    provider: "veed",
    model: "veed-ugc",
    avg_time_seconds: 90
  }
}

// HMAC utilities
function generateHMAC(jobId: string, timestamp: string, payloadHash: string): string {
  const message = `${jobId}|${timestamp}|${payloadHash}`
  const key = new TextEncoder().encode(HMAC_SECRET)
  const data = new TextEncoder().encode(message)

  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(cryptoKey =>
    crypto.subtle.sign('HMAC', cryptoKey, data)
  ).then(signature =>
    Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

// Cloudinary upload utility
async function uploadToCloudinary(file: Blob, path: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'ugc_ai_preset') // You'll need to create this
  formData.append('public_id', path)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${Deno.env.get('CLOUDINARY_CLOUD_NAME')}/auto/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  const result = await response.json()
  return result.secure_url
}

// AI model adapters
class ModelAdapter {
  static async generatePreview(module: string, params: Record<string, any>): Promise<Blob> {
    const config = MODULE_CONFIGS[module]

    switch (config.provider) {
      case 'openrouter':
        return await this.processOpenRouter(config.model, params, true)
      case 'fal':
        return await this.processFal(config.model, params, true)
      case 'veed':
        return await this.processVeed(config.model, params, true)
      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  static async generateFinal(module: string, params: Record<string, any>): Promise<Blob> {
    const config = MODULE_CONFIGS[module]

    switch (config.provider) {
      case 'openrouter':
        return await this.processOpenRouter(config.model, params, false)
      case 'fal':
        return await this.processFal(config.model, params, false)
      case 'veed':
        return await this.processVeed(config.model, params, false)
      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  private static async processOpenRouter(model: string, params: Record<string, any>, isPreview: boolean): Promise<Blob> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://preet-ugc-ads.lovable.app',
        'X-Title': 'UGC AI Platform'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: params.prompt || params.text || 'Generate content' }
        ],
        max_tokens: isPreview ? 150 : 500,
        temperature: 0.7
      })
    })

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || 'Generated content'

    // Convert text to blob for consistency
    return new Blob([content], { type: 'text/plain' })
  }

  private static async processFal(model: string, params: Record<string, any>, isPreview: boolean): Promise<Blob> {
    const response = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...params,
        image_size: isPreview ? '512x512' : '1024x1024',
        num_inference_steps: isPreview ? 20 : 50
      })
    })

    const result = await response.json()

    // Handle different response formats
    let mediaUrl: string
    if (result.images && result.images[0]) {
      mediaUrl = result.images[0].url
    } else if (result.video && result.video.url) {
      mediaUrl = result.video.url
    } else if (result.audio_url) {
      mediaUrl = result.audio_url
    } else {
      throw new Error('No media generated from Fal AI')
    }

    // Fetch the actual media file
    const mediaResponse = await fetch(mediaUrl)
    return await mediaResponse.blob()
  }

  private static async processVeed(model: string, params: Record<string, any>, isPreview: boolean): Promise<Blob> {
    // For demo purposes, return a mock video blob
    // In production, integrate with actual VEED API
    const mockVideoData = new Uint8Array([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // MP4 header
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32
    ])

    return new Blob([mockVideoData], { type: 'video/mp4' })
  }
}

// Worker callback functions
async function sendPreviewReady(jobId: string, previewUrl: string): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payload = JSON.stringify({ preview_url: previewUrl, preview_meta: {} })
  const payloadHash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)))
  ).map(b => b.toString(16).padStart(2, '0')).join('')

  const signature = await generateHMAC(jobId, timestamp, payloadHash)

  await fetch(`${BACKEND_URL}/api/jobs/${jobId}/preview_ready`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Worker-Signature': signature,
      'X-Worker-Timestamp': timestamp
    },
    body: payload
  })
}

async function sendJobComplete(jobId: string, finalUrls: string[], generationType: string): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payload = JSON.stringify({
    status: 'completed',
    final_urls: finalUrls,
    worker_meta: { processed_at: new Date().toISOString() },
    generation_type: generationType,
    size_bytes: 1024 // Mock size
  })

  const payloadHash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)))
  ).map(b => b.toString(16).padStart(2, '0')).join('')

  const signature = await generateHMAC(jobId, timestamp, payloadHash)

  await fetch(`${BACKEND_URL}/api/jobs/${jobId}/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Worker-Signature': signature,
      'X-Worker-Timestamp': timestamp
    },
    body: payload
  })
}

// Main worker function
async function processJob(jobPayload: JobPayload): Promise<void> {
  const { jobId, module, params, userId } = jobPayload

  try {
    console.log(`Processing job ${jobId} for module ${module}`)

    // Generate preview
    const preview = await ModelAdapter.generatePreview(module, params)
    const previewPath = `user_${userId}/job_${jobId}/preview_v1`
    const previewUrl = await uploadToCloudinary(preview, previewPath)

    // Send preview ready callback
    await sendPreviewReady(jobId, previewUrl)

    // Generate final
    const final = await ModelAdapter.generateFinal(module, params)
    const finalPath = `user_${userId}/job_${jobId}/final_v1`
    const finalUrl = await uploadToCloudinary(final, finalPath)

    // Send completion callback
    await sendJobComplete(jobId, [finalUrl], module)

    console.log(`Job ${jobId} completed successfully`)

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error)

    // Send failure callback
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const payload = JSON.stringify({
      status: 'failed',
      error_message: error.message,
      worker_meta: { failed_at: new Date().toISOString() }
    })

    const payloadHash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)))
    ).map(b => b.toString(16).padStart(2, '0')).join('')

    const signature = await generateHMAC(jobId, timestamp, payloadHash)

    await fetch(`${BACKEND_URL}/api/jobs/${jobId}/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Signature': signature,
        'X-Worker-Timestamp': timestamp
      },
      body: payload
    })
  }
}

// Edge Function handler
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const jobPayload: JobPayload = await req.json()

    // Validate payload
    if (!jobPayload.jobId || !jobPayload.module || !MODULE_CONFIGS[jobPayload.module]) {
      return new Response('Invalid job payload', { status: 400 })
    }

    // Process job asynchronously (fire and forget)
    processJob(jobPayload).catch(console.error)

    return new Response(
      JSON.stringify({ success: true, message: 'Job processing started' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Worker error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})