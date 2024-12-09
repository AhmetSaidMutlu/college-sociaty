import Header from '@/components/header'
import Footer from '@/components/footer'
import { ScholarshipApplication } from '@/components/scholarship-application'

export default function ScholarshipApplicationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ScholarshipApplication />
      </main>
      <Footer />
    </div>
  )
}

