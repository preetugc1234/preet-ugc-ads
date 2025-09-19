/**
 * Credit History Component
 * Displays user's credit transactions and balance information
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, apiHelpers, CreditTransaction } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'

import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Loader2
} from 'lucide-react'

export function CreditHistory() {
  const { user } = useAuth()
  const [limit, setLimit] = useState(20)

  // Fetch credit history
  const {
    data: creditHistory,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['creditHistory', limit],
    queryFn: () => api.getCreditHistory(limit),
    enabled: !!user
  })

  const getTransactionIcon = (change: number) => {
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getTransactionColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getReasonBadge = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'generate':
        return <Badge variant="outline">Generation</Badge>
      case 'purchase':
        return <Badge variant="default">Purchase</Badge>
      case 'admin gift':
        return <Badge variant="secondary">Gift</Badge>
      case 'refund':
        return <Badge variant="outline">Refund</Badge>
      default:
        return <Badge variant="outline">{reason}</Badge>
    }
  }

  const formatChange = (change: number) => {
    const prefix = change > 0 ? '+' : ''
    return `${prefix}${apiHelpers.formatCredits(change)}`
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                apiHelpers.formatCredits(creditHistory?.current_balance || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earned
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                apiHelpers.formatCredits(creditHistory?.total_earned || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Credits received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                apiHelpers.formatCredits(creditHistory?.total_spent || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Credits used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent credit transactions and usage
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Failed to load transaction history</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : !creditHistory?.transactions?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Your credit activity will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {creditHistory.transactions.map((transaction: CreditTransaction, index: number) => (
                  <div key={transaction.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.change)}
                        <div>
                          <div className="flex items-center gap-2">
                            {getReasonBadge(transaction.reason)}
                            <span className="text-sm text-muted-foreground">
                              {apiHelpers.formatDateTime(transaction.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Balance: {apiHelpers.formatCredits(transaction.balance_after)} credits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${getTransactionColor(transaction.change)}`}>
                          {formatChange(transaction.change)} credits
                        </div>
                        {transaction.job_id && (
                          <p className="text-xs text-muted-foreground">
                            Job: {transaction.job_id.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < creditHistory.transactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Load More Button */}
          {creditHistory?.transactions?.length === limit && (
            <div className="text-center pt-4 border-t mt-4">
              <Button
                variant="outline"
                onClick={() => setLimit(prev => prev + 20)}
                disabled={isLoading}
              >
                Load More Transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filter Transactions
            </Button>
            <Button variant="outline" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              View by Date Range
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Additional features coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreditHistory