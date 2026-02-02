import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { Project } from '../../types'

interface ProjectsState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
}

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects')
    return response.data
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post<Project>('/projects', data)
    return response.data
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.projects = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch projects'
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload)
      })
  },
})

export const { setCurrentProject } = projectsSlice.actions
export default projectsSlice.reducer
