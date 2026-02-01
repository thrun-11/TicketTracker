import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Projects from './pages/Projects'
import ProjectBoard from './pages/ProjectBoard'
import IssueDetail from './pages/IssueDetail'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId/board" element={<ProjectBoard />} />
          <Route path="issues/:issueId" element={<IssueDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
