import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Projects from './pages/Projects'
import ProjectBoard from './pages/ProjectBoard'
import IssueDetail from './pages/IssueDetail'
import Workspaces from './pages/Workspaces'
import WorkspaceDetail from './pages/WorkspaceDetail'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Sprints from './pages/Sprints'
import TimeTracking from './pages/TimeTracking'
import Labels from './pages/Labels'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId/board" element={<ProjectBoard />} />
            <Route path="projects/:projectId/sprints" element={<Sprints />} />
            <Route path="projects/:projectId/labels" element={<Labels />} />
            <Route path="issues/:issueId" element={<IssueDetail />} />
            <Route path="issues/:issueId/time-tracking" element={<TimeTracking />} />
            <Route path="workspaces" element={<Workspaces />} />
            <Route path="workspaces/:workspaceId" element={<WorkspaceDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
