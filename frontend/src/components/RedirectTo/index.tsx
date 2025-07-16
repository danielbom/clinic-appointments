import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type RedirectToProps<To extends string = string> = {
  to: To
}

export function RedirectTo<To extends string>({ to }: RedirectToProps<To>) {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(to, { replace: true })
  }, [navigate, to])

  return null
}
