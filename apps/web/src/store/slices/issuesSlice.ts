import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { Issue } from '../../types'

interface IssuesState {
  issues: Issue[]
  currentIssue: Issue | null
  isLoading: boolean
  error: string | null
}

const initialState: IssuesState = {
  issues: [],
  currentIssue: null,
  isLoading: false,
  error: null,
}

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/issues`)
    return response.data
  }
)

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async ({ projectId, data }: { projectId: string; data: Partial<Issue> }) => {
    const response = await api.post(`/projects/${projectId}/issues`, data)
    return response.data
  }
)

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ issueId, data }: { issueId: string; data: Partial<Issue> }) => {
    const response = await api.put(`/issues/${issueId}`, data)
    return response.data
  }
)

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setCurrentIssue: (state, action: PayloadAction<Issue | null>) => {
      state.currentIssue = action.payload
    },
    updateIssueStatus: (state, action: PayloadAction<{ issueId: string; status: string }>) => {
      const issue = state.issues.find(i => i.id === action.payload.issueId)
      if (issue) {
        issue.status = action.payload.status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.isLoading = false
        state.issues = action.payload
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch issues'
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.issues.push(action.payload)
      })
      .addCase(updateIssue.fulfilled, (state, action) => {
        const index = state.issues.findIndex(i => i.id === action.payload.id)
        if (index !== -1) {
          state.issues[index] = action.payload
        }
      })
  },
})

export const { setCurrentIssue, updateIssueStatus } = issuesSlice.actions
export default issuesSlice.reducer
