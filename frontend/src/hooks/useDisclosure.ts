import { useState, useCallback } from 'react'

function useDisclosure(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const onOpen = useCallback(() => setIsOpen(true), [])
  const onClose = useCallback(() => setIsOpen(false), [])

  return { isOpen, onOpen, onClose, setIsOpen }
}

export default useDisclosure
