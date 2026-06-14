'use client'

import { useEffect, useRef } from 'react'
import * as adtivitySDK from '@adtivity/adtivity-sdk'
import { useWallet } from '@solana/wallet-adapter-react'

declare global {
  interface Window {
    __ADTIVITY_BOOTSTRAPPED__?: boolean;
  }
}

// Custom trackWallet wrapper function
export const trackWallet = (address: string) => {
  try {
    adtivitySDK.identify(address)
    adtivitySDK.trackEvent("Wallet Connected", { wallet_address: address })
  } catch (err) {
    console.warn('Adtivity failed to track wallet:', err)
  }
}

// Export adtivity wrapper for convenience
export const adtivity = {
  ...adtivitySDK,
  trackWallet,
}

export function AdtivityProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet()
  const lastTrackedWallet = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__ADTIVITY_BOOTSTRAPPED__) return
    window.__ADTIVITY_BOOTSTRAPPED__ = true

    // Monkey-patch window.fetch to inject origin property into Adtivity SDK payloads
    const originalFetch = window.fetch
    window.fetch = async function (input, initOptions) {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : ''
      if (url.includes('/sdk/event') && initOptions && initOptions.body) {
        try {
          const body = JSON.parse(initOptions.body as string)
          if (Array.isArray(body)) {
            const enrichedBody = body.map((event: { properties?: Record<string, unknown> }) => {
              if (!event.properties) {
                event.properties = {}
              }
              event.properties.origin = 'user-portal'
              return event
            })
            initOptions.body = JSON.stringify(enrichedBody)
          }
        } catch (e) {
          console.warn('Failed to enrich Adtivity payload:', e)
        }
      }
      return originalFetch.apply(this, [input, initOptions])
    }

    const API_KEY = process.env.NEXT_PUBLIC_ADTIVITY_API_KEY
    if (!API_KEY) {
      return
    }

    try {
      adtivitySDK.init({
        apiKey: API_KEY,
        debug: false,
      })

      adtivitySDK.initPageTracking()
      adtivitySDK.initClickTracking()
      adtivitySDK.initLocationTracking()
    } catch (err) {
      console.warn('Adtivity SDK failed to initialize:', err)
    }
  }, [])

  // Automatically track wallet connection when useWallet state changes
  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58()
      if (lastTrackedWallet.current !== address) {
        lastTrackedWallet.current = address
        trackWallet(address)
      }
    } else if (!connected) {
      lastTrackedWallet.current = null
    }
  }, [connected, publicKey])

  return <>{children}</>
}

