import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useTimeLogForm } from '../hooks/useTimeLogForm'
import { Modal } from '../components/Modal'
import TimeLogForm, { TimeLogFormData } from '../components/TimeLogForm'
import { FormProvider } from 'react-hook-form'
import { Clock, Calendar as CalendarIcon, Plus, Trash2, BarChart3 } from 'lucide-react'
import type { TimeLog, Issue } from '../types'

export default function TimeTracking() {
  const { issueId } = useParams<{ issueId: string }>()
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  const { success, error } = useToast()
  const methods = useTimeLogForm()

  const fetchTimeLogs = useCallback(async () => {
    if (!issueId) return
    setLoading(true)
    try {
      const [timeLogsResponse, issueResponse] = await Promise.all([
        api.get<TimeLog[]>(`/issues/${issueId}/time-logs`),
        api.get<Issue>(`/issues/${issueId}`),
      ])
      setTimeLogs(timeLogsResponse.data)
      setIssue(issueResponse.data)
    } catch {
      error('Failed to load time logs')
    } finally {
      setLoading(false)
    }
  }, [issueId, error])

  const handleLogTime = async (data: TimeLogFormData) => {
    if (!issueId) return
    try {
      await api.post(`/issues/${issueId}/time-logs`, {
        timeSpent: parseInt(data.timeSpent, 10),
        description: data.description,
        spentDate: data.spentDate,
      })
      success('Time logged successfully')
      setIsLogModalOpen(false)
      methods.reset()
      fetchTimeLogs()
    } catch {
      error('Failed to log time')
    }
  }

  const handleDeleteTimeLog = async (timeLogId: string) => {
    if (!confirm('Are you sure you want to delete this time log?')) return
    try {
      await api.delete(`/time-logs/${timeLogId}`)
      success('Time log deleted')
      fetchTimeLogs()
    } catch {
      error('Failed to delete time log')
    }
  }

  useEffect(() => {
    fetchTimeLogs()
  }, [fetchTimeLogs])

  const totalTime = timeLogs.reduce((acc, log) => acc + log.timeSpent, 0)
  const totalHours = Math.floor(totalTime / 60)
  const totalMinutes = totalTime % 60

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted/20 animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted/20 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          {issue && (
            <Link
              to={`/issues/${issue.id}`}
              className="text-primary hover:text-primary/80 text-sm font-medium inline-block mb-4"
            >
              ← Back to issue
            </Link>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
              <p className="text-muted-foreground mt-1">
                {issue ? `Track time for ${issue.title}` : 'Track time across issues'}
              </p>
            </div>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Log Time
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold text-foreground">{totalHours}h {totalMinutes}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Entries</p>
                <p className="text-2xl font-bold text-foreground">{timeLogs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average per Entry</p>
                <p className="text-2xl font-bold text-foreground">
                  {timeLogs.length > 0 ? formatTime(Math.round(totalTime / timeLogs.length)) : '0h 0m'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Logs List */}
        <div className="bg-white border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Time Logs</h2>
          </div>

          {timeLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No time logs yet</h3>
              <p className="text-muted-foreground">Start tracking time by clicking "Log Time" above</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {timeLogs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-foreground">
                          {formatTime(log.timeSpent)}
                        </span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                          {new Date(log.spentDate).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          by {log.userId}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteTimeLog(log.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                      title="Delete log"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Time"
        size="lg"
      >
        <FormProvider {...methods}>
          <TimeLogForm
            onSubmit={handleLogTime}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Log Time"
          />
        </FormProvider>
      </Modal>
    </>
  )
}
