import React from 'react'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import '../src/index.css'


// Dynamically import the App component with SSR disabled
const AppWithRouter = dynamic(
  () => import('../src/AppWrapper'),
  { ssr: false }
)

export default function MyApp({ Component, pageProps }: AppProps) {
  return <AppWithRouter />
} 
