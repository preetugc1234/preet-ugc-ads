/**
 * React Query hooks for job management
 * Handles job creation, status polling, and history management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiHelpers } from '@/lib/api'
import { toast } from 'sonner'

// Job creation hook with optimistic updates
export const useCreateJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobData: {
      module: string
      params: Record<string, any>
      client_job_id?: string
    }) => {
      // Generate client job ID if not provided
      const clientJobId = jobData.client_job_id || apiHelpers.generateClientJobId()

      return api.createJob({
        ...jobData,
        client_job_id: clientJobId
      })
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for user profile (credits)
      await queryClient.cancelQueries({ queryKey: ['user', 'profile'] })

      // Snapshot the previous credits
      const previousUser = queryClient.getQueryData(['user', 'profile'])

      // Optimistically update credits
      const estimatedCost = apiHelpers.estimateJobCost(variables.module, variables.params)
      if (previousUser && estimatedCost > 0) {
        queryClient.setQueryData(['user', 'profile'], (old: any) => ({
          ...old,
          credits: Math.max(0, (old?.credits || 0) - estimatedCost)
        }))
      }

      return { previousUser }
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousUser) {
        queryClient.setQueryData(['user', 'profile'], context.previousUser)
      }

      toast.error('Failed to create job: ' + apiHelpers.handleApiError(error))
    },
    onSuccess: (data) => {
      // Invalidate and refetch user profile to get actual credits
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })

      // Invalidate job lists
      queryClient.invalidateQueries({ queryKey: ['jobs'] })

      toast.success('Job created successfully!')
    }
  })
}

// Job status polling hook
export const useJobStatus = (jobId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['job', 'status', jobId],
    queryFn: () => jobId ? api.getJobStatus(jobId) : null,
    enabled: enabled && !!jobId,
    refetchInterval: (data) => {
      // Poll every 3 seconds if job is still processing
      if (data?.status === 'queued' || data?.status === 'processing' || data?.status === 'preview_ready') {
        return 3000
      }
      // Stop polling if completed or failed
      return false
    },
    staleTime: 0, // Always consider stale to enable polling
  })
}

// User jobs list
export const useUserJobs = (status?: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['jobs', 'user', { status, limit }],
    queryFn: () => api.getUserJobs(status, limit),
    staleTime: 30000, // 30 seconds
  })
}

// User generation history
export const useUserHistory = () => {
  return useQuery({
    queryKey: ['jobs', 'history'],
    queryFn: () => api.getUserHistory(),
    staleTime: 60000, // 1 minute
  })
}

// Available AI modules
export const useAvailableModules = () => {
  return useQuery({
    queryKey: ['jobs', 'modules'],
    queryFn: () => api.getAvailableModules(),
    staleTime: 5 * 60 * 1000, // 5 minutes - modules rarely change
  })
}

// Job cancellation
export const useCancelJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => api.cancelJob(jobId),
    onSuccess: (data, jobId) => {
      // Invalidate job status
      queryClient.invalidateQueries({ queryKey: ['job', 'status', jobId] })

      // Invalidate job lists
      queryClient.invalidateQueries({ queryKey: ['jobs'] })

      // Invalidate user profile to refresh credits (refund)
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })

      toast.success('Job cancelled successfully')
    },
    onError: (error) => {
      toast.error('Failed to cancel job: ' + apiHelpers.handleApiError(error))
    }
  })
}

// Job retry
export const useRetryJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => api.retryJob(jobId),
    onSuccess: (data, jobId) => {
      // Invalidate job status
      queryClient.invalidateQueries({ queryKey: ['job', 'status', jobId] })

      // Invalidate job lists
      queryClient.invalidateQueries({ queryKey: ['jobs'] })

      toast.success('Job queued for retry')
    },
    onError: (error) => {
      toast.error('Failed to retry job: ' + apiHelpers.handleApiError(error))
    }
  })
}

// Admin queue status (admin only)
export const useQueueStatus = (enabled: boolean = false) => {
  return useQuery({
    queryKey: ['jobs', 'queue', 'status'],
    queryFn: () => api.getQueueStatus(),
    enabled,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000, // 15 seconds
  })
}

// Cost estimation helper
export const useEstimateJobCost = () => {
  return useMutation({
    mutationFn: ({ module, params }: { module: string; params: Record<string, any> }) =>
      api.estimateJobCost(module, params),
    onError: (error) => {
      toast.error('Failed to estimate cost: ' + apiHelpers.handleApiError(error))
    }
  })
}

// Real-time job updates hook (using WebSocket when available)
export const useJobRealtime = (jobId: string | null) => {
  const queryClient = useQueryClient()

  // This would integrate with WebSocket for real-time updates
  // For now, we rely on polling with useJobStatus

  // TODO: Implement WebSocket connection when available
  // useEffect(() => {
  //   if (!jobId) return
  //
  //   const ws = new WebSocket(`${WS_URL}/jobs/${jobId}`)
  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data)
  //     queryClient.setQueryData(['job', 'status', jobId], data)
  //   }
  //
  //   return () => ws.close()
  // }, [jobId, queryClient])
}

// Batch job operations
export const useBatchJobOperations = () => {
  const queryClient = useQueryClient()

  const cancelMultiple = useMutation({
    mutationFn: async (jobIds: string[]) => {
      const results = await Promise.allSettled(
        jobIds.map(id => api.cancelJob(id))
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      toast.success('Batch operation completed')
    }
  })

  return { cancelMultiple }
}