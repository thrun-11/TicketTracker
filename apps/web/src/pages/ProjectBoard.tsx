import { useParams } from 'react-router-dom'

export default function ProjectBoard() {
  const { projectId } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Project Board</h1>
      <p className="text-slate-600 mt-2">Project ID: {projectId}</p>

      {/* Placeholder for Kanban board */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {['To Do', 'In Progress', 'Review', 'Done'].map((column) => (
          <div
            key={column}
            className="bg-slate-100 rounded-lg p-4 min-h-[400px]"
          >
            <h3 className="font-medium text-slate-700 mb-4">{column}</h3>
            <div className="space-y-2">
              {/* Placeholder cards */}
              <div className="bg-white p-3 rounded shadow-sm border border-slate-200">
                <p className="text-sm text-slate-600">Sample issue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
