import { useParams } from 'react-router-dom'
import DocumentPage from './DocumentPage'

/** Remount viewer when slug changes so page index resets without setState-in-effect. */
export default function DocumentRoute() {
  const { slug } = useParams()
  return <DocumentPage key={slug} />
}
