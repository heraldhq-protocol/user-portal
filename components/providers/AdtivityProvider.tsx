'use client'

import { useEffect } from 'react'
import { init, initClickTracking, initPageTracking, initLocationTracking } from '@adtivity/adtivity-sdk'

declare global {
  interface Window {
    __ADTIVITY_BOOTSTRAPPED__?: boolean;
  }
}

export function AdtivityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__ADTIVITY_BOOTSTRAPPED__) return
    window.__ADTIVITY_BOOTSTRAPPED__ = true

    const API_KEY = process.env.NEXT_PUBLIC_ADTIVITY_API_KEY
    if (!API_KEY) {
      return
    }

    try {
      init({
        apiKey: API_KEY,
        debug: false,
      })

      initPageTracking()
      initClickTracking()
      initLocationTracking()
    } catch (err) {
      console.warn('Adtivity SDK failed to initialize:', err)
    }
  }, [])

  return <>{children}</>
}
