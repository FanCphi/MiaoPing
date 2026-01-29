import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import CreateBureauForm from './create-form'

export default async function CreateBureauPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const restaurants = await prisma.restaurant.findMany({
    include: { mealSets: true }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Host a Dining Party</h1>
        <CreateBureauForm restaurants={restaurants} />
      </div>
    </div>
  )
}
