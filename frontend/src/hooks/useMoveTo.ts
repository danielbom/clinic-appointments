import { useNavigate } from 'react-router-dom'
import { MoveToPage } from '../components/AdminX/types'

export const useMoveTo = () => {
  const navigate = useNavigate()

  const moveTo: MoveToPage = (key, state) => {
    const searchParams = new URLSearchParams(state)
    searchParams.set('key', key)
    navigate(`/_move?${searchParams}`, { replace: true })
  }

  return moveTo
}
