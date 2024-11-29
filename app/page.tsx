import Header from '@/components/header'
import Hero from '@/components/hero'
import Features from '@/components/features'
import News from '@/components/news'
import Footer from '@/components/footer'
import { ScholarshipApplication } from '@/components/scholarship-application'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <News />
        <ScholarshipApplication />
      </main>
      <Footer />
    </div>
  )
}

