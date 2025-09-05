import { useEffect } from 'react'

import { useAdmin } from './AdminContext'

interface AdminItemProps {
  pageKey: string
  pageIcon: React.ReactNode
  pageLabel: string
  page?: React.ReactNode
  children?: React.ReactNode
}

function AdminItem({ pageKey, pageIcon, pageLabel, page, children }: AdminItemProps) {
  const { state, dispatch } = useAdmin()

  useEffect(() => {
    dispatch({
      type: 'REGISTER_ITEM',
      payload: { key: pageKey, icon: pageIcon, label: pageLabel },
    })
  }, [])

  if (state.pageKey !== pageKey) {
    return null
  } else {
    return <>{page ?? children}</>
  }
}

export default AdminItem
