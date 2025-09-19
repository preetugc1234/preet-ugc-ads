/**
 * User Profile Component
 * Displays and manages user profile information, credits, and account settings
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { api, apiHelpers } from '../../lib/api'
import { useToast } from '../../hooks/use-toast'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

import {
  User,
  CreditCard,
  Settings,
  Calendar,
  TrendingUp,
  Edit3,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export function UserProfile() {
  const { user, refreshUser, signOut } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [newName, setNewName] = useState(user?.name || '')

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: api.getUserStats,
    enabled: !!user
  })

  // Fetch credit balance
  const { data: creditBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['creditBalance'],
    queryFn: api.getCreditBalance,
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string }) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
      refreshUser()
      setIsEditingProfile(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: apiHelpers.handleApiError(error),
        variant: "destructive"
      })
    }
  })

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid name.",
        variant: "destructive"
      })
      return
    }

    updateProfileMutation.mutate({ name: newName.trim() })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out.",
        variant: "destructive"
      })
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro':
        return 'default'
      case 'enterprise':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No user data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {user.name}
                  {user.is_admin && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            <div className="text-right space-y-1">
              <Badge variant={getPlanBadgeVariant(user.plan)}>
                {user.plan.toUpperCase()} Plan
              </Badge>
              <p className="text-sm text-muted-foreground">
                Member since {apiHelpers.formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {balanceLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    apiHelpers.formatCredits(creditBalance?.credits || user.credits)
                  )}
                </span>
                <span className="text-muted-foreground">credits</span>
              </div>
            </div>

            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Generations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                userStats?.total_generations || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              AI content created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credits Used
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                apiHelpers.formatCredits(userStats?.credits_used_total || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total credits spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Active
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Plan Management</h4>
              <p className="text-sm text-muted-foreground">
                Upgrade or manage your subscription plan
              </p>
            </div>
            <Button variant="outline" disabled>
              Manage Plan
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sign Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfile