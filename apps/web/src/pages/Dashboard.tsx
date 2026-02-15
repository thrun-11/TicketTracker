import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../store/slices/projectsSlice'
import { AppDispatch, RootState } from '../store'
import { api } from '../api/client'
import type { Issue } from '../types'

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { projects, isLoading: projectsLoading } = useSelector((state: RootState) => state.projects)
  const { user } = useSelector((state: RootState) => state.auth)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loadingIssues, setLoadingIssues] = useState(true)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get<Issue[]>('/issues')
        setIssues(response.data)
      } catch {
      } finally {
        setLoadingIssues(false)
      }
    }
    fetchIssues()
  }, [])

  const stats = useMemo(() => {
    const openIssues = issues.filter(i => i.status === 'backlog' || i.status === 'todo').length
    const inProgressIssues = issues.filter(i => i.status === 'in_progress').length
    const completedIssues = issues.filter(i => i.status === 'done').length
    return { openIssues, inProgressIssues, completedIssues }
  }, [issues])

  if (projectsLoading || loadingIssues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening in your projects
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Open Issues</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{stats.openIssues}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">In Progress</div>
          <div className="text-2xl font-semibold text-primary-600 mt-1">{stats.inProgressIssues}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Completed</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">{stats.completedIssues}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Projects</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{projects.length}</div>
        </div>
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-600 mb-4">No projects yet. Create your first project!</p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}/board`}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:border-primary-500 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                    {project.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.type}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link
              to="/projects"
              className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:border-primary-500 hover:text-primary-600 transition-all"
            >
              <span className="text-2xl mb-1">+</span>
              <span className="text-sm font-medium">Create New Project</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
