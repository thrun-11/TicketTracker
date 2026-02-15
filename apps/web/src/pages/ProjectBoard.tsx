import { useParams } from 'react-router-dom'
import Board from './Board'

export default function ProjectBoard() {
  const { projectId } = useParams<{ projectId: string }>()
  return <Board projectId={projectId!} />
}
