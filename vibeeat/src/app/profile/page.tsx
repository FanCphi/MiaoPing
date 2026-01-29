import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="flex items-center space-x-4 mb-6">
          <img className="h-20 w-20 rounded-full" src={user.avatar || ''} alt={user.nickname || 'User'} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.nickname}</h1>
            <p className="text-gray-500">{user.phone}</p>
          </div>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  )
}
