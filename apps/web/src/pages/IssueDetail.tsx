import { useParams } from 'react-router-dom'

export default function IssueDetail() {
  const { issueId } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Issue Detail</h1>
      <p className="text-slate-600 mt-2">Issue ID: {issueId}</p>
    </div>
  )
}
