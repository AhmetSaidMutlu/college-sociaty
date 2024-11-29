import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import AdminPanel from '@/components/admin-panel'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <AdminPanel />
    </div>
  )
}

