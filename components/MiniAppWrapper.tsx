'use client'

import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface MiniAppWrapperProps {
  children: React.ReactNode
}

export function MiniAppWrapper({ children }: MiniAppWrapperProps) {
  useEffect(() => {
    // Hide splash screen and display content when app is ready
    sdk.actions.ready()
  }, [])

  return <>{children}</>
}
