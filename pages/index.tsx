import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the App component with SSR disabled
const AppWithRouter = dynamic(
  () => import('../src/AppWrapper'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
)

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div>Loading...</div>
  }

  return <AppWithRouter />
} 