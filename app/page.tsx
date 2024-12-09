"use client"

import { useState } from 'react'
import Header from '@/components/header'
import Hero from '@/components/hero'
import Features from '@/components/features'
import News from '@/components/news'
import Footer from '@/components/footer'

export default function Home() {
  const [isScholarshipEnabled] = useState(false)

  // In a real application, you would fetch this state from your backend
  // For now, we'll just use a local state as an example

  return (
    <div className="flex flex-col min-h-screen">
      <Header showScholarshipButton={isScholarshipEnabled} />
      <main className="flex-grow">
        <Hero />
        <Features />
        <News />
      </main>
      <Footer />
    </div>
  )
}

